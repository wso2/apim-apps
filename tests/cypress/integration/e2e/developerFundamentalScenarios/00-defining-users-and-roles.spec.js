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

        // cy.log("##### Add Role Mapping in API Manager Admin #####")

        // cy.log("Log into API Manager Admin portal ...")
        // cy.loginToAdmin(testUsers.adminPortalAdmin.username,testUsers.adminPortalAdmin.password)

        // cy.log(`Adding scope mapping ${apiCreaterUserRole} ...`)
        // cy.addScopeMappingFromAPIMAdminPortal(apiCreaterUserRole,userRoles.Internal_creator)
        
        // cy.log(`Adding scope mapping ${apiPublisherUserRole} ...`)
        // cy.addScopeMappingFromAPIMAdminPortal(apiPublisherUserRole,userRoles.Internal_publisher)

        // cy.log("##### Define Users via the Carbon Admin Console #####")

        // cy.carbonLogin(testUsers.carbonAdmin.username, testUsers.carbonAdmin.password);
        // cy.addNewUser(userCreater,["apicreator"],newUserPassword)
        // cy.addNewUser(userPublisher,["apipublisher"],newUserPassword)
        // cy.addNewUser(newUserSubscriber,[userRoles.Internal_subscriber],newUserPassword)
        // cy.addNewUser(newUserMike,[],newUserPassword)
        // cy.carbonLogout()
    })

    it("Add Role Mapping from APIM Admin", () => {
       
        //cy.log("Log into API Manager Admin portal ...")
        cy.loginToAdmin(testUsers.adminPortalAdmin.username,testUsers.adminPortalAdmin.password)

        //cy.log(`Adding scope mapping ${testData.apiCreatorUserRole} ...`)
        cy.addScopeMappingFromAPIMAdminPortal(testData.apiCreatorUserRole,userRoles.Internal_creator)
        
        //cy.log(`Adding scope mapping ${testData.apiPublisherUserRole} ...`)
        cy.addScopeMappingFromAPIMAdminPortal(testData.apiPublisherUserRole,userRoles.Internal_publisher)

    })

    it("Define Users via the Carbon Admin Console", () => {

        cy.carbonLogin(testUsers.carbonAdmin.username, testUsers.carbonAdmin.password);
        cy.addNewUser(testData.newUserCreator,[testData.apiCreatorUserRole],testData.newUserPassword)
        cy.addNewUser(testData.newUserPublisher,[testData.apiPublisherUserRole],testData.newUserPassword)
        cy.addNewUser(testData.newUserSubscriber,[userRoles.Internal_subscriber],testData.newUserPassword)
        cy.addNewUser(testData.newUserMike,[],testData.newUserPassword)
    })


    after("end of the script", () =>{
        // delte 
        cy.log("End of the script")
        //cy.log(testData.userCreater)
    })
})