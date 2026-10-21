# Foco TEA + simulador (briefing de equipo)

Feedback del sector + notas del compañero, compactado. El pitch manda: **una sorpresa**, no mil módulos.

---

## Decisión

| Qué | Acuerdo |
|-----|---------|
| Caso | Solo **Luis / TEA** (testigo). Juan fuera del pitch y de la home. |
| Wow | **Simulador de sala** con ensayo **dentro** (estilo videojuego). |
| Problema | Anticipar el juzgado y ensayar la declaración antes del día. |
| Flujo | Citación → simulador → ficha de ajustes, **continuo**, no pantallas sueltas. |
| Perfil | Un perfil por persona: tolerancia, estímulos, progreso. |
| QR | **No.** Se percibe discriminatorio. Sustituir por ficha imprimible + código corto. |
| Modo bot / voz protagonista | **Fuera** del relato (ya no encaja con foco TEA). |
| FAQ | Tarjetas FAQ en las preguntas del ensayo. |
| Roles | Distinguir juez / abogado / testigo (hacen cosas distintas). |

**Frase de pitch:** *Probar el juzgado y ensayar la declaración antes de pisar la sala.*

---

## Visión del simulador

1. Entras con tu **perfil** (rol testigo, nivel de tolerancia).
2. La **citación** se entiende en el mismo recorrido (no es otra app).
3. En la **sala**: gente que entra y se mueve; a veces la atención se desvía a otro sitio; subes estímulos cuando aguantes.
4. El **ensayo** ocurre en la escena: diálogos, preguntas, FAQ en tarjetas.
5. Si te sientes cómodo (ej. ~20 personas) y superas los diálogos → **subes de nivel** y puedes añadir más estímulos.
6. Al salir: se actualiza el perfil y sale la **ficha de ajustes** (sin diagnóstico, sin QR).

```
Perfil → Citación (en flujo) → Sala + Ensayo → Ficha de ajustes → (vuelve al perfil)
```

---

## Persona A — Simulador y ensayo (el wow)

**Objetivo:** que el jurado se quede con la sala unificada.

- [ ] Fusionar `/ensaya` dentro de `/sala-previa`: preguntas y diálogos en la escena.
- [ ] Gente en movimiento; personas que entran; momento de distracción (atención a otro sitio).
- [ ] Progresión de tolerancia: superar diálogos + confort con más gente → subir nivel / más estímulos.
- [ ] Roles claros en juicio (quién habla, qué hace el testigo frente al juez/abogado).
- [ ] Tarjetas FAQ en cada bloque de preguntas difíciles.
- [ ] Criterio visible de “nivel superado”.
- [ ] Home/demo solo Luis; quitar protagonismo a Juan y al modo bot/voz.

**Archivos base:** `frontend/src/app/sala-previa/`, `frontend/src/app/ensaya/`, componentes `sala-previa/*`, `frontend/src/app/page.tsx`.

---

## Persona B — Perfil, flujo continuo y cierre (sin QR)

**Objetivo:** un recorrido continuo y un cierre legal que no señale a la persona.

- [ ] Perfil de usuario (local primero): rol, tolerancia, estímulos, historial de práctica.
- [ ] Flujo continuo citación → entrada al simulador → ficha de ajustes (sin menú de 4 módulos).
- [ ] Sustituir QR por **ficha imprimible + código corto** (el profesional consulta el código, no un QR en la frente).
- [ ] Pasaporte fusionado con la simulación: la ficha sale del perfil / check-in de la sala.
- [ ] Textos de home y pitch alineados al problema único.
- [ ] Recortar narrativa Juan y entradas que dispersen.

**Archivos base:** `frontend/src/app/citacion/`, `frontend/src/app/pasaporte/`, `frontend/src/app/profesional/`, nuevo módulo de perfil (p. ej. `frontend/src/lib/perfil/`), `frontend/src/app/page.tsx` (copy).

---

## Qué no hacer ahora

- No ampliar el pitch a Juan, mediador, panel profesional largo ni “suite de módulos”.
- No vender el QR.
- No implementar este briefing en código hasta repartir tareas del checklist.

---

## Criterio de éxito en el pitch

El jurado puede repetir en una frase: *ensayan la declaración dentro de una sala que se puede graduar*, y ven un perfil que mejora con la práctica, no una lista de pantallas.
