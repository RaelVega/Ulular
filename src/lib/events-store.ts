import {
  DEFAULT_EVENTS,
  SOCIAL_LINKS,
  type SocialLinksConfig,
  type UlularEvent,
} from "./constants";

const EVENTS_STORAGE_KEY = "ulular_events_v1";
const SOCIALS_STORAGE_KEY = "ulular_socials_v1";

/**
 * Convierte fecha (YYYY-MM-DD) + hora (HH:mm) en timestamp comparable.
 * Un evento se considera "próximo" hasta 3 horas después de su hora de inicio
 * (para que no desaparezca a mitad del toquín), y después pasa automáticamente
 * a "eventos pasados".
 */
export function getEventTimestampMs(event: Pick<UlularEvent, "date" | "time">): number {
  const timePart = event.time && /^\d{2}:\d{2}$/.test(event.time) ? event.time : "20:00";
  const iso = `${event.date}T${timePart}:00-06:00`;
  const parsed = Date.parse(iso);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function isUpcomingEvent(
  event: Pick<UlularEvent, "date" | "time">,
  nowMs: number = Date.now(),
): boolean {
  const startMs = getEventTimestampMs(event);
  const graceAfterStartMs = 3 * 60 * 60 * 1000;
  return startMs + graceAfterStartMs >= nowMs;
}

export function splitEventsByDate(
  events: UlularEvent[],
  nowMs: number = Date.now(),
): {
  upcoming: UlularEvent[];
  past: UlularEvent[];
} {
  const upcoming: UlularEvent[] = [];
  const past: UlularEvent[] = [];

  for (const ev of events) {
    if (isUpcomingEvent(ev, nowMs)) {
      upcoming.push(ev);
    } else {
      past.push(ev);
    }
  }

  // Próximos: del más cercano al más lejano
  upcoming.sort((a, b) => getEventTimestampMs(a) - getEventTimestampMs(b));
  // Pasados: del más reciente al más antiguo
  past.sort((a, b) => getEventTimestampMs(b) - getEventTimestampMs(a));

  return { upcoming, past };
}

export function formatEventDateLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return dateStr;
  const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return new Intl.DateTimeFormat("es-MX", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function loadStoredEvents(): UlularEvent[] {
  if (typeof window === "undefined") return DEFAULT_EVENTS;
  try {
    const raw = window.localStorage.getItem(EVENTS_STORAGE_KEY);
    if (!raw) return DEFAULT_EVENTS;
    const parsed = JSON.parse(raw) as UlularEvent[];
    return Array.isArray(parsed) ? parsed : DEFAULT_EVENTS;
  } catch {
    return DEFAULT_EVENTS;
  }
}

export function saveStoredEvents(events: UlularEvent[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
  window.dispatchEvent(new Event("ulular-events-updated"));
}

export function loadStoredSocialLinks(): SocialLinksConfig {
  if (typeof window === "undefined") return SOCIAL_LINKS;
  try {
    const raw = window.localStorage.getItem(SOCIALS_STORAGE_KEY);
    if (!raw) return SOCIAL_LINKS;
    const parsed = JSON.parse(raw) as Partial<SocialLinksConfig>;
    // Si tenía guardada la URL anterior de Maps, usar la nueva oficial
    if (parsed.maps === "https://share.google/Xj1vuGksqvnVJeEqL") {
      parsed.maps = SOCIAL_LINKS.maps;
    }
    return { ...SOCIAL_LINKS, ...parsed };
  } catch {
    return SOCIAL_LINKS;
  }
}

export function saveStoredSocialLinks(links: SocialLinksConfig): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SOCIALS_STORAGE_KEY, JSON.stringify(links));
  window.dispatchEvent(new Event("ulular-socials-updated"));
}
