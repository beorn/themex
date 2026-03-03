# ThemePalette

The `ThemePalette` interface defines the 14 raw colors that theme authors provide. It is the universal input format for all theme creation in themex.

## Architecture: Three Layers

```
Layer 1: ThemePalette (theme author provides -- 14 colors)
  Surface ramp: crust, base, surface, overlay, subtext, text
  Accent hues:  red, orange, yellow, green, teal, blue, purple, pink

        |
        |  deriveTheme()
        v

Layer 2: Theme (app uses -- 19 semantic tokens + 16-color palette)
  Brand:     $primary, $link, $control
  Selection: $selected, $selectedfg, $focusring
  Text:      $text, $text2, $text3, $text4
  Surface:   $bg, $surface, $separator, $chromebg, $chromefg
  Status:    $error, $warning, $success
  Palette:   $color0 -- $color15

        |
        |  Platform binding (automatic)
        v

Layer 3: Platform output
  Terminal:  resolveThemeColor() -> ANSI name or hex
  Web:       Theme -> CSS custom properties (--theme-primary, --theme-text, ...)
  Native:    Theme -> UIColor / SwiftUI Color / Compose Color
```

Theme authors only work with Layer 1. UI developers only work with Layer 2. The platform binding (Layer 3) is a thin adapter specific to each rendering target.

## Interface

```typescript
interface ThemePalette {
  name: string
  dark: boolean

  // Surface ramp (6 colors, ordered by depth)
  crust: string    // Deepest background
  base: string     // Primary background
  surface: string  // Raised surfaces (cards, dialogs)
  overlay: string  // Borders, dividers, subtle chrome
  subtext: string  // Muted/secondary text
  text: string     // Primary text

  // Accent hues (8 colors)
  red: string      // Error, destructive actions
  orange: string   // Warning, caution
  yellow: string   // Primary accent (dark themes)
  green: string    // Success, positive
  teal: string     // Cool accent
  blue: string     // Links, focus (accessibility)
  purple: string   // Decorative, tags
  pink: string     // Decorative, warm accent
}
```

## Fields

### Metadata

| Field  | Type      | Description                             |
|--------|-----------|-----------------------------------------|
| `name` | `string`  | Human-readable theme name               |
| `dark` | `boolean` | Whether this is a dark theme            |

### Surface Ramp

The surface ramp defines 6 stops from the deepest background to the most prominent text. In a dark theme, these go from near-black to near-white. In a light theme, from near-white to near-black.

| Field     | Description                                 | Dark Example    | Light Example   |
|-----------|---------------------------------------------|-----------------|-----------------|
| `crust`   | Deepest background (status bars, gutters)   | `#11111B`       | `#DCE0E8`       |
| `base`    | Primary background                          | `#1E1E2E`       | `#EFF1F5`       |
| `surface` | Raised surfaces (cards, dialogs, popovers)  | `#313244`       | `#CCD0DA`       |
| `overlay` | Borders, dividers, subtle chrome            | `#6C7086`       | `#9CA0B0`       |
| `subtext` | Muted/secondary text                        | `#A6ADC8`       | `#6C6F85`       |
| `text`    | Primary text (headings, body)               | `#CDD6F4`       | `#4C4F69`       |

### Accent Hues

Eight universal hue names that appear in every major theme system:

| Field    | Semantic Role              | Example (Catppuccin Mocha) |
|----------|----------------------------|----------------------------|
| `red`    | Error, destructive actions | `#F38BA8`                  |
| `orange` | Warning, caution           | `#FAB387`                  |
| `yellow` | Primary accent, attention  | `#F9E2AF`                  |
| `green`  | Success, positive          | `#A6E3A1`                  |
| `teal`   | Cool accent                | `#94E2D5`                  |
| `blue`   | Links, focus               | `#89B4FA`                  |
| `purple` | Decorative, tags           | `#CBA6F7`                  |
| `pink`   | Decorative, warm accent    | `#F5C2E7`                  |

## Related Types

### HueName

```typescript
type HueName = "red" | "orange" | "yellow" | "green"
             | "teal" | "blue" | "purple" | "pink"
```

The 8 accent hue names, used as keys for palette colors and as options for the `accent` parameter in `deriveTheme()`.

### ThemeOptions

```typescript
interface ThemeOptions {
  accent?: HueName
}
```

Options for `deriveTheme()`. The `accent` field selects which hue becomes the primary accent (default: `"yellow"` for dark, `"blue"` for light).

### AnsiPrimary

```typescript
type AnsiPrimary = "yellow" | "cyan" | "magenta"
                 | "green" | "red" | "blue" | "white"
```

Primary color options for `generateTheme()`, which creates ANSI 16 themes using color names instead of hex values.

## Usage

```typescript
import { deriveTheme } from "themex"
import type { ThemePalette } from "themex"

const palette: ThemePalette = {
  name: "my-custom-theme",
  dark: true,
  crust: "#1A1B26", base: "#24283B", surface: "#292E42",
  overlay: "#545C7E", subtext: "#A9B1D6", text: "#C0CAF5",
  red: "#F7768E", orange: "#FF9E64", yellow: "#E0AF68",
  green: "#9ECE6A", teal: "#73DACA", blue: "#7AA2F7",
  purple: "#BB9AF7", pink: "#FF007C",
}

const theme = deriveTheme(palette)
```

## How Popular Themes Map to ThemePalette

Every major theme can be expressed as a ThemePalette. Here is how their raw color values map to themex's 14 fields:

### Surface Ramp

```
                    crust    base     surface  overlay  subtext  text
Catppuccin Mocha    #11111B  #1E1E2E  #313244  #6C7086  #A6ADC8  #CDD6F4
Nord                #242933  #2E3440  #3B4252  #4C566A  #D8DEE9  #ECEFF4
Dracula             #21222C  #282A36  #44475A  #6272A4  #6272A4  #F8F8F2
Solarized Dark      #002B36  #073642  #586E75  #657B83  #839496  #FDF6E3
Tokyo Night         #1A1B26  #24283B  #292E42  #545C7E  #A9B1D6  #C0CAF5
One Dark            #21252B  #282C34  #2C313A  #5C6370  #ABB2BF  #ABB2BF
```

### Accent Hues

```
                    red      orange   yellow   green    teal     blue     purple   pink
Catppuccin Mocha    #F38BA8  #FAB387  #F9E2AF  #A6E3A1  #94E2D5  #89B4FA  #CBA6F7  #F5C2E7
Nord                #BF616A  #D08770  #EBCB8B  #A3BE8C  #8FBCBB  #5E81AC  #B48EAD  #B48EAD
Dracula             #FF5555  #FFB86C  #F1FA8C  #50FA7B  #8BE9FD  #BD93F9  #BD93F9  #FF79C6
Solarized           #DC322F  #CB4B16  #B58900  #859900  #2AA198  #268BD2  #6C71C4  #D33682
```

This demonstrates that themex's 14-field structure is universal -- every theme's color values can be mapped directly, preserving the theme author's hand-tuned choices.

## Validation

Use `validatePalette()` to check a palette before deriving:

```typescript
import { validatePalette } from "themex"

const result = validatePalette(palette)
// { valid: boolean, errors: string[], warnings: string[] }
```
