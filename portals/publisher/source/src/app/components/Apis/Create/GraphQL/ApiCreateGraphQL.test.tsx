import React from 'react';
import * as fs from 'fs';
import {
    fireEvent,
    history,
    render,
    screen,
    waitFor,
    waitForElementToBeRemoved,
    within,
} from 'AppTests/Utils/TestingLibrary';
import getMockServer, { onResponse, resetMockHandler } from 'AppTests/Utils/restAPI.mock';
import userEvent from '@testing-library/user-event';

import { APIName } from 'AppTests/Utils/constants';
import ApiCreateGraphQL from './ApiCreateGraphQL';

const server = getMockServer(APIName.Publisher);
beforeAll(async () => server.listen());
afterEach(() => {
    server.resetHandlers();
    resetMockHandler();
});
afterAll(() => server.close());

describe('Import a GraphQL API', () => {
    test('Should render graphql import first page', async () => {
        render(<ApiCreateGraphQL />);
        expect(screen.getByRole('button', {
            name: /browse file to upload/i,
        })).toBeInTheDocument();
        expect(screen.getByRole('button', {
            name: /next/i,
        })).toBeDisabled();
        screen.logTestingPlaygroundURL();
    });

    test('Should allow proceed with valid graphql file', async () => {
        // Example from https://testing-library.com/docs/ecosystem-user-event/
        const sampleGraphQLSDL = new File(['sample GQL'], 'sample.sdl', { type: 'text/plain' });
        sampleGraphQLSDL.on = jest.fn();
        sampleGraphQLSDL.pause = jest.fn();
        sampleGraphQLSDL.resume = jest.fn();
        onResponse((c, m) => {
            debugger;
        });
        // const sampleGraphQLSDL = fs.createReadStream('/home/user/Downloads/sample.sdl');
        render(<ApiCreateGraphQL />);
        const graphQLFileUploadInput = screen.getByLabelText('GraphQL file upload');
        userEvent.upload(graphQLFileUploadInput, sampleGraphQLSDL);
        await screen.findByRole('progressbar');
        await screen.findByRole('button', { name: /delete/i });
        screen.logTestingPlaygroundURL();
    });
});
