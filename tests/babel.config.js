const resolvePlugin = [
    ["module-resolver", {
      "alias": {
        "@support": "./cypress/support",
        "@fixtures": "./cypress/fixtures"
      }
    }]
  ]
module.exports = {
    presets: ['@babel/preset-env'],
    plugins: ['@babel/transform-runtime', ...resolvePlugin]
  }
  