import { describe, expect, test } from "vitest"
import { deriveTheme, isWarm } from "../src/derive.js"
import { catppuccinMocha, catppuccinLatte } from "../src/palettes/catppuccin.js"
import { nord } from "../src/palettes/nord.js"
import { dracula } from "../src/palettes/dracula.js"
import { solarizedDark, solarizedLight } from "../src/palettes/solarized.js"

describe("isWarm", () => {
  test("warm hues", () => {
    expect(isWarm("red")).toBe(true)
    expect(isWarm("orange")).toBe(true)
    expect(isWarm("yellow")).toBe(true)
    expect(isWarm("green")).toBe(true)
    expect(isWarm("pink")).toBe(true)
    expect(isWarm("purple")).toBe(true)
  })

  test("cool hues", () => {
    expect(isWarm("teal")).toBe(false)
    expect(isWarm("blue")).toBe(false)
  })
})

describe("deriveTheme", () => {
  test("derives a valid theme from Catppuccin Mocha", () => {
    const theme = deriveTheme(catppuccinMocha)
    expect(theme.name).toBe("catppuccin-mocha")
    expect(theme.dark).toBe(true)
    expect(theme.primary).toBe(catppuccinMocha.yellow) // default dark accent = yellow
    expect(theme.link).toBe(catppuccinMocha.blue)
    expect(theme.text).toBe(catppuccinMocha.text)
    expect(theme.text2).toBe(catppuccinMocha.subtext)
    expect(theme.bg).toBe(catppuccinMocha.base)
    expect(theme.surface).toBe(catppuccinMocha.surface)
    expect(theme.separator).toBe(catppuccinMocha.overlay)
    expect(theme.error).toBe(catppuccinMocha.red)
    expect(theme.warning).toBe(catppuccinMocha.orange)
    expect(theme.success).toBe(catppuccinMocha.green)
    expect(theme.focusring).toBe(catppuccinMocha.blue)
    // Dark theme: chromebg = text (inverted)
    expect(theme.chromebg).toBe(catppuccinMocha.text)
    expect(theme.chromefg).toBe(catppuccinMocha.crust)
  })

  test("dark theme defaults to yellow accent, selects teal for selection", () => {
    const theme = deriveTheme(catppuccinMocha)
    expect(theme.primary).toBe(catppuccinMocha.yellow)
    expect(theme.selected).toBe(catppuccinMocha.teal) // warm → teal
  })

  test("light theme defaults to blue accent, selects yellow for selection", () => {
    const theme = deriveTheme(catppuccinLatte)
    expect(theme.primary).toBe(catppuccinLatte.blue) // default light accent = blue
    expect(theme.selected).toBe(catppuccinLatte.yellow) // cool → yellow
  })

  test("custom accent override", () => {
    const theme = deriveTheme(catppuccinMocha, { accent: "blue" })
    expect(theme.primary).toBe(catppuccinMocha.blue)
    expect(theme.selected).toBe(catppuccinMocha.yellow) // cool → yellow
  })

  test("derives valid theme from Nord", () => {
    const theme = deriveTheme(nord)
    expect(theme.name).toBe("nord")
    expect(theme.dark).toBe(true)
    expect(theme.primary).toBe(nord.yellow)
    expect(theme.bg).toBe(nord.base)
    expect(theme.palette).toHaveLength(16)
  })

  test("derives valid theme from Dracula", () => {
    const theme = deriveTheme(dracula)
    expect(theme.name).toBe("dracula")
    expect(theme.dark).toBe(true)
    expect(theme.text).toBe(dracula.text)
  })

  test("derives valid theme from Solarized Dark", () => {
    const theme = deriveTheme(solarizedDark)
    expect(theme.dark).toBe(true)
    expect(theme.error).toBe(solarizedDark.red)
  })

  test("derives valid theme from Solarized Light", () => {
    const theme = deriveTheme(solarizedLight)
    expect(theme.dark).toBe(false)
    // Light theme: chromebg = crust (inverted)
    expect(theme.chromebg).toBe(solarizedLight.crust)
    expect(theme.chromefg).toBe(solarizedLight.text)
  })

  test("palette has 16 entries", () => {
    const theme = deriveTheme(catppuccinMocha)
    expect(theme.palette).toHaveLength(16)
  })

  test("text3 is blend of subtext and overlay", () => {
    const theme = deriveTheme(catppuccinMocha)
    // text3 should be between subtext and overlay
    expect(theme.text3).toBeTruthy()
    expect(theme.text3).not.toBe(catppuccinMocha.subtext)
    expect(theme.text3).not.toBe(catppuccinMocha.overlay)
  })

  test("control is blend of primary and overlay", () => {
    const theme = deriveTheme(catppuccinMocha)
    expect(theme.control).toBeTruthy()
    expect(theme.control).not.toBe(catppuccinMocha.yellow) // should be muted
  })
})
