# Demo PUENTE — Guión de 3 minutos

> Pitch del viernes · Arrancar con `./start.sh` (web :3000, API :8000) · Tener `/demo/luis` y `/demo/juan` abiertos en pestañas por si hay que saltar.

**Personas:** Luis (28, TEA, testigo) · Juan (32, TDAH + ceguera, investigado)

---

## Minuto 0:00–0:30 — Gancho (inicio)

**Ruta:** `/`

**Clicar:** nada, o señalar «Luis y Juan» abajo.

**Decir:**  
«Uno de cada siete personas es neurodivergente. Cuando llega una citación judicial, la ley ya obliga a ajustar… pero casi nadie sabe cómo pedirlos. PUENTE lo convierte en tres gestos: entender la citación, preparar la sala y mostrar un Pasaporte sin diagnóstico.»

---

## Minuto 0:30–1:20 — Luis: entender y anticipar

**Ruta:** `/demo/luis`  
(Desde `/` → «Ver el recorrido de Luis»)

**Clicar:**
1. Pestaña **Su citación** → toggle Lectura clara / Lectura fácil → **Leer en voz** (opcional).
2. **Ajustes** → «Ir a crear Pasaporte» (lleva a `/pasaporte?ajustes=sala-tranquila,preguntas-claras,mas-tiempo,facilitador`).

**Decir:**  
«Luis es testigo. Necesita frases literales y saber qué va a pasar. Aquí ve la citación en lectura fácil… y estos ajustes ya van precargados al Pasaporte: sala tranquila, preguntas claras, más tiempo, facilitador. Sin decir “tengo autismo”.»

**Atajo si va corto:** saltar fases/roles; ir directo a Ajustes → Pasaporte.

---

## Minuto 1:20–2:10 — Sala Previa + Ensaya (producto de la noche)

**Ruta:** `/sala-previa`

**Clicar:**
1. Completar **intro** (aviso de audio) si aparece.
2. Bajar un estímulo (ruido o luz) → señalar feedback visual suave.
3. **Check-in de confort** o panel **«Lo que te ayuda»** → enlace al Pasaporte.
4. Si hay tiempo: una escena del recorrido → enlace a `/ensaya?desde=sala-previa`.

**Decir:**  
«Antes del día, Luis prueba la sala a su ritmo: ruido, luz, gente. Si se agobia, el botón de calma está siempre a mano. Lo que le ayuda se lleva al Pasaporte. Y puede cruzar a Ensaya para practicar preguntas sin castigo: la confianza solo sube.»

**Atajo:** solo intro + un slider + «Lo que te ayuda» → Pasaporte.

---

## Minuto 2:10–2:45 — Juan: voz y Pasaporte

**Ruta:** `/demo/juan`

**Clicar:**
1. **Modo voz** (botón grande) — dejar 5–8 s de audio.
2. Pestaña **Ajustes** → «Ir a crear Pasaporte»  
   (`/pasaporte?ajustes=documentos-voz,descripcion-pruebas,pausas,preguntas-claras,acompanante`).
3. En Pasaporte: generar / mostrar QR → abrir `/pasaporte/ver` (o escanear).

**Decir:**  
«Juan es investigado, tiene TDAH y es ciego. Empieza por la voz. Su Pasaporte pide documentos en audio, pausas y acompañante — necesidades funcionales, no etiquetas. El profesional escanea el QR y ve qué hay que adaptar.»

---

## Minuto 2:45–3:00 — Cierre

**Decir (frase pitch):**  
«No pedimos un favor: el derecho ya existe. PUENTE lo hace usable — citación clara, sala a tu ritmo y un Pasaporte de ajustes sin diagnóstico.»

Señalar base legal en una frase: art. 7 bis LEC + RD 707/2026 (accesibilidad cognitiva).

---

## Plan B (si algo falla)

| Fallo | Qué hacer |
|-------|-----------|
| **Sin internet / ARASAAC caído** | Pictogramas pueden no cargar. No insistir. Usar `/demo/luis` y `/demo/juan` (texto + voz locales). Decir: «Los pictogramas vienen de ARASAAC; en demo offline priorizamos lectura fácil y audio.» |
| **Audio / SpeechSynthesis no suena** | No pulsar «Leer en voz» ni Modo voz. Leer en alto 2–3 frases de la citación de Juan. |
| **Sala Previa con audio raro** | Saltar intro de audio; mostrar solo sliders + botón calma + «Lo que te ayuda». |
| **API / backend caído** | Evitar `/citacion` en vivo. Quedarse en demos estáticas + Pasaporte (localStorage) + Sala Previa. |
| **Pantalla en blanco** | Recargar; si no, abrir pestaña de respaldo ya cargada. Tener `./start.sh` listo en otra terminal. |
| **QR no abre** | Ir a mano a `/pasaporte/ver` o mostrar la lista de ajustes en pantalla. |

---

## Checklist 5 min antes

- [ ] `./start.sh` o frontend + backend arriba  
- [ ] Pestañas: `/`, `/demo/luis`, `/demo/juan`, `/sala-previa`, `/pasaporte`  
- [ ] Volumen del portátil OK; probar un «Leer en voz»  
- [ ] localStorage limpio o flujo Luis ya ensayado una vez  
- [ ] Frase de cierre memorizada  
