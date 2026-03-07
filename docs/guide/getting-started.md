# Getting Started

## Installation

::: code-group

```bash [bun]
bun add swatch
```

```bash [npm]
npm install swatch
```

```bash [pnpm]
pnpm add swatch
```

:::

## Quick Start

### Use a Built-in Theme

```typescript
import { presetTheme, resolveThemeColor } from "swatch"

const theme = presetTheme("catppuccin-mocha")

// Resolve semantic tokens
const primary = resolveThemeColor("$primary", theme) // "#F9E2AF"
const bg = resolveThemeColor("$bg", theme) // "#1E1E2E"
const error = resolveThemeColor("$error", theme) // "#F38BA8"
```

### Create a Theme from Scratch

```typescript
import { createTheme } from "swatch"

// Just a background color — everything else is derived
const theme = createTheme().bg("#2E3440").build()

// Background + primary accent
const theme2 = createTheme().bg("#2E3440").primary("#EBCB8B").build()

// Full control: bg, fg, primary, explicit dark mode
const theme3 = createTheme().bg("#2E3440").fg("#ECEFF4").primary("#EBCB8B").dark().build()
```

### One-liner Shortcuts

```typescript
import { quickTheme, presetTheme } from "swatch"

// From a hex color
const theme = quickTheme("#EBCB8B", "dark")

// From a color name
const theme2 = quickTheme("blue")

// From a preset
const theme3 = presetTheme("nord")
```

## Using Tokens in UI

The `Theme` object contains 19 semantic tokens that your UI components reference with a `$` prefix:

```typescript
import { resolveThemeColor } from "swatch"

function applyTheme(theme: Theme) {
  const bg = resolveThemeColor("$bg", theme)
  const text = resolveThemeColor("$text", theme)
  const primary = resolveThemeColor("$primary", theme)

  // Apply to your UI framework
  document.body.style.backgroundColor = bg
  document.body.style.color = text
}
```

Non-token strings pass through unchanged, so you can mix tokens with literal colors:

```typescript
resolveThemeColor("$primary", theme) // resolved from theme
resolveThemeColor("#FF0000", theme) // passed through as-is
resolveThemeColor("red", theme) // passed through as-is
```

## CLI

swatch includes a CLI for exploring themes:

```bash
bunx swatch list                    # List all 45 built-in themes
bunx swatch show catppuccin-mocha   # Show theme details with swatches
bunx swatch generate yellow         # Generate ANSI 16 theme
bunx swatch export nord             # Export as Base16 YAML
```

See the [CLI Reference](/reference/cli) for all commands.

## Next Steps

- [Creating Themes](/guide/creating-themes) -- Define custom palettes and use the builder API
- [Semantic Tokens](/reference/semantic-tokens) -- Understand all 19 tokens and when to use each
- [Theme Gallery](/gallery/) -- Browse all 45 built-in themes with color swatches
