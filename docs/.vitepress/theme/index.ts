import DefaultTheme from "vitepress/theme"
import type { Theme } from "vitepress"
import ThemeBuilder from "./components/ThemeBuilder.vue"

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("ThemeBuilder", ThemeBuilder)
  },
} satisfies Theme
