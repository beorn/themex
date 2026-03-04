/**
 * themex — Universal color themes for any platform.
 *
 * Two-layer architecture:
 *   Layer 1: ColorPalette (22 terminal colors — universal pivot format)
 *   Layer 2: Theme (33 semantic tokens — what UI apps consume)
 *
 * Pipeline: Palette generators → ColorPalette → deriveTheme() → Theme
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
export type { Theme, ColorPalette, HueName, AnsiPrimary, AnsiColorName } from "./types.js"
export { COLOR_PALETTE_FIELDS } from "./types.js"

// Derivation
export { deriveTheme } from "./derive.js"

// Color utilities
export {
  blend,
  brighten,
  darken,
  contrastFg,
  desaturate,
  complement,
  hexToRgb,
  rgbToHex,
  hexToHsl,
  hslToHex,
  rgbToHsl,
} from "./color.js"
export type { HSL } from "./color.js"

// Token resolution
export { resolveThemeColor } from "./resolve.js"

// ANSI 16 theme generation
export { generateTheme } from "./generate.js"

// Builder API
export { createTheme, quickTheme, presetTheme } from "./builder.js"

// Palette generators
export { fromBase16, fromColors, fromPreset } from "./generators.js"

// Active theme state (side-effectful)
export { setActiveTheme, getActiveTheme, pushContextTheme, popContextTheme } from "./state.js"

// Validation
export { validateColorPalette } from "./validate.js"
export type { ValidationResult } from "./validate.js"
export { validateTheme, THEME_TOKEN_KEYS } from "./validate-theme.js"
export type { ThemeValidationResult } from "./validate-theme.js"

// Contrast checking
export { checkContrast } from "./contrast.js"
export type { ContrastResult } from "./contrast.js"

// Token aliasing
export { resolveAliases, resolveTokenAlias } from "./alias.js"

// CSS variables export
export { themeToCSSVars } from "./css.js"

// Auto-generate themes from a single color
export { autoGenerateTheme } from "./auto-generate.js"

// Base16 import/export
export { importBase16 } from "./import/base16.js"
export { exportBase16 } from "./export/base16.js"
export type { Base16Scheme } from "./import/types.js"

// Terminal detection
export { detectTerminalPalette, detectTheme } from "./detect.js"
export type { DetectedPalette, DetectThemeOptions } from "./detect.js"

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
  catppuccinMocha,
  catppuccinFrappe,
  catppuccinMacchiato,
  catppuccinLatte,
  // Classic
  nord,
  dracula,
  oneDark,
  solarizedDark,
  solarizedLight,
  gruvboxDark,
  gruvboxLight,
  // Tokyo Night
  tokyoNight,
  tokyoNightStorm,
  tokyoNightDay,
  // Rose Pine
  rosePine,
  rosePineMoon,
  rosePineDawn,
  // Kanagawa
  kanagawaWave,
  kanagawaDragon,
  kanagawaLotus,
  // Nature
  everforestDark,
  everforestLight,
  nightfox,
  dawnfox,
  // Monokai family
  monokai,
  monokaiPro,
  snazzy,
  // Material family
  materialDark,
  materialLight,
  palenight,
  // Ayu
  ayuDark,
  ayuMirage,
  ayuLight,
  // Modern
  horizon,
  moonfly,
  nightfly,
  oxocarbonDark,
  oxocarbonLight,
  sonokai,
  edgeDark,
  edgeLight,
  // Accessibility
  modusVivendi,
  modusOperandi,
} from "./palettes/index.js"
