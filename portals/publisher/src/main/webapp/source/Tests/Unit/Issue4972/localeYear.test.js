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
 * Regression test for issue #4972 bug 2 — locale files.
 *
 * Beyond the JSX defaultMessage, the admin en.json and fr.json carried a
 * stale "© 2025 WSO2 LLC" at locales/en.json:409 / fr.json in the shipped
 * pack. That string is what users actually see, so we scan every locale
 * file in every portal's webapp and assert any translation of
 * Base.Footer.Footer.product_details either matches the current expected
 * year or is an intentionally-blank fallback (which react-intl falls back
 * to the defaultMessage for).
 */
const fs = require('fs');
const path = require('path');

const portalsRoot = path.resolve(__dirname, '../../../../../../../..');
const PRODUCT_DETAILS_KEY = 'Base.Footer.Footer.product_details';

const PRODUCT_DETAILS_LINE = /defaultMessage=['"]([^'"]*WSO2 API-M[^'"]*WSO2 LLC)['"]/;

function readProductDetailsDefault(file) {
    const src = fs.readFileSync(file, 'utf8');
    const m = src.match(PRODUCT_DETAILS_LINE);
    return m && m[1];
}

function expectedYear() {
    const publisherMsg = readProductDetailsDefault(
        path.join(
            portalsRoot,
            'publisher/src/main/webapp/source/src/app/components/Base/Footer/Footer.jsx',
        ),
    );
    const match = publisherMsg && publisherMsg.match(/©\s*(\d{4})\s*WSO2 LLC/);
    return match && match[1];
}

function collectLocaleFiles() {
    const portals = ['publisher', 'admin', 'devportal'];
    const out = [];
    portals.forEach((portal) => {
        const dir = path.join(portalsRoot, `${portal}/src/main/webapp/site/public/locales`);
        if (!fs.existsSync(dir)) return;
        fs.readdirSync(dir).forEach((f) => {
            if (f.endsWith('.json')) {
                out.push({ portal, locale: f, file: path.join(dir, f) });
            }
        });
    });
    return out;
}

describe('Issue #4972 — locale files for Base.Footer.Footer.product_details', () => {
    const year = expectedYear();
    const localeFiles = collectLocaleFiles();

    it('the publisher defaultMessage exposes an expected year', () => {
        expect(year).toMatch(/^\d{4}$/);
        expect(Number(year)).toBeGreaterThanOrEqual(2026);
    });

    it('locale directories were discovered', () => {
        expect(localeFiles.length).toBeGreaterThan(0);
    });

    describe.each(localeFiles)('$portal/locales/$locale', ({ file }) => {
        let bundle;
        beforeAll(() => {
            bundle = JSON.parse(fs.readFileSync(file, 'utf8'));
        });

        it('if product_details is present, it is non-null and a string', () => {
            if (PRODUCT_DETAILS_KEY in bundle) {
                expect(typeof bundle[PRODUCT_DETAILS_KEY]).toBe('string');
            }
        });

        it('if product_details has a translation, it carries the current year', () => {
            const value = bundle[PRODUCT_DETAILS_KEY];
            // Empty string is allowed — react-intl falls back to defaultMessage.
            if (value && value.trim() !== '') {
                expect(value).toContain(`© ${year} WSO2 LLC`);
                expect(value).not.toMatch(/©\s*2025\s*WSO2 LLC/);
            }
        });
    });
});
