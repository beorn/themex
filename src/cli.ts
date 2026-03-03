#!/usr/bin/env bun
/**
 * themex CLI — Theme exploration and generation tool.
 *
 * Usage:
 *   bun cli                          # List all built-in themes
 *   bun cli list                     # List all built-in themes
 *   bun cli show <name>              # Show theme details + color swatches
 *   bun cli generate <primary>       # Generate theme from primary color
 *   bun cli generate <primary> --light  # Light variant
 *   bun cli import <file.yaml>       # Import Base16 YAML
 *   bun cli export <name>            # Export theme as Base16 YAML
 *   bun cli validate <name>          # Validate a palette
 */

import { builtinPalettes, getPaletteByName, builtinThemes, getThemeByName } from "./palettes/index.js"
import { deriveTheme } from "./derive.js"
import { generateTheme } from "./generate.js"
import { validatePalette } from "./validate.js"
import { exportBase16 } from "./export/base16.js"
import { importBase16 } from "./import/base16.js"
import { resolveThemeColor } from "./resolve.js"
import type { Theme, ThemePalette, AnsiPrimary } from "./types.js"

// ANSI color helpers for terminal output
const esc = (code: string) => `\x1b[${code}m`
const reset = esc("0")
const bold = (s: string) => `${esc("1")}${s}${reset}`
const dim = (s: string) => `${esc("2")}${s}${reset}`
const fgRgb = (r: number, g: number, b: number, s: string) => `${esc(`38;2;${r};${g};${b}`)}${s}${reset}`
const bgRgb = (r: number, g: number, b: number, s: string) => `${esc(`48;2;${r};${g};${b}`)}${s}${reset}`

function hexToRgbTuple(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]
}

function colorSwatch(hex: string, width = 2): string {
  if (!hex || !hex.startsWith("#")) return dim(hex.padEnd(width))
  const [r, g, b] = hexToRgbTuple(hex)
  return bgRgb(r, g, b, " ".repeat(width))
}

function colorLabel(hex: string, label: string): string {
  if (!hex || !hex.startsWith("#")) return `${dim(hex.padEnd(7))} ${label}`
  const [r, g, b] = hexToRgbTuple(hex)
  return `${colorSwatch(hex)} ${fgRgb(r, g, b, hex)} ${label}`
}

// Commands

function listThemes() {
  const names = Object.keys(builtinPalettes)
  console.log(bold("Built-in Themes") + dim(` (${names.length} palettes)`))
  console.log()

  const families = new Map<string, string[]>()
  for (const name of names) {
    const family = name.split("-")[0]
    if (!families.has(family)) families.set(family, [])
    families.get(family)!.push(name)
  }

  for (const [family, names] of families) {
    console.log(bold(`  ${family}`))
    for (const name of names) {
      const palette = getPaletteByName(name)!
      const dark = palette.base ? isDarkPalette(palette) : true
      const mode = dark ? dim("dark") : dim("light")
      // Show accent colors as swatches
      const accents = [palette.red, palette.green, palette.yellow, palette.blue, palette.purple, palette.teal]
        .filter(Boolean)
        .map((c) => colorSwatch(c!, 1))
        .join("")
      console.log(`    ${name.padEnd(24)} ${mode.padEnd(15)} ${accents}`)
    }
  }
  console.log()
  console.log(dim(`Use 'bun cli show <name>' for details`))
}

function isDarkPalette(p: ThemePalette): boolean {
  if (!p.base) return true
  const [r, g, b] = hexToRgbTuple(p.base)
  return (r + g + b) / 3 < 128
}

function showTheme(name: string) {
  const palette = getPaletteByName(name)
  if (!palette) {
    console.error(`Theme "${name}" not found. Use 'bun cli list' to see available themes.`)
    process.exit(1)
  }

  const theme = deriveTheme(palette)
  console.log(bold(`Theme: ${name}`) + dim(` (${theme.dark ? "dark" : "light"})`))
  console.log()

  // Surface ramp
  console.log(bold("  Surface Ramp"))
  console.log(`    ${colorLabel(palette.crust, "crust")}`)
  console.log(`    ${colorLabel(palette.base, "base")}`)
  console.log(`    ${colorLabel(palette.surface, "surface")}`)
  console.log(`    ${colorLabel(palette.overlay, "overlay")}`)
  console.log(`    ${colorLabel(palette.subtext, "subtext")}`)
  console.log(`    ${colorLabel(palette.text, "text")}`)
  console.log()

  // Accent hues
  console.log(bold("  Accent Hues"))
  const hues = ["red", "orange", "yellow", "green", "teal", "blue", "purple", "pink"] as const
  for (const hue of hues) {
    const color = palette[hue]
    if (color) console.log(`    ${colorLabel(color, hue)}`)
  }
  console.log()

  // Derived semantic tokens
  console.log(bold("  Semantic Tokens"))
  const tokens = [
    ["primary", theme.primary],
    ["link", theme.link],
    ["control", theme.control],
    ["selected", theme.selected],
    ["selectedfg", theme.selectedfg],
    ["focusring", theme.focusring],
    ["text", theme.text],
    ["text2", theme.text2],
    ["text3", theme.text3],
    ["text4", theme.text4],
    ["bg", theme.bg],
    ["surface", theme.surface],
    ["separator", theme.separator],
    ["error", theme.error],
    ["warning", theme.warning],
    ["success", theme.success],
  ] as const

  for (const [label, value] of tokens) {
    console.log(`    ${colorLabel(value, label)}`)
  }
  console.log()

  // Palette
  console.log(bold("  16-Color Palette"))
  const row1 = theme.palette.slice(0, 8).map((c) => colorSwatch(c, 3)).join("")
  const row2 = theme.palette.slice(8, 16).map((c) => colorSwatch(c, 3)).join("")
  console.log(`    ${row1}  0-7`)
  console.log(`    ${row2}  8-15`)
}

