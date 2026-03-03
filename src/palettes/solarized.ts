/**
 * Solarized palettes — precision colors for machines and people.
 */

import type { ThemePalette } from "../types.js"

/** Solarized Dark — Ethan Schoonover's classic dark variant. */
export const solarizedDark: ThemePalette = {
  name: "solarized-dark",
  dark: true,
  crust: "#002B36",
  base: "#073642",
  surface: "#586E75",
  overlay: "#657B83",
  subtext: "#839496",
  text: "#FDF6E3",
  red: "#DC322F",
  orange: "#CB4B16",
  yellow: "#B58900",
  green: "#859900",
  teal: "#2AA198",
  blue: "#268BD2",
  purple: "#6C71C4",
  pink: "#D33682",
}

/** Solarized Light — Ethan Schoonover's classic light variant. */
export const solarizedLight: ThemePalette = {
  name: "solarized-light",
  dark: false,
  crust: "#FDF6E3",
  base: "#EEE8D5",
  surface: "#DDD6C1",
  overlay: "#93A1A1",
  subtext: "#657B83",
  text: "#073642",
  red: "#DC322F",
  orange: "#CB4B16",
  yellow: "#B58900",
  green: "#859900",
  teal: "#2AA198",
  blue: "#268BD2",
  purple: "#6C71C4",
  pink: "#D33682",
}
