# Derivation Rules

themex derives all 19 semantic tokens + a 16-color content palette from a ThemePalette (14 colors). This page documents the exact algorithms used by `deriveTheme()` and `generateTheme()`.

## Truecolor Derivation (`deriveTheme()`)

`deriveTheme(palette, opts?)` takes a ThemePalette and produces a complete Theme. The derivation is deterministic and pure -- the same palette always produces the same theme.

### Accent Selection

The user chooses which palette hue becomes `$primary` via the `accent` option:

```typescript
deriveTheme(palette)                    // default: yellow (dark) or blue (light)
deriveTheme(palette, { accent: "teal" }) // override
```

The default accent is **yellow** for dark themes and **blue** for light themes.

### Warm vs Cool Classification

Accent hues are classified as warm or cool. This determines the contrasting selection color:

| Classification | Hues | Selection Contrast |
|----------------|------|--------------------|
| **Warm** | red, orange, yellow, green, pink, purple | Pairs with **teal** |
| **Cool** | teal, blue | Pairs with **yellow** |

### Token Derivation Table

Given a palette `p` with chosen accent hue `accentName`:

```
primary = p[accentName]
contrastHue = isWarm(accentName) ? "teal" : "yellow"
```

#### Brand Tokens

| Token | Derivation | Explanation |
|-------|-----------|-------------|
| `$primary` | `p[accentName]` | Chosen accent hue from the palette |
| `$link` | `p.blue` | Links are always blue (convention) |
| `$control` | `blend(primary, p.overlay, 0.3)` | Primary muted toward overlay for subtle interactive chrome |

#### Selection Tokens

| Token | Derivation | Explanation |
|-------|-----------|-------------|
| `$selected` | `p[contrastHue]` | Contrasting hue for clear visual separation from primary |
| `$selectedfg` | `p.crust` (dark) / `p.text` (light) | Maximum contrast text on selection background |
| `$focusring` | `p.blue` | Always blue -- accessibility convention |

#### Text Tokens

| Token | Derivation | Explanation |
|-------|-----------|-------------|
| `$text` | `p.text` | Direct from surface ramp -- primary text |
| `$text2` | `p.subtext` | Direct from surface ramp -- secondary text |
| `$text3` | `blend(p.subtext, p.overlay, 0.5)` | Midpoint between subtext and overlay -- tertiary |
| `$text4` | `blend(p.overlay, p.base, 0.5)` | Midpoint between overlay and base -- ghost text |

#### Surface Tokens

| Token | Derivation | Explanation |
|-------|-----------|-------------|
| `$bg` | `p.base` | Direct from surface ramp |
| `$surface` | `p.surface` | Direct from surface ramp -- raised elements |
| `$separator` | `p.overlay` | Direct from surface ramp -- borders, dividers |
| `$chromebg` | `p.text` (dark) / `p.crust` (light) | Chrome inverts: bright bg in dark mode, dark bg in light mode |
| `$chromefg` | `p.crust` (dark) / `p.text` (light) | Chrome inverts: dark text in dark mode, bright text in light mode |

#### Status Tokens

| Token | Derivation | Explanation |
|-------|-----------|-------------|
| `$error` | `p.red` | Direct hue mapping |
| `$warning` | `p.orange` | Direct hue mapping |
| `$success` | `p.green` | Direct hue mapping |

#### Content Palette (16 indexed colors)

The 16-color indexed palette maps palette fields to ANSI-compatible positions:

| Index | Source | Index | Source |
|-------|--------|-------|--------|
| `$color0` | `p.crust` | `$color8` | `p.overlay` |
| `$color1` | `p.red` | `$color9` | `p.orange` |
| `$color2` | `p.green` | `$color10` | `p.green` |
| `$color3` | `p.yellow` | `$color11` | `p.yellow` |
| `$color4` | `p.blue` | `$color12` | `p.blue` |
| `$color5` | `p.purple` | `$color13` | `p.purple` |
| `$color6` | `p.teal` | `$color14` | `p.teal` |
| `$color7` | `p.subtext` | `$color15` | `p.text` |

Colors 0--7 are "normal" intensity; colors 8--15 are "bright" variants. The surface ramp provides the neutral slots (0, 7, 8, 15), while accent hues fill the chromatic slots.

### Color Blending

The `blend(a, b, t)` function performs linear RGB interpolation:

- `t=0` returns color `a`
- `t=1` returns color `b`
- `t=0.5` returns the midpoint

This is used for text hierarchy (text3, text4) and control muting. For non-hex inputs (ANSI color names), the function returns `a` unchanged.

### Example

Given the Nord palette:

