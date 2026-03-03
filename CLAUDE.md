# themex - Universal Color Themes

Universal color themes for any platform — terminal, web, native. Zero dependencies.

## Architecture

Two-layer theme system:
- **Layer 1: ThemePalette** — 14 raw colors (6 surface ramp + 8 accent hues) that theme authors define
- **Layer 2: Theme** — 19 semantic tokens + 16 palette colors derived via `deriveTheme()`

All inputs → ThemePalette → `deriveTheme()` → Theme. No shortcuts.

## Quick Start

```typescript
import { createTheme, presetTheme, resolveThemeColor } from "themex"

// From a preset
const theme = presetTheme('catppuccin-mocha')

// From minimal input (just bg + primary)
const theme = createTheme().bg('#2E3440').primary('#EBCB8B').build()

// Resolve $token strings
resolveThemeColor("$primary", theme) // → hex color

// Import from Base16
import { importBase16 } from "themex"
const palette = importBase16(yamlString)
```

## Commands

```bash
bun vitest run --project vendor vendor/beorn-themex/tests/   # Run tests (166 tests)
```

## Source Structure

```
src/
├── index.ts          # Public API barrel
├── types.ts          # ThemePalette, Theme, HueName, AnsiPrimary
├── builder.ts        # createTheme(), quickTheme(), presetTheme()
├── derive.ts         # deriveTheme(), isWarm()
├── color.ts          # blend(), brighten(), darken(), contrastFg()
├── resolve.ts        # resolveThemeColor(), token aliases
├── generate.ts       # generateTheme() — ANSI 16 theme from primary + dark/light
├── state.ts          # activeTheme, contextStack (push/pop/get/set)
├── detect.ts         # detectTerminalPalette() — OSC 4/10/11 auto-detection
├── validate.ts       # validatePalette() — check fields + contrast
├── view.tsx          # Interactive fullscreen theme browser (bun view)
├── cli.ts            # CLI entry point (bun cli)
├── import/           # Theme format importers
│   ├── base16.ts     # importBase16() — Base16 YAML → ThemePalette
│   └── types.ts      # Base16Scheme interface
├── export/           # Theme format exporters
│   └── base16.ts     # exportBase16() — ThemePalette → Base16 YAML
└── palettes/         # 45 built-in ThemePalette definitions
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

## Builder API

```typescript
createTheme()                              // start builder
  .bg('#2E3440')                           // background color
  .fg('#ECEFF4')                           // foreground color
  .primary('#EBCB8B')                      // primary accent
  .dark()                                  // explicit dark mode (or .light())
  .preset('nord')                          // load built-in palette
  .color('red', '#BF616A')                 // set individual palette color
  .palette(fullPalette)                    // set full palette
  .build()                                 // → Theme

quickTheme('#EBCB8B', 'dark')              // one-liner from primary + mode
presetTheme('catppuccin-mocha')            // one-liner from preset name
```

## Semantic Tokens (19)

| Category | Tokens |
|----------|--------|
| Brand | `$primary`, `$link`, `$control` |
| Selection | `$selected`, `$selectedfg`, `$focusring` |
| Text | `$text`, `$text2`, `$text3`, `$text4` |
| Surface | `$bg`, `$surface`, `$separator`, `$chromebg`, `$chromefg` |
| Status | `$error`, `$warning`, `$success` |

Plus `$color0`–`$color15` palette colors.

## Backward-Compat Aliases

| Old Token | Resolves To |
|-----------|-------------|
| `$accent` | `$primary` |
| `$muted` | `$text2` |
| `$raisedbg` | `$surface` |
| `$background` | `$bg` |
| `$border` | `$separator` |

## Key Design Decisions

- **Global state is optional**: `setActiveTheme`/`pushContextTheme` exist for inkx's render pipeline. Standalone users pass Theme objects explicitly.
- **ANSI 16 themes are hardcoded, not derived**: They use color names ("yellow", "blueBright") not hex, so `deriveTheme()` is irrelevant.
- **Truecolor default themes are also hardcoded**: They were hand-tuned (Nord-inspired) before `deriveTheme()` existed.
- **Builder fills gaps automatically**: `createTheme().bg('#2E3440').build()` generates a full surface ramp and accent hues from just a background color.
- **Base16 import is lossless for mapped fields**: base00-base0F map to 13 of 14 palette fields; `crust` is derived from base00. Round-trip preserves mapped fields exactly.
