/*
 * Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com) All Rights Reserved.
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

import getValidationErrorsFromError from './validationErrorUtils';

const TITLE = 'Error while validating OpenAPI definition';

describe('getValidationErrorsFromError', () => {
    it('surfaces the backend description from a rejected validation (e.g. an access-control block, HTTP 400 "not trusted")', () => {
        const notTrusted = 'The provided URL is not trusted. Please contact the system administrator.';
        const error = {
            response: { body: { code: 400, message: 'Bad Request', description: notTrusted } },
        };

        expect(getValidationErrorsFromError(error, TITLE)).toEqual([
            { message: TITLE, description: notTrusted },
        ]);
    });

    it('returns [] without a backend description (network/other errors keep the generic fallback)', () => {
        const noDescriptionCases = [
            new Error('Network Error'),
            { response: { body: {} } },
            { response: {} },
            undefined,
        ];
        noDescriptionCases.forEach((error) => {
            expect(getValidationErrorsFromError(error, TITLE)).toEqual([]);
        });
    });
});
