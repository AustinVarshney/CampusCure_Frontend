import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from 'url';
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [react()],
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
