/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import { rest } from 'msw';
import { Context, OpenAPIBackend, Request } from 'openapi-backend';
import { setupServer } from 'msw/node';
import { searchParamsToRequestQuery } from './TestingLibrary';
import { APIName } from './constants';

// Declaring the global BallerinaCentral variable set from src/setupTests.ts file
declare global {
  const openApiBackends: {
    [key: string]: { context: string; oasBackend: OpenAPIBackend };
  };
}

type APIResponseOverride = (
  requestContext: Context,
  mock: any,
  status: number,
  response: (status: any, mock: any) => void,
  context: { status: (s: number) => void; json: (s: string) => void }
) => { mock: any; status?: number };
export const { onResponse, getOverride, resetMockHandler } = (() => {
  const defaultHandler: APIResponseOverride = (c, mock, status) => ({
    mock,
    status,
  });

  let override: APIResponseOverride = defaultHandler;
  return {
    onResponse: (overridingFunction: APIResponseOverride) => {
      override = overridingFunction;
    },
    getOverride: () => override,
    resetMockHandler: () => {
      override = defaultHandler;
    },
  };
})();

// An Async function which will be passed to the `msw` library for handling intercepted incoming requests
const createMockHandler =
  (apiContext: string) =>
  async (
    req: { url?: any; method?: any; headers?: any },
    res: any,
    ctx: any
  ) => {
    const api = openApiBackends[apiContext].oasBackend;
    // Register `notFound` handler for return 404 response, `notFound` here is a reserved handler
    // in `openapi-backend` library (https://github.com/anttiviljami/openapi-backend)
    api.register('notFound', (_bc, _bres, bctx) => res(bctx.status(404)));

    // register 'notImplemented' (special handler) in mock API
    api.register('notImplemented', async (bc, bres, bctx) => {
      const { status: initialStatus, mock: initialMock } =
        await api.mockResponseForOperation(bc.operation.operationId || '');
      const { status = initialStatus, mock } = getOverride()(
        bc,
        initialMock,
        initialStatus,
        bres,
        bctx
      );
      // Every valid operation (path + verb) request will go through this handler
      return res(bctx.status(status), bctx.json(mock));
    });

    let mockedResponse = ctx.json({
      error: 'something went wrong',
    });
    try {
      const path = req.url.pathname.replace(
        openApiBackends[apiContext].context,
        ''
      );
      const query = req.url.searchParams.toString()
        ? searchParamsToRequestQuery(req.url.searchParams)
        : '';
      const { method, headers } = req;
      const oasRequest: Request = {
        path,
        method,
        headers: headers.all(),
        query,
      };
      mockedResponse = await api.handleRequest(oasRequest, res, ctx);
      // Debug at below point to see the mocked response
    } catch (error) {
      console.error(error);
    }
    return mockedResponse;
  };

export const getMockServer = (apiList: APIName | APIName[]) => {
  // *IMPORTANT* Should provide a unique segment in the request (ideally API context)
  // which could differentiate current API requests from others
  const mockingVerbs = [rest.get, rest.post, rest.put, rest.patch, rest.delete];
  const mockingVerbsList: any[] = [];
  let apiNewList: any = [];
  if (Array.isArray(apiList)) {
    apiNewList = apiList;
  } else {
    apiNewList.push(apiList);
  }
  apiNewList.forEach((item: string) => {
    const mockHandler = createMockHandler(item as string);
    mockingVerbs.map((verb) =>
      mockingVerbsList.push(
        verb(`*${openApiBackends[item as string].context}*`, mockHandler)
      )
    );
  });
  const server = setupServer(...mockingVerbsList);
  return server;
};

export default getMockServer;
