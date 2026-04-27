/*
 * Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com) All Rights Reserved.
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
import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { ThemeProvider, createTheme, adaptV4Theme } from '@mui/material/styles';
import defaultTheme from 'AppData/defaultTheme';
import Footer from './Footer';

const theme = createTheme(adaptV4Theme(defaultTheme));

function renderFooter(messages = {}) {
    return render(
        <IntlProvider locale='en' messages={messages}>
            <ThemeProvider theme={theme}>
                <Footer />
            </ThemeProvider>
        </IntlProvider>,
    );
}

describe('<Footer /> — issue #4972', () => {
    it('renders the default product details message with the current license year (2026)', () => {
        renderFooter();
        const footer = screen.getByText(/WSO2 API-M v4\.7\.0/);
        expect(footer).toHaveTextContent('WSO2 API-M v4.7.0 | © 2026 WSO2 LLC');
    });

    it('uses © 2026 in the defaultMessage (regression guard for stale year)', () => {
        renderFooter();
        expect(screen.getByText(/© 2026 WSO2 LLC/)).toBeInTheDocument();
        expect(screen.queryByText(/© 2025 WSO2 LLC/)).not.toBeInTheDocument();
    });

    it('prefers theme.custom.footer.text when configured (negative case)', () => {
        const customText = 'Custom footer override';
        const themeWithCustomText = createTheme(adaptV4Theme({
            ...defaultTheme,
            custom: {
                ...defaultTheme.custom,
                footer: { ...defaultTheme.custom.footer, text: customText },
            },
        }));
        render(
            <IntlProvider locale='en' messages={{}}>
                <ThemeProvider theme={themeWithCustomText}>
                    <Footer />
                </ThemeProvider>
            </IntlProvider>,
        );
        expect(screen.getByText(customText)).toBeInTheDocument();
        expect(screen.queryByText(/WSO2 API-M v4\.7\.0/)).not.toBeInTheDocument();
    });

    it('honours a locale override for the product_details message', () => {
        const overriddenMessage = 'WSO2 API-M v4.7.0 | © 2026 WSO2 LLC (fr)';
        renderFooter({ 'Base.Footer.Footer.product_details': overriddenMessage });
        expect(screen.getByText(overriddenMessage)).toBeInTheDocument();
    });
});
