# Web Usage

swatch themes are platform-agnostic. While the built-in `resolveThemeColor()` function is designed for terminal rendering, the same `ColorPalette` + `deriveTheme()` pipeline produces a `Theme` object that maps naturally to CSS custom properties, React context, or any web framework.

## CSS Custom Properties

Convert a Theme to CSS custom properties using the built-in `themeToCSSVars`:

```typescript
import { presetTheme, themeToCSSVars } from "swatch"

const theme = presetTheme("catppuccin-mocha")
const vars = themeToCSSVars(theme)

// Apply to :root
for (const [key, value] of Object.entries(vars)) {
  document.documentElement.style.setProperty(key, value)
}
```

Then use the variables in CSS:

```css
:root {
  /* Set by themeToCSSVars() — all 33 tokens + 22 palette colors */
  --theme-primary: #f9e2af;
  --theme-fg: #cdd6f4;
  --theme-bg: #1e1e2e;
  --theme-surface: #313244;
  --theme-border: #6c7086;
  --theme-error: #f38ba8;
}

body {
  background-color: var(--theme-bg);
  color: var(--theme-fg);
}

a {
  color: var(--theme-link);
}

.card {
  background-color: var(--theme-surface);
  border: 1px solid var(--theme-border);
}

.error {
  color: var(--theme-error);
}

.badge {
  background-color: var(--theme-primary);
  color: var(--theme-primaryfg);
}
```

## React Context

Wrap your app in a theme provider that makes the Theme object available via context:

```tsx
import { createContext, useContext, useMemo, useState } from "react"
import { presetTheme, deriveTheme, themeToCSSVars } from "swatch"
import type { Theme, ColorPalette } from "swatch"

// ── Context ────────────────────────────────────────────────────

const ThemeContext = createContext<Theme | null>(null)

export function useTheme(): Theme {
  const theme = useContext(ThemeContext)
  if (!theme) throw new Error("useTheme must be used within ThemeProvider")
  return theme
}

// ── Provider ───────────────────────────────────────────────────

interface ThemeProviderProps {
  preset?: string
  palette?: ColorPalette
  children: React.ReactNode
}

export function ThemeProvider({ preset, palette, children }: ThemeProviderProps) {
  const theme = useMemo(() => {
    if (palette) return deriveTheme(palette)
    return presetTheme(preset ?? "catppuccin-mocha")
  }, [preset, palette])

  // Apply CSS custom properties to document root
  useMemo(() => {
    const vars = themeToCSSVars(theme)
    const root = document.documentElement.style
    for (const [key, value] of Object.entries(vars)) {
      root.setProperty(key, value)
    }
  }, [theme])

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}

// ── Usage ──────────────────────────────────────────────────────

function StatusBadge({ status }: { status: "error" | "warning" | "success" }) {
  const theme = useTheme()
  return <span style={{ color: theme[status] }}>{status}</span>
}

function App() {
  return (
    <ThemeProvider preset="nord">
      <StatusBadge status="success" />
    </ThemeProvider>
  )
}
```

## Theme Switching

Combine the provider with state for runtime theme switching:

```tsx
import { useState } from "react"
import { presetTheme } from "swatch"

const themeNames = ["catppuccin-mocha", "nord", "dracula", "catppuccin-latte", "solarized-light"] as const

function App() {
  const [themeName, setThemeName] = useState<string>("catppuccin-mocha")

  return (
    <ThemeProvider preset={themeName}>
      <select value={themeName} onChange={(e) => setThemeName(e.target.value)}>
        {themeNames.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
      <MainContent />
    </ThemeProvider>
  )
}
```

## Native Platforms

The `deriveTheme()` pipeline produces platform-agnostic hex colors. The same hex values work in any platform — CSS, SwiftUI, Jetpack Compose, or anything else that accepts `#RRGGBB`.
