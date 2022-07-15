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

describe("Application tests", () => {
    const { developer, password } = Utils.getUserInfo();

    const appName = Utils.generateName();
    const appDescription = 'JWT application description';

    it.only("Add Applications for JWT token Type", () => {
        cy.loginToDevportal(developer, password);
        cy.createApp(appName, appDescription);
    })

    after(() => {
        cy.deleteApp(appName);
    })

})