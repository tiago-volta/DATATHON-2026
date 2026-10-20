---
name: impeccable-setup
description: "Impeccable — preparar projeto (1x): init, document, shape, extract. Use /impeccable-setup no início de um projeto ou quando falta PRODUCT.md/DESIGN.md."
argument-hint: "[init | document | shape | extract]"
user-invocable: true
---

<!-- impeccable-pinned-skill -->

Atalho condensado Impeccable para **contexto de projeto** (correr raramente).

## Quando usar

- Projeto novo ou sem `PRODUCT.md` → **init**
- Já há UI mas falta `DESIGN.md` → **document**
- Planear uma feature antes de codar → **shape**
- Tokens/componentes espalhados → **extract**

## Como invocar

Passa o subcomando no pedido (default: **init** se não disseres):

- `/impeccable-setup init`
- `/impeccable-setup document`
- `/impeccable-setup shape checkout`
- `/impeccable-setup extract buttons`

## Execução

1. `node ~/.cursor/skills/impeccable/scripts/context.mjs` (com `--target` se nomeaste ficheiro/rota).
2. Lê `~/.cursor/skills/impeccable/reference/<subcomando>.md` e segue.
3. Subcomandos válidos: `init`, `document`, `shape`, `extract` apenas.
