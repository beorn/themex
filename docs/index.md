---
layout: home

hero:
  name: swatch
  text: Universal Color Themes
  tagline: Easily theme any app with modern design tokens. Easily create themes from just a few colors.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: brand
      text: Browse Themes
      link: /themes

features:
  - title: One Color → Full Theme
    details: Create themes from as little as one hex color. The builder derives all 33 semantic tokens automatically with correct contrast and dark/light support.
  - title: Two-Layer Architecture
    details: Define a 22-color terminal palette. Get 33 semantic tokens via deriveTheme(). Clean separation between palette authoring and UI consumption.
  - title: Base16 Compatible
    details: Import any of the 600+ community Base16 schemes. Export your themes back to Base16 YAML for use in terminals, editors, and shells.
  - title: 43 Built-in Themes
    details: Catppuccin, Nord, Dracula, Solarized, Tokyo Night, Gruvbox, Rose Pine, Kanagawa, and many more. Each defined as a ColorPalette.
  - title: Dark/Light Auto-Detection
    details: Detects dark or light mode from the environment — terminal palette via OSC queries, browser via prefers-color-scheme. Themes adapt automatically.
  - title: Zero Dependencies
    details: Pure TypeScript. No runtime dependencies. Works with any bundler, any runtime, any platform.
---
