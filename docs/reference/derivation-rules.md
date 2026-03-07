# Derivation Rules

`deriveTheme()` transforms a ColorPalette (22 terminal colors) into a Theme (33 semantic tokens). Supports two modes: truecolor (blended) and ansi16 (direct alias).

## Truecolor Derivation

The default mode. Uses `blend()`, `contrastFg()`, `desaturate()`, and `complement()` for smooth gradients and guaranteed contrast.

### Pairs (28 tokens)

| Token | Derivation |
| ----- | ---------- |
| `bg` | `background` |
| `fg` | `foreground` |
| `surface` | `blend(background, foreground, 0.05)` |
| `surfacefg` | `foreground` |
| `popover` | `blend(background, foreground, 0.08)` |
| `popoverfg` | `foreground` |
| `muted` | `blend(background, foreground, 0.04)` |
| `mutedfg` | `blend(foreground, background, 0.7)` |
| `primary` | `yellow` (dark) / `blue` (light) |
| `primaryfg` | `contrastFg(primary)` |
| `secondary` | `desaturate(primary, 0.4)` |
| `secondaryfg` | `contrastFg(secondary)` |
| `accent` | `complement(primary)` |
| `accentfg` | `contrastFg(accent)` |
| `error` | `red` |
| `errorfg` | `contrastFg(red)` |
| `warning` | `yellow` |
| `warningfg` | `contrastFg(yellow)` |
| `success` | `green` |
| `successfg` | `contrastFg(green)` |
| `info` | `cyan` |
| `infofg` | `contrastFg(cyan)` |
| `selection` | `selectionBackground` |
| `selectionfg` | `selectionForeground` |
| `inverse` | `blend(foreground, background, 0.1)` |
| `inversefg` | `contrastFg(inverse)` |
| `cursor` | `cursorColor` |
| `cursorfg` | `cursorText` |

### Standalone (5 tokens)

| Token | Derivation |
| ----- | ---------- |
| `border` | `blend(background, foreground, 0.15)` |
| `inputborder` | `blend(background, foreground, 0.25)` |
| `focusborder` | `blue` |
| `link` | `blue` |
| `disabledfg` | `blend(foreground, background, 0.5)` |

### Palette (16 colors)

Direct passthrough of the 16 ANSI colors: `[black, red, green, yellow, blue, magenta, cyan, white, brightBlack, ..., brightWhite]`.

## ANSI 16 Derivation

The `ansi16` mode uses direct aliases instead of blending. Useful for terminals with limited color support.

```typescript
deriveTheme(palette, "ansi16")
```

Key differences from truecolor:

| Token | Truecolor | ANSI 16 |
| ----- | --------- | ------- |
| `surface` | blended 5% toward fg | `black` |
| `popover` | blended 8% toward fg | `black` |
| `muted` | blended 4% toward fg | `black` |
| `mutedfg` | blended 70% toward bg | `white` |
| `secondary` | desaturated primary | `magenta` |
| `accent` | complement of primary | `cyan` |
| `error` | `red` | `brightRed` (dark) / `red` (light) |
| `success` | `green` | `brightGreen` (dark) / `green` (light) |
| `inverse` | blended fg toward bg | `brightWhite` |
| `border` | blended 15% toward fg | `brightBlack` |
| `inputborder` | blended 25% toward fg | `brightBlack` |
| `disabledfg` | blended 50% toward bg | `brightBlack` |

All `*fg` contrast tokens use `black` in ansi16 mode (instead of WCAG `contrastFg()`).

## Color Utilities

The derivation pipeline uses these utilities from `color.ts`:

| Function | Signature | Purpose |
| -------- | --------- | ------- |
| `blend(a, b, t)` | `(string, string, number) -> string` | Linear RGB interpolation (t=0 returns a, t=1 returns b) |
| `contrastFg(bg)` | `(string) -> "#000000" \| "#FFFFFF"` | WCAG-based black/white contrast pick |
| `desaturate(color, amount)` | `(string, number) -> string` | Reduce saturation via HSL (amount=0.4 reduces by 40%) |
| `complement(color)` | `(string) -> string` | 180-degree hue rotation via HSL |
| `brighten(color, amount)` | `(string, number) -> string` | Blend toward `#FFFFFF` |
| `darken(color, amount)` | `(string, number) -> string` | Blend toward `#000000` |

All operations work on hex color strings. Non-hex inputs (ANSI color names) pass through unchanged.
