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

import {
  mapAPIOperations,
  getTaggedOperations,
  getAPIProductTaggedOperations,
  extractPathParameters,
  getOperationScopes,
  isSelectAll,
} from '../../src/app/components/Apis/Details/Resources/operationUtils';

const OAS_3 = { openapi: '3.0.0' };
const OAS_31 = { openapi: '3.1.0' };
const SWAGGER_2 = { swagger: '2.0' };

/**
 * Path parameters are generated differently for OpenAPI 3.x and Swagger 2.0.
 * These tests make sure each format stays correct.
 */
describe('extractPathParameters', () => {
  test('should nest the type under `schema` for OpenAPI 3.0 definitions', () => {
    expect(extractPathParameters('/shops/{shopId}/orders/{orderId}', OAS_3)).toEqual([
      { name: 'shopId', in: 'path', required: true, schema: { type: 'string', format: 'string' } },
      { name: 'orderId', in: 'path', required: true, schema: { type: 'string', format: 'string' } },
    ]);
  });

  test('should nest the type under `schema` for OpenAPI 3.1 definitions', () => {
    expect(extractPathParameters('/orders/{orderId}', OAS_31)).toEqual([
      { name: 'orderId', in: 'path', required: true, schema: { type: 'string', format: 'string' } },
    ]);
  });

  test('should declare the type inline for Swagger 2.0 definitions', () => {
    expect(extractPathParameters('/orders/{orderId}', SWAGGER_2)).toEqual([
      { name: 'orderId', in: 'path', required: true, type: 'string', format: 'string' },
    ]);
  });

  test('should return an empty array when the URI template declares no parameters', () => {
    expect(extractPathParameters('/orders', OAS_3)).toEqual([]);
  });

  test('should return an empty array when the definition version is not recognised', () => {
    expect(extractPathParameters('/orders/{orderId}', {})).toEqual([]);
  });
});

/**
 * Operation scopes can come from the `default` security scheme or the legacy `x-scope` field. Both should be supported.
 */
describe('getOperationScopes', () => {
  test('should return the scopes of the `default` security scheme', () => {
    const operation = { security: [{ default: ['order_read', 'order_write'] }] };
    expect(getOperationScopes(operation, OAS_3)).toEqual(['order_read', 'order_write']);
    expect(getOperationScopes(operation, SWAGGER_2)).toEqual(['order_read', 'order_write']);
  });

  test('should fall back to the `x-scope` extension wrapped in an array', () => {
    expect(getOperationScopes({ 'x-scope': 'order_read' }, OAS_3)).toEqual(['order_read']);
  });

  test('should return an empty array when no `default` scheme or `x-scope` is present', () => {
    expect(getOperationScopes({ security: [{ oauth2: ['order_read'] }] }, OAS_3)).toEqual([]);
    expect(getOperationScopes({}, OAS_3)).toEqual([]);
  });

  test('should return an empty array when the definition version is not recognised', () => {
    expect(getOperationScopes({ security: [{ default: ['order_read'] }] }, {})).toEqual([]);
  });
});

/**
 * Converts the API operation list into a Swagger/OpenAPI `paths` object.
 */
describe('mapAPIOperations', () => {
  test('should key operations by target then verb, dropping both from the payload', () => {
    const operations = [{
      target: '/orders',
      verb: 'GET',
      authType: 'Application & Application User',
      throttlingPolicy: 'Unlimited',
    }];
    expect(mapAPIOperations(operations)).toEqual({
      '/orders': { GET: { authType: 'Application & Application User', throttlingPolicy: 'Unlimited' } },
    });
  });

  test('should merge multiple verbs that share the same target', () => {
    const operations = [
      { target: '/orders', verb: 'GET' },
      { target: '/orders', verb: 'POST' },
      { target: '/orders/{orderId}', verb: 'DELETE' },
    ];
    const mapped = mapAPIOperations(operations);
    expect(Object.keys(mapped['/orders'])).toEqual(['GET', 'POST']);
    expect(Object.keys(mapped['/orders/{orderId}'])).toEqual(['DELETE']);
  });
});

