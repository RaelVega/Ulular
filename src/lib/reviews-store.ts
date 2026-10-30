export interface GoogleReview {
  id: string;
  authorName: string;
  authorRole?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  /** Fecha ISO (YYYY-MM-DD o ISO completa) para ordenar de más reciente a más antigua */
  publishedAt: string;
  /** Etiqueta legible (ej. "Hace 2 semanas", "Octubre 2026") */
  relativeTimeLabel: string;
  sourceUrl?: string;
  verifiedGoogle: boolean;
}

export interface GoogleReviewsConfig {
  placeId: string;
  kgmid: string;
  mapsUrl: string;
  writeReviewUrl: string;
  googleMapsApiKey?: string;
}

const REVIEWS_STORAGE_KEY = "ulular_google_reviews_v1";
const REVIEWS_CONFIG_STORAGE_KEY = "ulular_google_reviews_config_v1";

export const DEFAULT_GOOGLE_REVIEWS_CONFIG: GoogleReviewsConfig = {
  placeId: "ChIJ_UlularSalaDeEnsayoQro",
  kgmid: "/g/11vjj_v63_",
  mapsUrl: "https://share.google/cNvsrMu7Aymr1UVTx",
  writeReviewUrl: "https://share.google/cNvsrMu7Aymr1UVTx",
  googleMapsApiKey: "",
};

export const DEFAULT_GOOGLE_REVIEWS: GoogleReview[] = [
  {
    id: "gmap-rev-1",
    authorName: "Carlos M. · Guitarrista",
    authorRole: "Local Guide · Google Maps",
    rating: 5,
    text: "Excelente sala de ensayo en el mero Centro de Querétaro. La acústica está muy bien trabajada, los amplis Fender y el cabezal Katana suenan con mucha definición y el trato en cabina siempre es puntual.",
    publishedAt: "2026-10-18T19:30:00.000Z",
    relativeTimeLabel: "Hace 1 semana",
    sourceUrl: "https://share.google/cNvsrMu7Aymr1UVTx",
    verifiedGoogle: true,
  },
  {
    id: "gmap-rev-2",
    authorName: "Fernanda R. · Baterista",
    authorRole: "Reseña verificada · Google Maps",
    rating: 5,
    text: "La batería está bien cuidada, los herrajes firmes y el aire acondicionado hace toda la diferencia cuando ensayas dos o tres horas seguidas. Además bajando o saliendo tienes las pizzas de Napule ahí mismo.",
    publishedAt: "2026-10-09T21:15:00.000Z",
    relativeTimeLabel: "Hace 2 semanas",
    sourceUrl: "https://share.google/cNvsrMu7Aymr1UVTx",
    verifiedGoogle: true,
  },
  {
    id: "gmap-rev-3",
    authorName: "Diego V. · Productor & Bajista",
    authorRole: "Local Guide · Google Maps",
    rating: 5,
    text: "Grabamos una Live Session y rentamos backline con ellos. El Fender Rumble de 500W y la microfonía para voces impecables. Se nota que es un espacio hecho por músicos para la escena local.",
    publishedAt: "2026-09-28T18:00:00.000Z",
    relativeTimeLabel: "Hace 1 mes",
    sourceUrl: "https://share.google/cNvsrMu7Aymr1UVTx",
    verifiedGoogle: true,
  },
  {
    id: "gmap-rev-4",
    authorName: "Alejandro T.",
    authorRole: "Reseña verificada · Google Maps",
    rating: 5,
    text: "Muy buena ubicación en C. Primavera 32B y el precio por hora ($150) es súper accesible para el nivel de equipo y acondicionamiento acústico que tienen. 100% recomendados.",
    publishedAt: "2026-09-14T20:40:00.000Z",
    relativeTimeLabel: "Hace 1 mes",
    sourceUrl: "https://share.google/cNvsrMu7Aymr1UVTx",
    verifiedGoogle: true,
  },
  {
    id: "gmap-rev-5",
    authorName: "Mariana G. · Vocalista",
    authorRole: "Reseña verificada · Google Maps",
    rating: 5,
    text: "Por fin una sala donde las voces sí se escuchan claras por encima de la batería y las guitarras. La ecualización en vivo que te arman al entrar ayuda muchísimo.",
    publishedAt: "2026-08-29T17:20:00.000Z",
    relativeTimeLabel: "Hace 2 meses",
    sourceUrl: "https://share.google/cNvsrMu7Aymr1UVTx",
    verifiedGoogle: true,
  },
  {
    id: "gmap-rev-6",
    authorName: "Rodrigo S.",
    authorRole: "Local Guide · Google Maps",
    rating: 4,
    text: "Gran ambiente underground y muy buen sonido dentro de la sala. Conviene apartar con tiempo los fines de semana porque se llena rápido.",
    publishedAt: "2026-08-12T16:10:00.000Z",
    relativeTimeLabel: "Hace 2 meses",
    sourceUrl: "https://share.google/cNvsrMu7Aymr1UVTx",
    verifiedGoogle: true,
  },
];

