# Design Philosophy

## Why 14 Colors?

Most theme systems either have too few colors (forcing derivation of everything) or too many (making theme authoring tedious). themex's ThemePalette sits at a sweet spot: **14 colors** that capture the essence of any theme.

### The Surface Ramp (6 colors)

Every UI needs a gradient from background to foreground. Rather than asking for 2 colors and generating the rest (lossy), or asking for 10 shades (tedious), we ask for 6 stops that cover the full range:

```
crust ──> base ──> surface ──> overlay ──> subtext ──> text
(deep)                                              (prominent)
```

These names come from the Catppuccin project, which popularized a surface ramp naming convention that has been widely adopted. They map naturally to UI concepts:

- **crust** -- status bars, title bars, the deepest layer
- **base** -- the main background
- **surface** -- cards, dialogs, anything raised
- **overlay** -- borders, dividers
- **subtext** -- secondary text, metadata
- **text** -- primary readable text

### The Accent Hues (8 colors)

Every theme system in existence uses some subset of these 8 hue names. They are universal:

| Hue    | Semantic Role           |
|--------|------------------------|
| red    | Error, danger          |
| orange | Warning, caution       |
| yellow | Primary accent (dark)  |
| green  | Success, positive      |
| teal   | Cool accent, info      |
| blue   | Links, focus           |
| purple | Decorative, tags       |
| pink   | Decorative, warm       |

These are ANSI-standard names that appear in Base16, Catppuccin, Nord, Dracula, Tokyo Night, and every other major theme system. By using these exact names, we get natural interoperability.

## Why Separate Palette from Theme?

The two-layer split serves two audiences:

- **Theme authors** work with ThemePalette -- concrete colors they can see and tune
- **UI developers** work with Theme -- semantic tokens like `$primary`, `$error`, `$surface` that describe purpose, not appearance

`deriveTheme()` is the bridge. It applies consistent rules:

- Yellow is the default primary accent in dark themes, blue in light themes
- Warm primaries pair with teal for selection contrast; cool primaries pair with yellow
- Chrome (title bars, status bars) inverts: bright in dark themes, dark in light themes
- Focus rings are always blue (accessibility convention)
- A 16-color content palette is assembled for indexed color use cases

This means theme authors never need to think about selection contrast ratios or chrome inversion -- they pick colors they like, and `deriveTheme()` handles the semantic mapping.

## Why Not Just HSL Manipulation?

Some theme systems generate everything from a single hue. This produces technically harmonious but visually bland themes. Real themes like Nord, Catppuccin, and Dracula have carefully hand-picked accent colors that don't follow simple hue rotations.

themex respects this: the palette stores **actual colors** from the theme author. The builder API can generate colors via hue rotation when you want convenience, but built-in themes use hand-tuned values from their original sources.

## Why Built-in Themes?

Rather than depending on an external theme registry, themex ships 45 palettes from 15 theme families. Benefits:

- Zero network requests
- Guaranteed to work (validated at build time)
- Consistent ThemePalette mapping
- Instant access via `presetTheme("name")`

For themes not included, use `importBase16()` to bring in any Base16 scheme, or define a `ThemePalette` directly.

## ANSI 16 vs Truecolor

themex supports two rendering modes:

- **Truecolor themes** use hex colors (`#2E3440`) and work in terminals and UIs that support 24-bit color
- **ANSI 16 themes** use color names (`"yellow"`, `"blueBright"`) and work in every terminal

The built-in `ansi16DarkTheme` and `ansi16LightTheme` are hardcoded (not derived from palettes) because ANSI color names bypass hex-based derivation entirely. Use `generateTheme()` to create ANSI 16 themes with different primaries.

## Token Resolution

The `$` prefix convention (`$primary`, `$bg`, `$error`) lets you mix semantic tokens with literal colors in the same API:

```typescript
resolveThemeColor("$primary", theme) // looks up theme.primary
resolveThemeColor("#FF0000", theme)  // passes through unchanged
```

This makes token resolution a no-op for literal colors, keeping the API simple for components that accept both tokens and raw hex values.

Backward-compatible aliases (`$accent` -> `$primary`, `$muted` -> `$text2`, etc.) ensure older code keeps working as token names evolve.

## Design Influences

Research on existing theme systems informed themex's architecture. We studied TUI frameworks (Textual, BubbleTea/Lipgloss, Ratatui), desktop/web design systems (Apple HIG, M3), terminal theme ecosystems (Catppuccin, Base16, Omarchy), and TUI tools with strong theming (oh-my-pi, oh-my-posh, Zed). This section documents what we studied, what we adopted, and what we rejected.

### Systems Compared

