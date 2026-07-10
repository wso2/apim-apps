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

/*
 * These tests cover the dev portal self sign up behaviour driven by the "username unavailable"
 * configuration. The behaviour is driven by two self registration settings configured from the carbon console
 * (Main -> Identity -> Identity Providers -> Resident -> User Onboarding -> Self Registration):
 *
 *   - "Display message if username unavailable" (showUsernameUnavailability)
 *   - "Send sign up confirmation email" (sendConfirmationEmail)
 *
 * The combination of these two settings dictates the final registration message and whether the
 * "username already taken" error is revealed when an already existing username is used.
 *
 * | Scenario | Display message if username unavailable | Send sign up confirmation email | Final message                                 | Existing username error |
 * |----------|-----------------------------------------|---------------------------------|-----------------------------------------------|-------------------------|
 * | 1        | Enabled (default)                       | Disabled (default)              | User registration completed successfully      | shown                   |
 * | 2        | Enabled                                 | Enabled                         | Confirmation link has been sent to your email | shown                   |
 * | 3        | Disabled                                | Disabled                        | User registration completed successfully      | shown                   |
 * | 4        | Disabled                                | Enabled                         | Confirmation link has been sent to your email | not shown - flow proceeds and shows the final message |
 */

function getSuperTenantEmail(username) {
    return `${username}@test.com`;
}

Cypress.config('pageLoadTimeout', 150000)

