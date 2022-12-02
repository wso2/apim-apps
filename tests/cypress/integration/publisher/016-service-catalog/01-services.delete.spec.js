/*
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com) All Rights Reserved.
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

const CARBON_ORIGIN = Utils.getAppOrigin();
describe("Service catalog delete flow", () => {
    const username = 'admin'
    const password = 'admin'
    beforeEach(function () {
        // login before each test
        cy.loginToPublisher(username, password)
    })

    it("Delete all APIs", () => {
        cy.visit(`${CARBON_ORIGIN}/publisher/service-catalog`);
        cy.get('#itest-services-listing-total')
            .then(
                (countElement) => {
                    let totalServices = parseInt(countElement.text());
                    debugger;
                    while (totalServices  > 0) {
                        cy.get('#itest-service-card-delete').click();
                        cy.get('#itest-service-card-delete-confirm').click();
                        totalServices -= 1;
                    }
                    cy.get('#itest-service-catalog-onboarding').should('be.visible')
                }
            )
    });
})
