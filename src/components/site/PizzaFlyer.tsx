"use client";

import { useEffect, useState } from "react";
import { WHATSAPP_CHANNEL_URL } from "@/lib/constants";
import { loadStoredSocialLinks } from "@/lib/events-store";
import { BrandIcon } from "@/components/ui/BrandIcon";
import { NapulePizzaLogo } from "@/components/ui/NapulePizzaLogo";

/**
 * Apartado de Ulular Napule Pizza con logo vectorial animado +
 * iconos limpios de redes de la pizzería + canal de difusión de WhatsApp.
 */
export function PizzaFlyer() {
  const [socials, setSocials] = useState(() => loadStoredSocialLinks());

  useEffect(() => {
    setSocials(loadStoredSocialLinks());
    const onUpdate = () => setSocials(loadStoredSocialLinks());
    window.addEventListener("ulular-socials-updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("ulular-socials-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
      <div className="lg:col-span-7">
        {/* Flyer físico papel hueso con el logo vectorial animado */}
        <div className="group ulular-flyer relative bg-[#F2EFE8] text-[#0A0A0A] max-w-xl p-6 sm:p-9 mx-auto lg:mx-0 border border-[#0A0A0A] shadow-xl grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
          <div className="sm:col-span-5 flex justify-center">
            <NapulePizzaLogo className="w-48 sm:w-full max-w-[215px] text-[#0A0A0A]" />
          </div>

          <div className="sm:col-span-7">
            <p className="font-label-caps text-[#0A0A0A]/70">
              Después del ensayo · Foro & Pizzería
            </p>
            <h3 className="font-display-title text-3xl sm:text-4xl mt-1.5 text-[#0A0A0A]">
              ulular napule pizza
            </h3>
            <p className="mt-3 text-sm text-[#0A0A0A]/90">
              Pizza napolitana, open mic, sesiones en vivo y tocadas en el mismo
              espacio para bandas.
            </p>

            {/* Solo iconos para las redes de la pizzería */}
            <div className="mt-5 flex items-center gap-3">
              {socials.pizzaInstagram && (
                <a
                  href={socials.pizzaInstagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram de Ulular Napule Pizza"
                  title="Instagram de Ulular Napule Pizza"
                  className="inline-flex items-center justify-center w-11 h-11 bg-[#0A0A0A] border border-[#0A0A0A] hover:scale-110 transition-transform"
                >
                  <BrandIcon network="instagram" className="w-5 h-5" />
                </a>
              )}
              {socials.pizzaFacebook && (
                <a
                  href={socials.pizzaFacebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook de Ulular Napule Pizza"
                  title="Facebook de Ulular Napule Pizza"
                  className="inline-flex items-center justify-center w-11 h-11 bg-[#0A0A0A] border border-[#0A0A0A] hover:scale-110 transition-transform"
                >
                  <BrandIcon network="facebook" className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-5 flex flex-col items-start gap-4 border-t lg:border-t-0 lg:border-l border-tolex pt-8 lg:pt-0 lg:pl-10">
        <div className="inline-flex items-center gap-2">
          <BrandIcon network="whatsapp" className="w-5 h-5" />
          <p className="font-label-caps text-ash">Comunidad · WhatsApp</p>
        </div>
        <h3 className="font-display-title text-3xl sm:text-5xl">
          únete al canal.
        </h3>
        <p className="text-ash max-w-md">
          Tocadas, convocatorias de open mic, horarios libres de último minuto y
          promos de la sala directo en tu WhatsApp.
        </p>
        <div className="pt-2">
          <a
            href={WHATSAPP_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Entrar al canal de difusión de WhatsApp"
            title="Entrar al canal de difusión de WhatsApp"
            className="group inline-flex items-center gap-3 min-h-[48px] px-4 border border-bone hover:border-[#25D366] bg-ink text-bone transition-all"
          >
            <BrandIcon
              network="whatsapp"
              className="w-6 h-6 group-hover:scale-110 transition-transform"
            />
            <span className="font-mono-specs text-xs tracking-wider uppercase">
              Canal
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
