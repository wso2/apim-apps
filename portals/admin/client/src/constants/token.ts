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

interface ServiceResourcesType {
    jwks: string;
    token: string;
}

export const SERVICE_RESOURCES: ServiceResourcesType = {
    jwks: "/oauth2/jwks",
    token: "/oauth2/token"
};

export const AUTHORIZATION_CODE = "code";
export const ID_TOKEN = "id_token";
export const REFRESH_TOKEN = "refresh_token";
export const ACCESS_TOKEN = "access_token";
export const PKCE_CODE_VERIFIER = "pkce_code_verifier";
export const AUTHORIZATION_ENDPOINT = "authorization_endpoint";
export const TOKEN_ENDPOINT = "token_endpoint";
export const END_SESSION_ENDPOINT = "end_session_endpoint";
export const JWKS_ENDPOINT = "jwks_uri";
export const ISSUER = "issuer";
export const OP_CONFIG_INITIATED = "op_config_initiated";
export const REQUEST_PARAMS = "request_params";
export const REQUEST_STATUS = "request_status";
export const ACCESS_TOKEN_EXPIRE_IN = "expires_in";
export const ACCESS_TOKEN_ISSUED_AT = "issued_at";
export const SCOPE = "scope";
export const TOKEN_TYPE = "token_type";

