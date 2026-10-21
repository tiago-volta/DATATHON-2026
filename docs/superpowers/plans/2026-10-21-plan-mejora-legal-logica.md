# Plan de Mejora: Rigor Legal, Lógica de Negocio y RGPD (PUENTE)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corregir los riesgos jurídicos graves (G), discordancias normativas (M), tratamiento de datos de salud (RGPD) y lógica de procesamiento de citaciones detectados en la auditoría técnica.

**Architecture:** Motor de resolución determinista de roles y consecuencias judiciales basado en el orden jurisdiccional y tipo procesal (BOE consolidado: LECrim, LEC, CP, Ley 1/1996, LO 5/2024, RD 707/2026 y RGPD). Eliminación de fallbacks inventados en backend y frontend, unificación del catálogo de ajustes con base legal exacta y blindaje de privacidad con consentimiento explícito y borrado efectivo.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, FastAPI, Pydantic, Python regex/date utils, Pytest.

**Spec:** Auditoría de lógica de negocio y cumplimiento legal (21/10/2026), normativa BOE citada.

## Global Constraints

- Cumplimiento estricto de artículos del BOE (LECrim arts. 118, 416, 420, 433, 439, 709, 790, 967, 971; LEC art. 7 bis; Ley 1/1996 arts. 2, 6; RGPD arts. 4.15, 9, 13, 17, 25; RD 707/2026 arts. 3, 4, 11).
- Lenguaje claro y lectura fácil orientada a UNE 153101, indicando siempre «no validada por personas lectoras».
- Ningún commit debe atribuir asesoramiento jurídico ni prometer resultados automáticos que competen al juez o LAJ.
- Conservar los IDs existentes de ajustes para garantizar compatibilidad con enlaces y QR generados.
- Autor de commits obligatorio: `Tiago Volta <tiago-volta@users.noreply.github.com>`.

## Review Focus

1. **Sentencias de condena:** Verificar que no se categoricen como absolución ni se afirme «eres inocente» ante términos condenatorios.
2. **Citaciones no identificables:** Comprobar que una citación civil o desconocida no asigne por defecto el rol de testigo ni las advertencias de Luis.
3. **Delito leve (Juan):** Verificar que no se afirme «abogado gratis garantizado», sino «puedes solicitarlo y el juez decide» (art. 967.1 LECrim y 6.3.b Ley 1/1996), sin derechos de personas detenidas (art. 520).
4. **Deberes del testigo (Luis):** Verificar que se advierta la obligación de decir la verdad (art. 433 LECrim), el delito de falso testimonio y la posible conducción policial (art. 420 LECrim) si no comparece sin causa justificada.
5. **Privacidad y RGPD:** Asegurar consentimiento explícito para guardar ajustes/salud, teléfono opcional y desmarcado por defecto, y endpoint funcional de borrado de cuenta y estado.

---

## Tareas de Implementación

### Tarea 1: Corrección de Fallbacks en Procesamiento y Separación de Sentencias (Backend & Frontend)

**Archivos:**
- Modificar: `backend/app/llm.py:450-496`
- Modificar: `backend/app/mock_data.py:66-80`
- Modificar: `frontend/src/app/citacion/page.tsx`
- Test: `backend/tests/test_procesar_citacion.py`

- [ ] **Paso 1.1:** Escribir tests en backend para: (a) texto con condena que no devuelva absolución, (b) texto con citación de orden civil/desconocida que devuelva rol `"desconocido"` en lugar de Luis o Juan.
- [ ] **Paso 1.2:** En `backend/app/mock_data.py`, crear `MOCK_RESPONSE_CONDENA` con advertencia neutra y clara: «Es una sentencia de condena. Habla con tu abogado hoy: tienes 10 días para recurrir (art. 790.1 LECrim)» y plazo de apelación.
- [ ] **Paso 1.3:** En `backend/app/llm.py` (`adaptar_documento_personalizado`), discriminar `condeno` / `condena` frente a `absuelvo` / `absolución`. Si no se detecta con certeza un rol penal conocido, devolver `rol: "desconocido"` con mensaje de prudencia («No hemos podido identificar con seguridad tu papel en la carta. Revisa el documento original o consulta con un profesional»).
- [ ] **Paso 1.4:** Replicar la misma lógica en el fallback offline de `frontend/src/app/citacion/page.tsx` para evitar que citaciones civiles o no reconocidas suplanten el caso de Luis.
- [ ] **Paso 1.5:** Ejecutar tests y confirmar pase: `pytest backend/tests/test_procesar_citacion.py`.
- [ ] **Paso 1.6:** Commit: `fix(backend): separar sentencia condenatoria y evitar asignacion forzada de rol`.

