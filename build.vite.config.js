import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
    root: './src',
    build: {
        outDir: '../dist',
        lib: {
            entry: path.resolve(__dirname, './src/index.js'),
            name: 'HtmlMila',
            fileName: (format) => `html-mila.${format}.js`
        },
        rollupOptions: {
            external: [
                'path',
                'node:fs/promises',
                'colorette',
                'html-minifier-terser'
            ]
        },
    }
});