/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

describe("Create api with swagger file super tenant", () => {

  const { publisher, password, tenantUser, tenant, } = Utils.getUserInfo();
  let testApiID;
  const openApiCreate = (url) => {
    // select the option from the menu item
    cy.visit(`/publisher/apis/create/openapi`);
    cy.wait(5000)
    // upload the swagger
    cy.get('[data-testid="swagger-url-endpoint"]', { timeout: Cypress.config().largeTimeout }).type(url)
    cy.get('body').click(0, 0);
    // go to the next step
    cy.get('#url-validated', { timeout: 30000 });
    cy.get('#open-api-create-next-btn').click();
    cy.wait(2000);
    cy.get('#itest-id-apiversion-input', { timeout: Cypress.config().largeTimeout });

    cy.get('#itest-id-apicontext-input').type('petstore3');
    cy.get('#itest-id-apiversion-input').click();
    cy.log("API version")
    cy.get('#itest-id-apiendpoint-input').clear();
    cy.get('#itest-id-apiendpoint-input').type(url).should('have.value', url);

    // finish the wizard
    cy.get('#open-api-create-btn').click({ force: true });

    // validate
    cy.get('#itest-api-name-version', { timeout: Cypress.config().largeTimeout });
    cy.get('#itest-api-name-version').contains("SwaggerPetstore");
    cy.url().then(url => {
      testApiID = /apis\/(.*?)\/overview/.exec(url)[1];

    });
  }
  afterEach(() => {
    Utils.deleteAPI(testApiID);

  })
  it("Create API from swagger from file openapi 2", {
    retries: {
      runMode: 3,
      openMode: 0,
    },
  }, () => {
    cy.loginToPublisher(publisher, password);
    openApiCreate('https://petstore.swagger.io/v2/swagger.json');
  });

  it("Create API from swagger from file openapi 3", {
    retries: {
      runMode: 3,
      openMode: 0,
    },
  }, () => {
    cy.loginToPublisher(publisher, password);
    openApiCreate('https://petstore3.swagger.io/api/v3/openapi.json');
  });

  it("Create API from swagger from file openapi 2 - tenant user", {
    retries: {
      runMode: 3,
      openMode: 0,
    },
  }, () => {
    cy.loginToPublisher(`${tenantUser}@${tenant}`, password);
    openApiCreate('https://petstore.swagger.io/v2/swagger.json');
  });

  it("Create API from swagger from file openapi 3 - tenant user", {
    retries: {
      runMode: 3,
      openMode: 0,
    },
  }, () => {
    cy.loginToPublisher(`${tenantUser}@${tenant}`, password);
    openApiCreate('https://petstore3.swagger.io/api/v3/openapi.json');
  });

})