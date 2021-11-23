
/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

describe("Add Edit Delete Microgateway lables", () => {
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';

    before(function(){
        cy.loginToAdmin(carbonUsername, carbonPassword);
    })
    it.only("Add Edit Delete Microgateway lables", () => {
       cy.get('[data-testid="Gateways-link"]').click();
       cy.get('.MuiButton-label').contains('Add Gateway Label').click();
       cy.get('input[name="name"]').type('MARKETING_STORE');
       cy.get('input[name="0"]').type('https://localhost:9095');
       cy.get('button > span').contains('Save').click();
       cy.get('table tr td').contains('MARKETING_STORE').should('exist');

       // editing
       cy.get('[data-testid="MuiDataTableBodyCell-4-0"] div > span:first-child').click();
       cy.get('textarea[name="description"]').type('marketing store');
       cy.get('button > span').contains('Save').click();
       cy.get('table tr td').contains('marketing store').should('exist');

       // deleting
       cy.get('[data-testid="MuiDataTableBodyCell-4-0"] div > span:nth-child(2)').click();
       cy.get('button > span').contains('Delete').click();
       cy.get('.MuiButton-label').contains('Add Gateway Label').should('exist');
    });

})
