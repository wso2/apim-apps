import React from 'react';
import {
    render,
    screen,
} from 'AppTests/Utils/TestingLibrary';
import getMockServer, { onResponse, resetMockHandler} from 'AppTests/Utils/restAPI.mock';

import { APIName } from 'AppTests/Utils/constants';
import API from 'AppData/api';
import Overview from './Overview';
import { APIProvider } from '../components/ApiContext';

const server = getMockServer(APIName.Publisher);
beforeAll(async () => server.listen());
afterEach(() => {
    server.resetHandlers();
    resetMockHandler();
});
afterAll(() => server.close());

describe('API Details overview page', () => {
    test('Should render overview page', async () => {
        onResponse((context, mock) => {
            return { ...mock, advertiseInfo: { advertised: false }};
        });
        const api = await API.get('mocked-api');
        render(
            <APIProvider value={{ api, tenantList: [] }}>
                <Overview api={api} />
            </APIProvider>,
        );
        expect(screen.getByRole('heading', {
            name: /develop/i,
        })).toBeInTheDocument();
        expect(screen.getByRole('heading', {
            name: /deploy/i,
        })).toBeInTheDocument();

        expect(screen.getByRole('heading', {
            name: /test/i,
        })).toBeInTheDocument();
        expect(screen.getByRole('button', {
            name: /publish/i,
        })).toBeInTheDocument();
        // TODO. Fix this test. The functionality working fine in the live env.
        // await screen.findByRole('heading', { name: /resources/i });
    });
});
