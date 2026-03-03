# Importing and Exporting Themes

## Base16 Format

[Base16](https://github.com/chriskempson/base16) is a theme specification with 600+ community-created color schemes. themex can import and export Base16 YAML, giving you access to the entire Base16 ecosystem.

## Importing Base16 Schemes

```typescript
import { importBase16, deriveTheme } from "themex"

const yaml = `
scheme: "Ocean"
author: "Chris Kempson"
base00: "2b303b"
base01: "343d46"
base02: "4f5b66"
base03: "65737e"
base04: "a7adba"
base05: "c0c5ce"
base06: "dfe1e8"
base07: "eff1f5"
base08: "bf616a"
base09: "d08770"
base0A: "ebcb8b"
base0B: "a3be8c"
base0C: "96b5b4"
base0D: "8fa1b3"
base0E: "b48ead"
base0F: "ab7967"
`

const palette = importBase16(yaml)
const theme = deriveTheme(palette)
```

### Base16 to ThemePalette Mapping

| Base16 | ThemePalette | Role                        |
|--------|--------------|-----------------------------|
| base00 | `base`       | Primary background          |
| base01 | `surface`    | Raised surfaces             |
| base02 | `overlay`    | Borders, chrome             |
| base03 | `subtext`    | Muted text                  |
| base04 | _(skipped)_  | Between subtext and text    |
| base05 | `text`       | Primary text                |
| base06 | _(skipped)_  | Light foreground            |
| base07 | _(skipped)_  | Lightest background         |
| base08 | `red`        | Error                       |
| base09 | `orange`     | Warning                     |
| base0A | `yellow`     | Primary accent              |
| base0B | `green`      | Success                     |
| base0C | `teal`       | Cool accent                 |
| base0D | `blue`       | Links, focus                |
| base0E | `purple`     | Decorative                  |
| base0F | `pink`       | Warm accent                 |

The `crust` field (not present in Base16) is derived by darkening `base00` for dark themes or brightening it for light themes. Dark/light is inferred from the luminance of `base00`.

### Import from File (CLI)

```bash
bunx themex import scheme.yaml
```

## Exporting to Base16

```typescript
import { exportBase16 } from "themex"
import { catppuccinMocha } from "themex"

const yaml = exportBase16(catppuccinMocha)
console.log(yaml)
```

Output:

```yaml
scheme: "catppuccin-mocha"
author: ""
base00: "1E1E2E"
base01: "313244"
base02: "6C7086"
base03: "A6ADC8"
base04: "B9BEDA"
base05: "CDD6F4"
base06: "D7DEF6"
base07: "11111B"
base08: "F38BA8"
base09: "FAB387"
base0A: "F9E2AF"
base0B: "A6E3A1"
base0C: "94E2D5"
base0D: "89B4FA"
base0E: "CBA6F7"
base0F: "F5C2E7"
```

### Interpolated Values

ThemePalette has 14 colors but Base16 has 16. The three extra Base16 slots are interpolated on export:

| Base16 | Derivation |
|--------|------------|
| base04 | `blend(subtext, text, 0.33)` -- between comments and foreground |
| base06 | `blend(text, white/black, 0.15)` -- lighter/darker foreground |
| base07 | `crust` -- the deepest background inverse |

### Export from CLI

```bash
bunx themex export catppuccin-mocha > catppuccin-mocha.yaml
```

## Round-Trip Fidelity

Import and export preserve the 13 directly-mapped fields exactly. Only `crust` (derived on import) and base04/base06/base07 (interpolated on export) may differ from the original Base16 scheme.

```typescript
import { importBase16, exportBase16 } from "themex"

const palette = importBase16(originalYaml)
const roundTripped = exportBase16(palette)
// base00-base03, base05, base08-base0F: identical
// base04, base06, base07: may differ (interpolated)
// crust: derived, not in Base16
```
