/*
 * Copyright (c) 2026 WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * APIs deployed to the API Platform / Universal gateway use gatewayType "Universal"
 * (see org.wso2.carbon.apimgt.api.APIConstants.WSO2_API_PLATFORM_GATEWAY).
 *
 * @param {object|null|undefined} api DevPortal API object
 * @returns {boolean}
 */
export default function isPlatformGatewayApi(api) {
    return Boolean(api && api.gatewayType === 'APIPlatform');
}
