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
 *   - "Use environment credentials (EC2/EKS)" toggle hides the Access/Secret Key fields.
 *   - Region stays required/visible in both modes.
 *   - "Enable STS AssumeRole" toggle reveals the Role ARN / Role Region / External ID fields.
 *   - The two toggles are independent (environment + assume role can both be on).
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
const ENV_CREDS_CHECKBOX = 'input[name="useEnvironmentCredentials"]';
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

const selectAutocompleteOption = (inputSelector, optionRegExp) => {
    cy.get(inputSelector, { timeout: Cypress.env("largeTimeout") }).click({ force: true });
    cy.contains(VISIBLE_OPTION_SELECTOR, optionRegExp, {
        timeout: Cypress.env("largeTimeout"),
    }).click({ force: true });
};

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
 * Creates an AWS Bedrock AI API and yields its id. Skips the whole spec if no
 * Bedrock provider is registered in the environment under test.
 */
const createBedrockAPI = () => {
    cy.visit(`${Utils.getAppOrigin()}${AI_API_CREATE_PATH}`, {
        timeout: Cypress.env("largeTimeout"),
    });
    publisherComonPage.waitUntillPublisherLoadingSpinnerExit();

    // Pick the AWS Bedrock provider (match by name, tolerant of exact wording).
    selectAutocompleteOption(PROVIDER_INPUT_SELECTOR, /bedrock/i);
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
};

const openEndpointCreateForm = (apiId) => {
    cy.visit(`${Utils.getAppOrigin()}/publisher/apis/${apiId}/endpoints/create`, {
        timeout: Cypress.env("largeTimeout"),
    });
    publisherComonPage.waitUntillPublisherLoadingSpinnerExit();
    // AWS SigV4 section is rendered for Bedrock APIs; wait for its toggle.
    cy.get(ENV_CREDS_CHECKBOX, { timeout: Cypress.env("largeTimeout") }).should("exist");
};

describe("AWS Bedrock endpoint - environment credentials & assume role UI", () => {
    const { publisher, password } = Utils.getUserInfo();
    let apiId;

    before(() => {
        cy.loginToPublisher(publisher, password);
        createBedrockAPI().then((id) => {
            apiId = id;
        });
    });

    // Single test: Cypress clears the session between tests (default testIsolation),
    // so we log in once (before) and run every assertion within one loaded form.
    it("toggles stored keys / environment credentials / assume role correctly", () => {
        openEndpointCreateForm(apiId);

        // 1. Stored mode is the default: keys + region visible, toggles off.
        cy.get(ENV_CREDS_CHECKBOX).should("not.be.checked");
        cy.get(ASSUME_ROLE_CHECKBOX).should("not.be.checked");
        cy.get(ACCESS_KEY_FIELD).should("be.visible");
        cy.get(SECRET_KEY_FIELD).should("be.visible");
        cy.get(REGION_FIELD).should("be.visible");

        // 2. Environment credentials ON -> key fields removed from DOM, region stays.
        cy.get(ENV_CREDS_CHECKBOX).check({ force: true }).should("be.checked");
        cy.get(ACCESS_KEY_FIELD).should("not.exist");
        cy.get(SECRET_KEY_FIELD).should("not.exist");
        cy.get(REGION_FIELD).should("be.visible");

        // 3. Environment credentials OFF again -> key fields restored.
        cy.get(ENV_CREDS_CHECKBOX).uncheck({ force: true }).should("not.be.checked");
        cy.get(ACCESS_KEY_FIELD).should("be.visible");
        cy.get(SECRET_KEY_FIELD).should("be.visible");

        // 4. Assume Role ON -> role fields revealed (collapsed until then).
        cy.contains("label", "Role ARN").should("not.exist");
        cy.get(ASSUME_ROLE_CHECKBOX).check({ force: true }).should("be.checked");
        cy.contains("label", "Role ARN").should("be.visible");
        cy.contains("label", "Role Region").should("be.visible");
        cy.contains("label", "External ID").should("be.visible");

        // 5. Environment credentials + Assume Role together: no stored keys, role fields present.
        cy.get(ENV_CREDS_CHECKBOX).check({ force: true }).should("be.checked");
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
