import { describe, expect, it } from "vitest";
import {
  buildBookingIcsContent,
  buildQueretaroIso,
  calculateBookingTotal,
  evaluateCancellationStatus,
  expireStalePendingBookings,
  getDayKeyFromDateStr,
  getDaySlotsAvailability,
  getMaxConsecutiveHours,
  isMondayDateStr,
} from "../bookings-engine";
import type { BookingRow } from "../supabase/types";

describe("bookings-engine (Fase 3)", () => {
  it("detecta lunes como solo con reserva anticipada (0 slots online)", () => {
    // 2026-10-26 es lunes
    expect(getDayKeyFromDateStr("2026-10-26")).toBe("mon");
    expect(isMondayDateStr("2026-10-26")).toBe(true);

    const slots = getDaySlotsAvailability({
      dateStr: "2026-10-26",
      bookings: [],
      nowMs: Date.parse("2026-10-24T12:00:00-06:00"),
    });
    expect(slots).toHaveLength(0);
  });

  it("genera 6 bloques de 1 h de martes a viernes (17:00 a 23:00) y descuenta reservas ocupadas", () => {
    // 2026-10-27 es martes
    const existing: BookingRow[] = [
      {
        id: "b1",
        code: "UL-TEST",
        band_name: "Banda Test",
        contact_name: null,
        phone: "4421234567",
        starts_at: buildQueretaroIso("2026-10-27", 19),
        ends_at: buildQueretaroIso("2026-10-27", 21),
        hours: 2,
        total: 300,
        paid: false,
        status: "confirmed",
        notes: null,
        admin_notes: null,
        google_event_id: null,
        source: "web",
        created_at: "2026-10-24T12:00:00-06:00",
      },
    ];

    const slots = getDaySlotsAvailability({
      dateStr: "2026-10-27",
      bookings: existing,
      nowMs: Date.parse("2026-10-24T12:00:00-06:00"),
    });

    expect(slots).toHaveLength(6); // 17, 18, 19, 20, 21, 22
    expect(slots.find((s) => s.hour === 17)?.available).toBe(true);
    expect(slots.find((s) => s.hour === 18)?.available).toBe(true);
    expect(slots.find((s) => s.hour === 19)?.available).toBe(false);
    expect(slots.find((s) => s.hour === 20)?.available).toBe(false);
    expect(slots.find((s) => s.hour === 21)?.available).toBe(true);

    // Desde las 17:00 solo hay 2 horas continuas libres antes del bloque ocupado a las 19:00
    expect(getMaxConsecutiveHours(slots, 17)).toBe(2);
    // Desde las 21:00 hay 2 horas continuas hasta el cierre (23:00)
    expect(getMaxConsecutiveHours(slots, 21)).toBe(2);
  });

  it("expira reservas pending con más de 24 horas sin confirmar", () => {
    const createdMs = Date.parse("2026-10-20T10:00:00-06:00");
    const after25hMs = createdMs + 25 * 3600 * 1000;

    const list: BookingRow[] = [
      {
        id: "b-exp",
        code: "UL-EXP1",
        band_name: "Banda Pendiente",
        contact_name: null,
        phone: "4421112233",
        starts_at: buildQueretaroIso("2026-10-28", 18),
        ends_at: buildQueretaroIso("2026-10-28", 20),
        hours: 2,
        total: calculateBookingTotal(2),
        paid: false,
        status: "pending",
        notes: null,
        admin_notes: null,
        google_event_id: null,
        source: "web",
        created_at: new Date(createdMs).toISOString(),
      },
    ];

    const { bookings: updated, changed } = expireStalePendingBookings(
      list,
      after25hMs,
    );
    expect(changed).toBe(true);
    expect(updated[0]?.status).toBe("expired");
  });

  it("evalúa la política de cancelación de 24 horas y genera archivo .ics", () => {
    const startsAt = "2026-10-30T18:00:00-06:00";
    const startMs = Date.parse(startsAt);

    expect(
      evaluateCancellationStatus(startsAt, startMs - 30 * 3600 * 1000),
    ).toBe("cancelled");
    expect(
      evaluateCancellationStatus(startsAt, startMs - 10 * 3600 * 1000),
    ).toBe("late_cancel");

    const sample: BookingRow = {
      id: "b-ics",
      code: "UL-7K2Q",
      band_name: "Los Ecos",
      contact_name: "Mateo",
      phone: "4420001111",
      starts_at: startsAt,
      ends_at: "2026-10-30T20:00:00-06:00",
      hours: 2,
      total: 300,
      paid: false,
      status: "confirmed",
      notes: null,
      admin_notes: null,
      google_event_id: null,
      source: "web",
      created_at: new Date().toISOString(),
    };
    const ics = buildBookingIcsContent(sample);
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("UL-7K2Q");
    expect(ics).toContain("C. Primavera 32B");
  });
});
