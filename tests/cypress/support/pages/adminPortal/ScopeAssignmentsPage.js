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
const userRoles = require('../../../support/screenData/userRoles.json')
class ScopeAssignmentsPage{
    getUrl(){
        return "/admin/settings/scope-mapping";
    }
    getAddScopeMappingButton(){
        return cy.get('[data-testid="add-scope-mapping"]')
    }
    getAddNewScopeRoleNameTextBox(){
        return cy.get("#role-input-field-helper-text")
    }

    getAddNewScopeNextButton(){
        return cy.get('[data-testid="add-role-wizard-save-button"]')
    }

    selectRoleAlias(mappingRole){
        cy.get('#role-select-dropdown').click();
        cy.get('[id^=role-select-dropdown-option-]').contains(mappingRole).click();
    }

    getAddNewScopeSavetButton(){
        return cy.get('[data-testid="add-role-wizard-save-button"]')
    }

    getSearchTextBox(){
        return cy.get('input[placeholder="Search by Role Name"]');
    }

    // row index start from 0
    getRolesRecordOfTableRow(rowIndex){
        return cy.get(`[label="enhanced-table-checkbox-${rowIndex}"]`).eq(0);
    }

    getDeleteButtonOfTableRow(rowIndex){
        return cy.get(`[label="enhanced-table-checkbox-${rowIndex}"]`).eq(0).get("span > div > button");
    }

    getDeleteButtonOfScopeAssignmentDialogOfRole(roleName){
        return cy.get(`#${roleName}`)
    }
    // tbody.MuiTableBody-root > tr.MuiTableRow-root >th.MuiTableCell-alignRight > span > div > button
}

export default ScopeAssignmentsPage;