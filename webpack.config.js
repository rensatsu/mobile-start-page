/* global __dirname */

const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env) => {
    const IS_PROD = 'production' in env && env.production;

    const DEV_SERVER_PORT = 29998;

    const APP_NAME = 'Start Page';
    const APP_SHORT_NAME = 'Start Page';
    const APP_URL = IS_PROD ? 'https://ren-start.netlify.com/' :
        `http://localhost:${DEV_SERVER_PORT}/`;

    const TARGET_PATH = path.resolve(__dirname, 'dist');

    console.info('Building', APP_NAME, 'on', IS_PROD ? 'prod' : 'dev');

    const webpackParams = {
        entry: './src/index.js',
        mode: IS_PROD ? 'production' : 'development',
        output: {
            filename: IS_PROD ? 'app.[hash].js' : 'app.js',
            chunkFilename: IS_PROD ? 'app.[id].[hash].js' : 'app.[id].js',
            path: TARGET_PATH
        },
        optimization: {
            splitChunks: {
                chunks: 'all'
            },
            usedExports: true,
        },
        devServer: {
            contentBase: path.join(__dirname, 'dist'),
            compress: true,
            host: '0.0.0.0',
            port: DEV_SERVER_PORT
        },
        module: {
            rules: [
                {
                    test: /\.less$/,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                            options: {
                                hmr: !IS_PROD,
                            },
                        },
                        'css-loader', // translates CSS into CommonJS
                        'less-loader', // compiles Less to CSS
                    ],
                },
                {
                    test: /\.(png|svg|jpg|gif)$/,
                    use: [
                        'file-loader'
                    ]
                },
            ],
        },
        plugins: [
            new CleanWebpackPlugin({
                cleanOnceBeforeBuildPatterns: ['**/*'],
            }),
            new HtmlWebpackPlugin({
                title: APP_NAME,
                short_name: APP_SHORT_NAME,
                template: './index.html',
                favicon: path.resolve('./src/images/icon512.png'),
            }),
            new WorkboxPlugin.GenerateSW({
                clientsClaim: true,
                skipWaiting: true,
                maximumFileSizeToCacheInBytes: 5000000,
                runtimeCaching: [
                    {
                        urlPattern: new RegExp('^https://www.google.com/s2/favicons'),
                        // Apply a network-first strategy.
                        handler: 'NetworkFirst',
                    },
                    {
                        urlPattern: new RegExp('^https://icons.duckduckgo.com/ip3/'),
                        // Apply a network-first strategy.
                        handler: 'NetworkFirst',
                    },
                    {
                        urlPattern: new RegExp('^https://favicon-api.rencloud.workers.dev'),
                        // Apply a network-first strategy.
                        handler: 'NetworkFirst',
                    }
                ],
                globIgnores: [
                    '**/_headers',
                ]
            }),
            new WebpackPwaManifest({
                name: APP_NAME,
                short_name: APP_SHORT_NAME,
                description: 'Customizable start page',
                lang: 'en-US',
                start_url: APP_URL,
                display: 'standalone',
                theme_color: '#333333',
                background_color: '#f0f0f0',
                crossorigin: null,
                fingerprints: false,
                inject: true,
                icons: [
                    {
                        src: path.resolve('./src/images/icon16.png'),
                        sizes: [16],
                        inject: true,
                    },
                    {
                        src: path.resolve('./src/images/icon128.png'),
                        sizes: [128],
                        inject: true,
                    },
                    {
                        src: path.resolve('./src/images/icon512.png'),
                        sizes: [20, 96, 192, 256, 384, 512],
                        inject: true,
                    },
                    {
                        src: path.resolve('./src/images/icon.svg'),
                        sizes: [512],
                        inject: true,
                    }
                ]
            }),
            new CopyPlugin({
                patterns: [
                    { from: path.resolve('./_headers'), to: TARGET_PATH },
                ]
            }),
            new MiniCssExtractPlugin({
                filename: IS_PROD ? '[name].[hash].css' : '[name].css',
                chunkFilename: IS_PROD ? '[id].[hash].css' : '[id].css',
                ignoreOrder: false, // Enable to remove warnings about conflicting order
            }),
        ]
    };

    if (!IS_PROD) {
        webpackParams.devtool = 'inline-source-map';
    }

    return webpackParams;
};
