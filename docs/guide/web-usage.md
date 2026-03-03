# Web Usage

themex themes are platform-agnostic. While the built-in `resolveThemeColor()` function is designed for terminal rendering, the same `ThemePalette` + `deriveTheme()` pipeline produces a `Theme` object that maps naturally to CSS custom properties, React context, or any web framework.

## CSS Custom Properties

Convert a Theme to CSS custom properties for use in any web project:

```typescript
import { presetTheme } from "themex"
import type { Theme } from "themex"

function themeToCssVars(theme: Theme): Record<string, string> {
  return {
    "--theme-primary": theme.primary,
    "--theme-link": theme.link,
    "--theme-control": theme.control,
    "--theme-selected": theme.selected,
    "--theme-selectedfg": theme.selectedfg,
    "--theme-focusring": theme.focusring,
    "--theme-text": theme.text,
    "--theme-text2": theme.text2,
    "--theme-text3": theme.text3,
    "--theme-text4": theme.text4,
    "--theme-bg": theme.bg,
    "--theme-surface": theme.surface,
    "--theme-separator": theme.separator,
    "--theme-chromebg": theme.chromebg,
    "--theme-chromefg": theme.chromefg,
    "--theme-error": theme.error,
    "--theme-warning": theme.warning,
    "--theme-success": theme.success,
    ...Object.fromEntries(
      theme.palette.map((color, i) => [`--theme-color${i}`, color])
    ),
  }
}

// Apply to :root
const theme = presetTheme("catppuccin-mocha")
const vars = themeToCssVars(theme)
for (const [key, value] of Object.entries(vars)) {
  document.documentElement.style.setProperty(key, value)
}
```

Then use the variables in CSS:

```css
:root {
  /* Set by themeToCssVars() */
  --theme-primary: #F9E2AF;
  --theme-text: #CDD6F4;
  --theme-bg: #1E1E2E;
  --theme-surface: #313244;
  --theme-separator: #6C7086;
  --theme-error: #F38BA8;
  /* ... all 19 tokens + 16 palette colors */
}

body {
  background-color: var(--theme-bg);
  color: var(--theme-text);
}

a {
  color: var(--theme-link);
}

.card {
  background-color: var(--theme-surface);
  border: 1px solid var(--theme-separator);
}

.error {
  color: var(--theme-error);
}

.badge {
  background-color: var(--theme-primary);
  color: var(--theme-chromefg);
}
```

## React Context

Wrap your app in a theme provider that makes the Theme object available via context:

```tsx
import { createContext, useContext, useMemo, useState } from "react"
import { presetTheme, deriveTheme } from "themex"
import type { Theme, ThemePalette } from "themex"

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
  palette?: ThemePalette
  children: React.ReactNode
}

export function ThemeProvider({ preset, palette, children }: ThemeProviderProps) {
  const theme = useMemo(() => {
    if (palette) return deriveTheme(palette)
    return presetTheme(preset ?? "catppuccin-mocha")
  }, [preset, palette])

  // Apply CSS custom properties to document root
  useMemo(() => {
    const root = document.documentElement.style
    root.setProperty("--theme-primary", theme.primary)
    root.setProperty("--theme-text", theme.text)
    root.setProperty("--theme-bg", theme.bg)
    root.setProperty("--theme-surface", theme.surface)
    root.setProperty("--theme-separator", theme.separator)
    root.setProperty("--theme-error", theme.error)
    root.setProperty("--theme-warning", theme.warning)
    root.setProperty("--theme-success", theme.success)
    // ... remaining tokens
  }, [theme])

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  )
}

// ── Usage ──────────────────────────────────────────────────────

function StatusBadge({ status }: { status: "error" | "warning" | "success" }) {
  const theme = useTheme()
  return (
    <span style={{ color: theme[status] }}>
      {status}
    </span>
  )
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
import { presetTheme } from "themex"

const themeNames = [
  "catppuccin-mocha", "nord", "dracula",
  "catppuccin-latte", "solarized-light",
] as const

function App() {
  const [themeName, setThemeName] = useState<string>("catppuccin-mocha")

  return (
    <ThemeProvider preset={themeName}>
      <select
        value={themeName}
        onChange={(e) => setThemeName(e.target.value)}
      >
        {themeNames.map((name) => (
          <option key={name} value={name}>{name}</option>
        ))}
      </select>
      <MainContent />
    </ThemeProvider>
  )
}
```

## Native Platforms

The same pattern extends to native platforms:

**Swift / SwiftUI:**

```swift
extension Color {
  init(theme token: String, from theme: Theme) {
    // Map theme fields to SwiftUI Color
    self.init(hex: theme[token])
  }
}

Text("Hello")
  .foregroundColor(Color(theme: "primary", from: theme))
```

**Kotlin / Jetpack Compose:**

```kotlin
@Composable
fun ThemeProvider(theme: Theme, content: @Composable () -> Unit) {
    val colors = MaterialTheme.colorScheme.copy(
        primary = Color.parse(theme.primary),
        error = Color.parse(theme.error),
        background = Color.parse(theme.bg),
        surface = Color.parse(theme.surface),
    )
    MaterialTheme(colorScheme = colors, content = content)
}
```

The key insight is that `deriveTheme()` produces platform-agnostic hex colors. The binding layer (CSS vars, React context, SwiftUI, Compose) is a thin wrapper specific to each platform.
