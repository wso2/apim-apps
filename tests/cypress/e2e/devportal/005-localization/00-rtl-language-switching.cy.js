/*
 * Copyright (c) 2026, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
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

/*
 Verifies that the DevPortal flips its layout from LTR to RTL when an RTL
 language is selected. Only the direction switch is under test (the translated
 text is user-editable and out of scope).
 
 Activation: on a fresh pack the language switcher is off; it is normally turned
 on by `custom.languageSwitch.active` in the server's userTheme.json. The suite
 runs against a remote server (no filesystem access), so we inject that config
 client-side: the page loads `/site/public/theme/userTheme.js` as a classic
 script defining the global `const Configurations`, which webpack maps to
 `import Configurations from 'Config'` and DevPortal.jsx merges over the default
 theme. Stubbing that one request with cy.intercept makes the app behave exactly
 as if the pack carried the config, with no server-side footprint.
 */

import Utils from '@support/utils';

const languageSwitchTheme = {
    direction: 'ltr',
    custom: {
        landingPage: { active: false },
        languageSwitch: {
            active: true,
            showFlag: true,
            showText: true,
            minWidth: 60,
            languages: [
                { key: 'en', image: '/site/public/images/flags/en.png', imageWidth: 24, text: 'English', direction: 'ltr' },
                { key: 'ar', image: '/site/public/images/flags/ar.png', imageWidth: 24, text: 'Arabic', direction: 'rtl' },
            ],
        },
    },
};

// Replace the theme script body so `Configurations` carries the language switch.
// Registered before cy.visit; survives the in-test window.location.reload() the
// selector triggers. no-store makes the reload re-hit the stub, not the cache.
const stubThemeWithLanguageSwitch = () => {
    cy.intercept('GET', '**/site/public/theme/userTheme.js', {
        statusCode: 200,
        headers: {
            'content-type': 'application/javascript; charset=UTF-8',
            'cache-control': 'no-store',
        },
        body: `const Configurations = ${JSON.stringify(languageSwitchTheme)};`,
    }).as('userTheme');
};

describe('DevPortal RTL - direction switching', () => {
    beforeEach(() => {
        stubThemeWithLanguageSwitch();
        // Uses the merged systemTheme directly, so our injected config takes effect.
        cy.visit('/devportal/apis?tenant=carbon.super');
        cy.wait('@userTheme');
    });

    it('renders the language switcher and defaults to LTR', () => {
        cy.get('#demo-language-select', { timeout: Cypress.env('largeTimeout') })
            .should('be.visible');
        cy.get('body').should('have.attr', 'dir', 'ltr');
        cy.get('body').should('have.css', 'direction', 'ltr');
    });

    it('flips the document direction to RTL on Arabic and back to LTR on English', () => {
        cy.get('#demo-language-select', { timeout: Cypress.env('largeTimeout') })
            .should('be.visible');
        cy.get('body').should('have.attr', 'dir', 'ltr');

        // Select Arabic -> selector persists the choice and reloads the page.
        cy.get('#demo-language-select').click();
        cy.get('li[data-value="ar"]', { timeout: Cypress.env('largeTimeout') }).click();

        cy.get('body', { timeout: Cypress.env('largeTimeout') }).should('have.attr', 'dir', 'rtl');
        cy.get('body').should('have.css', 'direction', 'rtl');
        cy.window().then((win) => {
            expect(win.localStorage.getItem('language')).to.eq('ar');
        });

        // Switch back to English -> direction returns to LTR (bidirectional switching).
        cy.get('#demo-language-select', { timeout: Cypress.env('largeTimeout') })
            .should('be.visible')
            .click();
        cy.get('li[data-value="en"]', { timeout: Cypress.env('largeTimeout') }).click();

        cy.get('body', { timeout: Cypress.env('largeTimeout') }).should('have.attr', 'dir', 'ltr');
        cy.get('body').should('have.css', 'direction', 'ltr');
        cy.window().then((win) => {
            expect(win.localStorage.getItem('language')).to.eq('en');
        });
    });

    it('mirrors the floating chat bubble from the right in LTR to the left in RTL', () => {
        // The floating chat button is positioned with insetInlineEnd, so it aligns to the
        // right edge in LTR and mirrors to the left edge in RTL.
        const VIEWPORT_WIDTH = 1280;
        cy.viewport(VIEWPORT_WIDTH, 800);

        cy.visit('/devportal/apis?tenant=carbon.super', {
            onBeforeLoad(win) { win.localStorage.setItem('language', 'en'); },
        });
        cy.wait('@userTheme');
        cy.get('body', { timeout: Cypress.env('largeTimeout') }).should('have.attr', 'dir', 'ltr');

        let ltrLeft;
        cy.get('[aria-label="chat"]', { timeout: Cypress.env('largeTimeout') })
            .should('be.visible')
            .then(($c) => {
                ltrLeft = $c[0].getBoundingClientRect().left;
                expect(ltrLeft, 'chat bubble on the right in LTR (insetInlineEnd)')
                    .to.be.greaterThan(VIEWPORT_WIDTH / 2);
            });

        cy.visit('/devportal/apis?tenant=carbon.super', {
            onBeforeLoad(win) { win.localStorage.setItem('language', 'ar'); },
        });
        cy.wait('@userTheme');
        cy.get('body', { timeout: Cypress.env('largeTimeout') }).should('have.attr', 'dir', 'rtl');
        cy.get('[aria-label="chat"]', { timeout: Cypress.env('largeTimeout') })
            .should('be.visible')
            .then(($c) => {
                const rtlLeft = $c[0].getBoundingClientRect().left;
                expect(rtlLeft, 'chat bubble on the left in RTL')
                    .to.be.lessThan(VIEWPORT_WIDTH / 2);
                expect(rtlLeft, 'chat bubble moved leftward when flipping to RTL')
                    .to.be.lessThan(ltrLeft);
            });
    });
});

