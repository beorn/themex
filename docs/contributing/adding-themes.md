# Adding Themes

This guide walks through adding a new built-in theme to swatch.

## Step 1: Create the Palette File

Create a new file in `src/palettes/` named after the theme (e.g., `src/palettes/my-theme.ts`):

```typescript
/**
 * My Theme palette — brief description.
 */

import type { ColorPalette } from "../types.js"

/** My Theme — one-line description. */
export const myTheme: ColorPalette = {
  name: "my-theme",
  dark: true,

  // 16 ANSI colors
  black: "#111111",
  red: "#FF5555",
  green: "#50FA7B",
  yellow: "#F1FA8C",
  blue: "#6272A4",
  magenta: "#BD93F9",
  cyan: "#8BE9FD",
  white: "#AAAAAA",
  brightBlack: "#2A2A2A",
  brightRed: "#FFB86C",
  brightGreen: "#69FF94",
  brightYellow: "#FFFFA5",
  brightBlue: "#D6ACFF",
  brightMagenta: "#FF92DF",
  brightCyan: "#A4FFFF",
  brightWhite: "#DDDDDD",

  // 6 special colors
  foreground: "#DDDDDD",
  background: "#1A1A1A",
  cursorColor: "#DDDDDD",
  cursorText: "#1A1A1A",
  selectionBackground: "#555555",
  selectionForeground: "#DDDDDD",
}
```

### Requirements

- **`name`**: Lowercase, hyphenated (e.g., `"my-theme"`, `"my-theme-light"`)
- **`dark`**: Set to `true` for dark themes, `false` for light themes
- **16 ANSI colors**: 8 normal + 8 bright hex colors
- **6 special colors**: foreground, background, cursorColor, cursorText, selectionBackground, selectionForeground
- **All colors must be valid 6-digit hex strings** (e.g., `"#2E3440"`, not `"2E3440"` or `"#2E3"`)

### Theme Variants

If your theme has multiple variants (e.g., dark/light, warm/cool), put them in the same file:

```typescript
export const myThemeDark: ColorPalette = {
  name: "my-theme-dark",
  dark: true,
  // ...
}

export const myThemeLight: ColorPalette = {
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

Map the theme's colors to swatch's 22 fields. Most terminal themes already define these exact fields. For themes with fewer colors, derive bright variants by brightening the normal colors.

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
export const builtinPalettes: Record<string, ColorPalette> = {
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
import { validateColorPalette } from "swatch"
import { myThemeDark } from "./src/palettes/my-theme.js"

const result = validateColorPalette(myThemeDark)
console.log(result)
// { valid: true, errors: [], warnings: [] }
```

The validator checks:

- All 22 color fields are present and non-empty
- `name` and `dark` are set
- Text/background contrast is sufficient (warns on low contrast)

### Derive and Inspect

```typescript
import { deriveTheme } from "swatch"
import { myThemeDark } from "./src/palettes/my-theme.js"

const theme = deriveTheme(myThemeDark)
console.log(theme)
// Inspect that semantic tokens look correct:
// - $primary should be a visible accent on $bg
// - $fg/$mutedfg should form a readable hierarchy
// - $inverse/$inversefg should be inverted from the main content
// - $error/$warning/$success should be distinct and recognizable
```

### Run the Test Suite

```bash
bun vitest run vendor/swatch/tests/
```

The existing tests include validation of all registered palettes. Adding your palette to the registry automatically includes it in the test coverage.

### Visual Inspection

Use the CLI to preview your theme:

```bash
bunx swatch show my-theme-dark
```

Or use the interactive viewer:

```bash
bunx swatch view
```

## Step 4: Base16 Round-Trip (Optional)

If your theme originated from a Base16 scheme, verify round-trip fidelity:

```typescript
import { importBase16, exportBase16, deriveTheme } from "swatch"

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
- [ ] All 22 color fields use valid 6-digit hex strings
- [ ] `name` is lowercase, hyphenated, matches the registry key
- [ ] `dark` is set correctly
- [ ] Exported from `src/palettes/index.ts` (both re-export and registry)
- [ ] `validateColorPalette()` returns `{ valid: true }`
- [ ] `deriveTheme()` produces visually correct tokens
- [ ] All tests pass
- [ ] Visual inspection confirms the theme looks right
