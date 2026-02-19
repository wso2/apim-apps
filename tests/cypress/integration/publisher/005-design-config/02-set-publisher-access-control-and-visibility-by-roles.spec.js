/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

describe("Set publisher access control and visibility by roles", () => {
    const { publisher, password, } = Utils.getUserInfo();
    const apiName = Utils.generateName();
    const apiVersion = '1.0.0';

    before(function () {
        cy.loginToPublisher(publisher, password);
    })

    it("Set role based API Store visibility and access control for the api", () => {
        const role = 'internal/everyone';
        Utils.addAPI({ name: apiName, version: apiVersion }).then((apiId) => {
            cy.visit(`/publisher/apis/${apiId}/overview`);
            cy.get('#itest-api-details-portal-config-acc').click();
            cy.get('#left-menu-itemDesignConfigurations').click();

            // Select the restricted by role option for access control
            cy.get('#accessControl-selector').click();
            cy.get('#access-control-restricted-by-roles').click();

            // fill the chip input and press enter
            cy.get('[data-testid="access-control-select-role"]').type(`${role}{enter}`);

            // Select the restricted by role option for devportal visibility
            cy.get('#storeVisibility-selector').scrollIntoView().click();
            cy.get('#visibility-restricted-by-roles').scrollIntoView().click();

            // fill the chip input and press enter
            cy.get('[data-testid="visibility-select-role"]').type(`${role}{enter}`);

            cy.get('#design-config-save-btn').scrollIntoView().click();
            cy.get('#design-config-save-btn').then(function () {
                cy.get('div[data-testid="access-control-select-role"] span').contains(role).should('exist');
                cy.get('div[data-testid="visibility-select-role"] span').contains(role).should('exist');
            });
            // Test is done. Now delete the api
            Utils.deleteAPI(apiId);
        });
    });

    describe("Admin user access control validation", () => {
        const { carbonUsername, carbonPassword } = Utils.getUserInfo();
        const adminApiName = Utils.generateName();
        const adminApiVersion = '1.0.0';

        before(function () {
            // Login as admin user who has apim:admin permission
            cy.loginToPublisher(carbonUsername, carbonPassword);
        });

        it("Admin user should bypass user role validation when setting access control", () => {
            const systemRole = 'Internal/system'; // This is a system role, not a user role

            Utils.addAPI({ name: adminApiName, version: adminApiVersion }).then((apiId) => {
                cy.visit(`/publisher/apis/${apiId}/overview`);
                cy.get('#itest-api-details-portal-config-acc').click();
                cy.get('#left-menu-itemDesignConfigurations').click();

                // Select the restricted by role option for access control
                cy.get('#accessControl-selector').click();
                cy.get('#access-control-restricted-by-roles').click();

                // Add a system role that would normally trigger user role validation error for non-admin users
                cy.get('[data-testid="access-control-select-role"]').type(`${systemRole}{enter}`);

                // Verify no validation error appears for admin users
                cy.get('[data-testid="access-control-select-role"]').should('not.contain', 'At least one role must be associated with the API creator');
                cy.get('[data-testid="access-control-select-role"]').should('not.have.class', 'Mui-error');

                // Verify save button is enabled (not disabled due to validation errors)
                cy.get('#design-config-save-btn').should('not.be.disabled');

                // Save the configuration successfully
                cy.get('#design-config-save-btn').scrollIntoView().click();
                
                // Verify the configuration was saved without errors
                cy.get('div[data-testid="access-control-select-role"] span').contains(systemRole).should('exist');

                // Test is done. Now delete the api
                Utils.deleteAPI(apiId);
            });
        });
    });

    describe("Non-admin user access control validation", () => {
        const { publisher, password } = Utils.getUserInfo();
        const nonAdminApiName = Utils.generateName();
        const nonAdminApiVersion = '1.0.0';

        before(function () {
            // Login as non-admin user (regular publisher)
            cy.loginToPublisher(publisher, password);
        });

        it("Non-admin user should still see user role validation when configuring system-only roles", () => {
            const systemRole = 'internal/subscriber'; // This is a system role, not a user role

            Utils.addAPI({ name: nonAdminApiName, version: nonAdminApiVersion }).then((apiId) => {
                cy.visit(`/publisher/apis/${apiId}/overview`);
                cy.get('#itest-api-details-portal-config-acc').click();
                cy.get('#left-menu-itemDesignConfigurations').click();

                // Select the restricted by role option for access control
                cy.get('#accessControl-selector').click();
                cy.get('#access-control-restricted-by-roles').click();

                // Add a system role that should trigger user role validation error for non-admin users
                cy.get('[data-testid="access-control-select-role"]').type(`${systemRole}{enter}`);

                // Wait for validation to complete
                cy.wait(1000);

                // Verify validation error appears for non-admin users
                // Note: The exact error message and selectors may need adjustment based on actual implementation
                cy.get('[data-testid="access-control-select-role"]').then(($element) => {
                    // Check if error state is present (either through error class or error message)
                    const hasErrorClass = $element.hasClass('Mui-error') || $element.find('.Mui-error').length > 0;
                    const hasErrorMessage = $element.text().includes('At least one role must be associated with the API creator');

                    // For non-admin users, either error styling or validation message should be present
                    expect(hasErrorClass || hasErrorMessage).to.be.true;
                });

                // Test is done. Now delete the api
                Utils.deleteAPI(apiId);
            });
        });
    });
});