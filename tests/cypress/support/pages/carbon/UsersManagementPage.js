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
class UsersManagementPage {
    static getUrl(){
        return "/carbon/user/user-mgt.jsp";
    }
    static getEnterUsernameTextBox(){
        return cy.get('input[name="org.wso2.carbon.user.filter"]');

    }
    static getSearchUsershButton(){
        return cy.get('input[value="Search Users"]')
    }

    static getNoMatchingUsersFoundDialogBox_OKButton(){
        return cy.get("div.ui-dialog-buttonset > button.ui-button")
    }

    static getNameColumnOfFirstRow(){
        return cy.get('table[id="userTable"] > tbody > tr > td:first-child')
    }

    static getNoMatchingUsersFoundDialogBox_MessageInfoDiv(){
        return cy.get('#messagebox-info')
    }
    static getNoMatchingUsersFoundDialogBox_MessageInfoDivSelectorOnly(){
        return '#messagebox-info'
    }
    static getDeleteButtonOfUser(userName){
        return cy.get(`[onClick="deleteUser(\\'${userName}\\')"]`)
    }
    static getAssignRolesButtonOfUser(userName){
        return cy.get(`a[href="edit-user-roles.jsp?username=${userName}&displayName=${userName}"]`)
    }
    static getDeleteDialogYesButton(){
        return cy.get('.ui-dialog  .ui-dialog-buttonpane button:first-child').first()
    }
    // there can be multiple dialog boxes if we search and delete
    static getDialogOkButton(index){
        return cy.get('.ui-dialog-buttonpane button').eq(index)
    }
}

export default UsersManagementPage;