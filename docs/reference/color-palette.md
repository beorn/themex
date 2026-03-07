# ColorPalette

The `ColorPalette` interface defines the 22-color format that every modern terminal emulator uses (Ghostty, Kitty, Alacritty, iTerm2, WezTerm). It is the universal pivot format for theme creation.

## Architecture

```
Inputs (Base16, presets, fromColors, ...) → ColorPalette (22) → deriveTheme() → Theme (33)
```

All theme creation flows through ColorPalette. Theme authors provide 22 terminal colors; `deriveTheme()` produces 33 semantic tokens.

## Interface

```typescript
interface ColorPalette {
  name?: string
  dark?: boolean

  // 16 ANSI palette
  black: string;       red: string;         green: string;       yellow: string
  blue: string;        magenta: string;     cyan: string;        white: string
  brightBlack: string; brightRed: string;   brightGreen: string; brightYellow: string
  brightBlue: string;  brightMagenta: string; brightCyan: string; brightWhite: string

  // 6 special colors
  foreground: string          // Default text color
  background: string          // Default background color
  cursorColor: string         // Cursor block/line color
  cursorText: string          // Text rendered under cursor
  selectionBackground: string // Selected text background
  selectionForeground: string // Selected text foreground
}
```

## Fields

### 16 ANSI Colors

The standard 16-color palette used by every terminal. Colors 0--7 are "normal" intensity; 8--15 are "bright" variants:

| Index | Normal | Index | Bright |
| ----- | ------ | ----- | ------ |
| 0 | black | 8 | brightBlack |
| 1 | red | 9 | brightRed |
| 2 | green | 10 | brightGreen |
| 3 | yellow | 11 | brightYellow |
| 4 | blue | 12 | brightBlue |
| 5 | magenta | 13 | brightMagenta |
| 6 | cyan | 14 | brightCyan |
| 7 | white | 15 | brightWhite |

### 6 Special Colors

| Field | Purpose |
| ----- | ------- |
| `foreground` | Default text color |
| `background` | Default background color |
| `cursorColor` | Cursor block/line color |
| `cursorText` | Text rendered under the cursor |
| `selectionBackground` | Background of selected text |
| `selectionForeground` | Foreground of selected text |

## Example

Catppuccin Mocha expressed as a ColorPalette (abbreviated):

```typescript
import type { ColorPalette } from "swatch"

const mocha: ColorPalette = {
  name: "catppuccin-mocha", dark: true,
  black: "#45475A",   red: "#F38BA8",    green: "#A6E3A1",  yellow: "#F9E2AF",
  blue: "#89B4FA",    magenta: "#F5C2E7", cyan: "#94E2D5",  white: "#BAC2DE",
  brightBlack: "#585B70", brightRed: "#F38BA8", /* ...remaining bright colors... */
  foreground: "#CDD6F4", background: "#1E1E2E",
  cursorColor: "#F5E0DC", cursorText: "#1E1E2E",
  selectionBackground: "#585B70", selectionForeground: "#CDD6F4",
}
```

Every major terminal theme (Nord, Dracula, Solarized, Tokyo Night, etc.) can be expressed directly as a ColorPalette since this is the format they already ship in.

## Usage

```typescript
import { deriveTheme } from "swatch"

const theme = deriveTheme(mocha) // ColorPalette → Theme (33 tokens)
```

## Validation

Use `validateColorPalette()` to check a palette before deriving:

```typescript
import { validateColorPalette } from "swatch"

const result = validateColorPalette(palette)
// { valid: boolean, missing: string[], extra: string[] }
```
