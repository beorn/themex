/**
 * Nightfox palettes — rich, vibrant themes for Neovim.
 * Source: https://github.com/EdenEast/nightfox.nvim
 */

import type { ThemePalette } from "../types.js"

/** Nightfox — dark blue-toned variant. */
export const nightfox: ThemePalette = {
  name: "nightfox",
  dark: true,
  crust: "#131A24",
  base: "#192330",
  surface: "#212E3F",
  overlay: "#39506D",
  subtext: "#71839B",
  text: "#CDCECF",
  red: "#C94F6D",
  orange: "#F4A261",
  yellow: "#DBC074",
  green: "#81B29A",
  teal: "#63CDCF",
  blue: "#719CD6",
  purple: "#9D79D6",
  pink: "#D67AD2",
}

/** Dawnfox — warm light variant inspired by Rose Pine Dawn. */
export const dawnfox: ThemePalette = {
  name: "dawnfox",
  dark: false,
  crust: "#EBE5DF",
  base: "#FAF4ED",
  surface: "#EBE0DF",
  overlay: "#BDBFC9",
  subtext: "#A8A3B3",
  text: "#575279",
  red: "#B4637A",
  orange: "#D7827E",
  yellow: "#EA9D34",
  green: "#618774",
  teal: "#56949F",
  blue: "#286983",
  purple: "#907AA9",
  pink: "#D685AF",
}
