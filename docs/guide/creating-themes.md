# Creating Themes

## The Two-Layer System

themex uses a two-layer architecture:

1. **ThemePalette** (Layer 1) -- 14 raw colors that you define
2. **Theme** (Layer 2) -- 19 semantic tokens derived via `deriveTheme()`

All theme creation flows through this pipeline: **Input -> ThemePalette -> `deriveTheme()` -> Theme**.

## Defining a ThemePalette

A `ThemePalette` has 14 colors organized into two groups:

### Surface Ramp (6 colors)

Ordered by depth, from deepest background to most prominent text:

| Field     | Purpose                                 |
| --------- | --------------------------------------- |
| `crust`   | Deepest background -- behind everything |
| `base`    | Primary background                      |
| `surface` | Raised surfaces -- cards, dialogs       |
| `overlay` | Borders, dividers, subtle chrome        |
| `subtext` | Muted/secondary text                    |
| `text`    | Primary text                            |

### Accent Hues (8 colors)

Standard hue names used across all theme systems:

| Field    | Purpose                      |
| -------- | ---------------------------- |
| `red`    | Error, destructive actions   |
| `orange` | Warning, caution             |
| `yellow` | Primary accent (dark themes) |
| `green`  | Success, positive            |
| `teal`   | Cool accent                  |
| `blue`   | Links, focus (accessibility) |
| `purple` | Decorative, tags             |
| `pink`   | Decorative, warm accent      |

### Full Example

```typescript
import type { ThemePalette } from "themex"
import { deriveTheme } from "themex"

const myPalette: ThemePalette = {
  name: "my-theme",
  dark: true,

  // Surface ramp
  crust: "#11111B",
  base: "#1E1E2E",
  surface: "#313244",
  overlay: "#6C7086",
  subtext: "#A6ADC8",
  text: "#CDD6F4",

  // Accent hues
  red: "#F38BA8",
  orange: "#FAB387",
  yellow: "#F9E2AF",
  green: "#A6E3A1",
  teal: "#94E2D5",
  blue: "#89B4FA",
  purple: "#CBA6F7",
  pink: "#F5C2E7",
}

const theme = deriveTheme(myPalette)
```

## Using the Builder API

The builder lets you create themes from minimal input. It fills in missing values automatically.

### From Just a Background Color

```typescript
import { createTheme } from "themex"

const theme = createTheme().bg("#2E3440").build()
```

The builder:

1. Detects dark/light from background luminance
2. Generates the full surface ramp (crust, surface, overlay, subtext, text)
3. Uses Nord-inspired default accents
4. Derives all 19 semantic tokens

### From Background + Primary

```typescript
const theme = createTheme().bg("#2E3440").primary("#EBCB8B").build()
```

The builder additionally:

1. Assigns the primary color to its natural hue slot (yellow in this case)
2. Generates all 8 accent hues by rotating around the hue wheel, preserving the primary color's saturation and lightness

### From Three Colors

```typescript
const theme = createTheme().bg("#2E3440").fg("#ECEFF4").primary("#EBCB8B").build()
```

### Preset with Override

```typescript
const theme = createTheme()
  .preset("nord")
  .primary("#A3BE8C") // change primary to green
  .build()
```

### Individual Color Overrides

```typescript
const theme = createTheme().preset("catppuccin-mocha").color("red", "#FF0000").color("surface", "#222244").build()
```

### Explicit Dark/Light Mode

```typescript
const darkTheme = createTheme().primary("#EBCB8B").dark().build()

const lightTheme = createTheme().primary("#1976D2").light().build()
```

## Choosing an Accent

By default, `deriveTheme()` uses **yellow** as the primary accent for dark themes and **blue** for light themes. Override with the `accent` option:

```typescript
const theme = deriveTheme(myPalette, { accent: "teal" })
```

The accent choice also affects selection colors. Warm accents (red, orange, yellow, green, pink, purple) pair with teal for selection. Cool accents (teal, blue) pair with yellow.

## Validating Palettes

Check that a palette has all required fields and reasonable contrast:

```typescript
import { validatePalette } from "themex"

const result = validatePalette(myPalette)

if (!result.valid) {
  console.error("Errors:", result.errors)
}
if (result.warnings.length > 0) {
  console.warn("Warnings:", result.warnings)
}
```

The validator checks:

- All 14 color fields are present and non-empty
- `name` and `dark` are set
- Text/background contrast is sufficient (warns on low contrast)

## Global Theme State

For render pipelines where React context is not accessible, themex provides optional global state:

```typescript
import { setActiveTheme, getActiveTheme } from "themex"

// Set during render setup
setActiveTheme(theme)

// Read during rendering
const current = getActiveTheme()
```

For per-subtree overrides (like CSS custom properties cascading):

```typescript
import { pushContextTheme, popContextTheme } from "themex"

pushContextTheme(dialogTheme) // children see dialogTheme
// ... render children ...
popContextTheme() // restore parent theme
```

::: tip
Global state is optional. For most applications, pass `Theme` objects explicitly to `resolveThemeColor()`.
:::
