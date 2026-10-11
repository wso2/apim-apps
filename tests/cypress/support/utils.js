import { ADJECTIVES, NOUNS } from "./mockData/names-const"

export default class Utils {
    static getRandomRange(min = 0, max = 20) {
        return Math.round(Math.random() * (max - min) + min);
    }
    static getRandomDate(res = 1000) {
        return Math.floor(Date.now() / res);

    }
    static getRandomString(length = 8) {
        return Math.random().toString(36).substring(4).substring(0, length);
    }

    static getAppOrigin() {
        return Cypress.config().baseUrl;
    }

    static capFirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    static generateName() {
        return (
            ADJECTIVES[Utils.getRandomRange(0, ADJECTIVES.length + 1)] +
            "-" +
            NOUNS[Utils.getRandomRange(0, NOUNS.length + 1)]
        )
    }
    static getApiToken() {
        return new Cypress.Promise((resolve, reject) => {
            cy.getCookie('WSO2_AM_TOKEN_1_Default').then((cookieP1) => {
                cy.getCookie('AM_ACC_TOKEN_DEFAULT_P2').then((cookieP2) => {
                    if (!cookieP1?.value || !cookieP2?.value) {
                        reject('Error while extracting token: required auth cookies are missing.');
                        return;
                    }
                    resolve(`${cookieP1.value}${cookieP2.value}`);
                });
            });
        })
    }

    // Poll GET /apis/<id> until 200 — create can return an id before the API is
    // retrievable, causing 500s on follow-ups; throw so the cause surfaces directly.
    static waitForApiRetrievable(token, apiId) {
        if (!apiId) {
            throw new Error('waitForApiRetrievable: API create did not return an id');
        }
        const curl = `curl -k -s -f --retry 30 --retry-delay 2 --retry-all-errors \
        -o /dev/null \
        -H "Authorization: Bearer ${token}" "${Cypress.config().baseUrl}/api/am/publisher/v4/apis/${apiId}"`;
        return cy.exec(curl, { failOnNonZeroExit: false }).then((result) => {
            if (result.code !== 0) {
                throw new Error(
                    `waitForApiRetrievable: API ${apiId} was not retrievable after 60s readiness poll ` +
                    `(curl exit ${result.code}). Likely cause: eventhub propagation lag or an APIM-side error; ` +
                    `check ACP carbon logs for this API id.`
                );
            }
        });
    }

    static addAPIfromSwagger(data) {
        let { type, name, version, context, payload } = data;
        type = type || 'rest';
        name = name || Utils.generateName();
        context = context || name.replace(/[^A-Z0-9]/ig, "_");
        version = version || '1.0.0';

        const newPayload = payload || `{"name":"${name}","version":"${version}","context":"${context}","policies":["Unlimited"]}`;
        return new Cypress.Promise((resolve, reject) => {
            try {
                Utils.getApiToken()
                    .then((token) => {
                        const curl = `curl -k -X POST \
                        -H "Content-Type: application/json" \
                        -d '${newPayload}' \
                        -H "Authorization: Bearer ${token}"  "${Cypress.config().baseUrl}/api/am/publisher/v4/apis/import-openapi"`;
                        cy.exec(curl).then(result => {
                            console.log('[addAPIfromSwagger] stdout:', result.stdout);
                            console.log('[addAPIfromSwagger] stderr:', result.stderr);
                            let apiId;
                            try {
                                apiId = JSON.parse(result.stdout);
                            } catch (e) {
                                throw new Error(`addAPIfromSwagger: non-JSON response. body=${result.stdout}`);
                            }
                            if (!apiId || !apiId.id) {
                                throw new Error(`addAPIfromSwagger: server returned no id. body=${result.stdout}`);
                            }
                            Utils.waitForApiRetrievable(token, apiId.id).then(() => {
                                resolve(apiId.id);
                            });
                        })
                    })
            } catch (e) {
                reject('Error while creating api');
            }
        })
    };

