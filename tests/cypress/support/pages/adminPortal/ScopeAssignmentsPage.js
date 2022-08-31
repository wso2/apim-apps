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
        return cy.get(".MuiButton-containedPrimary > .MuiButton-label")
    }
    getAddNewScopeRoleNameTextBox(){
        return cy.get("#role-input-field-helper-text")
    }

    getAddNewScopeNextButton(){
        return cy.get(".MuiDialogActions-root > div > div > .MuiButton-containedPrimary")
    }

    selectRoleAlias(mappingRole){
        cy.get('.MuiAutocomplete-endAdornment > button[aria-label="Open"]').click();
        //cy.get("#role-select-dropdown-option-1").click();

        switch(mappingRole){
            case userRoles.admin :
                cy.get("#role-select-dropdown-option-0").click();
                break;
            case userRoles.Internal_creator :
                cy.get("#role-select-dropdown-option-1").click();
                break;
            case userRoles.Internal_publisher :
                cy.get("#role-select-dropdown-option-2").click();
                break;
            case userRoles.Internal_integration_dev :
                cy.get("#role-select-dropdown-option-3").click();
                break;
            case userRoles.Internal_subscriber :
                cy.get("#role-select-dropdown-option-4").click();
                break;
            case userRoles.Internal_devops:
                cy.get("#role-select-dropdown-option-5").click();
                break;
            case userRoles.Internal_analytics :
                cy.get("#role-select-dropdown-option-6").click();
                break;
            case userRoles.Internal_observer :
                cy.get("#role-select-dropdown-option-7").click();
                break;
        }
    }

    getAddNewScopeSavetButton(){
        return cy.get(".MuiDialogActions-root > div > div > .MuiButton-containedPrimary")
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