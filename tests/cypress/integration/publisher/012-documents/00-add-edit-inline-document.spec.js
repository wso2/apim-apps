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

describe("creating document", () => {
    const { publisher, password, } = Utils.getUserInfo();

    before(function() {
        cy.loginToPublisher(publisher, password);
    })
    it.only("Creating inline document", () => {
        const documentName = 'api_document';
        const documentSummary = 'api document summery';
        Utils.addAPI({}).then((apiId) => {
            cy.visit(`/publisher/apis/${apiId}/overview`);
            cy.get('#itest-api-details-portal-config-acc').click();
            cy.get('#left-menu-itemdocuments').click();

            cy.get('[data-testid="add-document-btn"]').click();
            cy.get('#doc-name').type(documentName);
            cy.get('#doc-summary').click();
            cy.get('#doc-summary').type(documentSummary);
            cy.get('#add-document-btn').scrollIntoView();
            cy.get('#add-document-btn').click();
            cy.get('#add-content-back-to-listing-btn').click();

            // Checking it's existence
            cy.get('table a').contains(documentName).should('be.visible');

            // Test is done. Now delete the api
            Utils.deleteAPI(apiId);
        });
    });
});