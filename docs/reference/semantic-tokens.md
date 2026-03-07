# Semantic Tokens

The `Theme` interface contains 33 semantic tokens organized by category. Every background token has a matching `*fg` foreground for guaranteed contrast (shadcn-style `$name`/`$namefg` pairing).

## Token Reference

### Default

| Token | Purpose |
| ----- | ------- |
| `$bg` | Default background |
| `$fg` | Default text |

### Surface

| Token | Purpose |
| ----- | ------- |
| `$surface` / `$surfacefg` | Elevated content (cards, dialogs) |
| `$popover` / `$popoverfg` | Floating content (dropdowns, tooltips) |

### Muted

| Token | Purpose |
| ----- | ------- |
| `$muted` / `$mutedfg` | De-emphasized area / secondary text (~70% contrast) |

### Brand

| Token | Purpose |
| ----- | ------- |
| `$primary` / `$primaryfg` | Brand accent, active indicators |
| `$secondary` / `$secondaryfg` | Alternate accent (desaturated primary) |

### Accent

| Token | Purpose |
| ----- | ------- |
| `$accent` / `$accentfg` | Attention/pop accent (complement of primary) |

### Status

| Token | Purpose |
| ----- | ------- |
| `$error` / `$errorfg` | Error, destructive actions |
| `$warning` / `$warningfg` | Warning, caution |
| `$success` / `$successfg` | Success, positive |
| `$info` / `$infofg` | Neutral information |

### Selection

| Token | Purpose |
| ----- | ------- |
| `$selection` / `$selectionfg` | Selected items highlight |

### Chrome

| Token | Purpose |
| ----- | ------- |
| `$inverse` / `$inversefg` | Chrome area (status/title bars) |

### Cursor

| Token | Purpose |
| ----- | ------- |
| `$cursor` / `$cursorfg` | Terminal cursor |

### Standalone

| Token | Purpose |
| ----- | ------- |
| `$border` | Structural dividers |
| `$inputborder` | Interactive control borders |
| `$focusborder` | Focus outline (always blue) |
| `$link` | Hyperlinks |
| `$disabledfg` | Disabled/placeholder text (~50% contrast) |

### Palette

16 ANSI colors accessible as `$color0` through `$color15`. Direct passthrough from the `ColorPalette` input (black, red, green, yellow, blue, magenta, cyan, white, then bright variants).

## The `$name`/`$namefg` Convention

Every area token (background) is paired with a `*fg` (foreground) token guaranteeing readable contrast. Use `$primary` as a background and `$primaryfg` for text on it. The `*fg` values are derived via `contrastFg()` (WCAG luminance check returning black or white) or palette passthrough.

## Resolution

Use `resolveThemeColor()` to resolve `$token` strings against a theme:

```typescript
import { resolveThemeColor } from "swatch"

resolveThemeColor("$primary", theme) // -> "#F9E2AF"
resolveThemeColor("$color3", theme) // -> "#F9E2AF" (yellow from palette)
resolveThemeColor("#FF0000", theme) // -> "#FF0000" (pass-through)
resolveThemeColor(undefined, theme) // -> undefined
```

Hyphenated forms are supported: `$surface-fg` resolves identically to `$surfacefg`.

## Theme Interface

```typescript
interface Theme {
  name: string

  // 14 pairs (area + text-on-area)
  bg: string; fg: string
  surface: string; surfacefg: string
  popover: string; popoverfg: string
  muted: string; mutedfg: string
  primary: string; primaryfg: string
  secondary: string; secondaryfg: string
  accent: string; accentfg: string
  error: string; errorfg: string
  warning: string; warningfg: string
  success: string; successfg: string
  info: string; infofg: string
  selection: string; selectionfg: string
  inverse: string; inversefg: string
  cursor: string; cursorfg: string

  // 5 standalone tokens
  border: string; inputborder: string; focusborder: string
  link: string; disabledfg: string

  // 16 palette passthrough
  palette: string[]
}
```
