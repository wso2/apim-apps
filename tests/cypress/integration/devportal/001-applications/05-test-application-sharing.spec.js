/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

// This test need to enable application sharing in deployment.toml file
/*
[apim.devportal]
enable_application_sharing = true
application_sharing_type = "default"
*/
import Utils from "@support/utils";

describe("Invoke API Product", () => {
    let user1;
    let user2;
    const publisher = 'publisher';
    const password = 'test123';
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';
    let appName;
    const appDescription = 'Testing sharing app';
    const groupId = 'org1';
    let apiName;
    const apiVersion = '2.0.0';
    let apiContext;
    let apiId;

    before(() => {
        // Enable Supported by Default for Local Claim http://wso2.org/claims/organization
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.visit(`/carbon/identity-claim-mgt/update-local-claim.jsp?localClaimURI=http%3A%2F%2Fwso2.org%2Fclaims%2Forganization`);
        cy.get('#supported').check();
        cy.get('[type="button"]').click();
        cy.carbonLogout()

    })

    beforeEach(function () {
        cy.loginToPublisher(publisher, password);
    })

    it("Test Application Sharing", {
        retries: {
            runMode: 3,
            openMode: 0,
        },
    }, () => {
        apiName = `anonymous${Utils.generateRandomNumber()}`;
        apiContext = `anonymous${Utils.generateRandomNumber()}`;
        user1 = `user1_${Utils.generateRandomNumber()}`;
        user2 = `user2_${Utils.generateRandomNumber()}`;
        cy.createAndPublishAPIByRestAPIDesign(apiName, apiVersion, apiContext);
        cy.location('pathname').then((pathName) => {
            const pathSegments = pathName.split('/');
            const uuid = pathSegments[pathSegments.length - 2];
            apiId = uuid;
            appName = `App_${Utils.generateRandomNumber()}`;
            cy.logoutFromPublisher();

            //Create Users in Devportal
            cy.visit(`/devportal/apis?tenant=carbon.super`); 
            cy.get('#itest-devportal-sign-in', {timeout: Cypress.config().largeTimeout}).click();
            cy.get('#registerLink', {timeout: Cypress.config().largeTimeout}).click();

            //Creating user 1
            cy.get('#username').type(user1);
            cy.get('#registrationSubmit').click();

            // There is an error and we have to fix it from IS side
            Cypress.on('uncaught:exception', (err, runnable) => {
                // returning false here prevents Cypress from failing the test
                return false
            });
            cy.get('input[name="http://wso2.org/claims/givenname"]', {timeout: Cypress.config().largeTimeout}).type(user1);
            cy.get('input[name="http://wso2.org/claims/lastname"]').type('test');
            cy.get('#password').type(password);
            cy.get('#password2').type(password);
            cy.get('input[name="http://wso2.org/claims/emailaddress"]').type('user1@test.com');
            cy.get('input[name="http://wso2.org/claims/organization"]').type('org1');
            cy.get('#termsCheckbox').check().should('be.checked');
            cy.get('#registrationSubmit').click();
            cy.get('button.cancel', {timeout: Cypress.config().largeTimeout}).click() 

            //Creating user 2
            cy.get('#registerLink').click();
            cy.get('#username', {timeout: Cypress.config().largeTimeout}).type(user2);
            cy.get('#registrationSubmit').click();
            cy.get('input[name="http://wso2.org/claims/givenname"]').type(user2);
            cy.get('input[name="http://wso2.org/claims/lastname"]').type('test');
            cy.get('#password').type(password);
            cy.get('#password2').type(password);
            cy.get('input[name="http://wso2.org/claims/emailaddress"]').type('user2@test.com');
            cy.get('input[name="http://wso2.org/claims/organization"]').type('org1');
            cy.get('#termsCheckbox').check().should('be.checked');
            cy.get('#registrationSubmit').click();
            cy.get('button.cancel', {timeout: Cypress.config().largeTimeout}).click();


            //Log into developer portal as user 1
            cy.loginToDevportal(user1, password);

            //Test with Oath2 Token
            cy.visit(`/devportal/applications/create`);
            cy.get('#application-name', {timeout: Cypress.config().largeTimeout}).click();
            cy.get('#application-name').type(appName);
            cy.get('#application-group-id').click();
            cy.get('#application-group-id').type(groupId);
            cy.get('#application-description').click();
            cy.get('#application-description').type('{backspace}');
            cy.get('#application-description').type(appDescription);
            cy.get('#itest-application-create-save').click();
            cy.wait(2000);
            cy.logoutFromDevportal();

            //Log into developer portal as user 2
            cy.loginToDevportal(user2, password);
            cy.visit(`/devportal/applications`);
            cy.contains(appName, {timeout: Cypress.config().largeTimeout}).click();

            cy.location('pathname').then((pathName) => {
                const pathSegments = pathName.split('/');
                const uuidApp = pathSegments[pathSegments.length - 2];
                
                //Subscription of API
                cy.get('#left-menu-subscriptions').click();
                cy.contains('Subscribe APIs').click();

                cy.get(`#policy-subscribe-btn-${uuid}`).click();
                cy.get('[aria-label="close"]').click();
                cy.logoutFromDevportal();

                //Log into developer portal as user 1
                cy.loginToDevportal(user1, password);
                cy.visit(`/devportal/applications/${uuidApp}/subscriptions`);
                cy.visit(`/devportal/applications`);
                cy.get(`#delete-${appName}-btn`, {timeout: Cypress.config().largeTimeout});
                cy.get(`#delete-${appName}-btn`).click();
                cy.get(`#itest-confirm-application-delete`).click();
                cy.logoutFromDevportal();
            });
        });
 
    });

    afterEach(function () {

        //Delete Users
        cy.loginToPublisher(publisher, password);
        cy.deleteApi(apiName, apiVersion);
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.visit(`/carbon/user/user-mgt.jsp`);
        cy.deleteUser(user1);
        cy.visit(`/carbon/user/user-mgt.jsp`);
        cy.deleteUser(user2);
        
    })
})
