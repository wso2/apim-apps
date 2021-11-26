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

import React, { FC, ReactElement } from "react";
import { render, RenderOptions, RenderResult } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { ThemeProvider } from "@material-ui/core/styles";
import createMuiTheme from "@material-ui/core/styles/createMuiTheme";
import defaultTheme from "AppData/defaultTheme";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";
import { AppContextProvider } from "AppComponents/Shared/AppContext";

const organizationData = {
  organizationList: [],
  selectedOrg: {
    handle: "testOrg",
    id: 123,
    uuid: "13bbd7d0-254f-4292-80eb-6d474f487438",
    name: "Test Org",
  },
};

export const history = createMemoryHistory();

const GlobalProviders: FC = ({ children }) => {
  const theme = createMuiTheme(defaultTheme); // We really don't care about the styling in this tests, Need to handle Visual Regression
  // issues through separate testing mechanism
  return (
    <Router history={history}>
      <IntlProvider locale="en" messages={{}}>
        <ThemeProvider theme={theme}>
          <AppContextProvider
            value={{
              settings: {},
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
export * from "@testing-library/react";
export { customRender as render };
export { getMockServer } from "./restAPI.mock";
