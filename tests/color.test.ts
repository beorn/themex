import { describe, expect, test } from "vitest"
import { blend, brighten, complement, contrastFg, darken, desaturate, hexToRgb, rgbToHex } from "../src/color.js"

describe("hexToRgb", () => {
  test("parses valid hex colors", () => {
    expect(hexToRgb("#000000")).toEqual([0, 0, 0])
    expect(hexToRgb("#FFFFFF")).toEqual([255, 255, 255])
    expect(hexToRgb("#2E3440")).toEqual([46, 52, 64])
    expect(hexToRgb("#ff0000")).toEqual([255, 0, 0])
  })

  test("returns null for non-hex strings", () => {
    expect(hexToRgb("red")).toBeNull()
    expect(hexToRgb("blueBright")).toBeNull()
    expect(hexToRgb("")).toBeNull()
    expect(hexToRgb("#GGG")).toBeNull()
  })
})

describe("rgbToHex", () => {
  test("converts rgb to hex", () => {
    expect(rgbToHex(0, 0, 0)).toBe("#000000")
    expect(rgbToHex(255, 255, 255)).toBe("#FFFFFF")
    expect(rgbToHex(46, 52, 64)).toBe("#2E3440")
  })

  test("clamps out-of-range values", () => {
    expect(rgbToHex(-10, 300, 128)).toBe("#00FF80")
  })
})

describe("blend", () => {
  test("t=0 returns first color", () => {
    expect(blend("#000000", "#FFFFFF", 0)).toBe("#000000")
  })

  test("t=1 returns second color", () => {
    expect(blend("#000000", "#FFFFFF", 1)).toBe("#FFFFFF")
  })

  test("t=0.5 returns midpoint", () => {
    expect(blend("#000000", "#FFFFFF", 0.5)).toBe("#808080")
  })

  test("returns first color for non-hex inputs", () => {
    expect(blend("red", "#FFFFFF", 0.5)).toBe("red")
    expect(blend("#FFFFFF", "blue", 0.5)).toBe("#FFFFFF")
  })
})

describe("brighten", () => {
  test("brightens toward white", () => {
    const result = brighten("#000000", 0.5)
    expect(result).toBe("#808080")
  })

  test("100% brightness = white", () => {
    expect(brighten("#000000", 1)).toBe("#FFFFFF")
  })
})

describe("darken", () => {
  test("darkens toward black", () => {
    const result = darken("#FFFFFF", 0.5)
    expect(result).toBe("#808080")
  })

  test("100% darkness = black", () => {
    expect(darken("#FFFFFF", 1)).toBe("#000000")
  })
})

describe("contrastFg", () => {
  test("returns black for light backgrounds", () => {
    expect(contrastFg("#FFFFFF")).toBe("#000000")
    expect(contrastFg("#F5F5F5")).toBe("#000000")
    expect(contrastFg("#EBCB8B")).toBe("#000000") // Nord yellow
  })

  test("returns white for dark backgrounds", () => {
    expect(contrastFg("#000000")).toBe("#FFFFFF")
    expect(contrastFg("#2E3440")).toBe("#FFFFFF") // Nord bg
    expect(contrastFg("#1E1E2E")).toBe("#FFFFFF") // Catppuccin Mocha base
  })

  test("defaults to white for non-hex inputs", () => {
    expect(contrastFg("red")).toBe("#FFFFFF")
  })
})

describe("desaturate", () => {
  test("reduces saturation by the given amount", () => {
    // A fully saturated red
    const result = desaturate("#FF0000", 0.5)
    // Result should be less saturated but same hue
    const rgb = hexToRgb(result)!
    expect(rgb[0]).toBeGreaterThan(rgb[1]) // Still reddish
    expect(rgb[0]).toBeGreaterThan(rgb[2])
    // With reduced saturation, the green and blue channels should increase
    expect(rgb[1]).toBeGreaterThan(0)
  })

  test("amount=0 returns original color", () => {
    const result = desaturate("#FF0000", 0)
    expect(result).toBe("#FF0000")
  })

  test("returns non-hex colors unchanged", () => {
    expect(desaturate("red", 0.5)).toBe("red")
  })
})

describe("complement", () => {
  test("rotates hue by 180 degrees", () => {
    // Red complement should be cyan-ish
    const result = complement("#FF0000")
    const rgb = hexToRgb(result)!
    // Complement of pure red is cyan (0, 255, 255)
    expect(rgb[0]).toBeLessThan(rgb[1])
    expect(rgb[2]).toBeGreaterThan(0)
  })

  test("double complement returns near-original", () => {
    const original = "#5E81AC"
    const double = complement(complement(original))
    // Should be very close to original (rounding may cause slight difference)
    const origRgb = hexToRgb(original)!
    const doubleRgb = hexToRgb(double)!
    for (let i = 0; i < 3; i++) {
      expect(Math.abs(origRgb[i]! - doubleRgb[i]!)).toBeLessThanOrEqual(1)
    }
  })

  test("returns non-hex colors unchanged", () => {
    expect(complement("blue")).toBe("blue")
  })
})