---

### Tarea 2: Subsanación Jurídica del Caso Juan (Delito Leve e Investigado)

**Archivos:**
- Modificar: `backend/app/mock_data.py` (caso Juan: L32-64, L240-360)
- Modificar: `frontend/src/lib/contenido.ts`
- Modificar: `data/fases-judiciales.json`
- Modificar: `frontend/src/app/citacion/page.tsx` (sección Juan)

- [ ] **Paso 2.1:** Eliminar del caso Juan los derechos de la persona detenida del art. 520 (impugnar privación de libertad, aviso a familiar) y sustituirlos por los del art. 118.1 LECrim (ser informado de los hechos, examinar actuaciones, solicitar justicia gratuita, traducción/interpretación, copia de denuncia según art. 967.1).
- [ ] **Paso 2.2:** Corregir la explicación del abogado: en delito leve no es obligatorio (art. 967.1 LECrim). Explicar: «Puedes ir con abogado si quieres. Si no tienes dinero, puedes pedir justicia gratuita y el juzgado decidirá si te asigna uno (art. 6.3.b Ley 1/1996)».
- [ ] **Paso 2.3:** Corregir consecuencias de incomparecencia: si no comparece ni justifica, el juicio puede celebrarse en su ausencia (art. 971 LECrim) y la multa es de 200 a 2.000 € (art. 967.2 LECrim), no de 200 a 5.000 €.
- [ ] **Paso 2.4:** Ajustar la redacción del tipo penal de estafa leve: «no excediere de 400 euros» (art. 248.3 CP).
- [ ] **Paso 2.5:** Verificar coherencia en todas las copias en `contenido.ts`, `data/fases-judiciales.json` y `frontend/src/app/citacion/page.tsx`.
- [ ] **Paso 2.6:** Commit: `fix(legal): ajustar derechos y consecuencias de investigado en delito leve segun lecrim`.

---

### Tarea 3: Subsanación Jurídica del Caso Luis (Testigo en Penal)

**Archivos:**
- Modificar: `backend/app/mock_data.py` (caso Luis: L6-30, L120-220)
- Modificar: `frontend/src/app/citacion/page.tsx` (sección Luis)

- [ ] **Paso 3.1:** Eliminar afirmaciones engañosas como «sin ponerte ninguna multa» o «el juzgado te dará nueva fecha sin sanción». Explicar: el testigo tiene la obligación de acudir; si no puede, debe avisar y justificar el impedimento y es el juez quien valora la causa.
- [ ] **Paso 3.2:** Añadir advertencia legal sobre incomparecencia injustificada: multa de 200 a 5.000 € (art. 420 LECrim) y posible conducción policial si persiste. Aclarar que la desobediencia grave (art. 420/463 CP) aplica a negarse a declarar.
- [ ] **Paso 3.3:** Incluir de forma explícita el deber de decir la verdad y las consecuencias del falso testimonio (art. 433 LECrim), señalando que «no me acuerdo» o «no lo sé» son respuestas legítimas si reflejan la realidad.
- [ ] **Paso 3.4:** Incorporar la mención a la dispensa de declarar por parentesco (art. 416 LECrim).
- [ ] **Paso 3.5:** Commit: `fix(legal): precisar deberes de veracidad y consecuencias de incomparecencia de testigo`.

---

### Tarea 4: Corrección de Lectura Fácil de Sentencia y Avisos Legales en UI

**Archivos:**
- Modificar: `backend/app/mock_data.py:462-480`
- Modificar: `frontend/src/app/citacion/page.tsx`
- Modificar: `frontend/src/app/ayuda/page.tsx`

