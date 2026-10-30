"use client";

import { useEffect, useMemo, useState } from "react";
import { BrandIcon } from "@/components/ui/BrandIcon";
import {
  computeReviewStats,
  DEFAULT_GOOGLE_REVIEWS,
  DEFAULT_GOOGLE_REVIEWS_CONFIG,
  loadGoogleReviewsConfig,
  loadStoredGoogleReviews,
  sortReviewsByRatingAndRecency,
  type GoogleReview,
  type GoogleReviewsConfig,
} from "@/lib/reviews-store";

export function GoogleReviewsSection() {
  const [reviews, setReviews] = useState<GoogleReview[]>(() =>
    sortReviewsByRatingAndRecency(DEFAULT_GOOGLE_REVIEWS),
  );
  const [config, setConfig] = useState<GoogleReviewsConfig>(
    DEFAULT_GOOGLE_REVIEWS_CONFIG,
  );
  const [filterFiveStarsOnly, setFilterFiveStarsOnly] = useState(false);
  const [syncMode, setSyncMode] = useState<"curated" | "live">("curated");

  useEffect(() => {
    const syncLocal = () => {
      const localRevs = loadStoredGoogleReviews();
      const localCfg = loadGoogleReviewsConfig();
      setReviews(localRevs);
      setConfig(localCfg);

      // Si hay API Key configurada (en env o en Ajustes), sincronizar en vivo con Google Places API
      const params = new URLSearchParams();
      if (localCfg.googleMapsApiKey) {
        params.set("apiKey", localCfg.googleMapsApiKey);
      }
      if (localCfg.placeId) {
        params.set("placeId", localCfg.placeId);
      }

      fetch(`/api/reviews/google?${params.toString()}`)
        .then((r) => r.json())
        .then((data) => {
          if (
            data?.mode === "google_places_live" &&
            Array.isArray(data.reviews) &&
            data.reviews.length > 0
          ) {
            setSyncMode("live");
            const combined = [...(data.reviews as GoogleReview[]), ...localRevs];
            const seen = new Set<string>();
            const deduped = combined.filter((item) => {
              const key = `${item.authorName.toLowerCase()}-${item.text.slice(0, 32).toLowerCase()}`;
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });
            setReviews(sortReviewsByRatingAndRecency(deduped));
          }
        })
        .catch(() => {});
    };

    syncLocal();
    window.addEventListener("ulular-reviews-updated", syncLocal);
    window.addEventListener("storage", syncLocal);
    return () => {
      window.removeEventListener("ulular-reviews-updated", syncLocal);
      window.removeEventListener("storage", syncLocal);
    };
  }, []);

  const sortedReviews = useMemo(() => {
    const base = sortReviewsByRatingAndRecency(reviews);
    return filterFiveStarsOnly ? base.filter((r) => r.rating === 5) : base;
  }, [reviews, filterFiveStarsOnly]);

  const stats = useMemo(() => computeReviewStats(reviews), [reviews]);

  return (
    <section
      id="resenas"
      className="relative overflow-hidden px-5 sm:px-8 lg:px-16 py-20 sm:py-28 border-t border-tolex"
    >
      <div className="max-w-7xl mx-auto">
        {/* Encabezado arquitectónico */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-10">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2">
              <span
                aria-hidden="true"
                style={{ borderRadius: "9999px" }}
                className="w-2 h-2 rounded-full bg-accent"
              />
              <p className="font-label-caps text-ash">
                Google Maps · Opiniones Verificadas de la Escena
              </p>
            </div>
            <h2 className="font-display-title text-[clamp(2.5rem,6.5vw,4.5rem)] mt-2">
              lo que dicen las <span className="text-accent">bandas.</span>
            </h2>
          </div>

          <div className="lg:col-span-5 border-l-2 border-accent pl-5 flex flex-col justify-between gap-3">
            <p className="text-sm sm:text-base text-ash">
              Reseñas de músicos, productores y proyectos que ensayan y graban
              en Ulular Sala de Ensayo, ordenadas automáticamente de mayor
              calificación a menor y de más reciente a más antigua.
            </p>
            <div className="flex flex-wrap items-center gap-2 font-mono-specs text-[0.68rem] text-bone">
              <span className="px-2 py-0.5 border border-accent text-accent uppercase">
                ★ Más estrellas → Más recientes
              </span>
              <span className="px-2 py-0.5 border border-tolex text-ash">
                {syncMode === "live"
                  ? "Google Places API · En vivo"
                  : `Ficha Google Maps ${config.kgmid}`}
              </span>
            </div>
          </div>
        </div>

        {/* Barra de resumen de calificación + Acciones directas a Google Maps */}
        <div className="border border-tolex bg-ink-2 p-5 sm:p-7 mb-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-5 flex items-center gap-5">
            <div className="w-16 h-16 border border-tolex bg-ink flex flex-col items-center justify-center shrink-0">
              <BrandIcon network="maps" className="w-7 h-7" />
              <span className="font-mono-specs text-[9px] text-ash uppercase mt-1">
                MAPS
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-2.5">
                <span className="font-display-title text-4xl sm:text-5xl text-bone">
                  {stats.averageRating.toFixed(1)}
                </span>
                <div
                  className="flex items-center gap-1 text-accent"
                  aria-label={`${stats.averageRating} de 5 estrellas`}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-lg leading-none">
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <p className="font-mono-specs text-xs text-ash mt-1">
                Basado en {stats.totalReviews} reseñas destacadas ·{" "}
                {stats.fiveStarCount} con 5 ★
              </p>
            </div>
          </div>

          {/* Filtros y botones a Google Maps */}
          <div className="lg:col-span-7 flex flex-wrap items-center lg:justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setFilterFiveStarsOnly(false)}
              className={`px-3.5 py-2.5 border font-mono-specs text-xs uppercase tracking-[0.12em] cursor-pointer transition-colors ${
                !filterFiveStarsOnly
                  ? "border-accent bg-accent text-white font-bold"
                  : "border-tolex bg-ink text-ash hover:text-bone"
              }`}
            >
              Todas ({reviews.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterFiveStarsOnly(true)}
              className={`px-3.5 py-2.5 border font-mono-specs text-xs uppercase tracking-[0.12em] cursor-pointer transition-colors ${
                filterFiveStarsOnly
                  ? "border-accent bg-accent text-white font-bold"
                  : "border-tolex bg-ink text-ash hover:text-bone"
              }`}
            >
              Solo 5 ★ ({stats.fiveStarCount})
            </button>

            <a
              href={config.writeReviewUrl || config.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-accent bg-ink text-bone hover:bg-accent hover:text-white font-label-caps text-xs transition-colors"
            >
              <BrandIcon network="maps" className="w-4 h-4" />
              <span>Dejar reseña en Google Maps ↗</span>
            </a>
          </div>
        </div>

        {/* Retícula arquitectónica de reseñas (ordenadas por estrellas desc y fecha desc) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-tolex">
          {sortedReviews.map((review, index) => {
            const initials = review.authorName
              .split(" ")
              .slice(0, 2)
              .map((w) => w[0]?.toUpperCase() ?? "")
              .join("");

            return (
              <article
                key={review.id}
                className="border-r border-b border-tolex bg-ink-2/60 hover:bg-ink-2 p-6 flex flex-col justify-between gap-5 transition-colors"
              >
                <div>
                  {/* Cabecera de la reseña: Estrellas + Fecha relativa */}
                  <div className="flex items-center justify-between gap-2 pb-4 border-b border-tolex/70">
                    <div
                      className="flex items-center gap-1"
                      aria-label={`Calificación: ${review.rating} de 5 estrellas`}
                    >
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span
                          key={s}
                          className={`text-sm leading-none ${
                            s <= review.rating ? "text-accent" : "text-tolex"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                      <span className="font-mono-specs text-xs text-bone ml-1.5 font-bold">
                        {review.rating}.0
                      </span>
                    </div>

                    <span className="font-mono-specs text-[0.68rem] text-ash">
                      {review.relativeTimeLabel}
                    </span>
                  </div>

                  {/* Comentario */}
                  <p className="text-sm text-bone leading-relaxed mt-4">
                    “{review.text}”
                  </p>
                </div>

                {/* Pie de autor + enlace a Google Maps */}
                <div className="pt-4 border-t border-tolex/60 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 border border-accent/60 bg-ink flex items-center justify-center font-mono-specs text-xs font-bold text-accent shrink-0">
                      {initials || "UL"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-label-caps text-xs text-bone truncate">
                        {review.authorName}
                      </p>
                      <p className="font-mono-specs text-[0.65rem] text-ash truncate">
                        {review.authorRole || "Google Maps"}
                      </p>
                    </div>
                  </div>

                  <a
                    href={review.sourceUrl || config.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Ver reseña #${index + 1} en Google Maps`}
                    title="Ver en Google Maps"
                    className="inline-flex items-center gap-1 font-mono-specs text-[0.65rem] text-ash hover:text-accent shrink-0"
                  >
                    <BrandIcon network="maps" className="w-3.5 h-3.5" />
                    <span>↗</span>
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
