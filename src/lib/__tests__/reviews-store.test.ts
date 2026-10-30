import { describe, expect, it } from "vitest";
import {
  computeReviewStats,
  DEFAULT_GOOGLE_REVIEWS,
  sortReviewsByRatingAndRecency,
  type GoogleReview,
} from "../reviews-store";

describe("reviews-store", () => {
  it("ordena las reseñas primero de más estrellas a menos y luego de más reciente a más antigua", () => {
    const sample: GoogleReview[] = [
      {
        id: "r1",
        authorName: "Autor A",
        rating: 4,
        text: "Buena sala",
        publishedAt: "2026-10-20T12:00:00.000Z",
        relativeTimeLabel: "Hace 5 días",
        verifiedGoogle: true,
      },
      {
        id: "r2",
        authorName: "Autor B",
        rating: 5,
        text: "Excelente",
        publishedAt: "2026-09-01T12:00:00.000Z",
        relativeTimeLabel: "Hace 1 mes",
        verifiedGoogle: true,
      },
      {
        id: "r3",
        authorName: "Autor C",
        rating: 5,
        text: "Increíble sonido",
        publishedAt: "2026-10-25T12:00:00.000Z",
        relativeTimeLabel: "Hace 2 días",
        verifiedGoogle: true,
      },
    ];

    const sorted = sortReviewsByRatingAndRecency(sample);
    expect(sorted.map((r) => r.id)).toEqual(["r3", "r2", "r1"]);
  });

  it("calcula el promedio y conteo de 5 estrellas correctamente", () => {
    const stats = computeReviewStats(DEFAULT_GOOGLE_REVIEWS);
    expect(stats.totalReviews).toBeGreaterThanOrEqual(5);
    expect(stats.fiveStarCount).toBeGreaterThanOrEqual(4);
    expect(stats.averageRating).toBeGreaterThanOrEqual(4.5);
  });
});
