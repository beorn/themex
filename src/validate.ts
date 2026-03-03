/**
 * Palette validation — checks ThemePalette fields and contrast.
 */

import { hexToRgb } from "./color.js"
import type { ThemePalette } from "./types.js"

/** Validation result from validatePalette(). */
export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/** All required color fields on ThemePalette. */
const paletteColorFields = [
  "crust", "base", "surface", "overlay", "subtext", "text",
  "red", "orange", "yellow", "green", "teal", "blue", "purple", "pink",
] as const

/**
 * Validate a ThemePalette.
 *
 * Checks:
 * - All 14 color fields are present and non-empty
 * - `name` and `dark` are set
 * - Warns on low-contrast text/bg combinations
 */
export function validatePalette(p: ThemePalette): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Required metadata
  if (!p.name) errors.push("name is required")
  if (typeof p.dark !== "boolean") errors.push("dark must be a boolean")

  // Required color fields
  for (const field of paletteColorFields) {
    const val = p[field]
    if (!val || typeof val !== "string") {
      errors.push(`${field} is required and must be a non-empty string`)
    }
  }

  // Contrast warnings (only for hex colors)
  if (p.text && p.base) {
    const textRgb = hexToRgb(p.text)
    const baseRgb = hexToRgb(p.base)
    if (textRgb && baseRgb) {
      const textSum = textRgb[0] + textRgb[1] + textRgb[2]
      const baseSum = baseRgb[0] + baseRgb[1] + baseRgb[2]
      const textIsLight = textSum > 384
      const bgIsLight = baseSum > 384
      if (textIsLight === bgIsLight) {
        warnings.push(`Low contrast: text (${p.text}) and base (${p.base}) have similar lightness`)
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}
