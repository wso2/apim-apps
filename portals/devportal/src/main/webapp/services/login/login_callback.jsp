<%--
  ~ Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
  ~
  ~ WSO2 Inc. licenses this file to you under the Apache License,
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

<%@page import="java.util.Base64"%>
<%@page import="org.apache.commons.logging.LogFactory"%>
<%@page import="org.apache.commons.logging.Log"%>
<%@page import="org.wso2.carbon.apimgt.impl.dto.SystemApplicationDTO"%>
<%@page import="com.google.gson.GsonBuilder"%>
<%@page import="java.net.URLDecoder"%>
<%@page import="com.google.gson.Gson"%>
<%@page import="com.google.gson.JsonObject"%>
<%@page import="java.net.URI"%>
<%@page import="java.net.http.HttpResponse"%>
<%@page import="java.net.http.HttpRequest"%>
<%@page import="java.net.http.HttpClient"%>
<%@page import="java.util.HashMap"%>
<%@page import="org.wso2.carbon.apimgt.impl.dao.SystemApplicationDAO"%>
<%@page import="org.wso2.carbon.apimgt.impl.utils.APIUtil"%>
<%@page import="java.util.Map"%>
<%@page import="org.wso2.carbon.apimgt.ui.devportal.Util"%>
<%@include file="../constants.jsp" %>

<%@page trimDirectiveWhitespaces="true" %>

