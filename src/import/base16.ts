/**
 * Import Base16 YAML/JSON schemes into ThemePalette format.
 *
 * Base16 defines 16 colors (base00–base0F). We map them to ThemePalette's
 * 14 colors (6 surface ramp + 8 accent hues), deriving `crust` from base00.
 *
 * @see https://github.com/chriskempson/base16
 */

import { darken, brighten, hexToRgb } from "../color.js"
import type { ThemePalette } from "../types.js"
import type { Base16Scheme } from "./types.js"
import { BASE16_KEYS } from "./types.js"

// ============================================================================
// YAML Parser (minimal — Base16 YAML is just `key: "value"` lines)
// ============================================================================

/**
 * Parse Base16 YAML into a Base16Scheme object.
 * Handles both quoted and unquoted values, comments, and blank lines.
 */
function parseBase16Yaml(yaml: string): Base16Scheme {
  const result: Record<string, string> = {}

  for (const raw of yaml.split("\n")) {
    const line = raw.trim()
    if (!line || line.startsWith("#")) continue

    const colonIdx = line.indexOf(":")
    if (colonIdx === -1) continue

    const key = line.slice(0, colonIdx).trim()
    let value = line.slice(colonIdx + 1).trim()

    // Strip surrounding quotes (single or double)
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }

    // Strip inline comments (only after unquoted values)
    const commentIdx = value.indexOf("#")
    if (commentIdx > 0) {
      value = value.slice(0, commentIdx).trim()
    }

    result[key] = value
  }

  // Validate required fields
  if (!result.scheme) {
    throw new Error("Base16 YAML missing required field: scheme")
  }

  for (const key of BASE16_KEYS) {
    if (!result[key]) {
      throw new Error(`Base16 YAML missing required color: ${key}`)
    }
    // Validate hex format (6 hex chars, no # prefix)
    if (!/^[0-9a-fA-F]{6}$/.test(result[key]!)) {
      throw new Error(`Base16 color ${key} must be a 6-digit hex string without '#', got: "${result[key]}"`)
    }
  }

  return result as unknown as Base16Scheme
}

// ============================================================================
// Luminance Detection
// ============================================================================

/** Compute relative luminance (WCAG 2.0) from a hex color with `#` prefix. */
function luminance(hex: string): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!
}

// ============================================================================
// Import
// ============================================================================

/**
 * Import a Base16 YAML (or JSON) scheme into a ThemePalette.
 *
 * Mapping:
 *   base00 → base, base01 → surface, base02 → overlay, base03 → subtext,
 *   base05 → text, base08 → red, base09 → orange, base0A → yellow,
 *   base0B → green, base0C → teal, base0D → blue, base0E → purple,
 *   base0F → pink.
 *
 * `crust` is derived by darkening base00 (dark themes) or brightening it (light themes).
 * `dark` is inferred from base00 luminance.
 */
export function importBase16(yamlOrJson: string): ThemePalette {
  const scheme = parseBase16Yaml(yamlOrJson)
  return base16ToPalette(scheme)
}

/** Normalize a bare hex string to `#RRGGBB` (uppercase). */
function hex(bare: string): string {
  return `#${bare.toUpperCase()}`
}

/** Convert a parsed Base16Scheme to ThemePalette. */
export function base16ToPalette(scheme: Base16Scheme): ThemePalette {
  const base = hex(scheme.base00)
  const isDark = luminance(base) < 0.179

  // Derive crust: slightly darker (dark theme) or lighter (light theme) than base00
  const crust = isDark ? darken(base, 0.15) : brighten(base, 0.15)

  return {
    name: scheme.scheme,
    dark: isDark,
    crust,
    base,
    surface: hex(scheme.base01),
    overlay: hex(scheme.base02),
    subtext: hex(scheme.base03),
    text: hex(scheme.base05),
    red: hex(scheme.base08),
    orange: hex(scheme.base09),
    yellow: hex(scheme.base0A),
    green: hex(scheme.base0B),
    teal: hex(scheme.base0C),
    blue: hex(scheme.base0D),
    purple: hex(scheme.base0E),
    pink: hex(scheme.base0F),
  }
}
