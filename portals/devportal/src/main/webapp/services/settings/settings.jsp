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

<%@page import="com.google.gson.GsonBuilder"%>
<%@page import="com.google.gson.Gson"%>
<%@page import="java.util.HashMap"%>
<%@page import="com.google.gson.JsonObject"%>
<%@page import="org.wso2.carbon.apimgt.ui.devportal.Util"%>
<%@page import="java.util.Map"%>

<%@ page trimDirectiveWhitespaces="true" %>

<%
    ServletContext sc = request.getServletContext();
    Map settings = Util.readJsonFile("site/public/theme/settings.json", sc);
    String context = Util.getTenantBaseStoreContext(request, (String) Util.readJsonObj(settings, "app.context"));
    response.setContentType("application/javascript");

    String serverUrl = "";
    String forwarded_for = request.getHeader((String) Util.readJsonObj(settings, "app.customUrl.forwardedHeader"));
    boolean customUrlEnabled = (boolean) Util.readJsonObj(settings, "app.customUrl.enabled");
    if (customUrlEnabled && !forwarded_for.isEmpty()) {
        serverUrl = "https://" + forwarded_for;
    } else {
        serverUrl = Util.getIDPOrigin();
    }

    String customIDPCheckSessionEndpoint = "";
    if (customUrlEnabled && !forwarded_for.isEmpty()) {
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
