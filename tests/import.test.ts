import { describe, expect, test } from "vitest"
import { importBase16, base16ToPalette } from "../src/import/base16.js"
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

    // Surface ramp (base00→base, base01→surface, etc.)
    expect(palette.base).toBe("#002B36")
    expect(palette.surface).toBe("#073642")
    expect(palette.overlay).toBe("#586E75")
    expect(palette.subtext).toBe("#657B83")
    expect(palette.text).toBe("#93A1A1")

    // Crust is derived (darker than base for dark themes)
    expect(palette.crust).not.toBe(palette.base)
    // Should be darker than base00
    expect(palette.crust.toLowerCase() < palette.base.toLowerCase()).toBe(true)

    // Accent hues
    expect(palette.red).toBe("#DC322F")
    expect(palette.orange).toBe("#CB4B16")
    expect(palette.yellow).toBe("#B58900")
    expect(palette.green).toBe("#859900")
    expect(palette.teal).toBe("#2AA198")
    expect(palette.blue).toBe("#268BD2")
    expect(palette.purple).toBe("#6C71C4")
    expect(palette.pink).toBe("#D33682")
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
    // Crust should be brighter than base for light themes
    expect(palette.crust).not.toBe(palette.base)
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
    expect(palette.base).toBe("#282828")
    expect(palette.surface).toBe("#3C3836")
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
    expect(palette.base).toBe("#002B36")
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
    expect(palette.base).toBe("#002B36")
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
    expect(() => importBase16(badHex)).toThrow('Base16 color base00 must be a 6-digit hex string without \'#\'')
  })
})

describe("base16ToPalette", () => {
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
    const palette = base16ToPalette(scheme)
    expect(palette.name).toBe("Direct")
    expect(palette.base).toBe("#1A1B26")
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
  test("import → export → import preserves mapped colors", () => {
    const palette1 = importBase16(solarizedDarkYaml)
    const yaml = exportBase16(palette1)
    const palette2 = importBase16(yaml)

    // All directly-mapped fields should survive the round trip
    expect(palette2.name).toBe(palette1.name)
    expect(palette2.dark).toBe(palette1.dark)
    expect(palette2.base).toBe(palette1.base)
    expect(palette2.surface).toBe(palette1.surface)
    expect(palette2.overlay).toBe(palette1.overlay)
    expect(palette2.subtext).toBe(palette1.subtext)
    expect(palette2.text).toBe(palette1.text)
    expect(palette2.red).toBe(palette1.red)
    expect(palette2.orange).toBe(palette1.orange)
    expect(palette2.yellow).toBe(palette1.yellow)
    expect(palette2.green).toBe(palette1.green)
    expect(palette2.teal).toBe(palette1.teal)
    expect(palette2.blue).toBe(palette1.blue)
    expect(palette2.purple).toBe(palette1.purple)
    expect(palette2.pink).toBe(palette1.pink)
  })

  test("round-trip preserves crust derivation", () => {
    const palette1 = importBase16(solarizedDarkYaml)
    const yaml = exportBase16(palette1)
    const palette2 = importBase16(yaml)

    // Crust is derived from base00 each time, so it should be identical
    expect(palette2.crust).toBe(palette1.crust)
  })
})
