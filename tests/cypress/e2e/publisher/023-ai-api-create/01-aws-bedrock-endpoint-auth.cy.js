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

/*
 * Verifies the AWS Bedrock endpoint auth UI in AddEditAIEndpoint.jsx:
 *   - The "Select Credential Source" radio group switches between stored and environment
 *     credentials; the environment option hides the Access/Secret Key fields.
 *   - Region stays required/visible in both modes.
 *   - "Enable STS AssumeRole" toggle reveals the Role ARN / Role Region / External ID fields.
 *   - Credential source and assume role are independent (environment + assume role can both be on).
 * No real AWS credentials are needed - this exercises client-side form behaviour only.
 */

import Utils from "@support/utils";
import PublisherComonPage from "../../../support/pages/publisher/PublisherComonPage";

const publisherComonPage = new PublisherComonPage();

const AI_API_CREATE_PATH = "/publisher/apis/create/ai-api";
const VISIBLE_OPTION_SELECTOR = '[role="option"]:visible';
const PROVIDER_INPUT_SELECTOR =
    '#AI-providers-autocomplete input, #APIProvider, input[placeholder="Search AI Service Provider"]';
const MODEL_INPUT_SELECTOR =
    '#AI-model-autocomplete input, #APIModelVersion, input[placeholder="Search API version"]';
const NEXT_BUTTON_SELECTOR = "#ai-api-create-next-btn";
const CREATE_BUTTON_SELECTOR = "#ai-api-create-btn";

// Selectors from AddEditAIEndpoint.jsx (AWS SigV4 auth section)
const STORED_CREDS_RADIO = 'input[name="credential-source"][value="stored"]';
const ENV_CREDS_RADIO = 'input[name="credential-source"][value="environment"]';
const ASSUME_ROLE_CHECKBOX = 'input[name="enableSTSAssumeRole"]';
const ACCESS_KEY_FIELD = "#aws-access-key";
const SECRET_KEY_FIELD = "#aws-secret-key";
const REGION_FIELD = "#aws-region";

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getVisibleOptions = () =>
    cy.get(VISIBLE_OPTION_SELECTOR, { timeout: Cypress.env("largeTimeout") }).then(($options) => {
        const optionTexts = [...$options]
            .filter((option) => option.getAttribute("aria-disabled") !== "true")
            .map((option) => option.textContent.trim())
            .filter(Boolean);
        return Cypress._.uniq(optionTexts);
    });

const selectFirstAvailableVersion = () => {
    cy.get(MODEL_INPUT_SELECTOR, { timeout: Cypress.env("largeTimeout") }).click({ force: true });
    getVisibleOptions().then((versionOptions) => {
        const [firstVersion] = versionOptions;
        expect(firstVersion, "AI API version option").to.exist;
        cy.contains(
            VISIBLE_OPTION_SELECTOR,
            new RegExp(`^${escapeRegExp(firstVersion)}$`),
            { timeout: Cypress.env("largeTimeout") },
        ).click({ force: true });
    });
};

/**
 * Creates an AWS Bedrock AI API and yields its id. When no Bedrock provider is registered in the
 * environment under test, calls `skipSpec` and yields null instead.
 *
 * @param {Function} skipSpec invoked when there is no Bedrock provider to test against.
 */
const createBedrockAPI = (skipSpec) => {
    cy.visit(`${Utils.getAppOrigin()}${AI_API_CREATE_PATH}`, {
        timeout: Cypress.env("largeTimeout"),
    });
    publisherComonPage.waitUntillPublisherLoadingSpinnerExit();

    // Read the registered providers before choosing one. Clicking an option that does not exist would
    // time out as a hard failure, so environments without Bedrock are skipped rather than failed.
    cy.get(PROVIDER_INPUT_SELECTOR, { timeout: Cypress.env("largeTimeout") }).click({ force: true });
    return getVisibleOptions().then((providerOptions) => {
        // Match by name, tolerant of exact wording.
        const bedrockProvider = providerOptions.find((option) => /bedrock/i.test(option));
        if (!bedrockProvider) {
            cy.log("No AWS Bedrock provider is registered in this environment - skipping the spec.");
            skipSpec();
            return null;
        }
        cy.contains(
            VISIBLE_OPTION_SELECTOR,
            new RegExp(`^${escapeRegExp(bedrockProvider)}$`),
            { timeout: Cypress.env("largeTimeout") },
        ).click({ force: true });
        selectFirstAvailableVersion();

        cy.get(NEXT_BUTTON_SELECTOR, { timeout: Cypress.env("largeTimeout") })
            .should("not.be.disabled")
            .click({ force: true });
        cy.get(CREATE_BUTTON_SELECTOR, { timeout: Cypress.env("largeTimeout") })
            .should("not.be.disabled")
            .click({ force: true });

        cy.url({ timeout: Cypress.env("largeTimeout") }).should("contain", "/overview");
        return cy.url().then((url) => {
            const apiIdMatch = /apis\/(.*?)\/overview/.exec(url);
            expect(apiIdMatch, "created AWS Bedrock AI API id").to.not.be.null;
            return apiIdMatch[1];
        });
    });
};

