---
trigger: always_on
description: Reglas generales, stack técnico y convenciones del proyecto PUENTE
---

# Reglas del proyecto PUENTE

## Contexto

PUENTE es una aplicación de accesibilidad cognitiva para la justicia, desarrollada en el
DATAthon Justicia 2026 (A Coruña). Ayuda a personas neurodivergentes a entender y prepararse
para procesos judiciales.

## Regla estricta sobre Demos y Presentaciones

- **Prohibido sugerir ideas de demo, guiones de presentación o pitch decks** por iniciativa propia.
- Céntrate exclusivamente en el producto y en el código. Solo genera o modifica material de demo cuando el usuario lo pida de forma explícita.

## Stack técnico

- Frontend: Next.js 14 + TypeScript + Tailwind CSS
- Backend: FastAPI (Python)
- Sin base de datos (estado en cliente)

## Perfiles de usuario de referencia

- **Luis**: 28 años, TEA nivel 1, testigo en proceso penal
- **Juan**: 32 años, TDAH + ceguera, investigado por delito leve

## Convenciones de código

### Frontend

- Componentes en español: `BotonLeerEnVoz`, `TarjetaRol`, `LineaTiempo`
- CSS con Tailwind, usando las clases del design system (`btn-primary`, `card`, `lectura-facil`)
- Siempre incluir atributos de accesibilidad: `aria-label`, `role`, `aria-live`
- Todo el texto visible en español

### Backend

- Endpoints en español: `/api/procesar-citacion`, `/api/generar-ics`
- Modelos Pydantic para request/response
- Mock por defecto, LLM opcional con variable de entorno

## Accesibilidad (obligatorio)

- Navegación completa por teclado
- Compatible con lectores de pantalla (VoiceOver, NVDA)
- Contraste mínimo WCAG AA
- Sin animaciones que no se puedan pausar
- Leer skill `puente-accesibilidad` antes de hacer cambios en UI

## Lectura fácil (obligatorio)

- Al escribir texto para usuarios, seguir las pautas UNE 153101
- Frases cortas, una idea por línea
- Sin jerga jurídica sin explicar
- Leer skill `puente-lectura-facil` antes de escribir contenido

## División del equipo

- **Persona A (IA/backend)**: endpoints de procesamiento, integración LLM, mediador
- **Persona B (frontend persona)**: flujo de citación, Pasaporte, Ensaya, calendario
- **Persona C (profesional + contenido)**: panel profesional, Sala Previa, contenido legal
