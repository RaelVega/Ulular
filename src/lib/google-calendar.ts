import crypto from "node:crypto";
import { ADDRESS, BUSINESS_TIMEZONE } from "./constants";
import type { BookingRow } from "./supabase/types";

export interface GoogleCalendarCredentials {
  clientEmail: string;
  privateKey: string;
  calendarId: string;
}

export interface FreeBusyInterval {
  start: string;
  end: string;
}

export interface CalendarEventPayload {
  summary: string;
  description: string;
  location: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  extendedProperties: {
    private: {
      ulularCode: string;
      ulularStatus: string;
    };
  };
}

export function getGoogleCalendarCredentials(
  overrideCalendarId?: string,
): GoogleCalendarCredentials | null {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const rawPrivateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.trim();
  const calendarId =
    overrideCalendarId?.trim() ||
    process.env.GOOGLE_CALENDAR_ID?.trim() ||
    "primary";

  if (!clientEmail || !rawPrivateKey) {
    return null;
  }

  const privateKey = rawPrivateKey.replace(/\\n/g, "\n");
  return {
    clientEmail,
    privateKey,
    calendarId,
  };
}

export function isGoogleCalendarConfigured(): boolean {
  return getGoogleCalendarCredentials() !== null;
}

/**
 * Construye el título del evento en Google Calendar según el estado:
 * - pending -> "[PENDIENTE] Banda X · UL-7K2Q"
 * - confirmed / completed -> "✅ Banda X · UL-7K2Q"
 */
export function formatCalendarEventSummary(
  booking: Pick<BookingRow, "band_name" | "code" | "status">,
): string {
  const prefix =
    booking.status === "confirmed" || booking.status === "completed"
      ? "✅"
      : "[PENDIENTE]";
  return `${prefix} ${booking.band_name} · ${booking.code}`;
}

/**
 * Construye el payload completo para Google Calendar API v3 (`events.insert` / `events.patch`).
 */
export function buildGoogleCalendarEventPayload(
  booking: BookingRow,
): CalendarEventPayload {
  const summary = formatCalendarEventSummary(booking);
  const lines = [
    `Código de reserva: ${booking.code}`,
    `Banda / Proyecto: ${booking.band_name}`,
    booking.contact_name ? `Contacto: ${booking.contact_name}` : null,
    `WhatsApp: ${booking.phone}`,
    `Duración: ${booking.hours} h · Total: $${booking.total} MXN`,
    `Estado de pago: ${booking.paid ? "Pagado ✓" : "Por cobrar antes de entrar"}`,
    booking.notes ? `Notas de la banda: ${booking.notes}` : null,
    booking.admin_notes ? `Notas de cabina: ${booking.admin_notes}` : null,
  ].filter(Boolean);

  return {
    summary,
    description: lines.join("\n"),
    location: `${ADDRESS.street}, ${ADDRESS.neighborhood}, ${ADDRESS.city}`,
    start: {
      dateTime: booking.starts_at,
      timeZone: BUSINESS_TIMEZONE,
    },
    end: {
      dateTime: booking.ends_at,
      timeZone: BUSINESS_TIMEZONE,
    },
    extendedProperties: {
      private: {
        ulularCode: booking.code,
        ulularStatus: booking.status,
      },
    },
  };
}

