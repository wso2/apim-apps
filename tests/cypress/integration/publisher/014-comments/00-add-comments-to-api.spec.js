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

describe("adding comment", () => {
    const { publisher, password, } = Utils.getUserInfo();

    beforeEach(function () {
        cy.loginToPublisher(publisher, password);
    })

    it.only("Adding comments per API",{
        retries: {
          runMode: 3,
          openMode: 0,
        },
      }, () => {
        const comment = 'test api';
        Utils.addAPI({}).then((apiId) => {
            cy.intercept('**/comments?limit=5&offset=0').as('commentsGet');
            cy.visit(`/publisher/apis/${apiId}/comments`);
            cy.wait('@commentsGet', {timeout: 30000}).then(() => {
                cy.get('#standard-multiline-flexible').click();
                cy.get('#standard-multiline-flexible').type(comment);
                cy.get('#add-comment-btn').click();
    
                // Checking it's existence
                cy.get('#comment-list').contains(comment).should('be.visible');
            })
        });
    });
    afterEach(function () {
        // Test is done. Now delete the api
        Utils.deleteAPI(apiId);
    })
});