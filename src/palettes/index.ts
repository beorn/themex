/**
 * Built-in themes and palette registry.
 *
 * Exports:
 * - Pre-derived Theme objects (ansi16Dark, ansi16Light, defaultDark, defaultLight)
 * - ColorPalette definitions from popular theme systems (45 palettes)
 * - Registry functions (getThemeByName, getPaletteByName)
 */

import { deriveTheme } from "../derive.js"
import type { Theme, ColorPalette } from "../types.js"

// ── Re-export all palette definitions ──────────────────────────────
export { catppuccinMocha, catppuccinFrappe, catppuccinMacchiato, catppuccinLatte } from "./catppuccin.js"
export { nord } from "./nord.js"
export { dracula } from "./dracula.js"
export { solarizedDark, solarizedLight } from "./solarized.js"
export { tokyoNight, tokyoNightStorm, tokyoNightDay } from "./tokyo-night.js"
export { oneDark } from "./one-dark.js"
export { gruvboxDark, gruvboxLight } from "./gruvbox.js"
export { rosePine, rosePineMoon, rosePineDawn } from "./rose-pine.js"
export { kanagawaWave, kanagawaDragon, kanagawaLotus } from "./kanagawa.js"
export { everforestDark, everforestLight } from "./everforest.js"
export { monokai, monokaiPro } from "./monokai.js"
export { snazzy } from "./snazzy.js"
export { materialDark, materialLight } from "./material.js"
export { palenight } from "./palenight.js"
export { ayuDark, ayuMirage, ayuLight } from "./ayu.js"
export { nightfox, dawnfox } from "./nightfox.js"
export { horizon } from "./horizon.js"
export { moonfly } from "./moonfly.js"
export { nightfly } from "./nightfly.js"
export { oxocarbonDark, oxocarbonLight } from "./oxocarbon.js"
export { sonokai } from "./sonokai.js"
export { edgeDark, edgeLight } from "./edge.js"
export { modusVivendi, modusOperandi } from "./modus.js"

// ── Import for registry ────────────────────────────────────────────
import { catppuccinMocha, catppuccinFrappe, catppuccinMacchiato, catppuccinLatte } from "./catppuccin.js"
import { nord } from "./nord.js"
import { dracula } from "./dracula.js"
import { solarizedDark, solarizedLight } from "./solarized.js"
import { tokyoNight, tokyoNightStorm, tokyoNightDay } from "./tokyo-night.js"
import { oneDark } from "./one-dark.js"
import { gruvboxDark, gruvboxLight } from "./gruvbox.js"
import { rosePine, rosePineMoon, rosePineDawn } from "./rose-pine.js"
import { kanagawaWave, kanagawaDragon, kanagawaLotus } from "./kanagawa.js"
import { everforestDark, everforestLight } from "./everforest.js"
import { monokai, monokaiPro } from "./monokai.js"
import { snazzy } from "./snazzy.js"
import { materialDark, materialLight } from "./material.js"
import { palenight } from "./palenight.js"
import { ayuDark, ayuMirage, ayuLight } from "./ayu.js"
import { nightfox, dawnfox } from "./nightfox.js"
import { horizon } from "./horizon.js"
import { moonfly } from "./moonfly.js"
import { nightfly } from "./nightfly.js"
import { oxocarbonDark, oxocarbonLight } from "./oxocarbon.js"
import { sonokai } from "./sonokai.js"
import { edgeDark, edgeLight } from "./edge.js"
import { modusVivendi, modusOperandi } from "./modus.js"

// ============================================================================
// ANSI 16 Themes (no palette required — hardcoded for any terminal)
// ============================================================================

/** Dark ANSI 16 theme — works on any terminal. Primary = yellow. */
export const ansi16DarkTheme: Theme = {
  name: "dark-ansi16",
  bg: "",
  fg: "whiteBright",
  surface: "black",
  surfacefg: "whiteBright",
  popover: "black",
  popoverfg: "whiteBright",
  muted: "black",
  mutedfg: "white",
  primary: "yellow",
  primaryfg: "black",
  secondary: "yellow",
  secondaryfg: "black",
  accent: "yellow",
  accentfg: "black",
  error: "redBright",
  errorfg: "black",
  warning: "yellow",
  warningfg: "black",
  success: "greenBright",
  successfg: "black",
  info: "cyanBright",
  infofg: "black",
  selection: "yellow",
  selectionfg: "black",
  inverse: "whiteBright",
  inversefg: "black",
  cursor: "yellow",
  cursorfg: "black",
  border: "gray",
  inputborder: "gray",
  focusborder: "blueBright",
  link: "blueBright",
  disabledfg: "gray",
  palette: [
    "black",
    "red",
    "green",
    "yellow",
    "blue",
    "magenta",
    "cyan",
    "white",
    "blackBright",
    "redBright",
    "greenBright",
    "yellowBright",
    "blueBright",
    "magentaBright",
    "cyanBright",
    "whiteBright",
  ],
}

