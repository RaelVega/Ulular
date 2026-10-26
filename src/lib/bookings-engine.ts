import { z } from "zod";
import {
  ADDRESS,
  DEFAULT_CANCEL_NOTICE_HOURS,
  DEFAULT_OPEN_HOURS,
  DEFAULT_PENDING_TTL_HOURS,
  DEFAULT_PRICE_PER_HOUR,
  type DayKey,
  type OpenHoursMap,
} from "./constants";
import type {
  BlackoutDateRow,
  BookingRow,
  BookingStatus,
} from "./supabase/types";

const DAY_KEYS_FROM_UTCDAY: DayKey[] = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
];

export interface HourSlotInfo {
  hour: number;
  startLabel: string; // "17:00"
  endLabel: string; // "18:00"
  startsAtIso: string;
  endsAtIso: string;
  available: boolean;
  reason?: "occupied" | "blackout" | "past";
  bookingBand?: string;
  bookingStatus?: BookingStatus;
}

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function formatHourLabel(hour: number): string {
  return `${pad2(hour)}:00`;
}

/**
 * Construye un ISO string con offset de Querétaro (-06:00).
 */
export function buildQueretaroIso(dateStr: string, hour: number): string {
  if (hour === 24) {
    const [y, m, d] = dateStr.split("-").map(Number);
    const nextDay = new Date(Date.UTC(y!, m! - 1, d! + 1));
    const ny = nextDay.getUTCFullYear();
    const nm = pad2(nextDay.getUTCMonth() + 1);
    const nd = pad2(nextDay.getUTCDate());
    return `${ny}-${nm}-${nd}T00:00:00-06:00`;
  }
  return `${dateStr}T${pad2(hour)}:00:00-06:00`;
}

export function getDayKeyFromDateStr(dateStr: string): DayKey {
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return "mon";
  const dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return DAY_KEYS_FROM_UTCDAY[dt.getUTCDay()] ?? "mon";
}

export function isMondayDateStr(dateStr: string): boolean {
  return getDayKeyFromDateStr(dateStr) === "mon";
}

export function formatBookingDateHuman(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return dateStr;
  const dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return new Intl.DateTimeFormat("es-MX", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(dt);
}

export function extractDateAndHoursFromBooking(
  booking: Pick<BookingRow, "starts_at" | "ends_at">,
): {
  dateStr: string;
  startHour: number;
  endHour: number;
  startLabel: string;
  endLabel: string;
} {
  const startMs = Date.parse(booking.starts_at);
  const endMs = Date.parse(booking.ends_at);
  // Ajustar a UTC-6 (Querétaro)
  const qroOffsetMs = -6 * 60 * 60 * 1000;
  const startLocal = new Date(startMs + qroOffsetMs);

  const y = startLocal.getUTCFullYear();
  const m = pad2(startLocal.getUTCMonth() + 1);
  const d = pad2(startLocal.getUTCDate());
  const dateStr = `${y}-${m}-${d}`;

  const startHour = startLocal.getUTCHours();
  const durationHours = Math.max(
    1,
    Math.round((endMs - startMs) / (3600 * 1000)),
  );
  const endHour = startHour + durationHours;

  return {
    dateStr,
    startHour,
    endHour,
    startLabel: formatHourLabel(startHour),
    endLabel: formatHourLabel(endHour),
  };
}

/**
 * Expira automáticamente reservas en estado `pending` cuyo tiempo de vida
 * (`pendingTtlHours`, por defecto 24 h) ya venció sin confirmación.
 */
export function expireStalePendingBookings(
  bookings: BookingRow[],
  nowMs: number = Date.now(),
  pendingTtlHours: number = DEFAULT_PENDING_TTL_HOURS,
): { bookings: BookingRow[]; changed: boolean } {
  const ttlMs = pendingTtlHours * 3600 * 1000;
  let changed = false;

  const updated = bookings.map((b) => {
    if (b.status !== "pending") return b;
    const createdMs = Date.parse(b.created_at);
    if (!Number.isNaN(createdMs) && nowMs - createdMs > ttlMs) {
      changed = true;
      return { ...b, status: "expired" as const };
    }
    return b;
  });

  return { bookings: updated, changed };
}

/**
 * Calcula los bloques de 1 hora de un día (`YYYY-MM-DD`) cruzando horarios de
 * apertura, reservas activas (`pending` vigentes y `confirmed`) y bloqueos.
 */
export function getDaySlotsAvailability(params: {
  dateStr: string;
  openHours?: OpenHoursMap;
  bookings: BookingRow[];
  blackouts?: BlackoutDateRow[];
  freeBusyIntervals?: { start: string; end: string }[];
  nowMs?: number;
}): HourSlotInfo[] {
  const {
    dateStr,
    openHours = DEFAULT_OPEN_HOURS,
    bookings,
    blackouts = [],
    freeBusyIntervals = [],
    nowMs = Date.now(),
  } = params;

  const dayKey = getDayKeyFromDateStr(dateStr);
  const ranges = openHours[dayKey] ?? [];
  if (ranges.length === 0) return [];

  const { bookings: freshBookings } = expireStalePendingBookings(
    bookings,
    nowMs,
  );
  const activeBookings = freshBookings.filter(
    (b) => b.status === "pending" || b.status === "confirmed",
  );

  const slots: HourSlotInfo[] = [];

  for (const [openStr, closeStr] of ranges) {
    const startH = Number(openStr.split(":")[0]);
    const endH = Number(closeStr.split(":")[0]);
    if (Number.isNaN(startH) || Number.isNaN(endH) || endH <= startH) continue;

    for (let h = startH; h < endH; h++) {
      const startsAtIso = buildQueretaroIso(dateStr, h);
      const endsAtIso = buildQueretaroIso(dateStr, h + 1);
      const slotStartMs = Date.parse(startsAtIso);
      const slotEndMs = Date.parse(endsAtIso);

      // 1. Verificar si ya pasó la hora
      if (slotStartMs <= nowMs) {
        slots.push({
          hour: h,
          startLabel: formatHourLabel(h),
          endLabel: formatHourLabel(h + 1),
          startsAtIso,
          endsAtIso,
          available: false,
          reason: "past",
        });
        continue;
      }

      // 2. Verificar cruce con reservas activas
      const overlappingBooking = activeBookings.find((b) => {
        const bStart = Date.parse(b.starts_at);
        const bEnd = Date.parse(b.ends_at);
        return bStart < slotEndMs && bEnd > slotStartMs;
      });

      if (overlappingBooking) {
        slots.push({
          hour: h,
          startLabel: formatHourLabel(h),
          endLabel: formatHourLabel(h + 1),
          startsAtIso,
          endsAtIso,
          available: false,
          reason: "occupied",
          bookingBand: overlappingBooking.band_name,
          bookingStatus: overlappingBooking.status,
        });
        continue;
      }

      // 3. Verificar cruce con fechas bloqueadas (blackouts) o freeBusy de Google Calendar
      const overlappingBlackout = blackouts.find((bl) => {
        const blStart = Date.parse(bl.starts_at);
        const blEnd = Date.parse(bl.ends_at);
        return blStart < slotEndMs && blEnd > slotStartMs;
      });

      const overlappingFreeBusy = freeBusyIntervals.find((fb) => {
        const fbStart = Date.parse(fb.start);
        const fbEnd = Date.parse(fb.end);
        return fbStart < slotEndMs && fbEnd > slotStartMs;
      });

      if (overlappingBlackout || overlappingFreeBusy) {
        slots.push({
          hour: h,
          startLabel: formatHourLabel(h),
          endLabel: formatHourLabel(h + 1),
          startsAtIso,
          endsAtIso,
          available: false,
          reason: "blackout",
        });
        continue;
      }

      slots.push({
        hour: h,
        startLabel: formatHourLabel(h),
        endLabel: formatHourLabel(h + 1),
        startsAtIso,
        endsAtIso,
        available: true,
      });
    }
  }

  return slots;
}

/**
 * Dado el arreglo de bloques del día y una hora inicial `startHour`,
 * devuelve cuántas horas continuas se pueden reservar como máximo sin chocar
 * con un bloque ocupado ni con el cierre de la sala.
 */
export function getMaxConsecutiveHours(
  slots: HourSlotInfo[],
  startHour: number,
): number {
  const startIdx = slots.findIndex((s) => s.hour === startHour && s.available);
  if (startIdx === -1) return 0;

  let count = 1;
  for (let i = startIdx + 1; i < slots.length; i++) {
    const prev = slots[i - 1]!;
    const curr = slots[i]!;
    if (curr.available && curr.hour === prev.hour + 1) {
      count++;
    } else {
      break;
    }
  }
  return count;
}

export function calculateBookingTotal(
  hours: number,
  pricePerHour: number = DEFAULT_PRICE_PER_HOUR,
): number {
  return Math.max(1, Math.floor(hours)) * pricePerHour;
}

export function generateBookingCode(): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `UL-${suffix}`;
}

