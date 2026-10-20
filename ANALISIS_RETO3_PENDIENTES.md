# Análisis del Reto 3 vs. Estado Actual de PUENTE

Documento de brecha (*gap analysis*) y hoja de ruta basado en las diapositivas oficiales del **DATAthon Justicia 2026 — Reto 3: Justicia Inteligente para la Neurodiversidad** (Ana Tudela, INECO).

---

## 1. Qué tenemos ya construido y funcionando

| Módulo | Ruta | Estado actual | Qué requisitos del Reto 3 cubre |
|--------|------|---------------|----------------------------------|
| **Inicio** | `/` | Funcional | Acceso directo sin ruido visual, enlaces a Citación, Pasaporte, Ensaya, Sala Previa, Demos (Luis/Juan) y Panel Profesional. |
| **Procesador de Citación** | `/citacion` | Funcional (Mock + API) | Transforma citaciones en **Lectura Clara** y **Lectura Fácil (UNE 153101)**, extrae datos clave (rol, fecha, hora, lugar, derechos, qué llevar), muestra **pictogramas ARASAAC**, lee en voz alta y descarga recordatorios `.ics` (7, 2 y 1 día antes). |
| **Pasaporte de Ajustes** | `/pasaporte` y `/pasaporte/ver` | Funcional | Genera un **código QR escaneable** que abre una vista limpia para el funcionario del juzgado con las adaptaciones solicitadas, **sin revelar diagnóstico** (enfoque no capacitista). |
| **Simulador de Declaración** | `/ensaya` | Funcional | Práctica en 3 niveles (preguntas claras, de abogados y preguntas capciosas/difíciles) con lectura por voz, alertas de preguntas confusas y pantalla final de recomendaciones. |
| **Sala Previa** | `/sala-previa` | Funcional | Simulación sensorial progresiva en 6 niveles (0 a 5) con audio sintético Web Audio API (ruido, luz, gente, eco), botón de **Volver a la calma**, check-in emocional, racha/insignias (gamificación) y conexión directa al Pasaporte. |
| **Mediador "Pregunta Clara"** | `/mediador` | Funcional (Reglas locales) | Semáforo (verde/amarillo/rojo) que detecta doble negación, preguntas compuestas, sugestivas, intimidantes, jerga jurídica y frases > 20 palabras. |
| **Panel Profesional** | `/profesional` | Funcional (Básico) | 4 pasos de la Guía CGPJ 2025, checklist por perfil (TEA, TDAH, dislexia, ceguera), generación de informe imprimible y lector de códigos/enlaces de Pasaporte. |
| **Casos de Uso (Luis y Juan)** | `/demo/luis` y `/demo/juan` | Funcional | Recorridos guiados para **Luis** (28 años, TEA nivel 1, testigo) y **Juan** (32 años, TDAH combinado + ceguera, investigado por estafa leve). |

---

## 2. Qué pide el PDF del Reto 3 que AÚN FALTA o se debe mejorar

Al cruzar las diapositivas 29 a 39 del documento oficial con nuestro código actual, aparecen **8 puntos clave** que el jurado y las asociaciones colaboradoras (**ANHIDA Coruña, ASPERGA, Espazo Compartido UDC y Fundación ONCE**) van a buscar en la evaluación del jueves (18:00) y viernes (09:00):

### A. Cobertura completa de condiciones del Reto 3 (Diapositiva 31)
El PDF destaca explícitamente 5 condiciones: **TEA, TDAH, Dislexia, Discalculia y Disgrafía**.
- **Qué falta**:
  1. **Discalculia**: En `/citacion` y `/profesional` no hay adaptación específica para discalculia (traducir cuantías, porcentajes, multas de `"200 a 5.000 €"` o plazos en días hábiles a fechas exactas en calendario visual y cifras escritas con palabras + comparaciones comprensibles).
  2. **Disgrafía**: En `/ensaya` y en la línea de tiempo de Juan, el usuario solo puede escribir con teclado. Añadir **dictado por voz (Web Speech API `SpeechRecognition`)** permite responder hablando sin tener que teclear ni escribir.
  3. **Incluir `lenguaje-literal` y `anticipacion` en el frontend**: Están definidos en `data/ajustes-disponibles.json`, pero faltaban en `AJUSTES_DISPONIBLES` de `frontend/src/lib/contenido.ts`.

