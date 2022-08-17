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

import AddNewRoleEnterDetailsPage from "./pages/carbon/AddNewRoleEnterDetailsPage";
import AddNewRoleSelectPermissionPage from "./pages/carbon/AddNewRoleSelectPermissionPage";
import ScopeAssignmentsPage from "./pages/adminPortal/ScopeAssignmentsPage";
import UsersManagementPage from "./pages/carbon/UsersManagementPage";
import RolesManagementPage from "./pages/carbon/RolesManagementPage";
import selfSignupDisabledAdvanceConfigJson from "../fixtures/api_artifacts/selfSignupDisabledAdvanceConfig.json";
import selfSignupEnabledAdvanceConfigJson from "../fixtures/api_artifacts/selfSignupEnabledAdvanceConfig.json";

const usersManagementPage = new UsersManagementPage();
const rolesManagementPage = new RolesManagementPage();
const addNewRolePage = new AddNewRoleEnterDetailsPage();
const selectPermission = new AddNewRoleSelectPermissionPage();
const scopeAssignmentsPage = new ScopeAssignmentsPage();

Cypress.Commands.add('carbonLogin', (username, password) => {
    Cypress.log({
        name: 'carbonLogin',
        message: `${username} | ${password}`,
    })

    cy.visit(`/carbon/admin/login.jsp`);
    cy.get('#txtUserName').type(username);
    cy.get('#txtPassword').type(password);
    cy.get('form').submit();
})

Cypress.Commands.add('carbonLogout', () => {
    cy.get('[href="../admin/logout_action.jsp"]').click();
})

Cypress.Commands.add('portalLogin', (username, password, portal, tenant='carbon.super') => {
    Cypress.log({
        name: 'portalLogin',
        message: `${username} | ${password}`,
    })

    cy.visit(`/${portal}`);
    if (portal === 'devportal') {
        cy.visit(`/devportal/apis?tenant=${tenant}`);
        cy.get('#itest-devportal-sign-in', {timeout: Cypress.config().largeTimeout}).click();
    }
    cy.url().should('contains', `/authenticationendpoint/login.do`);
    cy.get('[data-testid=login-page-username-input]').click();
    cy.get('[data-testid=login-page-username-input]').type(username);
    cy.get('[data-testid=login-page-password-input]').type(password);
    cy.get('#loginForm').submit();
    cy.url().should('contains', `/${portal}`);
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
    cy.visit(`/carbon/tenant-mgt/add_tenant.jsp?region=region1&item=govern_add_tenants_menu`);
    cy.get('#buttonRow .button', {timeout: Cypress.config().largeTimeout});
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
    cy.visit(`/carbon/user/add-step1.jsp`);
    cy.get('input[name="username"]', {timeout: Cypress.config().largeTimeout}).type(name);
    cy.get('#password').type(password);
    cy.get('#password-repeat').type(password);
    cy.get('.buttonRow input:first-child').click();

    // Go to step 2 where add roles
    cy.url().should('contains', `/carbon/user/add-step2.jsp`);
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
    tenantRoles = ['Internal/publisher', 'Internal/creator', 'Internal/subscriber', 'Internal/everyone'],
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
    var cardName='card-'+name+version;
    var actionCardName='card-action-'+name+version;
    cy.intercept('**/apis*').as('getApis');
    cy.visit(`/publisher/apis`);
    cy.wait('@getApis', {timeout: Cypress.config().largeTimeout}).then(() => {
        cy.get(`[data-testid="${cardName}"]`).get(`[data-testid="${actionCardName}"]`).within(($panel) => {
            cy.get("#itest-id-deleteapi-icon-button", { timeout: 30000 }).click();
          }) 
        cy.get("#itest-id-deleteconf",{timeout:30000}).click();
    });
});

