/**
 * Material Theme palettes — material design-inspired editor theme.
 * Source: https://github.com/kaicataldo/material.vim (material.vim)
 * Reference: https://material-theme.com/docs/reference/color-palette/
 */

import type { ThemePalette } from "../types.js"

/** Material Darker — the deep dark Material variant. */
export const materialDark: ThemePalette = {
  name: "material-dark",
  dark: true,
  crust: "#171717",  // line_highlight (deepest)
  base: "#212121",   // background
  surface: "#2c2c2c", // selection
  overlay: "#424242", // guides/line_numbers
  subtext: "#545454", // comments
  text: "#eeffff",   // foreground
  red: "#ff5370",
  orange: "#f78c6c",
  yellow: "#ffcb6b",
  green: "#c3e88d",
  teal: "#89ddff",   // cyan
  blue: "#82aaff",
  purple: "#c792ea",
  pink: "#f07178",
}

/** Material Lighter — the light Material variant. */
export const materialLight: ThemePalette = {
  name: "material-light",
  dark: false,
  crust: "#ecf0f1",  // line_highlight
  base: "#fafafa",   // background
  surface: "#ebf4f3", // selection
  overlay: "#cfd8dc", // line_numbers
  subtext: "#90a4ae", // comments/fg
  text: "#546E7A",   // foreground (darker than comments for light theme)
  red: "#e53935",
  orange: "#f76d47",
  yellow: "#ffb62c",
  green: "#91b859",
  teal: "#39adb5",   // cyan
  blue: "#6182b8",
  purple: "#7c4dff",
  pink: "#ff5370",
}
