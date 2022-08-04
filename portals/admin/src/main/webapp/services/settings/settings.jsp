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
<%@page import="org.wso2.carbon.apimgt.ui.admin.Util"%>
<%@page import="java.util.Map"%>

<%@ page trimDirectiveWhitespaces="true" %>

<%
    Map settings = Util.readJsonFile("/site/public/conf/settings.json", request.getServletContext());
    response.setContentType("application/javascript");

    String serverUrl = Util.getIDPOrigin();
    String customIDPCheckSessionEndpoint = Util.getIDPCheckSessionEndpoint();

    HashMap<String, Object> idp = new HashMap();
    idp.put("origin", serverUrl);
    idp.put("checkSessionEndpoint", customIDPCheckSessionEndpoint);
    settings.put("idp", idp);

    Gson gson = new GsonBuilder().setPrettyPrinting().create();
    String content = "const AppConfig = " + gson.toJson(settings) + ";";

    out.println(content);
%>
