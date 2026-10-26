"use client";

import { useState } from "react";
import {
  BACKLINE_CATEGORIES,
  BACKLINE_GENERAL_TAGS,
  BACKLINE_ITEMS,
  type BacklineCategory,
  type BacklineItem,
} from "@/lib/backline-catalog";
import { WHATSAPP_NUMBER } from "@/lib/constants";

export function BacklineCatalog() {
  const [activeCategory, setActiveCategory] = useState<BacklineCategory>("todos");
  const [photoMode, setPhotoMode] = useState<"clean" | "framed">("clean");
  const [selectedItem, setSelectedItem] = useState<BacklineItem | null>(null);

  const filteredItems =
    activeCategory === "todos"
      ? BACKLINE_ITEMS
      : BACKLINE_ITEMS.filter((item) => item.category === activeCategory);

  return (
    <div id="backline" className="mt-16 border-t border-tolex pt-12">
      {/* Encabezado del catálogo + Selector Sin Marco / Con Marco */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2">
            <span
              aria-hidden="true"
              style={{ borderRadius: "9999px" }}
              className="h-2 w-2 rounded-full bg-accent"
            />
            <p className="font-label-caps text-ash">
              Catálogo oficial Backline Ulular · 21 equipos
            </p>
          </div>
          <h3 className="font-display-title text-[clamp(2rem,5vw,3.5rem)] mt-2 text-bone">
            catálogo de <span className="text-accent">backline.</span>
          </h3>
          <p className="mt-2 max-w-[64ch] text-sm text-ash">
            Sonorizamos por completo eventos en vivo. Puedes rentar equipo
            individual, paquetes de backline o producción técnica completa en
            Querétaro.
          </p>
        </div>

        {/* Selector interactivo para comparar versión Sin Marco vs Con Marco */}
        <div className="flex flex-col gap-1.5 self-start lg:self-auto shrink-0">
          <span className="font-mono-specs text-[10px] tracking-[0.16em] uppercase text-ash">
            Vista de fotografías (comparador para elegir)
          </span>
          <div
            role="group"
            aria-label="Modo de visualización de fotos de backline"
            className="inline-flex border border-tolex bg-ink-2 p-1"
          >
            <button
              type="button"
              onClick={() => setPhotoMode("clean")}
              className={`px-3.5 py-2 font-mono-specs text-xs tracking-[0.12em] uppercase cursor-pointer transition-colors ${
                photoMode === "clean"
                  ? "bg-accent text-white font-semibold"
                  : "text-ash hover:text-bone"
              }`}
            >
              Sin marco (original)
            </button>
            <button
              type="button"
              onClick={() => setPhotoMode("framed")}
              className={`px-3.5 py-2 font-mono-specs text-xs tracking-[0.12em] uppercase cursor-pointer transition-colors ${
                photoMode === "framed"
                  ? "bg-accent text-white font-semibold"
                  : "text-ash hover:text-bone"
              }`}
            >
              Con marco
            </button>
          </div>
        </div>
      </div>

      {/* Etiquetas de alcance general del catálogo */}
      <div className="mt-6 flex flex-wrap gap-1.5 border-y border-tolex py-4">
        {BACKLINE_GENERAL_TAGS.map((tag) => (
          <span
            key={tag}
            className="border border-tolex bg-ink-2 px-2.5 py-1 font-mono-specs text-[11px] tracking-[0.06em] text-ash"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Filtros por categoría */}
      <div
        className="mt-6 flex flex-wrap gap-1.5"
        role="tablist"
        aria-label="Categorías de backline"
      >
        {BACKLINE_CATEGORIES.map((cat) => {
          const active = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-2 font-mono-specs text-xs tracking-[0.1em] uppercase cursor-pointer transition-colors border ${
                active
                  ? "border-accent bg-accent-soft text-bone font-semibold"
                  : "border-tolex bg-ink-2/50 text-ash hover:border-smoke hover:text-bone"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Matriz arquitectónica con líneas divisorias (sin tarjetas genéricas) */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-tolex">
        {filteredItems.map((item) => {
          const imgSrc =
            photoMode === "clean" ? item.cleanImage : item.framedImage;
          const waText = encodeURIComponent(
            `Hola Ulular, me interesa cotizar en renta de backline: ${item.name} (${item.subtitle}).`,
          );

          return (
            <article
              key={item.id}
              className="group flex flex-col justify-between border-r border-b border-tolex bg-ink-2/30 p-5 sm:p-6 transition-colors hover:bg-ink-2"
            >
              <div>
                {/* Cabecera técnica del ítem */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono-specs text-[11px] tracking-[0.14em] uppercase text-accent">
                    {item.categoryLabel}
                  </span>
                  <span className="font-mono-specs text-[10px] text-smoke uppercase">
                    {photoMode === "clean" ? "Sin marco" : "Con marco"}
                  </span>
                </div>

                <h4 className="mt-1.5 font-display-title text-2xl text-bone leading-tight">
                  {item.name.toLowerCase()}
                </h4>
                <p className="mt-1 font-mono-specs text-xs text-ash">
                  {item.subtitle}
                </p>

                {/* Fotografía del equipo */}
                <button
                  type="button"
                  onClick={() => setSelectedItem(item)}
                  aria-label={`Ampliar fotografía de ${item.name}`}
                  className="relative mt-4 block w-full overflow-hidden border border-tolex bg-ink cursor-pointer"
                >
                  <div
                    className={`relative w-full overflow-hidden ${
                      photoMode === "framed"
                        ? "aspect-[4/4.2] bg-ink p-2"
                        : item.aspect === "tall"
                        ? "aspect-[4/4.5]"
                        : "aspect-[4/3.2]"
                    }`}
                  >
                    <img
                      src={imgSrc}
                      alt={item.name}
                      loading="lazy"
                      className={`h-full w-full transition-transform duration-500 group-hover:scale-[1.03] ${
                        photoMode === "framed" || item.aspect === "tall"
                          ? "object-contain bg-black/40"
                          : "object-cover"
                      }`}
                    />
                  </div>
                  <span className="absolute bottom-2 right-2 bg-ink/90 border border-tolex px-2 py-1 font-mono-specs text-[10px] tracking-[0.12em] uppercase text-bone group-hover:border-accent group-hover:text-accent transition-colors">
                    Ampliar +
                  </span>
                </button>

                {/* Lista de especificaciones técnicas */}
                <ul className="mt-4 space-y-1.5 border-t border-tolex pt-3.5 text-xs text-ash">
                  {item.specs.map((spec) => (
                    <li key={spec} className="flex items-start gap-2">
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-accent"
                        aria-hidden="true"
                      />
                      <span className="text-bone/90">{spec}</span>
                    </li>
                  ))}
                </ul>

                {item.note ? (
                  <p className="mt-2.5 font-mono-specs text-[11px] text-ash italic">
                    {item.note}
                  </p>
                ) : null}
              </div>

              {/* Acción directa por equipo */}
              <div className="mt-5 pt-3 border-t border-tolex flex items-center justify-between gap-3">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-between px-3.5 py-2.5 border border-tolex bg-ink font-mono-specs text-xs tracking-[0.12em] uppercase text-bone hover:border-accent hover:text-accent transition-colors"
                >
                  <span>Cotizar este equipo</span>
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
            </article>
          );
        })}
      </div>

      {/* Modal de vista ampliada para comparar sin marco / con marco */}
      {selectedItem ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selectedItem.name}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto border border-tolex bg-ink-2 p-5 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-tolex pb-4">
              <div>
                <p className="font-mono-specs text-xs uppercase tracking-[0.15em] text-accent">
                  {selectedItem.categoryLabel}
                </p>
                <h4 className="font-display-title text-2xl sm:text-3xl text-bone mt-0.5">
                  {selectedItem.name.toLowerCase()}
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setPhotoMode((prev) =>
                      prev === "clean" ? "framed" : "clean",
                    )
                  }
                  className="border border-accent px-3 py-1.5 font-mono-specs text-xs uppercase tracking-[0.12em] text-accent hover:bg-accent hover:text-white cursor-pointer transition-colors"
                >
                  Ver {photoMode === "clean" ? "Con marco" : "Sin marco"}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="border border-tolex bg-ink px-3 py-1.5 font-mono-specs text-xs uppercase tracking-[0.12em] text-bone hover:border-accent cursor-pointer"
                >
                  Cerrar ✕
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-7 bg-black/70 border border-tolex p-2 flex items-center justify-center">
                <img
                  src={
                    photoMode === "clean"
                      ? selectedItem.cleanImage
                      : selectedItem.framedImage
                  }
                  alt={selectedItem.name}
                  className="max-h-[62vh] w-auto object-contain"
                />
              </div>
              <div className="md:col-span-5 flex flex-col justify-between gap-4">
                <div>
                  <p className="font-mono-specs text-xs uppercase tracking-[0.14em] text-ash">
                    Especificaciones técnicas
                  </p>
                  <p className="mt-1 font-mono-specs text-sm text-accent">
                    {selectedItem.subtitle}
                  </p>
                  <ul className="mt-4 space-y-2 border-t border-tolex pt-4 text-sm text-bone">
                    {selectedItem.specs.map((spec) => (
                      <li key={spec} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-accent" />
                        <span>{spec}</span>
                      </li>
                    ))}
                  </ul>
                  {selectedItem.note ? (
                    <p className="mt-3 font-mono-specs text-xs text-ash italic">
                      {selectedItem.note}
                    </p>
                  ) : null}
                </div>

                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                    `Hola Ulular, me interesa cotizar en renta de backline: ${selectedItem.name} (${selectedItem.subtitle}).`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 bg-accent px-4 py-3 font-mono-specs text-xs font-semibold uppercase tracking-[0.14em] text-white hover:opacity-90 transition-opacity"
                >
                  Cotizar por WhatsApp ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