### B. De la citación a la SENTENCIA y Juicios Telemáticos (Diapositivas 32 y 35)
- El eslogan de PUENTE es *"De la citación a la sentencia, a tu manera"* y la diapositiva 35 cita expresamente el **caso real de la jueza española que adapta una sentencia a lectura fácil**.
- La diapositiva 32 pide facilitar la participación en **procesos judiciales presenciales o telemáticos** (como víctimas, testigos o acusados).
- **Qué falta**:
  1. **Modo Sentencia / Notificación en `/citacion`**: Permitir elegir o detectar si el documento pegado es una **Citación**, un **Auto/Notificación** o una **Sentencia** (incluir un botón de ejemplo de *Sentencia adaptada* que explique el fallo, qué significa absolución/condena y los plazos para recurrir).
  2. **Subida de PDF o Foto (OCR / Docling)**: En `/citacion` solo hay un `<textarea>` para pegar texto. Añadir un botón para **subir un PDF o foto de la carta** (aunque en demo parsee el PDF en backend o extraiga el texto) suma muchos puntos en el premio a **Mejor Solución Técnica**.
  3. **Ajustes para Juicio Telemático (Videollamada)**: Añadir en el Pasaporte y en Sala Previa orientaciones para comparecencia por videoconferencia (cámara, turnos de palabra, entorno sin distracciones).

### C. Requisitos específicos del Caso de Uso de Juan (Diapositiva 37)
La diapositiva 37 detalla 9 puntos sobre Juan (32 años, TDAH combinado + invidente, acusado de estafa leve del **art. 249 CP** — en `mock_data.py` ponía solo `art. 248 CP`, conviene mencionar `arts. 248 y 249 CP` como en la diapositiva):
- **Qué falta del caso de Juan**:
  1. **Constructor interactivo de Línea de Tiempo ("Organizar mi relato")**: En `/demo/juan` la línea de tiempo es estática. El PDF dice: *"Tiene problemas para organizar el relato de los hechos y olvida datos relevantes"* y *"Responde de forma impulsiva"*. Si permitimos **añadir/ordenar hitos por voz o texto** y descargar una **"Chuleta / Guion de apoyo para llevar a la sala"** (ajustado a su derecho a usar notas de apoyo por TDAH), clavamos el caso de uso.
  2. **Describir pruebas visuales (IA / Accesibilidad para ceguera)**: El PDF dice: *"Tiene dificultades para revisar pruebas documentales o digitales presentadas únicamente en formato visual"*. En `/demo/juan` podemos incluir una sección **"Pruebas del expediente descritas por voz"** (descripción auditiva detallada del pantallazo de Wallapop, el justificante de Bizum y el resguardo de Correos).
  3. **Acreditación sin grado oficial de discapacidad (Flag / Informes clínicos)**: La diapositiva 34 habla de *"Integración con otros organismos para reconocimientos oficiales de discapacidad o 'de algún modo' flag para identificar a las personas"* y la 37 recalca que Juan *"No tiene reconocido oficialmente un grado de discapacidad por TDAH, pero aporta informes clínicos acreditativos"*. En `/pasaporte` y `/profesional` debemos explicitar las **3 vías de acreditación** (Tarjeta/Grado oficial, Informe clínico/asociativo como ANHIDA/ASPERGA, o Detección de oficio por el juzgado según Guía CGPJ 2025).

### D. Requisitos específicos del Caso de Uso de Luis (Diapositiva 36)
- **Quién es quién en `/citacion`**: En `/demo/luis` sí aparece el componente `TarjetaRol` ("Quién es quién en la sala"), pero cuando un usuario normal procesa su citación en `/citacion`, **no se muestra la sección "¿Quién estará en la sala?"** ni la figura del **Perito / Médico Forense** (mencionado en la diapositiva 32).
- **Glosario interactivo de términos literales**: Resaltar expresiones como *"se le apercibe"*, *"diligencias previas"*, *"a los efectos oportunos"* con su traducción literal inmediata.

### E. Suma de varias IAs y Mediador conectado al Backend (Diapositiva 34)
La diapositiva 34 pide explícitamente:
- **"Aplicación de IA como mediadores"**
- **"Suma de varias IAs: lectura fácil, lectura clara..."**
- **Qué falta**:
  1. Crear un endpoint en el backend `POST /api/analizar-pregunta` que combine **reglas deterministas + reescritura automática de la pregunta** (convirtiendo cualquier pregunta con doble negación o compuesta en 2-3 preguntas simples y literales listas para leer en sala).
  2. Mostrar visiblemente en la UI el **Pipeline Multi-IA** de PUENTE:
     - *Agente 1 (Extractor Procesal)* → extrae plazos, rol, artículos y obligaciones.
     - *Agente 2 (Adaptador UNE)* → genera Lectura Clara (ISO 24495-1) + Lectura Fácil (UNE 153101) + adaptación numérica (Discalculia).
     - *Agente 3 (Traductor Visual/Auditivo)* → selecciona pictogramas ARASAAC y genera guion de voz pausado.
     - *Agente 4 (Mediador de Interrogatorio)* → reformula preguntas capciosas en tiempo real.

