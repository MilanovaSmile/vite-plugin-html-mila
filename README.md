# Description

Vite plugin for minimizing html, with the ability to copy html files. Terser is used for minification.

- Minifies HTML when imported in JS files.
- Minifies third-party HTML files.
- Copies third-party HTML files.

# Install

```
yarn add -D vite-plugin-html-mila
```

# Sample vite.config.js

```javascript
import { defineConfig } from 'vite';
import { HtmlMila } from 'vite-plugin-html-mila';

export default defineConfig ({
    /**
     * Root directory.
     * Required.
     */
    root: './src',
    
    plugins: [
        HtmlMila(/* options */)
    ]
});
```

# Options

```javascript
{
    /**
     * Write debug to console.
     * Default: true.
     */
    verbose: true,

    /**
     * Path to output directory.
     * Required.
     */
    outDir: '../dist',

    /**
     * Minify HTML file from targets.
     * Default: true.
     */
    minify: true,

    /**
     * Minify HTML file from import in JS files.
     * Example: import html from './index.html?raw'
     * Default: true.
     */
    minifyImport: true,

    /** Terser minify options, https://github.com/terser/html-minifier-terser
     * Default: true for all.
     */
    minifyOptions: {
        collapseWhitespace: true,
        html5: true,
        keepClosingSlash: true,
        minifyCSS: true,
        minifyJS: true,
        removeAttributeQuotes: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
    },

    /**
     * List of files to process.
     * Default: {}.
     */
    targets: {
        'target.html'        : 'source.html',
        'example/target.html': 'example/source.html'
    }
}
```