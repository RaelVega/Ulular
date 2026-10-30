"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandIcon } from "@/components/ui/BrandIcon";
import { Button } from "@/components/ui/Button";
import { WHATSAPP_DISPLAY } from "@/lib/constants";
import { buildSpecialScheduleWhatsAppUrl } from "@/lib/whatsapp";

/**
 * Botones flotantes inferiores para celular y tablet (<1024px):
 * - Sin barra negra de fondo (100% flotantes sobre el contenido).
 * - El botón "Reserva tu ensayo" aparece únicamente después de deslizar hacia abajo
 *   cuando desaparece el botón principal del Hero, y permanece fijo al lado del de WhatsApp.
 */
export function MobileBar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolledPastHeroCta, setScrolledPastHeroCta] = useState(!isHome);

  useEffect(() => {
    if (!isHome) {
      setScrolledPastHeroCta(true);
      return;
    }

    const ctaMarker =
      document.getElementById("hero-cta-anchor") ??
      document.getElementById("hero-wordmark");

    if (!ctaMarker) {
      setScrolledPastHeroCta(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        setScrolledPastHeroCta(!entry?.isIntersecting);
      },
      { threshold: 0.1 },
    );

    io.observe(ctaMarker);
    return () => io.disconnect();
  }, [isHome]);

  const showReserveBtn = scrolledPastHeroCta && pathname !== "/reservar";

  return (
    <nav
      aria-label="Acciones rápidas flotantes"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-35 flex items-center justify-end gap-3 px-4 pb-[calc(0.85rem+env(safe-area-inset-bottom))] pt-2 lg:hidden"
    >
      <div
        className={`flex-1 transition-all duration-300 ${
          showReserveBtn
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 translate-y-4 scale-95 pointer-events-none select-none"
        }`}
      >
        <Button
          href="/reservar"
          className="w-full shadow-[0_10px_28px_rgba(0,0,0,0.85),0_0_24px_var(--theme-accent-soft)]"
        >
          Reserva tu ensayo
        </Button>
      </div>

      <a
        href={buildSpecialScheduleWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Escribir por WhatsApp a Ulular (${WHATSAPP_DISPLAY})`}
        title={`WhatsApp · ${WHATSAPP_DISPLAY}`}
        style={{ borderRadius: "9999px" }}
        className="pointer-events-auto relative inline-flex items-center justify-center w-[52px] h-[52px] shrink-0 rounded-full bg-[#25D366] shadow-[0_8px_24px_rgba(0,0,0,0.75),0_0_20px_rgba(37,211,102,0.5)] active:scale-95 transition-transform"
      >
        <span
          aria-hidden="true"
          style={{ borderRadius: "9999px" }}
          className="pointer-events-none absolute inset-0 rounded-full border-2 border-[#25D366] animate-ping opacity-60"
        />
        <BrandIcon network="whatsapp" className="relative z-10 w-8 h-8" />
      </a>
    </nav>
  );
}
