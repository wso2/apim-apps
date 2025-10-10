const { defineConfig } = require('cypress')

module.exports = defineConfig({
  chromeWebSecurity: false,
  pageLoadTimeout: 100000,
  defaultCommandTimeout: 100000,
  largeTimeout: 100000,
  screenshotsFolder: 'cypress/screenshots',
  screenshotOnRunFailure: true,
  experimentalInteractiveRunEvents: true,
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
  retries: {
    runMode: 2,
    openMode: 0,
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    excludeSpecPattern: [
      '**/externalDevPortals/**.spec.js',
      '**/06-solace-broker-integration.spec.js',
      '**/*.skip.cy.js',
    ],
    baseUrl: 'https://localhost:9443',
  },
})
