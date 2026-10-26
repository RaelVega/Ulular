import { describe, expect, it } from "vitest";
import {
  buildBandToStudioBookingUrl,
  buildSpecialScheduleWhatsAppUrl,
  buildStudioConfirmToBandUrl,
  normalizePhoneForWhatsApp,
} from "../whatsapp";

describe("whatsapp helpers", () => {
  it("normalizes 10-digit Mexican numbers with prefix 52", () => {
    expect(normalizePhoneForWhatsApp("442 406 7325")).toBe("524424067325");
    expect(normalizePhoneForWhatsApp("+52 442 406 7325")).toBe("524424067325");
  });

  it("builds special schedule URL pointing to studio WhatsApp", () => {
    const url = buildSpecialScheduleWhatsAppUrl("Lunes 19:00");
    expect(url).toContain("https://wa.me/524424067325?text=");
    expect(decodeURIComponent(url)).toContain("Lunes 19:00");
  });

  it("builds band-to-studio booking request URL with code and total", () => {
    const url = buildBandToStudioBookingUrl({
      bandName: "Los Ruidos",
      dateLabel: "Sáb 24 oct",
      startTime: "18:00",
      endTime: "20:00",
      hours: 2,
      total: 300,
      code: "UL-7K2Q",
    });
    const decoded = decodeURIComponent(url);
    expect(decoded).toContain("Los Ruidos");
    expect(decoded).toContain("$300 MXN");
    expect(decoded).toContain("UL-7K2Q");
  });

  it("builds studio confirmation URL to band phone", () => {
    const url = buildStudioConfirmToBandUrl("4421234567", {
      bandName: "Los Ruidos",
      dateLabel: "Sáb 24 oct",
      startTime: "18:00",
      endTime: "20:00",
      hours: 2,
      total: 300,
      code: "UL-7K2Q",
      statusUrl: "https://ulular.mx/reserva/UL-7K2Q",
    });
    expect(url).toContain("https://wa.me/524421234567?text=");
    expect(decodeURIComponent(url)).toContain("Confirmado");
  });
});
