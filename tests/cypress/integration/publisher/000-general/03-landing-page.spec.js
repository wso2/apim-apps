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

describe("Landing page", () => {
    const { publisher, password } = Utils.getUserInfo();

    before(function () {
        cy.loginToPublisher(publisher, password);
    })

    it.only("Click and check all cards", () => {
        cy.visit(`/publisher/apis`);
        cy.intercept(
            {
                method: 'GET',
                path: '**/apis?limit=10&offset=0',
            },
            {
                body: { "count": 0, "list": [], "pagination": { "offset": 0, "limit": 10, "total": 0, "next": "", "previous": "" } },
            },
        ).as('apiGet');
        cy.wait("@apiGet", { timeout: 180000 }).then((interceptions) => {
            console.log(interceptions);
            cy.get('div').contains('REST API').scrollIntoView().should('be.visible');
            cy.get('div').contains('SOAP API').scrollIntoView().should('be.visible');
            cy.get('div').contains('GraphQL').scrollIntoView().should('be.visible');
            cy.get('div').contains('Streaming API').scrollIntoView().should('be.visible');

            // Checking links under rest apis
            cy.get('div').contains('REST API').scrollIntoView().click();
            cy.get('a').contains('Start From Scratch')
                .invoke('attr', 'href')
                .should('eq', '/publisher/apis/create/rest');
            cy.get('a').contains('Import Open API')
                .invoke('attr', 'href')
                .should('eq', '/publisher/apis/create/openapi');

            // Checking links under SOAP apis
            cy.get('div').contains('SOAP API').scrollIntoView().click();
            cy.get('a').contains('Import WSDL')
                .invoke('attr', 'href')
                .should('eq', '/publisher/apis/create/wsdl');

             // Checking links under GraphQL apis
             cy.get('div').contains('GraphQL').scrollIntoView().click();
             cy.get('a').contains('Import GraphQL SDL')
                 .invoke('attr', 'href')
                 .should('eq', '/publisher/apis/create/graphQL');

            // Checking links under Streaming API apis
            cy.get('div').contains('Streaming API').scrollIntoView().click();
            cy.get('a').contains('Web Socket API')
                .invoke('attr', 'href')
                .should('eq', '/publisher/apis/create/streamingapi/ws');
            cy.get('a').contains('Webhook API')
                .invoke('attr', 'href')
                .should('eq', '/publisher/apis/create/streamingapi/websub');
            cy.get('a').contains('SSE API')
                .invoke('attr', 'href')
                .should('eq', '/publisher/apis/create/streamingapi/sse');

            cy.get('a').contains('Import an AsyncAPI')
                .invoke('attr', 'href')
                .should('eq', '/publisher/apis/create/asyncapi');

        });
    });
});