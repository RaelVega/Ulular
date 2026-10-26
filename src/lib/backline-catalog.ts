export type BacklineCategory =
  | "todos"
  | "baterias"
  | "guitarra"
  | "cabezales-gabinetes"
  | "bajo"
  | "audio-monitoreo";

export interface BacklineItem {
  id: string;
  name: string;
  category: Exclude<BacklineCategory, "todos">;
  categoryLabel: string;
  subtitle: string;
  specs: string[];
  note?: string;
  cleanImage: string;
  framedImage: string;
  aspect: "square" | "tall";
}

export const BACKLINE_CATEGORIES: { id: BacklineCategory; label: string }[] = [
  { id: "todos", label: "Todo el catálogo (21)" },
  { id: "baterias", label: "Baterías (3)" },
  { id: "guitarra", label: "Combos y Half-Stack Guitarra (3)" },
  { id: "cabezales-gabinetes", label: "Cabezales y Gabinetes (6)" },
  { id: "bajo", label: "Bajo (3)" },
  { id: "audio-monitoreo", label: "Mezcladoras, Mics y Monitoreo (6)" },
];

export const BACKLINE_GENERAL_TAGS: string[] = [
  "Sonorización completa para eventos",
  "Ecualización en vivo",
  "Baterías completas y Shell Packs",
  "Amplificadores de guitarra y bajo",
  "Cabezales y gabinetes 4x12\" / 1x18\"",
  "Mezcladoras digitales y analógicas",
  "Monitoreo inalámbrico In-Ear",
  "Microfonía para batería y voces",
  "Cajas directas (DI)",
  "Guitarras, bajos y platillos en renta",
  "Atriles, cableado e iluminación",
];

