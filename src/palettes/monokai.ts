/**
 * Monokai palettes — the iconic syntax highlighting theme.
 * Classic source: Sublime Text default (Wimer Hazenberg, 2006)
 * Pro source: https://monokai.pro/ (default "Pro" filter)
 */

import type { ThemePalette } from "../types.js"

/** Monokai Classic — the original Sublime Text Monokai colors. */
export const monokai: ThemePalette = {
  name: "monokai",
  dark: true,
  crust: "#1a1a1a",  // darker than bg
  base: "#272822",   // classic Monokai background
  surface: "#3e3d32", // line highlight
  overlay: "#75715E", // comments
  subtext: "#a59f85", // muted text (between comments and fg)
  text: "#F8F8F2",   // foreground
  red: "#F92672",    // keywords/pink-red
  orange: "#FD971F",  // parameters/constants
  yellow: "#E6DB74",  // strings
  green: "#A6E22E",   // functions
  teal: "#66D9EF",   // types/builtins (cyan)
  blue: "#66D9EF",   // classic Monokai has no distinct blue; cyan doubles
  purple: "#AE81FF",  // numbers/constants
  pink: "#F92672",   // classic Monokai pink == red
}

/** Monokai Pro — the modern, refined Monokai with balanced colors. */
export const monokaiPro: ThemePalette = {
  name: "monokai-pro",
  dark: true,
  crust: "#221f22",  // darker than base
  base: "#2d2a2e",   // editor background
  surface: "#403e41", // raised surfaces
  overlay: "#727072", // borders/muted chrome
  subtext: "#939293", // secondary text
  text: "#fcfcfa",   // foreground
  red: "#ff6188",    // keywords
  orange: "#fc9867",  // constants/parameters
  yellow: "#ffd866",  // strings/types
  green: "#a9dc76",   // functions
  teal: "#78dce8",   // cyan — support/builtins
  blue: "#78dce8",   // Pro shares cyan as blue
  purple: "#ab9df2",  // decorative/numbers
  pink: "#ff6188",   // Pro pink == red
}
