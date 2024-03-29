var path = require('path');
var webpack = require('webpack');
var version = require('./package.json').version;

// Custom webpack rules are generally the same for all webpack bundles, hence
// stored in a separate local variable.
var rules = [
    { test: /\.css$/, use: ['style-loader', 'css-loader']},
    { test: /\.(jpg|png|gif)$/i, type: 'asset/resource' },
    { test: require.resolve('jquery'),
        loader: "expose-loader",
        options: {
          exposes: ["$", "jQuery"],
        },
    }
];

// modules used across the custom widgets
var plugins = [
    new webpack.ProvidePlugin({
        $: "jquery",
        // flot still uses the name jQuery
        jQuery: "jquery",
        _ : "lodash",
        Handsontable: 'handsontable'
    })
];

module.exports = (env, argv) => {
    var devtool = argv.mode === 'development' ? 'source-map' : false;
    return [
        {// Notebook extension
        //
        // This bundle only contains the part of the JavaScript that is run on
        // load of the notebook. This section generally only performs
        // some configuration for requirejs, and provides the legacy
        // "load_ipython_extension" function which is required for any notebook
        // extension.
            entry: './lib/extension.js',
            output: {
                filename: 'extension.js',
                path: path.resolve(__dirname, '..', 'riskflow_widgets', 'nbextension'),
                libraryTarget: 'amd',
            },
            devtool
        },
        {// Bundle for the notebook containing the custom widget views and models
        //
        // This bundle contains the implementation for the custom widget views and
        // custom widget.
        // It must be an amd module
            entry: ['./amd-public-path.js', './lib/index.js'],
            plugins: plugins,
            output: {
                filename: 'index.js',
                path: path.resolve(__dirname, '..', 'riskflow_widgets', 'nbextension'),
                libraryTarget: 'amd',
                publicPath: '', // Set in amd-public-path.js
            },
            devtool,
            module: {
                rules: rules
            },
            // 'module' is the magic requirejs dependency used to set the publicPath
            externals: ['@jupyter-widgets/base', 'module']
        },
        {// Embeddable riskflow_widgets bundle
        //
        // This bundle is identical to the notebook bundle containing the custom
        // widget views and models. The only difference is it is placed in the
        // dist/ directory and shipped with the npm package for use from a CDN
        // like jsdelivr.
        //
        // The target bundle is always `dist/index.js`, which is the path
        // required by the custom widget embedder.
            entry: ['./amd-public-path.js', './lib/index.js'],
            plugins: plugins,
            output: {
                filename: 'index.js',
                path: path.resolve(__dirname, 'dist'),
                libraryTarget: 'amd',
                publicPath: '', // Set in amd-public-path.js
            },
            devtool,
            module: {
                rules: rules
            },
            // 'module' is the magic requirejs dependency used to set the publicPath
            externals: ['@jupyter-widgets/base', 'module']
        }
    ];
}