describe("Self SignUp - username unavailable configuration", () => {
    const { carbonUsername, carbonPassword } = Utils.getUserInfo();
    const testTenant = 'wso2.com';
    const superTenant = 'carbon.super';

    // Dummy values used to fill the create account form.
    const password = 'Test@123';
    const firstName = 'John';
    const lastName = 'Doe';

    const tenantAdminUsername = 'admin@wso2.com';
    const tenantAdminPassword = 'admin';

    // A unique suffix generated once per run so the self sign up usernames never collide with users
    // left over from a previous (e.g. interrupted) run. This keeps the spec re-runnable without
    // having to manually reset state between runs. It is kept to (at most) 6 digits so the generated
    // usernames (longest is `selfSignUpIsoTenant1r######` = 27 chars) stay within the 30 character
    // username pattern policy.
    const runId = Utils.getRandomDate() % 1000000;

    // Bare carbon usernames created during this run, collected for best-effort cleanup in after().
    const createdSuperUsers = [];
    const createdTenantUsers = [];

    const scenarios = [
        {
            id: 1,
            showUsernameUnavailability: true,
            sendConfirmationEmail: false,
            successMessage: 'User registration completed successfully',
            existingUsernameErrors: true,
        },
        {
            id: 2,
            showUsernameUnavailability: true,
            sendConfirmationEmail: true,
            successMessage: 'Confirmation link has been sent to your email',
            existingUsernameErrors: true,
        },
        {
            id: 3,
            showUsernameUnavailability: false,
            sendConfirmationEmail: false,
            successMessage: 'User registration completed successfully',
            existingUsernameErrors: true,
        },
        {
            id: 4,
            showUsernameUnavailability: false,
            sendConfirmationEmail: true,
            successMessage: 'Confirmation link has been sent to your email',
            existingUsernameErrors: false,
        },
    ];

    // Tenants under test along with the carbon credentials used to configure them and a helper to
    // build the self sign up details (sign up username, the username as stored in carbon and email).
    const tenantsUnderTest = [
        {
            label: 'super tenant',
            tenant: superTenant,
            adminUsername: carbonUsername,
            adminPassword: carbonPassword,
            buildUser: (scenarioId) => {
                const carbonUser = `selfSignUpSuper${scenarioId}r${runId}`;
                createdSuperUsers.push(carbonUser);
                return {
                    carbonUser,
                    signUpUsername: carbonUser,
                    email: getSuperTenantEmail(carbonUser),
                };
            },
        },
        {
            label: 'wso2 tenant',
            tenant: testTenant,
            adminUsername: tenantAdminUsername,
            adminPassword: tenantAdminPassword,
            buildUser: (scenarioId) => {
                const carbonUser = `selfSignUpTenant${scenarioId}r${runId}`;
                createdTenantUsers.push(carbonUser);
                return {
                    carbonUser,
                    signUpUsername: Utils.getTenantUser(carbonUser, testTenant),
                    email: Utils.getTenantUser(carbonUser, testTenant),
                };
            },
        },
    ];

    tenantsUnderTest.forEach(({ label, tenant, adminUsername, adminPassword, buildUser }) => {
        scenarios.forEach((scenario) => {
            const user = buildUser(scenario.id);

            it(`Scenario ${scenario.id} - ${label} `
                + `(Display message if username unavailable: ${scenario.showUsernameUnavailability ? 'Enabled' : 'Disabled'}, `
                + `Send sign up confirmation email: ${scenario.sendConfirmationEmail ? 'Enabled' : 'Disabled'})`, () => {

                // Set up the self registration configuration for this scenario.
                cy.configureSelfSignUpInCarbonPortal(adminUsername, adminPassword, tenant,
                    scenario.showUsernameUnavailability, scenario.sendConfirmationEmail);

                // Register a brand new user and assert the expected final message.
                cy.selfSignUpNewUser(user.signUpUsername, password, firstName, lastName, user.email,
                    tenant, scenario.successMessage);

                // Attempt to self sign up again with the same username.
                if (scenario.existingUsernameErrors) {
                    // The "username already taken" error is revealed at the username step.
                    cy.addExistingUserUsingSelfSignUp(user.signUpUsername, tenant);
                } else {
                    // The username existence is not revealed - the flow proceeds and ends with the
                    // same confirmation message instead of an error.
                    cy.selfSignUpNewUser(user.signUpUsername, password, firstName, lastName, user.email,
                        tenant, scenario.successMessage);
                }
            });
        });
    });

    /*
     * Cross-tenant isolation.
     *
     * The self registration settings are maintained per tenant, so changing one tenant's configuration
     * must never change another tenant's self sign up behaviour. Each case below configures the super
     * tenant and the wso2 tenant with opposite settings - crucially the second tenant is configured
     * AFTER the first, so if the settings leaked across tenants the later configuration would override
     * the earlier one. The test then asserts that each tenant still follows its own configuration.
     */
    const configShowMessageNoEmail = {
        showUsernameUnavailability: true,
        sendConfirmationEmail: false,
        successMessage: 'User registration completed successfully',
        existingUsernameErrors: true,
    };
    const configHideMessageWithEmail = {
        showUsernameUnavailability: false,
        sendConfirmationEmail: true,
        successMessage: 'Confirmation link has been sent to your email',
        existingUsernameErrors: false,
    };

    // Two cases with the configurations swapped between the tenants, so isolation is proven in both
    // directions and is not an artifact of which tenant happens to be configured first.
    const isolationCases = [
        { caseId: 1, superConfig: configShowMessageNoEmail, tenantConfig: configHideMessageWithEmail },
        { caseId: 2, superConfig: configHideMessageWithEmail, tenantConfig: configShowMessageNoEmail },
    ];

    // Repeats the self sign up with an already existing username and asserts the behaviour expected for
    // the given configuration (either the "already taken" error, or the flow silently proceeding).
    function attemptExistingUserSignUp(signUpUsername, email, tenant, config) {
        if (config.existingUsernameErrors) {
            cy.addExistingUserUsingSelfSignUp(signUpUsername, tenant);
        } else {
            cy.selfSignUpNewUser(signUpUsername, password, firstName, lastName, email, tenant,
                config.successMessage);
        }
    }

    isolationCases.forEach(({ caseId, superConfig, tenantConfig }) => {
        const superUser = `selfSignUpIsoSuper${caseId}r${runId}`;
        const tenantUser = `selfSignUpIsoTenant${caseId}r${runId}`;
        createdSuperUsers.push(superUser);
        createdTenantUsers.push(tenantUser);
        const superEmail = getSuperTenantEmail(superUser);
        const tenantSignUpUser = Utils.getTenantUser(tenantUser, testTenant);

        it(`Configuration isolation case ${caseId} - configuring one tenant does not affect the other`, () => {
            // Apply opposite configurations to the two tenants (the wso2 tenant is configured last).
            cy.configureSelfSignUpInCarbonPortal(carbonUsername, carbonPassword, superTenant,
                superConfig.showUsernameUnavailability, superConfig.sendConfirmationEmail);

            cy.configureSelfSignUpInCarbonPortal(tenantAdminUsername, tenantAdminPassword, testTenant,
                tenantConfig.showUsernameUnavailability, tenantConfig.sendConfirmationEmail);

            // The super tenant must follow its OWN configuration, unaffected by the wso2 tenant config.
            cy.selfSignUpNewUser(superUser, password, firstName, lastName, superEmail, superTenant,
                superConfig.successMessage);
            attemptExistingUserSignUp(superUser, superEmail, superTenant, superConfig);

            // The wso2 tenant must follow its OWN (opposite) configuration, unaffected by the super tenant.
            cy.selfSignUpNewUser(tenantSignUpUser, password, firstName, lastName, tenantSignUpUser,
                testTenant, tenantConfig.successMessage);

            attemptExistingUserSignUp(tenantSignUpUser, tenantSignUpUser, testTenant, tenantConfig);
        });
    });

    after(function () {
        // Reset the self registration configuration back to the default behaviour FIRST, so the configs
        // are always restored even if the user cleanup below runs into trouble.
        // (Display message if username unavailable: Enabled, Send sign up confirmation email: Disabled,
        //  which also leaves Lock user account on creation disabled - the product defaults.)
        cy.configureSelfSignUpInCarbonPortal(carbonUsername, carbonPassword, superTenant, true, false);
        cy.configureSelfSignUpInCarbonPortal(tenantAdminUsername, tenantAdminPassword, testTenant, true, false);

        // Best-effort removal of the super tenant users created during this run. searchAndDeleteUserIfExist
        // tolerates a missing user, so a partially completed run does not break cleanup.
        cy.carbonLogin(carbonUsername, carbonPassword);
        createdSuperUsers.forEach((carbonUser) => {
            cy.searchAndDeleteUserIfExist(carbonUser);
        });
        cy.carbonLogout();

        // Best-effort removal of the wso2 tenant users created during this run.
        cy.carbonLogin(tenantAdminUsername, tenantAdminPassword);
        createdTenantUsers.forEach((carbonUser) => {
            cy.searchAndDeleteUserIfExist(carbonUser);
        });
        cy.carbonLogout();
    })
});
