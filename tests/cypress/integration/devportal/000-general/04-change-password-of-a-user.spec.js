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
import DevportalComonPage from "../../../support/pages/devportal/DevportalComonPage";
const devportalComonPage = new DevportalComonPage();

describe("Change the password from devportal", () => {
  const username = "newuser";
  const password = "test123";
  const newPassword = "test456";

  const { carbonUsername, carbonPassword } = Utils.getUserInfo();

  it.only("Change the password from devportal", () => {
    cy.carbonLogin(carbonUsername, carbonPassword);
    cy.addNewUser(username, ["Internal/subscriber"], password);
    cy.get(".ui-dialog-buttonset", { timeout: Cypress.config().largeTimeout });
    cy.get("button").contains("OK").click();
    cy.get("#userTable").contains("td", "newuser").should("exist");
    cy.carbonLogout();

    cy.loginToDevportal(username, password);
    cy.get("#userToggleButton").click();
    cy.get("#menu-list-grow").within(() => {
      cy.get("ul li:first").contains("Change Password").click();
    });

    //Add new password

    cy.get("input#current-password").click();
    cy.get("input#current-password").type(password);

    cy.get("input#new-password").click();
    cy.get("input#new-password").type(newPassword);

    cy.get("input#repeated-new-password").click();
    cy.get("input#repeated-new-password").type(newPassword);

    cy.get("button").contains("Save").click();

    cy.logoutFromDevportal();
    devportalComonPage.waitUntillDevportalLoaderSpinnerExit();
    cy.wait(3000);

    //login to devportal again to verify password change

    cy.loginToDevportal(username, newPassword);

    cy.carbonLogin(carbonUsername, carbonPassword);
    cy.visit(`${Utils.getAppOrigin()}/carbon/user/user-mgt.jsp`);
    cy.deleteUser(username);
  });
});
