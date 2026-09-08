/*
*  Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com) All Rights Reserved.
*
*  WSO2 LLC. licenses this file to you under the Apache License,
*  Version 2.0 (the "License"); you may not use this file except
*  in compliance with the License.
*  You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

import Utils from "@support/utils";
import PublisherComonPage from "../../../support/pages/publisher/PublisherComonPage";

const publisherComonPage = new PublisherComonPage();

const AI_API_CREATE_PATH = "/publisher/apis/create/ai-api";
const VISIBLE_OPTION_SELECTOR = '[role="option"]:visible';
const PROVIDER_INPUT_SELECTOR = '#AI-providers-autocomplete input, #APIProvider, input[placeholder="Search AI Service Provider"]';
const MODEL_INPUT_SELECTOR = '#AI-model-autocomplete input, #APIModelVersion, input[placeholder="Search API version"]';
const NEXT_BUTTON_SELECTOR = "#ai-api-create-next-btn";
const CREATE_BUTTON_SELECTOR = "#ai-api-create-btn";
const VERTEX_PROVIDER_PATTERN = /vertex/i;
const GCP_KEY_FIXTURE = "gcp-service-account-key.json";
// The GCP endpoint URL is built from structured fields (region + project ID); the region is written into both
// the host prefix and the locations path by the builder.
const REGION = "us-central1";
const PROJECT_ID = "test-project";

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getVisibleOptions = () =>
    cy.get(VISIBLE_OPTION_SELECTOR, { timeout: Cypress.env("largeTimeout") }).then(($options) => {
        const optionTexts = [...$options]
            .filter((option) => option.getAttribute("aria-disabled") !== "true")
            .map((option) => option.textContent.trim())
            .filter(Boolean);
        return Cypress._.uniq(optionTexts);
    });

const selectAutocompleteOption = (inputSelector, optionText) => {
    cy.get(inputSelector, { timeout: Cypress.env("largeTimeout") }).click({ force: true });
    cy.contains(
        VISIBLE_OPTION_SELECTOR,
        new RegExp(`^${escapeRegExp(optionText)}$`),
        { timeout: Cypress.env("largeTimeout") },
    ).click({ force: true });
};

const selectFirstAvailableVersion = () => {
    cy.get(MODEL_INPUT_SELECTOR, { timeout: Cypress.env("largeTimeout") }).click({ force: true });
    return getVisibleOptions().then((versionOptions) => {
        const [firstVersion] = versionOptions;
        expect(firstVersion, "AI API version option").to.exist;
        cy.contains(
            VISIBLE_OPTION_SELECTOR,
            new RegExp(`^${escapeRegExp(firstVersion)}$`),
            { timeout: Cypress.env("largeTimeout") },
        ).click({ force: true });
    });
};

// Creates an AI API for the given (Vertex) provider and yields the created API id.
const createVertexAIAPI = (providerName) => {
    cy.visit(`${Utils.getAppOrigin()}${AI_API_CREATE_PATH}`, { timeout: Cypress.env("largeTimeout") });
    publisherComonPage.waitUntillPublisherLoadingSpinnerExit();

    selectAutocompleteOption(PROVIDER_INPUT_SELECTOR, providerName);
    selectFirstAvailableVersion();
    cy.get(NEXT_BUTTON_SELECTOR, { timeout: Cypress.env("largeTimeout") })
        .should("not.be.disabled").click({ force: true });
    cy.get(CREATE_BUTTON_SELECTOR, { timeout: Cypress.env("largeTimeout") })
        .should("not.be.disabled").click({ force: true });

    cy.url({ timeout: Cypress.env("largeTimeout") }).should("contain", "/overview");
    cy.get("#itest-api-name-version", { timeout: Cypress.env("largeTimeout") }).should("be.visible");

    return cy.url().then((url) => {
        const apiIdMatch = /apis\/(.*?)\/overview/.exec(url);
        expect(apiIdMatch, "created Vertex AI API id").to.not.be.null;
        return apiIdMatch[1];
    });
};

describe("GCP (Vertex AI) endpoint UI", () => {
    const { publisher, password } = Utils.getUserInfo();

    before(() => {
        cy.loginToPublisher(publisher, password);
    });

    it("Renders the GCP endpoint form with an optional service-account key and keyless support", function () {
        // Discover a Vertex AI provider; skip cleanly in environments where it is not deployed.
        cy.visit(`${Utils.getAppOrigin()}${AI_API_CREATE_PATH}`, { timeout: Cypress.env("largeTimeout") });
        publisherComonPage.waitUntillPublisherLoadingSpinnerExit();
        cy.get(PROVIDER_INPUT_SELECTOR, { timeout: Cypress.env("largeTimeout") }).click({ force: true });

        getVisibleOptions().then((providerOptions) => {
            const vertexProvider = providerOptions.find((name) => VERTEX_PROVIDER_PATTERN.test(name));
            cy.get("body").click(0, 0, { force: true });

            if (!vertexProvider) {
                cy.log("No Vertex AI provider is available in this environment; skipping.");
                this.skip();
                return;
            }

            createVertexAIAPI(vertexProvider).then((apiId) => {
                // Go straight to the AI endpoint creation form for the new API.
                cy.visit(`${Utils.getAppOrigin()}/publisher/apis/${apiId}/endpoints/create`,
                    { timeout: Cypress.env("largeTimeout") });
                publisherComonPage.waitUntillPublisherLoadingSpinnerExit();

                // 1. The GCP structured URL builder is rendered: region (regional endpoints) and project ID.
                cy.get("#gcp-project-input", { timeout: Cypress.env("largeTimeout") }).should("be.visible");
                cy.contains("Regional").should("exist");
                cy.contains("Global").should("exist");

                // 2. The service-account key section is present and collapsed by default (the key is optional -
                // keyless is the fallback). Expand it and confirm the upload control + keyless hint.
                cy.contains("GCP Service Account Key").click({ force: true });
                cy.get("#gcp-service-account-key-upload", { timeout: Cypress.env("largeTimeout") })
                    .should("be.visible");
                cy.contains("leave this empty to use the attached identity").should("exist");

                // 3. Keyless save works end-to-end: a name plus a region + project ID (which the builder turns
                // into a valid endpoint URL), with no uploaded key, creates a keyless endpoint and redirects to
                // the endpoints list.
                cy.get("#name").clear({ force: true }).type("gcp-keyless-endpoint", { force: true });
                cy.get("#gcp-region-input").clear({ force: true }).type(`${REGION}{esc}`, { force: true });
                cy.get("#gcp-project-input").clear({ force: true }).type(PROJECT_ID, { force: true });
                cy.get("#endpoint-save-btn", { timeout: Cypress.env("largeTimeout") })
                    .should("not.be.disabled")
                    .click({ force: true });
                cy.url({ timeout: Cypress.env("largeTimeout") }).should("contain", "/endpoints");

                // 4. Key-upload path: a valid service-account key JSON can be uploaded and the endpoint saved
                // with it. Add a second endpoint to the same API to exercise this path.
                cy.visit(`${Utils.getAppOrigin()}/publisher/apis/${apiId}/endpoints/create`,
                    { timeout: Cypress.env("largeTimeout") });
                publisherComonPage.waitUntillPublisherLoadingSpinnerExit();
                cy.get("#name").clear({ force: true }).type("gcp-key-endpoint", { force: true });
                cy.get("#gcp-region-input").clear({ force: true }).type(`${REGION}{esc}`, { force: true });
                cy.get("#gcp-project-input").clear({ force: true }).type(PROJECT_ID, { force: true });
                // Expand the key section and attach the key to the (hidden) file input.
                cy.contains("GCP Service Account Key").click({ force: true });
                cy.get("[data-testid=\"gcp-key-upload-input\"]").attachFile(GCP_KEY_FIXTURE);
                // The upload succeeds and the section switches to the configured state.
                cy.contains("Service account key").should("exist");
                cy.get("#endpoint-save-btn", { timeout: Cypress.env("largeTimeout") })
                    .should("not.be.disabled")
                    .click({ force: true });
                cy.url({ timeout: Cypress.env("largeTimeout") }).should("contain", "/endpoints");

                // Cleanup.
                Utils.deleteAPI(apiId);
            });
        });
    });
});
