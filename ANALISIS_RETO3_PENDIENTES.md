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
La diapositiva 37 detalla 9 puntos sobre Juan (32 años, TDAH combinado + invidente, acusado de estafa leve del **art. 249 CP** — ojo: en nuestro `mock_data.py` ponía `art. 248 CP`, conviene mencionar `arts. 248 y 249 CP` como en la diapositiva):
- **Qué falta del caso de Juan**:
  1. **Constructor interactivo de Línea de Tiempo ("Organizar mi relato")**: En `/demo/juan` la línea de tiempo es estática. El PDF dice: *"Tiene problemas para organizar el relato de los hechos y olvida datos relevantes"* y *"Responde de forma impulsiva"*. Si permitimos **añadir/ordenar hitos por voz o texto** y descargar una **"Chuleta / Guion de apoyo para llevar a la sala"** (ajustado a su derecho a usar notas de apoyo por TDAH), clavamos el caso de uso.
  2. **Describir pruebas visuales (IA / Accesibilidad para ceguera)**: El PDF dice: *"Tiene dificultades para revisar pruebas documentales o digitales presentadas únicamente en formato visual"*. En `/demo/juan` (o en `/citacion`) podemos incluir una sección **"Pruebas del expediente descritas por voz"** (ej. descripción auditiva detallada del pantallazo de Wallapop, el justificante de Bizum y el resguardo de Correos).
  3. **Acreditación sin grado oficial de discapacidad (Flag / Informes clínicos)**: La diapositiva 34 habla de *"Integración con otros organismos para reconocimientos oficiales de discapacidad o 'de algún modo' flag para identificar a las personas"* y la 37 recalca que Juan *"No tiene reconocido oficialmente un grado de discapacidad por TDAH, pero aporta informes clínicos acreditativos"*. En `/pasaporte` y `/profesional` debemos explicitar las **3 vías de acreditación** (Tarjeta/Grado oficial, Informe clínico/asociativo como ANHIDA/ASPERGA, o Detección de oficio por el juzgado según Guía CGPJ 2025).

### D. Requisitos específicos del Caso de Uso de Luis (Diapositiva 36)
- **Quién es quién en `/citacion`**: En `/demo/luis` sí aparece el componente `TarjetaRol` ("Quién es quién en la sala"), pero cuando un usuario normal procesa su citación en `/citacion`, **no se muestra la sección "¿Quién estará en la sala?"** ni la figura del **Perito / Médico Forense** (mencionado en la diapositiva 32).
- **Glosario interactivo de términos literales**: Resaltar expresiones como *"se le apercibe"*, *"diligencias previas"*, *"a los efectos oportunos"* con su traducción literal inmediata.

### E. Suma de varias IAs y Mediador conectado al Backend (Diapositiva 34)
La diapositiva 34 pide explícitamente:
- **"Aplicación de IA como mediadores"**
- **"Suma de varias IAs: lectura fácil, lectura clara..."**
- **Qué falta**:
  1. `/mediador` actualmente solo ejecuta 5 expresiones regulares en el navegador y siempre devuelve una frase genérica de sugerencia, excepto en los 3 ejemplos fijos.
  2. Crear un endpoint en el backend `POST /api/analizar-pregunta` que combine **reglas deterministas + reescritura automática de la pregunta** (convirtiendo cualquier pregunta con doble negación o compuesta en 2-3 preguntas simples y literales listas para leer en sala) hará que `/mediador` sea realmente inteligente.
  3. Mostrar visiblemente en la UI el **Pipeline Multi-IA** de PUENTE:
     - *Agente 1 (Extractor Procesal)* → extrae plazos, rol, artículos y obligaciones.
     - *Agente 2 (Adaptador UNE)* → genera Lectura Clara (ISO 24495-1) + Lectura Fácil (UNE 153101) + adaptación numérica (Discalculia).
     - *Agente 3 (Traductor Visual/Auditivo)* → selecciona pictogramas ARASAAC y genera guion de voz pausado.
     - *Agente 4 (Mediador de Interrogatorio)* → reformula preguntas capciosas en tiempo real.

