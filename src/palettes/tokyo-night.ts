/**
 * Tokyo Night palette — a clean dark theme inspired by Tokyo city lights.
 */

import type { ThemePalette } from "../types.js"

/** Tokyo Night — the default dark variant. */
export const tokyoNight: ThemePalette = {
  name: "tokyo-night",
  dark: true,
  crust: "#1A1B26",
  base: "#24283B",
  surface: "#292E42",
  overlay: "#545C7E",
  subtext: "#A9B1D6",
  text: "#C0CAF5",
  red: "#F7768E",
  orange: "#FF9E64",
  yellow: "#E0AF68",
  green: "#9ECE6A",
  teal: "#73DACA",
  blue: "#7AA2F7",
  purple: "#BB9AF7",
  pink: "#FF007C",
}

/** Tokyo Night Storm — slightly lighter background. */
export const tokyoNightStorm: ThemePalette = {
  name: "tokyo-night-storm",
  dark: true,
  crust: "#1F2335",
  base: "#24283B",
  surface: "#292E42",
  overlay: "#545C7E",
  subtext: "#A9B1D6",
  text: "#C0CAF5",
  red: "#F7768E",
  orange: "#FF9E64",
  yellow: "#E0AF68",
  green: "#9ECE6A",
  teal: "#73DACA",
  blue: "#7AA2F7",
  purple: "#BB9AF7",
  pink: "#FF007C",
}

/** Tokyo Night Day — the light variant. */
export const tokyoNightDay: ThemePalette = {
  name: "tokyo-night-day",
  dark: false,
  crust: "#E1E2E7",
  base: "#D5D6DB",
  surface: "#C4C5CB",
  overlay: "#9699A3",
  subtext: "#6172B0",
  text: "#3760BF",
  red: "#F52A65",
  orange: "#B15C00",
  yellow: "#8C6C3E",
  green: "#587539",
  teal: "#118C74",
  blue: "#2E7DE9",
  purple: "#9854F1",
  pink: "#F52A65",
}
