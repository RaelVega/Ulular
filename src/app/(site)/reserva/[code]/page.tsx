"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandIcon } from "@/components/ui/BrandIcon";
import { Button } from "@/components/ui/Button";
import { Orbits } from "@/components/ui/Orbits";
import {
  ADDRESS,
  BOOKING_RULES,
  SOCIAL_LINKS,
  WHATSAPP_CHANNEL_URL,
} from "@/lib/constants";
import {
  buildBookingIcsContent,
  evaluateCancellationStatus,
  extractDateAndHoursFromBooking,
  formatBookingDateHuman,
} from "@/lib/bookings-engine";
import {
  cancelBookingByCode,
  findBookingByCode,
} from "@/lib/bookings-store";
import type { BookingRow, BookingStatus } from "@/lib/supabase/types";
import { buildBandToStudioBookingUrl } from "@/lib/whatsapp";

const STATUS_META: Record<
  BookingStatus,
  { label: string; description: string; badgeClass: string }
> = {
  pending: {
    label: "PENDIENTE DE CONFIRMACIÓN",
    description:
      "Tu horario está apartado temporalmente por 24 horas. Si aún no nos mandas el mensaje de WhatsApp, envíalo abajo para confirmar tu sesión.",
    badgeClass: "border-accent bg-accent-soft text-accent",
  },
  confirmed: {
    label: "CONFIRMADA ✅",
    description:
      "Tu ensayo está confirmado. Recuerda llegar puntual (15 min de tolerancia) y realizar el pago antes de entrar a la sala.",
    badgeClass: "border-[#10B981] bg-[#10B981]/15 text-[#10B981]",
  },
  cancelled: {
    label: "CANCELADA A TIEMPO",
    description:
      "Esta reserva fue cancelada con al menos 24 horas de anticipación y el horario quedó liberado.",
    badgeClass: "border-tolex bg-ink text-ash",
  },
  late_cancel: {
    label: "CANCELACIÓN TARDÍA (< 24 H)",
    description:
      "Esta reserva fue cancelada con menos de 24 horas de anticipación.",
    badgeClass: "border-[#EF4444] bg-[#EF4444]/15 text-[#EF4444]",
  },
  expired: {
    label: "EXPIRADA (24 H SIN CONFIRMAR)",
    description:
      "Pasaron más de 24 horas sin confirmación y el horario se liberó automáticamente.",
    badgeClass: "border-tolex bg-ink text-smoke",
  },
  no_show: {
    label: "NO ASISTIÓ (NO-SHOW)",
    description: "Registro marcado como inasistencia.",
    badgeClass: "border-[#EF4444] bg-[#EF4444]/15 text-[#EF4444]",
  },
  completed: {
    label: "SESIÓN COMPLETADA",
    description: "¡Gracias por sonar en Ulular Sala de Ensayo!",
    badgeClass: "border-accent bg-accent-soft text-bone",
  },
};

