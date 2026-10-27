import { Rings } from "@/components/ui/Rings";
import { BrandIcon, type BrandNetwork } from "@/components/ui/BrandIcon";
import { Button } from "@/components/ui/Button";
import { SpecsTable } from "@/components/ui/SpecsTable";
import { SectionArc } from "@/components/ui/SectionArc";
import { StudioIcon, type StudioIconName } from "@/components/ui/StudioIcon";
import { Marquee } from "@/components/site/Marquee";
import { ScheduleEq } from "@/components/site/ScheduleEq";
import { PizzaFlyer } from "@/components/site/PizzaFlyer";
import { EventsSection } from "@/components/site/EventsSection";
import { SocialsSection } from "@/components/site/SocialsSection";
import { BacklineCatalog } from "@/components/site/BacklineCatalog";
import { LiveSessionsGallery } from "@/components/site/LiveSessionsGallery";
import { Room360Viewer } from "@/components/site/Room360Viewer";
import {
  ADDRESS,
  BOOKING_RULES,
  DEFAULT_PRICE_PER_HOUR,
  SCHEDULE_DISPLAY,
  SOCIAL_LINKS,
  WHATSAPP_DISPLAY,
} from "@/lib/constants";
import {
  buildServiceInquiryWhatsAppUrl,
  buildSpecialScheduleWhatsAppUrl,
} from "@/lib/whatsapp";

const ROOM_GEAR: {
  icon: StudioIconName;
  label: string;
  detail: string;
  tag: string;
}[] = [
  {
    icon: "drums",
    label: "Batería completa",
    detail: "Lista en sala para conectar y tocar desde el primer minuto.",
    tag: "INCLUIDO",
  },
  {
    icon: "amps",
    label: "Amplificadores",
    detail: "Amplificación dedicada para guitarra y bajo en sala.",
    tag: "INCLUIDO",
  },
  {
    icon: "pa",
    label: "Sonido y ecualización",
    detail: "Sistema PA con consola y ecualización de voces.",
    tag: "INCLUIDO",
  },
  {
    icon: "mics",
    label: "Hasta 4 micrófonos",
    detail: "Disponibles simultáneamente durante tu ensayo.",
    tag: "INCLUIDO",
  },
  {
    icon: "ac",
    label: "Aire acondicionado",
    detail: "Climatización activa para ensayar cómodos todo el año.",
    tag: "CONFORT",
  },
  {
    icon: "acoustics",
    label: "Acondicionamiento acústico",
    detail: "Tratamiento interior para definición y control de rebote.",
    tag: "ACÚSTICA",
  },
  {
    icon: "record",
    label: "Maquetación en sala",
    detail: "Espacio preparado para maquetar tus temas (bajo contacto).",
    tag: "SESIÓN",
  },
  {
    icon: "instruments",
    label: "Renta de instrumentos",
    detail:
      "Guitarra acústica, eléctrica y bajo con costo extra bajo disponibilidad.",
    tag: "EXTRA",
  },
];

const HERO_SOCIALS: {
  network: BrandNetwork;
  label: string;
  href: string;
}[] = [
  {
    network: "whatsapp",
    label: `WhatsApp · ${WHATSAPP_DISPLAY}`,
    href: buildSpecialScheduleWhatsAppUrl(),
  },
  {
    network: "instagram",
    label: "Instagram · @ulularsala",
    href: SOCIAL_LINKS.instagram,
  },
  {
    network: "facebook",
    label: "Facebook · /ulularsaladeensayo",
    href: SOCIAL_LINKS.facebook,
  },
  {
    network: "youtube",
    label: "YouTube · Ulular Live Sessions",
    href: SOCIAL_LINKS.youtube,
  },
  {
    network: "tiktok",
    label: "TikTok · @ulularsala",
    href: SOCIAL_LINKS.tiktok,
  },
  {
    network: "maps",
    label: "Ubicación en Google Maps",
    href: SOCIAL_LINKS.maps,
  },
];

