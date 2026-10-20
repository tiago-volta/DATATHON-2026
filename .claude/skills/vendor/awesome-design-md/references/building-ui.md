# Building UI from DESIGN.md

Read this when translating a `DESIGN.md` file into code.

## Token resolution

Frontmatter uses reference syntax:

```
{backgroundColor: "{colors.primary}"}
```

Resolve recursively:

1. Read YAML frontmatter between `---` delimiters
2. Replace `{colors.X}` → hex from `colors:` block
3. Replace `{typography.X}` → expand all properties (fontFamily, fontSize, fontWeight, lineHeight, letterSpacing)
4. Replace `{rounded.X}` → px value from `rounded:` block
5. Replace `{spacing.X}` → px value from `spacing:` block

Never leave unresolved `{token.ref}` in output code.

## Stack mapping

### CSS custom properties (default)

```css
:root {
  --color-primary: #5e6ad2;
  --color-canvas: #010102;
  --color-ink: #f7f8f8;
  --font-display: "SF Pro Display", system-ui, sans-serif;
  --radius-md: 8px;
  --space-lg: 24px;
}
```

Name tokens with the same semantic keys from the DESIGN.md (`primary`, `canvas`, `surface-1`, not `blue-500`).

### Tailwind v4 / v3

Extend theme from resolved values:

```js
// tailwind.config — example
colors: {
  canvas: "#010102",
  primary: { DEFAULT: "#5e6ad2", hover: "#828fff" },
  ink: { DEFAULT: "#f7f8f8", muted: "#d0d6e0", subtle: "#8a8f98" },
}
```

Prefer semantic class names (`bg-canvas`, `text-ink-muted`) over arbitrary Tailwind palette colors.

### React / inline styles

Map component specs directly:

```tsx
const buttonPrimary = {
  backgroundColor: "#5e6ad2",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: 500,
  borderRadius: "8px",
  padding: "8px 14px",
};
```

For hover/pressed states, use the variant keys from frontmatter (`button-primary-hover`, `button-primary-pressed`).

## Component implementation order

1. **Layout shell** — `canvas` background, max-width container, section spacing
2. **Navigation** — `top-nav` spec (height, background, typography)
3. **Typography scale** — display → headline → body → caption
4. **Buttons** — primary first, then secondary/tertiary/inverse
5. **Cards** — match named variants (`feature-card`, `pricing-card`, etc.)
6. **Forms** — `text-input` + focused state
7. **Footer** — padding, link density, muted text color

## Surface hierarchy

Most dark-first systems use a ladder:

```
canvas (page bg)
  └── surface-1 (cards, panels)
        └── surface-2 (elevated/featured)
              └── surface-3, surface-4 (rare lifts)
```

Borders use `hairline`, `hairline-strong`, `hairline-tertiary` — typically 1px, not box-shadows.

## Typography rules

- Display sizes: apply negative `letterSpacing` from the spec
- Body: weight 400, line-height 1.4–1.5
- Buttons: weight 500, tighter line-height
- Eyebrows/labels: positive letter-spacing, smaller size
- Proprietary fonts → use fallbacks listed in the typography section; load via Google Fonts or `@font-face` only when the spec names a loadable alternative

## Accent color discipline

The Do's and Don'ts section defines where the accent appears. Typical pattern:

- **Do**: primary CTA, brand mark, focus rings, link emphasis
- **Don't**: section backgrounds, decorative gradients, secondary accents

## Responsive

Section 8 defines breakpoints. Default patterns in the collection:

| Breakpoint | Typical behavior |
|------------|------------------|
| Mobile | Single column, 16px side padding, stacked CTAs |
| Tablet | 2-column grids, nav may collapse to hamburger |
| Desktop | Max-width container (often 1080–1280px), multi-column features |

Touch targets: minimum 44px height for interactive elements unless the spec says otherwise.

## Agent prompt reuse

Many DESIGN.md files end with ready-made prompts in section 9. Copy and adapt them — they encode the brand's non-obvious constraints.

Example adaptation:

```
Build a pricing page using DESIGN.md tokens.
- canvas background, surface-1 cards with hairline borders
- button-primary for the main CTA only
- product-screenshot-card for hero imagery
- Follow Do's and Don'ts strictly
```

## Conflicts with existing project styles

When the project has its own design tokens (e.g., club colors in `AGENTS.md`):

1. Keep project-specific brand colors for branded content
2. Borrow structural patterns from DESIGN.md (spacing, card shapes, typography rhythm)
3. Or replace the color palette entirely if the user asked for the external brand look
4. Document which tokens came from which source in a brief comment or commit message
