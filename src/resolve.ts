/**
 * Token resolution — resolves `$token` strings against a Theme.
 */

import type { Theme } from "./types.js"

/** Color-typed keys of Theme (excludes metadata and palette). */
type ThemeColorKey = Exclude<keyof Theme, "name" | "dark" | "palette">

/** Backward-compat aliases: old token name → canonical token name. */
const tokenAliases: Record<string, ThemeColorKey> = {
  accent: "primary",
  muted: "text2",
  surface: "raisedbg",
  background: "bg",
  border: "separator",
}

/**
 * Resolve a color value — if it starts with `$`, look up the token in the theme.
 *
 * Supports:
 * - Named tokens: `$primary`, `$text2`, `$separator`, etc.
 * - Palette colors: `$color0` through `$color15`
 * - Backward-compat aliases: `$accent` → `$primary`, `$muted` → `$text2`,
 *   `$surface` → `$raisedbg`, `$background` → `$bg`, `$border` → `$separator`
 *
 * Returns `undefined` for `undefined` input. Non-`$` strings pass through unchanged.
 * Unknown tokens (e.g. `$nonexistent`) pass through as-is so downstream can
 * decide how to handle them.
 */
export function resolveThemeColor(color: string | undefined, theme: Theme): string | undefined {
  if (!color) return undefined
  if (!color.startsWith("$")) return color

  const token = color.slice(1)

  // Palette colors: $color0 through $color15
  if (token.startsWith("color")) {
    const idx = parseInt(token.slice(5), 10)
    if (idx >= 0 && idx < 16 && theme.palette && idx < theme.palette.length) {
      return theme.palette[idx]
    }
  }

  // Check backward-compat aliases first
  const aliased = tokenAliases[token]
  if (aliased) {
    const val = theme[aliased]
    return typeof val === "string" ? val : color
  }

  // Direct token lookup
  const key = token as ThemeColorKey
  const val = theme[key]
  return typeof val === "string" ? val : color
}
