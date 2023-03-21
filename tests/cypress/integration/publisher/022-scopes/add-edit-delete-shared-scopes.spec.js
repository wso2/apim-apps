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

describe('publisher-022-01 : Verify CRUD operation in shared scopes', () => {
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';

    before(function () {
        cy.loginToPublisher(carbonUsername, carbonPassword);
    })


    it.only('Verify creating shared scopes for API', () => {

          const scopeName = 'admin_scope';
          const displayName = 'adminscope';
          const description = 'admin scope description';
        
        cy.visit(`/publisher/scopes/create`);

        cy.get('#name').type(scopeName);
        cy.get('#displayName').type(displayName);
        cy.get('#description').type(description);
        cy.contains('label', 'Roles').next().type('admin{enter}');
        cy.get('button > span').contains('Save').click();
    
          //Checking the scope existence
          cy.get('[data-testid="MuiDataTableBodyCell-1-0"]').contains(scopeName).should('be.visible'); 
         
           //editing
           cy.get('table tr td div a > span').contains('Edit').click();
           cy.get('#displayName').clear().type('ADMIN SCOPE');
           cy.get('#description').clear().type('Edited admin scope description');
           cy.get('button > span').contains('Update').click();
           cy.get('table').contains('td','Edited admin scope description').should('exist');


          //deleting
          cy.get('table tr td div button > span').contains('Delete').click();
          cy.get('button > span').contains('Yes').click();
          cy.wait(1000);
          cy.get('div[role="status"]').should('have.text','API Scope deleted successfully!');

    })
          
 })
