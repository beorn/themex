/**
 * ANSI 16 theme generation — derives a complete Theme from a primary color + dark/light.
 */

import type { AnsiPrimary, Theme } from "./types.js"

// ============================================================================
// ANSI 16 palette (shared by both dark and light ANSI themes)
// ============================================================================

const ansi16Palette: string[] = [
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
]

/**
 * Generate a complete ANSI 16 theme from a primary color + dark/light preference.
 *
 * All derivation rules follow the spec in the theme system design doc.
 */
export function generateTheme(primary: AnsiPrimary, dark: boolean): Theme {
  return {
    name: `${dark ? "dark" : "light"}-${primary}`,
    dark,

    primary,
    link: "blueBright",
    control: primary,

    selected: primary,
    selectedfg: "black",
    focusring: dark ? "blueBright" : "blue",

    text: dark ? "whiteBright" : "black",
    text2: dark ? "white" : "blackBright",
    text3: "gray",
    text4: "gray",

    bg: "",
    surface: dark ? "black" : "white",
    separator: "gray",
    chromebg: dark ? "whiteBright" : "black",
    chromefg: dark ? "black" : "whiteBright",

    error: dark ? "redBright" : "red",
    warning: primary,
    success: dark ? "greenBright" : "green",

    palette: ansi16Palette,
  }
}
