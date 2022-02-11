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
import { rest } from "msw";
import { Context, OpenAPIBackend, Request } from "openapi-backend";
import { setupServer } from "msw/node";
import { searchParamsToRequestQuery } from "./TestingLibrary";
import { APIName } from "./constants";

type OASBackendMapping = { context: string; oasBackend: OpenAPIBackend };
// Declaring the global BallerinaCentral variable set from src/setupTests.ts file
declare global {
  const openApiBackends: {
    [key: string]: OASBackendMapping;
  };
}

type APIResponseOverride = (
  requestContext: Context,
  currentMock: any,
  currentStatusCode: number,
  response: (status: any, mock: any) => void,
  context: { status: (s: number) => void; json: (s: string) => void }
) => [mock: any, status: number ] | {} | void;
export const { onResponse, getOverride, resetMockHandler } = (() => {
  const defaultHandler: APIResponseOverride = (c, mock, status) => {};

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
const createMockHandler = (apiMapping: OASBackendMapping) => async (
  req: { url?: any; method?: any; headers?: any },
  res: any,
  ctx: any
) => {
  const thisAPIBackend = apiMapping.oasBackend;

  let mockedResponse = ctx.json({
    error: "something went wrong",
  });
  try {
    const path = req.url.pathname.replace(apiMapping.context, "");
    const query = req.url.searchParams.toString()
      ? searchParamsToRequestQuery(req.url.searchParams)
      : "";
    const { method, headers } = req;
    const oasRequest: Request = {
      path,
      method,
      headers: headers.all(),
      query,
    };
    if (req.url.pathname === "/api/am/publisher/v3/swagger.yaml") {
      // Temporary fix for removing x-example $refs
      await apiMapping.oasBackend.init();
      const oasDef = thisAPIBackend.document;
      Object.keys(oasDef.paths).forEach((path) =>
        Object.keys(oasDef.paths[path]).forEach((verb) => {
          delete oasDef.paths[path][verb]["x-examples"];
        })
      );
      // End of temporary fix for removing x-example $refs
      mockedResponse = res(ctx.json(oasDef));
    } else {
      mockedResponse = await thisAPIBackend.handleRequest(oasRequest, res, ctx);
    }
    // Debug at below point to see the mocked response
  } catch (error) {
    console.error(error);
  }
  return mockedResponse;
};

export const getMockServer = (_apiList: APIName | APIName[]) => {
  // *IMPORTANT* Should provide a unique segment in the request (ideally API context)
  // which could differentiate current API requests from others
  const mockingVerbs = [rest.get, rest.post, rest.put, rest.patch, rest.delete];
  const mockingVerbsList: any[] = [];
  let apiList: any = Array.isArray(_apiList) ? _apiList : [_apiList];

  apiList.forEach((APIName: string) => {
    const apiMapping = openApiBackends[APIName];
    apiMapping.oasBackend.register({
      notImplemented: async (notImplC, notImplRes, notImplContext) => {
        const {
          status: initialStatus,
          mock: initialMock,
        } = await apiMapping.oasBackend.mockResponseForOperation(
          notImplC.operation.operationId || ""
        );
        const overriddenResponse = getOverride()(
          notImplC,
          initialMock,
          initialStatus,
          notImplRes,
          notImplContext
        );
        let status = initialStatus, mock = initialMock;
        if(Array.isArray(overriddenResponse)) {
          [mock,status] = overriddenResponse;
        } else if (overriddenResponse !== undefined) {
          mock = overriddenResponse;
        }
        // Every valid operation (path + verb) request will go through this handler
        return notImplRes(
          notImplContext.status(status),
          notImplContext.json(mock)
        );
      },
    });
    const mockHandler = createMockHandler(apiMapping);
    mockingVerbs.map((verb) =>
      mockingVerbsList.push(verb(`*${apiMapping.context}*`, mockHandler))
    );
  });
  const server = setupServer(...mockingVerbsList);
  return {
    resetHandlers: server.resetHandlers,
    close: server.close,
    listen: async () => {
      for (const APIName of apiList) {
        const apiMapping = openApiBackends[APIName];
        try {
          if(!apiMapping.oasBackend.initalized) { // Prevent redundant OAS fetch
            apiMapping.oasBackend = await apiMapping.oasBackend.init(); // TODO: need to move this to setup tests
          }
        } catch (error) {
          console.error(error);
          throw new Error("Error while initializing OAS Backend");
        }
      }
      server.listen();
    },
  };
};

export default getMockServer;
