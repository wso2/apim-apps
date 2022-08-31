/*
 * Copyright (c) 2022, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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
class AddNewUserStep1Page {

    static getUrl(){
        return "/carbon/user/add-step1.jsp"; 
    }
    static visitURL(){
        cy.visit(this.getUrl());
    }
    static getUsernameTextBox(){
        return cy.get('input[name="username"]', {timeout: Cypress.config().largeTimeout});
    }
    static getPasswordTextBox(){
        return cy.get('#password');
    }
    static getConfirmPasswordTextBox(){
        return cy.get('#password-repeat');
    }
    static getFinishButton(){
        return cy.get('.button[value="Finish"]') 
    }
    static getUserAddedDialogOKButton(){
        return cy.get('.ui-dialog-buttonset button.ui-button')
    }




    getDeleteButtonOfRole(roleName){
        return cy.get(`[onClick="deleteUserGroup(\\'${roleName}\\')"]`)
    }

    getDialogYesButton(){
        return cy.get('div.ui-dialog-buttonset > button.ui-button').first()
    }
    // there can be multiple dialog boxes if we search and delete
    getDialogOkButton(index){
        return cy.get('.ui-dialog-buttonpane button').eq(index)
    }
    getNoMatchingRolesFoundDialogBox_MessageInfoDivSelectorOnly(){
        return '#messagebox-info'
    }
}

export default AddNewUserStep1Page;



