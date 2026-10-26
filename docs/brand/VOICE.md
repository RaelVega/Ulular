# VOICE.md: cómo habla Ulular

## Personalidad
Ulular es **la sala de ensayo de la banda**: gente que también toca, que conoce el equipo
y la escena de Querétaro. Habla **directo, cercano y con oficio**. Nada corporativo y nada forzado.

| Somos | No somos |
|---|---|
| Directos | Vendedores |
| De banda, de escena | "Cool" impostado |
| Claros con reglas y precios | Ambiguos ni con letra chiquita |
| Cálidos | Empalagosos |

## Reglas
1. **Tuteo siempre.** "Aparta tu ensayo", nunca "Reserve usted".
2. **Frases cortas.** Una idea por frase. Los titulares tienen de 2 a 5 palabras y van en minúsculas.
3. **Jerga de músico sí, groserías no.** ensayo, toquín, tocada, backline, rola, armar, sonar, volumen.
4. **Las reglas se dicen claro y sin culpa**: precio, pago previo, cancelación.
5. **Español mexicano** neutro-cercano. Sin anglicismos innecesarios (excepto los del oficio: backline, open mic, live session).
6. **Números concretos** siempre: "\$150 la hora", "mínimo 1 hora", "24 h antes".
7. Sin emojis en la web pública. En los mensajes de WhatsApp se permiten uno o dos (✅ 🤘).

## Así sí / así no

| ❌ Así no | ✅ Así sí |
|---|---|
| "Bienvenidos a nuestra plataforma de reservas" | "aparta tu ensayo" |
| "Ofrecemos soluciones integrales para músicos" | "Sala, backline y foto. Todo en un mismo lugar." |
| "Lamentablemente no hay disponibilidad" | "Ese horario ya está tomado. Prueba otro." |
| "Cerrado" | "Lunes: solo con reserva anticipada" |
| "Términos y condiciones aplican" | "Las horas que apartas se pagan completas, aunque terminen antes." |
| "¡Gracias por su preferencia!" | "Listo. Nos vemos en la sala." |
| "Error al procesar la solicitud" | "Algo falló de nuestro lado. Inténtalo de nuevo o escríbenos por WhatsApp." |

## Microcopy base

- **CTA principal:** `Reservar` / `Aparta tu ensayo`
- **Precio:** `$150 / hora · mínimo 1 hora`
- **Horario especial:** `¿Necesitas otro horario? Escríbenos por WhatsApp.`
- **Lunes:** `Solo con reserva anticipada`
- **Reglas (checkbox al reservar):**
  - `El pago se hace antes de entrar al ensayo (efectivo o transferencia).`
  - `Las horas apartadas se pagan completas, aunque se usen menos.`
  - `Se dan 15 minutos de tolerancia; las horas reservadas no se recorren.`
  - `Si no puedes venir, cancela con al menos 24 h de anticipación.`
- **Reserva recibida:** `Recibimos tu solicitud. Te confirmamos por WhatsApp. Tu código: UL-7K2Q`
- **Estado pendiente:** `Pendiente de confirmar`
- **Estado confirmada:** `Confirmada. Nos vemos en la sala.`
- **Pizzería:** `Después del ensayo, pizza. Ulular Napule Pizza: pizza napolitana, open mic y tocadas.`
- **Canal de difusión:** `Únete al canal: tocadas, horarios libres y promos.`

## Plantillas de WhatsApp (generadas por el panel)

**Banda → sala (al reservar)**
```
Hola Ulular 🤘 Acabo de solicitar un ensayo:
Banda: {band}
Fecha: {fecha} · {inicio}–{fin} ({horas} h)
Total: ${total}
Código: {code}
```

**Sala → banda (confirmación)**
```
¡Confirmado ✅! {band}, los esperamos el {fecha} de {inicio} a {fin}.
Total: ${total}. Recuerda que el pago es antes de entrar.
Si no pueden venir, avisa con 24 h de anticipación.
Detalles: {url_estado}
```

**Sala → banda (cancelación)**
```
Hola {band}, tu ensayo del {fecha} {inicio}–{fin} quedó cancelado.
Cuando quieras volver a apartar: {url_reservar}
```

**Horario especial (visitante → sala)**
```
Hola Ulular, quiero preguntar por un horario especial: ____
```
