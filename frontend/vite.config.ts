import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import electron from "vite-plugin-electron/simple";

const isWeb = process.env.BUILD_TARGET === "web";

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    ...(isWeb
      ? []
      : [
          electron({
            main: {
              entry: "electron/main.ts",
            },
            preload: {
              input: "electron/preload.ts",
            },
          }),
        ]),
  ],

  server: {
    port: 5173,
  },

  build: {
    outDir: isWeb ? "dist-web" : "dist",
  },
});