/**
 * Checks whether every operation is selected, not just every path.
 */
describe('isSelectAll', () => {
  const operations = {
    '/orders': { get: {}, post: {} },
    '/orders/{orderId}': { delete: {} },
  };

  test('should return true when every verb of every path is selected', () => {
    expect(isSelectAll(operations, operations)).toBe(true);
  });

  test('should return false when a path is only partially selected', () => {
    const selected = { '/orders': { get: {} }, '/orders/{orderId}': { delete: {} } };
    expect(isSelectAll(selected, operations)).toBe(false);
  });

  test('should return false when a path is not selected at all', () => {
    expect(isSelectAll({ '/orders': { get: {}, post: {} } }, operations)).toBe(false);
  });
});

/**
 * Groups operations by their OpenAPI tags.
 * Operations missing from the definition should be ignored.
 */
describe('getTaggedOperations', () => {
  const openAPI = {
    paths: {
      '/orders': { get: { operationId: 'getOrders', tags: ['Orders'] } },
      '/menu': { get: { operationId: 'getMenu' } },
    },
  };

  test('should group operations by the tags declared in the definition', () => {
    const api = { isAPIProduct: () => false, operations: [{ target: '/orders', verb: 'GET' }] };
    const tagged = getTaggedOperations(api, openAPI);
    expect(tagged.Orders).toEqual([{
      spec: { operationId: 'getOrders', tags: ['Orders'] },
      target: '/orders',
      verb: 'GET',
    }]);
    expect(tagged.Default).toEqual([]);
  });

  test('should place untagged operations under the `Default` tag', () => {
    const api = { isAPIProduct: () => false, operations: [{ target: '/menu', verb: 'GET' }] };
    expect(getTaggedOperations(api, openAPI).Default).toHaveLength(1);
  });

  test('should skip operations that are absent from the definition instead of throwing', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => { });
    const api = { isAPIProduct: () => false, operations: [{ target: '/unknown', verb: 'GET' }] };
    expect(getTaggedOperations(api, openAPI)).toEqual({ Default: [] });
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  test('should delegate to the API product grouping when the artifact is an API product', () => {
    const apiProduct = {
      isAPIProduct: () => true,
      apis: [{ name: 'OrderAPI', operations: [{ target: '/orders', verb: 'GET' }] }],
    };
    expect(getTaggedOperations(apiProduct, openAPI).OrderAPI).toHaveLength(1);
  });
});

/**
 * API products group by dependent API name rather than by tag.
 */
describe('getAPIProductTaggedOperations', () => {
  const openAPI = {
    paths: {
      '/orders': { get: { operationId: 'getOrders' } },
      '/menu': { get: { operationId: 'getMenu' } },
    },
  };

  test('should group operations under the name of each dependent API', () => {
    const apiProduct = {
      apis: [
        { name: 'PizzaShackAPI', operations: [{ target: '/menu', verb: 'GET' }] },
        { name: 'OrderAPI', operations: [{ target: '/orders', verb: 'GET' }] },
      ],
    };
    const tagged = getAPIProductTaggedOperations(apiProduct, openAPI);
    expect(tagged.PizzaShackAPI).toEqual([{ spec: { operationId: 'getMenu' }, target: '/menu', verb: 'GET' }]);
    expect(tagged.OrderAPI).toHaveLength(1);
  });

  test('should skip operations that are absent from the definition instead of throwing', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => { });
    const apiProduct = {
      apis: [{
        name: 'PizzaShackAPI',
        operations: [{ target: '/menu', verb: 'GET' }, { target: '/unknown', verb: 'GET' }],
      }],
    };
    const tagged = getAPIProductTaggedOperations(apiProduct, openAPI);
    expect(tagged.PizzaShackAPI).toHaveLength(1);
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });
});