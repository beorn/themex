#!/usr/bin/env bun
/**
 * themex CLI -- Theme exploration and generation tool.
 *
 * Usage:
 *   bun cli                          # Show help
 *   bun cli view                     # Interactive fullscreen theme browser
 *   bun cli list                     # List all built-in themes
 *   bun cli show <name>              # Show theme details + color swatches
 *   bun cli colors                   # Show all themes' accent colors in a grid
 *   bun cli compare <a> <b>          # Side-by-side theme comparison
 *   bun cli search <query>           # Filter themes by name
 *   bun cli json <name>              # Output theme as JSON (for piping)
 *   bun cli generate <primary>       # Generate theme from primary color
 *   bun cli generate <primary> --light  # Light variant
 *   bun cli import <file.yaml>       # Import Base16 YAML
 *   bun cli export <name>            # Export theme as Base16 YAML
 *   bun cli validate <name>          # Validate a palette
 */

import { builtinPalettes, getPaletteByName, builtinThemes } from "./palettes/index.js"
import { deriveTheme } from "./derive.js"
import { generateTheme } from "./generate.js"
import { validateColorPalette } from "./validate.js"
import { exportBase16 } from "./export/base16.js"
import { importBase16 } from "./import/base16.js"
import type { Theme, ColorPalette, AnsiPrimary } from "./types.js"

// ============================================================================
// ANSI Escape Helpers
// ============================================================================

const esc = (code: string) => `\x1b[${code}m`
const reset = esc("0")
const bold = (s: string) => `${esc("1")}${s}${reset}`
const dim = (s: string) => `${esc("2")}${s}${reset}`
const underline = (s: string) => `${esc("4")}${s}${reset}`
const fgRgb = (r: number, g: number, b: number, s: string) => `${esc(`38;2;${r};${g};${b}`)}${s}${reset}`
const bgRgb = (r: number, g: number, b: number, s: string) => `${esc(`48;2;${r};${g};${b}`)}${s}${reset}`

// ============================================================================
// Color Utilities
// ============================================================================

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]
}

function isHex(s: string): boolean {
  return s.startsWith("#") && s.length === 7
}

function colorSwatch(hex: string, width = 2): string {
  if (!isHex(hex)) return dim(hex.padEnd(width))
  const [r, g, b] = hexToRgb(hex)
  return bgRgb(r, g, b, " ".repeat(width))
}

function colorLabel(hex: string, label: string): string {
  if (!isHex(hex)) return `${dim(hex.padEnd(7))} ${label}`
  const [r, g, b] = hexToRgb(hex)
  return `${colorSwatch(hex)} ${fgRgb(r, g, b, hex)} ${label}`
}

/** Render text in the foreground color of a hex value. */
function colored(hex: string, text: string): string {
  if (!isHex(hex)) return text
  const [r, g, b] = hexToRgb(hex)
  return fgRgb(r, g, b, text)
}

function isDarkPalette(p: ColorPalette): boolean {
  if (!p.background) return true
  const [r, g, b] = hexToRgb(p.background)
  return (r + g + b) / 3 < 128
}

// ============================================================================
// Box Drawing
// ============================================================================

const box = {
  tl: "\u250c",
  tr: "\u2510",
  bl: "\u2514",
  br: "\u2518",
  h: "\u2500",
  v: "\u2502",
  tee: "\u252c",
  btee: "\u2534",
  ltee: "\u251c",
  rtee: "\u2524",
  cross: "\u253c",
} as const

function hline(width: number, char = box.h): string {
  return char.repeat(width)
}

function boxBottom(width: number): string {
  return dim(`${box.bl}${hline(width)}${box.br}`)
}

function boxHeader(title: string, width: number): string {
  const pad = width - title.length - 2
  return dim(`${box.tl}${box.h} `) + bold(title) + dim(` ${hline(Math.max(0, pad))}${box.tr}`)
}

// ============================================================================
// Commands
// ============================================================================

