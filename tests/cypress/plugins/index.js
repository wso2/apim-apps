const browserify = require('@cypress/browserify-preprocessor')
const path = require('path');

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
    // send in the options from your webpack.config.js, so it works the same
    // as your app's code
    const options = browserify.defaultOptions;
    options.browserifyOptions.transform[1][1].babelrc = true;
  
    on('file:preprocessor', browserify(options));
}
