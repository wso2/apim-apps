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
    const tenantUser = `tenant${Math.floor(Date.now() / 1000)}`

    const createApiFromSwagger = (username, password) => {
        cy.loginToPublisher(username, password);
        cy.visit(`/publisher/apis`);
        // select the option from the menu item
        cy.get('[data-testid="itest-id-createapi"]').click();
        cy.get('[data-testid="create-api-open-api"]').click();
        cy.get('[data-testid="open-api-file-select-radio"]').click();

        // upload the swagger
        cy.get('[data-testid="browse-to-upload-btn"]').then(function () {
            const filepath = 'api_artifacts/swagger_2.0.json'
            cy.get('input[type="file"]').attachFile(filepath)            
        });

        // go to the next step
        cy.get('[data-testid="api-create-next-btn"]').click();
        cy.get('[data-testid="itest-id-apiendpoint-input"] input').click();

        // finish the wizard
        cy.get('[data-testid="api-create-finish-btn"]').click();

        // validate
        cy.get('[data-testid="itest-api-name-version"]', { timeout: 30000 }).contains('1.0.5');
    }
    it("Create API from swagger from file - supper admin", () => {
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.addNewUser(publisher, ['Internal/publisher', 'Internal/creator', 'Internal/everyone'], password);

        createApiFromSwagger(publisher, password);
        // Test is done. Now delete the api
        cy.get(`[data-testid="itest-id-deleteapi-icon-button"]`).click();
        cy.get(`[data-testid="itest-id-deleteconf"]`).click();

        cy.visit('carbon/user/user-mgt.jsp');
        cy.deleteUser(publisher);
        cy.carbonLogout();
    });

    it("Create API from swagger from file - tenant user", () => {
        const tenant = 'wso2.com';
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.addNewTenantUser(tenantUser);
        createApiFromSwagger(`${tenantUser}@${tenant}`, password);
        // Test is done. Now delete the api
        cy.get(`[data-testid="itest-id-deleteapi-icon-button"]`).click();
        cy.get(`[data-testid="itest-id-deleteconf"]`).click();

        cy.visit('carbon/user/user-mgt.jsp');
        cy.deleteUser(tenantUser);
    });
    
})