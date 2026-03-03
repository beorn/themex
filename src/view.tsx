#!/usr/bin/env bun
/**
 * themex view — Interactive fullscreen theme browser.
 *
 * Left panel: scrollable list of all built-in themes.
 * Right panel: live showcase UI rendered with the selected theme.
 *
 * Keys: j/k navigate, Enter/Space select, / search, q quit.
 */

import React, { useState, useMemo } from "react"
import { Box, Text, ThemeProvider } from "inkx"
import { run, useInput } from "inkx/runtime"
import { builtinPalettes, getPaletteByName } from "./palettes/index.js"
import { deriveTheme } from "./derive.js"
import type { Theme, ThemePalette } from "./types.js"
import { resolveThemeColor } from "./resolve.js"

// ── Types ─────────────────────────────────────────────────────────────

interface ThemeEntry {
  name: string
  palette: ThemePalette
  theme: Theme
}

// ── Data ──────────────────────────────────────────────────────────────

type ListItem = { type: "theme"; entry: ThemeEntry } | { type: "header"; label: string }

const allThemeEntries: ThemeEntry[] = Object.keys(builtinPalettes).map((name) => {
  const palette = getPaletteByName(name)!
  return { name, palette, theme: deriveTheme(palette) }
})

const darkEntries = allThemeEntries.filter((e) => e.theme.dark)
const lightEntries = allThemeEntries.filter((e) => !e.theme.dark)

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

