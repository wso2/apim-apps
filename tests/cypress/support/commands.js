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
import 'cypress-file-upload';

Cypress.Commands.add('carbonLogin', (username, password) => {
    Cypress.log({
        name: 'carbonLogin',
        message: `${username} | ${password}`,
    })

    cy.visit(`${Utils.getAppOrigin()}/carbon/admin/login.jsp`);
    cy.get('#txtUserName').type(username);
    cy.get('#txtPassword').type(password);
    cy.get('form').submit();
})

Cypress.Commands.add('carbonLogout', () => {
    cy.get('[href="../admin/logout_action.jsp"]').click();
})

Cypress.Commands.add('portalLogin', (username, password, portal) => {
    Cypress.log({
        name: 'portalLogin',
        message: `${username} | ${password}`,
    })

    cy.visit(`${Utils.getAppOrigin()}/${portal}`);
    if (portal === 'devportal') {
        cy.visit(`${Utils.getAppOrigin()}/devportal/apis?tenant=carbon.super`);
        cy.get('#itest-devportal-sign-in').click();
    }
    cy.url().should('contains', `${Utils.getAppOrigin()}/authenticationendpoint/login.do`);
    cy.get('[data-testid=login-page-username-input]').click();
    cy.get('[data-testid=login-page-username-input]').type(username);
    cy.get('[data-testid=login-page-password-input]').type(password);
    cy.get('#loginForm').submit();
    cy.url().should('contains', `${Utils.getAppOrigin()}/${portal}`);
})

Cypress.Commands.add('loginToPublisher', (username, password) => {
    cy.portalLogin(username, password, 'publisher');
})

Cypress.Commands.add('loginToDevportal', (username, password) => {
    cy.portalLogin(username, password, 'devportal');
})

Cypress.Commands.add('loginToAdmin', (username, password) => {
    cy.portalLogin(username, password, 'admin');
})

Cypress.Commands.add('addNewTenant', (tenant = 'wso2.com', username = 'admin', password = 'admin') => {
    cy.visit(`${Utils.getAppOrigin()}/carbon/tenant-mgt/add_tenant.jsp?region=region1&item=govern_add_tenants_menu`);
    cy.get('#buttonRow .button');
    cy.get('#domain').click();
    cy.get('#domain').type(tenant);
    cy.get('#admin-firstname').click();
    cy.get('#admin-firstname').type(username);
    cy.get('#admin-lastname').click();
    cy.get('#admin-lastname').type(username);
    cy.get('#admin').click();
    cy.get('#admin').type(username);

    // There is a UI error in the carbon console. We need to skip this so that the test will not fail.
    Cypress.on('uncaught:exception', (err, runnable) => {
        // returning false here prevents Cypress from
        // failing the test
        return false
    });
    cy.get('#admin-password').click();
    cy.get('#admin-password').type(password);
    cy.get('#admin-password-repeat').click();
    cy.get('#admin-password-repeat').type(password);
    cy.get('#admin-email').click();
    cy.get('#admin-email').type(`admin@${tenant}`);
    cy.get('#buttonRow .button').click();
})

Cypress.Commands.add('addNewUser', (name = 'newuser', roles = [], password = 'test123') => {
    // Visit the add user page
    cy.visit(`${Utils.getAppOrigin()}/carbon/user/add-step1.jsp`);
    cy.get('input[name="username"]').type(name);
    cy.get('#password').type(password);
    cy.get('#password-repeat').type(password);
    cy.get('.buttonRow input:first-child').click();

    // Go to step 2 where add roles
    cy.url().should('contains', `${Utils.getAppOrigin()}/carbon/user/add-step2.jsp`);
    roles.forEach(role => {
        cy.get(`input[value="${role}"][type="checkbox"]`).check();
    });
    // Finish wizard
    cy.get('.buttonRow input:first-child').click();
    // cy.get('#messagebox-info p').contains(`User PRIMARY/${name} is added successfully.`).should('exist');
})

Cypress.Commands.add('addNewTenantUser', (
    tenantUser,
    password = 'test123',
    tenantRoles = ['Internal/publisher', 'Internal/creator', 'Internal/everyone'],
    tenant = 'wso2.com',
    tenantAdminUsername = 'admin',
    tenantAdminPassword = 'admin'
) => {
    cy.addNewTenant(tenant, tenantAdminUsername, tenantAdminPassword);
    cy.reload();
    cy.carbonLogout();
    cy.carbonLogin(`${tenantAdminUsername}@${tenant}`, tenantAdminPassword);
    cy.addNewUser(tenantUser, tenantRoles, password);
})

