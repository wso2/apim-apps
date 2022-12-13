/*
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com) All Rights Reserved.
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

import React from "react";
import { useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import Layout from "./Layout";
import Apis from "./Apis";
import { hasAuthorizationCode, sendAuthorizationRequest, sendTokenRequest, hasValidToken } from './auth/sign-in';
import { initOPConfiguration } from './auth/op-config';
import { OIDCRequestParamsInterface } from './models/oidc-request-params';
import { getSessionParameter, setSessionParameter, initUserSession } from "./auth/session";
import Settings from '../public/conf/Settings';
import { REQUEST_STATUS } from './constants/token';
import NewAdmin from './NewAdmin';

export default function App() {

  const requestParams: OIDCRequestParamsInterface = {
    clientId: Settings.IDP_CLIENT_ID,
    scope: Settings.scope,
    state: Settings.state,
    serverOrigin: Settings.serverOrigin
  };

  let hasToken = hasValidToken();
  let initial_req_status = getSessionParameter(REQUEST_STATUS);

  useEffect(() => {
    if (initial_req_status !== 'sent') {
      initOPConfiguration(Settings.wellKnown, false).then(() => {
        sendAuthorizationRequest(requestParams);
        setSessionParameter(REQUEST_STATUS, 'sent');
      })
    }
  }, [initial_req_status]);

  useEffect(() => {
    if (!hasToken && hasAuthorizationCode()) {
      sendTokenRequest(requestParams)
        .then((response) => {
          initUserSession(
            response
          );
        })
        .catch((error) => {
          if (error.response.status === 400) {
            sendAuthorizationRequest(requestParams);
          }
          throw error;
        })
        .then(() => {
          window.location.href = `${Settings.loginUri}/users`;
        })
    }
  }, [hasToken]);

  if (hasToken) {
    return (
      <div>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path='/' element={<Apis />} />
            <Route path='/users' element={<NewAdmin />} />
            {/* <Route path='/apis' element={<Apis />} /> */}
            {/* Using path="*"" means "match anything", so this route
                      acts like a catch-all for URLs that we don't have explicit
                      routes for. */}
            <Route path="*" element={<NoMatch />} />
          </Route>
        </Routes>
      </div>
    );
  } else {
    return <></>
  }

}

function NoMatch() {
  return (
    <div>
      <h2>Nothing to see here!</h2>
      <p>
        <Link to="/">Go to the home page</Link>
      </p>
    </div>
  );
}

