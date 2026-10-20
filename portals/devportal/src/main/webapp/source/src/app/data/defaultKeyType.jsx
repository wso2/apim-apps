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

import Settings from 'Settings';
import Configurations from 'Config';

import DefaultConfigurations from './defaultTheme';

const PRODUCTION = 'PRODUCTION';
const SANDBOX = 'SANDBOX';

/**
 * Normalize a configured key type.
 * @param {*} value raw configured value
 * @returns {string|null} PRODUCTION, SANDBOX, or null when the value is invalid
 */
function normalizeKeyType(value) {
    if (typeof value !== 'string') {
        return null;
    }
    const normalized = value.trim().toUpperCase();
    if (normalized === PRODUCTION || normalized === SANDBOX) {
        return normalized;
    }
    return null;
}

/**
 * Read custom.defaultKeyType from userTheme when present, otherwise from defaultTheme.
 * @returns {*} configured theme value, or undefined when unset
 */
function getThemeDefaultKeyType() {
    const userCustom = Configurations && Configurations.custom;
    if (userCustom && Object.prototype.hasOwnProperty.call(userCustom, 'defaultKeyType')) {
        return userCustom.defaultKeyType;
    }
    const defaultCustom = DefaultConfigurations && DefaultConfigurations.custom;
    if (defaultCustom && Object.prototype.hasOwnProperty.call(defaultCustom, 'defaultKeyType')) {
        return defaultCustom.defaultKeyType;
    }
    return undefined;
}

/**
 * Default key type for the DevPortal Try Out console.
 * app.defaultKeyType in site/public/theme/settings.json is used when that property is set.
 * Otherwise custom.defaultKeyType from userTheme.json or defaultTheme.js is used.
 * Unset or invalid values fall back to PRODUCTION.
 * @param {object} [sources] optional values, used by tests
 * @param {*} [sources.settingsValue] settings.json app.defaultKeyType
 * @param {boolean} [sources.hasSettingsValue] whether settings.json defines the property
 * @param {*} [sources.themeValue] theme custom.defaultKeyType
 * @returns {string} PRODUCTION or SANDBOX
 */
export function getDefaultKeyType(sources) {
    if (sources) {
        const configured = sources.hasSettingsValue ? sources.settingsValue : sources.themeValue;
        return normalizeKeyType(configured) || PRODUCTION;
    }
    if (Settings.app && Object.prototype.hasOwnProperty.call(Settings.app, 'defaultKeyType')) {
        return normalizeKeyType(Settings.app.defaultKeyType) || PRODUCTION;
    }
    return normalizeKeyType(getThemeDefaultKeyType()) || PRODUCTION;
}

/**
 * Choose the key type selected when the Try Out console loads an application's keys.
 * The configured default is used when that key exists. Otherwise an available key type is used.
 * When neither key exists, the configured default is kept.
 * @param {Map} productionKeys production keys keyed by key manager
 * @param {Map} sandboxKeys sandbox keys keyed by key manager
 * @param {string} keyManager selected key manager name
 * @param {string} [preferredKeyType] configured default key type
 * @returns {{keyType: string, keys: Map, accessToken: string|undefined}} resolved selection
 */
export function resolveConsoleKeyType(productionKeys, sandboxKeys, keyManager, preferredKeyType) {
    const preferred = normalizeKeyType(preferredKeyType) || getDefaultKeyType();
    const productionKey = productionKeys && typeof productionKeys.get === 'function'
        ? productionKeys.get(keyManager) : undefined;
    const sandboxKey = sandboxKeys && typeof sandboxKeys.get === 'function'
        ? sandboxKeys.get(keyManager) : undefined;

    let keyType = preferred;
    if (preferred === PRODUCTION && !productionKey && sandboxKey) {
        keyType = SANDBOX;
    } else if (preferred === SANDBOX && !sandboxKey && productionKey) {
        keyType = PRODUCTION;
    }

    const selectedKey = keyType === PRODUCTION ? productionKey : sandboxKey;
    const keys = keyType === PRODUCTION ? (productionKeys || new Map()) : (sandboxKeys || new Map());
    let accessToken;
    if (selectedKey && selectedKey.token) {
        ({ accessToken } = selectedKey.token);
    }
    return { keyType, keys, accessToken };
}
