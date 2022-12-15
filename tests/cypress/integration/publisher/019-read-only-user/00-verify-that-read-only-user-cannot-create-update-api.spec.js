/*
 * Copyright (c) 2022, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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
import APIMenuPage from "../../../support/pages/publisher/APIMenuPage";
import UsersAndRoles from "../../../support/functions/carbon/UsersAndRoles";

describe("publisher-019-00 : Verify that read only user cannot create updte api", () => {
    let apiName;
    const apiVersion = '1.0.0';
    let apiContext;
    const readOnlyUser = 'internalDeveloper';
    const readOnlyUserPassword = 'test123';
    const creatorPublisher='creatorPublisher';
    const creatorpublisherPassword = 'test123';
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';

    const initEnvironement = () => {
      //create developer user
        cy.carbonLogin(carbonUsername, carbonPassword);
        //cy.addNewUser(readOnlyUser, ['Internal/observer'], readOnlyUserPassword);
        //cy.addNewUser(creatorPublisher,  ['Internal/publisher', 'Internal/creator', 'Internal/everyone'], creatorpublisherPassword);

        UsersAndRoles.addNewUserAndUpdateRoles(readOnlyUser, ['Internal/observer'], readOnlyUserPassword);
        UsersAndRoles.addNewUserAndUpdateRoles(creatorPublisher,  ['Internal/publisher', 'Internal/creator'], creatorpublisherPassword);

        //create an API from publisher portal
        apiName = 'checkreadonlyapi' + Utils.generateRandomNumber();
        apiContext = '/readonlycheck' + Utils.generateRandomNumber();
        cy.loginToPublisher(creatorPublisher, creatorpublisherPassword);
        cy.createAndPublishAPIByRestAPIDesign(apiName,apiVersion,apiContext);

        cy.get('#itest-api-details-portal-config-acc').click();

        //add business info
        cy.get('#left-menu-itembusinessinfo').click();
        cy.addBusinessInfo("John Yen","john@abc.com","Ann Ross","ann@abc.com");

        //add document
        cy.get('#left-menu-itemdocuments').click();
        cy.addDocument("SampleDoc","API Documentation","Sample and SDK","Markdown");

        //add comment
        cy.get('#left-menu-itemcomments').click();
        cy.addComment("sample comment");

        //colapse api config menu
        cy.get('#itest-api-details-portal-config-acc').click();

        cy.get('#itest-api-details-api-config-acc').click();
        //set local scope
        cy.get('#left-menu-itemLocalScopes').click();
        cy.get('#create-scope-btn').click();
        cy.createLocalScope('creatorscope','creator scope',"sample description",['Internal/creator']);
    
        //set resources
        cy.get('#left-menu-itemresources').click();
        cy.createResource('api','20KPerMin',"POST",'testuri','sampledesc','sample summary',false,'creatorscope','tname','Query','Number',true);

        //set policy
        cy.location('pathname').then((pathName) => {
            const pathSegments = pathName.split('/');
            const uuid = pathSegments[pathSegments.length - 2];
            cy.visit(`${Utils.getAppOrigin()}/publisher/apis/${uuid}/policies`);

            const dataTransfer = new DataTransfer();
            cy.contains('Add Header', {timeout: Cypress.config().largeTimeout}).trigger('dragstart',{
                dataTransfer
            });
            cy.contains('Drag and drop policies here').trigger('drop', {
                dataTransfer
            });
            cy.get('#headerName').type('Testing');
            cy.get('#headerValue').type('abc');
            cy.get('[data-testid="policy-attached-details-save"]').click();
            cy.get('[data-testid="custom-select-save-button"]').scrollIntoView().click();
            APIMenuPage.waitUntillLoadingComponentsExit()

            //add property
            //cy.visit(`${Utils.getAppOrigin()}/publisher/apis/${uuid}/properties`);
            APIMenuPage.getAPIConfigurationsMenu_Properties().click({force: true})
            APIMenuPage.waitUntillLoadingComponentsExit()
            cy.addProperty("property1","value1",true);
        });
        cy.logoutFromPublisher();

        //login to dev portal as Developer
        cy.loginToPublisher(readOnlyUser, readOnlyUserPassword);
    }

    //should only be able to view APIs
    it("Verify Configurations are in Read only mode", {
        retries: {
            runMode: 3,
            openMode: 0,
        },
    }, () => {
        initEnvironement();
        //1. should not be able to create APIS
        cy.get('#itest-create-api-menu-button', {timeout: Cypress.config().largeTimeout}).should('not.exist');

        //2. click on API tile and select design config (basic info)
        cy.wait(2000);
        cy.get('#searchQuery').click().type(apiName + "{enter}");
        cy.get('a').get(`[aria-label="${apiName} Thumbnail"]`, {timeout: Cypress.config().largeTimeout}).click();
        cy.get('#itest-api-details-portal-config-acc').click();
        cy.get('#left-menu-itemDesignConfigurations').click();

        //2 -a. should not be able to update thumbnail
        cy.get('#edit-api-thumbnail-btn').click();
        cy.get('#itest-api-name-version', {timeout: Cypress.config().largeTimeout}).should('be.visible');
        cy.get('#itest-api-name-version').contains(apiVersion);
        
        //2 -b. rest of the form field should not be editable
        cy.get('#left-menu-itemDesignConfigurations').click();
        cy.get('#accessControl-selector').get('[aria-disabled="true"]').should('exist');
        cy.get('#storeVisibility-selector').get('[aria-disabled="true"]').should('exist');
        cy.get('#tags').should('be.disabled');
        cy.get('#APICategories').get('[aria-disabled="true"]').should('exist');
        cy.get('#github').should('not.be.visible');
        cy.get('#slack').should('not.be.visible');
        cy.get('input').get('[name="advertised"]').get('[value="true"').should('be.disabled');
        cy.get('input').get('[name="advertised"]').get('[value="false"]').should('be.disabled');
        cy.get('input').get('[name="defaultVersion"]').get('[value="true"').should('be.disabled');
        cy.get('input').get('[name="defaultVersion"]').get('[value="false"]').should('be.disabled');
        cy.get('#design-config-save-btn').should('be.disabled');

        //3. should not be able to update business information
        cy.get('#left-menu-itembusinessinfo').click();
        cy.get('#name').should('be.disabled');
        cy.get('#Email').should('be.disabled');
        cy.get('#TOname').should('be.disabled');
        cy.get('#TOemail').should('be.disabled');
        cy.get('#business-info-save').should('be.disabled');

        //4. should not be able to update subscriptions (if no any subscriptions yet)
        cy.get('#left-menu-itemsubscriptions').click();
        cy.get('input').get('[name="Bronze"]').should('be.disabled');
        cy.get('input').get('[name="Gold"]').should('be.disabled');
        cy.get('input').get('[name="Silver"]').should('be.disabled');
        cy.get('input').get('[name="Unlimited"]').should('be.disabled');
        cy.get('#subscriptions-save-btn').should('be.disabled');

        //5. should not be able to add documents
        cy.get('#left-menu-itemdocuments').click();
        cy.get('[data-testid="add-document-btn"]',{timeout: Cypress.config().largeTimeout}).get('[aria-disabled="true"]').should('exist');        

        //6. should not be able to comments
        cy.get('#left-menu-itemcomments').click();
        cy.get('#standard-multiline-flexible',{timeout: Cypress.config().largeTimeout}).should('be.disabled');
        cy.contains('button','Reply').click();
        cy.get('#standard-multiline-flexible',{timeout: Cypress.config().largeTimeout}).should('be.disabled');

        //7. Runtime Configurations
        cy.get('#itest-api-details-api-config-acc').click();
        cy.get('#left-menu-itemRuntimeConfigurations').click();

        //7-a. transport level
        cy.get('#transportLevel').click();
        cy.get('#http-transport').should('be.disabled');
        cy.get('[value="https"]').should('be.disabled');
        cy.get('#mutual-ssl-checkbox').should('be.disabled');

        //7-b. application level
        cy.get('#applicationLevel').children('[role="button"]').click();
        cy.get('[value="oauth2"]').should('be.disabled');
        cy.get('#api-security-basic-auth-checkbox').should('be.disabled');
        cy.get('#api-security-api-key-checkbox').should('be.disabled');
        cy.get('[name="oauth_basic_auth_api_key_mandatory"]').should('be.disabled');
        cy.get('[name="oauth_basic_auth_api_key_mandatory"]').should('be.disabled');

        //7-c. key manager configuration
        cy.get('[value="all"]').should('be.disabled');
        cy.get('[value="selected"]').should('be.disabled');
        cy.get('#itest-id-headerName-input').should('be.disabled');

        //7-d. cors configuration
        cy.get('#corsConfiguration').get('[aria-label="CORS Configuration"]').should('be.disabled');
        cy.get('#corsConfiguration').get('[aria-label="switch Schema Validation"]').should('be.disabled');

        //7-e. Response caching
        cy.get('#response-caching-switch').should('be.disabled');

        //7-f. Backend configurations
        cy.get('[value="unlimited"]').should('be.disabled');
        cy.get('[value="specify"]').should('be.disabled');

        //8. Resources
        cy.get('#left-menu-itemresources').click();
        cy.get('#api-rate-limiting-api-level').get('[aria-disabled="true"]').should('exist');
        cy.get('#api-rate-limiting-operation-level').get('[aria-disabled="true"]').should('exist');
        cy.get('#operation_throttling_policy').get('[aria-disabled="true"]').should('exist');
        cy.reload();
        cy.get('footer').scrollIntoView();
        cy.wait(3000);
        // const uriId='post\/testuri';
        // cy.get(`[id="${uriId}"]`).click();
        // cy.get(`[data-testid="description-${uriId}"]`).get('[aria-disabled="true"]').should('exist');
        // cy.get(`[data-testid="summary-${uriId}"]`).get('[aria-disabled="true"]').should('exist');
        // cy.get(`[data-testid="security-${uriId}"]`).get('[aria-disabled="true"]').should('exist');
        // cy.get(`[id="${uriId}-operation_throttling_policy-label"]`).get('[aria-disabled="true"]').should('exist');
        cy.contains('button','Save').should('be.disabled');

        //9. API definition
        cy.get('#left-menu-itemAPIdefinition').click();
        cy.contains('button', 'Edit').should('be.disabled');
        cy.contains('button', 'Import Definition').should('be.disabled');

        //10. Endpoints
        cy.get('#left-menu-itemendpoints').click();
        cy.contains('label', 'HTTP/REST Endpoint').get('[aria-disabled="true"]').should('exist');
        cy.contains('label', 'Service Endpoint').get('[aria-disabled="true"]').should('exist');
        cy.contains('label', 'HTTP/SOAP Endpoint').get('[aria-disabled="true"]').should('exist');
        cy.contains('label', 'Dynamic Endpoints').get('[aria-disabled="true"]').should('exist');
        cy.contains('label', 'Mock Implementation').get('[aria-disabled="true"]').should('exist');
        cy.contains('label', 'AWS Lambda').get('[aria-disabled="true"]').should('exist');
        
        cy.contains('label', 'Production Endpoint').get('[aria-disabled="true"]').should('exist');
        cy.get('#production_endpoints').should('be.disabled');
        cy.get('#production_endpoints-endpoint-test-icon-btn').should('be.disabled');
        cy.get('button').get('[aria-label="Settings"]').should('be.disabled');
        cy.get('#production_endpoints-endpoint-security-icon-btn').should('be.disabled');
        
        cy.contains('label', 'Sandbox Endpoint').get('[aria-disabled="true"]').should('exist');
        cy.get('#sandbox_endpoints').should('be.disabled');
        cy.get('#sandbox_endpoints-endpoint-test-icon-btn').should('be.disabled');
        cy.get('button').get('[aria-label="Settings"]').should('be.disabled');
        cy.get('#sandbox_endpoints-endpoint-security-icon-btn').should('be.disabled');

        cy.get('#http-panel1bh-header').click();
        cy.get('#certs-add-btn').get('[aria-disabled="true"]').should('exist');
        cy.get('#panel1bh-header').click();
        cy.get('#certificateEndpoint').get('[aria-disabled="true"]').should('exist');
        cy.get('button').get('[aria-label="Delete"]').should('be.disabled');

        cy.contains('button', 'Save').should('be.disabled');

        //11. Localscopes
        cy.get('#left-menu-itemLocalScopes').click();
        cy.contains('a','Add New Local Scope').get('[aria-disabled="true"]').should('exist');
        cy.get('table').get('tbody').get('[data-testid="MUIDataTableBodyRow-0"]').get('[data-testid="MuiDataTableBodyCell-4-0"]').get('[aria-label="Edit creatorscope"]').get('[aria-disabled="true"]').should('exist');
        cy.get('table').get('tbody').get('[data-testid="MUIDataTableBodyRow-0"]').get('[data-testid="MuiDataTableBodyCell-4-0"]').contains('button','Delete').should('be.disabled');

        cy.reload();
        //12. Policies should be checked. (UI issue fixed by PR #11297 in carbon-apimgt)
        cy.get("#left-menu-policies").click();
        cy.get('[data-testid="add-new-api-specific-policy"]', {timeout: Cypress.config().largeTimeout}).click();
        cy.get('[data-testid="create-policy-form"]').get('[data-testid="displayname"]').type("test name");
        cy.get('[data-testid="create-policy-form"]').get('[data-testid="gateway-details-panel"]').get('[data-testid="file-drop-zone"]').then(function () {
            cy.get('input[type="file"]').attachFile('api_artifacts/sampleAddHeader.j2');
        });
        cy.get('[data-testid="create-policy-form"]').get('[data-testid="policy-add-btn-panel"]').get('[data-testid="policy-create-save-btn"]').should('be.disabled');
        cy.get('[data-testid="create-policy-form"]').get('[aria-label="Close"]').click();

        //13. monetization ,lifecycle menus are not visible to observer
        cy.get('[data-testid="left-menu-itemlifecycle"]').should('not.exist');
        cy.get('[data-testid="left-menu-monetization"]').should('not.exist');

        //14. Properties
        cy.get('#left-menu-itemproperties').click();
        cy.get('#add-new-property', {timeout: Cypress.config().largeTimeout}).should('be.disabled');
        cy.get('table').get('tbody').get('tr').contains('td','property1').should('be.visible');
        cy.get('table').get('tbody').get('tr').get('[aria-label="Edit property1"]').should('be.disabled');
        cy.get('table').get('tbody').get('tr').get('[aria-label="Remove property1"]').should('be.disabled');
        cy.get('[data-testid="save-api-properties-btn"]').should('be.disabled');

        //15. Deployments
        cy.get('#react-root').scrollTo('bottom');
        cy.get('#left-menu-itemdeployments').click();
        cy.contains('button','Deploy New Revision').should('be.disabled');
        cy.contains('button','Restore').should('be.disabled');
        cy.contains('button','Delete').should('be.disabled');
        cy.get('#undeploy-btn').should('be.disabled');
        cy.get('table').get('tbody').get('tr').find('td').eq(2).get('[aria-disabled="true"]').should('exist');
        
        //16. Header buttons should also be disabled
        cy.get('#itest-id-deleteapi-icon-button').should('not.exist');
        cy.get('#create-new-version-btn').should('not.exist');
        cy.logoutFromPublisher();

        // Test is done. Now delete the api
        cy.loginToPublisher(carbonUsername, carbonPassword);
    });

    afterEach(function () {
        cy.deleteApi(apiName, apiVersion);
        // delete observer user.
        cy.visit(`${Utils.getAppOrigin()}/carbon/user/user-mgt.jsp`);
        cy.deleteUser(readOnlyUser);
    })
    
});
