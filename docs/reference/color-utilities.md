# Color Utilities

Low-level color manipulation functions exported from themex. All functions operate on `#RRGGBB` hex strings.

## Functions

### `blend(a, b, t)`

Blend two hex colors. `t=0` returns `a`, `t=1` returns `b`.

```typescript
import { blend } from "themex"

blend("#000000", "#FFFFFF", 0.5)  // -> "#808080"
blend("#FF0000", "#0000FF", 0.3)  // -> "#B30049" (30% toward blue)
blend("#2E3440", "#ECEFF4", 0.1)  // -> "#3F4452" (10% toward white)
```

For non-hex inputs (ANSI color names), returns `a` unchanged.

**Signature:**
```typescript
function blend(a: string, b: string, t: number): string
```

### `brighten(color, amount)`

Brighten a hex color by blending toward white. `amount=0.1` adds 10% lightness.

```typescript
import { brighten } from "themex"

brighten("#2E3440", 0.1)   // -> "#3F4452" (slightly brighter)
brighten("#2E3440", 0.5)   // -> "#979AA0" (50% toward white)
brighten("#2E3440", 1.0)   // -> "#FFFFFF" (fully white)
```

Equivalent to `blend(color, "#FFFFFF", amount)`.

**Signature:**
```typescript
function brighten(color: string, amount: number): string
```

### `darken(color, amount)`

Darken a hex color by blending toward black. `amount=0.1` adds 10% darkness.

```typescript
import { darken } from "themex"

darken("#ECEFF4", 0.1)   // -> "#D4D7DC" (slightly darker)
darken("#ECEFF4", 0.5)   // -> "#76787A" (50% toward black)
darken("#ECEFF4", 1.0)   // -> "#000000" (fully black)
```

Equivalent to `blend(color, "#000000", amount)`.

**Signature:**
```typescript
function darken(color: string, amount: number): string
```

### `contrastFg(bg)`

Pick black or white text for readability on the given background. Uses relative luminance per WCAG 2.0.

```typescript
import { contrastFg } from "themex"

contrastFg("#2E3440")   // -> "#FFFFFF" (white text on dark bg)
contrastFg("#ECEFF4")   // -> "#000000" (black text on light bg)
contrastFg("#808080")   // -> "#000000" (black text on medium bg)
```

**Signature:**
```typescript
function contrastFg(bg: string): "#000000" | "#FFFFFF"
```

### `hexToRgb(hex)`

Parse a hex color string to an `[r, g, b]` tuple (0-255). Returns `null` for non-hex input.

```typescript
import { hexToRgb } from "themex"

hexToRgb("#2E3440")   // -> [46, 52, 64]
hexToRgb("#FF0000")   // -> [255, 0, 0]
hexToRgb("red")       // -> null
```

**Signature:**
```typescript
function hexToRgb(hex: string): [number, number, number] | null
```

### `rgbToHex(r, g, b)`

Convert `[r, g, b]` values (0-255) to a hex string. Values are clamped and rounded.

```typescript
import { rgbToHex } from "themex"

rgbToHex(46, 52, 64)     // -> "#2E3440"
rgbToHex(255, 0, 0)      // -> "#FF0000"
rgbToHex(127.5, 0, 0)    // -> "#800000" (rounded)
```

**Signature:**
```typescript
function rgbToHex(r: number, g: number, b: number): string
```

## Usage in Theme Derivation

These utilities are used internally by `deriveTheme()` to compute semantic tokens:

```typescript
// text3 is computed as a blend of subtext and overlay
text3: blend(p.subtext, p.overlay, 0.5)

// text4 is computed as a blend of overlay and base
text4: blend(p.overlay, p.base, 0.5)

// control is computed as a blend of primary and overlay
control: blend(primary, p.overlay, 0.3)
```

They are also used by the builder to generate surface ramps:

```typescript
// Dark theme surface ramp
crust:   darken(bg, 0.05)
surface: brighten(bg, 0.05)
overlay: brighten(bg, 0.15)
subtext: brighten(bg, 0.55)
text:    brighten(bg, 0.85)
```