export function evaluateCancellationStatus(
  startsAtIso: string,
  nowMs: number = Date.now(),
  cancelNoticeHours: number = DEFAULT_CANCEL_NOTICE_HOURS,
): "cancelled" | "late_cancel" {
  const startMs = Date.parse(startsAtIso);
  const diffHours = (startMs - nowMs) / (3600 * 1000);
  return diffHours >= cancelNoticeHours ? "cancelled" : "late_cancel";
}

export const bookingFormSchema = z.object({
  bandName: z
    .string()
    .trim()
    .min(2, "Escribe el nombre de tu banda o proyecto."),
  contactName: z.string().trim().optional(),
  phone: z
    .string()
    .trim()
    .refine(
      (val) => {
        const digits = val.replace(/\D/g, "");
        return digits.length >= 10 && digits.length <= 13;
      },
      { message: "Ingresa un número de WhatsApp válido de 10 dígitos." },
    ),
  dateStr: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Selecciona una fecha válida."),
  startHour: z.number().int().min(0).max(23),
  hours: z.number().int().min(1, "Mínimo 1 hora.").max(12),
  notes: z.string().trim().max(300).optional(),
  acceptRules: z.literal(true, {
    errorMap: () => ({
      message: "Debes aceptar los lineamientos de la sala para reservar.",
    }),
  }),
});

export type BookingFormInput = z.infer<typeof bookingFormSchema>;

/**
 * Genera el contenido de archivo `.ics` (iCalendar) para agregar el ensayo
 * a Apple Calendar, Google Calendar u Outlook.
 */
export function buildBookingIcsContent(booking: BookingRow): string {
  const toIcsUtc = (iso: string) => {
    const d = new Date(Date.parse(iso));
    return d
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "Z");
  };

  const dtStart = toIcsUtc(booking.starts_at);
  const dtEnd = toIcsUtc(booking.ends_at);
  const dtStamp = toIcsUtc(new Date().toISOString());
  const location = `${ADDRESS.street}, ${ADDRESS.neighborhood}, ${ADDRESS.city}`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Ulular Sala de Ensayo//Reservas//ES",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:ulular-${booking.code}@ulular.mx`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:Ensayo en Ulular · ${booking.band_name} (${booking.code})`,
    `DESCRIPTION:Código: ${booking.code}\\nTotal: $${booking.total} MXN\\nRecuerda: pago antes de entrar y 15 min de tolerancia.`,
    `LOCATION:${location}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