    static addAPI(data) {
        let { type, name, version, context, payload } = data;
        type = type || 'rest';
        name = name || Utils.generateName();
        context = context || name.replace(/[^A-Z0-9]/ig, "_");
        version = version || '1.0.0';

        const newPayload = payload || `{"name":"${name}","version":"${version}","context":"${context}","policies":["Unlimited"]}`;
        return new Cypress.Promise((resolve, reject) => {
            try {
                Utils.getApiToken()
                    .then((token) => {
                        const curl = `curl -k -X POST \
                        -H "Content-Type: application/json" \
                        -d '${newPayload}' \
                        -H "Authorization: Bearer ${token}"  "${Cypress.config().baseUrl}/api/am/publisher/v4/apis"`;
                        cy.exec(curl).then(result => {
                            console.log('[addAPI] stdout:', result.stdout);
                            console.log('[addAPI] stderr:', result.stderr);
                            let apiId;
                            try {
                                apiId = JSON.parse(result.stdout);
                            } catch (e) {
                                throw new Error(`addAPI: non-JSON response. body=${result.stdout}`);
                            }
                            if (!apiId || !apiId.id) {
                                throw new Error(`addAPI: server returned no id. body=${result.stdout}`);
                            }
                            Utils.waitForApiRetrievable(token, apiId.id).then(() => {
                                resolve(apiId.id);
                            });
                        })
                    })
            } catch (e) {
                reject('Error while creating api');
            }
        })
    };

    static addAPIWithEndpoints(data) {
        let { type, name, version, context, endpoint } = data;
        type = type || 'rest';
        name = name || Utils.generateName();
        context = context || name.replace(/[^A-Z0-9]/ig, "_");
        version = version || '1.0.0';
        endpoint = endpoint || 'https://lh';
        const newPayload = `{"name":"${name}","version":"${version}","context":"${context}","policies":["Unlimited"], "endpointConfig":{"endpoint_type":"http","sandbox_endpoints":{"url":"${endpoint}"},"production_endpoints":{"url":"${endpoint}"}}}`;
        return Utils.addAPI({ ...data, payload: newPayload });
    }

    static publishAPI(apiId) {
        return new Cypress.Promise((resolve, reject) => {
            try {
                Utils.getApiToken()
                    .then((token) => {
                        const curl = `curl -k -X POST \
                        -H "Content-Type: application/json" \
                        -H "Authorization: Bearer ${token}"  "${Cypress.config().baseUrl}/api/am/publisher/v4/apis/change-lifecycle?action=Publish&apiId=${apiId}"`;
                        cy.exec(curl).then(result => {
                            resolve(result.stdout);
                        })
                    })
            } catch (e) {
                reject('Error while publishing api');
            }
        })
    }

    static addRevision(apiId) {
        const payload = `{"description":""}`;

        return new Cypress.Promise((resolve, reject) => {
            try {
                Utils.getApiToken()
                    .then((token) => {
                        const curl = `curl -k -X POST \
                        -H "Content-Type: application/json" \
                        -d '${payload}' \
                        -H "Authorization: Bearer ${token}"  "${Cypress.config().baseUrl}/api/am/publisher/v4/apis/${apiId}/revisions"`;
                        cy.exec(curl).then(result => {
                            var resultJSON = JSON.parse(result.stdout);
                            cy.log(resultJSON);
                            resolve(resultJSON.id);
                        })
                    })
            } catch (e) {
                reject('Error while publishing api');
            }
        })
    }

