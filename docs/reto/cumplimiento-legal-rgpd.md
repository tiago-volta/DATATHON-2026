# Cumplimiento legal y RGPD — PUENTE vs Reto 3

Evaluación orientativa del prototipo PUENTE respecto a:

1. El marco citado en el PDF del Reto 3.
2. La normativa procesal y de accesibilidad que el propio producto invoca.
3. El Reglamento (UE) 2016/679 (RGPD) y la LOPDGDD (Ley Orgánica 3/2018).

**Fecha:** 21 octubre 2026 · **Alcance:** prototipo DATAthon (no es dictamen jurídico vinculante).

Leyenda:

- **Cumple (en espíritu de producto):** el diseño ayuda a ejercer el derecho o a documentar el ajuste.
- **Parcial:** hay avance, pero faltan piezas para un despliegue real.
- **No aplica / Fuera de alcance:** lo decide el juzgado u otro actor, no la app.
- **Pendiente producción:** obligatorio antes de un uso real con datos de personas.

---

## 1. Normas del PDF del Reto 3

| Norma | ¿Qué exige? | Estado en PUENTE | Comentario |
|-------|-------------|------------------|------------|
| **Art. 24 CE** (tutela judicial efectiva) | Acceso a tribunales sin indefensión | **Cumple (espíritu)** | Facilita comprensión y preparación; no sustituye al órgano judicial |
| **Ley 15/2022** (igualdad de trato) | Prohíbe discriminación; denegar ajustes puede ser discriminación | **Cumple (espíritu)** | Pasaporte y panel profesional ayudan a pedir y documentar ajustes |
| **RDL 1/2013** (derechos personas con discapacidad) | Accesibilidad universal, ajustes razonables, inclusión | **Parcial** | Accesibilidad cognitiva y digital trabajadas; accesibilidad física de sede fuera de alcance |

Conclusión respecto al PDF: **sí se alinea** con el marco legal de referencia del enunciado. PUENTE no “cumple la ley” en el sentido de ser un organismo obligado: **implementa herramientas** que hacen más viable el ejercicio de esos derechos.

---

## 2. Normas que PUENTE usa en producto (más allá del PDF)

El PDF no enumera LEC/LECrim, pero el producto sí se fundamenta en ellas (correcto y recomendable).

| Norma / guía | Estado | Evidencia en producto |
|--------------|--------|------------------------|
| **Art. 7 bis LEC** (ajustes de procedimiento) | **Cumple (espíritu)** | Pasaporte, citación accesible, sala tranquila, pausas, facilitador como ajuste pedible |
| **Art. 109 / 118 LECrim** | **Cumple (espíritu)** | Perfiles Luis (testigo) y Juan (investigado); derechos en lectura clara |
| **Ley 8/2021** (apoyos / facilitador) | **Parcial** | Figura contemplada en roles y ajustes; no hay flujo formal de nombramiento |
| **Ley 6/2022 + RD 707/2026** (accesibilidad cognitiva) | **Parcial** | Lectura fácil / clara / pictogramas; RD entra en vigor 2027 |
| **UNE 153101 / ISO 24495-1** | **Parcial** | Prompts y modos de lectura; validación humana limitada en prototipo |
| **Guía CGPJ 2025** (perfil de ajustes) | **Parcial** | Panel `/profesional` con pasos CGPJ; exportación formal incompleta |
| **Ley 27/2007 (LSE)** | **No aplica / fuera** | No hay intérprete LSE en producto (sí mencionable como ajuste) |
| **Art. 13 CDPD** (acceso a la justicia) | **Cumple (espíritu)** | Ajustes de procedimiento en clave de necesidades, no de diagnóstico |

### Casos Luis y Juan

| Caso | Cobertura |
|------|-----------|
| **Luis (TEA)** | Bien cubierto: lenguaje literal, anticipación, sala previa sensorial, pasaporte |
| **Juan (TDAH + ceguera)** | Bien cubierto en voz, pausas, descripción de pruebas, lector; matiz del **art. 249 vs 248 CP** respecto al PDF |

---

## 3. RGPD / LOPDGDD — evaluación

### 3.1 Lo que ya va en la dirección correcta

