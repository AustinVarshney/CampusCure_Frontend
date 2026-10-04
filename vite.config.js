import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from 'url';
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [
        react(),
        // CC-70 installable app + offline reading, CC-41 push. injectManifest:
        // the worker is ours (src/sw.ts); the plugin only supplies the list of
        // built files to precache.
        VitePWA({
            strategies: "injectManifest",
            srcDir: "src",
            filename: "sw.ts",
            registerType: "autoUpdate",
            injectRegister: false,
            includeAssets: ["favicon.svg", "apple-touch-icon.png"],
            injectManifest: {
                // The face-api models are 6+ MB and only the face screens use
                // them; precaching would make every install download them.
                globIgnores: ["**/models/**", "**/vendor-face-*.js"],
                maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
            },
            manifest: {
                name: "CampusCure",
                short_name: "CampusCure",
                description: "Campus complaints and academic doubts, in one place.",
                theme_color: "#07759D",
                background_color: "#ffffff",
                display: "standalone",
                start_url: "/",
                scope: "/",
                icons: [
                    { src: "/pwa-192.png", sizes: "192x192", type: "image/png" },
                    { src: "/pwa-512.png", sizes: "512x512", type: "image/png" },
                    { src: "/pwa-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
                ],
            },
        }),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    build: {
        chunkSizeWarningLimit: 900,
        rollupOptions: {
            output: {
                manualChunks: {
                    "vendor-react": ["react", "react-dom", "react-router-dom"],
                    "vendor-ui": ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-tooltip", "@radix-ui/react-tabs", "@radix-ui/react-select", "@radix-ui/react-label", "@radix-ui/react-slot"],
                    "vendor-query": ["@tanstack/react-query"],
                    "vendor-face": ["face-api.js"],
                    "vendor-antd": ["antd", "@ant-design/icons"],
                    "vendor-charts": ["recharts"],
                    "vendor-motion": ["framer-motion"],
                    "vendor-form": ["react-hook-form", "@hookform/resolvers", "zod"],
                },
            },
        },
    },
});
