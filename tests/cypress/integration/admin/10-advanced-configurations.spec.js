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

import adavanceConfFalseJson from "../../fixtures/api_artifacts/advanceConfigFlase.json"
import adavanceConfTrueJson from "../../fixtures/api_artifacts/advanceConfigTrue.json"

describe("Advanced Configurations", () => {
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';

    before(function () {
        cy.loginToAdmin(carbonUsername, carbonPassword);
    })
    it.only("Advanced configurations", () => {
        
        cy.get('[data-testid="Advanced-child-link"]').click();

        cy.intercept('GET', 'https://localhost:9443/api/am/admin/v4/tenant-config', {
            statusCode: 200,
            body: adavanceConfFalseJson
            
        })
        cy.get('[data-testid="Scope Assignments-child-link"]').click();
        cy.get('[data-testid="Advanced-child-link"]').click();
        cy.wait(3000);
        cy.get('[data-testid="monaco-editor-save"]').click();

        cy.intercept('GET', 'https://localhost:9443/api/am/admin/v4/tenant-config', {
            statusCode: 200,
            body: adavanceConfTrueJson
        })
        cy.get('[data-testid="Scope Assignments-child-link"]').click();
        cy.get('[data-testid="Advanced-child-link"]').click();
        cy.wait(2000);
        cy.get('[data-testid="monaco-editor-save"]').click();

    });

 })