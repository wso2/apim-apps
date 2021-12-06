/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */

import React, { FC, ReactElement, useEffect, useState } from "react";
import { render, RenderOptions, RenderResult, configure } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { ThemeProvider } from "@material-ui/core/styles";
import createMuiTheme from "@material-ui/core/styles/createMuiTheme";
import defaultTheme from "AppData/defaultTheme";
import Api from "AppData/api";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";
import { AppContextProvider } from "AppComponents/Shared/AppContext";
import AuthManager from "AppData/AuthManager";
import User from "AppData/User";
import Utils from "AppData/Utils";

export const history = createMemoryHistory();

/* ####### Timeout configurations ####### */
// Overriding default `waitFor` timeout value due to MSW latencies
// Default asyncUtilTimeout value is 1000
// For more info refer : https://testing-library.com/docs/dom-testing-library/api-configuration/
const ASYNC_TIMEOUT_MINUTES = 0.3;
const asyncUtilTimeout = ASYNC_TIMEOUT_MINUTES * 60 * 10 ** 3;
configure({ asyncUtilTimeout });
jest.setTimeout((asyncUtilTimeout * 3) / 2);
/* ####### End of Timeout configurations ####### */


var localStorageMock = (function() {
  var store: { [key: string]: string } = {};
  return {
    getItem: function(key: string) {
      return store[key];
    },
    setItem: function(key: string, value: any) {
      store[key] = value.toString();
    },
    clear: function() {
      store = {};
    },
    removeItem: function(key: string): void {
      delete store[key];
    },
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });
Object.defineProperty(window.document, 'cookie', {
  writable: true,
  value: 'myCookie=omnomnom',
});

const GlobalProviders: FC = ({ children }) => {
  const settings = {
    devportalUrl: "https://localhost:9443/devportal",
    environment: [
      {
        id: "Default",
        name: "Default",
        displayName: "Default",
        provider: "wso2",
        type: "hybrid",
        serverUrl: "https://localhost:9443/services/",
        showInApiConsole: true,
        vhosts: [
          {
            host: "localhost",
            httpContext: "",
            httpPort: 8280,
            httpsPort: 8243,
            wsPort: 9099,
            wssPort: 8099,
            websubHttpPort: 9021,
            websubHttpsPort: 8021,
          },
        ],
      },
    ],
    scopes: [
      "apim:admin",
      "apim:api_create",
      "apim:api_delete",
      "apim:api_generate_key",
      "apim:api_import_export",
      "apim:api_manage",
      "apim:api_mediation_policy_manage",
      "apim:api_product_import_export",
      "apim:api_publish",
      "apim:api_view",
      "apim:app_import_export",
      "apim:client_certificates_add",
      "apim:client_certificates_manage",
      "apim:client_certificates_update",
      "apim:client_certificates_view",
      "apim:comment_manage",
      "apim:comment_view",
      "apim:comment_write",
      "apim:document_create",
      "apim:document_manage",
      "apim:ep_certificates_add",
      "apim:ep_certificates_manage",
      "apim:ep_certificates_update",
      "apim:ep_certificates_view",
      "apim:mediation_policy_create",
      "apim:mediation_policy_manage",
      "apim:mediation_policy_view",
      "apim:pub_alert_manage",
      "apim:publisher_settings",
      "apim:shared_scope_manage",
      "apim:subscription_block",
      "apim:subscription_manage",
      "apim:subscription_view",
      "apim:threat_protection_policy_create",
      "apim:threat_protection_policy_manage",
      "apim:tier_manage",
      "apim:tier_view",
      "openid",
    ],
    monetizationAttributes: [],
    securityAuditProperties: {
      isGlobal: null,
      overrideGlobal: null,
      apiToken: null,
      collectionId: null,
      baseUrl: null,
    },
    externalStoresEnabled: false,
    docVisibilityEnabled: false,
    crossTenantSubscriptionEnabled: false,
    authorizationHeader: "Authorization",
  };
  const theme = createMuiTheme(defaultTheme); // We really don't care about the styling in this tests, Need to handle Visual Regression
  const testUser = User.fromJson({
    name: "demo@carbon.super",
    scopes: [
      "apim:api_create",
      "apim:api_delete",
      "apim:api_generate_key",
      "apim:api_publish",
      "apim:api_view",
      "apim:client_certificates_add",
      "apim:client_certificates_update",
      "apim:client_certificates_view",
      "apim:comment_view",
      "apim:comment_write",
      "apim:document_create",
      "apim:document_manage",
      "apim:ep_certificates_add",
      "apim:ep_certificates_update",
      "apim:ep_certificates_view",
      "apim:mediation_policy_create",
      "apim:mediation_policy_manage",
      "apim:mediation_policy_view",
      "apim:pub_alert_manage",
      "apim:publisher_settings",
      "apim:subscription_block",
      "apim:subscription_view",
      "apim:threat_protection_policy_create",
      "apim:threat_protection_policy_manage",
      "openid",
      "service_catalog:service_view",
      "service_catalog:service_write",
    ],
    remember: false,
    expiryTime: "1970-01-01T00:00:00.000Z",
  }, Utils.getDefaultEnvironment().label);
  testUser.setPartialToken("AM_ACC_TOKEN_DEFAULT_P1", -1, '/publisher');
  testUser.setExpiryTime(9999999);
        
  AuthManager.setUser(testUser);
  // issues through separate testing mechanism
  return (
    <Router history={history}>
      <IntlProvider locale="en" messages={{}}>
        <ThemeProvider theme={theme}>
          <AppContextProvider
            value={{
              settings,
              user: {},
            }}
          >
            {children}
          </AppContextProvider>
        </ThemeProvider>
      </IntlProvider>
    </Router>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: GlobalProviders, ...options });

export const searchParamsToRequestQuery = (searchParams: URLSearchParams) =>
  JSON.parse(
    `{"${decodeURI(searchParams.toString())
      .replace(/"/g, '\\"')
      .replace(/&/g, '","')
      .replace(/=/g, '":"')}"}`
  );
export * from '@testing-library/react';
export { customRender as render };
export { getMockServer } from './restAPI.mock';
