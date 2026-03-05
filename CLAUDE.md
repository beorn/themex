# themex - Universal Color Themes

Universal color themes for any platform — terminal, web, native. Zero dependencies.

## Architecture

Two-layer theme system:

- **Layer 1: ColorPalette** — 22 terminal colors (16 ANSI + 6 special) that theme authors define
- **Layer 2: Theme** — 33 semantic tokens derived via `deriveTheme()`

All inputs → ColorPalette → `deriveTheme()` → Theme. No shortcuts.

## Quick Start

```typescript
import { createTheme, presetTheme, resolveThemeColor, fromColors } from "themex"

// From a preset
const theme = presetTheme("catppuccin-mocha")

// Resolve $token strings
resolveThemeColor("$primary", theme) // → hex color

// From minimal input
const palette = fromColors({ background: "#2E3440", primary: "#EBCB8B" })
const theme = deriveTheme(palette)

// Import from Base16
import { importBase16 } from "themex"
const palette = importBase16(yamlString)
```

## Commands

```bash
bun vitest run --project vendor vendor/swatch/tests/   # Run tests (166 tests)
```

## Source Structure

```
src/
├── index.ts          # Public API barrel
├── types.ts          # ColorPalette, Theme, HueName, AnsiPrimary, AnsiColorName
├── derive.ts         # deriveTheme() (takes ColorPalette, mode?)
├── generators.ts     # fromBase16(), fromColors(), fromPreset()
├── color.ts          # blend(), brighten(), darken(), contrastFg()
├── resolve.ts        # resolveThemeColor()
├── validate.ts       # validateColorPalette() — check fields + contrast
├── state.ts          # activeTheme, contextStack (push/pop/get/set)
├── detect.ts         # detectTerminalPalette() — OSC 4/10/11 auto-detection
├── view.tsx          # Interactive fullscreen theme browser (bun view)
├── cli.ts            # CLI entry point (bun cli)
├── import/           # Theme format importers
│   ├── base16.ts     # importBase16() — Base16 YAML → ColorPalette
│   └── types.ts      # Base16Scheme interface
├── export/           # Theme format exporters
│   └── base16.ts     # exportBase16() — ColorPalette → Base16 YAML
└── palettes/         # 45 built-in ColorPalette definitions
    ├── index.ts      # Registry + pre-derived themes + getThemeByName()
    ├── catppuccin.ts # Mocha, Frappe, Macchiato, Latte
    ├── nord.ts
    ├── dracula.ts
    ├── solarized.ts  # Dark, Light
    ├── tokyo-night.ts # Night, Storm, Day
    ├── one-dark.ts
    ├── gruvbox.ts    # Dark, Light
    ├── rose-pine.ts  # Main, Moon, Dawn
    ├── kanagawa.ts   # Wave, Dragon, Lotus
    ├── everforest.ts # Dark, Light
    ├── monokai.ts    # Classic, Pro
    ├── snazzy.ts
    ├── material.ts   # Dark, Light
    ├── palenight.ts
    ├── ayu.ts        # Dark, Mirage, Light
    ├── nightfox.ts   # Nightfox, Dawnfox
    ├── horizon.ts
    ├── moonfly.ts
    ├── nightfly.ts
    ├── oxocarbon.ts  # Dark, Light
    ├── sonokai.ts
    ├── edge.ts       # Dark, Light
    └── modus.ts      # Vivendi, Operandi
```

## Semantic Tokens (33)

| Category   | Tokens                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------ |
| Default    | `$bg`, `$fg`                                                                                     |
| Surface    | `$surface`, `$surface-fg`, `$popover`, `$popover-fg`                                             |
| Muted      | `$muted`, `$muted-fg`                                                                            |
| Brand      | `$primary`, `$primary-fg`, `$secondary`, `$secondary-fg`                                         |
| Accent     | `$accent`, `$accent-fg`                                                                          |
| Status     | `$error`, `$error-fg`, `$warning`, `$warning-fg`, `$success`, `$success-fg`, `$info`, `$info-fg` |
| Selection  | `$selection`, `$selection-fg`                                                                    |
| Chrome     | `$inverse`, `$inverse-fg`                                                                        |
| Cursor     | `$cursor`, `$cursor-fg`                                                                          |
| Standalone | `$border`, `$inputborder`, `$focusborder`, `$link`, `$disabled-fg`                               |

## Additional APIs

### Validation

```typescript
import { validateTheme, THEME_TOKEN_KEYS } from "themex"

const result = validateTheme(myTheme)
// { valid: boolean, missing: string[], extra: string[] }
```

### WCAG Contrast Checking

```typescript
import { checkContrast } from "themex"

const result = checkContrast("#ffffff", "#000000")
// { ratio: 21, aa: true, aaa: true }
```

### Token Aliasing

```typescript
import { resolveAliases } from "themex"

// Values starting with $ reference other tokens
const resolved = resolveAliases({
  bg: "#1e1e2e",
  surface: "$bg", // resolves to "#1e1e2e"
  popover: "$surface", // chain resolves to "#1e1e2e"
})
```

### CSS Variable Export

```typescript
import { themeToCSSVars } from "themex"

const css = themeToCSSVars(theme)
// "--bg: #1e1e2e;\n--fg: #cdd6f4;\n..."
```

### Auto-Generate Theme from Primary Color

```typescript
import { autoGenerateTheme } from "themex"

const theme = autoGenerateTheme("#A3BE8C", "dark")
// Generates a full theme with all 33 tokens derived from the primary color
```

## Key Design Decisions

- **ColorPalette is the 22-color terminal standard format**: 16 ANSI colors + 6 special (background, foreground, cursor, cursor-text, selection, selection-text).
- **Dual derivation**: truecolor mode uses blends for smooth gradients; ansi16 mode uses direct aliases to palette colors.
- **shadcn-style `$name / $name-fg` pairing convention**: Every background token has a matching foreground token for guaranteed contrast.
- **No backward-compat aliases**: Clean token namespace, no legacy indirection.
- **Global state is optional**: `setActiveTheme`/`pushContextTheme` exist for inkx's render pipeline. Standalone users pass Theme objects explicitly.
- **Base16 import is lossless for mapped fields**: base00-base0F map to ColorPalette fields. Round-trip preserves mapped fields exactly.
