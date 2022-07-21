/// <reference types="cypress"/>
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

import Utils from "@support/utils";

import ScopeAssignmentsPage from "../../../support/pages/adminPortal/ScopeAssignmentsPage";
import UsersManagementPage from "../../../support/pages/carbon/UsersManagementPage";
const scopeAssignmentsPage = new ScopeAssignmentsPage();
const usersManagementPage = new UsersManagementPage();

const testUsers = require('../../../fixtures/testUsers.json')
const testData = require("../../../fixtures/scriptData/e2e/DeveloperFundamentalTestData.json")
const userRoles = require('../../../support/screenData/userRoles.json')

var apiCreatorScopeMappingDeleteLog = `Scope Mapping "${testData.apiCreatorUserRole}" Delete Fail .... !`
var apiPublisherScopeMappingDeleteLog = `Scope Mapping "${testData.apiPublisherUserRole}" Delete Fail .... !`
var newUserCreatorDeleteLog = `User "${testData.newUserCreator}" Delete Fail .... !`
var newUserPublisherDeleteLog = `User "${testData.newUserPublisher}" Delete Fail .... !`
var newUserMikeDeleteLog = `User "${testData.newUserMike}" Delete Fail .... !`
var newUserSubscriberDeleteLog = `User "${testData.newUserSubscriber}" Delete Fail .... !`
var creatorRoleDeleteLog = `Role "${testData.apiCreatorUserRole}" Delete Fail .... !`
var publisherRoleDeleteLog = `Role "${testData.apiPublisherUserRole}" Delete Fail .... !`

describe("Tear down Developer Fundemental TestS cenarios", () => {

    it("Delte Scope Assignments", () => {

        let selectorIfRoleExist = "tbody.MuiTableBody-root > tr.MuiTableRow-hover"
        cy.loginToAdmin(testUsers.adminPortalAdmin.username, testUsers.adminPortalAdmin.password)

        // TODO : Move to a function
        cy.visit(`${Utils.getAppOrigin()}` + scopeAssignmentsPage.getUrl())
        scopeAssignmentsPage.getSearchTextBox().clear().type(testData.apiCreatorUserRole)
        cy.wait(2000)
        cy.get("body").then(($body) => {
            if ($body.find(selectorIfRoleExist).length > 0) {
                // element exisit to delte assert to verify if exact element
                scopeAssignmentsPage.getRolesRecordOfTableRow(0).should('have.text', `${testData.apiCreatorUserRole}${userRoles.Internal_creator}`).click()
                cy.deleteScopeMappingFromAPIMAdminPortal(testData.apiCreatorUserRole)
                cy.wait(3000)
                apiCreatorScopeMappingDeleteLog = `${testData.apiCreatorUserRole} Deleted Successfully .... !`

                // apicreator scoping mapping exist AND trying for apipublisher scope mapping
                scopeAssignmentsPage.getSearchTextBox().clear().type(testData.apiPublisherUserRole)
                cy.wait(2000)
                cy.get("body").then(($body) => {
                    if ($body.find(selectorIfRoleExist).length > 0) {
                        scopeAssignmentsPage.getRolesRecordOfTableRow(0).should('have.text', `${testData.apiPublisherUserRole}${userRoles.Internal_publisher}`).click()
                        cy.deleteScopeMappingFromAPIMAdminPortal(testData.apiPublisherUserRole)
                        apiPublisherScopeMappingDeleteLog = `${testData.apiPublisherUserRole} Deleted Successfully .... !`
                    } else {
                        apiPublisherScopeMappingDeleteLog = `${testData.apiPublisherUserRole}, scope mapping not exists may be already deleted`
                        cy.log(apiPublisherScopeMappingDeleteLog)
                    }
                })
            } else { // apicreator scope mapping not exist and trying for apipublisher scope mapping
                apiCreatorScopeMappingDeleteLog = `${testData.apiCreatorUserRole}, scope mapping not exists may be already deleted`
                cy.log(apiCreatorScopeMappingDeleteLog)
                scopeAssignmentsPage.getSearchTextBox().clear().type(testData.apiPublisherUserRole)
                cy.wait(2000)
                cy.get("body").then(($body) => {
                    if ($body.find(selectorIfRoleExist).length > 0) {
                        scopeAssignmentsPage.getRolesRecordOfTableRow(0).should('have.text', `${testData.apiPublisherUserRole}${userRoles.Internal_publisher}`).click()
                        cy.deleteScopeMappingFromAPIMAdminPortal(testData.apiPublisherUserRole)
                        apiPublisherScopeMappingDeleteLog = `${testData.apiPublisherUserRole}, scope mapping not exists may be already deleted`
                    } else {
                        apiPublisherScopeMappingDeleteLog = `${testData.apiPublisherUserRole}, scope mapping not exists may be already deleted`
                        cy.log(apiPublisherScopeMappingDeleteLog)
                    }
                })

            }
        })

    })

    it("Delete Users", () => {

        cy.carbonLogin(testUsers.carbonAdmin.username, testUsers.carbonAdmin.password);
        cy.searchAndDeleteUserIfExist(testData.newUserCreator).then(value => {
            newUserCreatorDeleteLog = value;
        });
        cy.searchAndDeleteUserIfExist(testData.newUserPublisher).then(value => {
            newUserPublisherDeleteLog = value;
        });
        cy.searchAndDeleteUserIfExist(testData.newUserSubscriber).then(value => {
            newUserSubscriberDeleteLog = value;
        });
        cy.searchAndDeleteUserIfExist(testData.newUserMike).then(value => {
            newUserMikeDeleteLog = value;
        });
    })

    it("Delete Rolese", () => {
        cy.carbonLogin(testUsers.carbonAdmin.username, testUsers.carbonAdmin.password);
        cy.searchAndDeleteRoleIfExist(testData.apiPublisherUserRole).then(value => {
            publisherRoleDeleteLog = value;
        });
        cy.searchAndDeleteRoleIfExist(testData.apiCreatorUserRole).then(value => {
            creatorRoleDeleteLog = value;
        });
    })

    after("Tear Down Log", () => {
        cy.log(apiCreatorScopeMappingDeleteLog)
        cy.log(apiPublisherScopeMappingDeleteLog)
        cy.log(newUserCreatorDeleteLog)
        cy.log(newUserPublisherDeleteLog)
        cy.log(newUserSubscriberDeleteLog)
        cy.log(newUserMikeDeleteLog)
        cy.log(publisherRoleDeleteLog)
        cy.log(creatorRoleDeleteLog)

    })


})