| System | Architecture | Tokens | Key Innovation |
|--------|-------------|--------|----------------|
| **Textual** | 11 base colors, auto-shade generation (3 lighter + 3 darker per color) | ~77 (11 x 7) | CSS variable system, minimal authoring (`Theme(primary=...)`) |
| **Charm/lipgloss** | CompleteAdaptiveColor (6 values per token) | Per-component | Dark/light x truecolor/256/16 adaptive, color utilities |
| **BubbleTint** | Registry of tints (Base16-sourced), named ANSI accessors | ~18 | Global tint registry for BubbleTea apps |
| **Catppuccin** | 26-color palette, per-app ports | 26 | OKLCH bright derivation, cross-app consistency |
| **oh-my-pi** | `vars` palette -> `colors` semantic -> component interfaces | 66 | Two-layer indirection, color-blind mode, symbol theming |
| **oh-my-posh** | Palette refs (`p:name`) + template conditionals | ~20 | Decorator chain, conditional palettes |
| **Omarchy (DHH)** | 22 tokens in `colors.toml`, cross-app config generation | 22 | Config generation pipeline (Neovim, tmux, bat, lazygit) |
| **Zed** | 150+ tokens with state variants | 150+ | Hover/active/disabled per token, 24 terminal colors |
| **Apple HIG** | ONE accent + opacity cascade | ~20 | Text hierarchy via opacity, system palette |
| **Material Design 3** | HCT color space, one seed color | ~25 roles | Primary/secondary/tertiary from hue rotation |

### What We Adopted

**From Textual**: The most influential TUI theme system. Three key ideas:

1. **Minimal authoring path** -- Textual's `Theme(primary=...)` auto-generates an entire theme from a single color. We adopted this via `createTheme().primary('#EBCB8B').build()`. Both systems derive everything from minimal input; both allow overriding any derived value.

2. **Automatic shade generation** -- For every base color, Textual generates 3 lighter and 3 darker shades (`$primary-lighten-1`, `$primary-darken-2`, etc.). We adopted the concept but improved the mechanism: OKLCH lightness steps instead of naive RGB lighten/darken, which preserves hue and produces perceptually uniform steps. Our `brighten()` and `darken()` utilities serve this role.

3. **Semantic token categories** -- Textual's `$primary`, `$secondary`, `$accent`, `$surface`, `$panel`, `$boost`, `$warning`, `$error`, `$success` map closely to our semantic tokens. Their `$text-muted` and `$text-disabled` validate our text hierarchy (`$text` -> `$text2` -> `$text3` -> `$text4`). Their `$boost` (interaction emphasis) maps to our `$selected`.

Where we diverge from Textual: they don't auto-detect terminal colors (they assume full truecolor control), they're Python-only with a CSS-based styling engine, and their 11 base colors lack the 8-hue accent spectrum (red through pink) that enables our content palette.

**From Charm/lipgloss**: Color manipulation utilities as first-class API (`Darken`, `Lighten`, `Alpha`). We adopt `blend()`, `brighten()`, `darken()`, `contrastFg()` as core utilities. The `CompleteAdaptiveColor` pattern (dark/light x truecolor/256/16 = 6 values per token) validates our progressive enhancement approach for ANSI 16 fallback.

Lipgloss demonstrates that terminal apps can use the ANSI 16 palette as "semantic slots" -- `lipgloss.Color("5")` means "whatever magenta is in this terminal." We extend this by actually querying the hex values via OSC, then deriving a richer palette from them.

**From BubbleTint**: The `BubbleTint` library for BubbleTea (Go) validates the global theme registry pattern. It maintains a registry of "tints" (themes sourced from Base16 schemes) and provides named accessors (`tint.Fg()`, `tint.BrightGreen()`). This maps to our `getActiveTheme()` + `resolveThemeColor()` approach. BubbleTint is essentially a wrapper around static palettes without semantic derivation -- our `deriveTheme()` goes further by computing contrast-appropriate pairs, chrome inversion, and text hierarchy from the raw palette.

**From Catppuccin**: Surface ramp naming (crust/base/surface/overlay/subtext/text) -- widely recognized, self-explanatory. OKLCH bright variant formula for perceptually correct derivation. Dark/light palette flip for ANSI 16 color0/7/8/15.

**From oh-my-pi**: Two-layer indirection pattern (`ThemePalette` -> `Theme`). This is the core architectural insight -- theme authors provide raw colors, the system derives semantic tokens. Validates our exact architecture. Their 66 tokens are too many (UI-framework-specific tokens like `input_border_active_hover`); our 19 semantic tokens + 16 palette = 35 total is the right level of abstraction.

**From Apple HIG**: Text hierarchy via opacity cascade (text -> text2 -> text3 -> text4 as decreasing opacity of the same base color). ONE user-chosen accent color, not multiple accent families.

**From Omarchy**: Cross-app config generation from a single source. Our `ThemePalette` -> `deriveTheme()` is the same idea -- one palette input, automatic derivation for any platform. The 22-token system (6 semantic + 16 ANSI) is too minimal for a rich TUI; we need text hierarchy and chrome tokens. But the "generate configs for Neovim, tmux, bat, lazygit" pipeline is a future direction (generate Ghostty theme, Neovim colorscheme, tmux status line from one palette).

