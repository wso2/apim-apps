import React from "react";
import { OIDCRequestParamsInterface } from './models/oidc-request-params';
import { sendAuthorizationRequest } from "./sign-in";

const LoginButton = () => {
  const requestParams: OIDCRequestParamsInterface = {
    clientId: 'FbCSH23HybQMV9UlXJfeKHogAEHojzCO',
    scope: 'openid',
    state: 'RlZyVjlqYUpHTzltWC42c2FNRDRJT1JPfk1+TUFEa0RLb04yZldwYkpxVA=='
  };

  return <button onClick={() => sendAuthorizationRequest(requestParams)}>Log In</button>;
};

export default LoginButton;