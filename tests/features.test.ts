import { describe, expect, test } from "vitest"
import { validateTheme, THEME_TOKEN_KEYS } from "../src/validate-theme.js"
import { checkContrast } from "../src/contrast.js"
import { resolveAliases, resolveTokenAlias } from "../src/alias.js"
import { themeToCSSVars } from "../src/css.js"
import { autoGenerateTheme } from "../src/auto-generate.js"
import { presetTheme } from "../src/builder.js"
import { deriveTheme } from "../src/derive.js"
import { catppuccinMocha } from "../src/palettes/catppuccin.js"
import { nord } from "../src/palettes/nord.js"
import { hexToRgb } from "../src/color.js"
import type { Theme } from "../src/types.js"

// ============================================================================
// 1. Theme Validation (validateTheme)
// ============================================================================

describe("validateTheme", () => {
  test("valid theme passes validation", () => {
    const theme = presetTheme("catppuccin-mocha")
    const result = validateTheme(theme as unknown as Record<string, unknown>)
    expect(result.valid).toBe(true)
    expect(result.missing).toHaveLength(0)
    expect(result.extra).toHaveLength(0)
  })

  test("detects missing tokens", () => {
    const theme = presetTheme("nord") as unknown as Record<string, unknown>
    const partial = { ...theme }
    delete partial.primary
    delete partial.error
    const result = validateTheme(partial)
    expect(result.valid).toBe(false)
    expect(result.missing).toContain("primary")
    expect(result.missing).toContain("error")
  })

  test("detects empty string tokens as missing", () => {
    const theme = presetTheme("nord") as unknown as Record<string, unknown>
    const withEmpty = { ...theme, border: "" }
    const result = validateTheme(withEmpty)
    expect(result.valid).toBe(false)
    expect(result.missing).toContain("border")
  })

  test("detects extra/unknown tokens", () => {
    const theme = presetTheme("nord") as unknown as Record<string, unknown>
    const withExtra = { ...theme, customColor: "#FF0000", unknown: "#00FF00" }
    const result = validateTheme(withExtra)
    expect(result.valid).toBe(true) // Extra tokens don't invalidate
    expect(result.extra).toContain("customColor")
    expect(result.extra).toContain("unknown")
  })

  test("empty object reports all tokens missing", () => {
    const result = validateTheme({})
    expect(result.valid).toBe(false)
    expect(result.missing).toHaveLength(THEME_TOKEN_KEYS.length)
  })

  test("name and palette are not in missing list", () => {
    const result = validateTheme({})
    expect(result.missing).not.toContain("name")
    expect(result.missing).not.toContain("palette")
  })

  test("THEME_TOKEN_KEYS has 33 entries", () => {
    expect(THEME_TOKEN_KEYS).toHaveLength(33)
  })
})

// ============================================================================
// 3. Contrast Checking (checkContrast)
// ============================================================================

describe("checkContrast", () => {
  test("black on white has maximum contrast (21:1)", () => {
    const result = checkContrast("#000000", "#FFFFFF")
    expect(result).not.toBeNull()
    expect(result!.ratio).toBe(21)
    expect(result!.aa).toBe(true)
    expect(result!.aaa).toBe(true)
  })

  test("white on black has maximum contrast", () => {
    const result = checkContrast("#FFFFFF", "#000000")
    expect(result).not.toBeNull()
    expect(result!.ratio).toBe(21)
    expect(result!.aa).toBe(true)
    expect(result!.aaa).toBe(true)
  })

  test("same color has ratio of 1", () => {
    const result = checkContrast("#808080", "#808080")
    expect(result).not.toBeNull()
    expect(result!.ratio).toBe(1)
    expect(result!.aa).toBe(false)
    expect(result!.aaa).toBe(false)
  })

  test("similar colors have low contrast", () => {
    const result = checkContrast("#777777", "#888888")
    expect(result).not.toBeNull()
    expect(result!.ratio).toBeLessThan(2)
    expect(result!.aa).toBe(false)
    expect(result!.aaa).toBe(false)
  })

  test("WCAG AA threshold is 4.5:1", () => {
    // Gray on white: ~4.5:1 borderline
    const result = checkContrast("#767676", "#FFFFFF")
    expect(result).not.toBeNull()
    expect(result!.ratio).toBeGreaterThanOrEqual(4.5)
    expect(result!.aa).toBe(true)
  })

  test("WCAG AAA threshold is 7:1", () => {
    // Very dark gray on white should pass AAA
    const result = checkContrast("#333333", "#FFFFFF")
    expect(result).not.toBeNull()
    expect(result!.ratio).toBeGreaterThanOrEqual(7)
    expect(result!.aaa).toBe(true)
  })

  test("returns null for non-hex colors", () => {
    expect(checkContrast("red", "#FFFFFF")).toBeNull()
    expect(checkContrast("#FFFFFF", "blue")).toBeNull()
    expect(checkContrast("red", "blue")).toBeNull()
  })

  test("contrast ratio is symmetric (order-independent)", () => {
    const r1 = checkContrast("#2E3440", "#ECEFF4")
    const r2 = checkContrast("#ECEFF4", "#2E3440")
    expect(r1).not.toBeNull()
    expect(r2).not.toBeNull()
    expect(r1!.ratio).toBe(r2!.ratio)
  })

  test("theme colors have reasonable contrast", () => {
    // Catppuccin Mocha fg on bg should be readable
    const theme = deriveTheme(catppuccinMocha)
    const result = checkContrast(theme.fg, theme.bg)
    expect(result).not.toBeNull()
    expect(result!.ratio).toBeGreaterThan(3) // At least somewhat readable
  })
})

