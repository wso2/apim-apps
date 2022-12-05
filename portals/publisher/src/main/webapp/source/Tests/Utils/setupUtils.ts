import * as path from 'path';
import * as fs from 'fs';
import SwaggerParser from '@apidevtools/swagger-parser';
import { promises as fsPromises } from 'fs';
import * as url from 'url';
import { OpenAPIV3 } from 'openapi-types';

export type APIConfig = { inputSpec: any; context: string };
const MAX_DOWNLOAD_RETRY = 3;
const RE_TRY_WAIT_TIME = 2000;

/**
 * Download the OAS definition to a temporary location given the URL
 * @param _url Open API definition HTTP URL
 * @returns
 */
export function getTempPath(_url: string, isFileName: boolean = false) {
    let fileName = _url;
    if (!isFileName) {
        const parsed = url.parse(_url);
        fileName = path.basename(parsed.pathname || '');
    }
    return `/tmp/${fileName}`;
}

/**
 * This is a temporary hack, to remove x-example refs
 * @param oasDefinition
 * @returns string cleaned OAS definition
 */
export function removeXExamples(
    oasDefinition: OpenAPIV3.Document,
): OpenAPIV3.Document {
    Object.keys(oasDefinition.paths).forEach((path) =>
        Object.keys(oasDefinition.paths[path]).forEach((verb) => {
            delete oasDefinition.paths[path][verb]['x-examples'];
        }),
    );
    return oasDefinition;
}

/**
 * Download and bundled the OpenAPI definition giving the OAS definition URL
 * This was inspired by https://github.com/APIDevTools/swagger-cli/blob/master/lib/bundle.js
 * @param apiURL
 * @returns Promise<string> Parsed and dereferenced OAS content
 */
export const downloadOASDefinition = async function bundle(
    apiURL: string,
): Promise<string> {
    const filePath = getTempPath(apiURL);

    // Throw an error if the API contains circular $refs and we're dereferencing,
    // since the output can't be serialized as JSON
    const opts = {
        dereference: {
            circular: false,
        },
    };
    console.log(`Start downloading ${filePath}`);
    let retries = 0;
    let bundled;
    while (retries < MAX_DOWNLOAD_RETRY) {
        try {
            // disabled the rule to do fail re-tries
            // eslint-disable-next-line no-await-in-loop
            bundled = await SwaggerParser.bundle(apiURL, opts);
            break;
        } catch (error) {
            retries += 1;
            const retryWaitTime = retries * RE_TRY_WAIT_TIME;
            console.warn(
                error,
                `Attempt: ${retries} : Error while downloading ${filePath} \nRe-try in ${
                    retryWaitTime / 1000
                } Seconds . . .`,
            );
            // eslint-disable-next-line no-await-in-loop
            await new Promise((resolve) => setTimeout(resolve, retryWaitTime));
        }
    }
    if (!bundled) {
        const downloadError =
            `Could not download the ${filePath} after` +
            ` ${MAX_DOWNLOAD_RETRY} attempts, Check your internet connection !!!`;
        console.error(downloadError);
        throw new Error(downloadError);
    }

    console.log(`OAS definition downloaded ${filePath} successfully!`);
    const content = JSON.stringify(bundled, null) + '\n';

    console.log(`Start saving ${filePath}`);
    // Create the output directory, if necessary
    await fsPromises.mkdir(path.dirname(filePath), { recursive: true });

    // Write the result to the output file
    await fsPromises.writeFile(filePath, content);
    console.log(`OAS definition saved ${filePath} successfully!`);

    return content;
};

export const OASConfigs = () => {
    const oasToolConfig = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), 'openapitools.json'), 'utf8'),
    );
    return Object.entries(oasToolConfig['generator-cli'].generators);
};
