import { NextResponse } from "next/server";
import {
  DEFAULT_GOOGLE_REVIEWS,
  DEFAULT_GOOGLE_REVIEWS_CONFIG,
  sortReviewsByRatingAndRecency,
  type GoogleReview,
} from "@/lib/reviews-store";

interface GooglePlacesV1Review {
  name?: string;
  relativePublishTimeDescription?: string;
  rating?: number;
  text?: { text?: string; languageCode?: string };
  originalText?: { text?: string; languageCode?: string };
  authorAttribution?: {
    displayName?: string;
    uri?: string;
    photoUri?: string;
  };
  publishTime?: string;
  googleMapsUri?: string;
}

interface GooglePlacesV1Response {
  id?: string;
  displayName?: { text?: string };
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: GooglePlacesV1Review[];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const queryKey = searchParams.get("apiKey")?.trim();
  const queryPlaceId = searchParams.get("placeId")?.trim();

  const apiKey = queryKey || process.env.GOOGLE_MAPS_API_KEY || "";
  const placeId = queryPlaceId || process.env.GOOGLE_MAPS_PLACE_ID || "";

  if (!apiKey) {
    const sorted = sortReviewsByRatingAndRecency(DEFAULT_GOOGLE_REVIEWS);
    return NextResponse.json({
      mode: "curated",
      configured: false,
      placeName: "Ulular Sala de Ensayo",
      kgmid: DEFAULT_GOOGLE_REVIEWS_CONFIG.kgmid,
      mapsUrl: DEFAULT_GOOGLE_REVIEWS_CONFIG.mapsUrl,
      reviews: sorted,
    });
  }

  try {
    let placeData: GooglePlacesV1Response | null = null;

    // 1. Si hay un Place ID real de Google Maps (empieza con ChIJ...), consultarlo directo
    if (placeId && placeId.startsWith("ChIJ") && !placeId.includes("Ulular")) {
      const detailsRes = await fetch(
        `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=es-MX`,
        {
          headers: {
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask":
              "id,displayName,rating,userRatingCount,googleMapsUri,reviews",
          },
          next: { revalidate: 86400 },
        },
      );
      if (detailsRes.ok) {
        placeData = (await detailsRes.json()) as GooglePlacesV1Response;
      }
    }

    // 2. Si no se tiene el Place ID exacto, resolverlo automáticamente con Text Search de Places API (New)
    if (!placeData) {
      const searchRes = await fetch(
        "https://places.googleapis.com/v1/places:searchText",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask":
              "places.id,places.displayName,places.rating,places.userRatingCount,places.googleMapsUri,places.reviews",
          },
          body: JSON.stringify({
            textQuery:
              "Ulular sala de ensayo, C. Primavera 32B, Centro, Santiago de Querétaro",
            languageCode: "es-MX",
          }),
          next: { revalidate: 86400 },
        },
      );

      if (searchRes.ok) {
        const searchJson = (await searchRes.json()) as {
          places?: GooglePlacesV1Response[];
        };
        placeData = searchJson.places?.[0] ?? null;
      }
    }

    if (!placeData || !Array.isArray(placeData.reviews)) {
      const sorted = sortReviewsByRatingAndRecency(DEFAULT_GOOGLE_REVIEWS);
      return NextResponse.json({
        mode: "curated_fallback",
        configured: true,
        placeName: "Ulular Sala de Ensayo",
        kgmid: DEFAULT_GOOGLE_REVIEWS_CONFIG.kgmid,
        mapsUrl: DEFAULT_GOOGLE_REVIEWS_CONFIG.mapsUrl,
        reviews: sorted,
      });
    }

    const mapped: GoogleReview[] = placeData.reviews.map((rev, idx) => {
      const rawRating = Math.round(rev.rating ?? 5);
      const safeRating = Math.min(5, Math.max(1, rawRating)) as
        | 1
        | 2
        | 3
        | 4
        | 5;
      return {
        id: rev.name || `gplaces-rev-${idx}`,
        authorName: rev.authorAttribution?.displayName || "Músico Verificado",
        authorRole: "Reseña en vivo · Google Maps API",
        rating: safeRating,
        text:
          rev.text?.text ||
          rev.originalText?.text ||
          "Excelente experiencia en Ulular Sala de Ensayo.",
        publishedAt: rev.publishTime || new Date().toISOString(),
        relativeTimeLabel:
          rev.relativePublishTimeDescription || "Reciente en Google Maps",
        sourceUrl:
          rev.googleMapsUri ||
          placeData?.googleMapsUri ||
          DEFAULT_GOOGLE_REVIEWS_CONFIG.mapsUrl,
        verifiedGoogle: true,
      };
    });

    const sorted = sortReviewsByRatingAndRecency(
      mapped.length > 0 ? mapped : DEFAULT_GOOGLE_REVIEWS,
    );

    return NextResponse.json({
      mode: "google_places_live",
      configured: true,
      placeId: placeData.id,
      placeName: placeData.displayName?.text || "Ulular Sala de Ensayo",
      liveRating: placeData.rating,
      liveTotalRatings: placeData.userRatingCount,
      mapsUrl:
        placeData.googleMapsUri || DEFAULT_GOOGLE_REVIEWS_CONFIG.mapsUrl,
      reviews: sorted,
    });
  } catch {
    const sorted = sortReviewsByRatingAndRecency(DEFAULT_GOOGLE_REVIEWS);
    return NextResponse.json({
      mode: "curated_fallback",
      configured: false,
      placeName: "Ulular Sala de Ensayo",
      kgmid: DEFAULT_GOOGLE_REVIEWS_CONFIG.kgmid,
      mapsUrl: DEFAULT_GOOGLE_REVIEWS_CONFIG.mapsUrl,
      reviews: sorted,
    });
  }
}
