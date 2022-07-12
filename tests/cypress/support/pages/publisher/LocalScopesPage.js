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
class LocalScopesPage {
    getUrl(apiID){
        return cy.get(`publisher/apis/${apiID}/scopes`);
    }
    getLocalScopesHeader(){
        return cy.get('#itest-api-details-scopes-onboarding-head')
    }
    getCreateScopesButton(){
        return cy.get('#create-scope-btn')
    }
    getScopeNameTextBox(){
        return cy.get('#name')
    }
    getScopeDisplayNameTextBox(){
        return cy.get('#displayName')
    }
    getScopeDescriptionTextBox(){
        return cy.get('#description')
    }
    getRolesTextBox(){
        return cy.get('#roles-input')
    }
    getSaveButton(){
        return cy.get('#scope-save-btn')
    }
    
}
export default LocalScopesPage;