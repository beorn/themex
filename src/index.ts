/**
 * themex — Universal color themes for any platform.
 *
 * Two-layer architecture:
 *   Layer 1: ThemePalette (14 raw colors — what theme authors define)
 *   Layer 2: Theme (19 semantic tokens — what UI apps consume)
 *
 * @example
 * ```typescript
 * import { createTheme, catppuccinMocha, resolveThemeColor } from "themex"
 *
 * const theme = createTheme().preset('catppuccin-mocha').build()
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

// Builder API
export { createTheme, quickTheme, presetTheme } from "./builder.js"

// Active theme state (side-effectful)
export { setActiveTheme, getActiveTheme, pushContextTheme, popContextTheme } from "./state.js"

// Validation
export { validatePalette } from "./validate.js"
export type { ValidationResult } from "./validate.js"

// Base16 import/export
export { importBase16 } from "./import/base16.js"
export { exportBase16 } from "./export/base16.js"
export type { Base16Scheme } from "./import/types.js"

// Terminal detection
export { detectTerminalPalette } from "./detect.js"
export type { DetectedPalette } from "./detect.js"

// Built-in themes (pre-derived)
export {
  ansi16DarkTheme,
  ansi16LightTheme,
  defaultDarkTheme,
  defaultLightTheme,
  builtinThemes,
  getThemeByName,
} from "./palettes/index.js"

// Built-in palettes (45 palettes from 15 theme families)
export {
  builtinPalettes,
  getPaletteByName,
  // Catppuccin
  catppuccinMocha, catppuccinFrappe, catppuccinMacchiato, catppuccinLatte,
  // Classic
  nord, dracula, oneDark,
  solarizedDark, solarizedLight,
  gruvboxDark, gruvboxLight,
  // Tokyo Night
  tokyoNight, tokyoNightStorm, tokyoNightDay,
  // Rose Pine
  rosePine, rosePineMoon, rosePineDawn,
  // Kanagawa
  kanagawaWave, kanagawaDragon, kanagawaLotus,
  // Nature
  everforestDark, everforestLight,
  nightfox, dawnfox,
  // Monokai family
  monokai, monokaiPro, snazzy,
  // Material family
  materialDark, materialLight, palenight,
  // Ayu
  ayuDark, ayuMirage, ayuLight,
  // Modern
  horizon, moonfly, nightfly,
  oxocarbonDark, oxocarbonLight,
  sonokai,
  edgeDark, edgeLight,
  // Accessibility
  modusVivendi, modusOperandi,
} from "./palettes/index.js"
