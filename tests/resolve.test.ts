import { describe, expect, test } from "vitest"
import { resolveThemeColor } from "../src/resolve.js"
import { ansi16DarkTheme, defaultDarkTheme } from "../src/palettes/index.js"

describe("resolveThemeColor", () => {
  test("resolves $primary token", () => {
    expect(resolveThemeColor("$primary", ansi16DarkTheme)).toBe("yellow")
    expect(resolveThemeColor("$primary", defaultDarkTheme)).toBe("#EBCB8B")
  })

  test("resolves all semantic tokens", () => {
    const theme = defaultDarkTheme
    expect(resolveThemeColor("$text", theme)).toBe(theme.text)
    expect(resolveThemeColor("$text2", theme)).toBe(theme.text2)
    expect(resolveThemeColor("$text3", theme)).toBe(theme.text3)
    expect(resolveThemeColor("$text4", theme)).toBe(theme.text4)
    expect(resolveThemeColor("$bg", theme)).toBe(theme.bg)
    expect(resolveThemeColor("$surface", theme)).toBe(theme.surface)
    expect(resolveThemeColor("$separator", theme)).toBe(theme.separator)
    expect(resolveThemeColor("$error", theme)).toBe(theme.error)
    expect(resolveThemeColor("$warning", theme)).toBe(theme.warning)
    expect(resolveThemeColor("$success", theme)).toBe(theme.success)
    expect(resolveThemeColor("$selected", theme)).toBe(theme.selected)
    expect(resolveThemeColor("$selectedfg", theme)).toBe(theme.selectedfg)
    expect(resolveThemeColor("$focusring", theme)).toBe(theme.focusring)
    expect(resolveThemeColor("$link", theme)).toBe(theme.link)
    expect(resolveThemeColor("$control", theme)).toBe(theme.control)
    expect(resolveThemeColor("$chromebg", theme)).toBe(theme.chromebg)
    expect(resolveThemeColor("$chromefg", theme)).toBe(theme.chromefg)
  })

  test("resolves palette colors $color0 through $color15", () => {
    const theme = defaultDarkTheme
    for (let i = 0; i < 16; i++) {
      expect(resolveThemeColor(`$color${i}`, theme)).toBe(theme.palette[i])
    }
  })

  test("resolves backward-compat aliases", () => {
    const theme = defaultDarkTheme
    expect(resolveThemeColor("$accent", theme)).toBe(theme.primary)
    expect(resolveThemeColor("$muted", theme)).toBe(theme.text2)
    expect(resolveThemeColor("$raisedbg", theme)).toBe(theme.surface)
    expect(resolveThemeColor("$background", theme)).toBe(theme.bg)
    expect(resolveThemeColor("$border", theme)).toBe(theme.separator)
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
