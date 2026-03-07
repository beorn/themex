# swatch

Universal color themes for any platform -- terminal, web, native. Zero dependencies.

## Overview

swatch is a two-layer theme system:

1. **ColorPalette** (Layer 1) -- 22 terminal colors (16 ANSI + 6 special) that serve as a universal pivot format. Every modern terminal emulator uses this exact format (Ghostty, Kitty, Alacritty, iTerm2, WezTerm).

2. **Theme** (Layer 2) -- 33 semantic tokens derived automatically via `deriveTheme()`. These are what UI components consume: `$primary`, `$surface`, `$error`, `$border`, etc.

All inputs flow through the same pipeline: **Source -> ColorPalette -> `deriveTheme()` -> Theme**.

Ships with **45 built-in palettes** from 20 theme families including Catppuccin, Nord, Dracula, Solarized, Tokyo Night, Gruvbox, Rose Pine, Kanagawa, and more.

## Install

```bash
bun add swatch
```

## Quick Start

```typescript
import { presetTheme, resolveThemeColor } from "swatch"

// Load a built-in theme
const theme = presetTheme("catppuccin-mocha")

// Resolve semantic tokens to hex colors
resolveThemeColor("$primary", theme)   // -> "#F9E2AF"
resolveThemeColor("$error", theme)     // -> "#F38BA8"
resolveThemeColor("$surface", theme)   // -> hex color
```

### Generate from minimal input

```typescript
import { createTheme, fromColors, deriveTheme } from "swatch"

// Builder API (chainable)
const theme = createTheme().bg("#2E3440").primary("#EBCB8B").build()

// Or from 1-3 colors directly
const palette = fromColors({ background: "#2E3440", primary: "#EBCB8B" })
const theme = deriveTheme(palette)

// Single color -> full theme
import { autoGenerateTheme } from "swatch"
const theme = autoGenerateTheme("#5E81AC", "dark")
```

### Use a preset with overrides

```typescript
import { createTheme } from "swatch"

const theme = createTheme()
  .preset("nord")
  .primary("#A3BE8C")
  .build()
```

## API

### Theme Creation

| Function | Description |
|----------|-------------|
| `presetTheme(name)` | Create a theme from a built-in preset name |
| `createTheme()` | Chainable builder: `.bg()`, `.fg()`, `.primary()`, `.preset()`, `.dark()`, `.light()`, `.build()` |
| `quickTheme(color, mode?)` | One-liner from a primary color or color name |
| `autoGenerateTheme(hex, mode)` | Generate a full theme from a single color |
| `deriveTheme(palette, mode?)` | Derive 33 semantic tokens from a 22-color palette (`"truecolor"` or `"ansi16"`) |

### Palette Generators

| Function | Description |
|----------|-------------|
| `fromPreset(name)` | Look up a built-in `ColorPalette` by name |
| `fromColors(opts)` | Generate a full palette from `{ background?, foreground?, primary? }` |
| `fromBase16(yaml)` | Import a Base16 YAML scheme as a `ColorPalette` |

### Token Resolution

| Function | Description |
|----------|-------------|
| `resolveThemeColor(token, theme)` | Resolve `$token` strings (e.g. `$primary`, `$surface-fg`, `$color0`) to hex |
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
| `themeToCSSVars(theme)` | Convert theme to CSS custom properties (`--bg`, `--primary`, etc.) |
| `exportBase16(palette)` | Export a `ColorPalette` as Base16 YAML |

### Terminal Detection

| Function | Description |
|----------|-------------|
| `detectTerminalPalette(timeout?)` | Auto-detect terminal colors via OSC 4/10/11 queries |
| `detectTheme(opts?)` | Detect and derive a theme, with fallback palette |

### Global State (optional)

For render pipelines where React context is not accessible:

| Function | Description |
|----------|-------------|
| `setActiveTheme(theme)` | Set the global active theme |
| `getActiveTheme()` | Get the current active theme |
| `pushContextTheme(theme)` | Push a per-subtree override (CSS custom property-like cascading) |
| `popContextTheme()` | Pop a subtree override |

### Color Utilities

`blend`, `brighten`, `darken`, `contrastFg`, `desaturate`, `complement`, `hexToRgb`, `rgbToHex`, `hexToHsl`, `hslToHex`, `rgbToHsl`

## Semantic Tokens (33)

Every background token has a matching `*fg` foreground token for guaranteed contrast (shadcn-style pairing).

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
| Palette | `$color0` through `$color15` (ANSI 16 passthrough) |

## Built-in Palettes (45)

Catppuccin (Mocha, Frappe, Macchiato, Latte), Nord, Dracula, Solarized (Dark, Light), Tokyo Night (Night, Storm, Day), One Dark, Gruvbox (Dark, Light), Rose Pine (Main, Moon, Dawn), Kanagawa (Wave, Dragon, Lotus), Everforest (Dark, Light), Monokai (Classic, Pro), Snazzy, Material (Dark, Light), Palenight, Ayu (Dark, Mirage, Light), Nightfox, Dawnfox, Horizon, Moonfly, Nightfly, Oxocarbon (Dark, Light), Sonokai, Edge (Dark, Light), Modus (Vivendi, Operandi).

## License

MIT