const SERVICE_MODULES: {
  icon: StudioIconName;
  badge: string;
  title: string;
  meta: string;
  summary: string;
  primaryHref?: string;
  primaryLabel?: string;
  socialLinks: { network: BrandNetwork; label: string; href: string }[];
}[] = [
  {
    icon: "drums",
    badge: "$150 / H · MÍN. 1 H",
    title: "sala de ensayo & maquetación",
    meta: "Backline incluido · Hasta 4 micrófonos · A/C · Recorrido 360°",
    summary:
      "Batería, amplificadores de guitarra y bajo, sonido con ecualización de voces, aire acondicionado y acondicionamiento acústico. También puedes maquetar tus rolas aquí o rentar guitarra acústica, eléctrica y bajo con costo extra bajo disponibilidad.",
    primaryHref: "/reservar",
    primaryLabel: "Reserva tu ensayo",
    socialLinks: [
      {
        network: "whatsapp",
        label: "Preguntar por maquetación o renta de instrumentos",
        href: buildServiceInquiryWhatsAppUrl(
          "maquetación o renta de instrumentos",
        ),
      },
    ],
  },
  {
    icon: "amps",
    badge: "SONORIZACIÓN COMPLETA",
    title: "backline & sonorización de eventos",
    meta: "21 equipos en catálogo · Eventos en Querétaro",
    summary:
      "Sonorizamos por completo eventos, toquines y foros, además de rentar baterías, cabezales, gabinetes, combos, consolas digitales y monitoreo inalámbrico. Explora el catálogo detallado abajo y cotiza por WhatsApp.",
    primaryHref: "#backline",
    primaryLabel: "Ver catálogo (21)",
    socialLinks: [
      {
        network: "facebook",
        label: "Ver catálogo de backline en Facebook",
        href: SOCIAL_LINKS.facebook,
      },
      {
        network: "whatsapp",
        label: "Cotizar backline o sonorización completa de evento",
        href: buildServiceInquiryWhatsAppUrl(
          "renta de backline o sonorización completa de evento",
        ),
      },
    ],
  },
  {
    icon: "live",
    badge: "EN VIVO & FORMATO 360°",
    title: "ulular live sessions & 360°",
    meta: "Espacio para bandas · Sesiones multicámara y Live Session 360°",
    summary:
      "Un espacio pensado para bandas con transmisión en vivo, producción audiovisual y formato Live Session 360° interactivo. Reproduce nuestras sesiones grabadas abajo y contáctanos para producir la de tu proyecto.",
    primaryHref: "#live-sessions",
    primaryLabel: "Ver sesiones en video",
    socialLinks: [
      {
        network: "whatsapp",
        label: "Contactar por WhatsApp para Live Session / 360°",
        href: buildServiceInquiryWhatsAppUrl(
          "Ulular Live Sessions / Live Session 360°",
        ),
      },
      {
        network: "youtube",
        label: "Ver Live Sessions en YouTube",
        href: SOCIAL_LINKS.youtube,
      },
      {
        network: "facebook",
        label: "Ver transmisiones en Facebook",
        href: SOCIAL_LINKS.facebook,
      },
      {
        network: "instagram",
        label: "Ver clips en Instagram",
        href: SOCIAL_LINKS.instagram,
      },
    ],
  },
  {
    icon: "camera",
    badge: "PORTAFOLIO IG & FB",
    title: "fotografía para bandas",
    meta: "Retrato · Cobertura de ensayo · Press kit",
    summary:
      "Fotografía de sesión, cobertura de ensayo y press kit con estética cruda en alto contraste. Revisa nuestras galerías en Instagram y Facebook y escríbenos para agendar.",
    socialLinks: [
      {
        network: "instagram",
        label: "Ver fotografías en Instagram",
        href: SOCIAL_LINKS.instagram,
      },
      {
        network: "facebook",
        label: "Ver fotografías en Facebook",
        href: SOCIAL_LINKS.facebook,
      },
      {
        network: "whatsapp",
        label: "Agendar sesión fotográfica por WhatsApp",
        href: buildServiceInquiryWhatsAppUrl("fotografía para bandas"),
      },
    ],
  },
];

