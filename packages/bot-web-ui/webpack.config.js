const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const DefinePlugin = require('webpack').DefinePlugin;
const Dotenv = require('dotenv-webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');

const IS_RELEASE =
    process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging' || process.env.NODE_ENV === 'test';

const output = {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bot/js/bot-web-ui.main.js',
    chunkFilename: 'bot/js/bot.[name].[contenthash].js',
    libraryExport: 'default',
    library: '@deriv/bot-web-ui',
    libraryTarget: 'umd',
};

module.exports = function (env) {
    const base = env && env.base && env.base !== true ? `/${env.base}/` : '/';

    return {
        entry: [path.join(__dirname, 'src', 'app', 'index.ts')],
        output: {
            ...output,
            publicPath: base,
        },
        devServer: {
            publicPath: '/dist/',
            disableHostCheck: true,
            hot: true,
            liveReload: true,
            // Watch the local @deriv/trader UMD build so edits in packages/trader trigger a full reload
            watchFiles: [
                path.resolve(__dirname, '../trader/dist/**/*.js'),
                path.resolve(__dirname, '../trader/dist/**/*.css'),
            ],
            static: [
                {
                    directory: path.resolve(__dirname, 'node_modules/@deriv/components/lib/icon/sprites'),
                    publicPath: '/public/sprites',
                },
                // Expose the local trader dist so the browser/devServer can serve any assets it references in dev
                {
                    directory: path.resolve(__dirname, '../trader/dist'),
                    publicPath: '/trader',
                },
            ],
        },
        mode: IS_RELEASE ? 'production' : 'development',
        devtool: IS_RELEASE ? 'source-map' : 'eval-cheap-module-source-map',
        target: 'web',
        module: {
            rules: [
                {
                    // https://github.com/webpack/webpack/issues/11467
                    test: /\.m?js/,
                    include: /node_modules/,
                    resolve: {
                        fullySpecified: false,
                    },
                },
                {
                    test: /\.(s*)css$/,
                    use: [
                        'css-hot-loader',
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: !IS_RELEASE,
                                url: false,
                            },
                        },
                        {
                            loader: 'sass-loader',
                            options: { sourceMap: !IS_RELEASE },
                        },
                        {
                            loader: 'sass-resources-loader',
                            options: {
                                resources: require('@deriv/shared/src/styles/index.js'),
                            },
                        },
                    ],
                },
                {
                    test: /\.svg$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: 'svg-sprite-loader',
                            options: {
                                extract: true,
                                spriteFilename: 'bot-sprite.svg',
                            },
                        },
                        {
                            loader: 'svgo-loader',
                            options: {
                                plugins: [{ removeUselessStrokeAndFill: false }, { removeUnknownsAndDefaults: false }],
                            },
                        },
                    ],
                },
                {
                    test: /\.(js|jsx|ts|tsx)$/,
                    exclude: /node_modules/,
                    loader: 'babel-loader',
                    options: {
                        rootMode: 'upward',
                    },
                },
                {
                    // @deriv/bot-skeleton also requires `.xml` import statements to be parsed by raw-loader
                    test: /\.xml$/,
                    exclude: /node_modules\/(?!@deriv)/,
                    use: 'raw-loader',
                },
            ],
        },
        resolve: {
            alias: {
                Components: path.resolve(__dirname, 'src', 'components'),
                Constants: path.resolve(__dirname, './src/constants'),
                Stores: path.resolve(__dirname, './src/stores'),
                Utils: path.resolve(__dirname, './src/utils'),
                Types: path.resolve(__dirname, 'src/types'),
                // Always resolve @deriv/trader to the local UMD build in this monorepo for fast iteration
                '@deriv/trader': path.resolve(__dirname, '../trader/dist/trader/js/trader.js'),
                // Force singletons for core react libraries and router to avoid context duplication across packages
                react: path.resolve(__dirname, '../../node_modules/react'),
                'react-dom': path.resolve(__dirname, '../../node_modules/react-dom'),
                'react-router': path.resolve(__dirname, '../../node_modules/react-router'),
                'react-router-dom': path.resolve(__dirname, '../../node_modules/react-router-dom'),
            },
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
        plugins: [
            new Dotenv(),
            new DefinePlugin({
                'process.env.GD_CLIENT_ID': JSON.stringify(process.env.GD_CLIENT_ID),
                'process.env.GD_API_KEY': JSON.stringify(process.env.GD_API_KEY),
                'process.env.GD_APP_ID': JSON.stringify(process.env.GD_APP_ID),
                'process.env.DATADOG_APPLICATION_ID': JSON.stringify(process.env.DATADOG_APPLICATION_ID),
                'process.env.DATADOG_CLIENT_TOKEN_LOGS': JSON.stringify(process.env.DATADOG_CLIENT_TOKEN_LOGS),
                'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
                'process.env.DATADOG_SESSION_REPLAY_SAMPLE_RATE': JSON.stringify(
                    process.env.DATADOG_SESSION_REPLAY_SAMPLE_RATE
                ),
                'process.env.DATADOG_SESSION_SAMPLE_RATE_LOGS': JSON.stringify(
                    process.env.DATADOG_SESSION_SAMPLE_RATE_LOGS
                ),
                'process.env.REF_NAME': JSON.stringify(process.env.REF_NAME),
                'process.env.REMOTE_CONFIG_URL': JSON.stringify(process.env.REMOTE_CONFIG_URL),
            }),
            new CleanWebpackPlugin(),
            new MiniCssExtractPlugin({
                filename: 'bot/css/bot.main.[contenthash].css',
                chunkFilename: 'bot/css/bot.[name].[contenthash].css',
            }),
            new StyleLintPlugin({ fix: true }),
            new CopyWebpackPlugin({
                patterns: [
                    { from: 'node_modules/@deriv/bot-skeleton/dist/media', to: 'bot/media', noErrorOnMissing: true },
                    { 
                        from: 'node_modules/@deriv/components/lib/icon/sprites', 
                        to: 'public/sprites',
                        noErrorOnMissing: true 
                    },
                ],
            }),
            new SpriteLoaderPlugin(),
        ],
        externals: [
            {
                '@babel/polyfill': '@babel/polyfill',
                classnames: 'classnames',
                '@deriv/components': '@deriv/components',
                '@deriv/shared': '@deriv/shared',
                '@deriv/translations': '@deriv/translations',
                formik: 'formik',
                react: 'react',
                mobx: 'mobx',
                'mobx-react': 'mobx-react',
                'react-dom': 'react-dom',
                'react-router': 'react-router',
                'react-router-dom': 'react-router-dom',
                '@deriv/deriv-charts': '@deriv/deriv-charts',
                '@deriv-com/analytics': `@deriv-com/analytics`,
            },
            /^@deriv\/shared\/.+$/,
            /^@deriv\/components\/.+$/,
            /^@deriv\/translations\/.+$/,
            /^@deriv\/analytics\/.+$/,
        ],
    };
};
