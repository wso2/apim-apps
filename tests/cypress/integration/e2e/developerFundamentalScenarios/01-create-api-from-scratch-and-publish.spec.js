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

import ApisHomePage from "../../../support/pages/publisher/ApisHomePage";
import CreateRestAPIPage from "../../../support/pages/publisher/CreateRestAPIPage";
import APIMenuPage from "../../../support/pages/publisher/APIMenuPage";
import APIBasicInfoPage from "../../../support/pages/publisher/APIBasicInfoPage";
import ResourcesPage from "../../../support/pages/publisher/ResourcesPage";
import LocalScopesPage from "../../../support/pages/publisher/LocalScopesPage";
import DocumentsPage from "../../../support/pages/publisher/DocumentsPage";
import DeploymentsPage from "../../../support/pages/publisher/DeploymentsPage";
import LifecyclePage from "../../../support/pages/publisher/LifecyclePage";
import DevPortalApisPage from "../../../support/pages/devportal/DevPortalApisPage";

const publisherApisPage = new ApisHomePage();
const createRestAPIPage = new CreateRestAPIPage();
const apiMenuPage = new APIMenuPage();
const apiBasicInfoPage = new APIBasicInfoPage();
const resourcesPage = new ResourcesPage();
const localScopesPage = new LocalScopesPage();
const documentsPage = new DocumentsPage();
const deploymentsPage = new DeploymentsPage();
const lifecyclePage = new LifecyclePage();
const devPortalApisPage = new DevPortalApisPage();

const testUsers = require('../../../fixtures/testUsers.json')
const userRoles = require('../../../support/screenData/userRoles.json')
const permissions = require('../../../support/screenData/rolePermission.json')

const testData = require("../../../fixtures/scriptData/e2e/DeveloperFundamentalTestData.json")

/*
### High Level Steps ###
1. Add the PizzaShack API to the Publisher
2. Add documentation
3. Deploy to gateway
4. Publish the APIs
5. Verify from Devportal
*/

