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
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

import Utils from "@support/utils";
import DevportalComonPage from "../../../support/pages/devportal/DevportalComonPage";

const devportalComonPage = new DevportalComonPage();

describe("WSDL Download URL - Copy URL button", () => {
    const { developer, publisher, password } = Utils.getUserInfo();
    const COPY_URL_BTN = '[aria-label="Copy URL"]';
    const EXP_PARAM_RE = /[?&]exp=(\d+)/;
    const SIG_PARAM_RE = /[?&]sig=[0-9a-f]{64}/;
    const stubClipboard = () => {
        const captured = { value: null };
        cy.window().then((win) => {
            cy.stub(win.navigator.clipboard, "writeText").callsFake((text) => {
                captured.value = text;
                return Promise.resolve();
            });
        });
        return captured;
    };

    const visitOverview = (apiId) => {
        cy.intercept("GET", "**/apis/**/comments**").as("getComments");
        cy.intercept("GET", "**/apis/**/documents").as("getDocuments");
        cy.intercept("GET", "**/throttling-policies/subscription").as("getSubscriptionPolicies");
        cy.intercept("GET", "**/apis/**/thumbnail").as("getThumbnail");

        cy.visit(`/devportal/apis/${apiId}/overview?tenant=carbon.super`);

        cy.wait("@getComments").its("response.statusCode").should("eq", 200);
        cy.wait("@getDocuments").its("response.statusCode").should("eq", 200);
        cy.wait("@getSubscriptionPolicies").its("response.statusCode").should("eq", 200);
        cy.wait("@getThumbnail");

        devportalComonPage.waitUntillDevportalLoaderSpinnerExit();
    };

    // creates a SOAP API via import-wsdl, creates a revision and deploys it
    const addSOAPAPI = ({ name, version = "1.0.0", context }) => {
        context = context || name.replace(/[^A-Z0-9]/ig, "_");

        const additionalProperties = JSON.stringify({
            name,
            version,
            context,
            policies: ["Unlimited"],
            endpointConfig: {
                endpoint_type: "http",
                sandbox_endpoints: { url: "http://localhost:8081" },
                production_endpoints: { url: "http://localhost:8081" },
            },
        });

        return new Cypress.Promise((resolve, reject) => {
            Utils.getApiToken().then((token) => {
                const tmpWsdlPath = `/tmp/${name}.wsdl`;

                cy.fixture("wsdl/sample.wsdl", "utf8").then((wsdlContent) => {
                    cy.writeFile(tmpWsdlPath, wsdlContent);
                });

                const importCurl = `curl -k -X POST \
                    -H "Authorization: Bearer ${token}" \
                    -F "file=@${tmpWsdlPath};type=application/octet-stream" \
                    -F 'additionalProperties=${additionalProperties}' \
                    -F "implementationType=SOAP" \
                    "${Cypress.config().baseUrl}/api/am/publisher/v4/apis/import-wsdl"`;

                cy.exec(importCurl).then((result) => {
                    cy.log("import-wsdl stdout: " + result.stdout);
                    const apiId = JSON.parse(result.stdout).id;
                    expect(apiId, "import-wsdl should return a valid API id").to.be.a("string");

                    Utils.addRevision(apiId).then((revId) => {
                        Utils.deployRevision(apiId, revId).then(() => {
                            resolve(apiId);
                        });
                    });
                });
            }).catch(() => reject("Error while creating SOAP API"));
        });
    };

    // updates API visibility via Publisher REST API to restricted
    const setAPIVisibility = (apiId, visibility) => {
        Utils.getApiToken().then((token) => {
            const getCurl = `curl -k -X GET \
                -H "Authorization: Bearer ${token}" \
                "${Cypress.config().baseUrl}/api/am/publisher/v4/apis/${apiId}"`;

            cy.exec(getCurl).then((getResult) => {
                const apiBody = JSON.parse(getResult.stdout);
                apiBody.visibility = visibility;
                apiBody.visibleRoles = visibility === "RESTRICTED"
                    ? ["internal/subscriber"]
                    : [];

                const tmpPayloadPath = `/tmp/${apiId}-visibility.json`;
                cy.writeFile(tmpPayloadPath, JSON.stringify(apiBody));

                const putCurl = `curl -k -X PUT \
                    -H "Authorization: Bearer ${token}" \
                    -H "Content-Type: application/json" \
                    -d @${tmpPayloadPath} \
                    "${Cypress.config().baseUrl}/api/am/publisher/v4/apis/${apiId}"`;

                cy.exec(putCurl).then((putResult) => {
                    cy.log(`SET visibility to ${visibility}: ${putResult.stdout}`);
                });
            });
        });
    };

    let sharedApiId;

    before(() => {
        const apiName = Utils.generateName();
        cy.loginToPublisher(publisher, password);

        addSOAPAPI({ name: apiName }).then((apiId) => {
            sharedApiId = apiId;
            Utils.publishAPI(apiId).then(() => {
                cy.logoutFromPublisher();
            });
        });
    });

    after(() => {
        if (!sharedApiId) return;
        cy.loginToPublisher(publisher, password);
        Utils.deleteAPI(sharedApiId).then(() => {
            sharedApiId = null;
        });
    });

    // Test 1 — Clicking Copy URL for a PUBLIC API copies a plain URL without exp or sig params.
    it.only("Clicking Copy URL for a PUBLIC API should copy a plain URL without exp or sig", () => {
        cy.loginToDevportal(developer, password);
        visitOverview(sharedApiId);

        const captured = stubClipboard();

        cy.get(COPY_URL_BTN)
            .should("exist")
            .and("be.visible")
            .click();

        cy.wrap(null).should(() => {
            expect(captured.value, "Clipboard must have been written").to.not.be.null;
        });
        cy.then(() => {
            cy.log(`Clipboard content: ${captured.value}`);
            expect(captured.value, "PUBLIC URL must NOT have exp param").to.not.match(EXP_PARAM_RE);
            expect(captured.value, "PUBLIC URL must NOT have sig param").to.not.match(SIG_PARAM_RE);
            expect(captured.value, "URL must reference the /wsdl resource").to.include("/wsdl");
        });

        cy.logoutFromDevportal();
        devportalComonPage.waitUntillDevportalLoaderSpinnerExit();
    });

    // Test 2 — clicking Copy URL for Private API copies a URL with exp and sig params.
    it.only("Clicking Copy URL for a RESTRICTED API should copy a signed URL with exp and sig", () => {
        cy.loginToPublisher(publisher, password);
        setAPIVisibility(sharedApiId, "RESTRICTED");
        cy.logoutFromPublisher();

        cy.loginToDevportal(developer, password);
        visitOverview(sharedApiId);

        const captured = stubClipboard();

        cy.get(COPY_URL_BTN)
            .should("exist")
            .and("be.visible")
            .click();

        cy.wrap(null).should(() => {
            expect(captured.value, "Clipboard must have been written").to.not.be.null;
        });
        cy.then(() => {
            cy.log(`Clipboard content: ${captured.value}`);

            expect(captured.value, "URL must contain exp param").to.match(EXP_PARAM_RE);
            expect(captured.value, "URL must contain sig param (64-char hex)").to.match(SIG_PARAM_RE);

            const expValue   = parseInt(captured.value.match(EXP_PARAM_RE)[1], 10);
            const nowSeconds = Math.floor(Date.now() / 1000);

            expect(expValue, "exp must be in the future").to.be.gt(nowSeconds);
            expect(expValue, "exp must be within 15 min from now")
                .to.be.lte(nowSeconds + 15 * 60 + 30);

            expect(captured.value, "URL must reference the /wsdl resource").to.include("/wsdl");
        });

        cy.logoutFromDevportal();
        devportalComonPage.waitUntillDevportalLoaderSpinnerExit();
    });

    // Test 3 — SOAP APIs should have a default document generated in devportal
    it.only("Default document should exist and show SOAP operations in devportal for a SOAP API", () => {
        cy.loginToDevportal(developer, password);
        cy.intercept("GET", `**/apis/${sharedApiId}/documents**`).as("getDocuments");
        cy.visit(`/devportal/apis/${sharedApiId}/documents?tenant=carbon.super`);
        cy.wait("@getDocuments").its("response.statusCode").should("eq", 200);

        devportalComonPage.waitUntillDevportalLoaderSpinnerExit();

        cy.url().should("include", "/documents/default");
        cy.get('.GenerateDocumentForSOAP-apiHeader')
            .should("exist")
            .and("be.visible");
        cy.contains("Operations").should("be.visible");
        cy.get('.GenerateDocumentForSOAP-operationItem')
            .should("have.length.at.least", 1);
        cy.contains("HTTP Method:").should("be.visible");
        cy.contains("POST").should("be.visible");
        cy.contains("Binding:").should("be.visible");
        cy.logoutFromDevportal();

        devportalComonPage.waitUntillDevportalLoaderSpinnerExit();
    });

    // Test 4 — Copy URL button must NOT render when wsdlUri ends with .zip.
    it.only("Copy URL button should not exist when the WSDL is a zip file", () => {
        const apiName = Utils.generateName();

        const additionalProperties = JSON.stringify({
            name: apiName,
            version: "1.0.0",
            context: apiName.replace(/[^A-Z0-9]/ig, "_"),
            policies: ["Unlimited"],
            endpointConfig: {
                endpoint_type: "http",
                sandbox_endpoints: { url: "http://localhost:8081" },
                production_endpoints: { url: "http://localhost:8081" },
            },
        });

        cy.loginToPublisher(publisher, password);

        Utils.getApiToken().then((token) => {
            const tmpWsdlPath = `/tmp/${apiName}.wsdl`;
            const tmpZipPath  = `/tmp/${apiName}.zip`;

            cy.fixture("wsdl/sample.wsdl", "utf8").then((wsdlContent) => {
                cy.writeFile(tmpWsdlPath, wsdlContent);
            });
            cy.exec(`zip -j ${tmpZipPath} ${tmpWsdlPath}`);

            const importCurl = `curl -k -X POST \
                -H "Authorization: Bearer ${token}" \
                -F "file=@${tmpZipPath};type=application/zip" \
                -F 'additionalProperties=${additionalProperties}' \
                -F "implementationType=SOAP" \
                "${Cypress.config().baseUrl}/api/am/publisher/v4/apis/import-wsdl"`;

            cy.exec(importCurl).then((result) => {
                cy.log("import-wsdl (zip) stdout: " + result.stdout);
                const apiId = JSON.parse(result.stdout).id;
                expect(apiId, "import-wsdl should return a valid API id").to.be.a("string");

                Utils.addRevision(apiId).then((revId) => {
                    Utils.deployRevision(apiId, revId).then(() => {
                        Utils.publishAPI(apiId).then(() => {
                            cy.logoutFromPublisher();
                            cy.loginToDevportal(developer, password);
                            visitOverview(apiId);
                            cy.get(COPY_URL_BTN).should("not.exist");
                            cy.logoutFromDevportal();
                            devportalComonPage.waitUntillDevportalLoaderSpinnerExit();
                            cy.loginToPublisher(publisher, password);
                            Utils.deleteAPI(apiId);
                            cy.logoutFromPublisher();
                        });
                    });
                });
            });
        });
    });
});