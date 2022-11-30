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
            try {
                cy.getCookie('WSO2_AM_TOKEN_1_Default')
                    .then((cookieP1) => {
                        cy.getCookie('AM_ACC_TOKEN_DEFAULT_P2')
                            .then((cookieP2) => {
                                resolve(`${cookieP1.value}${cookieP2.value}`);
                            })
                    });
            } catch (e) {
                reject('Error while extracting token');
            }
        })
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
                        -H "Authorization: Bearer ${token}"  "${Cypress.config().baseUrl}/api/am/publisher/v2/apis/import-openapi"`;
                        cy.exec(curl).then(result => {
                            const apiId = JSON.parse(result.stdout);
                            resolve(apiId.id);
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
                        -H "Authorization: Bearer ${token}"  "${Cypress.config().baseUrl}/api/am/publisher/v3/apis"`;
                        cy.exec(curl).then(result => {
                            cy.log(result.stdout);
                            cy.log(result.stderr);
                            const apiId = JSON.parse(result.stdout);
                            resolve(apiId.id);
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
        return Utils.addAPI({...data, payload: newPayload});
    }

    static publishAPI(apiId) {
        return new Cypress.Promise((resolve, reject) => {
            try {
                Utils.getApiToken()
                    .then((token) => {
                        const curl = `curl -k -X POST \
                        -H "Content-Type: application/json" \
                        -H "Authorization: Bearer ${token}"  "${Cypress.config().baseUrl}/api/am/publisher/v3/apis/change-lifecycle?action=Publish&apiId=${apiId}"`;
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
        // todo need to remove this check after `console.err(err)` -> `console.err(err)` in Endpoints.jsx
        Cypress.on('uncaught:exception', (err, runnable) => {
            // returning false here prevents Cypress from
            // failing the test
            return false
        });
        return new Cypress.Promise((resolve, reject) => {
            try {
                Utils.getApiToken()
                    .then((token) => {
                        const curl = `curl -k -X DELETE \
                        -H "Content-Type: application/json" \
                        -H "Authorization: Bearer ${token}"  "${Cypress.config().baseUrl}/api/am/publisher/v3/apis/${apiId}"`;
                        cy.exec(curl).then(result => {
                            resolve(result.stdout);
                        })
                    })
            } catch (e) {
                reject('Error while deleting api');
            }
        })
    }

    static deleteAPIProduct(productId) {
        // todo need to remove this check after `console.err(err)` -> `console.err(err)` in Endpoints.jsx
        Cypress.on('uncaught:exception', (err, runnable) => {
            // returning false here prevents Cypress from
            // failing the test
            return false
        });
        return new Cypress.Promise((resolve, reject) => {
            try {
                Utils.getApiToken()
                    .then((token) => {
                        const curl = `curl -k -X DELETE \
                        -H "Content-Type: application/json" \
                        -H "Authorization: Bearer ${token}"  "${Cypress.config().baseUrl}/api/am/publisher/v3/api-products/${productId}"`;
                        cy.exec(curl).then(result => {
                            resolve(result.stdout);
                        })
                    })
            } catch (e) {
                reject('Error while deleting api product');
            }
        })
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