function listThemes() {
  const names = Object.keys(builtinPalettes)
  console.log()
  console.log(bold("  themex") + dim(` -- ${names.length} built-in palettes`))
  console.log()

  const families = new Map<string, string[]>()
  for (const name of names) {
    const family = name.split("-")[0]!
    if (!families.has(family)) families.set(family, [])
    families.get(family)!.push(name)
  }

  // Table header
  const nameW = 26
  const modeW = 7
  console.log(`  ${dim(box.tl + hline(nameW) + box.tee + hline(modeW) + box.tee + hline(10) + box.tr)}`)
  console.log(
    `  ${dim(box.v)} ${bold("Theme".padEnd(nameW - 1))}${dim(box.v)} ${bold("Mode".padEnd(modeW - 1))}${dim(box.v)} ${bold("Accents".padEnd(9))}${dim(box.v)}`,
  )
  console.log(`  ${dim(box.ltee + hline(nameW) + box.cross + hline(modeW) + box.cross + hline(10) + box.rtee)}`)

  let first = true
  for (const [family, members] of families) {
    if (!first) {
      console.log(`  ${dim(box.ltee + hline(nameW) + box.cross + hline(modeW) + box.cross + hline(10) + box.rtee)}`)
    }
    first = false

    for (const name of members) {
      const palette = getPaletteByName(name)!
      const dark = isDarkPalette(palette)
      const mode = dark ? "dark" : "light"
      const accents = [palette.red, palette.green, palette.yellow, palette.blue, palette.magenta, palette.cyan]
        .filter((c) => c && isHex(c))
        .map((c) => colorSwatch(c!, 1))
        .join("")

      const displayName = colored(palette.blue || palette.cyan, name)
      // Pad accounting for ANSI escapes in displayName
      const namePad = " ".repeat(Math.max(0, nameW - 1 - name.length))

      console.log(
        `  ${dim(box.v)} ${displayName}${namePad}${dim(box.v)} ${dim(mode.padEnd(modeW - 1))}${dim(box.v)} ${accents}  ${dim(box.v)}`,
      )
    }
  }

  console.log(`  ${dim(box.bl + hline(nameW) + box.btee + hline(modeW) + box.btee + hline(10) + box.br)}`)
  console.log()
  console.log(dim(`  Commands: show <name> | colors | compare <a> <b> | search <q> | json <name>`))
  console.log()
}

// ── show ─────────────────────────────────────────────────────────────

function showTheme(name: string) {
  const palette = getPaletteByName(name)
  if (!palette) {
    console.error(`Theme "${name}" not found. Use 'bun cli list' to see available themes.`)
    process.exit(1)
  }

  const theme = deriveTheme(palette)
  const isDark = palette.dark !== false
  const w = 48
  console.log()
  console.log(boxHeader(name, w) + dim(` ${isDark ? "dark" : "light"}`))
  console.log()

  // ANSI palette colors
  console.log(bold("  ANSI Colors"))
  const ansiKeys = ["black", "red", "green", "yellow", "blue", "magenta", "cyan", "white"] as const
  for (const key of ansiKeys) {
    console.log(`    ${colorLabel(palette[key], key)}`)
  }
  console.log()

  // Special colors
  console.log(bold("  Special Colors"))
  const specialKeys = [
    "foreground",
    "background",
    "cursorColor",
    "cursorText",
    "selectionBackground",
    "selectionForeground",
  ] as const
  for (const key of specialKeys) {
    console.log(`    ${colorLabel(palette[key], key)}`)
  }
  console.log()

  // Semantic tokens grouped
  console.log(bold("  Semantic Tokens"))
  const groups: [string, [string, string][]][] = [
    [
      "Brand",
      [
        ["primary", theme.primary],
        ["primaryfg", theme.primaryfg],
        ["link", theme.link],
        ["inputborder", theme.inputborder],
      ],
    ],
    [
      "Selection",
      [
        ["selection", theme.selection],
        ["selectionfg", theme.selectionfg],
        ["focusborder", theme.focusborder],
      ],
    ],
    [
      "Text",
      [
        ["fg", theme.fg],
        ["mutedfg", theme.mutedfg],
        ["disabledfg", theme.disabledfg],
      ],
    ],
    [
      "Surface",
      [
        ["bg", theme.bg],
        ["surface", theme.surface],
        ["border", theme.border],
      ],
    ],
    [
      "Chrome",
      [
        ["inverse", theme.inverse],
        ["inversefg", theme.inversefg],
      ],
    ],
    [
      "Status",
      [
        ["error", theme.error],
        ["warning", theme.warning],
        ["success", theme.success],
        ["info", theme.info],
      ],
    ],
  ]

  for (const [group, tokens] of groups) {
    const items = tokens.map(([label, value]) => {
      if (!isHex(value)) return `${dim(value.padEnd(7))} ${dim(label)}`
      return `${colorSwatch(value)} ${colored(value, label)}`
    })
    console.log(`    ${dim(group.padEnd(11))} ${items.join("  ")}`)
  }
  console.log()

  // 16-color palette
  console.log(bold("  16-Color Palette"))
  const row1 = theme.palette
    .slice(0, 8)
    .map((c) => colorSwatch(c, 3))
    .join("")
  const row2 = theme.palette
    .slice(8, 16)
    .map((c) => colorSwatch(c, 3))
    .join("")
  console.log(`    ${row1}  ${dim("0-7")}`)
  console.log(`    ${row2}  ${dim("8-15")}`)

  console.log()
  console.log(boxBottom(w))
  console.log()
}

