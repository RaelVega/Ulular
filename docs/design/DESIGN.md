# DESIGN.md — Ulular Sala de Ensayo

> Contrato visual del proyecto. Toda UI (sitio público y panel admin) debe seguir este documento.
> Si algo no está aquí, se decide **a favor del contraste, la crudeza y la sobriedad**, nunca de la decoración.

---

## 1. Concepto: "Dentro de la bocina"

El logo son anillos concéntricos tangentes en la base: el **cono de una bocina**, **ondas de sonido**
y un **túnel op-art** al mismo tiempo. El sitio debe sentirse como asomarse dentro de un amplificador:
oscuro, hipnótico, vibrante, técnico.

- **Rock por actitud, no por clichés.** Nada de llamas, calaveras, guitarras clipart ni tipografías "metal" de plantilla.
- **100% monocromo: negro, blanco hueso y grises.** No hay color de acento. El énfasis se logra con **inversión** (blanco sobre negro ↔ negro sobre blanco), escala tipográfica y **movimiento de los anillos**.
- **Analógico y técnico:** como la placa de specs en la parte trasera de un amp, o un flyer fotocopiado bien diseñado.
- **Mobile-first:** la mayoría de las visitas y reservas serán desde el celular (ver §9).

Palabras clave: *vibración · eco · túnel · tolex · rejilla · specs · alto contraste · crudo*.

---

## 2. Tokens

### 2.1 Color (solo escala de grises)

| Token | Hex | Uso |
|---|---|---|
| `--color-ink` | `#0A0A0A` | Fondo principal (negro casi puro) |
| `--color-ink-2` | `#141414` | Superficies elevadas (bloques, panel, sheets) |
| `--color-ink-3` | `#1F1F1F` | Hover de superficies, filas alternas |
| `--color-tolex` | `#2B2B2B` | Separadores, bordes de inputs |
| `--color-smoke` | `#5C5C5C` | Elementos deshabilitados, anillos de fondo tenues |
| `--color-ash` | `#9A9A9A` | Texto secundario, metadatos (AA sobre `ink`) |
| `--color-bone` | `#F2EFE8` | Texto principal, líneas de anillos, CTA y secciones invertidas |
| `--color-white` | `#FFFFFF` | Solo logo y estados de máximo énfasis (foco, slot seleccionado) |

**Reglas**
- **Prohibido cualquier color con matiz** (azul, rojo, verde, etc.), incluidos íconos de marcas y estados.
- **Énfasis = inversión.** El CTA principal es un bloque `bone` con texto `ink`; en hover/tap se invierte a contorno.
- Las secciones pueden invertirse (fondo `bone`, texto `ink`) para crear ritmo, como máximo una o dos por página.
- **Estados sin color** (panel y reserva): se distinguen por **relleno, tipo de borde e ícono + texto**, nunca solo por tono:

| Estado | Tratamiento |
|---|---|
| Pendiente | Borde **punteado** `bone` + ícono de reloj + texto "Pendiente" |
| Confirmada | **Relleno** `bone`, texto `ink` + ✓ |
| Cancelada / expirada | Texto `smoke` **tachado** + ícono × |
| No-show | Patrón de rayado diagonal en gris + texto |
| Error de formulario | Borde `white` de 2px + ícono "!" + mensaje debajo |

### 2.2 Tipografía

| Rol | Familia (Google Fonts, vía `next/font`) | Uso | Estilo |
|---|---|---|---|
| **Display** | `Montserrat` 800/900 | Titulares grandes, el precio, números | **minúsculas**, tracking `-0.03em`, line-height `0.9` |
| **Label** | `Cinzel` 400/500 | Eyebrows, subtítulos, etiquetas, navegación | **MAYÚSCULAS**, tracking `0.18em`, tamaño pequeño |
| **Body** | `Space Grotesk` 400/500 | Párrafos, formularios, panel | sentence case |
| **Mono/Specs** | `JetBrains Mono` 400/500 | Precios, horarios, códigos de reserva, specs del equipo | tabular-nums |

La dupla **display redondo pesado + serif en versalitas** replica el logo ("ulular" / "SALA DE ENSAYO").
Es la firma tipográfica de la marca y debe aparecer en cada sección principal.