export default function ReservaStatusPage() {
  const params = useParams<{ code: string }>();
  const codeParam = decodeURIComponent(params?.code ?? "").toUpperCase();

  const [booking, setBooking] = useState<BookingRow | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => {
      setBooking(findBookingByCode(codeParam));
      setLoaded(true);
    };
    refresh();
    window.addEventListener("ulular-bookings-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("ulular-bookings-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [codeParam]);

  if (!loaded) {
    return (
      <section className="px-5 sm:px-8 lg:px-16 pt-[calc(6rem+env(safe-area-inset-top))] pb-24 max-w-4xl mx-auto">
        <div className="border border-tolex bg-ink-2 p-10 flex flex-col items-center justify-center gap-4">
          <Orbits variant="loader" count={5} label="Consultando reserva" />
          <p className="font-mono-specs text-xs uppercase text-ash">
            Buscando código {codeParam}...
          </p>
        </div>
      </section>
    );
  }

  if (!booking) {
    return (
      <section className="px-5 sm:px-8 lg:px-16 pt-[calc(6rem+env(safe-area-inset-top))] pb-24 max-w-4xl mx-auto">
        <div className="border border-tolex bg-ink-2 p-8 sm:p-12 space-y-5">
          <p className="font-mono-specs text-xs uppercase tracking-[0.15em] text-accent">
            Consulta de estado
          </p>
          <h1 className="font-display-title text-3xl sm:text-5xl text-bone">
            código no encontrado ({codeParam}).
          </h1>
          <p className="text-sm text-ash max-w-xl">
            Verifica que el código esté bien escrito (por ejemplo{" "}
            <Link
              href="/reserva/UL-7K2Q"
              className="text-accent underline underline-offset-4"
            >
              UL-7K2Q
            </Link>
            ) o realiza una nueva reserva en línea.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Button href="/reservar">Reservar ensayo</Button>
            <Button href="/" variant="ghost" withLed={false}>
              Volver al inicio
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const info = extractDateAndHoursFromBooking(booking);
  const dateHuman = formatBookingDateHuman(info.dateStr);
  const statusMeta = STATUS_META[booking.status];
  const isActive =
    booking.status === "pending" || booking.status === "confirmed";
  const wouldBeLateCancel =
    evaluateCancellationStatus(booking.starts_at) === "late_cancel";

  const handleDownloadIcs = () => {
    const ics = buildBookingIcsContent(booking);
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ensayo-ulular-${booking.code}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleConfirmCancel = () => {
    const res = cancelBookingByCode(booking.code);
    if (res.ok) {
      setBooking(res.booking);
      setConfirmCancelOpen(false);
      setFeedback(
        res.booking.status === "late_cancel"
          ? "Tu reserva quedó cancelada (registrada como cancelación con menos de 24 h)."
          : "Tu reserva fue cancelada a tiempo y el horario quedó liberado.",
      );
    } else {
      setFeedback(res.error);
    }
  };

  return (
    <section className="px-5 sm:px-8 lg:px-16 pt-[calc(5.75rem+env(safe-area-inset-top))] pb-24 max-w-4xl mx-auto">
      <div className="border border-tolex bg-ink-2 p-6 sm:p-10 space-y-8">
        {/* Cabecera de estado */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-tolex pb-6">
          <div className="flex items-center gap-4">
            <Orbits variant="confirm" count={6} triggerKey={1} />
            <div>
              <span
                className={`inline-block border px-2.5 py-0.5 font-mono-specs text-[11px] uppercase tracking-[0.14em] ${statusMeta.badgeClass}`}
              >
                {statusMeta.label}
              </span>
              <h1 className="font-display-title text-3xl sm:text-5xl text-bone mt-2">
                {booking.band_name.toLowerCase()}
              </h1>
              <p className="font-mono-specs text-xs sm:text-sm text-ash mt-1">
                Código: <strong className="text-bone">{booking.code}</strong>
              </p>
            </div>
          </div>

          <Link
            href="/reservar"
            className="border border-tolex bg-ink px-3.5 py-2 font-mono-specs text-xs uppercase tracking-[0.12em] text-bone hover:border-accent self-start sm:self-auto"
          >
            + Nueva reserva
          </Link>
        </div>

        <p className="text-sm text-bone leading-relaxed">
          {statusMeta.description}
        </p>

        {feedback && (
          <div className="border-l-2 border-accent bg-ink p-4 font-mono-specs text-xs text-bone">
            {feedback}
          </div>
        )}

        {/* Ficha técnica del ensayo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-l border-tolex font-mono-specs">
          <div className="border-r border-b border-tolex bg-ink p-4">
            <span className="text-[10px] uppercase tracking-[0.14em] text-ash block">
              Fecha
            </span>
            <strong className="text-sm text-bone mt-1 block">
              {dateHuman}
            </strong>
          </div>
          <div className="border-r border-b border-tolex bg-ink p-4">
            <span className="text-[10px] uppercase tracking-[0.14em] text-ash block">
              Horario
            </span>
            <strong className="text-sm text-accent mt-1 block">
              {info.startLabel} – {info.endLabel} ({booking.hours} h)
            </strong>
          </div>
          <div className="border-r border-b border-tolex bg-ink p-4">
            <span className="text-[10px] uppercase tracking-[0.14em] text-ash block">
              Total a pagar
            </span>
            <strong className="text-sm text-bone mt-1 block">
              ${booking.total} MXN
            </strong>
          </div>
          <div className="border-r border-b border-tolex bg-ink p-4">
            <span className="text-[10px] uppercase tracking-[0.14em] text-ash block">
              Estado de pago
            </span>
            <strong className="text-sm text-bone mt-1 block">
              {booking.paid ? "Pagado ✓" : "Antes de entrar"}
            </strong>
          </div>
        </div>

        {/* Acciones de la banda */}
        <div className="flex flex-wrap items-center gap-3">
          {isActive && (
            <a
              href={buildBandToStudioBookingUrl({
                bandName: booking.band_name,
                dateLabel: dateHuman,
                startTime: info.startLabel,
                endTime: info.endLabel,
                hours: booking.hours,
                total: booking.total,
                code: booking.code,
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-accent px-5 py-3 font-mono-specs text-xs font-semibold uppercase tracking-[0.14em] text-white hover:opacity-90 transition-opacity"
            >
              <BrandIcon network="whatsapp" className="w-4 h-4" />
              <span>Enviar / confirmar por WhatsApp ↗</span>
            </a>
          )}

          <button
            type="button"
            onClick={handleDownloadIcs}
            className="inline-flex items-center gap-2 border border-tolex bg-ink px-4 py-3 font-mono-specs text-xs uppercase tracking-[0.12em] text-bone hover:border-accent cursor-pointer transition-colors"
          >
            <span>Agregar a mi calendario (.ics)</span>
          </button>

          <a
            href={SOCIAL_LINKS.maps}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-tolex bg-ink px-4 py-3 font-mono-specs text-xs uppercase tracking-[0.12em] text-ash hover:border-accent hover:text-bone transition-colors"
          >
            <BrandIcon network="maps" className="w-4 h-4" />
            <span>Cómo llegar ({ADDRESS.street})</span>
          </a>

          {isActive && !confirmCancelOpen && (
            <button
              type="button"
              onClick={() => setConfirmCancelOpen(true)}
              className="inline-flex items-center gap-2 border border-tolex bg-ink px-4 py-3 font-mono-specs text-xs uppercase tracking-[0.12em] text-ash hover:border-[#EF4444] hover:text-[#EF4444] cursor-pointer transition-colors ml-auto"
            >
              <span>Cancelar reserva</span>
            </button>
          )}
        </div>

        {/* Confirmación de cancelación */}
        {isActive && confirmCancelOpen && (
          <div className="border border-[#EF4444] bg-ink p-5 space-y-4">
            <p className="font-mono-specs text-xs uppercase tracking-[0.14em] text-[#EF4444]">
              {wouldBeLateCancel
                ? "Aviso: Faltan menos de 24 horas para tu ensayo (Cancelación tardía)"
                : "Confirmar cancelación de ensayo"}
            </p>
            <p className="text-xs sm:text-sm text-bone">
              {wouldBeLateCancel
                ? "Las cancelaciones se solicitan con al menos 24 horas de anticipación. Si cancelas ahora, quedará registrada como cancelación tardía."
                : "Estás a más de 24 horas de tu ensayo. Tu horario se liberará sin penalización."}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="bg-[#EF4444] px-4 py-2.5 font-mono-specs text-xs font-semibold uppercase tracking-[0.12em] text-white cursor-pointer"
              >
                Sí, cancelar ensayo
              </button>
              <button
                type="button"
                onClick={() => setConfirmCancelOpen(false)}
                className="border border-tolex bg-ink-2 px-4 py-2.5 font-mono-specs text-xs uppercase tracking-[0.12em] text-bone cursor-pointer"
              >
                Conservar mi reserva
              </button>
            </div>
          </div>
        )}

        {/* Reglas y recordatorios */}
        <div className="border-t border-tolex pt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-2">
            <p className="font-label-caps text-xs text-accent">
              Lineamientos de la sala
            </p>
            <ul className="space-y-1 text-xs text-ash">
              {BOOKING_RULES.map((r) => (
                <li key={r}>▪ {r}</li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-4">
            <a
              href={WHATSAPP_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-tolex bg-ink p-4 flex items-center justify-between gap-3 hover:border-[#25D366] transition-colors"
            >
              <div>
                <p className="font-mono-specs text-[10px] uppercase tracking-[0.14em] text-[#25D366]">
                  Comunidad
                </p>
                <p className="font-display-title text-lg text-bone">
                  canal de whatsapp
                </p>
              </div>
              <BrandIcon network="whatsapp" className="w-6 h-6 shrink-0" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
