/**
 * Oxocarbon palettes — IBM Carbon Design-inspired theme.
 * Source: https://github.com/nyoom-engineering/oxocarbon.nvim
 */

import type { ThemePalette } from "../types.js"

/** Oxocarbon Dark — IBM Carbon-inspired dark variant. */
export const oxocarbonDark: ThemePalette = {
  name: "oxocarbon-dark",
  dark: true,
  crust: "#131313",
  base: "#161616",
  surface: "#2A2A2A",
  overlay: "#404040",
  subtext: "#5C5C5C",
  text: "#F3F3F3",
  red: "#EE5396",
  orange: "#FF7EB6",
  yellow: "#82CFFF",
  green: "#42BE65",
  teal: "#08BDBA",
  blue: "#78A9FF",
  purple: "#BE95FF",
  pink: "#FF7EB6",
}

/** Oxocarbon Light — IBM Carbon-inspired light variant. */
export const oxocarbonLight: ThemePalette = {
  name: "oxocarbon-light",
  dark: false,
  crust: "#F3F3F3",
  base: "#FFFFFF",
  surface: "#D5D5D5",
  overlay: "#525252",
  subtext: "#90A4AE",
  text: "#37474F",
  red: "#EE5396",
  orange: "#FF6F00",
  yellow: "#FFAB91",
  green: "#42BE65",
  teal: "#08BDBA",
  blue: "#0F62FE",
  purple: "#BE95FF",
  pink: "#FF7EB6",
}
