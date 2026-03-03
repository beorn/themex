/**
 * Palenight palette — Material Palenight variant.
 * Source: https://github.com/kaicataldo/material.vim (palenight style)
 * Reference: https://github.com/JonathanSpeek/palenight-iterm2
 */

import type { ThemePalette } from "../types.js"

/** Palenight — the soft, purple-tinted Material dark variant. */
export const palenight: ThemePalette = {
  name: "palenight",
  dark: true,
  crust: "#1c1f2b",  // line_highlight (deepest)
  base: "#292d3e",   // background
  surface: "#343b51", // selection
  overlay: "#4e5579", // guides/invisibles
  subtext: "#676e95", // comments
  text: "#a6accd",   // foreground
  red: "#f07178",
  orange: "#f78c6c",
  yellow: "#ffcb6b",
  green: "#c3e88d",
  teal: "#89ddff",   // cyan
  blue: "#82aaff",
  purple: "#c792ea",
  pink: "#ff5370",
}