export default function HomePage() {
  return (
    <>
      {/* HERO RESPONSIVE: Centrado en celular/iPad (<1024px) · Dividido en desktop (>=1024px) */}
      <section
        id="top"
        className="relative min-h-[calc(100svh-76px-env(safe-area-inset-bottom))] lg:min-h-svh flex flex-col justify-center lg:justify-end items-center lg:items-start text-center lg:text-left gap-6 lg:gap-0 px-5 sm:px-8 lg:px-16 pt-[calc(5.25rem+env(safe-area-inset-top))] pb-8 overflow-hidden"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 text-smoke opacity-15"
        >
          <Rings
            variant="static"
            strokeWidth={0.25}
            className="ulular-scroll-tunnel absolute left-1/2 lg:left-auto lg:-right-[40vw] top-1/2 -translate-x-1/2 lg:translate-x-0 -translate-y-1/2 w-[max(150vw,150svh)]"
          />
        </div>

        <Rings
          variant="hero"
          strokeWidth={0.6}
          className="ulular-scroll-tunnel relative lg:absolute z-10 lg:z-0 text-bone overflow-visible w-[min(68vw,34svh,320px)] md:w-[min(50vw,36svh,400px)] lg:w-[min(45vw,74svh)] lg:right-[5vw] lg:top-1/2 lg:-translate-y-1/2 shrink-0"
        />

        <div className="ulular-scroll-fade relative z-10 flex flex-col items-center lg:items-start lg:max-w-[52%]">
          <div className="inline-flex items-center gap-2">
            <span
              aria-hidden="true"
              style={{ borderRadius: "9999px" }}
              className="w-2 h-2 rounded-full bg-accent"
            />
            <p className="font-label-caps text-ash">
              Centro, Querétaro · desde la escena
            </p>
          </div>

          <h1 aria-label="Ulular Sala de Ensayo" className="text-white m-0">
            <span
              id="hero-wordmark"
              aria-hidden="true"
              className="ulular-wordmark-anim block font-display font-black text-[clamp(4.25rem,20vw,8.5rem)] lg:text-[clamp(7rem,14vw,13rem)] leading-[0.85] tracking-[-0.05em] lowercase mt-1.5 lg:mt-3"
            >
              ulular
            </span>
            {/* Solo en el logo se conserva la tipografía Cinzel original */}
            <span
              aria-hidden="true"
              className="ulular-tagline-anim block font-label font-normal text-[clamp(0.95rem,3.8vw,1.6rem)] lg:text-[clamp(1.3rem,2.2vw,2.2rem)] leading-none uppercase mt-2.5 lg:mt-3 text-bone"
            >
              Sala de ensayo
            </span>
          </h1>

          <div className="ulular-fadeup-anim mt-5 lg:mt-7 flex flex-col items-center lg:items-start">
            <p className="font-mono-specs text-sm sm:text-base text-ash mb-5">
              ${DEFAULT_PRICE_PER_HOUR} / hora · mínimo 1 hora · 15 min de
              tolerancia
            </p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <Button href="/reservar">Reserva tu ensayo</Button>
            </div>

            {/* Redes y contacto en el Hero: únicamente logos originales (sin Spotify) */}
            <div className="mt-5 pt-4 border-t border-tolex/70 flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
              {HERO_SOCIALS.map((item) => (
                <a
                  key={item.network}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  title={item.label}
                  className="inline-flex items-center justify-center w-10 h-10 border border-tolex bg-ink-2/90 hover:border-accent hover:scale-110 transition-all duration-150"
                >
                  <BrandIcon network={item.network} className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE PUBLICITARIO */}
      <Marquee />

      {/* SECCIÓN LA SALA + RECORRIDO VIRTUAL 360° INTERACTIVO */}
      <section
        id="sala"
        className="relative overflow-hidden px-5 sm:px-8 lg:px-16 py-20 sm:py-28 border-b border-tolex"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-end mb-12">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2">
                <span
                  aria-hidden="true"
                  style={{ borderRadius: "9999px" }}
                  className="w-2 h-2 rounded-full bg-accent"
                />
                <p className="font-label-caps text-ash">
                  Acústica · Backline · Climatización · Recorrido 360°
                </p>
              </div>
              <h2 className="font-display-title text-[clamp(2.5rem,6.5vw,4.5rem)] mt-2">
                suena <span className="text-accent">fuerte.</span>
              </h2>
            </div>

            <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col justify-between gap-4 border-l-2 border-accent pl-5">
              <p className="text-sm sm:text-base text-ash">
                Todo listo para conectar y ensayar en el Centro de Querétaro:
                batería, amplificadores, sonido con ecualización de voces, hasta
                4 micrófonos, aire acondicionado y acondicionamiento acústico.
              </p>
              <div className="flex items-baseline gap-3 font-mono-specs">
                <span className="text-2xl sm:text-3xl font-bold text-bone">
                  ${DEFAULT_PRICE_PER_HOUR} MXN
                </span>
                <span className="text-xs text-accent uppercase">
                  / hora · mínimo 1 h
                </span>
              </div>
            </div>
          </div>

          {/* Matriz técnica 2x4 del equipamiento de la sala */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-l border-tolex">
            {ROOM_GEAR.map((gear) => (
              <div
                key={gear.label}
                className="group border-r border-b border-tolex bg-ink-2/60 hover:bg-ink-2 p-6 flex flex-col justify-between gap-5 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="w-10 h-10 border border-tolex bg-ink inline-flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white group-hover:border-accent transition-colors">
                    <StudioIcon name={gear.icon} className="w-5 h-5" />
                  </div>
                  <span className="font-mono-specs text-[0.62rem] text-ash border border-tolex px-2 py-0.5">
                    {gear.tag}
                  </span>
                </div>
                <div>
                  <h3 className="font-display-title text-xl text-bone">
                    {gear.label.toLowerCase()}
                  </h3>
                  <p className="text-xs text-ash mt-1.5 leading-relaxed">
                    {gear.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Recorrido Virtual Interactivo 360° de la Sala de Ensayo */}
          <Room360Viewer />

          {/* Barra inferior de operación y reglas */}
          <div className="mt-8 border border-tolex bg-ink-2 p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8">
              <p className="font-label-caps text-accent text-[0.68rem] mb-3">
                Lineamientos de sesión
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-xs sm:text-sm text-bone">
                {BOOKING_RULES.map((rule) => (
                  <li key={rule} className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">▪</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-4 flex lg:justify-end">
              <Button href="/reservar" className="w-full sm:w-auto">
                Reserva tu ensayo
              </Button>
            </div>
          </div>
        </div>
      </section>

      <SectionArc />

      {/* SECCIÓN SERVICIOS + CATÁLOGO DE BACKLINE + LIVE SESSIONS EN VIDEO */}
      <section
        id="servicios"
        className="relative overflow-hidden px-5 sm:px-8 lg:px-16 py-20 sm:py-28"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <div className="inline-flex items-center gap-2">
                <span
                  aria-hidden="true"
                  style={{ borderRadius: "9999px" }}
                  className="w-2 h-2 rounded-full bg-accent"
                />
                <p className="font-label-caps text-ash">
                  Estudio · Eventos · Producción 360°
                </p>
              </div>
              <h2 className="font-display-title text-[clamp(2.5rem,6.5vw,4.5rem)] mt-2">
                sala, backline, <span className="text-accent">live</span> y
                foto.
              </h2>
            </div>
            <p className="font-mono-specs text-xs text-ash max-w-xs">
              Desde ensayar por hora hasta sonorizar tu evento completo o grabar
              tu Live Session en 360°.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 border-t border-l border-tolex">
            {SERVICE_MODULES.map((srv) => (
              <article
                key={srv.title}
                className="group relative border-r border-b border-tolex bg-ink-2/40 hover:bg-ink-2 p-7 sm:p-10 flex flex-col justify-between gap-8 transition-colors"
              >
                {/* Barra superior con acento activo en hover */}
                <div className="absolute inset-x-0 top-0 h-[2px] bg-transparent group-hover:bg-accent transition-colors" />

                <div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="w-12 h-12 border border-tolex bg-ink inline-flex items-center justify-center text-accent group-hover:border-accent transition-colors">
                      <StudioIcon name={srv.icon} className="w-6 h-6" />
                    </div>
                    <span className="border border-accent text-accent bg-accent-soft px-2.5 py-1 font-mono-specs text-[0.65rem] uppercase">
                      {srv.badge}
                    </span>
                  </div>

                  <h3 className="font-display-title text-3xl sm:text-4xl text-bone mt-6">
                    {srv.title}
                  </h3>
                  <p className="font-mono-specs text-xs text-accent mt-2">
                    {srv.meta}
                  </p>
                  <p className="text-sm text-ash mt-4 leading-relaxed">
                    {srv.summary}
                  </p>
                </div>

                <div className="pt-5 border-t border-tolex flex flex-wrap items-center justify-between gap-3">
                  {srv.primaryHref && srv.primaryLabel ? (
                    <Button
                      href={srv.primaryHref}
                      className="min-h-[44px] px-5 text-xs"
                    >
                      {srv.primaryLabel}
                    </Button>
                  ) : (
                    <span className="font-mono-specs text-xs text-smoke uppercase">
                      Contacto directo y galería
                    </span>
                  )}

                  <div className="flex items-center gap-2">
                    {srv.socialLinks.map((link) => (
                      <a
                        key={link.network}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={link.label}
                        title={link.label}
                        className="inline-flex items-center justify-center w-11 h-11 border border-tolex bg-ink hover:border-accent hover:scale-110 transition-all"
                      >
                        <BrandIcon network={link.network} className="w-5 h-5" />
                      </a>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Galería de videos de Ulular Live Sessions & 360° */}
          <LiveSessionsGallery />

          {/* Catálogo completo e interactivo de Backline (con comparador Sin Marco / Con Marco) */}
          <BacklineCatalog />
        </div>
      </section>

      {/* SECCIÓN HORARIOS + ECUALIZADOR + BANNER HORARIO ESPECIAL */}
      <section
        id="horarios"
        className="relative overflow-hidden border-t border-tolex px-5 sm:px-8 lg:px-16 py-20 sm:py-28 bg-ink-2"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-6 space-y-8">
            <div>
              <div className="inline-flex items-center gap-2">
                <span
                  aria-hidden="true"
                  style={{ borderRadius: "9999px" }}
                  className="w-2 h-2 rounded-full bg-accent"
                />
                <p className="font-label-caps text-ash">
                  Disponibilidad semanal
                </p>
              </div>
              <h2 className="font-display-title text-[clamp(2.5rem,6.5vw,4.5rem)] mt-2">
                cuándo <span className="text-accent">suena.</span>
              </h2>
            </div>

            <ScheduleEq />

            {/* Callout moderno para cualquier horario especial (no solo lunes) */}
            <div className="border-l-2 border-accent bg-ink p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-display-title text-xl text-bone">
                  ¿necesitas un horario especial?
                </p>
                <p className="text-xs sm:text-sm text-ash mt-1">
                  No solo los lunes: si buscas ensayar por la mañana, tarde o en
                  un horario fuera de lista cualquier día, mándanos mensaje.
                </p>
              </div>
              <a
                href={buildSpecialScheduleWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Mandar mensaje por WhatsApp para horario especial"
                title="Mandar mensaje por WhatsApp"
                className="inline-flex items-center justify-center w-12 h-12 border border-tolex bg-ink-2 hover:border-[#25D366] hover:scale-110 transition-all shrink-0"
              >
                <BrandIcon network="whatsapp" className="w-6 h-6" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="border border-tolex bg-ink">
              <div className="px-5 py-3.5 border-b border-tolex flex items-center justify-between">
                <span className="font-label-caps text-[0.68rem] text-ash">
                  HORARIO DE SALA (QUERÉTARO)
                </span>
                <span className="font-mono-specs text-xs text-accent">
                  BLOQUES DE 1 H
                </span>
              </div>
              <div className="divide-y divide-tolex">
                {SCHEDULE_DISPLAY.map((d) => (
                  <div
                    key={d.key}
                    className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-ink-2/60 transition-colors"
                  >
                    <span className="font-display-title text-lg sm:text-xl text-bone">
                      {d.fullLabel.toLowerCase()}
                    </span>
                    <span
                      className={`font-mono-specs text-xs sm:text-sm px-2.5 py-1 border ${
                        d.byAppointmentOnly
                          ? "border-dashed border-tolex text-ash"
                          : "border-accent/50 bg-accent-soft text-bone"
                      }`}
                    >
                      {d.hoursLabel}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN CARTELERA DE EVENTOS */}
      <section
        id="eventos"
        className="relative overflow-hidden border-t border-tolex px-5 sm:px-8 lg:px-16 py-20 sm:py-28"
      >
        <div className="max-w-7xl mx-auto">
          <EventsSection />
        </div>
      </section>

      {/* SECCIÓN ULULAR NAPULE PIZZA + CANAL DE DIFUSIÓN */}
      <section
        id="pizzeria"
        className="relative overflow-hidden border-t border-tolex px-5 sm:px-8 lg:px-16 py-20 sm:py-28 bg-ink-2"
      >
        <div className="max-w-7xl mx-auto">
          <PizzaFlyer />
        </div>
      </section>

      {/* SECCIÓN CANALES OFICIALES (LOGO + RED / NOMBRE) */}
      <SocialsSection />

      {/* SECCIÓN UBICACIÓN (C. PRIMAVERA 32B, CENTRO) + MAPA A COLOR */}
      <section
        id="ubicacion"
        className="relative overflow-hidden border-t border-tolex px-5 sm:px-8 lg:px-16 py-20 sm:py-28 bg-ink-2"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2">
              <span
                aria-hidden="true"
                style={{ borderRadius: "9999px" }}
                className="w-2 h-2 rounded-full bg-accent"
              />
              <p className="font-label-caps text-ash">Dónde estamos</p>
            </div>
            <h2 className="font-display-title text-[clamp(2.5rem,6.5vw,4.5rem)] mt-2">
              centro, <span className="text-accent">qro.</span>
            </h2>
            <p className="mt-4 text-bone text-lg">{ADDRESS.street}</p>
            <p className="text-ash">
              {ADDRESS.neighborhood}, {ADDRESS.city}
            </p>
            <p className="font-mono-specs text-xs text-ash mt-2">
              {ADDRESS.reference}
            </p>

            <div className="mt-6 flex items-center gap-3">
              <a
                href={SOCIAL_LINKS.maps}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Abrir ubicación en Google Maps"
                title="Abrir en Google Maps"
                className="inline-flex items-center justify-center w-12 h-12 border border-tolex bg-ink hover:border-accent hover:scale-110 transition-all"
              >
                <BrandIcon network="maps" className="w-6 h-6" />
              </a>
              <a
                href={buildSpecialScheduleWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Mandar WhatsApp a ${WHATSAPP_DISPLAY}`}
                title={`WhatsApp · ${WHATSAPP_DISPLAY}`}
                className="inline-flex items-center justify-center w-12 h-12 border border-tolex bg-ink hover:border-[#25D366] hover:scale-110 transition-all"
              >
                <BrandIcon network="whatsapp" className="w-6 h-6" />
              </a>
            </div>

            <div className="mt-8">
              <SpecsTable
                caption="DIRECCIÓN Y CONTACTO"
                items={[
                  { label: "Calle", value: ADDRESS.street },
                  { label: "Colonia / CP", value: ADDRESS.neighborhood },
                  { label: "Ciudad", value: ADDRESS.city },
                  { label: "WhatsApp", value: WHATSAPP_DISPLAY },
                ]}
              />
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="border border-tolex bg-ink p-2">
              <div className="flex items-center justify-between px-2 py-1.5 border-b border-tolex mb-2">
                <span className="inline-flex items-center gap-2 font-label-caps text-[0.62rem] text-bone">
                  <BrandIcon network="maps" className="w-3.5 h-3.5" />
                  <span>C. PRIMAVERA 32B · CENTRO</span>
                </span>
                <a
                  href={SOCIAL_LINKS.maps}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Abrir en Google Maps"
                  title="Abrir en Google Maps"
                  className="text-ash hover:text-accent"
                >
                  <StudioIcon name="external" className="w-4 h-4" />
                </a>
              </div>
              <div className="relative aspect-[16/11] w-full overflow-hidden bg-ink">
                <iframe
                  title="Ubicación de Ulular Sala de Ensayo en Google Maps"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(
                    ADDRESS.mapsEmbedQuery,
                  )}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
