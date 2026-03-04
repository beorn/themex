import { describe, expect, test } from "vitest"
import { createTheme, quickTheme, presetTheme } from "../src/builder.js"
import { catppuccinMocha } from "../src/palettes/catppuccin.js"
import { nord } from "../src/palettes/nord.js"
import { hexToRgb } from "../src/color.js"
import type { Theme } from "../src/types.js"

/** All 33 semantic token keys (excluding name and palette). */
const THEME_TOKEN_KEYS: (keyof Theme)[] = [
  "bg",
  "fg",
  "surface",
  "surfacefg",
  "popover",
  "popoverfg",
  "muted",
  "mutedfg",
  "primary",
  "primaryfg",
  "secondary",
  "secondaryfg",
  "accent",
  "accentfg",
  "error",
  "errorfg",
  "warning",
  "warningfg",
  "success",
  "successfg",
  "info",
  "infofg",
  "selection",
  "selectionfg",
  "inverse",
  "inversefg",
  "cursor",
  "cursorfg",
  "border",
  "inputborder",
  "focusborder",
  "link",
  "disabledfg",
]

/** Check that a theme has all required fields with non-empty values. */
function expectValidTheme(theme: Theme) {
  expect(theme.name).toBeTruthy()
  // All string token fields must be non-empty
  for (const key of THEME_TOKEN_KEYS) {
    expect(theme[key], `${key} should be truthy`).toBeTruthy()
  }
  expect(theme.palette).toHaveLength(16)
}

describe("createTheme", () => {
  test("build without any input produces default dark theme", () => {
    const theme = createTheme().build()
    expectValidTheme(theme)
  })

  test("minimal input: just bg produces valid theme", () => {
    const theme = createTheme().bg("#2E3440").build()
    expectValidTheme(theme)
    expect(theme.bg).toBe("#2E3440")
  })

  test("primary + dark produces valid theme with primary in a hue slot", () => {
    // #5E81AC is a blue (hue ~210) which goes into the "blue" slot.
    // For dark themes, deriveTheme picks p.yellow as primary, not the input color.
    // So we use a yellow-range hex that maps to the "yellow" slot.
    const theme = createTheme().primary("#D4BE62").dark().build()
    expectValidTheme(theme)
    // Primary (hue ~51) falls in the yellow slot (45-75), so dark theme primary = p.yellow = input
    expect(theme.primary).toBe("#D4BE62")
  })

  test("bg + fg + primary produces valid theme", () => {
    const theme = createTheme()
      .bg("#2E3440")
      .fg("#ECEFF4")
      .primary("#D4BE62") // yellow-range hue -> yellow slot -> dark primary
      .build()
    expectValidTheme(theme)
    expect(theme.bg).toBe("#2E3440")
    expect(theme.fg).toBe("#ECEFF4")
    expect(theme.primary).toBe("#D4BE62")
  })

  test("dark/light inference from bg luminance", () => {
    const dark = createTheme().bg("#1A1B26").build()
    expectValidTheme(dark)

    const light = createTheme().bg("#FAFAFA").build()
    expectValidTheme(light)
    // Dark and light should produce different primary colors
    // (dark uses p.yellow, light uses p.blue)
    expect(light.primary).not.toBe(dark.primary)
  })

  test("preset loads correctly", () => {
    const theme = createTheme().preset("catppuccin-mocha").build()
    expectValidTheme(theme)
    expect(theme.name).toBe("catppuccin-mocha")
    expect(theme.bg).toBe(catppuccinMocha.background)
    expect(theme.fg).toBe(catppuccinMocha.foreground)
  })

  test("preset + override replaces the primary hue slot", () => {
    const theme = createTheme()
      .preset("nord")
      .primary("#A3BE8C") // green
      .build()
    expectValidTheme(theme)
    // The green slot should now be the provided color
    expect(theme.success).toBe("#A3BE8C")
  })

  test("full palette passthrough works", () => {
    const theme = createTheme().palette(catppuccinMocha).build()
    expectValidTheme(theme)
    expect(theme.name).toBe("catppuccin-mocha")
    expect(theme.bg).toBe(catppuccinMocha.background)
  })

  test("accent() is alias for primary()", () => {
    const t1 = createTheme().primary("#D4BE62").dark().build()
    const t2 = createTheme().accent("#D4BE62").dark().build()
    expect(t1.primary).toBe(t2.primary)
  })

  test("color() sets individual palette field", () => {
    const theme = createTheme().preset("nord").color("red", "#FF0000").build()
    expectValidTheme(theme)
    expect(theme.error).toBe("#FF0000")
  })

  test("bg generates surface ramp when no preset", () => {
    const theme = createTheme().bg("#2E3440").build()
    // The surface ramp should be derived from the bg
    const bgRgb = hexToRgb("#2E3440")!
    const surfaceRgb = hexToRgb(theme.surface)!
    // Surface should be lighter than bg in a dark theme
    const bgLum = (bgRgb[0] + bgRgb[1] + bgRgb[2]) / 3
    const surfaceLum = (surfaceRgb[0] + surfaceRgb[1] + surfaceRgb[2]) / 3
    expect(surfaceLum).toBeGreaterThan(bgLum)
  })

  test("method chaining order does not matter", () => {
    const t1 = createTheme().bg("#2E3440").primary("#D4BE62").dark().build()
    const t2 = createTheme().dark().primary("#D4BE62").bg("#2E3440").build()
    expect(t1.bg).toBe(t2.bg)
    expect(t1.primary).toBe(t2.primary)
  })

  test("unknown preset name is silently ignored (uses defaults)", () => {
    const theme = createTheme().preset("nonexistent-theme").build()
    expectValidTheme(theme)
  })
})

describe("quickTheme", () => {
  test("hex primary creates valid dark theme by default", () => {
    const theme = quickTheme("#D4BE62")
    expectValidTheme(theme)
    // #D4BE62 is in yellow range (hue ~51), so dark primary = p.yellow = input
    expect(theme.primary).toBe("#D4BE62")
  })

  test("hex primary with light mode", () => {
    const theme = quickTheme("#D4BE62", "light")
    expectValidTheme(theme)
  })

  test("named color creates valid theme", () => {
    const theme = quickTheme("blue")
    expectValidTheme(theme)
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
    expect(theme.bg).toBe(nord.background)
  })

  test("unknown preset returns default theme", () => {
    const theme = presetTheme("does-not-exist")
    expectValidTheme(theme)
  })
})
