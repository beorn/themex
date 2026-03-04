import { describe, expect, test } from "vitest"
import { importBase16, base16ToColorPalette } from "../src/import/base16.js"
import { exportBase16 } from "../src/export/base16.js"
import type { Base16Scheme } from "../src/import/types.js"

// ============================================================================
// Solarized Dark — canonical Base16 scheme for testing
// ============================================================================

const solarizedDarkYaml = `
scheme: "Solarized Dark"
author: "Ethan Schoonover (http://ethanschoonover.com/solarized)"
base00: "002b36"
base01: "073642"
base02: "586e75"
base03: "657b83"
base04: "839496"
base05: "93a1a1"
base06: "eee8d5"
base07: "fdf6e3"
base08: "dc322f"
base09: "cb4b16"
base0A: "b58900"
base0B: "859900"
base0C: "2aa198"
base0D: "268bd2"
base0E: "6c71c4"
base0F: "d33682"
`

// ============================================================================
// Import Tests
// ============================================================================

describe("importBase16", () => {
  test("imports Solarized Dark with correct field mapping", () => {
    const palette = importBase16(solarizedDarkYaml)

    expect(palette.name).toBe("Solarized Dark")
    expect(palette.dark).toBe(true)

    // ColorPalette mapping:
    //   base00 → background, base01 → brightBlack, base02 → selectionBackground,
    //   base03 → white, base05 → foreground/brightWhite,
    //   base08 → red, base09 → brightRed, base0A → yellow,
    //   base0B → green, base0C → cyan, base0D → blue, base0E → magenta,
    //   base0F → brightMagenta
    expect(palette.background).toBe("#002B36")
    expect(palette.brightBlack).toBe("#073642")
    expect(palette.selectionBackground).toBe("#586E75")
    expect(palette.white).toBe("#657B83")
    expect(palette.foreground).toBe("#93A1A1")
    expect(palette.brightWhite).toBe("#93A1A1")

    // black is derived (darker than background for dark themes)
    expect(palette.black).not.toBe(palette.background)

    // Accent hues
    expect(palette.red).toBe("#DC322F")
    expect(palette.brightRed).toBe("#CB4B16")
    expect(palette.yellow).toBe("#B58900")
    expect(palette.green).toBe("#859900")
    expect(palette.cyan).toBe("#2AA198")
    expect(palette.blue).toBe("#268BD2")
    expect(palette.magenta).toBe("#6C71C4")
    expect(palette.brightMagenta).toBe("#D33682")
  })

  test("detects dark theme from low-luminance base00", () => {
    const palette = importBase16(solarizedDarkYaml)
    expect(palette.dark).toBe(true)
  })

  test("detects light theme from high-luminance base00", () => {
    const lightYaml = `
scheme: "Solarized Light"
author: "Ethan Schoonover"
base00: "fdf6e3"
base01: "eee8d5"
base02: "93a1a1"
base03: "839496"
base04: "657b83"
base05: "586e75"
base06: "073642"
base07: "002b36"
base08: "dc322f"
base09: "cb4b16"
base0A: "b58900"
base0B: "859900"
base0C: "2aa198"
base0D: "268bd2"
base0E: "6c71c4"
base0F: "d33682"
`
    const palette = importBase16(lightYaml)
    expect(palette.dark).toBe(false)
    expect(palette.name).toBe("Solarized Light")
    // black is derived (brighter than background for light themes)
    expect(palette.black).not.toBe(palette.background)
  })

  test("handles quoted and unquoted YAML values", () => {
    const mixedYaml = `
scheme: Gruvbox Dark
author: "Gordon Chiam"
base00: "282828"
base01: 3c3836
base02: "504945"
base03: "665c54"
base04: "bdae93"
base05: "d5c4a1"
base06: "ebdbb2"
base07: "fbf1c7"
base08: "fb4934"
base09: "fe8019"
base0A: "fabd2f"
base0B: "b8bb26"
base0C: "8ec07c"
base0D: "83a598"
base0E: "d3869b"
base0F: "d65d0e"
`
    const palette = importBase16(mixedYaml)
    expect(palette.name).toBe("Gruvbox Dark")
    expect(palette.background).toBe("#282828")
    expect(palette.brightBlack).toBe("#3C3836")
  })

  test("handles single-quoted values", () => {
    const singleQuoted = `
scheme: 'Test Theme'
author: 'Author'
base00: '002b36'
base01: '073642'
base02: '586e75'
base03: '657b83'
base04: '839496'
base05: '93a1a1'
base06: 'eee8d5'
base07: 'fdf6e3'
base08: 'dc322f'
base09: 'cb4b16'
base0A: 'b58900'
base0B: '859900'
base0C: '2aa198'
base0D: '268bd2'
base0E: '6c71c4'
base0F: 'd33682'
`
    const palette = importBase16(singleQuoted)
    expect(palette.name).toBe("Test Theme")
    expect(palette.background).toBe("#002B36")
  })

  test("skips comments and blank lines", () => {
    const withComments = `
# This is a comment
scheme: "Test"
author: "Tester"

# Colors below
base00: "002b36"
base01: "073642"
base02: "586e75"
base03: "657b83"
base04: "839496"
base05: "93a1a1"
base06: "eee8d5"
base07: "fdf6e3"
base08: "dc322f"
base09: "cb4b16"
base0A: "b58900"
base0B: "859900"
base0C: "2aa198"
base0D: "268bd2"
base0E: "6c71c4"
base0F: "d33682"
`
    const palette = importBase16(withComments)
    expect(palette.name).toBe("Test")
    expect(palette.background).toBe("#002B36")
  })

  test("throws on missing scheme name", () => {
    const noScheme = `
author: "Nobody"
base00: "000000"
base01: "111111"
base02: "222222"
base03: "333333"
base04: "444444"
base05: "555555"
base06: "666666"
base07: "777777"
base08: "888888"
base09: "999999"
base0A: "aaaaaa"
base0B: "bbbbbb"
base0C: "cccccc"
base0D: "dddddd"
base0E: "eeeeee"
base0F: "ffffff"
`
    expect(() => importBase16(noScheme)).toThrow("missing required field: scheme")
  })

  test("throws on missing color field", () => {
    const missingColor = `
scheme: "Incomplete"
author: "Nobody"
base00: "000000"
base01: "111111"
`
    expect(() => importBase16(missingColor)).toThrow("missing required color: base02")
  })

  test("throws on invalid hex format", () => {
    const badHex = `
scheme: "Bad"
author: "Nobody"
base00: "GGGGGG"
base01: "111111"
base02: "222222"
base03: "333333"
base04: "444444"
base05: "555555"
base06: "666666"
base07: "777777"
base08: "888888"
base09: "999999"
base0A: "aaaaaa"
base0B: "bbbbbb"
base0C: "cccccc"
base0D: "dddddd"
base0E: "eeeeee"
base0F: "ffffff"
`
    expect(() => importBase16(badHex)).toThrow("Base16 color base00 must be a 6-digit hex string without '#'")
  })
})

