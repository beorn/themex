<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  autoGenerateTheme,
  presetTheme,
  builtinPalettes,
  deriveTheme,
  themeToCSSVars,
  exportBase16,
  checkContrast,
  createTheme,
  type Theme,
  type ColorPalette,
} from '../../../../src/index'

// ── State ──────────────────────────────────────────────────────────
const selectedPreset = ref<string | null>(null)
const baseColor = ref('#5E81AC')
const isDark = ref(true)
const presetFilter = ref('')
const activePreviewTab = ref<'app' | 'code'>('app')
const activeExportTab = ref<'code' | 'css' | 'base16'>('code')
const copied = ref(false)
const showAllTokens = ref(false)
const currentTheme = ref<Theme>(presetTheme('nord'))
const currentPalette = ref<ColorPalette | null>(builtinPalettes['nord'] ?? null)

// ── Palette list ───────────────────────────────────────────────────
const paletteEntries = computed(() => {
  let entries = Object.entries(builtinPalettes)
  entries = entries.filter(([, palette]) => isDark.value ? palette.dark !== false : palette.dark === false)
  if (!presetFilter.value) return entries
  const q = presetFilter.value.toLowerCase()
  return entries.filter(([name]) => name.toLowerCase().includes(q))
})

// ── Token groups for editing ───────────────────────────────────────
const tokenGroups = [
  { label: 'Backgrounds', keys: ['bg', 'fg', 'surface', 'surfacefg', 'muted', 'mutedfg'] },
  { label: 'Brand', keys: ['primary', 'primaryfg', 'secondary', 'secondaryfg', 'accent', 'accentfg'] },
  { label: 'Status', keys: ['error', 'errorfg', 'warning', 'warningfg', 'success', 'successfg', 'info', 'infofg'] },
  { label: 'Chrome', keys: ['border', 'inputborder', 'focusborder', 'link', 'disabledfg'] },
]
const allTokenKeys = [
  'bg', 'fg', 'surface', 'surfacefg', 'popover', 'popoverfg', 'muted', 'mutedfg',
  'primary', 'primaryfg', 'secondary', 'secondaryfg', 'accent', 'accentfg',
  'error', 'errorfg', 'warning', 'warningfg', 'success', 'successfg', 'info', 'infofg',
  'selection', 'selectionfg', 'inverse', 'inversefg', 'cursor', 'cursorfg',
  'border', 'inputborder', 'focusborder', 'link', 'disabledfg',
]
const essentialKeys = new Set(tokenGroups.flatMap(g => g.keys))
const extraTokenKeys = allTokenKeys.filter(k => !essentialKeys.has(k))

// ── Preview CSS vars ───────────────────────────────────────────────
const previewVars = computed(() => {
  const vars = themeToCSSVars(currentTheme.value)
  return Object.entries(vars).map(([k, v]) => `${k}:${v}`).join(';')
})

// ── Actions ────────────────────────────────────────────────────────
function selectPreset(name: string) {
  selectedPreset.value = name
  const palette = builtinPalettes[name]
  if (palette) {
    currentPalette.value = palette
    currentTheme.value = deriveTheme(palette)
  }
}

function generateFromColor() {
  selectedPreset.value = null
  currentPalette.value = null
  currentTheme.value = autoGenerateTheme(baseColor.value, isDark.value ? 'dark' : 'light')
}

function randomColor() {
  baseColor.value = '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0')
  generateFromColor()
}

function updateToken(key: string, value: string) {
  currentTheme.value = { ...currentTheme.value, [key]: value }
}

// ── Preview swatches for preset list ───────────────────────────────
function presetSwatches(palette: ColorPalette): string[] {
  const t = deriveTheme(palette)
  return [t.bg, t.primary, t.accent, t.error, t.success]
}

// ── Contrast badge ─────────────────────────────────────────────────
function contrastLabel(fg: string, bg: string): string {
  try {
    const r = checkContrast(fg, bg)
    return r.aaa ? 'AAA' : r.aa ? 'AA' : `${r.ratio.toFixed(1)}`
  } catch { return '' }
}

// ── Export content ─────────────────────────────────────────────────
const exportCode = computed(() => {
  const t = currentTheme.value
  const lines = ['createTheme()']
  const interesting = ['bg', 'fg', 'primary', 'secondary', 'accent', 'error', 'warning', 'success', 'info', 'border'] as const
  for (const k of interesting) {
    lines.push(`  .color('${k}', '${(t as Record<string, string>)[k]}')`)
  }
  lines.push('  .build()')
  return lines.join('\n')
})

