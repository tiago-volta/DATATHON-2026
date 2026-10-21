# InclusiveCourt — Resumen Ejecutivo de Investigación

> DATAthon Justicia 2026, A Coruña | Reto 3: Neurodiversidad | Octubre 2026
>
> **Nota para agentes de código**: No proponer ni generar guiones de demo, ideas para presentaciones ni flujos de demostración salvo petición expresa del usuario.

---

## El problema

**1 de cada 7 personas** tiene alguna forma de neurodivergencia (TEA, TDAH, dislexia, discapacidad intelectual). En la justicia encuentran incomprensión, ansiedad, indefensión y estigma.

**Datos clave:** sin apoyos, el **67% de casos con DI son sobreseídos** (UAVDI); solo el **31%** de procedimientos considera la DI (Plena inclusión, 2019).

---

## El marco legal ya existe

| Norma | Garantía |
|-------|----------|
| **Art. 7 bis LEC** | Adaptaciones de comunicación, comprensión y entorno |
| **Art. 109 / 118 LECrim** | Ajustes para víctimas, testigos e investigados |
| **Ley 8/2021** | Facilitador procesal como derecho |
| **RD 707/2026** | Accesibilidad cognitiva obligatoria (enero 2027) |

---

## La solución: InclusiveCourt

1. **Traduce la citación** a lenguaje accesible con pictogramas y audio  
2. **Genera el Pasaporte de Ajustes** sin revelar diagnóstico  
3. **Permite ensayar** la declaración y **anticipar** la sala (Sala Previa)

---

## Producto implementado esta noche

**Sala Previa (2.1–2.6):** intro con aviso de audio · controles con pictogramas · feedback visual suave (EscenaSensorial) · check-in de confort + deep-link `?ajustes=` · 4 escenas del juzgado · repaso a11y y botón de calma fijo.

**Gamificación calmada (3.1–3.6):** mapa de niveles con estados claros · insignias útiles · medidor de confianza · racha de práctica sin castigo · cruce Ensaya ↔ Sala Previa · panel «Lo que te ayuda» → Pasaporte.

---

## Diferenciador

**El Pasaporte NO revela diagnóstico.** Describe necesidades funcionales. Evita prejuicios, protege RGPD y centra la solución.

---

## Siguientes prioridades de producto

| Prioridad | Acción |
|-----------|--------|
| P0 | Exportar Pasaporte en PDF con base legal visible |
| P1 | Audio/voz completo; comprobar ARASAAC con fallback local |