describe('DevPortal RTL - layout mirroring on the API details page', () => {
    const { publisher, password } = Utils.getUserInfo();
    const apiName = Utils.generateName();
    const apiVersion = '1.0.0';
    const VIEWPORT_WIDTH = 1280;
    let apiId;

    const overviewUrl = () => `/devportal/apis/${apiId}/overview?tenant=carbon.super`;

    // Visit the API overview, and return the left edge (viewport px) of the left menu.
    const leftMenuEdge = (lang) => {
        const expectedDir = lang === 'ar' ? 'rtl' : 'ltr';
        cy.visit(overviewUrl(), {
            onBeforeLoad(win) {
                win.localStorage.setItem('language', lang);
            },
        });
        cy.wait('@userTheme');
        cy.get('body', { timeout: Cypress.env('largeTimeout') }).should('have.attr', 'dir', expectedDir);
        return cy.get('.left-menu', { timeout: Cypress.env('largeTimeout') })
            .should('be.visible')
            .then(($el) => $el[0].getBoundingClientRect().left);
    };

    before(() => {
        // Create, deploy and publish a throwaway API so the details page (and its
        // left menu) is available to view in the devportal.
        cy.loginToPublisher(publisher, password);
        Utils.addAPIWithEndpoints({ name: apiName, version: apiVersion }).then((id) => {
            apiId = id;
            Utils.addRevision(id).then((revId) => {
                Utils.deployRevision(id, revId).then(() => {
                    Utils.publishAPI(id);
                });
            });
        });
    });

    beforeEach(() => {
        stubThemeWithLanguageSwitch();
        cy.viewport(VIEWPORT_WIDTH, 800);
    });

    it('pins the API-details left menu to the left in LTR and to the right in RTL', () => {
        let ltrLeft;

        // LTR: insetInlineStart:0 resolves to the left edge.
        leftMenuEdge('en').then((left) => {
            ltrLeft = left;
            expect(ltrLeft, 'left menu hugs the left edge in LTR')
                .to.be.lessThan(VIEWPORT_WIDTH / 2);
        });

        // RTL: the same insetInlineStart:0 now resolves to the right edge. Before
        // the logical CSS this was a physical 'left', so it would NOT have moved.
        leftMenuEdge('ar').then((rtlLeft) => {
            expect(rtlLeft, 'left menu hugs the right edge in RTL')
                .to.be.greaterThan(VIEWPORT_WIDTH / 2);
            expect(rtlLeft, 'left menu moved rightward when flipping to RTL')
                .to.be.greaterThan(ltrLeft);
        });
    });

    it('flips the breadcrumb separator arrow direction (NavigateNext <-> NavigateBefore)', () => {
        // The breadcrumb uses a direction-aware separator icon:
        //   LTR -> NavigateNextIcon, RTL -> NavigateBeforeIcon
        
        // LTR
        cy.visit(overviewUrl(), {
            onBeforeLoad(win) { win.localStorage.setItem('language', 'en'); },
        });
        cy.wait('@userTheme');
        cy.get('body', { timeout: Cypress.env('largeTimeout') }).should('have.attr', 'dir', 'ltr');
        cy.get('[aria-label="breadcrumb"]', { timeout: Cypress.env('largeTimeout') }).should('be.visible');
        cy.get('[aria-label="breadcrumb"] [data-testid="NavigateNextIcon"]').should('exist');
        cy.get('[aria-label="breadcrumb"] [data-testid="NavigateBeforeIcon"]').should('not.exist');

        // RTL: the separator arrow mirrors.
        cy.visit(overviewUrl(), {
            onBeforeLoad(win) { win.localStorage.setItem('language', 'ar'); },
        });
        cy.wait('@userTheme');
        cy.get('body', { timeout: Cypress.env('largeTimeout') }).should('have.attr', 'dir', 'rtl');
        cy.get('[aria-label="breadcrumb"]', { timeout: Cypress.env('largeTimeout') }).should('be.visible');
        cy.get('[aria-label="breadcrumb"] [data-testid="NavigateBeforeIcon"]').should('exist');
        cy.get('[aria-label="breadcrumb"] [data-testid="NavigateNextIcon"]').should('not.exist');
    });

    after(() => {
        Utils.deleteAPI(apiId);
    });
});
