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

import Utils from "@support/utils";

// Test for: "Fix misleading hardcoded 30000 in Advanced Endpoint Configuration Duration field"
// Before the fix, the Duration (ms) field was pre-populated with '30000' as a real value,
// misleading users into thinking 30000ms was their saved timeout. After the fix, the field
// is empty by default and 30000 is shown only as placeholder hint text.

describe("publisher-004-11 : Advanced endpoint config Duration field is empty by default with placeholder 30000", () => {
    const { publisher, password } = Utils.getUserInfo();
    const endpoint = 'https://petstore.swagger.io/v2/store/inventory';
    let testApiId;

    beforeEach(() => {
        cy.loginToPublisher(publisher, password);
    });

    afterEach(() => {
        if (testApiId) {
            Utils.deleteAPI(testApiId);
            testApiId = null;
        }
    });

    it.only("Duration (ms) field is empty (not 30000) when first opening Advanced Config for production endpoint", () => {
        Utils.addAPI({}).then((apiId) => {
            testApiId = apiId;
            cy.visit(`/publisher/apis/${apiId}/overview`);
            cy.get('#itest-api-details-api-config-acc').click();
            cy.get('#left-menu-itemendpoints').click();
            cy.get('[data-testid="http/restendpoint-add-btn"]').click();

            cy.get('#production-endpoint-checkbox').click();
            cy.get('#production_endpoints').focus().type(endpoint);

            // Open Advanced Endpoint Configuration for the production endpoint
            cy.get('#production_endpoints-endpoint-configuration-icon-btn').click();

            // Duration field must be empty — not '30000'
            cy.get('#duration-input').should('have.value', '');

            // The placeholder should be '30000' to hint at the default
            cy.get('#duration-input').should('have.attr', 'placeholder', '30000');

            cy.get('#endpoint-configuration-submit-btn').click();
        });
    });

    it.only("Duration (ms) field is empty (not 30000) when first opening Advanced Config for sandbox endpoint", () => {
        Utils.addAPI({}).then((apiId) => {
            testApiId = apiId;
            cy.visit(`/publisher/apis/${apiId}/overview`);
            cy.get('#itest-api-details-api-config-acc').click();
            cy.get('#left-menu-itemendpoints').click();
            cy.get('[data-testid="http/restendpoint-add-btn"]').click();

            cy.get('#sandbox-endpoint-checkbox').click();
            cy.get('#sandbox_endpoints').focus().type(endpoint);

            // Open Advanced Endpoint Configuration for the sandbox endpoint
            cy.get('#sandbox_endpoints-endpoint-configuration-icon-btn').click();

            // Duration field must be empty — not '30000'
            cy.get('#duration-input').should('have.value', '');

            // The placeholder should be '30000' to hint at the default
            cy.get('#duration-input').should('have.attr', 'placeholder', '30000');

            cy.get('#endpoint-configuration-submit-btn').click();
        });
    });

    it.only("A saved Duration value is preserved on re-open (not reset to 30000 or blank)", () => {
        Utils.addAPI({}).then((apiId) => {
            testApiId = apiId;
            cy.visit(`/publisher/apis/${apiId}/overview`);
            cy.get('#itest-api-details-api-config-acc').click();
            cy.get('#left-menu-itemendpoints').click();
            cy.get('[data-testid="http/restendpoint-add-btn"]').click();

            cy.get('#production-endpoint-checkbox').click();
            cy.get('#production_endpoints').focus().type(endpoint);

            // Open Advanced Config, set a custom duration, and stage it
            cy.get('#production_endpoints-endpoint-configuration-icon-btn').click();
            cy.get('#duration-input').clear().type('5000');
            cy.get('#endpoint-configuration-submit-btn').click();

            // Advanced Config's own "Save" button only stages the value in local component
            // state - persist it for real via the endpoint page's Save button, then reload
            // the page to force a fresh fetch from the backend before re-checking the value.
            // handleSave() doesn't await updateAPI(), so wait for the PUT to actually
            // complete before reloading - otherwise the reload can race the persist.
            cy.intercept('PUT', `**/apis/${apiId}`).as('saveEndpointConfig');
            cy.get('#endpoint-save-btn').click();
            cy.wait('@saveEndpointConfig');

            cy.visit(`/publisher/apis/${apiId}/overview`);
            cy.get('#itest-api-details-api-config-acc').click();
            cy.get('#left-menu-itemendpoints').click();

            // Re-open and verify the saved value survived the reload
            cy.get('#production_endpoints-endpoint-configuration-icon-btn').click();
            cy.get('#duration-input').should('have.value', '5000');
            cy.get('#endpoint-configuration-submit-btn').click();
        });
    });
});
