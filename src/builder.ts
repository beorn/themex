/**
 * Chainable theme builder — create themes from minimal input.
 *
 * @example
 * ```typescript
 * // Just a background color
 * const theme = createTheme().bg('#2E3440').build()
 *
 * // Primary + explicit dark mode
 * const theme = createTheme().primary('#EBCB8B').dark().build()
 *
 * // Three-color input (dark/light inferred from bg luminance)
 * const theme = createTheme()
 *   .bg('#2E3440').fg('#ECEFF4').primary('#EBCB8B').build()
 *
 * // Preset with override
 * const theme = createTheme().preset('nord').primary('#A3BE8C').build()
 * ```
 */

import { hexToRgb, rgbToHex, brighten, darken } from "./color.js"
import { deriveTheme } from "./derive.js"
import { getPaletteByName } from "./palettes/index.js"
import type { Theme, ThemePalette, HueName } from "./types.js"

// ============================================================================
// HSL Utilities (internal)
// ============================================================================

type HSL = [number, number, number] // [h: 0-360, s: 0-1, l: 0-1]

function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6
  return [h * 360, s, l]
}

function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360 // normalize hue
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
  }
  return rgbToHex(f(0) * 255, f(8) * 255, f(4) * 255)
}

function hexToHsl(hex: string): HSL | null {
  const rgb = hexToRgb(hex)
  if (!rgb) return null
  return rgbToHsl(rgb[0], rgb[1], rgb[2])
}

// ============================================================================
// Luminance
// ============================================================================

function luminance(hex: string): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0.5
  return (rgb[0] + rgb[1] + rgb[2]) / (255 * 3)
}

function isDarkColor(hex: string): boolean {
  return luminance(hex) < 0.5
}

// ============================================================================
// Surface Ramp Generation
// ============================================================================

/** Generate a 6-stop surface ramp from a single bg color. */
function generateSurfaceRamp(bg: string, isDark: boolean) {
  const step = isDark ? brighten : darken
  return {
    crust: isDark ? darken(bg, 0.05) : brighten(bg, 0.05),
    base: bg,
    surface: step(bg, 0.05),
    overlay: step(bg, 0.15),
    subtext: step(bg, 0.55),
    text: step(bg, 0.85),
  }
}

// ============================================================================
// Accent Generation
// ============================================================================

/** Generate 8 accent colors from a primary hue by rotating around the hue wheel. */
function generateAccents(primary: string): Record<HueName, string> {
  const hsl = hexToHsl(primary)
  if (!hsl) {
    // Fallback: sensible defaults
    return {
      red: "#BF616A", orange: "#D08770", yellow: "#EBCB8B", green: "#A3BE8C",
      teal: "#88C0D0", blue: "#5E81AC", purple: "#B48EAD", pink: "#D4879C",
    }
  }
  const [h, s, l] = hsl
  // Map hue offsets for each accent relative to primary
  // We distribute evenly: 0, 30, 60, 120, 165, 210, 270, 330
  return {
    red: hslToHex(h + 0, s, l),       // primary itself at "red" slot initially
    orange: hslToHex(h + 30, s, l),
    yellow: hslToHex(h + 60, s, l),
    green: hslToHex(h + 120, s, l),
    teal: hslToHex(h + 165, s, l),
    blue: hslToHex(h + 210, s, l),
    purple: hslToHex(h + 270, s, l),
    pink: hslToHex(h + 330, s, l),
  }
}

/** Find which hue slot the primary color best matches by hue angle proximity. */
function assignPrimaryToSlot(primary: string): HueName {
  const hsl = hexToHsl(primary)
  if (!hsl) return "blue"
  const h = hsl[0]
  // Map hue ranges to slot names
  const slots: [number, number, HueName][] = [
    [0, 15, "red"], [15, 45, "orange"], [45, 75, "yellow"],
    [75, 165, "green"], [165, 200, "teal"], [200, 260, "blue"],
    [260, 310, "purple"], [310, 345, "pink"], [345, 360, "red"],
  ]
  for (const [lo, hi, name] of slots) {
    if (h >= lo && h < hi) return name
  }
  return "blue"
}

/** Generate accents placing the primary in its natural hue slot. */
function generateAccentsFromPrimary(primary: string): Record<HueName, string> {
  const hsl = hexToHsl(primary)
  if (!hsl) return generateAccents(primary)

  const [, s, l] = hsl
  const slot = assignPrimaryToSlot(primary)

  // Target hues for each slot
  const targetHues: Record<HueName, number> = {
    red: 0, orange: 30, yellow: 60, green: 120,
    teal: 180, blue: 220, purple: 280, pink: 330,
  }

  const result = {} as Record<HueName, string>
  for (const [name, targetH] of Object.entries(targetHues) as [HueName, number][]) {
    if (name === slot) {
      result[name] = primary // keep the exact primary color
    } else {
      result[name] = hslToHex(targetH, s, l)
    }
  }
  return result
}

// ============================================================================
// Default Palettes
// ============================================================================

const defaultDarkPalette: ThemePalette = {
  name: "custom-dark",
  dark: true,
  crust: "#1E2028", base: "#2E3440", surface: "#3B4252",
  overlay: "#4C566A", subtext: "#D8DEE9", text: "#ECEFF4",
  red: "#BF616A", orange: "#D08770", yellow: "#EBCB8B", green: "#A3BE8C",
  teal: "#88C0D0", blue: "#5E81AC", purple: "#B48EAD", pink: "#D4879C",
}