// ============================================================================
// 4. Token Aliasing (resolveAliases)
// ============================================================================

describe("resolveAliases", () => {
  test("resolves simple alias", () => {
    const tokens = {
      primary: "#FF0000",
      button: "$primary",
    }
    const resolved = resolveAliases(tokens)
    expect(resolved.button).toBe("#FF0000")
    expect(resolved.primary).toBe("#FF0000")
  })

  test("resolves alias chains", () => {
    const tokens = {
      primary: "#FF0000",
      button: "$primary",
      buttonHover: "$button",
    }
    const resolved = resolveAliases(tokens)
    expect(resolved.buttonHover).toBe("#FF0000")
  })

  test("deep alias chains resolve up to depth limit", () => {
    const tokens: Record<string, string> = {
      a: "#FF0000",
      b: "$a",
      c: "$b",
      d: "$c",
      e: "$d",
      f: "$e",
    }
    const resolved = resolveAliases(tokens)
    expect(resolved.f).toBe("#FF0000")
  })

  test("circular references are capped at depth limit", () => {
    const tokens = {
      a: "$b",
      b: "$a",
    }
    const resolved = resolveAliases(tokens)
    // Should not throw, but values will be unresolved alias strings
    expect(resolved.a).toBeTruthy()
    expect(resolved.b).toBeTruthy()
  })

  test("unknown alias references are preserved as-is", () => {
    const tokens = {
      button: "$nonexistent",
      primary: "#FF0000",
    }
    const resolved = resolveAliases(tokens)
    expect(resolved.button).toBe("$nonexistent")
    expect(resolved.primary).toBe("#FF0000")
  })

  test("non-alias values pass through unchanged", () => {
    const tokens = {
      primary: "#FF0000",
      secondary: "#00FF00",
    }
    const resolved = resolveAliases(tokens)
    expect(resolved.primary).toBe("#FF0000")
    expect(resolved.secondary).toBe("#00FF00")
  })
})

describe("resolveTokenAlias", () => {
  const theme = presetTheme("nord")

  test("resolves $token against theme", () => {
    expect(resolveTokenAlias("$primary", theme)).toBe(theme.primary)
    expect(resolveTokenAlias("$bg", theme)).toBe(theme.bg)
  })

  test("non-$ values pass through", () => {
    expect(resolveTokenAlias("#FF0000", theme)).toBe("#FF0000")
    expect(resolveTokenAlias("red", theme)).toBe("red")
  })

  test("unknown token returns as-is", () => {
    expect(resolveTokenAlias("$nonexistent", theme)).toBe("$nonexistent")
  })
})

// ============================================================================
// 5. CSS Variables Export (themeToCSSVars)
// ============================================================================

