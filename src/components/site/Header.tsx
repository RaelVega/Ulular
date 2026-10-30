"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandIcon, type BrandNetwork } from "@/components/ui/BrandIcon";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { Rings } from "@/components/ui/Rings";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { WHATSAPP_CHANNEL_URL, WHATSAPP_DISPLAY } from "@/lib/constants";
import { loadStoredSocialLinks } from "@/lib/events-store";
import { buildSpecialScheduleWhatsAppUrl } from "@/lib/whatsapp";

const NAV_LINKS = [
  { href: "/#sala", label: "la sala & 360°" },
  { href: "/#backline", label: "catálogo backline" },
  { href: "/#live-sessions", label: "live sessions" },
  { href: "/#horarios", label: "horarios" },
  { href: "/#eventos", label: "eventos" },
  { href: "/#pizzeria", label: "napule pizza" },
  { href: "/#redes", label: "canales" },
  { href: "/#resenas", label: "reseñas" },
  { href: "/#ubicacion", label: "ubicación" },
] as const;

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolledPastWordmark, setScrolledPastWordmark] = useState(!isHome);
  const [scrolledPastHeroCta, setScrolledPastHeroCta] = useState(!isHome);
  const [pingKey, setPingKey] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [socials, setSocials] = useState(() => loadStoredSocialLinks());

  useEffect(() => {
    const refresh = () => setSocials(loadStoredSocialLinks());
    refresh();
    window.addEventListener("ulular-socials-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("ulular-socials-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    if (!isHome) {
      setScrolledPastWordmark(true);
      setScrolledPastHeroCta(true);
      return;
    }

    const heroMarker = document.getElementById("hero-wordmark");
    const ctaMarker = document.getElementById("hero-cta-anchor");

    const observers: IntersectionObserver[] = [];

    if (heroMarker) {
      const ioLogo = new IntersectionObserver(
        ([entry]) => {
          const isPast = !entry?.isIntersecting;
          setScrolledPastWordmark((prev) => {
            if (!prev && isPast) {
              setPingKey((k) => k + 1);
            }
            return isPast;
          });
        },
        { threshold: 0.12 },
      );
      ioLogo.observe(heroMarker);
      observers.push(ioLogo);
    } else {
      setScrolledPastWordmark(true);
    }

    if (ctaMarker) {
      const ioCta = new IntersectionObserver(
        ([entry]) => {
          setScrolledPastHeroCta(!entry?.isIntersecting);
        },
        { threshold: 0.1 },
      );
      ioCta.observe(ctaMarker);
      observers.push(ioCta);
    } else {
      setScrolledPastHeroCta(true);
    }

    return () => {
      observers.forEach((o) => o.disconnect());
    };
  }, [isHome]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const rawSocialIcons: {
    network: BrandNetwork;
    label: string;
    url: string;
  }[] = [
    {
      network: "whatsapp",
      label: `WhatsApp · ${WHATSAPP_DISPLAY}`,
      url: buildSpecialScheduleWhatsAppUrl(),
    },
    { network: "instagram", label: "Instagram", url: socials.instagram },
    { network: "facebook", label: "Facebook", url: socials.facebook },
    { network: "youtube", label: "YouTube", url: socials.youtube },
    { network: "tiktok", label: "TikTok", url: socials.tiktok },
    { network: "maps", label: "Google Maps", url: socials.maps },
  ];
  const socialIcons = rawSocialIcons.filter((item) =>
    Boolean(item.url && item.url.trim().length > 0),
  );

  const showHeaderLogo = scrolledPastWordmark || menuOpen;
  const showDesktopHeaderCta = (scrolledPastHeroCta || menuOpen) && pathname !== "/reservar";

  return (
    <>
      {/* Barra superior:
          - Izquierda: Logo Ulular (aparece al pasar el logo principal del Hero)
          - Derecha: Botón "Reserva tu ensayo" (en computadora lg+, aparece al pasar el botón del Hero) + Selector de tema/acento + Menú */}
      <header
        className={`fixed inset-x-0 top-0 z-45 bg-ink/95 backdrop-blur-sm transition-colors duration-300 border-b ${
          showHeaderLogo || showDesktopHeaderCta
            ? "border-tolex"
            : "border-tolex/40"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 sm:px-8 lg:px-12 pt-[calc(0.6rem+env(safe-area-inset-top))] pb-2.5">
          {/* Izquierda: Logo */}
          <Link
            href="/"
            aria-label="Ulular Sala de Ensayo, ir al inicio"
            tabIndex={showHeaderLogo ? 0 : -1}
            className={`inline-flex shrink-0 transition-all duration-300 ${
              showHeaderLogo
                ? "opacity-100 translate-y-0 pointer-events-auto hover:opacity-90"
                : "opacity-0 -translate-y-1.5 pointer-events-none select-none"
            }`}
          >
            <Logo key={pingKey} variant="horizontal" ping={pingKey > 0} />
          </Link>

          {/* Derecha: Botón Reserva tu ensayo (lg+, aparece al bajar del Hero) + Selector de color/tema + Botón de menú */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <div
              className={`hidden lg:flex items-center transition-all duration-300 ${
                showDesktopHeaderCta
                  ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                  : "opacity-0 -translate-y-1.5 scale-95 pointer-events-none select-none"
              }`}
            >
              <Button
                href="/reservar"
                className="!min-h-[40px] h-10 !py-0 px-4 text-[0.72rem] whitespace-nowrap"
              >
                Reserva tu ensayo
              </Button>
            </div>
            <ThemeToggle compact />
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="ulular-site-menu"
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              className="inline-flex items-center justify-center text-bone border border-tolex bg-ink-2 h-10 w-10 shrink-0 cursor-pointer hover:border-accent transition-colors"
            >
              {menuOpen ? (
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 text-accent"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M4 7h16M4 12h16M4 17h10" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Menú pantalla completa con la tipografía display tanto en celular como en monitor */}
      {menuOpen && (
        <div
          id="ulular-site-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación"
          className="fixed inset-0 z-40 bg-ink flex flex-col justify-between px-6 sm:px-12 lg:px-24 pt-[calc(5.25rem+env(safe-area-inset-top))] pb-[calc(2rem+env(safe-area-inset-bottom))] overflow-y-auto"
        >
          <Rings
            variant="pulse"
            strokeWidth={0.35}
            className="pointer-events-none absolute -right-24 -bottom-24 w-[95vw] max-w-[680px] text-smoke opacity-25"
          />

          <nav
            aria-label="Menú principal"
            className="relative z-10 max-w-4xl w-full mx-auto flex flex-col gap-2.5 sm:gap-3.5 my-auto"
          >
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between py-2 border-b border-tolex group"
              >
                <span className="font-display-title text-3xl sm:text-5xl lg:text-6xl text-bone group-hover:text-accent transition-colors">
                  {item.label}
                </span>
                <span
                  aria-hidden="true"
                  style={{ borderRadius: "9999px" }}
                  className="w-2.5 h-2.5 rounded-full bg-tolex group-hover:bg-accent group-hover:scale-125 transition-all"
                />
              </Link>
            ))}
          </nav>

          <div className="relative z-10 max-w-4xl w-full mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6">
            <Button
              href="/reservar"
              onClick={() => setMenuOpen(false)}
              className="w-full sm:w-auto"
            >
              Reserva tu ensayo
            </Button>

            <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3">
              <div className="flex items-center gap-2">
                {socialIcons.map((item) => (
                  <a
                    key={item.network}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    title={item.label}
                    className="inline-flex items-center justify-center w-10 h-10 border border-tolex bg-ink-2 hover:border-accent hover:scale-110 transition-all"
                  >
                    <BrandIcon network={item.network} className="w-5 h-5" />
                  </a>
                ))}
              </div>
              <a
                href={WHATSAPP_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono-specs text-xs text-ash underline underline-offset-4 hover:text-bone py-2"
              >
                Canal WA
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