Escala (clamp, mobile → desktop):

```
--text-mega:  clamp(4.5rem, 22vw, 12rem);  /* hero: en móvil "ulular" ocupa casi todo el ancho */
--text-h1:    clamp(2.75rem, 9vw, 6rem);
--text-h2:    clamp(2rem, 6vw, 3.75rem);
--text-h3:    clamp(1.25rem, 3vw, 1.75rem);
--text-body:  1rem / 1.6;    /* nunca < 16px: evita zoom automático en iOS */
--text-label: 0.75rem;       /* Cinzel, uppercase, tracking .18em */
```

### 2.3 Forma, espacio y profundidad
- `--radius: 0`. **Esquinas rectas en todo.** Única excepción: círculos (anillos, LEDs, perillas).
- Bordes de 1px `--color-tolex` o `--color-bone` al 15%.
- **Sin sombras.** La profundidad se logra con borde, inversión o anillos de fondo en `smoke`.
- Espaciado base 4px; secciones con `padding-block: clamp(4rem, 12vw, 10rem)`.
- Grid: 4 columnas (móvil) / 8 (tablet) / 12 (desktop), con permiso para **romperlo**: titulares que desbordan, anillos recortados por el borde.

---

## 3. Logo y motivo gráfico

### 3.1 El logo completo es la identidad principal
El logo **completo** (anillos + "ulular" + "SALA DE ENSAYO") se conserva siempre como identidad principal.
Los anillos sueltos son un **motivo secundario** (fondos, loaders, separadores) y nunca reemplazan al logo.

| Variante | Composición | Dónde |
|---|---|---|
| **Hero (home)** | **Desktop (≥1024px):** "ulular" gigante + "SALA DE ENSAYO" a la izquierda · anillos animados grandes a la derecha.<br>**Celular e iPad (<1024px):** anillos arriba + texto y CTA centrados abajo | Hero del home |
| **Vertical** | Anillos arriba · "ulular" · "SALA DE ENSAYO", centrados como el original | Login del panel, pantalla de carga de la PWA, OG image |
| **Horizontal compacta** | Mini anillos + "ulular" con "SALA DE ENSAYO" debajo en pequeño | Header (aparece al hacer scroll), footer, panel admin |
| **Símbolo** | Solo los anillos tangentes del logo | Favicon, íconos de la PWA, avatar de redes |

- Componente `<Logo variant="vertical | horizontal | mark" animated />`, en SVG + texto con `next/font`.
- Proporciones del vertical (ancho del lockup = 100): anillos 88 · "ulular" ≈ 31 de cuerpo · "SALA DE ENSAYO" ≈ 6.4 de cuerpo con tracking .12em.
- Área de respeto: el diámetro del anillo más pequeño × 3 alrededor de todo el logo.
- Siempre en `white`/`bone` sobre negro, o `ink` sobre `bone`. Nunca sobre una foto sin capa oscura.

> **Pendiente:** el wordmark está recreado con Montserrat 800 + Cinzel a partir del PNG.
> En cuanto exista el archivo vectorial original (AI/SVG/PDF), se sustituye para que sea idéntico.

### 3.2 A0 · Logo vivo (animación del logo completo)
Secuencia de entrada del hero (≈2.2s, una sola vez por sesión). Aplica igual al hero dividido y a la variante vertical:
1. **Dibujado** (0–1.1s): los 12 anillos se trazan desde el punto de tangencia (abajo), de afuera hacia adentro, con 70ms de desfase.
2. **Golpe** (1.1–1.8s): "ulular" sube revelándose con un *clip* desde abajo y un micro rebote, como un golpe de bombo.
3. **Afinación** (1.5–2.4s): "SALA DE ENSAYO" aparece cerrando el tracking de .6em a .12em.
4. **Respiración** (2.2s → ∞): los anillos pulsan (A1) de forma continua.
5. **Scroll:** el logo sube y se desvanece mientras los anillos de fondo se abren en túnel (A2). Cuando sale de pantalla,
   la **variante horizontal** aparece en el header con un pulso corto (A7).

Con `prefers-reduced-motion`, el logo aparece completo y estático desde el inicio.

