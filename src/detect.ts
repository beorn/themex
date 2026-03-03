/**
 * Terminal palette auto-detection via OSC queries.
 *
 * Detects the terminal's actual colors by querying:
 * - OSC 10: foreground (text) color
 * - OSC 11: background color
 * - OSC 4;0–15: ANSI 16 palette colors
 *
 * Then maps the detected colors to a partial ThemePalette for
 * theme generation via createTheme().
 *
 * Supported by: Ghostty, Kitty, WezTerm, iTerm2, foot, Alacritty, xterm
 * NOT supported by: tmux (blocks OSC), basic xterm, CI environments
 */

import {
  queryForegroundColor,
  queryBackgroundColor,
  queryMultiplePaletteColors,
  parsePaletteResponse,
} from "inkx"
import type { ThemePalette } from "./types.js"

/** Result of terminal palette detection. */
export interface DetectedPalette {
  /** Terminal foreground color (#RRGGBB), or null if undetected */
  fg: string | null
  /** Terminal background color (#RRGGBB), or null if undetected */
  bg: string | null
  /** ANSI 16 palette colors (index 0-15), null entries = undetected */
  ansi: (string | null)[]
  /** Whether the terminal appears to be dark mode (from bg luminance) */
  dark: boolean
  /** Partial ThemePalette derived from detected colors */
  palette: Partial<ThemePalette>
}

/**
 * Detect the terminal's color palette via OSC queries.
 *
 * Must be called BEFORE entering alternate screen / fullscreen mode,
 * as some terminals don't respond to OSC in alternate screen.
 *
 * @param timeoutMs How long to wait for each response (default 150ms)
 * @returns Detected palette, or null if terminal doesn't support OSC queries
 */
export async function detectTerminalPalette(timeoutMs = 150): Promise<DetectedPalette | null> {
  const stdin = process.stdin
  const stdout = process.stdout

  if (!stdin.isTTY || !stdout.isTTY) return null

  const wasRaw = stdin.isRaw
  if (!wasRaw) stdin.setRawMode(true)

  // Buffer for collecting responses
  let buffer = ""
  const onData = (chunk: Buffer) => {
    buffer += chunk.toString()
  }
  stdin.on("data", onData)

  try {
    const write = (s: string) => {
      stdout.write(s)
    }

    const read = (ms: number): Promise<string | null> =>
      new Promise((resolve) => {
        // Check if we already have data in the buffer
        if (buffer.length > 0) {
          const result = buffer
          buffer = ""
          resolve(result)
          return
        }

        const timer = setTimeout(() => {
          resolve(buffer.length > 0 ? buffer : null)
          buffer = ""
        }, ms)

        const check = (_chunk: Buffer) => {
          clearTimeout(timer)
          stdin.removeListener("data", check)
          const result = buffer
          buffer = ""
          resolve(result)
        }
        stdin.on("data", check)
      })

    // Query bg and fg first
    const bg = await queryBackgroundColor(write, read, timeoutMs)
    const fg = await queryForegroundColor(write, read, timeoutMs)

    // Query ANSI 16 palette
    const ansi: (string | null)[] = new Array(16).fill(null)
    queryMultiplePaletteColors(
      Array.from({ length: 16 }, (_, i) => i),
      write,
    )

    // Wait for responses, collecting as they arrive
    await new Promise((resolve) => setTimeout(resolve, timeoutMs))

    // Parse any buffered palette responses
    const remaining = buffer
    buffer = ""
    if (remaining) {
      // Parse all palette responses from the buffer
      // Responses may be concatenated
      const oscPrefix = "\x1b]4;"
      let pos = 0
      while (pos < remaining.length) {
        const nextOsc = remaining.indexOf(oscPrefix, pos)
        if (nextOsc === -1) break

        // Find the end (BEL or ST)
        let end = remaining.indexOf("\x07", nextOsc)
        if (end === -1) end = remaining.indexOf("\x1b\\", nextOsc)
        if (end === -1) break

        const chunk = remaining.slice(nextOsc, end + 1)
        const parsed = parsePaletteResponse(chunk)
        if (parsed && parsed.index >= 0 && parsed.index < 16) {
          ansi[parsed.index] = parsed.color
        }
        pos = end + 1
      }
    }

    // Determine dark/light from bg
    const dark = bg ? isDarkColor(bg) : true

    // Build partial palette from detected colors
    const palette: Partial<ThemePalette> = { dark }
    if (bg) {
      palette.crust = bg
      palette.base = bg
    }
    if (fg) {
      palette.text = fg
    }

    // Map ANSI colors to palette hues
    // Standard ANSI: 0=black, 1=red, 2=green, 3=yellow, 4=blue, 5=magenta, 6=cyan, 7=white
    // Bright:        8=bright black, 9=bright red, ...
    if (ansi[1]) palette.red = ansi[1]
    if (ansi[2]) palette.green = ansi[2]
    if (ansi[3]) palette.yellow = ansi[3]
    if (ansi[4]) palette.blue = ansi[4]
    if (ansi[6]) palette.teal = ansi[6]

    // Derive orange from red + yellow midpoint (or use bright red if distinct hue)
    // Derive pink from red + magenta midpoint (or use magenta)
    if (ansi[5]) palette.purple = ansi[5]

    // Surface ramp from ANSI grayscale
    if (ansi[8]) palette.surface = ansi[8] // bright black = slightly lighter bg
    if (ansi[7]) palette.subtext = ansi[7] // white = dimmer text

    return { fg, bg, ansi, dark, palette }
  } finally {
    stdin.removeListener("data", onData)
    if (!wasRaw) stdin.setRawMode(false)
  }
}

/** Check if a #RRGGBB color is dark (luminance <= 0.5). */
function isDarkColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return luminance <= 0.5
}
