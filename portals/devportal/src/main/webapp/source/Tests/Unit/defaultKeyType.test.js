/*
 * Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com).
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

import { getDefaultKeyType, resolveConsoleKeyType } from 'AppData/defaultKeyType';

describe('getDefaultKeyType', () => {
    it('returns PRODUCTION when the setting is unset', () => {
        expect(getDefaultKeyType({ hasSettingsValue: false, themeValue: undefined })).toBe('PRODUCTION');
    });

    it('returns PRODUCTION when the setting is invalid', () => {
        expect(getDefaultKeyType({ hasSettingsValue: true, settingsValue: 'STAGING' })).toBe('PRODUCTION');
        expect(getDefaultKeyType({ hasSettingsValue: false, themeValue: 'prod' })).toBe('PRODUCTION');
    });

    it('accepts PRODUCTION and SANDBOX regardless of case and surrounding space', () => {
        expect(getDefaultKeyType({ hasSettingsValue: true, settingsValue: ' sandbox ' })).toBe('SANDBOX');
        expect(getDefaultKeyType({ hasSettingsValue: false, themeValue: 'production' })).toBe('PRODUCTION');
    });

    it('uses the settings value ahead of the theme value', () => {
        expect(getDefaultKeyType({
            hasSettingsValue: true,
            settingsValue: 'SANDBOX',
            themeValue: 'PRODUCTION',
        })).toBe('SANDBOX');
    });

    it('reads PRODUCTION from the shipped devportal settings', () => {
        expect(getDefaultKeyType()).toBe('PRODUCTION');
    });
});

describe('resolveConsoleKeyType', () => {
    const keyManager = 'Resident Key Manager';

    function keysWith(keyType, accessToken) {
        return new Map([[keyManager, { keyType, token: { accessToken } }]]);
    }

    it('selects the configured key type when that key exists', () => {
        const resolved = resolveConsoleKeyType(
            keysWith('PRODUCTION', 'prod-token'),
            keysWith('SANDBOX', 'sand-token'),
            keyManager,
            'PRODUCTION',
        );
        expect(resolved.keyType).toBe('PRODUCTION');
        expect(resolved.accessToken).toBe('prod-token');
    });

    it('selects SANDBOX when that is the configured default and the sandbox key exists', () => {
        const resolved = resolveConsoleKeyType(
            keysWith('PRODUCTION', 'prod-token'),
            keysWith('SANDBOX', 'sand-token'),
            keyManager,
            'SANDBOX',
        );
        expect(resolved.keyType).toBe('SANDBOX');
        expect(resolved.accessToken).toBe('sand-token');
    });

    it('falls back to an available key type when the configured type is missing', () => {
        const sandboxOnly = resolveConsoleKeyType(
            new Map(),
            keysWith('SANDBOX', 'sand-token'),
            keyManager,
            'PRODUCTION',
        );
        expect(sandboxOnly.keyType).toBe('SANDBOX');
        expect(sandboxOnly.accessToken).toBe('sand-token');

        const productionOnly = resolveConsoleKeyType(
            keysWith('PRODUCTION', 'prod-token'),
            new Map(),
            keyManager,
            'SANDBOX',
        );
        expect(productionOnly.keyType).toBe('PRODUCTION');
        expect(productionOnly.accessToken).toBe('prod-token');
    });

    it('keeps the configured default when neither key exists', () => {
        const resolved = resolveConsoleKeyType(new Map(), new Map(), keyManager, 'SANDBOX');
        expect(resolved.keyType).toBe('SANDBOX');
        expect(resolved.accessToken).toBeUndefined();
    });
});
