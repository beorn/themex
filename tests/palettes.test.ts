import { describe, expect, test } from "vitest"
import { deriveTheme } from "../src/derive.js"
import { builtinPalettes, getThemeByName, getPaletteByName } from "../src/palettes/index.js"
import { validateColorPalette } from "../src/validate.js"
import type { Theme, ColorPalette } from "../src/types.js"

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

describe("all built-in palettes produce valid themes", () => {
  for (const [name, palette] of Object.entries(builtinPalettes)) {
    test(`${name} derives a valid theme`, () => {
      const theme = deriveTheme(palette)

      // Basic structure
      expect(theme.name).toBe(name)
      expect(theme.palette).toHaveLength(16)

      // All 33 semantic tokens are non-empty strings
      for (const key of THEME_TOKEN_KEYS) {
        const val = theme[key]
        expect(typeof val).toBe("string")
        expect(val, `${key} should be truthy`).toBeTruthy()
      }
    })

    test(`${name} passes validation`, () => {
      const result = validateColorPalette(palette)
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
    // dark-truecolor is derived from Nord, so its name is "nord"
    expect(getThemeByName("dark-truecolor")!.name).toBe("nord")
    expect(getThemeByName("light-ansi16")!.name).toBe("light-ansi16")
  })

  test("returns theme derived from palette name", () => {
    const theme = getThemeByName("catppuccin-mocha")
    expect(theme.name).toBe("catppuccin-mocha")
  })

  test("supports backward-compat aliases", () => {
    // "dark" alias points to defaultDarkTheme (derived from Nord → name "nord")
    // "light" alias points to defaultLightTheme (derived from Catppuccin Latte → name "catppuccin-latte")
    expect(getThemeByName("dark")!.name).toBe("nord")
    expect(getThemeByName("light")!.name).toBe("catppuccin-latte")
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
