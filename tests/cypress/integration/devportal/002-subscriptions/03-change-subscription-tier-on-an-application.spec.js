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

import Utils from "@support/utils";

describe("Change subscription tier of an application", () => {
    const { publisher, developer, password, } = Utils.getUserInfo();

    const apiVersion = '2.0.0';
    const apiName = Utils.generateName();
    const apiContext = apiName;
    let testApiId;
    const appName = Utils.generateName();
    it.only("Change subscription tier", () => {

        cy.loginToPublisher(publisher, password);
        Utils.addAPIWithEndpoints({ name: apiName, version: apiVersion, context: apiContext }).then((apiId) => {
            testApiId = apiId;
            Utils.publishAPI(apiId).then(() => {
                
                cy.visit(`/publisher/apis/${apiId}/subscriptions`);
                cy.get('[data-testid="policy-checkbox-silver"]', {timeout: Cypress.config().largeTimeout});
                cy.get('[data-testid="policy-checkbox-silver"]').click();
                cy.get('#subscriptions-save-btn').click();
                // TODO: Proper error handling here instead of cypress wait
                cy.wait(3000);
                cy.logoutFromPublisher();
                cy.loginToDevportal(developer, password);
                cy.createApp(appName, 'application description');
                cy.visit(`/devportal/applications?tenant=carbon.super`);
                cy.get(`#itest-application-list-table td a`).contains(appName).click();

                // Go to application subscription page
                cy.get('#left-menu-subscriptions').click();
                cy.contains('Subscribe APIs').click();
                
                cy.get('[aria-labelledby="simple-dialog-title"]').find('input[placeholder="Search APIs"]').click().type(apiName+"{enter}");
                cy.contains('1-1 of 1'); 

                cy.get(`#policy-select`).click();
                cy.get(`#policy-select-Unlimited`).click();
                cy.get(`#policy-subscribe-btn-${apiId}`).contains('Subscribe').click();
                cy.get('button[aria-label="close"]').click();

                // Check the subscriptions existence
                cy.contains(`${apiName} - ${apiVersion}`).should('exist');

                // Edit the subscription
                cy.get(`#edit-api-subscription-${apiId}`).click();
                cy.get('#outlined-select-currency').click();
                cy.get('li[data-value="Silver"]').click();
                cy.get('button span').contains('Update').click();

                // Checking the update is success.
                cy.wait(4000);
                cy.contains('Silver').should('exist');
            })
        })
    });

    after(() => {
        cy.deleteApp(appName);
        Utils.deleteAPI(testApiId);
    })
});
