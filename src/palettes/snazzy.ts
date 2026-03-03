/**
 * Snazzy palette — elegant dark theme with vivid colors.
 * Source: https://github.com/sindresorhus/hyper-snazzy
 */

import type { ThemePalette } from "../types.js"

/** Snazzy — clean dark theme by Sindre Sorhus. */
export const snazzy: ThemePalette = {
  name: "snazzy",
  dark: true,
  crust: "#222430",  // border color (deepest)
  base: "#282a36",   // background
  surface: "#34353e", // slightly raised (interpolated)
  overlay: "#686868", // light black / muted chrome
  subtext: "#97979b", // cursor/secondary text
  text: "#eff0eb",   // foreground
  red: "#ff5c57",
  orange: "#ff9f43",  // snazzy bright orange (warm interpolation)
  yellow: "#f3f99d",
  green: "#5af78e",
  teal: "#9aedfe",   // cyan
  blue: "#57c7ff",
  purple: "#b267e6",  // interpolated purple (between magenta and blue)
  pink: "#ff6ac1",   // magenta
}
