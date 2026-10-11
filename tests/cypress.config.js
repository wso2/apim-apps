const { defineConfig } = require('cypress')
const fs = require('fs')

module.exports = defineConfig({
  chromeWebSecurity: false,
  // 30s (not 100s) keeps DS pipeline under its 4h ceiling so screenshots
  // still upload; raise back to 100s for non-DS environments if needed.
  pageLoadTimeout: 30000,
  defaultCommandTimeout: 30000,
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
  retries: {
    runMode: 2,
    openMode: 0,
  },
  env: {
    // See pageLoadTimeout comment above — same rationale, same value.
    largeTimeout: 30000,
  },
  e2e: {
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on)
      // Record failed specs for test.sh's rerun pass. Reads results in-memory
      // because the mochawesome plugin's after:run deletes the .jsons dir.
      on('after:run', (results) => {
        // Always overwrite (even with an empty value) so a stale list from a
        // prior run can't drive the rerun pass when results are missing.
        const failed = (results && Array.isArray(results.runs))
          ? results.runs
              .filter((r) => r && r.stats && r.stats.failures > 0)
              .map((r) => r.spec && (r.spec.relative || r.spec.name))
              .filter(Boolean)
          : [];
        try {
          fs.writeFileSync('cypress/failed-specs.txt', failed.join(','));
        } catch (e) {
          // Non-fatal: a missing file is treated as "no failures".
          console.error('Failed to write cypress/failed-specs.txt:', e.message);
        }
      });
      // Surface a message on the cypress-run stdout (Jenkins console);
      // cy.log only shows in the Runner UI.
      on('task', {
        log(message) {
          console.log(message)
          return null
        },
      })
      require('./cypress/plugins/index.js')(on, config)
      return config
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
