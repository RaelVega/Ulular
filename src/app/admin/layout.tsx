"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { CursorEcho } from "@/components/ui/CursorEcho";
import { Logo } from "@/components/ui/Logo";
import { Rings } from "@/components/ui/Rings";
import { StudioIcon, type StudioIconName } from "@/components/ui/StudioIcon";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  authenticateAdmin,
  computeAdminBookingStats,
  loadAdminSession,
  loadStoredBookings,
  logoutAdminSession,
  type AdminSession,
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
  const [session, setSession] = useState<AdminSession | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  const [pendingCount, setPendingCount] = useState(0);
  const [pushStatus, setPushStatus] = useState<
    "idle" | "granted" | "unsupported"
  >("idle");

  useEffect(() => {
    const syncAuth = () => {
      setSession(loadAdminSession());
      setAuthChecked(true);
    };
    syncAuth();
    window.addEventListener("ulular-auth-updated", syncAuth);
    return () => {
      window.removeEventListener("ulular-auth-updated", syncAuth);
    };
  }, []);

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

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const result = authenticateAdmin(emailInput, pinInput);
    if (!result.ok) {
      setAuthError(result.error);
      return;
    }
    setSession(result.session);
    setPinInput("");
  };

  const handleLogout = () => {
    logoutAdminSession();
    setSession(null);
  };

  if (!authChecked) {
    return <div className="min-h-svh bg-ink text-bone" />;
  }

  // Compuerta de seguridad: bloquea intrusos si no hay sesión activa
  if (!session) {
    return (
      <div className="relative min-h-svh bg-ink text-bone flex flex-col justify-between p-5 sm:p-8 overflow-hidden">
        <CursorEcho />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 text-smoke opacity-10"
        >
          <Rings
            variant="static"
            strokeWidth={0.25}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[max(130vw,130svh)]"
          />
        </div>

        <header className="relative z-10 flex items-center justify-between border-b border-tolex pb-4">
          <Link href="/" aria-label="Volver al sitio de Ulular">
            <Logo variant="horizontal" />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle compact />
            <Link
              href="/"
              className="px-3 py-2 border border-tolex bg-ink-2 text-ash hover:text-bone hover:border-accent font-mono-specs text-xs uppercase"
            >
              ← Sitio público
            </Link>
          </div>
        </header>

        <main className="relative z-10 my-auto py-10">
          <div className="max-w-md mx-auto border border-tolex bg-ink-2 p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-tolex">
              <div className="inline-flex items-center gap-2">
                <span className="w-2 h-2 bg-accent" aria-hidden="true" />
                <span className="font-mono-specs text-xs uppercase tracking-[0.16em] text-accent">
                  Acceso Restringido · Cabina
                </span>
              </div>
              <span className="font-mono-specs text-[0.65rem] border border-tolex px-2 py-0.5 text-ash">
                RLS + STAFF ALLOWLIST
              </span>
            </div>

            <h1 className="font-display-title text-3xl text-bone mt-4">
              consola <span className="text-accent">ulular.</span>
            </h1>
            <p className="font-mono-specs text-xs text-ash mt-1.5 leading-relaxed">
              Solo los correos registrados en la lista blanca de personal (
              <code className="text-bone">staff_users</code>) pueden entrar al
              panel administrativo.
            </p>

            <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
              <label className="block">
                <span className="font-label-caps text-xs text-bone block mb-1.5">
                  Correo Gmail autorizado
                </span>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="ulularsaladeensayo@gmail.com"
                  className="w-full min-h-[44px] px-3.5 bg-ink border border-tolex text-bone font-mono-specs text-xs focus:border-accent"
                />
              </label>

              <label className="block">
                <span className="font-label-caps text-xs text-bone block mb-1.5">
                  Clave / PIN de acceso a cabina
                </span>
                <input
                  type="password"
                  required
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full min-h-[44px] px-3.5 bg-ink border border-tolex text-bone font-mono-specs text-xs focus:border-accent"
                />
              </label>

              {authError && (
                <div className="p-3 border border-accent bg-accent/10 font-mono-specs text-xs text-bone">
                  ▪ {authError}
                </div>
              )}

              <button
                type="submit"
                className="w-full min-h-[48px] bg-accent text-white border-2 border-accent font-label-caps text-xs tracking-[0.16em] uppercase font-bold shadow-[0_0_24px_var(--theme-accent-soft)] hover:brightness-110 transition-all cursor-pointer"
              >
                Desbloquear Consola Admin →
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-tolex space-y-2">
              <p className="font-mono-specs text-[0.68rem] text-ash leading-relaxed">
                <strong className="text-bone">Protección en dos capas:</strong>{" "}
                En producción con Supabase activo, el inicio de sesión valida tu
                token de Google OAuth directamente en base de datos mediante Row
                Level Security (<code className="text-bone">is_staff()</code>).
                Puedes agregar o revocar correos y cambiar la clave en{" "}
                <strong className="text-bone">Ajustes y Usuarios</strong>.
              </p>
            </div>
          </div>
        </main>

        <footer className="relative z-10 text-center font-mono-specs text-[0.68rem] text-ash border-t border-tolex pt-4">
          Ulular Sala de Ensayo · Querétaro, Qro. · Sesión protegida
        </footer>
      </div>
    );
  }

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
            <span className="font-mono-specs text-[0.65rem] text-accent border border-accent px-1.5 py-0.5 uppercase">
              {session.role}
            </span>
          </div>

          <div className="mt-3 px-3 py-2 border border-tolex bg-ink flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="font-mono-specs text-[10px] text-bone truncate">
                {session.name}
              </p>
              <p className="font-mono-specs text-[9px] text-ash truncate">
                {session.email}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Cerrar sesión y bloquear consola"
              className="px-2 py-1 border border-tolex text-[9px] font-mono-specs uppercase text-ash hover:text-accent hover:border-accent cursor-pointer shrink-0"
            >
              Salir
            </button>
          </div>

          <nav className="mt-4 flex md:flex-col gap-1.5 overflow-x-auto">
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
