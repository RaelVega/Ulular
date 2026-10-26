function MarqueeBlock() {
  return (
    <span className="inline-flex items-center">
      <span className="text-accent font-semibold mx-3">¡RESERVA YA!</span>
      <span>
        · SALA DE ENSAYO EN EL CENTRO DE QUERÉTARO · BACKLINE Y SONORIZACIÓN DE
        EVENTOS · LIVE SESSIONS &amp; 360° · FOTOGRAFÍA PARA BANDAS ·{" "}
      </span>
    </span>
  );
}

export function Marquee() {
  return (
    <div
      className="ulular-marquee whitespace-nowrap overflow-hidden border-y border-tolex py-3 bg-ink-2 font-mono-specs font-normal tracking-[0.16em] text-xs sm:text-sm text-bone uppercase select-none"
      aria-label="¡Reserva ya! Sala de ensayo en el Centro de Querétaro, backline y sonorización de eventos, Live Sessions 360 y fotografía para bandas."
    >
      <span className="ulular-marquee-track" aria-hidden="true">
        <MarqueeBlock />
        <MarqueeBlock />
        <MarqueeBlock />
        <MarqueeBlock />
      </span>
    </div>
  );
}