const openEndpointCreateForm = (apiId) => {
    cy.visit(`${Utils.getAppOrigin()}/publisher/apis/${apiId}/endpoints/create`, {
        timeout: Cypress.env("largeTimeout"),
    });
    publisherComonPage.waitUntillPublisherLoadingSpinnerExit();
    // AWS SigV4 section is rendered for Bedrock APIs; wait for its credential-source radios.
    cy.get(ENV_CREDS_RADIO, { timeout: Cypress.env("largeTimeout") }).should("exist");
};

describe("AWS Bedrock endpoint - environment credentials & assume role UI", () => {
    const { publisher, password } = Utils.getUserInfo();
    let apiId;

    // A regular function (not an arrow) so Mocha's context - and therefore this.skip() - is available.
    before(function () {
        cy.loginToPublisher(publisher, password);
        createBedrockAPI(() => this.skip()).then((id) => {
            apiId = id;
        });
    });

    // Single test: Cypress clears the session between tests (default testIsolation),
    // so we log in once (before) and run every assertion within one loaded form.
    it("switches stored keys / environment credentials and toggles assume role correctly", () => {
        openEndpointCreateForm(apiId);

        // 1. Stored is the default credential source: keys + region visible, assume role off.
        cy.get(STORED_CREDS_RADIO).should("be.checked");
        cy.get(ENV_CREDS_RADIO).should("not.be.checked");
        cy.get(ASSUME_ROLE_CHECKBOX).should("not.be.checked");
        cy.get(ACCESS_KEY_FIELD).should("be.visible");
        cy.get(SECRET_KEY_FIELD).should("be.visible");
        cy.get(REGION_FIELD).should("be.visible");

        // 2. Environment selected -> key fields removed from DOM, region stays.
        cy.get(ENV_CREDS_RADIO).check({ force: true }).should("be.checked");
        cy.get(STORED_CREDS_RADIO).should("not.be.checked");
        cy.get(ACCESS_KEY_FIELD).should("not.exist");
        cy.get(SECRET_KEY_FIELD).should("not.exist");
        cy.get(REGION_FIELD).should("be.visible");

        // 3. Back to stored -> key fields restored.
        cy.get(STORED_CREDS_RADIO).check({ force: true }).should("be.checked");
        cy.get(ENV_CREDS_RADIO).should("not.be.checked");
        cy.get(ACCESS_KEY_FIELD).should("be.visible");
        cy.get(SECRET_KEY_FIELD).should("be.visible");

        // 4. Assume Role ON -> role fields revealed (collapsed until then).
        cy.contains("label", "Role ARN").should("not.exist");
        cy.get(ASSUME_ROLE_CHECKBOX).check({ force: true }).should("be.checked");
        cy.contains("label", "Role ARN").should("be.visible");
        cy.contains("label", "Role Region").should("be.visible");
        cy.contains("label", "External ID").should("be.visible");

        // 5. Environment credentials + Assume Role together: no stored keys, role fields present.
        cy.get(ENV_CREDS_RADIO).check({ force: true }).should("be.checked");
        cy.get(ACCESS_KEY_FIELD).should("not.exist");
        cy.get(SECRET_KEY_FIELD).should("not.exist");
        cy.contains("label", "Role ARN").should("be.visible");
        cy.get(REGION_FIELD).should("be.visible");
    });

    after(() => {
        if (apiId) {
            Utils.deleteAPI(apiId);
        }
    });
});
