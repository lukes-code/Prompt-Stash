import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        {
          src: "manifest.json", // Copy the manifest file to dist/
          dest: "", // Place it in the root of dist
        },
        {
          src: "icons", // Copy the entire icons folder to dist/
          dest: "", // Place it in the root of dist
        },
      ],
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(new URL("./index.html", import.meta.url).pathname),
        contentScript: resolve(
          new URL("./src/contentScript.js", import.meta.url).pathname // Ensure the path is to the TypeScript file, if applicable
        ),
      },
      output: {
        entryFileNames: (chunk) => {
          return chunk.name === "contentScript"
            ? "[name].js"
            : "assets/[name].[hash].js";
        },
      },
    },
  },
});
