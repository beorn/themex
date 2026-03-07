import { createTerminal } from "@termless/core"
import { createXtermBackend } from "@termless/xtermjs"
import { spawn } from "node:child_process"
import { writeFileSync } from "node:fs"

const term = createTerminal({ backend: createXtermBackend({ cols: 140, rows: 42 }) })
const proc = spawn("bun", ["vendor/swatch/src/view.tsx"], {
  cwd: "/Users/beorn/Code/pim/km",
  env: { ...process.env, TERM: "xterm-256color", NO_COLOR: undefined, FORCE_COLOR: "1" },
})
proc.stdout!.on("data", (chunk: Buffer) => term.feed(chunk))
proc.stderr!.on("data", (chunk: Buffer) => {})

await new Promise((r) => setTimeout(r, 3000))

// Dump plain text of each row
const lines: string[] = []
for (let row = 0; row < 42; row++) {
  const region = term.row(row)
  lines.push(region.text.trimEnd())
}
writeFileSync("/tmp/swatch-text.txt", lines.join("\n"))

// Also save SVG with explicit size
const svg = term.screenshotSvg()
writeFileSync("/tmp/swatch-view.svg", svg)
const { execSync } = await import("node:child_process")
try {
  execSync("rsvg-convert -w 1680 /tmp/swatch-view.svg -o /tmp/swatch-view.png")
} catch {}

proc.kill()
term.close()
process.exit(0)