const exportCSS = computed(() => {
  const vars = themeToCSSVars(currentTheme.value)
  return Object.entries(vars).map(([k, v]) => `${k}: ${v};`).join('\n')
})

const exportBase16Yaml = computed(() => {
  if (!currentPalette.value) return '/* Base16 export requires a preset palette */'
  return exportBase16(currentPalette.value)
})

async function copyExport() {
  const content = activeExportTab.value === 'code' ? exportCode.value
    : activeExportTab.value === 'css' ? exportCSS.value
    : exportBase16Yaml.value
  await navigator.clipboard.writeText(content)
  copied.value = true
  setTimeout(() => { copied.value = false }, 1500)
}

// ── Persistence ────────────────────────────────────────────────────
const STORAGE_KEY = 'swatch-builder-state'

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      theme: currentTheme.value,
      preset: selectedPreset.value,
      color: baseColor.value,
      dark: isDark.value,
    }))
  } catch {}
}

onMounted(() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const s = JSON.parse(raw)
      if (s.theme) currentTheme.value = s.theme
      if (s.preset) selectedPreset.value = s.preset
      if (s.color) baseColor.value = s.color
      if (typeof s.dark === 'boolean') isDark.value = s.dark
      if (s.preset && builtinPalettes[s.preset]) currentPalette.value = builtinPalettes[s.preset]!
    }
  } catch {}
})

watch([currentTheme, selectedPreset, baseColor, isDark], saveState, { deep: true })

watch(isDark, () => {
  if (selectedPreset.value) {
    const pal = builtinPalettes[selectedPreset.value]
    if ((pal?.dark !== false) !== isDark.value) {
      const first = paletteEntries.value[0]
      if (first) selectPreset(first[0])
      else { selectedPreset.value = null; generateFromColor() }
    }
  }
})
</script>

