/**
 * Core type definitions for the themex theme system.
 *
 * Two-layer architecture:
 *   Layer 1: ThemePalette — 14 raw colors (what theme authors define)
 *   Layer 2: Theme — semantic tokens (what UI apps consume)
 */

// ============================================================================
// ThemePalette — Theme Author Input
// ============================================================================

/**
 * Raw color palette — what a theme author fills in.
 * 14 colors + 2 metadata = the universal theme input format.
 *
 * Naming: Catppuccin-inspired surface ramp (widely adopted),
 * ANSI-standard hue names (universal across all theme systems).
 */
export interface ThemePalette {
  name: string
  dark: boolean

  // ── Surface ramp (6 colors) ────────────────────────────────────
  // Ordered by depth: crust (deepest) → text (most prominent)
  /** Deepest background — behind everything */
  crust: string
  /** Primary background */
  base: string
  /** Raised surfaces — cards, dialogs, popovers */
  surface: string
  /** Borders, dividers, subtle chrome */
  overlay: string
  /** Muted/secondary text */
  subtext: string
  /** Primary text */
  text: string

  // ── Accent hues (8 colors) ─────────────────────────────────────
  /** Error, destructive actions */
  red: string
  /** Warning, caution */
  orange: string
  /** Primary accent (dark themes), attention */
  yellow: string
  /** Success, positive */
  green: string
  /** Cyan/teal — cool accent */
  teal: string
  /** Links, focus — always blue (accessibility) */
  blue: string
  /** Decorative, tags */
  purple: string
  /** Decorative, warm accent */
  pink: string
}

/** Accent hue name — the 8 universal colors present in every theme system. */
export type HueName = "red" | "orange" | "yellow" | "green" | "teal" | "blue" | "purple" | "pink"

// ============================================================================
// Theme — Semantic Tokens for UI Consumption
// ============================================================================

/**
 * Semantic color token map (19 tokens + palette).
 *
 * Components reference tokens with a `$` prefix (e.g. `color="$primary"`).
 * Palette colors use `$color0` through `$color15`.
 * Tokens are resolved at render time via `resolveThemeColor`.
 */
export interface Theme {
  /** Human-readable theme name */
  name: string
  /** True if this is a dark theme (affects contrast decisions) */
  dark: boolean

  // Brand
  /** Primary brand tint — active indicators, interactive controls */
  primary: string
  /** Hyperlinks, references (derived from primary) */
  link: string
  /** Interactive chrome, input borders (derived from primary) */
  control: string

  // Selection
  /** Selection highlight background */
  selected: string
  /** Text on selected background (contrast-paired) */
  selectedfg: string
  /** Keyboard focus outline (always blue — accessibility) */
  focusring: string

  // Text
  /** Primary text — headings, body */
  text: string
  /** Secondary text — descriptions, metadata */
  text2: string
  /** Tertiary text — timestamps, hints, placeholders */
  text3: string
  /** Quaternary text — ghost text, watermarks, barely visible */
  text4: string

  // Surface
  /** Default background (detected or configured) */
  bg: string
  /** Elevated surfaces — dialogs, overlays, popovers */
  surface: string
  /** Dividers, borders, rules */
  separator: string

  // Chrome (inverted areas — title bars, status bars)
  /** Chrome background — inverted from normal (bright in dark themes) */
  chromebg: string
  /** Chrome foreground — text on chrome background (dark in dark themes) */
  chromefg: string

  // Status
  /** Error/destructive — validation errors, delete actions */
  error: string
  /** Warning/caution — unsaved changes */
  warning: string
  /** Success/positive — saved confirmation, passing tests */
  success: string

  // Content palette (16 indexed colors for categorization)
  /** 16 content colors ($color0 through $color15) */
  palette: string[]
}

/** Supported primary colors for ANSI 16 theme generation. */
export type AnsiPrimary = "yellow" | "cyan" | "magenta" | "green" | "red" | "blue" | "white"

/** Options for deriveTheme(). */
export interface ThemeOptions {
  /** Which hue to use as primary accent. Default: yellow (dark), blue (light) */
  accent?: HueName
}
