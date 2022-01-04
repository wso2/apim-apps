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

import React from 'react';
import {
    render,
    screen,
} from 'AppTests/Utils/TestingLibrary';
import getMockServer, { resetMockHandler } from 'AppTests/Utils/restAPI.mock';
import { APIName } from 'AppTests/Utils/constants';

import Protected from './ProtectedApp';

const server = getMockServer(APIName.Publisher);
beforeAll(async () => server.listen());
afterEach(() => {
    server.resetHandlers();
    resetMockHandler();
});
afterAll(() => server.close());


describe('Test Protected app content', () => {
    test('Should show global navigation menus', async () => {
        render(<Protected />);
        expect(screen.getByText(/apis/i)).toBeInTheDocument();
        expect(screen.getByText(/services/i)).toBeInTheDocument();
        expect(screen.getByText(/api products/i)).toBeInTheDocument();
        await screen.findByText(/by : admin/i);
        await screen.findByText(/delete/i);
    });
});
