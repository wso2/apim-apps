/*


 *  Copyright (c) 2017, WSO2 LLC (http://www.wso2.org) All Rights Reserved.
 * 
 *  WSO2 LLC licenses this file to you under the Apache License,
 *  Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License.
 *  You may obtain a copy of the License at
 * 
 *  http://www.apache.org/licenses/LICENSE-2.0
 * 
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.


 */
package org.wso2.carbon.apimgt.ui.publisher;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.util.Arrays;
import java.util.Map;
import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import org.wso2.carbon.apimgt.api.APIManagementException;
import org.wso2.carbon.apimgt.impl.utils.APIUtil;
import org.wso2.carbon.registry.api.RegistryException;

/**
 * Class for the utility functions needed by the services
 */
public class Util {

    /**
     * Read a json file from the directory and output as a Map object.
     *
     * @param path    required parameter
     * @param context required parameter
     * @return Map of read json file
     * @throws FileNotFoundException
     */
    public static Map<String, Object> readJsonFile(String path, ServletContext context) throws FileNotFoundException {
        String realPath = context.getRealPath(path);
        BufferedReader bufferedReader = new BufferedReader(new FileReader(realPath));
        Gson gson = (new GsonBuilder()).setPrettyPrinting().create();
        return (Map) gson.fromJson(bufferedReader, Map.class);
    }

    /**
     * Returns the value in the given path of the nested tree map. <br> "." separate 2 levels in Map tree.
     *
     * @param json required parameter
     * @param path required parameter
     * @return value in the given path of the nested tree map
     */
    public static Object readJsonObj(Map json, String path) {
        String[] pathStrings = path.split("\\.");
        Map nestedJson = json;

        for (String pathString : Arrays.copyOfRange(pathStrings, 0, pathStrings.length - 1)) {
            if (!nestedJson.containsKey(pathString)) {
                return null;
            }
            nestedJson = (Map) nestedJson.get(pathString);
        }

        if (!nestedJson.containsKey(pathStrings[pathStrings.length - 1])) {
            return null;
        }
        return nestedJson.get(pathStrings[pathStrings.length - 1]);
    }
    
    /**
     * Get the loopback (localhost) origin (scheme + hostname + port), This origin is used for making
     * internal(within the web app node), API calls.For example DCR call, Token generation, User Info, Token Introspect,
 Revoke etc.
     * @param host
     * @return String
     */
    public static String getLoopbackOrigin(String host) {
        int mgtTransportPort = APIUtil.getCarbonTransportPort("https"); // This is the actual server port (management) , Not the proxy port
        return "https://" + host + ":" + mgtTransportPort; // Unless there is a port offset this is https://localhost:9443
    }

    public static String getIDPOrigin() throws APIManagementException {
        return APIUtil.getExternalIDPOrigin();
    }

    public static String getIDPCheckSessionEndpoint() throws APIManagementException {
        return APIUtil.getExternalIDPCheckSessionEndpoint();
    }

    public static String getTenantBasePublisherContext(HttpServletRequest request, String context) throws APIManagementException {
        String tenantDomain = getTenantDomain(request);
        String tenantContext = APIUtil.getTenantBasedPublisherContext(tenantDomain);
        return tenantContext != null && !tenantContext.equals(" ") ? tenantContext : context;
    }

    public static String getTenantBasedLoginCallBack(HttpServletRequest request, String loginSuffix) throws APIManagementException {
        String tenantDomain = getTenantDomain(request);
        Map publisherDomainMapping = APIUtil.getTenantBasedPublisherDomainMapping(tenantDomain);
        if (publisherDomainMapping != null) {
            if (publisherDomainMapping.get("login") != null) {
                return (String) publisherDomainMapping.get("login");
            }
            return "https://" + publisherDomainMapping.get("customUrl") + loginSuffix;
        } else {
            return null;
        }
    }

    public static String getTenantBasedLogoutCallBack(HttpServletRequest request, String logoutSuffix) throws APIManagementException {
        String tenantDomain = getTenantDomain(request);
        Map publisherDomainMapping = APIUtil.getTenantBasedPublisherDomainMapping(tenantDomain);
        if (publisherDomainMapping != null) {
            if (publisherDomainMapping.get("logout") != null) {
                return (String) publisherDomainMapping.get("logout");
            }
            return "https://" + publisherDomainMapping.get("customUrl") + logoutSuffix;
        } else {
            return null;
        }
    }

    public static boolean isPerTenantServiceProviderEnabled(HttpServletRequest request) throws APIManagementException, RegistryException {
        String tenantDomain = getTenantDomain(request);
        return APIUtil.isPerTenantServiceProviderEnabled(tenantDomain);
    }

    public static String getTenantDomain(HttpServletRequest request) {
        String tenantDomain = request.getParameter("tenant");
        if (tenantDomain == null) {
            tenantDomain = request.getHeader("X-WSO2-Tenant");
            if (tenantDomain == null) {
                tenantDomain = "carbon.super";
            }
        }
        return tenantDomain;
    }

    public static String getServiceProviderTenantDomain(HttpServletRequest request) throws APIManagementException, RegistryException {
        String tenantDomain = getTenantDomain(request);
        if (isPerTenantServiceProviderEnabled(request)) {
            return tenantDomain;
        } else {
            return "carbon.super";
        }
    }

    /**
     * Deciding what to process as app context. <br>
     * If the settings.json has the following definition, <br><br>
     * <p> ( case 1 ) - appContext is <b>'/devportal'</b>
     * <pre>
     *     context: '/devportal'
     * </pre>
     *
     * <p> ( case 2 ) - appContext is <b>'/apim/devportal'</b>
     * <pre>
     *     context: '/devportal'
     *     proxy_context_path: '/apim',
     * </pre>
     *
     * @param proxyContext required parameter
     * @param context      required parameter
     * @return String
     */
    public static String getAppContextForServerUrl(String context, String proxyContext) {
        String appContext = context;
        if (proxyContext != null && !proxyContext.isEmpty()) {
            appContext = appContext.replace(proxyContext, "");
        }
        return appContext;
    }
}