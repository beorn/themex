/**
 * Edge palettes — clean, modern theme by sainnhe.
 * Source: https://github.com/sainnhe/edge (default style)
 */

import type { ThemePalette } from "../types.js"

/** Edge Dark — clean dark variant with balanced accents. */
export const edgeDark: ThemePalette = {
  name: "edge-dark",
  dark: true,
  crust: "#202023",
  base: "#2C2E34",
  surface: "#33353F",
  overlay: "#414550",
  subtext: "#758094",
  text: "#C5CDD9",
  red: "#EC7279",
  orange: "#DEB974",
  yellow: "#DEB974",
  green: "#A0C980",
  teal: "#5DBBC1",
  blue: "#6CB6EB",
  purple: "#D38AEA",
  pink: "#EC7279",
}

/** Edge Light — clean, readable light variant. */
export const edgeLight: ThemePalette = {
  name: "edge-light",
  dark: false,
  crust: "#DDE2E7",
  base: "#FAFAFA",
  surface: "#EEF1F4",
  overlay: "#DDE2E7",
  subtext: "#8790A0",
  text: "#4B505B",
  red: "#D05858",
  orange: "#BE7E05",
  yellow: "#BE7E05",
  green: "#608E32",
  teal: "#3A8B84",
  blue: "#5079BE",
  purple: "#B05CCC",
  pink: "#D05858",
}
