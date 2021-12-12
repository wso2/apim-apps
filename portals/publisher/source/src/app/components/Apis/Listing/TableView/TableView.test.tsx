import React from 'react';
import {
    fireEvent,
    render,
    screen,
    waitFor,
    within,
} from 'AppTests/Utils/TestingLibrary';
import getMockServer, {
    onResponse,
    resetMockHandler,
} from 'AppTests/Utils/restAPI.mock';

import { APIName, MockedUsers } from 'AppTests/Utils/constants';
import TableView from './TableView';

const server = getMockServer(APIName.Publisher);
beforeAll(async () => server.listen());
afterEach(() => {
    server.resetHandlers();
    resetMockHandler();
});
afterAll(() => server.close());

describe('Table view', () => {
    test('Should have 4 welcome cards', async () => {
        render(<TableView />);
        expect(screen.getByText(/loading apis \.\.\./i)).toBeInTheDocument();
        await waitFor(() => {
            expect(
                screen.getByRole('heading', { name: /apis/i }),
            ).toBeInTheDocument();
        });
        const link = screen.getByRole('link', {
            name: /calculatorapi$/i,
        });
        expect(
            within(link).getByRole('heading', {
                name: /calculatorapi/i,
            }),
        ).toBeInTheDocument();
    });
    test('should switch to  table view', async () => {
        render(<TableView />);
        expect(
            await screen.findByRole('button', {
                name: /switch to list view/i,
            }),
        ).toBeInTheDocument();
        fireEvent.click(
            screen.getByRole('button', {
                name: /switch to list view/i,
            }),
        );
        expect(
            await screen.findByRole('button', {
                name: /view columns/i,
            }),
        ).toBeInTheDocument();
        const columnheader = screen.getByRole('columnheader', {
            name: /name/i,
        });
        expect(within(columnheader).getByText(/name/i)).toBeVisible();

        const columnheaderVersion = screen.getByRole('columnheader', {
            name: /version/i,
        });
        expect(within(columnheaderVersion).getByText(/version/i)).toBeVisible();
    });

    test('should show create API options', async () => {
        render(<TableView />);
        expect(
            await screen.findByRole('button', {
                name: /switch to list view/i,
            }),
        ).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole('button', {
                name: /view create api options/i,
            }),
        );
        expect(
            screen.getByText(/design and prototype a new rest api/i),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/Import From Service Catalog/i),
        ).toBeInTheDocument();
        onResponse((context, mock) => {
            if (context.operation.operationId === 'search') {
                return { ...mock, count: 0, list: [] };
            }
        });
        await waitFor(
            () => {
                expect(
                    screen.getByRole('button', { name: /deploy sample api/i }),
                ).toBeInTheDocument();
            },
        );
    });

    test('should not show create API option for Publisher User', async () => {
        render(<TableView />, { user: MockedUsers.Publisher });
        await waitFor(() => {
            expect(screen.getByText(/total:apis/i)).toBeInTheDocument();
        });
        expect(screen.queryByRole('button', {
            name: /view create api options/i,
        })).not.toBeInTheDocument();
    });
});
