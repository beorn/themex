# Adding Themes

This guide walks through adding a new built-in theme to themex.

## Step 1: Create the Palette File

Create a new file in `src/palettes/` named after the theme (e.g., `src/palettes/my-theme.ts`):

```typescript
/**
 * My Theme palette — brief description.
 */

import type { ThemePalette } from "../types.js"

/** My Theme — one-line description. */
export const myTheme: ThemePalette = {
  name: "my-theme",
  dark: true,

  // Surface ramp (ordered by depth: deepest -> most prominent)
  crust: "#111111", // Deepest background (status bars, gutters)
  base: "#1A1A1A", // Primary background
  surface: "#2A2A2A", // Raised surfaces (cards, dialogs)
  overlay: "#555555", // Borders, dividers, subtle chrome
  subtext: "#AAAAAA", // Muted/secondary text
  text: "#DDDDDD", // Primary text

  // Accent hues (8 universal hue names)
  red: "#FF5555",
  orange: "#FFB86C",
  yellow: "#F1FA8C",
  green: "#50FA7B",
  teal: "#8BE9FD",
  blue: "#6272A4",
  purple: "#BD93F9",
  pink: "#FF79C6",
}
```

### Requirements

- **`name`**: Lowercase, hyphenated (e.g., `"my-theme"`, `"my-theme-light"`)
- **`dark`**: Set to `true` for dark themes, `false` for light themes
- **Surface ramp**: 6 hex colors ordered from deepest to brightest (dark themes) or brightest to deepest (light themes)
- **Accent hues**: 8 hex colors. Use the theme's actual hand-tuned colors -- do not generate via hue rotation
- **All colors must be valid 6-digit hex strings** (e.g., `"#2E3440"`, not `"2E3440"` or `"#2E3"`)

### Theme Variants

If your theme has multiple variants (e.g., dark/light, warm/cool), put them in the same file:

```typescript
export const myThemeDark: ThemePalette = {
  name: "my-theme-dark",
  dark: true,
  // ...
}

export const myThemeLight: ThemePalette = {
  name: "my-theme-light",
  dark: false,
  // ...
}
```

### Color Sources

When porting an existing theme, find the canonical color values from the theme's official source:

- **Catppuccin**: https://github.com/catppuccin/catppuccin -- `palette.json`
- **Nord**: https://www.nordtheme.com/docs/colors-and-palettes
- **Dracula**: https://draculatheme.com/contribute -- `dracula.yml`
- **Base16 schemes**: https://github.com/tinted-theming/schemes -- YAML files

Map the theme's colors to themex's 14 fields. If the theme has more than 6 neutral stops, pick the 6 most representative. If it has fewer than 8 accent hues, reuse the closest available hue (e.g., Nord uses the same color for `purple` and `pink`).

## Step 2: Register in the Palette Index

Edit `src/palettes/index.ts`:

1. Add the export statement in the re-export section:

```typescript
export { myThemeDark, myThemeLight } from "./my-theme.js"
```

2. Add the import in the registry import section:

```typescript
import { myThemeDark, myThemeLight } from "./my-theme.js"
```

3. Add entries to the `builtinPalettes` registry:

```typescript
export const builtinPalettes: Record<string, ThemePalette> = {
  // ... existing entries ...
  // My Theme
  "my-theme-dark": myThemeDark,
  "my-theme-light": myThemeLight,
}
```

The registry key must match the palette's `name` field exactly.

## Step 3: Validate and Test

### Run Validation

```typescript
import { validatePalette } from "themex"
import { myThemeDark } from "./src/palettes/my-theme.js"

const result = validatePalette(myThemeDark)
console.log(result)
// { valid: true, errors: [], warnings: [] }
```

The validator checks:

- All 14 color fields are present and non-empty
- `name` and `dark` are set
- Text/background contrast is sufficient (warns on low contrast)

### Derive and Inspect

```typescript
import { deriveTheme } from "themex"
import { myThemeDark } from "./src/palettes/my-theme.js"

const theme = deriveTheme(myThemeDark)
console.log(theme)
// Inspect that semantic tokens look correct:
// - primary should be a visible accent on the bg
// - text/text2/text3/text4 should form a readable hierarchy
// - chromebg/chromefg should be inverted from the main content
// - error/warning/success should be distinct and recognizable
```

### Run the Test Suite

```bash
bun vitest run vendor/beorn-themex/tests/
```

The existing tests include validation of all registered palettes. Adding your palette to the registry automatically includes it in the test coverage.

### Visual Inspection

Use the CLI to preview your theme:

```bash
bunx themex show my-theme-dark
```

Or use the interactive viewer:

```bash
bunx themex view
```

## Step 4: Base16 Round-Trip (Optional)

If your theme originated from a Base16 scheme, verify round-trip fidelity:

```typescript
import { importBase16, exportBase16, deriveTheme } from "themex"

// Import from Base16
const palette = importBase16(yamlString)
const theme = deriveTheme(palette)

// Export back to Base16
const exported = exportBase16(palette)

// The 13 directly-mapped fields should match the original
```

## Checklist

Before submitting a new theme:

- [ ] Palette file created in `src/palettes/` with proper TypeScript types
- [ ] All 14 color fields use valid 6-digit hex strings
- [ ] `name` is lowercase, hyphenated, matches the registry key
- [ ] `dark` is set correctly
- [ ] Exported from `src/palettes/index.ts` (both re-export and registry)
- [ ] `validatePalette()` returns `{ valid: true }`
- [ ] `deriveTheme()` produces visually correct tokens
- [ ] All tests pass
- [ ] Visual inspection confirms the theme looks right
