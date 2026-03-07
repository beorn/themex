# Design Philosophy

## Why 22 Colors?

The 22-color terminal format (16 ANSI + 6 special) is the **universal pivot format**. Every modern terminal emulator -- Ghostty, Kitty, Alacritty, iTerm2, WezTerm -- already defines exactly these 22 colors. By using this as the palette layer, swatch gets natural interoperability with every terminal theme ecosystem (Base16, Catppuccin, iTerm2 exports, Ghostty configs) without lossy translation.

The 16 ANSI colors cover the full accent spectrum (red, green, yellow, blue, magenta, cyan + bright variants), and the 6 special colors (foreground, background, cursor, cursor-text, selection, selection-text) define the essential chrome. This is enough to derive a rich UI theme, and nothing is wasted.

## Why Separate Palette from Theme?

The two-layer split serves two audiences:

- **Theme authors** work with ColorPalette -- concrete terminal colors they can see and tune
- **UI developers** work with Theme -- 33 semantic tokens like `$primary`, `$error`, `$surface` that describe purpose, not appearance

`deriveTheme()` is the bridge. It applies consistent rules: warm primaries pair with cool selection colors, chrome inverts for dark/light, focus borders are always blue (accessibility convention). Theme authors never need to think about these rules -- they pick colors they like, and `deriveTheme()` handles the semantic mapping.

## Why Not Just HSL Manipulation?

Some theme systems generate everything from a single hue. This produces technically harmonious but visually bland themes. Real themes like Nord, Catppuccin, and Dracula have carefully hand-picked accent colors that don't follow simple hue rotations.

swatch respects this: the palette stores **actual colors** from the theme author. The builder API can generate colors via hue rotation when you want convenience, but built-in themes use hand-tuned values from their original sources.

## Why Built-in Themes?

Rather than depending on an external theme registry, swatch ships 43 palettes from 15 theme families. Benefits:

- Zero network requests
- Guaranteed to work (validated at build time)
- Consistent ColorPalette mapping
- Instant access via `presetTheme("name")`

For themes not included, use `importBase16()` to bring in any Base16 scheme, or define a `ColorPalette` directly.

## Token Resolution

The `$` prefix convention (`$primary`, `$bg`, `$error`) lets you mix semantic tokens with literal colors in the same API:

```typescript
resolveThemeColor("$primary", theme) // looks up theme.primary
resolveThemeColor("#FF0000", theme) // passes through unchanged
```

This makes token resolution a no-op for literal colors, keeping the API simple for components that accept both tokens and raw hex values.

## Design Influences

swatch's architecture was informed by studying TUI frameworks (Textual, BubbleTea/Lipgloss), desktop/web design systems (Apple HIG, M3), terminal theme ecosystems (Catppuccin, Base16, Omarchy), and TUI tools with strong theming (oh-my-pi, Zed).

Key insights from this research:

1. **Every mature theme system uses two layers**: raw palette -> semantic mapping
2. **Terminal emulators expose 16 ANSI + 6 special colors** -- the universal baseline
3. **OKLCH** is the right color space for derivation (perceptually uniform, unlike RGB/HSL)
4. **One color in, full theme out** is essential for onboarding (adopted from Textual)
5. **49 tokens is the sweet spot** -- 33 semantic tokens + 16 palette colors provide enough for rich TUIs while remaining easy to maintain

See [Inspirations](./comparisons.md) for detailed notes on each system.
