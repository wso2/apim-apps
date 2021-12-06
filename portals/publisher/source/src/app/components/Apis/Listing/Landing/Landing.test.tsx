import React from 'react';
import {
    fireEvent,
    render,
    screen,
    waitFor,
    history,
} from 'AppTests/Utils/TestingLibrary';
import getMockServer, { resetMockHandler } from 'AppTests/Utils/restAPI.mock';

import { APIName } from 'AppTests/Utils/constants';
import Landing from './index';

const server = getMockServer(APIName.Publisher);
beforeAll(async () => server.listen());
afterEach(() => {
    server.resetHandlers();
    resetMockHandler();
});
afterAll(() => server.close());

describe('Landing page', () => {
    test('Should have 4 welcome cards', async () => {
        render(<Landing />);
        expect(screen.getByText(/soap api/i)).toBeInTheDocument();
        expect(screen.getByText(/^rest api/i)).toBeInTheDocument();
        expect(screen.getByText(/^graphql/i)).toBeInTheDocument();
        expect(screen.getByText(/streaming api/i)).toBeInTheDocument();
    });

    test('REST API Card links', async () => {
        render(<Landing />);
        const restAPICard = screen.getByText(/^rest api/i);
        expect(
            screen.queryByRole('heading', {
                name: /start from scratch/i,
            }),
        ).toBeNull();
        expect(restAPICard).toBeInTheDocument();
        fireEvent.click(restAPICard);
        expect(
            screen.getByRole('link', {
                name: /start from scratch/i,
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('link', {
                name: /import open api/i,
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: /deploy sample api/i,
            }),
        ).toBeInTheDocument();
    });

    test(
        'REST API deploy sample API',
        async () => {
            render(<Landing />);
            history.push('/publisher');
            const restAPICard = screen.getByText(/^rest api/i);
            expect(
                screen.queryByRole('heading', {
                    name: /start from scratch/i,
                }),
            ).toBeNull();
            expect(restAPICard).toBeInTheDocument();
            fireEvent.click(restAPICard);
            const deploySampleButton = screen.getByRole('button', {
                name: /deploy sample api/i,
            });
            expect(deploySampleButton).toBeInTheDocument();
            fireEvent.click(deploySampleButton);
            expect(
                screen.getByText(/creating sample api \.\.\./i),
            ).toBeInTheDocument();
            expect(
                screen.queryByText('API published successfully!'),
            ).not.toBeInTheDocument();
            await waitFor(() => {
                expect(
                    screen.getByText(/choose your option to create an api/i),
                ).toBeVisible();
            });
        },
        2 ** 16,
    );
});
