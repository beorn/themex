import { describe, expect, test } from "vitest"
import { deriveTheme } from "../src/derive.js"
import { catppuccinMocha, catppuccinLatte } from "../src/palettes/catppuccin.js"
import { nord } from "../src/palettes/nord.js"
import { dracula } from "../src/palettes/dracula.js"
import { solarizedDark, solarizedLight } from "../src/palettes/solarized.js"
import { blend, contrastFg } from "../src/color.js"
import type { Theme } from "../src/types.js"

/** All 33 semantic token keys. */
const ALL_TOKEN_KEYS: (keyof Theme)[] = [
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

describe("deriveTheme (truecolor)", () => {
  test("derives a valid theme from Catppuccin Mocha", () => {
    const theme = deriveTheme(catppuccinMocha)
    expect(theme.name).toBe("catppuccin-mocha")
    // Dark palette → yellow primary
    expect(theme.primary).toBe(catppuccinMocha.yellow)
    expect(theme.link).toBe(catppuccinMocha.blue)
    expect(theme.focusborder).toBe(catppuccinMocha.blue)
    expect(theme.fg).toBe(catppuccinMocha.foreground)
    expect(theme.bg).toBe(catppuccinMocha.background)
    expect(theme.error).toBe(catppuccinMocha.red)
    expect(theme.warning).toBe(catppuccinMocha.yellow)
    expect(theme.success).toBe(catppuccinMocha.green)
    expect(theme.info).toBe(catppuccinMocha.cyan)
    expect(theme.selection).toBe(catppuccinMocha.selectionBackground)
    expect(theme.selectionfg).toBe(catppuccinMocha.selectionForeground)
    expect(theme.cursor).toBe(catppuccinMocha.cursorColor)
    expect(theme.cursorfg).toBe(catppuccinMocha.cursorText)
  })

  test("dark theme defaults to yellow primary", () => {
    const theme = deriveTheme(catppuccinMocha)
    expect(theme.primary).toBe(catppuccinMocha.yellow)
  })

  test("light theme defaults to blue primary", () => {
    const theme = deriveTheme(catppuccinLatte)
    expect(theme.primary).toBe(catppuccinLatte.blue)
  })

  test("derives valid theme from Nord", () => {
    const theme = deriveTheme(nord)
    expect(theme.name).toBe("nord")
    expect(theme.primary).toBe(nord.yellow)
    expect(theme.bg).toBe(nord.background)
    expect(theme.palette).toHaveLength(16)
  })

  test("derives valid theme from Dracula", () => {
    const theme = deriveTheme(dracula)
    expect(theme.name).toBe("dracula")
    expect(theme.fg).toBe(dracula.foreground)
  })

  test("derives valid theme from Solarized Dark", () => {
    const theme = deriveTheme(solarizedDark)
    expect(theme.error).toBe(solarizedDark.red)
  })

  test("derives valid theme from Solarized Light", () => {
    const theme = deriveTheme(solarizedLight)
    expect(theme.primary).toBe(solarizedLight.blue) // light → blue primary
  })

  test("all 33 tokens are present and non-empty", () => {
    const theme = deriveTheme(catppuccinMocha)
    for (const key of ALL_TOKEN_KEYS) {
      expect(theme[key], `${key} should be truthy`).toBeTruthy()
    }
  })

  test("palette has 16 entries", () => {
    const theme = deriveTheme(catppuccinMocha)
    expect(theme.palette).toHaveLength(16)
  })

  test("surface is derived via blend from bg and fg", () => {
    const theme = deriveTheme(catppuccinMocha)
    const expected = blend(catppuccinMocha.background, catppuccinMocha.foreground, 0.05)
    expect(theme.surface).toBe(expected)
  })

  test("mutedfg is blended foreground toward background", () => {
    const theme = deriveTheme(catppuccinMocha)
    const expected = blend(catppuccinMocha.foreground, catppuccinMocha.background, 0.7)
    expect(theme.mutedfg).toBe(expected)
  })

  test("primaryfg is contrast against primary color", () => {
    const theme = deriveTheme(catppuccinMocha)
    expect(theme.primaryfg).toBe(contrastFg(catppuccinMocha.yellow))
  })

  test("border is derived via blend", () => {
    const theme = deriveTheme(catppuccinMocha)
    const expected = blend(catppuccinMocha.background, catppuccinMocha.foreground, 0.15)
    expect(theme.border).toBe(expected)
  })

  test("inverse is derived from foreground blended toward background", () => {
    const theme = deriveTheme(catppuccinMocha)
    const expected = blend(catppuccinMocha.foreground, catppuccinMocha.background, 0.1)
    expect(theme.inverse).toBe(expected)
  })
})

describe("deriveTheme (ansi16)", () => {
  test("derives ansi16 theme from dark palette", () => {
    const theme = deriveTheme(catppuccinMocha, "ansi16")
    expect(theme.name).toBe("catppuccin-mocha")
    expect(theme.primary).toBe(catppuccinMocha.yellow) // dark → yellow
    expect(theme.bg).toBe(catppuccinMocha.background)
    expect(theme.fg).toBe(catppuccinMocha.foreground)
    expect(theme.surface).toBe(catppuccinMocha.black)
    expect(theme.border).toBe(catppuccinMocha.brightBlack)
    expect(theme.focusborder).toBe(catppuccinMocha.brightBlue)
    expect(theme.link).toBe(catppuccinMocha.brightBlue)
    expect(theme.error).toBe(catppuccinMocha.brightRed)
    expect(theme.success).toBe(catppuccinMocha.brightGreen)
  })

  test("derives ansi16 theme from light palette", () => {
    const theme = deriveTheme(catppuccinLatte, "ansi16")
    expect(theme.primary).toBe(catppuccinLatte.blue) // light → blue
    expect(theme.focusborder).toBe(catppuccinLatte.blue)
    expect(theme.link).toBe(catppuccinLatte.blue)
    expect(theme.error).toBe(catppuccinLatte.red)
    expect(theme.success).toBe(catppuccinLatte.green)
  })

  test("ansi16 theme has all 33 tokens", () => {
    const theme = deriveTheme(nord, "ansi16")
    for (const key of ALL_TOKEN_KEYS) {
      expect(theme[key], `${key} should be truthy`).toBeTruthy()
    }
    expect(theme.palette).toHaveLength(16)
  })

  test("ansi16 uses direct palette aliases (no blending)", () => {
    const theme = deriveTheme(catppuccinMocha, "ansi16")
    // In ansi16 mode, surface = black (direct alias, no blend)
    expect(theme.surface).toBe(catppuccinMocha.black)
    expect(theme.surfacefg).toBe(catppuccinMocha.foreground)
    expect(theme.mutedfg).toBe(catppuccinMocha.white)
    expect(theme.disabledfg).toBe(catppuccinMocha.brightBlack)
  })
})

describe("deriveTheme — truecolor vs ansi16 mode differences", () => {
  test("truecolor and ansi16 produce different surface values", () => {
    const tc = deriveTheme(nord, "truecolor")
    const a16 = deriveTheme(nord, "ansi16")
    // Truecolor blends, ansi16 uses direct alias
    expect(tc.surface).not.toBe(a16.surface)
  })

  test("both modes have same palette passthrough", () => {
    const tc = deriveTheme(nord, "truecolor")
    const a16 = deriveTheme(nord, "ansi16")
    expect(tc.palette).toEqual(a16.palette)
  })
})
