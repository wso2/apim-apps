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
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

/**
 * Utility functions for client secret related operations
 */

/**
 * Reads the client secret count from additional properties
 * only if multiple client secrets are enabled.
 *
 * @param {Object} additionalProps - The additionalProperties object from Key Manager config
 * @returns {number} - Number of allowed client secrets, -1 if unlimited, 1 if disabled
 */
export function getClientSecretCount(additionalProps) {
    if (!additionalProps) return 1;

    const multipleSecretsEnabled = isMultipleClientSecretsEnabled(additionalProps);
    if (multipleSecretsEnabled) {
        const countStr = additionalProps["client_secret_count"];
        if (!countStr) {
            // Default to unlimited
            return -1;
        }
        const count = parseInt(countStr, 10);
        return Number.isNaN(count) ? -1 : count;
    }
    return 1;
}

/**
 * Checks if multiple client secrets are enabled
 *
 * @param {Object} additionalProps - The additionalProperties object
 * @returns {boolean}
 */
export function isMultipleClientSecretsEnabled(additionalProps) {
    return additionalProps?.["enable_multiple_client_secrets"] === "true";
}

/**
 * Mask a secret value depending on whether hashing is enabled.
 * Always returns a 16-character masked string for consistency.
 *
 * @param {string} secret - The actual secret value.
 * @param {boolean} hashEnabled - Whether secret hashing is enabled.
 * @returns {string} - Masked secret for display.
 */
export function maskSecret(secret, hashEnabled) {
    const MASK_LENGTH = 16;

    // If no secret or hash is enabled → fully masked
    if (!secret || hashEnabled) {
        return "*".repeat(MASK_LENGTH);
    }

    // Show first 3 characters, mask the rest to make total length = 16
    const visibleChars = 3;
    const maskedPartLength = Math.max(MASK_LENGTH - visibleChars, 0);

    return secret.slice(0, visibleChars) + "*".repeat(maskedPartLength);
}
