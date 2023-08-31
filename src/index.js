import path from 'path';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { cyan, green, red, dim, bold } from 'colorette';
import { minify } from 'html-minifier-terser';

const OPTIONS = {
    verbose: true,
    outDir: '',
    minify: true,
    minifyImport: true,
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
    targets: []
};
const TARGET = {
    src: '',
    dest: ''
}

export function HtmlMila (options = OPTIONS) {
    let config = undefined;

    options = checkOptions(options);

    if (options.outDir.length === 1) {
        console.log(`${red('HtmlMila: outDir is not valid!')}`)
        return;
    }

    return {
        name: 'vite-plugin-html-mila',
        configResolved(extConfig) {
            config = extConfig;
        },
        async transform (code, id) {
            if (!options.minifyImport) return;

            if (id.endsWith('.html?raw')) {
                code = code.substring(16).slice(0, -1);
                code = code.replaceAll('\\n', '');
                code = code.replaceAll('\\"', '"');

                code = await minify(code, options.minifyOptions);

                return {
                    code: `export default '${code}'`
                }
            }
        },
        async closeBundle() {
            if (options.targets.length === 0) return;

            await new Promise((resolve) => {
                setTimeout(() => resolve(), 1);
            });

            let buildTime = performance.now();
            let maxFileNameLength = 0;

            options.targets.forEach(target => {
                if (maxFileNameLength < target.dest.length) maxFileNameLength = target.dest.length
            });

            if (options.verbose) console.log(green('\nhtml-mila working...'));

            for (let target of options.targets) {
                try {
                    let src  = path.resolve(config.root, target.src);
                    let dest = path.resolve(config.root, options.outDir + target.dest);

                    let srcSize  = 0;
                    let destSize = 0;

                    await mkdir(dest.substring(0, dest.lastIndexOf("/")), {recursive: true});

                    let html = await readFile(src, 'utf8');

                    srcSize = new Blob([html]).size;

                    if (options.minify) html = await minify(html, options.minifyOptions);

                    destSize = new Blob([html]).size;

                    await writeFile(dest, html);

                    if (options.verbose) printLog(options.outDir, target.dest, srcSize, destSize, maxFileNameLength)
                } catch (e) {
                    console.log((`${options.outDir}${cyan(target.dest)} ${red('FAIL')}`));
                }
            }

            if (options.verbose) console.log(green('✓ built in ' + Math.ceil(performance.now() - buildTime) + 'ms'));
        }
    };
}

function checkOptions (options) {
    let result = Object.assign({}, OPTIONS);

    for (let key in OPTIONS) {
        switch (true) {
            case ['boolean', 'string'].includes(typeof OPTIONS[key]):
                if (typeof options[key] === typeof OPTIONS[key]) result[key] = options[key];
                if (key === 'outDir' && result.outDir[result.outDir.length - 1] !== '/') result.outDir += '/';
                break;

            case typeof OPTIONS[key] === 'object' && !Array.isArray(OPTIONS[key]) && typeof options[key] === 'object' && !Array.isArray(options[key]):
                for (let objectKey in OPTIONS.minifyOptions) {
                    if (typeof options[key][objectKey] === 'boolean') result[key][objectKey] = options[key][objectKey];
                }
                break;

            case typeof OPTIONS[key] === 'object' && Array.isArray(OPTIONS[key]) && typeof options[key] === 'object' && Array.isArray(options[key]):
                switch (key) {
                    case 'targets':
                        options.targets.forEach(element => {
                            if (typeof element === 'object' && !Array.isArray(element)) {
                                let resultTarget = Object.assign({}, TARGET);

                                for (let objectKey in TARGET) {
                                    if (typeof element[objectKey] === typeof TARGET[objectKey]) resultTarget[objectKey] = element[objectKey];
                                }

                                result.targets.push(resultTarget);
                            }
                        });
                        break;
                }
                break
        }
    }

    return result;
}

function printLog (outDir, fileName, srcSize, destSize, maxFileNameLength) {
    while (fileName.length < maxFileNameLength) {
        fileName += ' ';
    }

    srcSize = (srcSize / 1000).toFixed(2);
    destSize = (destSize / 1000).toFixed(2);

    console.log(dim(outDir) + cyan(fileName) + '  ' + dim(bold(srcSize + ' kB') + ' │ gzip: ' + destSize + ' kB'));
}