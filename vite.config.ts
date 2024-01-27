// vite.config.ts
import { defineConfig } from "vite";

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                // entry point for compilation; normally would be "./index.html"
                app: 'background.html'
            }
        }
    }
});