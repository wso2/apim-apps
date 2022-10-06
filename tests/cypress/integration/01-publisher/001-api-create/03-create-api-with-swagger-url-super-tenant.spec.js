/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
describe("Create api with swagger file super tenant", () => {
    const publisher = 'publisher';
    const password = 'test123';
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';
    const tenantUser = `tenant${Math.floor(Date.now() / 1000)}`;
    const tenant = 'wso2.com';
    

    before(function () {
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.addNewUser(publisher, ['Internal/publisher', 'Internal/creator', 'Internal/everyone'], password);
        cy.addNewTenantUser(tenantUser);
        cy.reload();
        cy.carbonLogout();
    })

    const openApi2Create = () => {
        cy.visit(`/publisher/apis`);
        // select the option from the menu item
        //cy.wait(3000);
        cy.get('[data-testid="itest-id-createapi"]').click();
        cy.get('[data-testid="create-api-open-api"]').click();
        cy.get('[data-testid="open-api-url-select-radio"]').click();

        // provide the swagger url
        cy.get('[data-testid="swagger-url-endpoint"]').type('https://petstore.swagger.io/v2/swagger.json');
        // go to the next step
        cy.get('[data-testid="url-validated"]', { timeout: 30000 });
        cy.get('[data-testid="api-create-next-btn"]').click();
        cy.get('[data-testid="itest-id-apiversion-input"] input[type="text"]', { timeout: 30000 });
        cy.document().then((doc) => {
            const version = doc.querySelector('[data-testid="itest-id-apiversion-input"] input[type="text"]').value;
            cy.get('[data-testid="itest-id-apiversion-input"] input[type="text"]').click();

            // finish the wizard
            cy.get('[data-testid="api-create-finish-btn"]').click();

            // validate
            cy.get('[data-testid="itest-api-name-version"]', { timeout: 30000 }).contains(version);

            // Test is done. Now delete the api
            cy.get(`[data-testid="itest-id-deleteapi-icon-button"]`).click();
            cy.get(`[data-testid="itest-id-deleteconf"]`).click();
            cy.logoutFromPublisher();
        });
    }

    const openApi3Create = () => {
        cy.visit(`/publisher/apis`);
        //cy.wait(3000);
        // select the option from the menu item
        cy.get('[data-testid="itest-id-createapi"]').click();
        cy.get('[data-testid="create-api-open-api"]').click();
        cy.get('[data-testid="open-api-url-select-radio"]').click();

        // upload the swagger
        cy.get('[data-testid="swagger-url-endpoint"]').type('https://petstore3.swagger.io/api/v3/openapi.json');
        // go to the next step
        cy.get('[data-testid="url-validated"]', { timeout: 30000 });
        cy.get('[data-testid="api-create-next-btn"]').click();

        cy.get('[data-testid="itest-id-apiversion-input"] input[type="text"]', { timeout: 30000 });
        cy.document().then((doc) => {
            cy.get('[data-testid="itest-id-apicontext-input"] input[type="text"]').type('petstore3');
            cy.get('[data-testid="itest-id-apiversion-input"] input[type="text"]').click();
            const version = doc.querySelector('[data-testid="itest-id-apiversion-input"] input[type="text"]').value;

            // finish the wizard
            cy.get('[data-testid="api-create-finish-btn"]').click();

            // validate
            cy.get('[data-testid="itest-api-name-version"]', { timeout: 30000 });
            cy.get('[data-testid="itest-api-name-version"]').contains(version);

            // Test is done. Now delete the api
            cy.get(`[data-testid="itest-id-deleteapi-icon-button"]`).click();
            cy.get(`[data-testid="itest-id-deleteconf"]`).click();
            cy.logoutFromPublisher();
        });
    }

    it("Create API from swagger from file openapi 2", () => {
        cy.loginToPublisher(publisher, password);
        cy.wait(3000);
        openApi2Create();
    });

    it("Create API from swagger from file openapi 3", () => {
        cy.loginToPublisher(publisher, password);
        cy.wait(3000);
        openApi3Create();
    });

    it("Create API from swagger from file openapi 2 - tenant user", () => {
        cy.loginToPublisher(`${tenantUser}@${tenant}`, password);
        cy.wait(3000);
        openApi2Create();
    });

    it("Create API from swagger from file openapi 3 - tenant user", () => {
        cy.loginToPublisher(`${tenantUser}@${tenant}`, password);
        cy.wait(3000);
        openApi3Create();
    });

    after(function () {
        // delete tenant user
        cy.carbonLogin(`admin@${tenant}`, 'admin');
        cy.visit('carbon/user/user-mgt.jsp');
        cy.deleteUser(tenantUser);
        cy.carbonLogout();

        // delete other user
        //cy.carbonLogin(carbonUsername, carbonPassword);
        //cy.visit('carbon/user/user-mgt.jsp');
        //cy.deleteUser(publisher);
    })
})