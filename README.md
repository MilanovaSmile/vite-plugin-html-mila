# Description

Vite plugin to copy and minify HTML. Terser is used for minification.

# Install

```
yarn add -D vite-plugin-html-mila
```

# Sample vite.config.js

```javascript
import { defineConfig } from 'vite';
import { HtmlMila } from 'vite-plugin-html-mila';

export default defineConfig ({
    root: './src',
    plugins: [
        HtmlMila(/* options */)
    ]
});
```

# Options

```javascript
{
    // Write debug to console.
    verbose: true,

    // Path to output directory.
    outDir: '../dist',

    // Minify HTML
    minify: true,

    // Terser minify options, https://github.com/terser/html-minifier-terser
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

    // List of files to process.
    // src - path relative to the "root" variable.
    // dest - path relative to "outDir" variable.
    // src, dest - can only contain a string!
    targets: [
        { src: 'target1.html',         dest: 'target1.html' },
        { src: 'example/target2.html', dest: 'example/target2.html' }
    ]
}
```