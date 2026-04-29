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

describe("Generate keys from api details page", () => {
    const { publisher, developer, password, } = Utils.getUserInfo();

    const apiVersion = '2.0.0';
    const apiName = Utils.generateName();
    const apiContext = apiName;
    let testApiId;
    const appName = Utils.generateName();
    let appCreated = false;

    const createAppForTest = () => {
        cy.visit('/devportal/applications/create?tenant=carbon.super');
        cy.intercept('**/application-attributes').as('attrGet');
        cy.wait('@attrGet', { timeout: 300000 });

        cy.get('#application-name').type(appName);
        cy.get('#application-description').clear().type('application description');

        // Some UI variants require selecting quota before save.
        cy.get('body').then(($body) => {
            if ($body.find('#per-token-quota').length > 0) {
                cy.get('#per-token-quota').click({ force: true });
                cy.contains('li', 'Unlimited').click({ force: true });
            }
        });

        cy.get('#itest-application-create-save').click({ force: true });

        // Support both redirect and in-page success variants.
        cy.location('pathname', { timeout: 120000 }).then((pathname) => {
            if (pathname.includes('/overview')) {
                cy.get('#itest-info-bar-application-name', { timeout: 30000 })
                    .contains(appName)
                    .should('exist');
                appCreated = true;
            } else {
                cy.get('body').then(($body) => {
                    if ($body.find('#itest-info-bar-application-name').length > 0) {
                        cy.get('#itest-info-bar-application-name', { timeout: 30000 })
                            .contains(appName)
                            .should('exist');
                        appCreated = true;
                    }
                });
            }
        });
    };
    it("Generate keys from api details page", () => {
        cy.loginToPublisher(publisher, password);
        Utils.addAPIWithEndpoints({ name: apiName, version: apiVersion, context: apiContext }).then((apiId) => {
            testApiId = apiId;
            Utils.publishAPI(apiId).then(() => {
                // TODO: Proper error handling here instead of cypress wait
                cy.logoutFromPublisher();
                cy.loginToDevportal(developer, password);

                // Create an app and subscribe
                createAppForTest();
                cy.visit(`/devportal/apis/${apiId}/credentials?tenant=carbon.super`);
                cy.url().should('contain', `/apis/${apiId}/credentials`);

                // Click and select the new application
                cy.get('#application-subscribe').click();
                cy.get(`.MuiAutocomplete-popper li`).contains(appName).click();
                cy.get(`#subscribe-to-api-btn`).click();
                cy.get(`#subscription-table td`).contains(appName).should('exist');

                // Generate prod keys
                cy.get(`#${appName}-PK`).click();
                cy.get('#generate-keys').click();
                cy.get('[data-testid="create-secret-button"]').should('be.visible').and('not.be.disabled').click();
                cy.get('[data-testid="secret-dialog-close"]').click();
                cy.get('#consumer-key', { timeout: 30000 });
                cy.get('#consumer-key').should('exist');
            })
        })

    })

    after(() => {
        if (appCreated) {
            cy.intercept('**/applications**').as('appGet');
            cy.visit('/devportal/applications?tenant=carbon.super');
            cy.wait('@appGet', { timeout: 300000 }).then(() => {
                cy.get('body').then(($body) => {
                    if ($body.find(`#delete-${appName}-btn`).length > 0) {
                        cy.get(`#delete-${appName}-btn`).click({ force: true });
                        cy.get('#itest-confirm-application-delete').click();
                    } else {
                        cy.log(`Skipping app delete. Application not found: ${appName}`);
                    }
                });
            });
        } else {
            cy.log(`Skipping app delete. Application creation did not complete: ${appName}`);
        }

        if (testApiId) {
            Utils.deleteAPI(testApiId);
        }
    })
})