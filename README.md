# Swatch

Universal color themes for any platform &mdash; terminal, web, native. Zero dependencies.

## Why Swatch?

Most theming systems are tied to a specific platform. Terminal themes define 22 colors. CSS design systems define semantic tokens. Neither talks to the other, so every app reinvents the mapping, and theme authors maintain separate configs for each platform.

Swatch bridges this gap with a two-layer architecture and a single derivation pipeline.

### Why not just use 22 palette colors directly?

Raw palette colors don't carry meaning. A UI component shouldn't say "use ANSI color 5" &mdash; it should say "use `$error`". Semantic tokens decouple *what a color means* from *what a color looks like*, so themes can change without touching component code. This idea comes from the [W3C Design Tokens Community Group](https://www.w3.org/community/design-tokens/), which defines a standard for expressing design decisions as platform-agnostic data. Design systems like Material Design, Tailwind, and shadcn/ui all use this approach.

### Why not hardcode the 33 semantic tokens per theme?

Because manually specifying 33 values per theme is tedious and error-prone. Most of those values can be *derived* from a handful of base colors with good defaults &mdash; surface colors from background, foreground pairs for contrast, status colors from ANSI slots. With `deriveTheme()`, a theme author only defines 22 palette colors (or as few as 1&ndash;3 via `fromColors`), and the semantic layer is generated automatically with correct contrast ratios.

### Why overrides?

Because derivation gives you 80% of the way there, and the last 20% is taste. You might love Nord's palette but want a warmer primary. Or you might need `$border` slightly lighter for your specific UI density. Overrides let you start from any preset and tweak individual tokens without rebuilding the whole theme from scratch.

### Inspiration

- **Terminal emulators** (Ghostty, Kitty, Alacritty, iTerm2, WezTerm) &mdash; the 22-color format is an existing universal standard
- **shadcn/ui** &mdash; the `$name` / `$name-fg` pairing convention, where every background token has a matching foreground for guaranteed contrast
- **Base16** &mdash; the idea of a compact palette that generates full themes, plus the import/export ecosystem
- **Catppuccin, Nord, Dracula, etc.** &mdash; the community of theme authors who maintain palettes across dozens of apps

## How It Works

1. **ColorPalette** (Layer 1) &mdash; 22 terminal colors (16 ANSI + 6 special) that serve as a universal pivot format.

2. **Theme** (Layer 2) &mdash; 33 semantic tokens derived automatically via `deriveTheme()`. These are what UI components consume: `$primary`, `$surface`, `$error`, `$border`, etc.

All inputs flow through the same pipeline: **Source &rarr; ColorPalette &rarr; `deriveTheme()` &rarr; Theme**.

Ships with **43 built-in palettes** across theme families including Catppuccin, Nord, Dracula, Solarized, Tokyo Night, Gruvbox, Rose Pine, Kanagawa, and more.

## Install

```bash
bun add swatch    # or npm i swatch / pnpm add swatch / yarn add swatch
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
| `themeToCSSVars(theme)` | Convert theme to a `Record<string, string>` of CSS custom properties (`{ "--bg": "#1e1e2e", ... }`) |
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

## Built-in Palettes (43)

Catppuccin (Mocha, Frappe, Macchiato, Latte), Nord, Dracula, Solarized (Dark, Light), Tokyo Night (Night, Storm, Day), One Dark, Gruvbox (Dark, Light), Rose Pine (Main, Moon, Dawn), Kanagawa (Wave, Dragon, Lotus), Everforest (Dark, Light), Monokai (Classic, Pro), Snazzy, Material (Dark, Light), Palenight, Ayu (Dark, Mirage, Light), Nightfox, Dawnfox, Horizon, Moonfly, Nightfly, Oxocarbon (Dark, Light), Sonokai, Edge (Dark, Light), Modus (Vivendi, Operandi).

## License

MIT
