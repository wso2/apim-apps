/*
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import Joi from '@hapi/joi';
import API from 'AppData/api';
import queryString from 'query-string';

/**
 * Get the base error message for error types.
 * This error overrides the default error messages of joi and adds simple error messages.
 *
 * @param {string} errorType The joi error type
 * @return {string} simplified error message.
 * */
function getMessage(errorType, maxLength) {
    switch (errorType) {
        case 'string.empty':
            return 'should not be empty';
        case 'string.pattern.base':
            return 'should not contain spaces or special characters';
        case 'string.max':
            return 'has exceeded the maximum number of ' + maxLength + ' characters';
        default:
            return 'should not be empty';
    }
}

/*
* eslint validation rule for no-unused-vars has been disabled in this component.
* According to the Joi extension, it is required to provide required four input
* arguments to custom Joi schema validate function.
* Ref: https://hapi.dev/family/joi/?v=15.1.1#extendextension
*/
const roleSchema = Joi.extend((joi) => ({
    type: 'systemRole',
    base: joi.string(),
    rules: {
        role: {
            validate(params, helpers, args, options) { // eslint-disable-line no-unused-vars
                const api = new API();
                return api.validateSystemRole(params);
            },
        }
    }
}));

const scopeSchema = Joi.extend((joi) => ({
    type: 'scopes',
    base: joi.string(),
    rules: {
        scope: {
            validate(params, helpers, args, options) { // eslint-disable-line no-unused-vars
                const api = new API();
                return api.validateScopeName(params);
            }
        }
    },

}));

const userRoleSchema = Joi.extend((joi) => ({
    type: 'userRole',
    base: joi.string(),
    rules:
    {
        role: {
            validate(params, helpers, args, options) { // eslint-disable-line no-unused-vars
                const api = new API();
                return api.validateUSerRole(params);
            }
        }
    },

}));

const apiSchema = Joi.extend((joi) => ({
    type: 'api',
    base: joi.string(),
    rules:
    {
        isAPIParameterExist: {
            validate(params, helpers, args, options) { // eslint-disable-line no-unused-vars
                const inputValue = params.trim().toLowerCase();
                const composeQuery = '?query=' + inputValue;
                const composeQueryJSON = queryString.parse(composeQuery);
                composeQueryJSON.limit = 10;
                composeQueryJSON.offset = 0;
                return API.search(composeQueryJSON);
            }
        }
    },
}));

const documentSchema = Joi.extend((joi) => ({
    type: 'document',
    base: joi.object(),
    rules:
    {
        isDocumentPresent: {
            validate(params, helpers, args, options) { // eslint-disable-line no-unused-vars
                const api = new API();
                return api.validateDocumentExists(params.id, params.name);
            }
        }
    },

}));

const definition = {
    apiName: Joi.string().max(50).pattern(new RegExp(/^[^~!@#;:%^*()+={}|\\<>"',&$\s+[\]/]*$/)).required()
        .error((errors) => {
            const allErrors = errors.map(error => 'API Name ' + getMessage(error.code, 50)).join(', ');
            return new Error(allErrors);
        }),
    apiVersion: Joi.string().pattern(new RegExp(/^[^~!@#;:%^*()+={}|\\<>"',&/$[\]\s]+$/)).required()
        .error((errors) => {
            const allErrors = errors.map(error => 'Document name ' + getMessage(error.code)).join(', ');
            return new Error(allErrors);
        }),
    apiContext: Joi.string().max(200)
        .pattern(new RegExp(/(?!.*\/t\/.*|.*\/t$)^[^~!@#:%^&*+=|\\<>"',&\s[\]]*$/)).required()
        .error((errors) => {
            const allErrors = errors.map(error => 'Context ' + getMessage(error.code, 200)).join(', ');
            return new Error(allErrors);
        }),
    gatewayVendor: Joi.string().max(50).pattern(new RegExp(/^[^~!@#;:%^*()+={}|\\<>"',&$\s+[\]/]*$/)).required()
        .error((errors) => {
            const allErrors = errors.map(error => 'Name ' + getMessage(error.code, 50)).join(', ');
            return new Error(allErrors);
        }),
    documentName: Joi.string().max(50).pattern(new RegExp('^[^~!@#;:%^*()+={}|\\<>"\',&$\\s+[\\]/]*$')).required()
        .error((errors) => {
            const allErrors = errors.map(error => 'Document name ' + getMessage(error.code, 50)).join(', ');
            return new Error(allErrors);
        }),
    authorizationHeader: Joi.string().pattern(new RegExp(/^[^~!@#;:%^*()+={}|\\<>"',&$\s+]*$/)).required()
        .error((errors) => {
            const allErrors = errors.map(error => 'Authorization Header ' + getMessage(error.code)).join(', ');
            return new Error(allErrors);
        }),
    role: roleSchema.systemRole().role(),
    scope: scopeSchema.scopes().scope(),
    url: Joi.string().uri({ scheme: ['http', 'https'] })
        .error((errors) => {
            const allErrors = errors.map(error => 'URL ' + getMessage(error.code)).join(', ');
            return new Error(allErrors);
        }),
    wsUrl: Joi.string().uri({ scheme: ['ws', 'wss'] })
        .error((errors) => {
            const allErrors = errors.map(error =>
                error.code === 'string.uriCustomScheme' ? 'Invalid WebSocket URL'
                    : 'WebSocket URL ' + getMessage(error.code)).join(', ');
            return new Error(allErrors);
        }),
    alias: Joi.string().max(30).pattern(new RegExp(/^[^~!@#;:%^*()+={}|\\<>"',&$\s+[\]/]*$/)).required()
        .error((errors) => {
            const allErrors = errors.map(error => 'Alias ' + getMessage(error.code, 30)).join(', ');
            return new Error(allErrors);
        }),
    userRole: userRoleSchema.userRole().role(),
    apiParameter: apiSchema.api().isAPIParameterExist(),
    apiDocument: documentSchema.document().isDocumentPresent(),
    operationVerbs: Joi.array().items(Joi.string()).min(1).unique(),
    operationTarget: Joi.string().required(),
    websubOperationTarget: Joi.string().regex(/^[^{}]*$/).required(),
    name: Joi.string().min(1).max(255),
    email: Joi.string().email({ tlds: { allow: false } }).required(),
};

export default definition;