| Principio (art. 5 RGPD) | Cómo lo aborda PUENTE |
|------------------------|------------------------|
| **Minimización** | El Pasaporte muestra **necesidades**, no diagnóstico clínico |
| **Limitación de la finalidad** | Datos locales para preparar el juicio / compartir ajustes |
| **Almacenamiento local** | Pasaporte, insignias, confianza, sala previa y modo voz en `localStorage` del navegador |
| **Transparencia parcial** | Mensajes del tipo «el documento se procesa sin guardar tus datos personales» en citación |
| **Datos sensibles (art. 9)** | Se evita persistir diagnóstico en el QR / Pasaporte (buena práctica frente a categoría especial de salud) |

### 3.2 Riesgos y huecos (honestos)

| Tema | Estado | Detalle |
|------|--------|---------|
| **Base jurídica documentada** | **Pendiente producción** | No hay texto de política de privacidad ni registro de actividades de tratamiento |
| **Información al interesado (arts. 13–14)** | **Pendiente** | Falta aviso claro de qué se envía al backend / LLM |
| **Consentimiento / interés legítimo** | **Parcial** | Prototipo sin flujo de consentimiento estructurado |
| **Encargados del tratamiento** | **Pendiente** | Si `LLM_PROVIDER` ≠ `mock`, el texto de la citación puede ir a Gemini / OpenAI / Anthropic (encargados externos; hace falta DPA y transparencia) |
| **Conservación** | **Parcial** | Backend en modo mock no guarda; con LLM externo la retención depende del proveedor |
| **Derechos ARCO+ (acceso, borrado, etc.)** | **Parcial** | El usuario puede borrar `localStorage`; no hay UI de “mis datos” ni procedimiento formal |
| **Transferencias internacionales** | **Pendiente** | APIs de IA pueden implicar EE. UU. / cláusulas contractuales |
| **Seguridad (art. 32)** | **Parcial** | Prototipo local; sin cifrado de backups, auth ni auditoría |
| **DPIA / evaluación de impacto** | **Pendiente** | Recomendable si se tratan datos de salud o vulnerables a escala |
| **Cookies / tracking** | **Cumple (por ausencia)** | No hay analytics de terceros detectados en el alcance actual |
| **Menores** | **Fuera / pendiente** | El PDF cita sentencia a niño; PUENTE está orientado a adultos de referencia (Luis/Juan) |

### 3.3 Veredicto RGPD

Para un **prototipo de hackathon** con datos de prueba y `LLM_PROVIDER=mock`: **orientación razonable y alineada** (minimización, sin diagnóstico, local-first).

Para un **despliegue real** con citaciones reales e IA externa: **aún no cumple de forma completa** el RGPD. Haría falta, como mínimo:

1. Política de privacidad y aviso en el procesamiento de citaciones.
2. Contratos / DPA con proveedores de LLM (o procesamiento 100 % on-premise).
3. Base jurídica explícita y, si procede, consentimiento.
4. Mecanismos claros de borrado y acceso.
5. Evaluación de datos de categoría especial si se llega a tratar salud.
6. Registro de tratamientos y medidas de seguridad proporcionales.

---

## 4. Resumen ejecutivo

| Pregunta | Respuesta corta |
|----------|-----------------|
| ¿Cumple lo que pide el PDF del Reto 3 en marco legal (24 CE, 15/2022, RDL 1/2013)? | **Sí, en alineación de producto**: ayuda a hacer efectivos esos derechos; no es el obligado principal |
| ¿Cubre los casos Luis y Juan? | **Sí**, con matices (p. ej. artículo penal del PDF) |
| ¿Cumple LEC / LECrim / CGPJ que el producto cita? | **En espíritu y prototipo, sí**; formalización judicial y exportación oficial, parcial |
| ¿Cumple RGPD al 100 % hoy? | **No para producción**. **Sí como prototipo consciente** (minimización + local + sin diagnóstico), con huecos claros si se activa LLM externo |

---

## 5. Referencias en el repo

- PDF del reto: [`20261018_DATATHON-Reto3-Brecha-Judicial.pdf`](./20261018_DATATHON-Reto3-Brecha-Judicial.pdf)
- Contexto estructurado: [`reto3-contexto.md`](./reto3-contexto.md)
- Marco legal ampliado: [`../investigacion/marco-legal.md`](../investigacion/marco-legal.md)
- Fuentes: [`../investigacion/fuentes.md`](../investigacion/fuentes.md)
