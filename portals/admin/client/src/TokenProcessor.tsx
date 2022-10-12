import React from 'react';
import { sendTokenRequest } from "./sign-in";
import { OIDCRequestParamsInterface } from './models/oidc-request-params';

function TokenProcessor() {
  console.log('info');
  const requestParams: OIDCRequestParamsInterface = {
    clientId: 'FbCSH23HybQMV9UlXJfeKHogAEHojzCO',
    scope: 'openid',
    state: 'RlZyVjlqYUpHTzltWC42c2FNRDRJT1JPfk1+TUFEa0RLb04yZldwYkpxVA=='
  };
  sendTokenRequest(requestParams);
  return <></>;
}

export default TokenProcessor;