/**
 * Export ThemePalette to Base16 YAML format.
 *
 * Reverses the import mapping. For base04/base06/base07 (which ThemePalette
 * doesn't store directly), we interpolate between neighboring surface values.
 *
 * @see https://github.com/chriskempson/base16
 */

import { blend } from "../color.js"
import type { ThemePalette } from "../types.js"

/** Strip `#` prefix from a hex color string and uppercase. */
function stripHash(hex: string): string {
  const bare = hex.startsWith("#") ? hex.slice(1) : hex
  return bare.toUpperCase()
}

/**
 * Export a ThemePalette to Base16 YAML format.
 *
 * Mapping:
 *   base → base00, surface → base01, overlay → base02, subtext → base03,
 *   (interpolated) → base04, text → base05, (interpolated) → base06,
 *   (interpolated) → base07,
 *   red → base08, orange → base09, yellow → base0A, green → base0B,
 *   teal → base0C, blue → base0D, purple → base0E, pink → base0F.
 *
 * Interpolated values:
 *   base04 = blend(subtext, text, 0.33) — between comments and foreground
 *   base06 = blend(text, crust, 0.15) — light foreground (slightly toward bg inverse)
 *   base07 = crust — lightest background (inverse of deepest bg)
 */
export function exportBase16(palette: ThemePalette): string {
  // base04: between subtext (base03) and text (base05)
  const base04 = blend(palette.subtext, palette.text, 0.33)

  // base06: light foreground — between text and the inverse extreme
  // In dark themes: slightly brighter than text. In light: slightly darker.
  const base06 = palette.dark
    ? blend(palette.text, "#FFFFFF", 0.15)
    : blend(palette.text, "#000000", 0.15)

  // base07: lightest background — use crust (the deepest/inverse extreme)
  const base07 = palette.crust

  const lines = [
    `scheme: "${palette.name}"`,
    `author: ""`,
    `base00: "${stripHash(palette.base)}"`,
    `base01: "${stripHash(palette.surface)}"`,
    `base02: "${stripHash(palette.overlay)}"`,
    `base03: "${stripHash(palette.subtext)}"`,
    `base04: "${stripHash(base04)}"`,
    `base05: "${stripHash(palette.text)}"`,
    `base06: "${stripHash(base06)}"`,
    `base07: "${stripHash(base07)}"`,
    `base08: "${stripHash(palette.red)}"`,
    `base09: "${stripHash(palette.orange)}"`,
    `base0A: "${stripHash(palette.yellow)}"`,
    `base0B: "${stripHash(palette.green)}"`,
    `base0C: "${stripHash(palette.teal)}"`,
    `base0D: "${stripHash(palette.blue)}"`,
    `base0E: "${stripHash(palette.purple)}"`,
    `base0F: "${stripHash(palette.pink)}"`,
  ]

  return lines.join("\n") + "\n"
}
