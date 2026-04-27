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

import Utils from '@support/utils';

// Smoke test for the Unmanaged APIs tab. Stubs the BFF endpoints so the
// test runs against a vanilla APIM build with no ADS daemon attached;
// the goal is to verify wiring (route → list page → row click → detail
// page), not the back-end. End-to-end tests against a live daemon live
// outside the apim-apps repo.
describe('Governance — Unmanaged APIs tab', () => {
    const { carbonUsername, carbonPassword } = Utils.getUserInfo();

    const summaryStub = {
        cycleAt: '2026-04-27T10:00:00Z',
        managedTotal: 8,
        unmanagedTotal: 3,
        skipInternal: true,
        byType: { shadow: 2, drift: 1 },
        byReachability: { external: 3, internal: 0 },
        byService: [
            { serviceIdentity: 'orders.default.svc.cluster.local:8080', count: 2 },
            { serviceIdentity: 'inventory.default.svc.cluster.local:8080', count: 1 },
        ],
    };
    const listStub = {
        list: [
            {
                id: 'cypress-stub-1',
                serviceIdentity: 'orders.default.svc.cluster.local:8080',
                method: 'GET',
                normalizedPath: '/v1/orders/{id}',
                classification: 'shadow',
                isInternal: false,
                observationCount: 124,
                distinctClientCount: 9,
                lastSeenAt: '2026-04-27T09:55:00Z',
            },
        ],
        pagination: { total: 1, limit: 25, offset: 0 },
    };
    const detailStub = {
        ...listStub.list[0],
        envKind: 'k8s',
        namespace: 'default',
        serviceName: 'orders',
        statusCodes: [200, 404],
        rawPathSamples: ['/v1/orders/abc-123', '/v1/orders/xyz-987'],
        distinctClientsSample: ['10.0.1.4', '10.0.1.5'],
        observationCount: 124,
        distinctClientCount: 9,
        firstSeenAt: '2026-04-26T08:00:00Z',
        lastSeenAt: '2026-04-27T09:55:00Z',
        serviceManagedAPIs: [],
    };

    beforeEach(() => {
        cy.loginToAdmin(carbonUsername, carbonPassword);
        cy.intercept(
            'GET',
            '**/api/am/admin/**/governance/discovery/summary*',
            { statusCode: 200, body: summaryStub },
        ).as('getSummary');
        cy.intercept(
            'GET',
            '**/api/am/admin/**/governance/discovery/discovered-apis*',
            { statusCode: 200, body: listStub },
        ).as('getList');
        cy.intercept(
            'GET',
            '**/api/am/admin/**/governance/discovery/discovered-apis/cypress-stub-1*',
            { statusCode: 200, body: detailStub },
        ).as('getDetail');
    });

    it('renders the list page with the title and findings table', () => {
        cy.visit('/admin/governance/unmanaged-apis');
        cy.contains('h4', 'Unmanaged APIs').should('be.visible');
        cy.wait('@getSummary');
        cy.wait('@getList');
        cy.contains('td', 'orders.default.svc.cluster.local:8080')
            .should('be.visible');
    });

    it('navigates to the detail page when a row is clicked', () => {
        cy.visit('/admin/governance/unmanaged-apis');
        cy.wait('@getList');
        cy.contains('td', 'orders.default.svc.cluster.local:8080').click();
        cy.url().should('include', '/governance/unmanaged-apis/cypress-stub-1');
        cy.wait('@getDetail');
        cy.contains('GET /v1/orders/{id}').should('be.visible');
        cy.contains('Identity').should('be.visible');
        cy.contains('Evidence').should('be.visible');
        cy.contains('Why this is a finding').should('be.visible');
    });
});
