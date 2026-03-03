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
