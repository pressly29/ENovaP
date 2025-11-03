const path = require('path');
const { ALIASES, IS_RELEASE, MINIMIZERS, plugins, rules } = require('./constants');

module.exports = function (env) {
    const base = env && env.base && env.base !== true ? `/${env.base}/` : '/';
    const sub_path = env && env.open && env.open !== true ? env.open : '';

    return {
        context: path.resolve(__dirname, '../src'),
        devServer: {
            publicPath: base,
            openPage: sub_path,
            host: 'localhost', // Changed from localhost.binary.sx
            https: false,     // Changed from true
            port: 3001,       // Using port 3001 instead
            historyApiFallback: true,
            hot: true,
            stats: {
                colors: true,
            },
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
                'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
            }
        },
        devtool: IS_RELEASE ? 'source-map' : 'eval-cheap-module-source-map',
        entry: './index.tsx',
        mode: IS_RELEASE ? 'production' : 'development',
        module: {
            rules: rules(),
        },
        resolve: {
            alias: ALIASES,
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
            symlinks: true,
        },
        optimization: {
            minimize: IS_RELEASE,
            minimizer: MINIMIZERS,
            splitChunks: {
                chunks: 'all',
                minSize: 100000,
                minSizeReduction: 102400,
                minChunks: 1,
                maxSize: 2500000,
                maxAsyncRequests: 30,
                maxInitialRequests: 30,
                automaticNameDelimiter: '~',
                enforceSizeThreshold: 500000,
                cacheGroups: {
                    default: {
                        minChunks: 2,
                        minSize: 102400,
                        priority: -20,
                        reuseExistingChunk: true,
                    },
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        minSize: 102400,
                        priority: -10,
                        reuseExistingChunk: true,
                    },
                },
            },
        },
        output: {
            path: path.resolve(__dirname, '../dist'),
            filename: 'js/[name].js',
            chunkFilename: 'js/[name].[contenthash].js',
            publicPath: base,
        },
        plugins: plugins({
            base,
            is_test_env: false,
            env,
        }),
    };
};
