import path from 'path';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { cyan, green, red, dim, bold } from 'colorette';
import { minify } from 'html-minifier-terser';

const VERSION = cyan('HtmlMila v2.0.3');

const OPTIONS = {
    verbose      : true,
    outDir       : '',
    minify       : true,
    minifyImport : true,
    minifyOptions: {
        collapseWhitespace           : true,
        html5                        : true,
        keepClosingSlash             : true,
        minifyCSS                    : true,
        minifyJS                     : true,
        removeAttributeQuotes        : true,
        removeComments               : true,
        removeRedundantAttributes    : true,
        removeScriptTypeAttributes   : true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype              : true,
    },
    targets: {}
};

let CONFIG;

export default function HtmlMila (options = OPTIONS) {
    options = checkOptions(options);

    return {
        name: 'vite-plugin-html-mila',
        enforce: 'pre',
        configResolved(extConfig) {
            CONFIG = extConfig;
        },
        async transform (code, id) {
            if (!options.minifyImport) return;

            if (id.endsWith('.html?raw')) {
                code = code.substring(16).slice(0, -1);
                code = code.replaceAll('\\n', '');
                code = code.replaceAll('\\"', '"');

                code = await minify(code, options.minifyOptions);

                return { code: `export default '${code}'` };
            }
        },
        closeBundle: {
            order: 'pre',
            sequential: true,
            async handler () {
                // Print info.
                //------------------------------------------------------------------------------------------------------
                if (options.verbose !== false) console.log('\n' + cyan(VERSION) + green(' building...'));
                //------------------------------------------------------------------------------------------------------

                // Check: outDir.
                //------------------------------------------------------------------------------------------------------
                if (typeof options.outDir !== 'string') {
                    if (options.verbose !== false) console.log(red('outDir is not valid!') + '\n');

                    return;
                }

                switch (options.outDir.length) {
                    case 0:
                        break;

                    case 1:
                        if (options.outDir === '/') options.outDir = '';
                        break;

                    default:
                        if (options.outDir.startsWith('/')) options.outDir = options.outDir.slice(1);
                        if (!options.outDir.endsWith('/')) options.outDir = options.outDir + '/';
                }
                //------------------------------------------------------------------------------------------------------

                // Check: targets.
                //------------------------------------------------------------------------------------------------------
                if (typeof options.targets !== 'object' || Array.isArray(options.targets)) {
                    if (options.verbose !== false) console.log(red('targets is not an object!') + '\n');

                    return;
                }

                if (Object.keys(options.targets).length === 0) {
                    if (options.verbose !== false) console.log(red('targets is empty!') + '\n');

                    return;
                }

                for (let key in options.targets) {
                    if (typeof options.targets[key] !== 'string') {
                        if (options.verbose !== false) console.log(red(`targets key "${key}" is not a string!`) + '\n');

                        return;
                    }
                }
                //------------------------------------------------------------------------------------------------------

                // Start.
                //------------------------------------------------------------------------------------------------------
                let buildTime = performance.now();
                //------------------------------------------------------------------------------------------------------

                let resultList = [];
                let index = 0;

                // Work.
                //------------------------------------------------------------------------------------------------------
                for (let key in options.targets) {
                    try {
                        index += 1;

                        if (options.verbose !== false) {
                            if (process.stdout.isTTY) {
                                process.stdout.clearLine();
                                process.stdout.cursorTo(0);
                                process.stdout.write(`transforming (${index}) ` + dim(key));
                            } else if (index === 1) {
                                console.log('transforming...');
                            }
                        }

                        let src = {
                            file: path.resolve(options.targets[key]),
                            content: '',
                            size: 0
                        };

                        let dest = {
                            file: path.resolve(CONFIG.root, options.outDir + key),
                            content: '',
                            size: 0
                        };

                        await mkdir(dest.file.substring(0, dest.file.lastIndexOf('/')), {recursive: true});

                        src.content = await readFile(src.file, 'utf8');
                        src.size = new Blob([src.content]).size;

                        if (options.minify) dest.content = await minify(src.content, options.minifyOptions);

                        dest.size = new Blob([dest.content]).size;

                        await writeFile(dest.file, dest.content);

                        resultList.push({
                            file: key,
                            srcSize: src.size,
                            destSize: dest.size
                        });
                    } catch (error) {
                        if (options.verbose !== false) {
                            console.log(red(`\nFile: ${key}`));
                            console.log(red(error));
                        }
                    }
                }
                //------------------------------------------------------------------------------------------------------

                // End.
                //------------------------------------------------------------------------------------------------------
                if (options.verbose !== false) {
                    if (process.stdout.isTTY) {
                        process.stdout.clearLine();
                        process.stdout.cursorTo(0);
                        process.stdout.write(green('✓ ') + index + ` ${index === 1 ? 'file' : 'files'} transformed.\n`);
                    } else {
                        console.log(`✓ ${index} ${index === 1 ? 'file' : 'files'} transformed.`);
                    }
                }

                if (options.verbose !== false) {
                    printLog(resultList, options.outDir);
                    console.log(green('✓ built in ' + Math.ceil(performance.now() - buildTime) + 'ms'));
                }
                //------------------------------------------------------------------------------------------------------
            }
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

            case key === 'targets':
                result.targets = options.targets;
                break;

            case typeof OPTIONS[key] === 'object' && !Array.isArray(OPTIONS[key]) && typeof options[key] === 'object' && !Array.isArray(options[key]):
                for (let objectKey in OPTIONS.minifyOptions) {
                    if (typeof options[key][objectKey] === 'boolean') result[key][objectKey] = options[key][objectKey];
                }
                break;
        }
    }

    return result;
}

function printLog (resultList, outDir) {
    let maxLengthFile = 0;
    let maxLengthSrcSize = 0;
    let maxLengthDestSize = 0;

    resultList.forEach(element => {
        if (element.file.length > maxLengthFile) maxLengthFile = element.file.length;

        element.srcSize = (element.srcSize / 1000).toFixed(2);
        element.destSize = (element.destSize / 1000).toFixed(2);

        if (element.srcSize.length > maxLengthSrcSize) maxLengthSrcSize = element.srcSize.length;
        if (element.destSize.length > maxLengthDestSize) maxLengthDestSize = element.destSize.length;
    });

    resultList.forEach(element => {
        while (element.file.length < maxLengthFile) {
            element.file += ' ';
        }

        while (element.srcSize.length < maxLengthSrcSize) {
            element.srcSize = ' ' + element.srcSize;
        }

        while (element.destSize.length < maxLengthDestSize) {
            element.destSize = ' ' + element.destSize;
        }

        console.log(dim(outDir) + cyan(element.file) + '  ' + dim(bold(element.srcSize + ' kB') + ' │ gzip: ' + element.destSize + ' kB'));
    });
}