"use client";

import { useEffect, useState } from "react";
import { BrandIcon } from "@/components/ui/BrandIcon";
import { Button } from "@/components/ui/Button";
import { WHATSAPP_DISPLAY } from "@/lib/constants";
import { buildSpecialScheduleWhatsAppUrl } from "@/lib/whatsapp";

/**
 * Barra fija inferior en móvil e iPad vertical (<1024px):
 * Botón "Reserva tu ensayo" alineado en la misma fila con el botón circular de WhatsApp
 * (sin el botón negro duplicado).
 */
export function MobileBar() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > lastY && y > 200);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      aria-label="Acciones rápidas"
      className={`fixed inset-x-0 bottom-0 z-35 flex items-center gap-3 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-ink/95 backdrop-blur-sm border-t border-tolex transition-transform duration-300 lg:hidden ${
        hidden ? "translate-y-full" : "translate-y-0"
      }`}
    >
      <Button href="/reservar" className="flex-1">
        Reserva tu ensayo
      </Button>

      <a
        href={buildSpecialScheduleWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Escribir por WhatsApp a Ulular (${WHATSAPP_DISPLAY})`}
        title={`WhatsApp · ${WHATSAPP_DISPLAY}`}
        style={{ borderRadius: "9999px" }}
        className="relative inline-flex items-center justify-center w-[52px] h-[52px] shrink-0 rounded-full bg-[#25D366] shadow-[0_0_20px_rgba(37,211,102,0.5)] active:scale-95 transition-transform"
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
