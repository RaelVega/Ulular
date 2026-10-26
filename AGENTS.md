# AGENTS.md: instrucciones para agentes de IA en este repo

Proyecto: sitio web + sistema de reservas de **Ulular Sala de Ensayo** (Querétaro, MX).

## Antes de tocar cualquier UI
1. Lee **`docs/design/DESIGN.md`** (contrato visual) y **`docs/brand/VOICE.md`** (tono y microcopy).
2. Usa **solo los tokens** definidos (colores, tipografías, espaciados). No introduzcas colores hex nuevos. **La paleta es 100% monocroma (negro/hueso/grises): cero colores con matiz.**
3. Revisa la sección **Anti-patrones** de `DESIGN.md` y verifica que tu cambio no caiga en ninguno.
4. **Mobile-first**: construye para 375px primero y verifica en iPhone (375/393), iPad (768/1024) y desktop (1280+). Ver `DESIGN.md §9`.
5. Las animaciones de anillos siguen el catálogo de `DESIGN.md §4` (componente `<Rings />`).
6. Si hay imágenes en `docs/design/moodboard/`, úsalas como referencia de dirección.
7. Todo texto visible al usuario va en **español mexicano** y sigue `VOICE.md`.

## Stack
- Next.js (App Router) + TypeScript estricto + Tailwind CSS v4 (tokens en `src/app/globals.css` vía `@theme`)
- Supabase (Postgres + RLS + Auth con Google) · Google Calendar API (Service Account) · Vercel
- Validación con Zod en cliente y servidor. Zona horaria de negocio: `America/Mexico_City`.

## Reglas de negocio (fuente de verdad: tabla `settings`)
- 1 sala · \$150 MXN/h · mínimo 1 h · bloques de 1 h
- Mar–Vie 17–23 · Sáb 11–23 · Dom 11–20 · **Lunes: solo con reserva anticipada (vía WhatsApp, sin slots online)**
- Reserva nace `pending` y aparta el horario 24 h; el admin confirma. Cancelación con 24 h de anticipación.
- Pago antes del ensayo (no hay pago online). Las horas apartadas se cobran completas.
- **Sin emails**: la comunicación es por WhatsApp (links `wa.me`) + página de estado + Web Push al panel.
- WhatsApp sala: `524424067325` · Canal: https://chat.whatsapp.com/LUIiBmdEUHS29vQSUsjmR5

## Convenciones
- Componentes en `src/components/{ui,site,admin}`; lógica en `src/lib/*`.
- Nunca exponer la service role key ni las credenciales de Google al cliente.
- La anti-doble-reserva vive en la BD (constraint `EXCLUDE`); no depender solo de validación en el cliente.
- Tests: Vitest para lógica (`src/lib`), Playwright para flujos. Antes de terminar: `npm run lint && npm run typecheck && npm test && npm run build`.
- Respetar `prefers-reduced-motion` y contraste AA.
