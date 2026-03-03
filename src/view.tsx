#!/usr/bin/env bun
/**
 * themex view — Interactive fullscreen theme browser + generator.
 *
 * Modes (Tab to switch):
 *   Browse   — scroll through 45 built-in themes (dark/light grouped)
 *   Generate — enter 1-3 hex colors, see live preview
 *   Detect   — auto-detect terminal palette, generate theme from it
 *
 * Keys: j/k navigate, / search, Tab mode, q quit.
 */

import React, { useState, useMemo, useCallback } from "react"
import { Box, Text, ThemeProvider } from "inkx"
import { run, useInput, type Key } from "inkx/runtime"
import { builtinPalettes, getPaletteByName } from "./palettes/index.js"
import { deriveTheme } from "./derive.js"
import { createTheme } from "./builder.js"
import type { Theme, ThemePalette } from "./types.js"
import { resolveThemeColor } from "./resolve.js"
import { detectTerminalPalette, type DetectedPalette } from "./detect.js"

// ── Types ─────────────────────────────────────────────────────────────

interface ThemeEntry {
  name: string
  palette: ThemePalette
  theme: Theme
}

type Mode = "browse" | "generate" | "detect"

// ── Data ──────────────────────────────────────────────────────────────

type ListItem = { type: "theme"; entry: ThemeEntry } | { type: "header"; label: string }

const allThemeEntries: ThemeEntry[] = Object.keys(builtinPalettes).map((name) => {
  const palette = getPaletteByName(name)!
  return { name, palette, theme: deriveTheme(palette) }
})

function buildListItems(entries: ThemeEntry[]): ListItem[] {
  const dark = entries.filter((e) => e.theme.dark)
  const light = entries.filter((e) => !e.theme.dark)
  const items: ListItem[] = []
  if (dark.length > 0) {
    items.push({ type: "header", label: `Dark (${dark.length})` })
    for (const entry of dark) items.push({ type: "theme", entry })
  }
  if (light.length > 0) {
    items.push({ type: "header", label: `Light (${light.length})` })
    for (const entry of light) items.push({ type: "theme", entry })
  }
  return items
}

const allItems = buildListItems(allThemeEntries)

// ── Showcase Panel ────────────────────────────────────────────────────

const SURFACE_KEYS = ["crust", "base", "surface", "overlay", "subtext", "text"] as const
const HUE_KEYS = ["red", "orange", "yellow", "green", "teal", "blue", "purple", "pink"] as const

const SEMANTIC_GROUPS: [string, (keyof Theme)[]][] = [
  ["Brand", ["primary", "link", "control"]],
  ["Selection", ["selected", "selectedfg", "focusring"]],
  ["Text", ["text", "text2", "text3", "text4"]],
  ["Surface", ["bg", "surface", "separator"]],
  ["Chrome", ["chromebg", "chromefg"]],
  ["Status", ["error", "warning", "success"]],
]

