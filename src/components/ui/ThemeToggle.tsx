"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export type ThemeMode = "dark" | "light";
export type AccentTone =
  | "blue"
  | "purple"
  | "amber"
  | "crimson"
  | "emerald"
  | "mono";

const ACCENT_OPTIONS: { id: AccentTone; label: string; swatch: string }[] = [
  { id: "blue", label: "Azul estudio", swatch: "#3B82F6" },
  { id: "purple", label: "Morado escena", swatch: "#A855F7" },
  { id: "amber", label: "Ámbar bulbo", swatch: "#F59E0B" },
  { id: "crimson", label: "Rojo consola", swatch: "#EF4444" },
  { id: "emerald", label: "Verde nivel", swatch: "#10B981" },
  { id: "mono", label: "Monocromo", swatch: "#9A9A9A" },
];

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;
  const storageKey = isAdmin ? "ulular_admin_theme_v1" : "ulular_site_theme_v1";
  const defaultTheme: ThemeMode = isAdmin ? "light" : "dark";

  const [theme, setTheme] = useState<ThemeMode>(defaultTheme);
  const [accent, setAccent] = useState<AccentTone>("blue");
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncFromStorage = () => {
      const savedTheme = window.localStorage.getItem(
        storageKey,
      ) as ThemeMode | null;
      const nextTheme: ThemeMode =
        savedTheme === "light" || savedTheme === "dark"
          ? savedTheme
          : defaultTheme;

      const savedAccent = window.localStorage.getItem(
        "ulular_accent_v1",
      ) as AccentTone | null;
      const nextAccent: AccentTone =
        savedAccent && ACCENT_OPTIONS.some((a) => a.id === savedAccent)
          ? savedAccent
          : "blue";

      setTheme(nextTheme);
      setAccent(nextAccent);
      document.documentElement.setAttribute("data-theme", nextTheme);
      document.documentElement.setAttribute("data-accent", nextAccent);
    };

    syncFromStorage();
    window.addEventListener("ulular-theme-updated", syncFromStorage);
    window.addEventListener("storage", syncFromStorage);
    return () => {
      window.removeEventListener("ulular-theme-updated", syncFromStorage);
      window.removeEventListener("storage", syncFromStorage);
    };
  }, [storageKey, defaultTheme]);

  const toggleTheme = () => {
    const next: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, next);
      window.dispatchEvent(new Event("ulular-theme-updated"));
    }
  };

  const selectAccent = (nextAccent: AccentTone) => {
    setAccent(nextAccent);
    document.documentElement.setAttribute("data-accent", nextAccent);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("ulular_accent_v1", nextAccent);
      window.dispatchEvent(new Event("ulular-theme-updated"));
    }
    setPaletteOpen(false);
  };

  const currentAccent =
    ACCENT_OPTIONS.find((a) => a.id === accent) ?? ACCENT_OPTIONS[0]!;

  return (
    <div className="relative inline-flex items-center gap-1.5 shrink-0">
      {/* Botón Claro / Oscuro */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={
          theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
        }
        title={
          theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
        }
        className={`inline-flex items-center justify-center gap-1.5 border border-tolex bg-ink-2 hover:border-accent text-bone h-10 ${
          compact ? "w-10 px-0" : "px-3"
        } font-mono-specs text-[0.68rem] uppercase tracking-wider cursor-pointer transition-colors shrink-0`}
      >
        {theme === "dark" ? (
          <>
            <svg
              viewBox="0 0 20 20"
              aria-hidden="true"
              className="w-4 h-4 text-accent shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
            >
              <circle cx="10" cy="10" r="3.5" />
              <path d="M10 2v2.2M10 15.8V18M2 10h2.2M15.8 10H18M4.3 4.3l1.6 1.6M14.1 14.1l1.6 1.6M15.7 4.3l-1.6 1.6M5.9 14.1l-1.6 1.6" />
            </svg>
            {!compact && <span>Oscuro</span>}
          </>
        ) : (
          <>
            <svg
              viewBox="0 0 20 20"
              aria-hidden="true"
              className="w-4 h-4 text-accent shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
            >
              <path d="M15.5 12.8A6.5 6.5 0 0 1 7.2 4.5a6.5 6.5 0 1 0 8.3 8.3Z" />
            </svg>
            {!compact && <span>Claro</span>}
          </>
        )}
      </button>

      {/* Selector de acento en vivo */}
      <button
        type="button"
        onClick={() => setPaletteOpen((v) => !v)}
        aria-label="Cambiar color de acento"
        title="Probar color de acento"
        className={`inline-flex items-center justify-center gap-1.5 border border-tolex bg-ink-2 hover:border-accent text-bone h-10 ${
          compact ? "w-10 px-0" : "px-3"
        } font-mono-specs text-[0.68rem] cursor-pointer transition-colors shrink-0`}
      >
        <span
          style={{
            backgroundColor: currentAccent.swatch,
            borderRadius: "9999px",
          }}
          className="w-3 h-3 inline-block shrink-0"
        />
        {!compact && <span className="hidden sm:inline">Acento</span>}
      </button>

      {paletteOpen && (
        <div className="absolute right-0 top-full mt-1.5 z-50 border border-tolex bg-ink-2 p-2 shadow-lg min-w-[175px]">
          <p className="font-label-caps text-[0.58rem] text-ash px-2 py-1 border-b border-tolex mb-1">
            Color de acento
          </p>
          <div className="flex flex-col gap-0.5">
            {ACCENT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => selectAccent(opt.id)}
                className={`flex items-center justify-between gap-2 px-2 py-1.5 text-left font-mono-specs text-xs cursor-pointer transition-colors ${
                  accent === opt.id
                    ? "bg-ink-3 text-bone font-medium"
                    : "text-ash hover:text-bone hover:bg-ink-3"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    style={{
                      backgroundColor: opt.swatch,
                      borderRadius: "9999px",
                    }}
                    className="w-2.5 h-2.5 inline-block shrink-0"
                  />
                  {opt.label}
                </span>
                {accent === opt.id && (
                  <span className="text-accent text-[0.65rem]">●</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
