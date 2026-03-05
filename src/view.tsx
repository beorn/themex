#!/usr/bin/env bun
/**
 * themex view — Interactive fullscreen theme browser + generator.
 *
 * Layout:
 *   Top:    themes list | 22 palette colors | 33 design tokens
 *   Bottom: representative demo UI
 *
 * Keys: j/k navigate, / search, Enter on "+ Generate", q quit.
 */

import React, { useState, useMemo, useCallback } from "react"
import { Box, Text, ThemeProvider } from "@hightea/term"
import { run, useInput, type Key } from "@hightea/term/runtime"
import { builtinPalettes, getPaletteByName } from "./palettes/index.js"
import { deriveTheme } from "./derive.js"
import { createTheme } from "./builder.js"
import type { Theme, ColorPalette } from "./types.js"
import { detectTerminalPalette, type DetectedPalette } from "./detect.js"

// ── Types ─────────────────────────────────────────────────────────────

interface ThemeEntry {
  name: string
  palette: ColorPalette
  theme: Theme
}

type ListItem = { type: "theme"; entry: ThemeEntry } | { type: "header"; label: string } | { type: "generate" }

// ── Data ──────────────────────────────────────────────────────────────

const allThemeEntries: ThemeEntry[] = Object.keys(builtinPalettes).map((name) => {
  const palette = getPaletteByName(name)!
  return { name, palette, theme: deriveTheme(palette) }
})

