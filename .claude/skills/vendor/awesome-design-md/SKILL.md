---
name: awesome-design-md
description: >-
  Installs and applies pre-built DESIGN.md design systems from the VoltAgent
  awesome-design-md collection (73+ brands: Linear, Stripe, Vercel, Cursor,
  etc.). Use when the user wants UI that looks like a known brand, mentions
  DESIGN.md, awesome-design-md, getdesign, Google Stitch design systems, or asks
  to "build a page like X". For extracting design from a custom URL or image,
  use anydesign instead.
---

# Awesome DESIGN.md

Pre-built design systems from [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md). Each file is a plain-text spec AI agents read to generate consistent UI.

| File | Reader | Defines |
|------|--------|---------|
| `AGENTS.md` | Coding agents | How to build the project |
| `DESIGN.md` | Design agents | How the project should look |

## When to use this skill

| User wants | Action |
|------------|--------|
| UI like Linear, Stripe, Vercel, etc. | Pick slug from [catalog.md](catalog.md), install, build |
| A `DESIGN.md` already in the project | Read it fully before writing UI code |
| Custom site / screenshot / Figma | Stop. Use **anydesign** to extract a design system first |
| Blend two brands | Install both, merge tokens manually, document conflicts |

## Workflow

### 1. Pick a design system

Match the user's intent to a slug in [catalog.md](catalog.md). If unclear, offer 2–3 options with one-line mood descriptions.

Common aliases:

| User says | Slug |
|-----------|------|
| Linear | `linear.app` |
| Mistral | `mistral.ai` |
| Together AI | `together.ai` |
| xAI / Grok | `x.ai` |
| OpenCode | `opencode.ai` |
| Runway | `runwayml` |
| Cal.com | `cal` |
| Retro Dell | `dell-1996` |
| Retro Nintendo | `nintendo-2001` |

### 2. Install DESIGN.md

Preferred method — official CLI:

```bash
npx getdesign@latest add <slug>
```

Behavior:

- First add → `./DESIGN.md` at project root
- Later adds → `./<slug>/DESIGN.md` (active file stays at root unless `--force`)
- Custom path: `npx getdesign@latest add <slug> --out ./docs/DESIGN.md`
- Overwrite: `npx getdesign@latest add <slug> --force`
- List all: `npx getdesign@latest list`

Fallback (no npm): fetch from GitHub:

```
https://raw.githubusercontent.com/VoltAgent/awesome-design-md/main/design-md/<slug>/DESIGN.md
```

Also available per brand: `preview.html`, `preview-dark.html` in the same folder.

### 3. Read before coding

Read the full `DESIGN.md` in the project. Structure follows the [Stitch spec](https://stitch.withgoogle.com/docs/design-md/specification/):

1. YAML frontmatter — tokens (`colors`, `typography`, `spacing`, `rounded`, `components`)
2. Visual Theme & Atmosphere
3. Color Palette & Roles
4. Typography Rules
5. Component Stylings
6. Layout Principles
7. Depth & Elevation
8. Do's and Don'ts
9. Responsive Behavior
10. Agent Prompt Guide

Token references use `{colors.primary}`, `{typography.body}`, `{rounded.md}` syntax. Resolve every reference to its hex/px value before implementing.

For translation rules (tokens → CSS/Tailwind/React), see [references/building-ui.md](references/building-ui.md).

### 4. Build UI

Apply in this priority order:

1. **Do's and Don'ts** — hard guardrails; violations break brand fidelity
2. **Colors + typography** — semantic roles, not arbitrary picks
3. **Components** — use named variants from frontmatter (`button-primary`, `feature-card`, etc.)
4. **Layout + spacing** — follow the scale in frontmatter
5. **Responsive** — breakpoints and touch targets from section 8

Rules:

- Use exact hex values from the file. No "close enough" substitutions.
- One accent color per system unless the spec defines more.
- Respect surface hierarchy (`canvas` → `surface-1` → `surface-2` …).
- Font fallbacks: map proprietary fonts to system stacks listed in the typography section.
- When the project already has `AGENTS.md` or existing styles, merge — don't override project-specific brand colors unless the user asked for the external design system.

### 5. Verify

Before delivering:

- [ ] Primary CTA matches `button-primary` spec
- [ ] Background uses `canvas`, not generic gray/black
- [ ] No Do's and Don'ts violations
- [ ] Typography weights and letter-spacing match the hierarchy table
- [ ] Accent color appears only where the spec allows

Optional: open `preview.html` from the repo folder for a visual token catalog.

## Combining with project context

When `DESIGN.md` and `AGENTS.md` coexist:

- `AGENTS.md` wins on **architecture, file paths, stack, workflow**
- `DESIGN.md` wins on **visual tokens, components, layout feel**

Example: Desaparecida FC keeps club colors from `AGENTS.md` but borrows Linear's card density and typography rhythm from `DESIGN.md`.

## Request a missing brand

Custom extractions: [getdesign.md/request](https://getdesign.md/request)

Contribute fixes: [awesome-design-md issues](https://github.com/VoltAgent/awesome-design-md/issues)
