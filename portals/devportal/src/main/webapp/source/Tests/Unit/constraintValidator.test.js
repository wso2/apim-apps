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

import validateConstraint, { VALIDATOR_TYPES, getConstraintHint } from 'AppComponents/Shared/AppsAndKeys/constraintValidator';

const mockIntl = {
    formatMessage: (msg, values) => {
        let { defaultMessage } = msg;
        if (values) {
            Object.keys(values).forEach((key) => {
                defaultMessage = defaultMessage.replace(`{${key}}`, values[key]);
            });
        }
        return defaultMessage;
    },
};
const mockMessages = {
    rangeMin: { defaultMessage: 'Value must be at least {min}' },
    rangeMax: { defaultMessage: 'Value must be at most {max}' },
    rangeInvalid: { defaultMessage: 'Value must be a number between {min} and {max}' },
    regexInvalid: { defaultMessage: 'Value must match the required pattern: {pattern}' },
};

describe('constraintValidator', () => {
    describe('validateConstraint', () => {
        describe('MIN validation', () => {
            const constraint = {
                type: VALIDATOR_TYPES.MIN,
                value: { min: 10 },
            };

            it('should return valid for value greater than min', () => {
                const result = validateConstraint('15', constraint, mockIntl, mockMessages);
                expect(result.valid).toBe(true);
            });

            it('should return valid for value equal to min', () => {
                const result = validateConstraint('10', constraint, mockIntl, mockMessages);
                expect(result.valid).toBe(true);
            });

            it('should return invalid for value less than min', () => {
                const result = validateConstraint('5', constraint, mockIntl, mockMessages);
                expect(result.valid).toBe(false);
                expect(result.message).toBe('Value must be at least 10');
            });

            it('should return invalid for non-numeric value', () => {
                const result = validateConstraint('abc', constraint, mockIntl, mockMessages);
                expect(result.valid).toBe(false);
            });

            it('should return invalid for empty value', () => {
                const result = validateConstraint('', constraint, mockIntl, mockMessages);
                expect(result.valid).toBe(false);
            });

            it('should handle negative numbers correctly', () => {
                const negConstraint = { type: VALIDATOR_TYPES.MIN, value: { min: -5 } };
                expect(validateConstraint('-3', negConstraint, mockIntl, mockMessages).valid).toBe(true);
                expect(validateConstraint('-10', negConstraint, mockIntl, mockMessages).valid).toBe(false);
            });

            it('should handle decimal numbers correctly', () => {
                const decConstraint = { type: VALIDATOR_TYPES.MIN, value: { min: 5.5 } };
                expect(validateConstraint('5.6', decConstraint, mockIntl, mockMessages).valid).toBe(true);
                expect(validateConstraint('5.4', decConstraint, mockIntl, mockMessages).valid).toBe(false);
            });
        });

        describe('MAX validation', () => {
            const constraint = {
                type: VALIDATOR_TYPES.MAX,
                value: { max: 100 },
            };

            it('should return valid for value less than max', () => {
                const result = validateConstraint('50', constraint, mockIntl, mockMessages);
                expect(result.valid).toBe(true);
            });

            it('should return valid for value equal to max', () => {
                const result = validateConstraint('100', constraint, mockIntl, mockMessages);
                expect(result.valid).toBe(true);
            });

            it('should return invalid for value greater than max', () => {
                const result = validateConstraint('150', constraint, mockIntl, mockMessages);
                expect(result.valid).toBe(false);
                expect(result.message).toBe('Value must be at most 100');
            });

            it('should handle zero correctly', () => {
                const zeroConstraint = { type: VALIDATOR_TYPES.MAX, value: { max: 0 } };
                expect(validateConstraint('-1', zeroConstraint, mockIntl, mockMessages).valid).toBe(true);
                expect(validateConstraint('0', zeroConstraint, mockIntl, mockMessages).valid).toBe(true);
                expect(validateConstraint('1', zeroConstraint, mockIntl, mockMessages).valid).toBe(false);
            });
        });

        describe('RANGE validation', () => {
            const constraint = {
                type: VALIDATOR_TYPES.RANGE,
                value: { min: 10, max: 20 },
            };

            it('should return valid for value within range', () => {
                const result = validateConstraint('15', constraint, mockIntl, mockMessages);
                expect(result.valid).toBe(true);
            });

            it('should return valid for value at min bound', () => {
                const result = validateConstraint('10', constraint, mockIntl, mockMessages);
                expect(result.valid).toBe(true);
            });

            it('should return valid for value at max bound', () => {
                const result = validateConstraint('20', constraint, mockIntl, mockMessages);
                expect(result.valid).toBe(true);
            });

            it('should return invalid for value below min', () => {
                const result = validateConstraint('5', constraint, mockIntl, mockMessages);
                expect(result.valid).toBe(false);
                expect(result.message).toBe('Value must be a number between 10 and 20');
            });

            it('should return invalid for value above max', () => {
                const result = validateConstraint('25', constraint, mockIntl, mockMessages);
                expect(result.valid).toBe(false);
                expect(result.message).toBe('Value must be a number between 10 and 20');
            });

            it('should return invalid for non-numeric value', () => {
                const result = validateConstraint('abc', constraint, mockIntl, mockMessages);
                expect(result.valid).toBe(false);
            });
        });

        describe('REGEX validation', () => {
            const constraint = {
                type: VALIDATOR_TYPES.REGEX,
                value: { pattern: '^[0-9]+$' },
            };

            it('should return valid for matching value', () => {
                const result = validateConstraint('123', constraint, mockIntl, mockMessages);
                expect(result.valid).toBe(true);
            });

            it('should return invalid for non-matching value', () => {
                const result = validateConstraint('abc', constraint, mockIntl, mockMessages);
                expect(result.valid).toBe(false);
                expect(result.message).toBe('Value must match the required pattern: ^[0-9]+$');
            });

            it('should return valid if regex pattern is invalid (to prevent app crash)', () => {
                const badConstraint = { type: VALIDATOR_TYPES.REGEX, value: { pattern: '[' } };
                const result = validateConstraint('any', badConstraint, mockIntl, mockMessages);
                expect(result.valid).toBe(true);
            });
        });

        describe('Edge Cases', () => {
            it('should return valid if no constraint is provided', () => {
                const result = validateConstraint('val', null, mockIntl, mockMessages);
                expect(result.valid).toBe(true);
            });

            it('should return valid if constraint type is unknown', () => {
                const result = validateConstraint('val', { type: 'UNKNOWN' }, mockIntl, mockMessages);
                expect(result.valid).toBe(true);
            });
        });
    });

    describe('getConstraintHint', () => {
        it('should return empty string for missing arguments', () => {
            expect(getConstraintHint(null, mockIntl, mockMessages)).toBe('');
            expect(getConstraintHint({}, mockIntl, mockMessages)).toBe('');
        });

        it('should return correct hint for MIN', () => {
            const constraint = { type: VALIDATOR_TYPES.MIN, value: { min: 5 } };
            expect(getConstraintHint(constraint, mockIntl, mockMessages)).toBe('Value must be at least 5');
        });

        it('should return correct hint for MAX', () => {
            const constraint = { type: VALIDATOR_TYPES.MAX, value: { max: 50 } };
            expect(getConstraintHint(constraint, mockIntl, mockMessages)).toBe('Value must be at most 50');
        });

        it('should return correct hint for RANGE', () => {
            const constraint = { type: VALIDATOR_TYPES.RANGE, value: { min: 5, max: 10 } };
            expect(getConstraintHint(constraint, mockIntl, mockMessages)).toBe('Value must be a number between 5 and 10');
        });

        it('should return correct hint for REGEX', () => {
            const constraint = { type: VALIDATOR_TYPES.REGEX, value: { pattern: '.*' } };
            expect(getConstraintHint(constraint, mockIntl, mockMessages)).toBe('Value must match the required pattern: .*');
        });

        it('should return empty string for unknown type', () => {
            const constraint = { type: 'UNKNOWN', value: { some: 'val' } };
            expect(getConstraintHint(constraint, mockIntl, mockMessages)).toBe('');
        });
    });
});