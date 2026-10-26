"use client";

import Link from "next/link";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import {
  DEFAULT_EVENTS,
  EVENT_TAGS,
  type UlularEvent,
} from "@/lib/constants";
import {
  formatEventDateLabel,
  isUpcomingEvent,
  loadStoredEvents,
  saveStoredEvents,
  splitEventsByDate,
} from "@/lib/events-store";
import { Button } from "@/components/ui/Button";
import { StudioIcon } from "@/components/ui/StudioIcon";

const EMPTY_FORM: Omit<UlularEvent, "id"> = {
  title: "",
  date: "2026-11-14",
  time: "20:00",
  venue: "Ulular Napule Pizza",
  tag: "Tocada",
  flyerUrl: "",
  description: "",
};

/**
 * Panel de gestión de Eventos (/admin/eventos):
 * Integrado con el menú lateral izquierdo y listado en filas limpias (sin tarjetas).
 */
export default function AdminEventosPage() {
  const [events, setEvents] = useState<UlularEvent[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<UlularEvent, "id">>(EMPTY_FORM);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setEvents(loadStoredEvents());
  }, []);

  const handleFlyerUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setForm((prev) => ({ ...prev, flyerUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date || !form.time || !form.venue.trim()) {
      setFeedback("Completa título, fecha, hora y lugar.");
      return;
    }

    const clean: UlularEvent = {
      id: editingId ?? `evt-${Date.now()}`,
      title: form.title.trim().toLowerCase(),
      date: form.date,
      time: form.time,
      venue: form.venue.trim(),
      tag: form.tag,
      flyerUrl: form.flyerUrl?.trim() ? form.flyerUrl.trim() : undefined,
      description: form.description?.trim()
        ? form.description.trim()
        : undefined,
    };

    const next = editingId
      ? events.map((ev) => (ev.id === editingId ? clean : ev))
      : [clean, ...events];

    setEvents(next);
    saveStoredEvents(next);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFeedback(
      editingId
        ? "Evento actualizado. Ya se refleja en la página."
        : "Evento agregado. Ya se refleja en la página.",
    );
  };

  const startEdit = (ev: UlularEvent) => {
    setEditingId(ev.id);
    setForm({
      title: ev.title,
      date: ev.date,
      time: ev.time,
      venue: ev.venue,
      tag: ev.tag,
      flyerUrl: ev.flyerUrl ?? "",
      description: ev.description ?? "",
    });
    setFeedback(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: string) => {
    const next = events.filter((ev) => ev.id !== id);
    setEvents(next);
    saveStoredEvents(next);
    if (editingId === id) {
      setEditingId(null);
      setForm(EMPTY_FORM);
    }
    setFeedback("Evento eliminado.");
  };

  const handleResetDemo = () => {
    setEvents(DEFAULT_EVENTS);
    saveStoredEvents(DEFAULT_EVENTS);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFeedback("Se restauraron los eventos de ejemplo.");
  };

  const { upcoming, past } = splitEventsByDate(events);

  return (
    <div className="max-w-5xl">
      <div className="pb-6 border-b border-tolex flex items-center justify-between gap-4">
        <div>
          <p className="font-label-caps text-accent">Cartelera</p>
          <h1 className="font-display-title text-3xl sm:text-4xl mt-1">
            gestor de eventos.
          </h1>
        </div>
        <Link
          href="/#eventos"
          aria-label="Ver cartelera en el sitio"
          title="Ver en el sitio"
          className="inline-flex items-center justify-center w-10 h-10 border border-tolex text-bone hover:border-accent hover:text-accent transition-colors"
        >
          <StudioIcon name="external" className="w-4 h-4" />
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Formulario Crear / Editar (sin caja tarjeta, separado por línea vertical) */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-5 lg:border-r lg:border-tolex lg:pr-8 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display-title text-2xl">
              {editingId ? "editar evento." : "nuevo evento."}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(EMPTY_FORM);
                }}
                className="font-mono-specs text-xs text-ash underline cursor-pointer"
              >
                Cancelar
              </button>
            )}
          </div>

          <div>
            <label
              htmlFor="ev-title"
              className="block font-label-caps text-xs text-ash mb-1.5"
            >
              Título del evento *
            </label>
            <input
              id="ev-title"
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ej. noche de open mic & pizza"
              className="w-full min-h-[46px] px-3 bg-ink-2 border border-tolex text-bone text-base focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="ev-date"
                className="block font-label-caps text-xs text-ash mb-1.5"
              >
                Fecha *
              </label>
              <input
                id="ev-date"
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full min-h-[46px] px-3 bg-ink-2 border border-tolex text-bone font-mono-specs text-base"
              />
            </div>
            <div>
              <label
                htmlFor="ev-time"
                className="block font-label-caps text-xs text-ash mb-1.5"
              >
                Hora *
              </label>
              <input
                id="ev-time"
                type="time"
                required
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="w-full min-h-[46px] px-3 bg-ink-2 border border-tolex text-bone font-mono-specs text-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="ev-venue"
                className="block font-label-caps text-xs text-ash mb-1.5"
              >
                Lugar *
              </label>
              <input
                id="ev-venue"
                type="text"
                required
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
                placeholder="Ulular Napule Pizza"
                className="w-full min-h-[46px] px-3 bg-ink-2 border border-tolex text-bone text-base"
              />
            </div>
            <div>
              <label
                htmlFor="ev-tag"
                className="block font-label-caps text-xs text-ash mb-1.5"
              >
                Etiqueta *
              </label>
              <select
                id="ev-tag"
                value={form.tag}
                onChange={(e) => setForm({ ...form, tag: e.target.value })}
                className="w-full min-h-[46px] px-3 bg-ink-2 border border-tolex text-bone text-base"
              >
                {EVENT_TAGS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="ev-flyer"
              className="block font-label-caps text-xs text-ash mb-1.5"
            >
              Flyer (archivo o URL)
            </label>
            <input
              id="ev-flyer"
              type="file"
              accept="image/*"
              onChange={handleFlyerUpload}
              className="w-full text-xs text-ash file:mr-3 file:py-2 file:px-3 file:border file:border-tolex file:bg-ink-2 file:text-bone file:font-mono-specs file:cursor-pointer"
            />
            <input
              type="url"
              value={form.flyerUrl ?? ""}
              onChange={(e) => setForm({ ...form, flyerUrl: e.target.value })}
              placeholder="...o pega la URL del flyer"
              className="mt-2 w-full min-h-[42px] px-3 bg-ink-2 border border-tolex text-bone text-sm font-mono-specs"
            />
            {form.flyerUrl && (
              <div className="mt-2 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.flyerUrl}
                  alt="Vista previa de flyer"
                  className="w-16 h-20 object-cover border border-bone"
                />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, flyerUrl: "" })}
                  aria-label="Quitar flyer"
                  title="Quitar flyer"
                  className="inline-flex items-center justify-center w-9 h-9 border border-tolex text-ash hover:text-bone cursor-pointer"
                >
                  <StudioIcon name="trash" className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="ev-desc"
              className="block font-label-caps text-xs text-ash mb-1.5"
            >
              Descripción (opcional)
            </label>
            <textarea
              id="ev-desc"
              rows={3}
              value={form.description ?? ""}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Lineup de bandas, cover o entrada libre..."
              className="w-full p-3 bg-ink-2 border border-tolex text-bone text-base"
            />
          </div>

          {feedback && (
            <p className="font-mono-specs text-xs border-l-2 border-accent pl-3 py-1 text-bone">
              ✓ {feedback}
            </p>
          )}

          <Button type="submit" className="w-full">
            {editingId ? "Guardar cambios" : "Publicar evento"}
          </Button>
        </form>

        {/* Lista de eventos Próximos y Pasados en filas (sin tarjetas) */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-tolex">
              <h2 className="font-label-caps text-bone">
                Próximos eventos ({upcoming.length})
              </h2>
              <button
                type="button"
                onClick={handleResetDemo}
                className="font-mono-specs text-xs text-smoke hover:text-ash underline cursor-pointer"
              >
                Restaurar ejemplos
              </button>
            </div>
            <div className="divide-y divide-tolex border-b border-tolex">
              {upcoming.map((ev) => (
                <EventAdminRow
                  key={ev.id}
                  event={ev}
                  onEdit={() => startEdit(ev)}
                  onDelete={() => handleDelete(ev.id)}
                />
              ))}
              {upcoming.length === 0 && (
                <p className="text-sm text-smoke py-6">
                  No hay eventos próximos registrados.
                </p>
              )}
            </div>
          </div>

          <div>
            <h2 className="font-label-caps text-ash pb-3 border-b border-tolex">
              Eventos pasados ({past.length})
            </h2>
            <div className="divide-y divide-tolex border-b border-tolex">
              {past.map((ev) => (
                <EventAdminRow
                  key={ev.id}
                  event={ev}
                  onEdit={() => startEdit(ev)}
                  onDelete={() => handleDelete(ev.id)}
                />
              ))}
              {past.length === 0 && (
                <p className="text-sm text-smoke py-6">
                  No hay eventos pasados registrados.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EventAdminRow({
  event,
  onEdit,
  onDelete,
}: {
  event: UlularEvent;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const upcoming = isUpcomingEvent(event);
  return (
    <div className="py-4 flex items-center justify-between gap-4 hover:bg-ink-2/50 px-2 transition-colors">
      <div className="flex items-start gap-3.5 min-w-0">
        {event.flyerUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.flyerUrl}
            alt=""
            className="w-12 h-16 object-cover border border-tolex shrink-0"
          />
        )}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`font-mono-specs text-[0.65rem] px-1.5 py-0.5 border ${
                upcoming
                  ? "border-accent text-accent bg-accent-soft"
                  : "border-dashed border-smoke text-ash"
              }`}
            >
              {upcoming ? "Próximo" : "Pasado"}
            </span>
            <span className="font-label-caps text-[0.65rem] text-ash">
              {event.tag} · {event.venue}
            </span>
          </div>
          <p className="font-display-title text-xl text-bone mt-1 truncate">
            {event.title}
          </p>
          <p className="font-mono-specs text-xs text-ash">
            {formatEventDateLabel(event.date)} · {event.time} h
          </p>
        </div>
      </div>

      {/* Botones de acción solo con iconos */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Editar ${event.title}`}
          title="Editar evento"
          className="inline-flex items-center justify-center w-10 h-10 border border-tolex bg-ink-2 text-bone hover:border-accent hover:text-accent cursor-pointer transition-colors"
        >
          <StudioIcon name="edit" className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Eliminar ${event.title}`}
          title="Eliminar evento"
          className="inline-flex items-center justify-center w-10 h-10 border border-tolex bg-ink-2 text-ash hover:border-bone hover:text-bone cursor-pointer transition-colors"
        >
          <StudioIcon name="trash" className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
