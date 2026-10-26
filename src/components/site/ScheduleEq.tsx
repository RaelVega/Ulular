"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { SCHEDULE_DISPLAY } from "@/lib/constants";

/**
 * A10 · Ecualizador de horario: barras verticales por día cuya altura
 * representa las horas abiertas; se llenan al entrar en viewport (DESIGN.md §4).
 */
export function ScheduleEq() {
  const ref = useRef<HTMLDivElement | null>(null);
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
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="grid grid-cols-7 gap-2 sm:gap-3 items-end h-[220px] w-full max-w-xl font-mono-specs"
      aria-label="Gráfica de horarios de apertura por día"
    >
      {SCHEDULE_DISPLAY.map((day) => (
        <div
          key={day.key}
          className="flex flex-col items-center justify-end gap-2 h-full"
        >
          <div
            style={
              {
                height: inView ? `${day.eqPercent}%` : "0%",
                backgroundImage: day.byAppointmentOnly
                  ? "repeating-linear-gradient(to top, var(--color-smoke) 0 2px, transparent 2px 10px)"
                  : day.eqPercent >= 100
                    ? "repeating-linear-gradient(to top, var(--color-accent) 0 6px, transparent 6px 10px)"
                    : "repeating-linear-gradient(to top, var(--color-bone) 0 6px, transparent 6px 10px)",
              } as CSSProperties
            }
            className="w-full border-t-2 border-accent/80 transition-[height] duration-1000 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
          />
          <span className="text-[0.7rem] text-ash">{day.shortLabel}</span>
        </div>
      ))}
    </div>
  );
}
