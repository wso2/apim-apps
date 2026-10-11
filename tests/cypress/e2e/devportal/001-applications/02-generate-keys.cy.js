/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

describe("Application tests", () => {
    const { developer, password } = Utils.getUserInfo();

    const appName = Utils.generateName();
    const appDescription = 'Key gen application description';

    it("Generate and update application production and sandbox keys, show hide keys", () => {
        cy.loginToDevportal(developer, password);
        cy.createApp(appName, appDescription);

        const verifyLatestSecretCannotBeDeleted = () => {
            cy.get('@secretsTable').find('tbody tr').last().within(() => {
                cy.get('[data-testid="secret-delete-trigger"]').should('be.disabled');
                cy.get('[data-testid="secret-delete-trigger-wrapper"]').trigger('mouseover', { force: true });
            });
            cy.get('[role="tooltip"]', { timeout: 10000 })
                .should('be.visible')
                .and('contain', 'The most recently added secret cannot be deleted');
        };

        const createSecretFromDialog = ({ description = '', expiryOption = 'never', customDays = null } = {}) => {
            const expiryOptionTestIdMap = {
                '30': 'secret-expiry-option-30',
                '60': 'secret-expiry-option-60',
                '90': 'secret-expiry-option-90',
                '180': 'secret-expiry-option-180',
                never: 'secret-expiry-option-never',
                custom: 'secret-expiry-option-custom',
            };

            cy.document().then((doc) => {
                const $body = Cypress.$(doc.body);
                const hasVisibleDialog = $body.find('[data-testid="new-secret-dialog"]:visible, div[role="dialog"]:visible').length > 0;
                if (!hasVisibleDialog) {
                    if ($body.find('[data-testid="new-secret-button"]').length > 0) {
                        cy.get('[data-testid="new-secret-button"]').click();
                    } else {
                        cy.contains('button', 'New Secret').click();
                    }
                }
            });

            cy.get('[data-testid="new-secret-dialog"], div[role="dialog"]', { timeout: 30000 })
                .filter(':visible')
                .last()
                .as('secretDialog');

            if (description) {
                cy.get('@secretDialog').then(($dialog) => {
                    if ($dialog.find('[data-testid="secret-description-input"]').length > 0) {
                        cy.wrap($dialog).find('[data-testid="secret-description-input"]').find('input').clear().type(description);
                    } else {
                        cy.wrap($dialog).contains('label', 'Description (optional)').parent().find('input').clear().type(description);
                    }
                });
            }

            cy.get('@secretDialog').then(($dialog) => {
                if ($dialog.find('[data-testid="secret-expiry-select-field"]').length > 0) {
                    cy.wrap($dialog)
                        .find('[data-testid="secret-expiry-select-field"] [role="combobox"]')
                        .first()
                        .should('be.visible')
                        .click({ force: true });
                } else {
                    cy.wrap($dialog).find('[role="combobox"], div[role="button"], select').first().click({ force: true });
                }
            });

            const expiryOptionTestId = expiryOptionTestIdMap[expiryOption] || expiryOptionTestIdMap.never;
            cy.get(`[data-testid="${expiryOptionTestId}"]`, { timeout: 30000 })
                .filter(':visible')
                .first()
                .click({ force: true });

            if (expiryOption === 'custom' && customDays !== null) {
                cy.get('@secretDialog').then(($dialog) => {
                    if ($dialog.find('[data-testid="secret-custom-days-input"]').length > 0) {
                        cy.wrap($dialog).find('[data-testid="secret-custom-days-input"]').find('input').clear().type(`${customDays}`);
                    } else {
                        cy.wrap($dialog).contains('label', 'Custom Expiry Time (days)').parent().find('input').clear().type(`${customDays}`);
                    }
                });
            }

            cy.get('@secretDialog').within(() => {
                cy.get('[data-testid="create-secret-button"]').should('be.visible').and('not.be.disabled').click();
            });
        };

        // Generating keys production (multiple secret flow)
        cy.get('#production-keys-oauth').click();
        cy.get('#generate-keys', {timeout: 30000}).click();

        // Create first secret (with description + 180 days)
        createSecretFromDialog({ description: 'First 180-day secret', expiryOption: '180' });

        // Capture generated secret from secret value dialog
        cy.get('#bootstrap-input', { timeout: 30000 }).should('exist').invoke('val').then(() => {
            // Close the secret dialog and ensure consumer key exists
            cy.get('[data-testid="secret-dialog-close"]').click();
            cy.get('#consumer-key', { timeout: 30000 }).should('exist');

            // Scope to the consumer secrets table
            cy.get('[data-testid="secrets-table"]', { timeout: 30000 }).as('secretsTable');

            // Wait for the secrets table to show at least one row and assert the expected cells
            cy.get('@secretsTable').find('tbody tr', { timeout: 30000 }).should('have.length.at.least', 1);
            cy.get('@secretsTable').find('tbody tr').last().within(() => {
                cy.get('td').eq(0).contains('First 180-day secret');
                cy.get('td').eq(1).invoke('text').should('not.be.empty');
                cy.get('td').eq(2).invoke('text').should('match', /180\s*day/i);
            });
            verifyLatestSecretCannotBeDeleted();

            // Add a second secret with a description and custom expiry
            createSecretFromDialog({ description: 'Custom 7-day secret', expiryOption: 'custom', customDays: 7 });
            // Capture its displayed secret and close
            cy.get('#bootstrap-input', { timeout: 30000 }).invoke('val').then(() => {
                cy.get('[data-testid="secret-dialog-close"]').click();
                // Wait for table to have at least two rows
                cy.get('@secretsTable').find('tbody tr', { timeout: 30000 }).should('have.length.at.least', 2);

                // Verify the second (latest) row contains our description and shows ~7 days
                cy.get('@secretsTable').find('tbody tr').last().within(() => {
                    cy.get('td').eq(0).contains('Custom 7-day secret');
                    cy.get('td').eq(2).invoke('text').should('match', /7\s*day/i);
                });
                verifyLatestSecretCannotBeDeleted();

                // Add a third secret with no description and Never expires
                createSecretFromDialog({ expiryOption: 'never' });
                cy.get('#bootstrap-input', { timeout: 30000 }).invoke('val').then(() => {
                    cy.get('[data-testid="secret-dialog-close"]').click();

                    // Wait for table to have at least three rows
                    cy.get('@secretsTable').find('tbody tr', { timeout: 30000 }).should('have.length.at.least', 3);

                    // Verify the third (latest) row contains no description and never expires
                    cy.get('@secretsTable').find('tbody tr').last().within(() => {
                        cy.get('td').eq(0).invoke('text').then((descriptionText) => {
                            const normalizedText = (descriptionText || '').trim();
                            expect(normalizedText).to.match(/^(No description|—|-)?$/i);
                        });
                        cy.get('td').eq(2).contains(/Never expires/i);
                    });
                    verifyLatestSecretCannotBeDeleted();

                    // Delete the custom-expiry (7-day) secret by description
                    cy.get('@secretsTable').find('tbody tr').contains('td', 'Custom 7-day secret').parents('tr').within(() => {
                        cy.get('[data-testid="secret-delete-trigger"]').should('not.be.disabled').click({ force: true });
                    });
                    // Confirm delete in the delete-secret dialog
                    cy.get('[data-testid="delete-secret-dialog"]', { timeout: 30000 })
                        .should('be.visible')
                        .within(() => {
                            cy.get('[data-testid="delete-secret-confirm"]').should('be.visible').and('not.be.disabled').click();
                        });
                    cy.get('@secretsTable').find('tbody tr').contains('td', 'Custom 7-day secret').should('not.exist');
                });
            });
        });

        // Generate sandbox keys with one secret as well
        cy.get('body').then(($body) => {
            if ($body.find('#sandbox-keys-oauth').length > 0) {
                cy.get('#sandbox-keys-oauth').click();
            } else {
                cy.get('#sandbox-keys').click();
            }
        });
        cy.get('#generate-keys', { timeout: 30000 }).filter(':visible').first().click({ force: true });

        createSecretFromDialog({ description: 'Sandbox secret', expiryOption: '90' });
        cy.get('#bootstrap-input', { timeout: 30000 }).should('exist').invoke('val').should('not.be.empty');
        cy.get('[data-testid="secret-dialog-close"]').click();

        cy.get('[data-testid="secrets-table"]', { timeout: 30000 }).as('sandboxSecretsTable');
        cy.get('@sandboxSecretsTable').find('tbody tr', { timeout: 30000 }).should('have.length.at.least', 1);
        cy.get('@sandboxSecretsTable').find('tbody tr').last().within(() => {
            cy.get('td').eq(0).contains('Sandbox secret');
        });

        /*
        Updating keys we need to skip for now. Cypress is not checking the checkboxes but the actual one is not
        */
        // Updating the keys
        // Enabling authorization code grant type and updating keys

        // cy.get('#authorization_code').check();
        // cy.get('#callbackURL').click();
        // cy.get('#callbackURL').type('https://localhost');

        // cy.get('#generate-keys').click();
        // Checking if the code grant is still selected.
        // cy.get('#authorization_code').should('be.checked');


         /*
        Updating keys we need to skip for now. Cypress is not checking the checkboxes but the actual one is not
        */

        // Updating the keys
        // Enabling authorization code grant type and updating keys
        // cy.get('#authorization_code').check();
        // cy.get('#callbackURL').click();
        // cy.get('#callbackURL').type('https://localhost');
        // cy.get('#generate-keys').click();
        // Checking if the code grant is still selected.
        // cy.get('#authorization_code').should('be.checked');

        // Show hide keys
        // Commenting out the below as the consumer secret text field is removed with the multiple client secret support.
        // The text field can be viewable when the multiple client secret support is disabled.
        // cy.get('#visibility-toggle-btn').click();
        // cy.get('#consumer-secret').should('have.attr', 'type', 'text');
        // cy.contains('visibility_off').should('be.visible');
    })

    after(() => {
       cy.deleteApp(appName);
    })
})