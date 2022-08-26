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
class EditUserRolesPage {
    static getUrl(username){
        return `/carbon/user/edit-user-roles.jsp?username=${username}&displayName=${username}`;
    }
    static getEnterRoleNamePattern(){
        return cy.get('input[name="org.wso2.carbon.user.unassigned.role.filter"]')
    }
    static getSearchRolesButton(){
        return cy.get('input[value="Search Roles"]')
    }
    static getRoleCheckbox(role){
        return cy.get(`input[value="${role}"][type="checkbox"]`)
    }
    static getUpdateButton(){
        return cy.get('.button[value="Update"]')
    }
    /* using index when multiple dialogbox open */
    static getMessageBoxOkButton(dialogboxIndex){
        return cy.get(`div[aria-labelledby="ui-id-${dialogboxIndex}"] > div:nth-child(3) > div > button`)
    }
}

export default EditUserRolesPage;