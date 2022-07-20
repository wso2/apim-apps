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

<%@page import="java.net.URLEncoder"%>
<%@page import="java.util.regex.Pattern"%>
<%@page import="java.util.List"%>
<%@page import="java.util.ArrayList"%>
<%@page import="java.util.Arrays"%>
<%@page import="org.apache.commons.logging.LogFactory"%>
<%@page import="org.apache.commons.logging.Log"%>
<%@page import="java.util.HashMap"%>
<%@page import="java.util.concurrent.Semaphore"%>
<%@page import="org.wso2.carbon.apimgt.impl.dto.SystemApplicationDTO"%>
<%@page import="org.wso2.carbon.apimgt.impl.dao.SystemApplicationDAO"%>
<%@page import="com.google.gson.Gson"%>
<%@page import="com.google.gson.GsonBuilder"%>
<%@page import="java.net.URI"%>
<%@page import="java.net.http.HttpResponse"%>
<%@page import="java.net.http.HttpRequest"%>
<%@page import="java.net.http.HttpClient"%>
<%@page import="org.wso2.carbon.apimgt.impl.IDPConfiguration"%>
<%@page import="org.wso2.carbon.apimgt.impl.utils.APIUtil"%>
<%@page import="org.wso2.carbon.apimgt.ui.devportal.Util"%>
<%@page import="java.util.Map"%>

<%@include file="../constants.jsp" %>

<%@page trimDirectiveWhitespaces="true" %>

