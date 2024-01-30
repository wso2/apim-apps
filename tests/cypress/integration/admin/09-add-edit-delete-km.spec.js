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

describe("Add key manager", () => {

    const { publisher, developer, password, carbonUsername, carbonPassword, tenant, superTenant } = Utils.getUserInfo();

    const addKeyManager = (usernameLocal, passwordLocal) => {
        cy.loginToAdmin(usernameLocal, passwordLocal);
        const km = 'myAuth0';
        const wellKnowUrl = 'https://my-tenant.us.auth0.com/.well-known/openid-configuration';
        const clientId = 'test';
        const clientSecret = 'test';
        const audience = 'test';
        const introspectionEp = 'https://my-tenant.auth0.com/oauth/token';
        const userInfoEp = 'https://my-tenant.auth0.com/oauth/userInfo';
        const scopeManagementEp = 'https://my-tenant.auth0.com/oauth/scope';
        const claimKey1 = 'claimKey1';
        const claimValueRegex1 = 'claimValueRegex1';
        const claimKey2 = 'claimKey2';
        const claimValueRegex2 = 'claimValueRegex2';
        const apiVersion = '2.0.0';
        const apiName = Utils.generateName();
        const apiContext = apiName;
        let testApiId;
        const appName = Utils.generateName();
        const appDescription = 'app description';

        cy.get('[data-testid="Key Managers"]').click();
        cy.get('[data-testid="add-key-manager-button"]').contains('Add Key Manager').click();
        cy.get('input[name="name"]').type(km);
        cy.get('input[name="displayName"]').type(km);
        cy.get('[data-testid="key-manager-type-select"]').click();
        cy.get('li[data-value="Auth0"]').click();
        cy.get('input[name="wellKnownEndpoint"]').type(wellKnowUrl);
        // importing config'
        cy.intercept('**/key-managers/discover').as('importConfig');
        cy.get('#import-button').contains('Import').click();
        cy.wait('@importConfig', { timeout: 3000 }).then(() => {
            // filing the tokens
            cy.get('input[name="introspectionEndpoint"]').clear().type(introspectionEp);
            cy.get('input[name="userInfoEndpoint"]').clear().type(userInfoEp);
            cy.get('input[name="scopeManagementEndpoint"]').clear().type(scopeManagementEp);
            cy.get('input[name="client_id"]').type(clientId);
            cy.get('input[name="client_secret"]').type(clientSecret);
            cy.get('input[name="audience"]').type(audience);
            // adding permissions
            cy.get('input[name="KeyManagerPermissions"]').should('not.exist')
            cy.get('[data-testid="key-manager-permission-select"]').click();
            cy.get('li[data-value="ALLOW"]').click();
            cy.get('[data-testid="key-manager-permission-roles"]').should('exist');
            cy.get('[data-testid="key-manager-permission-roles"]')
                .type('Internal/subscriber')
                .type('{downarrow}')
                .type('{enter}');;
            // adding claims under Token Handling Options for JWT type
            cy.get('#mui-component-select-type').click();
            cy.contains('li', 'JWT').click();
            cy.get('input[name="claimKey"]').type(claimKey1);
            cy.get('input[name="claimValueRegex"]').type(claimValueRegex1);
            cy.get('[aria-label="[object Object]"]').click();
            cy.get('input[name="claimKey"]').type(claimKey2);
            cy.get('input[name="claimValueRegex"]').type(claimValueRegex2);
            cy.get('[aria-label="[object Object]"]').click();
            // validating added claims
            cy.contains(claimKey1).should('exist');
            cy.contains(claimValueRegex1).should('exist');
            cy.contains(claimKey2).should('exist');
            cy.contains(claimValueRegex2).should('exist');
            cy.get('#keymanager-add').contains('Add').click();
            cy.wait(1000);

            // validating
            cy.get('td > div').contains(km).should('exist');
        });

        // edit key manager
        cy.get('td > div').contains(km).click();
        // editing claims under Token Handling Options for JWT type (adding one more claim and deleting one claim)
        cy.get('input[name="claimKey"]').type('claimKey3');
        cy.get('input[name="claimValueRegex"]').type('claimValueRegex3');
        cy.get('[aria-label="[object Object]"]').click();
        // deleting claimKey1
        cy.contains(claimKey1).parents('tr').find('button').click();
        cy.contains(claimKey1).should('not.exist');
        // editing permissions
        cy.get('[data-testid="key-manager-permission-select"]').should('include.text','Allow for role(s)');
        cy.get('[data-testid="key-manager-permission-roles"]').should('exist')
        cy.get('[data-testid="key-manager-permission-select"]').click();
        cy.get('li[data-value="DENY"]').click();
        cy.get('[data-testid="key-manager-permission-roles"]').should('exist');
        cy.get('[data-testid="Internal/subscriber"]').should('exist');

        cy.get('#keymanager-add').contains('Update').click();
        cy.logoutFromAdminPortal();


        //Check if the key manager is visible in developer portal
        cy.loginToPublisher(publisher, password);

        Utils.addAPIWithEndpoints({ name: apiName, version: apiVersion, context: apiContext }).then((apiId) => {
            cy.log("API created " + apiName);
            testApiId = apiId;
            Utils.publishAPI(apiId).then((result) => {
                cy.log("API published " + result)
                cy.logoutFromPublisher();
                cy.loginToDevportal(developer, password);
                cy.createApp(appName, appDescription);
                cy.visit(`/devportal/apis?tenant=carbon.super`);
                cy.url().should('contain', '/apis?tenant=carbon.super');
                cy.visit(`/devportal/apis/${apiId}/overview?tenant=carbon.super`);
                cy.get('#left-menu-credentials').click();

                // Click and select the new application
                cy.get('#application-subscribe').click();
                cy.get(`.MuiAutocomplete-popper li`).contains(appName).click();
                cy.get(`#subscribe-to-api-btn`).click();
                cy.get(`#subscription-table td`).contains(appName).should('exist');
                cy.get(`#${appName}-SB`).click();
                cy.get(`#${km}`).should('not.exist');
                cy.get(`#${appName}-PK`).click();
                cy.get(`#${km}`).should('not.exist');

                cy.visit(`/devportal/applications?tenant=carbon.super`);
                cy.get(`#itest-application-list-table td a`, {timeout: Cypress.config().largeTimeout}).contains(appName).click();
                cy.get('#production-keys').click();
                cy.get(`#${km}`).should('not.exist');
                cy.get('#sandbox-keys').click();
                cy.get(`#${km}`).should('not.exist');
            });
        });
        cy.logoutFromDevportal();

        // delete
        cy.loginToAdmin(usernameLocal, passwordLocal);
        cy.visit(`/admin/settings/key-managers/`);
        cy.get(`[data-testid="${km}-actions"] > span:first-child svg`).click();
        cy.get('[data-testid="form-dialog-base-save-btn"]').contains('Delete').click();
        cy.get('td > div').contains(km).should('not.exist');
    }
    it.only("Add key manager - super admin", () => {
        addKeyManager(carbonUsername, carbonPassword);
    });
    it.only("Add key manager - tenant user", () => {
        addKeyManager(Utils.getTenantUser(carbonUsername, tenant), carbonPassword);
    });
})
