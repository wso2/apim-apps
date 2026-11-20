/*
 * Copyright (c) 2026, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LandingMenu from './LandingMenu';

const renderMenu = (onOpen) => render(
    <LandingMenu id='test-card' title='Test Card' icon='/icon.svg' onOpen={onOpen}>
        <button type='button'>inner action</button>
    </LandingMenu>,
);

describe('LandingMenu onOpen', () => {
    test('calls onOpen when the card is opened', () => {
        const onOpen = jest.fn();
        renderMenu(onOpen);

        fireEvent.click(screen.getByText('Test Card'));

        expect(onOpen).toHaveBeenCalledTimes(1);
        expect(screen.getByText('inner action')).toBeInTheDocument();
    });

    test('does not call onOpen again for clicks bubbling from inside the open card', () => {
        const onOpen = jest.fn();
        renderMenu(onOpen);

        fireEvent.click(screen.getByText('Test Card'));
        fireEvent.click(screen.getByText('inner action'));
        fireEvent.click(screen.getByText('Test Card'));

        expect(onOpen).toHaveBeenCalledTimes(1);
    });

    test('calls onOpen again after the card is closed and re-opened', () => {
        const onOpen = jest.fn();
        renderMenu(onOpen);

        fireEvent.click(screen.getByText('Test Card'));
        fireEvent.click(screen.getByRole('button', { name: '' }));
        fireEvent.click(screen.getByText('Test Card'));

        expect(onOpen).toHaveBeenCalledTimes(2);
    });

    test('opens normally when no onOpen is provided', () => {
        renderMenu();

        expect(() => fireEvent.click(screen.getByText('Test Card'))).not.toThrow();
        expect(screen.getByText('inner action')).toBeInTheDocument();
    });
});
