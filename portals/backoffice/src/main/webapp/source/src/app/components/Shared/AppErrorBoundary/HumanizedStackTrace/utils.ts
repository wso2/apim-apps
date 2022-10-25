/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
export const filenameWithoutLoaders = (filename = '') => {
    const index = filename.lastIndexOf('!');

    return index < 0 ? filename : filename.substr(index + 1);
};

export const filenameHasLoaders = (filename: string) => {
    const actualFilename = filenameWithoutLoaders(filename);

    return actualFilename !== filename;
};

export const filenameHasSchema = (filename: string) => {
    return /^[\w]+:/.test(filename);
};

export const isFilenameAbsolute = (filename?: string) => {
    const actualFilename = filenameWithoutLoaders(filename);

    if (actualFilename.indexOf('/') === 0) {
        return true;
    }

    return false;
};

export const makeUrl = (
    filename?: string,
    scheme?: string,
    line?: number | null,
    column?: number | null,
) => {
    const actualFilename = filenameWithoutLoaders(filename);

    if (filenameHasSchema(filename || '')) {
        return actualFilename;
    }

    let url = `file://${actualFilename}`;

    if (scheme === 'vscode') {
        url = `${scheme}://file/${url}`;
        url = url.replace(/file:\/\/\//, ''); // visual studio code does not need file:/// in its scheme
        if (line && actualFilename === filename) {
            url = `${url}:${line}`;

            if (column) {
                url = `${url}:${column}`;
            }
        }
    } else if (scheme) {
        url = `${scheme}://open?url=${url}`;

        if (line && actualFilename === filename) {
            url = `${url}&line=${line}`;

            if (column) {
                url = `${url}&column=${column}`;
            }
        }
    }

    return url;
};

export const makeLinkText = (
    filename?: string,
    line?: number | null,
    column?: number | null,
) => {
    let text = filenameWithoutLoaders(filename);

    if (line && text === filename) {
        text = `${text}:${line}`;

        if (column) {
            text = `${text}:${column}`;
        }
    }

    return text;
};