    static deployRevision(apiId, revisionId) {
        // Derive vhost from baseUrl: a literal "localhost" payload fails to bind
        // when the Default env's vhost is a LAN IP, leaving endpointURLs empty.
        const vhost = new URL(Cypress.config('baseUrl')).hostname;
        const payload = `[{"name": "Default", "vhost": "${vhost}", "displayOnDevportal": true}]`;

        return new Cypress.Promise((resolve, reject) => {
            try {
                Utils.getApiToken()
                    .then((token) => {
                        const curl = `curl -k -X POST \
                        -H "Content-Type: application/json" \
                        -d '${payload}' \
                        -H "Authorization: Bearer ${token}"  "${Cypress.config().baseUrl}/api/am/publisher/v4/apis/${apiId}/deploy-revision?revisionId=${revisionId}"`;
                        cy.exec(curl).then(result => {
                            resolve(result.stdout);
                        })
                    })
            } catch (e) {
                reject('Error while publishing api');
            }
        })
    }



    static deleteAPI(apiId) {
        // Skip if no id was captured (a failed attempt can leave it undefined).
        if (!apiId) return;
        Cypress.on('uncaught:exception', () => false);
        return Utils.getApiToken().then((token) => {
            const curl = `curl -k -X DELETE \
                        -H "Content-Type: application/json" \
                        -H "Authorization: Bearer ${token}"  "${Cypress.config().baseUrl}/api/am/publisher/v4/apis/${apiId}"`;
            return cy.exec(curl, { failOnNonZeroExit: false });
        });
    }

