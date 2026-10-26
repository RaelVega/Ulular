import { Rings } from "./Rings";

export type LogoVariant = "vertical" | "horizontal" | "mark";

export interface LogoProps {
  variant?: LogoVariant;
  animated?: boolean;
  ping?: boolean;
  className?: string;
}

/**
 * Identidad principal de Ulular Sala de Ensayo (DESIGN.md §3.1):
 * - vertical: anillos arriba + "ulular" + "SALA DE ENSAYO" centrados
 * - horizontal: mini anillos + "ulular" / "SALA DE ENSAYO" para header/footer/admin
 * - mark: solo los 12 anillos tangentes
 */
export function Logo({
  variant = "horizontal",
  animated = false,
  ping = false,
  className = "",
}: LogoProps) {
  if (variant === "mark") {
    return (
      <Rings
        variant={animated ? "pulse" : ping ? "ping" : "static"}
        strokeWidth={1.3}
        className={className}
        ariaLabel="Ulular Sala de Ensayo"
      />
    );
  }

  if (variant === "vertical") {
    return (
      <div
        className={`inline-flex flex-col items-center text-center text-white select-none ${className}`.trim()}
        aria-label="Ulular Sala de Ensayo"
      >
        <Rings
          variant={animated ? "hero" : "static"}
          strokeWidth={0.85}
          className="w-full max-w-[260px]"
        />
        <span
          className={`font-display-title text-5xl sm:text-6xl mt-3 ${
            animated ? "ulular-wordmark-anim" : ""
          }`}
          aria-hidden="true"
        >
          ulular
        </span>
        <span
          className={`font-label-caps text-xs tracking-[0.14em] mt-2 text-bone ${
            animated ? "ulular-tagline-anim" : ""
          }`}
          aria-hidden="true"
        >
          Sala de ensayo
        </span>
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-2.5 text-white select-none ${className}`.trim()}
    >
      <Rings
        variant={ping ? "ping" : animated ? "pulse" : "static"}
        strokeWidth={2.8}
        className="w-8 h-8 shrink-0"
      />
      <span className="flex flex-col leading-none">
        <strong className="font-display font-extrabold text-[1.35rem] tracking-[-0.035em] lowercase">
          ulular
        </strong>
        <small className="font-label text-[0.45rem] tracking-[0.14em] uppercase text-bone mt-0.5">
          Sala de ensayo
        </small>
      </span>
    </span>
  );
}