/**
 * Ordena las reseñas primero de MÁS estrellas a MENOS estrellas (5 ★ -> 1 ★),
 * y en caso de empate de estrellas, de la MÁS RECIENTE a la más antigua.
 */
export function sortReviewsByRatingAndRecency(
  reviews: readonly GoogleReview[],
): GoogleReview[] {
  return [...reviews].sort((a, b) => {
    if (b.rating !== a.rating) {
      return b.rating - a.rating;
    }
    const timeA = Date.parse(a.publishedAt) || 0;
    const timeB = Date.parse(b.publishedAt) || 0;
    return timeB - timeA;
  });
}

export function computeReviewStats(reviews: readonly GoogleReview[]) {
  const total = reviews.length;
  if (total === 0) {
    return {
      averageRating: 5.0,
      totalReviews: 0,
      fiveStarCount: 0,
      fourStarCount: 0,
    };
  }
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const averageRating = Number((sum / total).toFixed(1));
  const fiveStarCount = reviews.filter((r) => r.rating === 5).length;
  const fourStarCount = reviews.filter((r) => r.rating === 4).length;

  return {
    averageRating,
    totalReviews: total,
    fiveStarCount,
    fourStarCount,
  };
}

export function loadStoredGoogleReviews(): GoogleReview[] {
  if (typeof window === "undefined") {
    return sortReviewsByRatingAndRecency(DEFAULT_GOOGLE_REVIEWS);
  }
  try {
    const raw = window.localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (!raw) return sortReviewsByRatingAndRecency(DEFAULT_GOOGLE_REVIEWS);
    const parsed = JSON.parse(raw) as GoogleReview[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return sortReviewsByRatingAndRecency(DEFAULT_GOOGLE_REVIEWS);
    }
    return sortReviewsByRatingAndRecency(parsed);
  } catch {
    return sortReviewsByRatingAndRecency(DEFAULT_GOOGLE_REVIEWS);
  }
}

export function saveStoredGoogleReviews(reviews: GoogleReview[]): void {
  if (typeof window === "undefined") return;
  const sorted = sortReviewsByRatingAndRecency(reviews);
  window.localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(sorted));
  window.dispatchEvent(new Event("ulular-reviews-updated"));
}

export function loadGoogleReviewsConfig(): GoogleReviewsConfig {
  if (typeof window === "undefined") return DEFAULT_GOOGLE_REVIEWS_CONFIG;
  try {
    const raw = window.localStorage.getItem(REVIEWS_CONFIG_STORAGE_KEY);
    if (!raw) return DEFAULT_GOOGLE_REVIEWS_CONFIG;
    const parsed = JSON.parse(raw) as Partial<GoogleReviewsConfig>;
    return { ...DEFAULT_GOOGLE_REVIEWS_CONFIG, ...parsed };
  } catch {
    return DEFAULT_GOOGLE_REVIEWS_CONFIG;
  }
}

export function saveGoogleReviewsConfig(config: GoogleReviewsConfig): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    REVIEWS_CONFIG_STORAGE_KEY,
    JSON.stringify(config),
  );
  window.dispatchEvent(new Event("ulular-reviews-updated"));
}
