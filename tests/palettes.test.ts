import { describe, expect, test } from "vitest"
import { deriveTheme } from "../src/derive.js"
import { builtinPalettes, getThemeByName, getPaletteByName } from "../src/palettes/index.js"
import { validatePalette } from "../src/validate.js"
import type { Theme, ThemePalette } from "../src/types.js"

describe("all built-in palettes produce valid themes", () => {
  for (const [name, palette] of Object.entries(builtinPalettes)) {
    test(`${name} derives a valid theme`, () => {
      const theme = deriveTheme(palette)

      // Basic structure
      expect(theme.name).toBe(name)
      expect(typeof theme.dark).toBe("boolean")
      expect(theme.palette).toHaveLength(16)

      // All semantic tokens are non-empty strings
      const tokenKeys: (keyof Theme)[] = [
        "primary", "link", "control",
        "selected", "selectedfg", "focusring",
        "text", "text2", "text3", "text4",
        "bg", "raisedbg", "separator",
        "chromebg", "chromefg",
        "error", "warning", "success",
      ]
      for (const key of tokenKeys) {
        const val = theme[key]
        expect(typeof val).toBe("string")
        expect(val).toBeTruthy()
      }
    })

    test(`${name} passes validation`, () => {
      const result = validatePalette(palette)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  }
})

describe("getThemeByName", () => {
  test("returns ansi16 dark by default", () => {
    const theme = getThemeByName()
    expect(theme.name).toBe("dark-ansi16")
  })

  test("returns named built-in theme", () => {
    expect(getThemeByName("dark-truecolor")!.name).toBe("dark-truecolor")
    expect(getThemeByName("light-ansi16")!.name).toBe("light-ansi16")
  })

  test("returns theme derived from palette name", () => {
    const theme = getThemeByName("catppuccin-mocha")
    expect(theme.name).toBe("catppuccin-mocha")
    expect(theme.dark).toBe(true)
  })

  test("supports backward-compat aliases", () => {
    expect(getThemeByName("dark")!.name).toBe("dark-truecolor")
    expect(getThemeByName("light")!.name).toBe("light-truecolor")
  })

  test("defaults to ansi16 dark for unknown names", () => {
    expect(getThemeByName("nonexistent")!.name).toBe("dark-ansi16")
  })
})

describe("getPaletteByName", () => {
  test("returns palette by name", () => {
    const p = getPaletteByName("nord")
    expect(p).toBeDefined()
    expect(p!.name).toBe("nord")
  })

  test("returns undefined for unknown", () => {
    expect(getPaletteByName("nonexistent")).toBeUndefined()
  })
})