// ── colors ───────────────────────────────────────────────────────────

function colorsGrid() {
  const names = Object.keys(builtinPalettes)
  const ansiColors = ["red", "green", "yellow", "blue", "magenta", "cyan"] as const

  console.log()
  console.log(bold("  ANSI Colors") + dim(` -- ${names.length} themes`))
  console.log()

  // Header
  const nameW = 24
  const hueW = 3
  const header = ansiColors.map((h) => h.slice(0, 3).padEnd(hueW)).join(" ")
  console.log(`  ${"".padEnd(nameW)} ${dim(header)}`)
  console.log(`  ${dim(hline(nameW + 1 + ansiColors.length * (hueW + 1)))}`)

  for (const name of names) {
    const palette = getPaletteByName(name)!
    const swatches = ansiColors
      .map((color) => {
        const c = palette[color]
        if (!c || !isHex(c)) return dim(" ".repeat(hueW))
        return colorSwatch(c, hueW)
      })
      .join(" ")

    const dark = isDarkPalette(palette)
    const modeChar = dark ? dim("d") : dim("l")
    console.log(`  ${colored(palette.blue || palette.cyan, name.padEnd(nameW - 2))} ${modeChar} ${swatches}`)
  }

  console.log()
}

// ── compare ──────────────────────────────────────────────────────────

function compareThemes(name1: string, name2: string) {
  const palette1 = getPaletteByName(name1)
  const palette2 = getPaletteByName(name2)

  if (!palette1) {
    console.error(`Theme "${name1}" not found.`)
    process.exit(1)
  }
  if (!palette2) {
    console.error(`Theme "${name2}" not found.`)
    process.exit(1)
  }

  const theme1 = deriveTheme(palette1)
  const theme2 = deriveTheme(palette2)

  const colW = 32
  const sepCol = ` ${dim(box.v)} `

  console.log()
  console.log(bold("  Compare: ") + colored(palette1.blue, name1) + dim(" vs ") + colored(palette2.blue, name2))
  console.log()

  // Header
  console.log(`  ${bold(name1.padEnd(colW))}${sepCol}${bold(name2)}`)
  console.log(`  ${dim(hline(colW))}${dim(box.cross)}${dim(hline(colW + 1))}`)

  // Mode
  const mode1 = palette1.dark !== false ? "dark" : "light"
  const mode2 = palette2.dark !== false ? "dark" : "light"
  console.log(`  ${dim("Mode: ") + mode1.padEnd(colW - 6)}${sepCol}${dim("Mode: ") + mode2}`)
  console.log()

  // ANSI colors side by side
  console.log(`  ${bold("ANSI Colors".padEnd(colW))}${sepCol}${bold("ANSI Colors")}`)
  const ansiKeys = ["black", "red", "green", "yellow", "blue", "magenta", "cyan", "white"] as const
  for (const key of ansiKeys) {
    const c1 = palette1[key]
    const c2 = palette2[key]
    const left = `${colorSwatch(c1)} ${isHex(c1) ? colored(c1, c1) : c1} ${dim(key)}`
    const right = `${colorSwatch(c2)} ${isHex(c2) ? colored(c2, c2) : c2} ${dim(key)}`
    const leftRaw = `XX ${c1} ${key}`
    const pad = " ".repeat(Math.max(0, colW - leftRaw.length))
    console.log(`  ${left}${pad}${sepCol}${right}`)
  }
  console.log()

  // Special colors side by side
  console.log(`  ${bold("Special Colors".padEnd(colW))}${sepCol}${bold("Special Colors")}`)
  const specialKeys = [
    "foreground",
    "background",
    "cursorColor",
    "cursorText",
    "selectionBackground",
    "selectionForeground",
  ] as const
  for (const key of specialKeys) {
    const c1 = palette1[key]
    const c2 = palette2[key]
    const fmtCell = (c: string, k: string) => {
      if (!isHex(c)) return dim(`${c.padEnd(7)} ${k}`)
      return `${colorSwatch(c)} ${colored(c, c)} ${dim(k)}`
    }
    const left = fmtCell(c1, key)
    const right = fmtCell(c2, key)
    const leftRaw = `XX ${c1} ${key}`
    const pad = " ".repeat(Math.max(0, colW - leftRaw.length))
    console.log(`  ${left}${pad}${sepCol}${right}`)
  }
  console.log()

  // Semantic tokens side by side
  console.log(`  ${bold("Semantic Tokens".padEnd(colW))}${sepCol}${bold("Semantic Tokens")}`)
  const tokenKeys: (keyof Theme)[] = [
    "primary",
    "primaryfg",
    "link",
    "inputborder",
    "selection",
    "selectionfg",
    "focusborder",
    "fg",
    "mutedfg",
    "disabledfg",
    "bg",
    "surface",
    "border",
    "inverse",
    "inversefg",
    "error",
    "warning",
    "success",
    "info",
  ]

  for (const key of tokenKeys) {
    const v1 = theme1[key] as string
    const v2 = theme2[key] as string
    const fmtToken = (v: string, k: string) => {
      if (!isHex(v)) return dim(`${v.padEnd(7)} ${k}`)
      return `${colorSwatch(v)} ${colored(v, v)} ${dim(k)}`
    }
    const left = fmtToken(v1, key)
    const right = fmtToken(v2, key)
    const leftRaw = `XX ${v1} ${key}`
    const pad = " ".repeat(Math.max(0, colW - leftRaw.length))
    console.log(`  ${left}${pad}${sepCol}${right}`)
  }
  console.log()

  // 16-color palette side by side
  console.log(`  ${bold("Palette".padEnd(colW))}${sepCol}${bold("Palette")}`)
  for (const [start, label] of [
    [0, "0-7"],
    [8, "8-15"],
  ] as const) {
    const r1 = theme1.palette
      .slice(start, start + 8)
      .map((c) => colorSwatch(c, 3))
      .join("")
    const r2 = theme2.palette
      .slice(start, start + 8)
      .map((c) => colorSwatch(c, 3))
      .join("")
    // Each row is 24 visible chars (8 * 3)
    const pad = " ".repeat(Math.max(0, colW - 24 - label.length - 1))
    console.log(`  ${r1} ${dim(label)}${pad}${sepCol}${r2} ${dim(label)}`)
  }
  console.log()
}

