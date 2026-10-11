/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import Utils from "@support/utils";

describe("Gateway Policies", () => {

    const { carbonUsername, carbonPassword } = Utils.getUserInfo();
    // Per-attempt unique name so a leftover mapping doesn't hold the only
    // gateway and leave the next run's deploy dropdown empty.
    let policyName;

    // beforeEach (not before) so login re-runs on every retry attempt; Cypress
    // clears cookies between attempts and a before hook would not re-run.
    beforeEach(function () {
        policyName = `${Utils.generateName()}-${Utils.generateRandomNumber()}`;
        cy.loginToPublisher(carbonUsername, carbonPassword);
        // Purge all mappings so the "Default" gateway is free even from orphans
        // of a previous run, keeping the deploy dropdown populated.
        Utils.purgeGatewayPolicies();
    })

    afterEach(() => {
        Utils.purgeGatewayPolicies(policyName);
    })

    it("Global Policy Operations", () => {
        // Add policy mapping
        cy.visit(`publisher/global-policies/create`, { timeout: Cypress.env('largeTimeout') });
        // largeTimeout: the create page is a lazy bundle that can mount after
        // cy.visit() resolves, past the default 4s window on LAN-IP transport.
        cy.get('#outlined-required', { timeout: Cypress.env('largeTimeout') }).click();
        cy.get('#outlined-required').type(policyName);
        cy.get('#outlined-multiline-static').click();
        cy.get('#outlined-multiline-static').type(`${policyName} description`);
        cy.get('#request-tab').click();
        const dataTransfer = new DataTransfer();
        cy.contains('Add Header', { timeout: Cypress.env('largeTimeout') }).trigger('dragstart', {
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
        cy.get('[data-testid=policy-mapping-save-or-update-button]')
            .should('be.visible')
            .scrollIntoView()
            .click();
        cy.wait(2000);

        // deploy policy mapping to a gateway
        cy.intercept('GET', '**/v4/gateway-policies?offset=0').as('policyList');
        cy.visit(`publisher/global-policies`, { timeout: Cypress.env('largeTimeout') });
        // Wait for the list fetch so the table renders from fresh server state,
        // avoiding a deploy click before the post-save reconcile settles.
        cy.wait('@policyList', { timeout: Cypress.env('largeTimeout') });
        cy.get('td button') // Get all buttons within <td> elements
            .first() // Select the first button found
            .click();
        cy.get('#multi-select').should('exist').should('be.visible');
        cy.get('#multi-select').click();
        // Scope to the dropdown popup so a bare cy.contains('Default') can't
        // match a "Default" chip already rendered in a table row.
        cy.get('[role=listbox]').contains('Default').click();
        // Assert genuinely enabled before clicking, riding out the brief
        // disabled flicker. No {force:true} so a disabled state fails fast.
        cy.get('[data-testid=policy-mapping-deploy-button]')
            .should('not.have.class', 'Mui-disabled')
            .should('be.enabled')
            .click();
        cy.get('[data-testid=deploy-to-gateway-button]', { timeout: Cypress.env('largeTimeout') }).click();

        // update policy mapping
        cy.visit(`publisher/global-policies`, { timeout: Cypress.env('largeTimeout') });
        cy.get('[data-testid=policy-mapping-edit-button]').click({force : true});
        cy.wait(10000);
        cy.get('[data-testid=drop-policy-zone-request]').within(() => {
            cy.contains('div', 'AH').click();
        });
        cy.get('#headerValue', { timeout: Cypress.env('largeTimeout') }).click();
        cy.get('[data-testid=policy-attached-details-save]').should('be.disabled');
        const newText = 'RequestHeaderValueNew';
        cy.get('#headerValue').clear().type(newText).should('have.value', newText);
        cy.get('[data-testid=policy-attached-details-save]').should('not.be.disabled');
        cy.get('[data-testid=policy-attached-details-save]').click();
        cy.get('[data-testid=policy-mapping-save-or-update-button]')
            .should('be.visible')
            .scrollIntoView()
            .click();
        cy.wait(2000);
        cy.visit(`publisher/global-policies`, { timeout: Cypress.env('largeTimeout') });
        cy.get('[data-testid=policy-mapping-edit-button]').click({force : true});
        cy.wait(10000);
        cy.get('[data-testid=drop-policy-zone-request]').within(() => {
            cy.contains('div', 'AH').click();
        });
        cy.get('#headerValue', { timeout: Cypress.env('largeTimeout') }).click();
        cy.get('#headerValue').should('have.value', newText);


        // undeploy policy mapping
        cy.visit(`publisher/global-policies`, { timeout: Cypress.env('largeTimeout') });
        const gateway = 'Default';
        cy.get(`#gateway-chip-${gateway} svg[class*=MuiChip-deleteIcon]`)
            .should('be.visible')
            .click();
        cy.get('[data-testid=undeploy-from-gateway-button]', { timeout: Cypress.env('largeTimeout') })
            .should('be.visible')
            .click();
        cy.contains('Policy undeployed successfully').should('be.visible');

        //Successful deletion of policy mapping
        cy.visit(`publisher/global-policies`, { timeout: Cypress.env('largeTimeout') });
        cy.get('[data-testid=policy-mapping-delete-button]').click();
        cy.get('[data-testid=policy-mapping-delete-confirmation-button]', { timeout: Cypress.env('largeTimeout') }).click();
        cy.contains('Policy deleted successfully').should('be.visible');
        cy.visit(`publisher/global-policies`, { timeout: Cypress.env('largeTimeout') });
        cy.contains(policyName).should('not.exist');

        cy.logoutFromPublisher();
    });
})
