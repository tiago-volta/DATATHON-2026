# Reto 3 — Justicia inteligente para la neurodiversidad

Fuente oficial: [`20261018_DATATHON-Reto3-Brecha-Judicial.pdf`](./20261018_DATATHON-Reto3-Brecha-Judicial.pdf)  
Evento: DATAthon Justicia 2026 (Brecha Judicial) · Presenta: Ana Tudela (INECO)  
Extraído y estructurado para el equipo de InclusiveCourt (octubre 2026).

> Este documento resume el PDF del reto. No sustituye el marco legal ampliado en [`../investigacion/marco-legal.md`](../investigacion/marco-legal.md).

---

## 1. Contexto: brecha judicial

La desigualdad de oportunidades en el ámbito judicial implica que personas mayores, jóvenes y neurodivergentes no pueden ejercer sus derechos en igualdad real, por barreras de comprensión, acceso y adaptación del sistema.

Reducir esta brecha requiere:

- Simplificar el lenguaje.
- Mejorar la accesibilidad (física, digital y cognitiva).
- Ofrecer apoyos específicos (formación, facilitadores, etc.).

### Objetivo perseguido

Garantizar que todas las personas puedan acceder a la justicia, comprender los procedimientos y participar en ellos en igualdad de condiciones, independientemente de su edad, capacidades o circunstancias personales.

No se trata de otorgar privilegios, sino de eliminar barreras para una justicia más inclusiva, accesible y comprensible.

---

## 2. Objetivo del Reto 3

Desarrollar una solución que:

1. **Prepare** a personas neurodivergentes (TEA, TDAH, dislexia y otras formas) para afrontar y completar procesos judiciales.
2. **Capacite** a profesionales de la justicia para comprender necesidades específicas y adaptar su actuación.
3. Facilite la participación como víctimas, testigos, personas acusadas o ciudadanas implicadas, en procesos **presenciales o telemáticos**.
4. Ofrezca un enfoque **integral y personalizado**: anticipación del acto judicial, información clara de fases y trámites, y papel de intervinientes (abogados, peritos, etc.).

**Solución esperada:** adaptar procesos y la relación con profesionales a la diversidad dentro de la neurodivergencia, con soportes distintos según el procesamiento cognitivo de cada persona.

---

## 3. Definición de neurodiversidad (según el reto)

Persona cuyo funcionamiento del cerebro difiere de lo neurotípico. No es mejor ni peor: es distinto. Describe variaciones naturales en pensar, aprender, procesar información o percibir el mundo.

### Condiciones de neurodesarrollo citadas

| Condición | Barreras destacadas en el PDF |
|-----------|-------------------------------|
| **TEA** | Comunicación y socialización distintas; intereses intensos; procesamiento sensorial diferente |
| **TDAH** | Concentración; instrucciones complejas; organización y finalizar tareas |
| **Dislexia** | Comprensión de textos; lectura lenta; terminología |
| **Discalculia** | Números, porcentajes, tablas, balances, errores en cifras |
| **Disgrafía** | Escritura, trazo, organización del texto, presentación |

---

## 4. Valor social

- Aumento de casos detectados al año → apoyo específico con enfoque **no capacitista**.
- Parte relevante de la población en España presenta funcionamiento cognitivo distinto de la media → barreras comunicativas, ambientales y de adaptación.

---

## 5. Competencias digitales sugeridas (ideas del enunciado)

- UX/UI, gamificación / simuladores, RV, IA, prototipado.
- Integración con organismos para reconocimientos de discapacidad o *flag* de identificación (con cuidado de privacidad). **Estado en InclusiveCourt:** [PENDIENTE / stub] — sin APIs de IMSERSO; flag local opcional `necesitoApoyos` («Necesito más apoyos de voz y lectura») en preferencias/Pasaporte, sin etiqueta estigmatizante.
- Adaptación de notificaciones, horarios y plazos.
- Colegios profesionales específicos (p. ej. intérpretes).
- IA como mediadores; **suma de varias IAs** (lectura fácil, lectura clara…).

---

## 6. Marco legal citado en el PDF del reto

El propio enunciado aclara: **no existen leyes exclusivas para «personas neurodivergentes»**, pero sí marcos que las incluyen vía inclusión, accesibilidad universal y ajustes razonables (también cognitivos).

| Norma | Qué dice el PDF |
|-------|-----------------|
| **Art. 24 Constitución** | Tutela judicial efectiva: acceder a tribunales y obtener resolución fundada, sin indefensión |
| **Ley 15/2022** | Igualdad de trato y no discriminación; prohíbe prácticas que generan desventajas a colectivos vulnerables |
| **RDL 1/2013** (Ley General de derechos de las personas con discapacidad) | Igualdad, no discriminación, accesibilidad universal, inclusión |

Caso real citado: sentencia adaptada a un niño autista de 10 años  
[Vídeo de referencia](https://www.youtube.com/watch?v=ID6C7z63d1U)

---

## 7. Casos de uso oficiales

### Luis, 28 años — TEA nivel 1 (testigo / parte)

Debe comparecer, declarar, entender notificaciones y responder a jueces y abogados.

Presenta: literalidad e interpretación; dificultad con lenguaje ambiguo; ansiedad ante entornos desconocidos; hipersensibilidad (ruido, luces, personas).

### Juan, 32 años — TDAH (combinado) + ceguera (investigado)

Acusado de **delito leve de estafa (art. 249 CP)** en el PDF por malentendido en una transacción online.

Necesidades: declaraciones cortas; riesgo de impulsividad; organizar el relato; documentos accesibles a lector de pantalla / voz; descripción de pruebas visuales; orientación en sede; más tiempo con productos de apoyo.

Notas del PDF:

- Puede no tener grado de discapacidad reconocido por TDAH, pero aporta informes clínicos.
- Acredita condición de persona invidente y solicita ajustes de accesibilidad.

> **Nota de producto:** en InclusiveCourt el ejemplo de Juan a veces se etiqueta con art. 248 CP (estafa leve ≤400 €). El PDF del reto cita art. 249 CP. Ver precisión en [`../investigacion/marco-legal.md`](../investigacion/marco-legal.md) (LO 14/2022 y LO 1/2026).

---

## 8. Asociaciones colaboradoras (PDF)

- **ANHIDA Coruña** — TDAH (presencial y online).
- **ASPERGA** — Asociación Gallega de Asperger / espectro autista (desde 2006).
- **Fundación ONCE** — cooperación y mejora de condiciones de vida de personas con discapacidad.
- **Espazo Compartido (UDC)** — título propio UDC para jóvenes 18–30 con DI y/o TEA; apoyo Fundación ONCE, FSE y UDC.

---

## 9. Cómo responde InclusiveCourt a este contexto

| Exigencia del reto | Módulo en InclusiveCourt |
|--------------------|------------------|
| Información clara / lectura fácil | `/citacion` |
| Anticipación del acto judicial | `/sala-previa`, línea de tiempo |
| Ensayo de declaración | `/ensaya` |
| Ajustes sin estigma / sin diagnóstico | `/pasaporte` |
| Capacitar a profesionales | `/profesional`, `/mediador` |
| Suma de IAs / lenguaje claro | Backend LLM + pipeline UNE / ISO |
| Gamificación calmada | Insignias útiles, confianza, días de práctica |

Documentación legal ampliada (más allá del PDF): [`../investigacion/`](../investigacion/).  
Evaluación de cumplimiento: [`cumplimiento-legal-rgpd.md`](./cumplimiento-legal-rgpd.md).