function generateCmd(primary: string, light: boolean) {
  const validPrimaries = ["yellow", "cyan", "magenta", "green", "red", "blue", "white"]
  if (!validPrimaries.includes(primary)) {
    // Try as hex → use builder
    if (primary.startsWith("#") && primary.length === 7) {
      const { createTheme } = require("./builder.js")
      const theme = createTheme().primary(primary).build()
      showDerivedTheme(theme, `custom (${primary}, ${light ? "light" : "dark"})`)
      return
    }
    console.error(`Unknown primary "${primary}". Valid: ${validPrimaries.join(", ")}`)
    process.exit(1)
  }

  const theme = generateTheme(primary as AnsiPrimary, !light)
  showDerivedTheme(theme, `${primary} (${light ? "light" : "dark"})`)
}

function showDerivedTheme(theme: Theme, label: string) {
  console.log(bold(`Generated Theme: ${label}`))
  console.log()
  const keys = [
    "primary", "link", "control", "selected", "selectedfg", "focusring",
    "text", "text2", "text3", "text4", "bg", "surface", "separator",
    "error", "warning", "success",
  ] as const
  for (const key of keys) {
    const value = theme[key]
    console.log(`  ${key.padEnd(12)} ${value}`)
  }
}

async function importCmd(file: string) {
  const content = await Bun.file(file).text()
  const palette = importBase16(content)
  if (!palette) {
    console.error(`Failed to parse Base16 YAML from ${file}`)
    process.exit(1)
  }
  console.log(bold(`Imported: ${palette.name || file}`))
  console.log(JSON.stringify(palette, null, 2))
}

function exportCmd(name: string) {
  const palette = getPaletteByName(name)
  if (!palette) {
    console.error(`Theme "${name}" not found.`)
    process.exit(1)
  }
  console.log(exportBase16(palette))
}

function validateCmd(name: string) {
  const palette = getPaletteByName(name)
  if (!palette) {
    console.error(`Theme "${name}" not found.`)
    process.exit(1)
  }
  const result = validatePalette(palette)
  if (result.valid) {
    console.log(`${bold("✓")} ${name}: valid palette`)
  } else {
    console.log(`${bold("✗")} ${name}: invalid palette`)
    for (const error of result.errors) {
      console.log(`  - ${error}`)
    }
  }
  if (result.warnings.length > 0) {
    for (const warning of result.warnings) {
      console.log(`  ⚠ ${warning}`)
    }
  }
}

// Main
const args = process.argv.slice(2)
const command = args[0] || "list"

switch (command) {
  case "list":
  case "ls":
    listThemes()
    break
  case "show":
  case "info":
    if (!args[1]) {
      console.error("Usage: bun cli show <theme-name>")
      process.exit(1)
    }
    showTheme(args[1])
    break
  case "generate":
  case "gen":
    if (!args[1]) {
      console.error("Usage: bun cli generate <primary> [--light]")
      process.exit(1)
    }
    generateCmd(args[1], args.includes("--light"))
    break
  case "import":
    if (!args[1]) {
      console.error("Usage: bun cli import <file.yaml>")
      process.exit(1)
    }
    await importCmd(args[1])
    break
  case "export":
    if (!args[1]) {
      console.error("Usage: bun cli export <theme-name>")
      process.exit(1)
    }
    exportCmd(args[1])
    break
  case "validate":
    if (!args[1]) {
      console.error("Usage: bun cli validate <theme-name>")
      process.exit(1)
    }
    validateCmd(args[1])
    break
  case "help":
  case "--help":
  case "-h":
    console.log(`${bold("themex")} — Universal color themes

${bold("Commands:")}
  list                    List all built-in themes
  show <name>             Show theme details + color swatches
  generate <primary>      Generate ANSI 16 theme from primary color
  import <file.yaml>      Import Base16 YAML to ThemePalette
  export <name>           Export palette as Base16 YAML
  validate <name>         Validate a palette

${bold("Options:")}
  --light                 Generate light variant (with generate)
  --help                  Show this help`)
    break
  default:
    // Maybe it's a theme name — show it
    if (getPaletteByName(command)) {
      showTheme(command)
    } else {
      console.error(`Unknown command: ${command}. Use --help for usage.`)
      process.exit(1)
    }
}
