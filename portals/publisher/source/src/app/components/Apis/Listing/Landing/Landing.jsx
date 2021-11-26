import React from 'react';
import {
    fireEvent, render, screen, waitFor, within,
} from 'AppTests/Utils/TestingLibrary';
import getMockServer, { resetMockHandler, onResponse } from 'AppTests/Utils/restAPI.mock';

import { APIName } from 'AppTests/Utils/constants';
import Landing from './index';

const server = getMockServer(APIName.Publisher);
beforeAll(() => server.listen());
afterEach(() => {
    server.resetHandlers();
    resetMockHandler();
});
afterAll(() => server.close());

describe('Marketplace page', () => {
    test('Marketplace get connectors', async () => {
        render(<Landing />);
        // We can't expect to have the network responses just after rending, Hence asserting on the loader element
        // expect(screen.getByTestId('marketplace-search-loader')).toBeInTheDocument();
        // // Since search box appears after the data feting completed assert on the `textbox` role
        // await waitFor(() => {
        //     expect(screen.getByRole('textbox')).toBeInTheDocument();
        // });
        // // `search` text(box) is available without a `wait` as well
        // await waitFor(() => {
        //     expect(screen.getByText(/search/i)).toBeInTheDocument();
        // });
        // // Check for rendered connectors list
        // await waitFor(() => {
        //     expect(screen.getAllByText(/by isuruboyagane/i)).toHaveLength(10);
        // });
        // // Expect filters list to be present in the page
        // expect(screen.getByText(/filter by/i)).toBeInTheDocument();
    });
});