<%    Log log = LogFactory.getLog(this.getClass());
    Map settings = Util.readJsonFile("site/public/theme/settings.json", request.getServletContext());
    String context = Util.getTenantBaseStoreContext(request, (String) Util.readJsonObj(settings, "app.context"));
    String appContext = Util.getAppContextForServerUrl(context, (String) Util.readJsonObj(settings, "app.proxy_context_path"));
    String serverUrl = APIUtil.getServerURL();
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
    String authorizeEndpoint = serverUrl + AUTHORIZE_ENDPOINT_SUFFIX;

    IDPConfiguration idpConfig = APIUtil.getIdentityProviderConfig();
    if (idpConfig != null) {
        authorizeEndpoint = idpConfig.getAuthorizeEndpoint();
    }
    String host = (String) Util.readJsonObj(settings, "app.origin.host");
    String settingsAPIUrl = Util.getLoopbackOrigin(host) + SETTINGS_REST_API_URL_SUFFIX;

    HttpClient client = HttpClient.newHttpClient();
    HttpRequest getReq = HttpRequest.newBuilder()
            .uri(URI.create(settingsAPIUrl))
            .build();
    HttpResponse<String> settingsResult = client.send(getReq, HttpResponse.BodyHandlers.ofString());

    Gson gson = new GsonBuilder().setPrettyPrinting().create();
    Map settingsResponse = gson.fromJson(settingsResult.body(), Map.class);
    String dcrUrl = Util.getLoopbackOrigin(host) + DCR_URL_SUFFIX;
    String loginCallbackUrl = Util.getTenantBasedLoginCallBack(request, LOGIN_CALLBACK_URL_SUFFIX);
    if (loginCallbackUrl == null) {
        loginCallbackUrl = serverUrl + appContext + LOGIN_CALLBACK_URL_SUFFIX;
    }
    String logoutCallbackUrl = Util.getTenantBasedLogoutCallBack(request, LOGOUT_CALLBACK_URL_SUFFIX);
    if (logoutCallbackUrl == null) {
        logoutCallbackUrl = serverUrl + appContext + LOGOUT_CALLBACK_URL_SUFFIX;
    }
    String callbackUrl = "regexp=(" + loginCallbackUrl + "|" + logoutCallbackUrl + ")";
    List<String> scopesArray = (ArrayList<String>) Util.readJsonObj(settingsResponse, "scopes");
    String[] scopesList = scopesArray.toArray(new String[0]);
    String scopes = String.join(" ", scopesList);
    String referer = request.getHeader("Referer");
    String state = "";
    // get the pathname excluding the 'devportal/publisher' segment
    if (referer != null) {
        String contextRef = appContext.charAt(0) == '/' ? appContext.substring(1) : appContext;
        String hostnamePattern = "(https?:\\/\\/.*):?(\\d*)\\/?(" + contextRef + ")";
        Pattern regPattern = Pattern.compile(hostnamePattern);
        String replaced = regPattern.matcher(referer).replaceAll("");
        state = URLEncoder.encode(replaced, "UTF-8");
    }

    String authorizationHeader = "Basic " + APIUtil.getBase64EncodedAdminCredentials();

    SystemApplicationDAO systemApplicationDAO = new SystemApplicationDAO();
    String clientId = "";
    String serviceProviderTenantDomain = Util.getServiceProviderTenantDomain(request);

    // this is to support migration from admin_store to admin_devportal
    SystemApplicationDTO systemApplicationDTO = systemApplicationDAO.getClientCredentialsForApplication(STORE_CLIENT_APP_NAME, serviceProviderTenantDomain);
    if (systemApplicationDTO == null) {
        systemApplicationDTO = systemApplicationDAO.getClientCredentialsForApplication(STORE_CLIENT_APP_NAME_OLD, serviceProviderTenantDomain);
    }

    Semaphore lock = SystemApplicationDAO.getLock();
    if (systemApplicationDTO != null) {
        clientId = systemApplicationDTO.getConsumerKey();
        log.debug("clientid :" + clientId);
    } else {
        try {
            lock.acquire();
            // this is to support migration from admin_store to admin_devportal
            systemApplicationDTO = systemApplicationDAO.getClientCredentialsForApplication(STORE_CLIENT_APP_NAME, serviceProviderTenantDomain);
            if (systemApplicationDTO == null) {
                systemApplicationDTO = systemApplicationDAO.getClientCredentialsForApplication(STORE_CLIENT_APP_NAME_OLD, serviceProviderTenantDomain);
            }
            if (systemApplicationDTO == null) {
                HashMap<String, Object> dcrRequestData = new HashMap();
                dcrRequestData.put("callbackUrl", "authorization_code");
                dcrRequestData.put("clientName", STORE_CLIENT_APP_NAME);
                dcrRequestData.put("owner", (String) APIUtil.getTenantAdminUserName(serviceProviderTenantDomain));
                dcrRequestData.put("grantType", "authorization_code refresh_token");
                dcrRequestData.put("saasApp", true);
                log.debug(dcrRequestData);
                HttpRequest postReq = HttpRequest.newBuilder()
                        .uri(URI.create(dcrUrl))
                        .POST(HttpRequest.BodyPublishers.ofString(gson.toJson(dcrRequestData)))
                        .header("Authorization", authorizationHeader)
                        .header("Content-Type", "application/json")
                        .build();
                HttpResponse<String> dcrResult = client.send(postReq, HttpResponse.BodyHandlers.ofString());
                Map dcrResponse = gson.fromJson(dcrResult.body(), Map.class);
                clientId = (String) dcrResponse.get("data.clientId");
                String clientSecret = (String) dcrResponse.get("data.clientSecret");

                log.debug("Client ID = " + clientId);
                boolean addApplicationKey = systemApplicationDAO.addApplicationKey(STORE_CLIENT_APP_NAME, clientId, clientSecret, serviceProviderTenantDomain);
                if (!addApplicationKey) {
                    log.error("Error while persisting application information in system application DB table!!");
                    log.error("Client ID = " + clientId);
                }
            }
        } finally {
            lock.release();
        }
    }

    String authRequestParams = "?response_type=code&client_id=" + clientId + "&scope=" + scopes + "&state=" + state + "&redirect_uri=" + loginCallbackUrl;
    if (request.getParameter("loginPrompt") == "false") {
        authRequestParams += "&prompt=none";
    }
    log.debug("Redirecting to = " + authorizeEndpoint + authRequestParams);
    Cookie cookie = new Cookie("CLIENT_ID", clientId);
    cookie.setPath(appContext + "/");
    cookie.setSecure(true);
    cookie.setMaxAge(-1);
    response.addCookie(cookie);
    response.sendRedirect(authorizeEndpoint + authRequestParams);
%>
