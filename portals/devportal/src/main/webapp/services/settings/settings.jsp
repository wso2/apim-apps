<%--
  ~ Copyright (c) 2017-2023, WSO2 LLC (https://www.wso2.com).
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
<%@page import="com.google.gson.GsonBuilder"%>
<%@page import="com.google.gson.Gson"%>
<%@page import="java.util.HashMap"%>
<%@page import="com.google.gson.JsonObject"%>
<%@page import="org.wso2.carbon.apimgt.ui.devportal.Util"%>
<%@page import="java.util.List"%>
<%@page import="java.util.Map"%>

<%@ page trimDirectiveWhitespaces="true" %>

<%
    Log log = LogFactory.getLog(this.getClass());
    ServletContext sc = request.getServletContext();
    Map settings = Util.readJsonFile("site/public/theme/settings.json", sc);
    String context = Util.getTenantBaseStoreContext(request, (String) Util.readJsonObj(settings, "app.context"));
    response.setContentType("application/javascript");

    String serverUrl = "";
    String forwarded_for = request.getHeader((String) Util.readJsonObj(settings, "app.customUrl.forwardedHeader"));
    boolean customUrlEnabled = (boolean) Util.readJsonObj(settings, "app.customUrl.enabled");
       // Host validation against app.customUrl.allowedHosts
    boolean isHostValid = true;
    if (customUrlEnabled && forwarded_for != null && !forwarded_for.isEmpty()) {
        // Check if allowedHosts is configured
        List<String> allowedHosts = (List<String>) Util.readJsonObj(settings, "app.customUrl.allowedHosts");

        if (allowedHosts != null && !allowedHosts.isEmpty()) {
            // Extract hostname from forwarded_for (remove port if present)
            String forwardedHost = forwarded_for;
            if (forwardedHost.contains(":")) {
                forwardedHost = forwardedHost.substring(0, forwardedHost.indexOf(":"));
            }

            isHostValid = false;
            for (String allowedHost : allowedHosts) {
                if (allowedHost != null && allowedHost.equalsIgnoreCase(forwardedHost)) {
                    isHostValid = true;
                    break;
                }
            }

            if (!isHostValid) {
                log.warn("Blocked request with untrusted host header: " + forwarded_for.replaceAll("[\r\n]", ""));
                response.setStatus(400);
                response.setContentType("text/html");
                out.println("<html><head></head><body><h2>Error 400 : Bad Request</h2><br/><p>"+
                    "<h4>Host validation failed for the request</h4></body></html>");
                return;
            }
        }
    }

    // Only use custom URL if host validation passes
    if (customUrlEnabled && forwarded_for != null && !forwarded_for.isEmpty() && isHostValid) {
        serverUrl = "https://" + forwarded_for;
    } else {
        serverUrl = Util.getIDPOrigin();
    }

    String customIDPCheckSessionEndpoint = "";
    if (customUrlEnabled && forwarded_for != null && !forwarded_for.isEmpty() && isHostValid) {
        customIDPCheckSessionEndpoint = "https://" + forwarded_for + "/oidc/checksession";
    } else {
        customIDPCheckSessionEndpoint = Util.getIDPCheckSessionEndpoint();
    }

    HashMap<String, Object> idp = new HashMap();
    idp.put("origin", serverUrl);
    idp.put("checkSessionEndpoint", customIDPCheckSessionEndpoint);
    settings.put("idp", idp);

    Map appObj = (Map) settings.get("app");
    appObj.put("context", context);
    Gson gson = new GsonBuilder().setPrettyPrinting().create();
    String content = "const Settings = " + gson.toJson(settings) + ";";

    out.println(content);
%>
