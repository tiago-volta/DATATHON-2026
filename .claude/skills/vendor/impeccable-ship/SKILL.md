---
name: impeccable-ship
description: "Impeccable — acabar e shippar: polish, animate, adapt, optimize, harden, clarify. Use /impeccable-ship depois do check ou quando queres melhorar UI/motion."
argument-hint: "[polish | animate | adapt | optimize | harden | clarify] [área opcional]"
user-invocable: true
---

<!-- impeccable-pinned-skill -->

Atalho condensado Impeccable para **refinar e entregar** (altera código).

## Mapa rápido

| Subcomando | Usa quando… |
|------------|-------------|
| **polish** (default) | Pass final: spacing, alinhamento, consistência |
| **animate** | Motion com propósito: modais, entradas, feedback |
| **adapt** | Mobile/touch targets/viewports |
| **optimize** | Lento, janky, imagens pesadas |
| **harden** | Edge cases, i18n, estados de erro |
| **clarify** | Copy confusa, labels, mensagens |

Outros (pede explicitamente se precisares): `bolder`, `quieter`, `colorize`, `typeset`, `layout`, `delight`, `distill`, `onboard` — lê o reference homónimo em `~/.cursor/skills/impeccable/reference/`.

## Como invocar

- `/impeccable-ship` → polish em todo o scope actual
- `/impeccable-ship animate hero`
- `/impeccable-ship adapt galeria mobile`
- `/impeccable-ship harden paginas legais`

## Execução

1. `node ~/.cursor/skills/impeccable/scripts/context.mjs` (com `--target` se aplicável).
2. Lê `reference/craft-floor.md` antes de editar UI.
3. Lê o reference do subcomando escolhido (default: `polish.md`).
4. Preserva identidade wine/gold do projeto unless redesign pedido.
