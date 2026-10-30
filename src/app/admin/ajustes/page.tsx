"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { BrandIcon, type BrandNetwork } from "@/components/ui/BrandIcon";
import { Button } from "@/components/ui/Button";
import { StudioIcon } from "@/components/ui/StudioIcon";
import {
  DEFAULT_OPERATIONAL_SETTINGS,
  loadOperationalSettings,
  loadStoredStaffList,
  saveOperationalSettings,
  saveStoredStaffList,
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
  const [links, setLinks] = useState<SocialLinksConfig>(SOCIAL_LINKS);
  const [opSettings, setOpSettings] = useState<OperationalSettings>(
    DEFAULT_OPERATIONAL_SETTINGS,
  );
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffRole, setNewStaffRole] = useState<StaffRole>("staff");
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    saveStoredSocialLinks(links);
    saveOperationalSettings(opSettings);
    saveGoogleReviewsConfig(reviewsConfig);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 3000);
  };

  const handleAddStaff = (e: FormEvent) => {
    e.preventDefault();
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
    const next = staffList.filter((s) => s.id !== id);
    setStaffList(next);
    saveStoredStaffList(next);
  };

  const handleAddReview = (e: FormEvent) => {
    e.preventDefault();
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
    const next = reviewsList.filter((r) => r.id !== id);
    saveStoredGoogleReviews(next);
    setReviewsList(loadStoredGoogleReviews());
  };

  return (
    <div className="max-w-4xl space-y-12">
      <div className="pb-6 border-b border-tolex flex items-center justify-between gap-4">
        <div>
          <p className="font-label-caps text-accent">
            Configuración · Solo Owner
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
                min={50}
                step={10}
                value={opSettings.pricePerHour}
                onChange={(e) =>
                  setOpSettings({
                    ...opSettings,
                    pricePerHour: Number(e.target.value) || 150,
                  })
                }
                className="min-h-[44px] px-3 bg-ink-2 border border-tolex text-bone font-mono-specs text-sm focus:border-accent"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="font-label-caps text-xs text-bone">
                Mínimo de horas por ensayo
              </span>
              <input
                type="number"
                min={1}
                max={6}
                value={opSettings.minHours}
                onChange={(e) =>
                  setOpSettings({
                    ...opSettings,
                    minHours: Number(e.target.value) || 1,
                  })
                }
                className="min-h-[44px] px-3 bg-ink-2 border border-tolex text-bone font-mono-specs text-sm focus:border-accent"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="font-label-caps text-xs text-bone">
                Anticipación cancelación (h)
              </span>
              <input
                type="number"
                min={1}
                max={72}
                value={opSettings.cancelNoticeHours}
                onChange={(e) =>
                  setOpSettings({
                    ...opSettings,
                    cancelNoticeHours: Number(e.target.value) || 24,
                  })
                }
                className="min-h-[44px] px-3 bg-ink-2 border border-tolex text-bone font-mono-specs text-sm focus:border-accent"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="font-label-caps text-xs text-bone">
                Vigencia apartado pendiente (h)
              </span>
              <input
                type="number"
                min={1}
                max={72}
                value={opSettings.pendingTtlHours}
                onChange={(e) =>
                  setOpSettings({
                    ...opSettings,
                    pendingTtlHours: Number(e.target.value) || 24,
                  })
                }
                className="min-h-[44px] px-3 bg-ink-2 border border-tolex text-bone font-mono-specs text-sm focus:border-accent"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="font-label-caps text-xs text-bone">
                WhatsApp Sala (con lada 52)
              </span>
              <input
                type="text"
                value={opSettings.whatsappNumber}
                onChange={(e) =>
                  setOpSettings({
                    ...opSettings,
                    whatsappNumber: e.target.value,
                  })
                }
                className="min-h-[44px] px-3 bg-ink-2 border border-tolex text-bone font-mono-specs text-sm focus:border-accent"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="font-label-caps text-xs text-bone">
                ID de Google Calendar
              </span>
              <input
                type="text"
                value={opSettings.googleCalendarId}
                onChange={(e) =>
                  setOpSettings({
                    ...opSettings,
                    googleCalendarId: e.target.value,
                  })
                }
                placeholder="ulular.sala@gmail.com"
                className="min-h-[44px] px-3 bg-ink-2 border border-tolex text-bone font-mono-specs text-sm focus:border-accent"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="font-label-caps text-xs text-accent">
                Clave / PIN de acceso a Cabina Admin
              </span>
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
              onChange={(v) => setLinks({ ...links, instagram: v })}
              placeholder="https://www.instagram.com/ulularsala/"
            />
            <SocialFieldRow
              network="facebook"
              label="Facebook"
              value={links.facebook}
              onChange={(v) => setLinks({ ...links, facebook: v })}
              placeholder="https://www.facebook.com/ulularsaladeensayo/"
            />
            <SocialFieldRow
              network="youtube"
              label="YouTube (Live Sessions)"
              value={links.youtube}
              onChange={(v) => setLinks({ ...links, youtube: v })}
              placeholder="https://www.youtube.com/@ulularsala"
            />
            <SocialFieldRow
              network="tiktok"
              label="TikTok"
              value={links.tiktok}
              onChange={(v) => setLinks({ ...links, tiktok: v })}
              placeholder="https://www.tiktok.com/@ulularsala"
            />
            <SocialFieldRow
              network="maps"
              label="Google Maps"
              value={links.maps}
              onChange={(v) => setLinks({ ...links, maps: v })}
              placeholder="https://share.google/cNvsrMu7Aymr1UVTx"
            />
          </div>
        </div>

        {/* 3. REDES ULULAR NAPULE PIZZA */}
        <div>
          <p className="font-label-caps text-ash pb-3 border-b border-tolex">
            Ulular Napule Pizza (apartado independiente)
          </p>
          <div className="divide-y divide-tolex border-b border-tolex">
            <SocialFieldRow
              network="instagram"
              label="Instagram Pizzería"
              value={links.pizzaInstagram}
              onChange={(v) => setLinks({ ...links, pizzaInstagram: v })}
              placeholder="https://www.instagram.com/ulularnapulepizza"
            />
            <SocialFieldRow
              network="facebook"
              label="Facebook Pizzería"
              value={links.pizzaFacebook}
              onChange={(v) => setLinks({ ...links, pizzaFacebook: v })}
              placeholder="https://www.facebook.com/share/19iX74tHFa/"
            />
          </div>
        </div>

        {saved && (
          <p className="font-mono-specs text-xs border-l-2 border-accent pl-3 py-1 text-bone">
            ✓ Ajustes operativos y enlaces actualizados en todo el sitio.
          </p>
        )}

        <div className="flex flex-wrap gap-4">
          <Button type="submit">Guardar configuración</Button>
          <Button
            type="button"
            variant="ghost"
            withLed={false}
            onClick={() => {
              setLinks(SOCIAL_LINKS);
              setOpSettings(DEFAULT_OPERATIONAL_SETTINGS);
              saveStoredSocialLinks(SOCIAL_LINKS);
              saveOperationalSettings(DEFAULT_OPERATIONAL_SETTINGS);
              setSaved(true);
            }}
          >
            Restaurar valores por defecto
          </Button>
        </div>
      </form>

      {/* 4. ESTADO DE CONEXIÓN CON GOOGLE CALENDAR (SERVICE ACCOUNT) */}
      <div className="pt-6 border-t border-tolex space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="font-label-caps text-accent">
              Sincronización Bidireccional · Google Calendar API
            </p>
            <h2 className="font-display-title text-2xl sm:text-3xl text-bone mt-1">
              conexión vía service account
            </h2>
          </div>

          <span
            className={`font-mono-specs text-xs border px-3 py-1.5 uppercase self-start sm:self-auto ${
              gcalStatus?.configured
                ? "border-[#10B981] bg-[#10B981]/15 text-[#10B981] font-semibold"
                : "border-accent bg-accent-soft text-accent"
            }`}
          >
            {gcalStatus?.configured
              ? "● Conectado en vivo"
              : "● Modo simulación local activo"}
          </span>
        </div>

        <div className="border border-tolex bg-ink-2 p-5 space-y-3 font-mono-specs text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-tolex">
            <span className="text-ash">SERVICE ACCOUNT EMAIL:</span>
            <span className="text-bone">
              {gcalStatus?.serviceAccountEmail ?? "Cargando..."}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-tolex">
            <span className="text-ash">CALENDAR ID OBJETIVO:</span>
            <span className="text-bone">{opSettings.googleCalendarId}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-ash">ENDPOINT WEBHOOK:</span>
            <span className="text-accent">/api/calendar/webhook</span>
          </div>
        </div>

        <p className="text-xs text-ash leading-relaxed">
          Al crear una reserva se agenda como{" "}
          <strong className="text-bone">[PENDIENTE] Banda · Código</strong>, al
          confirmarla pasa a <strong className="text-bone">✅ Banda · Código</strong>{" "}
          y al cancelarla se libera del calendario. Además, cualquier bloque
          ocupado en el Google Calendar del estudio se descuenta automáticamente
          vía <code className="text-bone">freeBusy</code>.
        </p>
      </div>

      {/* 5. USUARIOS AUTORIZADOS (ALLOWLIST GOOGLE SIGN-IN) */}
      <div className="pt-6 border-t border-tolex space-y-5">
        <div>
          <p className="font-label-caps text-accent">
            Control de acceso · Google Sign-In Allowlist
          </p>
          <h2 className="font-display-title text-2xl sm:text-3xl text-bone mt-1">
            correos gmail autorizados (owner y staff)
          </h2>
          <p className="text-xs text-ash mt-1">
            Solo las cuentas de Google listadas aquí pueden acceder al panel
            operativo en producción.
          </p>
        </div>

        <form
          onSubmit={handleAddStaff}
          className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end border border-tolex bg-ink-2 p-4"
        >
          <label className="sm:col-span-5 flex flex-col gap-1">
            <span className="font-label-caps text-[11px] text-bone">
              Correo Gmail *
            </span>
            <input
              type="email"
              required
              value={newStaffEmail}
              onChange={(e) => setNewStaffEmail(e.target.value)}
              placeholder="usuario@gmail.com"
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
              className="min-h-[42px] px-2 bg-ink border border-tolex text-bone font-mono-specs text-xs"
            >
              <option value="staff">STAFF</option>
              <option value="owner">OWNER</option>
            </select>
          </label>

          <div className="sm:col-span-2">
            <Button type="submit" className="w-full min-h-[42px] text-xs px-2">
              Autorizar
            </Button>
          </div>
        </form>

        <div className="divide-y divide-tolex border-y border-tolex">
          {staffList.map((member) => (
            <div
              key={member.id}
              className="py-3.5 px-2 flex items-center justify-between gap-4 font-mono-specs text-xs"
            >
              <div>
                <strong className="text-bone">{member.email}</strong>{" "}
                <span className="text-ash">· {member.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`border px-2 py-0.5 text-[10px] uppercase ${
                    member.role === "owner"
                      ? "border-accent bg-accent-soft text-accent font-semibold"
                      : "border-tolex bg-ink-2 text-bone"
                  }`}
                >
                  {member.role}
                </span>
                {staffList.length > 1 && (
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
          ))}
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
            <strong className="text-bone">más estrellas a menos (5 ★ → 1 ★)</strong>{" "}
            y de <strong className="text-bone">más reciente a más antigua</strong>.
            Puedes conectar tu <code className="text-bone">GOOGLE_MAPS_API_KEY</code>{" "}
            para sincronización automática o agregar reseñas verificadas de tu ficha{" "}
            <code className="text-bone">{reviewsConfig.kgmid}</code>.
          </p>
        </div>

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
              <button
                type="button"
                onClick={() => handleRemoveReview(rev.id)}
                className="text-ash hover:text-[#EF4444] cursor-pointer shrink-0 self-end sm:self-center"
              >
                Eliminar ✕
              </button>
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
  onChange,
  placeholder,
}: {
  network: BrandNetwork;
  label: string;
  value: string;
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
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="sm:col-span-8 w-full min-h-[44px] px-3 bg-ink-2 border border-tolex text-bone font-mono-specs text-sm focus:border-accent"
      />
    </label>
  );
}
