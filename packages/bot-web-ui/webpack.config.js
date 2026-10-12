const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { DefinePlugin } = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');

const IS_RELEASE =
    process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging' || process.env.NODE_ENV === 'test';

module.exports = function (env) {
    const base = env && env.base && env.base !== true ? `/${env.base}/` : '/';

    return {
        entry: [path.join(__dirname, 'src', 'app', 'index.ts')],
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'bot/js/bot-web-ui.main.js',
            chunkFilename: 'bot/js/bot.[name].[contenthash].js',
            libraryExport: 'default',
            library: '@deriv/bot-web-ui',
            libraryTarget: 'umd',
            publicPath: base,
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
                    resolve: { fullySpecified: false },
                },
                {
                    test: /\.(s*)css$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        { loader: 'css-loader', options: { sourceMap: !IS_RELEASE, url: false } },
                        { loader: 'sass-loader', options: { sourceMap: !IS_RELEASE } },
                        {
                            loader: 'sass-resources-loader',
                            options: {
                                resources: [
                                    path.resolve(__dirname, 'src/styles/legacy-constants.scss'),
                                    ...require('@deriv/shared/src/styles/index.js'),
                                ],
                            },
                        },
                    ],
                },
                {
                    test: /\.svg$/,
                    exclude: /node_modules/,
                    use: [
                        { loader: 'svg-sprite-loader', options: { extract: true, spriteFilename: 'bot-sprite.svg' } },
                        'svgo-loader',
                    ],
                },
                {
                    test: /\.(js|jsx|ts|tsx)$/,
                    exclude: /node_modules/,
                    loader: 'babel-loader',
                    options: { rootMode: 'upward' },
                },
                {
                    // @deriv/bot-skeleton imports .xml strategies as strings
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
                // Deriv's RudderStack analytics package was dropped with the template;
                // EvPNova tracks events through its own functions (see utils/analytics.ts).
                '@deriv-com/analytics': path.resolve(__dirname, 'src/utils/analytics.ts'),
            },
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
        plugins: [
            new DefinePlugin({
                'process.env.GD_CLIENT_ID': JSON.stringify(process.env.GD_CLIENT_ID),
                'process.env.GD_API_KEY': JSON.stringify(process.env.GD_API_KEY),
                'process.env.GD_APP_ID': JSON.stringify(process.env.GD_APP_ID),
            }),
            new CleanWebpackPlugin(),
            new MiniCssExtractPlugin({
                filename: 'bot/css/bot.main.[contenthash].css',
                chunkFilename: 'bot/css/bot.[name].[contenthash].css',
            }),
            new CopyWebpackPlugin({
                patterns: [{ from: '../bot-skeleton/dist/media', to: 'bot/media', noErrorOnMissing: true }],
            }),
            new SpriteLoaderPlugin(),
        ],
        // Provided by @deriv/core at runtime (same pattern as @deriv/trader).
        externals: [
            {
                classnames: 'classnames',
                react: 'react',
                'react-dom': 'react-dom',
                'react-router': 'react-router',
                'react-router-dom': 'react-router-dom',
                mobx: 'mobx',
                formik: 'formik',
                '@deriv/shared': '@deriv/shared',
                '@deriv/components': '@deriv/components',
                '@deriv/trader': '@deriv/trader',
                '@deriv-com/translations': '@deriv-com/translations',
                '@deriv-com/smartcharts-champion': '@deriv-com/smartcharts-champion',
            },
            /^@deriv\/shared\/.+$/,
            /^@deriv\/components\/.+$/,
            /^@deriv-com\/translations\/.+$/,
        ],
    };
};
