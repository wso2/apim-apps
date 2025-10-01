/*
*  Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com) All Rights Reserved.
*
*  WSO2 Inc. licenses this file to you under the Apache License,
*  Version 2.0 (the "License"); you may not use this file except
*  in compliance with the License.
*  You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

import Utils from "@support/utils";

describe("add nested comments", () => {
  const { carbonUsername, carbonPassword } = Utils.getUserInfo();
  let testApiId;

  beforeEach(function () {
    cy.loginToPublisher(carbonUsername, carbonPassword);
  });

  it.only("Add nested comments to to the api", () => {
    const comment = "test_1";
    const reply = "test_2";
    Utils.addAPI({}).then((apiId) => {
      testApiId = apiId;
      cy.intercept("**/comments?limit=5&offset=0").as("commentsGet");
      cy.visit(`/publisher/apis/${apiId}/comments`);
      cy.wait("@commentsGet", { timeout: 50000 }).then(() => {
        cy.get("#standard-multiline-flexible", {
          timeout: Cypress.config().largeTimeout,
        }).click({ force: true });
        cy.wait(3000);
        cy.get("#standard-multiline-flexible").type(comment);
        cy.get("#add-comment-btn").click();

        // Checking it's existence
        cy.get("#comment-list").contains(comment).should("be.visible");

        // Adding a reply
        cy.get("button").contains("Reply").click();
        cy.get("#comment-list").within(() => {
          cy.get("#standard-multiline-flexible").click();
          cy.get("#standard-multiline-flexible").type(reply);
          cy.get("#add-comment-btn").click({ force: true });
        });
        cy.get("#comment-list").contains(reply).should("be.visible");
      });

      // Deleting the comment
      cy.get("#comment-list").within(() => {
        cy.get("button").contains("Delete").click();
        cy.intercept("DELETE", "**/comments/**").as("deleteComment");
      });
      cy.get('div[role="dialog"]')
        .find("button")
        .contains("Yes")
        .click();
      cy.wait("@deleteComment", { timeout: 30000 });

      cy.get("#comment-list").contains(comment).should("not.exist");
    });

    Utils.deleteAPI(testApiId);
  });
});
