"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { BrandIcon, type BrandNetwork } from "@/components/ui/BrandIcon";
import { Button } from "@/components/ui/Button";
import { StudioIcon } from "@/components/ui/StudioIcon";
import {
  canEditSettings,
  canManageReviews,
  canManageStaff,
  canViewPin,
  DEFAULT_OPERATIONAL_SETTINGS,
  loadAdminSession,
  loadOperationalSettings,
  loadStoredStaffList,
  saveOperationalSettings,
  saveStoredStaffList,
  type AdminSession,
  type OperationalSettings,
  type StaffMember,
} from "@/lib/bookings-store";
import { SOCIAL_LINKS, type SocialLinksConfig } from "@/lib/constants";
import {
  loadStoredSocialLinks,
  saveStoredSocialLinks,
} from "@/lib/events-store";
import {
  DEFAULT_GOOGLE_REVIEWS_CONFIG,
  loadGoogleReviewsConfig,
  loadStoredGoogleReviews,
  saveGoogleReviewsConfig,
  saveStoredGoogleReviews,
  type GoogleReview,
  type GoogleReviewsConfig,
} from "@/lib/reviews-store";
import type { StaffRole } from "@/lib/supabase/types";

export default function AdminAjustesPage() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [links, setLinks] = useState<SocialLinksConfig>(SOCIAL_LINKS);
  const [opSettings, setOpSettings] = useState<OperationalSettings>(
    DEFAULT_OPERATIONAL_SETTINGS,
  );
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffRole, setNewStaffRole] = useState<StaffRole>("admin");
  const [reviewsConfig, setReviewsConfig] = useState<GoogleReviewsConfig>(
    DEFAULT_GOOGLE_REVIEWS_CONFIG,
  );
  const [reviewsList, setReviewsList] = useState<GoogleReview[]>([]);
  const [newRevAuthor, setNewRevAuthor] = useState("");
  const [newRevRating, setNewRevRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [newRevDate, setNewRevDate] = useState("2026-10-27");
  const [newRevRelative, setNewRevRelative] = useState("Hace unos días");
  const [newRevText, setNewRevText] = useState("");
  const [saved, setSaved] = useState(false);
  const [gcalStatus, setGcalStatus] = useState<{
    configured: boolean;
    mode: string;
    serviceAccountEmail: string;
    calendarId: string;
  } | null>(null);

  useEffect(() => {
    setSession(loadAdminSession());
    setLinks(loadStoredSocialLinks());
    setOpSettings(loadOperationalSettings());
    setStaffList(loadStoredStaffList());
    setReviewsConfig(loadGoogleReviewsConfig());
    setReviewsList(loadStoredGoogleReviews());
    fetch("/api/calendar/status")
      .then((r) => r.json())
      .then((d) => setGcalStatus(d))
      .catch(() => {});
  }, []);

  const role = session?.role;
  const isReadOnly = role === "admin";
  const userCanEdit = canEditSettings(role);
  const userCanManageStaff = canManageStaff(role);
  const userCanViewPin = canViewPin(role);
  const userCanManageReviews = canManageReviews(role);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!userCanEdit) return;
    saveStoredSocialLinks(links);
    saveOperationalSettings(opSettings);
    saveGoogleReviewsConfig(reviewsConfig);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 3000);
  };

  const handleAddStaff = (e: FormEvent) => {
    e.preventDefault();
    if (!userCanManageStaff) return;
    const email = newStaffEmail.trim().toLowerCase();
    if (!email || !email.includes("@")) return;
    if (staffList.some((s) => s.email.toLowerCase() === email)) return;

    const next: StaffMember[] = [
      ...staffList,
      {
        id: `staff-${Date.now()}`,
        email,
        name: newStaffName.trim() || email.split("@")[0] || "Staff",
        role: newStaffRole,
      },
    ];
    setStaffList(next);
    saveStoredStaffList(next);
    setNewStaffEmail("");
    setNewStaffName("");
  };

  const handleRemoveStaff = (id: string) => {
    if (!userCanManageStaff) return;
    const target = staffList.find((s) => s.id === id);
    if (!target) return;
    // Solo un developer puede revocar a un developer
    if (target.role === "developer" && role !== "developer") return;

    const next = staffList.filter((s) => s.id !== id);
    setStaffList(next);
    saveStoredStaffList(next);
  };

  const handleAddReview = (e: FormEvent) => {
    e.preventDefault();
    if (!userCanManageReviews) return;
    if (!newRevAuthor.trim() || !newRevText.trim()) return;
    const item: GoogleReview = {
      id: `gmap-rev-${Date.now()}`,
      authorName: newRevAuthor.trim(),
      authorRole: "Reseña verificada · Google Maps",
      rating: newRevRating,
      text: newRevText.trim(),
      publishedAt: new Date(`${newRevDate}T12:00:00.000Z`).toISOString(),
      relativeTimeLabel: newRevRelative.trim() || "Reciente en Google Maps",
      sourceUrl: reviewsConfig.mapsUrl,
      verifiedGoogle: true,
    };
    const next = [item, ...reviewsList];
    saveStoredGoogleReviews(next);
    setReviewsList(loadStoredGoogleReviews());
    setNewRevAuthor("");
    setNewRevText("");
  };

  const handleRemoveReview = (id: string) => {
    if (!userCanManageReviews) return;
    const next = reviewsList.filter((r) => r.id !== id);
    saveStoredGoogleReviews(next);
    setReviewsList(loadStoredGoogleReviews());
  };

  return (
    <div className="max-w-4xl space-y-12">
      <div className="pb-6 border-b border-tolex flex items-center justify-between gap-4">
        <div>
          <p className="font-label-caps text-accent flex items-center gap-2">
            <span>
              {role === "developer"
                ? "Configuración Global · Modo Desarrollador"
                : role === "superadmin"
                  ? "Configuración General · Modo Superadmin"
                  : "Configuración · Modo Administrador (Solo lectura)"}
            </span>
          </p>
          <h1 className="font-display-title text-3xl sm:text-5xl mt-1">
            ajustes, tarifas y usuarios.
          </h1>
        </div>
        <Link
          href="/#redes"
          aria-label="Ver redes en el sitio"
          title="Ver en el sitio"
          className="inline-flex items-center justify-center w-10 h-10 border border-tolex text-bone hover:border-accent hover:text-accent transition-colors"
        >
          <StudioIcon name="external" className="w-4 h-4" />
        </Link>
      </div>

      {/* BANNER INFORMATIVO PARA MODO SOLO LECTURA (ADMIN) */}
      {isReadOnly && (
        <div className="p-4 border border-accent/40 bg-ink-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="font-mono-specs text-xs text-bone font-semibold">
              Vista de Administrador · Modo Solo Lectura
            </span>
          </div>
          <p className="font-mono-specs text-[11px] text-ash">
            Puedes consultar las tarifas y la lista de personal, pero la edición
            está reservada para Superadmin y Desarrollador.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* 1. PARÁMETROS OPERATIVOS DE LA SALA */}
        <div>
          <p className="font-label-caps text-accent pb-3 border-b border-tolex">
            Parámetros operativos de la sala (tabla settings)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
            <label className="flex flex-col gap-1.5">
              <span className="font-label-caps text-xs text-bone">
                Precio por hora ($ MXN)
              </span>
              <input
                type="number"
                disabled={!userCanEdit}
                min={50}
                step={10}
                value={opSettings.pricePerHour}
                onChange={(e) =>
                  setOpSettings({
                    ...opSettings,
                    pricePerHour: Number(e.target.value) || 150,
                  })
                }
                className="min-h-[44px] px-3 bg-ink-2 border border-tolex text-bone font-mono-specs text-sm focus:border-accent disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="font-label-caps text-xs text-bone">
                Mínimo de horas por ensayo
              </span>
              <input
                type="number"
                disabled={!userCanEdit}
                min={1}
                max={6}
                value={opSettings.minHours}
                onChange={(e) =>
                  setOpSettings({
                    ...opSettings,
                    minHours: Number(e.target.value) || 1,
                  })
                }
                className="min-h-[44px] px-3 bg-ink-2 border border-tolex text-bone font-mono-specs text-sm focus:border-accent disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="font-label-caps text-xs text-bone">
                Anticipación cancelación (h)
              </span>
              <input
                type="number"
                disabled={!userCanEdit}
                min={1}
                max={72}
                value={opSettings.cancelNoticeHours}
                onChange={(e) =>
                  setOpSettings({
                    ...opSettings,
                    cancelNoticeHours: Number(e.target.value) || 24,
                  })
                }
                className="min-h-[44px] px-3 bg-ink-2 border border-tolex text-bone font-mono-specs text-sm focus:border-accent disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="font-label-caps text-xs text-bone">
                Vigencia apartado pendiente (h)
              </span>
              <input
                type="number"
                disabled={!userCanEdit}
                min={1}
                max={72}
                value={opSettings.pendingTtlHours}
                onChange={(e) =>
                  setOpSettings({
                    ...opSettings,
                    pendingTtlHours: Number(e.target.value) || 24,
                  })
                }
                className="min-h-[44px] px-3 bg-ink-2 border border-tolex text-bone font-mono-specs text-sm focus:border-accent disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="font-label-caps text-xs text-bone">
                WhatsApp Sala (con lada 52)
              </span>
              <input
                type="text"
                disabled={!userCanEdit}
                value={opSettings.whatsappNumber}
                onChange={(e) =>
                  setOpSettings({
                    ...opSettings,
                    whatsappNumber: e.target.value,
                  })
                }
                className="min-h-[44px] px-3 bg-ink-2 border border-tolex text-bone font-mono-specs text-sm focus:border-accent disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="font-label-caps text-xs text-bone">
                ID de Google Calendar
              </span>
              <input
                type="text"
                disabled={!userCanEdit}
                value={opSettings.googleCalendarId}
                onChange={(e) =>
                  setOpSettings({
                    ...opSettings,
                    googleCalendarId: e.target.value,
                  })
                }
                placeholder="raelvega33@gmail.com"
                className="min-h-[44px] px-3 bg-ink-2 border border-tolex text-bone font-mono-specs text-sm focus:border-accent disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="font-label-caps text-xs text-accent">
                Clave / PIN de acceso a Cabina Admin
              </span>
              {userCanViewPin ? (
                <input
                  type="text"
                  value={opSettings.adminAccessPin}
                  onChange={(e) =>
                    setOpSettings({
                      ...opSettings,
                      adminAccessPin: e.target.value,
                    })
                  }
                  placeholder="ulular2026"
                  className="min-h-[44px] px-3 bg-ink-2 border border-accent/60 text-bone font-mono-specs text-sm focus:border-accent"
                />
              ) : (
                <input
                  type="password"
                  disabled
                  value="••••••••••"
                  className="min-h-[44px] px-3 bg-ink border border-tolex text-ash font-mono-specs text-sm opacity-60 cursor-not-allowed"
                  title="Oculto por seguridad: solo Superadmin y Desarrollador"
                />
              )}
            </label>
          </div>
        </div>

        {/* 2. REDES SOCIALES ULULAR SALA DE ENSAYO */}
        <div>
          <p className="font-label-caps text-ash pb-3 border-b border-tolex">
            Redes Sociales · Ulular Sala de Ensayo
          </p>
          <div className="divide-y divide-tolex border-b border-tolex">
            <SocialFieldRow
              network="instagram"
              label="Instagram"
              value={links.instagram}
              disabled={!userCanEdit}
              onChange={(v) => setLinks({ ...links, instagram: v })}
              placeholder="https://www.instagram.com/ulularsala/"
            />
            <SocialFieldRow
              network="facebook"
              label="Facebook"
              value={links.facebook}
              disabled={!userCanEdit}
              onChange={(v) => setLinks({ ...links, facebook: v })}
              placeholder="https://www.facebook.com/ulularsaladeensayo/"
            />
            <SocialFieldRow
              network="youtube"
              label="YouTube (Live Sessions)"
              value={links.youtube}
              disabled={!userCanEdit}
              onChange={(v) => setLinks({ ...links, youtube: v })}
              placeholder="https://www.youtube.com/@ulularsala"
            />
            <SocialFieldRow
              network="tiktok"
              label="TikTok"
              value={links.tiktok}
              disabled={!userCanEdit}
              onChange={(v) => setLinks({ ...links, tiktok: v })}
              placeholder="https://www.tiktok.com/@ulularsala"
            />
            <SocialFieldRow
              network="maps"
              label="Google Maps"
              value={links.maps}
              disabled={!userCanEdit}
              onChange={(v) => setLinks({ ...links, maps: v })}
              placeholder="https://share.google/cNvsrMu7Aymr1UVTx"
            />
          </div>
        </div>

        {/* BOTÓN GUARDAR (SOLO PARA DEVELOPER / SUPERADMIN) */}
        {userCanEdit && (
          <div className="flex items-center justify-between gap-4 pt-4">
            <Button type="submit" className="px-6">
              Guardar Parámetros y Redes
            </Button>
            {saved && (
              <span className="font-mono-specs text-xs text-[#10B981] animate-fade">
                ✓ Ajustes guardados correctamente
              </span>
            )}
          </div>
        )}
      </form>

      {/* 3. ESTADO DE SINCRONIZACIÓN GOOGLE CALENDAR */}
      <div className="pt-8 border-t border-tolex space-y-4">
        <div>
          <p className="font-label-caps text-accent">
            Google Calendar API · Estado de Conexión
          </p>
          <h2 className="font-display-title text-2xl sm:text-3xl mt-1">
            sincronización con google calendar.
          </h2>
        </div>

        <div className="border border-tolex bg-ink-2 p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <span className="font-mono-specs text-[10px] text-ash block uppercase">
              Estado API
            </span>
            <span
              className={`font-mono-specs text-xs font-bold ${
                gcalStatus?.configured ? "text-[#10B981]" : "text-accent"
              }`}
            >
              {gcalStatus?.configured ? "● CONECTADO" : "○ MODO LOCAL / DEMO"}
            </span>
          </div>

          <div>
            <span className="font-mono-specs text-[10px] text-ash block uppercase">
              Modo Operativo
            </span>
            <span className="font-mono-specs text-xs text-bone">
              {gcalStatus?.mode === "service_account_live"
                ? "Service Account Activa"
                : "Mock de Desarrollo"}
            </span>
          </div>

          <div className="sm:col-span-2">
            <span className="font-mono-specs text-[10px] text-ash block uppercase">
              ID Calendario Destino
            </span>
            <span className="font-mono-specs text-xs text-bone truncate block">
              {gcalStatus?.calendarId || opSettings.googleCalendarId}
            </span>
          </div>
        </div>
      </div>

      {/* 4. EQUIPO Y ROLES DE ACCESO */}
      <div className="pt-8 border-t border-tolex space-y-6">
        <div>
          <p className="font-label-caps text-accent">
            Permisos · Developer · Superadmin · Admin
          </p>
          <h2 className="font-display-title text-2xl sm:text-3xl mt-1">
            equipo y roles de acceso.
          </h2>
          <p className="text-xs text-ash mt-1">
            {userCanManageStaff
              ? "Solo los correos registrados pueden acceder al panel. Los roles determinan qué acciones y ajustes pueden modificar."
              : "Lista de personal autorizado (modo consulta)."}
          </p>
        </div>

        {/* Formulario solo visible si tiene permisos de gestión */}
        {userCanManageStaff && (
          <form
            onSubmit={handleAddStaff}
            className="grid grid-cols-1 sm:grid-cols-12 gap-3 border border-tolex bg-ink-2 p-4"
          >
            <label className="sm:col-span-5 flex flex-col gap-1">
              <span className="font-label-caps text-[11px] text-bone">
                Correo Gmail
              </span>
              <input
                type="email"
                required
                value={newStaffEmail}
                onChange={(e) => setNewStaffEmail(e.target.value)}
                placeholder="nuevo.staff@gmail.com"
                className="min-h-[42px] px-3 bg-ink border border-tolex text-bone font-mono-specs text-xs"
              />
            </label>

            <label className="sm:col-span-3 flex flex-col gap-1">
              <span className="font-label-caps text-[11px] text-bone">
                Nombre
              </span>
              <input
                type="text"
                value={newStaffName}
                onChange={(e) => setNewStaffName(e.target.value)}
                placeholder="Nombre o puesto"
                className="min-h-[42px] px-3 bg-ink border border-tolex text-bone font-mono-specs text-xs"
              />
            </label>

            <label className="sm:col-span-2 flex flex-col gap-1">
              <span className="font-label-caps text-[11px] text-bone">Rol</span>
              <select
                value={newStaffRole}
                onChange={(e) => setNewStaffRole(e.target.value as StaffRole)}
                className="min-h-[42px] px-2 bg-ink border border-tolex text-bone font-mono-specs text-xs uppercase"
              >
                <option value="admin">ADMIN</option>
                <option value="superadmin">SUPERADMIN</option>
                {role === "developer" && (
                  <option value="developer">DEVELOPER</option>
                )}
              </select>
            </label>

            <div className="sm:col-span-2">
              <Button
                type="submit"
                className="w-full min-h-[42px] text-xs px-2"
              >
                Autorizar
              </Button>
            </div>
          </form>
        )}

        <div className="divide-y divide-tolex border-y border-tolex">
          {staffList.map((member) => {
            const canRevokeThis =
              userCanManageStaff &&
              member.email.toLowerCase() !== session?.email?.toLowerCase() &&
              (role === "developer" || member.role !== "developer");

            const badgeStyle =
              member.role === "developer"
                ? "border-accent text-accent bg-accent/10 font-bold"
                : member.role === "superadmin"
                  ? "border-bone/70 text-bone bg-ink-3 font-semibold"
                  : "border-tolex bg-ink-2 text-ash";

            return (
              <div
                key={member.id}
                className="py-3.5 px-2 flex items-center justify-between gap-4 font-mono-specs text-xs"
              >
                <div className="min-w-0">
                  <strong className="text-bone">{member.email}</strong>{" "}
                  <span className="text-ash">· {member.name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`border px-2 py-0.5 text-[10px] uppercase tracking-wider ${badgeStyle}`}
                  >
                    {member.role}
                  </span>
                  {canRevokeThis && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStaff(member.id)}
                      className="text-ash hover:text-[#EF4444] cursor-pointer"
                    >
                      Revocar ✕
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. RESEÑAS DE GOOGLE MAPS (ORDENADAS DE MÁS ESTRELLAS A MENOS Y MÁS RECIENTES) */}
      <div className="pt-8 border-t border-tolex space-y-6">
        <div>
          <p className="font-label-caps text-accent">
            Google Places API + Reseñas Verificadas
          </p>
          <h2 className="font-display-title text-2xl sm:text-3xl mt-1">
            reseñas de google maps.
          </h2>
          <p className="text-xs text-ash mt-1">
            Las reseñas se ordenan automáticamente de{" "}
            <strong className="text-bone">
              más estrellas a menos (5 ★ → 1 ★)
            </strong>{" "}
            y de{" "}
            <strong className="text-bone">más reciente a más antigua</strong>.
          </p>
        </div>

        {userCanManageReviews && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-tolex bg-ink-2 p-4">
              <label className="flex flex-col gap-1">
                <span className="font-label-caps text-[11px] text-bone">
                  Google Maps API Key (Places API New · Opcional)
                </span>
                <input
                  type="password"
                  value={reviewsConfig.googleMapsApiKey || ""}
                  onChange={(e) => {
                    const next = {
                      ...reviewsConfig,
                      googleMapsApiKey: e.target.value,
                    };
                    setReviewsConfig(next);
                    saveGoogleReviewsConfig(next);
                  }}
                  placeholder="AIzaSy..."
                  className="min-h-[42px] px-3 bg-ink border border-tolex text-bone font-mono-specs text-xs"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="font-label-caps text-[11px] text-bone">
                  Link para dejar reseña en Google Maps
                </span>
                <input
                  type="url"
                  value={reviewsConfig.writeReviewUrl}
                  onChange={(e) => {
                    const next = {
                      ...reviewsConfig,
                      writeReviewUrl: e.target.value,
                    };
                    setReviewsConfig(next);
                    saveGoogleReviewsConfig(next);
                  }}
                  placeholder="https://share.google/cNvsrMu7Aymr1UVTx"
                  className="min-h-[42px] px-3 bg-ink border border-tolex text-bone font-mono-specs text-xs"
                />
              </label>
            </div>

            <form
              onSubmit={handleAddReview}
              className="border border-tolex bg-ink-2 p-4 space-y-4"
            >
              <p className="font-mono-specs text-xs text-accent uppercase tracking-[0.14em]">
                + Agregar reseña verificada de Google Maps
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <label className="sm:col-span-4 flex flex-col gap-1">
                  <span className="font-label-caps text-[11px] text-bone">
                    Autor (Nombre en Google Maps)
                  </span>
                  <input
                    type="text"
                    required
                    value={newRevAuthor}
                    onChange={(e) => setNewRevAuthor(e.target.value)}
                    placeholder="Ej. Mauricio L. · Baterista"
                    className="min-h-[40px] px-3 bg-ink border border-tolex text-bone font-mono-specs text-xs"
                  />
                </label>

                <label className="sm:col-span-2 flex flex-col gap-1">
                  <span className="font-label-caps text-[11px] text-bone">
                    Estrellas
                  </span>
                  <select
                    value={newRevRating}
                    onChange={(e) =>
                      setNewRevRating(
                        Number(e.target.value) as 1 | 2 | 3 | 4 | 5,
                      )
                    }
                    className="min-h-[40px] px-2 bg-ink border border-tolex text-bone font-mono-specs text-xs"
                  >
                    <option value={5}>5 ★</option>
                    <option value={4}>4 ★</option>
                    <option value={3}>3 ★</option>
                    <option value={2}>2 ★</option>
                    <option value={1}>1 ★</option>
                  </select>
                </label>

                <label className="sm:col-span-3 flex flex-col gap-1">
                  <span className="font-label-caps text-[11px] text-bone">
                    Fecha (para orden reciente)
                  </span>
                  <input
                    type="date"
                    value={newRevDate}
                    onChange={(e) => setNewRevDate(e.target.value)}
                    className="min-h-[40px] px-3 bg-ink border border-tolex text-bone font-mono-specs text-xs"
                  />
                </label>

                <label className="sm:col-span-3 flex flex-col gap-1">
                  <span className="font-label-caps text-[11px] text-bone">
                    Etiqueta de tiempo
                  </span>
                  <input
                    type="text"
                    value={newRevRelative}
                    onChange={(e) => setNewRevRelative(e.target.value)}
                    placeholder="Hace 3 días"
                    className="min-h-[40px] px-3 bg-ink border border-tolex text-bone font-mono-specs text-xs"
                  />
                </label>
              </div>

              <label className="block">
                <span className="font-label-caps text-[11px] text-bone block mb-1">
                  Comentario de la reseña
                </span>
                <textarea
                  required
                  rows={2}
                  value={newRevText}
                  onChange={(e) => setNewRevText(e.target.value)}
                  placeholder="Escribe el texto íntegro de la reseña de Google Maps..."
                  className="w-full p-3 bg-ink border border-tolex text-bone font-mono-specs text-xs"
                />
              </label>

              <div className="flex justify-end">
                <Button type="submit" className="min-h-[40px] text-xs px-4">
                  Guardar y ordenar reseña
                </Button>
              </div>
            </form>
          </>
        )}

        <div className="divide-y divide-tolex border-y border-tolex">
          {reviewsList.map((rev) => (
            <div
              key={rev.id}
              className="py-3.5 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono-specs text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-accent font-bold">{rev.rating} ★</span>
                  <strong className="text-bone">{rev.authorName}</strong>
                  <span className="text-ash">· {rev.relativeTimeLabel}</span>
                </div>
                <p className="text-ash text-[11px] line-clamp-2">“{rev.text}”</p>
              </div>
              {userCanManageReviews && (
                <button
                  type="button"
                  onClick={() => handleRemoveReview(rev.id)}
                  className="text-ash hover:text-[#EF4444] cursor-pointer shrink-0 self-end sm:self-center"
                >
                  Eliminar ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SocialFieldRow({
  network,
  label,
  value,
  disabled,
  onChange,
  placeholder,
}: {
  network: BrandNetwork;
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <label className="py-3.5 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
      <span className="sm:col-span-4 flex items-center gap-3 font-label-caps text-xs text-bone">
        <BrandIcon network={network} className="w-5 h-5" />
        <span>{label}</span>
      </span>
      <input
        type="url"
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="sm:col-span-8 w-full min-h-[44px] px-3 bg-ink-2 border border-tolex text-bone font-mono-specs text-sm focus:border-accent disabled:opacity-60 disabled:cursor-not-allowed"
      />
    </label>
  );
}
