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

            // Go to endpoints page
            cy.get('[data-testid="left-menu-itemendpoints"]').click();

            // Change the endpoint type to Prototype Implementation
            cy.get('[data-testid="EndpointType"] input[value="INLINE"]').click();

            // Confirm it
            cy.get('[data-testid="change-endpoint-type-btn"]').click();
            cy.get('[data-testid="endpoint-save-btn"]').click();
            cy.get('[data-testid="endpoint-save-btn"]').then(() => {
                cy.get('[data-testid="left-menu-itemTestConsole"]').click();
                cy.get('button[data-testid="initialize-test-btn"]').then(() => {
                    cy.get('button[data-testid="initialize-test-btn"]').click();
                });
                // Wait until the api is saved
                cy.intercept('**/subscriptions**').as('subGet');
                cy.wait('@subGet');

                cy.get('#operations-pet-getPetById').click();
                cy.get('#operations-pet-getPetById .try-out__btn').click();
                cy.get('#operations-pet-getPetById [placeholder="petId - ID of pet to return"]').type('1');
                cy.get('#operations-pet-getPetById button.execute').click();
                cy.get('#operations-pet-getPetById  td.response-col_status').contains('200').should('exist');
            })
        });
    });
    after(function () {
        // Test is done. Now delete the api
        cy.get(`[data-testid="itest-id-deleteapi-icon-button"]`).click();
        cy.get(`[data-testid="itest-id-deleteconf"]`).click();

        cy.visit('carbon/user/user-mgt.jsp');
        cy.deleteUser(publisher);
    })
})