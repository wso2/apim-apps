/// <reference types="Cypress" />
/*
 * Copyright (c) 2023, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

describe('publisher-022-00 : Verify CRUD operations in local scopes', () => {
    const { publisher, password, } = Utils.getUserInfo();
   
    before(function () {
      cy.loginToPublisher(publisher, password)
        
    })

    it.only("Verify creating local scopes for an API",() => {

        const scopeName = 'publisher_scope';
        const displayName = 'publisher scope';
        const scopeDescription = 'publisher scope description';

        Utils.addAPI({}).then((apiId) => {
            cy.visit(`/publisher/apis/${apiId}/overview`);
            cy.get('[data-testid="itest-api-config"]').click();
            cy.get('#left-menu-itemLocalScopes').click();

            cy.get('#create-scope-btn').click();
            cy.get('#name').type(scopeName);
            cy.get('#displayName').type(displayName);
            cy.get('#description').type(scopeDescription);
            cy.get('#roles-input').type('admin{enter}')
            cy.get('#scope-save-btn').click();

        //Checking the scope existence
        cy.get('[data-testid="MuiDataTableBodyCell-0-0"]').contains(scopeName).should('be.visible');  
      

        //editing
        cy.get('table tr td div > table tr').contains('Edit').click();
        cy.get('#displayName').clear().type('PUBLISHER SCOPE');
        cy.get('#description').clear().type('Edited publisher scope description');
        cy.get('button > span').contains('Update').click();
        cy.get('table').contains('td','Edited publisher scope description').should('exist');
      

        //deleting
        cy.get('table tr td div > table tr').contains('Delete').click();
        cy.get('button > span').contains('Yes').click();
        cy.wait(1000);
        cy.get('div[role="status"]').should('have.text','API Scope deleted successfully!');


        Utils.deleteAPI(apiId);

     });

   })

 })


