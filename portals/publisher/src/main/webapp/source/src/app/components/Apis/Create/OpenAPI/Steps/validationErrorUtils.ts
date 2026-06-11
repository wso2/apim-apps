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

/**
 * Build "Validation Errors" card entries from a rejected OpenAPI validation request.
 *
 * When validate-openapi returns 200 with `isValid:false`, its `errors` array is shown in the
 * card directly. But when it *rejects* with an HTTP error (e.g. an SSRF block — 400
 * UNTRUSTED_URL, "The provided URL is not trusted."), the reason lives in
 * `error.response.body.description` and was previously dropped to the console, leaving the
 * card empty and the user with only a generic "validation failed" message.
 *
 * This surfaces that backend description as a card entry so a rejected validation is shown as
 * prominently as the `isValid:false` path. Errors without a backend description (network
 * failures, etc.) return `[]`, so callers keep their existing generic-message fallback.
 *
 * @param {any} error caught error from a validateOpenAPIByFile / validateOpenAPIByUrl call
 * @param {string} title localized bold title shown above the backend description
 * @returns {Array<{message: string, description: string}>} card entries (empty when there is
 *  no backend-provided description)
 */
export default function getValidationErrorsFromError(
    error: any,
    title: string,
): Array<{ message: string; description: string }> {
    const description = error?.response?.body?.description;
    if (!description) {
        return [];
    }
    return [{ message: title, description }];
}
