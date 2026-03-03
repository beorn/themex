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

const allEntries: ThemeEntry[] = Object.keys(builtinPalettes).map((name) => {
  const palette = getPaletteByName(name)!
  return { name, palette, theme: deriveTheme(palette) }
})

// ── Showcase Panel ────────────────────────────────────────────────────

function ShowcasePanel({ theme }: { theme: Theme }) {
  const r = (token: string) => resolveThemeColor(token, theme) ?? ""

  return (
    <Box flexDirection="column" flexGrow={1} paddingLeft={1} paddingRight={1}>
      {/* Header */}
      <Box marginBottom={1}>
        <Text color={r("$primary")} bold>
          Sample Application
        </Text>
        <Text color={r("$text3")}> — themed preview</Text>
      </Box>

      {/* Text hierarchy */}
      <Box flexDirection="column" marginBottom={1}>
        <Text color={r("$text")} bold>
          Text Hierarchy
        </Text>
        <Text color={r("$text")}>
          Primary text — headings, body, labels
        </Text>
        <Text color={r("$text2")}>
          Secondary text — descriptions, metadata, timestamps
        </Text>
        <Text color={r("$text3")}>
          Tertiary text — hints, placeholders, help text
        </Text>
        <Text color={r("$text4")}>
          Quaternary text — line numbers, watermarks
        </Text>
      </Box>

      {/* Buttons / interactive elements */}
      <Box marginBottom={1} gap={1}>
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

      {/* Status messages */}
      <Box flexDirection="column" marginBottom={1}>
        <Text color={r("$text")} bold>
          Status
        </Text>
        <Text color={r("$success")}>
          {"  ✓ "}Build passed — 42 tests, 0 failures
        </Text>
        <Text color={r("$warning")}>
          {"  ⚠ "}3 packages have available updates
        </Text>
        <Text color={r("$error")}>
          {"  ✗ "}Connection refused: localhost:5432
        </Text>
      </Box>

      {/* Links and focus */}
      <Box flexDirection="column" marginBottom={1}>
        <Text color={r("$text")} bold>
          Interactive
        </Text>
        <Text>
          <Text color={r("$link")} underline>
            Documentation
          </Text>
          <Text color={r("$text3")}> · </Text>
          <Text color={r("$link")} underline>
            API Reference
          </Text>
          <Text color={r("$text3")}> · </Text>
          <Text color={r("$link")} underline>
            Source Code
          </Text>
        </Text>
        <Box>
          <Text color={r("$text3")}>Focus: </Text>
          <Text color={r("$focusring")}>▏</Text>
          <Text backgroundColor={r("$selected")} color={r("$selectedfg")}>
            {" Selected item "}
          </Text>
        </Box>
      </Box>

      {/* Mini table */}
      <Box flexDirection="column" marginBottom={1}>
        <Text color={r("$text")} bold>
          Data Table
        </Text>
        <Text color={r("$text3")}>
          ┌──────────┬────────┬──────┐
        </Text>
        <Text>
          <Text color={r("$text3")}>│ </Text>
          <Text color={r("$primary")}>Name </Text>
          <Text color={r("$text3")}>    │ </Text>
          <Text color={r("$primary")}>Status </Text>
          <Text color={r("$text3")}>│ </Text>
          <Text color={r("$primary")}>Size </Text>
          <Text color={r("$text3")}>│</Text>
        </Text>
        <Text color={r("$separator")}>
          ├──────────┼────────┼──────┤
        </Text>
        <Text>
          <Text color={r("$text3")}>│ </Text>
          <Text color={r("$text")}>app.ts   </Text>
          <Text color={r("$text3")}>│ </Text>
          <Text color={r("$success")}>ok     </Text>
          <Text color={r("$text3")}>│ </Text>
          <Text color={r("$text2")}>2.4K </Text>
          <Text color={r("$text3")}>│</Text>
        </Text>
        <Text>
          <Text color={r("$text3")}>│ </Text>
          <Text color={r("$text")}>index.ts </Text>
          <Text color={r("$text3")}>│ </Text>
          <Text color={r("$warning")}>mod    </Text>
          <Text color={r("$text3")}>│ </Text>
          <Text color={r("$text2")}>1.1K </Text>
          <Text color={r("$text3")}>│</Text>
        </Text>
        <Text>
          <Text color={r("$text3")}>│ </Text>
          <Text color={r("$text")}>cli.ts   </Text>
          <Text color={r("$text3")}>│ </Text>
          <Text color={r("$error")}>err    </Text>
          <Text color={r("$text3")}>│ </Text>
          <Text color={r("$text2")}>4.7K </Text>
          <Text color={r("$text3")}>│</Text>
        </Text>
        <Text color={r("$text3")}>
          └──────────┴────────┴──────┘
        </Text>
      </Box>

      {/* Chrome bar */}
      <Box>
        <Text backgroundColor={r("$chromebg")} color={r("$chromefg")}>
          {" main "}
        </Text>
        <Text backgroundColor={r("$chromebg")} color={r("$primary")}>
          {" ● "}
        </Text>
        <Text backgroundColor={r("$chromebg")} color={r("$chromefg")}>
          {" 3 files · 8.2K "}
        </Text>
      </Box>

      {/* Palette swatches */}
      <Box marginTop={1} flexDirection="column">
        <Text color={r("$text")} bold>
          Palette
        </Text>
        <Box>
          {theme.palette.slice(0, 8).map((c, i) => (
            <Text key={i} backgroundColor={c}>
              {"  "}
            </Text>
          ))}
          <Text color={r("$text3")}> 0-7</Text>
        </Box>
        <Box>
          {theme.palette.slice(8, 16).map((c, i) => (
            <Text key={i} backgroundColor={c}>
              {"  "}
            </Text>
          ))}
          <Text color={r("$text3")}> 8-15</Text>
        </Box>
      </Box>
    </Box>
  )
}

