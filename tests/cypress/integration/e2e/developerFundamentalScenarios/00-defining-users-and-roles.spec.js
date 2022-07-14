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

const testUsers = require('../../../fixtures/testUsers.json')
const userRoles = require('../../../support/screenData/userRoles.json')
const permissions = require('../../../support/screenData/rolePermission.json')
const testData = require("../../../fixtures/scriptData/e2e/DeveloperFundamentalTestData.json")

describe("Introduction : Defining Users and Roles", () => { 

    it("Defin User Roles from Carbon admin console", () => {

        cy.log("##### Defin User Roles in Carbon Console #####")
        cy.log("Log into Carban ...")
        cy.carbonLogin(testUsers.carbonAdmin.username, testUsers.carbonAdmin.password);

        cy.log(`Adding new Role  ...${testData.apiCreatorUserRole}`)
        cy.addNewRole(testData.apiCreatorUserRole,"PRIMARY",
            [permissions.AdminPermissions_Configure_Governance,
             permissions.AdminPermissions_Configure_Login,
             permissions.AdminPermissions_Manage_API_Create,
             permissions.AdminPermissions_Manage_Resource_Govern
            ]
        )

        cy.log(`Adding new Role  ...${testData.apiPublisherUserRole}`)
        cy.addNewRole(testData.apiPublisherUserRole,"PRIMARY",[permissions.AdminPermissions_Manage_API_Publish])
        cy.carbonLogout()
        cy.wait(1000)
    })

    it("Add Role Mapping from APIM Admin", () => {
        cy.loginToAdmin(testUsers.adminPortalAdmin.username,testUsers.adminPortalAdmin.password)
        cy.addScopeMappingFromAPIMAdminPortal(testData.apiCreatorUserRole,userRoles.Internal_creator)
        cy.addScopeMappingFromAPIMAdminPortal(testData.apiPublisherUserRole,userRoles.Internal_publisher)
    })

    it("Define Users via the Carbon Admin Console", () => {
        cy.carbonLogin(testUsers.carbonAdmin.username, testUsers.carbonAdmin.password);
        cy.searchRolesAndAddNewUser(testData.newUserCreator,[testData.apiCreatorUserRole],testData.newUserPassword)
        cy.searchRolesAndAddNewUser(testData.newUserPublisher,[testData.apiPublisherUserRole],testData.newUserPassword)
        cy.searchRolesAndAddNewUser(testData.newUserSubscriber,[userRoles.Internal_subscriber],testData.newUserPassword)
        cy.searchRolesAndAddNewUser(testData.newUserMike,[],testData.newUserPassword)
    })

    after("end of the script", () =>{
        cy.log("End of the script")
    })
})