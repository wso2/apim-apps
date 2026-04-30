/* eslint-disable */
/*
 * Copyright (c) 2026, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0.
 */

import Utils from './Utils';
import APIClientFactory from './APIClientFactory';

/**
 * Thin wrapper around the auto-generated Swagger client for the
 * /governance/discovery/* admin v4 endpoints. The endpoints are tagged
 * "Unmanaged APIs" in admin-api.yaml; the Swagger client groups operations
 * by that tag, so we access them via client.apis['Unmanaged APIs'].
 *
 * Uses the admin v4 API_CLIENT — our endpoints live in admin-api.yaml
 * (loaded from /api/am/admin/v4/swagger.yaml). The GOVERNANCE_CLIENT
 * loads a different spec (/api/am/governance/v1/swagger.yaml — a separate
 * WSO2 product feature) and would not see our routes.
 */
export default class DiscoveryApi {
    constructor() {
        this.client = new APIClientFactory()
            .getAPIClient(
                Utils.getCurrentEnvironment(),
                Utils.CONST.API_CLIENT,
            ).client;
    }

    _meta() {
        return { requestContentType: 'application/json' };
    }

    /**
     * GET /governance/discovery/summary.
     * @returns {Promise} resolves with the Swagger response wrapper
     */
    getSummary() {
        return this.client.then((client) =>
            client.apis['Unmanaged APIs'].getDiscoverySummary({}, this._meta()),
        );
    }

    /**
     * GET /governance/discovery/apis with optional filters.
     * @param {object} params { classification, service, internal, limit, offset }
     * @returns {Promise} resolves with the Swagger response wrapper
     */
    listDiscoveredApis(params = {}) {
        const query = {
            classification: params.classification,
            service: params.service,
            internal: params.internal,
            limit: params.limit !== undefined ? params.limit : 25,
            offset: params.offset !== undefined ? params.offset : 0,
        };
        return this.client.then((client) =>
            client.apis['Unmanaged APIs'].getDiscoveredAPIs(query, this._meta()),
        );
    }

    /**
     * GET /governance/discovery/apis/{discoveredApiId}.
     * @param {string} id discovered API id
     * @returns {Promise} resolves with the Swagger response wrapper
     */
    getDiscoveredApi(id) {
        return this.client.then((client) =>
            client.apis['Unmanaged APIs'].getDiscoveredAPIById(
                { discoveredApiId: id },
                this._meta(),
            ),
        );
    }

    /**
     * GET /governance/discovery/untrafficked.
     * @returns {Promise} resolves with the Swagger response wrapper
     */
    listUntrafficked() {
        return this.client.then((client) =>
            client.apis['Unmanaged APIs'].getUntrafficked({}, this._meta()),
        );
    }
}
