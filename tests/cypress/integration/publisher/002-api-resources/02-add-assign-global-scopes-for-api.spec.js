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
import PublisherComonPage from "../../../support/pages/publisher/PublisherComonPage";
const publisherComonPage = new PublisherComonPage();

describe("Add assign global scopes for api", () => {
  const { carbonUsername, carbonPassword } = Utils.getUserInfo();
  const verb = "post";
  const random_number = Math.floor(Date.now() / 1000);
  const scopeName = "test" + random_number;
  const scopeDescription = "test scope description";
  const role = "internal/publisher";
  const apiName = Utils.generateName();
  const apiVersion = "1.0.0";
  const target = "/test";

  const addApiAndResource = (verb, apiId) => {
    // Typing the resource name
    cy.visit(`/publisher/apis/${apiId}/resources`, {
      timeout: Cypress.config().largeTimeout,
    });
    cy.get("#operation-target").type(target);
    cy.get("body").click();
    cy.get("#add-operation-selection-dropdown").click();

    // Checking all the operations
    cy.get(`#add-operation-${verb}`).click();

    cy.get("body").click();
    cy.get("#add-operation-button").click();
    cy.get("#resources-save-operations").click();

    // Validating if the resource exists after saving
    cy.get("#resources-save-operations", { timeout: 30000 });

    cy.get(`#${verb}\\${target}`).should("be.visible");
  };

  it("Add assign global scopes for api", () => {
    cy.loginToPublisher(carbonUsername, carbonPassword);
    Utils.addAPI({ name: apiName, version: apiVersion }).then((apiId) => {
      addApiAndResource(verb, apiId);
      //create a global scope
      cy.visit(`${Cypress.config().baseUrl}/publisher/scopes`, {
        timeout: Cypress.config().largeTimeout,
      });
      publisherComonPage.waitUntillPublisherLoadingSpinnerExit();
      cy.wait(5000);
      cy.get('a[href="/publisher/scopes/create"]').click({ force: true });

      cy.wait(2000);
      cy.get("input#name").click({ force: true });
      cy.get("input#name").type(scopeName, { force: true });

      cy.get("#displayName").click();
      cy.get("#displayName").type(scopeName);

      cy.get("#description").click();
      cy.get("#description").type(scopeDescription);

      cy.get('input[placeholder="Enter roles and press Enter"]').click();
      cy.get('input[placeholder="Enter roles and press Enter"]').type(
        `${role}{enter}`
      );

      cy.get("button > span").contains("Save").click();

      cy.get("tbody").get("tr").contains(scopeName).should("be.visible");

      // Go to resources page
      cy.visit(`/publisher/apis/${apiId}/resources`, {
        timeout: Cypress.config().largeTimeout,
      });

      // Open the operation sub section
      cy.get(`#${verb}\\${target}`).click();
      cy.get(`#${verb}\\${target}-operation-scope-select`, { timeout: 3000 });
      cy.get(`#${verb}\\${target}-operation-scope-select`).click();
      cy.get(`[data-value=${scopeName}]`).click();
      cy.get(`[data-value=${scopeName}]`).type("{esc}");
      // // Save the resources
      cy.get("#resources-save-operations").click();

      cy.get("#resources-save-operations", { timeout: 30000 });
      cy.get(`#${verb}\\${target}-operation-scope-select`)
        .contains(scopeName)
        .should("be.visible");

      Utils.deleteAPI(apiId);
    });
  });
});
