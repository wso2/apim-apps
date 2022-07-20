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
class ResourcesPage {
    getUrl(apiID){
        return `publisher/apis/${apiID}/resources`;
    }
    getResourcePageHeader(){
        return cy.get('#itest-api-details-resources-head')
    }
    getSaveRerouceButton(){
        return cy.get('#resources-save-operations')
    }
    selectAndAddNewOperation(httpVerb,uriPattern){
            cy.get('#operation-target').type(uriPattern, {
                parseSpecialCharSequences: false,
              })
            cy.get('#add-operation-selection-dropdown').click()
        
            switch(httpVerb) {
                case "GET":
                    cy.get('#add-operation-get').click()
                  break;
                case "POST":
                  cy.get('#add-operation-post').click()
                  break;
                case "PUT":
                  cy.get('#add-operation-put').click()
                break;
                // TODO : add rest of the httpVerbs 
            }
            cy.get('#menu-verbs').trigger('click') // to remove this covered element
            cy.get('#add-operation-button').click()
    }

    getRowOfResource(uriPattern){ // e.g. "/order"
        return cy.get(`div[aria-labelledby="${uriPattern}"] > div > div > div > div`)
    }
    getDescriptionTextAreaOfResource(resourceAlis){ // e.g. "post/order"
        return cy.get(`div[data-testid="description-${resourceAlis}"] > div > textarea`)
    }
    getSummaryTextAreaOfResource(resourceAlis){ // e.g. "post/order"
        return cy.get(`div[data-testid="summary-${resourceAlis}"] > div > textarea`)
    }
    selectOperationScopeOfResource(resourceAlis,scopeName){ // e.g. ("post/order","order_pizza")
        cy.get(`div[id="${resourceAlis}-operation-scope-select"]`).click()
        cy.get(`li[id="${resourceAlis}-operation-scope-${scopeName}"]`).click()
        cy.get('#menu-').trigger('click') // to get back the focus , pages is coverd from this element
    }
    getSaveButton(){
        return cy.get('button[data-testid="custom-select-save-button"]')
    }
}
export default ResourcesPage;