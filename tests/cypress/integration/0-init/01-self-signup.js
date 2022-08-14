/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import Utils from "@support/utils";

describe("Self SignUp", () => {
    const superTenant = 'carbon.super';
    const wso2Tenant = 'wso2.com';
    const testPassword = 'testPassword123';
    const testFirstName = 'firstName';
    const testLastName = 'lastName';

    it.only("Test - Default self-signup behaviour of the super tenant", () => {
        const username = 'superTenant1';
        cy.addNewUserUsingSelfSignUp(username, testPassword, testFirstName, testLastName, username + '@wso2.com', superTenant);
        cy.addExistingUserUsingSelfSignUp(username, superTenant);
        cy.portalLogin(username, testPassword, 'devportal', superTenant);
        cy.logoutFromDevportal();
    });

    it.only("Test - Default self-signup behaviour of the wso2 tenant", () => {
        const username = 'tenant1@wso2.com';
        cy.addNewUserUsingSelfSignUp(username, testPassword, testFirstName, testLastName, username, wso2Tenant);
        cy.addExistingUserUsingSelfSignUp(username, wso2Tenant);
        cy.portalLogin(username, testPassword, 'devportal', wso2Tenant);
        cy.logoutFromDevportal();
    });

    it.only("Test - Login to the devPortal using incorrect user credentials", () => {
        cy.portalLoginUsingIncorrectUserCredentials('incorrectUsername', 'incorrectPassword', 'devportal', wso2Tenant);
    });

    it.only("Test - Login to the publisher using incorrect user credentials", () => {
        cy.portalLoginUsingIncorrectUserCredentials('incorrectUsername', 'incorrectPassword', 'publisher', superTenant);
    });

    it.only("Test - Login to the admin portal using incorrect user credentials", () => {
        cy.portalLoginUsingIncorrectUserCredentials('incorrectUsername', 'incorrectPassword', 'admin', superTenant);
    });

    it.only("Test - Login to the carbon using incorrect user credentials", () => {
        cy.carbonLogin('incorrectUsername', 'incorrectPassword');
        cy.contains('Login failed! Please recheck the username and password and try again.').should('exist');
    });

    it.only("Test - Login to the publisher using newly created user(superTenant1) credentials", () => {
        const username = 'superTenant1';
        cy.portalLogin(username, testPassword, 'publisher', superTenant);
        cy.contains('Error 403 : Forbidden').should('exist');
        cy.contains('The server could not verify that you are authorized to access the requested resource.').should('exist');
        cy.logoutFromPublisher();
    });

    it.only("Test - Login to the admin portal using newly created user(superTenant1) credentials", () => {
        const username = 'superTenant1';
        cy.portalLogin(username, testPassword, 'admin', superTenant);
        cy.contains('Error 403 : Forbidden').should('exist');
        cy.contains('The server could not verify that you are authorized to access the requested resource.').should('exist');
        cy.logoutFromAdminPortal();
    });

    it.only("Test - Login to the carbon using newly created user(superTenant1) credentials", () => {
        const username = 'superTenant1';
        cy.carbonLogin(username, testPassword);
        cy.contains('Signed-in as: ' + username + '@' + superTenant).should('exist');
        cy.carbonLogout();
    });

    it.only("Test - Remove self signup config from the advance configuration and create a new user for the super tenant", () => {
        const username = 'superTenant2';
        cy.removeSelfSignUpConfig('admin', 'admin', superTenant);
        cy.addNewUserUsingSelfSignUp(username, testPassword, testFirstName, testLastName, username + '@wso2.com', superTenant);
        cy.portalLogin(username, testPassword, 'devportal', superTenant);
        cy.contains('Error 403 : Forbidden').should('exist');
        cy.contains('You don\'t have sufficient privileges to access the Developer Portal.').should('exist');
        cy.get('[style="padding: 5px 15px; margin: 10px; border-radius: 5px; text-transform: uppercase; color: rgb(0, 0, 0); background: rgb(21, 184, 207);"]').click();
    });

    it.only("Test - Remove self signup config from the advance configuration and create a new user for the wso2 tenant", () => {
        const username = 'tenant2@wso2.com';
        cy.removeSelfSignUpConfig('admin@wso2.com', 'admin', wso2Tenant);
        cy.addNewUserUsingSelfSignUp(username, testPassword, testFirstName, testLastName, username, wso2Tenant);
        cy.portalLogin(username, testPassword, 'devportal', wso2Tenant);
        cy.contains('Error 403 : Forbidden').should('exist');
        cy.contains('You don\'t have sufficient privileges to access the Developer Portal.').should('exist');
        cy.get('[style="padding: 5px 15px; margin: 10px; border-radius: 5px; text-transform: uppercase; color: rgb(0, 0, 0); background: rgb(21, 184, 207);"]').click();
    });

    it.only("Test - Disable self signup from the carbon portal for the super tenant", () => {
        const username = 'superTenant3';
        cy.disableSelfSignUpInCarbonPortal('admin', 'admin', superTenant);
        cy.visit(`${Utils.getAppOrigin()}/devportal/apis?tenant=${superTenant}`);
        cy.get('#itest-devportal-sign-in').click();
        cy.get('#registerLink').click();
        cy.get('#username').type(username);
        cy.get('#registrationSubmit').click();
        cy.contains(`Self registration is disabled for tenant - ${superTenant}`).should('exist');
    });

    it.only("Test - Disable self signup from the carbon portal for the wso2 tenant", () => {
        const username = 'tenant3@wso2.com';
        cy.disableSelfSignUpInCarbonPortal('admin@wso2.com', 'admin', wso2Tenant);
        cy.visit(`${Utils.getAppOrigin()}/devportal/apis?tenant=${wso2Tenant}`);
        cy.get('#itest-devportal-sign-in').click();
        cy.get('#registerLink').click();
        cy.get('#username').type(username);
        cy.get('#registrationSubmit').click();
        cy.contains(`Self registration is disabled for tenant - ${wso2Tenant}`).should('exist');
    });

    it.only("Test - Enable self signup back for the super tenant", () => {
        const username = 'superTenant4';
        cy.addSelfSignUpConfig('admin', 'admin', superTenant);
        cy.enableSelfSignUpInCarbonPortal('admin', 'admin', superTenant);
        cy.addNewUserUsingSelfSignUp(username, testPassword, testFirstName, testLastName, username + '@wso2.com', superTenant);
        cy.portalLogin(username, testPassword, 'devportal', superTenant);
        cy.logoutFromDevportal();
    });

    it.only("Test - Enable self signup back for the wso2 tenant", () => {
        const username = 'tenant4@wso2.com';
        cy.addSelfSignUpConfig('admin@wso2.com', 'admin', wso2Tenant);
        cy.enableSelfSignUpInCarbonPortal('admin@wso2.com', 'admin', wso2Tenant);
        cy.addNewUserUsingSelfSignUp(username, testPassword, testFirstName, testLastName, username, wso2Tenant);
        cy.portalLogin(username, testPassword, 'devportal', wso2Tenant);
        cy.logoutFromDevportal();
    });

});