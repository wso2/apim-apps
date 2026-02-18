const { defineConfig } = require('cypress');
const browserify = require('@cypress/browserify-preprocessor');

module.exports = defineConfig({
  allowCypressEnv: false,
  chromeWebSecurity: false,
  pageLoadTimeout: 100000,
  defaultCommandTimeout: 100000,
  screenshotsFolder: 'cypress/screenshots',
  screenshotOnRunFailure: true,
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    inlineAssets: true,
    reporterEnabled: 'cypress-mochawesome-reporter, mocha-junit-reporter',
    mochaJunitReporterReporterOptions: {
      mochaFile: 'cypress/reports/junit/results-[hash].xml',
    },
    cypressMochawesomeReporterReporterOptions: {
      charts: true,
      reportPageTitle: 'custom-title',
    },
  },
  video: false,
  scrollBehavior: 'nearest',
  largeTimeout: 100000,
  retries: {
    runMode: 2,
    openMode: 0,
  },
  e2e: {
    baseUrl: 'https://localhost:9443',
    excludeSpecPattern: [
      '**/*.skip.js',
      '**/externalDevPortals/**/*.cy.js',
      '**/06-solace-broker-integration.cy.js',
    ],
    supportFile: 'cypress/support/e2e.js',
    setupNodeEvents(on, config) {
      const options = browserify.defaultOptions;
      options.browserifyOptions.transform[1][1].babelrc = true;

      on('file:preprocessor', browserify(options));

      return config;
    },
  },
});
