import { NextResponse } from "next/server";
import { getGoogleCalendarCredentials } from "@/lib/google-calendar";

export async function GET() {
  const creds = getGoogleCalendarCredentials();

  return NextResponse.json({
    ok: true,
    configured: creds !== null,
    mode: creds ? "live" : "simulated",
    serviceAccountEmail:
      creds?.clientEmail ??
      "Pendiente en .env.local (GOOGLE_SERVICE_ACCOUNT_EMAIL)",
    calendarId: creds?.calendarId ?? "ulular.sala@gmail.com",
  });
}
