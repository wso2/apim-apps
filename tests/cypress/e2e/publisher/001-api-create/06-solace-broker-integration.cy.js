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

describe("Publish solace api", () => {
    const { publisher, developer, password} = Utils.getUserInfo();

    let apiName;
    it.only("Solace broker integration", {
        retries: {
            runMode: 3,
            openMode: 0,
        },
    }, () => {
        apiName = Utils.generateName().replace('-', '_');
        cy.loginToPublisher(publisher, password);
        cy.publishSolaceApi(apiName);
        cy.logoutFromPublisher();
        cy.loginToDevportal(developer, password);
        cy.viewSolaceApi(apiName);
        cy.logoutFromDevportal();

    });

    afterEach(function () {
        // Test is done. Now delete the api
        cy.loginToPublisher(publisher, password);
        cy.deleteApi(apiName, '0.0.1');
        cy.logoutFromPublisher();
    });
});