// ── Theme List Panel ──────────────────────────────────────────────────

function ThemeListPanel({
  entries,
  cursor,
  scrollOffset,
  height,
  search,
}: {
  entries: ThemeEntry[]
  cursor: number
  scrollOffset: number
  height: number
  search: string | null
}) {
  const visibleCount = Math.max(1, height - 4) // header + footer + borders
  const visible = entries.slice(scrollOffset, scrollOffset + visibleCount)

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
        <Text color="$text3"> ({entries.length})</Text>
      </Box>

      {/* List */}
      <Box flexDirection="column" flexGrow={1} paddingX={1}>
        {visible.map((entry, i) => {
          const idx = scrollOffset + i
          const selected = idx === cursor
          return (
            <Box key={entry.name}>
              {selected ? (
                <Text backgroundColor="$selected" color="$selectedfg" bold>
                  {` ${entry.name.padEnd(26)} `}
                </Text>
              ) : (
                <Text color="$text">
                  {` ${entry.name.padEnd(26)} `}
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
  const [cursor, setCursor] = useState(0)
  const [search, setSearch] = useState<string | null>(null)
  const [height, setHeight] = useState(process.stdout.rows ?? 24)

  // Filter entries based on search
  const filtered = useMemo(() => {
    if (!search) return allEntries
    const q = search.toLowerCase()
    return allEntries.filter((e) => e.name.toLowerCase().includes(q))
  }, [search])

  // Scroll offset to keep cursor visible
  const visibleCount = Math.max(1, height - 4)
  const scrollOffset = useMemo(() => {
    const maxOffset = Math.max(0, cursor - visibleCount + 1)
    const minOffset = cursor
    return Math.max(0, Math.min(minOffset, maxOffset))
  }, [cursor, visibleCount])

  const currentEntry = filtered[cursor] ?? filtered[0] ?? allEntries[0]!
  const currentTheme = currentEntry.theme

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
      setCursor((c) => Math.min(c + 1, filtered.length - 1))
    } else if (input === "k" || key.upArrow) {
      setCursor((c) => Math.max(c - 1, 0))
    } else if (input === "g") {
      setCursor(0)
    } else if (input === "G") {
      setCursor(filtered.length - 1)
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
          entries={filtered}
          cursor={cursor}
          scrollOffset={scrollOffset}
          height={height}
          search={search}
        />
        <ShowcasePanel theme={currentTheme} />
      </Box>
    </ThemeProvider>
  )
}

// ── Entry Point ───────────────────────────────────────────────────────

const handle = await run(<App />, { mode: "fullscreen" })
await handle.waitUntilExit()