function buildListItems(entries: ThemeEntry[], includeGenerate: boolean): ListItem[] {
  const auto = entries.filter((e) => e.name === "auto")
  const custom = entries.filter((e) => e.name === "custom")
  const dark = entries.filter((e) => e.name !== "auto" && e.name !== "custom" && e.palette.dark !== false)
  const light = entries.filter((e) => e.name !== "auto" && e.name !== "custom" && e.palette.dark === false)
  const items: ListItem[] = []
  if (auto.length > 0) {
    items.push({ type: "header", label: "Auto (OSC)" })
    for (const entry of auto) items.push({ type: "theme", entry })
  }
  if (custom.length > 0) {
    for (const entry of custom) items.push({ type: "theme", entry })
  }
  if (includeGenerate) items.push({ type: "generate" })
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

// ── Palette Colors Panel ──────────────────────────────────────────────

const PALETTE_FIELDS_L: (keyof ColorPalette)[] = [
  "black",
  "red",
  "green",
  "yellow",
  "blue",
  "magenta",
  "cyan",
  "white",
  "foreground",
  "background",
  "cursorColor",
]
const PALETTE_FIELDS_R: (keyof ColorPalette)[] = [
  "brightBlack",
  "brightRed",
  "brightGreen",
  "brightYellow",
  "brightBlue",
  "brightMagenta",
  "brightCyan",
  "brightWhite",
  "cursorText",
  "selectionBackground",
  "selectionForeground",
]

const PALETTE_SHORT: Record<string, string> = {
  brightBlack: "brtBlack",
  brightRed: "brtRed",
  brightGreen: "brtGreen",
  brightYellow: "brtYellow",
  brightBlue: "brtBlue",
  brightMagenta: "brtMagenta",
  brightCyan: "brtCyan",
  brightWhite: "brtWhite",
  cursorColor: "cursor",
  cursorText: "cursorTxt",
  selectionBackground: "selBg",
  selectionForeground: "selFg",
}

function PaletteCol({ fields, palette }: { fields: (keyof ColorPalette)[]; palette: ColorPalette }) {
  return (
    <Box flexDirection="column" flexGrow={1}>
      {fields.map((k) => {
        const v = palette[k] as string
        const label = PALETTE_SHORT[k] ?? k
        return (
          <Text key={k}>
            <Text backgroundColor={v}>{"  "}</Text>
            <Text color="$muted-fg">{` ${label}`}</Text>
          </Text>
        )
      })}
    </Box>
  )
}

function PalettePanel({ palette }: { palette: ColorPalette }) {
  return (
    <Box flexDirection="column" flexGrow={2} borderStyle="single" borderColor="$border" padding={1}>
      <Text bold color="$fg">
        22 Color Palette
      </Text>
      <Box flexDirection="row" flexGrow={1}>
        <PaletteCol fields={PALETTE_FIELDS_L} palette={palette} />
        <PaletteCol fields={PALETTE_FIELDS_R} palette={palette} />
      </Box>
    </Box>
  )
}

// ── Design Tokens Panel ───────────────────────────────────────────────

/** Pairs: [bgKey, fgKey, displayName] */
const TOKEN_PAIRS: [keyof Theme, keyof Theme, string][] = [
  ["bg", "fg", "default"],
  ["surface", "surfacefg", "surface"],
  ["popover", "popoverfg", "popover"],
  ["muted", "mutedfg", "muted"],
  ["primary", "primaryfg", "primary"],
  ["secondary", "secondaryfg", "secondary"],
  ["accent", "accentfg", "accent"],
  ["error", "errorfg", "error"],
  ["warning", "warningfg", "warning"],
  ["success", "successfg", "success"],
  ["info", "infofg", "info"],
  ["selection", "selectionfg", "selection"],
  ["inverse", "inversefg", "inverse"],
  ["cursor", "cursorfg", "cursor"],
]

/** Standalone tokens */
const TOKEN_STANDALONE: [keyof Theme, string][] = [
  ["border", "border"],
  ["inputborder", "inputborder"],
  ["focusborder", "focusborder"],
  ["link", "link"],
  ["disabledfg", "disabledfg"],
]

function TokensPanel({ theme }: { theme: Theme }) {
  const mid = Math.ceil(TOKEN_PAIRS.length / 2)
  const pairsL = TOKEN_PAIRS.slice(0, mid)
  const pairsR = TOKEN_PAIRS.slice(mid)

  return (
    <Box flexDirection="column" flexGrow={2} borderStyle="single" borderColor="$border" padding={1}>
      <Text bold color="$fg">
        33 Design Tokens
      </Text>
      <Box flexDirection="row" flexGrow={1}>
        {/* Left column: first half of pairs */}
        <Box flexDirection="column" flexGrow={1}>
          {pairsL.map(([bgK, fgK, label]) => (
            <Text key={label}>
              <Text backgroundColor={theme[bgK] as string} color={theme[fgK] as string}>{` $${label.padEnd(10)}`}</Text>
            </Text>
          ))}
        </Box>
        {/* Right column: second half of pairs */}
        <Box flexDirection="column" flexGrow={1}>
          {pairsR.map(([bgK, fgK, label]) => (
            <Text key={label}>
              <Text backgroundColor={theme[bgK] as string} color={theme[fgK] as string}>{` $${label.padEnd(10)}`}</Text>
            </Text>
          ))}
          {/* Standalone tokens below */}
          {TOKEN_STANDALONE.map(([k, label]) => (
            <Text key={label}>
              <Text backgroundColor={theme[k] as string}>{"  "}</Text>
              <Text color={theme[k] as string}>{` $${label}`}</Text>
            </Text>
          ))}
        </Box>
      </Box>
    </Box>
  )
}

// ── Demo UI Panel ─────────────────────────────────────────────────────

function DemoPanel({ palette, label }: { palette: ColorPalette; label: string }) {
  const isDark = palette.dark !== false

  return (
    <Box flexDirection="column" flexGrow={1} borderStyle="double" borderColor="$border">
      {/* Title Bar */}
      <Box flexDirection="row" backgroundColor="$inverse" paddingX={1}>
        <Text color="$inverse-fg">{isDark ? "● " : "○ "}</Text>
        <Text color="$inverse-fg" bold>{`${label} `}</Text>
        <Text color="$inverse-fg" dimColor>
          {"— File  Edit  View  Help"}
        </Text>
      </Box>

      {/* Body */}
      <Box flexDirection="row" flexGrow={1}>
        {/* Sidebar */}
        <Box flexDirection="column" width={28} borderRight borderColor="$border" paddingX={2} paddingTop={1}>
          <Box flexDirection="row" marginBottom={1}>
            <Text backgroundColor="$primary" color="$primary-fg">
              {" Explorer "}
            </Text>
            <Text color="$muted-fg">{"  Search"}</Text>
          </Box>

          {/* Search input — showcases $inputborder */}
          <Box borderStyle="single" borderColor="$inputborder" marginBottom={1} paddingX={1}>
            <Text color="$muted-fg">{"🔍 Search files..."}</Text>
          </Box>

          <Box flexDirection="column" marginBottom={1}>
            <Text color="$muted-fg" dimColor>
              {"OPEN EDITORS"}
            </Text>
            <Box flexDirection="row">
              <Text color="$accent">{"  ● "}</Text>
              <Text color="$fg">{"index.ts"}</Text>
            </Box>
            <Text color="$muted-fg">{"    config.json"}</Text>
          </Box>

          <Box flexDirection="column">
            <Text color="$muted-fg" dimColor>
              {"SRC"}
            </Text>
            <Text color="$fg">{"  ▾ components/"}</Text>
            <Box flexDirection="row">
              <Text color="$fg">{"      "}</Text>
              <Text backgroundColor="$selection" color="$selection-fg">
                {" App.tsx "}
              </Text>
            </Box>
            <Text color="$fg">{"      Button.tsx"}</Text>
            <Text color="$fg">{"      Dialog.tsx"}</Text>
            <Text color="$fg">{"  ▸ utils/"}</Text>
            <Text color="$disabled-fg" strikethrough>
              {"    deprecated.ts"}
            </Text>
            <Text color="$muted-fg">{"    README.md"}</Text>
          </Box>
        </Box>

        {/* Editor area */}
        <Box flexDirection="column" flexGrow={1}>
          {/* Tab bar */}
          <Box flexDirection="row" backgroundColor="$surface" paddingX={1}>
            <Box borderBottom borderColor="$primary">
              <Text backgroundColor="$bg" color="$fg">
                {" App.tsx "}
              </Text>
            </Box>
            <Text>{"  "}</Text>
            <Text color="$muted-fg">{" config.json "}</Text>
            <Text>{"  "}</Text>
            <Text color="$muted-fg">{" README.md "}</Text>
          </Box>

          {/* Breadcrumb */}
          <Box flexDirection="row" paddingX={3} backgroundColor="$surface">
            <Text color="$muted-fg">{"src "}</Text>
            <Text color="$border">{"› "}</Text>
            <Text color="$muted-fg">{"components "}</Text>
            <Text color="$border">{"› "}</Text>
            <Text color="$fg">{"App.tsx"}</Text>
          </Box>

          {/* Code */}
          <Box flexDirection="column" paddingX={3} paddingY={1} flexGrow={1}>
            <Text>
              <Text color="$muted-fg">{"  1  "}</Text>
              <Text color="$secondary">{"import "}</Text>
              <Text color="$fg">{"{ useState } "}</Text>
              <Text color="$secondary">{"from "}</Text>
              <Text color="$accent">{'"react"'}</Text>
            </Text>
            <Text>
              <Text color="$muted-fg">{"  2  "}</Text>
              <Text color="$secondary">{"import "}</Text>
              <Text color="$fg">{"{ Button } "}</Text>
              <Text color="$secondary">{"from "}</Text>
              <Text color="$accent">{'"./Button"'}</Text>
            </Text>
            <Text color="$muted-fg">{"  3"}</Text>
            <Text>
              <Text color="$muted-fg">{"  4  "}</Text>
              <Text color="$secondary">{"export function "}</Text>
              <Text color="$primary" bold>
                {"App"}
              </Text>
              <Text color="$fg">{"() {"}</Text>
            </Text>
            <Text>
              <Text color="$muted-fg">{"  5  "}</Text>
              <Text color="$fg">{"  "}</Text>
              <Text color="$secondary">{"const "}</Text>
              <Text color="$fg">{"[count, setCount] = "}</Text>
              <Text color="$primary">{"useState"}</Text>
              <Text color="$fg">{"(0)"}</Text>
            </Text>
            <Text color="$muted-fg">{"  6"}</Text>
            <Text>
              <Text color="$muted-fg">{"  7  "}</Text>
              <Text color="$fg">{"  "}</Text>
              <Text color="$secondary">{"return "}</Text>
              <Text color="$fg">{"("}</Text>
            </Text>
            <Text>
              <Text color="$muted-fg">{"  8  "}</Text>
              <Text color="$fg">{"    <"}</Text>
              <Text color="$info">{"div"}</Text>
              <Text color="$fg"> </Text>
              <Text color="$accent">{"className"}</Text>
              <Text color="$fg">{"="}</Text>
              <Text color="$success">{'"app"'}</Text>
              <Text color="$fg">{">"}</Text>
            </Text>
            <Text>
              <Text color="$muted-fg">{"  9  "}</Text>
              <Text color="$fg">{"      "}</Text>
              <Text color="$disabled-fg">{"// TODO: add error handling"}</Text>
            </Text>
            <Text>
              <Text color="$muted-fg">{" 10  "}</Text>
              <Text color="$fg">{"      <"}</Text>
              <Text color="$primary">{"Button"}</Text>
              <Text color="$fg"> </Text>
              <Text color="$accent">{"onClick"}</Text>
              <Text color="$fg">{"={() => "}</Text>
              <Text color="$primary">{"setCo"}</Text>
              <Text backgroundColor="$cursor" color="$cursor-fg">
                {"u"}
              </Text>
            </Text>
            {/* Autocomplete popup — showcases $popover */}
            <Box flexDirection="row">
              <Text color="$muted-fg">{" 11  "}</Text>
              <Text color="$fg">{"      "}</Text>
              <Box flexDirection="column" backgroundColor="$popover" borderStyle="single" borderColor="$border">
                <Text backgroundColor="$selection" color="$selection-fg">
                  {" setCount      "}
                </Text>
                <Text color="$popover-fg">{" setState      "}</Text>
                <Text color="$popover-fg">{" setTimeout    "}</Text>
              </Box>
            </Box>
            <Text>
              <Text color="$muted-fg">{" 12  "}</Text>
              <Text color="$fg">{"      </"}</Text>
              <Text color="$primary">{"Button"}</Text>
              <Text color="$fg">{">"}</Text>
            </Text>
            <Text>
              <Text color="$muted-fg">{" 13  "}</Text>
              <Text color="$fg">{"    </"}</Text>
              <Text color="$info">{"div"}</Text>
              <Text color="$fg">{">"}</Text>
            </Text>
            <Text>
              <Text color="$muted-fg">{" 14  "}</Text>
              <Text color="$fg">{"  )"}</Text>
            </Text>
            <Text>
              <Text color="$muted-fg">{" 15  "}</Text>
              <Text color="$fg">{"}"}</Text>
            </Text>
          </Box>

          {/* Problems panel */}
          <Box flexDirection="column" borderTop borderColor="$border" paddingX={3} paddingY={1}>
            <Box flexDirection="row" marginBottom={1}>
              <Text color="$fg" bold>
                {"Problems "}
              </Text>
              <Text color="$muted-fg">{"  Output   Terminal"}</Text>
            </Box>
            <Box paddingX={1} marginBottom={1}>
              <Text color="$error">{"✗ "}</Text>
              <Text color="$fg">{"Type '"}</Text>
              <Text color="$info">{"string"}</Text>
              <Text color="$fg">{"' is not assignable  "}</Text>
              <Text color="$muted-fg">{"App.tsx:10"}</Text>
            </Box>
            <Box paddingX={1} marginBottom={1}>
              <Text color="$warning">{"⚠ "}</Text>
              <Text color="$fg">{"Unused variable '"}</Text>
              <Text color="$warning">{"config"}</Text>
              <Text color="$fg">{"'  "}</Text>
              <Text color="$muted-fg">{"App.tsx:3"}</Text>
            </Box>
            <Box paddingX={1}>
              <Text color="$info">{"ℹ "}</Text>
              <Text color="$fg">{"Consider using "}</Text>
              <Text color="$link" underline>
                {"useCallback"}
              </Text>
              <Text color="$fg">{" here  "}</Text>
              <Text color="$muted-fg">{"App.tsx:5"}</Text>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Status Bar */}
      <Box flexDirection="row" backgroundColor="$inverse" paddingX={1}>
        <Text backgroundColor="$primary" color="$primary-fg">
          {" main "}
        </Text>
        <Text color="$inverse-fg">{"  "}</Text>
        <Text color="$success">{"✓ "}</Text>
        <Text color="$inverse-fg">{"0 errors   "}</Text>
        <Text color="$warning">{"⚠ "}</Text>
        <Text color="$inverse-fg">{"1 warning   "}</Text>
        <Text color="$inverse-fg">{"Ln 11, Col 8   UTF-8   TypeScript React"}</Text>
      </Box>
    </Box>
  )
}

