# themex - Universal Color Themes

Universal color themes for any platform — terminal, web, native. Zero dependencies.

## Architecture

Two-layer theme system:
- **Layer 1: ThemePalette** — 14 raw colors (6 surface ramp + 8 accent hues) that theme authors define
- **Layer 2: Theme** — 19 semantic tokens + 16 palette colors derived via `deriveTheme()`

All inputs → ThemePalette → `deriveTheme()` → Theme. No shortcuts.

## Quick Start

```typescript
import { deriveTheme, catppuccinMocha, resolveThemeColor } from "themex"

// Derive a theme from a palette
const theme = deriveTheme(catppuccinMocha)

// Resolve $token strings
const color = resolveThemeColor("$primary", theme) // → "#F9E2AF"
```

## Commands

```bash
bun vitest run --project vendor vendor/beorn-themex/tests/   # Run tests
```

## Source Structure

```
src/
├── index.ts          # Public API barrel
├── types.ts          # ThemePalette, Theme, HueName, AnsiPrimary
├── derive.ts         # deriveTheme(), isWarm()
├── color.ts          # blend(), brighten(), darken(), contrastFg()
├── resolve.ts        # resolveThemeColor(), token aliases
├── generate.ts       # generateTheme() — ANSI 16 theme from primary + dark/light
├── state.ts          # activeTheme, contextStack (push/pop/get/set)
├── validate.ts       # validatePalette() — check fields + contrast
└── palettes/         # Built-in ThemePalette definitions
    ├── index.ts      # Registry + pre-derived themes + getThemeByName()
    ├── catppuccin.ts # Mocha, Frappe, Macchiato, Latte
    ├── nord.ts
    ├── dracula.ts
    ├── solarized.ts  # Dark, Light
    ├── tokyo-night.ts # Night, Storm, Day
    ├── one-dark.ts
    ├── gruvbox.ts    # Dark, Light
    └── rose-pine.ts  # Main, Moon, Dawn
```

## Semantic Tokens (19)

| Category | Tokens |
|----------|--------|
| Brand | `$primary`, `$link`, `$control` |
| Selection | `$selected`, `$selectedfg`, `$focusring` |
| Text | `$text`, `$text2`, `$text3`, `$text4` |
| Surface | `$bg`, `$raisedbg`, `$separator`, `$chromebg`, `$chromefg` |
| Status | `$error`, `$warning`, `$success` |

Plus `$color0`–`$color15` palette colors.

## Backward-Compat Aliases

| Old Token | Resolves To |
|-----------|-------------|
| `$accent` | `$primary` |
| `$muted` | `$text2` |
| `$surface` | `$raisedbg` |
| `$background` | `$bg` |
| `$border` | `$separator` |

## Key Design Decisions

- **Global state is optional**: `setActiveTheme`/`pushContextTheme` exist for inkx's render pipeline. Standalone users pass Theme objects explicitly.
- **ANSI 16 themes are hardcoded, not derived**: They use color names ("yellow", "blueBright") not hex, so `deriveTheme()` is irrelevant.
- **Truecolor default themes are also hardcoded**: They were hand-tuned (Nord-inspired) before `deriveTheme()` existed. They could be replaced with `deriveTheme(nord)` but the current values have been battle-tested.
