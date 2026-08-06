import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    TanStackRouterVite({ target: 'react' }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  build: {
    outDir: "dist/client",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react")) return "vendor";
            if (id.includes("lucide-react")) return "lucide";
            if (id.includes("@tanstack")) return "tanstack";
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "async_hooks": path.resolve(__dirname, "./src/lib/stubs/async_hooks.ts"),
      "node:async_hooks": path.resolve(__dirname, "./src/lib/stubs/async_hooks.ts"),
      "@tanstack/react-start": path.resolve(__dirname, "./src/lib/stubs/tanstack_start.ts"),
      "@tanstack/react-start/server": path.resolve(__dirname, "./src/lib/stubs/tanstack_start.ts"),
      "#tanstack-router-entry": path.resolve(__dirname, "./src/lib/stubs/tanstack_entry.ts"),
      "#tanstack-start-entry": path.resolve(__dirname, "./src/lib/stubs/tanstack_entry.ts"),
      "tanstack-start-manifest:v": path.resolve(__dirname, "./src/lib/stubs/tanstack_entry.ts"),
    },
    dedupe: ["react", "react-dom", "@tanstack/react-router"],
  },
  server: {
    allowedHosts: true,
  },
});
