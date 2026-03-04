/**
 * Theme inheritance — create themes by extending a base theme with overrides.
 *
 * Simple shallow merge: overrides win for any specified tokens.
 */

import type { Theme } from "./types.js"

/**
 * Create a new theme by extending a base theme with partial overrides.
 *
 * Performs a shallow merge — any token specified in overrides replaces
 * the corresponding token in the base theme. Unspecified tokens are
 * inherited from the base.
 *
 * @param options.extends - The base theme to inherit from
 * @param options.overrides - Partial theme tokens to override
 * @returns A new Theme with overrides applied
 *
 * @example
 * ```typescript
 * const custom = extendTheme({
 *   extends: presetTheme("nord"),
 *   overrides: { primary: "#A3BE8C", name: "nord-green" },
 * })
 * ```
 */
export function extendTheme(options: {
  extends: Theme
  overrides: Partial<Omit<Theme, "palette">> & { palette?: string[] }
}): Theme {
  const { extends: base, overrides } = options
  return {
    ...base,
    ...overrides,
    // Palette: use override if provided, otherwise inherit base
    palette: overrides.palette ?? [...base.palette],
  }
}
