"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { BrandIcon } from "@/components/ui/BrandIcon";
import { Button } from "@/components/ui/Button";
import { Orbits } from "@/components/ui/Orbits";
import {
  BOOKING_RULES,
  DEFAULT_PRICE_PER_HOUR,
  WHATSAPP_CHANNEL_URL,
} from "@/lib/constants";
import {
  bookingFormSchema,
  buildBookingIcsContent,
  calculateBookingTotal,
  formatBookingDateHuman,
  formatHourLabel,
  getDaySlotsAvailability,
  getMaxConsecutiveHours,
  isMondayDateStr,
  pad2,
} from "@/lib/bookings-engine";
import {
  createNewBooking,
  loadStoredBlackouts,
  loadStoredBookings,
} from "@/lib/bookings-store";
import type { BlackoutDateRow, BookingRow } from "@/lib/supabase/types";
import {
  buildBandToStudioBookingUrl,
  buildSpecialScheduleWhatsAppUrl,
} from "@/lib/whatsapp";

const STEP_LABELS = [
  "1. Día",
  "2. Hora y duración",
  "3. Datos y reglas",
  "4. Reserva recibida",
] as const;

function getUpcomingDateStrings(count: number = 14): {
  dateStr: string;
  weekdayShort: string;
  dayNum: string;
  monthShort: string;
  isMonday: boolean;
}[] {
  const result = [];
  const nowMs = Date.now();
  const qroOffsetMs = -6 * 60 * 60 * 1000;
  const base = new Date(nowMs + qroOffsetMs);

  for (let i = 0; i < count; i++) {
    const dt = new Date(
      Date.UTC(
        base.getUTCFullYear(),
        base.getUTCMonth(),
        base.getUTCDate() + i,
        12,
        0,
        0,
      ),
    );
    const y = dt.getUTCFullYear();
    const m = pad2(dt.getUTCMonth() + 1);
    const d = pad2(dt.getUTCDate());
    const dateStr = `${y}-${m}-${d}`;
    const weekdayShort = new Intl.DateTimeFormat("es-MX", {
      weekday: "short",
      timeZone: "UTC",
    })
      .format(dt)
      .replace(".", "")
      .toUpperCase();
    const monthShort = new Intl.DateTimeFormat("es-MX", {
      month: "short",
      timeZone: "UTC",
    })
      .format(dt)
      .replace(".", "")
      .toUpperCase();

    result.push({
      dateStr,
      weekdayShort,
      dayNum: d,
      monthShort,
      isMonday: dt.getUTCDay() === 1,
    });
  }
  return result;
}

