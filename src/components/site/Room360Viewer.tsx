import { BrandIcon } from "@/components/ui/BrandIcon";

const YOUTUBE_360_ID = "4qX6-GEswH8";
const YOUTUBE_360_URL = `https://www.youtube.com/watch?v=${YOUTUBE_360_ID}`;

export function Room360Viewer() {
  return (
    <div className="mt-8 border border-tolex bg-ink-2 p-5 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-tolex mb-5">
        <div>
          <div className="inline-flex items-center gap-2">
            <span className="h-2 w-2 bg-accent" aria-hidden="true" />
            <span className="font-mono-specs text-xs uppercase tracking-[0.16em] text-accent">
              Vista Panorámica · Recorrido Virtual 360°
            </span>
          </div>
          <h3 className="font-display-title text-2xl sm:text-3xl text-bone mt-1">
            explora la sala en <span className="text-accent">360°.</span>
          </h3>
        </div>
        <p className="font-mono-specs text-xs text-ash max-w-md">
          Conoce el espacio, acondicionamiento acústico y distribución de backline.
          Abre el recorrido en YouTube para girar la cámara en 360°.
        </p>
      </div>

      {/* Imagen de alta definición de la sala de ensayo */}
      <a
        href={YOUTUBE_360_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Ver recorrido virtual 360° de Ulular Sala de Ensayo en YouTube"
        className="group relative block aspect-video w-full overflow-hidden border border-tolex bg-black"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/sala-360-hd.jpg"
          alt="Vista panorámica interior de Ulular Sala de Ensayo equipada con batería, amplificadores, iluminación y paneles acústicos"
          className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20" />
        <div className="pointer-events-none absolute top-3 right-3 sm:top-4 sm:right-4 inline-flex items-center gap-2 px-3 py-1.5 border border-accent/80 bg-black/80 backdrop-blur-xs font-mono-specs text-[0.68rem] text-bone uppercase tracking-[0.14em]">
          <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
          <span>Recorrido 360°</span>
        </div>
      </a>

      {/* Botón debajo de la imagen para ver el recorrido interactivo en YouTube */}
      <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-tolex/70">
        <p className="font-mono-specs text-xs text-ash">
          Gira tu celular con el giroscopio o desliza con el dedo/cursor directamente en YouTube.
        </p>
        <a
          href={YOUTUBE_360_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-accent text-white border-2 border-accent font-label-caps text-xs tracking-[0.14em] uppercase font-bold shadow-[0_0_24px_var(--theme-accent-soft)] hover:brightness-110 transition-all shrink-0"
        >
          <BrandIcon network="youtube" className="w-5 h-5" />
          <span>Ver recorrido 360° en YouTube ↗</span>
        </a>
      </div>
    </div>
  );
}
