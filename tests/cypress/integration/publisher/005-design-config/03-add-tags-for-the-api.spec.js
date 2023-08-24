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

describe("Add tags for the api", () => {
  const { publisher, password } = Utils.getUserInfo();
  const apiName = Utils.generateName();
  const apiVersion = "1.0.0";
  const tagName = "test";

  before(function () {
    cy.loginToPublisher(publisher, password);
  });

  it("Add tags for the api", () => {
    Utils.addAPI({ name: apiName, version: apiVersion }).then((apiId) => {
      cy.visit(`/publisher/apis/${apiId}/overview`, {
        timeout: Cypress.config().largeTimeout,
      });
      cy.get("#itest-api-details-portal-config-acc").click();
      cy.get("#left-menu-itemDesignConfigurations").click();

      cy.get("#tags").click();
      cy.get("#tags").type(`${tagName}{enter}`);

      cy.get("#design-config-save-btn").scrollIntoView().click();
      cy.get("#design-config-save-btn").then(function () {
        cy.get('div[role="button"] span').contains(tagName).should("exist");
      });

      Utils.deleteAPI(apiId);
    });
  });
});