<%
    Log log = LogFactory.getLog(this.getClass());
    Map settings = Util.readJsonFile("site/public/theme/settings.json", request.getServletContext());
    Map userTheme = Util.readJsonFile("/site/public/theme/userTheme.json", request.getServletContext());
    Gson gson = new GsonBuilder().setPrettyPrinting().create();
    log.debug("Login Callback Endpoint");
    String context = Util.getTenantBaseStoreContext(request, (String) Util.readJsonObj(settings, "app.context"));
    String appContext = Util.getAppContextForServerUrl(context, (String) Util.readJsonObj(settings, "app.proxy_context_path"));

    String serverUrl = "";
    String forwarded_for = request.getHeader((String) Util.readJsonObj(settings, "app.customUrl.forwardedHeader"));
    boolean customUrlEnabled = (boolean) Util.readJsonObj(settings, "app.customUrl.enabled");
    if (customUrlEnabled && !forwarded_for.isEmpty()) {
        serverUrl = MGT_TRANSPORT + forwarded_for;
    } else {
        serverUrl = Util.getTenantBasedCustomUrl(request);
        if (serverUrl == null) {
            serverUrl = APIUtil.getServerURL();
        }
    }

    Map configurations = (Map) Util.readJsonObj(userTheme, "custom");
    Map landingPage = (Map) Util.readJsonObj(userTheme, "custom.landingPage");
    Object landingPageActiveObj = Util.readJsonObj(userTheme, "custom.landingPage.active");
    boolean landingPageActive = (landingPageActiveObj != null) ? (boolean) landingPageActiveObj : false;
    String referrer = "";
    if (configurations != null && landingPage != null && landingPageActive) {
        referrer = "/home";
    } else {
        referrer = "/apis";
    }
    String state = request.getParameter("state");
    if (state != null) {
        String[] stateSplit = state.split("\\?");
        if (stateSplit.length > 1) {
            String tenant = stateSplit[1];
            String tenantDomain = tenant.split("=")[1];
            boolean isAnonymousEnabled = APIUtil.isTenantDevportalAnonymous(tenantDomain);
            if (isAnonymousEnabled) {
                referrer = state;
            }
        }
    }
    String postLogoutRedirectURI = Util.getTenantBasedLogoutCallBack(request, LOGOUT_CALLBACK_URL_SUFFIX);
    if (postLogoutRedirectURI == null) {
        postLogoutRedirectURI = serverUrl + appContext + LOGOUT_CALLBACK_URL_SUFFIX;
    }
    String error = request.getParameter("error");
    if (error != null && error.equals("login_required")) {
        response.sendRedirect(postLogoutRedirectURI + "?referrer=" + referrer);
    } else if (request.getParameter("code") != null) {
        String loginCallbackUrl = Util.getTenantBasedLoginCallBack(request, LOGIN_CALLBACK_URL_SUFFIX);
        if (loginCallbackUrl == null) {
            loginCallbackUrl = serverUrl + appContext + LOGIN_CALLBACK_URL_SUFFIX;
        }
        HashMap<String, Object> tokenRequestData = new HashMap();
        tokenRequestData.put("grant_type", "authorization_code");
        tokenRequestData.put("code", request.getParameter("code"));
        tokenRequestData.put("redirect_uri", loginCallbackUrl);
        String tenantDomain = "carbon.super";
        if (Util.isPerTenantServiceProviderEnabled(request)) {
            tenantDomain = Util.getTenantDomain(request);
        }
        SystemApplicationDAO systemApplicationDAO = new SystemApplicationDAO();
        // this is to support migration from admin_store to admin_devportal
        SystemApplicationDTO systemApplicationDTO = systemApplicationDAO.getClientCredentialsForApplication(STORE_CLIENT_APP_NAME, tenantDomain);
        if (systemApplicationDTO == null) {
            systemApplicationDTO = systemApplicationDAO.getClientCredentialsForApplication(STORE_CLIENT_APP_NAME_OLD, tenantDomain);
        }
        String clientId = systemApplicationDTO.getConsumerKey();
        String clientSecret = systemApplicationDTO.getConsumerSecret();
        String concatenatedCredential = clientId + ":" + clientSecret;
        byte[] byteValue = concatenatedCredential.getBytes();
        String base64encoded = Base64.getEncoder().encodeToString(byteValue);
        String tokenEndpoint = Util.getLoopbackOrigin((String) Util.readJsonObj(settings, "app.origin.host")) + TOKEN_URL_SUFFIX;
        String data = "code=" + request.getParameter("code") + "&grant_type=authorization_code&redirect_uri=" + loginCallbackUrl;
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest post = HttpRequest.newBuilder()
                .uri(URI.create(tokenEndpoint))
                .POST(HttpRequest.BodyPublishers.ofString(data))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .header("Authorization", "Basic " + base64encoded)
                .build();
        HttpResponse<String> result = client.send(post, HttpResponse.BodyHandlers.ofString());
        response.setContentType("application/json");
        Map tokenResponse;
        try {
            tokenResponse = gson.fromJson(result.body(), Map.class);

            if (tokenResponse.get("access_token") == null) {
                log.error("Could not retrieve access token. Response: " + result.body());
                return;
            }
        } catch (Exception e) {
            log.error("Error while generating token", e);
            return;
        }

        String accessToken = (String) tokenResponse.get("access_token");
        int tokenLength = accessToken.length();

        String idToken = (String) tokenResponse.get("id_token");
        int idTokenLength = idToken.length();

        String idTokenPart1 = idToken.substring(0, idTokenLength / 2);
        String idTokenPart2 = idToken.substring(idTokenLength / 2, idTokenLength);

        String accessTokenPart1 = accessToken.substring(0, tokenLength / 2);
        String accessTokenPart2 = accessToken.substring(tokenLength / 2, tokenLength);

        String refreshToken = (String) tokenResponse.get("refresh_token");
        tokenLength = refreshToken.length();
        String refreshTokenPart1 = refreshToken.substring(0, tokenLength / 2);
        String refreshTokenPart2 = refreshToken.substring(tokenLength / 2, tokenLength);

        double expiresIn = (double) tokenResponse.get("expires_in");

        // Setting access token part 1 as secured HTTP only cookie, Can't restrict the path to /api/am/devportal
        // because partial HTTP only cookie is required for get the user information from access token,
        // hence setting the HTTP only access token path to /devportal/
        Cookie cookie = new Cookie("AM_ACC_TOKEN_DEFAULT_P2", accessTokenPart2);
        cookie.setPath(context + "/");
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setMaxAge((int) expiresIn);
        response.addCookie(cookie);

        String proxyContext = (String) Util.readJsonObj(settings, "app.proxy_context_path");
        cookie = new Cookie("AM_ACC_TOKEN_DEFAULT_P2", accessTokenPart2);
        cookie.setPath(proxyContext != null ? proxyContext + "/api/am/devportal/" : "/api/am/devportal/");
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setMaxAge((int) expiresIn);
        response.addCookie(cookie);

        cookie = new Cookie("AM_REF_TOKEN_DEFAULT_P2", refreshTokenPart2);
        cookie.setPath(context + "/");
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setMaxAge(86400);
        response.addCookie(cookie);

        cookie = new Cookie("WSO2_AM_REFRESH_TOKEN_1_Default", refreshTokenPart1);
        cookie.setPath(context + "/");
        cookie.setSecure(true);
        cookie.setMaxAge(86400);
        response.addCookie(cookie);

        cookie = new Cookie("WSO2_AM_TOKEN_1_Default", accessTokenPart1);
        cookie.setPath(context + "/");
        cookie.setSecure(true);
        cookie.setMaxAge((int) expiresIn);
        response.addCookie(cookie);

        cookie = new Cookie("AM_ID_TOKEN_DEFAULT_P2", idTokenPart2);
        cookie.setPath(context + "/services/logout");
        cookie.setSecure(true);
        cookie.setMaxAge((int) expiresIn);
        response.addCookie(cookie);

        cookie = new Cookie("AM_ID_TOKEN_DEFAULT_P1", idTokenPart1);
        cookie.setPath(context + "/services/logout");
        cookie.setSecure(true);
        cookie.setMaxAge((int) expiresIn);
        response.addCookie(cookie);

        cookie = new Cookie("IS_LOGIN_DEFAULT", "true");
        cookie.setPath(context);
        cookie.setSecure(true);
        cookie.setMaxAge((int) expiresIn);
        response.addCookie(cookie);

        cookie = new Cookie("devportal_session_state", request.getParameter("session_state"));
        cookie.setPath(context + "/");
        cookie.setSecure(true);
        cookie.setMaxAge(-1);
        response.addCookie(cookie);

        String reqState = request.getParameter("state");
        if (reqState != null) {
            reqState = URLDecoder.decode(reqState, "UTF-8");
            response.sendRedirect(context + reqState);
        } else {
            response.sendRedirect(context + "/apis");
        }
    }
%>