import type { Metadata } from "next";
import { EventsSection } from "@/components/site/EventsSection";

export const metadata: Metadata = {
  title: "Eventos y Tocadas",
  description:
    "Próximos eventos, tocadas, open mic, Ulular Live Sessions y archivo de eventos pasados en Ulular Sala de Ensayo y Ulular Napule Pizza (Querétaro).",
};

export default function EventosPage() {
  return (
    <section className="px-5 sm:px-8 lg:px-16 pt-[calc(6rem+env(safe-area-inset-top))] pb-24 max-w-7xl mx-auto">
      <EventsSection showAll />
    </section>
  );
}
