# Swatch

Easily theme any app with modern design tokens. Easily create themes from just a few colors.

Powerfully derived &mdash; 33 semantic tokens like `$primary`, `$error`, and `$surface` with guaranteed contrast and dark/light mode support. Create themes from one color, a popular palette like Catppuccin or Nord, your system theme, or fully custom values. 43 built-in palettes. Terminal, web, native. Zero dependencies.

<p align="center"><img src="./docs/swatch-overview.svg" alt="Swatch theme tokens derived from Catppuccin Mocha" width="680"></p>

## Quick Start

```bash
bun add swatch    # or npm i swatch / pnpm add swatch / yarn add swatch
```

```typescript
import { presetTheme, resolveThemeColor } from "swatch"

// Load a built-in theme
const theme = presetTheme("catppuccin-mocha")

// Use semantic tokens
resolveThemeColor("$primary", theme)   // -> "#F9E2AF"
resolveThemeColor("$error", theme)     // -> "#F38BA8"
resolveThemeColor("$surface", theme)   // -> "#313244"
```

### Generate from minimal input

```typescript
import { createTheme, autoGenerateTheme } from "swatch"

// Builder API — chainable
const theme = createTheme().bg("#2E3440").primary("#EBCB8B").build()

// Single color -> full theme
const theme = autoGenerateTheme("#5E81AC", "dark")
```

### Use a preset with overrides

```typescript
const theme = createTheme()
  .preset("nord")
  .primary("#A3BE8C")
  .build()
```

## How It Works

```
  ┌─────────────────────┐
  │   1-3 colors        │
  │   or preset name    │──────┐
  │   or Base16 YAML    │      │
  └─────────────────────┘      ▼
                         ┌───────────┐     ┌──────────────────────────────────┐
                         │ 22-color  │────▶│ 33 semantic design tokens        │
                         │ palette   │     │ $primary $error $surface $border │
                         └───────────┘     └──────────────┬───────────────────┘
                                                          ▼
                                           ┌──────────────────────────────┐
                                           │ Apps that look great across  │
                                           │ themes, platforms, and modes │
                                           └──────────────────────────────┘
```

Terminal palettes define 22 colors &mdash; a compact, universal format that every theme author already knows. But modern UIs need more: surfaces, borders, status colors, focus rings, selection highlights. Swatch *derives* 33 semantic tokens from those 22 base colors using blending, contrast calculations, and sensible defaults.

Theme authors define what they know. Swatch produces what components need.

## Why Swatch?

- **Easy to specify** &mdash; provide 1&ndash;3 colors, pick a well-known palette, or import Base16. Swatch derives all 33 tokens automatically with correct contrast ratios.
- **Easy to use** &mdash; components consume `$primary`, `$error`, `$surface` instead of raw colors. Every background token has a matching foreground. Themes change without touching code.
- **Fine-tuning** &mdash; derivation gets you 80%. Override individual tokens for the last 20%: a warmer primary, a lighter border, a different accent.

### Inspiration

- **Terminal emulators** (Ghostty, Kitty, Alacritty, iTerm2, WezTerm) &mdash; the 22-color palette as a universal pivot format
- **shadcn/ui** &mdash; `$name` / `$name-fg` pairing for guaranteed contrast
- **Base16** &mdash; compact palettes that generate full themes, plus import/export
- **Catppuccin, Nord, Dracula** &mdash; community palettes maintained across dozens of apps

## API

### Theme Creation

| Function | Description |
|----------|-------------|
| `presetTheme(name)` | Create a theme from a built-in preset name |
| `createTheme()` | Chainable builder: `.bg()`, `.fg()`, `.primary()`, `.preset()`, `.dark()`, `.light()`, `.build()` |
| `quickTheme(color, mode?)` | One-liner from a primary color or color name |
| `autoGenerateTheme(hex, mode)` | Generate a full theme from a single color |
| `deriveTheme(palette, mode?)` | Derive 33 semantic tokens from a 22-color palette |

### Palette Generators

| Function | Description |
|----------|-------------|
| `fromPreset(name)` | Look up a built-in `ColorPalette` by name |
| `fromColors(opts)` | Generate a full palette from `{ background?, foreground?, primary? }` |
| `fromBase16(yaml)` | Import a Base16 YAML scheme as a `ColorPalette` |

### Token Resolution

| Function | Description |
|----------|-------------|
| `resolveThemeColor(token, theme)` | Resolve `$token` strings to hex |
| `resolveAliases(record)` | Resolve `$`-prefixed values in a record (chain-resolves) |

### Validation and Contrast

| Function | Description |
|----------|-------------|
| `validateColorPalette(palette)` | Validate fields and contrast ratios |
| `validateTheme(theme)` | Check for missing/extra tokens |
| `checkContrast(fg, bg)` | WCAG contrast check: `{ ratio, aa, aaa }` |

### Export

| Function | Description |
|----------|-------------|
| `themeToCSSVars(theme)` | Convert theme to `Record<string, string>` of CSS custom properties |
| `exportBase16(palette)` | Export a `ColorPalette` as Base16 YAML |

### Terminal Detection

| Function | Description |
|----------|-------------|
| `detectTerminalPalette(timeout?)` | Auto-detect terminal colors via OSC 4/10/11 queries |
| `detectTheme(opts?)` | Detect and derive a theme, with fallback palette |

### Color Utilities

`blend`, `brighten`, `darken`, `contrastFg`, `desaturate`, `complement`, `hexToRgb`, `rgbToHex`, `hexToHsl`, `hslToHex`, `rgbToHsl`

## Semantic Tokens (33)

Every background token has a matching `*fg` foreground for guaranteed contrast.

| Category | Tokens |
|----------|--------|
| Default | `$bg`, `$fg` |
| Surface | `$surface` / `$surfacefg`, `$popover` / `$popoverfg` |
| Muted | `$muted` / `$mutedfg` |
| Brand | `$primary` / `$primaryfg`, `$secondary` / `$secondaryfg` |
| Accent | `$accent` / `$accentfg` |
| Status | `$error` / `$errorfg`, `$warning` / `$warningfg`, `$success` / `$successfg`, `$info` / `$infofg` |
| Selection | `$selection` / `$selectionfg` |
| Chrome | `$inverse` / `$inversefg` |
| Cursor | `$cursor` / `$cursorfg` |
| Standalone | `$border`, `$inputborder`, `$focusborder`, `$link`, `$disabledfg` |
| Palette | `$color0`&ndash;`$color15` (ANSI 16 passthrough) |

## Built-in Palettes (43)

Catppuccin (Mocha, Frappe, Macchiato, Latte), Nord, Dracula, Solarized (Dark, Light), Tokyo Night (Night, Storm, Day), One Dark, Gruvbox (Dark, Light), Rose Pine (Main, Moon, Dawn), Kanagawa (Wave, Dragon, Lotus), Everforest (Dark, Light), Monokai (Classic, Pro), Snazzy, Material (Dark, Light), Palenight, Ayu (Dark, Mirage, Light), Nightfox, Dawnfox, Horizon, Moonfly, Nightfly, Oxocarbon (Dark, Light), Sonokai, Edge (Dark, Light), Modus (Vivendi, Operandi).

## License

MIT