describe("base16ToColorPalette", () => {
  test("accepts a pre-parsed Base16Scheme object", () => {
    const scheme: Base16Scheme = {
      scheme: "Direct",
      author: "Test",
      base00: "1a1b26",
      base01: "16161e",
      base02: "2f3549",
      base03: "444b6a",
      base04: "787c99",
      base05: "a9b1d6",
      base06: "cbccd1",
      base07: "d5d6db",
      base08: "f7768e",
      base09: "ff9e64",
      base0A: "e0af68",
      base0B: "9ece6a",
      base0C: "449dab",
      base0D: "7aa2f7",
      base0E: "9d7cd8",
      base0F: "db4b4b",
    }
    const palette = base16ToColorPalette(scheme)
    expect(palette.name).toBe("Direct")
    expect(palette.background).toBe("#1A1B26")
    expect(palette.blue).toBe("#7AA2F7")
  })
})

// ============================================================================
// Export Tests
// ============================================================================

describe("exportBase16", () => {
  test("exports palette to valid Base16 YAML", () => {
    const palette = importBase16(solarizedDarkYaml)
    const yaml = exportBase16(palette)

    // Check basic structure
    expect(yaml).toContain('scheme: "Solarized Dark"')
    expect(yaml).toContain('base00: "002B36"')
    expect(yaml).toContain('base01: "073642"')
    expect(yaml).toContain('base02: "586E75"')
    expect(yaml).toContain('base03: "657B83"')
    expect(yaml).toContain('base05: "93A1A1"')
    expect(yaml).toContain('base08: "DC322F"')
    expect(yaml).toContain('base0D: "268BD2"')
    expect(yaml).toContain('base0F: "D33682"')
  })

  test("includes interpolated base04, base06, base07", () => {
    const palette = importBase16(solarizedDarkYaml)
    const yaml = exportBase16(palette)

    // base04, base06, base07 should be present
    expect(yaml).toMatch(/base04: "[0-9A-Fa-f]{6}"/)
    expect(yaml).toMatch(/base06: "[0-9A-Fa-f]{6}"/)
    expect(yaml).toMatch(/base07: "[0-9A-Fa-f]{6}"/)
  })

  test("ends with newline", () => {
    const palette = importBase16(solarizedDarkYaml)
    const yaml = exportBase16(palette)
    expect(yaml.endsWith("\n")).toBe(true)
  })

  test("hex values have no # prefix", () => {
    const palette = importBase16(solarizedDarkYaml)
    const yaml = exportBase16(palette)

    // All base values should be bare hex (no #)
    const colorLines = yaml.split("\n").filter((l) => l.startsWith("base"))
    for (const line of colorLines) {
      const match = /: "([^"]+)"/.exec(line)
      expect(match).not.toBeNull()
      expect(match![1]).not.toContain("#")
      expect(match![1]).toMatch(/^[0-9A-Fa-f]{6}$/)
    }
  })
})

// ============================================================================
// Round-Trip Tests
// ============================================================================

describe("round-trip", () => {
  test("import -> export -> import preserves mapped colors", () => {
    const palette1 = importBase16(solarizedDarkYaml)
    const yaml = exportBase16(palette1)
    const palette2 = importBase16(yaml)

    // All directly-mapped fields should survive the round trip
    expect(palette2.name).toBe(palette1.name)
    expect(palette2.dark).toBe(palette1.dark)
    expect(palette2.background).toBe(palette1.background)
    expect(palette2.brightBlack).toBe(palette1.brightBlack)
    expect(palette2.selectionBackground).toBe(palette1.selectionBackground)
    expect(palette2.white).toBe(palette1.white)
    expect(palette2.foreground).toBe(palette1.foreground)
    expect(palette2.red).toBe(palette1.red)
    expect(palette2.brightRed).toBe(palette1.brightRed)
    expect(palette2.yellow).toBe(palette1.yellow)
    expect(palette2.green).toBe(palette1.green)
    expect(palette2.cyan).toBe(palette1.cyan)
    expect(palette2.blue).toBe(palette1.blue)
    expect(palette2.magenta).toBe(palette1.magenta)
    expect(palette2.brightMagenta).toBe(palette1.brightMagenta)
  })

  test("round-trip preserves black derivation", () => {
    const palette1 = importBase16(solarizedDarkYaml)
    const yaml = exportBase16(palette1)
    const palette2 = importBase16(yaml)

    // black is derived from base00 each time, so it should be identical
    expect(palette2.black).toBe(palette1.black)
  })
})
