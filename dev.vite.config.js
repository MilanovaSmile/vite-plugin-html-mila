import { defineConfig } from 'vite';
import HtmlMila from "./src/index.js";

export default defineConfig({
    root: './example',
    build: {
        outDir: '../dist-example',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                'index.html': './example/index.html'
            },
        }
    },
    plugins: [
        HtmlMila({
            outDir: '../dist-example',
            minify: true,
            targets: {
                'template.html': './example/template.html',
            }
        })
    ]
});