export default function ReservarPage() {
  const upcomingDays = useMemo(() => getUpcomingDateStrings(14), []);
  const firstOpenDay = useMemo(
    () =>
      upcomingDays.find((d, idx) => idx > 0 && !d.isMonday)?.dateStr ??
      upcomingDays[0]?.dateStr ??
      "2026-10-25",
    [upcomingDays],
  );

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [confirmKey, setConfirmKey] = useState(1);

  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [blackouts, setBlackouts] = useState<BlackoutDateRow[]>([]);
  const [freeBusyIntervals, setFreeBusyIntervals] = useState<
    { start: string; end: string }[]
  >([]);

  const [selectedDate, setSelectedDate] = useState<string>(firstOpenDay);
  const [selectedStartHour, setSelectedStartHour] = useState<number | null>(
    null,
  );
  const [selectedHours, setSelectedHours] = useState<number>(2);

  // Datos del formulario (Paso 3)
  const [bandName, setBandName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [acceptRules, setAcceptRules] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Reserva creada (Paso 4)
  const [createdBooking, setCreatedBooking] = useState<BookingRow | null>(null);

  useEffect(() => {
    const refresh = () => {
      setBookings(loadStoredBookings());
      setBlackouts(loadStoredBlackouts());
    };
    refresh();
    window.addEventListener("ulular-bookings-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("ulular-bookings-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    let active = true;
    fetch(`/api/calendar/freebusy?date=${encodeURIComponent(selectedDate)}`)
      .then((r) => r.json())
      .then((data: { busy?: { start: string; end: string }[] }) => {
        if (active && Array.isArray(data?.busy)) {
          setFreeBusyIntervals(data.busy);
        }
      })
      .catch(() => {
        if (active) setFreeBusyIntervals([]);
      });
    return () => {
      active = false;
    };
  }, [selectedDate]);

  const daySlots = useMemo(
    () =>
      getDaySlotsAvailability({
        dateStr: selectedDate,
        bookings,
        blackouts,
        freeBusyIntervals,
      }),
    [selectedDate, bookings, blackouts, freeBusyIntervals],
  );

  const maxConsecutive = useMemo(() => {
    if (selectedStartHour === null) return 0;
    return getMaxConsecutiveHours(daySlots, selectedStartHour);
  }, [daySlots, selectedStartHour]);

  useEffect(() => {
    if (selectedStartHour !== null && maxConsecutive > 0) {
      if (selectedHours > maxConsecutive) {
        setSelectedHours(maxConsecutive);
      }
    }
  }, [selectedStartHour, maxConsecutive, selectedHours]);

  const isMonday = isMondayDateStr(selectedDate);
  const dateHuman = formatBookingDateHuman(selectedDate);
  const totalAmount = calculateBookingTotal(
    selectedHours,
    DEFAULT_PRICE_PER_HOUR,
  );

  const handleSelectDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedStartHour(null);
    setFormError(null);
  };

  const handleSelectHour = (hour: number) => {
    setSelectedStartHour(hour);
    const maxH = getMaxConsecutiveHours(daySlots, hour);
    setSelectedHours(Math.min(2, Math.max(1, maxH)));
    setFormError(null);
  };

  const handleSubmitBooking = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (selectedStartHour === null) {
      setFormError("Selecciona una hora de inicio antes de continuar.");
      setStep(2);
      return;
    }

    const parsed = bookingFormSchema.safeParse({
      bandName,
      contactName,
      phone,
      dateStr: selectedDate,
      startHour: selectedStartHour,
      hours: selectedHours,
      notes,
      acceptRules: acceptRules ? true : false,
    });

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      setFormError(firstIssue?.message ?? "Revisa los datos del formulario.");
      return;
    }

    const result = createNewBooking({
      bandName: parsed.data.bandName,
      contactName: parsed.data.contactName,
      phone: parsed.data.phone,
      dateStr: parsed.data.dateStr,
      startHour: parsed.data.startHour,
      hours: parsed.data.hours,
      notes: parsed.data.notes,
      source: "web",
    });

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    setCreatedBooking(result.booking);
    setConfirmKey((k) => k + 1);
    setStep(4);
  };

  const handleDownloadIcs = (bk: BookingRow) => {
    const ics = buildBookingIcsContent(bk);
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ensayo-ulular-${bk.code}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="px-5 sm:px-8 lg:px-16 pt-[calc(5.75rem+env(safe-area-inset-top))] pb-24 max-w-6xl mx-auto">
      {/* Encabezado + Stepper A8 */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-tolex pb-8">
        <div>
          <div className="inline-flex items-center gap-2">
            <span
              aria-hidden="true"
              style={{ borderRadius: "9999px" }}
              className="w-2 h-2 rounded-full bg-accent"
            />
            <p className="font-label-caps text-ash">
              Sistema de reservas en línea · Querétaro
            </p>
          </div>
          <h1 className="font-display-title text-[clamp(2.5rem,7vw,4.75rem)] mt-2">
            reserva tu <span className="text-accent">ensayo.</span>
          </h1>
          <p className="font-mono-specs text-xs sm:text-sm text-ash mt-2">
            ${DEFAULT_PRICE_PER_HOUR} MXN / hora · mínimo 1 h · bloques de 1 h ·
            15 min de tolerancia
          </p>
        </div>

        {/* A8 · Indicador de 4 pasos con órbitas concéntricas */}
        <div className="flex items-center gap-4 border border-tolex bg-ink-2 px-4 py-3 self-start lg:self-auto">
          <Orbits variant="stepper" count={4} activeStep={step} />
          <div>
            <p className="font-mono-specs text-[11px] uppercase tracking-[0.14em] text-accent">
              Paso {step} de 4
            </p>
            <p className="font-display-title text-lg text-bone">
              {STEP_LABELS[step - 1]?.toLowerCase()}
            </p>
          </div>
        </div>
      </div>

      {/* Barra de navegación de pasos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-l border-tolex">
        {STEP_LABELS.map((label, idx) => {
          const s = (idx + 1) as 1 | 2 | 3 | 4;
          const isCurrent = step === s;
          const canJump =
            s === 1 ||
            (s === 2 && !isMonday) ||
            (s === 3 && !isMonday && selectedStartHour !== null) ||
            (s === 4 && createdBooking !== null);

          return (
            <button
              key={label}
              type="button"
              disabled={!canJump}
              onClick={() => canJump && setStep(s)}
              className={`border-r border-t border-tolex px-4 py-3 text-left font-mono-specs text-xs uppercase tracking-[0.1em] transition-colors ${
                isCurrent
                  ? "bg-accent text-white font-semibold"
                  : canJump
                  ? "bg-ink-2 text-bone hover:border-accent cursor-pointer"
                  : "bg-ink text-smoke cursor-not-allowed"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* CONTENIDO PRINCIPAL POR PASO */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8">
          {/* PASO 1: ELEGIR DÍA */}
          {step === 1 && (
            <div className="border border-tolex bg-ink-2 p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-tolex pb-4">
                <div>
                  <p className="font-mono-specs text-xs uppercase tracking-[0.14em] text-accent">
                    Paso 01 · Calendario
                  </p>
                  <h2 className="font-display-title text-2xl sm:text-3xl text-bone mt-1">
                    elige el día de tu ensayo.
                  </h2>
                </div>

                <label className="flex flex-col gap-1 font-mono-specs text-xs text-ash">
                  <span>Otra fecha (hasta 60 días):</span>
                  <input
                    type="date"
                    value={selectedDate}
                    min={upcomingDays[0]?.dateStr}
                    onChange={(e) =>
                      e.target.value && handleSelectDate(e.target.value)
                    }
                    className="bg-ink border border-tolex px-3 py-2 text-bone font-mono-specs text-xs focus:border-accent"
                  />
                </label>
              </div>

              {/* Tira de próximos 14 días */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 border-t border-l border-tolex">
                {upcomingDays.map((d) => {
                  const active = d.dateStr === selectedDate;
                  return (
                    <button
                      key={d.dateStr}
                      type="button"
                      onClick={() => handleSelectDate(d.dateStr)}
                      className={`border-r border-b border-tolex p-3 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
                        active
                          ? "bg-accent text-white"
                          : d.isMonday
                          ? "bg-ink/60 text-ash hover:bg-ink"
                          : "bg-ink text-bone hover:border-accent"
                      }`}
                    >
                      <span
                        className={`font-mono-specs text-[10px] uppercase tracking-[0.14em] ${
                          active ? "text-white" : "text-ash"
                        }`}
                      >
                        {d.weekdayShort}
                      </span>
                      <span className="font-display-title text-2xl">
                        {d.dayNum}
                      </span>
                      <span
                        className={`font-mono-specs text-[10px] ${
                          active
                            ? "text-white/90"
                            : d.isMonday
                            ? "text-accent"
                            : "text-smoke"
                        }`}
                      >
                        {d.isMonday ? "ANTICIPADA" : d.monthShort}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Si eligen LUNES: mostrar aviso de reserva anticipada por WhatsApp */}
              {isMonday ? (
                <div className="border-l-2 border-accent bg-ink p-6 space-y-4">
                  <div className="flex items-center gap-2 font-mono-specs text-xs uppercase tracking-[0.14em] text-accent">
                    <span>Lunes · Solo con reserva anticipada</span>
                  </div>
                  <h3 className="font-display-title text-2xl text-bone">
                    ¿quieres ensayar este lunes ({dateHuman})?
                  </h3>
                  <p className="text-sm text-ash leading-relaxed">
                    Los lunes abrimos exclusivamente con reserva anticipada
                    directa por WhatsApp. Escríbenos indicando a qué hora te
                    gustaría ensayar y te confirmamos disponibilidad.
                  </p>
                  <div className="pt-2">
                    <a
                      href={buildSpecialScheduleWhatsAppUrl(
                        `Lunes ${dateHuman}`,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 bg-accent px-5 py-3 font-mono-specs text-xs font-semibold uppercase tracking-[0.14em] text-white hover:opacity-90 transition-opacity"
                    >
                      <BrandIcon network="whatsapp" className="w-4 h-4" />
                      <span>Pedir horario de lunes por WhatsApp ↗</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-tolex pt-5">
                  <div>
                    <p className="font-mono-specs text-xs text-ash uppercase">
                      Fecha seleccionada:
                    </p>
                    <p className="font-display-title text-2xl text-bone mt-0.5">
                      {dateHuman}
                    </p>
                    <p className="font-mono-specs text-xs text-accent mt-1">
                      {daySlots.filter((s) => s.available).length} bloques de 1
                      h disponibles
                    </p>
                  </div>

                  <Button onClick={() => setStep(2)}>
                    Elegir hora de inicio →
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* PASO 2: ELEGIR HORA Y DURACIÓN */}
          {step === 2 && !isMonday && (
            <div className="border border-tolex bg-ink-2 p-6 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-tolex pb-4">
                <div>
                  <p className="font-mono-specs text-xs uppercase tracking-[0.14em] text-accent">
                    Paso 02 · Horario y bloques de 1 h
                  </p>
                  <h2 className="font-display-title text-2xl sm:text-3xl text-bone mt-1">
                    {dateHuman}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="border border-tolex bg-ink px-3 py-2 font-mono-specs text-xs uppercase text-ash hover:text-bone hover:border-accent cursor-pointer"
                >
                  ← Cambiar día
                </button>
              </div>

              <div>
                <p className="font-mono-specs text-xs uppercase tracking-[0.12em] text-ash mb-3">
                  1. Selecciona tu hora de entrada:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 border-t border-l border-tolex">
                  {daySlots.map((slot) => {
                    const isSelectedStart = selectedStartHour === slot.hour;
                    const isWithinRange =
                      selectedStartHour !== null &&
                      slot.hour >= selectedStartHour &&
                      slot.hour < selectedStartHour + selectedHours;

                    return (
                      <button
                        key={slot.hour}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => handleSelectHour(slot.hour)}
                        className={`border-r border-b border-tolex p-4 text-left transition-colors flex flex-col justify-between gap-2 ${
                          !slot.available
                            ? "bg-ink/50 text-smoke cursor-not-allowed"
                            : isSelectedStart
                            ? "bg-accent text-white cursor-pointer"
                            : isWithinRange
                            ? "bg-accent-soft border-accent text-bone cursor-pointer"
                            : "bg-ink text-bone hover:border-accent cursor-pointer"
                        }`}
                      >
                        <span className="font-mono-specs text-base font-bold">
                          {slot.startLabel} – {slot.endLabel}
                        </span>
                        <span
                          className={`font-mono-specs text-[10px] uppercase tracking-[0.14em] ${
                            !slot.available
                              ? "text-smoke"
                              : isSelectedStart
                              ? "text-white"
                              : "text-accent"
                          }`}
                        >
                          {!slot.available
                            ? slot.reason === "occupied"
                              ? "OCUPADO"
                              : slot.reason === "blackout"
                              ? "BLOQUEADO"
                              : "NO DISPONIBLE"
                            : isSelectedStart
                            ? "INICIO ELEGIDO"
                            : isWithinRange
                            ? "INCLUIDO"
                            : "DISPONIBLE"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selector de duración continua */}
              {selectedStartHour !== null && maxConsecutive > 0 && (
                <div className="border-t border-tolex pt-6 space-y-4">
                  <p className="font-mono-specs text-xs uppercase tracking-[0.12em] text-ash">
                    2. ¿Cuántas horas seguidas van a ensayar? (mínimo 1 h):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(
                      { length: Math.min(6, maxConsecutive) },
                      (_, i) => i + 1,
                    ).map((h) => {
                      const active = selectedHours === h;
                      const price = calculateBookingTotal(
                        h,
                        DEFAULT_PRICE_PER_HOUR,
                      );
                      return (
                        <button
                          key={h}
                          type="button"
                          onClick={() => setSelectedHours(h)}
                          className={`px-4 py-3 border font-mono-specs text-xs uppercase tracking-[0.1em] cursor-pointer transition-colors ${
                            active
                              ? "border-accent bg-accent text-white font-semibold"
                              : "border-tolex bg-ink text-bone hover:border-accent"
                          }`}
                        >
                          {h} {h === 1 ? "hora" : "horas"} · ${price} MXN
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-tolex pt-5">
                    <div className="font-mono-specs text-xs sm:text-sm text-bone">
                      Horario:{" "}
                      <strong className="text-accent">
                        {formatHourLabel(selectedStartHour)} –{" "}
                        {formatHourLabel(selectedStartHour + selectedHours)}
                      </strong>{" "}
                      ({selectedHours} h) · Total:{" "}
                      <strong className="text-bone">${totalAmount} MXN</strong>
                    </div>

                    <Button onClick={() => setStep(3)}>
                      Continuar a tus datos →
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PASO 3: DATOS DE LA BANDA Y REGLAS */}
          {step === 3 && selectedStartHour !== null && (
            <form
              onSubmit={handleSubmitBooking}
              className="border border-tolex bg-ink-2 p-6 sm:p-8 space-y-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-tolex pb-4">
                <div>
                  <p className="font-mono-specs text-xs uppercase tracking-[0.14em] text-accent">
                    Paso 03 · Datos de tu banda o proyecto
                  </p>
                  <h2 className="font-display-title text-2xl sm:text-3xl text-bone mt-1">
                    confirma tus datos.
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="border border-tolex bg-ink px-3 py-2 font-mono-specs text-xs uppercase text-ash hover:text-bone hover:border-accent cursor-pointer"
                >
                  ← Cambiar hora
                </button>
              </div>

              {formError && (
                <div className="border-l-2 border-accent bg-ink p-4 font-mono-specs text-xs text-bone">
                  ⚠ {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="font-label-caps text-xs text-bone">
                    Banda o proyecto *
                  </span>
                  <input
                    type="text"
                    required
                    value={bandName}
                    onChange={(e) => setBandName(e.target.value)}
                    placeholder="Ej. Los Ecos / Proyecto Solista"
                    className="min-h-[44px] px-3 bg-ink border border-tolex text-bone font-mono-specs text-sm focus:border-accent"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="font-label-caps text-xs text-bone">
                    Tu nombre (contacto)
                  </span>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Nombre de quien aparta"
                    className="min-h-[44px] px-3 bg-ink border border-tolex text-bone font-mono-specs text-sm focus:border-accent"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="font-label-caps text-xs text-bone">
                    WhatsApp (10 dígitos) *
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="442 000 0000"
                    className="min-h-[44px] px-3 bg-ink border border-tolex text-bone font-mono-specs text-sm focus:border-accent"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="font-label-caps text-xs text-bone">
                    Notas o instrumentos extra (opcional)
                  </span>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ej. Renta de guitarra, bajo o platillos"
                    className="min-h-[44px] px-3 bg-ink border border-tolex text-bone font-mono-specs text-sm focus:border-accent"
                  />
                </label>
              </div>

              {/* Lineamientos obligatorios */}
              <div className="border border-tolex bg-ink p-5 space-y-3">
                <p className="font-label-caps text-xs text-accent">
                  Lineamientos de sesión
                </p>
                <ul className="space-y-1.5 text-xs sm:text-sm text-ash">
                  {BOOKING_RULES.map((rule) => (
                    <li key={rule} className="flex items-start gap-2">
                      <span className="text-accent mt-0.5">▪</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>

                <label className="pt-3 border-t border-tolex flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptRules}
                    onChange={(e) => setAcceptRules(e.target.checked)}
                    className="mt-1 h-4 w-4 accent-[var(--color-accent)]"
                  />
                  <span className="text-xs sm:text-sm text-bone">
                    Acepto que el pago se realiza antes de entrar al ensayo, que
                    las horas apartadas se pagan completas (15 min de
                    tolerancia, no se recorren) y la política de cancelación de
                    24 horas.
                  </span>
                </label>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <p className="font-mono-specs text-xs text-ash">
                  Tu horario quedará apartado por 24 h mientras el estudio
                  confirma.
                </p>
                <Button type="submit" className="w-full sm:w-auto">
                  Apartar horario (${totalAmount} MXN)
                </Button>
              </div>
            </form>
          )}

          {/* PASO 4: RESERVA RECIBIDA (A9) */}
          {step === 4 && createdBooking && (
            <div className="border border-tolex bg-ink-2 p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-tolex pb-6">
                <div className="flex items-center gap-4">
                  <Orbits
                    variant="confirm"
                    count={6}
                    triggerKey={confirmKey}
                  />
                  <div>
                    <span className="inline-block border border-accent bg-accent-soft px-2.5 py-0.5 font-mono-specs text-[10px] uppercase tracking-[0.14em] text-accent">
                      Apartado temporal · Pendiente de confirmación
                    </span>
                    <h2 className="font-display-title text-3xl sm:text-4xl text-bone mt-1.5">
                      reserva recibida.
                    </h2>
                    <p className="font-mono-specs text-sm text-ash mt-1">
                      Código de sesión:{" "}
                      <strong className="text-bone">
                        {createdBooking.code}
                      </strong>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setConfirmKey((k) => k + 1)}
                  className="border border-tolex bg-ink px-3 py-2 font-mono-specs text-xs uppercase text-ash hover:text-bone hover:border-accent cursor-pointer self-start sm:self-auto"
                >
                  Repetir animación
                </button>
              </div>

              <p className="text-sm text-bone leading-relaxed">
                Tu horario ya quedó apartado por 24 horas. Envíanos el mensaje
                prellenado por WhatsApp para confirmar tu ensayo de inmediato:
              </p>

              {/* Acciones principales: WhatsApp + Página de estado + .ics */}
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={buildBandToStudioBookingUrl({
                    bandName: createdBooking.band_name,
                    dateLabel: dateHuman,
                    startTime: formatHourLabel(selectedStartHour ?? 18),
                    endTime: formatHourLabel(
                      (selectedStartHour ?? 18) + createdBooking.hours,
                    ),
                    hours: createdBooking.hours,
                    total: createdBooking.total,
                    code: createdBooking.code,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 bg-accent px-5 py-3.5 font-mono-specs text-xs font-semibold uppercase tracking-[0.14em] text-white hover:opacity-90 transition-opacity"
                >
                  <BrandIcon network="whatsapp" className="w-4 h-4" />
                  <span>Enviar a Ulular por WhatsApp ↗</span>
                </a>

                <Link
                  href={`/reserva/${createdBooking.code}`}
                  className="inline-flex items-center gap-2 border border-tolex bg-ink px-4 py-3.5 font-mono-specs text-xs uppercase tracking-[0.12em] text-bone hover:border-accent hover:text-accent transition-colors"
                >
                  <span>Ver página de estado (/reserva/{createdBooking.code})</span>
                </Link>

                <button
                  type="button"
                  onClick={() => handleDownloadIcs(createdBooking)}
                  className="inline-flex items-center gap-2 border border-tolex bg-ink px-4 py-3.5 font-mono-specs text-xs uppercase tracking-[0.12em] text-ash hover:border-accent hover:text-bone cursor-pointer transition-colors"
                >
                  <span>Descargar calendario (.ics)</span>
                </button>
              </div>

              {/* Invitación a Ulular Napule Pizza + Canal de difusión */}
              <div className="border-t border-tolex pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-tolex bg-ink p-4">
                  <p className="font-mono-specs text-[11px] uppercase tracking-[0.14em] text-accent">
                    Después del ensayo
                  </p>
                  <p className="font-display-title text-xl text-bone mt-1">
                    ulular napule pizza
                  </p>
                  <p className="text-xs text-ash mt-1">
                    Pizza napolitana, open mic y tocadas en el mismo espacio.
                  </p>
                </div>

                <a
                  href={WHATSAPP_CHANNEL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-tolex bg-ink p-4 flex items-center justify-between gap-3 hover:border-[#25D366] transition-colors"
                >
                  <div>
                    <p className="font-mono-specs text-[11px] uppercase tracking-[0.14em] text-[#25D366]">
                      Comunidad Ulular
                    </p>
                    <p className="font-display-title text-xl text-bone mt-1">
                      únete al canal de difusión
                    </p>
                    <p className="text-xs text-ash mt-1">
                      Entérate de tocadas, horarios libres y sesiones.
                    </p>
                  </div>
                  <BrandIcon network="whatsapp" className="w-7 h-7 shrink-0" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* COLUMNA LATERAL DERECHA: RESUMEN EN VIVO + REGLAS + CONSULTA DE CÓDIGO */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="border border-tolex bg-ink-2 p-6 space-y-4">
            <p className="font-label-caps text-xs text-accent">
              Resumen de tu ensayo
            </p>

            <div className="divide-y divide-tolex border-y border-tolex font-mono-specs text-xs">
              <div className="py-2.5 flex items-center justify-between gap-2">
                <span className="text-ash">FECHA</span>
                <span className="text-bone font-medium">{dateHuman}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between gap-2">
                <span className="text-ash">HORARIO</span>
                <span className="text-bone font-medium">
                  {selectedStartHour !== null
                    ? `${formatHourLabel(selectedStartHour)} – ${formatHourLabel(
                        selectedStartHour + selectedHours,
                      )}`
                    : "Por elegir"}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between gap-2">
                <span className="text-ash">DURACIÓN</span>
                <span className="text-bone font-medium">
                  {selectedStartHour !== null
                    ? `${selectedHours} ${selectedHours === 1 ? "hora" : "horas"}`
                    : "—"}
                </span>
              </div>
              <div className="py-3 flex items-center justify-between gap-2 text-sm">
                <span className="text-ash">TOTAL</span>
                <span className="text-accent font-bold text-base">
                  ${selectedStartHour !== null ? totalAmount : DEFAULT_PRICE_PER_HOUR}{" "}
                  MXN
                </span>
              </div>
            </div>

            <p className="text-xs text-ash leading-relaxed">
              Incluye batería, amplificadores de guitarra y bajo, sistema de voz
              con hasta 4 micrófonos, aire acondicionado y acondicionamiento
              acústico.
            </p>
          </div>

          {/* ¿Horario especial? */}
          <div className="border border-tolex bg-ink-2 p-5 flex items-center justify-between gap-4">
            <div>
              <p className="font-display-title text-lg text-bone">
                ¿necesitas un horario especial?
              </p>
              <p className="text-xs text-ash mt-1">
                Lunes, mañanas o sesiones extendidas directo por WhatsApp.
              </p>
            </div>
            <a
              href={buildSpecialScheduleWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Preguntar por horario especial en WhatsApp"
              className="inline-flex items-center justify-center w-11 h-11 border border-tolex bg-ink hover:border-[#25D366] shrink-0 transition-colors"
            >
              <BrandIcon network="whatsapp" className="w-5 h-5" />
            </a>
          </div>
        </aside>
      </div>
    </section>
  );
}