// ── search ───────────────────────────────────────────────────────────

function searchThemes(query: string) {
  const q = query.toLowerCase()
  const names = Object.keys(builtinPalettes)
  const matches = names.filter((name) => name.toLowerCase().includes(q))

  console.log()
  if (matches.length === 0) {
    console.log(dim(`  No themes matching "${query}"`))
    console.log()
    return
  }

  console.log(bold(`  Search: "${query}"`) + dim(` -- ${matches.length} match${matches.length === 1 ? "" : "es"}`))
  console.log()

  const ansiColors = ["red", "green", "yellow", "blue", "magenta", "cyan"] as const

  for (const name of matches) {
    const palette = getPaletteByName(name)!
    const dark = isDarkPalette(palette)
    const mode = dark ? dim("dark ") : dim("light")
    const accents = ansiColors
      .map((color) => {
        const c = palette[color]
        if (!c || !isHex(c)) return dim(" ")
        return colorSwatch(c, 1)
      })
      .join("")

    // Highlight the matching part in the name
    const idx = name.toLowerCase().indexOf(q)
    const before = name.slice(0, idx)
    const match = name.slice(idx, idx + q.length)
    const after = name.slice(idx + q.length)
    const highlighted = `${before}${bold(underline(match))}${after}`

    console.log(
      `  ${highlighted.padEnd(24 + (highlighted.length - name.length))} ${mode} ${accents}  ${dim(palette.background)}`,
    )
  }
  console.log()
}

// ── json ─────────────────────────────────────────────────────────────

function jsonTheme(name: string) {
  const palette = getPaletteByName(name)
  if (!palette) {
    // Check if it's a pre-built theme
    const theme = builtinThemes[name]
    if (theme) {
      console.log(JSON.stringify(theme, null, 2))
      return
    }
    console.error(`Theme "${name}" not found.`)
    process.exit(1)
  }

  const theme = deriveTheme(palette)
  const output = {
    palette,
    theme,
  }
  console.log(JSON.stringify(output, null, 2))
}

// ── generate ─────────────────────────────────────────────────────────

