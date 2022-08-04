import { OpenAPIBackend } from 'openapi-backend';
import addFormats from 'ajv-formats';
import { TextEncoder, TextDecoder } from 'util';
// import { JSDOM } from 'jsdom';

import { APIConfig, getTempPath, OASConfigs } from './Utils/setupUtils';

/* ####### OpenAPI mock configuration ####### */
// Iterate the OAS tools config file and generate OpenAPIBackend objects and set it to test context globals
const openApiBackends: { [key: string]: {} } = {};

/* ####### Mock missing properties in JS-DOM ####### */

var localStorageMock = (function() {
    var store: { [key: string]: string } = {};
    return {
        getItem: function(key: string) {
            return store[key];
        },
        setItem: function(key: string, value: any) {
            store[key] = value.toString();
        },
        clear: function() {
            store = {};
        },
        removeItem: function(key: string): void {
            delete store[key];
        },
    };
})();

// const dom = new JSDOM('',{ url: "https://localhost/" });
// global.window = dom.window;
// global.document = dom.window.document;
// JSDOM.changeURL(undefined, 'https://localhost')
// Object.defineProperty(window, "localStorage", { value: localStorageMock });
// Object.defineProperty(window, "location", { value: new URL("http://localhost") });

// `matchMedia` polyfill for react-hot-tost Alerting
// For more info https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // Deprecated
        removeListener: jest.fn(), // Deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

/* ####### End - Mock missing properties in JS-DOM ####### */

OASConfigs().map(([apiName, apiConfig]) => {
    const { inputSpec, context } = apiConfig as APIConfig;
    const oasBackend = new OpenAPIBackend({
        definition: getTempPath(inputSpec),
        quick: true,
        customizeAjv: (originalAjv, ajvOpts, validationContext) => {
            // To fix https://github.com/anttiviljami/openapi-backend/issues/230
            addFormats(originalAjv);
            return originalAjv;
        },
        handlers: {
            notFound: async (c, req, res) =>
                res.status(404).json({ err: 'not found' }),
        },
    });
    openApiBackends[apiName] = { context, oasBackend };
});
/* ####### End of OpenAPI mock configuration ####### */

global.openApiBackends = openApiBackends;
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;