/*
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com) All Rights Reserved.
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

describe("Add deny policies", () => {
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';

    before(function () {
        cy.loginToAdmin(carbonUsername, carbonPassword);
    })
    it.only("Add deny policies", () => {
        const ipAddress = '127.0.0.1';
        cy.get('[data-testid="Deny Policies-child-link"]').click();
        cy.get('.MuiButton-label').contains('Add Policy').click();
        cy.get('input[value="IP"]').click();
        cy.get('input[name="fixedIp"]').type(ipAddress);
        cy.get('button.MuiButton-containedPrimary > span').contains('Deny').click();
        cy.get('[data-testid="MuiDataTableBodyCell-1-0"] div').contains(ipAddress).should('exist');

        // delete
        cy.get(`[data-testid="IP-actions"] svg`).click();
        cy.get('button > span').contains('Delete').click();
        cy.get('div[role="status"]').should('have.text','Deny Policy successfully deleted.');
    });

})

