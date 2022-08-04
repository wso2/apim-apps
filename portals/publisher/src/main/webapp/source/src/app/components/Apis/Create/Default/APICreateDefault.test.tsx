import React from 'react';
import {
    fireEvent,
    render,
    screen,
    waitFor,
} from 'AppTests/Utils/TestingLibrary';
import getMockServer, { onResponse, resetMockHandler } from 'AppTests/Utils/restAPI.mock';
import userEvent from '@testing-library/user-event';

import { APIName } from 'AppTests/Utils/constants';
import APICreateDefault from './APICreateDefault';

const server = getMockServer(APIName.Publisher);
beforeAll(async () => server.listen());
afterEach(() => {
    server.resetHandlers();
    resetMockHandler();
});
afterAll(() => server.close());

describe('Create REST API From scratch', () => {
    test('Should render REST API from scratch form', async () => {
        render(<APICreateDefault />);
        expect(await screen.findByTestId('loading-publisher-settings')).toBeInTheDocument();
        expect(screen.getByRole('heading', {
            name: /create an api/i,
        })).toBeInTheDocument();
        expect(
            screen.getByRole('textbox', {
                name: /name \*/i,
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('textbox', {
                name: /endpoint/i,
            }),
        ).toBeInTheDocument();
    });

    test('Should have auto focused `Name` input field', async () => {
        render(<APICreateDefault />);
        expect(screen.getByRole('textbox', { name: /name \*/i })).toHaveFocus();
        userEvent.tab();
    });

    test('Should validate name field for empty and special characters', async () => {
        render(<APICreateDefault />);
        expect(await screen.findByTestId('loading-publisher-settings')).toBeInTheDocument();
        const NAME_INPUT = screen.getByRole('textbox', { name: /name \*/i });
        const NAME_EMPTY_ERROR = /name should not be empty/i;
        const VALID_API_NAME = 'sampleAPIName';
        expect(NAME_INPUT).toHaveFocus();
        userEvent.type(NAME_INPUT, '');
        fireEvent.blur(NAME_INPUT);
        expect(screen.getByText(NAME_EMPTY_ERROR)).toBeVisible();
        userEvent.type(NAME_INPUT, VALID_API_NAME);
        NAME_INPUT.blur();
        expect(screen.getByDisplayValue(VALID_API_NAME)).toBeVisible();
        await waitFor(() => {
            expect(screen.queryByText(NAME_EMPTY_ERROR)).toBeNull();
        });
        userEvent.clear(NAME_INPUT);

        // Test for special characters
        const NO_SPACE_ERROR = /name should not contain spaces or special characters/i;
        userEvent.type(NAME_INPUT, 'invalid@name');
        NAME_INPUT.blur();
        expect(screen.getByText(NO_SPACE_ERROR)).toBeInTheDocument();

        userEvent.clear(NAME_INPUT);
        userEvent.type(NAME_INPUT, VALID_API_NAME);
        NAME_INPUT.blur();
        expect(screen.getByDisplayValue(VALID_API_NAME)).toBeVisible();
        await waitFor(() => {
            expect(screen.queryByText(NO_SPACE_ERROR)).toBeNull();
        });
    });

    test('should not exceed 50 character length', async () => {
        render(<APICreateDefault />);
        expect(screen.getByTestId('loading-publisher-settings')).toBeInTheDocument();
        const NAME_INPUT = screen.getByRole('textbox', { name: /name \*/i });
        const NAME_EXCEEDED_ERROR = /Name has exceeded the maximum number of 50 characters/i;
        userEvent.type(NAME_INPUT, 'a'.repeat(50));
        NAME_INPUT.blur();
        await waitFor(() => {
            expect(screen.queryByText(NAME_EXCEEDED_ERROR)).not.toBeInTheDocument();
        });
        userEvent.clear(NAME_INPUT);
        userEvent.type(NAME_INPUT, 'a'.repeat(51));
        NAME_INPUT.blur();
        await waitFor(() => {
            expect(screen.getByText(NAME_EXCEEDED_ERROR)).toBeInTheDocument();
        });
    });

    test('Should validate context field for empty and special characters', async () => {
        render(<APICreateDefault />);
        const CONTEXT_INPUT = screen.getByRole('textbox', { name: /context \*/i });
        const CONTEXT_EMPTY_ERROR = /Context should not be empty/i;
        const VALID_API_CONTEXT = 'sampleContext';
        expect(CONTEXT_INPUT).not.toHaveFocus();
        onResponse((context, mock) => {
            const { operation: { operationId } } = context;
            if (operationId === 'search') {
                return { ...mock, list: [], count: 0 };
            }
        });
        userEvent.type(CONTEXT_INPUT, '');
        fireEvent.blur(CONTEXT_INPUT);
        expect(screen.getByText(CONTEXT_EMPTY_ERROR)).toBeVisible();
        userEvent.type(CONTEXT_INPUT, VALID_API_CONTEXT);
        CONTEXT_INPUT.blur();
        expect(screen.getByDisplayValue(VALID_API_CONTEXT)).toBeVisible();

        await waitFor(() => {
            expect(screen.queryByText(CONTEXT_EMPTY_ERROR)).toBeNull();
        });
        userEvent.clear(CONTEXT_INPUT);

        // Test for special characters
        const NO_SPACE_ERROR = /Context should not contain spaces or special characters/i;
        userEvent.type(CONTEXT_INPUT, 'invalid@name');
        CONTEXT_INPUT.blur();
        expect(screen.getByText(NO_SPACE_ERROR)).toBeInTheDocument();

        userEvent.clear(CONTEXT_INPUT);
        userEvent.type(CONTEXT_INPUT, VALID_API_CONTEXT);
        CONTEXT_INPUT.blur();
        expect(screen.getByDisplayValue(VALID_API_CONTEXT)).toBeVisible();
        await waitFor(() => {
            expect(screen.queryByText(NO_SPACE_ERROR)).toBeNull();
        });
    });
});
