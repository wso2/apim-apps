import React from 'react';
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
import ApiCreateOpenAPI from './ApiCreateOpenAPI';

const server = getMockServer(APIName.Publisher);
beforeAll(async () => server.listen());
afterEach(() => {
    server.resetHandlers();
    resetMockHandler();
});
afterAll(() => server.close());

describe('Importing an OpenAPI definition', () => {
    test('Should Import OpenAPI page', async () => {
        render(<ApiCreateOpenAPI history={history} />);
        expect(screen.getByRole('heading', { name: /create an api using an openapi definition\./i }))
            .toBeInTheDocument();
        expect(screen.getByRole('radio', { name: /openapi file\/archive/i })).toBeInTheDocument();
        expect(screen.getByRole('radio', { name: /openapi url/i })).toBeInTheDocument();
    });

    test('Should Validate OAS URL', async () => {
        render(<ApiCreateOpenAPI history={history} />);
        expect(screen.getByRole('radio', { name: /openapi url/i })).toBeChecked();
        const OAS_URL_INPUT = screen.getByRole('textbox', { name: /openapi url/i });
        expect(OAS_URL_INPUT).toHaveFocus();
        OAS_URL_INPUT.blur();
        expect(screen.getByText(/url should not be empty/i)).toBeInTheDocument();
        userEvent.type(OAS_URL_INPUT, 'httpx://foo.bar.com');
        expect(screen.getByText(/url should not be empty/i)).toBeInTheDocument();

        // Enter valid URL
        userEvent.clear(OAS_URL_INPUT);
        userEvent.type(OAS_URL_INPUT, 'https://fail.this.com/validURL');
        onResponse((context, mock) => {
            return { ...mock, isValid: false };
        });
        await waitFor(() => {
            expect(screen.getByText(/openapi content validation failed!/i)).toBeInTheDocument();
        });
        resetMockHandler();
        userEvent.clear(OAS_URL_INPUT);
        userEvent.type(OAS_URL_INPUT, 'https://pass.this.com/validURL');
        await waitFor(() => {
            waitForElementToBeRemoved(() => screen.queryByText(/url should not be empty/i));
        });
    });
});
