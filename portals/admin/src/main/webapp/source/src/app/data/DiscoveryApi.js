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
 * Reuses the existing GOVERNANCE_CLIENT channel — the new endpoints live in
 * the same admin v4 OpenAPI surface as the existing Governance feature, so
 * a separate APIClientFactory client type isn't needed.
 */
export default class DiscoveryApi {
    constructor() {
        this.client = new APIClientFactory()
            .getAPIClient(
                Utils.getCurrentEnvironment(),
                Utils.CONST.GOVERNANCE_CLIENT,
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
