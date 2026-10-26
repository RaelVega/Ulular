import { NextResponse } from "next/server";
import { buildQueretaroIso } from "@/lib/bookings-engine";
import { queryGoogleCalendarFreeBusy } from "@/lib/google-calendar";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get("date");
  const calendarId = searchParams.get("calendarId") ?? undefined;

  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return NextResponse.json(
      { ok: false, error: "Parámetro date (YYYY-MM-DD) requerido." },
      { status: 400 },
    );
  }

  const timeMinIso = buildQueretaroIso(dateStr, 0);
  const timeMaxIso = buildQueretaroIso(dateStr, 24);

  const result = await queryGoogleCalendarFreeBusy({
    timeMinIso,
    timeMaxIso,
    overrideCalendarId: calendarId,
  });

  return NextResponse.json({
    ok: true,
    date: dateStr,
    mode: result.mode,
    busy: result.busy,
  });
}