<template>
  <div class="tb">
    <!-- Top: mode toggle -->
    <div class="tb-mode-toggle">
      <button :class="{ active: isDark }" @click="isDark = true">Dark</button>
      <button :class="{ active: !isDark }" @click="isDark = false">Light</button>
    </div>

    <!-- Top row: Themes + Tokens side-by-side -->
    <div class="tb-columns">
      <!-- Themes column -->
      <section class="tb-section tb-col-themes">
        <h3>Themes</h3>
        <div class="tb-gen-row">
          <input type="color" v-model="baseColor" class="tb-color-input" />
          <span class="tb-hex">{{ baseColor }}</span>
          <button class="tb-btn" @click="generateFromColor">Generate</button>
          <button class="tb-btn tb-btn-alt" @click="randomColor">Random</button>
        </div>
        <input v-model="presetFilter" class="tb-search" placeholder="Filter palettes..." />
        <div class="tb-presets">
          <button
            v-for="[name, palette] in paletteEntries" :key="name"
            class="tb-preset" :class="{ active: selectedPreset === name }"
            @click="selectPreset(name)"
          >
            <span class="tb-preset-name">{{ name }}</span>
            <span class="tb-preset-strip">
              <span v-for="(c, i) in presetSwatches(palette)" :key="i"
                class="tb-preset-dot" :style="{ background: c }" />
            </span>
          </button>
        </div>
      </section>

      <!-- Tokens column -->
      <section class="tb-section tb-col-tokens">
        <h3>Customize Tokens</h3>
        <div v-for="group in tokenGroups" :key="group.label" class="tb-token-group">
          <h4>{{ group.label }}</h4>
          <div v-for="key in group.keys" :key="key" class="tb-token-row">
            <input type="color" :value="(currentTheme as any)[key]"
              @input="updateToken(key, ($event.target as HTMLInputElement).value)" class="tb-token-picker" />
            <span class="tb-token-name">{{ key }}</span>
            <code class="tb-token-hex">{{ (currentTheme as any)[key] }}</code>
          </div>
        </div>
        <button class="tb-expand" @click="showAllTokens = !showAllTokens">
          {{ showAllTokens ? 'Hide' : 'Show' }} all {{ extraTokenKeys.length }} tokens
        </button>
        <div v-if="showAllTokens" class="tb-token-group">
          <div v-for="key in extraTokenKeys" :key="key" class="tb-token-row">
            <input type="color" :value="(currentTheme as any)[key]"
              @input="updateToken(key, ($event.target as HTMLInputElement).value)" class="tb-token-picker" />
            <span class="tb-token-name">{{ key }}</span>
            <code class="tb-token-hex">{{ (currentTheme as any)[key] }}</code>
          </div>
        </div>
      </section>
    </div>

    <!-- Bottom: Preview (full width) -->
    <div class="tb-tabs">
      <button :class="{ active: activePreviewTab === 'app' }" @click="activePreviewTab = 'app'">App UI</button>
      <button :class="{ active: activePreviewTab === 'code' }" @click="activePreviewTab = 'code'">Code</button>
    </div>
    <div class="tb-preview" :style="previewVars">
      <!-- App UI mockup -->
      <template v-if="activePreviewTab === 'app'">
        <div class="p-nav">
          <span class="p-nav-title">Dashboard</span>
          <span class="p-nav-link">Settings</span>
        </div>
        <div class="p-card">
          <h4 class="p-card-title">Welcome back</h4>
          <p class="p-card-body">This is body text on a surface. <a class="p-link" href="javascript:void(0)">Learn more</a></p>
          <div class="p-buttons">
            <button class="p-btn-primary">Primary</button>
            <button class="p-btn-secondary">Secondary</button>
          </div>
          <div class="p-input-wrap">
            <input class="p-input" placeholder="Type something..." readonly />
          </div>
          <div class="p-badges">
            <span class="p-badge p-badge-error">Error</span>
            <span class="p-badge p-badge-warning">Warning</span>
            <span class="p-badge p-badge-success">Success</span>
            <span class="p-badge p-badge-info">Info</span>
          </div>
          <p class="p-muted-text">Muted helper text goes here</p>
          <p class="p-selected-text">Selected text example</p>
          <p class="p-disabled-text">Disabled placeholder</p>
        </div>
        <div class="p-contrast-grid">
          <span class="p-contrast-item" v-for="[label, fg, bg] in [
            ['fg/bg', currentTheme.fg, currentTheme.bg],
            ['primary', currentTheme.primaryfg, currentTheme.primary],
            ['surface', currentTheme.surfacefg, currentTheme.surface],
          ]" :key="label">
            {{ label }}: {{ contrastLabel(fg, bg) }}
          </span>
        </div>
      </template>

      <!-- Code Editor mockup -->
      <template v-else>
        <pre class="p-code"><code><span class="p-comment">// Theme: {{ currentTheme.name }}</span>
<span class="p-keyword">import</span> { <span class="p-func">createTheme</span> } <span class="p-keyword">from</span> <span class="p-string">"swatch"</span>

<span class="p-keyword">const</span> theme = <span class="p-func">createTheme</span>()
  .<span class="p-func">preset</span>(<span class="p-string">"{{ selectedPreset || 'custom' }}"</span>)
  .<span class="p-func">build</span>()

<span class="p-comment">// Apply to your UI</span>
<span class="p-keyword">const</span> colors = {
  bg: <span class="p-string">"{{ currentTheme.bg }}"</span>,
  primary: <span class="p-string">"{{ currentTheme.primary }}"</span>,
  accent: <span class="p-string">"{{ currentTheme.accent }}"</span>,
  error: <span class="p-string">"{{ currentTheme.error }}"</span>,
  count: <span class="p-number">{{ currentTheme.palette?.length || 16 }}</span>,
}

<span class="p-keyword">export default</span> colors</code></pre>
      </template>
    </div>

    <!-- Export -->
    <div class="tb-export">
      <div class="tb-tabs">
        <button :class="{ active: activeExportTab === 'code' }" @click="activeExportTab = 'code'">Code</button>
        <button :class="{ active: activeExportTab === 'css' }" @click="activeExportTab = 'css'">CSS</button>
        <button :class="{ active: activeExportTab === 'base16' }" @click="activeExportTab = 'base16'">Base16</button>
        <button class="tb-copy" @click="copyExport">{{ copied ? 'Copied!' : 'Copy' }}</button>
      </div>
      <pre class="tb-export-code"><code>{{ activeExportTab === 'code' ? exportCode : activeExportTab === 'css' ? exportCSS : exportBase16Yaml }}</code></pre>
    </div>
  </div>
</template>

