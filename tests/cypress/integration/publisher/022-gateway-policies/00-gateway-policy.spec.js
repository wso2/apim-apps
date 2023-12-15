/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Utils from "@support/utils";

describe("Gateway Policies", () => {

    const { carbonUsername, carbonPassword } = Utils.getUserInfo();

    before(function () {
        cy.loginToPublisher(carbonUsername, carbonPassword);
    })

    it("Global Policy Operations", () => {
        // Add policy mapping
        cy.visit(`publisher/global-policies/create`);
        cy.get('#outlined-required').click();
        cy.get('#outlined-required').type('Global policy mapping 1');
        cy.get('#outlined-multiline-static').click();
        cy.get('#outlined-multiline-static').type('Global policy mapping 1 description');
        cy.get('#request-tab').click();
        const dataTransfer = new DataTransfer();
        cy.contains('Add Header', { timeout: Cypress.config().largeTimeout }).trigger('dragstart', {
            dataTransfer
        });
        cy.contains('Drag and drop policies here').trigger('drop', {
            dataTransfer
        });
        cy.get('#headerName').click();
        cy.get('#headerName').type('RequestHeader');
        cy.get('#headerValue').click();
        cy.get('#headerValue').type('RequestHeaderValue');
        cy.get('[data-testid=policy-attached-details-save]').click();
        cy.get('[data-testid=policy-mapping-save-or-update-button]').scrollIntoView().click();
        cy.wait(2000);

        // deploy policy mapping to a gateway
        cy.get('#expandable-button').click();
        cy.contains('Select Gateways to Deploy').click();
        cy.contains('Default').click();
        cy.get('[data-testid=policy-mapping-deploy-button]').click();
        cy.get('[data-testid=deploy-to-gateway-button]', { timeout: Cypress.config().largeTimeout }).click();

        // update policy mapping
        cy.get('[data-testid=policy-mapping-edit-button]').click();
        cy.get('div[title="Add Header : v1"]').click();
        cy.get('#headerValue', { timeout: Cypress.config().largeTimeout }).click();
        cy.get('[data-testid=policy-attached-details-save]').should('be.disabled'); // Check that the save button is initially disabled
        const newText = 'RequestHeaderValueNew';
        cy.get('#headerValue').type(newText).should('have.value', newText); // Check that the save button becomes enabled after text input
        cy.get('[data-testid=policy-attached-details-save]').should('not.be.disabled');
        cy.get('[data-testid=policy-attached-details-save]').click();
        cy.get('[data-testid=policy-mapping-save-or-update-button]').scrollIntoView().click();

        // undeploy policy mapping
        cy.get(`#gateway-chip-${gateway}`)
            .should('exist')
            .then(($element) => {
                if ($element.length > 0) {
                    cy.wrap($element).click();
                    cy.get('[data-testid=undeploy-from-gateway-button]', { timeout: Cypress.config().largeTimeout }).click();
                }
            });

        //successfull deletion of policy mapping
        cy.get('[data-testid=policy-mapping-delete-button]').click();
        cy.get('[data-testid=policy-mapping-delete-confirmation-button]', { timeout: Cypress.config().largeTimeout }).click();

        cy.logoutFromPublisher();
    });
})
