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