Cypress.Commands.add('deleteUser', (name) => {
    cy.get(`[onClick="deleteUser(\\'${name}\\')"]`).click();
    cy.get('.ui-dialog  .ui-dialog-buttonpane button:first-child').click();

    cy.get('#messagebox-info p').contains(`User ${name} is deleted successfully.`).should('exist');
    cy.get('.ui-dialog-buttonpane button').click();
});

Cypress.Commands.add('deleteApi', (name, version) => {
    cy.visit(`${Utils.getAppOrigin()}/publisher/apis`);
    cy.intercept('**/apis*').as('getApis');
    cy.wait('@getApis', {timeout: 3000}).then(() => {
        cy.get('#itest-id-deleteapi-icon-button', { timeout: 30000 });
        cy.get('#itest-id-deleteapi-icon-button').click();
        cy.get('#itest-id-deleteconf').click();
    });
});

// Don't use this 
// Fails intermittently 
// Instead delete each api after the test is finish.
Cypress.Commands.add('deleteAllApis', () => {
    cy.visit(`${Utils.getAppOrigin()}/publisher/apis`);
    cy.intercept('**/apis*').as('getApis');
    cy.wait('@getApis').then((interception) => {
        if (interception.response && interception.response.body && interception.response.body.count > 0) {
            cy.get('[data-testid="itest-id-deleteapi-icon-button"]', { timeout: 30000 });
            cy.get('[data-testid="itest-id-deleteapi-icon-button"]').each(($btn) => {
                cy.wrap($btn).click();
                cy.get('[data-testid="itest-id-deleteconf"]').click();
            })
        }
    })
});

Cypress.Commands.add('deploySampleAPI', () => {
    cy.visit(`${Utils.getAppOrigin()}/publisher/apis`)
    cy.get('#itest-rest-api-create-menu').click()
    cy.get('#itest-id-deploy-sample').click()
    cy.get('#itest-api-name-version', { timeout: 10000 }).should('be.visible');
    cy.url().should('contains', '/overview');
    cy.get("#itest-api-name-version").contains('PizzaShackAPI');
    cy.intercept('**/apis/**').as('apiGet');
    cy.wait('@apiGet', {timeout: 3000}).then((res) => {
        const apiUUID =  res.response.body.id;
        return { uuid: apiUUID };
    });
})

Cypress.Commands.add('createAnAPI', (name, type = 'REST') => {
    const random_number = Math.floor(Date.now() / 1000);
    const randomName = `0sample_api_${random_number}`;
    cy.visit(`${Utils.getAppOrigin()}/publisher/apis`)
    cy.get('#itest-rest-api-create-menu', { timeout: 30000 });
    cy.get('#itest-rest-api-create-menu').click();
    cy.get('#itest-id-landing-rest-create-default').click()
    cy.get('#itest-id-apiname-input').type(name || randomName);
    cy.get('#itest-id-apicontext-input').click();
    cy.get('#itest-id-apicontext-input').type(`/sample_context_${random_number}`);
    cy.get('#itest-id-apiversion-input').click();
    cy.get('#itest-id-apiversion-input').type(`v${random_number}`);
    cy.get('#itest-id-apiendpoint-input').click();
    cy.get('#itest-id-apiendpoint-input').type(`https://apis.wso2.com/sample${random_number}`);
    cy.get('#itest-create-default-api-button').click();
    cy.get("#itest-api-name-version").contains(`sample_api_${random_number}`);
    cy.intercept('**/apis/**').as('apiGet');
    cy.wait('@apiGet', {timeout: 3000}).then((res) => {
        const apiUUID =  res.response.body.id;
        return { uuid: apiUUID, name: randomName };
    });

})

