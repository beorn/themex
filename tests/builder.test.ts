import { describe, expect, test } from "vitest"
import { createTheme, quickTheme, presetTheme } from "../src/builder.js"
import { catppuccinMocha } from "../src/palettes/catppuccin.js"
import { nord } from "../src/palettes/nord.js"
import { hexToRgb } from "../src/color.js"
import type { Theme } from "../src/types.js"

/** Check that a theme has all required fields with non-empty values. */
function expectValidTheme(theme: Theme) {
  expect(theme.name).toBeTruthy()
  expect(typeof theme.dark).toBe("boolean")
  // All string token fields must be non-empty hex
  for (const key of [
    "primary", "link", "control", "selected", "selectedfg", "focusring",
    "text", "text2", "text3", "text4", "bg", "raisedbg", "separator",
    "chromebg", "chromefg", "error", "warning", "success",
  ] as const) {
    expect(theme[key], `${key} should be truthy`).toBeTruthy()
  }
  expect(theme.palette).toHaveLength(16)
}

describe("createTheme", () => {
  test("build without any input produces default dark theme", () => {
    const theme = createTheme().build()
    expectValidTheme(theme)
    expect(theme.dark).toBe(true)
  })

  test("minimal input: just bg produces valid theme", () => {
    const theme = createTheme().bg("#2E3440").build()
    expectValidTheme(theme)
    expect(theme.bg).toBe("#2E3440")
    expect(theme.dark).toBe(true) // dark bg → dark mode inferred
  })

  test("primary + dark produces valid theme", () => {
    const theme = createTheme().primary("#EBCB8B").dark().build()
    expectValidTheme(theme)
    expect(theme.dark).toBe(true)
    // Primary should end up in the theme's primary token
    expect(theme.primary).toBe("#EBCB8B")
  })

  test("bg + fg + primary produces valid theme", () => {
    const theme = createTheme()
      .bg("#2E3440")
      .fg("#ECEFF4")
      .primary("#EBCB8B")
      .build()
    expectValidTheme(theme)
    expect(theme.bg).toBe("#2E3440")
    expect(theme.text).toBe("#ECEFF4")
    expect(theme.primary).toBe("#EBCB8B")
  })

  test("dark/light inference from bg luminance", () => {
    const dark = createTheme().bg("#1A1B26").build()
    expect(dark.dark).toBe(true)

    const light = createTheme().bg("#FAFAFA").build()
    expect(light.dark).toBe(false)
  })

  test("explicit dark() overrides luminance inference", () => {
    const theme = createTheme().bg("#FAFAFA").dark().build()
    expect(theme.dark).toBe(true)
  })

  test("explicit light() overrides luminance inference", () => {
    const theme = createTheme().bg("#1A1B26").light().build()
    expect(theme.dark).toBe(false)
  })

  test("preset loads correctly", () => {
    const theme = createTheme().preset("catppuccin-mocha").build()
    expectValidTheme(theme)
    expect(theme.name).toBe("catppuccin-mocha")
    expect(theme.bg).toBe(catppuccinMocha.base)
    expect(theme.text).toBe(catppuccinMocha.text)
  })

  test("preset + override replaces the primary hue slot", () => {
    const theme = createTheme()
      .preset("nord")
      .primary("#A3BE8C") // green
      .build()
    expectValidTheme(theme)
    // The green slot should now be the provided color
    expect(theme.primary).toBe("#A3BE8C")
  })

  test("full palette passthrough works", () => {
    const theme = createTheme().palette(catppuccinMocha).build()
    expectValidTheme(theme)
    expect(theme.name).toBe("catppuccin-mocha")
    expect(theme.bg).toBe(catppuccinMocha.base)
  })

  test("accent() is alias for primary()", () => {
    const t1 = createTheme().primary("#EBCB8B").dark().build()
    const t2 = createTheme().accent("#EBCB8B").dark().build()
    expect(t1.primary).toBe(t2.primary)
  })

  test("color() sets individual palette field", () => {
    const theme = createTheme()
      .preset("nord")
      .color("red", "#FF0000")
      .build()
    expectValidTheme(theme)
    expect(theme.error).toBe("#FF0000")
  })

  test("bg generates surface ramp when no preset", () => {
    const theme = createTheme().bg("#2E3440").build()
    // The surface ramp should be derived from the bg
    const bgRgb = hexToRgb("#2E3440")!
    const surfaceRgb = hexToRgb(theme.raisedbg)!
    // Surface should be lighter than bg in a dark theme
    const bgLum = (bgRgb[0] + bgRgb[1] + bgRgb[2]) / 3
    const surfaceLum = (surfaceRgb[0] + surfaceRgb[1] + surfaceRgb[2]) / 3
    expect(surfaceLum).toBeGreaterThan(bgLum)
  })

  test("method chaining order does not matter", () => {
    const t1 = createTheme().bg("#2E3440").primary("#EBCB8B").dark().build()
    const t2 = createTheme().dark().primary("#EBCB8B").bg("#2E3440").build()
    expect(t1.bg).toBe(t2.bg)
    expect(t1.primary).toBe(t2.primary)
    expect(t1.dark).toBe(t2.dark)
  })

  test("unknown preset name is silently ignored (uses defaults)", () => {
    const theme = createTheme().preset("nonexistent-theme").build()
    expectValidTheme(theme)
    // Should fall back to default dark palette
    expect(theme.dark).toBe(true)
  })
})

describe("quickTheme", () => {
  test("hex primary creates valid dark theme by default", () => {
    const theme = quickTheme("#EBCB8B")
    expectValidTheme(theme)
    expect(theme.primary).toBe("#EBCB8B")
    expect(theme.dark).toBe(true)
  })

  test("hex primary with light mode", () => {
    const theme = quickTheme("#EBCB8B", "light")
    expectValidTheme(theme)
    expect(theme.dark).toBe(false)
  })

  test("named color creates valid theme", () => {
    const theme = quickTheme("blue")
    expectValidTheme(theme)
    expect(theme.dark).toBe(true)
  })

  test("unknown color name falls back gracefully", () => {
    const theme = quickTheme("chartreuse")
    expectValidTheme(theme)
  })
})

describe("presetTheme", () => {
  test("creates valid theme from preset name", () => {
    const theme = presetTheme("catppuccin-mocha")
    expectValidTheme(theme)
    expect(theme.name).toBe("catppuccin-mocha")
  })

  test("nord preset", () => {
    const theme = presetTheme("nord")
    expectValidTheme(theme)
    expect(theme.name).toBe("nord")
    expect(theme.bg).toBe(nord.base)
  })

  test("unknown preset returns default theme", () => {
    const theme = presetTheme("does-not-exist")
    expectValidTheme(theme)
  })
})
