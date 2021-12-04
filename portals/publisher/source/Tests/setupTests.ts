import { OpenAPIBackend } from "openapi-backend";
import * as path from "path";
import * as fs from "fs";
import addFormats from "ajv-formats";

/* ####### OpenAPI mock configuration ####### */
// Iterate the OAS tools config file and generate OpenAPIBackend objects and set it to test context globals
const oasToolConfig = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "openapitools.json"), "utf8")
);
type APIConfig = {inputSpec: any, context: string};
const openApiBackends = {};
Object.entries(oasToolConfig["generator-cli"].generators).map(
  ([apiName, apiConfig]) => {
    const { inputSpec, context } = apiConfig as APIConfig;
    const oasBackend = new OpenAPIBackend({
      definition: inputSpec,
      quick: true,
      customizeAjv: (originalAjv, ajvOpts, validationContext) => {
        // To fix https://github.com/anttiviljami/openapi-backend/issues/230
        addFormats(originalAjv);
        return originalAjv;
      },
      handlers: {
        notFound: async (c, req, res) =>
          res.status(404).json({ err: "not found" }),
      },
    });
    openApiBackends[apiName] = { context, oasBackend };
  }
);
/* ####### End of OpenAPI mock configuration ####### */

global.openApiBackends = openApiBackends;


/* ####### DEPRECATED Old configs ####### */

/*  ***** IMPORTANT *****
    Enzyme based unit/integration tests are deprecated and following configurations are solely for Enzyme based test
    Do not modify or extend it unless otherwise absolutely necessary
*/
import React from "react";
import Enzyme, { shallow, render, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import renderer from "react-test-renderer";
import SwaggerParser from "@apidevtools/swagger-parser";

const OAS_DEFINITION_URL =
  "https://raw.githubusercontent.com/wso2/carbon-apimgt/master/components/apimgt/org.wso2.carbon.apimgt.rest.api.publisher.v1/src/main/resources/publisher-api.yaml";

// React 16 Enzyme adapter
Enzyme.configure({ adapter: new Adapter() });

// ***DEPRECATED*** Make Enzyme functions available in all test files without importing
global.React = React;
global.DEPRECATED_shallow = shallow;
global.DEPRECATED_render = render;
global.DEPRECATED_mount = mount;
global.DEPRECATED_renderer = renderer;
if (global.document) {
  // To resolve createRange not defined issue https://github.com/airbnb/enzyme/issues/1626#issuecomment-398588616
  document.createRange = () => ({
    setStart: () => {},
    setEnd: () => {},
    commonAncestorContainer: {
      nodeName: "BODY",
      ownerDocument: document,
    },
  });
}
global.DEPRECATED_apiDef = SwaggerParser.dereference(OAS_DEFINITION_URL);