// ── Generate Dialog (overlay) ────────────────────────────────────────

function GenDialog({ state }: { state: GenState }) {
  // Center like km dialogs (HelpOverlay pattern)
  const cols = process.stdout.columns ?? 80
  const rows = process.stdout.rows ?? 24
  const dialogW = 48
  const dialogH = 16
  const marginLeft = Math.max(0, Math.floor((cols - dialogW) / 2))
  const marginTop = Math.max(0, Math.floor((rows - dialogH) / 2))

  return (
    <Box position="absolute" marginLeft={marginLeft} marginTop={marginTop}>
      <Box
        flexDirection="column"
        width={dialogW}
        outlineStyle="round"
        outlineColor="$focusborder"
        backgroundColor="$popover"
        paddingX={2}
        paddingY={1}
      >
        <Text color="$popover-fg" bold>
          Generate Theme
        </Text>
        <Box marginTop={1}>
          <Text color="$muted-fg">Enter hex colors (e.g. #1e1e2e)</Text>
        </Box>
        <Box flexDirection="column" marginTop={1}>
          {(["bg", "fg", "primary"] as const).map((field) => {
            const active = state.activeField === field
            const val = state[field]
            const hasVal = val.length > 0 && val.startsWith("#")
            return (
              <Box key={field} flexDirection="row" alignItems="center">
                <Text color={active ? "$primary" : "$disabled-fg"} bold={active}>
                  {active ? "▸ " : "  "}
                  {field.padEnd(8)}
                </Text>
                {hasVal && <Text backgroundColor={val}>{"  "}</Text>}
                <Box borderStyle="single" borderColor={active ? "$focusborder" : "$inputborder"} paddingX={1}>
                  <Text color={active ? "$popover-fg" : "$muted-fg"}>
                    {val || "(empty)"}
                    {active && <Text color="$cursor">▏</Text>}
                  </Text>
                </Box>
              </Box>
            )
          })}
        </Box>
        <Box marginTop={2}>
          <Text dimColor>{"  ↑↓ field  ·  Enter confirm  ·  Esc cancel"}</Text>
        </Box>
      </Box>
    </Box>
  )
}

// ── Theme List Panel ──────────────────────────────────────────────────

function ThemeListPanel({ items, cursor, search }: { items: ListItem[]; cursor: number; search: string | null }) {
  // Fixed height=18 minus border(2) + padding(2) + header(1) = 13 visible items
  const visibleCount = 13
  const scrollOffset = useMemo(() => {
    const maxOffset = Math.max(0, cursor - visibleCount + 1)
    return Math.max(0, Math.min(cursor, maxOffset))
  }, [cursor, visibleCount])
  const visible = items.slice(scrollOffset, scrollOffset + visibleCount)

  return (
    <Box flexDirection="column" flexGrow={1} borderStyle="single" borderColor="$border" overflow="hidden" padding={1}>
      {search !== null ? (
        <Text color="$primary">
          /{search}
          <Text color="$focusborder">▏</Text>
        </Text>
      ) : (
        <Text bold color="$fg">
          Themes
        </Text>
      )}

      <Box flexDirection="column" flexGrow={1} overflow="hidden">
        {visible.map((item, i) => {
          const idx = scrollOffset + i
          if (item.type === "header") {
            return <Text key={`hdr-${item.label}`} color="$disabled-fg" dimColor>{`── ${item.label} ──`}</Text>
          }
          if (item.type === "generate") {
            const sel = idx === cursor
            return sel ? (
              <Text key="generate" backgroundColor="$primary" color="$primary-fg" bold>
                + Generate...
              </Text>
            ) : (
              <Text key="generate" color="$accent">
                + Generate...
              </Text>
            )
          }
          const sel = idx === cursor
          return sel ? (
            <Text key={`${item.entry.name}-${idx}`} backgroundColor="$selection" color="$selection-fg" bold>
              {item.entry.name}
            </Text>
          ) : (
            <Text key={`${item.entry.name}-${idx}`} color="$fg">
              {item.entry.name}
            </Text>
          )
        })}
      </Box>
    </Box>
  )
}

// ── Generate Panel ───────────────────────────────────────────────────

interface GenState {
  bg: string
  fg: string
  primary: string
  activeField: "bg" | "fg" | "primary"
}

function genTheme(state: GenState): Theme {
  const builder = createTheme()
  if (state.bg.startsWith("#") && state.bg.length === 7) builder.bg(state.bg)
  if (state.fg.startsWith("#") && state.fg.length === 7) builder.fg(state.fg)
  if (state.primary.startsWith("#") && state.primary.length === 7) builder.primary(state.primary)
  return builder.build()
}

function genPalette(state: GenState): ColorPalette {
  const theme = genTheme(state)
  return {
    name: "custom",
    dark: true,
    black: theme.bg,
    red: theme.error,
    green: theme.success,
    yellow: theme.warning,
    blue: theme.link,
    magenta: theme.primary,
    cyan: theme.info,
    white: theme.fg,
    brightBlack: theme.border,
    brightRed: theme.error,
    brightGreen: theme.success,
    brightYellow: theme.warning,
    brightBlue: theme.link,
    brightMagenta: theme.primary,
    brightCyan: theme.info,
    brightWhite: theme.fg,
    foreground: theme.fg,
    background: theme.bg,
    cursorColor: theme.cursor,
    cursorText: theme.cursorfg,
    selectionBackground: theme.selection,
    selectionForeground: theme.selectionfg,
  }
}

// ── Auto entry from detected terminal ─────────────────────────────────

function buildAutoEntry(detected: DetectedPalette | null): ThemeEntry | null {
  if (!detected) return null
  const builder = createTheme()
  if (detected.bg) builder.bg(detected.bg)
  if (detected.fg) builder.fg(detected.fg)
  const p = detected.palette
  if (p.red) builder.color("red", p.red)
  if (p.green) builder.color("green", p.green)
  if (p.yellow) builder.color("yellow", p.yellow)
  if (p.blue) builder.color("blue", p.blue)
  if (p.magenta) builder.color("magenta", p.magenta)
  if (p.cyan) builder.color("cyan", p.cyan)
  const theme = builder.build()
  const palette: ColorPalette = {
    name: "auto",
    dark: detected.dark,
    black: theme.bg,
    red: theme.error,
    green: theme.success,
    yellow: theme.warning,
    blue: theme.link,
    magenta: theme.primary,
    cyan: theme.info,
    white: theme.fg,
    brightBlack: theme.border,
    brightRed: theme.error,
    brightGreen: theme.success,
    brightYellow: theme.warning,
    brightBlue: theme.link,
    brightMagenta: theme.primary,
    brightCyan: theme.info,
    brightWhite: theme.fg,
    foreground: theme.fg,
    background: theme.bg,
    cursorColor: theme.cursor,
    cursorText: theme.cursorfg,
    selectionBackground: theme.selection,
    selectionForeground: theme.selectionfg,
  }
  return { name: "auto", palette, theme: deriveTheme(palette) }
}

// ── Main App ──────────────────────────────────────────────────────────

function App({ detected }: { detected: DetectedPalette | null }) {
  const [generating, setGenerating] = useState(false)
  const [customEntries, setCustomEntries] = useState<ThemeEntry[]>([])

  const autoEntry = useMemo(() => buildAutoEntry(detected), [detected])
  const fullEntries = useMemo(() => {
    const base = autoEntry ? [autoEntry, ...allThemeEntries] : allThemeEntries
    return [...customEntries, ...base]
  }, [autoEntry, customEntries])
  const fullItems = useMemo(() => buildListItems(fullEntries, true), [fullEntries])

  const [cursor, setCursor] = useState(fullItems[0]?.type === "header" ? 1 : 0)
  const [search, setSearch] = useState<string | null>(null)

  const [gen, setGen] = useState<GenState>({
    bg: detected?.bg ?? "",
    fg: detected?.fg ?? "",
    primary: "",
    activeField: "primary",
  })

  const items = useMemo(() => {
    if (!search) return fullItems
    const q = search.toLowerCase()
    const filtered = fullEntries.filter((e) => e.name.toLowerCase().includes(q))
    return buildListItems(filtered, !search)
  }, [search, fullItems, fullEntries])

  // scrollOffset computed inside ThemeListPanel via useContentRect()

  const currentItem = items[cursor]
  const isOnGenerate = currentItem?.type === "generate"

  const currentEntry = useMemo(() => {
    if (generating) return null
    const item = items[cursor]
    if (item?.type === "theme") return item.entry
    for (let i = cursor; i < items.length; i++) {
      if (items[i]!.type === "theme") return (items[i] as { type: "theme"; entry: ThemeEntry }).entry
    }
    return fullEntries[0]!
  }, [items, cursor, fullEntries, generating, isOnGenerate])

  const genThemeVal = genTheme(gen)
  const genPaletteVal = genPalette(gen)
  const currentTheme = generating ? genThemeVal : (currentEntry?.theme ?? genThemeVal)
  const currentPalette = generating ? genPaletteVal : (currentEntry?.palette ?? genPaletteVal)
  const currentLabel = generating ? "custom" : (currentEntry?.name ?? "")

  const moveCursor = useCallback(
    (dir: 1 | -1) => {
      setCursor((c) => {
        let next = c + dir
        while (next >= 0 && next < items.length && items[next]!.type === "header") {
          next += dir
        }
        return Math.max(0, Math.min(next, items.length - 1))
      })
    },
    [items],
  )

  useInput((input: string, key: Key) => {
    if (generating) {
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
        setGen((g) => ({ ...g, [g.activeField]: g[g.activeField].slice(0, -1) }))
        return
      }
      if (key.escape || key.return) {
        const t = genTheme(gen)
        const p = genPalette(gen)
        if (gen.bg.length === 7 || gen.primary.length === 7) {
          setCustomEntries((prev) => [...prev, { name: "custom", palette: p, theme: t }])
        }
        setGenerating(false)
        return
      }
      if (input && /^[#0-9a-fA-F]$/.test(input)) {
        setGen((g) => {
          const cur = g[g.activeField]
          if (cur.length === 0 && input !== "#") return { ...g, [g.activeField]: "#" + input }
          if (cur.length < 7) return { ...g, [g.activeField]: cur + input }
          return g
        })
        return
      }
      return
    }

    if (search !== null) {
      if (key.escape) {
        setSearch(null)
        return
      }
      if (key.return) {
        setSearch(null)
        return
      }
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

    if (key.return && isOnGenerate) {
      setGenerating(true)
      return
    }
    if (input === "j" || key.downArrow) moveCursor(1)
    else if (input === "k" || key.upArrow) moveCursor(-1)
    else if (input === "g") setCursor(items.length > 1 && items[0]!.type === "header" ? 1 : 0)
    else if (input === "G") setCursor(items.length - 1)
    else if (input === "/") {
      setSearch("")
      setCursor(0)
    } else if (input === "q" || key.escape) return "exit"
  })

  return (
    <ThemeProvider theme={currentTheme}>
      <Box flexDirection="column" flexGrow={1} backgroundColor="$bg">
        {/* Top: three columns — fixed height so all columns match */}
        <Box flexDirection="row" height={18}>
          <ThemeListPanel items={items} cursor={cursor} search={search} />
          <PalettePanel palette={currentPalette} />
          <TokensPanel theme={currentTheme} />
        </Box>

        {/* Bottom: demo UI — fills remaining space with generous margin */}
        <Box flexGrow={1} paddingX={3} paddingY={1}>
          <DemoPanel palette={currentPalette} label={currentLabel} />
        </Box>

        {/* Generate dialog overlay */}
        {generating && <GenDialog state={gen} />}
      </Box>
    </ThemeProvider>
  )
}

// ── Entry Point ───────────────────────────────────────────────────────

const detected = await detectTerminalPalette()
const handle = await run(<App detected={detected} />, { mode: "fullscreen" })
await handle.waitUntilExit()
