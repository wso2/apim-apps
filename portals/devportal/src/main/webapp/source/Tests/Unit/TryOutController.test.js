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

import { getBasicAuthPasswordInputType } from 'AppComponents/Shared/ApiTryOut/TryOutController';

describe('TryOutController basic auth password masking (product-apim#8988)', () => {
    it('masks password input by default', () => {
        expect(getBasicAuthPasswordInputType(false)).toBe('password');
    });

    it('allows revealing the password when the visibility toggle is enabled', () => {
        expect(getBasicAuthPasswordInputType(true)).toBe('text');
    });
});
