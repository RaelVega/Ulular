"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { BrandIcon } from "@/components/ui/BrandIcon";
import { Button } from "@/components/ui/Button";
import {
  extractDateAndHoursFromBooking,
  formatBookingDateHuman,
  formatHourLabel,
  pad2,
} from "@/lib/bookings-engine";
import {
  addBlackoutRange,
  computeAdminBookingStats,
  createNewBooking,
  deleteBookingById,
  loadStoredBlackouts,
  loadStoredBookings,
  removeBlackoutRange,
  triggerCalendarSyncForBooking,
  updateBookingAdmin,
} from "@/lib/bookings-store";
import type {
  BlackoutDateRow,
  BookingRow,
  BookingStatus,
} from "@/lib/supabase/types";
import {
  buildStudioCancelToBandUrl,
  buildStudioConfirmToBandUrl,
} from "@/lib/whatsapp";

type FilterTab =
  | "all"
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed";

const STATUS_BADGE: Record<BookingStatus, { label: string; cls: string }> = {
  pending: {
    label: "PENDIENTE",
    cls: "border-accent bg-accent-soft text-accent font-semibold",
  },
  confirmed: {
    label: "CONFIRMADA ✅",
    cls: "border-[#10B981] bg-[#10B981]/15 text-[#10B981] font-semibold",
  },
  cancelled: {
    label: "CANCELADA",
    cls: "border-tolex bg-ink text-ash",
  },
  late_cancel: {
    label: "CANCELACIÓN TARDÍA (<24H)",
    cls: "border-[#EF4444] bg-[#EF4444]/15 text-[#EF4444]",
  },
  expired: {
    label: "EXPIRADA",
    cls: "border-tolex bg-ink text-smoke",
  },
  no_show: {
    label: "NO-SHOW",
    cls: "border-[#EF4444] bg-[#EF4444]/15 text-[#EF4444]",
  },
  completed: {
    label: "COMPLETADA",
    cls: "border-tolex bg-ink-3 text-bone",
  },
};

function getTodayDateStr(): string {
  const now = new Date(Date.now() - 6 * 3600 * 1000);
  return `${now.getUTCFullYear()}-${pad2(now.getUTCMonth() + 1)}-${pad2(
    now.getUTCDate(),
  )}`;
}

