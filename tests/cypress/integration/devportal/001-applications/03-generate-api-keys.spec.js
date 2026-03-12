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

describe("Application tests", () => {
    const { publisher, developer, password } = Utils.getUserInfo();
    const appName = Utils.generateName();
    const appDescription = 'Key gen application description';
    const apiVersion = '2.0.0';
    const apiName = Utils.generateName();
    const apiContext = apiName;
    let appCreated = false;
    let testApiId;

    const createAppForTest = () => {
        cy.visit('/devportal/applications/create?tenant=carbon.super');
        cy.intercept('**/application-attributes').as('attrGet');
        cy.wait('@attrGet', { timeout: 300000 });

        cy.get('#application-name').type(appName);
        cy.get('#application-description').clear().type(appDescription);

        // Some versions require selecting the quota explicitly before save.
        cy.get('body').then(($body) => {
            if ($body.find('#per-token-quota').length > 0) {
                cy.get('#per-token-quota').click({ force: true });
                cy.contains('li', 'Unlimited').click({ force: true });
            }
        });

        cy.get('#itest-application-create-save').click({ force: true });

        // Accept either redirect-based or in-page success patterns.
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
    const openSecurityRestrictionSelect = () => {
        cy.get('[role="dialog"]').last().within(() => {
            cy.contains('label', 'Security Restriction')
                .parents('.MuiFormControl-root')
                .find('[role="combobox"]')
                .click();
        });
    };

    const selectSecurityRestriction = (value) => {
        openSecurityRestrictionSelect();
        cy.get(`li[data-value="${value}"]`).click();
    };

    const checkIfKeyExists = () => {
        // Check if the generated key is shown in the success view.
        cy.get('[role="dialog"]').last().within(() => {
            cy.get('#api-key-value', { timeout: 30000 }).should('not.be.empty');
            cy.contains('button', 'Close').click();
        });
    };

    const generateApiKey = (name, restrictionType = 'none', restrictionValue = '') => {
        cy.contains('button', 'Generate API Key').click();
        cy.get('[role="dialog"]').last().within(() => {
            cy.contains('label', 'Name').parents('.MuiFormControl-root').find('input').type(name);
        });

        if (restrictionType !== 'none') {
            selectSecurityRestriction(restrictionType);
            const restrictionLabel = restrictionType === 'ip' ? 'IP Address' : 'Referrer URL';
            cy.get('[role="dialog"]').last().within(() => {
                cy.contains('label', restrictionLabel)
                    .parents('.MuiFormControl-root')
                    .find('input')
                    .type(restrictionValue);
            });
        }

        cy.get('[role="dialog"]').last().within(() => {
            cy.contains('button', /^Generate API Key$/).click();
        });
        checkIfKeyExists();
    };

    it("Generate API Keys", () => {
        cy.loginToPublisher(publisher, password);
        Utils.addAPIWithEndpoints({ name: apiName, version: apiVersion, context: apiContext }).then((apiId) => {
            testApiId = apiId;
            cy.visit(`/publisher/apis/${apiId}/overview`);
            cy.get('#itest-api-details-api-config-acc').click();
            cy.get('#left-menu-itemRuntimeConfigurations').click();
            cy.wait(2000);
            cy.get('#applicationLevel').click();
            cy.wait(1000);
            cy.get('#api-security-api-key-checkbox').check({ force: true });
            cy.get('#save-runtime-configurations').click();

            Utils.publishAPI(apiId).then(() => {
                cy.logoutFromPublisher();
                cy.loginToDevportal(developer, password);

                createAppForTest();

                cy.visit(`/devportal/apis/${apiId}/api-keys?tenant=carbon.super`);
                cy.url({ timeout: 30000 }).should('contain', `/apis/${apiId}/api-keys`);
                cy.contains('API Keys', { timeout: 30000 }).should('exist');

                // Generate without restriction.
                generateApiKey(`${appName}-none`);

                // Generate with IP restriction.
                generateApiKey(`${appName}-ip`, 'ip', '192.168.1.2');

                // Generate with referrer restriction.
                generateApiKey(`${appName}-referrer`, 'referrer', 'https://www.example.com/path');
            });
        });
    });

    after(() => {
        if (appCreated) {
            cy.deleteApp(appName);
        } else {
            cy.log(`Skipping deleteApp for ${appName} because app creation did not complete.`);
        }
        if (testApiId) {
            Utils.deleteAPI(testApiId);
        }
    });
});
