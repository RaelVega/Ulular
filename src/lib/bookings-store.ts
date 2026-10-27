import {
  DEFAULT_CANCEL_NOTICE_HOURS,
  DEFAULT_MIN_HOURS,
  DEFAULT_PENDING_TTL_HOURS,
  DEFAULT_PRICE_PER_HOUR,
  WHATSAPP_NUMBER,
} from "./constants";
import {
  buildQueretaroIso,
  calculateBookingTotal,
  evaluateCancellationStatus,
  expireStalePendingBookings,
  generateBookingCode,
  pad2,
} from "./bookings-engine";
import type {
  BlackoutDateRow,
  BookingRow,
  BookingStatus,
  StaffRole,
} from "./supabase/types";

const BOOKINGS_STORAGE_KEY = "ulular_bookings_v1";
const BLACKOUTS_STORAGE_KEY = "ulular_blackouts_v1";
const SETTINGS_STORAGE_KEY = "ulular_settings_v1";
const STAFF_STORAGE_KEY = "ulular_staff_v1";
const ADMIN_SESSION_STORAGE_KEY = "ulular_admin_session_v1";

export interface OperationalSettings {
  pricePerHour: number;
  minHours: number;
  pendingTtlHours: number;
  cancelNoticeHours: number;
  whatsappNumber: string;
  googleCalendarId: string;
  adminAccessPin: string;
}

export const DEFAULT_OPERATIONAL_SETTINGS: OperationalSettings = {
  pricePerHour: DEFAULT_PRICE_PER_HOUR,
  minHours: DEFAULT_MIN_HOURS,
  pendingTtlHours: DEFAULT_PENDING_TTL_HOURS,
  cancelNoticeHours: DEFAULT_CANCEL_NOTICE_HOURS,
  whatsappNumber: WHATSAPP_NUMBER,
  googleCalendarId: "ulular.sala@gmail.com",
  adminAccessPin: "ulular2026",
};

export interface StaffMember {
  id: string;
  email: string;
  name: string;
  role: StaffRole;
}

export const DEFAULT_STAFF_LIST: StaffMember[] = [
  {
    id: "staff-owner-1",
    email: "ulularsaladeensayo@gmail.com",
    name: "Administración Ulular",
    role: "owner",
  },
  {
    id: "staff-member-1",
    email: "staff.ulular@gmail.com",
    name: "Staff Cabina",
    role: "staff",
  },
];

function getRelativeQueretaroDateStr(daysFromToday: number): string {
  const nowMs = Date.now();
  const qroOffsetMs = -6 * 60 * 60 * 1000;
  const target = new Date(
    nowMs + qroOffsetMs + daysFromToday * 24 * 3600 * 1000,
  );
  if (target.getUTCDay() === 1) {
    target.setUTCDate(target.getUTCDate() + 1);
  }
  const y = target.getUTCFullYear();
  const m = pad2(target.getUTCMonth() + 1);
  const d = pad2(target.getUTCDate());
  return `${y}-${m}-${d}`;
}

export function getSeedBookings(): BookingRow[] {
  const tomorrow = getRelativeQueretaroDateStr(1);
  const twoDays = getRelativeQueretaroDateStr(2);
  const nowIso = new Date().toISOString();

  return [
    {
      id: "seed-booking-1",
      code: "UL-7K2Q",
      band_name: "Los Ecos del Centro",
      contact_name: "Mateo Rivera",
      phone: "4423109876",
      starts_at: buildQueretaroIso(tomorrow, 18),
      ends_at: buildQueretaroIso(tomorrow, 20),
      hours: 2,
      total: 300,
      paid: false,
      status: "pending",
      notes: "Rentaremos un bajo extra si está disponible.",
      admin_notes: null,
      google_event_id: "gcal-sim-ul-7k2q",
      source: "web",
      created_at: nowIso,
    },
    {
      id: "seed-booking-2",
      code: "UL-9M4P",
      band_name: "Ruido Queretano",
      contact_name: "Valeria Soto",
      phone: "4428192234",
      starts_at: buildQueretaroIso(twoDays, 19),
      ends_at: buildQueretaroIso(twoDays, 21),
      hours: 2,
      total: 300,
      paid: true,
      status: "confirmed",
      notes: null,
      admin_notes: "Anticipo confirmado por transferencia.",
      google_event_id: "gcal-sim-ul-9m4p",
      source: "web",
      created_at: nowIso,
    },
  ];
}

export function loadStoredBookings(): BookingRow[] {
  if (typeof window === "undefined") return getSeedBookings();
  try {
    const raw = window.localStorage.getItem(BOOKINGS_STORAGE_KEY);
    const initial: BookingRow[] = raw
      ? (JSON.parse(raw) as BookingRow[])
      : getSeedBookings();
    const list = Array.isArray(initial) ? initial : getSeedBookings();
    const { bookings: fresh, changed } = expireStalePendingBookings(list);
    if (!raw || changed) {
      window.localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(fresh));
    }
    return fresh;
  } catch {
    return getSeedBookings();
  }
}

