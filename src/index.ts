/**
 * themex — Universal color themes for any platform.
 *
 * Two-layer architecture:
 *   Layer 1: ThemePalette (14 raw colors — what theme authors define)
 *   Layer 2: Theme (19 semantic tokens — what UI apps consume)
 *
 * @example
 * ```typescript
 * import { deriveTheme, catppuccinMocha, resolveThemeColor } from "themex"
 *
 * const theme = deriveTheme(catppuccinMocha)
 * const color = resolveThemeColor("$primary", theme) // → "#F9E2AF"
 * ```
 *
 * @packageDocumentation
 */

// Core types
export type { Theme, ThemePalette, HueName, AnsiPrimary, ThemeOptions } from "./types.js"

// Derivation
export { deriveTheme, isWarm } from "./derive.js"

// Color utilities
export { blend, brighten, darken, contrastFg, hexToRgb, rgbToHex } from "./color.js"

// Token resolution
export { resolveThemeColor } from "./resolve.js"

// ANSI 16 theme generation
export { generateTheme } from "./generate.js"

// Active theme state (side-effectful)
export { setActiveTheme, getActiveTheme, pushContextTheme, popContextTheme } from "./state.js"

// Validation
export { validatePalette } from "./validate.js"
export type { ValidationResult } from "./validate.js"

// Built-in themes (pre-derived)
export {
  ansi16DarkTheme,
  ansi16LightTheme,
  defaultDarkTheme,
  defaultLightTheme,
  builtinThemes,
  getThemeByName,
} from "./palettes/index.js"

// Built-in palettes
export {
  builtinPalettes,
  getPaletteByName,
  catppuccinMocha,
  catppuccinFrappe,
  catppuccinMacchiato,
  catppuccinLatte,
  nord,
  dracula,
  solarizedDark,
  solarizedLight,
  tokyoNight,
  tokyoNightStorm,
  tokyoNightDay,
  oneDark,
  gruvboxDark,
  gruvboxLight,
  rosePine,
  rosePineMoon,
  rosePineDawn,
} from "./palettes/index.js"