- [ ] **Paso 4.1:** En la lectura fácil de la sentencia (`MOCK_SENTENCIA` / `MOCK_RESPONSE_SENTENCIA`), eliminar la justificación no fundamentada («porque no hay pruebas contra ella») y mantener coherencia de persona en el texto adaptado.
- [ ] **Paso 4.2:** En `frontend/src/app/citacion/page.tsx`, añadir un aviso visual destacado: «Esto te ayuda a entender la carta. No sustituye a la citación original ni al asesoramiento de un abogado. Ante cualquier discrepancia, prevalece el documento original».
- [ ] **Paso 4.3:** Incorporar botón «Ver citación original» junto al resultado adaptado para permitir cotejo inmediato.
- [ ] **Paso 4.4:** Sustituir menciones absolutas: cambiar «Tus derechos garantizados» por «Tus derechos» y sustituir «Cumple UNE 153101» por «Sigue pautas de lectura fácil (adaptación no validada por personas lectoras)».
- [ ] **Paso 4.5:** En `frontend/src/app/ayuda/page.tsx`, matizar «El tribunal detendrá la sesión» por «Puedes solicitar pausas; el tribunal decidirá sobre su concesión».
- [ ] **Paso 4.6:** Commit: `fix(ui): incorporar descargos legales y rigor en lectura facil y avisos`.

---

### Tarea 5: Protección de Datos (RGPD) en Pasaporte, Registro y Estado

**Archivos:**
- Modificar: `frontend/src/lib/pasaporte.ts`
- Modificar: `frontend/src/app/pasaporte/page.tsx`
- Modificar: `frontend/src/app/registro/page.tsx`
- Modificar: `frontend/src/lib/sync/estadoUsuario.ts`
- Modificar: `backend/app/routers/estado.py`
- Modificar: `backend/app/routers/auth.py`
- Modificar: `backend/app/main.py`
- Modificar: `docs/reto/cumplimiento-legal-rgpd.md`

- [ ] **Paso 5.1:** En `frontend/src/app/pasaporte/page.tsx`, desmarcar por defecto el teléfono de contacto y permitir el uso de iniciales en lugar de nombre completo para el QR.
- [ ] **Paso 5.2:** Añadir casilla de consentimiento explícito (art. 9.2.a RGPD): «Acepto que la aplicación guarde mis ajustes seleccionados, entendiendo que pueden reflejar necesidades de apoyo personal. Puedo eliminarlos en cualquier momento».
- [ ] **Paso 5.3:** En `backend/app/routers/auth.py` y `estado.py`, implementar endpoint `DELETE /api/me` para borrado completo y en cascada de cuenta y estados asociados (`user_state`), cumpliendo el art. 17 RGPD (derecho al olvido).
- [ ] **Paso 5.4:** Añadir botón «Borrar mis datos del servidor» en la interfaz de configuración/pasaporte.
- [ ] **Paso 5.5:** Sincronizar la documentación en `docs/reto/cumplimiento-legal-rgpd.md` para reflejar con precisión el flujo de almacenamiento y consentimiento implementado.
- [ ] **Paso 5.6:** Commit: `feat(rgpd): anadir consentimiento explicito y endpoint de borrado de cuenta y estado`.

---

### Tarea 6: Corrección de Citas Normativas y Fundamentación Legal

**Archivos:**
- Modificar: `data/ajustes-disponibles.json`
- Modificar: `frontend/src/lib/contenido.ts`
- Modificar: `docs/investigacion/fundamentacion-legal.md`
- Modificar: `docs/investigacion/marco-legal.md`

- [ ] **Paso 6.1:** En `data/ajustes-disponibles.json` y `contenido.ts`, corregir la base legal de los ajustes de entorno y tiempo: asignar al **art. 7 bis.1 LEC** (comunicación, comprensión e interacción con el entorno) y art. 109 párr. 3 LECrim, reservando el 7 bis.2.c para la figura del facilitador.
- [ ] **Paso 6.2:** Corregir la cita de la Ley 15/2022 (art. 2.1, no art. 6).
- [ ] **Paso 6.3:** En `fundamentacion-legal.md`, corregir la referencia al RD 707/2026: indicar aprobación el 2/9/2026, entrada en vigor el 2 de enero de 2027, y citar los artículos reales (art. 11 Justicia, art. 4.2.a.7º estímulos sensoriales, art. 5.1 pictogramas y voz, art. 3.e dificultades cognitivas, art. 3.i lectura fácil).
- [ ] **Paso 6.4:** Citar el art. 9 de la LO 5/2024 del Derecho de Defensa como base directa de lenguaje claro y adaptación de oficio.
- [ ] **Paso 6.5:** Clarificar que el Convenio MJ-ONCE 2025 es un acuerdo marco y sustituir falsas citas literales por resúmenes fieles.
- [ ] **Paso 6.6:** Commit: `docs(legal): corregir bases legales articulado rd 707-2026 y 7 bis lec`.

