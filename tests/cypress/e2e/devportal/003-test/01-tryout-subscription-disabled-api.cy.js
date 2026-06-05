/*
 * Copyright (c) 2026, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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

import Utils from "@support/utils";

describe("Try Out for subscription-disabled API", () => {
    const { publisher, developer, password } = Utils.getUserInfo();
    const apiVersion = '1.0.0';
    let testApiId;
    let apiName;

    it.only("Try Out skips subscribe step and reaches API Console for subscription-disabled API", {
        retries: {
            runMode: 3,
            openMode: 0,
        },
    }, () => {
        cy.loginToPublisher(publisher, password);
        apiName = Utils.generateName();

        Utils.addAPIWithEndpoints({
            name: apiName,
            version: apiVersion,
            endpoint: 'https://petstore.swagger.io/v2/swagger.json',
        }).then((apiId) => {
            testApiId = apiId;

            // Navigate to the Subscriptions page and uncheck the Unlimited policy
            cy.visit(`/publisher/apis/${apiId}/overview`);
            cy.get('#itest-api-details-portal-config-acc').click();
            cy.get('#left-menu-itemsubscriptions').click();
            cy.get('[data-testid="policy-checkbox-unlimited"]').click();
            cy.get('#subscriptions-save-btn').click();
            // Confirm the caution dialog if it appears (shown when existing subscribers are present)
            cy.get('body').then(($body) => {
                if ($body.find('button:contains("Yes")').length > 0) {
                    cy.contains('button', 'Yes').click();
                }
            });
            cy.get('[data-testid="policy-checkbox-unlimited"] input').should('not.be.checked');

            // Publish and deploy via Publisher UI (same pattern as other e2e tests)
            Utils.publishAPI(apiId).then(() => {
                cy.visit(`/publisher/apis/${apiId}/overview`);
                cy.get('#left-menu-itemdeployments').should('be.visible').click();
                cy.get('#deploy-btn').should('not.have.class', 'Mui-disabled').click({ force: true });
                cy.contains('Deployments');
                cy.contains('div[role="button"]', 'Successfully Deployed').should('exist');

                cy.logoutFromPublisher();
                cy.loginToDevportal(developer, password);
                Cypress.on('uncaught:exception', () => false);

                // Navigate to the API in the DevPortal
                cy.visit(`/devportal/apis/${apiId}/overview?tenant=carbon.super`);

                // The Try Out button that opens the modal should be present
                cy.get('button[aria-label="Try Out the API"]', { timeout: 30000 })
                    .should('be.visible')
                    .click();

                // Progress modal should appear
                cy.get('[role="status"]', { timeout: 15000 }).should('be.visible');

                // Subscribe step must NOT appear for subscription-disabled APIs
                cy.contains('API subscribed to DefaultApplication').should('not.exist');

                // Prepare and Generate Key steps should complete
                cy.contains('Getting ready to generate keys', { timeout: 30000 }).should('exist');
                cy.contains('Consumer key and secret', { timeout: 30000 }).should('exist');

                // Click the Try Out button inside the modal to navigate to the API Console
                cy.get('button[aria-label="Go to Try Out page"]', { timeout: Cypress.env('largeTimeout') })
                    .should('be.visible')
                    .click();

                // Should land on the API Console, not an error page
                cy.url({ timeout: Cypress.env('largeTimeout') }).should('include', '/api-console');
            });
        });
    });

    afterEach(() => {
        Utils.deleteAPI(testApiId);
    });
});
