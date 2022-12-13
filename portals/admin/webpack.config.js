const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = (env) => {
  const devConfig = {
    entry: {
      main: path.resolve(__dirname, './client/src/index.jsx'),
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
          }
        },
        {
          test: /\.(ts|tsx)$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        }
      ]
    },
    output: {
      path: path.resolve(__dirname, './client/public/build'),
      filename: 'bundle.js',
      publicPath: '/'
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: 'WSO2 API Manager',
        // Load a custom template (lodash by default)
        template: './client/src/pages/index.html',
        publicPath: '/build',
      })
    ],
    resolve: {
      alias: {
        client: path.resolve(__dirname, 'client/src'),
        AppData: path.resolve(__dirname, 'client/src/data/'),
        AppComponents: path.resolve(__dirname, 'client/src/components/'),
      },
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
    },
    externals: {
      Settings: 'Settings',
      Config: 'OldSettings',
      Themes: 'AppThemes', // Should use long names for preventing global scope JS variable conflicts
      MaterialIcons: 'MaterialIcons',
    },
    devtool: 'source-map',
  }
  if (env.production) {
    return {
      ...devConfig
    }
  } else {
    return {
      mode: 'development',
      ...devConfig
    }
  }
};

