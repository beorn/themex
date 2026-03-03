/**
 * Ayu palettes — warm, modern theme in three variants.
 * Source: https://github.com/ayu-theme/ayu-colors
 * Reference: https://github.com/Shatur/neovim-ayu
 */

import type { ThemePalette } from "../types.js"

/** Ayu Dark — deep dark variant with warm accents. */
export const ayuDark: ThemePalette = {
  name: "ayu-dark",
  dark: true,
  crust: "#05070A",
  base: "#0B0E14",
  surface: "#11151C",
  overlay: "#565B66",
  subtext: "#636A72",
  text: "#BFBDB6",
  red: "#D95757",
  orange: "#F29668",
  yellow: "#E6B450",
  green: "#AAD94C",
  teal: "#95E6CB",
  blue: "#59C2FF",
  purple: "#D2A6FF",
  pink: "#F07178",
}

/** Ayu Mirage — balanced dark variant with softer contrast. */
export const ayuMirage: ThemePalette = {
  name: "ayu-mirage",
  dark: true,
  crust: "#101521",
  base: "#1F2430",
  surface: "#171B24",
  overlay: "#707A8C",
  subtext: "#6C7A8B",
  text: "#CCCAC2",
  red: "#FF6666",
  orange: "#F29E74",
  yellow: "#FFCC66",
  green: "#D5FF80",
  teal: "#95E6CB",
  blue: "#73D0FF",
  purple: "#DFBFFF",
  pink: "#F28779",
}

/** Ayu Light — clean light variant. */
export const ayuLight: ThemePalette = {
  name: "ayu-light",
  dark: false,
  crust: "#E7EAED",
  base: "#F8F9FA",
  surface: "#F3F4F5",
  overlay: "#8A9199",
  subtext: "#ABADB1",
  text: "#5C6166",
  red: "#E65050",
  orange: "#ED9366",
  yellow: "#FFAA33",
  green: "#86B300",
  teal: "#4CBF99",
  blue: "#399EE6",
  purple: "#A37ACC",
  pink: "#F07171",
}
