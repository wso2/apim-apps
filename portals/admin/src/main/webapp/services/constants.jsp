<%--
  ~ Copyright (c) 2017, WSO2 LLC (http://www.wso2.org) All Rights Reserved.
  ~
  ~ WSO2 LLC licenses this file to you under the Apache License,
  ~ Version 2.0 (the "License"); you may not use this file except
  ~ in compliance with the License.
  ~ You may obtain a copy of the License at
  ~
  ~    http://www.apache.org/licenses/LICENSE-2.0
  ~
  ~ Unless required by applicable law or agreed to in writing,
  ~ software distributed under the License is distributed on an
  ~ "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  ~ KIND, either express or implied.  See the License for the
  ~ specific language governing permissions and limitations
  ~ under the License.
--%>

<%
    //  TODO: Wrap these consts with an object and do `require` when needed ~tmkb
    String SETTINGS_REST_API_URL_SUFFIX = "/api/am/admin/v3/settings";
    String DCR_URL_SUFFIX = "/client-registration/v0.17/register";
    String AUTHORIZE_ENDPOINT_SUFFIX = "/oauth2/authorize";
    String OIDC_LOGOUT_ENDPOINT_SUFFIX = "/oidc/logout";
    String TOKEN_URL_SUFFIX = "/oauth2/token";
    String REVOKE_URL_SUFFIX = "/oauth2/revoke";
    String LOGIN_CALLBACK_URL_SUFFIX = "/services/auth/callback/login";
    String LOGOUT_CALLBACK_URL_SUFFIX = "/services/auth/callback/logout";

    String ADMIN_CLIENT_APP_NAME = "apim_admin_portal";
    String SUPER_TENANT_DOMAIN = "carbon.super";
%>

