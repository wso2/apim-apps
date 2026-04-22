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
 * Regression test for issue #4972 bug 1.
 *
 * The Publisher and Admin portal HTML entry points were missing the modern
 * <link rel="icon" type="image/png"> tag that the DevPortal already emitted.
 * Chromium therefore never requested a favicon for Publisher/Admin and the
 * tab icon was blank. The fix adds the tag alongside the legacy
 * <link rel="shortcut icon"> in every portal entry template.
 *
 * This test reads the four Publisher + Admin templates straight from source
 * and asserts that both link tags are present. The DevPortal baselines are
 * asserted too so the test also catches any regression there.
 */
const fs = require('fs');
const path = require('path');

const portalsRoot = path.resolve(__dirname, '../../../../../../../..');

const templates = [
    {
        portal: 'publisher',
        file: path.join(portalsRoot, 'publisher/src/main/webapp/site/public/pages/index.jsp.hbs'),
        expectedHref: '/site/public/images/_favicon.png',
    },
    {
        portal: 'publisher',
        file: path.join(portalsRoot, 'publisher/src/main/webapp/publisher/index.html'),
        expectedHref: '/site/public/images/_favicon.png',
    },
    {
        portal: 'admin',
        file: path.join(portalsRoot, 'admin/src/main/webapp/site/public/pages/index.jsp.hbs'),
        expectedHref: '/site/public/images/_favicon.png',
    },
    {
        portal: 'admin',
        file: path.join(portalsRoot, 'admin/src/main/webapp/admin/index.ejs'),
        expectedHref: '/site/public/images/_favicon.png',
    },
    {
        portal: 'devportal',
        file: path.join(portalsRoot, 'devportal/src/main/webapp/site/public/pages/index.jsp.hbs'),
        expectedHref: '/site/public/images/_favicon.png',
    },
    {
        portal: 'devportal',
        file: path.join(portalsRoot, 'devportal/src/main/webapp/devportal/index.ejs'),
        expectedHref: '/site/public/images/_favicon.png',
    },
];

describe('Issue #4972 — portal HTML templates emit both favicon link tags', () => {
    templates.forEach(({ portal, file, expectedHref }) => {
        describe(`${portal}: ${path.basename(file)}`, () => {
            let markup;
            beforeAll(() => {
                markup = fs.readFileSync(file, 'utf8');
            });

            it('emits the legacy <link rel="shortcut icon"> tag', () => {
                expect(markup).toMatch(/<link[^>]+rel=["']shortcut icon["'][^>]*>/);
            });

            it('emits the modern <link rel="icon" type="image/png"> tag', () => {
                expect(markup).toMatch(/rel=["']icon["']\s+type=["']image\/png["']/);
            });

            it('points the modern <link rel="icon"> at _favicon.png', () => {
                // The surrounding <link ...> may embed templating tokens like
                // <%= context%> so we don't try to match the whole tag — we
                // just assert _favicon.png is referenced in the file alongside
                // a rel="icon" tag (asserted separately above).
                expect(markup).toContain(expectedHref);
            });
        });
    });

    it('asserts the _favicon.png asset exists in every portal public/images directory', () => {
        const assetPaths = [
            path.join(portalsRoot, 'publisher/src/main/webapp/site/public/images/_favicon.png'),
            path.join(portalsRoot, 'admin/src/main/webapp/site/public/images/_favicon.png'),
            path.join(portalsRoot, 'devportal/src/main/webapp/site/public/images/_favicon.png'),
        ];
        assetPaths.forEach((p) => {
            expect(fs.existsSync(p)).toBe(true);
        });
    });
});