export default function AdminReservasPage() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [blackouts, setBlackouts] = useState<BlackoutDateRow[]>([]);
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Panel desplegable para Reserva Manual (incluye lunes / horario especial)
  const [manualOpen, setManualOpen] = useState(false);
  const [mBandName, setMBandName] = useState("");
  const [mContactName, setMContactName] = useState("");
  const [mPhone, setMPhone] = useState("");
  const [mDate, setMDate] = useState(getTodayDateStr);
  const [mStartHour, setMStartHour] = useState(18);
  const [mHours, setMHours] = useState(2);
  const [mStatus, setMStatus] = useState<BookingStatus>("confirmed");
  const [mPaid, setMPaid] = useState(false);
  const [mNotes, setMNotes] = useState("");
  const [mError, setMError] = useState<string | null>(null);

  // Panel desplegable para Bloqueos de Horario (Blackouts)
  const [blackoutOpen, setBlackoutOpen] = useState(false);
  const [bDate, setBDate] = useState(getTodayDateStr);
  const [bStartHour, setBStartHour] = useState(17);
  const [bEndHour, setBEndHour] = useState(23);
  const [bReason, setBReason] = useState("");

  // Edición rápida de nota interna
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const handleSyncAllCalendar = async () => {
    setSyncMessage("Sincronizando con Google Calendar...");
    const active = bookings.filter(
      (b) => b.status === "pending" || b.status === "confirmed",
    );
    let lastMode: "live" | "simulated" = "simulated";
    for (const bk of active) {
      const res = await triggerCalendarSyncForBooking(bk);
      if (res.mode) lastMode = res.mode;
    }
    setSyncMessage(
      `✓ ${active.length} sesiones sincronizadas con Google Calendar (${
        lastMode === "live" ? "Service Account en vivo" : "Modo simulación local"
      }).`,
    );
    window.setTimeout(() => setSyncMessage(null), 4000);
  };

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

  const stats = useMemo(() => computeAdminBookingStats(bookings), [bookings]);

  const filteredBookings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = bookings.filter((b) => {
      if (filterTab === "pending" && b.status !== "pending") return false;
      if (filterTab === "confirmed" && b.status !== "confirmed") return false;
      if (
        filterTab === "cancelled" &&
        b.status !== "cancelled" &&
        b.status !== "late_cancel" &&
        b.status !== "expired"
      )
        return false;
      if (
        filterTab === "completed" &&
        b.status !== "completed" &&
        b.status !== "no_show"
      )
        return false;

      if (!q) return true;
      return (
        b.band_name.toLowerCase().includes(q) ||
        b.code.toLowerCase().includes(q) ||
        b.phone.toLowerCase().includes(q) ||
        (b.contact_name?.toLowerCase().includes(q) ?? false)
      );
    });

    // Ordenar: pendientes primero, luego por fecha de inicio más cercana
    return [...list].sort((a, b) => {
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (a.status !== "pending" && b.status === "pending") return 1;
      return Date.parse(a.starts_at) - Date.parse(b.starts_at);
    });
  }, [bookings, filterTab, searchQuery]);

  const handleCreateManual = (e: FormEvent) => {
    e.preventDefault();
    setMError(null);

    if (!mBandName.trim() || mPhone.replace(/\D/g, "").length < 10) {
      setMError("Ingresa el nombre de la banda y un WhatsApp de 10 dígitos.");
      return;
    }

    const res = createNewBooking({
      bandName: mBandName,
      contactName: mContactName,
      phone: mPhone,
      dateStr: mDate,
      startHour: mStartHour,
      hours: mHours,
      notes: mNotes,
      source: "admin",
      status: mStatus,
      paid: mPaid,
    });

    if (!res.ok) {
      setMError(res.error);
      return;
    }

    setMBandName("");
    setMContactName("");
    setMPhone("");
    setMNotes("");
    setManualOpen(false);
  };

  const handleAddBlackout = (e: FormEvent) => {
    e.preventDefault();
    if (bEndHour <= bStartHour) return;
    addBlackoutRange({
      dateStr: bDate,
      startHour: bStartHour,
      endHour: bEndHour,
      reason: bReason || "Sala bloqueada por administración",
    });
    setBReason("");
  };

  const getOrigin = () =>
    typeof window !== "undefined"
      ? window.location.origin
      : "https://ulular.mx";

  return (
    <div className="max-w-6xl space-y-8">
      {/* Encabezado + KPIs en línea */}
      <div className="pb-6 border-b border-tolex flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <p className="font-label-caps text-accent">
            Agenda operativa · Sincronizada con /reservar
          </p>
          <h1 className="font-display-title text-3xl sm:text-5xl mt-1">
            agenda y reservas.
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-6 font-mono-specs text-xs border-l-2 border-accent pl-4">
          <div>
            <span className="block text-ash">PENDIENTES</span>
            <span className="text-xl text-accent font-bold">
              {stats.pendingCount}
            </span>
          </div>
          <div>
            <span className="block text-ash">CONFIRMADAS</span>
            <span className="text-xl text-bone font-semibold">
              {stats.confirmedCount} ({stats.confirmedHours} h)
            </span>
          </div>
          <div>
            <span className="block text-ash">TOTAL CONFIRMADO</span>
            <span className="text-xl text-bone font-semibold">
              ${stats.confirmedRevenue} MXN
            </span>
          </div>
          <div>
            <span className="block text-ash">PAGADO</span>
            <span className="text-xl text-[#10B981] font-semibold">
              ${stats.paidRevenue} MXN
            </span>
          </div>
        </div>
      </div>

      {/* Barra de herramientas: Reserva manual, Bloqueos y Búsqueda */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => {
              setManualOpen((v) => !v);
              setBlackoutOpen(false);
            }}
            className="min-h-[42px] px-4 text-xs"
          >
            {manualOpen ? "Cerrar formulario" : "+ Reserva manual (Lunes / Especial)"}
          </Button>

          <button
            type="button"
            onClick={() => {
              setBlackoutOpen((v) => !v);
              setManualOpen(false);
            }}
            className="border border-tolex bg-ink-2 px-4 min-h-[42px] font-mono-specs text-xs uppercase tracking-[0.1em] text-bone hover:border-accent cursor-pointer transition-colors"
          >
            {blackoutOpen
              ? "Cerrar bloqueos"
              : `Bloquear horario (${blackouts.length})`}
          </button>

          <button
            type="button"
            onClick={handleSyncAllCalendar}
            className="border border-tolex bg-ink-2 px-4 min-h-[42px] font-mono-specs text-xs uppercase tracking-[0.1em] text-accent hover:border-accent cursor-pointer transition-colors"
          >
            ↻ Sincronizar Google Calendar
          </button>
        </div>

        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por banda, código (UL-...) o teléfono..."
          className="w-full md:w-72 min-h-[42px] px-3 bg-ink-2 border border-tolex text-bone font-mono-specs text-xs focus:border-accent"
        />
      </div>

      {syncMessage && (
        <div className="border-l-2 border-accent bg-ink-2 px-4 py-2.5 font-mono-specs text-xs text-bone">
          {syncMessage}
        </div>
      )}

      {/* PANEL DESPLEGABLE: CREAR RESERVA MANUAL (INCLUYE LUNES O FUERA DE HORARIO) */}
      {manualOpen && (
        <form
          onSubmit={handleCreateManual}
          className="border border-accent bg-ink-2 p-6 space-y-5"
        >
          <div className="flex items-center justify-between border-b border-tolex pb-3">
            <div>
              <p className="font-mono-specs text-xs uppercase tracking-[0.14em] text-accent">
                Registro manual · Permite lunes y horarios especiales
              </p>
              <h2 className="font-display-title text-2xl text-bone mt-0.5">
                agendar ensayo desde whatsapp / cabina
              </h2>
            </div>
          </div>

          {mError && (
            <p className="border-l-2 border-[#EF4444] pl-3 py-1 font-mono-specs text-xs text-[#EF4444]">
              {mError}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <label className="flex flex-col gap-1">
              <span className="font-label-caps text-[11px] text-bone">
                Banda / Proyecto *
              </span>
              <input
                type="text"
                required
                value={mBandName}
                onChange={(e) => setMBandName(e.target.value)}
                placeholder="Nombre de la banda"
                className="min-h-[42px] px-3 bg-ink border border-tolex text-bone font-mono-specs text-xs"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="font-label-caps text-[11px] text-bone">
                Contacto
              </span>
              <input
                type="text"
                value={mContactName}
                onChange={(e) => setMContactName(e.target.value)}
                placeholder="Nombre del contacto"
                className="min-h-[42px] px-3 bg-ink border border-tolex text-bone font-mono-specs text-xs"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="font-label-caps text-[11px] text-bone">
                WhatsApp (10 dígitos) *
              </span>
              <input
                type="tel"
                required
                value={mPhone}
                onChange={(e) => setMPhone(e.target.value)}
                placeholder="442 000 0000"
                className="min-h-[42px] px-3 bg-ink border border-tolex text-bone font-mono-specs text-xs"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="font-label-caps text-[11px] text-bone">
                Fecha (incluye lunes) *
              </span>
              <input
                type="date"
                required
                value={mDate}
                onChange={(e) => setMDate(e.target.value)}
                className="min-h-[42px] px-3 bg-ink border border-tolex text-bone font-mono-specs text-xs"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <label className="flex flex-col gap-1">
              <span className="font-label-caps text-[11px] text-bone">
                Hora de inicio (08:00 a 22:00)
              </span>
              <select
                value={mStartHour}
                onChange={(e) => setMStartHour(Number(e.target.value))}
                className="min-h-[42px] px-3 bg-ink border border-tolex text-bone font-mono-specs text-xs"
              >
                {Array.from({ length: 15 }, (_, i) => i + 8).map((h) => (
                  <option key={h} value={h}>
                    {formatHourLabel(h)}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="font-label-caps text-[11px] text-bone">
                Duración (horas)
              </span>
              <select
                value={mHours}
                onChange={(e) => setMHours(Number(e.target.value))}
                className="min-h-[42px] px-3 bg-ink border border-tolex text-bone font-mono-specs text-xs"
              >
                {[1, 2, 3, 4, 5, 6].map((h) => (
                  <option key={h} value={h}>
                    {h} {h === 1 ? "hora" : "horas"} (${h * 150} MXN)
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="font-label-caps text-[11px] text-bone">
                Estado inicial
              </span>
              <select
                value={mStatus}
                onChange={(e) => setMStatus(e.target.value as BookingStatus)}
                className="min-h-[42px] px-3 bg-ink border border-tolex text-bone font-mono-specs text-xs"
              >
                <option value="confirmed">Confirmada directo ✅</option>
                <option value="pending">Pendiente de confirmar</option>
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="font-label-caps text-[11px] text-bone">
                Notas / Equipo extra
              </span>
              <input
                type="text"
                value={mNotes}
                onChange={(e) => setMNotes(e.target.value)}
                placeholder="Ej. Lunes especial / Renta de bajo"
                className="min-h-[42px] px-3 bg-ink border border-tolex text-bone font-mono-specs text-xs"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-tolex">
            <label className="inline-flex items-center gap-2 text-xs text-bone cursor-pointer">
              <input
                type="checkbox"
                checked={mPaid}
                onChange={(e) => setMPaid(e.target.checked)}
                className="h-4 w-4 accent-[var(--color-accent)]"
              />
              <span>Marcar como ya pagado</span>
            </label>

            <Button type="submit" className="min-h-[42px] px-5 text-xs">
              Guardar reserva manual
            </Button>
          </div>
        </form>
      )}

      {/* PANEL DESPLEGABLE: BLOQUEOS DE HORARIO (BLACKOUTS) */}
      {blackoutOpen && (
        <div className="border border-tolex bg-ink-2 p-6 space-y-5">
          <div>
            <p className="font-mono-specs text-xs uppercase tracking-[0.14em] text-accent">
              Bloqueo de horarios y fechas
            </p>
            <h2 className="font-display-title text-2xl text-bone mt-0.5">
              bloquear sala (mantenimiento, live session o evento privado)
            </h2>
          </div>

          <form
            onSubmit={handleAddBlackout}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end"
          >
            <label className="flex flex-col gap-1">
              <span className="font-label-caps text-[11px] text-bone">
                Fecha
              </span>
              <input
                type="date"
                required
                value={bDate}
                onChange={(e) => setBDate(e.target.value)}
                className="min-h-[42px] px-3 bg-ink border border-tolex text-bone font-mono-specs text-xs"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="font-label-caps text-[11px] text-bone">
                Desde
              </span>
              <select
                value={bStartHour}
                onChange={(e) => setBStartHour(Number(e.target.value))}
                className="min-h-[42px] px-3 bg-ink border border-tolex text-bone font-mono-specs text-xs"
              >
                {Array.from({ length: 13 }, (_, i) => i + 10).map((h) => (
                  <option key={h} value={h}>
                    {formatHourLabel(h)}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="font-label-caps text-[11px] text-bone">
                Hasta
              </span>
              <select
                value={bEndHour}
                onChange={(e) => setBEndHour(Number(e.target.value))}
                className="min-h-[42px] px-3 bg-ink border border-tolex text-bone font-mono-specs text-xs"
              >
                {Array.from({ length: 13 }, (_, i) => i + 11).map((h) => (
                  <option key={h} value={h}>
                    {formatHourLabel(h)}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="font-label-caps text-[11px] text-bone">
                Motivo
              </span>
              <input
                type="text"
                value={bReason}
                onChange={(e) => setBReason(e.target.value)}
                placeholder="Ej. Grabación Live Session"
                className="min-h-[42px] px-3 bg-ink border border-tolex text-bone font-mono-specs text-xs"
              />
            </label>

            <Button type="submit" className="min-h-[42px] text-xs">
              Bloquear rango
            </Button>
          </form>

          {blackouts.length > 0 && (
            <div className="divide-y divide-tolex border-t border-tolex pt-3">
              {blackouts.map((bl) => {
                const info = extractDateAndHoursFromBooking(bl);
                return (
                  <div
                    key={bl.id}
                    className="py-2.5 flex items-center justify-between gap-4 font-mono-specs text-xs"
                  >
                    <div>
                      <strong className="text-bone">
                        {formatBookingDateHuman(info.dateStr)} ·{" "}
                        {info.startLabel}–{info.endLabel}
                      </strong>{" "}
                      <span className="text-ash">— {bl.reason}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeBlackoutRange(bl.id)}
                      className="text-[#EF4444] hover:underline cursor-pointer"
                    >
                      Quitar bloqueo ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Pestañas de filtro */}
      <div className="flex flex-wrap gap-1.5 border-b border-tolex pb-3">
        {(
          [
            { id: "all", label: `Todas (${bookings.length})` },
            { id: "pending", label: `Pendientes (${stats.pendingCount})` },
            { id: "confirmed", label: `Confirmadas (${stats.confirmedCount})` },
            { id: "cancelled", label: "Canceladas / Tardías" },
            { id: "completed", label: "Completadas / No-show" },
          ] as { id: FilterTab; label: string }[]
        ).map((tab) => {
          const active = filterTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterTab(tab.id)}
              className={`px-3.5 py-2 font-mono-specs text-xs uppercase tracking-[0.1em] border cursor-pointer transition-colors ${
                active
                  ? "border-accent bg-accent-soft text-bone font-semibold"
                  : "border-tolex bg-ink-2 text-ash hover:text-bone"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Listado de Reservas en filas horizontales de consola (sin tarjetas genéricas) */}
      <div className="divide-y divide-tolex border-y border-tolex">
        {filteredBookings.length === 0 ? (
          <div className="py-12 text-center font-mono-specs text-xs text-ash">
            No hay reservas en esta vista.
          </div>
        ) : (
          filteredBookings.map((b) => {
            const info = extractDateAndHoursFromBooking(b);
            const dateHuman = formatBookingDateHuman(info.dateStr);
            const badge = STATUS_BADGE[b.status];
            const origin = getOrigin();

            const confirmWaUrl = buildStudioConfirmToBandUrl(b.phone, {
              bandName: b.band_name,
              dateLabel: dateHuman,
              startTime: info.startLabel,
              endTime: info.endLabel,
              hours: b.hours,
              total: b.total,
              code: b.code,
              statusUrl: `${origin}/reserva/${b.code}`,
            });

            const cancelWaUrl = buildStudioCancelToBandUrl(b.phone, {
              bandName: b.band_name,
              dateLabel: dateHuman,
              startTime: info.startLabel,
              endTime: info.endLabel,
              bookingUrl: `${origin}/reservar`,
            });

            return (
              <div
                key={b.id}
                className="py-6 px-3 sm:px-4 hover:bg-ink-2/70 transition-colors flex flex-col gap-4"
              >
                {/* Fila superior: Estado + Banda + Horario + Monto */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 font-mono-specs text-[11px]">
                      <span className={`border px-2 py-0.5 ${badge.cls}`}>
                        {badge.label}
                      </span>
                      <Link
                        href={`/reserva/${b.code}`}
                        className="border border-tolex bg-ink px-2 py-0.5 text-bone hover:border-accent"
                        title="Abrir página pública de estado"
                      >
                        {b.code} ↗
                      </Link>
                      <span className="text-ash uppercase">
                        {b.source === "admin" ? "· MANUAL" : "· WEB"}
                      </span>
                      {b.google_event_id && (
                        <span
                          title={`Evento en Google Calendar: ${
                            b.status === "confirmed" || b.status === "completed"
                              ? "✅"
                              : "[PENDIENTE]"
                          } ${b.band_name}`}
                          className="border border-accent/50 bg-accent-soft px-2 py-0.5 text-[10px] text-bone"
                        >
                          GCAL:{" "}
                          {b.status === "confirmed" || b.status === "completed"
                            ? "✅"
                            : "[PENDIENTE]"}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          updateBookingAdmin(b.id, { paid: !b.paid })
                        }
                        className={`border px-2 py-0.5 cursor-pointer transition-colors ${
                          b.paid
                            ? "border-[#10B981] bg-[#10B981]/15 text-[#10B981]"
                            : "border-tolex bg-ink text-ash hover:border-bone"
                        }`}
                      >
                        {b.paid ? "PAGADO ✓" : "POR COBRAR"}
                      </button>
                    </div>

                    <h3 className="font-display-title text-2xl sm:text-3xl text-bone">
                      {b.band_name.toLowerCase()}
                    </h3>

                    <p className="font-mono-specs text-xs text-ash">
                      {b.contact_name ? `${b.contact_name} · ` : ""}
                      Tel/WA: <strong className="text-bone">{b.phone}</strong>
                      {b.notes ? ` · Nota banda: "${b.notes}"` : ""}
                    </p>
                  </div>

                  {/* Bloque derecho: Fecha, Hora y Total */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-5 border-l-2 border-accent pl-4 font-mono-specs">
                    <div>
                      <span className="block text-[10px] uppercase text-ash">
                        FECHA
                      </span>
                      <strong className="text-sm text-bone">{dateHuman}</strong>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-ash">
                        HORARIO ({b.hours} H)
                      </span>
                      <strong className="text-sm text-accent">
                        {info.startLabel} – {info.endLabel}
                      </strong>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-ash">
                        TOTAL
                      </span>
                      <strong className="text-base text-bone">
                        ${b.total} MXN
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Fila inferior: Botones de acción operativa + WhatsApp directo a la banda */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-tolex/70">
                  <div className="flex flex-wrap items-center gap-2">
                    {b.status === "pending" && (
                      <button
                        type="button"
                        onClick={() =>
                          updateBookingAdmin(b.id, { status: "confirmed" })
                        }
                        className="bg-accent text-white px-3.5 py-2 font-mono-specs text-xs font-semibold uppercase tracking-[0.1em] cursor-pointer hover:opacity-90"
                      >
                        Confirmar horario ✅
                      </button>
                    )}

                    {(b.status === "pending" || b.status === "confirmed") && (
                      <a
                        href={confirmWaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          if (b.status === "pending") {
                            updateBookingAdmin(b.id, { status: "confirmed" });
                          }
                        }}
                        className="inline-flex items-center gap-2 border border-[#25D366] bg-ink px-3.5 py-2 font-mono-specs text-xs uppercase tracking-[0.1em] text-bone hover:bg-[#25D366]/15 transition-colors"
                      >
                        <BrandIcon network="whatsapp" className="w-4 h-4" />
                        <span>Avisar confirmación WA ↗</span>
                      </a>
                    )}

                    {b.status === "confirmed" && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            updateBookingAdmin(b.id, {
                              status: "completed",
                              paid: true,
                            })
                          }
                          className="border border-tolex bg-ink px-3 py-2 font-mono-specs text-xs uppercase text-bone hover:border-accent cursor-pointer"
                        >
                          Completada ✓
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateBookingAdmin(b.id, { status: "no_show" })
                          }
                          className="border border-tolex bg-ink px-3 py-2 font-mono-specs text-xs uppercase text-ash hover:border-[#EF4444] hover:text-[#EF4444] cursor-pointer"
                        >
                          No-show
                        </button>
                      </>
                    )}

                    {(b.status === "pending" || b.status === "confirmed") && (
                      <button
                        type="button"
                        onClick={() =>
                          updateBookingAdmin(b.id, { status: "cancelled" })
                        }
                        className="border border-tolex bg-ink px-3 py-2 font-mono-specs text-xs uppercase text-ash hover:border-[#EF4444] hover:text-[#EF4444] cursor-pointer"
                      >
                        Cancelar
                      </button>
                    )}

                    {(b.status === "cancelled" ||
                      b.status === "late_cancel") && (
                      <a
                        href={cancelWaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 border border-tolex bg-ink px-3 py-2 font-mono-specs text-xs uppercase text-ash hover:border-accent hover:text-bone"
                      >
                        <BrandIcon network="whatsapp" className="w-4 h-4" />
                        <span>Enviar aviso cancelación WA ↗</span>
                      </a>
                    )}
                  </div>

                  {/* Nota interna de cabina + Eliminar */}
                  <div className="flex items-center gap-2">
                    {editingNoteId === b.id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={noteDraft}
                          onChange={(e) => setNoteDraft(e.target.value)}
                          placeholder="Nota interna de cabina..."
                          className="px-2.5 py-1.5 bg-ink border border-accent text-bone font-mono-specs text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            updateBookingAdmin(b.id, {
                              admin_notes: noteDraft.trim() || null,
                            });
                            setEditingNoteId(null);
                          }}
                          className="bg-accent text-white px-2.5 py-1.5 font-mono-specs text-xs uppercase cursor-pointer"
                        >
                          Guardar
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingNoteId(b.id);
                          setNoteDraft(b.admin_notes ?? "");
                        }}
                        className="font-mono-specs text-xs text-ash hover:text-bone underline underline-offset-4 cursor-pointer"
                      >
                        {b.admin_notes
                          ? `Nota cabina: "${b.admin_notes}" (editar)`
                          : "+ Nota cabina"}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => deleteBookingById(b.id)}
                      title="Eliminar registro"
                      className="ml-2 font-mono-specs text-xs text-smoke hover:text-[#EF4444] cursor-pointer px-2 py-1"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
