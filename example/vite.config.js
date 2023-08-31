import { defineConfig } from 'vite';
import { HtmlMila } from "../src/index.js";

export default defineConfig({
    root: './src',
    build: {
        outDir: '../dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                'index.js': './src/index.js'
            },
            output: {
                entryFileNames: '[name]'
            }
        }
    },
    plugins: [
        HtmlMila({
            verbose: true,
            outDir: '../dist',
            minify: true,
            minifyImport: true
        })
    ]
});