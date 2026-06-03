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
