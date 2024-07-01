/* eslint-disable */
/**
 * Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
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
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const DeadCodePlugin = require('webpack-deadcode-plugin');
const { clientRoutingBypass, devServerBefore } = require('./source/dev/auth_login.js');

module.exports = function (env, args) {
    const isDevelopmentBuild = args.mode === 'development';
    const config = {
        entry: { index: './source/index.jsx' },
        output: {
            path: path.resolve(__dirname, 'site/public/dist'),
            filename: isDevelopmentBuild ? '[name].bundle.js' : '[name].[contenthash].bundle.js',
            chunkFilename: isDevelopmentBuild ? '[name].chunk.bundle.js' : '[name].[contenthash].bundle.js',
            publicPath: 'site/public/dist/',
        },
        watch: false,
        watchOptions: {
            aggregateTimeout: 200,
            poll: true,
            ignored: ['files/**/*.js', 'node_modules/**'],
        },
        devServer: {
            static : ['./'],
            server: 'https',
            compress: true,
            open: ['admin'],
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
                    context: ['/services'],
                    target: 'https://localhost:9443/admin',
                    secure: false,
                },
                {
                    context: ['/api/am'],
                    target: 'https://localhost:9443',
                    secure: false,
                },
                {
                    context: ['/admin/services'],
                    target: 'https://localhost:9443',
                    secure: false,
                },
                {
                    context: ['/admin'],
                    bypass: clientRoutingBypass,
                },
            ],
        },
        devtool: 'source-map', // todo: Commented out the source
        // mapping in case need to speed up the build time & reduce size
        resolve: {
            alias: {
                AppData: path.resolve(__dirname, 'source/src/app/data/'),
                AppComponents: path.resolve(__dirname, 'source/src/app/components/'),
                AppTests: path.resolve(__dirname, 'source/Tests/'),
            },
            extensions: ['.js', '.jsx'],
            fallback: {
                "fs": false,
                "tls": false,
                "net": false,
                "path": false,
                "zlib": false,
                "http": false,
                "https": false,
                "stream": false,
                "process": false,
                "crypto": false,
                "util": require.resolve("util/"),
                "crypto-browserify": require.resolve('crypto-browserify'),
                "buffer": require.resolve('buffer/'),
                "url": require.resolve("url/"),
            },
        },
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    exclude: [/node_modules\/(?!(@hapi)\/).*/, /coverage/],
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
                // Until https://github.com/jantimon/html-webpack-plugin/issues/1483 ~tmkb
                // This was added to generate the index.jsp from a hbs template file including the hashed bundle file
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
            ],
        },
        externals: {
            Themes: 'AppThemes', // Should use long names for preventing global scope JS variable conflicts
            MaterialIcons: 'MaterialIcons',
            Config: 'AppConfig',
        },
        plugins: [
            new HtmlWebpackPlugin({
                inject: false,
                template: path.resolve(__dirname, 'site/public/pages/index.jsp.hbs'),
                filename: path.resolve(__dirname, 'site/public/pages/index.jsp'),
                minify: false, // Make this true to get exploded, formatted index.jsp file
            }),
            new HtmlWebpackPlugin({ // added to support development mode
                inject: false,
                template: path.resolve(__dirname, 'admin/index.ejs'),
                filename: path.resolve(__dirname, 'admin/index.html'),
                minify: false,
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
                ],
            }),
        ],
    };

    if (process.env.NODE_ENV === 'development') {
        config.watch = true;
    }

    if (env && env.analysis) {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        config.plugins.push(new BundleAnalyzerPlugin());
    }

    return config;
};