describe("Introduction : Create API from scratch and publish", () => {

    Cypress.on('uncaught:exception', (err, runnable) => {
        return false;
      });

    it("Add the PizzaShack API to the Publisher", () => {
        const thumbnailImagePath = `scriptData/e2e/shack-logo.png`

        cy.loginToPublisher(testData.newUserCreator, testData.newUserPassword);
        publisherApisPage.waitUntillPublisherLoadingSpinnerExit()

        // ### Adding the PizzaShack API to the Publisher
        // publisherApisPage.getCreateAPIButton().click()
        // publisherApisPage.getCreateAPIDialog_StartFromScratchLink().click()
        createRestAPIPage.visitAPIsPage()
        cy.wait(5000)

        createRestAPIPage.getAPINameTextBox().type(testData.PizzaShackApi.name)
        createRestAPIPage.getAPIContextTextBox().type(testData.PizzaShackApi.context)
        createRestAPIPage.getAPIVesionTextBox().type(testData.PizzaShackApi.version)
        createRestAPIPage.getAPIEndpointTextBox().type(testData.PizzaShackApi.endpoint)
        createRestAPIPage.getAPICreateButton().click()
        cy.contains("API created successfully")

        // Fill Basic Inof Page
        apiMenuPage.waitUntillPublisherLoadingSpinnerExit()
        apiMenuPage.getPortalConfigurationsMenu().click({force: true})
        apiMenuPage.getPortalConfigurations_BasicInforMenu().click({force: true})

        cy.location('pathname', {timeout: 60000}).should('include', '/configuration');
        cy.wait(5000)

        publisherApisPage.getApiNameVersionH1().should("have.text","PizzaShack :1.0.0")
        publisherApisPage.getApiStateDiv().should("have.text","CREATED")

        apiBasicInfoPage.getEditDescriptionButton().should('be.visible').should("have.text","Edit description").click({force: true})
        apiBasicInfoPage.getDescriptionTextArea().type("PizzaShackAPI: Allows to manage pizza orders (create, update, retrieve orders)")
        apiBasicInfoPage.getUpdateContectButton().click()

        apiBasicInfoPage.getTagsTextBox().type("pizza").type('{enter}')
        apiBasicInfoPage.getTagsTextBox().type("order").type('{enter}')
        apiBasicInfoPage.getTagsTextBox().type("pizza-menu").type('{enter}')
        apiBasicInfoPage.getDefaultVersionNoRadio().click()

        apiBasicInfoPage.getEditThumbnailButton().click({force: true})
        apiBasicInfoPage.getThumbnailFileUpload().attachFile(thumbnailImagePath)
        apiBasicInfoPage.getThumbnailUploadButton().click()
        cy.contains("Thumbnail uploaded successfully")

        apiBasicInfoPage.getSaveButton().should('be.visible').click()
        cy.contains("PizzaShack API updated successfully")

        // Fill Runtime Page
        //TODO : by default all set, need to verify

        // Fill Resource Page
        apiMenuPage.getAPIConfigurationsMenu().click({force: true})
        apiMenuPage.getAPIConfigurationsMenu_ResourcesMenu().click({force: true})
        cy.wait(5000)

        resourcesPage.getResourcePageHeader().should("have.text","Resources")
        resourcesPage.selectAndAddNewOperation("GET","/menu")
        resourcesPage.selectAndAddNewOperation("POST","/order")
        resourcesPage.selectAndAddNewOperation("GET","order/{orderid}")
        resourcesPage.selectAndAddNewOperation("PUT","order/{orderid}")

        resourcesPage.getSaveRerouceButton().click()
        cy.contains("PizzaShack API updated successfully")

        //Fill Local Scopes Page
        apiMenuPage.getAPIConfigurationsMenu_LocalScopesMenu().click({force: true})
        cy.wait(5000)

        localScopesPage.getLocalScopesHeader().should("have.text", "Local Scopes")
        localScopesPage.getCreateScopesButton().click()
        localScopesPage.getScopeNameTextBox().type("order_pizza")
        localScopesPage.getScopeDisplayNameTextBox().type("Order Pizza")
        localScopesPage.getScopeDescriptionTextBox().type("Only users with admin role and internal/subscriber role can order")
        localScopesPage.getRolesTextBox().type("admin").type('{enter}') 
        localScopesPage.getRolesTextBox().type("Internal/subscriber").type('{enter}')
        localScopesPage.getSaveButton().click()
        //apiBasicInfoPage.getUpdateToolTip().should("have.text","Scope added successfully")
        cy.contains("Scope added successfully")
        
        // Assigning created scope to the Resource
        apiMenuPage.getAPIConfigurationsMenu().click({force: true})
        apiMenuPage.getAPIConfigurationsMenu_ResourcesMenu().click({force: true})
        cy.wait(5000)
        resourcesPage.getResourcePageHeader().should("have.text","Resources")

        resourcesPage.getRowOfResource("/order").click()
        resourcesPage.getDescriptionTextAreaOfResource("post/order").type("Create a new Order")
        resourcesPage.getSummaryTextAreaOfResource("post/order").type("Order Pizza")
        resourcesPage.selectOperationScopeOfResource("post/order","order_pizza")
        resourcesPage.getSaveButton().click()
        cy.contains("PizzaShack API updated successfully")

        // Fill Documentation Page
        apiMenuPage.getAPIConfigurationsMenu_DocumentsMenu().click({force: true})
        documentsPage.getDocumentsHeader().contains("Documents")
        documentsPage.getAddNewDocumentButton().click()

        documentsPage.getNameTextBox().type(testData.PizzaShackApi.name)
        documentsPage.getSummaryTextBox().type("This is the official documentation for the PizzaShackAPI")
        documentsPage.getType_HowToCheckBox().check()
        documentsPage.getSource_InLineCheckBox().check()
        documentsPage.getAddDocumentButton().click()
        cy.contains("PizzaShack added successfully")
        documentsPage.getBackToListiningButton().click()
        documentsPage.getDocumentNameOfTableRow(0).contains(testData.PizzaShackApi.name)

        // Deploye the API
        apiMenuPage.getDeploy_DeployementsMenu().click({force: true})
        deploymentsPage.getDeployButton().click()
        cy.contains("Revision Created Successfully")
        cy.contains("Revision Deployed Successfully")
        // TODO : do assertions for reveions number and gateway urls

        cy.wait(10000) // need to wait till all api cals complted before log out TODO : handle wait time
        cy.logoutFromPublisher()
        cy.wait(5000)

    })

    it("Publish the API from a Publisher user", () => {
        cy.loginToPublisher(testData.newUserPublisher, testData.newUserPassword);
        publisherApisPage.waitUntillPublisherLoadingSpinnerExit()
        cy.wait(5000)

        publisherApisPage.getApiLinkOfAPI(testData.PizzaShackApi.name).click()
        apiMenuPage.getPublish_LifecycleMenu().click({force: true})
        cy.wait(5000)
        lifecyclePage.getLifecycleHeader().contains("Lifecycle")
        lifecyclePage.getPublishButton().click()
        cy.contains("Lifecycle state updated successfully")
        publisherApisPage.getApiStateDiv().contains("PUBLISHED")

        cy.logoutFromPublisher()
        cy.wait(10000) //TODO : handle wait time
    })

    it("Verify API available in the API Devportal" , () => {      
        devPortalApisPage.visitAPIsPage()
        devPortalApisPage.waitUntillDevportalLoaderSpinnerExit()
        cy.wait(5000)
        devPortalApisPage.getApiLinkOfAPI(testData.PizzaShackApi.name).should('be.visible');
    })

    after(`Delete ${testData.PizzaShackApi.name} API from the publisher`, () => {
        cy.loginToPublisher(testUsers.adminPortalAdmin.username, testUsers.adminPortalAdmin.password);
        publisherApisPage.waitUntillPublisherLoadingSpinnerExit()
        publisherApisPage.visitAPIsPage()
        publisherApisPage.waitUntillPublisherLoadingSpinnerExit()

        publisherApisPage.getDeleteButtonOfAPI(`${testData.PizzaShackApi.name}${testData.PizzaShackApi.version}`).click({force: true}) // "PizzaShack1.0.0"
        publisherApisPage.getDeleteAPIDialog_DeletButton().click()
        cy.wait(2000)
        cy.contains(`API ${testData.PizzaShackApi.name} deleted Successfully`)
    })

})