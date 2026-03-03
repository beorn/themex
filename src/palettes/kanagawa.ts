/**
 * Kanagawa palettes — inspired by Katsushika Hokusai's famous paintings.
 * Source: https://github.com/rebelot/kanagawa.nvim (palette.lua)
 */

import type { ThemePalette } from "../types.js"

/** Kanagawa Wave — the default dark variant, inspired by "The Great Wave off Kanagawa". */
export const kanagawaWave: ThemePalette = {
  name: "kanagawa-wave",
  dark: true,
  crust: "#16161D",  // sumiInk0
  base: "#1F1F28",   // sumiInk3
  surface: "#2A2A37", // sumiInk4
  overlay: "#54546D", // sumiInk6
  subtext: "#727169", // fujiGray
  text: "#DCD7BA",   // fujiWhite
  red: "#C34043",    // autumnRed
  orange: "#FFA066",  // surimiOrange
  yellow: "#E6C384",  // carpYellow
  green: "#98BB6C",   // springGreen
  teal: "#6A9589",   // waveAqua1
  blue: "#7E9CD8",   // crystalBlue
  purple: "#957FB8",  // oniViolet
  pink: "#D27E99",   // sakuraPink
}

/** Kanagawa Dragon — a muted, earthy dark variant. */
export const kanagawaDragon: ThemePalette = {
  name: "kanagawa-dragon",
  dark: true,
  crust: "#0d0c0c",  // dragonBlack0
  base: "#181616",   // dragonBlack3
  surface: "#282727", // dragonBlack4
  overlay: "#625e5a", // dragonBlack6
  subtext: "#737c73", // dragonAsh
  text: "#c5c9c5",   // dragonWhite
  red: "#c4746e",    // dragonRed
  orange: "#b6927b",  // dragonOrange
  yellow: "#c4b28a",  // dragonYellow
  green: "#87a987",   // dragonGreen
  teal: "#8ea4a2",   // dragonAqua
  blue: "#8ba4b0",   // dragonBlue2
  purple: "#8992a7",  // dragonViolet
  pink: "#a292a3",   // dragonPink
}

/** Kanagawa Lotus — the light variant, inspired by lotus flowers. */
export const kanagawaLotus: ThemePalette = {
  name: "kanagawa-lotus",
  dark: false,
  crust: "#e5ddb0",  // lotusWhite2
  base: "#f2ecbc",   // lotusWhite3
  surface: "#dcd5ac", // lotusWhite1
  overlay: "#8a8980", // lotusGray3
  subtext: "#716e61", // lotusGray2
  text: "#545464",   // lotusInk1
  red: "#c84053",    // lotusRed
  orange: "#cc6d00",  // lotusOrange
  yellow: "#de9800",  // lotusYellow3
  green: "#6f894e",   // lotusGreen
  teal: "#597b75",   // lotusAqua
  blue: "#4d699b",   // lotusBlue4
  purple: "#624c83",  // lotusViolet4
  pink: "#b35b79",   // lotusPink
}
