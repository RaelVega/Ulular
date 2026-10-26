import { NextResponse } from "next/server";
import { syncBookingToGoogleCalendar } from "@/lib/google-calendar";
import type { BookingRow } from "@/lib/supabase/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      booking?: BookingRow;
      calendarId?: string;
    };

    if (!body?.booking || !body.booking.code) {
      return NextResponse.json(
        { ok: false, error: "Datos de reserva inválidos." },
        { status: 400 },
      );
    }

    const result = await syncBookingToGoogleCalendar(
      body.booking,
      body.calendarId,
    );
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Error interno",
      },
      { status: 500 },
    );
  }
}
