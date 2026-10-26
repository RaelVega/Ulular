import type { CSSProperties } from "react";
import { LOGO_RING_RADII } from "@/lib/constants";

export type RingsVariant = "static" | "pulse" | "hero" | "ping";

export interface RingsProps {
  variant?: RingsVariant;
  count?: number;
  strokeWidth?: number;
  className?: string;
  ariaLabel?: string;
}

/**
 * Símbolo oficial de Ulular: 12 anillos tangentes en la base (60, 116).
 * Reservado para el logo, hero, header y fondos de identidad (DESIGN.md §3.3).
 */
export function Rings({
  variant = "static",
  count = LOGO_RING_RADII.length,
  strokeWidth = 1,
  className = "",
  ariaLabel,
}: RingsProps) {
  const radii = LOGO_RING_RADII.slice(0, Math.min(count, LOGO_RING_RADII.length));

  const variantClass =
    variant === "hero"
      ? "ulular-hero-rings"
      : variant === "pulse"
        ? "ulular-pulse"
        : variant === "ping"
          ? "ulular-mini-ping"
          : "";

  const needsPathLength = variant === "hero";

  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      className={`ulular-rings ${variantClass} ${className}`.trim()}
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    >
      {radii.map((r, i) => (
        <path
          key={r}
          d={`M60 116a${r} ${r} 0 1 1 0.001 0`}
          pathLength={needsPathLength ? 1 : undefined}
          style={{ "--ring-i": i } as CSSProperties}
        />
      ))}
    </svg>
  );
}
