import React from 'react';
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { OpenAPIBackend } from 'openapi-backend';
import * as path from 'path';
import * as fs from 'fs';


// Overriding default `waitFor` timeout value due to MSW latencies
// Default asyncUtilTimeout value is 1000
// For more info refer : https://testing-library.com/docs/dom-testing-library/api-configuration/
configure({ asyncUtilTimeout: 30000 });
jest.setTimeout(35000);
// Iterate the OAS tools config file and generate OpenAPIBackend objects and set it to test context globals
const oasToolConfig = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), 'openapitools.json'),
    'utf8'
  )
);

const openApiBackends = {};
Object.entries(oasToolConfig['generator-cli'].generators).map(
  ([apiName, apiConfig]) => {
    const { inputSpec, context } = apiConfig;
    const oasBackend = new OpenAPIBackend({
      definition: inputSpec,
    });
    openApiBackends[apiName] = { context, oasBackend };
  }
);

global.openApiBackends = openApiBackends;


/*  ***** IMPORTANT *****
    Enzyme based unit/integration tests are deprecated and following configurations are solely for Enzyme based test
    Do not modify or extend it unless otherwise absolutely necessary
*/ 
import Enzyme, { shallow, render, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import renderer from 'react-test-renderer';
import SwaggerParser from '@apidevtools/swagger-parser';

const OAS_DEFINITION_URL = 'https://raw.githubusercontent.com/wso2/carbon-apimgt/master/components/apimgt/org.wso2.carbon.apimgt.rest.api.publisher.v1/src/main/resources/publisher-api.yaml';

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
            nodeName: 'BODY',
            ownerDocument: document,
        },
    });
}
global.DEPRECATED_apiDef = SwaggerParser.dereference(OAS_DEFINITION_URL);
