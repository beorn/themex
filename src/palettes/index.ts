/**
 * Built-in themes and palette registry.
 *
 * Exports:
 * - Pre-derived Theme objects (ansi16Dark, ansi16Light, defaultDark, defaultLight)
 * - ThemePalette definitions from popular theme systems
 * - Registry functions (getThemeByName, getPaletteByName)
 */

import { deriveTheme } from "../derive.js"
import type { Theme, ThemePalette } from "../types.js"

// ── Re-export all palette definitions ──────────────────────────────
export { catppuccinMocha, catppuccinFrappe, catppuccinMacchiato, catppuccinLatte } from "./catppuccin.js"
export { nord } from "./nord.js"
export { dracula } from "./dracula.js"
export { solarizedDark, solarizedLight } from "./solarized.js"
export { tokyoNight, tokyoNightStorm, tokyoNightDay } from "./tokyo-night.js"
export { oneDark } from "./one-dark.js"
export { gruvboxDark, gruvboxLight } from "./gruvbox.js"
export { rosePine, rosePineMoon, rosePineDawn } from "./rose-pine.js"

// ── Import for registry ────────────────────────────────────────────
import { catppuccinMocha, catppuccinFrappe, catppuccinMacchiato, catppuccinLatte } from "./catppuccin.js"
import { nord } from "./nord.js"
import { dracula } from "./dracula.js"
import { solarizedDark, solarizedLight } from "./solarized.js"
import { tokyoNight, tokyoNightStorm, tokyoNightDay } from "./tokyo-night.js"
import { oneDark } from "./one-dark.js"
import { gruvboxDark, gruvboxLight } from "./gruvbox.js"
import { rosePine, rosePineMoon, rosePineDawn } from "./rose-pine.js"

// ============================================================================
// ANSI 16 Themes (no palette required — hardcoded for any terminal)
// ============================================================================

const ansi16Palette: string[] = [
  "black", "red", "green", "yellow",
  "blue", "magenta", "cyan", "white",
  "blackBright", "redBright", "greenBright", "yellowBright",
  "blueBright", "magentaBright", "cyanBright", "whiteBright",
]

/** Dark ANSI 16 theme — works on any terminal. Primary = yellow. */
export const ansi16DarkTheme: Theme = {
  name: "dark-ansi16",
  dark: true,
  primary: "yellow",
  link: "blueBright",
  control: "yellow",
  selected: "yellow",
  selectedfg: "black",
  focusring: "blueBright",
  text: "whiteBright",
  text2: "white",
  text3: "gray",
  text4: "gray",
  bg: "",
  raisedbg: "black",
  separator: "gray",
  chromebg: "whiteBright",
  chromefg: "black",
  error: "redBright",
  warning: "yellow",
  success: "greenBright",
  palette: ansi16Palette,
}

/** Light ANSI 16 theme — works on any terminal. Primary = blue. */
export const ansi16LightTheme: Theme = {
  name: "light-ansi16",
  dark: false,
  primary: "blue",
  link: "blueBright",
  control: "blue",
  selected: "cyan",
  selectedfg: "black",
  focusring: "blue",
  text: "black",
  text2: "blackBright",
  text3: "gray",
  text4: "gray",
  bg: "",
  raisedbg: "white",
  separator: "gray",
  chromebg: "black",
  chromefg: "whiteBright",
  error: "red",
  warning: "yellow",
  success: "green",
  palette: ansi16Palette,
}

// ============================================================================
// Default Truecolor Themes (derived from Nord palette)
// ============================================================================

/** Dark truecolor theme — Nord-inspired. */
export const defaultDarkTheme: Theme = {
  name: "dark-truecolor",
  dark: true,
  primary: "#EBCB8B",
  link: "#ECCC90",
  control: "#B8A06E",
  selected: "#88C0D0",
  selectedfg: "#2E3440",
  focusring: "#5E81AC",
  text: "#ECEFF4",
  text2: "#D8DEE9",
  text3: "#7B88A1",
  text4: "#545E72",
  bg: "#2E3440",
  raisedbg: "#303642",
  separator: "#4C566A",
  chromebg: "#ECEFF4",
  chromefg: "#2E3440",
  error: "#BF616A",
  warning: "#EBCB8B",
  success: "#A3BE8C",
  palette: [
    "#2E3440", "#BF616A", "#A3BE8C", "#EBCB8B",
    "#5E81AC", "#B48EAD", "#88C0D0", "#E5E9F0",
    "#4C566A", "#D08770", "#8FBCBB", "#D8DEE9",
    "#81A1C1", "#B48EAD", "#8FBCBB", "#ECEFF4",
  ],
}

/** Light truecolor theme — clean, airy. */
export const defaultLightTheme: Theme = {
  name: "light-truecolor",
  dark: false,
  primary: "#0056B3",
  link: "#0066CC",
  control: "#3380CC",
  selected: "#B8D4E8",
  selectedfg: "#1A1A1A",
  focusring: "#0066CC",
  text: "#1A1A1A",
  text2: "#4A4A4A",
  text3: "#8A8A8A",
  text4: "#B0B0B0",
  bg: "#FFFFFF",
  raisedbg: "#F5F5F5",
  separator: "#E0E0E0",
  chromebg: "#1A1A1A",
  chromefg: "#FFFFFF",
  error: "#D32F2F",
  warning: "#F57C00",
  success: "#388E3C",
  palette: [
    "#1A1A1A", "#D32F2F", "#388E3C", "#F57C00",
    "#1976D2", "#7B1FA2", "#0097A7", "#757575",
    "#424242", "#E53935", "#43A047", "#FB8C00",
    "#1E88E5", "#8E24AA", "#00ACC1", "#BDBDBD",
  ],
}

// ============================================================================
// Registry
// ============================================================================

/** All built-in ThemePalette definitions. */
export const builtinPalettes: Record<string, ThemePalette> = {
  "catppuccin-mocha": catppuccinMocha,
  "catppuccin-frappe": catppuccinFrappe,
  "catppuccin-macchiato": catppuccinMacchiato,
  "catppuccin-latte": catppuccinLatte,
  "nord": nord,
  "dracula": dracula,
  "solarized-dark": solarizedDark,
  "solarized-light": solarizedLight,
  "tokyo-night": tokyoNight,
  "tokyo-night-storm": tokyoNightStorm,
  "tokyo-night-day": tokyoNightDay,
  "one-dark": oneDark,
  "gruvbox-dark": gruvboxDark,
  "gruvbox-light": gruvboxLight,
  "rose-pine": rosePine,
  "rose-pine-moon": rosePineMoon,
  "rose-pine-dawn": rosePineDawn,
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
export function getPaletteByName(name: string): ThemePalette | undefined {
  return builtinPalettes[name]
}