### F. Asociaciones Colaboradoras y Colegios Profesionales (Diapositivas 34, 38 y 39)
- Añadir **Espazo Compartido (Universidade da Coruña - UDC)** junto a **ANHIDA Coruña**, **ASPERGA** y **Fundación ONCE** en `/profesional` y en el pie/créditos, además de incluir la derivación a colegios profesionales / turno de oficio especializado y facilitadores.

---

## 3. División del Trabajo entre las 3 Personas

Reparto diseñado para que **una persona se dedique al 100 % a UI/UX** y las otras dos se repartan **IA/Backend/Documentos** y **Casos de Uso/Voz/Profesional**, tocando archivos distintos para evitar conflictos de Git:

| Persona | Rol en el equipo | Archivos principales que toca |
|---------|------------------|-------------------------------|
| **Persona 1** | **UI/UX, Diseño Visual y Accesibilidad** | `globals.css`, `tailwind.config.js`, `page.tsx` (Inicio), `components/*`, `sala-previa/*`, `pasaporte/*` (diseño visual e impresión) |
| **Persona 2** | **IA, Backend, Procesador de Documentos y Mediador** | `backend/app/*`, `citacion/page.tsx`, `mediador/page.tsx`, `lib/api.ts` |
| **Persona 3** | **Casos de Uso (Juan/Luis), Voz, Panel Profesional y Pitch** | `demo/juan/page.tsx`, `demo/luis/page.tsx`, `ensaya/page.tsx`, `profesional/page.tsx`, `lib/contenido.ts`, Pitch Deck |

---

### Persona 1 — UI/UX, Diseño Visual y Accesibilidad (100 % dedicada a interfaz)

**Objetivo**: Que la aplicación se vea impecable en móvil y escritorio, cumpla WCAG 2.2 AA / COGA y gane el premio por experiencia de usuario.

- [ ] **1. Barra / Selector de Modo Sensorial y Accesibilidad en `Cabecera.tsx`**:
  - Añadir controles rápidos persistentes: tamaño de letra (`A` / `A+`), modo de **baja estimulación** (reduce contrastes bruscos y desactiva animaciones) y tipografía espaciada para dislexia (`.espaciado-lectura`).
- [ ] **2. Pulido visual de Inicio (`page.tsx`) y navegación coherente**:
  - Unificar el estilo visual de todas las tarjetas, botones de retorno (`← Volver al inicio`) y migas de pan (`.pasos-nav`) en todas las pantallas.
  - Añadir en el `footer` los logos/menciones de las 4 entidades colaboradoras del Reto 3 (**ANHIDA Coruña, ASPERGA, Espazo Compartido UDC, Fundación ONCE**).
- [ ] **3. Diseño de Tarjeta Física / Impresión del Pasaporte (`pasaporte/page.tsx` y `pasaporte/ver/page.tsx`)**:
  - Mejorar el diseño visual del Pasaporte generado y de la vista escaneable `/pasaporte/ver` para que parezca un documento oficial acreditativo limpio en móvil.
  - Añadir estilos `@media print` en `globals.css` para que al pulsar **"Imprimir o guardar"** salga solo la tarjeta del Pasaporte con el QR o el Informe CGPJ limpio en 1 página A4.
- [ ] **4. Pulido visual de `Sala Previa` (`components/sala-previa/*`)**:
  - Mejorar la ilustración/escena vectorial de `EscenaSensorial.tsx` para que los cambios de luz, siluetas de gente y ondas de sonido se perciban con claridad y suavidad.
- [ ] **5. Auditoría final de Teclado, Contraste y Móvil**:
  - Probar el recorrido completo en vista móvil (375px) y solo con tecla `Tab` + lector de pantalla, asegurando que ningún foco quede oculto y todos los botones cumplan el área táctil mínima de 44x44px (`56px` en nuestro sistema).

---

### Persona 2 — IA, Backend, Citación/Sentencia y Mediador

**Objetivo**: Cubrir los requisitos técnicos del Reto 3 ("Suma de varias IAs", adaptación de sentencias, discalculia, subida de documentos y mediador inteligente) para ganar el premio a **Mejor Solución Técnica**.

