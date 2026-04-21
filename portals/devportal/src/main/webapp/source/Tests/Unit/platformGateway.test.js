/*
 * Copyright (c) 2026, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import isPlatformGatewayApi from 'AppComponents/Apis/Details/ApiConsole/platformGateway';

describe('isPlatformGatewayApi', () => {
    it('returns true when gatewayType is exactly "APIPlatform"', () => {
        expect(isPlatformGatewayApi({ gatewayType: 'APIPlatform' })).toBe(true);
    });

    it('returns false for Synapse gatewayType "wso2/synapse"', () => {
        expect(isPlatformGatewayApi({ gatewayType: 'wso2/synapse' })).toBe(false);
    });

    it('returns false when gatewayType is a different value', () => {
        expect(isPlatformGatewayApi({ gatewayType: 'Regular' })).toBe(false);
    });

    it('returns false when the comparison is case-insensitive (strict match only)', () => {
        // Matches current UI behaviour: strict `=== 'APIPlatform'`.
        expect(isPlatformGatewayApi({ gatewayType: 'apiplatform' })).toBe(false);
        expect(isPlatformGatewayApi({ gatewayType: 'APIPLATFORM' })).toBe(false);
    });

    it('returns false when gatewayType is missing', () => {
        expect(isPlatformGatewayApi({})).toBe(false);
    });

    it('returns false when gatewayType is null or empty', () => {
        expect(isPlatformGatewayApi({ gatewayType: null })).toBe(false);
        expect(isPlatformGatewayApi({ gatewayType: '' })).toBe(false);
    });

    it('returns false for null, undefined, or non-object input', () => {
        expect(isPlatformGatewayApi(null)).toBe(false);
        expect(isPlatformGatewayApi(undefined)).toBe(false);
        expect(isPlatformGatewayApi(0)).toBe(false);
    });
});
