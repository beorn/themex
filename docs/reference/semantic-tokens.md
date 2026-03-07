# Semantic Tokens

The `Theme` interface contains 19 semantic tokens organized into 5 categories. These are the colors your UI components consume.

## Token Reference

### Brand Tokens

| Token      | Purpose                               | Derivation                                |
| ---------- | ------------------------------------- | ----------------------------------------- |
| `$primary` | Primary brand tint, active indicators | Palette accent hue (default: yellow/blue) |
| `$link`    | Hyperlinks, references                | `palette.blue`                            |
| `$control` | Interactive chrome, input borders     | `blend(primary, overlay, 0.3)`            |

### Selection Tokens

| Token         | Purpose                        | Derivation                                 |
| ------------- | ------------------------------ | ------------------------------------------ |
| `$selected`   | Selection highlight background | Contrasting hue (warm->teal, cool->yellow) |
| `$selectedfg` | Text on selected background    | `crust` (dark) or `text` (light)           |
| `$focusring`  | Keyboard focus outline         | Always `palette.blue` (accessibility)      |

### Text Tokens

| Token    | Purpose                                 | Derivation                     |
| -------- | --------------------------------------- | ------------------------------ |
| `$text`  | Primary text (headings, body)           | `palette.text`                 |
| `$text2` | Secondary text (descriptions, metadata) | `palette.subtext`              |
| `$text3` | Tertiary text (timestamps, hints)       | `blend(subtext, overlay, 0.5)` |
| `$text4` | Ghost text (watermarks, barely visible) | `blend(overlay, base, 0.5)`    |

### Surface Tokens

| Token        | Purpose                               | Derivation                       |
| ------------ | ------------------------------------- | -------------------------------- |
| `$bg`        | Default background                    | `palette.base`                   |
| `$surface`   | Elevated surfaces (dialogs, cards)    | `palette.surface`                |
| `$separator` | Dividers, borders, rules              | `palette.overlay`                |
| `$chromebg`  | Chrome background (title/status bars) | `text` (dark) or `crust` (light) |
| `$chromefg`  | Chrome foreground text                | `crust` (dark) or `text` (light) |

### Status Tokens

| Token      | Purpose                                 | Derivation       |
| ---------- | --------------------------------------- | ---------------- |
| `$error`   | Error, destructive (validation, delete) | `palette.red`    |
| `$warning` | Warning, caution (unsaved changes)      | `palette.orange` |
| `$success` | Success, positive (saved, passing)      | `palette.green`  |

### Palette Colors

In addition to the 19 semantic tokens, each theme includes a 16-color indexed palette accessible as `$color0` through `$color15`:

| Token      | Source (Dark Theme) |
| ---------- | ------------------- |
| `$color0`  | crust               |
| `$color1`  | red                 |
| `$color2`  | green               |
| `$color3`  | yellow              |
| `$color4`  | blue                |
| `$color5`  | purple              |
| `$color6`  | teal                |
| `$color7`  | subtext             |
| `$color8`  | overlay             |
| `$color9`  | orange              |
| `$color10` | green               |
| `$color11` | yellow              |
| `$color12` | blue                |
| `$color13` | purple              |
| `$color14` | teal                |
| `$color15` | text                |

## Resolution

Use `resolveThemeColor()` to resolve `$token` strings against a theme:

```typescript
import { resolveThemeColor } from "swatch"

resolveThemeColor("$primary", theme) // -> "#F9E2AF"
resolveThemeColor("$color3", theme) // -> "#F9E2AF" (yellow from palette)
resolveThemeColor("#FF0000", theme) // -> "#FF0000" (pass-through)
resolveThemeColor(undefined, theme) // -> undefined
```

## Backward-Compatible Aliases

Old token names are still supported:

| Old Token     | Resolves To  |
| ------------- | ------------ |
| `$accent`     | `$primary`   |
| `$muted`      | `$text2`     |
| `$raisedbg`   | `$surface`   |
| `$background` | `$bg`        |
| `$border`     | `$separator` |

## Theme Interface

```typescript
interface Theme {
  name: string
  dark: boolean

  // Brand
  primary: string
  link: string
  control: string

  // Selection
  selected: string
  selectedfg: string
  focusring: string

  // Text
  text: string
  text2: string
  text3: string
  text4: string

  // Surface
  bg: string
  surface: string
  separator: string
  chromebg: string
  chromefg: string

  // Status
  error: string
  warning: string
  success: string

  // Content palette (16 indexed colors)
  palette: string[]
}
```