### F. Asociaciones Colaboradoras y Colegios Profesionales (Diapositivas 34, 38 y 39)
En la diapositiva 39 aparece una entidad clave del jurado local que **no estaba citada en nuestro Panel Profesional**:
- **Espazo Compartido (Universidade da Coruña - UDC)**: título propio de la UDC para jóvenes con discapacidad intelectual y/o TEA, con apoyo de Fundación ONCE y FSE.
- También menciona la diapositiva 34 la integración con **Colegios profesionales específicos (Abogacía / Turno de oficio especializado, Psicología, Intérpretes y Facilitadores)**.
- **Qué hacer**: Añadir **Espazo Compartido (UDC)** junto a **ANHIDA Coruña**, **ASPERGA** y **Fundación ONCE** en `/profesional` y en el pie/créditos, además de incluir la solicitud de facilitador procesal o turno especializado.

---

## 3. Plan de Acción Priorizado (Para ganar Técnica + Innovación)

### Prioridad 1 — Impacto directo en el Jurado del Reto 3 (Rápido, ~1-2 horas)
1. **Actualizar Asociaciones y Marco del Reto 3 en `/profesional` y demos**:
   - Incluir **Espazo Compartido (UDC)**, **ANHIDA Coruña**, **ASPERGA** y **Fundación ONCE**.
   - Corregir en el caso de Juan la referencia al **art. 249 CP** (junto al 248 CP) y añadir la nota sobre **acreditación mediante informe clínico sin necesidad de grado oficial de discapacidad** (flag CGPJ / sistema de gestión procesal).
2. **Completar `/demo/juan` con los puntos de la Diapositiva 37**:
   - Añadir el bloque **"Pruebas visuales descritas en audio"** (captura de Wallapop, Bizum y envío de Correos descritos para lector de pantalla y con botón de voz).
   - Hacer interactiva su **Línea de tiempo** (poder añadir un recuerdo por texto o voz y botón de imprimir/llevar guion a la sala).
3. **Añadir "¿Quién estará en la sala?" (incluyendo Perito) y modo Discalculia en `/citacion`**:
   - Mostrar las tarjetas de roles (`TarjetaRol`) también dentro del resultado de `/citacion`.
   - Añadir soporte de **Discalculia** (traducir importes y plazos en un bloque visual claro sin cifras confusas).
   - Añadir un tercer botón de ejemplo: **"Ejemplo de Sentencia adaptada"**.

### Prioridad 2 — Diferenciación Técnica ("Suma de varias IAs" y Voz, ~1-2 horas)
4. **Mejorar `/mediador` con reformulación real (`POST /api/analizar-pregunta`)**:
   - Que no solo diga *"Divide esta pregunta"*, sino que **reescriba automáticamente la pregunta** del abogado/juez en frases simples y literales.
5. **Dictado por voz (Web Speech API) en `/ensaya`**:
   - Permitir que el usuario responda a las preguntas del simulador **hablando por el micrófono** (cubre ceguera de Juan + disgrafía de la diapositiva 31).
6. **Subida de documento PDF/TXT en `/citacion`**:
   - Permitir subir un archivo `.pdf` o `.txt` de citación además de pegar el texto.

### Prioridad 3 — Presentación y Pitch (Jueves 18:00 y Viernes 09:00)
7. **Guion de Demo en vivo (3 minutos)**:
   - Minuto 1: El problema real (Luis con TEA ante una cédula incomprensible y una sala ruidosa; Juan ciego y con TDAH ante una acusación de estafa online sin grado oficial reconocido).
   - Minuto 2: Demo en directo (Procesar citación + Sala Previa + escanear el QR del Pasaporte con un móvil real en el escenario).
   - Minuto 3: Vista del Juez/LAJ (`/profesional` + `/mediador` reformulando una pregunta capciosa en vivo + integración con LexNET/Minerva mediante *flag* de ajustes sin diagnóstico).
8. **Deck de Pitch (PPTX)**:
   - Alinear las diapositivas con los dos premios del DATAthon (**Mejor Solución Técnica** por el pipeline multi-IA + Web Audio API + accesibilidad WCAG 2.2/COGA, y **Mejor Solución Innovadora** por la Sala Previa sensorial y el Pasaporte QR sin diagnóstico).

