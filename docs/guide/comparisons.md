# Inspirations

swatch learned from theme systems across many languages and platforms. Textual is Python, Lipgloss is Go, M3 is for mobile/web -- these aren't competitors but teachers. Each solved a piece of the theming puzzle, and swatch synthesizes the best ideas into a TypeScript-native, terminal-first, platform-agnostic package.

## Textual

[Textual](https://textual.textualize.io/guide/design/) is a Python TUI framework with an integrated CSS-based theme system. The single biggest influence on swatch.

Adopted: minimal authoring path (`Theme(primary=...)` -> full theme), automatic shade generation (we use OKLCH instead of RGB), semantic token categories (`$primary`, `$surface`, `$error`). Diverged: Textual doesn't detect terminal colors (assumes full truecolor control), uses a CSS engine (we use framework-agnostic `$token` strings), and lacks the 16 ANSI accent spectrum.

**What we learned**: One color in, full theme out. The minimal authoring path is essential.

## Charm / Lipgloss + BubbleTea

[Lipgloss](https://github.com/charmbracelet/lipgloss) is a Go styling library for terminal apps. [BubbleTint](https://github.com/lrstanley/bubbletint) adds theme registry support.

Adopted: color manipulation utilities as first-class API (`blend()`, `brighten()`, `darken()`, `contrastFg()`). The `CompleteAdaptiveColor` pattern (dark/light x truecolor/256/16) validates our ANSI 16 fallback approach. Using ANSI palette indices as "semantic slots" inspired our terminal color detection.

**What we learned**: Color utilities should be first-class API. The ANSI palette as "semantic slots" is a powerful idea.

## Catppuccin

[Catppuccin](https://catppuccin.com/) is a community-driven color scheme with 26 named colors and ports for 300+ apps.

Adopted: OKLCH bright variant formula for perceptually correct derivation. The 4 built-in Catppuccin palettes are among swatch's most popular presets. Diverged: 26 colors and 300+ manual per-app ports -- swatch's `deriveTheme()` eliminates manual porting.

**What we learned**: OKLCH for derivation. Community-loved palettes are worth shipping built-in.

## Base16 / tinted-theming

[Base16](https://github.com/tinted-theming/home) defines 16-color themes with a template system for generating app configs.

Adopted: `importBase16()`/`exportBase16()` bridges the 230+ scheme ecosystem. The 16-slot palette maps directly to terminal ANSI colors. Diverged: Base16 uses opaque slot names (`base08` = "usually red") -- swatch uses semantic names. Base16 is build-time only; swatch has a full runtime API.

**What we learned**: The 16-slot palette is the universal terminal baseline.

## Material Design 3

[M3](https://m3.material.io/styles/color/system/how-the-system-works) uses HCT (Hue-Chroma-Tone) color science to derive themes from a single seed color.

Adopted: perceptually uniform color spaces (HCT/OKLCH) for derivation. The `onPrimary` concept (contrast text for colored backgrounds) maps to our `$primaryfg`/`$selectionfg` pattern. Rejected: secondary/tertiary accent families -- over-engineered for TUIs.

**What we learned**: Perceptual color science produces better derivation than RGB/HSL.

## Omarchy (DHH)

[Omarchy](https://github.com/basecamp/omarchy) -- one `colors.toml` generates configs for Neovim, tmux, bat, lazygit.

Adopted: the "one source, many configs" philosophy. Our ColorPalette -> `deriveTheme()` is the same idea. Diverged: Omarchy requires all 22 values hand-specified with no derivation; swatch generates from minimal input.

**What we learned**: Cross-tool config generation from a single palette is a high-value future direction.

## Apple HIG

[Apple's HIG](https://developer.apple.com/design/human-interface-guidelines/color) -- system-wide color principles.

Adopted: text hierarchy via opacity cascade (primary -> muted -> disabled). ONE user-chosen accent color prevents the "rainbow problem."

**What we learned**: Text hierarchy via opacity. ONE accent color produces clean, focused UIs.

## oh-my-pi

[oh-my-pi](https://github.com/can1357/oh-my-pi) -- terminal AI coding agent with a 66-token, 3-layer theme system.

Adopted: the two-layer indirection pattern (raw palette -> semantic tokens) validates our architecture. Color-blind mode with symbol differentiation is a genuine accessibility innovation. Rejected: 66 component-specific tokens (e.g., `breadcrumb_active_fg`) -- couples theme interface to UI implementation details.

**What we learned**: Two-layer indirection is the core architectural insight. Keep tokens UI-agnostic.

## Zed Editor

[Zed](https://zed.dev/) uses 150+ theme tokens with per-state variants (hover/active/disabled per token).

Rejected: too granular for TUIs -- `input_border_active_hover` belongs in CSS, not a theme interface. TUI components have fewer states than a desktop editor.

**What we learned**: The right abstraction level depends on the platform. 49 tokens (33 semantic + 16 palette) is right for terminal/web; 150+ is right for a desktop editor.
