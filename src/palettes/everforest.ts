/**
 * Everforest palettes — a green-toned comfortable color scheme.
 * Source: https://github.com/sainnhe/everforest (medium background variants)
 */

import type { ThemePalette } from "../types.js"

/** Everforest Dark — warm green-based dark theme (medium background). */
export const everforestDark: ThemePalette = {
  name: "everforest-dark",
  dark: true,
  crust: "#232a2e",  // bg_dim
  base: "#2d353b",   // bg0
  surface: "#343f44", // bg1
  overlay: "#4f585e", // bg4
  subtext: "#859289", // grey1
  text: "#d3c6aa",   // fg
  red: "#e67e80",
  orange: "#e69875",
  yellow: "#dbbc7f",
  green: "#a7c080",
  teal: "#83c092",   // aqua
  blue: "#7fbbb3",
  purple: "#d699b6",
  pink: "#e67e80",   // everforest has no distinct pink; reuse red
}

/** Everforest Light — warm green-based light theme (medium background). */
export const everforestLight: ThemePalette = {
  name: "everforest-light",
  dark: false,
  crust: "#efebd4",  // bg_dim
  base: "#fdf6e3",   // bg0
  surface: "#f4f0d9", // bg1
  overlay: "#e0dcc7", // bg4
  subtext: "#939f91", // grey1
  text: "#5c6a72",   // fg
  red: "#f85552",
  orange: "#f57d26",
  yellow: "#dfa000",
  green: "#8da101",
  teal: "#35a77c",   // aqua
  blue: "#3a94c5",
  purple: "#df69ba",
  pink: "#f85552",   // everforest has no distinct pink; reuse red
}
