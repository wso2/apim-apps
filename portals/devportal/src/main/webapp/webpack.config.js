/* eslint-disable */
/**
 * Copyright (c) 2017-2023, WSO2 LLC (https://www.wso2.com).
 *
 * WSO2 LLC licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */
var path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const DeadCodePlugin = require('webpack-deadcode-plugin');
const { clientRoutingBypass, devServerBefore } = require('./source/dev/webpack/auth_login.js');

module.exports = function (env, argv) {
    const isDevelopmentBuild = argv.mode === 'development';

    if (env && env.analysis) {
        var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

        config.plugins.push(new BundleAnalyzerPlugin());

    }
    const config = {
        entry: {
            index: './source/index.jsx',
        },
        output: {
            path: path.resolve(__dirname, 'site/public/dist'),
            filename: isDevelopmentBuild ? '[name].bundle.js' : '[name].[contenthash].bundle.js',
            chunkFilename: isDevelopmentBuild ? '[name].chunk.bundle.js' : '[name].[contenthash].bundle.js',
            publicPath: 'site/public/dist/',
            globalObject: 'this',
        },
        watch: false,
        watchOptions: {
            poll: 1000,
            ignored: ['files/**/*.js', 'node_modules/**'],
        },
        devtool: 'source-map',
        resolve: {
            alias: {
                OverrideData: path.resolve(__dirname, 'override/src/app/data/'),
                OverrideComponents: path.resolve(__dirname, 'override/src/app/components/'),
                AppData: path.resolve(__dirname, 'source/src/app/data/'),
                AppComponents: path.resolve(__dirname, 'source/src/app/components/'),
                AppTests: path.resolve(__dirname, 'source/Tests/'),
            },
            extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx'],
            fallback: {
                "fs": false,
                "tls": false,
                "net": false,
                "path": false,
                "zlib": false,
                "http": false,
                "https": false,
                "process": false,
                "stream": require.resolve("stream-browserify"),
                "crypto": require.resolve('crypto-browserify'),
                "crypto-browserify": require.resolve('crypto-browserify'),
                "buffer": require.resolve('buffer/'),
                "url": require.resolve("url/"),
                "vm" : require.resolve("vm-browserify"),
            },
        },
        devServer: {
            static : ['./'],
            server: 'https',
            open: ['devportal'],
            compress: true,
            hot: true,
            devMiddleware: {
                index: false,
                writeToDisk: false,
                publicPath: '/site/public/dist/',
            },
            client: {
                overlay: true,
            },
            setupMiddlewares: (middlewares, devServer) => {
                if (!devServer) {
                    throw new Error('webpack-dev-server:devServer is not defined');
                }
                devServerBefore(devServer.app);
                return middlewares;
            },
            proxy: [
                {
                    context: ['/services/'],
                    target: 'https://localhost:9443/devportal',
                    secure: false,
                },
                { 
                    context: ['/devportal/site/public/theme'],
                    target: 'https://localhost:9443',
                    secure: false,
                },
                {
                    context: ['/api/am'],
                    target: 'https://localhost:9443',
                    secure: false,
                },
                {
                    context: ['/devportal/services'],
                    target: 'https://localhost:9443',
                    secure: false,
                },
                {
                    context: ['/devportal'],
                    bypass: clientRoutingBypass,
                },
            ],
        },
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: 'babel-loader',
                        },
                        {
                            loader: path.resolve('loader.js'),
                        },
                    ],
                },
                {
                    test: /\.tsx?$/,
                    use: [
                        {
                            loader: 'ts-loader',
                            options: {
                                onlyCompileBundledFiles: true,
                            },
                        },
                    ],
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader'],
                },
                {
                    test: /\.less$/,
                    use: [
                        {
                            loader: 'style-loader', // creates style nodes from JS strings
                        },
                        {
                            loader: 'css-loader', // translates CSS into CommonJS
                        },
                        {
                            loader: 'less-loader', // compiles Less to CSS
                        },
                    ],
                },
                {
                    test: /\.(woff|woff2|eot|ttf|svg)$/,
                    use: [
                        {
                            loader: 'url-loader',
                            options: {
                                limit: 100000,
                            },
                        }
                    ]
                },
                // Until we migrate to webpack 5 https://github.com/jantimon/html-webpack-plugin/issues/1483 ~tmkb
                // This is added to generate the index.jsp from a hbs template file including the hashed bundle file
                {
                    test: /\.jsp\.hbs$/,
                    loader: 'underscore-template-loader',
                    options: {
                        engine: 'lodash',
                        interpolate: '\\{\\[(.+?)\\]\\}',
                        evaluate: '\\{%([\\s\\S]+?)%\\}',
                        escape: '\\{\\{(.+?)\\}\\}',
                    },
                },
                {
                    test: /\.m?js/,
                    resolve: {
                        fullySpecified: false,
                    },
                }
            ],
        },
        externals: {
            Config: 'Configurations',
            Settings: 'Settings',
            MaterialIcons: 'MaterialIcons',
        },
        plugins: [
            new CleanWebpackPlugin({
                cleanOnceBeforeBuildPatterns: ['./js/build/*', './css/build/*'],
                dangerouslyAllowCleanPatternsOutsideProject: true,
            }),
            new HtmlWebpackPlugin({
                inject: false,
                template: path.resolve(__dirname, 'site/public/pages/index.jsp.hbs'),
                filename: path.resolve(__dirname, 'site/public/pages/index.jsp'),
                minify: false, // Make this true to get exploded, formatted index.jsp file
            }),
            new HtmlWebpackPlugin({
                inject: false,
                template: path.resolve(__dirname, 'devportal/index.ejs'),
                filename: path.resolve(__dirname, 'devportal/index.html'),
                minify: false, // For Development
            }),
            new ESLintPlugin({
                extensions: ['js', 'ts', 'jsx'],
                failOnError: true,
                quiet: true,
                exclude: ['node_modules'],
            }),
            new webpack.ProgressPlugin((percentage, message, ...args) => {
                // e.g. Output each progress message directly to the console:
                const pres = Math.round(percentage * 100);
                if (pres % 20 === 0) console.info(`${pres}%`, message, ...args); // To reduce log lines
            }),
            new webpack.ProvidePlugin({
                Buffer: ['buffer', 'Buffer'],
                process: 'process/browser',
            }),
            new DeadCodePlugin({
                failOnHint: !isDevelopmentBuild,
                patterns: [
                    'source/src/**/*.jsx',
                    'source/src/**/*.js'
                ],
                exclude: [
                    'source/src/**/*.test.js',
                    'source/src/**/*.test.jsx',
                    'babel.config.js',
                    '**/*.txt',
                    'source/src/index.js',
                    '**/*.(stories|spec).(js|jsx)',
                    'source/src/app/components/Shared/ChipInput.js',
                    'source/src/app/data/stringFormatter.js',
                ],
            }),
        ],
    };
    return config;
};

