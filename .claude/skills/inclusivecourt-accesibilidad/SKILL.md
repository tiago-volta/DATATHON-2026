---
name: inclusivecourt-accesibilidad
description: >-
  Checklist y pautas para garantizar que la interfaz de InclusiveCourt sea accesible
  según WCAG 2.2 y COGA (screen-reader first, teclado, contraste, baja estimulación).
  Usar siempre antes de hacer cambios en UI o componentes frontend.
---

# Skill: Accesibilidad web para InclusiveCourt

Checklist y pautas para garantizar que la interfaz sea accesible según WCAG 2.2 y COGA.

## Principio rector: screen-reader first

Juan, uno de los usuarios de demo, es ciego. La aplicación debe funcionar completamente con lector de pantalla (VoiceOver, NVDA).

## Checklist antes de cada commit

### Estructura HTML
- [ ] Encabezados jerárquicos (h1 > h2 > h3, sin saltos)
- [ ] Landmarks semánticos: `<main>`, `<nav>`, `<header>`, `<footer>`
- [ ] Enlaces de salto al contenido principal
- [ ] Listas para contenido secuencial

### Formularios
- [ ] Cada input tiene `<label>` asociado
- [ ] Mensajes de error vinculados con `aria-describedby`
- [ ] Botones con texto descriptivo (no solo iconos)
- [ ] Áreas táctiles mínimo 44x44px

### Interacción
- [ ] Todo accesible por teclado (Tab, Enter, Escape)
- [ ] Focus visible (`:focus-visible` con anillo)
- [ ] Sin trampas de teclado
- [ ] Estados `aria-pressed`, `aria-expanded` cuando aplique

### Contenido dinámico
- [ ] Regiones live (`aria-live="polite"`) para actualizaciones
- [ ] Carga asíncrona anunciada al lector de pantalla
- [ ] No depender solo de color para transmitir información

### Imágenes y media
- [ ] Alt text descriptivo para imágenes informativas
- [ ] `aria-hidden="true"` para iconos decorativos
- [ ] Controles nativos para audio/vídeo

## COGA (Cognitive Accessibility)

Pautas adicionales para usuarios con dificultades cognitivas:

### Diseño predecible
- Navegación consistente en todas las páginas
- Un paso por pantalla en flujos complejos
- Posibilidad de volver atrás siempre

### Sin presión temporal
- No usar timeouts que fuercen decisiones
- Permitir pausar/detener animaciones
- Respetar `prefers-reduced-motion`

### Ayuda contextual
- Instrucciones visibles, no solo en tooltips
- Ejemplos de entrada en placeholders
- Confirmación antes de acciones destructivas

### Reducción de estímulos
- Modo de baja estimulación disponible
- Paleta de colores suave (ver design system)
- Sin animaciones innecesarias

## Colores (contraste WCAG AA)

El design system de InclusiveCourt usa:
- Texto principal: `court-900` sobre `calma-cream` (ratio > 7:1)
- Texto secundario: `court-600` sobre blanco (ratio > 4.5:1)
- Botones: texto blanco sobre `court-600` (ratio > 4.5:1)

## Testing

### Herramientas automáticas
- axe DevTools (extensión de navegador)
- Lighthouse en Chrome

### Testing manual imprescindible
- Navegar solo con teclado
- Probar con lector de pantalla (VoiceOver en Mac, NVDA en Windows)
- Aumentar zoom al 200%
- Activar modo de alto contraste del sistema

## Errores comunes a evitar

1. **Botón sin texto accesible**: si solo tiene icono, añadir `aria-label`
2. **Imagen con alt vacío que es informativa**: solo vacío si es decorativa
3. **Color como único indicador**: añadir texto o icono
4. **Focus invisible**: asegurar `:focus-visible` con outline o ring
5. **Contenido que aparece sin anunciar**: usar `aria-live`

## Referencias

- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- COGA: https://www.w3.org/TR/coga-usable/
- RD 1112/2018 (accesibilidad web sector público)
