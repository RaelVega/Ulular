"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { UlularEvent } from "@/lib/constants";
import {
  formatEventDateLabel,
  loadStoredEvents,
  splitEventsByDate,
} from "@/lib/events-store";
import { buildServiceInquiryWhatsAppUrl } from "@/lib/whatsapp";
import { BrandIcon } from "@/components/ui/BrandIcon";
import { StudioIcon } from "@/components/ui/StudioIcon";

export interface EventsSectionProps {
  /** Si es true, muestra todos los eventos sin límite (para la página /eventos) */
  showAll?: boolean;
}

function extractDayAndMonth(dateStr: string): { day: string; month: string } {
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return { day: "--", month: "---" };
  const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const month = new Intl.DateTimeFormat("es-MX", {
    month: "short",
    timeZone: "UTC",
  })
    .format(date)
    .replace(".", "")
    .toUpperCase();
  return { day: String(d).padStart(2, "0"), month };
}

/**
 * Cartelera de Eventos (Próximos y Pasados) con diseño moderno de foro/cartelera
 * (sin numeración tipo presentación). Cuando pasa la fecha/hora del evento,
 * pasa automáticamente a "Eventos pasados".
 */
export function EventsSection({ showAll = false }: EventsSectionProps) {
  const [events, setEvents] = useState<UlularEvent[]>([]);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [selectedFlyer, setSelectedFlyer] = useState<UlularEvent | null>(null);

  useEffect(() => {
    const refresh = () => setEvents(loadStoredEvents());
    refresh();
    window.addEventListener("ulular-events-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("ulular-events-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const { upcoming, past } = splitEventsByDate(events);
  const activeList = tab === "upcoming" ? upcoming : past;
  const displayed = showAll ? activeList : activeList.slice(0, 6);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2">
            <span
              aria-hidden="true"
              style={{ borderRadius: "9999px" }}
              className="w-2 h-2 rounded-full bg-accent"
            />
            <p className="font-label-caps text-ash">
              Cartelera · Tocadas, Open Mic & Sesiones
            </p>
          </div>
          <h2 className="font-display-title text-[clamp(2.25rem,6vw,4rem)] mt-2">
            {tab === "upcoming" ? (
              <>
                próximos <span className="text-accent">eventos.</span>
              </>
            ) : (
              <>
                eventos <span className="text-accent">pasados.</span>
              </>
            )}
          </h2>
        </div>

        {/* Pestañas Próximos / Eventos pasados */}
        <div
          role="tablist"
          aria-label="Filtro de eventos por fecha"
          className="inline-flex border border-tolex bg-ink-2 self-start"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "upcoming"}
            onClick={() => setTab("upcoming")}
            className={`min-h-[44px] px-4 sm:px-5 font-label-caps text-xs cursor-pointer transition-colors ${
              tab === "upcoming"
                ? "bg-accent text-white"
                : "bg-transparent text-bone hover:bg-ink-3"
            }`}
          >
            Próximos ({upcoming.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "past"}
            onClick={() => setTab("past")}
            className={`min-h-[44px] px-4 sm:px-5 font-label-caps text-xs cursor-pointer transition-colors border-l border-tolex ${
              tab === "past"
                ? "bg-accent text-white"
                : "bg-transparent text-bone hover:bg-ink-3"
            }`}
          >
            Eventos pasados ({past.length})
          </button>
        </div>
      </div>

      {displayed.length === 0 ? (
        <div className="border border-tolex bg-ink-2 p-8 sm:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <p className="font-display-title text-2xl text-bone">
              {tab === "upcoming"
                ? "estamos armando las siguientes fechas."
                : "aún no hay eventos en el archivo."}
            </p>
            <p className="text-sm text-ash mt-2 max-w-md">
              {tab === "upcoming"
                ? "¿Quieres armar una tocada, presentar tu proyecto o inscribirte al open mic? Escríbenos directo."
                : "Los eventos cuya fecha ya pasó aparecerán aquí automáticamente."}
            </p>
          </div>
          {tab === "upcoming" && (
            <a
              href={buildServiceInquiryWhatsAppUrl("armar un evento o tocada")}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Proponer evento por WhatsApp"
              title="Proponer evento por WhatsApp"
              className="inline-flex items-center justify-center w-12 h-12 border border-tolex bg-ink hover:border-[#25D366] hover:scale-105 transition-all"
            >
              <BrandIcon network="whatsapp" className="w-6 h-6" />
            </a>
          )}
        </div>
      ) : (
        <div className="divide-y divide-tolex border-y border-tolex">
          {displayed.map((ev) => {
            const isPast = tab === "past";
            const { day, month } = extractDayAndMonth(ev.date);
            return (
              <article
                key={ev.id}
                className={`py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center transition-colors hover:bg-ink-2/70 px-3 sm:px-6 ${
                  isPast ? "opacity-80" : ""
                }`}
              >
                {/* Bloque de fecha estilo cartelera de foro */}
                <div className="lg:col-span-3 flex items-center gap-4">
                  <div className="w-16 h-16 border border-tolex bg-ink-2 flex flex-col items-center justify-center shrink-0">
                    <span className="font-display-title text-2xl text-accent leading-none">
                      {day}
                    </span>
                    <span className="font-mono-specs text-[0.65rem] text-ash mt-1">
                      {month}
                    </span>
                  </div>
                  <div>
                    <span className="inline-block border border-accent text-accent bg-accent-soft px-2 py-0.5 font-label-caps text-[0.62rem]">
                      {ev.tag}
                    </span>
                    <p className="font-mono-specs text-xs text-ash mt-1.5">
                      {ev.time} h · {ev.venue}
                    </p>
                  </div>
                </div>

                {/* Título y descripción */}
                <div className="lg:col-span-6">
                  <h3 className="font-display-title text-2xl sm:text-3xl text-bone">
                    {ev.title}
                  </h3>
                  {ev.description && (
                    <p className="text-sm text-ash mt-2 max-w-2xl">
                      {ev.description}
                    </p>
                  )}
                </div>

                {/* Miniatura de flyer + acciones solo icono */}
                <div className="lg:col-span-3 flex items-center lg:justify-end gap-3">
                  {ev.flyerUrl && (
                    <button
                      type="button"
                      onClick={() => setSelectedFlyer(ev)}
                      aria-label={`Ampliar flyer de ${ev.title}`}
                      title="Ver flyer completo"
                      className="group relative w-14 h-16 overflow-hidden border border-tolex hover:border-accent cursor-pointer shrink-0"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ev.flyerUrl}
                        alt={`Flyer de ${ev.title}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    </button>
                  )}

                  {ev.flyerUrl && (
                    <button
                      type="button"
                      onClick={() => setSelectedFlyer(ev)}
                      aria-label={`Ampliar flyer de ${ev.title}`}
                      title="Ampliar flyer"
                      className="inline-flex items-center justify-center w-11 h-11 border border-tolex bg-ink-2 text-bone hover:border-accent hover:text-accent cursor-pointer transition-colors"
                    >
                      <StudioIcon name="expand" className="w-4 h-4" />
                    </button>
                  )}

                  {!isPast ? (
                    <a
                      href={buildServiceInquiryWhatsAppUrl(
                        `el evento "${ev.title}" (${ev.date})`,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Preguntar por WhatsApp sobre ${ev.title}`}
                      title="Preguntar por WhatsApp"
                      className="inline-flex items-center justify-center w-11 h-11 border border-tolex bg-ink-2 hover:border-[#25D366] hover:scale-105 transition-all"
                    >
                      <BrandIcon network="whatsapp" className="w-5 h-5" />
                    </a>
                  ) : (
                    <span className="font-mono-specs text-[0.7rem] text-smoke uppercase px-2">
                      Finalizado
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Pie con acceso a /eventos y a /admin/eventos */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {!showAll && (
            <Link
              href="/eventos"
              className="font-label-caps text-xs text-bone underline underline-offset-4 hover:text-accent py-2"
            >
              Ver cartelera completa y eventos pasados →
            </Link>
          )}
        </div>
        <Link
          href="/admin/eventos"
          aria-label="Administrar eventos en el panel"
          title="Administrar eventos en el panel"
          className="inline-flex items-center justify-center w-10 h-10 border border-tolex text-ash hover:text-bone hover:border-accent transition-colors"
        >
          <StudioIcon name="plus" className="w-4 h-4" />
        </Link>
      </div>

      {/* Modal ligero para ver el flyer completo */}
      {selectedFlyer && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Flyer de ${selectedFlyer.title}`}
          className="fixed inset-0 z-50 bg-ink/95 flex items-center justify-center p-4 sm:p-8"
          onClick={() => setSelectedFlyer(null)}
        >
          <div
            className="max-w-lg w-full border border-bone bg-ink p-4 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-label-caps text-xs text-ash">
                  {selectedFlyer.tag} ·{" "}
                  {formatEventDateLabel(selectedFlyer.date)}
                </p>
                <h3 className="font-display-title text-2xl text-bone">
                  {selectedFlyer.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFlyer(null)}
                aria-label="Cerrar flyer"
                className="border border-bone w-9 h-9 inline-flex items-center justify-center font-mono-specs text-sm cursor-pointer hover:bg-bone hover:text-ink"
              >
                ×
              </button>
            </div>
            {selectedFlyer.flyerUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selectedFlyer.flyerUrl}
                alt={`Flyer de ${selectedFlyer.title}`}
                className="w-full max-h-[72svh] object-contain border border-tolex"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
