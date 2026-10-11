#!/usr/bin/env node
// Prints the comma-separated list of specs that failed the last run.
// Empty output means no rerun is needed.

const fs = require('fs');

const SOURCE = process.argv[2] || 'cypress/failed-specs.txt';

if (!fs.existsSync(SOURCE)) {
    // No file => nothing to retry.
    process.exit(0);
}

const contents = fs.readFileSync(SOURCE, 'utf8').trim();
if (contents) {
    process.stdout.write(contents);
}