function generateCmd(primary: string, light: boolean) {
  const validPrimaries = ["yellow", "cyan", "magenta", "green", "red", "blue", "white"]
  if (!validPrimaries.includes(primary)) {
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
  console.log()
  console.log(bold(`  Generated: ${label}`))
  console.log()

  const groups: [string, [string, string][]][] = [
    [
      "Brand",
      [
        ["primary", theme.primary],
        ["primaryfg", theme.primaryfg],
        ["link", theme.link],
        ["inputborder", theme.inputborder],
      ],
    ],
    [
      "Selection",
      [
        ["selection", theme.selection],
        ["selectionfg", theme.selectionfg],
        ["focusborder", theme.focusborder],
      ],
    ],
    [
      "Text",
      [
        ["fg", theme.fg],
        ["mutedfg", theme.mutedfg],
        ["disabledfg", theme.disabledfg],
      ],
    ],
    [
      "Surface",
      [
        ["bg", theme.bg],
        ["surface", theme.surface],
        ["border", theme.border],
      ],
    ],
    [
      "Chrome",
      [
        ["inverse", theme.inverse],
        ["inversefg", theme.inversefg],
      ],
    ],
    [
      "Status",
      [
        ["error", theme.error],
        ["warning", theme.warning],
        ["success", theme.success],
        ["info", theme.info],
      ],
    ],
  ]

  for (const [group, tokens] of groups) {
    console.log(`  ${dim(group)}`)
    for (const [key, value] of tokens) {
      if (isHex(value)) {
        console.log(`    ${colorSwatch(value)} ${colored(value, value)} ${key}`)
      } else {
        console.log(`    ${dim(value.padEnd(7))} ${key}`)
      }
    }
  }

  console.log()
  if (theme.palette.length > 0) {
    console.log(`  ${bold("Palette")}`)
    const row1 = theme.palette
      .slice(0, 8)
      .map((c) => colorSwatch(c, 3))
      .join("")
    const row2 = theme.palette
      .slice(8, 16)
      .map((c) => colorSwatch(c, 3))
      .join("")
    console.log(`    ${row1}  ${dim("0-7")}`)
    console.log(`    ${row2}  ${dim("8-15")}`)
    console.log()
  }
}

// ── import / export / validate ───────────────────────────────────────

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
  const result = validateColorPalette(palette)
  if (result.valid) {
    console.log(`${bold("OK")} ${name}: valid palette`)
  } else {
    console.log(`${bold("FAIL")} ${name}: invalid palette`)
    for (const error of result.errors) {
      console.log(`  - ${error}`)
    }
  }
  if (result.warnings.length > 0) {
    for (const warning of result.warnings) {
      console.log(`  ! ${warning}`)
    }
  }
}

// ============================================================================
// Help
// ============================================================================

function showHelp() {
  console.log(`
${bold("swatch")} ${dim("--")} Universal color themes

${bold("Interactive")}
  ${colored("#88C0D0", "view")}                    Fullscreen theme browser ${dim("(bun view)")}

${bold("Browse")}
  ${colored("#88C0D0", "list")}                    List all ${Object.keys(builtinPalettes).length} built-in themes
  ${colored("#88C0D0", "show")} <name>             Show theme details + color swatches
  ${colored("#88C0D0", "colors")}                  Accent color grid for all themes
  ${colored("#88C0D0", "compare")} <a> <b>         Side-by-side theme comparison
  ${colored("#88C0D0", "search")} <query>          Filter themes by name

${bold("Generate")}
  ${colored("#88C0D0", "generate")} <primary>      Generate ANSI 16 theme from primary color
  ${colored("#88C0D0", "json")} <name>             Output theme as JSON ${dim("(for piping)")}

${bold("Import / Export")}
  ${colored("#88C0D0", "import")} <file.yaml>      Import Base16 YAML to ColorPalette
  ${colored("#88C0D0", "export")} <name>           Export palette as Base16 YAML
  ${colored("#88C0D0", "validate")} <name>         Validate a palette

${bold("Options")}
  --light                 Generate light variant ${dim("(with generate)")}
  --help                  Show this help
`)
}

// ============================================================================
// Main
// ============================================================================

const args = process.argv.slice(2)
const command = args[0] || "help"

switch (command) {
  case "view":
  case "browse": {
    // Dynamically import the view TUI (separate file with React/hightea)
    await import("./view.js")
    break
  }
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
  case "colors":
    colorsGrid()
    break
  case "compare":
  case "cmp":
  case "diff":
    if (!args[1] || !args[2]) {
      console.error("Usage: bun cli compare <theme1> <theme2>")
      process.exit(1)
    }
    compareThemes(args[1], args[2])
    break
  case "search":
  case "find":
  case "grep":
    if (!args[1]) {
      console.error("Usage: bun cli search <query>")
      process.exit(1)
    }
    searchThemes(args[1])
    break
  case "json":
    if (!args[1]) {
      console.error("Usage: bun cli json <theme-name>")
      process.exit(1)
    }
    jsonTheme(args[1])
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
    showHelp()
    break
  default:
    // Maybe it's a theme name -- show it
    if (getPaletteByName(command)) {
      showTheme(command)
    } else {
      console.error(`Unknown command: ${command}. Use --help for usage.`)
      process.exit(1)
    }
}
