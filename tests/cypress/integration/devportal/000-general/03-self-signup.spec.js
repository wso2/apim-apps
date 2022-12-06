/*
 * Copyright (c) 2022, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Utils from "@support/utils";
import tenantConfigJson from "../../../fixtures/api_artifacts/tenant-conf.json";

function getSuperTenantEmail(username) {
    return `${username}@test.com`;
}

describe("Self SignUp", () => {
    const {publisher, password, carbonUsername, carbonPassword} = Utils.getUserInfo();
    const testTenant = 'wso2.com';
    const superTenant = 'carbon.super';
    const devPortal = 'devportal';
    const adminPortal = 'admin';
    const firstName = 'firstName';
    const lastName = 'lastName';
    const superTenant1Username = 'superTenant1';
    const superTenant2Username = 'superTenant2';
    const superTenant3Username = 'superTenant3';
    const superTenant4Username = 'superTenant4';
    const superTenant5Username = 'superTenant5';
    const tenant1Username = 'tenant1';
    const tenant2Username = 'tenant2';
    const tenant3Username = 'tenant3';
    const tenant4Username = 'tenant4';
    const tenant5Username = 'tenant5';
    const incorrectUsername = 'incorrectUsername';
    const incorrectPassword = 'incorrectPassword';
    const tenantAdminUsername = 'admin@wso2.com';
    const tenantAdminPassword = 'admin';
    const domain = 'INTERNAL';
    const userRole = 'testRole';
    const internalSubscriberRole = 'Internal/subscriber';
    const internalTestRole = 'Internal/testRole';
    const selfSignupDisabledConfigJson = JSON.parse(JSON.stringify(tenantConfigJson));
    delete selfSignupDisabledConfigJson.SelfSignUp;
    const customUserRoleAddedConfigJson = JSON.parse(JSON.stringify(tenantConfigJson));
    customUserRoleAddedConfigJson.SelfSignUp.SignUpRoles.push(internalTestRole);

    it.only("Test - Default self-signup behaviour of the super tenant", () => {
        cy.addNewUserUsingSelfSignUp(superTenant1Username, password, firstName, lastName, getSuperTenantEmail(superTenant1Username), superTenant);
        cy.addExistingUserUsingSelfSignUp(superTenant1Username, superTenant);
        cy.portalLogin(superTenant1Username, password, devPortal, superTenant);
        cy.logoutFromDevportal();
    });

    it.only("Test - Default self-signup behaviour of the wso2 tenant", () => {
        cy.addNewUserUsingSelfSignUp(Utils.getTenantUser(tenant1Username, testTenant), password, firstName, lastName, Utils.getTenantUser(tenant1Username, testTenant), testTenant);
        cy.addExistingUserUsingSelfSignUp(Utils.getTenantUser(tenant1Username, testTenant), testTenant);
        cy.portalLogin(Utils.getTenantUser(tenant1Username, testTenant), password, devPortal, testTenant);
        cy.logoutFromDevportal();
    });

    it.only("Test - Login to the devPortal using incorrect user credentials", () => {
        cy.portalLoginUsingIncorrectUserCredentials(incorrectUsername, incorrectPassword, devPortal, testTenant);
    });

    it.only("Test - Login to the publisher portal using incorrect user credentials", () => {
        cy.portalLoginUsingIncorrectUserCredentials(incorrectUsername, incorrectPassword, publisher, superTenant);
    });

    it.only("Test - Login to the admin portal using incorrect user credentials", () => {
        cy.portalLoginUsingIncorrectUserCredentials(incorrectUsername, incorrectPassword, adminPortal, superTenant);
    });

    it.only("Test - Login to the carbon using incorrect user credentials", () => {
        cy.carbonLogin(incorrectUsername, incorrectPassword);
        cy.contains('Login failed! Please recheck your username and password and try again.').should('exist');
    });

    it.only("Test - Login to the publisher using newly created user(superTenant1) credentials", () => {
        cy.portalLogin(superTenant1Username, password, publisher, superTenant);
        cy.contains('Error 403 : Forbidden').should('exist');
        cy.contains('The server could not verify that you are authorized to access the requested resource.').should('exist');
        cy.logoutFromPublisher();
    });

    it.only("Test - Login to the admin portal using newly created user(superTenant1) credentials", () => {
        cy.portalLogin(superTenant1Username, password, adminPortal, superTenant);
        cy.contains('Error 403 : Forbidden').should('exist');
        cy.contains('The server could not verify that you are authorized to access the requested resource.').should('exist');
        cy.logoutFromAdminPortal();
    });

    it.only("Test - Login to the carbon using newly created user(superTenant1) credentials", () => {
        cy.carbonLogin(superTenant1Username, password);
        cy.get('#region1_dashboard_main_menu').should('not.exist');
        cy.get('#region3_registry_menu').should('not.exist');
        cy.get('#region3_metadata_menu').should('not.exist');
        cy.carbonLogout();
    });

    it.only("Test - Remove self signup config from the advance configuration and create a new user for the super tenant", () => {
        cy.updateTenantConfig(carbonUsername, carbonPassword, superTenant, selfSignupDisabledConfigJson);
        cy.addNewUserUsingSelfSignUp(superTenant2Username, password, firstName, lastName, getSuperTenantEmail(superTenant2Username), superTenant);
        cy.portalLogin(superTenant2Username, password, devPortal, superTenant);
        cy.contains('Error 403 : Forbidden').should('exist');
        cy.contains('You don\'t have sufficient privileges to access the Developer Portal.').should('exist');
        cy.contains('Logout').click();
    });

    it.only("Test - Remove self signup config from the advance configuration and create a new user for the wso2 tenant", () => {
        cy.updateTenantConfig(tenantAdminUsername, tenantAdminPassword, testTenant, selfSignupDisabledConfigJson);
        cy.addNewUserUsingSelfSignUp(Utils.getTenantUser(tenant2Username, testTenant), password, firstName, lastName, Utils.getTenantUser(tenant2Username, testTenant), testTenant);
        cy.portalLogin(Utils.getTenantUser(tenant2Username, testTenant), password, devPortal, testTenant);
        cy.contains('Error 403 : Forbidden').should('exist');
        cy.contains('You don\'t have sufficient privileges to access the Developer Portal.').should('exist');
        cy.contains('Logout').click();
    });

    it.only("Test - Disable self signup from the carbon portal for the super tenant", () => {
        cy.disableSelfSignUpInCarbonPortal(carbonUsername, carbonPassword, superTenant);
        cy.visit(`${Utils.getAppOrigin()}/devportal/apis?tenant=${superTenant}`);
        cy.get('#itest-devportal-sign-in').click();
        cy.get('#registerLink').click();
        cy.get('#username').type(superTenant3Username);
        cy.get('#registrationSubmit').click();
        cy.contains(`Self registration is disabled for tenant - ${superTenant}`).should('exist');
    });

    it.only("Test - Disable self signup from the carbon portal for the wso2 tenant", () => {
        cy.disableSelfSignUpInCarbonPortal(tenantAdminUsername, tenantAdminPassword, testTenant);
        cy.visit(`${Utils.getAppOrigin()}/devportal/apis?tenant=${testTenant}`);
        cy.get('#itest-devportal-sign-in').click();
        cy.get('#registerLink').click();
        cy.get('#username').type(Utils.getTenantUser(tenant3Username, testTenant));
        cy.get('#registrationSubmit').click();
        cy.contains(`Self registration is disabled for tenant - ${testTenant}`).should('exist');
    });

    it.only("Test - Enable self signup back for the super tenant", () => {
        cy.updateTenantConfig(carbonUsername, carbonPassword, superTenant, tenantConfigJson);
        cy.enableSelfSignUpInCarbonPortal(carbonUsername, carbonPassword, superTenant);
        cy.addNewUserUsingSelfSignUp(superTenant4Username, password, firstName, lastName, getSuperTenantEmail(superTenant4Username), superTenant);
        cy.portalLogin(superTenant4Username, password, devPortal, superTenant);
        cy.logoutFromDevportal();
    });

    it.only("Test - Enable self signup back for the wso2 tenant", () => {
        cy.updateTenantConfig(tenantAdminUsername, tenantAdminPassword, testTenant, tenantConfigJson);
        cy.enableSelfSignUpInCarbonPortal(tenantAdminUsername, tenantAdminPassword, testTenant);
        cy.addNewUserUsingSelfSignUp(Utils.getTenantUser(tenant4Username, testTenant), password, firstName, lastName, Utils.getTenantUser(tenant4Username, testTenant), testTenant);
        cy.portalLogin(Utils.getTenantUser(tenant4Username, testTenant), password, devPortal, testTenant);
        cy.logoutFromDevportal();
    });

    it.only("Test - Assign custom user roles to a super tenant user", () => {
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.addNewRole(userRole,domain);
        cy.carbonLogout();
        cy.updateTenantConfig(carbonUsername, carbonPassword, superTenant, customUserRoleAddedConfigJson);
        cy.addNewUserUsingSelfSignUp(superTenant5Username, password, firstName, lastName, getSuperTenantEmail(superTenant5Username), superTenant);
        cy.checkUserHasGivenRoles(carbonUsername, carbonPassword, superTenant, superTenant5Username, [internalSubscriberRole, internalTestRole]);
    });

    it.only("Test - Assign custom user roles to a tenant user", () => {
        cy.carbonLogin(tenantAdminUsername, tenantAdminPassword);
        cy.addNewRole(userRole,domain);
        cy.carbonLogout();
        cy.updateTenantConfig(tenantAdminUsername, tenantAdminPassword, testTenant, customUserRoleAddedConfigJson);
        cy.addNewUserUsingSelfSignUp(Utils.getTenantUser(tenant5Username, testTenant), password, firstName, lastName, Utils.getTenantUser(tenant5Username, testTenant), testTenant);
        cy.checkUserHasGivenRoles(tenantAdminUsername, tenantAdminPassword, testTenant, tenant5Username, [internalSubscriberRole, internalTestRole]);
    });

    it.only("Test - Create a user for a unregistered tenant", () => {
        cy.visit(`${Utils.getAppOrigin()}/devportal/apis?tenant=${testTenant}`);
        cy.get('#itest-devportal-sign-in').click();
        cy.get('#registerLink').click();
        cy.get('#username').type('test@abc.com');
        cy.get('#registrationSubmit').click();
        cy.contains(`Invalid tenant domain - abc.com`).should('exist');
    });

    after(function () {
        cy.carbonLogin(carbonUsername, carbonPassword);
        // delete all the created users for super tenant
        cy.visit(`${Utils.getAppOrigin()}/carbon/user/user-mgt.jsp`);
        cy.deleteUser(superTenant1Username);
        cy.deleteUser(superTenant2Username);
        cy.deleteUser(superTenant4Username);
        cy.deleteUser(superTenant5Username);
        // Remove created user roles
        cy.deleteRole(internalTestRole);
        cy.carbonLogout();

        cy.carbonLogin(tenantAdminUsername, tenantAdminPassword);
        // delete all the created users for tenant
        cy.visit(`${Utils.getAppOrigin()}/carbon/user/user-mgt.jsp`);
        cy.deleteUser(tenant1Username);
        cy.deleteUser(tenant2Username);
        cy.deleteUser(tenant4Username);
        cy.deleteUser(tenant5Username);
        // Remove created user roles
        cy.deleteRole(internalTestRole);
        cy.carbonLogout();

        // Reset all the configs back to ensure default behaviour
        cy.updateTenantConfig(carbonUsername, carbonPassword, superTenant, tenantConfigJson);
        cy.enableSelfSignUpInCarbonPortal(carbonUsername, carbonPassword, superTenant);

        cy.updateTenantConfig(tenantAdminUsername, tenantAdminPassword, testTenant, tenantConfigJson);
        cy.enableSelfSignUpInCarbonPortal(tenantAdminUsername, tenantAdminPassword, testTenant);
    })
});