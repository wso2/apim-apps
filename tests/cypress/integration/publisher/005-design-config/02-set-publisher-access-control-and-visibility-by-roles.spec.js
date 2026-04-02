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

const USER_ROLE_ACCESS_VALIDATION_MSG = 'At least one role must be associated with the API creator';

describe("Set publisher access control and visibility by roles", () => {
    const { publisher, password, } = Utils.getUserInfo();
    const apiName = Utils.generateName();
    const apiVersion = '1.0.0';

    let rootManagedApiId;

    afterEach(() => {
        if (rootManagedApiId) {
            const id = rootManagedApiId;
            rootManagedApiId = undefined;
            return Utils.deleteAPI(id);
        }
    });

    before(function () {
        cy.loginToPublisher(publisher, password);
    })

    it("Set role based API Store visibility and access control for the api", () => {
        const role = 'internal/everyone';
        Utils.addAPI({ name: apiName, version: apiVersion }).then((apiId) => {
            rootManagedApiId = apiId;
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
        });
    });

    describe("Admin user access control validation", () => {
        const { carbonUsername, carbonPassword } = Utils.getUserInfo();
        const adminApiName = Utils.generateName();
        const adminApiVersion = '1.0.0';

        let adminApiId;

        afterEach(() => {
            if (adminApiId) {
                const id = adminApiId;
                adminApiId = undefined;
                return Utils.deleteAPI(id);
            }
        });

        before(function () {
            cy.clearCookies();
            cy.clearLocalStorage();
            // Login as admin user who has apim:admin permission
            cy.loginToPublisher(carbonUsername, carbonPassword);
        });

        it("Admin user should bypass user role validation when setting access control", () => {
            const systemRole = 'Internal/system'; // This is a system role, not a user role

            Utils.addAPI({ name: adminApiName, version: adminApiVersion }).then((apiId) => {
                adminApiId = apiId;
                cy.visit(`/publisher/apis/${apiId}/overview`);
                cy.get('#itest-api-details-portal-config-acc').click();
                cy.get('#left-menu-itemDesignConfigurations').click();

                // Select the restricted by role option for access control
                cy.get('#accessControl-selector').click();
                cy.get('#access-control-restricted-by-roles').click();

                // Add a system role that would normally trigger user role validation error for non-admin users
                cy.get('[data-testid="access-control-select-role"]').type(`${systemRole}{enter}`);

                // Verify no validation error (ChipInput renders helper text under FormControl, not on the input)
                cy.get('[data-testid="access-control-select-role"]')
                    .find('.MuiFormHelperText-root.Mui-error')
                    .should('not.exist');
                cy.get('[data-testid="access-control-select-role"]').should('not.contain', USER_ROLE_ACCESS_VALIDATION_MSG);

                // Verify save button is enabled (not disabled due to validation errors)
                cy.get('#design-config-save-btn').should('not.be.disabled');

                // Save the configuration successfully
                cy.get('#design-config-save-btn').scrollIntoView().click();
                cy.get('#design-config-save-btn', { timeout: 30000 }).should('not.be.disabled');
                cy.get('#design-config-save-btn .MuiCircularProgress-root').should('not.exist');

                // Verify the configuration was saved without errors
                cy.get('div[data-testid="access-control-select-role"] span').contains(systemRole).should('exist');
            });
        });
    });

    describe("Non-admin user access control validation", () => {
        const { publisher, password } = Utils.getUserInfo();
        const nonAdminApiName = Utils.generateName();
        const nonAdminApiVersion = '1.0.0';

        let nonAdminApiId;

        afterEach(() => {
            if (nonAdminApiId) {
                const id = nonAdminApiId;
                nonAdminApiId = undefined;
                return Utils.deleteAPI(id);
            }
        });

        before(function () {
            cy.clearCookies();
            cy.clearLocalStorage();
            // Login as non-admin user (regular publisher)
            cy.loginToPublisher(publisher, password);
        });

        it("Non-admin user should still see user role validation when configuring system-only roles", () => {
            // WSO2 default role casing; treated as a valid system role but fails creator user-role association for non-admins
            const systemRole = 'Internal/subscriber';

            Utils.addAPI({ name: nonAdminApiName, version: nonAdminApiVersion }).then((apiId) => {
                nonAdminApiId = apiId;
                cy.visit(`/publisher/apis/${apiId}/overview`);
                cy.get('#itest-api-details-portal-config-acc').click();
                cy.get('#left-menu-itemDesignConfigurations').click();

                // Select the restricted by role option for access control
                cy.get('#accessControl-selector').click();
                cy.get('#access-control-restricted-by-roles').click();

                // Add a role that should trigger user role validation error for non-admin users
                cy.get('[data-testid="access-control-select-role"]').type(`${systemRole}{enter}`);

                cy.get('[data-testid="access-control-select-role"]')
                    .find('.MuiFormHelperText-root')
                    .should('have.class', 'Mui-error')
                    .and('contain.text', USER_ROLE_ACCESS_VALIDATION_MSG);

                cy.get('#design-config-save-btn').should('be.disabled');
            });
        });
    });
});