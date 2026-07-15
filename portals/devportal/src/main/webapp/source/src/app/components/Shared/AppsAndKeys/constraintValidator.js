/*
 * Copyright (c) 2026, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
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

import { isEmpty } from 'lodash';

/**
 * Validates a value against a constraint object from the application configuration.
 *
 * Supported constraint types:
 *   MIN  - value.min (minimum allowed value)
 *   MAX  - value.max (maximum allowed value)
 *   RANGE      - value.min & value.max (both bounds)
 *   ENUM       - value.allowed (array of allowed values)
 *   REGEX      - value.pattern (regex pattern the value must match)
 *
 * @param {any} inputValue - The value entered by the user.
 * @param {object|null|undefined} constraint - The constraint object from config.
 * @param {object} intl - The intl object for formatMessage.
 * @param {object} messages - The defineMessages object containing error message definitions.
 * @returns {{ valid: boolean, message: string }} Validation result.
 */
export const VALIDATOR_TYPES = {
    MIN: 'MIN',
    MAX: 'MAX',
    RANGE: 'RANGE',
    ENUM: 'ENUM',
    REGEX: 'REGEX',
};

/**
 * Returns a localized hint string for a constraint.
 * @param {object|null|undefined} constraint - The constraint object from config.
 * @param {object} intl - The intl object for formatMessage.
 * @param {object} messages - The defineMessages object containing hint message definitions.
 * @returns {string} Formatted hint string.
 */
export const getConstraintHint = (constraint, intl, messages) => {
    if (!constraint || !constraint.type || isEmpty(constraint.value) || !intl || !messages) {
        return '';
    }

    const { type, value } = constraint;
    switch (type) {
        case VALIDATOR_TYPES.MIN:
            return intl.formatMessage(messages.rangeMin, { min: value.min });

        case VALIDATOR_TYPES.MAX:
            return intl.formatMessage(messages.rangeMax, { max: value.max });

        case VALIDATOR_TYPES.RANGE: {
            const { min, max } = value || {};
            return intl.formatMessage(messages.rangeInvalid, { min, max });
        }
        case VALIDATOR_TYPES.REGEX:
            return intl.formatMessage(messages.regexInvalid, { pattern: value.pattern });

        default:
            return '';
    }
};

const validateConstraint = (inputValue, constraint, intl, messages) => {
    // no constraint, skip validation
    if (!constraint || !constraint.type) {
        return { valid: true, message: '' };
    }

    const { type, value } = constraint;

    switch (type) {
        case VALIDATOR_TYPES.MIN: {
            const { min } = value || {};
            const numericInput = Number(inputValue);
            if (inputValue.trim() === '' || Number.isNaN(numericInput) || numericInput < min) {
                return {
                    valid: false,
                    message: intl && messages
                        ? intl.formatMessage(messages.rangeMin, { min })
                        : `Value must be at least ${min}`,
                };
            }
            return { valid: true, message: '' };
        }

        case VALIDATOR_TYPES.MAX: {
            const { max } = value || {};
            const numericInput = Number(inputValue);
            if (inputValue.trim() === '' || Number.isNaN(numericInput) || numericInput > max) {
                return {
                    valid: false,
                    message: intl && messages
                        ? intl.formatMessage(messages.rangeMax, { max })
                        : `Value must be at most ${max}`,
                };
            }
            return { valid: true, message: '' };
        }

        case VALIDATOR_TYPES.RANGE: {
            const { min, max } = value || {};
            const numericInput = Number(inputValue);
            if (inputValue.trim() === '' || Number.isNaN(numericInput)
                || (min !== undefined && numericInput < min)
                || (max !== undefined && numericInput > max)) {
                return {
                    valid: false,
                    message: intl && messages
                        ? intl.formatMessage(messages.rangeInvalid, { min, max })
                        : `Value must be a number between ${min} and ${max}`,
                };
            }
            return { valid: true, message: '' };
        }

        case VALIDATOR_TYPES.REGEX: {
            const { pattern } = value || {};
            try {
                const regex = new RegExp(pattern);
                if (!regex.test(inputValue)) {
                    return {
                        valid: false,
                        message: intl && messages
                            ? intl.formatMessage(messages.regexInvalid, { pattern })
                            : `Value must match the required pattern: ${pattern}`,
                    };
                }
            } catch (e) {
                // If the regex itself is invalid, skip validation
                return { valid: true, message: '' };
            }
            return { valid: true, message: '' };
        }
        default:
            return { valid: true, message: '' };
    }
};

export default validateConstraint;

/*
 * Validators for the API Key Security Restriction inputs (permittedIP / permittedReferer).
 *
 * The gateway treats both values as comma separated lists
 * (org.wso2.carbon.apimgt.gateway.utils.ApiKeyAuthenticatorUtils#validateAPIKeyRestrictions):
 *   - Each permittedIP entry is matched via APIUtil.isIpInNetwork, which accepts plain
 *     IPv4/IPv6 addresses as well as CIDR notation (e.g. 10.0.0.0/24).
 *   - Each permittedReferer entry is matched literally against the Referer header,
 *     with '*' acting as a wildcard (e.g. https://example.com/*).
 *
 * The IPv4/IPv6 patterns below are the same patterns used by the Admin Portal
 * (Throttling/Blacklist/AddEdit.jsx) so that both portals accept identical formats.
 */

const IPV4_PATTERN = '(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}'
    + '([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])';
const IPV6_PATTERN = '(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:)'
    + '{1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}'
    + '(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}'
    + '(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)'
    + '|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,'
    + '1}[0-9]){0,1}[0-9])\\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:('
    + '(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))';

const IPV4_REGEX = new RegExp(`^${IPV4_PATTERN}$`);
const IPV6_REGEX = new RegExp(`^${IPV6_PATTERN}$`);
const IPV4_CIDR_REGEX = new RegExp(`^${IPV4_PATTERN}/([0-9]|[12][0-9]|3[0-2])$`);
const IPV6_CIDR_REGEX = new RegExp(`^${IPV6_PATTERN}/([0-9]|[1-9][0-9]|1[01][0-9]|12[0-8])$`);

/**
 * Validates the value entered for an IP based API key restriction.
 * Accepts a single entry or a comma separated list, where each entry is a valid
 * IPv4 address, IPv6 address, or a CIDR range of either family.
 *
 * @param {string} value - The raw user input.
 * @returns {boolean} true if every entry is a valid IP address or CIDR range.
 */
export const isValidPermittedIPList = (value) => {
    if (!value || !value.trim()) {
        return false;
    }
    return value.split(',').every((entry) => {
        const ip = entry.trim();
        return ip !== ''
            && (IPV4_REGEX.test(ip)
                || IPV6_REGEX.test(ip)
                || IPV4_CIDR_REGEX.test(ip)
                || IPV6_CIDR_REGEX.test(ip));
    });
};

/**
 * Validates the value entered for a referrer based API key restriction.
 * Accepts a single entry or a comma separated list. The gateway matches each entry
 * literally (with '*' wildcards) against the Referer header, so entries are kept
 * permissive: each one must be non empty, contain no whitespace, and look like a
 * URL, host or wildcard pattern (contain at least one of '.', ':', '/' or '*').
 *
 * @param {string} value - The raw user input.
 * @returns {boolean} true if every entry is a plausible referrer pattern.
 */
export const isValidPermittedRefererList = (value) => {
    if (!value || !value.trim()) {
        return false;
    }
    return value.split(',').every((entry) => {
        const referer = entry.trim();
        return referer !== ''
            && !/\s/.test(referer)
            && /[.:/*]/.test(referer);
    });
};