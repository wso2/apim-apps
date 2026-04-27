/*
 * Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * Regression test for issue #4972 bug 2.
 *
 * The Admin portal's Copyright component was not rolled forward to 2026 when
 * Publisher and DevPortal were updated, so the rendered footer showed
 * "© 2025 WSO2 LLC". This test scans the defaultMessage string for the
 * Base.Footer.Footer.product_details intl key in each portal's source and
 * asserts it carries the current (expected) year. The expected year is
 * derived from the Publisher's Footer.jsx — the portal that was correct
 * at the time the bug was reported — so the test auto-updates when the
 * year is rolled forward next time, as long as Publisher is rolled first.
 */
const fs = require('fs');
const path = require('path');

const portalsRoot = path.resolve(__dirname, '../../../../../../../..');

const PRODUCT_DETAILS_LINE = /defaultMessage=['"]([^'"]*WSO2 API-M[^'"]*WSO2 LLC)['"]/;

function readProductDetailsDefault(file) {
    const src = fs.readFileSync(file, 'utf8');
    const m = src.match(PRODUCT_DETAILS_LINE);
    if (!m) {
        throw new Error(`Could not find product_details defaultMessage in ${file}`);
    }
    return m[1];
}

const sources = {
    publisher: path.join(
        portalsRoot,
        'publisher/src/main/webapp/source/src/app/components/Base/Footer/Footer.jsx',
    ),
    admin: path.join(
        portalsRoot,
        'admin/src/main/webapp/source/src/app/components/Base/index.jsx',
    ),
    devportal: path.join(
        portalsRoot,
        'devportal/src/main/webapp/source/src/app/components/Base/index.jsx',
    ),
};

describe('Issue #4972 — portal Copyright defaultMessage carries the expected year', () => {
    const publisherMessage = readProductDetailsDefault(sources.publisher);
    const yearMatch = publisherMessage.match(/©\s*(\d{4})\s*WSO2 LLC/);
    const expectedYear = yearMatch && yearMatch[1];

    it('publisher Footer has a parseable © <year> WSO2 LLC marker', () => {
        expect(expectedYear).toMatch(/^\d{4}$/);
    });

    it('expected year is 2026 or later (bug was: stale 2025)', () => {
        expect(Number(expectedYear)).toBeGreaterThanOrEqual(2026);
    });

    it.each([
        ['admin', sources.admin],
        ['devportal', sources.devportal],
    ])('%s Copyright defaultMessage carries the same year as publisher', (portal, file) => {
        const msg = readProductDetailsDefault(file);
        expect(msg).toContain(`© ${expectedYear} WSO2 LLC`);
        expect(msg).not.toMatch(/©\s*2025\s*WSO2 LLC/);
    });

    it('admin Copyright defaultMessage matches the expected product detail line exactly', () => {
        // Catches e.g. a typo in the product name or a reverted version bump.
        const msg = readProductDetailsDefault(sources.admin);
        expect(msg).toBe(`WSO2 API-M v4.7.0 | © ${expectedYear} WSO2 LLC`);
    });
});
