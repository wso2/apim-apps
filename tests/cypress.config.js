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
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    excludeSpecPattern: [
      '**/externalDevPortals/**/*.cy.js',
      '**/06-solace-broker-integration.cy.js',
      '**/*.cy.skip.js',
    ],
    baseUrl: 'https://localhost:9443',
  },
})
