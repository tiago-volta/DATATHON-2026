# Instrucciones para agentes de código

Este archivo contiene directrices para Claude Code, Cursor y otros agentes.

## Contexto del proyecto

PUENTE es una aplicación de accesibilidad cognitiva para la justicia española.
Se desarrolla en el DATAthon Justicia 2026 con un equipo de 3 personas y ~1.5 días
de desarrollo.

**Prioridad**: UI/UX > funcionalidad > código perfecto.

## Regla estricta sobre Demos y Presentaciones

- **NO propongas ideas de demo, guiones de presentación, pitch decks ni flujos de demostración** por iniciativa propia.
- Céntrate exclusivamente en desarrollar y mejorar el producto (UI/UX, accesibilidad, frontend y backend).
- Solo trabaja en material de demo o presentación cuando el usuario lo pida de forma explícita.

## Antes de escribir código

1. Leer CLAUDE.md para entender la estructura
2. Abrir `.cursor/skills/puente-mapa/SKILL.md` si no está claro qué skill toca
3. Consultar la skill relevante:
   - Cambios en UI → `.claude/skills/puente-accesibilidad/SKILL.md`
   - Textos de usuario → `.claude/skills/puente-lectura-facil/SKILL.md`
   - Pautas de interfaz → `.cursor/skills/ui-ux-pro-max/SKILL.md`
   - Backend → `.cursor/skills/fastapi-patterns/SKILL.md`
   - Docs de librerías → `.cursor/skills/documentation-lookup/SKILL.md`

## Reglas de estilo

### Código

- Sin comentarios obvios ("importamos el módulo", "definimos la función")
- Sin código muerto ni abstracciones innecesarias
- Nombres en español para componentes y endpoints públicos
- Nombres en inglés para variables internas si facilita legibilidad

### Commits

- Formato `tipo(módulo): descripción en español`. Tipos: feat, fix, refactor, docs, test, chore, perf, ci
- Sin mencionar herramientas de IA
- Un cambio lógico por commit
- El detalle está en `CONTRIBUTING.md`

### Textos de usuario

- Español natural, no traducción literal del inglés
- Frases cortas, voz activa
- Sin jerga técnica ni jurídica sin explicar
- Tutear al usuario (tú, no usted)

## Accesibilidad (no negociable)

- Todo interactivo accesible por teclado
- Labels en todos los inputs
- Alt text en imágenes informativas
- aria-live para contenido dinámico
- Colores del design system (contraste verificado)

## Testing antes de commit

1. Cargar la página en el navegador
2. Navegar solo con Tab
3. Verificar que no hay errores en consola
4. Si hay flujo nuevo, probarlo completo

## Módulos y responsables

| Ruta | Módulo | Persona |
|------|--------|---------|
| `/citacion` | Procesar citación | B |
| `/pasaporte` | Pasaporte de Ajustes | B |
| `/ensaya` | Simulador de declaración | B |
| `/sala-previa` | Vista previa sensorial | C |
| `/profesional` | Panel profesional | C |
| `/mediador` | Pregunta Clara | A |
| `backend/` | API y LLM | A |

## Recursos externos

- Pictogramas: ARASAAC (https://api.arasaac.org), citar licencia CC BY-NC-SA
- Guías: CGPJ 2025, Autismo España 2025, UNE 153101
