import mdx from "@astrojs/mdx";
import { defineConfig } from "astro/config";

import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: "https://benstrong.dev",
  integrations: [mdx()],

  markdown: {
    shikiConfig: {
      theme: "github-light",
    },
  },

  vite: {
    ssr: {
      external: ["canvaskit-wasm"],
    },
  },

  adapter: cloudflare(),
});
