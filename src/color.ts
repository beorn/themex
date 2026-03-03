/**
 * Color manipulation utilities.
 *
 * Operates in OKLCH for perceptual uniformity — hue rotations look right,
 * lightness changes feel linear, chroma is preserved.
 *
 * Currently uses simple RGB blending as a foundation. Full OKLCH conversion
 * will be added when needed for advanced derivation (shade generation,
 * palette generation from minimal input).
 */

// ============================================================================
// Hex ↔ RGB Parsing
// ============================================================================

/** Parse a hex color string to [r, g, b] (0-255). Returns null for non-hex. */
export function hexToRgb(hex: string): [number, number, number] | null {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex)
  if (!match) return null
  return [parseInt(match[1]!, 16), parseInt(match[2]!, 16), parseInt(match[3]!, 16)]
}

/** Convert [r, g, b] (0-255) to hex string. */
export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)))
  return `#${clamp(r).toString(16).padStart(2, "0")}${clamp(g).toString(16).padStart(2, "0")}${clamp(b).toString(16).padStart(2, "0")}`.toUpperCase()
}

// ============================================================================
// Color Manipulation
// ============================================================================

/**
 * Blend two hex colors. t=0 returns a, t=1 returns b.
 * For non-hex inputs (ANSI names), returns `a` unchanged.
 */
export function blend(a: string, b: string, t: number): string {
  const rgbA = hexToRgb(a)
  const rgbB = hexToRgb(b)
  if (!rgbA || !rgbB) return a

  return rgbToHex(
    rgbA[0] + (rgbB[0] - rgbA[0]) * t,
    rgbA[1] + (rgbB[1] - rgbA[1]) * t,
    rgbA[2] + (rgbB[2] - rgbA[2]) * t,
  )
}

/**
 * Brighten a hex color. amount=0.1 adds 10% lightness toward white.
 * For non-hex inputs (ANSI names), returns the color unchanged.
 */
export function brighten(color: string, amount: number): string {
  return blend(color, "#FFFFFF", amount)
}

/**
 * Darken a hex color. amount=0.1 adds 10% darkness toward black.
 * For non-hex inputs (ANSI names), returns the color unchanged.
 */
export function darken(color: string, amount: number): string {
  return blend(color, "#000000", amount)
}

/**
 * Pick black or white text for readability on the given background.
 * Uses relative luminance (WCAG formula).
 */
export function contrastFg(bg: string): "#000000" | "#FFFFFF" {
  const rgb = hexToRgb(bg)
  if (!rgb) return "#FFFFFF" // default to white for non-hex

  // Relative luminance per WCAG 2.0
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  const luminance = 0.2126 * r! + 0.7152 * g! + 0.0722 * b!
  return luminance > 0.179 ? "#000000" : "#FFFFFF"
}
