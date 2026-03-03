/**
 * Theme derivation — transforms a ThemePalette into a Theme.
 *
 * All inputs ultimately flow through deriveTheme():
 *   ThemePalette → deriveTheme() → Theme
 */

import { blend } from "./color.js"
import type { HueName, Theme, ThemeOptions, ThemePalette } from "./types.js"

/** Warm hues pair with teal for selection; cool hues pair with yellow. */
const warmHues = new Set<HueName>(["red", "orange", "yellow", "green", "pink", "purple"])

/** Check if a hue name is warm (pairs with teal) or cool (pairs with yellow). */
export function isWarm(hue: HueName): boolean {
  return warmHues.has(hue)
}

/**
 * Derive a complete Theme from a ThemePalette.
 *
 * The palette provides 14 raw colors (6 surface + 8 accent). This function
 * maps them to 19 semantic tokens + a 16-color content palette.
 */
export function deriveTheme(p: ThemePalette, opts?: ThemeOptions): Theme {
  const accentName = opts?.accent ?? (p.dark ? "yellow" : "blue")
  const primary = p[accentName]
  const contrastHue: HueName = isWarm(accentName) ? "teal" : "yellow"

  return {
    name: p.name,
    dark: p.dark,

    // ── Brand (from chosen accent) ─────────────────────────────
    primary,
    link: p.blue,
    control: blend(primary, p.overlay, 0.3),

    // ── Selection (contrasting hue) ────────────────────────────
    selected: p[contrastHue],
    selectedfg: p.dark ? p.crust : p.text,
    focusring: p.blue,

    // ── Text (from surface ramp) ───────────────────────────────
    text: p.text,
    text2: p.subtext,
    text3: blend(p.subtext, p.overlay, 0.5),
    text4: blend(p.overlay, p.base, 0.5),

    // ── Surface (from surface ramp) ────────────────────────────
    bg: p.base,
    surface: p.surface,
    separator: p.overlay,
    chromebg: p.dark ? p.text : p.crust,
    chromefg: p.dark ? p.crust : p.text,

    // ── Status (direct hue mapping) ────────────────────────────
    error: p.red,
    warning: p.orange,
    success: p.green,

    // ── Content palette (16 indexed colors) ────────────────────
    palette: [
      p.crust, p.red, p.green, p.yellow,
      p.blue, p.purple, p.teal, p.subtext,
      p.overlay, p.orange, p.green, p.yellow,
      p.blue, p.purple, p.teal, p.text,
    ],
  }
}
