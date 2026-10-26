import { BrandIcon } from "@/components/ui/BrandIcon";
import { SOCIAL_LINKS } from "@/lib/constants";
import { buildServiceInquiryWhatsAppUrl } from "@/lib/whatsapp";

const LIVE_SESSIONS_VIDEOS = [
  {
    id: "87sWyyuB8fw",
    badge: "LIVE SESSION · EN VIVO",
    title: "Ulular Live Session · Sesión 01",
    url: "https://www.youtube.com/watch?v=87sWyyuB8fw",
  },
  {
    id: "JVPRdcJB9mo",
    badge: "LIVE SESSION · EN VIVO",
    title: "Ulular Live Session · Sesión 02",
    url: "https://www.youtube.com/watch?v=JVPRdcJB9mo",
  },
  {
    id: "mkYttwq1IAE",
    badge: "LIVE SESSION · 360° / EN VIVO",
    title: "Ulular Live Session · Sesión 03",
    url: "https://www.youtube.com/watch?v=mkYttwq1IAE",
  },
  {
    id: "WPjuI8pE770",
    badge: "LIVE SESSION · 360° / EN VIVO",
    title: "Ulular Live Session · Sesión 04",
    url: "https://www.youtube.com/watch?v=WPjuI8pE770",
  },
] as const;

export function LiveSessionsGallery() {
  return (
    <div id="live-sessions" className="mt-16 border-t border-tolex pt-12">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2">
            <span
              aria-hidden="true"
              style={{ borderRadius: "9999px" }}
              className="w-2 h-2 rounded-full bg-accent"
            />
            <p className="font-label-caps text-ash">
              Producción audiovisual · Formato tradicional y 360°
            </p>
          </div>
          <h3 className="font-display-title text-[clamp(2rem,5vw,3.5rem)] mt-2 text-bone">
            ulular <span className="text-accent">live sessions</span> &amp; 360°.
          </h3>
          <p className="mt-2 max-w-[66ch] text-sm text-ash">
            Producimos sesiones en vivo para bandas desde nuestra sala, incluyendo
            formato <strong className="text-bone font-medium">Live Session 360° interactivo</strong> y
            multicámara con captura de audio por canal. Reproduce aquí algunas de
            las sesiones grabadas en Ulular.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <a
            href={buildServiceInquiryWhatsAppUrl(
              "Ulular Live Sessions (tradicional o 360°)",
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 border border-accent bg-accent-soft px-4 py-3 font-mono-specs text-xs uppercase tracking-[0.12em] text-bone hover:bg-accent hover:text-white transition-colors"
          >
            <BrandIcon network="whatsapp" className="w-4 h-4" />
            <span>Cotizar Live Session / 360°</span>
          </a>
          <a
            href={SOCIAL_LINKS.youtube}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Canal de YouTube de Ulular"
            title="Ver más en YouTube"
            className="inline-flex items-center justify-center w-11 h-11 border border-tolex bg-ink-2 hover:border-accent hover:scale-105 transition-all"
          >
            <BrandIcon network="youtube" className="w-5 h-5" />
          </a>
        </div>
      </div>

      {/* Monitores de reproducción directa 2x2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 border-t border-l border-tolex">
        {LIVE_SESSIONS_VIDEOS.map((video) => (
          <div
            key={video.id}
            className="border-r border-b border-tolex bg-ink-2/40 p-4 sm:p-6 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2 font-mono-specs text-[11px] uppercase tracking-[0.14em] text-accent">
                <span className="h-1.5 w-1.5 bg-accent" aria-hidden="true" />
                {video.badge}
              </span>
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono-specs text-[11px] text-ash hover:text-accent transition-colors"
              >
                YouTube ↗
              </a>
            </div>

            <div className="relative aspect-video w-full overflow-hidden border border-tolex bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${video.id}?rel=0&modestbranding=1`}
                title={video.title}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="h-full w-full border-0"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
