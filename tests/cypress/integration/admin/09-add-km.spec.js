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

describe("Add key manager", () => {
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';

    before(function () {
        cy.loginToAdmin(carbonUsername, carbonPassword);
    })
    it.only("Add key manager", () => {
        const km = 'myAuth0';
        const wellKnowUrl = 'https://my-tenant.us.auth0.com/.well-known/openid-configuration';
        const clientId = 'test';
        const clientSecret = 'test';
        const audience = 'test';
        const introspectionEp = 'https://my-tenant.auth0.com/oauth/token';

        cy.get('[data-testid="Key Managers"]').click();
        cy.get('.MuiButton-label').contains('Add Key Manager').click();
        cy.get('input[name="name"]').type(km);
        cy.get('input[name="displayName"]').type(km);
        cy.get('[data-testid="key-manager-type-select"]').click();
        cy.get('li[data-value="Auth0"]').click();
        cy.get('input[name="wellKnownEndpoint"]').type(wellKnowUrl);
        // importing config'
        cy.intercept('**/key-managers/discover').as('importConfig');
        cy.get('button span.MuiButton-label').contains('Import').click();
        cy.wait('@importConfig');

        // filing the tokens
        cy.get('input[name="introspectionEndpoint"]').clear().type(introspectionEp);
        cy.get('input[name="client_id"]').type(clientId);
        cy.get('input[name="client_secret"]').type(clientSecret);
        cy.get('input[name="audience"]').type(audience);
        cy.get('button.MuiButton-containedPrimary span').contains('Add').click();

        // validating
        cy.get('td > div').contains(km).should('exist');

        // delete
        cy.get(`[data-testid="${km}-actions"] > span:first-child svg`).click();
        cy.get('button > span').contains('Delete').click();
        cy.get('td > div').contains(km).should('not.exist');
    });

})