Cypress.Commands.add('createAPIByRestAPIDesign', (name = null, version = null, context = null) => {
    const random_number = Math.floor(Date.now() / 1000);

    const apiName = name ? name : `0sample_api_${random_number}`;
    const apiVersion = version ? version : `v${random_number}`;
    const apiContext = context ? context : `/sample_context_${random_number}`;
    cy.visit(`${Utils.getAppOrigin()}/publisher/apis`);
    cy.get('#itest-rest-api-create-menu', { timeout: 30000 });
    cy.get('#itest-rest-api-create-menu').click();
    cy.get('#itest-id-landing-rest-create-default').click();
    cy.get('#itest-id-apiname-input').type(apiName);
    cy.get('#itest-id-apicontext-input').click();
    cy.get('#itest-id-apicontext-input').type(apiContext);
    cy.get('#itest-id-apiversion-input').click();
    cy.get('#itest-id-apiversion-input').type(apiVersion);
    cy.get('#itest-id-apiendpoint-input').click();
    cy.get('#itest-id-apiendpoint-input').type(`https://apis.wso2.com/sample${random_number}`);
    cy.get('#itest-create-default-api-button').click();
    // There is a UI error in the console. We need to skip this so that the test will not fail.
    Cypress.on('uncaught:exception', (err, runnable) => {
        // returning false here prevents Cypress from
        // failing the test
        return false
    });
    cy.wait(500);
    cy.visit(`${Utils.getAppOrigin()}/publisher/apis/`,{ timeout: 30000 });
    cy.get(`#${apiName}`).click();

    cy.get('#itest-api-name-version', { timeout: 30000 }).should('be.visible');
    cy.get('#itest-api-name-version').contains(apiVersion);
})

Cypress.Commands.add('createAndPublishAPIByRestAPIDesign', (name = null, version = null, context = null) => {
    const random_number = Math.floor(Date.now() / 1000);

    const apiName = name ? name : `0sample_api_${random_number}`;
    const apiVersion = version ? version : `v${random_number}`;
    const apiContext = context ? context : `/sample_context_${random_number}`;
    cy.get('#itest-rest-api-create-menu', { timeout: 30000 });
    cy.get('#itest-rest-api-create-menu').click();
    cy.get('#itest-id-landing-rest-create-default').click();
    cy.get('#itest-id-apiname-input').type(apiName);
    cy.get('#itest-id-apicontext-input').click();
    cy.get('#itest-id-apicontext-input').type(apiContext);
    cy.get('#itest-id-apiversion-input').click();
    cy.get('#itest-id-apiversion-input').type(apiVersion);
    cy.get('#itest-id-apiendpoint-input').click();
    cy.get('#itest-id-apiendpoint-input').type(`https://apis.wso2.com/sample${random_number}`);
    cy.get('#itest-id-apicreatedefault-createnpublish').click();

    // Wait for the api to load
    cy.get('#itest-api-name-version', { timeout: 30000 }).should('be.visible');
    cy.get('#itest-api-name-version').contains(apiVersion);
})

Cypress.Commands.add('createAPIWithoutEndpoint', (name, type = 'REST') => {
    const random_number = Math.floor(Date.now() / 1000);
    const randomName = `0sample_api_${random_number}`;
    cy.visit(`${Utils.getAppOrigin()}/publisher/apis`)
    cy.get('#itest-rest-api-create-menu', { timeout: 30000 });
    cy.get('#itest-rest-api-create-menu').click();
    cy.get('#itest-id-landing-rest-create-default').click();
    cy.get('#itest-id-apiname-input').type(name || randomName);
    cy.get('#itest-id-apicontext-input').click();
    cy.get('#itest-id-apicontext-input').type(`/sample_context_${random_number}`);
    cy.get('#itest-id-apiversion-input').click();
    cy.get('#itest-id-apiversion-input').type(`v${random_number}`);
    cy.get('#itest-id-apiendpoint-input').click();
    cy.get('#itest-create-default-api-button').click();
    cy.wait(500);
    cy.visit(`${Utils.getAppOrigin()}/publisher/apis/`);
    cy.get(`#sample_api_${random_number}`).click();


    cy.get('#itest-api-name-version', { timeout: 30000 }).should('be.visible');
    cy.get('#itest-api-name-version').contains(`v${random_number}`);
})

Cypress.Commands.add('createApp', (appName, appDescription) => {
    cy.visit(`${Utils.getAppOrigin()}/devportal/applications/create?tenant=carbon.super`);
    // Filling the form
    cy.get('#application-name').click();
    cy.get('#application-name').type(appName);
    cy.get('#application-description').click();
    cy.get('#application-description').type('{backspace}');
    cy.get('#application-description').type(appDescription);
    cy.get('#itest-application-create-save').click();

    // Checking the app name exists in the overview page.
    cy.url().should('contain', '/overview');
    cy.get('#itest-info-bar-application-name').contains(appName).should('exist');
});