/** Light ANSI 16 theme — works on any terminal. Primary = blue. */
export const ansi16LightTheme: Theme = {
  name: "light-ansi16",
  bg: "",
  fg: "black",
  surface: "white",
  surfacefg: "black",
  popover: "white",
  popoverfg: "black",
  muted: "white",
  mutedfg: "blackBright",
  primary: "blue",
  primaryfg: "black",
  secondary: "blue",
  secondaryfg: "black",
  accent: "cyan",
  accentfg: "black",
  error: "red",
  errorfg: "black",
  warning: "yellow",
  warningfg: "black",
  success: "green",
  successfg: "black",
  info: "cyan",
  infofg: "black",
  selection: "cyan",
  selectionfg: "black",
  inverse: "black",
  inversefg: "whiteBright",
  cursor: "blue",
  cursorfg: "black",
  border: "gray",
  inputborder: "gray",
  focusborder: "blue",
  link: "blueBright",
  disabledfg: "gray",
  palette: [
    "black",
    "red",
    "green",
    "yellow",
    "blue",
    "magenta",
    "cyan",
    "white",
    "blackBright",
    "redBright",
    "greenBright",
    "yellowBright",
    "blueBright",
    "magentaBright",
    "cyanBright",
    "whiteBright",
  ],
}

// ============================================================================
// Default Truecolor Themes (derived from Nord palette)
// ============================================================================

/** Dark truecolor theme — derived from Nord. */
export const defaultDarkTheme: Theme = deriveTheme(nord)

/** Light truecolor theme — derived from Catppuccin Latte. */
export const defaultLightTheme: Theme = deriveTheme(catppuccinLatte)

// ============================================================================
// Registry
// ============================================================================

/** All built-in ColorPalette definitions (45 palettes). */
export const builtinPalettes: Record<string, ColorPalette> = {
  // Catppuccin
  "catppuccin-mocha": catppuccinMocha,
  "catppuccin-frappe": catppuccinFrappe,
  "catppuccin-macchiato": catppuccinMacchiato,
  "catppuccin-latte": catppuccinLatte,
  // Nord
  nord: nord,
  // Dracula
  dracula: dracula,
  // Solarized
  "solarized-dark": solarizedDark,
  "solarized-light": solarizedLight,
  // Tokyo Night
  "tokyo-night": tokyoNight,
  "tokyo-night-storm": tokyoNightStorm,
  "tokyo-night-day": tokyoNightDay,
  // One Dark
  "one-dark": oneDark,
  // Gruvbox
  "gruvbox-dark": gruvboxDark,
  "gruvbox-light": gruvboxLight,
  // Rose Pine
  "rose-pine": rosePine,
  "rose-pine-moon": rosePineMoon,
  "rose-pine-dawn": rosePineDawn,
  // Kanagawa
  "kanagawa-wave": kanagawaWave,
  "kanagawa-dragon": kanagawaDragon,
  "kanagawa-lotus": kanagawaLotus,
  // Everforest
  "everforest-dark": everforestDark,
  "everforest-light": everforestLight,
  // Monokai
  monokai: monokai,
  "monokai-pro": monokaiPro,
  // Snazzy
  snazzy: snazzy,
  // Material
  "material-dark": materialDark,
  "material-light": materialLight,
  // Palenight
  palenight: palenight,
  // Ayu
  "ayu-dark": ayuDark,
  "ayu-mirage": ayuMirage,
  "ayu-light": ayuLight,
  // Nightfox
  nightfox: nightfox,
  dawnfox: dawnfox,
  // Horizon
  horizon: horizon,
  // Moonfly
  moonfly: moonfly,
  // Nightfly
  nightfly: nightfly,
  // Oxocarbon
  "oxocarbon-dark": oxocarbonDark,
  "oxocarbon-light": oxocarbonLight,
  // Sonokai
  sonokai: sonokai,
  // Edge
  "edge-dark": edgeDark,
  "edge-light": edgeLight,
  // Modus
  "modus-vivendi": modusVivendi,
  "modus-operandi": modusOperandi,
}

/** All built-in themes, indexed by name (includes backward-compat aliases). */
export const builtinThemes: Record<string, Theme> = {
  // ANSI 16
  "dark-ansi16": ansi16DarkTheme,
  "light-ansi16": ansi16LightTheme,
  // Truecolor defaults
  "dark-truecolor": defaultDarkTheme,
  "light-truecolor": defaultLightTheme,
  // Old names as aliases
  dark: defaultDarkTheme,
  light: defaultLightTheme,
  "ansi16-dark": ansi16DarkTheme,
  "ansi16-light": ansi16LightTheme,
}

/** Resolve a theme by name. Defaults to dark-ansi16. */
export function getThemeByName(name?: string): Theme {
  if (!name) return ansi16DarkTheme
  // Check pre-built themes first
  const builtin = builtinThemes[name]
  if (builtin) return builtin
  // Check palettes (derive on first access)
  const palette = builtinPalettes[name]
  if (palette) return deriveTheme(palette)
  return ansi16DarkTheme
}

/** Resolve a palette by name. Returns undefined if not found. */
export function getPaletteByName(name: string): ColorPalette | undefined {
  return builtinPalettes[name]
}