export const BACKLINE_ITEMS: BacklineItem[] = [
  // ── BATERÍAS ──────────────────────────────────────────────────────────
  {
    id: "bateria-pearl-forum",
    name: "Batería Pearl Forum",
    category: "baterias",
    categoryLabel: "Batería Acústica",
    subtitle: "Shell Pack 5 piezas + Herrajes",
    specs: [
      "Bombo 22\"",
      "Tom 12\" + Tom 13\"",
      "Tom de piso 16\"",
      "3 atriles con boom",
      "1 atril Hi-Hat + 1 atril tarola",
      "1 banco incluido",
    ],
    note: "*Tarola, pedal sencillo y platillos se rentan por separado",
    cleanImage: "/backline/clean/bateria-pearl-forum.jpg",
    framedImage: "/backline/framed/bateria-pearl-forum.jpg",
    aspect: "tall",
  },
  {
    id: "bateria-tama-rockstar",
    name: "Batería Tama Rockstar",
    category: "baterias",
    categoryLabel: "Batería Acústica",
    subtitle: "Shell Pack 5 piezas + Herrajes",
    specs: [
      "Bombo 22\"",
      "Tom 12\" + Tom 13\"",
      "Tom de piso 16\"",
      "3 atriles con boom",
      "1 atril Hi-Hat + 1 atril tarola",
      "1 banco incluido",
    ],
    note: "*Tarola, pedal sencillo y platillos se rentan por separado",
    cleanImage: "/backline/clean/bateria-tama-rockstar.jpg",
    framedImage: "/backline/framed/bateria-tama-rockstar.jpg",
    aspect: "tall",
  },
  {
    id: "bateria-mapex",
    name: "Batería Mapex",
    category: "baterias",
    categoryLabel: "Batería Acústica",
    subtitle: "Shell Pack 5 piezas + Herrajes",
    specs: [
      "Bombo 22\"",
      "Tom 12\" + Tom 13\"",
      "Tom de piso 16\"",
      "3 atriles con boom",
      "1 atril Hi-Hat + 1 atril tarola",
      "1 banco incluido",
    ],
    note: "*Tarola, pedal sencillo y platillos se rentan por separado",
    cleanImage: "/backline/clean/bateria-mapex.jpg",
    framedImage: "/backline/framed/bateria-mapex.jpg",
    aspect: "tall",
  },

  // ── AMPLIFICADORES DE GUITARRA ────────────────────────────────────────
  {
    id: "amp-fender-frontman-100w",
    name: "Amplificador Fender Frontman 212R",
    category: "guitarra",
    categoryLabel: "Combo Guitarra",
    subtitle: "100W · Combo 2x12\"",
    specs: [
      "Potencia: 100 W",
      "Configuración: Combo 2x12\"",
      "2 canales: Clean / Distorsión + Reverb",
      "Conexiones: Pre Out / Power In",
    ],
    cleanImage: "/backline/clean/amp-fender-frontman-100w.jpg",
    framedImage: "/backline/framed/amp-fender-frontman-100w.jpg",
    aspect: "square",
  },
  {
    id: "amp-fender-champion-100w",
    name: "Amplificador Fender Champion 100",
    category: "guitarra",
    categoryLabel: "Combo Guitarra",
    subtitle: "100W · Combo 2x12\" con Efectos",
    specs: [
      "Potencia: 100 W",
      "Configuración: Combo 2x12\"",
      "2 canales: Clean + Efectos / Overdrive + Efectos",
      "Conexiones: Pre Out / Power In",
    ],
    cleanImage: "/backline/clean/amp-fender-champion-100w.jpg",
    framedImage: "/backline/framed/amp-fender-champion-100w.jpg",
    aspect: "square",
  },
  {
    id: "halfstack-line6-spider-iv",
    name: "Half-Stack Line 6 Spider IV",
    category: "guitarra",
    categoryLabel: "Half-Stack Guitarra",
    subtitle: "150W · Cabezal + Gabinete 4x12\"",
    specs: [
      "Potencia: 150 W",
      "Gabinete 4x12\" incluido",
      "Múltiples efectos, presets y bancos predeterminados",
      "Salida Estéreo / Mono",
    ],
    cleanImage: "/backline/clean/halfstack-line6-spider-iv.jpg",
    framedImage: "/backline/framed/halfstack-line6-spider-iv.jpg",
    aspect: "square",
  },

  // ── CABEZALES Y GABINETES ─────────────────────────────────────────────
  {
    id: "cabezal-boss-katana-100w",
    name: "Cabezal Boss Katana",
    category: "cabezales-gabinetes",
    categoryLabel: "Cabezal Guitarra",
    subtitle: "100W · Multi-FX & Presets",
    specs: [
      "Potencia: 100 W",
      "Múltiples efectos, presets y predeterminados",
      "Salida 1/4\" a 8 Ohms",
      "Loop de efectos Send / Return + Line Out",
    ],
    cleanImage: "/backline/clean/cabezal-boss-katana-100w.jpg",
    framedImage: "/backline/framed/cabezal-boss-katana-100w.jpg",
    aspect: "square",
  },
  {
    id: "cabezal-blackstar-debut-100w",
    name: "Cabezal Blackstar Debut 100",
    category: "cabezales-gabinetes",
    categoryLabel: "Cabezal Guitarra",
    subtitle: "100W · 2 Canales + Reverb",
    specs: [
      "Potencia: 100 W",
      "2 canales: Clean / Overdrive + Reverb",
      "Salidas 1/4\": 8 Ohms y 16 Ohms",
      "Loop de efectos Send / Return",
    ],
    cleanImage: "/backline/clean/cabezal-blackstar-debut-100w.jpg",
    framedImage: "/backline/framed/cabezal-blackstar-debut-100w.jpg",
    aspect: "square",
  },
  {
    id: "cabezal-line6-spider-iv",
    name: "Cabezal Line 6 Spider IV",
    category: "cabezales-gabinetes",
    categoryLabel: "Cabezal Guitarra",
    subtitle: "150W · Estéreo / Mono",
    specs: [
      "Potencia: 150 W",
      "2 salidas 1/4\" Estéreo / Mono",
      "Múltiples efectos, presets y predeterminados",
      "Loop Send / Return",
    ],
    cleanImage: "/backline/clean/cabezal-line6-spider-iv.jpg",
    framedImage: "/backline/framed/cabezal-line6-spider-iv.jpg",
    aspect: "square",
  },
  {
    id: "gabinete-marshall-4x12",
    name: "Gabinete Marshall 4x12\"",
    category: "cabezales-gabinetes",
    categoryLabel: "Gabinete Guitarra",
    subtitle: "4x12\" Celestion · 8 Ohms",
    specs: [
      "Bocinas: 4x12\" Celestion",
      "Entrada: 1 Jack 1/4\" Mono",
      "Impedancia: 8 Ohms",
    ],
    cleanImage: "/backline/clean/gabinete-marshall-4x12.jpg",
    framedImage: "/backline/framed/gabinete-marshall-4x12.jpg",
    aspect: "square",
  },
  {
    id: "gabinete-fender-guitarra-4x12",
    name: "Gabinete Fender 4x12\"",
    category: "cabezales-gabinetes",
    categoryLabel: "Gabinete Guitarra",
    subtitle: "4x12\" Celestion · Estéreo / Mono",
    specs: [
      "Bocinas: 4x12\" Celestion",
      "Entradas: 2 Jacks 1/4\" Estéreo / Mono",
      "Impedancia: 8 Ohms",
    ],
    cleanImage: "/backline/clean/gabinete-fender-guitarra-4x12.jpg",
    framedImage: "/backline/framed/gabinete-fender-guitarra-4x12.jpg",
    aspect: "square",
  },
  {
    id: "gabinete-line6-4x12",
    name: "Gabinete Line 6 4x12\"",
    category: "cabezales-gabinetes",
    categoryLabel: "Gabinete Guitarra",
    subtitle: "4x12\" Celestion · Estéreo / Mono",
    specs: [
      "Bocinas: 4x12\" Celestion",
      "Entradas: 2 Jacks 1/4\" Estéreo / Mono",
      "Impedancia: 8 Ohms",
    ],
    cleanImage: "/backline/clean/gabinete-line6-4x12.jpg",
    framedImage: "/backline/framed/gabinete-line6-4x12.jpg",
    aspect: "square",
  },

  // ── AMPLIFICADORES Y GABINETES DE BAJO ────────────────────────────────
  {
    id: "amp-fender-rumble-500w",
    name: "Amplificador Fender Rumble 500",
    category: "bajo",
    categoryLabel: "Combo Bajo",
    subtitle: "500W · 2x10\" + Salida Canon DI",
    specs: [
      "Potencia: 500 W · Configuración 2x10\"",
      "2 canales: Clean / Overdrive",
      "Presets: Contour / Vintage / Bright",
      "Salidas: Canon (XLR) + 1/4\" + Gabinete 8 Ohms",
    ],
    cleanImage: "/backline/clean/amp-fender-rumble-500w.jpg",
    framedImage: "/backline/framed/amp-fender-rumble-500w.jpg",
    aspect: "square",
  },
  {
    id: "amp-meteoro-bajo-110w",
    name: "Amplificador Meteoro Bajo",
    category: "bajo",
    categoryLabel: "Combo Bajo",
    subtitle: "110W · 1x15\"",
    specs: [
      "Potencia: 110 W · Bocina 1x15\"",
      "Entradas: Low / High",
      "Salida de línea 1/4\"",
      "Salida para gabinete externo 8 Ohms",
    ],
    cleanImage: "/backline/clean/amp-meteoro-bajo-110w.jpg",
    framedImage: "/backline/framed/amp-meteoro-bajo-110w.jpg",
    aspect: "square",
  },
  {
    id: "gabinete-fender-bajo-1x18",
    name: "Gabinete Fender Bajo 1x18\"",
    category: "bajo",
    categoryLabel: "Gabinete Bajo",
    subtitle: "1x18\" Bocina Fender · 8 Ohms",
    specs: [
      "Bocina Fender de 18\" (1x18\")",
      "Entrada: 1 Jack 1/4\"",
      "Impedancia: 8 Ohms",
    ],
    cleanImage: "/backline/clean/gabinete-fender-bajo-1x18.jpg",
    framedImage: "/backline/framed/gabinete-fender-bajo-1x18.jpg",
    aspect: "square",
  },

  // ── MEZCLADORAS, MICROFONÍA Y MONITOREO ───────────────────────────────
  {
    id: "mezcladora-toppro-t2208",
    name: "Mezcladora Digital TopPro T2208",
    category: "audio-monitoreo",
    categoryLabel: "Consola Digital",
    subtitle: "16 Canales Canon · Faders Motorizados",
    specs: [
      "16 canales Canon (XLR) + 20 canales 1/4\"",
      "Procesamiento DSP: múltiples FX, Gate, Comp, Reverb, Delay",
      "Pantalla táctil integrada + control por computadora o tablet",
      "Faders automáticos motorizados · USB / Ethernet",
    ],
    cleanImage: "/backline/clean/mezcladora-toppro-t2208.jpg",
    framedImage: "/backline/framed/mezcladora-toppro-t2208.jpg",
    aspect: "square",
  },
  {
    id: "mezcladora-mrv-122fx",
    name: "Mezcladora MRV 122FX",
    category: "audio-monitoreo",
    categoryLabel: "Consola Analógica",
    subtitle: "14 Canales Canon · EQ Estéreo + FX",
    specs: [
      "14 canales Canon (XLR) + 14 canales 1/4\" + 2 RCA",
      "FX integrado, Send, Aux, Bluetooth, EQ estéreo y 2 subgrupos",
      "4 bandas EQ por canal / Gain / Send / FX / PFL / Pan",
    ],
    cleanImage: "/backline/clean/mezcladora-mrv-122fx.jpg",
    framedImage: "/backline/framed/mezcladora-mrv-122fx.jpg",
    aspect: "square",
  },
  {
    id: "mezcladora-behringer-xenyx-x2442",
    name: "Mezcladora Behringer Xenyx X2442",
    category: "audio-monitoreo",
    categoryLabel: "Consola Analógica",
    subtitle: "10 Canales Canon · Compresores + 4 Subgrupos",
    specs: [
      "10 canales Canon (XLR) + 12 canales 1/4\" + 2 RCA",
      "FX / Send / Aux / 4 Subgrupos / PFL",
      "4 bandas de EQ, Gain, Compresor integrado por canal",
    ],
    cleanImage: "/backline/clean/mezcladora-behringer-xenyx-x2442.jpg",
    framedImage: "/backline/framed/mezcladora-behringer-xenyx-x2442.jpg",
    aspect: "square",
  },
  {
    id: "mezcladora-mrv-basica",
    name: "Mezcladora MRV Compacta",
    category: "audio-monitoreo",
    categoryLabel: "Consola Compacta",
    subtitle: "6 Canales Canon · FX + Bluetooth",
    specs: [
      "6 canales Canon (XLR) + 6 canales 1/4\" + 2 RCA",
      "Efectos digitales (FX) + conectividad Bluetooth",
      "3 bandas de EQ / Send / Aux / Gain / Pan / PFL",
    ],
    cleanImage: "/backline/clean/mezcladora-mrv-basica.jpg",
    framedImage: "/backline/framed/mezcladora-mrv-basica.jpg",
    aspect: "square",
  },
  {
    id: "set-microfonos-behringer-bc1200",
    name: "Set de Micrófonos de Batería Behringer BC1200",
    category: "audio-monitoreo",
    categoryLabel: "Microfonía Batería",
    subtitle: "Kit de 7 Piezas · 50Hz–18kHz",
    specs: [
      "7 micrófonos dedicados para batería completa",
      "1 micrófono dinámico de bombo",
      "4 micrófonos para toms / tarola con clamps",
      "2 micrófonos condensadores overhead (50Hz – 18kHz)",
    ],
    cleanImage: "/backline/clean/set-microfonos-behringer-bc1200.jpg",
    framedImage: "/backline/framed/set-microfonos-behringer-bc1200.jpg",
    aspect: "square",
  },
  {
    id: "monitores-inalambricos-gochanmi",
    name: "Monitores Inalámbricos In-Ear Gochanmi",
    category: "audio-monitoreo",
    categoryLabel: "Monitoreo In-Ear",
    subtitle: "1 Transmisor + Hasta 10 Receptores",
    specs: [
      "1 transmisor rack UHF de doble canal",
      "Hasta 10 receptores de cintura (bodypacks)*",
      "Incluye transmisor, receptores y baterías",
      "Alcance operativo de hasta 50 metros*",
    ],
    cleanImage: "/backline/clean/monitores-inalambricos-gochanmi.jpg",
    framedImage: "/backline/framed/monitores-inalambricos-gochanmi.jpg",
    aspect: "square",
  },
];