Cypress.Commands.add('createAndPublishApi', (apiName = null) => {
    cy.visit(`${Utils.getAppOrigin()}/publisher/apis`);
    // select the option from the menu item
    cy.get('#itest-rest-api-create-menu').click();
    cy.get('#itest-id-landing-upload-oas').click();
    cy.get('#open-api-file-select-radio').click();

    // upload the swagger
    cy.get('#browse-to-upload-btn').then(function () {
        const filepath = 'api_artifacts/swagger_2.0.json'
        cy.get('input[type="file"]').attachFile(filepath)
    });

    // go to the next step
    cy.get('#open-api-create-next-btn').click();

    // Fill the second step form
    if (apiName) {
        const random_number = Math.floor(Date.now() / 1000);

        cy.get('#itest-id-apiname-input').clear().type(apiName);
        cy.get('#itest-id-apicontext-input').click();
        cy.get('#itest-id-apicontext-input').clear().type(`/api_${random_number}`);
        cy.get('#itest-id-apiendpoint-input').click().type('https://petstore.swagger.io');
    }

    cy.get('#open-api-create-btn').click();

    //select subscription tiers
    cy.get('#itest-api-details-portal-config-acc', {timeout: 30000}).click();
    cy.get('#left-menu-itemsubscriptions').click();
    cy.get('[data-testid="policy-checkbox-silver"]').click();
    cy.get('[data-testid="policy-checkbox-unlimited"]').click();
    cy.get('#subscriptions-save-btn').click();

    // deploy
    cy.get('#left-menu-itemdeployments').click();
    cy.get('#left-menu-itemdeployments').then(()=>{
        cy.wait(1000);
        cy.get('#deploy-btn').click();
        cy.get('#undeploy-btn').should('exist');
    })

    // publish
    cy.get('#left-menu-itemlifecycle').click();
    cy.wait(2000);
    cy.get('[data-testid="Publish-btn"]').click();
    cy.get('button[data-testid="Demote to Created-btn"]').should('exist');

})

Cypress.Commands.add('logoutFromDevportal', (referer = '/devportal/apis') => {
    cy.visit(`${Utils.getAppOrigin()}/devportal/apis?tenant=carbon.super`);
    cy.wait(2000);
    cy.get('#userToggleButton').click();
    cy.get('#logout-link').click();
    cy.url().should('contain', '/devportal/logout');
    cy.url().should('contain', referer);
})

Cypress.Commands.add('logoutFromPublisher', () => {
    cy.get('#profile-menu-btn', { timeout: 30000 });
    cy.get('#profile-menu-btn').click();
    cy.get('#itest-logout').click();
    cy.get('#usernameUserInput').should('exist');
})