### 3.3 Los anillos del logo vs. círculos concéntricos (`<Orbits />`)
- **Logo / Hero (`<Rings />`):** 12 círculos **tangentes en la base** (`docs/brand/logo/ulular-mark.svg`, radio de 56 a 5, `transform-origin: 60px 116px`, trazados como `<path>` desde abajo). Reservado para la identidad (hero, header, fondos de marca).
- **Loaders, progreso y feedback (`<Orbits count={4..6} />`):** **círculos concéntricos centrados** (`cx=60, cy=60`, uno dentro de otro con el mismo centro, `transform-origin: 60px 60px`). Conservan la esencia de ondas de sonido de la marca sin repetir el logo en cada estado de la interfaz.

**Prohibido:** rellenar los anillos con color, deformarlos, girarlos, ponerles gradiente.

---

## 4. Catálogo de animaciones con anillos

> Son el elemento con más personalidad de la marca. Úsalos **con intención**: una animación protagonista por pantalla, las demás sutiles.

| # | Nombre | Dónde | Comportamiento |
|---|---|---|---|
| A0 | **Logo vivo** | Hero | Ver §3.2: dibujado → golpe → afinación → respiración |
| A1 | **Pulso de cono** | Hero (anillos del logo) | Cada anillo escala 1→1.025 con delay escalonado (80ms), 2.4s infinito: el cono vibrando |
| A2 | **Túnel con scroll** | Hero → siguiente sección | Al hacer scroll, los anillos crecen y se separan como si entraras al túnel; el hero se desvanece (scroll-driven animation, con fallback a IntersectionObserver) |
| A3 | **Dibujado (`<Orbits />`)** | Loader global, carga de disponibilidad | 5 círculos concéntricos centrados que se trazan con `stroke-dashoffset` de afuera hacia adentro y se borran en reversa |
| A4 | **Onda de toque (sonar)** | Botones primarios, slots, días del calendario | Al tocar o hacer clic, salen 2 círculos concéntricos desde el punto de contacto que se expanden y desvanecen |
| A5 | **Eco del cursor** | Desktop con puntero fino | Punto + círculo que sigue al cursor con retraso; sobre links se expande. Se desactiva en táctil |
| A6 | **Separador vibrante** | Entre secciones | Arco de medio anillo de borde a borde; vibra una vez al entrar en viewport |
| A7 | **Logo al header** | Header | La variante horizontal aparece cuando el logo del hero sale de pantalla, con un pulso corto de sus anillos |
| A8 | **Stepper de reserva (`<Orbits count={4} />`)** | Flujo `/reservar` | 4 círculos concéntricos centrados (uno por paso: día, hora, datos, listo); cada paso completado enciende un círculo más desde el centro hacia afuera |
| A9 | **Confirmación (`<Orbits count={6} />`)** | Pantalla "Reserva recibida" | 6 círculos concéntricos centrados colapsan hacia el centro y rebotan una vez; aparece el código de reserva |
| A10 | **Ecualizador de horario** | Sección de horarios | Barras por día cuya altura = horas abiertas; se "llenan" al entrar en viewport, como un EQ |
| A11 | **Transición de página** | Navegación entre páginas | View Transitions: zoom hacia el centro de los anillos ("entrar al túnel") |
| A12 | **Pull-to-refresh (`<Orbits />`)** | Panel admin (PWA) | Al jalar hacia abajo, los círculos concéntricos se dibujan uno a uno hasta completar y refrescar |
| A13 | **Fondo de sección** | Secciones secundarias | Anillos gigantes en `smoke` al 20%, recortados, con parallax lento |
| A14 | **Marquee** | Tira de horarios/precio | Texto en loop; se pausa al tocar o hacer hover |

**Reglas de rendimiento**
- Animar solo `transform`, `opacity` y `stroke-dashoffset` (nada de `width`, `top`, `filter` animado).
- SVG inline, sin librerías pesadas. CSS primero; JS mínimo para A4, A5 y A12. (Motion/Framer solo si un caso lo justifica.)
- En móvil: A5 desactivado, A2 simplificado y A13 sin parallax.
- `prefers-reduced-motion: reduce` → todo estático excepto cambios de estado instantáneos; A3 se reemplaza por texto "Cargando…".

