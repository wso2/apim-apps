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

describe("Download sdks)", () => {
  const { developer, publisher, password } = Utils.getUserInfo();
  const apiName = Utils.generateName();
  const apiVersion = "1.0.0";
  const apiContext = apiName;

  let testApiId;

  it.only("Download sdks", () => {
    cy.loginToPublisher(publisher, password);

    Utils.addAPIWithEndpoints({
      name: apiName,
      version: apiVersion,
      context: apiContext,
    }).then((apiId) => {
      cy.log("API created " + apiName);
      testApiId = apiId;
      Utils.publishAPI(apiId).then((result) => {
        cy.log("API published " + result);
        cy.logoutFromPublisher();

        cy.loginToDevportal(developer, password);
        cy.visit(`/devportal/apis/${apiId}/sdk?tenant=carbon.super`);
        cy.get("#download-sdk-btn").click();

        const fileName = `${apiName}_${apiVersion}_android`;

        const downloadsFolder = Cypress.config("downloadsFolder");
        const downloadedFilename = `${downloadsFolder}/${fileName}.zip`;

        cy.readFile(downloadedFilename, "binary", { timeout: 15000 }).should(
          (buffer) => expect(buffer.length).to.be.gt(100)
        );
        cy.logoutFromDevportal();
        devportalComonPage.waitUntillDevportalLoaderSpinnerExit();

        cy.loginToPublisher(publisher, password);
        Utils.deleteAPI(apiId);
      });
    });
  });
});
