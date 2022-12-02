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

describe("creating document", () => {
    const publisher = 'publisher';
    const password = 'test123';
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';

    before(function () {
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.addNewUser(publisher, ['Internal/publisher', 'Internal/creator', 'Internal/everyone'], password);
        cy.loginToPublisher(publisher, password);
    })

    it.only("Creating inline document", () => {
        const documentName = 'api_document';
        const documentSummary = 'api document summery';
        cy.createAPIWithoutEndpoint();
        cy.get('#itest-api-details-portal-config-acc').click();
        cy.get('#left-menu-itemdocuments').click();

        cy.get('#add-new-document-btn').click();
        cy.get('#doc-name').type(documentName);
        cy.get('#doc-summary').click();
        cy.get('#doc-summary').type(documentSummary);
        cy.get('#add-document-btn').scrollIntoView();
        cy.get('#add-document-btn').click();
        cy.get('#add-content-back-to-listing-btn').click();

        // Checking it's existence
        cy.get('table a').contains(documentName).should('be.visible');
    });

    after(function () {
        // Test is done. Now delete the api
        cy.get(`#itest-id-deleteapi-icon-button`).click({force:true});
        cy.get(`#itest-id-deleteconf`).click();

        cy.visit(`${Utils.getAppOrigin()}/carbon/user/user-mgt.jsp`);
        cy.deleteUser(publisher);
    })
});

