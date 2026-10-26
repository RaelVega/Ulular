"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandIcon, type BrandNetwork } from "@/components/ui/BrandIcon";
import { StudioIcon } from "@/components/ui/StudioIcon";
import { WHATSAPP_CHANNEL_URL, WHATSAPP_DISPLAY } from "@/lib/constants";
import { loadStoredSocialLinks } from "@/lib/events-store";
import { buildSpecialScheduleWhatsAppUrl } from "@/lib/whatsapp";

/**
 * Apartado de Canales Oficiales (#redes):
 * Conserva el logo original a color de cada plataforma junto con el nombre de la red
 * y su usuario/canal, sin numeración de sección.
 */
export function SocialsSection() {
  const [links, setLinks] = useState(() => loadStoredSocialLinks());

  useEffect(() => {
    const refresh = () => setLinks(loadStoredSocialLinks());
    refresh();
    window.addEventListener("ulular-socials-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("ulular-socials-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const rawItems: {
    network: BrandNetwork;
    name: string;
    handle: string;
    url: string;
  }[] = [
    {
      network: "whatsapp",
      name: "WhatsApp",
      handle: WHATSAPP_DISPLAY,
      url: buildSpecialScheduleWhatsAppUrl(),
    },
    {
      network: "instagram",
      name: "Instagram",
      handle: "@ulularsala",
      url: links.instagram,
    },
    {
      network: "facebook",
      name: "Facebook",
      handle: "/ulularsaladeensayo",
      url: links.facebook,
    },
    {
      network: "youtube",
      name: "YouTube",
      handle: "Ulular Live Sessions",
      url: links.youtube,
    },
    {
      network: "tiktok",
      name: "TikTok",
      handle: "@ulularsala",
      url: links.tiktok,
    },
    {
      network: "maps",
      name: "Google Maps",
      handle: "C. Primavera 32B, Centro",
      url: links.maps,
    },
  ];
  const items = rawItems.filter((item) =>
    Boolean(item.url && item.url.trim().length > 0),
  );

  return (
    <section
      id="redes"
      className="relative overflow-hidden border-t border-tolex px-5 sm:px-8 lg:px-16 py-16 sm:py-24"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2">
              <span
                aria-hidden="true"
                style={{ borderRadius: "9999px" }}
                className="w-2 h-2 rounded-full bg-accent"
              />
              <p className="font-label-caps text-ash">
                Comunidad y canales oficiales
              </p>
            </div>
            <h2 className="font-display-title text-[clamp(2.25rem,6vw,4rem)] mt-2">
              sigue el <span className="text-accent">ruido.</span>
            </h2>
          </div>

          <Link
            href="/admin/ajustes"
            aria-label="Editar redes en Ajustes"
            title="Editar redes en Ajustes"
            className="inline-flex items-center justify-center w-10 h-10 border border-tolex text-ash hover:text-bone hover:border-accent transition-colors self-start sm:self-auto"
          >
            <StudioIcon name="settings" className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 border-t border-l border-tolex">
          {items.map((item) => (
            <a
              key={item.name}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group border-r border-b border-tolex p-6 flex items-center justify-between gap-4 bg-ink-2 hover:bg-ink-3 hover:border-accent transition-all duration-200"
            >
              <div className="flex items-center gap-4 min-w-0">
                <BrandIcon
                  network={item.network}
                  className="w-9 h-9 group-hover:scale-110 transition-transform duration-200"
                />
                <div className="min-w-0">
                  <p className="font-label-caps text-[0.68rem] text-ash group-hover:text-accent transition-colors">
                    {item.name}
                  </p>
                  <p className="font-display-title text-xl sm:text-2xl text-bone truncate mt-0.5">
                    {item.handle.toLowerCase()}
                  </p>
                </div>
              </div>

              <StudioIcon
                name="external"
                className="w-4 h-4 text-smoke group-hover:text-accent shrink-0 transition-colors"
              />
            </a>
          ))}

          {/* Canal de difusión de WhatsApp */}
          <a
            href={WHATSAPP_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group border-r border-b border-tolex p-6 flex items-center justify-between gap-4 bg-ink-2 hover:bg-ink-3 hover:border-[#25D366] transition-all duration-200"
          >
            <div className="flex items-center gap-4 min-w-0">
              <BrandIcon
                network="whatsapp"
                className="w-9 h-9 group-hover:scale-110 transition-transform duration-200"
              />
              <div className="min-w-0">
                <p className="font-label-caps text-[0.68rem] text-[#25D366]">
                  Canal de difusión
                </p>
                <p className="font-display-title text-xl sm:text-2xl text-bone truncate mt-0.5">
                  comunidad ulular
                </p>
              </div>
            </div>

            <StudioIcon
              name="external"
              className="w-4 h-4 text-smoke group-hover:text-[#25D366] shrink-0 transition-colors"
            />
          </a>
        </div>
      </div>
    </section>
  );
}
