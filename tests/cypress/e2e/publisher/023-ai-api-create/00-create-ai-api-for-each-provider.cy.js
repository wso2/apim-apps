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

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getVisibleOptions = () =>
    cy.get(VISIBLE_OPTION_SELECTOR, { timeout: Cypress.env("largeTimeout") }).then(($options) => {
        const optionTexts = [...$options]
            .filter((option) => option.getAttribute("aria-disabled") !== "true")
            .map((option) => option.textContent.trim())
            .filter(Boolean);

        expect(optionTexts.length, "visible selectable options").to.be.greaterThan(0);
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

const getProviderOptions = () => {
    cy.visit(`${Utils.getAppOrigin()}${AI_API_CREATE_PATH}`, {
        timeout: Cypress.env("largeTimeout"),
    });
    publisherComonPage.waitUntillPublisherLoadingSpinnerExit();
    cy.get(PROVIDER_INPUT_SELECTOR, { timeout: Cypress.env("largeTimeout") }).click({ force: true });

    return getVisibleOptions().then((providerOptions) => {
        cy.get("body").click(0, 0, { force: true }).then(() => providerOptions);
    });
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

const createAIAPIForProvider = (providerName) => {
    cy.visit(`${Utils.getAppOrigin()}${AI_API_CREATE_PATH}`, {
        timeout: Cypress.env("largeTimeout"),
    });
    publisherComonPage.waitUntillPublisherLoadingSpinnerExit();

    selectAutocompleteOption(PROVIDER_INPUT_SELECTOR, providerName);
    selectFirstAvailableVersion();
    cy.get(NEXT_BUTTON_SELECTOR, { timeout: Cypress.env("largeTimeout") })
        .should("not.be.disabled")
        .click({ force: true });
    cy.get(CREATE_BUTTON_SELECTOR, { timeout: Cypress.env("largeTimeout") })
        .should("not.be.disabled")
        .click({ force: true });

    cy.url({ timeout: Cypress.env("largeTimeout") }).should("contain", "/overview");
    cy.get("#itest-api-name-version", { timeout: Cypress.env("largeTimeout") }).should("be.visible");

    cy.url().then((url) => {
        const apiIdMatch = /apis\/(.*?)\/overview/.exec(url);
        expect(apiIdMatch, `created AI API id for provider ${providerName}`).to.not.be.null;
        Utils.deleteAPI(apiIdMatch[1]);
    });
};

describe("Create AI APIs for each provider", () => {
    const { publisher, password } = Utils.getUserInfo();

    before(() => {
        cy.loginToPublisher(publisher, password);
    });

    it("Creates an AI API once for each available provider", () => {
        getProviderOptions().then((providerOptions) => {
            providerOptions.forEach((providerName) => {
                cy.log(`Creating AI API for provider: ${providerName}`);
                createAIAPIForProvider(providerName);
            });
        });
    });
});
