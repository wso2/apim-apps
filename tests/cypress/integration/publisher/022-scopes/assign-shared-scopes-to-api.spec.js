/// <reference types="Cypress" />
/*
 * Copyright (c) 2023, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

describe("publisher-022-01 : Verify CRUD operation in shared scopes", () => {
  Cypress.on("uncaught:exception", (err, runnable) => {
    return false;
  });

  const carbonUsername = "admin";
  const carbonPassword = "admin";
  const target = "/test";
  const scopeName = "admin_scope";
  const displayName = "adminscope";
  const description = "admin scope description";
  let testApiId;

  const addSharedScope = () => {
    cy.visit(`/publisher/scopes/create`);

    cy.get("#name").type(scopeName);
    cy.get("#displayName").type(displayName);
    cy.get("#description").type(description);
    cy.contains("label", "Roles").next().type("admin{enter}");
    cy.get("button > span").contains("Save").click();

    //Checking the scope existence
    cy.get('[data-testid="MuiDataTableBodyCell-1-0"]')
      .contains(scopeName)
      .should("be.visible");
  };

  const addApiAndResource = (verb, apiId) => {
    // Typing the resource name
    cy.visit(`/publisher/apis/${apiId}/resources`);
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

  it.only(
    "Assign shared scopes for API",
    {
      retries: {
        runMode: 3,
        openMode: 0,
      },
    },
    () => {
      const random_number = Math.floor(Date.now() / 1000);
      const apiName = Utils.generateName();
      const verb = "post";
      const apiVersion = "1.0.0";
      cy.loginToPublisher(carbonUsername, carbonPassword);

      addSharedScope();
      Utils.addAPI({ name: apiName, version: apiVersion }).then((apiId) => {
        testApiId = apiId;
        addApiAndResource(verb, apiId);

        cy.visit(`/publisher/apis/${apiId}/resources`);

        // Open the operation sub section
        cy.get(`#${verb}\\${target}`).click();
        cy.get(`#${verb}\\${target}-operation-scope-select`, { timeout: 3000 });
        cy.get(`#${verb}\\${target}-operation-scope-select`).click();
        cy.get("ul, li").contains(scopeName).click();
        cy.get("ul, li").contains(scopeName).type("{esc}");
        //   cy.get(`#${verb}\\${target}-operation-scope-${scopeName}`).type('{esc}');
        // // Save the resources
        cy.get("#resources-save-operations").click();

        cy.get("#resources-save-operations", { timeout: 30000 });
        cy.get(`#${verb}\\${target}-operation-scope-select`)
          .contains(scopeName)
          .should("be.visible");

        Utils.deleteAPI(apiId);
      });
    }
  );
});
