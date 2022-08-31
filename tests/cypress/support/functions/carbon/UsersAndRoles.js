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

import AddNewUserStep1Page from "../../../support/pages/carbon/AddNewUserStep1Page";
import UsersManagementPage from "../../../support/pages/carbon/UsersManagementPage";
import EditUserRolesPage from "../../../support/pages/carbon/EditUserRolesPage";

class UsersAndRoles {

    static addNewUserAndUpdateRoles(name = 'newuser', roles = [], password = 'test123'){
        AddNewUserStep1Page.visitURL()
        AddNewUserStep1Page.getUsernameTextBox().type(name);
        AddNewUserStep1Page.getPasswordTextBox().type(password);
        AddNewUserStep1Page.getConfirmPasswordTextBox().type(password);
        AddNewUserStep1Page.getFinishButton().click();
        AddNewUserStep1Page.getUserAddedDialogOKButton().click()

        // search created username 
        UsersManagementPage.getEnterUsernameTextBox().clear().type(name)
        UsersManagementPage.getSearchUsershButton().click
        UsersManagementPage.getNameColumnOfFirstRow().contains(name)
        UsersManagementPage.getAssignRolesButtonOfUser(name).click()

        // Search roles and update
        roles.forEach(role => {
            EditUserRolesPage.getEnterRoleNamePattern().clear().type(role)
            EditUserRolesPage.getSearchRolesButton().click()
            EditUserRolesPage.getRoleCheckbox(role).check()
            EditUserRolesPage.getUpdateButton().click()
            EditUserRolesPage.getMessageBoxOkButton(2).click()
            EditUserRolesPage.getMessageBoxOkButton(1).click()
        });
    }
}
export default UsersAndRoles;   