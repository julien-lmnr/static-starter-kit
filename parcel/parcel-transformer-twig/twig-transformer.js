// Thanks to: https://github.com/bingumd/parcel-transformer-twig
const { Transformer } = require('@parcel/plugin');
const glob = require('glob');
const Twig = require('twig');

module.exports = new Transformer({
    async loadConfig({ config }) {
        const { contents, filePath } = (await config.getConfig(['.twigrc', '.twigrc.js'])) || {};

        if (contents) {
            if (filePath.endsWith('.js')) {
                config.invalidateOnStartup();
            }

            config.invalidateOnFileChange(filePath);
        } else {
            const fileName = '.twigrc' || '.twigrc.js';

            config.invalidateOnFileCreate({
                fileName: fileName,
                aboveFilePath: config.searchPath,
            });
        }

        return contents;
    },

    async transform({ asset, config }) {
        let data = config.data || {};

        asset.type = 'html';

        const options = {
            path: asset.filePath,
            async: false,
            debug: Boolean(config.debug || false),
            trace: Boolean(config.trace || false),
            namespaces: config.namespaces,
        };

        // IMPORTANT: cache false, it rerenders included/embedded files
        config.cache !== true && Twig.cache(false);

        // Config special functions, filters or extend
        const { functions, filters, tests, extend, watchFolder } = config;

        if (functions) {
            Object.entries(functions).forEach(([name, fn]) =>
                Twig.extendFunction(name, fn)
            );
        }

        if (filters) {
            Object.entries(tests).forEach(([name, fn]) =>
                Twig.extendTest(name, fn)
            );
        }

        if (tests) {
            Object.entries(query.tests).forEach(([name, fn]) =>
                Twig.extendTest(name, fn)
            );
        }

        if (extend) {
            Twig.extend(extend);
        }

        if (watchFolder) {
            const files = await glob(`${watchFolder}/**/*.twig`);

            for (const file of files) {
                asset.invalidateOnFileChange(file);
            }
        }

        if (typeof data === 'function') {
            data = data();

            if (typeof data !== 'object') {
                throw new Error('data parameter should return an object');
            }

            data?.watchFile && asset.invalidateOnFileChange(data.watchFile);
        }

        const template = Twig.twig(options).render(data);

        asset.setCode(template);

        return [asset];
    }
});
