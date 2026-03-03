/**
 * Modus palettes — GNU Emacs themes conforming to WCAG AAA contrast.
 * Source: https://github.com/protesilaos/modus-themes
 */

import type { ThemePalette } from "../types.js"

/** Modus Vivendi — elegant dark theme with maximum legibility. */
export const modusVivendi: ThemePalette = {
  name: "modus-vivendi",
  dark: true,
  crust: "#000000",
  base: "#000000",
  surface: "#1E1E1E",
  overlay: "#535353",
  subtext: "#989898",
  text: "#FFFFFF",
  red: "#FF5F59",
  orange: "#FEC43F",
  yellow: "#D0BC00",
  green: "#44BC44",
  teal: "#00D3D0",
  blue: "#2FAFFF",
  purple: "#B6A0FF",
  pink: "#FEACD0",
}

/** Modus Operandi — elegant light theme with maximum legibility. */
export const modusOperandi: ThemePalette = {
  name: "modus-operandi",
  dark: false,
  crust: "#E0E0E0",
  base: "#FFFFFF",
  surface: "#F2F2F2",
  overlay: "#9F9F9F",
  subtext: "#595959",
  text: "#000000",
  red: "#A60000",
  orange: "#884900",
  yellow: "#6F5500",
  green: "#006800",
  teal: "#005E8B",
  blue: "#0031A9",
  purple: "#531AB6",
  pink: "#721045",
}
