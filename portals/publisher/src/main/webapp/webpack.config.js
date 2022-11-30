/* eslint-disable max-len */
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HookShellScriptPlugin = require('hook-shell-script-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const devInfo = require('./dev.json');
const { clientRoutingBypass, devServerBefore } = require('./services/dev_proxy/auth_login.js');

module.exports = (env, argv) => {
    const isDevelopmentBuild = argv.mode === 'development';
    const isTestBuild = process.env && process.env.WSO2_UI_MOCKED === 'true';
    const devConfig = {
        entry: {
            main: path.resolve(__dirname, './source/index.jsx'),
        },
        output: {
            path: path.resolve(__dirname, 'site/public/dist'),
            filename: isDevelopmentBuild || isTestBuild ? '[name].bundle.js' : '[name].[contenthash].bundle.js',
            chunkFilename: isDevelopmentBuild || isTestBuild
                ? '[name].chunk.bundle.js' : '[name].[contenthash].bundle.js',
            publicPath: 'site/public/dist/',
            globalObject: 'this',
        },
        watch: false,
        watchOptions: {
            poll: 1000,
            ignored: ['files/**/*.js', 'node_modules'],
        },
        devtool: 'source-map',
        resolve: {
            alias: {
                AppData: path.resolve(__dirname, 'source/src/app/data/'),
                AppComponents: path.resolve(__dirname, 'source/src/app/components/'),
                OverrideData: path.resolve(__dirname, 'override/src/app/data/'),
                OverrideComponents: path.resolve(__dirname, 'override/src/app/components/'),
                AppTests: path.resolve(__dirname, 'source/Tests/'),
                // 'nimma/fallbacks': require.resolve('./node_modules/nimma/dist/legacy/cjs/fallbacks/index.js'), // nimma/* things Added because of spectral
                // 'nimma/legacy': require.resolve('./node_modules/nimma/dist/legacy/cjs/index.js'),
                // nimma: require.resolve('./node_modules/nimma/dist/legacy/cjs/index.js'),
            },
            extensions: ['.tsx', '.ts', '.js', '.jsx'],
            fallback: {
                "fs": false,
                "tls": false,
                "net": false,
                "path": false,
                "zlib": false,
                "http": false,
                "https": false,
                "stream": false,
                "crypto": false,
                "crypto-browserify": require.resolve('crypto-browserify')
            } 
        },
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-react', '@babel/preset-env']
                        }
                    },
                },
                {
                    test: /\.(ts|tsx)$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader']
                },
                {
                    test: /\.(woff|woff2|ttf|eot|png|jpg|svg|gif)$/i,
                    use: ['file-loader']
                },
                // Until we migrate to webpack 5 https://github.com/jantimon/html-webpack-plugin/issues/1483 ~tmkb
                // This is added to generate the index.jsp from a hbs template file including the hashed bundle file
                {
                    test: /\.jsp\.hbs$/,
                    use: [{
                        loader: 'underscore-template-loader',
                        options: {
                            engine: 'lodash',
                            interpolate: '\\{\\[(.+?)\\]\\}',
                            evaluate: '\\{%([\\s\\S]+?)%\\}',
                            escape: '\\{\\{(.+?)\\}\\}',
                        }
                    }],
                }
            ]
        },