function base64UrlEncode(input: string | Buffer): string {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

/**
 * Firma un JWT RS256 para autenticar la Service Account contra Google OAuth2
 * sin exponer credenciales al cliente.
 */
async function fetchServiceAccountAccessToken(
  creds: GoogleCalendarCredentials,
): Promise<string> {
  const nowSec = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claimSet = {
    iss: creds.clientEmail,
    scope: "https://www.googleapis.com/auth/calendar",
    aud: "https://oauth2.googleapis.com/token",
    iat: nowSec,
    exp: nowSec + 3600,
  };

  const unsignedToken = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(
    JSON.stringify(claimSet),
  )}`;

  const signer = crypto.createSign("RSA-SHA256");
  signer.update(unsignedToken);
  signer.end();
  const signature = signer.sign(creds.privateKey);
  const assertion = `${unsignedToken}.${base64UrlEncode(signature)}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Error OAuth2 Service Account: ${res.status} ${errText}`);
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export interface SyncBookingResult {
  ok: boolean;
  mode: "live" | "simulated";
  action: "upsert" | "delete";
  googleEventId: string | null;
  summary: string;
  error?: string;
}

/**
 * Sincroniza una reserva hacia Google Calendar:
 * - Si está `pending` o `confirmed` / `completed`: crea o actualiza el evento.
 * - Si pasa a `cancelled`, `late_cancel`, `expired` o `no_show`: elimina el evento del calendario para liberar el horario.
 */
export async function syncBookingToGoogleCalendar(
  booking: BookingRow,
  overrideCalendarId?: string,
): Promise<SyncBookingResult> {
  const shouldRemove =
    booking.status === "cancelled" ||
    booking.status === "late_cancel" ||
    booking.status === "expired" ||
    booking.status === "no_show";

  const payload = buildGoogleCalendarEventPayload(booking);
  const creds = getGoogleCalendarCredentials(overrideCalendarId);

  // Modo simulado local si aún no se configuran las variables de Service Account
  if (!creds) {
    const simulatedId = shouldRemove
      ? null
      : booking.google_event_id || `gcal-sim-${booking.code.toLowerCase()}`;
    return {
      ok: true,
      mode: "simulated",
      action: shouldRemove ? "delete" : "upsert",
      googleEventId: simulatedId,
      summary: payload.summary,
    };
  }

  try {
    const token = await fetchServiceAccountAccessToken(creds);
    const encodedCalId = encodeURIComponent(creds.calendarId);

    if (shouldRemove) {
      if (
        booking.google_event_id &&
        !booking.google_event_id.startsWith("gcal-sim-")
      ) {
        await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${encodedCalId}/events/${encodeURIComponent(
            booking.google_event_id,
          )}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      }
      return {
        ok: true,
        mode: "live",
        action: "delete",
        googleEventId: null,
        summary: payload.summary,
      };
    }

    const hasRealEventId =
      booking.google_event_id &&
      !booking.google_event_id.startsWith("gcal-sim-");

    const url = hasRealEventId
      ? `https://www.googleapis.com/calendar/v3/calendars/${encodedCalId}/events/${encodeURIComponent(
          booking.google_event_id!,
        )}`
      : `https://www.googleapis.com/calendar/v3/calendars/${encodedCalId}/events`;

    const method = hasRealEventId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      return {
        ok: false,
        mode: "live",
        action: "upsert",
        googleEventId: booking.google_event_id,
        summary: payload.summary,
        error: `Google Calendar API ${res.status}: ${text}`,
      };
    }

    const created = (await res.json()) as { id: string };
    return {
      ok: true,
      mode: "live",
      action: "upsert",
      googleEventId: created.id,
      summary: payload.summary,
    };
  } catch (err) {
    return {
      ok: false,
      mode: "live",
      action: shouldRemove ? "delete" : "upsert",
      googleEventId: booking.google_event_id,
      summary: payload.summary,
      error: err instanceof Error ? err.message : "Error de sincronización",
    };
  }
}

/**
 * Consulta `freeBusy` en Google Calendar para descontar horarios que el dueño
 * haya bloqueado directamente desde su celular/computadora en Google Calendar.
 */
export async function queryGoogleCalendarFreeBusy(params: {
  timeMinIso: string;
  timeMaxIso: string;
  overrideCalendarId?: string;
}): Promise<{ mode: "live" | "simulated"; busy: FreeBusyInterval[] }> {
  const creds = getGoogleCalendarCredentials(params.overrideCalendarId);
  if (!creds) {
    return { mode: "simulated", busy: [] };
  }

  try {
    const token = await fetchServiceAccountAccessToken(creds);
    const res = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        timeMin: params.timeMinIso,
        timeMax: params.timeMaxIso,
        timeZone: BUSINESS_TIMEZONE,
        items: [{ id: creds.calendarId }],
      }),
    });

    if (!res.ok) {
      return { mode: "live", busy: [] };
    }

    const data = (await res.json()) as {
      calendars?: Record<string, { busy?: FreeBusyInterval[] }>;
    };
    const busy = data.calendars?.[creds.calendarId]?.busy ?? [];
    return { mode: "live", busy };
  } catch {
    return { mode: "live", busy: [] };
  }
}
