"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandIcon, type BrandNetwork } from "@/components/ui/BrandIcon";
import { Logo } from "@/components/ui/Logo";
import { Rings } from "@/components/ui/Rings";
import { StudioIcon } from "@/components/ui/StudioIcon";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  ADDRESS,
  WHATSAPP_CHANNEL_URL,
  WHATSAPP_DISPLAY,
} from "@/lib/constants";
import { loadStoredSocialLinks } from "@/lib/events-store";
import { buildSpecialScheduleWhatsAppUrl } from "@/lib/whatsapp";

export function Footer() {
  const [socials, setSocials] = useState(() => loadStoredSocialLinks());
  const currentYear = new Date().getFullYear();

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

  const rawFooterNetworks: {
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
  const footerNetworks = rawFooterNetworks.filter((item) =>
    Boolean(item.url && item.url.trim().length > 0),
  );

  return (
    <footer className="relative overflow-hidden border-t border-tolex px-5 sm:px-8 lg:px-16 pt-14 pb-[calc(6.5rem+env(safe-area-inset-bottom))] lg:pb-10">
      <Rings
        variant="static"
        strokeWidth={0.3}
        className="pointer-events-none absolute -right-28 -bottom-44 w-[520px] sm:w-[680px] text-smoke opacity-20"
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start pb-12 border-b border-tolex">
          <div className="md:col-span-5 flex flex-col items-start gap-3">
            <Logo variant="horizontal" />
            <p className="font-mono-specs text-xs text-ash mt-1">
              {ADDRESS.street}, {ADDRESS.neighborhood} · {ADDRESS.city}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <ThemeToggle compact />
              <Link
                href="/admin"
                aria-label="Panel de administración"
                title="Panel de administración"
                className="inline-flex items-center justify-center w-9 h-9 border border-tolex bg-ink-2 text-ash hover:text-bone hover:border-accent transition-colors"
              >
                <StudioIcon name="settings" className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="md:col-span-3 flex flex-col gap-2">
            <p className="font-label-caps text-accent mb-1">Secciones</p>
            <Link href="/reservar" className="text-sm hover:text-accent py-0.5">
              Reserva tu ensayo
            </Link>
            <Link href="/#sala" className="text-sm hover:text-accent py-0.5">
              La sala y backline
            </Link>
            <Link
              href="/#servicios"
              className="text-sm hover:text-accent py-0.5"
            >
              Live sessions y foto
            </Link>
            <Link href="/#eventos" className="text-sm hover:text-accent py-0.5">
              Eventos
            </Link>
          </div>

          <div className="md:col-span-4 flex flex-col gap-3">
            <p className="font-label-caps text-accent">Canales</p>
            <div className="flex flex-wrap items-center gap-2.5">
              {footerNetworks.map((item) => (
                <a
                  key={item.network}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  title={item.label}
                  className="inline-flex items-center justify-center w-11 h-11 border border-tolex bg-ink-2 hover:border-accent hover:scale-110 transition-all"
                >
                  <BrandIcon network={item.network} className="w-5 h-5" />
                </a>
              ))}
            </div>

            <div className="flex items-center gap-4 pt-2 text-xs text-ash font-mono-specs">
              <a
                href={WHATSAPP_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent underline underline-offset-4"
              >
                Canal de difusión WA →
              </a>
              <a
                href={socials.pizzaInstagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent underline underline-offset-4"
              >
                Napule Pizza →
              </a>
            </div>
          </div>
        </div>

        {/* Barra de Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono-specs text-xs text-smoke">
          <p>
            © {currentYear} Ulular Sala de Ensayo · Todos los derechos
            reservados.
          </p>
          <p>Centro · Santiago de Querétaro, Qro., México.</p>
        </div>
      </div>
    </footer>
  );
}
