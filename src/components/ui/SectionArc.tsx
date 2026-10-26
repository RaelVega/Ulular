"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A6 · Separador vibrante: arco de medio anillo de borde a borde
 * que vibra una vez al entrar en el viewport (DESIGN.md §4).
 */
export function SectionArc({ className = "" }: { className?: string }) {
  const ref = useRef<SVGSVGElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <svg
      ref={ref}
      viewBox="0 0 1200 60"
      preserveAspectRatio="none"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      className={`block w-full h-[52px] text-smoke ${
        inView ? "ulular-arc-vibrate" : ""
      } ${className}`.trim()}
    >
      <path d="M0 60 Q600 -50 1200 60" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
