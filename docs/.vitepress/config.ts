import { defineConfig } from "vitepress"

export default defineConfig({
  title: "themex",
  description: "Universal color themes for any platform — terminal, web, native",
  base: "/themex/",
  head: [["link", { rel: "icon", type: "image/svg+xml", href: "/themex/favicon.svg" }]],

  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide/getting-started" },
      { text: "Reference", link: "/reference/theme-palette" },
      { text: "Gallery", link: "/gallery/" },
    ],

    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Getting Started", link: "/guide/getting-started" },
          { text: "Creating Themes", link: "/guide/creating-themes" },
          { text: "Importing Themes", link: "/guide/importing-themes" },
          { text: "Design Philosophy", link: "/guide/design-philosophy" },
        ],
      },
      {
        text: "Reference",
        items: [
          { text: "ThemePalette", link: "/reference/theme-palette" },
          { text: "Semantic Tokens", link: "/reference/semantic-tokens" },
          { text: "Color Utilities", link: "/reference/color-utilities" },
          { text: "Builder API", link: "/reference/builder-api" },
          { text: "CLI", link: "/reference/cli" },
        ],
      },
      {
        text: "Gallery",
        items: [{ text: "Theme Gallery", link: "/gallery/" }],
      },
    ],

    socialLinks: [{ icon: "github", link: "https://github.com/beorn/themex" }],

    footer: {
      message: "Released under the MIT License.",
    },

    search: {
      provider: "local",
    },
  },
})
