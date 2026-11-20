/*
 * Copyright (c) 2026, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
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

const DOCS_URL = 'https://apim.docs.wso2.com/en/latest/ai-gateway/choreo-ai-gateway/';
const MESSAGE = 'We recommend the Choreo AI Gateway, managed through the Choreo Agent Control Plane, '
    + 'for all new AI APIs and MCP Servers.';
const AI_TOAST = '[data-testid="ai-gateway-toast-aiApi"]';
const MCP_TOAST = '[data-testid="ai-gateway-toast-mcpServer"]';
const ANY_TOAST = '[data-testid^="ai-gateway-toast-"][role="status"]';

describe("publisher-000-05 : AI Gateway recommendation toast", () => {
    const { publisher, password } = Utils.getUserInfo();

    Cypress.on('uncaught:exception', () => false);

    beforeEach(() => {
        cy.loginToPublisher(publisher, password);
    });

    it("Shows the toast when the user starts creating an AI API, and the flow continues after closing it", () => {
        cy.visit('/publisher/apis/create');
        cy.get('#itest-ai-api-create-title', { timeout: Cypress.env('largeTimeout') }).should('be.visible');
        cy.get(ANY_TOAST).should('not.exist');

        cy.get('#itest-ai-api-create-title').click();
        cy.get(AI_TOAST).should('be.visible')
            .and('contain.text', 'Creating an AI API?')
            .and('contain.text', MESSAGE);
        cy.get(AI_TOAST).invoke('text').should('not.match', /deprecat|end of life|\bEOL\b|\d/i);
        cy.get('[data-testid="ai-gateway-toast-get-started"]')
            .should('have.attr', 'href', DOCS_URL)
            .and('have.attr', 'target', '_blank')
            .and('have.attr', 'rel', 'noopener noreferrer');

        // Close the toast; the opened card and its link stay usable.
        cy.get('[data-testid="ai-gateway-toast-close"]').click();
        cy.get(AI_TOAST).should('not.exist');
        cy.get('#itest-ai-api-create-description').should('be.visible').click();
        cy.location('pathname').should('eq', '/publisher/apis/create/ai-api');
        cy.contains('Create an API using an AI Service provider API definition.').should('be.visible');
        cy.get(ANY_TOAST).should('not.exist');
    });

    it("Closes the toast when the user clicks Create AI API without closing it first", () => {
        cy.visit('/publisher/apis/create');
        cy.get('#itest-ai-api-create-title', { timeout: Cypress.env('largeTimeout') }).click();
        cy.get(AI_TOAST).should('be.visible');

        cy.get('#itest-ai-api-create-description').should('be.visible').click();
        cy.location('pathname').should('eq', '/publisher/apis/create/ai-api');
        cy.contains('Create an API using an AI Service provider API definition.').should('be.visible');
        cy.get(ANY_TOAST).should('not.exist');
    });

    it("Shows the AI API toast again every time the flow starts, without stacking", () => {
        cy.visit('/publisher/apis/create');
        cy.get('#itest-ai-api-create-title', { timeout: Cypress.env('largeTimeout') }).click();
        cy.get(AI_TOAST).should('be.visible');
        cy.get('[data-testid="ai-gateway-toast-close"]').click();
        cy.get(AI_TOAST).should('not.exist');

        cy.visit('/publisher/apis/create');
        cy.get('#itest-ai-api-create-title', { timeout: Cypress.env('largeTimeout') }).click();
        cy.get(AI_TOAST).should('be.visible');
        // A second click inside the open card must not add another toast.
        cy.get('#itest-ai-api-create-title').click();
        cy.get(AI_TOAST).should('have.length', 1);
    });

    it("Does not show the toast for other API types", () => {
        cy.visit('/publisher/apis/create');
        cy.get('#itest-rest-api-create-menu', { timeout: Cypress.env('largeTimeout') }).click();
        cy.get('#itest-id-landing-rest-create-default').should('be.visible');
        cy.get(ANY_TOAST).should('not.exist');
    });

    it("Shows the toast when the user starts creating an MCP Server", () => {
        cy.visit('/publisher/mcp-servers/create');
        cy.get('#itest-mcp-servers-welcome-msg', { timeout: Cypress.env('largeTimeout') }).should('be.visible');
        cy.get(MCP_TOAST).should('be.visible')
            .and('contain.text', 'Creating an MCP Server?')
            .and('contain.text', MESSAGE);
        cy.get('[data-testid="ai-gateway-toast-close"]').click();
        cy.get(MCP_TOAST).should('not.exist');
    });
});
