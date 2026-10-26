"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CursorEcho } from "@/components/ui/CursorEcho";
import { Logo } from "@/components/ui/Logo";
import { StudioIcon, type StudioIconName } from "@/components/ui/StudioIcon";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  computeAdminBookingStats,
  loadStoredBookings,
} from "@/lib/bookings-store";

const ADMIN_NAV: {
  href: string;
  label: string;
  icon: StudioIconName;
  showPendingBadge?: boolean;
}[] = [
  { href: "/admin", label: "Consola", icon: "dashboard" },
  {
    href: "/admin/reservas",
    label: "Agenda y Reservas",
    icon: "clock",
    showPendingBadge: true,
  },
  { href: "/admin/eventos", label: "Eventos", icon: "calendar" },
  { href: "/admin/ajustes", label: "Ajustes y Usuarios", icon: "settings" },
  { href: "/reservar", label: "Vista Pública", icon: "external" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState(0);
  const [pushStatus, setPushStatus] = useState<
    "idle" | "granted" | "unsupported"
  >("idle");

  useEffect(() => {
    const refresh = () => {
      const stats = computeAdminBookingStats(loadStoredBookings());
      setPendingCount(stats.pendingCount);
    };
    refresh();
    window.addEventListener("ulular-bookings-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("ulular-bookings-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setPushStatus("unsupported");
      return;
    }
    navigator.serviceWorker.register("/sw.js").catch(() => {});
    if (Notification.permission === "granted") {
      setPushStatus("granted");
    }
  }, []);

  const handleEnablePush = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      setPushStatus("granted");
      new Notification("Ulular · Panel Admin activo", {
        body: "Recibirás avisos de nuevas reservas y cancelaciones en este dispositivo.",
      });
    }
  };

  return (
    <div className="min-h-svh bg-ink text-bone flex flex-col md:flex-row">
      <CursorEcho />

      {/* Menú lateral izquierdo fijo en desktop / barra superior compacta en móvil */}
      <aside
        aria-label="Menú lateral de administración"
        className="w-full md:w-64 md:min-h-svh md:sticky md:top-0 shrink-0 border-b md:border-b-0 md:border-r border-tolex bg-ink-2 flex flex-col justify-between p-5 sm:p-6"
      >
        <div>
          <div className="flex items-center justify-between gap-3 pb-5 border-b border-tolex">
            <Link href="/admin" aria-label="Inicio del panel admin">
              <Logo variant="horizontal" />
            </Link>
            <span className="font-mono-specs text-[0.65rem] text-accent border border-accent px-1.5 py-0.5">
              ADMIN
            </span>
          </div>

          <nav className="mt-5 flex md:flex-col gap-1.5 overflow-x-auto">
            {ADMIN_NAV.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between gap-3 px-3.5 py-2.5 font-label-caps text-xs whitespace-nowrap transition-colors border-l-2 ${
                    active
                      ? "border-accent bg-ink-3 text-bone font-semibold"
                      : "border-transparent text-ash hover:text-bone hover:bg-ink-3/60"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <StudioIcon
                      name={item.icon}
                      className={`w-4 h-4 ${active ? "text-accent" : "text-ash"}`}
                    />
                    <span>{item.label}</span>
                  </span>
                  {item.showPendingBadge && pendingCount > 0 && (
                    <span className="bg-accent text-white font-mono-specs text-[10px] px-1.5 py-0.5 font-bold">
                      {pendingCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Estado de Notificaciones Push + Controles inferiores */}
        <div className="mt-6 pt-4 border-t border-tolex space-y-3">
          {pushStatus !== "unsupported" && (
            <button
              type="button"
              onClick={handleEnablePush}
              className={`w-full px-3 py-2 border font-mono-specs text-[10px] uppercase tracking-[0.12em] text-left cursor-pointer transition-colors flex items-center justify-between ${
                pushStatus === "granted"
                  ? "border-[#10B981]/60 bg-[#10B981]/10 text-[#10B981]"
                  : "border-tolex bg-ink text-ash hover:border-accent hover:text-bone"
              }`}
            >
              <span>
                {pushStatus === "granted"
                  ? "Avisos Push: Activos"
                  : "Activar Avisos Push"}
              </span>
              <span>●</span>
            </button>
          )}

          <div className="flex items-center justify-between gap-2">
            <ThemeToggle compact />
            <Link
              href="/"
              aria-label="Volver al sitio público"
              title="Volver al sitio público"
              className="inline-flex items-center justify-center w-10 h-10 border border-tolex bg-ink text-bone hover:border-accent hover:text-accent transition-colors"
            >
              <StudioIcon name="back" className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Área principal de trabajo */}
      <main className="flex-1 min-w-0 px-5 sm:px-8 lg:px-12 py-8 sm:py-10">
        {children}
      </main>
    </div>
  );
}