    /**
     * Create an MCP Server from a minimal OpenAPI spec (multipart upload).
     * Returns a Cypress.Promise that resolves to the new MCP server's id.
     */
    static addMCPServer(data) {
        let { name, version, context } = data || {};
        name = name || Utils.generateName();
        version = version || '1.0.0';
        context = context || ('/' + name.replace(/[^A-Z0-9]/ig, '_'));

        const additionalProps = JSON.stringify({
            name,
            version,
            context,
            policies: ['Unlimited'],
        });
        // Minimal valid OpenAPI 3.0 spec with a server URL so APIM auto-creates a
        // production backend; single-quoted inner JSON avoids shell escaping issues
        const specJson = JSON.stringify({
            openapi: '3.0.0',
            info: { title: name, version },
            servers: [{ url: 'https://petstore.swagger.io/v2' }],
            paths: {},
        });

        return new Cypress.Promise((resolve, reject) => {
            try {
                Utils.getApiToken().then((token) => {
                    const tmpFile = `/tmp/mcp_spec_${name}.json`;
                    cy.exec(`printf '%s' '${specJson.replace(/'/g, "'\\''")}' > ${tmpFile}`).then(() => {
                        const curl = `curl -k -X POST \
                            -F "file=@${tmpFile};type=application/json" \
                            -F "additionalProperties=${additionalProps.replace(/"/g, '\\"')}" \
                            -H "Authorization: Bearer ${token}" \
                            "${Cypress.config().baseUrl}/api/am/publisher/v4/mcp-servers/generate-from-openapi"`;
                        cy.exec(curl).then((result) => {
                            cy.exec(`rm -f ${tmpFile}`, { failOnNonZeroExit: false });
                            let parsed;
                            try {
                                parsed = JSON.parse(result.stdout);
                            } catch (e) {
                                throw new Error(`addMCPServer: non-JSON response. body=${result.stdout}`);
                            }
                            if (!parsed || !parsed.id) {
                                throw new Error(`addMCPServer: server returned no id. body=${result.stdout}`);
                            }
                            resolve(parsed.id);
                        });
                    });
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     * Create an MCP Server using an existing API's properties via generate-from-api.
     * No OpenAPI spec is needed; APIM creates the server from the supplied metadata.
     * A backend may or may not be auto-created — callers should check /backends.
     * Resolves with the new MCP server's id.
     */
    static addMCPServerFromExistingAPI(data) {
        let { name, version, context } = data || {};
        name = name || Utils.generateName();
        version = version || '1.0.0';
        context = context || ('/' + name.replace(/[^A-Z0-9]/ig, '_'));

        const body = JSON.stringify({
            name,
            version,
            context,
            policies: ['Unlimited'],
            transport: ['http', 'https'],
            operations: [],
        });

        return new Cypress.Promise((resolve, reject) => {
            try {
                Utils.getApiToken().then((token) => {
                    const curl = `curl -k -s -X POST \
                        -H "Content-Type: application/json" \
                        -H "Authorization: Bearer ${token}" \
                        -d '${body.replace(/'/g, "'\\''")}' \
                        "${Cypress.config().baseUrl}/api/am/publisher/v4/mcp-servers/generate-from-api"`;
                    cy.exec(curl).then((result) => {
                        let parsed;
                        try {
                            parsed = JSON.parse(result.stdout);
                        } catch (e) {
                            throw new Error(`addMCPServerFromExistingAPI: non-JSON response. body=${result.stdout}`);
                        }
                        if (!parsed || !parsed.id) {
                            throw new Error(`addMCPServerFromExistingAPI: server returned no id. body=${result.stdout}`);
                        }
                        resolve(parsed.id);
                    });
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    static addMCPServerFromEndpointConfig(data) {
        let { name, version, context, endpoint, payload } = data;
        name = name || `TestMCP${Utils.getRandomString(4)}`;
        context = context || `/${name.toLowerCase()}`;
        version = version || '1.0.0';
        endpoint = endpoint || 'https://localhost:9443';
        const newPayload = payload || JSON.stringify({
            name,
            version,
            context,
            endpointConfig: {
                endpoint_type: 'http',
                sandbox_endpoints: { url: endpoint },
                production_endpoints: { url: endpoint },
            },
            transport: ['http', 'https'],
            visibility: 'PUBLIC',
            policies: ['Unlimited'],
        });
        return new Cypress.Promise((resolve, reject) => {
            Utils.getApiToken()
                .then((token) => {
                    const curl = `curl -k -s -X POST \
                    -H "Content-Type: application/json" \
                    -d '${newPayload}' \
                    -H "Authorization: Bearer ${token}" "${Cypress.config().baseUrl}/api/am/publisher/v4/mcp-servers/generate-from-api"`;
                    cy.exec(curl, { failOnNonZeroExit: false }).then((result) => {
                        let mcp;
                        try {
                            const cleaned = result.stdout.replace(/[\x01-\x1F]/g, ' ');
                            mcp = JSON.parse(cleaned);
                        } catch (e) {
                            reject(`Error while parsing MCP server creation response: ${result.stdout}`);
                            return;
                        }
                        if (!mcp || typeof mcp.id !== 'string') {
                            reject(`Error while creating MCP server: ${JSON.stringify(mcp)}`);
                            return;
                        }
                        resolve(mcp.id);
                    });
                });
        });
    }

    static addMCPRevision(mcpId) {
        return new Cypress.Promise((resolve, reject) => {
            try {
                Utils.getApiToken()
                    .then((token) => {
                        const curl = `curl -k -s -X POST \
                        -H "Content-Type: application/json" \
                        -d '{"description":""}' \
                        -H "Authorization: Bearer ${token}" "${Cypress.config().baseUrl}/api/am/publisher/v4/mcp-servers/${mcpId}/revisions"`;
                        cy.exec(curl, { failOnNonZeroExit: false }).then((result) => {
                            let revision;
                            try {
                                revision = JSON.parse(result.stdout);
                            } catch (e) {
                                reject(`addMCPRevision: non-JSON response. body=${result.stdout}`);
                                return;
                            }
                            if (!revision || typeof revision.id !== 'string') {
                                reject(`addMCPRevision: server returned no id. body=${result.stdout}`);
                                return;
                            }
                            resolve(revision.id);
                        });
                    });
            } catch (e) {
                reject('Error while creating MCP revision');
            }
        });
    }

    static deployMCPRevision(mcpId, revisionId) {
        const payload = `[{"name":"Default","vhost":"${new URL(Cypress.config().baseUrl).hostname}","displayOnDevportal":true}]`;
        return new Cypress.Promise((resolve, reject) => {
            try {
                Utils.getApiToken()
                    .then((token) => {
                        const curl = `curl -k -s -X POST \
                        -H "Content-Type: application/json" \
                        -d '${payload}' \
                        -H "Authorization: Bearer ${token}" "${Cypress.config().baseUrl}/api/am/publisher/v4/mcp-servers/${mcpId}/deploy-revision?revisionId=${revisionId}"`;
                        cy.exec(curl, { failOnNonZeroExit: false }).then((result) => {
                            resolve(result.stdout);
                        });
                    });
            } catch (e) {
                reject('Error while deploying MCP revision');
            }
        });
    }

    static publishMCPServer(mcpId) {
        return new Cypress.Promise((resolve, reject) => {
            try {
                Utils.getApiToken()
                    .then((token) => {
                        const curl = `curl -k -s -X POST \
                        -H "Content-Type: application/json" \
                        -H "Authorization: Bearer ${token}" "${Cypress.config().baseUrl}/api/am/publisher/v4/mcp-servers/change-lifecycle?action=Publish&mcpServerId=${mcpId}"`;
                        cy.exec(curl, { failOnNonZeroExit: false }).then((result) => {
                            resolve(result.stdout);
                        });
                    });
            } catch (e) {
                reject('Error while publishing MCP server');
            }
        });
    }

    /**
     * The tool name APIM auto-derives for the mocked `GET /status` operation with no
     * operationId, used by Utils.createMockToolMcpServer().
     */
    static getMockToolName() {
        return 'get_status';
    }

    /**
     * Creates, deploys, and publishes a uniquely-named MCP server exposing a single tool
     * (GET /status, no parameters, no auth) mapped from a small source API. The endpoint
     * URL is a placeholder that is never actually contacted - see the note below.
     *
     * Playground-invocation tests using this helper MUST intercept the tool invocation
     * (cy.intercept('POST', '**\/mcp', ...) filtering on `body.method === 'tools/call'`)
     * and reply with a canned result, rather than letting it hit a real backend. This is
     * safe to do because `initialize`, `notifications/initialized`, and `tools/list` are
     * all answered directly by the gateway from the MCP server's own stored metadata -
     * only `tools/call` ever attempts to reach the configured endpoint, and since that
     * call originates from the browser, intercepting it there means the placeholder URL
     * is never actually dialed. This avoids any dependency on a real backend (bundled
     * sample or external) purely for exercising the Playground's connect/list/run UI flow.
     *
     * Every test run gets its own uniquely-named resources via the same generate-from-api
     * + apiOperationMapping flow used elsewhere in this suite (see setupMcpWithTools in
     * 03-mcp-server-tools-management.spec.js), so there's no name collision with a
     * previous run's leftover server.
     * @returns {Cypress.Chainable<{mcpId: string, sourceApiId: string}>}
     */
    static createMockToolMcpServer() {
        const suffix = Utils.getRandomString(5);
        const srcName = `TestPlaygroundSrc${suffix}`;
        const srcContext = `/testplaygroundsrc${suffix}`;
        const mcpName = `TestPlaygroundMCP${suffix}`;
        const mcpContext = `/testplaygroundmcp${suffix}`;
        const baseUrl = Cypress.config().baseUrl;
        // Never actually contacted - tools/call is always intercepted by the caller before
        // this URL would be dialed. Points at the running pack itself purely so the value
        // is a well-formed, resolvable-looking URL.
        const endpointConfig = {
            endpoint_type: 'http',
            sandbox_endpoints: { url: `${baseUrl}/placeholder-unused-endpoint` },
            production_endpoints: { url: `${baseUrl}/placeholder-unused-endpoint` },
        };

        const srcPayload = JSON.stringify({
            name: srcName,
            version: '1.0.0',
            context: srcContext,
            policies: ['Unlimited'],
            endpointConfig,
            operations: [
                {
                    target: '/status', verb: 'GET', authType: 'Application & Application User', throttlingPolicy: 'Unlimited',
                },
            ],
        });

        return Utils.addAPI({ payload: srcPayload }).then((sourceApiId) => {
            expect(sourceApiId, 'Source API created').to.be.a('string');

            const mcpPayload = JSON.stringify({
                name: mcpName,
                version: '1.0.0',
                context: mcpContext,
                transport: ['http', 'https'],
                visibility: 'PUBLIC',
                policies: ['Unlimited'],
                endpointConfig,
                operations: [
                    {
                        feature: 'TOOL',
                        apiOperationMapping: {
                            apiId: sourceApiId,
                            apiName: srcName,
                            apiVersion: '1.0.0',
                            apiContext: srcContext,
                            backendOperation: { target: '/status', verb: 'GET' },
                        },
                    },
                ],
            });

            return Utils.addMCPServerFromEndpointConfig({ payload: mcpPayload }).then((mcpId) => {
                expect(mcpId, 'MCP server created').to.be.a('string');
                return Utils.addMCPRevision(mcpId).then((revisionId) => {
                    return Utils.deployMCPRevision(mcpId, revisionId).then(() => {
                        return Utils.publishMCPServer(mcpId).then(() => ({ mcpId, sourceApiId }));
                    });
                });
            });
        });
    }

    static deleteMCPServer(mcpId) {
        if (!mcpId) return;
        Cypress.on('uncaught:exception', (err, runnable) => {
            return false;
        });
        return new Cypress.Promise((resolve, reject) => {
            try {
                Utils.getApiToken()
                    .then((token) => {
                        const curl = `curl -k -s -X DELETE \
                        -H "Content-Type: application/json" \
                        -H "Authorization: Bearer ${token}" "${Cypress.config().baseUrl}/api/am/publisher/v4/mcp-servers/${mcpId}"`;
                        cy.exec(curl, { failOnNonZeroExit: false }).then((result) => {
                            resolve(result.stdout);
                        });
                        cy.wait(5000);
                    });
            } catch (e) {
                reject('Error while deleting MCP server');
            }
        });
    }

    static deleteAPIProduct(productId) {
        if (!productId) return;
        Cypress.on('uncaught:exception', () => false);
        return Utils.getApiToken().then((token) => {
            const curl = `curl -k -X DELETE \
                        -H "Content-Type: application/json" \
                        -H "Authorization: Bearer ${token}"  "${Cypress.config().baseUrl}/api/am/publisher/v4/api-products/${productId}"`;
            return cy.exec(curl, { failOnNonZeroExit: false });
        });
    }

    static cleanupProductAndApi(productName, apiName) {
        // Delete dependents before owners so orphans from a failed attempt
        // are removed even without captured ids.
        if (!productName && !apiName) return;
        Cypress.on('uncaught:exception', () => false);
        return Utils.getApiToken().then((token) => {
            const base = `${Cypress.config().baseUrl}/api/am/publisher/v4`;
            const auth = `-H "Authorization: Bearer ${token}"`;
            const deleteAllMatching = (listUrl, path) =>
                cy.exec(`curl -k -s ${auth} "${listUrl}"`, { failOnNonZeroExit: false }).then((res) => {
                    let ids = [];
                    try {
                        ids = (JSON.parse(res.stdout).list || []).map((x) => x.id).filter(Boolean);
                    } catch (e) {
                        // empty/non-JSON body — nothing to delete
                    }
                    const cmd = ids
                        .map((id) => `curl -k -s -o /dev/null -X DELETE ${auth} "${base}/${path}/${id}"`)
                        .join(' ; ') || 'true';
                    return cy.exec(cmd, { failOnNonZeroExit: false });
                });
            // Products before APIs (APIM blocks the latter while bound).
            // Guard each deletion: an empty query returns the whole tenant.
            const deleteProducts = productName
                ? deleteAllMatching(`${base}/api-products?query=${encodeURIComponent(productName)}&limit=50`, 'api-products')
                : cy.wrap(null);
            return deleteProducts.then(() => (apiName
                ? deleteAllMatching(`${base}/apis?query=${encodeURIComponent('name:' + apiName)}&limit=50`, 'apis')
                : cy.wrap(null)));
        });
    }

    static purgePetstoreArtifacts() {
        // Purge stale resources by name prefix so reserved scopes are
        // released before re-import.
        Cypress.on('uncaught:exception', () => false);
        return Utils.getApiToken().then((token) => {
            const base = `${Cypress.config().baseUrl}/api/am/publisher/v4`;
            const auth = `-H "Authorization: Bearer ${token}"`;
            const delMatching = (path, query, prefixes) =>
                cy.exec(`curl -k -s ${auth} "${base}/${path}?query=${encodeURIComponent(query)}&limit=50"`, { failOnNonZeroExit: false })
                    .then((res) => {
                        let ids = [];
                        try {
                            ids = (JSON.parse(res.stdout).list || [])
                                .filter((x) => prefixes.some((p) => (x.name || '').startsWith(p)))
                                .map((x) => x.id)
                                .filter(Boolean);
                        } catch (e) {
                            // empty/non-JSON body — nothing to delete
                        }
                        const cmd = ids
                            .map((id) => `curl -k -s -o /dev/null -X DELETE ${auth} "${base}/${path}/${id}"`)
                            .join(' ; ') || 'true';
                        return cy.exec(cmd, { failOnNonZeroExit: false });
                    });
            // Products before APIs (APIM blocks the latter while bound).
            return delMatching('api-products', 'prodpstest', ['prodpstest'])
                .then(() => delMatching('apis', 'name:apipstest', ['apipstest']))
                .then(() => delMatching('apis', 'name:SwaggerPetstore', ['SwaggerPetstore']));
        });
    }

    static purgeGatewayPolicies(nameFilter) {
        // Undeploy from every gateway before delete so gateway mappings
        // are freed even for orphaned resources.
        Cypress.on('uncaught:exception', () => false);
        return Utils.getApiToken().then((token) => {
            const base = `${Cypress.config().baseUrl}/api/am/publisher/v4`;
            const auth = `-H "Authorization: Bearer ${token}"`;
            return cy.exec(`curl -k -s ${auth} "${base}/gateway-policies?limit=50&offset=0"`, { failOnNonZeroExit: false }).then((res) => {
                let mappings = [];
                try {
                    mappings = (JSON.parse(res.stdout).list || []).filter(Boolean);
                } catch (e) {
                    // empty/non-JSON body — nothing to purge
                }
                if (nameFilter) {
                    mappings = mappings.filter((m) => (m.displayName || m.name) === nameFilter);
                }
                const cmds = mappings.flatMap((m) => {
                    const labels = (m.appliedGatewayLabels || ['Default']);
                    // Undeploy first (gatewayDeployment:false): APIM blocks
                    // deleting a still-deployed mapping.
                    const undeployBody = JSON.stringify(labels.map((l) => ({ gatewayLabel: l, gatewayDeployment: false })));
                    const undeploy = `curl -k -s -o /dev/null -X POST ${auth} -H "Content-Type: application/json" -d '${undeployBody}' "${base}/gateway-policies/${m.id}/deploy"`;
                    const del = `curl -k -s -o /dev/null -X DELETE ${auth} "${base}/gateway-policies/${m.id}"`;
                    return [undeploy, del];
                });
                return cy.exec(cmds.join(' ; ') || 'true', { failOnNonZeroExit: false });
            });
        });
    }

    static getUserInfo() {
        return {
            publisher: 'publisher',
            developer: 'developer',
            password: 'test123',
            carbonUsername: 'admin',
            carbonPassword: 'admin',
            tenantUser: 'tenantUser',
            tenant: 'wso2.com',
        }
    }

    static generateRandomNumber() {
        return Math.floor(Math.random() * (100000 - 1 + 1) + 1);
    }

    static getTenantUser(username, domain) {
        return `${username}@${domain}`;
    }
}
