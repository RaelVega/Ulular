import { useId } from "react";

export type NapuleLogoMode = "svg" | "raster";
export type NapuleLogoTone = "ink" | "bone";

export interface NapulePizzaLogoProps {
  mode?: NapuleLogoMode;
  tone?: NapuleLogoTone;
  className?: string;
}

const VINYL_RADII = [94, 86.5, 79, 71.5, 64, 56.5, 49, 41.5, 34, 26.5] as const;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: Number((cx + r * Math.cos(rad)).toFixed(2)),
    y: Number((cy + r * Math.sin(rad)).toFixed(2)),
  };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
) {
  const start = polarToCartesian(cx, cy, r, startDeg);
  const end = polarToCartesian(cx, cy, r, endDeg);
  const sweep = ((endDeg - startDeg) % 360 + 360) % 360;
  const largeArc = sweep > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

/**
 * Logo vectorial de Ulular Napule Pizza:
 * - Arco superior e inferior completos "NAPULE PIZZA" sin recortes.
 * - 10 anillos concéntricos con corte limpio de rebanada.
 * - Rebanada elevada con borde de orilla (cornicione) limpio — sin mango de espátula —
 *   y caída limpia y orgánica entre cada anillo.
 */
export function NapulePizzaLogo({
  className = "",
}: NapulePizzaLogoProps) {
  const uid = useId().replace(/:/g, "");
  const topArcId = `napule-top-${uid}`;
  const bottomArcId = `napule-bot-${uid}`;

  const cx = 144;
  const cy = 144;
  // Desplazamiento de la rebanada en dirección -30° (arriba a la derecha)
  const sliceDx = 20;
  const sliceDy = -16;
  const scx = cx + sliceDx;
  const scy = cy + sliceDy;
  const cutStartDeg = 304; // -56°
  const cutEndDeg = 354; // -6°

  return (
    <svg
      viewBox="0 0 300 332"
      fill="none"
      stroke="currentColor"
      role="img"
      aria-label="Ulular Napule Pizza"
      className={`select-none overflow-visible ${className}`.trim()}
    >
      <defs>
        {/* Trayectorias curvas para NAPULE PIZZA arriba y abajo */}
        <path
          id={topArcId}
          d={describeArc(cx, cy, 115, 208, 294)}
          fill="none"
        />
        <path
          id={bottomArcId}
          d={describeArc(cx, cy, 121, 146, 34).replace("0 1 1", "0 0 0")}
          fill="none"
        />
      </defs>

      {/* Arcos laterales exteriores */}
      <path
        d={describeArc(cx, cy, 114, 152, 202)}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d={describeArc(cx, cy, 114, 346, 28)}
        strokeWidth="2.4"
        strokeLinecap="round"
      />

      {/* Texto curvo superior e inferior */}
      <text
        fill="currentColor"
        stroke="none"
        className="font-display font-extrabold text-[15px] tracking-[0.26em] uppercase"
      >
        <textPath href={`#${topArcId}`} startOffset="50%" textAnchor="middle">
          NAPULE PIZZA
        </textPath>
      </text>
      <text
        fill="currentColor"
        stroke="none"
        className="font-display font-extrabold text-[15px] tracking-[0.26em] uppercase"
      >
        <textPath href={`#${bottomArcId}`} startOffset="50%" textAnchor="middle">
          NAPULE PIZZA
        </textPath>
      </text>

      {/* Cuerpo principal de 10 anillos concéntricos (de 0° a 304°) */}
      <g strokeWidth="3.2" strokeLinecap="round">
        {VINYL_RADII.map((r) => (
          <path key={r} d={describeArc(cx, cy, r, 0, cutStartDeg)} />
        ))}
        {/* Bordes radiales limpios del corte */}
        <line
          x1={cx + 26.5}
          y1={cy}
          x2={cx + 94}
          y2={cy}
          strokeWidth="2.8"
        />
        <line
          x1={polarToCartesian(cx, cy, 26.5, cutStartDeg).x}
          y1={polarToCartesian(cx, cy, 26.5, cutStartDeg).y}
          x2={polarToCartesian(cx, cy, 94, cutStartDeg).x}
          y2={polarToCartesian(cx, cy, 94, cutStartDeg).y}
          strokeWidth="2.8"
        />
      </g>

      {/* Rebanada animada al pasar el cursor / tocar */}
      <g className="transition-transform duration-500 ease-out group-hover:translate-x-2 group-hover:-translate-y-2">
        {/* Anillos internos de la rebanada */}
        <g strokeWidth="3.1" strokeLinecap="round">
          {VINYL_RADII.map((r) => (
            <path
              key={r}
              d={describeArc(scx, scy, r, cutStartDeg, cutEndDeg)}
            />
          ))}

          {/* Borde exterior de la orilla de la rebanada (cornicione limpio, sin espátula) */}
          <path
            d={describeArc(scx, scy, 101.5, cutStartDeg - 1, cutEndDeg + 1)}
            strokeWidth="3.8"
          />

          {/* Lados radiales de la rebanada (incluyendo cierre con la orilla) */}
          <line
            x1={polarToCartesian(scx, scy, 26.5, cutStartDeg).x}
            y1={polarToCartesian(scx, scy, 26.5, cutStartDeg).y}
            x2={polarToCartesian(scx, scy, 101.5, cutStartDeg - 1).x}
            y2={polarToCartesian(scx, scy, 101.5, cutStartDeg - 1).y}
            strokeWidth="2.8"
          />
          <line
            x1={polarToCartesian(scx, scy, 26.5, cutEndDeg).x}
            y1={polarToCartesian(scx, scy, 26.5, cutEndDeg).y}
            x2={polarToCartesian(scx, scy, 101.5, cutEndDeg + 1).x}
            y2={polarToCartesian(scx, scy, 101.5, cutEndDeg + 1).y}
            strokeWidth="2.8"
          />
        </g>

        {/* Puentes limpios de queso fundido alineados con los anillos (estética geométrica de ondas) */}
        <g strokeLinecap="round">
          {[34, 49, 64, 79, 94].map((r, idx) => {
            const topPt = polarToCartesian(scx, scy, r, cutEndDeg);
            const botPt = { x: cx + r, y: cy };
            const midX = Number(((topPt.x + botPt.x) / 2 - 2).toFixed(1));
            const midY = Number(((topPt.y + botPt.y) / 2 + 2).toFixed(1));
            return (
              <path
                key={r}
                d={`M ${topPt.x} ${topPt.y} Q ${midX} ${midY} ${botPt.x} ${botPt.y}`}
                strokeWidth={idx % 2 === 0 ? "2.4" : "1.6"}
                strokeDasharray={idx % 2 === 1 ? "4 4" : undefined}
              />
            );
          })}
        </g>
      </g>

      {/* Wordmark inferior "ulular" */}
      <text
        x="148"
        y="314"
        textAnchor="middle"
        fill="currentColor"
        stroke="none"
        className="font-display font-black text-[64px] tracking-[-0.045em] lowercase"
      >
        ulular
      </text>
    </svg>
  );
}