---

## 5. Texturas y fotografía

- **Grano:** overlay SVG `feTurbulence` a 4–6% de opacidad (estático, sin animar, para no gastar batería).
- **Rejilla de bocina (grill cloth):** patrón de tramado fino en fondos de secciones secundarias.
- **Fotografía:** siempre **blanco y negro, alto contraste, negros profundos** (procesar desde origen; fallback CSS `grayscale(1) contrast(1.25)`). Encuadres cerrados de equipo: perillas, cables, platillos, manos.
- **Prohibido:** stock de "banda feliz", fotos a color, ilustraciones 3D, mockups genéricos.

---

## 6. Movimiento general (fuera de los anillos)

| Patrón | Detalle |
|---|---|
| Entrada de secciones | Reveal vertical corto (16px) + opacidad |
| Hover en CTA (desktop) | Microvibración (translate ±1px, 3 ciclos, 150ms) + inversión a contorno |
| Tap en CTA (móvil) | Onda A4 + `scale(0.98)` |
| Hover en links | Subrayado que se dibuja de izquierda a derecha |
| Bottom sheets (móvil) | Suben con ease-out 250ms y se cierran deslizando hacia abajo |

---

## 7. Componentes clave

### Botón primario: "Reservar"
Bloque rectangular **fondo `bone`, texto `ink`**, `Cinzel` en mayúsculas. A la izquierda, un **LED circular**
(contorno) que se rellena en hover o en tap. En hover pasa a contorno `bone` sobre `ink`. Altura mínima de 52px en móvil.

### Botón secundario
Transparente, borde 1px `bone`, texto `bone`. En hover se invierte.

### Botón WhatsApp
Secundario con ícono de WhatsApp **monocromo** (nunca el verde).

### Tabla de specs (equipo, horarios, precio)
Inspirada en la placa trasera de un amplificador: `JetBrains Mono`, filas separadas por líneas finas,
etiqueta en `Cinzel` a la izquierda y valor a la derecha. En móvil la etiqueta va arriba y el valor abajo si no caben.

```
# EJEMPLO: el equipo real está pendiente de confirmar con la sala
BATERÍA ............................ (pendiente)
HORARIO MAR–VIE ................... 17:00 — 23:00
PRECIO ................................ $150 / hora
```

### Card de servicio
Sin card "flotante": bloque con borde superior de 1px, número grande (`01`, `02`) en display,
título en minúsculas y CTA de texto con flecha.

### Flyer de la pizzería (Ulular Napule Pizza)
El **único** elemento con rotación (−2°): parece un flyer pegado con cinta. Fondo `bone`, texto `ink`.
Es una pausa visual que no compite con el CTA de reservar.

### Calendario de reserva
- Móvil: **tira horizontal de días con scroll** (snap), 7 visibles por ancho; tablet y desktop: mes completo.
- Días no disponibles en `smoke`. **Lunes:** marcado "con reserva anticipada"; al tocarlo aparece el CTA de WhatsApp.
- Slots en lista vertical tipo **tracklist** (`17:00 ··· disponible`), mono, filas de 56px; el seleccionado se **invierte** (fondo `white`, texto `ink`) con onda A4.

### Panel admin
Misma paleta y tipografías, más densa y funcional. Anillos solo en login, loaders (A3) y pull-to-refresh (A12).
Estados según la tabla de §2.1.

---

## 8. Layout de referencia (Home)

1. **Hero responsive:** en **desktop (≥1024px)** va dividido ("ulular" gigante + "SALA DE ENSAYO" + precio + CTA a la izquierda, anillos del logo animados A0 a la derecha); en **celular e iPad (<1024px)** los anillos van centrados arriba y el texto + CTA centrados abajo para que nada se recorte. Al hacer scroll: túnel (A2) y logo al header (A7).
   - *Alternativa guardada:* `docs/design/prototypes/hero-logo-centrado.html` (logo vertical completo al centro).
