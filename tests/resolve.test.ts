import { describe, expect, test } from "vitest"
import { resolveThemeColor } from "../src/resolve.js"
import { ansi16DarkTheme, defaultDarkTheme } from "../src/palettes/index.js"

describe("resolveThemeColor", () => {
  test("resolves $primary token", () => {
    expect(resolveThemeColor("$primary", ansi16DarkTheme)).toBe("yellow")
    expect(resolveThemeColor("$primary", defaultDarkTheme)).toBeTruthy()
  })

  test("resolves all semantic tokens", () => {
    const theme = defaultDarkTheme
    // Default pair
    expect(resolveThemeColor("$bg", theme)).toBe(theme.bg)
    expect(resolveThemeColor("$fg", theme)).toBe(theme.fg)
    // Surface pair
    expect(resolveThemeColor("$surface", theme)).toBe(theme.surface)
    expect(resolveThemeColor("$surface-fg", theme)).toBe(theme.surfacefg)
    // Popover pair
    expect(resolveThemeColor("$popover", theme)).toBe(theme.popover)
    expect(resolveThemeColor("$popover-fg", theme)).toBe(theme.popoverfg)
    // Muted pair
    expect(resolveThemeColor("$muted", theme)).toBe(theme.muted)
    expect(resolveThemeColor("$muted-fg", theme)).toBe(theme.mutedfg)
    // Primary pair
    expect(resolveThemeColor("$primary", theme)).toBe(theme.primary)
    expect(resolveThemeColor("$primary-fg", theme)).toBe(theme.primaryfg)
    // Secondary pair
    expect(resolveThemeColor("$secondary", theme)).toBe(theme.secondary)
    expect(resolveThemeColor("$secondary-fg", theme)).toBe(theme.secondaryfg)
    // Accent pair
    expect(resolveThemeColor("$accent", theme)).toBe(theme.accent)
    expect(resolveThemeColor("$accent-fg", theme)).toBe(theme.accentfg)
    // Status pairs
    expect(resolveThemeColor("$error", theme)).toBe(theme.error)
    expect(resolveThemeColor("$error-fg", theme)).toBe(theme.errorfg)
    expect(resolveThemeColor("$warning", theme)).toBe(theme.warning)
    expect(resolveThemeColor("$warning-fg", theme)).toBe(theme.warningfg)
    expect(resolveThemeColor("$success", theme)).toBe(theme.success)
    expect(resolveThemeColor("$success-fg", theme)).toBe(theme.successfg)
    expect(resolveThemeColor("$info", theme)).toBe(theme.info)
    expect(resolveThemeColor("$info-fg", theme)).toBe(theme.infofg)
    // Selection pair
    expect(resolveThemeColor("$selection", theme)).toBe(theme.selection)
    expect(resolveThemeColor("$selection-fg", theme)).toBe(theme.selectionfg)
    // Inverse pair
    expect(resolveThemeColor("$inverse", theme)).toBe(theme.inverse)
    expect(resolveThemeColor("$inverse-fg", theme)).toBe(theme.inversefg)
    // Cursor pair
    expect(resolveThemeColor("$cursor", theme)).toBe(theme.cursor)
    expect(resolveThemeColor("$cursor-fg", theme)).toBe(theme.cursorfg)
    // Standalone tokens
    expect(resolveThemeColor("$border", theme)).toBe(theme.border)
    expect(resolveThemeColor("$inputborder", theme)).toBe(theme.inputborder)
    expect(resolveThemeColor("$focusborder", theme)).toBe(theme.focusborder)
    expect(resolveThemeColor("$link", theme)).toBe(theme.link)
    expect(resolveThemeColor("$disabled-fg", theme)).toBe(theme.disabledfg)
  })

  test("resolves camelCase token names directly", () => {
    const theme = defaultDarkTheme
    expect(resolveThemeColor("$surfacefg", theme)).toBe(theme.surfacefg)
    expect(resolveThemeColor("$mutedfg", theme)).toBe(theme.mutedfg)
    expect(resolveThemeColor("$primaryfg", theme)).toBe(theme.primaryfg)
    expect(resolveThemeColor("$disabledfg", theme)).toBe(theme.disabledfg)
  })

  test("resolves palette colors $color0 through $color15", () => {
    const theme = defaultDarkTheme
    for (let i = 0; i < 16; i++) {
      expect(resolveThemeColor(`$color${i}`, theme)).toBe(theme.palette[i])
    }
  })

  test("passes through non-$ colors unchanged", () => {
    expect(resolveThemeColor("red", ansi16DarkTheme)).toBe("red")
    expect(resolveThemeColor("#FF0000", ansi16DarkTheme)).toBe("#FF0000")
  })

  test("returns undefined for undefined input", () => {
    expect(resolveThemeColor(undefined, ansi16DarkTheme)).toBeUndefined()
  })

  test("passes through unknown tokens as-is", () => {
    expect(resolveThemeColor("$nonexistent", ansi16DarkTheme)).toBe("$nonexistent")
  })
})
