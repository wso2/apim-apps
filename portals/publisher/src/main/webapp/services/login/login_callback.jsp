<%--
  ~ Copyright (c) 2017, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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
<%@page import="org.wso2.carbon.apimgt.ui.publisher.Util"%>
<%@include file="../constants.jsp" %>

<%@page trimDirectiveWhitespaces="true" %>

<%    Log log = LogFactory.getLog(this.getClass());
    Map settings = Util.readJsonFile("/site/public/conf/settings.json", request.getServletContext());
    Gson gson = new GsonBuilder().setPrettyPrinting().create();
    log.debug("Login Callback Endpoint");
    String context = Util.getTenantBasePublisherContext(request, (String) Util.readJsonObj(settings, "app.context"));
    String appContext = Util.getAppContextForServerUrl(context, (String) Util.readJsonObj(settings, "app.proxy_context_path"));

    String serverUrl = "";
    String forwarded_for = request.getHeader((String) Util.readJsonObj(settings, "app.customUrl.forwardedHeader"));
    boolean customUrlEnabled = (boolean) Util.readJsonObj(settings, "app.customUrl.enabled");
    if (customUrlEnabled && !forwarded_for.isEmpty()) {
        serverUrl = "https://" + forwarded_for;
    } else {
        serverUrl = APIUtil.getServerURL();
    }

    String loginCallbackUrl = Util.getTenantBasedLoginCallBack(request, LOGIN_CALLBACK_URL_SUFFIX);
    if (loginCallbackUrl == null) {
        loginCallbackUrl = serverUrl + appContext + LOGIN_CALLBACK_URL_SUFFIX;
    }

    String error = request.getParameter("error");
    if (error != null && error.equals("login_required")) {
        response.sendRedirect(serverUrl + appContext + "/services/logout");
    } else if (request.getParameter("code") != null) {
        HashMap<String, Object> tokenRequestData = new HashMap();
        tokenRequestData.put("grant_type", "authorization_code");
        tokenRequestData.put("code", request.getParameter("code"));
        tokenRequestData.put("redirect_uri", loginCallbackUrl);
        String tenantDomain = "carbon.super";
        if (Util.isPerTenantServiceProviderEnabled(request)) {
            tenantDomain = Util.getTenantDomain(request);
        }
        SystemApplicationDAO systemApplicationDAO = new SystemApplicationDAO();
        // this is to support migration from admin_publisher to apim_publisher
        SystemApplicationDTO systemApplicationDTO = systemApplicationDAO.getClientCredentialsForApplication(PUBLISHER_CLIENT_APP_NAME, tenantDomain);
        if (systemApplicationDTO == null) {
            systemApplicationDTO = systemApplicationDAO.getClientCredentialsForApplication(PUBLISHER_CLIENT_APP_NAME_OLD, tenantDomain);
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

        String errorLogin = serverUrl + appContext + "/error-pages?code=";
        boolean responseFailed = false;
        Map tokenResponse = gson.fromJson(result.body(), Map.class);
        if (tokenResponse.get("error") != null) {
            responseFailed = true;
        } else {
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
            response.setContentType("application/json");

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

            // Setting access token part 1 as secured HTTP only cookie, Can't restrict the path to /api/am/publisher
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
            cookie.setPath(proxyContext != null ? proxyContext + "/api/am/publisher/" : "/api/am/publisher/");
            cookie.setHttpOnly(true);
            cookie.setSecure(true);
            cookie.setMaxAge((int) expiresIn);
            response.addCookie(cookie);

            cookie = new Cookie("AM_ACC_TOKEN_DEFAULT_P2", accessTokenPart2);
            cookie.setPath("/api/am/service-catalog/v1/");
            cookie.setHttpOnly(true);
            cookie.setSecure(true);
            cookie.setMaxAge((int) expiresIn);
            response.addCookie(cookie);

            cookie = new Cookie("AM_REF_TOKEN_DEFAULT_P2", refreshTokenPart2);
            cookie.setPath(context + "/");
            cookie.setHttpOnly(true);
            cookie.setSecure(true);
            cookie.setMaxAge(86400); // TODO: Default value a day, need to get this from idn configs ~tmkb
            response.addCookie(cookie);

            cookie = new Cookie("WSO2_AM_REFRESH_TOKEN_1_Default", refreshTokenPart1);
            cookie.setPath(context + "/");
            cookie.setSecure(true);
            cookie.setMaxAge(86400); // TODO: Default value a day, need to get this from idn configs ~tmkb
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

            cookie = new Cookie("publisher_session_state", request.getParameter("session_state"));
            cookie.setPath(context + "/");
            cookie.setSecure(true);
            cookie.setMaxAge(-1);
            response.addCookie(cookie);

            String state = request.getParameter("state");
            if (responseFailed) {
                response.sendRedirect(errorLogin + "500");
            } else if (state != null) {
                state = URLDecoder.decode(state, "UTF-8");
                if (!state.equals("/")) {
                    response.sendRedirect(context + state);
                } else {
                    response.sendRedirect(context + "/");
                }
            } else {
                response.sendRedirect(context + "/");
            }
        }
    }
%>
