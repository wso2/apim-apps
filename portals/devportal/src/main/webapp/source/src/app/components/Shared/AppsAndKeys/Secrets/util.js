// util.js
/**
 * Utility functions for Key Manager configurations
 */

/**
 * Reads the client secret count from additional properties
 * only if multiple client secrets are enabled.
 *
 * @param {Object} additionalProps - The additionalProperties object from Key Manager config
 * @returns {number} - Number of allowed client secrets, Infinity if not specified but enabled, 0 if disabled
 */
export function getClientSecretCount(additionalProps) {
    if (!additionalProps) return 0;

    const multipleSecretsEnabled = additionalProps["enable_multiple_client_secrets"];
    if (multipleSecretsEnabled === "true") {
        const countStr = additionalProps["client_secret_count"];
        if (!countStr) {
            // Default to unlimited
            return Infinity;
        }
        return parseInt(countStr, 10);
    }
    return 0;
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
