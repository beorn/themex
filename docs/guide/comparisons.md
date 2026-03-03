# Comparisons

How themex compares to other theme systems. Each comparison covers architecture, capabilities, and where each system excels.

## themex vs Textual

[Textual](https://textual.textualize.io/guide/design/) is a Python TUI framework with an integrated CSS-based theme system. It was the single biggest influence on themex's design.

| Feature | Textual | themex |
|---------|---------|--------|
| **Language** | Python only | TypeScript (platform-agnostic) |
| **Palette size** | 11 base colors | 14 raw colors (6 surface + 8 hues) |
| **Semantic tokens** | ~77 (11 x 7 shades) | 35 (19 semantic + 16 palette) |
| **Shade generation** | 3 lighter + 3 darker per color (RGB) | OKLCH `brighten()`/`darken()` (perceptually uniform) |
| **Minimal input** | `Theme(primary=...)` | `createTheme().primary('#EBCB8B').build()` |
| **Terminal detection** | None | OSC 4/10/11 auto-detection |
| **Styling system** | CSS engine (tightly coupled) | `$token` strings (framework-agnostic) |
| **Ecosystem import** | None | Base16, iTerm2, Catppuccin |
| **Built-in themes** | ~5 | 45 palettes from 15 families |
| **Platform** | Terminal only (Python) | Terminal, web, native |
| **Dark/light** | Boolean flag per theme | Inferred from bg luminance or explicit |

**What Textual does better**: Textual's CSS variable system makes token consumption trivially easy -- every widget/style rule can use `$primary` directly. Their command palette for theme switching is excellent UX. Derived text variants (`$text-muted`, `$text-disabled`) reduce decision fatigue.

**What themex does better**: Terminal auto-detection means apps *belong* in the terminal rather than imposing their own palette. OKLCH shade generation preserves hue and produces uniform steps (Textual's RGB lighten/darken can shift hue and produce non-uniform results). Cross-platform and cross-ecosystem (import from Base16, export to CSS/Ghostty/Neovim). 8 named accent hues enable a content palette that Textual's 11 base colors can't provide.

**Key insight from Textual**: The minimal authoring path -- one color in, full theme out -- is the right default experience. We adopted this directly.

## themex vs Charm/Lipgloss + BubbleTea

[Lipgloss](https://github.com/charmbracelet/lipgloss) is a Go styling library for terminal apps, often used with [BubbleTea](https://github.com/charmbracelet/bubbletea). [BubbleTint](https://github.com/lrstanley/bubbletint) adds theme registry support.

| Feature | Lipgloss/BubbleTea | themex |
|---------|-------------------|--------|
| **Language** | Go | TypeScript |
| **Theming approach** | Per-component styling, no central theme | Central `ThemePalette` -> `Theme` derivation |
| **Color specification** | `lipgloss.Color("5")` (ANSI index or hex) | `$token` strings or hex literals |
| **Adaptive colors** | `CompleteAdaptiveColor` (6 values: dark/light x truecolor/256/16) | `generateTheme()` for ANSI 16, truecolor themes via `deriveTheme()` |
| **Terminal detection** | Queries color profile (truecolor/256/16), not palette colors | Queries actual palette hex values via OSC 4/10/11 |
| **Color utilities** | `Darken()`, `Lighten()`, `Alpha()` | `blend()`, `brighten()`, `darken()`, `contrastFg()` |
| **Semantic derivation** | None (manual color choices per component) | Automatic (contrast pairs, chrome inversion, text hierarchy) |
| **Built-in themes** | None (BubbleTint: ~250 via Base16) | 45 hand-mapped palettes |

**What Charm does better**: Lipgloss's `CompleteAdaptiveColor` elegantly handles the full matrix of dark/light x color tier. Their styling API is beautifully ergonomic. BubbleTea's architecture (Model/Update/View) is a proven pattern that influenced our TEA state machine design.

**What themex does better**: Semantic derivation -- `deriveTheme()` automatically computes contrast-appropriate text on primary, chrome inversion for status bars, and text hierarchy. Lipgloss leaves all of this to the developer. We also query actual hex values from the terminal palette (Lipgloss just asks "what tier does this terminal support?"). And our `$token` system is declarative -- components say *what* they need, not *which color*.

**Key insight from Charm**: Color utilities should be first-class API, not internal helpers. We adopted `blend()`, `brighten()`, `darken()`, `contrastFg()` as core exports.

## themex vs Catppuccin

[Catppuccin](https://catppuccin.com/) is a community-driven color scheme with 26 named colors and ports for 300+ apps.

| Feature | Catppuccin | themex |
|---------|-----------|--------|
| **Palette size** | 26 colors per flavor | 14 raw colors |
| **Flavors** | 4 (Mocha, Frappe, Macchiato, Latte) | Any (user-defined or preset) |
| **Surface ramp** | 12 levels (3 bg + 3 surface + 3 overlay + 2 subtext + text) | 6 levels (crust/base/surface/overlay/subtext/text) |
| **Accent hues** | 14 (rosewater, flamingo, pink, mauve, red, maroon, peach, yellow, green, teal, sky, sapphire, blue, lavender) | 8 (red, orange, yellow, green, teal, blue, purple, pink) |
| **Semantic tokens** | None (apps map colors ad hoc) | 19 derived tokens with clear roles |
| **Cross-app consistency** | Per-app "ports" (manual) | Automatic via `deriveTheme()` |
| **OKLCH** | Used for bright variant derivation | Used for all derivation (blend, brighten, contrast) |
| **Primary accent** | Not defined (each port chooses) | User-chosen, drives chrome and selection |

**What Catppuccin does better**: The community ecosystem is unmatched -- 300+ app ports means Catppuccin users get a consistent look everywhere. Their 14 accent hues provide finer color distinctions (e.g., rosewater vs flamingo vs pink vs mauve are four distinct warm hues). Their surface ramp (12 levels) offers more granularity for complex UIs.

**What themex does better**: Semantic derivation means you don't need per-app manual porting -- `deriveTheme()` handles the mapping. Our 8 hues are sufficient for TUI use (Catppuccin's 14 are nice-to-have but rarely all used in a single app). User-chosen primary accent drives consistent app-wide styling.

**Key insight from Catppuccin**: Surface ramp naming (crust/base/surface/overlay/subtext/text) is self-explanatory and widely recognized. We adopted these exact names.

## themex vs Base16 / tinted-theming

[Base16](https://github.com/tinted-theming/home) is a specification for 16-color themes with a template system for generating app configs.

| Feature | Base16 | themex |
|---------|--------|--------|
| **Palette size** | 16 slots (base00–base0F) | 14 named colors |
| **Naming** | Opaque (base00, base08) | Semantic (crust, red, blue) |
| **Semantic mapping** | Implicit (base08 = "usually red") | Explicit (`deriveTheme()` assigns `$error = red`) |
| **Template system** | Mustache templates for app configs | `deriveTheme()` + platform exporters |
| **Available schemes** | ~230 | 45 built-in + `importBase16()` for any scheme |
| **Runtime library** | None (build-time generation) | Full runtime API (resolve, derive, detect) |
| **Terminal detection** | None | OSC 4/10/11 |
| **Dark/light** | Per-scheme (no derivation) | Automatic (inferred from bg or explicit) |

**What Base16 does better**: The template system generates configs for dozens of apps from one scheme file. The scheme ecosystem (230+ schemes) is the largest available. The 16-slot approach maps directly to terminal ANSI colors.

**What themex does better**: Semantic names (`red`, `surface`) instead of opaque slots (`base08`, `base01`). Runtime library (not just build-time templates). Semantic derivation (Base16 doesn't know that base08 should be used for errors). Terminal detection. Round-trip import/export via `importBase16()`/`exportBase16()`.

**Key insight from Base16**: The 16-slot palette is the universal terminal baseline. Our content palette (`$color0`--`$color15`) maps directly to these slots.

## themex vs Material Design 3

[Material Design 3](https://m3.material.io/styles/color/system/how-the-system-works) is Google's design system with HCT (Hue-Chroma-Tone) color science.

| Feature | Material Design 3 | themex |
|---------|-------------------|--------|
| **Color space** | HCT (Hue-Chroma-Tone) | OKLCH (similar perceptual uniformity) |
| **Seed input** | One seed color | 1-14 colors (builder API) |
| **Accent families** | 3 (primary, secondary, tertiary) | 1 primary + content palette for variety |
| **Tonal palettes** | 13 tones per family (0-100) | 6 surface ramp + shade utilities |
| **Semantic roles** | ~25 (primary, onPrimary, primaryContainer, etc.) | 19 semantic tokens |
| **Platform** | Web, Android, iOS | Terminal, web, native |
| **Theme derivation** | Hue rotation (secondary = same hue low chroma, tertiary = +60° rotation) | Warm/cool complement (warm primary -> cool selection, vice versa) |

**What M3 does better**: HCT color science is state-of-the-art for perceptual uniformity. The 13-tone palette per family provides extremely fine-grained surface elevation. The system is battle-tested across billions of Android devices.

**What themex does better**: M3's secondary/tertiary accent families are over-engineered for TUIs -- our content palette provides multi-color variety without the conceptual overhead. We support terminal auto-detection (M3 has no terminal concept). Our 14-color palette is directly authorable; M3's system generates everything from one seed, which can produce themes that feel generic.

**Key insight from M3**: Perceptually uniform color spaces (HCT/OKLCH) produce better derivation than RGB/HSL. We adopted OKLCH for all color math. M3's `onPrimary` concept (contrast text for colored backgrounds) maps to our `$selectedfg`.

## themex vs Omarchy (DHH)

[Omarchy](https://github.com/basecamp/omarchy) is DHH's terminal setup that defines a theme in `colors.toml` and generates configs for Neovim, tmux, bat, lazygit, and other tools.

| Feature | Omarchy | themex |
|---------|---------|--------|
| **Palette definition** | 22 tokens in `colors.toml` | 14 raw colors in ThemePalette |
| **Token naming** | 6 semantic + 16 ANSI (Color0-Color15) | 19 semantic + 16 ANSI (`$color0`-`$color15`) |
| **Config generation** | Shell scripts for Neovim, tmux, bat, lazygit | Future: exporters for Ghostty, Neovim, tmux |
| **Runtime library** | None (static configs) | Full runtime API |
| **Terminal detection** | None | OSC 4/10/11 |
| **Derivation** | None (all colors hand-specified) | `deriveTheme()` fills gaps from minimal input |
| **Built-in themes** | 1 (Omarchy's own) | 45 palettes from 15 families |

**What Omarchy does better**: The "one source, many configs" pipeline is elegant and practical -- change `colors.toml` and all your tools update. DHH's taste-level curation produces a coherent, opinionated result.

**What themex does better**: Derivation from minimal input (Omarchy requires all 22 values). Runtime API (not just static config files). Built-in theme library. Terminal detection. 19 semantic tokens provide richer UI mapping than Omarchy's 6.

**Key insight from Omarchy**: The config generation pipeline (one palette -> configs for multiple tools) is a killer feature. This is a future direction for themex.

## themex vs Apple HIG

[Apple's Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/color) define a system-wide color approach for macOS/iOS.

| Feature | Apple HIG | themex |
|---------|-----------|--------|
| **Accent colors** | ONE system accent (user-chosen, 7 options) | ONE primary accent (user-chosen, any color) |
| **Text hierarchy** | 4 levels via opacity (primary, secondary, tertiary, quaternary) | 4 levels (`$text`, `$text2`, `$text3`, `$text4`) |
| **Surface handling** | Background + grouped background + elevated | `$bg`, `$surface`, `$chromebg` |
| **Dark/light** | System-level toggle | Per-theme flag (inferred or explicit) |
| **Vibrancy/transparency** | System blur effects | Not applicable (terminal) |

**What Apple HIG does better**: System-level integration (dark mode toggle, Dynamic Type, accessibility settings). Vibrancy and transparency effects create depth. The constraint of ONE accent color produces clean, focused UIs.

**What themex does better**: Terminal-native (Apple HIG has no terminal concept). 8 accent hues (Apple's system provides 7 preset accents with no custom option). Content palette for data visualization and syntax highlighting.

**Key insight from Apple HIG**: Text hierarchy via opacity is the most natural approach -- it's literally the same color at different intensities, so it always looks harmonious. ONE accent color prevents the "rainbow problem." We adopted both.

## themex vs oh-my-pi

[oh-my-pi](https://github.com/can1357/oh-my-pi) is a terminal AI coding agent with a sophisticated 66-token theme system.

| Feature | oh-my-pi | themex |
|---------|----------|--------|
| **Architecture** | 3 layers: `vars` -> `colors` -> component interfaces | 2 layers: ThemePalette -> Theme |
| **Token count** | 66 semantic tokens | 19 semantic + 16 palette = 35 |
| **Component coupling** | Tight (tokens like `breadcrumb_active_fg`, `tab_close_hover_bg`) | Loose (UI-agnostic tokens like `$primary`, `$text2`) |
| **Color-blind mode** | Built-in symbol theming | Not built-in (future consideration) |
| **Accessibility** | First-class | Contrast checking via `contrastFg()` |

**What oh-my-pi does better**: Color-blind mode with symbol differentiation is a genuine accessibility innovation. Component interfaces (components declare their color needs) enforce consistency. 3-layer indirection provides fine-grained control.

**What themex does better**: 19 semantic tokens vs 66 -- our tokens are UI-agnostic, so any component can use them without consulting a lookup table. 66 component-specific tokens couple the theme interface to UI implementation details. Our 2-layer architecture is simpler to understand and author for.

**Key insight from oh-my-pi**: The two-layer indirection pattern (raw palette -> semantic) is the core architectural insight that validates our exact approach.

## themex vs Zed

[Zed](https://zed.dev/) editor uses 150+ theme tokens with per-state variants.

| Feature | Zed | themex |
|---------|-----|--------|
| **Token count** | 150+ | 35 |
| **State variants** | hover/active/disabled per token | Not in theme (handled by components) |
| **Terminal colors** | 24 (16 ANSI + fg/bg + cursor/selection + bright fg/bg) | 16 ANSI palette |
| **Platform** | Desktop editor (Rust) | Universal (terminal, web, native) |

**What Zed does better**: 150+ tokens means pixel-perfect control over every UI state. The 24 terminal color slots cover every edge case.

**What themex does better**: 35 tokens vs 150+ -- much easier to author and maintain. State variants (hover, active, disabled) belong in component logic, not the theme interface. TUI components have fewer states than a full desktop editor.

**Key insight**: The right abstraction level depends on the platform. 150+ tokens is appropriate for a desktop editor; 35 is appropriate for a terminal/web theme system.

## Summary Matrix

| System | Palette | Tokens | Detection | Derivation | Runtime | Platforms | Ecosystem |
|--------|---------|--------|-----------|------------|---------|-----------|-----------|
| **themex** | 14 | 35 | OSC 4/10/11 | `deriveTheme()` | Yes | Terminal, web, native | Base16, iTerm2, Catppuccin |
| **Textual** | 11 | ~77 | None | Shade generation | Yes (Python) | Terminal (Python) | None |
| **Charm/lipgloss** | Per-component | Per-component | Color profile only | None | Yes (Go) | Terminal (Go) | None |
| **Catppuccin** | 26 | 26 (raw) | None | None | Data only | Any (via ports) | 300+ app ports |
| **Base16** | 16 | 16 (raw) | None | None | Build-time | Any (via templates) | 230+ schemes |
| **Material Design 3** | 1 seed | ~25 roles | None | HCT rotation | Yes | Web, mobile | Google ecosystem |
| **Omarchy** | 22 | 22 | None | None | None | Terminal tools | Shell scripts |
| **Apple HIG** | 1 accent | ~20 | System-level | System-level | System | macOS, iOS | Apple ecosystem |
| **oh-my-pi** | ~20 | 66 | None | 3-layer | Yes (TS) | Terminal (TS) | None |
| **Zed** | ~50 | 150+ | None | None | Yes (Rust) | Desktop (Rust) | Zed themes |
