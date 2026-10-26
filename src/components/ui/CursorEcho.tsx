"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A5 · Eco del cursor: punto central + círculo concéntrico que sigue al puntero con retraso
 * en desktop (puntero fino). Se oculta automáticamente en pantallas táctiles.
 */
export function CursorEcho() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isFinePointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
    const isReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (!isFinePointer || isReducedMotion) return;
    setEnabled(true);

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let rx = x;
    let ry = y;
    let initialized = false;
    let rafId = 0;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType && e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      if (!initialized) {
        rx = x;
        ry = y;
        initialized = true;
        setVisible(true);
      }

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      }

      const target = e.target as HTMLElement | null;
      setExpanded(
        Boolean(
          target?.closest(
            "a, button, [role='button'], input, select, textarea, label",
          ),
        ),
      );
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => {
      if (initialized) setVisible(true);
    };

    const loop = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      }
      rafId = window.requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    rafId = window.requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      {/* Punto central exacto */}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{ borderRadius: "9999px" }}
        className={`fixed left-0 top-0 z-[70] pointer-events-none w-2 h-2 rounded-full bg-accent transition-opacity duration-150 hidden lg:block ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />
      {/* Aro concéntrico con eco */}
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{ borderRadius: "9999px" }}
        className={`fixed left-0 top-0 z-[70] pointer-events-none rounded-full border transition-[width,height,opacity,border-color,background-color] duration-200 hidden lg:block ${
          visible ? "opacity-100" : "opacity-0"
        } ${
          expanded
            ? "w-14 h-14 border-accent bg-accent-soft"
            : "w-9 h-9 border-bone/80 bg-transparent"
        }`}
      />
    </>
  );
}