describe("themeToCSSVars", () => {
  const theme = presetTheme("catppuccin-mocha")

  test("generates CSS custom properties for all semantic tokens", () => {
    const vars = themeToCSSVars(theme)
    expect(vars["--bg"]).toBe(theme.bg)
    expect(vars["--fg"]).toBe(theme.fg)
    expect(vars["--primary"]).toBe(theme.primary)
    expect(vars["--error"]).toBe(theme.error)
    expect(vars["--border"]).toBe(theme.border)
    expect(vars["--disabledfg"]).toBe(theme.disabledfg)
  })

  test("includes palette colors as --color0 through --color15", () => {
    const vars = themeToCSSVars(theme)
    for (let i = 0; i < 16; i++) {
      expect(vars[`--color${i}`]).toBe(theme.palette[i])
    }
  })

  test("all 33 semantic tokens are present", () => {
    const vars = themeToCSSVars(theme)
    for (const key of THEME_TOKEN_KEYS) {
      expect(vars[`--${key}`]).toBeDefined()
    }
  })

  test("total number of CSS vars = 33 tokens + 16 palette = 49", () => {
    const vars = themeToCSSVars(theme)
    expect(Object.keys(vars)).toHaveLength(49)
  })

  test("all values are strings", () => {
    const vars = themeToCSSVars(theme)
    for (const val of Object.values(vars)) {
      expect(typeof val).toBe("string")
    }
  })

  test("keys use -- prefix convention", () => {
    const vars = themeToCSSVars(theme)
    for (const key of Object.keys(vars)) {
      expect(key.startsWith("--")).toBe(true)
    }
  })
})

// ============================================================================
// 6. Auto-Generate Themes (autoGenerateTheme)
// ============================================================================

describe("autoGenerateTheme", () => {
  test("generates a valid dark theme from a blue primary", () => {
    const theme = autoGenerateTheme("#5E81AC", "dark")
    const result = validateTheme(theme as unknown as Record<string, unknown>)
    expect(result.valid).toBe(true)
    expect(theme.primary).toBe("#5E81AC")
    expect(theme.palette).toHaveLength(16)
  })

  test("generates a valid light theme from a red primary", () => {
    const theme = autoGenerateTheme("#E06C75", "light")
    const result = validateTheme(theme as unknown as Record<string, unknown>)
    expect(result.valid).toBe(true)
    expect(theme.primary).toBe("#E06C75")
  })

  test("dark theme has dark background", () => {
    const theme = autoGenerateTheme("#EBCB8B", "dark")
    const bgRgb = hexToRgb(theme.bg)!
    const luminance = (bgRgb[0] + bgRgb[1] + bgRgb[2]) / (3 * 255)
    expect(luminance).toBeLessThan(0.3)
  })

  test("light theme has light background", () => {
    const theme = autoGenerateTheme("#EBCB8B", "light")
    const bgRgb = hexToRgb(theme.bg)!
    const luminance = (bgRgb[0] + bgRgb[1] + bgRgb[2]) / (3 * 255)
    expect(luminance).toBeGreaterThan(0.7)
  })

  test("primaryfg contrasts with primary", () => {
    const theme = autoGenerateTheme("#5E81AC", "dark")
    const contrast = checkContrast(theme.primaryfg, theme.primary)
    expect(contrast).not.toBeNull()
    // Primary fg should be readable on primary bg
    expect(contrast!.ratio).toBeGreaterThan(3)
  })

  test("all 33 tokens are non-empty strings", () => {
    const theme = autoGenerateTheme("#B48EAD", "dark")
    for (const key of THEME_TOKEN_KEYS) {
      const val = theme[key as keyof Theme]
      expect(typeof val).toBe("string")
      expect(val, `${key} should be truthy`).toBeTruthy()
    }
  })

  test("different primary colors produce different themes", () => {
    const blue = autoGenerateTheme("#5E81AC", "dark")
    const red = autoGenerateTheme("#BF616A", "dark")
    expect(blue.primary).not.toBe(red.primary)
    // Selection should differ too (derived from primary)
    expect(blue.selection).not.toBe(red.selection)
  })

  test("handles invalid hex gracefully (falls back to defaults)", () => {
    const theme = autoGenerateTheme("not-a-color", "dark")
    const result = validateTheme(theme as unknown as Record<string, unknown>)
    expect(result.valid).toBe(true)
    expect(theme.palette).toHaveLength(16)
  })

  test("dark and light modes from same color differ", () => {
    const dark = autoGenerateTheme("#5E81AC", "dark")
    const light = autoGenerateTheme("#5E81AC", "light")
    expect(dark.bg).not.toBe(light.bg)
    expect(dark.fg).not.toBe(light.fg)
    // Both should have the same primary
    expect(dark.primary).toBe(light.primary)
  })
})
