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

<%@page import="org.apache.commons.logging.LogFactory"%>
<%@page import="org.apache.commons.logging.Log"%>
<%@page import="org.wso2.carbon.apimgt.impl.IDPConfiguration"%>
<%@page import="org.wso2.carbon.apimgt.impl.utils.APIUtil"%>
<%@page import="org.wso2.carbon.apimgt.ui.admin.Util"%>
<%@page import="java.util.Map"%>
<%@include file="../constants.jsp" %>

<%@page trimDirectiveWhitespaces="true" %>

<%    Log log = LogFactory.getLog(this.getClass());
    log.debug("Logout Request Function");
    Map settings = Util.readJsonFile("/site/public/conf/settings.json", request.getServletContext());
    String appContext = Util.getAppContextForServerUrl((String) Util.readJsonObj(settings, "app.context"), (String) Util.readJsonObj(settings, "app.proxy_context_path"));

    String idTokenP1Cookie = "";
    String idTokenP2Cookie = "";
    Cookie[] cookies = request.getCookies();
    for (int i = 0; i < cookies.length; i++) {
        String cookieName = cookies[i].getName();
        if ("AM_ID_TOKEN_DEFAULT_P1".equals(cookieName)) {
            idTokenP1Cookie = cookies[i].getValue();

        }
        if ("AM_ID_TOKEN_DEFAULT_P2".equals(cookieName)) {
            idTokenP2Cookie = cookies[i].getValue();;
        }
        if (!idTokenP1Cookie.isEmpty() && !idTokenP2Cookie.isEmpty()) {
            break;
        }
    }

    String idToken = "";
    if (!idTokenP1Cookie.isEmpty() && !idTokenP2Cookie.isEmpty()) {
        idToken = idTokenP1Cookie + idTokenP2Cookie;
    }

    String serverUrl = "";
    String forwarded_for = request.getHeader((String) Util.readJsonObj(settings, "app.customUrl.forwardedHeader"));
    boolean customUrlEnabled = (boolean) Util.readJsonObj(settings, "app.customUrl.enabled");
    if (customUrlEnabled && !forwarded_for.isEmpty()) {
        // Even though we redirect to custom URL, IS redirection happens to carbon host/proxy port combination
        // i:e https://<carbonhost>:<proxyport|serverport>/authenticationendpoint/oauth2_logout_consent.do?sp=admin_admin_publisher&tenantDomain=carbon.super
        serverUrl = "https://" + forwarded_for;
    } else {
        serverUrl = APIUtil.getServerURL();
    }
    String logoutEndpoint = serverUrl + OIDC_LOGOUT_ENDPOINT_SUFFIX;

    IDPConfiguration idpConfig = APIUtil.getIdentityProviderConfig();
    if (idpConfig != null) {
        logoutEndpoint = idpConfig.getOidcLogoutEndpoint();
    }
    String postLogoutRedirectURI = serverUrl + appContext + LOGOUT_CALLBACK_URL_SUFFIX;
    String idTokenParam = !idToken.isEmpty() ? "?id_token_hint=" + idToken + "&" : "?";
    String url = logoutEndpoint + idTokenParam + "post_logout_redirect_uri=" + postLogoutRedirectURI;

    log.debug("Redirecting to = " + url);
    response.sendRedirect(url);
%>
