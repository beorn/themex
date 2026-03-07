# CLI Reference

swatch includes a command-line tool for exploring, generating, and converting themes.

## Installation

The CLI is available as `swatch` when installed globally, or via `bunx`/`npx`:

```bash
bunx swatch <command>
```

## Commands

### `list`

List all 45 built-in themes with accent color swatches.

```bash
bunx swatch list
```

Aliases: `ls`

Output groups themes by family (catppuccin, nord, dracula, etc.) and shows dark/light mode plus accent color swatches for each.

### `show <name>`

Show detailed information about a theme including surface ramp, accent hues, derived semantic tokens, and the 16-color palette.

```bash
bunx swatch show catppuccin-mocha
bunx swatch show nord
bunx swatch show tokyo-night
```

Aliases: `info`

You can also pass a theme name directly without the `show` command:

```bash
bunx swatch catppuccin-mocha
```

### `generate <primary>`

Generate an ANSI 16 theme from a primary color.

```bash
bunx swatch generate yellow
bunx swatch generate cyan --light
bunx swatch generate blue
```

Aliases: `gen`

Supported primaries: `yellow`, `cyan`, `magenta`, `green`, `red`, `blue`, `white`.

Options:

- `--light` -- Generate a light variant (default is dark)

You can also pass a hex color to generate a truecolor theme via the builder:

```bash
bunx swatch generate "#EBCB8B"
```

### `import <file>`

Import a Base16 YAML file and display the resulting ThemePalette as JSON.

```bash
bunx swatch import ocean.yaml
bunx swatch import ~/themes/custom.yaml
```

### `export <name>`

Export a built-in palette as Base16 YAML.

```bash
bunx swatch export catppuccin-mocha
bunx swatch export nord > nord-base16.yaml
```

### `validate <name>`

Validate a built-in palette, checking for missing fields and low-contrast warnings.

```bash
bunx swatch validate catppuccin-mocha
bunx swatch validate nord
```

### `help`

Show usage information.

```bash
bunx swatch help
bunx swatch --help
bunx swatch -h
```

## Available Theme Names

All 45 built-in themes:

| Family      | Themes                                                                              |
| ----------- | ----------------------------------------------------------------------------------- |
| Catppuccin  | `catppuccin-mocha`, `catppuccin-frappe`, `catppuccin-macchiato`, `catppuccin-latte` |
| Nord        | `nord`                                                                              |
| Dracula     | `dracula`                                                                           |
| Solarized   | `solarized-dark`, `solarized-light`                                                 |
| Tokyo Night | `tokyo-night`, `tokyo-night-storm`, `tokyo-night-day`                               |
| One Dark    | `one-dark`                                                                          |
| Gruvbox     | `gruvbox-dark`, `gruvbox-light`                                                     |
| Rose Pine   | `rose-pine`, `rose-pine-moon`, `rose-pine-dawn`                                     |
| Kanagawa    | `kanagawa-wave`, `kanagawa-dragon`, `kanagawa-lotus`                                |
| Everforest  | `everforest-dark`, `everforest-light`                                               |
| Monokai     | `monokai`, `monokai-pro`                                                            |
| Snazzy      | `snazzy`                                                                            |
| Material    | `material-dark`, `material-light`                                                   |
| Palenight   | `palenight`                                                                         |
| Ayu         | `ayu-dark`, `ayu-mirage`, `ayu-light`                                               |
| Nightfox    | `nightfox`, `dawnfox`                                                               |
| Horizon     | `horizon`                                                                           |
| Moonfly     | `moonfly`                                                                           |
| Nightfly    | `nightfly`                                                                          |
| Oxocarbon   | `oxocarbon-dark`, `oxocarbon-light`                                                 |
| Sonokai     | `sonokai`                                                                           |
| Edge        | `edge-dark`, `edge-light`                                                           |
| Modus       | `modus-vivendi`, `modus-operandi`                                                   |