### What We Rejected

**Textual's lack of terminal detection**: Textual is "opinionated" -- it assumes full truecolor control and ignores the terminal's existing theme. This makes Textual apps feel like GUI apps that happen to render in a terminal. We want apps that *belong* in the terminal, respecting the user's chosen palette.

**Textual's CSS-based architecture**: Their styling system is tightly coupled to a CSS engine. We use `$token` strings resolved at render time, which works in any context (terminal, web, native) without requiring a CSS parser.

**BubbleTint's flat accessors**: Named ANSI color accessors (`tint.BrightGreen()`) are essentially just renamed palette slots. They don't provide semantic meaning -- is "BrightGreen" for success? For accents? For decorative use? Our semantic tokens (`$success`, `$primary`, `$selected`) explicitly encode purpose.

**M3's secondary/tertiary accent tokens**: Over-engineered for TUIs. Our content palette (`$color0`--`$color15`) provides multi-color categorization; brand tokens (`$primary`/`$link`/`$control`) provide accent variation; status tokens cover semantic colors. No need for hue-rotated secondary and tertiary accent families.

**Zed's 150+ tokens with state variants**: Too granular. `input_border_active_hover` vs `input_border_active` vs `input_border` -- this level of specificity belongs in CSS, not in a theme interface. TUI components have fewer states than web components.

**oh-my-pi's component interfaces**: Interesting (components declare color needs via interfaces), but premature for us. Our components use `$token` strings directly -- adding a typed interface layer adds complexity without proportional benefit at our scale.

**oh-my-pi's 66 tokens**: Too many. Many are component-specific (`breadcrumb_active_fg`, `tab_close_hover_bg`) which couples the theme interface to UI implementation details. Our 19 semantic tokens are UI-agnostic -- any component can use `$primary`, `$text2`, `$separator`.

## Cross-Theme Palette Comparison

How existing theme systems structure their palettes:

| Theme | Base/Surface | Accent Hues | Status | Total | Primary Accent? |
|-------|-------------|-------------|--------|-------|----------------|
| **Catppuccin** | 12 (3 bg + 3 surface + 3 overlay + 2 subtext + text) | 14 | 4 (from accents) | 26 | No (port chooses) |
| **Dracula** | 7 (bg x5, fg, selection) | 7 (R/O/Y/G/C/Pu/Pk) | 5 (functional UI) | ~15 | No (peers) |
| **Nord** | 7 (4 Polar Night + 3 Snow Storm) | 9 (4 Frost + 5 Aurora) | 3 (from Aurora) | 16 | Yes (nord8 blue) |
| **Solarized** | 8 (symmetric base03--base3) | 8 (YORGMVBC) | 0 (informal) | 16 | No (equals) |
| **Tokyo Night** | ~15 (7 bg + 5 fg + neutrals) | ~16 (7 blues + 9 others) | 4 (error/warn/info/hint) | ~55 | Yes (blue) |
| **One Dark** | 5 (bg + 3 mono + accent) | 8 (hue-1 through hue-6-2) | 0 (informal) | ~13 | Yes (syntax-accent) |
| **themex** | 6 (crust/base/surface/overlay/subtext/text) | 8 (R/O/Y/G/T/B/Pu/Pk) | 3 (error/warning/success) | 14 | Yes (user-chosen) |

## Key Insights

Eight observations that emerged from studying every major theme system:

1. **Every theme defines the same two layers**: raw palette (hues + neutrals) -> semantic mapping
2. **Universal hue set**: red, orange, yellow, green, teal, blue, purple, pink -- present in every theme
3. **Surface ramp**: 6--12 levels. 6 is sufficient (Solarized, Nord prove this); more granularity adds complexity without proportional benefit
4. **Status colors**: error=red, warning=orange/yellow, success=green is universal
5. **Terminal emulators expose 16 ANSI + fg/bg/cursor/selection** -- the universal baseline
6. **Two-layer indirection** (palette -> semantic) is the dominant pattern across all mature systems
7. **OKLCH** is the right color space for derivation (perceptually uniform, unlike RGB/HSL)
8. **35 tokens is the sweet spot** -- enough for rich TUIs, few enough to maintain

## M3 Mapping Summary

How themex tokens relate to Material Design 3 color roles:

| M3 Role | themex Token | Notes |
|---------|-----------|-------|
| Primary | `$primary` | Same concept -- the brand accent |
| On Primary | `$selectedfg` | Text on primary-colored backgrounds |
| Secondary | `$control` | M3 secondary = desaturated primary. Our control = muted accent for chrome |
| Tertiary | `$focusring` / `$selected` | M3 tertiary = rotated hue. Our selection + focus use a contrasting hue |
| Error | `$error` | Direct match |
| Surface | `$bg` / `$surface` | M3 has surface + surface container. We have bg + surface |
| On Surface | `$text` / `$text2` | Direct match |
| Outline | `$separator` | Direct match |