<style scoped>
/* ── Layout ───────────────────────────────────────────────────────── */
.tb { display: flex; flex-direction: column; gap: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
.tb-columns { display: flex; gap: 16px; align-items: stretch; }
.tb-col-themes { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.tb-col-tokens { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.tb-col-themes .tb-presets { flex: 1; max-height: none; }

@media (max-width: 768px) {
  .tb-columns { flex-direction: column; }
}

/* ── Section ──────────────────────────────────────────────────────── */
.tb-section { background: #1e1e2e; border-radius: 8px; padding: 16px; }
.tb-section h3 { margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #cdd6f4; text-transform: uppercase; letter-spacing: 0.5px; }
.tb-section h4 { margin: 8px 0 4px; font-size: 12px; color: #a6adc8; text-transform: uppercase; letter-spacing: 0.5px; }

/* ── Mode toggle ─────────────────────────────────────────────────── */
.tb-mode-toggle { display: flex; background: #313244; border-radius: 6px; overflow: hidden; }
.tb-mode-toggle button { flex: 1; padding: 6px 16px; border: none; background: transparent; color: #6c7086; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
.tb-mode-toggle button.active { background: #89b4fa; color: #1e1e2e; }

/* ── Search ───────────────────────────────────────────────────────── */
.tb-search { width: 100%; padding: 6px 10px; background: #313244; border: 1px solid #45475a; border-radius: 6px; color: #cdd6f4; font-size: 13px; outline: none; box-sizing: border-box; }
.tb-search:focus { border-color: #89b4fa; }
.tb-search::placeholder { color: #6c7086; }

/* ── Presets ──────────────────────────────────────────────────────── */
.tb-presets { max-height: 260px; overflow-y: auto; display: flex; flex-direction: column; gap: 2px; margin-top: 8px; }
.tb-preset { display: flex; align-items: center; justify-content: space-between; padding: 6px 8px; background: transparent; border: 1px solid transparent; border-radius: 6px; cursor: pointer; color: #bac2de; font-size: 13px; text-align: left; transition: background 0.1s; }
.tb-preset:hover { background: #313244; }
.tb-preset.active { background: #313244; border-color: #89b4fa; color: #cdd6f4; }
.tb-preset-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tb-preset-strip { display: flex; gap: 3px; }
.tb-preset-dot { width: 14px; height: 14px; border-radius: 3px; border: 1px solid rgba(255,255,255,0.1); }

/* ── Generate ─────────────────────────────────────────────────────── */
.tb-gen-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.tb-color-input { width: 40px; height: 32px; padding: 0; border: 1px solid #45475a; border-radius: 6px; cursor: pointer; background: transparent; }
.tb-hex { font-family: monospace; font-size: 13px; color: #a6adc8; }
.tb-gen-actions { display: flex; gap: 8px; }
.tb-btn { padding: 6px 16px; background: #89b4fa; color: #1e1e2e; border: none; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; }
.tb-btn:hover { opacity: 0.9; }
.tb-btn-alt { background: #45475a; color: #cdd6f4; }

/* ── Tokens ───────────────────────────────────────────────────────── */
.tb-token-group { margin-bottom: 4px; }
.tb-token-row { display: flex; align-items: center; gap: 8px; padding: 3px 0; }
.tb-token-picker { width: 24px; height: 24px; padding: 0; border: 1px solid #45475a; border-radius: 4px; cursor: pointer; background: transparent; flex-shrink: 0; }
.tb-token-name { font-size: 12px; color: #bac2de; width: 90px; flex-shrink: 0; }
.tb-token-hex { font-size: 11px; color: #6c7086; background: #313244; padding: 2px 6px; border-radius: 3px; }
.tb-expand { background: transparent; border: 1px solid #45475a; color: #a6adc8; padding: 4px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; margin-top: 8px; width: 100%; }
.tb-expand:hover { border-color: #89b4fa; color: #cdd6f4; }

/* ── Tabs ─────────────────────────────────────────────────────────── */
.tb-tabs { display: flex; gap: 2px; background: #1e1e2e; border-radius: 8px 8px 0 0; padding: 4px 4px 0; }
.tb-tabs button { padding: 6px 16px; background: transparent; border: none; border-radius: 6px 6px 0 0; color: #6c7086; font-size: 13px; cursor: pointer; }
.tb-tabs button.active { background: #313244; color: #cdd6f4; }
.tb-tabs button:hover:not(.active) { color: #bac2de; }
.tb-copy { margin-left: auto !important; font-size: 12px !important; padding: 4px 12px !important; background: #45475a !important; border-radius: 4px !important; color: #cdd6f4 !important; }
.tb-copy:hover { background: #585b70 !important; }

/* ── Preview ──────────────────────────────────────────────────────── */
.tb-preview { background: var(--bg); color: var(--fg); border-radius: 0 0 8px 8px; padding: 16px; min-height: 200px; transition: background 0.15s, color 0.15s; border: 1px solid #313244; }

/* App mockup */
.p-nav { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--inverse); color: var(--inversefg); border-radius: 6px; margin-bottom: 12px; transition: all 0.15s; }
.p-nav-title { font-weight: 600; font-size: 14px; }
.p-nav-link { font-size: 13px; opacity: 0.8; cursor: pointer; }
.p-card { background: var(--surface); color: var(--surfacefg); border-radius: 8px; padding: 16px; border: 1px solid var(--border); transition: all 0.15s; }
.p-card-title { margin: 0 0 8px; font-size: 16px; }
.p-card-body { margin: 0 0 12px; font-size: 14px; line-height: 1.5; }
.p-link { color: var(--link); text-decoration: underline; }
.p-buttons { display: flex; gap: 8px; margin-bottom: 12px; }
.p-btn-primary { padding: 6px 16px; background: var(--primary); color: var(--primaryfg); border: none; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
.p-btn-secondary { padding: 6px 16px; background: var(--secondary); color: var(--secondaryfg); border: none; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
.p-input-wrap { margin-bottom: 12px; }
.p-input { width: 100%; padding: 8px 10px; background: var(--bg); color: var(--fg); border: 1px solid var(--inputborder); border-radius: 6px; font-size: 13px; outline: none; box-sizing: border-box; transition: all 0.15s; }
.p-input:focus { border-color: var(--focusborder); }
.p-badges { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
.p-badge { padding: 3px 10px; border-radius: 99px; font-size: 12px; font-weight: 600; transition: all 0.15s; }
.p-badge-error { background: var(--error); color: var(--errorfg); }
.p-badge-warning { background: var(--warning); color: var(--warningfg); }
.p-badge-success { background: var(--success); color: var(--successfg); }
.p-badge-info { background: var(--info); color: var(--infofg); }
.p-muted-text { font-size: 13px; color: var(--mutedfg); background: var(--muted); padding: 8px 10px; border-radius: 6px; margin: 0 0 8px; transition: all 0.15s; }
.p-selected-text { font-size: 13px; background: var(--selection); color: var(--selectionfg); padding: 4px 8px; border-radius: 4px; margin: 0 0 8px; display: inline-block; transition: all 0.15s; }
.p-disabled-text { font-size: 13px; color: var(--disabledfg); margin: 0; }
.p-contrast-grid { display: flex; gap: 12px; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border); font-size: 11px; color: var(--mutedfg); font-family: monospace; }

/* Code mockup */
.p-code { margin: 0; padding: 16px; background: var(--bg); color: var(--fg); border-radius: 6px; font-size: 13px; line-height: 1.6; overflow-x: auto; transition: all 0.15s; }
.p-comment { color: var(--color8, #6c7086); }
.p-keyword { color: var(--color5, #cba6f7); }
.p-string { color: var(--color2, #a6e3a1); }
.p-func { color: var(--color4, #89b4fa); }
.p-number { color: var(--color1, #f38ba8); }

/* ── Export ────────────────────────────────────────────────────────── */
.tb-export { background: #1e1e2e; border-radius: 8px; overflow: hidden; }
.tb-export-code { margin: 0; padding: 12px 16px; background: #181825; color: #a6adc8; font-size: 12px; line-height: 1.5; overflow-x: auto; max-height: 200px; overflow-y: auto; }

/* ── Scrollbar ────────────────────────────────────────────────────── */
.tb-presets::-webkit-scrollbar, .tb-export-code::-webkit-scrollbar { width: 6px; }
.tb-presets::-webkit-scrollbar-thumb, .tb-export-code::-webkit-scrollbar-thumb { background: #45475a; border-radius: 3px; }
.tb-presets::-webkit-scrollbar-track, .tb-export-code::-webkit-scrollbar-track { background: transparent; }
</style>
