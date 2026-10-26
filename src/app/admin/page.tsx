"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandIcon } from "@/components/ui/BrandIcon";
import { StudioIcon, type StudioIconName } from "@/components/ui/StudioIcon";
import {
  extractDateAndHoursFromBooking,
  formatBookingDateHuman,
} from "@/lib/bookings-engine";
import {
  computeAdminBookingStats,
  loadStoredBookings,
  updateBookingAdmin,
} from "@/lib/bookings-store";
import { loadStoredEvents, splitEventsByDate } from "@/lib/events-store";
import type { BookingRow } from "@/lib/supabase/types";
import { buildStudioConfirmToBandUrl } from "@/lib/whatsapp";

const ADMIN_ROWS: {
  icon: StudioIconName;
  title: string;
  role: string;
  description: string;
  href: string;
}[] = [
  {
    icon: "clock",
    title: "agenda y reservas",
    role: "OWNER + STAFF",
    description:
      "Confirma o cancela ensayos pendientes, envía confirmación por WhatsApp en un clic, registra reservas manuales (incluyendo lunes) y bloquea horarios.",
    href: "/admin/reservas",
  },
  {
    icon: "calendar",
    title: "cartelera de eventos",
    role: "OWNER + STAFF",
    description:
      "Publica nuevos toquines, sube el cartel/flyer, edita datos o elimina eventos. Al pasar la fecha se mueven solos a Eventos pasados.",
    href: "/admin/eventos",
  },
  {
    icon: "settings",
    title: "ajustes, tarifas, usuarios y redes",
    role: "OWNER",
    description:
      "Configura precio por hora ($150 MXN), reglas de cancelación, correos Gmail autorizados (Owner/Staff), Google Calendar y enlaces de redes sociales.",
    href: "/admin/ajustes",
  },
];

export default function AdminHomePage() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [upcomingEventsCount, setUpcomingEventsCount] = useState(0);

  useEffect(() => {
    const refresh = () => {
      setBookings(loadStoredBookings());
      const evs = loadStoredEvents();
      const { upcoming } = splitEventsByDate(evs);
      setUpcomingEventsCount(upcoming.length);
    };
    refresh();
    window.addEventListener("ulular-bookings-updated", refresh);
    window.addEventListener("ulular-events-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("ulular-bookings-updated", refresh);
      window.removeEventListener("ulular-events-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const stats = computeAdminBookingStats(bookings);
  const pendingBookings = bookings.filter((b) => b.status === "pending");

  return (
    <div className="max-w-5xl space-y-10">
      <div className="pb-8 border-b border-tolex flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <p className="font-label-caps text-accent">
            Consola operativa · C. Primavera 32B, Centro
          </p>
          <h1 className="font-display-title text-4xl sm:text-5xl mt-2">
            panel ulular.
          </h1>
        </div>

        {/* Indicadores en línea (sin tarjetas) */}
        <div className="flex flex-wrap items-center gap-6 font-mono-specs text-xs border-l-2 border-accent pl-4">
          <div>
            <span className="block text-ash">POR CONFIRMAR</span>
            <span className="text-xl text-accent font-bold">
              {stats.pendingCount}
            </span>
          </div>
          <div>
            <span className="block text-ash">SESIONES CONFIRMADAS</span>
            <span className="text-xl text-bone font-semibold">
              {stats.confirmedCount} ({stats.confirmedHours} h)
            </span>
          </div>
          <div>
            <span className="block text-ash">INGRESO CONFIRMADO</span>
            <span className="text-xl text-bone font-semibold">
              ${stats.confirmedRevenue} MXN
            </span>
          </div>
          <div>
            <span className="block text-ash">EVENTOS PRÓXIMOS</span>
            <span className="text-xl text-bone font-semibold">
              {upcomingEventsCount}
            </span>
          </div>
        </div>
      </div>

      {/* Cola prioritaria de reservas pendientes de confirmar */}
      {pendingBookings.length > 0 && (
        <div className="border-l-2 border-accent bg-ink-2 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-3 border-b border-tolex pb-3">
            <div>
              <p className="font-mono-specs text-xs uppercase tracking-[0.14em] text-accent">
                Atención prioritaria · {pendingBookings.length} pendiente(s)
              </p>
              <h2 className="font-display-title text-2xl text-bone mt-0.5">
                reservas por confirmar
              </h2>
            </div>
            <Link
              href="/admin/reservas"
              className="font-mono-specs text-xs text-accent underline underline-offset-4"
            >
              Ver agenda completa →
            </Link>
          </div>

          <div className="divide-y divide-tolex">
            {pendingBookings.map((b) => {
              const info = extractDateAndHoursFromBooking(b);
              const dateHuman = formatBookingDateHuman(info.dateStr);
              const origin =
                typeof window !== "undefined"
                  ? window.location.origin
                  : "https://ulular.mx";
              const waUrl = buildStudioConfirmToBandUrl(b.phone, {
                bandName: b.band_name,
                dateLabel: dateHuman,
                startTime: info.startLabel,
                endTime: info.endLabel,
                hours: b.hours,
                total: b.total,
                code: b.code,
                statusUrl: `${origin}/reserva/${b.code}`,
              });

              return (
                <div
                  key={b.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 font-mono-specs text-xs">
                      <span className="text-accent font-semibold">
                        {b.code}
                      </span>
                      <span className="text-ash">·</span>
                      <span className="text-bone font-medium">
                        {dateHuman} ({info.startLabel}–{info.endLabel})
                      </span>
                      <span className="text-ash">· ${b.total} MXN</span>
                    </div>
                    <p className="font-display-title text-2xl text-bone mt-1">
                      {b.band_name.toLowerCase()}
                    </p>
                    <p className="font-mono-specs text-xs text-ash">
                      WA: {b.phone}
                      {b.notes ? ` · "${b.notes}"` : ""}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        updateBookingAdmin(b.id, { status: "confirmed" })
                      }
                      className="inline-flex items-center gap-2 bg-accent px-4 py-2.5 font-mono-specs text-xs font-semibold uppercase tracking-[0.1em] text-white hover:opacity-90"
                    >
                      <BrandIcon network="whatsapp" className="w-4 h-4" />
                      <span>Confirmar y avisar WA ↗</span>
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        updateBookingAdmin(b.id, { status: "confirmed" })
                      }
                      className="border border-tolex bg-ink px-3 py-2.5 font-mono-specs text-xs uppercase text-bone hover:border-accent cursor-pointer"
                    >
                      Solo confirmar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Listado de módulos en filas horizontales (cero tarjetas, sin numeración) */}
      <div className="divide-y divide-tolex border-y border-tolex">
        {ADMIN_ROWS.map((row) => (
          <Link
            key={row.title}
            href={row.href}
            className="group py-7 px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-ink-2 transition-colors"
          >
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-10 h-10 border border-tolex bg-ink-2 inline-flex items-center justify-center text-accent group-hover:border-accent transition-colors shrink-0">
                <StudioIcon name={row.icon} className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="font-display-title text-2xl text-bone">
                    {row.title}
                  </h2>
                  <span className="font-label-caps text-[0.58rem] text-ash border border-tolex px-1.5 py-0.5">
                    {row.role}
                  </span>
                </div>
                <p className="text-xs text-ash mt-1 max-w-xl">
                  {row.description}
                </p>
              </div>
            </div>

            <span className="inline-flex items-center justify-center w-10 h-10 border border-tolex text-bone group-hover:border-accent group-hover:bg-accent group-hover:text-white transition-colors shrink-0 self-end sm:self-center">
              <StudioIcon name="external" className="w-4 h-4" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
