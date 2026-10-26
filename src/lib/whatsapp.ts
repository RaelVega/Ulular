import { WHATSAPP_NUMBER } from "./constants";

export function normalizePhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `52${digits}`;
  }
  return digits;
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const cleanPhone = normalizePhoneForWhatsApp(phone);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function buildSpecialScheduleWhatsAppUrl(detail?: string): string {
  const msg = detail
    ? `Hola Ulular, quiero preguntar por un horario especial: ${detail}`
    : "Hola Ulular, quiero preguntar por un horario especial: ";
  return buildWhatsAppUrl(WHATSAPP_NUMBER, msg);
}

export function buildServiceInquiryWhatsAppUrl(serviceName: string): string {
  const msg = `Hola Ulular, quiero pedir información sobre ${serviceName}.`;
  return buildWhatsAppUrl(WHATSAPP_NUMBER, msg);
}

export interface BookingMessageParams {
  bandName: string;
  dateLabel: string;
  startTime: string;
  endTime: string;
  hours: number;
  total: number;
  code: string;
  statusUrl?: string;
  bookingUrl?: string;
}

export function buildBandToStudioBookingUrl(params: BookingMessageParams): string {
  const lines = [
    "Hola Ulular 🤘 Acabo de solicitar un ensayo:",
    `Banda: ${params.bandName}`,
    `Fecha: ${params.dateLabel} · ${params.startTime}–${params.endTime} (${params.hours} h)`,
    `Total: $${params.total} MXN`,
    `Código: ${params.code}`,
  ];
  return buildWhatsAppUrl(WHATSAPP_NUMBER, lines.join("\n"));
}

export function buildStudioConfirmToBandUrl(
  bandPhone: string,
  params: BookingMessageParams,
): string {
  const lines = [
    `¡Confirmado ✅! ${params.bandName}, los esperamos el ${params.dateLabel} de ${params.startTime} a ${params.endTime}.`,
    `Total: $${params.total} MXN. Recuerda que el pago es antes de entrar.`,
    "Si no pueden venir, avisa con 24 h de anticipación.",
  ];
  if (params.statusUrl) {
    lines.push(`Detalles: ${params.statusUrl}`);
  }
  return buildWhatsAppUrl(bandPhone, lines.join("\n"));
}

export function buildStudioCancelToBandUrl(
  bandPhone: string,
  params: Pick<
    BookingMessageParams,
    "bandName" | "dateLabel" | "startTime" | "endTime" | "bookingUrl"
  >,
): string {
  const lines = [
    `Hola ${params.bandName}, tu ensayo del ${params.dateLabel} ${params.startTime}–${params.endTime} quedó cancelado.`,
  ];
  if (params.bookingUrl) {
    lines.push(`Cuando quieras volver a apartar: ${params.bookingUrl}`);
  }
  return buildWhatsAppUrl(bandPhone, lines.join("\n"));
}
