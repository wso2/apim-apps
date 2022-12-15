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

describe("Endpoint certificate usage testing", () => {
    const { publisher, password } = Utils.getUserInfo();
    const random_number = Utils.getRandomRange(10, 20);
    const selectedEndpoint = `https://test.wso2.com/v1/api/endpoint0`;
    const certPath = 'api_artifacts/sample.crt.pem';
    const alias = Utils.generateName();
    let apiId;
    let apiIds;

    before(function () {
        cy.loginToPublisher(publisher, password);
        cy.wait(5000)

        let data;
        let promises = [];

        for (let i = 0; i < random_number; i++) {
            const endpoint = `https://test.wso2.com/v1/api/endpoint${i}`;
            data = { endpoint };
            promises.push(Utils.addAPIWithEndpoints(data));
            cy.wait(2000);
        }

        Cypress.Promise.all(promises).then(res => {
            apiIds = res;
            apiId = apiIds[0];

            // Uploading a certificate
            // Visiting endpoints tab of selected API
            cy.visit(`/publisher/apis/${apiId}/overview`);
            cy.wait(5000);
            cy.get('[data-testid="itest-api-config"]', { timeout: Cypress.config().largeTimeout }).click();
            cy.get('#left-menu-itemendpoints').click();

            // Expand the general config section to upload certificate
            cy.get('#http-panel1bh-header').trigger('click');
            cy.get('#certs-add-btn').click();

            // Select endpoint
            cy.get('#endpoint-certificate').click();
            cy.get(`[data-value="${selectedEndpoint}"]`).click({ multiple: true });

            // Set alias
            cy.get('#certificateAlias').click();
            cy.get('#certificateAlias').type(alias);

            // Select the cert
            cy.get('[data-testid="cert-upload-btn"]').click();
            cy.get('input[type="file"]').attachFile(certPath);

            // Click away
            cy.get('#certificateAlias').click();

            // Save the cert
            cy.get('#upload-cert-save-btn').click();

            // Logout
            cy.visit(`/publisher/services/logout`);
        });
    })

    beforeEach(function () {
        cy.loginToPublisher(publisher, password);
        cy.wait(5000);

        // Visiting endpoints tab of selected API
        cy.visit(`/publisher/apis/${apiId}/overview`);
        cy.get('[data-testid="itest-api-config"]', { timeout: Cypress.config().largeTimeout }).click();
        cy.get('#left-menu-itemendpoints').click();

        // Expand the general config section to upload certificate
        cy.get('#http-panel1bh-header').trigger('click');
    })

    it.only("Has correctly working pagination", () => {
        cy.get('#certificate-usage-btn').click();

        // Test pagination - num of rows 5
        testPagination(5, random_number);

        // Test pagination - num of rows 10
        cy.get("#pagination-rows").click();
        cy.get("#pagination-menu-list>li").eq(1).click();
        testPagination(10, random_number);

        cy.get('#certificate-usage-cancel-btn').click();
    });

    it.only("Has correct warning message", () => {
        // Expected warning message
        const expectedMessage = `${alias} is used by ${random_number} other APIs`;

        // Test for correct warning message
        cy.get('#delete-cert-btn').click({ force: true });
        cy.get('#warning-message>p').should('include.text', expectedMessage);

        // Delete certificate
        cy.get('#delete-cert-confirm-btn').click({ force: true });
    });

    after(function () {
        apiIds.forEach( id => {
            Utils.deleteAPI(id);
        })
    });
});

function testPagination(numOfRows, random_number) {
    cy.get("#certificate-usage-table")
        .find("tr")
        .should('have.length', numOfRows + 2); // Plus two is for table header and footer

    let pages = Math.floor(random_number / numOfRows);
    let numOfRowsInFinalPage = random_number % numOfRows;

    if (pages === 0) {
        cy.get("#certificate-usage-table")
            .find("tr")
            .should('have.length', numOfRows + 2);
    } else if (numOfRowsInFinalPage === 0) {
        for (let i = 0; i < pages - 1; i++) {
            cy.get("#pagination-next").click();
            cy.wait(1000);
        }
        cy.get("#certificate-usage-table")
            .find("tr")
            .should('have.length', numOfRows + 2);
        for (let i = 0; i < pages - 1; i++) {
            cy.get("#pagination-back").click();
            cy.wait(1000);
        }
    } else {
        for (let i = 0; i < pages; i++) {
            cy.get("#pagination-next").click();
            cy.wait(1000);
        }
        cy.get("#certificate-usage-table")
            .find("tr")
            .should('have.length', numOfRowsInFinalPage + 2);
        for (let i = 0; i < pages; i++) {
            cy.get("#pagination-back").click();
            cy.wait(1000);
        }
    }
}
