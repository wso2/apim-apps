/*
 * Copyright (c) 2024, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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

import axios, { AxiosResponse } from 'axios';

// const getConfig = (config: any) => ({
//     headers: {
//         Accept: 'application/json',
//         'Content-Type': 'application/json',
//     },
//     ...config,
// });

// GET request helper method
export const get = (
    url: string,
    params?: any,
    headers?: any,
) => {
    return axios.get(url, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            // 'Access-Control-Allow-Origin': '*',
            ...headers,
        },
        params: { ...params },
    });
    // const x = getConfig({
    //     method: 'GET', headers, responseType, url, params,
    // });
    // console.log('WHODIKW', x);
    // return axios.get(x).then((response: any) => {
    //     console.log('Hello');
    //     console.log(response);
    // }).catch((error: any) => {
    //     if (axios.isAxiosError(error)) {
    //         console.log('error message: ', error.message);
    //     } else {
    //         console.log('unexpected error: ', error);
    //     }
    // });
};

// POST request helper method
// export const post = (
//     url: string,
//     params?: any,
//     data?: any,
//     shouldEncodeToFormData?: boolean,
//     headers?: any,
// ) => {
//     return axios.post(
//         getConfig({
//             method: 'POST',
//             url,
//             params,
//             headers,
//             data,
//             shouldEncodeToFormData,
//         }),
//     );
// };

// The base URL of the API Chat API
// const apiChatBaseUrl = 'http://localhost:9090/';
const apiChatBaseUrl = 'http://127.0.0.1:9090/';
// const apiChatBaseUrl = 'https://run.mocky.io/v3/009b091e-4996-45af-b2e3-34baff8f94ef/';

/**
 * Check the health status of the API Chat AI Agent
//  * @returns {Promise<AxiosResponse>} The health status of the API Chat AI Agent
 */
export async function pingApiChatApi(): Promise<AxiosResponse<any>> {
    // axios.get(`${apiChatBaseUrl}health`)
    //     .then((response: any) => {
    //         console.log('Hello');
    //         console.log(response.code);
    //     })
    //     .catch((error: any) => {
    //         if (axios.isAxiosError(error)) {
    //             console.log('error message: ', error.message);
    //         } else {
    //             console.log('unexpected error: ', error);
    //         }
    //     });
    // try {
    const response = await get(
        `${apiChatBaseUrl}health`,
        null,
    );
    // console.log('sss');
    // console.log(response.status);
    return response;
    // }
    // catch (error) {
    //     if (axios.isAxiosError(error)) {
    //         console.log('error message: ', error.message);
    //         return error.message;
    //     } else {
    //         console.log('unexpected error: ', error);
    //         return 'An unexpected error occurred';
    //     }
    // }

    // return response as AxiosResponse;
}

// export async function enrichOpenApiSpecification(
//   openapi: any,
//   apiBaseUrl: string,
//   requestId: string
// ) {
//   const response = await post(
//     `${apiBaseUrl}/${apiChatApiContext}prepare`,
//     null,
//     JSON.stringify({
//       openapi,
//     }),
//     true,
//     false,
//     {
//       'Content-Type': 'application/json',
//       'x-request-id': requestId,
//     }
//   );
//   return response as AxiosResponse;
// }

// export async function runAiAgentInitialIteration(
//   token: string,
//   query: string,
//   apiSpec: any,
//   apiBaseUrl: string,
//   requestId: string
// ) {
//   const response = await apiPost(
//     `${apiBaseUrl}/${apiChatApiContext}execute`,
//     null,
//     JSON.stringify({
//       command: query,
//       apiSpec,
//     }),
//     true,
//     false,
//     {
//       Token: token,
//       'Content-Type': 'application/json',
//       'x-request-id': requestId,
//     }
//   );
//   return response as AxiosResponse;
// }

// export async function runAiAgentSubsequentIterations(
//   token: string,
//   tokenRefreshed: boolean,
//   apiBaseUrl: string,
//   requestId: string
// ) {
//   const response = await apiPost(
//     `${apiBaseUrl}/${apiChatApiContext}execute`,
//     null,
//     JSON.stringify({
//       tokenRefreshed,
//     }),
//     true,
//     false,
//     {
//       Token: token,
//       'Content-Type': 'application/json',
//       'x-request-id': requestId,
//     }
//   );
//   return response as AxiosResponse;
// }

export default { pingApiChatApi };
