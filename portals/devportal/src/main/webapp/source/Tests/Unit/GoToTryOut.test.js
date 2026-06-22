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

jest.mock('AppData/api', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({})),
}));
jest.mock('AppData/AuthManager', () => ({ __esModule: true, default: {} }));

import { isSubscriptionlessAPI } from 'AppComponents/Apis/Details/GoToTryOut';

describe('isSubscriptionlessAPI', () => {
    it('should return true when API has only DefaultSubscriptionless plan', () => {
        const api = { tiers: [{ tierName: 'DefaultSubscriptionless' }] };
        expect(isSubscriptionlessAPI(api)).toBe(true);
    });

    it('should return true when API has only AsyncDefaultSubscriptionless plan', () => {
        const api = { tiers: [{ tierName: 'AsyncDefaultSubscriptionless' }] };
        expect(isSubscriptionlessAPI(api)).toBe(true);
    });

    it('should return false when API has a normal subscription plan', () => {
        const api = { tiers: [{ tierName: 'Unlimited' }] };
        expect(isSubscriptionlessAPI(api)).toBe(false);
    });

    it('should return false when API has multiple subscription plans', () => {
        const api = { tiers: [{ tierName: 'Unlimited' }, { tierName: 'Gold' }] };
        expect(isSubscriptionlessAPI(api)).toBe(false);
    });

    it('should return false when API has empty tiers', () => {
        const api = { tiers: [] };
        expect(isSubscriptionlessAPI(api)).toBe(false);
    });

    it('should return false when API has no tiers property', () => {
        const api = {};
        expect(isSubscriptionlessAPI(api)).toBe(false);
    });
});