const defaultLightPalette: ThemePalette = {
  name: "custom-light",
  dark: false,
  crust: "#E0E0E0", base: "#FFFFFF", surface: "#F5F5F5",
  overlay: "#D0D0D0", subtext: "#5A5A5A", text: "#1A1A1A",
  red: "#D32F2F", orange: "#F57C00", yellow: "#F9A825", green: "#388E3C",
  teal: "#0097A7", blue: "#1976D2", purple: "#7B1FA2", pink: "#C2185B",
}

// ============================================================================
// Builder
// ============================================================================

interface ThemeBuilderState {
  dark?: boolean
  colors: Partial<ThemePalette>
  presetPalette?: ThemePalette
}

export interface ThemeBuilder {
  /** Set background color (maps to palette `base`). */
  bg(color: string): ThemeBuilder
  /** Set foreground color (maps to palette `text`). */
  fg(color: string): ThemeBuilder
  /** Set primary accent color. */
  primary(color: string): ThemeBuilder
  /** Alias for `.primary()`. */
  accent(color: string): ThemeBuilder
  /** Force dark mode. */
  dark(): ThemeBuilder
  /** Force light mode. */
  light(): ThemeBuilder
  /** Set any palette color by name. */
  color(name: keyof Omit<ThemePalette, "name" | "dark">, value: string): ThemeBuilder
  /** Set full palette at once. */
  palette(p: ThemePalette): ThemeBuilder
  /** Load a built-in palette by name. */
  preset(name: string): ThemeBuilder
  /** Derive the final Theme from accumulated state. */
  build(): Theme
}

/** Create a chainable theme builder. */
export function createTheme(): ThemeBuilder {
  const state: ThemeBuilderState = { colors: {} }
  let primaryColor: string | undefined

  const builder: ThemeBuilder = {
    bg(color) { state.colors.base = color; return builder },
    fg(color) { state.colors.text = color; return builder },
    primary(color) { primaryColor = color; return builder },
    accent(color) { return builder.primary(color) },
    dark() { state.dark = true; return builder },
    light() { state.dark = false; return builder },
    color(name, value) { (state.colors as Record<string, string>)[name] = value; return builder },
    palette(p) { state.presetPalette = p; return builder },
    preset(name) {
      const p = getPaletteByName(name)
      if (p) state.presetPalette = p
      return builder
    },

    build(): Theme {
      // 1. Determine base palette (preset, default, or generate)
      const isDark = state.dark ?? (state.colors.base ? isDarkColor(state.colors.base) : true)
      const base = state.presetPalette
        ? { ...state.presetPalette }
        : { ...(isDark ? defaultDarkPalette : defaultLightPalette) }

      // 2. Apply explicit color overrides
      for (const [key, val] of Object.entries(state.colors)) {
        if (val !== undefined) (base as Record<string, unknown>)[key] = val
      }
      base.dark = isDark

      // 3. If bg was provided without a preset, generate surface ramp for missing fields
      if (state.colors.base && !state.presetPalette) {
        const ramp = generateSurfaceRamp(state.colors.base, isDark)
        if (!state.colors.crust) base.crust = ramp.crust
        if (!state.colors.surface) base.surface = ramp.surface
        if (!state.colors.overlay) base.overlay = ramp.overlay
        if (!state.colors.subtext) base.subtext = ramp.subtext
        if (!state.colors.text) base.text = ramp.text
      }

      // 4. If primary was provided without a preset, generate accents for missing hues
      if (primaryColor && !state.presetPalette) {
        const accents = generateAccentsFromPrimary(primaryColor)
        const hueNames: HueName[] = ["red", "orange", "yellow", "green", "teal", "blue", "purple", "pink"]
        for (const hue of hueNames) {
          if (!state.colors[hue]) base[hue] = accents[hue]
        }
      }

      // 5. If primary was provided with a preset, override the slot
      if (primaryColor && state.presetPalette) {
        const slot = assignPrimaryToSlot(primaryColor)
        base[slot] = primaryColor
      }

      // 6. Set name if not from preset
      if (!state.presetPalette) {
        base.name = isDark ? "custom-dark" : "custom-light"
      }

      // 7. Derive semantic theme
      // If primary was set, use its hue slot as the accent
      const accentHue = primaryColor ? assignPrimaryToSlot(primaryColor) : undefined
      return deriveTheme(base, accentHue ? { accent: accentHue } : undefined)
    },
  }

  return builder
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Quick theme from a primary color or color name.
 *
 * @example
 * ```typescript
 * quickTheme('#EBCB8B', 'dark')  // yellow primary, dark mode
 * quickTheme('blue')              // blue primary, default dark
 * ```
 */
export function quickTheme(primaryOrHex: string, mode?: "dark" | "light"): Theme {
  const b = createTheme()
  if (primaryOrHex.startsWith("#")) {
    b.primary(primaryOrHex)
  } else {
    // Treat as a CSS-style color name — map to a sensible hex
    const namedColors: Record<string, string> = {
      red: "#BF616A", orange: "#D08770", yellow: "#EBCB8B", green: "#A3BE8C",
      teal: "#88C0D0", cyan: "#88C0D0", blue: "#5E81AC", purple: "#B48EAD",
      pink: "#D4879C", magenta: "#B48EAD", white: "#ECEFF4",
    }
    b.primary(namedColors[primaryOrHex] ?? "#5E81AC")
  }
  if (mode === "dark") b.dark()
  else if (mode === "light") b.light()
  return b.build()
}

/**
 * Create a theme from a built-in preset name.
 *
 * @example
 * ```typescript
 * presetTheme('catppuccin-mocha')
 * presetTheme('nord')
 * ```
 */
export function presetTheme(name: string): Theme {
  return createTheme().preset(name).build()
}
