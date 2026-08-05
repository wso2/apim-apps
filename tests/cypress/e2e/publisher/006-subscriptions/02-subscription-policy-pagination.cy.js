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

import Utils from "@support/utils";

describe("API subscription policies - pagination", () => {
    const { publisher, password } = Utils.getUserInfo();
    const apiName = Utils.generateName();
    const apiVersion = '1.0.0';

    let testApiId;

    const buildPolicy = (name) => ({
        name,
        displayName: name,
        description: `${name} policy`,
        policyLevel: 'SUBSCRIPTION',
        attributes: {},
        requestCount: 1000,
        dataUnit: null,
        unitTime: 1,
        timeUnit: 'min',
        rateLimitCount: 0,
        rateLimitTimeUnit: null,
        quotaPolicyType: 'REQUESTCOUNT',
        tierPlan: 'FREE',
        stopOnQuotaReach: true,
        monetizationAttributes: {},
        throttlingPolicyPermissions: { type: 'ALLOW', roles: ['Internal/everyone'] },
    });

    // create policies
    const page1List = Array.from({ length: 10 }, (_, i) =>
        buildPolicy(`Policy${String(i + 1).padStart(2, '0')}`));
    const page2List = [
        buildPolicy('PlatinumPolicy01'),
        buildPolicy('PlatinumPolicy02'),
        buildPolicy('PlatinumPolicy03'),
        buildPolicy('PlatinumPolicy04'),
    ];

    const allPoliciesList = [...page1List, ...page2List];
    const totalPolicies = allPoliciesList.length;

    before(() => {
        cy.loginToPublisher(publisher, password);
    });

    it.only("Selecting a policy from page 2, saving it, and returning to page 1 must not trigger the migration warning", () => {
        // Step 1: Create a REST API
        Utils.addAPI({ name: apiName, version: apiVersion }).then((apiId) => {
            testApiId = apiId;

            let savedPolicies = [];

            cy.intercept('GET', '**/throttling-policies/subscription*', (req) => {
                const params = new URLSearchParams(req.url.split('?')[1] || '');
                const limit = parseInt(params.get('limit') || '100', 10);
                const offset = parseInt(params.get('offset') || '0', 10);

                if (offset > 0) {
                    req.reply({
                        body: {
                            count: page2List.length,
                            list: page2List,
                            pagination: { offset, limit, total: totalPolicies, next: '', previous: '' },
                        },
                    });
                } else {
                    req.reply({
                        body: {
                            count: page1List.length,
                            list: page1List,
                            pagination: { offset: 0, limit, total: totalPolicies, next: '', previous: '' },
                        },
                    });
                }
            }).as('getPolicies');

            cy.intercept('GET', `**/apis/${apiId}`, (req) => {
                req.continue((res) => {
                    res.body.policies = savedPolicies;
                });
            }).as('getApi');

            cy.intercept('PUT', `**/apis/${apiId}`, (req) => {
                savedPolicies = req.body.policies || [];
                req.reply({ statusCode: 200, body: { ...req.body, policies: savedPolicies } });
            }).as('saveApi');

            // Step 2: Navigate to the Subscriptions page
            cy.visit(`/publisher/apis/${apiId}/overview`);
            cy.get('#itest-api-details-portal-config-acc').click();
            cy.get('#left-menu-itemsubscriptions').click();
            cy.wait('@getPolicies');
            cy.wait('@getPolicies');

            // Step 3: Change rows per page to 10 (settings.json may default to a larger value)
            cy.get('div[class*="MuiTablePagination-select"]').first().click();
            cy.get('[role="listbox"] li[data-value="10"]').click();
            cy.wait('@getPolicies');

            // Step 4: Verify page 1 is shown, pagination is active, no false migration warnings
            cy.get('[data-testid="policy-checkbox-policy01"]').should('exist');
            cy.get('[data-testid="policy-checkbox-platinumpolicy01"]').should('not.exist');
            cy.get('button[aria-label="Go to next page"]').should('not.be.disabled');
            cy.contains('Following policies are migrated').should('not.exist');

            // Step 5: Navigate to page 2
            cy.get('button[aria-label="Go to next page"]').click();
            cy.wait('@getPolicies');

            // Step 6: Select PlatinumPolicy01 on page 2 and Save
            cy.get('[data-testid="policy-checkbox-platinumpolicy01"]').click();
            cy.get('[data-testid="policy-checkbox-platinumpolicy01"] input').should('be.checked');
            cy.get('#subscriptions-save-btn').click();
            cy.wait('@saveApi');

            // Step 7: Go back to page 1 via the previous page button
            cy.get('button[aria-label="Go to previous page"]').click();
            cy.wait('@getPolicies');

            // Step 8: Page 1 must not show the migration warning
            cy.contains('Following policies are migrated').should('not.exist');
            cy.get('[data-testid="policy-checkbox-platinumpolicy01"]').should('not.exist');
            cy.get('[data-testid="policy-checkbox-policy01"]').should('exist');

            // Step 9: Navigate to page 2 and verify PlatinumPolicy01 is still selected
            cy.get('button[aria-label="Go to next page"]').click();
            cy.wait('@getPolicies');
            cy.get('[data-testid="policy-checkbox-platinumpolicy01"] input').should('be.checked');
        });
    });

    afterEach(() => {
        if (testApiId) {
            Utils.deleteAPI(testApiId);
        }
    });
});
