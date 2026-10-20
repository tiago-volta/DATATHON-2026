---
name: impeccable-check
description: "Impeccable — rever qualidade: audit (técnico a11y/perf/responsive) ou critique (UX/hierarquia). Use /impeccable-check antes de ship."
argument-hint: "[audit | critique] [área opcional]"
user-invocable: true
---

<!-- impeccable-pinned-skill -->

Atalho condensado Impeccable para **diagnóstico** (não corrige sozinho — gera relatório).

## Quando usar

| Subcomando | Pergunta que responde |
|------------|----------------------|
| **audit** (default) | Está acessível, rápido, responsive, consistente com DESIGN.md? |
| **critique** | A hierarquia, copy e fluxo fazem sentido para o utilizador? |

## Como invocar

- `/impeccable-check` → audit de todo o site/feature
- `/impeccable-check audit homepage`
- `/impeccable-check critique modal reserva`

## Execução

1. `node ~/.cursor/skills/impeccable/scripts/context.mjs` (com `--target` se aplicável).
2. Se o pedido menciona **critique** ou UX/review → `reference/critique.md`.
3. Caso contrário → `reference/audit.md`.
4. No fim, sugere `/impeccable-ship` para corrigir findings.