Cypress.Commands.add('publishThirdPartyApi', (apiName = null) => {

    cy.visit(`${Utils.getAppOrigin()}/publisher/apis`);

    //check if other protocol option is added in AsyncApi
    cy.get('#itest-streaming-api-create-menu', { timeout: 30000 });
    cy.get('#itest-streaming-api-create-menu').click();
    cy.get('#itest-id-create-streaming-api-import').click();
    cy.get('#outlined-full-width').type('https://raw.githubusercontent.com/asyncapi/spec/v2.0.0/examples/2.0.0/streetlights.yml');
    cy.get('#outlined-full-width').should('have.value','https://raw.githubusercontent.com/asyncapi/spec/v2.0.0/examples/2.0.0/streetlights.yml');
    cy.get('button span').contains('Next').should('not.be.disabled');
    cy.get('button span').contains('Next').click();
    cy.get('#mui-component-select-protocol').click();
    cy.get('#other').should('exist');
    cy.visit(`${Utils.getAppOrigin()}/publisher/apis`);

    // select rest-api option from the menu item
    cy.get('#itest-rest-api-create-menu', { timeout: 30000 });
    cy.get('#itest-rest-api-create-menu').click();;
    cy.get('#itest-id-landing-rest-create-default').click();
    cy.get('#itest-id-apiname-input').type('ThirdPartyApi');
    cy.get('#itest-id-apicontext-input').type('/thirdpartyapi');
    cy.get('#itest-id-apiversion-input').type('1.0.0');
    cy.get('#itest-id-apiendpoint-input').type(`${Utils.getAppOrigin()}/am/sample/thirdpartyapi/v1/api`);
    cy.get('#itest-create-default-api-button').click();

    //Mark as third party api
    cy.get('#itest-api-details-portal-config-acc').click();
    cy.get('#left-menu-itemDesignConfigurations').click();
    cy.get('[name="advertised"]:first').click();
    cy.get('[name="apiExternalProductionEndpoint"]').type(`${Utils.getAppOrigin()}/am/sample/thirdpartyapi/v1/externalapi`);
    cy.get('[name="apiExternalSandboxEndpoint"]').type(`${Utils.getAppOrigin()}/am/sample/thirdpartyapi/v1/externalapi`);
    cy.get('[name="originalDevPortalUrl"]').type('http://www.mocky.io/v2/5ec501532f00009700dc2dc1');
    cy.get('#design-config-save-btn').click();
    cy.get('#itest-api-details-portal-config-acc').click();
    //prompt for api-endpoints ???

    // publish
    cy.get('#left-menu-itemlifecycle').click();
    cy.get('[data-testid="Publish-btn"]').should('exist');
    cy.get('[data-testid="Deploy as a Prototype-btn"]').should('exist');
    cy.get('[data-testid="Publish-btn"]').click();

    //check if the api is third-party and published
    cy.get('[data-testid="itest-api-state"]').contains('PUBLISHED').should('exist');
    cy.get('[data-testid="itest-third-party-api-label"]').contains('Third Party').should('exist');

    //Check if the subscriptions,runtime config, resources, scopes, monetization, test console sections are present
    cy.get('#itest-api-details-portal-config-acc').click();
    cy.get('#left-menu-itemsubscriptions').should('exist');
    cy.get('#left-menu-itemsubscriptions').click();
    cy.get('[name="Unlimited"]').click();
    cy.get('#subscriptions-save-btn').click();
    cy.get('#itest-api-details-portal-config-acc').click();
    cy.get('#itest-api-details-api-config-acc').click();
    cy.get('#left-menu-itemRuntimeConfigurations').should('exist');
    cy.get('#left-menu-itemresources').should('exist');
    cy.get('#left-menu-itemLocalScopes').should('exist');
    cy.get('#left-menu-itemMonetization').should('exist');
    cy.get('#itest-api-details-api-config-acc').click();
    cy.get('#left-menu-itemTestConsole').should('exist');

    //Check if the api is not deployable
    cy.get('#left-menu-itemdeployments').click();
    cy.get('[data-testid="third-party-api-deployment-dialog"]').contains('This API is marked as a third party API. The requests are not proxied through the gateway. Hence, deployments are not required.').should('exist');
    cy.get('#deploy-btn').should('be.disabled');

    //Check if prompts when switching to a regular api
    cy.get('#itest-api-details-portal-config-acc').click();
    cy.get('#left-menu-itemDesignConfigurations').click();
    cy.get('[name="advertised"]:last').click();
    cy.get('[data-testid="itest-update-api-confirmation"]').should('exist');

    cy.visit(`${Utils.getAppOrigin()}/publisher/apis`);
    cy.get('[data-testid="itest-api-lifecycleState"] span').contains('PUBLISHED').should('exist');
    cy.get('[data-testid="third-party-api-card-label"]').should('exist');

})

Cypress.Commands.add('viewThirdPartyApi', (apiName = null) => {
    cy.get('[area-label="Go to ThirdPartyApi"]').click();

    //Check if the subscriptions, tryout, comments and SDKs sections are present
    cy.get('#left-menu-credentials').should('exist');
    cy.get('#left-menu-test').should('exist');
    cy.get('#left-menu-comments').should('exist');
    cy.get('#left-menu-sdk').should('exist');

    //Visit Original Developer Portal is not working??? But it is working in the overview
    cy.get('#left-menu-credentials').click();
    cy.get('[data-testid="itest-original-devportal-link"]').should('exist');
    cy.get('[data-testid="itest-no-tier-dialog"]').contains('No tiers are available for the API.').should('exist');

    //Check if authorization header and value can be customized
    cy.get('#left-menu-test').click();
    cy.get('#advAuthHeader').should('exist');
    cy.get('#advAuthHeaderValue').should('exist');

})


