"use client";

import { useState } from "react";
import { BrandIcon } from "@/components/ui/BrandIcon";

const YOUTUBE_360_ID = "4qX6-GEswH8";
const YOUTUBE_360_URL = `https://www.youtube.com/watch?v=${YOUTUBE_360_ID}`;

export function Room360Viewer() {
  const [showEmbed, setShowEmbed] = useState(true);

  return (
    <div className="mt-8 border border-tolex bg-ink-2 p-5 sm:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-tolex mb-5">
        <div>
          <div className="inline-flex items-center gap-2">
            <span className="h-2 w-2 bg-accent" aria-hidden="true" />
            <span className="font-mono-specs text-xs uppercase tracking-[0.16em] text-accent">
              Recorrido Virtual 360° Interactivo
            </span>
          </div>
          <h3 className="font-display-title text-2xl sm:text-3xl text-bone mt-1">
            explora la sala en <span className="text-accent">360°.</span>
          </h3>
          <p className="font-mono-specs text-xs text-ash mt-1.5 max-w-xl">
            En computadora puedes arrastrar con el cursor dentro del video. En
            celular o tablet, abre el recorrido directo en la app de YouTube
            para girar la cámara 360° con el giroscopio o el dedo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <a
            href={YOUTUBE_360_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-accent text-white border border-accent font-label-caps text-xs shadow-[0_0_20px_var(--theme-accent-soft)] hover:brightness-110 transition-all"
          >
            <BrandIcon network="youtube" className="w-4 h-4" />
            <span>Abrir en 360° Interactivo (YouTube) ↗</span>
          </a>
          <button
            type="button"
            onClick={() => setShowEmbed((prev) => !prev)}
            className="px-3 py-2.5 border border-tolex bg-ink text-ash hover:text-bone hover:border-accent font-mono-specs text-[0.68rem] uppercase tracking-[0.12em] cursor-pointer transition-colors"
          >
            {showEmbed ? "Ocultar video fijo" : "Mostrar video aquí"}
          </button>
        </div>
      </div>

      {showEmbed ? (
        <div className="relative aspect-video w-full overflow-hidden border border-tolex bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${YOUTUBE_360_ID}?rel=0&modestbranding=1&playsinline=1&enablejsapi=1`}
            title="Recorrido virtual 360° de Ulular Sala de Ensayo"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; xr-spatial-tracking"
            allowFullScreen
            className="h-full w-full border-0"
          />
        </div>
      ) : (
        <a
          href={YOUTUBE_360_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block aspect-video sm:aspect-[21/9] w-full overflow-hidden border border-tolex bg-black"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://i.ytimg.com/vi/${YOUTUBE_360_ID}/maxresdefault.jpg`}
            alt="Vista previa del recorrido 360° de Ulular Sala de Ensayo"
            className="h-full w-full object-cover opacity-65 group-hover:scale-105 group-hover:opacity-80 transition-all duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col items-center justify-center p-6 text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 border border-accent bg-black/80 font-mono-specs text-xs text-accent uppercase tracking-[0.16em] mb-3">
              ● Giroscopio + Vista Esférica 360°
            </span>
            <span className="font-display-title text-2xl sm:text-4xl text-white">
              toca para recorrer la sala en 360°
            </span>
            <span className="font-mono-specs text-xs text-bone mt-2 underline decoration-accent underline-offset-4">
              Abrir directamente en YouTube 360° ↗
            </span>
          </div>
        </a>
      )}
    </div>
  );
}