<<<<<<< HEAD
        /**
         * Webpack devserver configuration
         * Configured to open the browser with /publisher context, Keep builds in-memory, hot updated enabled
         * Overlay the error messages in the app,
         * and use proxy configs and `devServerBefore` to handle authentication requests.
         * For more info:
         *      https://webpack.js.org/configuration/dev-server/
         *      https://github.com/gaearon/react-hot-loader
        */
        devServer: {
            open: !isTestBuild,
            openPage: 'publisher',
            inline: true,
            hotOnly: !isTestBuild,
            hot: true,
            publicPath: '/site/public/dist/',
            writeToDisk: false,
            overlay: true,
            before: devServerBefore,
            proxy: {
                '/services/': {
                    target: 'https://localhost:9443/publisher',
                    secure: false,
                },
                '/api/am/publisher/v4/swagger.yaml': {
                    target: isTestBuild ? 'https://raw.githubusercontent.com/wso2/carbon-apimgt/master/components/apimgt/org.wso2.carbon.apimgt.rest.api.publisher.v1/src/main/resources/publisher-api.yaml' : 'https://localhost:9443/api/am/publisher/v4/swagger.yaml',
                    secure: false,
                    changeOrigin: true,
                    pathRewrite: { '^/api/am/publisher/v4/swagger.yaml': '' },
                },
                '/api/am/service-catalog/v1/oas.yaml': {
                    target: isTestBuild ? 'https://raw.githubusercontent.com/wso2/carbon-apimgt/master/components/apimgt/org.wso2.carbon.apimgt.rest.api.service.catalog/src/main/resources/service-catalog-api.yaml' : 'https://localhost:8081/api/am/service-catalog/v1/oas.yaml',
                    secure: false,
                    changeOrigin: true,
                    pathRewrite: { '^/api/am/service-catalog/v1/oas.yaml': '' },
                },
                '/api/am': {
                    target: isTestBuild ? 'http://localhost:4010' : 'https://localhost:9443',
                    // pathRewrite: { '^/api/am/publisher/v4/': '' },
                    secure: false,
                },
                '/publisher/services': {
                    target: 'https://localhost:9443',
                    secure: false,
                },
                '/publisher': {
                    bypass: clientRoutingBypass,
                },
            },
        },
        resolve: {
            alias: {
                AppData: path.resolve(__dirname, 'source/src/app/data/'),
                AppComponents: path.resolve(__dirname, 'source/src/app/components/'),
                OverrideData: path.resolve(__dirname, 'override/src/app/data/'),
                OverrideComponents: path.resolve(__dirname, 'override/src/app/components/'),
                AppTests: path.resolve(__dirname, 'source/Tests/'),
                // 'nimma/fallbacks': require.resolve('./node_modules/nimma/dist/legacy/cjs/fallbacks/index.js'), // nimma/* things Added because of spectral
                // 'nimma/legacy': require.resolve('./node_modules/nimma/dist/legacy/cjs/index.js'),
                // nimma: require.resolve('./node_modules/nimma/dist/legacy/cjs/index.js'),
            },
            extensions: ['.tsx', '.ts', '.js', '.jsx'],
        },
        externals: {
            Config: 'AppConfig',
            Themes: 'AppThemes', // Should use long names for preventing global scope JS variable conflicts
            MaterialIcons: 'MaterialIcons',
            Settings: 'Settings',
            userCustomThemes: 'userThemes', // Should use long names for preventing global scope JS variable conflicts
        },
        plugins: [
            new HtmlWebpackPlugin({
                inject: true,
                template: path.resolve(__dirname, 'site/public/pages/templates/index.jsp.hbs'),
                filename: path.resolve(__dirname, 'site/public/pages/index.jsp'),
                minify: false, // Make this true to get exploded, formatted index.jsp file,
                templateParameters: { env: isDevelopmentBuild ? 'development': 'production'},
            }),
            new CleanWebpackPlugin(),
            new HookShellScriptPlugin({
                afterEmit: [`echo "Updating files in ${devInfo.location}. Changes done to the publisher webapp." && ${devInfo.command}` ]
            }),
            new ESLintPlugin({
                extensions: ['js', 'ts', 'jsx'],
                failOnError: true,
                quiet: true,
                exclude: 'node_modules',
            }),
            new webpack.ProgressPlugin((percentage, message, ...args) => {
                // e.g. Output each progress message directly to the console:
                const pres = Math.round(percentage * 100);
                if (pres % 20 === 0) console.info(`${pres}%`, message, ...args); // To reduce log lines
            }),
        ],
        optimization: {
            splitChunks: {
                chunks: 'all',
            },
        },
        mode: (isDevelopmentBuild || isTestBuild) && 'development',
    }
    const isAnalysis = process.env && process.env.NODE_ENVS === 'analysis';
    if (isAnalysis) {
        devConfig.plugins.push(new BundleAnalyzerPlugin());
    }
    return devConfig;
};