/*
 * Copyright (c) 2026, WSO2 LLC (https://www.wso2.com).
 *
 * WSO2 LLC licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
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

describe("Developer Portal - Token Refresh", () => {
    const { carbonUsername, carbonPassword } = Utils.getUserInfo();

    it("should successfully exchange a refresh token for new access token cookies", () => {
        // Login inside the test — Cypress 12+ clears cookies between tests (testIsolation: true),
        // so a before() hook cannot reliably pass cookies into it() blocks.
        cy.loginToDevportal(carbonUsername, carbonPassword);

        // cy.request shares the browser cookie jar, so the httpOnly AM_REF_TOKEN_DEFAULT_P2
        // is sent automatically alongside the JS-readable part passed as the URL param.
        cy.getCookie("WSO2_AM_REFRESH_TOKEN_1_Default")
            .should("exist")
            .then((cookie) => {
                cy.request({
                    method: "POST",
                    url: `/devportal/services/refresh?refresh_token=${cookie.value}`,
                    failOnStatusCode: false,
                }).then((response) => {
                    expect(response.status, "Refresh endpoint should return 200, not 500").to.eq(200);
                    const setCookies = [].concat(response.headers["set-cookie"] || []).join(";");
                    expect(setCookies, "Response should set new access token part 2 cookie").to.include("AM_ACC_TOKEN_DEFAULT_P2");
                    expect(setCookies, "Response should set new access token part 1 cookie").to.include("WSO2_AM_TOKEN_1_Default");
                });
            });
    });
});
