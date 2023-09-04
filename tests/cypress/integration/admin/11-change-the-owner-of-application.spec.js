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
import DevportalComonPage from "../../support/pages/devportal/DevportalComonPage";
const devportalComonPage = new DevportalComonPage();

describe("Change the owner of application", () => {
  const { developer, password } = Utils.getUserInfo();
  const appName = Utils.generateName();
  const appDescription = "Owner testing application";
  const carbonUsername = "admin";
  const carbonPassword = "admin";

  it.only("Change the owner of application", () => {
    //Create application
    cy.loginToDevportal(developer, password);
    cy.createApp(appName, appDescription);
    cy.logoutFromDevportal();
    devportalComonPage.waitUntillDevportalLoaderSpinnerExit();

    //login to admin portal
    cy.loginToAdmin(carbonUsername, carbonPassword);
    cy.get('[data-testid="Applications-child-link"]').click({ force: true });
    cy.get("#itest-application-list-table").within(() => {
      cy.contains("tr", appName).within(() => {
        cy.get("td > span").click({ force: true });
      });
    });

    //change the owner
    cy.get('div[role="dialog"]').contains("div", "owner");
    cy.get('input[name="owner"]').click().clear();
    cy.get('input[name="owner"]').type("admin");
    cy.get('[data-testid="Save-btn"]').click();
    cy.wait(5000);
    cy.get("#itest-application-list-table").within(() => {
      cy.contains("tr", appName).within(() => {
        cy.get("td").eq(1).should("have.text", "admin");
      });
    });

    cy.logoutFromAdminPortal();
    cy.loginToDevportal(carbonUsername, carbonPassword);
    cy.deleteApp(appName);
  });
});