2. Marquee (A14): `MAR–VIE 17–23 · SÁB 11–23 · DOM 11–20 · LUN CON RESERVA ANTICIPADA · $150/H`.
3. La sala: foto B/N grande + tabla de specs.
4. Cómo reservar: 3 pasos con números gigantes.
5. Servicios: fotografía, backline, live sessions (lista numerada, CTA de WhatsApp).
6. Galería B/N (móvil: carrusel con snap; desktop: grid irregular).
7. Flyer Ulular Napule Pizza + canal de difusión de WhatsApp.
8. Horarios con ecualizador (A10) + mapa en escala de grises + contacto.
9. Footer con anillos medio recortados.

---

## 9. Responsive: celular primero, iPad y desktop al 100%

**Se diseña y construye primero para 375px**, después se amplía.

| Breakpoint | Ancho | Dispositivos de prueba | Notas |
|---|---|---|---|
| base | 360–639px | iPhone SE (375), iPhone 15 (393), Pixel 7 (412) | 1 columna, barra fija inferior "Reservar" + WhatsApp |
| `sm` | ≥640px | teléfonos grandes en horizontal | |
| `md` | ≥768px | **iPad mini/Air vertical (768–820)** | 2 columnas, calendario mensual, nav visible |
| `lg` | ≥1024px | **iPad horizontal / iPad Pro (1024–1366)** | Layout desktop **con objetivos táctiles** (el iPad no tiene hover) |
| `xl` | ≥1280px | Laptop/desktop | Hero asimétrico completo, cursor A5 |
| `2xl` | ≥1536px | Monitores grandes | Contenedor máx. 1440px; los anillos sí pueden desbordar |

**Reglas móviles obligatorias**
- Objetivos táctiles **≥ 44×44px** (CTA ≥ 52px de alto). Separación mínima de 8px entre elementos tocables.
- Inputs con `font-size ≥ 16px` (evita el zoom de iOS), `inputmode="tel"` y `autocomplete` correctos.
- Usar `100dvh` / `svh` en lugar de `100vh`; respetar `env(safe-area-inset-*)` (notch y home indicator), sobre todo en la barra inferior.
- **Barra fija inferior en móvil** (sitio): `Reservar` + ícono de WhatsApp, que se oculta al hacer scroll hacia abajo y aparece al subir.
- **Menú móvil:** pantalla completa con anillos de fondo (no un drawer genérico).
- **Panel admin en móvil:** navegación inferior con pestañas (Agenda · Pendientes · Nueva · Ajustes), detalles en **bottom sheet** y acciones al alcance del pulgar.
- Hover nunca es la única forma de revelar información: usar `@media (hover: hover)` para los efectos de hover.
- Imágenes con `sizes` correctos (`next/image`); presupuesto de móvil: LCP < 2.5s en 4G, JS inicial < 150KB.
- Orientación horizontal soportada en celular y en iPad.

---

## 10. Anti-patrones (prohibido)

- ❌ **Cualquier color con matiz** (incluido el azul de acento que se descartó)
- ❌ Gradientes de color
- ❌ Glassmorphism / `backdrop-blur` decorativo
- ❌ `rounded-xl`, `rounded-2xl`, píldoras (excepto círculos reales)
- ❌ Sombras suaves tipo `shadow-lg`
- ❌ Hero centrado con dos botones lado a lado y un subtítulo gris
- ❌ Grids de 3 cards iguales con ícono arriba
- ❌ Inter, Roboto o fuentes del sistema como fuente visible
- ❌ Emojis decorativos en la UI pública
- ❌ Íconos genéricos llenos (usar línea fina de 1.5px, monocromo)
- ❌ Verde WhatsApp, azul Facebook o rosa Instagram
- ❌ Fotos de stock, llamas, calaveras, rayos, guitarras clipart
- ❌ Texto en mayúsculas con fuente display (las mayúsculas son solo para Cinzel)
- ❌ Diseñar en desktop y "encoger" a móvil
- ❌ Interacciones que dependen solo de hover

---

## 11. Accesibilidad (no negociable)
- Contraste AA mínimo; **foco visible** con outline 2px `white` + offset 3px (y halo `ink` en secciones invertidas).
- Estados comunicados con forma, ícono y texto, nunca solo con tono de gris.
- `prefers-reduced-motion` respetado (ver §4).
- Los anillos decorativos llevan `aria-hidden="true"`.
- Formularios con labels visibles (no solo placeholders).
