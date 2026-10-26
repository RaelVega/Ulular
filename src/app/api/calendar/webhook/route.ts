import { NextResponse } from "next/server";

/**
 * Receptor de notificaciones Push de Google Calendar API (`events.watch`).
 * Cuando el dueño modifica o elimina un evento directamente en Google Calendar,
 * Google envía un POST con las cabeceras `x-goog-channel-id` y `x-goog-resource-state`.
 */
export async function POST(request: Request) {
  const channelId = request.headers.get("x-goog-channel-id") ?? "unknown";
  const resourceState =
    request.headers.get("x-goog-resource-state") ?? "exists";
  const messageNumber = request.headers.get("x-goog-message-number") ?? "1";

  return NextResponse.json({
    ok: true,
    receivedAt: new Date().toISOString(),
    channelId,
    resourceState,
    messageNumber,
  });
}