```typescript
import { deriveTheme } from "themex"

const nord: ThemePalette = {
  name: "nord", dark: true,
  crust: "#242933", base: "#2E3440", surface: "#3B4252",
  overlay: "#4C566A", subtext: "#D8DEE9", text: "#ECEFF4",
  red: "#BF616A", orange: "#D08770", yellow: "#EBCB8B",
  green: "#A3BE8C", teal: "#8FBCBB", blue: "#5E81AC",
  purple: "#B48EAD", pink: "#B48EAD",
}

const theme = deriveTheme(nord)
// theme.primary  = "#EBCB8B"  (yellow, default dark accent)
// theme.link     = "#5E81AC"  (blue)
// theme.control  = "#A8A06F"  (yellow blended 30% toward overlay)
// theme.selected = "#8FBCBB"  (teal, because yellow is warm)
// theme.text     = "#ECEFF4"
// theme.text2    = "#D8DEE9"
// theme.chromebg = "#ECEFF4"  (text, because dark theme)
// theme.chromefg = "#242933"  (crust, because dark theme)
```

## ANSI 16 Generation (`generateTheme()`)

`generateTheme(primary, dark)` creates a theme using ANSI color names instead of hex values. This works in every terminal regardless of color support.

### Inputs

```typescript
type AnsiPrimary = "yellow" | "cyan" | "magenta"
                 | "green" | "red" | "blue" | "white"
```

### Derivation Rules

Given `primary` and `dark`:

```
-- Brand (derived from primary) ------------------------------------------
primary     = primary color name
link        = "blueBright" (always)
control     = primary (consumers render with dimColor for subtlety)

-- Selection (same as primary) -------------------------------------------
selected    = primary
selectedfg  = "black" (always dark on selection bg)

-- Fixed ------------------------------------------------------------------
focusring   = "blueBright" (dark) / "blue" (light)
error       = "redBright" (dark) / "red" (light)
success     = "greenBright" (dark) / "green" (light)
warning     = primary (context disambiguates -- always paired with icon)

-- Text (derived from dark/light) ----------------------------------------
text        = "whiteBright" (dark) / "black" (light)
text2       = "white" (dark) / "blackBright" (light)
text3       = "gray" (both modes)
text4       = "gray" (both modes, consumers add dimColor)

-- Surface (derived from dark/light) -------------------------------------
bg          = "" (terminal default)
surface     = "black" (dark) / "white" (light)
separator   = "gray"
chromebg    = "whiteBright" (dark) / "black" (light)
chromefg    = "black" (dark) / "whiteBright" (light)

-- Palette ----------------------------------------------------------------
[black, red, green, yellow, blue, magenta, cyan, white,
 blackBright, redBright, greenBright, yellowBright,
 blueBright, magentaBright, cyanBright, whiteBright]
```

### Primary Color Presets

Each primary generates a distinct theme:

| Primary | Link | Selected | Warning | Focus Ring (dark) |
|---------|------|----------|---------|------------------|
| yellow | blueBright | yellow | yellow | blueBright |
| cyan | blueBright | cyan | cyan | blueBright |
| magenta | blueBright | magenta | magenta | blueBright |
| green | blueBright | green | green | blueBright |
| red | blueBright | red | red | blueBright |
| blue | blueBright | blue | blue | blueBright |
| white | blueBright | white | white | blueBright |

### ANSI 16 vs Truecolor Key Differences

| Aspect | ANSI 16 | Truecolor |
|--------|---------|-----------|
| Input | Primary color name + dark/light | Full ThemePalette (14 hex colors) |
| Function | `generateTheme()` | `deriveTheme()` |
| Color values | ANSI names (`"yellow"`, `"blueBright"`) | Hex codes (`"#EBCB8B"`) |
| Selection contrast | Same as primary | Contrasting hue (warm/cool pairing) |
| Text hierarchy | 2 distinct + 1 shared (`gray`) | 4 blended levels |
| Control muting | Consumer applies `dimColor` | Blended toward overlay |
| Background | Terminal default (`""`) | Explicit hex from palette |

## Color Utilities

The derivation pipeline uses these utilities from `color.ts`:

| Function | Signature | Purpose |
|----------|-----------|---------|
| `blend(a, b, t)` | `(string, string, number) -> string` | Linear RGB interpolation between two hex colors |
| `brighten(color, amount)` | `(string, number) -> string` | Blend toward `#FFFFFF` |
| `darken(color, amount)` | `(string, number) -> string` | Blend toward `#000000` |
| `contrastFg(bg)` | `(string) -> "#000000" \| "#FFFFFF"` | WCAG-based black/white contrast pick |

All operations work on hex color strings. Non-hex inputs (ANSI color names) pass through unchanged.
