export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type OpenHoursMap = Record<DayKey, [string, string][]>;

export const BUSINESS_TIMEZONE = "America/Mexico_City";

export const DEFAULT_PRICE_PER_HOUR = 150;
export const DEFAULT_MIN_HOURS = 1;
export const DEFAULT_MAX_DAYS_AHEAD = 60;
export const DEFAULT_PENDING_TTL_HOURS = 24;
export const DEFAULT_CANCEL_NOTICE_HOURS = 24;
export const DEFAULT_TOLERANCE_MINUTES = 15;

export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "524424067325";

export const WHATSAPP_DISPLAY = "442 406 7325";

export const WHATSAPP_CHANNEL_URL =
  process.env.NEXT_PUBLIC_WHATSAPP_CHANNEL_URL ??
  "https://chat.whatsapp.com/LUIiBmdEUHS29vQSUsjmR5";

export interface SocialLinksConfig {
  instagram: string;
  facebook: string;
  youtube: string;
  tiktok: string;
  maps: string;
  pizzaInstagram: string;
  pizzaFacebook: string;
}

export const SOCIAL_LINKS: SocialLinksConfig = {
  instagram: "https://www.instagram.com/ulularsala/",
  facebook: "https://www.facebook.com/ulularsaladeensayo/",
  youtube: "https://www.youtube.com/@ulularsala",
  tiktok: "https://www.tiktok.com/@ulularsala",
  maps: "https://share.google/cNvsrMu7Aymr1UVTx",
  pizzaInstagram: "https://www.instagram.com/ulularnapulepizza",
  pizzaFacebook: "https://www.facebook.com/share/19iX74tHFa/",
};

export const ADDRESS = {
  street: "C. Primavera 32B",
  neighborhood: "Centro, 76165",
  city: "Santiago de Querétaro, Qro.",
  reference: "Zona Centro · Querétaro",
  mapsEmbedQuery:
    "C. Primavera 32B, Centro, 76165 Santiago de Queretaro, Qro., Mexico",
} as const;

export const DEFAULT_OPEN_HOURS: OpenHoursMap = {
  mon: [], // Lunes: solo con reserva anticipada (vía WhatsApp)
  tue: [["17:00", "23:00"]],
  wed: [["17:00", "23:00"]],
  thu: [["17:00", "23:00"]],
  fri: [["17:00", "23:00"]],
  sat: [["11:00", "23:00"]],
  sun: [["11:00", "20:00"]],
};

export interface ScheduleDisplayRow {
  key: DayKey;
  shortLabel: string;
  fullLabel: string;
  hoursLabel: string;
  eqPercent: number;
  byAppointmentOnly?: boolean;
}

export const SCHEDULE_DISPLAY: ScheduleDisplayRow[] = [
  {
    key: "mon",
    shortLabel: "LUN",
    fullLabel: "Lunes",
    hoursLabel: "Solo con reserva anticipada",
    eqPercent: 18,
    byAppointmentOnly: true,
  },
  {
    key: "tue",
    shortLabel: "MAR",
    fullLabel: "Martes",
    hoursLabel: "17:00 — 23:00",
    eqPercent: 50,
  },
  {
    key: "wed",
    shortLabel: "MIÉ",
    fullLabel: "Miércoles",
    hoursLabel: "17:00 — 23:00",
    eqPercent: 50,
  },
  {
    key: "thu",
    shortLabel: "JUE",
    fullLabel: "Jueves",
    hoursLabel: "17:00 — 23:00",
    eqPercent: 50,
  },
  {
    key: "fri",
    shortLabel: "VIE",
    fullLabel: "Viernes",
    hoursLabel: "17:00 — 23:00",
    eqPercent: 50,
  },
  {
    key: "sat",
    shortLabel: "SÁB",
    fullLabel: "Sábado",
    hoursLabel: "11:00 — 23:00",
    eqPercent: 100,
  },
  {
    key: "sun",
    shortLabel: "DOM",
    fullLabel: "Domingo",
    hoursLabel: "11:00 — 20:00",
    eqPercent: 75,
  },
];

// Geometría exacta de los 12 anillos tangentes en la base (viewBox 0 0 120 120)
export const LOGO_RING_RADII = [
  56, 51.36, 46.73, 42.09, 37.45, 32.82, 28.18, 23.55, 18.91, 14.27, 9.64, 5,
] as const;

export const BOOKING_RULES = [
  "El pago se hace antes de entrar al ensayo (efectivo o transferencia).",
  "Las horas apartadas se pagan completas, aunque se usen menos.",
  "Se dan 15 minutos de tolerancia; las horas reservadas no se recorren.",
  "Si no puedes venir, cancela con al menos 24 h de anticipación.",
] as const;

export interface UlularEvent {
  id: string;
  title: string;
  /** Fecha ISO YYYY-MM-DD en horario de Querétaro */
  date: string;
  /** Hora en formato 24h HH:mm */
  time: string;
  venue: string;
  tag: string;
  flyerUrl?: string;
  description?: string;
}

export const EVENT_TAGS = [
  "Tocada",
  "Open Mic",
  "Live Session",
  "Aniversario",
  "Noche de Museos",
  "Jam / Especial",
] as const;

export const DEFAULT_EVENTS: UlularEvent[] = [
  {
    id: "evt-open-mic-nov",
    title: "noche de open mic & pizza",
    date: "2026-10-30",
    time: "20:00",
    venue: "Ulular Napule Pizza",
    tag: "Open Mic",
    description:
      "Micrófono abierto para proyectos acústicos y bandas locales. Registro desde las 19:30 h.",
  },
  {
    id: "evt-ruido-local-nov",
    title: "sesión de ruido independiente",
    date: "2026-11-07",
    time: "20:30",
    venue: "Ulular Sala / Napule Pizza",
    tag: "Tocada",
    description:
      "Tres proyectos de shoegaze y post-punk queretano en vivo + pizza napolitana toda la noche.",
  },
  {
    id: "evt-live-session-oct",
    title: "ulular live session #14",
    date: "2026-10-10",
    time: "19:00",
    venue: "Ulular Sala de Ensayo",
    tag: "Live Session",
    description:
      "Grabación en vivo a puerta cerrada y convivencia posterior en la pizzería.",
  },
  {
    id: "evt-noche-museos-sep",
    title: "circuito noche de museos · acústico",
    date: "2026-09-26",
    time: "18:30",
    venue: "Ulular Napule Pizza",
    tag: "Noche de Museos",
    description:
      "Participación dentro del circuito cultural con bandas invitadas de la escena local.",
  },
];
