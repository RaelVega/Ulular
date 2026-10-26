"use client";

import { BrandIcon } from "@/components/ui/BrandIcon";
import { WHATSAPP_DISPLAY } from "@/lib/constants";
import { buildSpecialScheduleWhatsAppUrl } from "@/lib/whatsapp";

/**
 * Botón flotante de WhatsApp para escritorio (lg+):
 * En móvil vive alineado junto a "Reserva tu ensayo" en MobileBar.
 */
export function WhatsAppFloat() {
  return (
    <a
      href={buildSpecialScheduleWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Mandar mensaje por WhatsApp a Ulular (${WHATSAPP_DISPLAY})`}
      title={`WhatsApp · ${WHATSAPP_DISPLAY}`}
      style={{ borderRadius: "9999px" }}
      className="group hidden lg:inline-flex fixed right-6 bottom-6 z-40 items-center justify-center w-14 h-14 rounded-full bg-[#25D366] shadow-[0_0_25px_rgba(37,211,102,0.55)] hover:scale-110 active:scale-95 transition-transform duration-200"
    >
      <span
        aria-hidden="true"
        style={{ borderRadius: "9999px" }}
        className="pointer-events-none absolute inset-0 rounded-full border-2 border-[#25D366] animate-ping opacity-65"
      />
      <span
        aria-hidden="true"
        style={{ borderRadius: "9999px", animationDelay: "0.7s" }}
        className="pointer-events-none absolute -inset-2 rounded-full border border-[#25D366]/60 animate-pulse"
      />
      <BrandIcon network="whatsapp" className="relative z-10 w-9 h-9" />
    </a>
  );
}
