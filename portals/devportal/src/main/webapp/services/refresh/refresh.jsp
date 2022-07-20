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
<%@page import="java.net.http.HttpResponse"%>
<%@page import="java.net.http.HttpRequest"%>
<%@page import="java.net.http.HttpClient"%>
<%@page import="org.apache.commons.logging.LogFactory"%>
<%@page import="org.apache.commons.logging.Log"%>
<%@page import="java.net.URI"%>
<%@page import="org.wso2.carbon.apimgt.impl.dto.SystemApplicationDTO"%>
<%@page import="org.wso2.carbon.apimgt.impl.dao.SystemApplicationDAO"%>
<%@page import="java.util.HashMap"%>
<%@page import="com.google.gson.GsonBuilder"%>
<%@page import="com.google.gson.Gson"%>
<%@page import="org.wso2.carbon.apimgt.ui.devportal.Util"%>
<%@page import="java.util.Map"%>
<%@include file="../constants.jsp" %>

<%@page trimDirectiveWhitespaces="true" %>

<%    Log log = LogFactory.getLog(this.getClass());
    Map settings = Util.readJsonFile("site/public/theme/settings.json", request.getServletContext());
    String context = Util.getTenantBaseStoreContext(request, (String) Util.readJsonObj(settings, "app.context"));
    String tenantDomain = Util.getServiceProviderTenantDomain(request);

    Cookie[] cookies = request.getCookies();
    Gson gson = new GsonBuilder().setPrettyPrinting().create();
    String cookieToken = "";
    for (int i = 0; i < cookies.length; i++) {
        String cookieName = cookies[i].getName();
        if ("AM_REF_TOKEN_DEFAULT_P2".equals(cookieName)) {
            cookieToken = cookies[i].getValue();
            break;
        }
    }
    String tokenParam = request.getParameter("refresh_token");
    if (cookieToken.isEmpty() || tokenParam == null) {
        log.error("Token request with no AM_REF_TOKEN_DEFAULT_P2 HTTP only cookie or no tokenParam received!!");
        response.setStatus(400);
        response.setContentType("application/json");
        HashMap<String, Object> res = new HashMap();
        res.put("error", true);
        res.put("message", "Cookie and/or param token part is missing!");
        out.println(gson.toJson(res));
    } else {
        HashMap<String, Object> tokenRequestData = new HashMap();
        tokenRequestData.put("grant_type", "refresh_token");
        tokenRequestData.put("refresh_token", tokenParam + cookieToken);

        SystemApplicationDAO systemApplicationDAO = new SystemApplicationDAO();
        SystemApplicationDTO systemApplicationDTO = systemApplicationDAO.getClientCredentialsForApplication(STORE_CLIENT_APP_NAME, tenantDomain);
        if (systemApplicationDTO == null) {
            systemApplicationDTO = systemApplicationDAO.getClientCredentialsForApplication(STORE_CLIENT_APP_NAME_OLD, tenantDomain);
        }
        if (systemApplicationDTO == null) {
            log.error("Oauth application details not found for 'devportal'");
            response.setStatus(401);
            response.setContentType("application/json");
            HashMap<String, Object> res = new HashMap();
            res.put("error", true);
            res.put("message", "Oauth application details not found for 'devportal'");
            out.println(gson.toJson(res));
        } else {
            String clientId = systemApplicationDTO.getConsumerKey();
            String clientSecret = systemApplicationDTO.getConsumerSecret();
            String concatenatedCredential = clientId + ":" + clientSecret;
            byte[] byteValue = concatenatedCredential.getBytes();
            String base64encoded = Base64.getEncoder().encodeToString(byteValue);
            String tokenEndpoint = Util.getLoopbackOrigin((String) Util.readJsonObj(settings, "app.origin.host")) + TOKEN_URL_SUFFIX;

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest post = HttpRequest.newBuilder()
                    .uri(URI.create(tokenEndpoint))
                    .POST(HttpRequest.BodyPublishers.ofString(gson.toJson(tokenRequestData)))
                    .header("Authorization", "Basic " + base64encoded)
                    .build();
            HttpResponse<String> result = client.send(post, HttpResponse.BodyHandlers.ofString());
            if (result.statusCode() == 200) {
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
                // hence setting the HTTP only access token path to App context
                Cookie cookie = new Cookie("AM_ACC_TOKEN_DEFAULT_P2", accessTokenPart2);
                cookie.setPath(context + "/");
                cookie.setHttpOnly(true);
                cookie.setSecure(true);
                cookie.setMaxAge((int) expiresIn);
                response.addCookie(cookie);

                cookie = new Cookie("AM_ACC_TOKEN_DEFAULT_P2", accessTokenPart2);
                cookie.setPath("/api/am/devportal/");
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

                cookie = new Cookie("WSO2_AM_TOKEN_1_Default", accessTokenPart1);
                cookie.setPath(context + "/");
                cookie.setSecure(true);
                cookie.setMaxAge((int) expiresIn);
                response.addCookie(cookie);

                cookie = new Cookie("WSO2_AM_REFRESH_TOKEN_1_Default", refreshTokenPart1);
                cookie.setPath(context + "/");
                cookie.setSecure(true);
                cookie.setMaxAge(86400);
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
                out.println("{}");
            } else {
                log.warn("Something went wrong while refreshing the token");
                log.error(response);
                response.setStatus(500);
                response.setContentType("application/json");
                HashMap<String, Object> res = new HashMap();
                res.put("error", true);
                res.put("message", "Something went wrong while refreshing the token!!");
                out.println(gson.toJson(res));
            }
        }
    }
%>
