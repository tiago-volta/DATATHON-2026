---
name: puente-mapa
description: >-
  Mapa de skills de PUENTE. Úsalo al empezar una tarea para elegir qué skill
  abrir y cuál manda si dos se contradicen. Cubre accesibilidad, lectura fácil,
  UI, FastAPI, Next.js y seguridad.
---

# Mapa de skills

## Quién manda

1. Reglas de `.cursor/rules/` y esta skill.
2. `puente-accesibilidad` y `puente-lectura-facil` (en `.claude/skills/`).
3. Skills de diseño, solo dentro de su límite PUENTE.
4. Skills de ingeniería (ECC) para código, tests y API.

Si hay choque, gana el número más bajo. No propongas demos ni presentaciones. El frontend es Next.js 14, no 16. Los textos de usuario van en español y de tú. El Pasaporte no muestra diagnóstico.

## Qué abrir

| Tarea | Skill |
| --- | --- |
| UI, teclado, lector de pantalla, COGA | `puente-accesibilidad` |
| Texto para la persona usuaria o una citación | `puente-lectura-facil` |
| Pauta concreta de UX, tipo, color o stack | `ui-ux-pro-max` |
| Una pantalla se ve genérica | `design-taste-frontend` |
| Criterio de jerarquía, tipo o color más allá del checklist | `apple-design` |
| Patrones React de ARIA, foco y formularios | `frontend-a11y` |
| Animar un cambio de estado | `motion-foundations` |
| Endpoint FastAPI | `fastapi-patterns` |
| Python o tests del backend | `python-patterns`, `python-testing` |
| Componentes React o rendimiento | `react-patterns`, `react-performance` |
| Docs actuales de una librería | `documentation-lookup` (Context7 ya está en `.cursor/mcp.json`) |
| Revisar seguridad antes de un cambio sensible | `security-review` |
| Plan de pruebas de un flujo | `verification-loop`, `browser-qa` |
| Commit | `CONTRIBUTING.md` y `conventional-commit-review` |

Los agentes del stack están en `.cursor/agents/ecc-*.md` (revisión, FastAPI, React, accesibilidad, planificación). Los comandos están en `.cursor/commands/` (`plan`, `code-review`, `fastapi-review`, `security-scan`).

El resto de skills en `.cursor/skills/` son de apoyo. Ábrelas cuando el nombre encaje. No las cargues todas a la vez. Las de diseño que ya estaban (`ui-ux-pro-max`, `design-taste-frontend`, `apple-design`) siguen.
