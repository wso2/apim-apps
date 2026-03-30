const { defineConfig } = require('cypress');
const browserify = require('@cypress/browserify-preprocessor');

module.exports = defineConfig({
  chromeWebSecurity: false,
  pageLoadTimeout: 100000,
  defaultCommandTimeout: 100000,
  screenshotsFolder: 'cypress/screenshots',
  screenshotOnRunFailure: true,
  video: false,
  scrollBehavior: 'nearest',
  retries: {
    runMode: 2,
    openMode: 0,
  },
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
  e2e: {
    baseUrl: 'https://localhost:9443',
    specPattern: 'cypress/e2e/**/*.spec.js',
    excludeSpecPattern: [
      '**/*.skip.js',
      '**/externalDevPortals/**.spec.js',
      '**/06-solace-broker-integration.spec.js',
    ],
    supportFile: 'cypress/support/e2e.js',
    testIsolation: false,
    setupNodeEvents(on, config) {
      const options = browserify.defaultOptions;
      options.browserifyOptions.transform[1][1].babelrc = true;
      on('file:preprocessor', browserify(options));
      return config;
    },
  },
});
