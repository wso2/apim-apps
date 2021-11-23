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
describe("Mock the api response and test it", () => {
    const publisher = 'publisher';
    const password = 'test123';
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';
    const productName = 'petstoreProduct';
    const apiName = 'SwaggerPetstore-OpenAPI30';
    const apiVersion = '1.0.6';

    before(function () {
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.addNewUser(publisher, ['Internal/publisher', 'Internal/creator', 'Internal/everyone'], password);
        cy.loginToPublisher(publisher, password);
    })

    it("Mock the api response and test it", () => {

        cy.visit(`/publisher/apis`);
        // select the option from the menu item
        cy.get('[data-testid="itest-id-createapi"]').click();
        cy.get('[data-testid="create-api-open-api"]').click();
        cy.get('[data-testid="open-api-file-select-radio"]').click();

        // upload the swagger
        cy.get('[data-testid="browse-to-upload-btn"]').then(function () {
            const filepath = 'api_artifacts/petstore-v3.json'
            cy.get('input[type="file"]').attachFile(filepath)
        });

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

            //Get the api id
            cy.location('pathname').then((pathName) => {
                const pathSegments = pathName.split('/');
                const uuid = pathSegments[pathSegments.length - 2];

                // Go to api product create page
                cy.visit('/publisher/api-products/create');

                // fill the form
                cy.get('#itest-id-apiname-input').type(productName);
                cy.get('#context').type(productName);
                cy.get('#mui-component-select-policies').click();
                cy.get('[data-testid="policy-item-Bronze"]').click();
                cy.get('#menu-policies').click('topLeft');

                // go to second step
                cy.get('[data-testid="new-api-product-next-0"]').click();

                // Wait until the api is saved
                cy.get('[data-testid="resource-wrapper"] ul li:first-child', { timeout: 30000 });
                cy.get('[data-testid="resource-wrapper"] ul li:first-child button').click();


                // add all resources
                cy.get('[data-testid="add-all-resources-btn"]').click();
                cy.get('[data-testid="create-api-product-btn"]').click();

                cy.get('[data-testid="api-name-version-title"]', { timeout: 30000 });
                cy.get('[data-testid="api-name-version-title"]').contains(productName);

                //Get the api product id
                cy.location('pathname').then((pathName) => {
                    const pathSegments = pathName.split('/');
                    const uuidProduct = pathSegments[pathSegments.length - 2];
                    // Need to update the underline api and update the api product again.
                    // ==================================================================== //
                    cy.log(uuid, uuidProduct);
                    cy.visit(`/publisher/apis/${uuid}/resources`);

                    // Add a new resource to the underline api
                    // Typing the resource name
                    const target = '/test';
                    cy.get('#operation-target', { timeout: 30000 });
                    cy.get('#operation-target').type(target);
                    cy.get('[data-testid="add-operation-selection-dropdown"]').click();

                    // Checking get operation
                    cy.get('[data-testid="add-operation-get"]').click();
                    cy.get('#menu-verbs').click('topLeft');

                    cy.get('[data-testid="add-operation-button"]').click();
                    cy.get('[data-testid="resources-save-operations"]').click();

                    // Validating if the resource exists after saving
                    cy.get(`[data-testid="operation-${target}-get"]`).should('be.visible');

                    // Go to api product
                    cy.visit(`/publisher/api-products/${uuidProduct}/resources/edit`);

                    // Add the newly created resource and save
                    cy.get('[data-testid="resource-wrapper"] ul li:last-child', { timeout: 30000 });
                    cy.get('[data-testid="resource-wrapper"] ul li:last-child button').click();
                    cy.get('[data-testid="save-product-resources"]').click();

                    // Deleting the api and api product
                    cy.get(`[data-testid="itest-id-deleteapi-icon-button"]`).click();
                    cy.get(`[data-testid="itest-id-deleteconf"]`).click();

                    cy.visit(`/publisher/apis/${uuid}/overview`);
                    cy.get('[data-testid="itest-api-name-version"]', { timeout: 30000 });
                    cy.get(`[data-testid="itest-id-deleteapi-icon-button"]`).click();
                    cy.get(`[data-testid="itest-id-deleteconf"]`).click();
                });
            });
        });
    });

    after(function () {
        cy.visit('carbon/user/user-mgt.jsp');
        cy.deleteUser(publisher);
    })
})