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


<%@page import="org.wso2.carbon.apimgt.ui.publisher.Util"%>
<%@page import="java.util.Map"%>
<%@page import="com.google.gson.GsonBuilder"%>
<%@page import="com.google.gson.Gson"%>

<%@ page trimDirectiveWhitespaces="true" %>

<%
    Map portalSettings = Util.readJsonFile("site/public/conf/portalSettings.json", request.getServletContext());
    response.setContentType("application/javascript");
    Gson gson = new GsonBuilder().setPrettyPrinting().create();
    String content = "const Settings = " + gson.toJson(portalSettings) + ";";
    out.println(content);
%>