- [ ] **1. Pipeline "Suma de varias IAs" visible en `/citacion` y `backend/app/`**:
  - Mostrar durante y después del procesado qué hace cada módulo de IA (Extractor Procesal → Adaptador UNE Lectura Fácil/Clara → Adaptador Numérico para Discalculia → Selector ARASAAC).
- [ ] **2. Modo Sentencia adaptada en `/citacion` y `mock_data.py` (Diapositiva 35)**:
  - Añadir un tercer botón de ejemplo: **"Ejemplo Sentencia (lectura fácil)"** inspirado en el caso real de la diapositiva 35, explicando qué ha decidido el juez, qué significa cada parte del fallo y qué plazo hay para recurrir.
- [ ] **3. Subida de archivo PDF / Imagen en `/citacion`**:
  - Añadir un input accesible para subir un PDF o archivo de texto de la citación (`POST /api/procesar-archivo` o extracción en cliente/servidor) además de pegar texto.
- [ ] **4. Bloque de adaptación para Discalculia en `/citacion` (Diapositiva 31)**:
  - Añadir en el resultado de `/citacion` un bloque específico para números y plazos: cantidades escritas en letra + equivalencia cotidiana, y cuenta atrás visual de fechas.
- [ ] **5. Reescritura automática en `/mediador` (`POST /api/analizar-pregunta`)**:
  - Crear endpoint en FastAPI que no solo detecte los problemas (doble negación, compuesta, sugestiva, intimidante, jerga), sino que **devuelva la pregunta ya reformulada** lista para que el juez o abogado la lea en sala.

---

### Persona 3 — Casos de Uso (Juan y Luis), Voz, Panel Profesional y Pitch

**Objetivo**: Clavar punto por punto los casos de uso de las diapositivas 31 a 39 y preparar la defensa ante el jurado y las asociaciones colaboradoras.

- [ ] **1. Completar el Caso de Uso de Juan en `/demo/juan` (Diapositiva 37)**:
  - **Constructor interactivo de Línea de Tiempo**: permitir a Juan añadir nuevos hechos (por texto o voz) para no olvidar datos relevantes y botón para descargar/imprimir su **Guion de apoyo para la declaración**.
  - **Descripción por voz de pruebas visuales**: añadir tarjeta con las 3 pruebas del caso de estafa online (anuncio de Wallapop, captura de Bizum de 350 € y resguardo de Correos) con su descripción textual y botón de lectura en voz alta para personas ciegas.
  - Actualizar referencia legal a **arts. 248 y 249 CP** y destacar que **no tiene grado oficial de discapacidad por TDAH, sino informe clínico acreditativo**.
- [ ] **2. Completar el Caso de Uso de Luis y Roles en `/demo/luis` y `lib/contenido.ts` (Diapositivas 32 y 36)**:
  - Añadir los ajustes `lenguaje-literal`, `anticipacion` y `juicio-telematico` en `AJUSTES_DISPONIBLES` (`lib/contenido.ts`).
  - Añadir el rol de **Perito / Médico Forense** en `ROLES` (`lib/contenido.ts`) y mostrar también las tarjetas de roles ("¿Quién estará en la sala?") dentro de `/citacion`.
- [ ] **3. Respuesta por Voz (Micrófono / Disgrafía y Ceguera) en `/ensaya` (Diapositiva 31)**:
  - Añadir un botón **"Responder hablando"** usando `webkitSpeechRecognition` / `SpeechRecognition` del navegador para transcribir la respuesta del usuario sin necesidad de usar el teclado (cubre disgrafía y ceguera).
- [ ] **4. Actualizar Panel Profesional (`/profesional`) con requisitos de las Diapositivas 34, 38 y 39**:
  - Añadir **Espazo Compartido (Universidade da Coruña - UDC)** junto a **ANHIDA Coruña**, **ASPERGA** y **Fundación ONCE**.
  - Añadir perfiles de **Discalculia** y **Disgrafía** en `AJUSTES_POR_PERFIL`.
  - Añadir el selector de **Vía de identificación / Flag procesal** (1. Reconocimiento oficial de discapacidad, 2. Informe clínico o de asociación colaboradora sin grado oficial —caso de Juan—, 3. Detección de oficio según Guía CGPJ 2025) y derivación a colegios profesionales / facilitadores.
- [ ] **5. Preparar el Pitch Deck y Guion de Demo (Jueves 18:00 y Viernes 09:00)**:
  - Estructurar la presentación de 3-5 minutos conectando cada pantalla de PUENTE con las diapositivas del reto y hacer prueba de escaneo del QR en vivo desde el móvil.
