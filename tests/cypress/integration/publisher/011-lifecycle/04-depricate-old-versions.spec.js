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

describe("Depricate old versions of api before publishing", () => {
  const { publisher, password } = Utils.getUserInfo();
  const apiName = Utils.generateName().replace("-", "_");
  const apiVersion = "1.0.0";
  const newVersion = "2.0.0";

  const deployandPublish = (apiId) => {
    // Going to deployments page
    cy.get("#left-menu-itemdeployments").click();

    // Deploying
    cy.wait(5000);
    cy.get("#add-description-btn").click();
    cy.get("#add-description").click();
    cy.get("#add-description").type("test");
    cy.wait(2000);
    cy.get("#deploy-btn", { timeout: Cypress.config().largeTimeout })
      .should("not.have.class", "Mui-disabled")
      .click();
    cy.wait(2000);
    cy.get("#undeploy-btn")
      .should("not.have.class", "Mui-disabled")
      .should("exist");
  };

  before(function () {
    cy.loginToPublisher(publisher, password);
  });

  it.only("Depricate old versions of api before publishing", () => {
    Utils.addAPIWithEndpoints({ name: apiName, version: apiVersion }).then(
      (apiId) => {
        cy.visit(`/publisher/apis/${apiId}/overview`, {
          timeout: Cypress.config().largeTimeout,
        });
        cy.get("#itest-api-details-portal-config-acc").click();
        cy.get("#left-menu-itemsubscriptions").click();
        cy.get('[data-testid="policy-checkbox-silver"]').click();
        cy.get("#subscriptions-save-btn").click();

        // Going to deployments page and publish
        deployandPublish(apiId);
        cy.get("#left-menu-itemlifecycle").click();
        cy.wait(2000);
        cy.get('[data-testid="Publish-btn"]').click();

        //create new version
        cy.get("#create-new-version-btn").click();
        cy.wait(3000);
        cy.get("#newVersion").type(newVersion);
        cy.intercept("**/apis/**").as("apiGet");
        cy.get("#createBtn", { timeout: 30000 }).click();
        cy.get("#itest-api-name-version", { timeout: 30000 }).should(
          "be.visible"
        );
        cy.wait(2000);
        cy.get("#itest-api-name-version").contains(`${apiName} :${newVersion}`);

        cy.url().then((url) => {
          const newAPIid = url.split("/")[5];

          deployandPublish(newAPIid);

          //depricate old version
          cy.get("#left-menu-itemlifecycle").click();
          cy.wait(2000);
          cy.get('[type="checkbox"]').check(
            "Deprecate old versions after publishing the API"
          );
          cy.get(
            'input[value="Deprecate old versions after publishing the API"]'
          ).should("be.checked");
          cy.get('[data-testid="Publish-btn"]').click();

          cy.visit(`/publisher/apis`, {
            timeout: Cypress.config().largeTimeout,
          });
          publisherComonPage.waitUntillPublisherLoadingSpinnerExit();
          cy.get("#searchQuery").type(apiName).type("{enter}");
          cy.wait(10000);
          cy.get(`div[data-testid="card-action-${apiName}1.0.0"]`, {
            timeout: Cypress.config().largeTimeout,
          }).click();
          cy.wait(3000);
          cy.get(`div[data-testid="card-action-${apiName}1.0.0"]>div>span`, {
            timeout: Cypress.config().largeTimeout,
          })
            .contains("DEPRECATED")
            .should("exist");

          Utils.deleteAPI(apiId);
          Utils.deleteAPI(newAPIid);
        });
      }
    );
  });
});