export function saveStoredBookings(bookings: BookingRow[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
  window.dispatchEvent(new Event("ulular-bookings-updated"));
}

export function findBookingByCode(code: string): BookingRow | null {
  const normalized = code.trim().toUpperCase();
  const all = loadStoredBookings();
  return all.find((b) => b.code.toUpperCase() === normalized) ?? null;
}

export function createNewBooking(params: {
  bandName: string;
  contactName?: string;
  phone: string;
  dateStr: string;
  startHour: number;
  hours: number;
  notes?: string;
  adminNotes?: string;
  source?: "web" | "admin";
  status?: BookingStatus;
  paid?: boolean;
  pricePerHour?: number;
}): { ok: true; booking: BookingRow } | { ok: false; error: string } {
  const existing = loadStoredBookings();
  const settings = loadOperationalSettings();
  const startsAtIso = buildQueretaroIso(params.dateStr, params.startHour);
  const endsAtIso = buildQueretaroIso(
    params.dateStr,
    params.startHour + params.hours,
  );
  const startMs = Date.parse(startsAtIso);
  const endMs = Date.parse(endsAtIso);

  const conflict = existing.find((b) => {
    if (b.status !== "pending" && b.status !== "confirmed") return false;
    const bStart = Date.parse(b.starts_at);
    const bEnd = Date.parse(b.ends_at);
    return bStart < endMs && bEnd > startMs;
  });

  if (conflict) {
    return {
      ok: false,
      error: `Ese horario se cruza con la reserva activa ${conflict.code} (${conflict.band_name}).`,
    };
  }

  let code = generateBookingCode();
  while (existing.some((b) => b.code === code)) {
    code = generateBookingCode();
  }

  const total = calculateBookingTotal(
    params.hours,
    params.pricePerHour ?? settings.pricePerHour ?? DEFAULT_PRICE_PER_HOUR,
  );

  const newBooking: BookingRow = {
    id: `bk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    code,
    band_name: params.bandName.trim(),
    contact_name: params.contactName?.trim() || null,
    phone: params.phone.trim(),
    starts_at: startsAtIso,
    ends_at: endsAtIso,
    hours: params.hours,
    total,
    paid: params.paid ?? false,
    status: params.status ?? "pending",
    notes: params.notes?.trim() || null,
    admin_notes: params.adminNotes?.trim() || null,
    google_event_id: null,
    source: params.source ?? "web",
    created_at: new Date().toISOString(),
  };

  const next = [newBooking, ...existing];
  saveStoredBookings(next);
  void triggerCalendarSyncForBooking(newBooking);
  return { ok: true, booking: newBooking };
}

export async function triggerCalendarSyncForBooking(
  booking: BookingRow,
): Promise<{
  ok: boolean;
  mode?: "live" | "simulated";
  googleEventId?: string | null;
  summary?: string;
}> {
  if (typeof window === "undefined") return { ok: false };
  try {
    const settings = loadOperationalSettings();
    const res = await fetch("/api/calendar/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        booking,
        calendarId: settings.googleCalendarId,
      }),
    });
    if (!res.ok) return { ok: false };
    const data = (await res.json()) as {
      ok: boolean;
      mode?: "live" | "simulated";
      googleEventId?: string | null;
      summary?: string;
    };
    if (data.ok) {
      const all = loadStoredBookings();
      const idx = all.findIndex((b) => b.id === booking.id);
      if (idx !== -1 && all[idx]!.google_event_id !== (data.googleEventId ?? null)) {
        const updated = [...all];
        updated[idx] = {
          ...updated[idx]!,
          google_event_id: data.googleEventId ?? null,
        };
        saveStoredBookings(updated);
      }
    }
    return data;
  } catch {
    return { ok: false };
  }
}

export function cancelBookingByCode(
  code: string,
  nowMs: number = Date.now(),
): { ok: true; booking: BookingRow } | { ok: false; error: string } {
  const normalized = code.trim().toUpperCase();
  const all = loadStoredBookings();
  const idx = all.findIndex((b) => b.code.toUpperCase() === normalized);
  if (idx === -1) {
    return { ok: false, error: "No encontramos una reserva con ese código." };
  }

  const target = all[idx]!;
  if (target.status !== "pending" && target.status !== "confirmed") {
    return {
      ok: false,
      error: "Esta reserva ya no está activa.",
    };
  }

  const nextStatus = evaluateCancellationStatus(target.starts_at, nowMs);
  const updated: BookingRow = {
    ...target,
    status: nextStatus,
  };

  const next = [...all];
  next[idx] = updated;
  saveStoredBookings(next);
  void triggerCalendarSyncForBooking(updated);
  return { ok: true, booking: updated };
}

export function updateBookingAdmin(
  id: string,
  patch: Partial<
    Pick<
      BookingRow,
      "status" | "paid" | "admin_notes" | "band_name" | "phone" | "contact_name"
    >
  >,
): BookingRow | null {
  const all = loadStoredBookings();
  const idx = all.findIndex((b) => b.id === id);
  if (idx === -1) return null;
  const updated: BookingRow = { ...all[idx]!, ...patch };
  const next = [...all];
  next[idx] = updated;
  saveStoredBookings(next);
  void triggerCalendarSyncForBooking(updated);
  return updated;
}

export function deleteBookingById(id: string): void {
  const all = loadStoredBookings();
  saveStoredBookings(all.filter((b) => b.id !== id));
}

export function computeAdminBookingStats(bookings: BookingRow[]): {
  pendingCount: number;
  confirmedCount: number;
  confirmedHours: number;
  confirmedRevenue: number;
  paidRevenue: number;
} {
  let pendingCount = 0;
  let confirmedCount = 0;
  let confirmedHours = 0;
  let confirmedRevenue = 0;
  let paidRevenue = 0;

  for (const b of bookings) {
    if (b.status === "pending") {
      pendingCount++;
    }
    if (b.status === "confirmed" || b.status === "completed") {
      confirmedCount++;
      confirmedHours += b.hours;
      confirmedRevenue += b.total;
    }
    if (b.paid && b.status !== "cancelled" && b.status !== "expired") {
      paidRevenue += b.total;
    }
  }

  return {
    pendingCount,
    confirmedCount,
    confirmedHours,
    confirmedRevenue,
    paidRevenue,
  };
}

export function loadStoredBlackouts(): BlackoutDateRow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(BLACKOUTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as BlackoutDateRow[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredBlackouts(blackouts: BlackoutDateRow[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BLACKOUTS_STORAGE_KEY, JSON.stringify(blackouts));
  window.dispatchEvent(new Event("ulular-bookings-updated"));
}

export function addBlackoutRange(params: {
  dateStr: string;
  startHour: number;
  endHour: number;
  reason: string;
}): BlackoutDateRow {
  const current = loadStoredBlackouts();
  const row: BlackoutDateRow = {
    id: Date.now(),
    starts_at: buildQueretaroIso(params.dateStr, params.startHour),
    ends_at: buildQueretaroIso(params.dateStr, params.endHour),
    reason: params.reason.trim() || "Bloqueo operativo",
    created_at: new Date().toISOString(),
  };
  saveStoredBlackouts([row, ...current]);
  return row;
}

export function removeBlackoutRange(id: number): void {
  const current = loadStoredBlackouts();
  saveStoredBlackouts(current.filter((b) => b.id !== id));
}

export function loadOperationalSettings(): OperationalSettings {
  if (typeof window === "undefined") return DEFAULT_OPERATIONAL_SETTINGS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_OPERATIONAL_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<OperationalSettings>;
    return { ...DEFAULT_OPERATIONAL_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_OPERATIONAL_SETTINGS;
  }
}

export function saveOperationalSettings(settings: OperationalSettings): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  window.dispatchEvent(new Event("ulular-settings-updated"));
}

export function loadStoredStaffList(): StaffMember[] {
  if (typeof window === "undefined") return DEFAULT_STAFF_LIST;
  try {
    const raw = window.localStorage.getItem(STAFF_STORAGE_KEY);
    if (!raw) return DEFAULT_STAFF_LIST;
    const parsed = JSON.parse(raw) as StaffMember[];
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed
      : DEFAULT_STAFF_LIST;
  } catch {
    return DEFAULT_STAFF_LIST;
  }
}

export function saveStoredStaffList(list: StaffMember[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("ulular-staff-updated"));
}

export interface AdminSession {
  email: string;
  name: string;
  role: StaffRole;
  loggedInAt: string;
}

export function loadAdminSession(): AdminSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdminSession;
    const staff = loadStoredStaffList();
    const matched = staff.find(
      (s) => s.email.toLowerCase() === parsed.email?.toLowerCase(),
    );
    if (!matched) return null;
    return {
      email: matched.email,
      name: matched.name,
      role: matched.role,
      loggedInAt: parsed.loggedInAt,
    };
  } catch {
    return null;
  }
}

export function authenticateAdmin(
  emailInput: string,
  pinInput: string,
): { ok: true; session: AdminSession } | { ok: false; error: string } {
  const email = emailInput.trim().toLowerCase();
  const pin = pinInput.trim();
  const staff = loadStoredStaffList();
  const settings = loadOperationalSettings();
  const expectedPin = settings.adminAccessPin || "ulular2026";

  const matched = staff.find((s) => s.email.toLowerCase() === email);
  if (!matched) {
    return {
      ok: false,
      error:
        "Este correo no está en la lista blanca de personal autorizado (staff_users).",
    };
  }
  if (pin !== expectedPin) {
    return {
      ok: false,
      error: "Clave / PIN de cabina incorrecto.",
    };
  }

  const session: AdminSession = {
    email: matched.email,
    name: matched.name,
    role: matched.role,
    loggedInAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(
      ADMIN_SESSION_STORAGE_KEY,
      JSON.stringify(session),
    );
    window.dispatchEvent(new Event("ulular-auth-updated"));
  }
  return { ok: true, session };
}

export function logoutAdminSession(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
  window.dispatchEvent(new Event("ulular-auth-updated"));
}

