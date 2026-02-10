/*
 * Copyright (c) 2026, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

/**
 * Validates a value against a constraint object from the application configuration.
 *
 * Supported constraint types:
 *   RANGE_MIN  - value.min (minimum allowed value)
 *   RANGE_MAX  - value.max (maximum allowed value)
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
const VALIDATOR_TYPES = {
    RANGE_MIN: 'RANGE_MIN',
    RANGE_MAX: 'RANGE_MAX',
    RANGE: 'RANGE',
    ENUM: 'ENUM',
    REGEX: 'REGEX',
};
const validateConstraint = (inputValue, constraint, intl, messages) => {
    // no constraint, skip validation
    if (!constraint || !constraint.type) {
        return { valid: true, message: '' };
    }

    const { type, value } = constraint;

    switch (type) {
        case VALIDATOR_TYPES.RANGE_MIN: {
            const { min } = value || {};
            const numericInput = Number(inputValue);
            if (Number.isNaN(numericInput) || numericInput < min) {
                return {
                    valid: false,
                    message: intl && messages
                        ? intl.formatMessage(messages.rangeMin, { min })
                        : `Value must be at least ${min}`,
                };
            }
            return { valid: true, message: '' };
        }

        case VALIDATOR_TYPES.RANGE_MAX: {
            const { max } = value || {};
            const numericInput = Number(inputValue);
            if (Number.isNaN(numericInput) || numericInput > max) {
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
            if (Number.isNaN(numericInput)) {
                return {
                    valid: false,
                    message: intl && messages
                        ? intl.formatMessage(messages.rangeInvalid, { min, max })
                        : `Value must be a number between ${min} and ${max}`,
                };
            }
            if (min != null && numericInput < min) {
                return {
                    valid: false,
                    message: intl && messages
                        ? intl.formatMessage(messages.rangeMinInRange, { min, max })
                        : `Value must be at least ${min} (allowed range: ${min} - ${max})`,
                };
            }
            if (max != null && numericInput > max) {
                return {
                    valid: false,
                    message: intl && messages
                        ? intl.formatMessage(messages.rangeMaxInRange, { min, max })
                        : `Value must be at most ${max} (allowed range: ${min} - ${max})`,
                };
            }
            return { valid: true, message: '' };
        }

        case VALIDATOR_TYPES.ENUM: {
            const { allowed } = value || {};
            // Handle both single values and arrays (for multi-select)
            if (Array.isArray(inputValue)) {
                // For multi-select, check if all selected values are in the allowed list
                const invalidValues = inputValue.filter((val) => !allowed.includes(val));
                if (invalidValues.length > 0) {
                    return {
                        valid: false,
                        message: intl && messages
                            ? intl.formatMessage(messages.enumInvalid, { allowed: allowed.join(', ') })
                            : `Values must be from: ${allowed.join(', ')}. Invalid: ${invalidValues.join(', ')}`,
                    };
                }
            } else if (!allowed.includes(inputValue)) {
                return {
                    valid: false,
                    message: intl && messages
                        ? intl.formatMessage(messages.enumInvalid, { allowed: allowed.join(', ') })
                        : `Value must be one of: ${allowed.join(', ')}`,
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
                            : `Value does not match the required pattern: ${pattern}`,
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
