"use client";

import { useEffect, useRef, type CSSProperties } from "react";

export type OrbitsVariant = "loader" | "stepper" | "confirm" | "static";

export interface OrbitsProps {
  variant?: OrbitsVariant;
  count?: number;
  /** Paso actual (1..count) cuando variant === "stepper" */
  activeStep?: number;
  /** Incrementar este contador dispara o repite la animación en variant === "confirm" */
  triggerKey?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  label?: string;
}

/**
 * Círculos concéntricos centrados (cx=60, cy=60):
 * Conservan la esencia de ondas de sonido para carga (A3), progreso (A8)
 * y confirmación (A9) sin usar el logo de la sala (DESIGN.md §3.3 y §4).
 */
export function Orbits({
  variant = "loader",
  count = 5,
  activeStep = 1,
  triggerKey = 0,
  size = 140,
  strokeWidth = 1.2,
  className = "",
  label,
}: OrbitsProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const rMax = 52;
  const rMin = 12;

  const radii = Array.from({ length: count }, (_, i) =>
    count === 1 ? rMax : Number((rMax - ((rMax - rMin) * i) / (count - 1)).toFixed(2)),
  );

  // A9 · Confirmación mediante Web Animations API para que pueda repetirse siempre
  useEffect(() => {
    if (variant !== "confirm" || !svgRef.current) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const paths = svgRef.current.querySelectorAll("path");
    paths.forEach((p, i) => {
      p.getAnimations().forEach((a) => a.cancel());
      p.animate(
        [
          { transform: "scale(1)", strokeWidth: String(strokeWidth) },
          { transform: "scale(0.08)", strokeWidth: "2.4", offset: 0.42 },
          { transform: "scale(1.06)", strokeWidth: "1.8", offset: 0.78 },
          { transform: "scale(1)", strokeWidth: String(strokeWidth) },
        ],
        {
          duration: 1050,
          delay: i * 45,
          easing: "cubic-bezier(.25,.9,.3,1)",
          fill: "both",
        },
      );
    });
  }, [variant, triggerKey, strokeWidth]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 120 120"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      className={`ulular-orbits ${
        variant === "loader" ? "ulular-orbits-draw" : ""
      } ${className}`.trim()}
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {radii.map((r, i) => {
        // En stepper encendemos de adentro hacia afuera (índice invertido)
        const stepIndexFromInner = count - 1 - i;
        const isCompleted = variant === "stepper" && stepIndexFromInner < activeStep;
        const isCurrent = variant === "stepper" && stepIndexFromInner === activeStep - 1;

        return (
          <path
            key={r}
            d={`M60 ${(60 - r).toFixed(2)}a${r} ${r} 0 1 1 -0.001 0`}
            pathLength={variant === "loader" ? 1 : undefined}
            style={{ "--orbit-i": i } as CSSProperties}
            className={
              variant === "stepper"
                ? `transition-all duration-300 ${
                    isCurrent
                      ? "stroke-white stroke-[2.8] scale-[1.03]"
                      : isCompleted
                        ? "stroke-bone stroke-[2.2]"
                        : "stroke-smoke stroke-[1.2]"
                  }`
                : undefined
            }
          />
        );
      })}
    </svg>
  );
}