---

### Tarea 7: Robustez de Calendario y Dinamismo de Plazos

**Archivos:**
- Modificar: `backend/app/calendario.py`
- Modificar: `frontend/src/app/citacion/page.tsx`
- Test: `backend/tests/test_calendario.py`

- [ ] **Paso 7.1:** En `backend/app/calendario.py`, parsear la hora real de la citación en lugar del rango fijo 08:00-09:00, e incorporar cabecera de zona horaria `TZID=Europe/Madrid`.
- [ ] **Paso 7.2:** Calcular dinámicamente `dias_restantes` calculando la diferencia entre la fecha de la comparecencia y la fecha actual en tiempo de ejecución.
- [ ] **Paso 7.3:** En `frontend/src/app/citacion/page.tsx`, generar el evento .ics con la hora específica de la cita cuando esté disponible.
- [ ] **Paso 7.4:** Commit: `fix(calendario): calcular dias restantes dinamicamente y fijar hora exacta en ics`.

---

### Tarea 8: Limpieza de Reglas en Pregunta Clara (Mediador)

**Archivos:**
- Modificar: `backend/app/llm.py:310-335`
- Modificar: `frontend/src/app/mediador/page.tsx`

- [ ] **Paso 8.1:** Eliminar la regla de sustitución regex `usted no vio -> viste` que destruye la negación y altera el significado de las preguntas.
- [ ] **Paso 8.2:** Mantener el tratamiento formal («usted») si viene en la formulación de sala.
- [ ] **Paso 8.3:** Añadir al pie de `frontend/src/app/mediador/page.tsx` la referencia a los arts. 439 y 709 LECrim (prohibición de preguntas capciosas o sugestivas) y aclarar que la admisión corresponde al Presidente del Tribunal.
- [ ] **Paso 8.4:** Commit: `fix(mediador): corregir transformaciones de negacion y citar arts 439 y 709 lecrim`.

---

### Tarea 9: Modelo de Roles Procesales y Unificación de Ajustes

**Archivos:**
- Crear: `data/roles-procesales.json`
- Modificar: `data/ajustes-disponibles.json`
- Modificar: `frontend/src/lib/contenido.ts`
- Modificar: `frontend/src/lib/perfil/perfil.ts`
- Modificar: `frontend/src/app/profesional/page.tsx`

- [ ] **Paso 9.1:** Crear `data/roles-procesales.json` estructurando `rol`, `orden` (penal, civil, etc.), `obligado_a_ir`, `consecuencia_no_ir`, `derechos` y `ajustes_recomendados`, incorporando el perfil de víctima (Estatuto de la Víctima, Ley 4/2015).
- [ ] **Paso 9.2:** Unificar los catálogos de `contenido.ts` y `data/ajustes-disponibles.json` garantizando que compartan identificadores, base legal y autoridad competente (juez o LAJ).
- [ ] **Paso 9.3:** En `frontend/src/app/profesional/page.tsx`, indicar expresamente que el informe es una propuesta técnica elaborada conforme a las recomendaciones de la Guía CGPJ y que su aprobación compete a la autoridad judicial.
- [ ] **Paso 9.4:** Commit: `feat(datos): estructurar roles procesales y unificar catalogo de ajustes`.

---

## Verificación Global

1. Ejecutar tests de backend: `pytest backend/tests/` (verificando que todos pasen).
2. Ejecutar compilación frontend: `npm --prefix frontend run build` (cero errores TypeScript).
3. Prueba manual de flujos:
   - Carga de citación de sentencia condenatoria: comprueba que no muestra absolución.
   - Carga de citación civil: comprueba que no se transforma en testigo penal.
   - Carga de citación de Juan: comprueba que el abogado figura como optativo y con art. 6.3.b de Ley 1/1996.
   - Carga de citación de Luis: comprueba advertencia de decir la verdad y consecuencias de no ir.
   - Pasaporte: comprueba consentimiento explícito y teléfono desmarcado.
   - Calendario: comprueba hora y cálculo de días restantes.

