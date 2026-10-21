# Análisis del Reto 3 vs. Estado Actual de PUENTE (Actualizado Mañana Miércoles 21 Oct)

> **Directriz para agentes de código**: No proponer ni generar guiones de demo, ideas para presentaciones ni flujos de demostración. Centrarse exclusivamente en el desarrollo del producto (UI/UX, frontend, backend y accesibilidad) hasta que el equipo pida explícitamente material de presentación.

Documento de brecha (*gap analysis*) y hoja de ruta basado en las diapositivas oficiales del **DATAthon Justicia 2026 — Reto 3: Justicia Inteligente para la Neurodiversidad** (Ana Tudela, INECO) y actualizado tras los **22 commits de la noche (`d5bb800..8fba0c7`)**.

---

## 1. Lo que se ha añadido de nuevo esta noche (`d5bb800..8fba0c7`)

Se han incorporado **29 archivos de código (+3.717 líneas)**, un script de arranque unificado (`start.sh`) y una carpeta de investigación normativa y funcional (`/docs/investigacion/`):

### A. Nuevas funcionalidades en `Sala Previa` (`/sala-previa`)
1. **Intro guiada con aviso de audio ([`IntroSalaPrevia.tsx`](file:///c:/Users/tiagu/OneDrive/Documentos/Projects/DATATHON-2026/frontend/src/components/sala-previa/IntroSalaPrevia.tsx))**: anticipa que va a sonar audio sintético antes de activar nada y recuerda si ya se vio.
2. **Recorrido por 4 escenas del juzgado ([`RecorridoEscenas.tsx`](file:///c:/Users/tiagu/OneDrive/Documentos/Projects/DATATHON-2026/frontend/src/components/sala-previa/RecorridoEscenas.tsx) y [`escenas.ts`](file:///c:/Users/tiagu/OneDrive/Documentos/Projects/DATATHON-2026/frontend/src/lib/sala-previa/escenas.ts))**: entrada/control de seguridad, pasillo de espera, puerta de la sala y estrado, enlazadas al nivel sensorial.
3. **Controles con pictogramas ARASAAC y niveles en palabras ([`ControlesEstimulo.tsx`](file:///c:/Users/tiagu/OneDrive/Documentos/Projects/DATATHON-2026/frontend/src/components/sala-previa/ControlesEstimulo.tsx))**: cada estímulo (ruido, luz, gente, eco) incluye pictograma y etiqueta verbal clara.
4. **Reacciones visuales suaves ([`EscenaSensorial.tsx`](file:///c:/Users/tiagu/OneDrive/Documentos/Projects/DATATHON-2026/frontend/src/components/sala-previa/EscenaSensorial.tsx))**: la ilustración de la sala responde de forma gradual al mover cada control y al activar el modo calma.
5. **Check-in de confort con pictogramas ([`CheckInConfort.tsx`](file:///c:/Users/tiagu/OneDrive/Documentos/Projects/DATATHON-2026/frontend/src/components/sala-previa/CheckInConfort.tsx))**: escala con pictogramas ARASAAC y conexión directa al Pasaporte.
6. **Panel «Lo que te ayuda» ([`PanelLoQueTeAyuda.tsx`](file:///c:/Users/tiagu/OneDrive/Documentos/Projects/DATATHON-2026/frontend/src/components/sala-previa/PanelLoQueTeAyuda.tsx) y [`loQueTeAyuda.ts`](file:///c:/Users/tiagu/OneDrive/Documentos/Projects/DATATHON-2026/frontend/src/lib/sala-previa/loQueTeAyuda.ts))**: traduce automáticamente lo que el usuario ha probado en la sala en frases en primera persona y ajustes listos para enviar al Pasaporte (`?ajustes=...`).

### B. Sistema transversal de Gamificación Calmada (Sala Previa + Ensaya + Pasaporte)
1. **Insignias útiles ([`insignias.ts`](file:///c:/Users/tiagu/OneDrive/Documentos/Projects/DATATHON-2026/frontend/src/lib/insignias.ts), [`PanelInsignias.tsx`](file:///c:/Users/tiagu/OneDrive/Documentos/Projects/DATATHON-2026/frontend/src/components/insignias/PanelInsignias.tsx), [`AvisoInsignia.tsx`](file:///c:/Users/tiagu/OneDrive/Documentos/Projects/DATATHON-2026/frontend/src/components/insignias/AvisoInsignia.tsx))**: premia acciones de autocuidado (usar la calma, pedir ajustes en el Pasaporte, completar un nivel en Ensaya).
2. **Medidor de confianza sin castigo ([`confianza.ts`](file:///c:/Users/tiagu/OneDrive/Documentos/Projects/DATATHON-2026/frontend/src/lib/confianza.ts), [`MedidorConfianza.tsx`](file:///c:/Users/tiagu/OneDrive/Documentos/Projects/DATATHON-2026/frontend/src/components/sala-previa/MedidorConfianza.tsx))**: la confianza sube al practicar, parar o pedir ayuda, y **nunca baja**.
3. **Días de práctica acumulados, sin rachas punitivas ([`practica.ts`](file:///c:/Users/tiagu/OneDrive/Documentos/Projects/DATATHON-2026/frontend/src/lib/practica.ts), [`PanelDiasPractica.tsx`](file:///c:/Users/tiagu/OneDrive/Documentos/Projects/DATATHON-2026/frontend/src/components/practica/PanelDiasPractica.tsx))**: cuenta los días practicados sin penalizar si un día se descansa.
4. **Cruce bidireccional Ensaya ↔ Sala Previa**: desde la escena de declaración en Sala Previa se puede saltar a `/ensaya?desde=sala-previa` y volver conservando el nivel sensorial.

### C. Mejoras en `Ensaya` (`/ensaya`)
- **Pictogramas ARASAAC en cada pregunta y nivel** ([`ensaya/page.tsx`](file:///c:/Users/tiagu/OneDrive/Documentos/Projects/DATATHON-2026/frontend/src/app/ensaya/page.tsx)).
- Integración con el medidor de confianza, días de práctica e insignias útiles.

### D. Documentación Legal e Investigación (`/docs/investigacion/`)
- [`docs/investigacion/RESUMEN-NOCHE.md`](file:///c:/Users/tiagu/OneDrive/Documentos/Projects/DATATHON-2026/docs/investigacion/RESUMEN-NOCHE.md): resumen ejecutivo con estadísticas clave (67 % de sobreseimiento sin facilitador según UAVDI; solo el 31 % de procedimientos considera la DI según *A Cada Lado*).
- [`docs/investigacion/marco-legal.md`](file:///c:/Users/tiagu/OneDrive/Documentos/Projects/DATATHON-2026/docs/investigacion/marco-legal.md): Art. 24 y 49 CE, Art. 7 bis LEC, Art. 109/118/143.2 LECrim, **RD 707/2026** (accesibilidad cognitiva), precisión penal sobre estafa leve (**art. 248 CP** vs. art. 249 CP tras LO 14/2022 y LO 1/2026).
- [`docs/investigacion/neurodiversidad-ajustes.md`](file:///c:/Users/tiagu/OneDrive/Documentos/Projects/DATATHON-2026/docs/investigacion/neurodiversidad-ajustes.md): TEA, TDAH, Dislexia/Discalculia/Disgrafía, Discapacidad Intelectual (datos ENABLE y *A Cada Lado*), Sordera (CNSE) y Ceguera (Convenio ONCE-MJ 2025).
- [`docs/investigacion/mejoras-producto.md`](file:///c:/Users/tiagu/OneDrive/Documentos/Projects/DATATHON-2026/docs/investigacion/mejoras-producto.md): backlog P0/P1/P2 por pantalla.

---

## 2. Qué queda por hacer hoy en producto (Foco en P0 y P1)

Con `Sala Previa` y la gamificación calmada ya terminadas, esto es lo que falta implementar en código hoy para cubrir al 100 % el PDF del Reto 3 y el documento [`mejoras-producto.md`](file:///c:/Users/tiagu/OneDrive/Documentos/Projects/DATATHON-2026/docs/investigacion/mejoras-producto.md):

1. **Base legal visible en cada ajuste y exportación limpia en PDF del Pasaporte (`P01`, `P02`, `P03`)**:
   - En `lib/contenido.ts` faltan los ajustes adicionales de `data/ajustes-disponibles.json` (`lenguaje-literal`, `anticipacion`) y los detectados en investigación (`lector-pantalla`, `audiodescripcion`, `horario-preferente`, `lectura-facil-sentencia`), además de mostrar su `base_legal` (ej. *Art. 7 bis.2.c LEC*, *Guía CGPJ 2025*) tanto en `/pasaporte` como en `/pasaporte/ver`.
   - Añadir estilos `@media print` para que **"Imprimir o guardar"** genere un PDF limpio de 1 página con el QR y la fundamentación jurídica.
2. **Modo Voz completo (Speech-to-Text) y alerta de respuesta impulsiva en `/ensaya` (`E01`, `E02`, Disgrafía + TDAH + Ceguera)**:
   - Añadir botón **"Responder hablando"** (`SpeechRecognition`) para que una persona ciega o con disgrafía no tenga que teclear.
   - Añadir aviso amable para TDAH si pulsa siguiente en menos de 3 segundos en preguntas difíciles (*"¿Quieres revisar tu respuesta o tomarte unos segundos más?"*).
3. **Completar `/citacion`: Sentencias en lectura fácil, Discalculia, Quién es quién y Subida de archivo (`C01`–`C07`)**:
   - Añadir soporte y ejemplo de **Sentencia en lectura fácil** (diapositiva 35).
   - Añadir bloque de **Discalculia** (importes en letra y cuenta atrás clara de plazos) y bloque **"¿Qué pasa si no voy?"** sin generar pánico.
   - Mostrar las tarjetas de roles (`TarjetaRol`) y permitir subir un PDF/TXT de citación.
4. **Reescritura real de preguntas en `/mediador` + modo voz (`M01`, `M02`, `M03`)**:
   - Endpoint `/api/analizar-pregunta` o motor de reformulación que devuelva la pregunta ya dividida y en lectura fácil, más botones de preguntas frecuentes y dictado por voz.
5. **Actualizar `/profesional` con los datos de investigación normativa**:
   - En `/profesional`: incluir **Espazo Compartido (UDC)**, **FADEMGA**, **FAXPG**, perfiles de **Discalculia/Disgrafía (DEA)** y **Discapacidad Intelectual**, las estadísticas de impacto (67 % a 24 % sobreseimiento con facilitador) y las 3 vías de detección (*flag* procesal con o sin certificado del 33 %).

---

## 3. División del Trabajo Actualizada entre las 3 Personas (Sin conflictos de Git)

| Persona | Rol en el equipo | Archivos exclusivos que toca hoy |
|---------|------------------|----------------------------------|
| **Persona 1** | **100 % UI/UX, Diseño Visual, Impresión PDF y Accesibilidad** | `globals.css`, `Cabecera.tsx`, `page.tsx` (Inicio), `pasaporte/page.tsx`, `pasaporte/ver/page.tsx`, `components/TarjetaRol.tsx`, `components/LineaTiempo.tsx` |
| **Persona 2** | **IA, Backend, Citación/Sentencia y Mediador** | `backend/app/*`, `citacion/page.tsx`, `mediador/page.tsx`, `lib/api.ts` |
| **Persona 3** | **Voz en Ensaya, Panel Profesional y Contenido Normativo** | `ensaya/page.tsx`, `profesional/page.tsx`, `lib/contenido.ts` |

---

### Persona 1 — 100 % UI/UX, Diseño Visual y Accesibilidad

- [ ] **1. Exportación PDF / Impresión impecable del Pasaporte (`P01`, `P02` en `globals.css`, `pasaporte/page.tsx`, `pasaporte/ver/page.tsx`)**:
  - Mostrar la **base legal** debajo de cada ajuste en el Pasaporte y en la vista escaneable `/pasaporte/ver` (ej. *Art. 7 bis.2.c LEC · Guía CGPJ 2025*).
  - Añadir reglas `@media print` en `globals.css` para ocultar cabecera/botones al imprimir y dejar una credencial A4 lista para entregar en el decanato o mostrar en PDF.
- [ ] **2. Barra de Preferencias Cognitivas en `Cabecera.tsx`**:
  - Controles rápidos persistentes: tamaño de texto (`A` / `A+`), espaciado de lectura para dislexia (`.espaciado-lectura`) y modo calma visual.
- [ ] **3. Unificación visual de Inicio (`page.tsx`) y Pie con Asociaciones Colaboradoras**:
  - Incluir en el `footer` de inicio las entidades colaboradoras del Reto 3 (**ANHIDA Coruña, ASPERGA, Espazo Compartido UDC, Fundación ONCE**) y la mención al **RD 707/2026**.
- [ ] **4. Repaso responsive móvil (375px) y foco de teclado**:
  - Revisar que todas las vistas sean accesibles con teclado y sin saltos de layout en móvil y escritorio.

---

### Persona 2 — IA, Backend, Citación/Sentencia y Mediador (COMPLETADO)

- [x] **1. Modo Sentencia en lectura fácil y Subida de documento en `/citacion` y `backend/app/`**:
  - Añadir soporte de **Sentencia en lectura fácil** (diapositiva 35) y opción de subir archivo `.txt`/`.pdf` de citación.
  - Mostrar visualmente los pasos del pipeline *"Suma de varias IAs"* (diapositiva 34).
- [x] **2. Mejoras `C01`–`C07` en `/citacion`**:
  - Bloque especial para **Discalculia** (importes en palabras, plazos con cuenta atrás visual `C04`).
  - Modo **Paso a paso (Súper simple)** (`C06`) con tarjetas numeradas.
  - Bloque claro **"¿Qué pasa si no voy o no puedo ir ese día?"** (`C07`).
  - Mostrar la sección **"¿Quién estará en la sala?"** en el resultado de la citación.
- [x] **3. Reformulación automática y voz en `/mediador` (`M01`, `M02`, `M03`)**:
  - Endpoint `POST /api/analizar-pregunta` (y fallback local enriquecido) que devuelve la **pregunta ya reescrita en lectura fácil**, dividida frase por frase, con dictado por voz (`SpeechRecognition`) y botón `BotonLeerEnVoz`.

---

### Persona 3 — Voz en Ensaya, Panel Profesional y Contenido Normativo

- [ ] **1. Completar `lib/contenido.ts` con todos los ajustes y base legal**:
  - Sincronizar `AJUSTES_DISPONIBLES` con `data/ajustes-disponibles.json` y `mejoras-producto.md` (`lenguaje-literal`, `anticipacion`, `lector-pantalla`, `audiodescripcion`, `horario-preferente`, `lectura-facil-sentencia`) incluyendo el campo `baseLegal`, y añadir el rol de **Perito / Médico Forense** en `ROLES`.
- [ ] **2. Modo Voz (Speech-to-Text) y detector de impulsividad TDAH en `/ensaya` (`E01`, `E02`)**:
  - Botón **"Responder hablando"** con `SpeechRecognition` del navegador (cubre ceguera y disgrafía).
  - Si el usuario responde o avanza en menos de 3 segundos en el nivel 3, mostrar recordatorio amable para TDAH: *"Tómate tu tiempo antes de contestar"*.
- [ ] **3. Actualizar `/profesional` (`PR01`–`PR05`)**:
  - Añadir **Espazo Compartido (UDC)** y **FADEMGA**, perfiles de **DEA (Dislexia, Discalculia, Disgrafía)** y **Discapacidad Intelectual**, datos de impacto (UAVDI / *A Cada Lado* / RD 707/2026) y las 3 vías de activación de ajustes (de oficio, informe clínico o grado oficial).
