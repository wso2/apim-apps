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
import {
  render,
  RenderOptions,
  RenderResult,
  configure,
} from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { ThemeProvider } from "@material-ui/core/styles";
import { createTheme } from '@material-ui/core/styles';
import defaultTheme from "AppData/defaultTheme";
import Api from "AppData/api";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";
import { AppContextProvider } from "AppComponents/Shared/AppContext";
import AuthManager from "AppData/AuthManager";
import User from "AppData/User";
import Utils from "AppData/Utils";
import { MockedUsers, TEMPORARY_MOCKED_SETTINGS } from "./constants";

export const history = createMemoryHistory();

/* ####### Timeout configurations ####### */
// Overriding default `waitFor` timeout value due to MSW latencies
// Default asyncUtilTimeout value is 1000
// For more info refer : https://testing-library.com/docs/dom-testing-library/api-configuration/
const ASYNC_TIMEOUT_MINUTES = 0.5;
const asyncUtilTimeout = ASYNC_TIMEOUT_MINUTES * 60 * 10 ** 3;
configure({ asyncUtilTimeout });
jest.setTimeout((asyncUtilTimeout * 3) / 2);
/* ####### End of Timeout configurations ####### */

const GlobalProviders: FC<{ user: any }> = ({
  children,
  user = MockedUsers.Admin,
}) => {
  const theme = createTheme(defaultTheme as any); // We really don't care about the styling in this tests, Need to handle Visual Regression
  const testUser = User.fromJson(user, Utils.getDefaultEnvironment().label);
  testUser.setPartialToken("AM_ACC_TOKEN_DEFAULT_P1", -1);
  testUser.setExpiryTime(9999999);

  AuthManager.setUser(testUser);
  // issues through separate testing mechanism
  return (
    <Router history={history}>
      <IntlProvider locale="en" messages={{}}>
        <ThemeProvider theme={theme}>
          <AppContextProvider
            value={{
              settings: TEMPORARY_MOCKED_SETTINGS,
              user: AuthManager.getUser(),
            }}
          >
            {children}
          </AppContextProvider>
        </ThemeProvider>
      </IntlProvider>
    </Router>
  );
};
interface XOptions extends Omit<RenderOptions, "wrapper"> {
  user: any;
}
const customRender = (ui: ReactElement, options?: XOptions) =>
  render(ui, {
    wrapper: ({ children }) => (
      <GlobalProviders children={children} user={options?.user} />
    ),
    ...options,
  });

export const searchParamsToRequestQuery = (searchParams: URLSearchParams) =>
  JSON.parse(
    `{"${decodeURI(searchParams.toString())
      .replace(/"/g, '\\"')
      .replace(/&/g, '","')
      .replace(/=/g, '":"')}"}`
  );

/**
 * Only use this method for wait and check the output, DON'T use it for testing the component
 * @param sec Wait time in seconds
 * @returns 
 */
export function dummyWait(sec: number = 1) {
  console.warn("dummyWait is only intended to be used in tests development time, Remove it after finalizing the test");
  return new Promise((resolve) => setTimeout(resolve, sec * 1000));
}
export * from "@testing-library/react";
export { customRender as render };
export { getMockServer } from "./restAPI.mock";
