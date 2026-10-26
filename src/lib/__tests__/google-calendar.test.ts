import { describe, expect, it } from "vitest";
import { buildQueretaroIso, getDaySlotsAvailability } from "../bookings-engine";
import {
  buildGoogleCalendarEventPayload,
  formatCalendarEventSummary,
  syncBookingToGoogleCalendar,
} from "../google-calendar";
import type { BookingRow } from "../supabase/types";

describe("google-calendar (Fase 5)", () => {
  const sampleBooking: BookingRow = {
    id: "bk-gcal-1",
    code: "UL-4X9P",
    band_name: "Tormenta del Centro",
    contact_name: "Diego",
    phone: "4429998877",
    starts_at: buildQueretaroIso("2026-10-29", 18),
    ends_at: buildQueretaroIso("2026-10-29", 20),
    hours: 2,
    total: 300,
    paid: false,
    status: "pending",
    notes: "Necesitamos 3 micrófonos",
    admin_notes: null,
    google_event_id: null,
    source: "web",
    created_at: "2026-10-24T12:00:00-06:00",
  };

  it("formatea el título [PENDIENTE] para reservas pendientes y ✅ para confirmadas", () => {
    expect(formatCalendarEventSummary(sampleBooking)).toBe(
      "[PENDIENTE] Tormenta del Centro · UL-4X9P",
    );

    expect(
      formatCalendarEventSummary({ ...sampleBooking, status: "confirmed" }),
    ).toBe("✅ Tormenta del Centro · UL-4X9P");
  });

  it("genera el payload de Google Calendar con zona horaria America/Mexico_City y dirección oficial", () => {
    const payload = buildGoogleCalendarEventPayload(sampleBooking);
    expect(payload.start.timeZone).toBe("America/Mexico_City");
    expect(payload.location).toContain("C. Primavera 32B");
    expect(payload.extendedProperties.private.ulularCode).toBe("UL-4X9P");
  });

  it("sincroniza en modo simulado local cuando no hay variables de Service Account y elimina al cancelar", async () => {
    const created = await syncBookingToGoogleCalendar(sampleBooking);
    expect(created.ok).toBe(true);
    expect(created.action).toBe("upsert");
    expect(created.googleEventId).toContain("ul-4x9p");

    const cancelled = await syncBookingToGoogleCalendar({
      ...sampleBooking,
      status: "cancelled",
      google_event_id: created.googleEventId,
    });
    expect(cancelled.ok).toBe(true);
    expect(cancelled.action).toBe("delete");
    expect(cancelled.googleEventId).toBeNull();
  });

  it("descuenta intervalos ocupados de freeBusy en getDaySlotsAvailability", () => {
    const slots = getDaySlotsAvailability({
      dateStr: "2026-10-29", // jueves (17:00 a 23:00)
      bookings: [],
      freeBusyIntervals: [
        {
          start: buildQueretaroIso("2026-10-29", 20),
          end: buildQueretaroIso("2026-10-29", 22),
        },
      ],
      nowMs: Date.parse("2026-10-24T12:00:00-06:00"),
    });

    expect(slots.find((s) => s.hour === 19)?.available).toBe(true);
    expect(slots.find((s) => s.hour === 20)?.available).toBe(false);
    expect(slots.find((s) => s.hour === 20)?.reason).toBe("blackout");
    expect(slots.find((s) => s.hour === 21)?.available).toBe(false);
    expect(slots.find((s) => s.hour === 22)?.available).toBe(true);
  });
});
