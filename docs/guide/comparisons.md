# Inspirations

themex learned from theme systems across many languages and platforms. Textual is Python, Lipgloss is Go, M3 is for mobile/web -- these aren't competitors but teachers. Each solved a piece of the theming puzzle, and themex synthesizes the best ideas into a TypeScript-native, terminal-first, platform-agnostic package.

This page documents what each system does well and what themex learned from it.

## Textual

[Textual](https://textual.textualize.io/guide/design/) is a Python TUI framework with an integrated CSS-based theme system. It was the single biggest influence on themex's design.

| Aspect | Textual | themex |
|--------|---------|--------|
| **Language** | Python | TypeScript |
| **Palette size** | 11 base colors | 14 raw colors (6 surface + 8 hues) |
| **Semantic tokens** | ~77 (11 x 7 shades) | 35 (19 semantic + 16 palette) |
| **Shade generation** | 3 lighter + 3 darker per color (RGB) | OKLCH `brighten()`/`darken()` (perceptually uniform) |
| **Minimal input** | `Theme(primary=...)` | `createTheme().primary('#EBCB8B').build()` |
| **Terminal detection** | None | OSC 4/10/11 auto-detection |
| **Styling** | CSS engine (tightly coupled) | `$token` strings (framework-agnostic) |

**Textual's strengths**: CSS variable system makes token consumption trivially easy -- every widget/style rule can use `$primary` directly. Command palette for theme switching is excellent UX. Derived text variants (`$text-muted`, `$text-disabled`) reduce decision fatigue. The minimal authoring path -- `Theme(primary=...)` auto-generates everything -- is the gold standard for onboarding.

**themex's strengths**: Terminal auto-detection means apps *belong* in the terminal. OKLCH shade generation preserves hue and produces uniform steps. Cross-ecosystem import (Base16, iTerm2, Catppuccin). 8 named accent hues enable a content palette.

**What we learned**: One color in, full theme out. The minimal authoring path is essential.

## Charm / Lipgloss + BubbleTea

[Lipgloss](https://github.com/charmbracelet/lipgloss) is a Go styling library for terminal apps, often used with [BubbleTea](https://github.com/charmbracelet/bubbletea). [BubbleTint](https://github.com/lrstanley/bubbletint) adds theme registry support.

| Aspect | Lipgloss/BubbleTea | themex |
|--------|-------------------|--------|
| **Language** | Go | TypeScript |
| **Theming** | Per-component styling | Central palette -> theme derivation |
| **Color spec** | `lipgloss.Color("5")` (ANSI or hex) | `$token` strings or hex |
| **Adaptive** | `CompleteAdaptiveColor` (dark/light x truecolor/256/16) | `generateTheme()` for ANSI 16, `deriveTheme()` for truecolor |
| **Detection** | Color profile (truecolor/256/16) | Actual palette hex values via OSC |
| **Color utils** | `Darken()`, `Lighten()`, `Alpha()` | `blend()`, `brighten()`, `darken()`, `contrastFg()` |

**Charm's strengths**: Lipgloss's `CompleteAdaptiveColor` elegantly handles dark/light x color tier. The styling API is beautifully ergonomic. BubbleTea's Model/Update/View pattern is proven and influential. Using ANSI color indices (`lipgloss.Color("5")`) lets apps piggyback on whatever the terminal's magenta is.

**themex's strengths**: Semantic derivation -- `deriveTheme()` computes contrast pairs, chrome inversion, text hierarchy automatically. Querying actual hex values (not just "what tier?"). `$token` system is declarative -- components say *what* they need.

**What we learned**: Color utilities should be first-class API. The ANSI palette as "semantic slots" is a powerful idea -- we extend it by querying the actual hex values.

## Catppuccin

[Catppuccin](https://catppuccin.com/) is a community-driven color scheme with 26 named colors and ports for 300+ apps.

| Aspect | Catppuccin | themex |
|--------|-----------|--------|
| **Palette** | 26 colors per flavor | 14 raw colors |
| **Flavors** | 4 fixed (Mocha, Frappe, Macchiato, Latte) | Any (user-defined or preset) |
| **Surface ramp** | 12 levels | 6 levels |
| **Accent hues** | 14 distinct | 8 (ANSI-standard) |
| **Semantic tokens** | None (apps map ad hoc) | 19 derived with clear roles |
| **Ecosystem** | 300+ app ports (manual) | `deriveTheme()` (automatic) |

**Catppuccin's strengths**: Unmatched community ecosystem -- 300+ app ports. 14 accent hues provide fine color distinctions (rosewater, flamingo, pink, mauve are four distinct warm hues). Surface ramp (12 levels) offers granularity for complex UIs. OKLCH bright variant formula.

**themex's strengths**: Semantic derivation eliminates per-app manual porting. User-chosen primary accent drives consistent app-wide styling. 8 hues sufficient for TUI use.

**What we learned**: Surface ramp naming (crust/base/surface/overlay/subtext/text) is self-explanatory and widely recognized. OKLCH for derivation. The 4 built-in Catppuccin palettes are among our most popular presets.

## Base16 / tinted-theming

[Base16](https://github.com/tinted-theming/home) defines 16-color themes with a template system for generating app configs.

| Aspect | Base16 | themex |
|--------|--------|--------|
| **Palette** | 16 opaque slots (base00-base0F) | 14 named colors |
| **Naming** | Opaque (base08 = "usually red") | Semantic (red, surface, text) |
| **Config gen** | Mustache templates for dozens of apps | `deriveTheme()` + platform exporters |
| **Schemes** | ~230 | 45 built-in + `importBase16()` |
| **Runtime** | None (build-time only) | Full API (resolve, derive, detect) |

**Base16's strengths**: Template system generates configs for dozens of apps from one scheme file. Largest scheme ecosystem (230+). 16 slots map directly to terminal ANSI colors.

**themex's strengths**: Semantic names instead of opaque slots. Runtime library. Semantic derivation. Terminal detection. Round-trip `importBase16()`/`exportBase16()` bridges the ecosystems.

**What we learned**: The 16-slot palette is the universal terminal baseline. Our content palette (`$color0`-`$color15`) maps directly to these slots.

## Material Design 3

[Material Design 3](https://m3.material.io/styles/color/system/how-the-system-works) is Google's design system with HCT (Hue-Chroma-Tone) color science.

| Aspect | M3 | themex |
|--------|-----|--------|
| **Color space** | HCT (Hue-Chroma-Tone) | OKLCH (similar perceptual uniformity) |
| **Seed input** | One seed color | 1-14 colors (builder API) |
| **Accent families** | 3 (primary, secondary = desaturated, tertiary = +60° hue) | 1 primary + content palette |
| **Tonal palettes** | 13 tones per family | 6 surface ramp + shade utilities |
| **Semantic roles** | ~25 | 19 semantic tokens |
| **Derivation** | Hue rotation for secondary/tertiary | Warm/cool complement for selection |

**M3's strengths**: HCT color science is state-of-the-art for perceptual uniformity. 13-tone palette per family provides fine-grained surface elevation. Battle-tested across billions of Android devices. The `onPrimary` concept (contrast text for colored backgrounds) is essential.

**themex's strengths**: Content palette provides multi-color variety without secondary/tertiary overhead. Terminal detection. 14-color palette is directly authorable (M3 generates everything from one seed, which can feel generic).

**What we learned**: Perceptually uniform color spaces (HCT/OKLCH) produce better derivation than RGB/HSL. M3's `onPrimary` maps to our `$selectedfg`. Warm/cool complementary selection is inspired by M3's tertiary hue rotation.

## Omarchy (DHH)

[Omarchy](https://github.com/basecamp/omarchy) is DHH's terminal setup -- one `colors.toml` generates configs for Neovim, tmux, bat, lazygit, and more.

| Aspect | Omarchy | themex |
|--------|---------|--------|
| **Palette** | 22 tokens in TOML | 14 raw colors |
| **Config gen** | Shell scripts for Neovim, tmux, bat, lazygit | Future direction |
| **Runtime** | None (static configs) | Full API |
| **Derivation** | None (all hand-specified) | `deriveTheme()` fills gaps |
| **Themes** | 1 (Omarchy's own) | 45 presets |

**Omarchy's strengths**: "One source, many configs" is elegant and practical -- change `colors.toml` and all tools update. DHH's taste-level curation produces a coherent, opinionated result. The pipeline concept (palette -> Neovim + tmux + bat + lazygit) is a killer feature.

**themex's strengths**: Derivation from minimal input (Omarchy requires all 22 values). Runtime API. Built-in theme library. Terminal detection.

**What we learned**: Cross-tool config generation is a high-value future direction. Generate Ghostty theme, Neovim colorscheme, tmux status line from one ThemePalette.

## Apple HIG

[Apple's Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/color) define system-wide color principles.

| Aspect | Apple HIG | themex |
|--------|-----------|--------|
| **Accent** | ONE system accent (user-chosen) | ONE primary (user-chosen) |
| **Text hierarchy** | 4 levels via opacity | 4 levels (`$text`-`$text4`) |
| **Surfaces** | Background + grouped + elevated | `$bg`, `$surface`, `$chromebg` |

**Apple HIG's strengths**: System-level integration (dark mode toggle, Dynamic Type, accessibility). Vibrancy and transparency create depth. The constraint of ONE accent color produces clean, focused UIs. Text hierarchy via opacity is elegant -- same color at different intensities always looks harmonious.

**What we learned**: Text hierarchy via opacity cascade. ONE accent color prevents the "rainbow problem." Both adopted directly.

## oh-my-pi

[oh-my-pi](https://github.com/can1357/oh-my-pi) is a terminal AI coding agent with a 66-token, 3-layer theme system.

| Aspect | oh-my-pi | themex |
|--------|----------|--------|
| **Architecture** | 3 layers: vars -> colors -> interfaces | 2 layers: palette -> theme |
| **Tokens** | 66 (component-specific) | 19 (UI-agnostic) + 16 palette |
| **Accessibility** | Color-blind mode with symbols | Contrast checking via `contrastFg()` |

**oh-my-pi's strengths**: Color-blind mode with symbol differentiation is a genuine accessibility innovation. Component interfaces (components declare their color needs) enforce consistency. 3-layer indirection provides fine-grained control.

**themex's strengths**: 19 UI-agnostic tokens vs 66 component-specific ones -- simpler to author and maintain. 2-layer architecture is easier to understand.

**What we learned**: The two-layer indirection pattern (raw palette -> semantic tokens) is the core architectural insight that validates our approach.

## Zed Editor

[Zed](https://zed.dev/) uses 150+ theme tokens with per-state variants (hover/active/disabled per token).

**Zed's strengths**: Pixel-perfect control over every UI state. 24 terminal color slots cover every edge case.

**themex's strengths**: 35 tokens vs 150+ -- much easier to author. State variants belong in component logic, not the theme interface. TUI components have fewer states than a desktop editor.

**What we learned**: The right abstraction level depends on the platform. 150+ is appropriate for a desktop editor; 35 for a terminal/web theme system.

## Summary

| System | Palette | Tokens | Detection | Derivation | Runtime | Key Strength |
|--------|---------|--------|-----------|------------|---------|--------------|
| **themex** | 14 | 35 | OSC 4/10/11 | `deriveTheme()` | TS | Terminal detection + derivation |
| **Textual** | 11 | ~77 | -- | Shade gen | Python | CSS variables, minimal authoring |
| **Charm/lipgloss** | -- | -- | Profile only | -- | Go | Ergonomic styling API |
| **Catppuccin** | 26 | 26 | -- | -- | Data | 300+ app ports, community |
| **Base16** | 16 | 16 | -- | -- | Build | 230+ schemes, templates |
| **M3** | 1 seed | ~25 | -- | HCT | Any | Color science, scale |
| **Omarchy** | 22 | 22 | -- | -- | -- | Cross-tool config gen |
| **Apple HIG** | 1 | ~20 | System | System | System | System integration |
| **oh-my-pi** | ~20 | 66 | -- | 3-layer | TS | Color-blind mode |
| **Zed** | ~50 | 150+ | -- | -- | Rust | Pixel-perfect control |
