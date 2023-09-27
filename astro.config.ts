import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [react(), tailwind()],
  vite: {
    build: {
      rollupOptions: {
        output: {
          entryFileNames: "_astro/[name].js",
          chunkFileNames: "_astro/[name].js",
          assetFileNames: "_astro/[name][extname]",
        },
      },
    },
  },
});