function ShowcasePanel({ theme, palette }: { theme: Theme; palette: ThemePalette }) {
  const r = (token: string) => resolveThemeColor(token, theme) ?? ""

  return (
    <Box flexDirection="column" flexGrow={1} paddingLeft={1} paddingRight={1}>
      {/* ── Sample UI ─────────────────────────────────────────── */}
      <Text color={r("$text")} bold>
        Sample UI
      </Text>

      {/* Text hierarchy */}
      <Text color={r("$text")}>
        {"  "}$text — Primary text for headings and body
      </Text>
      <Text color={r("$text2")}>
        {"  "}$text2 — Secondary: descriptions, metadata
      </Text>
      <Text color={r("$text3")}>
        {"  "}$text3 — Tertiary: hints, placeholders
      </Text>
      <Text color={r("$text4")}>
        {"  "}$text4 — Quaternary: line numbers, watermarks
      </Text>

      {/* Buttons */}
      <Box gap={1} marginTop={1}>
        <Text backgroundColor={r("$primary")} color={r("$bg")}>
          {" Save "}
        </Text>
        <Text backgroundColor={r("$surface")} color={r("$text")}>
          {" Cancel "}
        </Text>
        <Text backgroundColor={r("$error")} color={r("$bg")}>
          {" Delete "}
        </Text>
      </Box>

      {/* Focus ring + input field */}
      <Box marginTop={1}>
        <Text color={r("$text3")}>Input: </Text>
        <Text color={r("$focusring")}>┃</Text>
        <Text backgroundColor={r("$surface")} color={r("$text")}>
          {" Search themes...  "}
        </Text>
        <Text color={r("$text3")}> </Text>
        <Text color={r("$focusring")}>╭─────────────╮</Text>
      </Box>
      <Box>
        <Text>{"                          "}</Text>
        <Text color={r("$focusring")}>│</Text>
        <Text backgroundColor={r("$surface")} color={r("$text")}>
          {" "}
        </Text>
        <Text backgroundColor={r("$selected")} color={r("$selectedfg")}>
          {" Item One   "}
        </Text>
        <Text color={r("$focusring")}>│</Text>
      </Box>
      <Box>
        <Text>{"                          "}</Text>
        <Text color={r("$focusring")}>│</Text>
        <Text backgroundColor={r("$surface")} color={r("$text")}>
          {"  Item Two   "}
        </Text>
        <Text color={r("$focusring")}>│</Text>
      </Box>
      <Box>
        <Text>{"                          "}</Text>
        <Text color={r("$focusring")}>╰─────────────╯</Text>
      </Box>

      {/* Tabs */}
      <Box marginTop={1}>
        <Text backgroundColor={r("$primary")} color={r("$bg")}>
          {" Files "}
        </Text>
        <Text backgroundColor={r("$surface")} color={r("$text2")}>
          {" Search "}
        </Text>
        <Text backgroundColor={r("$surface")} color={r("$text2")}>
          {" Settings "}
        </Text>
      </Box>

      {/* Status + links */}
      <Box marginTop={1} flexDirection="column">
        <Text color={r("$success")}>
          {"  ✓ "}Build passed — 42 tests
        </Text>
        <Text color={r("$warning")}>
          {"  ⚠ "}3 updates available
        </Text>
        <Text color={r("$error")}>
          {"  ✗ "}Connection refused
        </Text>
        <Box>
          <Text>{"  "}</Text>
          <Text color={r("$link")} underline>
            docs
          </Text>
          <Text color={r("$separator")}> · </Text>
          <Text color={r("$link")} underline>
            api
          </Text>
          <Text color={r("$separator")}> · </Text>
          <Text color={r("$link")} underline>
            source
          </Text>
        </Box>
      </Box>

      {/* Chrome bar */}
      <Box marginTop={1}>
        <Text backgroundColor={r("$chromebg")} color={r("$chromefg")}>
          {" main "}
        </Text>
        <Text backgroundColor={r("$chromebg")} color={r("$primary")}>
          {" ● "}
        </Text>
        <Text backgroundColor={r("$chromebg")} color={r("$success")}>
          {" ok "}
        </Text>
        <Text backgroundColor={r("$chromebg")} color={r("$chromefg")}>
          {" 3 files · UTF-8 · LF "}
        </Text>
      </Box>

      {/* ── Palette Colors ────────────────────────────────────── */}
      <Box marginTop={1} flexDirection="column">
        <Text color={r("$text")} bold>
          Palette Colors
        </Text>
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
        <Text color={r("$text")} bold>
          Semantic Tokens
        </Text>
        {SEMANTIC_GROUPS.map(([group, keys]) => (
          <Box key={group}>
            <Text color={r("$text3")}>{`  ${group.padEnd(10)} `}</Text>
            {keys.map((k) => {
              const v = theme[k] as string
              return (
                <Box key={k} width={13}>
                  <Text backgroundColor={v}>{"  "}</Text>
                  <Text color={v}>{` $${k}`}</Text>
                </Box>
              )
            })}
          </Box>
        ))}
      </Box>

      {/* 16-color palette */}
      <Box marginTop={1} flexDirection="column">
        <Text color={r("$text")} bold>
          ANSI 16
        </Text>
        <Box>
          <Text color={r("$text3")}>{"  "}</Text>
          {theme.palette.slice(0, 8).map((c, i) => (
            <Text key={i} backgroundColor={c}>
              {"   "}
            </Text>
          ))}
        </Box>
        <Box>
          <Text color={r("$text3")}>{"  "}</Text>
          {theme.palette.slice(8, 16).map((c, i) => (
            <Text key={i} backgroundColor={c}>
              {"   "}
            </Text>
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

  // Count actual themes (not headers)
  const themeCount = items.filter((it) => it.type === "theme").length

  return (
    <Box flexDirection="column" width={30} borderStyle="single" borderColor="$separator">
      {/* Header */}
      <Box paddingX={1}>
        {search !== null ? (
          <Text color="$primary">
            /{search}
            <Text color="$focusring">▏</Text>
          </Text>
        ) : (
          <Text bold color="$primary">
            Themes
          </Text>
        )}
        <Text color="$text3"> ({themeCount})</Text>
      </Box>

      {/* List */}
      <Box flexDirection="column" flexGrow={1} paddingX={1}>
        {visible.map((item, i) => {
          const idx = scrollOffset + i
          if (item.type === "header") {
            return (
              <Box key={`hdr-${item.label}`}>
                <Text color="$text3" bold dimColor>
                  {` ── ${item.label} ──`}
                </Text>
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
                <Text color="$text">
                  {` ${item.entry.name.padEnd(26)} `}
                </Text>
              )}
            </Box>
          )
        })}
      </Box>

      {/* Footer */}
      <Box paddingX={1}>
        <Text color="$text3" dimColor>
          j/k ↕ · / search · q quit
        </Text>
      </Box>
    </Box>
  )
}

// ── Main App ──────────────────────────────────────────────────────────

function App() {
  // Start on first theme entry (skip header at index 0)
  const [cursor, setCursor] = useState(allItems[0]?.type === "header" ? 1 : 0)
  const [search, setSearch] = useState<string | null>(null)
  const [height, setHeight] = useState(process.stdout.rows ?? 24)

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
    // If cursor is on a header, find next theme
    for (let i = cursor; i < items.length; i++) {
      if (items[i]!.type === "theme") return (items[i] as { type: "theme"; entry: ThemeEntry }).entry
    }
    return allThemeEntries[0]!
  }, [items, cursor])

  const currentTheme = currentEntry.theme

  // Skip headers when navigating
  const moveCursor = (dir: 1 | -1) => {
    setCursor((c) => {
      let next = c + dir
      // Skip headers
      while (next >= 0 && next < items.length && items[next]!.type === "header") {
        next += dir
      }
      return Math.max(0, Math.min(next, items.length - 1))
    })
  }

  useInput((input, key) => {
    // Search mode
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

    // Navigation
    if (input === "j" || key.downArrow) {
      moveCursor(1)
    } else if (input === "k" || key.upArrow) {
      moveCursor(-1)
    } else if (input === "g") {
      // Jump to first theme (skip header)
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
    return () => {
      process.stdout.off("resize", onResize)
    }
  }, [])

  return (
    <ThemeProvider theme={currentTheme}>
      <Box
        flexDirection="row"
        width="100%"
        height="100%"
        backgroundColor="$bg"
      >
        <ThemeListPanel
          items={items}
          cursor={cursor}
          scrollOffset={scrollOffset}
          height={height}
          search={search}
        />
        <ShowcasePanel theme={currentTheme} palette={currentEntry.palette} />
      </Box>
    </ThemeProvider>
  )
}

// ── Entry Point ───────────────────────────────────────────────────────

const handle = await run(<App />, { mode: "fullscreen" })
await handle.waitUntilExit()