// Don't use this 
// Fails intermittently 
// Instead delete each api after the test is finish.
Cypress.Commands.add('deleteAllApis', () => {
    cy.visit(`/publisher/apis`);
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

Cypress.Commands.add('createAnAPI', (name, type = 'REST') => {
    const random_number = Math.floor(Date.now() / 1000);
    const randomName = `0sample_api_${random_number}`;
    cy.visit(`/publisher/apis`)
    cy.get('#itest-rest-api-create-menu', {timeout: Cypress.config().largeTimeout});
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
    cy.wait('@apiGet', { timeout: 30000 }).then((res) => {
        const apiUUID = res.response.body.id;
        return { uuid: apiUUID, name: randomName };
    });

})

Cypress.Commands.add('createAPIByRestAPIDesign', (name = null, version = null, context = null) => {
    const random_number = Math.floor(Date.now() / 1000);

    const apiName = name ? name : `0sample_api_${random_number}`;
    const apiVersion = version ? version : `v${random_number}`;
    const apiContext = context ? context : `/sample_context_${random_number}`;
    cy.visit(`/publisher/apis`);
    cy.get('#itest-rest-api-create-menu', {timeout: Cypress.config().largeTimeout});
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
    cy.visit(`/publisher/apis/`);
    cy.get(`#${apiName}`, {timeout: Cypress.config().largeTimeout}).click();

    cy.get('#itest-api-name-version', { timeout: 30000 }).should('be.visible');
    cy.get('#itest-api-name-version').contains(apiVersion);
})

Cypress.Commands.add('createAndPublishAPIByRestAPIDesign', (name = null, version = null, context = null) => {
    const random_number = Math.floor(Date.now() / 1000);

    const apiName = name ? name : `0sample_api_${random_number}`;
    const apiVersion = version ? version : `v${random_number}`;
    const apiContext = context ? context : `/sample_context_${random_number}`;
    Cypress.on('uncaught:exception', (err, runnable) => {
        // returning false here prevents Cypress from
        // failing the test
        return false
    });
    cy.visit(`/publisher/apis/create/rest`);
    cy.get('#itest-id-apiname-input', {timeout: Cypress.config().largeTimeout}).type(apiName);
    cy.get('#itest-id-apicontext-input').click();
    cy.get('#itest-id-apicontext-input').type(apiContext);
    cy.get('#itest-id-apiversion-input').click();
    cy.get('#itest-id-apiversion-input').type(apiVersion);
    cy.get('#itest-id-apiendpoint-input').click();
    cy.get('#itest-id-apiendpoint-input').type(`https://apis.wso2.com/sample${random_number}`);
    cy.get('#itest-id-apiversion-input').click();
    cy.get('body').click(0,0);
    cy.get('#itest-id-apicreatedefault-createnpublish').click({force:true});

    // Wait for the api to load
    cy.get('#itest-api-name-version', {timeout: Cypress.config().largeTimeout}).should('be.visible');
    cy.get('#itest-api-name-version').contains(apiVersion);
})
  

Cypress.Commands.add('addDocument', (name,summary,type,source) => {
    
    cy.get('[data-testid="add-document-btn"]').click({force:true});
    cy.wait(5000);
    cy.get('#doc-name',{timeout: 30000}).focus().type(name, {force:true}).should('have.value',name);
    cy.wait(2000);
    cy.get('#doc-summary').focus().type(summary);
    cy.contains('label',type).click();
    cy.contains('label',source).click();
    cy.get('#add-document-btn').scrollIntoView();
    cy.get('#add-document-btn').click();
    cy.get('#add-content-back-to-listing-btn').click();

    cy.get('table a').contains(name).should('be.visible');
})

Cypress.Commands.add('addComment', (comment) => {
    
    cy.get('[data-testid="new-comment-field"]',{timeout: 30000 }).type(comment);
    cy.get('#add-comment-btn').click();
    
    cy.contains('p',comment).should('exist');
})

Cypress.Commands.add('addBusinessInfo', (businessOwnerName,businessOwnerEmail,techOwnerName,techOwnerEmail) => {
    
    cy.get('#name').focus({timeout: 30000 }).type(businessOwnerName);
    cy.get('#Email').focus({timeout: 30000 }).type(businessOwnerEmail);
    cy.get('#TOname').focus({timeout: 30000 }).type(techOwnerName);
    cy.get('#TOemail').focus({timeout: 30000 }).type(techOwnerEmail);


    cy.get('#business-info-save').then(function () {
        cy.get('#name').should('have.value', businessOwnerName);
        cy.get('#Email').should('have.value', businessOwnerEmail);
        cy.get('#TOname').should('have.value', techOwnerName);
        cy.get('#TOemail').should('have.value', techOwnerEmail);
        cy.get('#business-info-save').click();
    });

})

/**
 * Creates a resource for a given http verb
 * Stuff with  more arguments.
 * @method createResource creates a resource for a given (one) httpverb
 * @param {string} ratelimitlevel  any of the following 2 : api | operation
 * @param {string} limitinglevel 10KPerMin | 20KOPerMin | 50KPerMin | Unlimited
 * @param {string} httpverb GET | POST | PUT | DELETE | PATCH | HEAD | OPTIONS
 * @param {string} uripattern
 * @param {string} description about the API
 * @param {string} summary about API
 * @param {boolean} security true | false
 * @param {string} scope name of the scope | null
 * @param {string} parametername
 * @param {string} parametertype   Query | Header | Cookie | Body | null
 * @param {string} datatype   Integer | Number | String | Boolean | null
 * @param {boolean} required  true | false
 */

Cypress.Commands.add('createResource', (ratelimitlevel, limitinglevel,httpverb,uripattern,description=null,summary=null,security=true,scope,parametername=null,parametertype=null,datatype=null,required=false) => {
    const uriId=httpverb.toLowerCase()+'\/'+uripattern;

    if(ratelimitlevel=="api"){
        cy.get('#api-rate-limiting-api-level').click();
        cy.get('#operation_throttling_policy').click();
        cy.contains('li',limitinglevel).click();
    }else{
        cy.get('#api-rate-limiting-operation-level').click();
    }
    cy.get('#add-operation-selection-dropdown').click();
    cy.contains('li',httpverb).click();
    
    //colapse dropdown
    cy.get('#menu-verbs').click();
    
    cy.get('#operation-target').type(uripattern);
    cy.get('#add-operation-button').click();
    
    cy.get(`[id="${uriId}"]`, { timeout: 30000 }).click();

    
    if(description!= null){
        cy.get(`[data-testid="description-${uriId}"]`, { timeout: 30000 }).click();
        cy.get(`[data-testid="description-${uriId}"]`).type(description);

    }
    if(summary!=null){
        cy.get(`[data-testid="summary-${uriId}"]`, { timeout: 30000 }).click();
        cy.get(`[data-testid="summary-${uriId}"]`).type(summary);
    }
    if(security==false){
        cy.get(`[data-testid="security-${uriId}"]`).click();
    }else{
        cy.get(`[id="${uriId}-operation-scope-select"]`, { timeout: 30000 }).click();
        cy.contains('li',scope).click();
        cy.get('#menu-').click();
    }

    if(ratelimitlevel=="operation"){
        cy.get(`[id="${uriId}-operation_throttling_policy-label"]`).click();
        cy.contains('li',limitinglevel).click();
    }


    //parameters
    if(parametertype!=null){
        cy.get(`[id="param-${uriId}"]`).click();
        cy.contains('li',parametertype).click();
        cy.get(`[id="name-${uriId}"]`).type(parametername);
        cy.get(`[id="data-${uriId}"]`).click();
        cy.get(`[id="data-${uriId}/${datatype.toLowerCase()}"]`).click();
        if(required){
            cy.get(`[data-testid="required-${uriId}"]`).click();
        }
        cy.get(`[id="param-${uriId}-add-btn"]`).click();
        cy.contains('td',parametername).should('exist');
    }
    cy.get('#resources-save-operations', { timeout: 30000 }).click();

})


Cypress.Commands.add('addProperty',(name,value,ifSendToDevPortal)=>{
    cy.wait(4000);
    cy.get('#add-new-property',{ timeout: 60000 }).click({force:true});
    cy.get('#property-name', {timeout: Cypress.config().largeTimeout}).focus().type(name);
    cy.get('#property-value').focus().type(value);

    if(ifSendToDevPortal)
        cy.contains('label','Show in devportal').click();
    cy.get('#properties-add-btn').should('exist');
    cy.get('#properties-add-btn').click();

    //verifying that the property added
    cy.get('tr').contains('td',name);

    //save the property
    cy.get('[data-testid="custom-select-save-button"]').click();
    cy.timeout(3000);
})


Cypress.Commands.add('createGraphqlAPIfromFile', (name,version,context,filepath)=>{

    cy.visit(`/publisher/apis/create/graphQL`);

    // upload the graphql file
    cy.get('[data-testid="browse-to-upload-btn"]', {timeout: Cypress.config().largeTimeout}).then(function () {
        cy.get('input[type="file"]').attachFile(filepath);
        // Wait to upload and go to next page
        cy.get('[data-testid="uploaded-list-graphql"]', {timeout: Cypress.config().largeTimeout}).should('be.visible');
        cy.get('[data-testid="create-graphql-next-btn"]').click();

        // Filling the form
        cy.get('#itest-id-apiname-input').click();
        cy.get('#itest-id-apiname-input').type(name);
        cy.get('#itest-id-apicontext-input').click();
        cy.get('#itest-id-apicontext-input').type(context);
        cy.get('#itest-id-apiversion-input').click();
        cy.get('#itest-id-apiversion-input').type(version);
        cy.get('#itest-id-apiendpoint-input').click();
        cy.get('#itest-id-apiendpoint-input').type('http://localhost:8080/graphql');
        cy.get('#itest-id-apiversion-input').click();
        cy.get('body').click(0,0);

        // Saving the form
        cy.get('[data-testid="itest-create-graphql-api-button"]',).click({force:true, timeout: Cypress.config().largeTimeout});

        //Checking the version in the overview
        cy.get('#itest-api-name-version', {timeout: Cypress.config().largeTimeout}).should('be.visible');
        cy.get('#itest-api-name-version').contains(version);
        cy.url().then(url => {
            let apiId = /apis\/(.*?)\/overview/.exec(url)[1];
            return cy.wrap(apiId);
        });
    });
})
  


Cypress.Commands.add('modifyGraphqlSchemaDefinition', (filepath)=>{
    
    var filename = filepath.replace(/^.*[\\\/]/, '');
    var uploadedDefinitionPanel=null;

    cy.contains('button', 'Import Definition').click();
    // upload the graphql file
    cy.get('[data-testid="browse-to-upload-btn"]')
    cy.get('input[type="file"]').attachFile(filepath);
    cy.contains('h2','Import GraphQL Schema Definition').should('exist');
    uploadedDefinitionPanel=cy.get('[data-testid="uploaded-list-graphql"]').get('li').get('[data-testid="uploaded-list-content-graphql"]')
    //uploadedDefinitionPanel.contains(`[data-testid="file-input-${filename}"]`,filename).should('be.visible');
    uploadedDefinitionPanel.get('[data-testid="btn-delete-imported-file"]').should('be.visible');
    cy.get('#import-open-api-btn').click();
    cy.get('#import-open-api-btn').should('not.exist')
    const searchCmd = Cypress.platform === 'darwin' ? '{cmd}f' : '{ctrl}f'
    cy.get('.react-monaco-editor-container',{timeout:30000}).get('.monaco-editor textarea:first')
        .type(searchCmd,{force:true});
    cy.get('.find-part .input').type('modified schema file');
    cy.contains('.find-actions','1 of').should('be.visible');
    
   
})


Cypress.Commands.add('createLocalScope', (name, displayname='sample display name',description='sample description',roles=[]) => {

    cy.get('h3',  {timeout: Cypress.config().largeTimeout}).contains("Create New Scope",  { timeout: 30000 });
    cy.wait(1000);
    cy.get('#name',{timeout:30000}).type(name, {force:true});
    cy.get('#displayName',{timeout: 30000 }).click().type(displayname,  {force:true});
    cy.get('#description',{timeout: 30000 }).click().type(description,  {force:true});
    cy.get('#name',{timeout:30000}).clear().click().type(name,  {force:true});

    roles.forEach(role => {
        cy.get('#roles-input',{timeout: 30000 }).type(role+'\n');
    });
    cy.get('#scope-save-btn').click({force: true});

    //it randomly causes an error in verification step when removed the wait
    cy.wait(3000);

    //check the table and verify whether entered scope names exist
    cy.get('table').get('tbody').find("tr").contains(name);

})


Cypress.Commands.add('createAPIWithoutEndpoint', (name=null,version=null,type = 'REST') => {
    const random_number = Math.floor(Date.now() / 1000);
    var apiVersion=`v${random_number}`;
    var apiName = `0sample_api_${random_number}`;
    if(name){
        apiName=name;
    }
    if(version){
        apiVersion=version;
    }
    cy.visit(`/publisher/apis`);
    cy.get('#itest-create-api-menu-button', {timeout: Cypress.config().largeTimeout});
    cy.get('#itest-create-api-menu-button').click();
    cy.get('#itest-id-landing-rest-create-default').click();
    cy.get('#itest-id-apiname-input').type(apiName);
    cy.get('#itest-id-apicontext-input').click();
    cy.get('#itest-id-apicontext-input').type(`/sample_context_${apiVersion}`);
    cy.get('#itest-id-apiversion-input').click();
    cy.get('#itest-id-apiversion-input').type(apiVersion);
    cy.get('#itest-id-apiendpoint-input').click();
    cy.get('#itest-create-default-api-button').click();
    cy.wait(500);

    cy.visit(`/publisher/apis/`);
    cy.get(`#${apiName}`,{timeout: Cypress.config().largeTimeout}).click();


    cy.get('#itest-api-name-version', { timeout: 30000 }).should('be.visible');
    cy.get('#itest-api-name-version').contains(`${apiVersion}`);
})

Cypress.Commands.add('createApp', (appName, appDescription) => {
    cy.visit(`/devportal/applications/create?tenant=carbon.super`);
    cy.intercept('**/application-attributes').as('attrGet');
    cy.wait('@attrGet', { timeout: 300000 }).then(() => {
        // Filling the form
        cy.get('#application-name').click();
        cy.get('#application-name').type(appName);
        cy.get('#application-description').click();
        cy.get('#application-description').type('{backspace}');
        cy.get('#application-description').type(appDescription);
        cy.get('#itest-application-create-save').click({force:true});

        // Checking the app name exists in the overview page.
        cy.url().should('contain', '/overview');
        cy.get('#itest-info-bar-application-name').contains(appName).should('exist');
    })
});

Cypress.Commands.add('deleteApp', (appName) => {
    cy.visit(`/devportal/applications?tenant=carbon.super`);
    cy.intercept('**/applications**').as('appGet');
    cy.wait('@appGet', { timeout: 300000 }).then(() => {
        cy.get(`#delete-${appName}-btn`, { timeout: 30000 });
        cy.get(`#delete-${appName}-btn`).click({force:true});
        cy.get(`#itest-confirm-application-delete`).click();
    })
});

Cypress.Commands.add('createAndPublishApi', (apiName = null) => {
    cy.visit(`/publisher/apis`);
    // select the option from the menu item
    cy.get('#itest-rest-api-create-menu', {timeout: Cypress.config().largeTimeout}).click();
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
    cy.get('#itest-api-details-portal-config-acc', { timeout: 30000 }).click();
    cy.get('#left-menu-itemsubscriptions').click();
    cy.get('[data-testid="policy-checkbox-silver"]').click();
    cy.get('[data-testid="policy-checkbox-unlimited"]').click();
    cy.get('#subscriptions-save-btn').click();

    // deploy
    cy.get('#left-menu-itemdeployments').click();
    cy.get('#left-menu-itemdeployments').then(() => {
        cy.wait(1000);
        cy.get('#deploy-btn').should('not.have.class', 'Mui-disabled').click();
        cy.get('#undeploy-btn').should('not.have.class', 'Mui-disabled').should('exist');
    })

    // publish
    cy.get('#left-menu-itemlifecycle').click();
    cy.wait(2000);
    cy.get('[data-testid="Publish-btn"]').click();
    cy.get('button[data-testid="Demote to Created-btn"]').should('exist');

})

Cypress.Commands.add('logoutFromDevportal', (referer = '/devportal/apis') => {

    cy.get('#userToggleButton').click();
    cy.get("#userPopup").get("#menu-list-grow").get('ul').contains('li','Logout').click();
    cy.url().should('contain', '/devportal/logout');
    cy.url().should('contain', referer);
})

Cypress.Commands.add('logoutFromPublisher', () => {
    Cypress.on('uncaught:exception', (err, runnable) => {
        // returning false here prevents Cypress from
        // failing the test
        return false
    });
    cy.visit(`/publisher/services/logout`);
})

Cypress.Commands.add('logoutFromAdminPortal', () => {
    cy.visit(`${Utils.getAppOrigin()}/admin/services/logout`);
})

Cypress.Commands.add('viewThirdPartyApi', (apiName = null) => {
    cy.get('[area-label="Go to ThirdPartyApi"]', {timeout: Cypress.config().largeTimeout}).click();

    //Check if the subscriptions, tryout, comments and SDKs sections are present
    cy.get('#left-menu-credentials').should('exist');
    cy.get('#left-menu-test').should('exist');
    cy.get('#left-menu-comments').should('exist');
    cy.get('#left-menu-sdk').should('exist');

    //Visit Original Developer Portal
    cy.get('#left-menu-credentials').click();
    cy.get('[data-testid="itest-original-devportal-link"]').should('exist');
    cy.get('[data-testid="itest-no-tier-dialog"]').contains('No tiers are available for the API.').should('exist');

    //Check if authorization header and value can be customized
    cy.get('#left-menu-test').click();
    cy.get('#advAuthHeader', {timeout: Cypress.config().largeTimeout}).should('exist');
    cy.get('#advAuthHeaderValue').should('exist');

})

Cypress.Commands.add('publishSolaceApi', (apiName = null) => {

    cy.visit(`${Utils.getAppOrigin()}/publisher/apis`);

    //select streaming-api option from the menu item
    cy.get('#itest-rest-api-create-menu', { timeout: 30000 });
    cy.get('#itest-streaming-api-create-menu').click();
    cy.get('#itest-id-create-streaming-api-import').click();
    cy.get('[data-testid="input-asyncapi-file"]').click();
    
    //upload the solace api definition
    cy.get('[data-testid="upload-api-file"]').then(function () {
        const filepath = 'api_artifacts/solaceApiDefinition.yml'
        cy.get('input[type="file"]').attachFile(filepath)
    });

    //Check whether the api provider is solace
    cy.get('[data-testid="solace-api-label"] span').contains('Identified as Solace Event Portal API').should('exist');
    cy.get('[data-testid="next-btn"]').should('not.be.disabled');
    cy.get('[data-testid="next-btn"]').click();

    //create the asyncapi
    cy.get('#itest-id-apiname-input').should('have.value','APIConsumption');
    cy.get('#itest-id-apicontext-input').type('/solaceapi');
    cy.get('#itest-id-apiversion-input').should('have.value','0.0.1');
    cy.get('#itest-id-apiversion-input').click()
    cy.get('[data-testid="MQTT-label"]').should('exist');
    cy.get('[data-testid="HTTP-label"]').should('exist');
    cy.get('[data-testid="asyncapi-create-btn"]').click();

    cy.intercept('GET','/api/am/publisher/v3/settings',{fixture : 'solaceEnvironmentResponse.json'}).as('getSettings');

    //Check if runtime,resources,endpoints,localscopes,policies,monetization does not exist
    cy.get('[data-testid="itest-api-config"]', { timeout: 30000 }).click();
    cy.get('#left-menu-itemRuntimeConfigurations').should('not.exist');
    cy.get('#left-menu-itemresources').should('not.exist');
    cy.get('#left-menu-itemendpoints').should('not.exist');
    cy.get('#left-menu-itemLocalScopes').should('not.exist');
    cy.get('#left-menu-policies').should('not.exist');
    cy.get('#left-menu-itemMonetization').should('not.exist');

    cy.get('#resources').should('not.exist');
    cy.get('[data-testid="endpoints"]').should('not.exist');

    //Go to the topics section and check the topics
    cy.get('#left-menu-itemtopics').click();
    cy.get('#panel2a-header h6').contains('apim/car-co/api/V1/json/{region_id}/{make}/{model}/{vin}/{event_type}').should('exist');
    cy.get('[data-testid="itest-api-config"]').click();

    //Check solace deployments and deploy
    cy.get('#left-menu-itemdeployments').click();
    cy.wait('@getSettings', {timeout: 10000}).then(() => {
        cy.get('[data-testid="solace"]').should('exist');
        cy.get('[data-testid="solace-api-name"]').contains('AWS APIM-GW-DEV FRANKFURT').should('exist');
        cy.get('[data-testid="api-env-name"] input').should('have.value','apim-gw-dev');
        cy.get('[data-testid="api-org-name"] input').should('have.value','wso2dev');
        cy.get('#deploy-btn-solace').click();
    });
    
    cy.intercept('**/deploy-revision**',{statusCode:201,fixture : 'api_artifacts/solaceDeployedStatus.json'}).as('deployedStatus');
    cy.intercept('/api/am/publisher/v3/apis/*/revisions**',{statusCode:200,fixture : 'api_artifacts/solaceDeployedQuery.json'}).as('deployedRevision');
    cy.wait('@deployedStatus');
    cy.wait('@deployedRevision');

    //Check if requirements are correct
    cy.get('#left-menu-itemlifecycle').click();
    cy.get('[data-testid="business-plan-req"]').should('exist');
    cy.get('[data-testid="endpoint-req"]').should('not.exist');
});

Cypress.Commands.add('viewSolaceApi', (apiName = null) => {

    cy.intercept('GET','/api/am/devportal/v2/apis?limit=10&offset=0',{fixture:'api_artifacts/publishedApis.json'}).as('publishedApis');
    cy.intercept('GET','/api/am/devportal/v2/apis/27dea111-28a9-44a5-a14d-87f6ca61bd2e',{fixture:'api_artifacts/mockSolaceApi.json'}).as('mockSolaceApi');
    cy.intercept('GET','/api/am/devportal/v2/apis/27dea111-28a9-44a5-a14d-87f6ca61bd2e/ratings',{statusCode:200,fixture:'api_artifacts/solaceApiRatings.json'});
    cy.intercept('GET','/api/am/devportal/v2/apis/27dea111-28a9-44a5-a14d-87f6ca61bd2e/thumbnail',{statusCode:204});
    cy.intercept('GET','/api/am/devportal/v2/subscriptions**',{fixture:'api_artifacts/solaceApiSubscriptionsOverview.json'}).as('solaceApiSubscriptionsOverview');
    cy.intercept('GET','/api/am/devportal/v2/subscriptions?apiId=27dea111-28a9-44a5-a14d-87f6ca61bd2e&limit=25',{fixture:'api_artifacts/solaceApiSubscriptionsLimit25.json'}).as('solaceApiSubscriptionsLimit25');
    cy.intercept('GET','/api/am/devportal/v2/subscriptions?apiId=27dea111-28a9-44a5-a14d-87f6ca61bd2e&limit=5000',{fixture:'api_artifacts/solaceApiSubscriptionsLimit5000.json'}).as('solaceApiSubscriptionsLimit5000');
    cy.intercept('GET','/api/am/devportal/v2/apis/27dea111-28a9-44a5-a14d-87f6ca61bd2e/comments**',{statusCode:200});
    cy.intercept('GET','/api/am/devportal/v2/applications?limit=5000',{fixture:'api_artifacts/solaceApiApplications.json'});
    cy.intercept('GET','/api/am/devportal/v2/apis/27dea111-28a9-44a5-a14d-87f6ca61bd2e/documents',{fixture:'api_artifacts/solaceApiDocuments.json'});
    cy.intercept('GET','/api/am/devportal/v2/settings',{fixture:'api_artifacts/solaceApiSettings.json'}).as('solaceApiSettings');
    cy.intercept('GET','/api/am/devportal/v2/throttling-policies/subscription',{fixture:'api_artifacts/solaceApiThrottling.json'}).as('solaceApiThrottling');

    cy.wait('@publishedApis',{ timeout:10000}).then(()=> {
        cy.get('[data-testid="solace-label"]').should('exist');
        cy.get('[area-label="Go to APIConsumption"]').click();
    });
    cy.wait('@mockSolaceApi',{ timeout:10000}).then(()=> {
        cy.get('#left-menu-overview').click();
        cy.get('[data-testid="MQTT-label"]').should('exist');
        cy.get('[data-testid="HTTP-label"]').should('exist');
    });

    //Check if solace info menu and definition menu exists
    //Check if tryout does not exist
    cy.get('#left-menu-solace-info').should('exist');
    cy.get('#left-menu-definition').should('exist');
    cy.get('#left-menu-test').should('not.exist');


});

/**
 * create application in DevPortal
 * @method createApplication create application in DevPortal
 * @param {string} applicationName  name of the application
 * @param {string} perTokenQuota 10PerMin | 20OPerMin | 50PerMin | Unlimited
 * @param {string} appDescription description about application
 */
Cypress.Commands.add('createApplication', (applicationName,perTokenQuota,applicationDescription=null) => {
    cy.get("#itest-link-to-applications").click();
    cy.get("#itest-application-create-link",{timeout:30000}).click();
    cy.get('#application-name').type(applicationName);
    cy.get('#per-token-quota').click();
    cy.get('ul').contains('li',perTokenQuota).click();

    if(applicationDescription){
        cy.get('#application-description').type(applicationDescription);
    }
    cy.get("#itest-application-create-save").click();

    cy.get("#itest-info-bar-application-name", {timeout: Cypress.config().largeTimeout}).contains(applicationName).should('exist');
    cy.get("#production-keys").click();
    cy.get("#generate-keys").click();

    cy.get("#sandbox-keys").click();
    cy.get("#generate-keys",{timeout:30000}).click();

});

Cypress.Commands.add('deleteApplication', (applicationName) => {
    cy.get("#itest-link-to-applications", {timeout: Cypress.config().largeTimeout}).click();
    cy.get('table', {timeout: Cypress.config().largeTimeout}).get('tbody').get(`[data-testid="row-${applicationName}"]`)
        .find('td').eq(5).get(`[id="delete-${applicationName}-btn"]`).click();
    cy.get("#itest-confirm-application-delete").click();
});

Cypress.Commands.add('addNewRole', (roleName = 'newrole', domain = "PRIMARY", permissions = []) => {
    cy.visit(`${Utils.getAppOrigin()}` + addNewRolePage.getUrl())

    addNewRolePage.getDomainDropdown().select(domain)
    addNewRolePage.getRoleNameTextBox().type(roleName)
    addNewRolePage.getNextButton().click();

    permissions.forEach(permission => {
        selectPermission.getpermissionCheckboxOf(permission).click();
    });

    selectPermission.getFinishButton().click()
    selectPermission.getMessageBoxInfo().should('have.text', `Role PRIMARY/${roleName} is added successfully.`)
    selectPermission.getMessageBoxOkButton().click()
})

Cypress.Commands.add('deleteRole', (roleName) => {

    cy.log(`Delete role ${roleName} ...`)
    cy.visit(`${Utils.getAppOrigin()}` + rolesManagementPage.getUrl())

    rolesManagementPage.getRoleNameTextBox().clear().type(roleName);
    rolesManagementPage.getSearchRolesButton().click();
    rolesManagementPage.getDeleteButtonOfRole(roleName).click()
    rolesManagementPage.getDialogYesButton().click();
    cy.wait(3000)
    rolesManagementPage.getDialogOkButton(1).click(); // ok button of "No matching users found" dialog
    //cy.get('#messagebox-info p').contains(`User ${userNametoDelete} is deleted successfully.`).should('exist');
    rolesManagementPage.getDialogOkButton(0).click(); // OK button of user delted successfully dialog box
})

Cypress.Commands.add('searchAndDeleteRoleIfExist', (roleNameToDelete) => {
    cy.visit(`${Utils.getAppOrigin()}` + rolesManagementPage.getUrl())
    const WAIT_TIME_FOR_DILAOG_BOX_TO_APEAR = 3000;
    rolesManagementPage.getRoleNameTextBox().clear().type(roleNameToDelete);
    rolesManagementPage.getSearchRolesButton().click();
    var deleteMessageLog = "NA"
    cy.wait(WAIT_TIME_FOR_DILAOG_BOX_TO_APEAR)

    cy.get("body").then(($body) => {
        if ($body.find(rolesManagementPage.getNoMatchingRolesFoundDialogBox_MessageInfoDivSelectorOnly()).length > 0) {
            deleteMessageLog = `User "${roleNameToDelete}" not exists may be already deleted`
            cy.log(deleteMessageLog).then(() => {
                return deleteMessageLog;
            })
        } else {
            cy.deleteRole(roleNameToDelete)
            deleteMessageLog = `User "${roleNameToDelete}" Deleted Successfully .... !`
            cy.log(deleteMessageLog).then(() => {
                return deleteMessageLog;
            })
        }
        //customDeleteLog = "Whatx going on"
    })
})

Cypress.Commands.add('addScopeMappingFromAPIMAdminPortal', (roleName, roleAlias) => {

    cy.log(`Adding scope mapping ${roleName} ...`)
    cy.visit(`${Utils.getAppOrigin()}` + scopeAssignmentsPage.getUrl())

    scopeAssignmentsPage.getAddScopeMappingButton().should('have.text', "Add scope mappings").click()
    scopeAssignmentsPage.getAddNewScopeRoleNameTextBox().type(roleName)
    scopeAssignmentsPage.getAddNewScopeNextButton().should('have.text', "Next").click()

    scopeAssignmentsPage.selectRoleAlias(roleAlias)
    scopeAssignmentsPage.getAddNewScopeSavetButton().click()

    scopeAssignmentsPage.getSearchTextBox().type(roleName)
    // e.g. apicreatorInternal/creator
    scopeAssignmentsPage.getRolesRecordOfTableRow(0).should('have.text', `${roleName}${roleAlias}`).click()

})

Cypress.Commands.add('deleteScopeMappingFromAPIMAdminPortal', (roleName) => {

    cy.log(`Delete scope mapping ${roleName} ...`)
    cy.visit(`${Utils.getAppOrigin()}` + scopeAssignmentsPage.getUrl())

    scopeAssignmentsPage.getSearchTextBox().type(roleName)
    cy.wait(1000)
    scopeAssignmentsPage.getDeleteButtonOfTableRow(0).should('have.text', "Delete").click()
    scopeAssignmentsPage.getDeleteButtonOfScopeAssignmentDialogOfRole(roleName).click()
    // verify the delete either assert deelete tooltip or search and verify 0 result
})

Cypress.Commands.add('searchAndDeleteUserIfExist', (userNametoDelete) => {
    cy.visit(`${Utils.getAppOrigin()}` + usersManagementPage.getUrl())
    const WAIT_TIME_FOR_DILAOG_BOX_TO_APEAR = 3000;
    usersManagementPage.getEnterUsernameTextBox().clear().type(userNametoDelete)
    usersManagementPage.getSearchUsershButton().click()
    var deleteMessageLog = "NA"
    cy.wait(WAIT_TIME_FOR_DILAOG_BOX_TO_APEAR)

    cy.get("body").then(($body) => {
        if ($body.find(usersManagementPage.getNoMatchingUsersFoundDialogBox_MessageInfoDivSelectorOnly()).length > 0) {
            deleteMessageLog = `User "${userNametoDelete}" not exists may be already deleted`
            cy.log(deleteMessageLog).then(() => {
                return deleteMessageLog;
            })
        } else {
            usersManagementPage.getDeleteButtonOfUser(userNametoDelete).click();
            usersManagementPage.getDeleteDialogYesButton().click();
            cy.wait(WAIT_TIME_FOR_DILAOG_BOX_TO_APEAR)
            usersManagementPage.getDialogOkButton(1).click(); // ok button of "No matching users found" dialog
            //cy.get('#messagebox-info p').contains(`User ${userNametoDelete} is deleted successfully.`).should('exist');
            usersManagementPage.getDialogOkButton(0).click(); // OK button of user delted successfully dialog box
            deleteMessageLog = `User "${userNametoDelete}" Deleted Successfully .... !`
            cy.log(deleteMessageLog).then(() => {
                return deleteMessageLog;
            })
        }
    })
})

Cypress.Commands.add('searchRolesAndAddNewUser', (name = 'newuser', roles = [], password = 'test123') => {
    // Visit the add user page
    cy.visit(`${Utils.getAppOrigin()}/carbon/user/add-step1.jsp`);
    cy.get('input[name="username"]').type(name);
    cy.get('#password').type(password);
    cy.get('#password-repeat').type(password);
    cy.get('.buttonRow input:first-child').click();

    // Go to step 2 where add roles
    cy.url().should('contains', `${Utils.getAppOrigin()}/carbon/user/add-step2.jsp`);
    roles.forEach(role => {
        cy.get('input[name="org.wso2.carbon.user.assign.filter"]').clear().type(role)
        cy.get('input[value="Search Roles"]').click()
        cy.get(`input[value="${role}"][type="checkbox"]`).check();
    });
    // Finish wizard
    cy.get('.buttonRow input:first-child').click();
    // cy.get('#messagebox-info p').contains(`User PRIMARY/${name} is added successfully.`).should('exist');
})

Cypress.Commands.add('addNewUserUsingSelfSignUp', (username, password, firstName, lastName, email, tenant) => {
    Cypress.log({
        name: 'Add New User Using Self SignUp ',
        message: ' for ' + tenant
    })

    cy.visit(`${Utils.getAppOrigin()}/devportal/apis?tenant=${tenant}`);
    cy.get('#itest-devportal-sign-in').click();
    cy.get('#registerLink').click();
    cy.get('#username').type(username);
    cy.get('#registrationSubmit').click();

    // Uncaught ReferenceError: Handlebars is not defined
    Cypress.on('uncaught:exception', (err, runnable) => {
        return false;
    });

    cy.get('[name="http://wso2.org/claims/givenname"]').type(firstName);
    cy.get('[name="http://wso2.org/claims/lastname"]').type(lastName);
    cy.get('#password').type(password);
    cy.get('#password2').type(password);
    cy.get('[name="http://wso2.org/claims/emailaddress"]').type(email);
    cy.get('#termsCheckbox').check();
    cy.get('#registrationSubmit').click();
    cy.contains('User registration completed successfully').should('exist');
    cy.get('[type="button"]').click();
})

Cypress.Commands.add('addExistingUserUsingSelfSignUp', (username, tenant) => {
    Cypress.log({
        name: 'Add Existing User Using Self SignUp ',
        message: ' for ' + tenant
    })

    cy.visit(`${Utils.getAppOrigin()}/devportal/apis?tenant=${tenant}`);
    cy.get('#itest-devportal-sign-in').click();
    cy.get('#registerLink').click();
    cy.get('#username').type(username);
    cy.get('#registrationSubmit').click();
    cy.contains('Username \'' + username + '\' is already taken. Please pick a different username').should('exist');
})

Cypress.Commands.add('removeSelfSignUpConfig', (username, password, tenant) => {
    Cypress.log({
        name: 'Remove Self SignUp Config ',
        message: ' for ' + tenant
    })

    cy.intercept('GET', 'https://localhost:9443/api/am/admin/v3/tenant-config', {
        statusCode: 200,
        body: selfSignupDisabledAdvanceConfigJson
    });

    cy.loginToAdmin(username, password)
    cy.get('[data-testid="Advanced-child-link"]').click();
    cy.wait(2000);
    cy.get('[data-testid="monaco-editor-save"]').click();
    cy.logoutFromAdminPortal();
})

Cypress.Commands.add('addSelfSignUpConfig', (username, password, tenant) => {
    Cypress.log({
        name: 'Add Self SignUp Config ',
        message: ' for ' + tenant
    })

    cy.intercept('GET', 'https://localhost:9443/api/am/admin/v3/tenant-config', {
        statusCode: 200,
        body: selfSignupEnabledAdvanceConfigJson
    });

    cy.loginToAdmin(username, password)
    cy.get('[data-testid="Advanced-child-link"]').click();
    cy.wait(2000);
    cy.get('[data-testid="monaco-editor-save"]').click();
    cy.logoutFromAdminPortal();
})

Cypress.Commands.add('portalLoginUsingIncorrectUserCredentials', (username, password, portal, tenant = 'carbon.super') => {
    Cypress.log({
        name: 'Portal Login Using Incorrect User Credentials ',
        message: `${username} | ${password}`,
    })

    cy.visit(`${Utils.getAppOrigin()}/${portal}`);
    if (portal === 'devportal') {
        cy.visit(`${Utils.getAppOrigin()}/devportal/apis?tenant=${tenant}`);
        cy.get('#itest-devportal-sign-in').click();
    }
    cy.url().should('contains', `${Utils.getAppOrigin()}/authenticationendpoint/login.do`);
    cy.get('[data-testid=login-page-username-input]').click();
    cy.get('[data-testid=login-page-username-input]').type(username);
    cy.get('[data-testid=login-page-password-input]').type(password);
    cy.get('#loginForm').submit();
    cy.contains('Login failed! Please recheck the username and password and try again.').should('exist');
})

Cypress.Commands.add('disableSelfSignUpInCarbonPortal', (username, password, tenant = 'carbon.super') => {
    Cypress.log({
        name: 'Disable Self Signup In Carbon Portal',
        message: ' for ' + tenant
    })

    cy.carbonLogin(username, password);
    cy.get('[style="background-image: url(../idpmgt/images/resident-idp.png);"]').click();
    cy.contains('User Onboarding').click();
    cy.contains('Self Registration').click();
    cy.get('[value="SelfRegistration.Enable"]').uncheck({force: true});
    cy.get('#idp-mgt-edit-local-form').submit();
    cy.get('[class="ui-button ui-corner-all ui-widget"]').click();
    cy.carbonLogout();
})

Cypress.Commands.add('enableSelfSignUpInCarbonPortal', (username, password, portal, tenant = 'carbon.super') => {
    Cypress.log({
        name: 'Enable Self Signup In Carbon Portal',
        message: ' for ' + tenant
    })

    cy.carbonLogin(username, password);
    cy.get('[style="background-image: url(../idpmgt/images/resident-idp.png);"]').click();
    cy.contains('User Onboarding').click();
    cy.contains('Self Registration').click();
    cy.get('[value="SelfRegistration.Enable"]').check({force: true});
    cy.get('#idp-mgt-edit-local-form').submit();
    cy.get('[class="ui-button ui-corner-all ui-widget"]').click();
    cy.carbonLogout();
})