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
<%@page import="org.wso2.carbon.apimgt.ui.publisher.Util"%>
<%@page import="java.util.Map"%>

<%@include file="../constants.jsp" %>

<%@page trimDirectiveWhitespaces="true" %>

<%    Log log = LogFactory.getLog(this.getClass());
    log.debug("Services login DCR request");
    Map settings = Util.readJsonFile("/site/public/conf/settings.json", request.getServletContext());
    String appContext = Util.getAppContextForServerUrl((String) Util.readJsonObj(settings, "app.context"), (String) Util.readJsonObj(settings, "app.proxy_context_path"));
    String serverUrl = "";
    String forwarded_for = request.getHeader((String) Util.readJsonObj(settings, "app.customUrl.forwardedHeader"));
    boolean customUrlEnabled = (boolean) Util.readJsonObj(settings, "app.customUrl.enabled");
    if (customUrlEnabled && !forwarded_for.isEmpty()) {
        serverUrl = "https://" + forwarded_for;
    } else {
        serverUrl = APIUtil.getServerURL();
    }
    String authorizeEndpoint = serverUrl + AUTHORIZE_ENDPOINT_SUFFIX;

    IDPConfiguration idpConfig = APIUtil.getIdentityProviderConfig();
    if (idpConfig != null) {
        authorizeEndpoint = idpConfig.getAuthorizeEndpoint();
    }
    String host = (String) Util.readJsonObj(settings, "app.origin.host");
    String settingsAPIUrl = Util.getLoopbackOrigin(host) + SETTINGS_REST_API_URL_SUFFIX;
    String serviceCatalogSettingsAPIUrl = Util.getLoopbackOrigin(host) + SERVICE_CATALOG_SETTINGS_REST_API_URL_SUFFIX;

    HttpClient client = HttpClient.newHttpClient();
    HttpRequest getSettingsReq = HttpRequest.newBuilder()
            .uri(URI.create(settingsAPIUrl))
            .build();
    HttpResponse<String> settingsResult = client.send(getSettingsReq, HttpResponse.BodyHandlers.ofString());

    HttpRequest getCatalogReq = HttpRequest.newBuilder()
            .uri(URI.create(settingsAPIUrl))
            .build();
    HttpResponse<String> serviceCatalogResult = client.send(getCatalogReq, HttpResponse.BodyHandlers.ofString());

    boolean responseFailed = false;
    String errorLogin = serverUrl + appContext + "/error-pages?code=";

    Gson gson = new GsonBuilder().setPrettyPrinting().create();
    Map settingsResponse = gson.fromJson(settingsResult.body(), Map.class);
    Map serviceCatalogSettingsResponse = gson.fromJson(serviceCatalogResult.body(), Map.class);

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
    String scopes = "";
    if (settingsResponse != null && serviceCatalogSettingsResponse != null) {
        List<String> scopesArray = (ArrayList<String>) Util.readJsonObj(settingsResponse, "scopes");
        String[] scopesList = scopesArray.toArray(new String[0]);
        scopes = String.join(" ", scopesList);
        List<String> scopesCatalogArray = (ArrayList<String>) Util.readJsonObj(serviceCatalogSettingsResponse, "scopes");
        String[] scopesCatalogList = scopesCatalogArray.toArray(new String[0]);
        String catalogScopes = String.join(" ", scopesCatalogList);
        scopes = scopes + " " + catalogScopes;
    } else {
        response.sendRedirect(errorLogin + "500");
        responseFailed = true;
    }

    String referer = request.getHeader("Referer");
    String state = "";
    // Get the pathname from query param 'referrer'
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
    SystemApplicationDTO systemApplicationDTO = systemApplicationDAO.getClientCredentialsForApplication(PUBLISHER_CLIENT_APP_NAME, serviceProviderTenantDomain);
    if (systemApplicationDTO == null) {
        systemApplicationDTO = systemApplicationDAO.getClientCredentialsForApplication(PUBLISHER_CLIENT_APP_NAME_OLD, serviceProviderTenantDomain);
    }

    Semaphore lock = SystemApplicationDAO.getLock();
    if (systemApplicationDTO != null) {
        clientId = systemApplicationDTO.getConsumerKey();
    } else {
        try {
            lock.acquire();
            systemApplicationDTO = systemApplicationDAO.getClientCredentialsForApplication(PUBLISHER_CLIENT_APP_NAME, serviceProviderTenantDomain);
            if (systemApplicationDTO == null) {
                systemApplicationDTO = systemApplicationDAO.getClientCredentialsForApplication(PUBLISHER_CLIENT_APP_NAME_OLD, serviceProviderTenantDomain);
            }
            if (systemApplicationDTO == null) {
                HashMap<String, Object> dcrRequestData = new HashMap();
                dcrRequestData.put("callbackUrl", "authorization_code");
                dcrRequestData.put("clientName", PUBLISHER_CLIENT_APP_NAME);
                dcrRequestData.put("owner", (String) APIUtil.getTenantAdminUserName(serviceProviderTenantDomain));
                dcrRequestData.put("grantType", "authorization_code refresh_token");
                dcrRequestData.put("saasApp", true);

                HttpRequest postReq = HttpRequest.newBuilder()
                        .uri(URI.create(dcrUrl))
                        .POST(HttpRequest.BodyPublishers.ofString(gson.toJson(dcrRequestData)))
                        .header("Authorization", authorizationHeader)
                        .header("Content-Type", "application/json")
                        .build();
                HttpResponse<String> dcrResult = client.send(postReq, HttpResponse.BodyHandlers.ofString());
                Map dcrResponse = gson.fromJson(dcrResult.body(), Map.class);
                clientId = (String) dcrResponse.get("clientId");
                String clientSecret = (String) dcrResponse.get("clientSecret");

                log.debug("Client ID = " + clientId);
                boolean addApplicationKey = systemApplicationDAO.addApplicationKey(PUBLISHER_CLIENT_APP_NAME, clientId, clientSecret, serviceProviderTenantDomain);
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
    String queryString = request.getQueryString();
    if (queryString != null && queryString.equals("not-Login")) {
        authRequestParams += "&prompt=none";
    }
    log.debug("Redirecting to = " + authorizeEndpoint + authRequestParams);
    Cookie cookie = new Cookie("CLIENT_ID", clientId);
    cookie.setPath(appContext + "/");
    cookie.setSecure(true);
    cookie.setMaxAge(-1);
    if (!responseFailed) {
        response.addCookie(cookie);
        response.sendRedirect(authorizeEndpoint + authRequestParams);
    }

%>