function ShowcasePanel({ theme, palette, label }: { theme: Theme; palette: ThemePalette; label: string }) {
  const r = (token: string) => resolveThemeColor(token, theme) ?? ""

  return (
    <Box flexDirection="column" flexGrow={1} paddingLeft={1} paddingRight={1}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <Box>
        <Text color={r("$primary")} bold>{label}</Text>
        <Text color={r("$text3")}>{theme.dark ? " dark" : " light"}</Text>
      </Box>

      {/* ── Code Sample ────────────────────────────────────────── */}
      <Box marginTop={1} flexDirection="column" borderStyle="single" borderColor={r("$separator")} paddingX={1}>
        <Text color={r("$text4")}>{"1 "}<Text color={r("$control")}>import</Text><Text color={r("$text")}> {"{ "}</Text><Text color={r("$text")}>{`createTheme`}</Text><Text color={r("$text")}>{" } "}</Text><Text color={r("$control")}>from</Text><Text color={palette.green}>{` "themex"`}</Text></Text>
        <Text color={r("$text4")}>{"2"}</Text>
        <Text color={r("$text4")}>{"3 "}<Text color={r("$control")}>const</Text><Text color={r("$text")}> theme = </Text><Text color={palette.blue}>createTheme</Text><Text color={r("$text")}>()</Text></Text>
        <Text color={r("$text4")}>{"4   "}<Text color={r("$text")}>.</Text><Text color={palette.blue}>bg</Text><Text color={r("$text")}>(</Text><Text color={palette.green}>{`"${palette.base}"`}</Text><Text color={r("$text")}>)</Text></Text>
        <Text color={r("$text4")}>{"5   "}<Text color={r("$text")}>.</Text><Text color={palette.blue}>primary</Text><Text color={r("$text")}>(</Text><Text color={palette.green}>{`"${theme.primary}"`}</Text><Text color={r("$text")}>)</Text></Text>
        <Text color={r("$text4")}>{"6   "}<Text color={r("$text")}>.</Text><Text color={palette.blue}>build</Text><Text color={r("$text")}>()</Text><Text color={r("$text3")}>{" // → Theme"}</Text></Text>
      </Box>

      {/* ── UI Components ──────────────────────────────────────── */}
      {/* Text hierarchy */}
      <Box marginTop={1} flexDirection="column">
        <Text color={r("$text")}>$text <Text color={r("$text2")}>$text2 <Text color={r("$text3")}>$text3 <Text color={r("$text4")}>$text4</Text></Text></Text></Text>
      </Box>

      {/* Buttons + tabs */}
      <Box gap={1} marginTop={1}>
        <Text backgroundColor={r("$primary")} color={r("$bg")}>{" Save "}</Text>
        <Text backgroundColor={r("$surface")} color={r("$text")}>{" Cancel "}</Text>
        <Text backgroundColor={r("$error")} color={r("$bg")}>{" Delete "}</Text>
        <Text color={r("$text3")}>{"  "}</Text>
        <Text backgroundColor={r("$primary")} color={r("$bg")}>{" Files "}</Text>
        <Text backgroundColor={r("$surface")} color={r("$text2")}>{" Search "}</Text>
      </Box>

      {/* Focus ring + dropdown */}
      <Box marginTop={1} flexDirection="column">
        <Box>
          <Text color={r("$text3")}>Input </Text>
          <Text color={r("$focusring")}>│</Text>
          <Text backgroundColor={r("$surface")} color={r("$text")}>{" Search... "}</Text>
          <Text color={r("$focusring")}>│</Text>
          <Text color={r("$text3")}>{"  "}</Text>
          <Text color={r("$focusring")}>╭──────────────╮</Text>
        </Box>
        <Box>
          <Text>{"                     "}</Text>
          <Text color={r("$focusring")}>│</Text>
          <Text backgroundColor={r("$selected")} color={r("$selectedfg")}>{" First item   "}</Text>
          <Text color={r("$focusring")}>│</Text>
        </Box>
        <Box>
          <Text>{"                     "}</Text>
          <Text color={r("$focusring")}>│</Text>
          <Text backgroundColor={r("$surface")} color={r("$text")}>{" Second item  "}</Text>
          <Text color={r("$focusring")}>│</Text>
        </Box>
        <Box>
          <Text>{"                     "}</Text>
          <Text color={r("$focusring")}>╰──────────────╯</Text>
        </Box>
      </Box>

      {/* Status + links */}
      <Box marginTop={1} flexDirection="column">
        <Text><Text color={r("$success")}>{" ✓ "}</Text><Text color={r("$text")}>Build passed</Text><Text color={r("$text3")}> · 42 tests</Text></Text>
        <Text><Text color={r("$warning")}>{" ⚠ "}</Text><Text color={r("$text")}>3 updates</Text><Text color={r("$text3")}> · npm audit</Text></Text>
        <Text><Text color={r("$error")}>{" ✗ "}</Text><Text color={r("$text")}>Connection refused</Text><Text color={r("$text3")}> · port 5432</Text></Text>
        <Box>
          <Text>{"   "}</Text>
          <Text color={r("$link")} underline>docs</Text>
          <Text color={r("$separator")}> · </Text>
          <Text color={r("$link")} underline>api</Text>
          <Text color={r("$separator")}> · </Text>
          <Text color={r("$link")} underline>source</Text>
        </Box>
      </Box>

      {/* File tree */}
      <Box marginTop={1} flexDirection="column">
        <Text color={r("$primary")} bold>{"  src/"}</Text>
        <Text color={r("$text3")}>{"  ├── "}<Text color={palette.blue}>index.ts</Text></Text>
        <Text color={r("$text3")}>{"  ├── "}<Text color={palette.green}>types.ts</Text></Text>
        <Text color={r("$text3")}>{"  ├── "}<Text color={palette.yellow}>builder.ts</Text><Text color={r("$warning")}> ●</Text></Text>
        <Text color={r("$text3")}>{"  └── "}<Text color={palette.red}>cli.ts</Text><Text color={r("$error")}> ✗</Text></Text>
      </Box>

      {/* Chrome / status bar */}
      <Box marginTop={1}>
        <Text backgroundColor={r("$chromebg")} color={r("$chromefg")}>{" main "}</Text>
        <Text backgroundColor={r("$chromebg")} color={r("$primary")}>{" ● "}</Text>
        <Text backgroundColor={r("$chromebg")} color={r("$success")}>{" ok "}</Text>
        <Text backgroundColor={r("$chromebg")} color={r("$chromefg")}>{" 4 files · UTF-8 · LF "}</Text>
      </Box>

      {/* ── Palette Colors ────────────────────────────────────── */}
      <Box marginTop={1} flexDirection="column">
        <Text color={r("$text")} bold>Palette</Text>
        <Box>
          {SURFACE_KEYS.map((k) => (
            <Box key={k} width={10}>
              <Text backgroundColor={palette[k]}>{"  "}</Text>
              <Text color={palette[k]}>{` ${k}`}</Text>
            </Box>
          ))}
        </Box>
        <Box>
          {HUE_KEYS.map((k) => (
            <Box key={k} width={10}>
              <Text backgroundColor={palette[k]}>{"  "}</Text>
              <Text color={palette[k]}>{` ${k}`}</Text>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── Semantic Tokens ───────────────────────────────────── */}
      <Box marginTop={1} flexDirection="column">
        <Text color={r("$text")} bold>Tokens</Text>
        {SEMANTIC_GROUPS.map(([group, keys]) => (
          <Box key={group}>
            <Text color={r("$text3")}>{` ${group.padEnd(10)} `}</Text>
            {keys.map((k) => {
              const v = theme[k] as string
              return (
                <Box key={k} width={14}>
                  <Text backgroundColor={v}>{"  "}</Text>
                  <Text color={v}>{` $${k}`}</Text>
                </Box>
              )
            })}
          </Box>
        ))}
      </Box>

      {/* ANSI 16 */}
      <Box marginTop={1} flexDirection="column">
        <Text color={r("$text")} bold>ANSI 16</Text>
        <Box>
          <Text>{" "}</Text>
          {theme.palette.slice(0, 8).map((c, i) => (
            <Text key={i} backgroundColor={c}>{"   "}</Text>
          ))}
        </Box>
        <Box>
          <Text>{" "}</Text>
          {theme.palette.slice(8, 16).map((c, i) => (
            <Text key={i} backgroundColor={c}>{"   "}</Text>
          ))}
        </Box>
      </Box>
    </Box>
  )
}

// ── Theme List Panel ──────────────────────────────────────────────────

function ThemeListPanel({
  items,
  cursor,
  scrollOffset,
  height,
  search,
}: {
  items: ListItem[]
  cursor: number
  scrollOffset: number
  height: number
  search: string | null
}) {
  const visibleCount = Math.max(1, height - 4)
  const visible = items.slice(scrollOffset, scrollOffset + visibleCount)
  const themeCount = items.filter((it) => it.type === "theme").length

  return (
    <Box flexDirection="column" width={30} borderStyle="single" borderColor="$separator">
      <Box paddingX={1}>
        {search !== null ? (
          <Text color="$primary">/{search}<Text color="$focusring">▏</Text></Text>
        ) : (
          <Text bold color="$primary">Themes</Text>
        )}
        <Text color="$text3"> ({themeCount})</Text>
      </Box>

      <Box flexDirection="column" flexGrow={1} paddingX={1}>
        {visible.map((item, i) => {
          const idx = scrollOffset + i
          if (item.type === "header") {
            return (
              <Box key={`hdr-${item.label}`}>
                <Text color="$text3" bold dimColor>{` ── ${item.label} ──`}</Text>
              </Box>
            )
          }
          const selected = idx === cursor
          return (
            <Box key={item.entry.name}>
              {selected ? (
                <Text backgroundColor="$selected" color="$selectedfg" bold>
                  {` ${item.entry.name.padEnd(26)} `}
                </Text>
              ) : (
                <Text color="$text">{` ${item.entry.name.padEnd(26)} `}</Text>
              )}
            </Box>
          )
        })}
      </Box>

      <Box paddingX={1}>
        <Text color="$text3" dimColor>j/k ↕ · / search · Tab mode</Text>
      </Box>
    </Box>
  )
}

// ── Generate Panel ────────────────────────────────────────────────────

interface GenState {
  bg: string
  fg: string
  primary: string
  activeField: "bg" | "fg" | "primary"
}

function GeneratePanel({ state }: { state: GenState }) {
  return (
    <Box flexDirection="column" width={30} borderStyle="single" borderColor="$separator">
      <Box paddingX={1}>
        <Text bold color="$primary">Generate</Text>
      </Box>

      <Box flexDirection="column" paddingX={1} marginTop={1}>
        {(["bg", "fg", "primary"] as const).map((field) => {
          const active = state.activeField === field
          const val = state[field]
          const hasVal = val.length > 0 && val.startsWith("#")
          return (
            <Box key={field} marginBottom={1} flexDirection="column">
              <Text color={active ? "$primary" : "$text3"} bold={active}>
                {active ? "▸ " : "  "}{field}
              </Text>
              <Box>
                <Text>{"    "}</Text>
                {hasVal && <Text backgroundColor={val}>{"  "}</Text>}
                <Text color={active ? "$text" : "$text2"}>
                  {" "}{val || "(empty)"}
                </Text>
                {active && <Text color="$focusring">▏</Text>}
              </Box>
            </Box>
          )
        })}
      </Box>

      <Box flexDirection="column" paddingX={1} marginTop={1}>
        <Text color="$text3" dimColor>↑↓ field · type hex</Text>
        <Text color="$text3" dimColor>Backspace clear</Text>
      </Box>

      <Box flexDirection="column" paddingX={1} flexGrow={1} />

      <Box paddingX={1}>
        <Text color="$text3" dimColor>Tab mode · q quit</Text>
      </Box>
    </Box>
  )
}

function genTheme(state: GenState): Theme {
  const builder = createTheme()
  if (state.bg.startsWith("#") && state.bg.length === 7) builder.bg(state.bg)
  if (state.fg.startsWith("#") && state.fg.length === 7) builder.fg(state.fg)
  if (state.primary.startsWith("#") && state.primary.length === 7) builder.primary(state.primary)
  return builder.build()
}

function genPalette(state: GenState): ThemePalette {
  const theme = genTheme(state)
  return {
    name: "custom",
    dark: theme.dark,
    crust: theme.bg,
    base: theme.bg,
    surface: theme.surface,
    overlay: theme.separator,
    subtext: theme.text2,
    text: theme.text,
    red: theme.error,
    orange: theme.warning,
    yellow: theme.primary,
    green: theme.success,
    teal: theme.control,
    blue: theme.link,
    purple: theme.focusring,
    pink: theme.primary,
  }
}

// ── Detect Panel ──────────────────────────────────────────────────────

function DetectPanel({ detected }: { detected: DetectedPalette | null }) {
  if (!detected) {
    return (
      <Box flexDirection="column" width={30} borderStyle="single" borderColor="$separator">
        <Box paddingX={1}>
          <Text bold color="$primary">Detect</Text>
        </Box>
        <Box flexDirection="column" paddingX={1} marginTop={1}>
          <Text color="$warning">Terminal detection</Text>
          <Text color="$warning">not available.</Text>
          <Text color="$text3" dimColor> </Text>
          <Text color="$text3" dimColor>OSC queries not</Text>
          <Text color="$text3" dimColor>supported (tmux,</Text>
          <Text color="$text3" dimColor>piped output, CI).</Text>
        </Box>
        <Box flexDirection="column" paddingX={1} flexGrow={1} />
        <Box paddingX={1}>
          <Text color="$text3" dimColor>Tab mode · q quit</Text>
        </Box>
      </Box>
    )
  }

  const { bg, fg, ansi, dark } = detected
  const detectedCount = [bg, fg, ...ansi].filter(Boolean).length

  return (
    <Box flexDirection="column" width={30} borderStyle="single" borderColor="$separator">
      <Box paddingX={1}>
        <Text bold color="$primary">Detect</Text>
        <Text color="$text3"> ({detectedCount} colors)</Text>
      </Box>

      <Box flexDirection="column" paddingX={1} marginTop={1}>
        <Text color="$text2">Terminal Colors</Text>
        <Box>
          <Text color="$text3">{"  bg "}</Text>
          {bg ? (
            <>
              <Text backgroundColor={bg}>{"  "}</Text>
              <Text color="$text2">{` ${bg}`}</Text>
            </>
          ) : (
            <Text color="$text4">not detected</Text>
          )}
        </Box>
        <Box>
          <Text color="$text3">{"  fg "}</Text>
          {fg ? (
            <>
              <Text backgroundColor={fg}>{"  "}</Text>
              <Text color="$text2">{` ${fg}`}</Text>
            </>
          ) : (
            <Text color="$text4">not detected</Text>
          )}
        </Box>
        <Text color="$text3" dimColor>{` ${dark ? "dark" : "light"} mode`}</Text>
      </Box>

      {/* ANSI 16 detected colors */}
      <Box flexDirection="column" paddingX={1} marginTop={1}>
        <Text color="$text2">ANSI Palette</Text>
        <Box>
          <Text>{"  "}</Text>
          {ansi.slice(0, 8).map((c, i) => (
            <Text key={i} backgroundColor={c ?? "#333"}>{c ? "  " : "??"}</Text>
          ))}
        </Box>
        <Box>
          <Text>{"  "}</Text>
          {ansi.slice(8, 16).map((c, i) => (
            <Text key={i} backgroundColor={c ?? "#333"}>{c ? "  " : "??"}</Text>
          ))}
        </Box>
      </Box>

      {/* Mapped palette fields */}
      <Box flexDirection="column" paddingX={1} marginTop={1}>
        <Text color="$text2">Mapped to Palette</Text>
        {Object.entries(detected.palette).map(([key, val]) => {
          if (key === "dark" || key === "name" || !val) return null
          return (
            <Box key={key}>
              <Text color="$text3">{`  ${key.padEnd(8)} `}</Text>
              <Text backgroundColor={val as string}>{"  "}</Text>
              <Text color="$text4">{` ${val}`}</Text>
            </Box>
          )
        })}
      </Box>

      <Box flexDirection="column" paddingX={1} flexGrow={1} />
      <Box paddingX={1}>
        <Text color="$text3" dimColor>Tab mode · q quit</Text>
      </Box>
    </Box>
  )
}

function detectTheme(detected: DetectedPalette | null): Theme {
  if (!detected) return allThemeEntries[0]!.theme
  const builder = createTheme()
  if (detected.bg) builder.bg(detected.bg)
  if (detected.fg) builder.fg(detected.fg)
  // Use ANSI colors if available
  const p = detected.palette
  if (p.red) builder.color("red", p.red)
  if (p.green) builder.color("green", p.green)
  if (p.yellow) builder.color("yellow", p.yellow)
  if (p.blue) builder.color("blue", p.blue)
  if (p.purple) builder.color("purple", p.purple)
  if (p.teal) builder.color("teal", p.teal)
  return builder.build()
}

function detectPalette(detected: DetectedPalette | null): ThemePalette {
  const theme = detectTheme(detected)
  return {
    name: "terminal",
    dark: theme.dark,
    crust: theme.bg,
    base: theme.bg,
    surface: theme.surface,
    overlay: theme.separator,
    subtext: theme.text2,
    text: theme.text,
    red: theme.error,
    orange: theme.warning,
    yellow: theme.primary,
    green: theme.success,
    teal: theme.control,
    blue: theme.link,
    purple: theme.focusring,
    pink: theme.primary,
  }
}

// ── Main App ──────────────────────────────────────────────────────────

function App({ detected }: { detected: DetectedPalette | null }) {
  const [mode, setMode] = useState<Mode>("browse")

  // Browse state
  const [cursor, setCursor] = useState(allItems[0]?.type === "header" ? 1 : 0)
  const [search, setSearch] = useState<string | null>(null)
  const [height, setHeight] = useState(process.stdout.rows ?? 24)

  // Generate state
  const [gen, setGen] = useState<GenState>({
    bg: detected?.bg ?? "",
    fg: detected?.fg ?? "",
    primary: "",
    activeField: "primary",
  })

  const modes: Mode[] = ["browse", "generate", "detect"]
  const nextMode = (m: Mode) => modes[(modes.indexOf(m) + 1) % modes.length]!

  // Build list items (grouped dark/light), filtered by search
  const items = useMemo(() => {
    if (!search) return allItems
    const q = search.toLowerCase()
    const filtered = allThemeEntries.filter((e) => e.name.toLowerCase().includes(q))
    return buildListItems(filtered)
  }, [search])

  // Scroll offset to keep cursor visible
  const visibleCount = Math.max(1, height - 4)
  const scrollOffset = useMemo(() => {
    const maxOffset = Math.max(0, cursor - visibleCount + 1)
    const minOffset = cursor
    return Math.max(0, Math.min(minOffset, maxOffset))
  }, [cursor, visibleCount])

  // Find the current theme entry from cursor position
  const currentEntry = useMemo(() => {
    const item = items[cursor]
    if (item?.type === "theme") return item.entry
    for (let i = cursor; i < items.length; i++) {
      if (items[i]!.type === "theme") return (items[i] as { type: "theme"; entry: ThemeEntry }).entry
    }
    return allThemeEntries[0]!
  }, [items, cursor])

  // Current theme depends on mode
  const currentTheme = mode === "browse" ? currentEntry.theme
    : mode === "generate" ? genTheme(gen)
    : detectTheme(detected)
  const currentPalette = mode === "browse" ? currentEntry.palette
    : mode === "generate" ? genPalette(gen)
    : detectPalette(detected)
  const currentLabel = mode === "browse" ? currentEntry.name
    : mode === "generate" ? "Custom"
    : "Terminal"

  // Skip headers when navigating
  const moveCursor = useCallback((dir: 1 | -1) => {
    setCursor((c) => {
      let next = c + dir
      while (next >= 0 && next < items.length && items[next]!.type === "header") {
        next += dir
      }
      return Math.max(0, Math.min(next, items.length - 1))
    })
  }, [items])

  useInput((input: string, key: Key) => {
    // Tab switches mode
    if (key.tab) {
      setMode((m) => nextMode(m))
      setSearch(null)
      return
    }

    if (mode === "generate") {
      // Field navigation
      if (key.upArrow) {
        setGen((g) => ({
          ...g,
          activeField: g.activeField === "fg" ? "bg" : g.activeField === "primary" ? "fg" : "bg",
        }))
        return
      }
      if (key.downArrow) {
        setGen((g) => ({
          ...g,
          activeField: g.activeField === "bg" ? "fg" : g.activeField === "fg" ? "primary" : "primary",
        }))
        return
      }
      if (key.backspace || key.delete) {
        setGen((g) => ({
          ...g,
          [g.activeField]: g[g.activeField].slice(0, -1),
        }))
        return
      }
      if (key.escape) {
        setMode("browse")
        return
      }
      if (input === "q" && gen[gen.activeField].length === 0) {
        return "exit"
      }
      // Hex input: only allow valid hex chars
      if (input && /^[#0-9a-fA-F]$/.test(input)) {
        setGen((g) => {
          const current = g[g.activeField]
          if (current.length === 0 && input !== "#") {
            return { ...g, [g.activeField]: "#" + input }
          }
          if (current.length < 7) {
            return { ...g, [g.activeField]: current + input }
          }
          return g
        })
        return
      }
      return
    }

    if (mode === "detect") {
      if (input === "q" || key.escape) return "exit"
      return
    }

    // Browse mode — search
    if (search !== null) {
      if (key.escape) { setSearch(null); return }
      if (key.return) { setSearch(null); return }
      if (key.backspace || key.delete) {
        setSearch((s) => (s && s.length > 0 ? s.slice(0, -1) : null))
        setCursor(0)
        return
      }
      if (input && input >= " " && !key.ctrl && !key.meta) {
        setSearch((s) => (s ?? "") + input)
        setCursor(0)
        return
      }
      return
    }

    // Browse mode — navigation
    if (input === "j" || key.downArrow) {
      moveCursor(1)
    } else if (input === "k" || key.upArrow) {
      moveCursor(-1)
    } else if (input === "g") {
      setCursor(items.length > 1 && items[0]!.type === "header" ? 1 : 0)
    } else if (input === "G") {
      setCursor(items.length - 1)
    } else if (input === "/") {
      setSearch("")
      setCursor(0)
    } else if (input === "q" || key.escape) {
      return "exit"
    }
  })

  // Listen for terminal resize
  React.useEffect(() => {
    const onResize = () => setHeight(process.stdout.rows ?? 24)
    process.stdout.on("resize", onResize)
    return () => { process.stdout.off("resize", onResize) }
  }, [])

  return (
    <ThemeProvider theme={currentTheme}>
      <Box flexDirection="column" width="100%" height="100%" backgroundColor="$bg">
        {/* Mode tabs */}
        <Box>
          {modes.map((m) => (
            <Text
              key={m}
              backgroundColor={mode === m ? "$primary" : "$surface"}
              color={mode === m ? "$bg" : "$text2"}
              bold={mode === m}
            >{` ${m[0]!.toUpperCase()}${m.slice(1)} `}</Text>
          ))}
          <Text color="$text3">{" "}{currentLabel}</Text>
        </Box>

        {/* Main content */}
        <Box flexDirection="row" flexGrow={1}>
          {mode === "browse" ? (
            <ThemeListPanel
              items={items}
              cursor={cursor}
              scrollOffset={scrollOffset}
              height={height - 1}
              search={search}
            />
          ) : mode === "generate" ? (
            <GeneratePanel state={gen} />
          ) : (
            <DetectPanel detected={detected} />
          )}
          <ShowcasePanel theme={currentTheme} palette={currentPalette} label={currentLabel} />
        </Box>
      </Box>
    </ThemeProvider>
  )
}

// ── Entry Point ───────────────────────────────────────────────────────

// Detect terminal palette BEFORE entering fullscreen (OSC needs normal screen)
const detected = await detectTerminalPalette()

const handle = await run(<App detected={detected} />, { mode: "fullscreen" })
await handle.waitUntilExit()
