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
import { IntlProvider } from 'react-intl';
import GCPEndpointUrlBuilder
    from 'AppComponents/Apis/Details/Endpoints/AIEndpoints/GCPEndpointUrlBuilder';

// The URL the backend seeds into a fresh Vertex (regional) endpoint - the region token appears twice.
const SEEDED_URL = 'https://{region}-aiplatform.googleapis.com/v1/projects/{project_id}'
    + '/locations/{region}/publishers/google/models';

const renderBuilder = (props = {}) => {
    const onChange = jest.fn();
    render(
        <IntlProvider locale='en' messages={{}}>
            <GCPEndpointUrlBuilder url={SEEDED_URL} onChange={onChange} {...props} />
        </IntlProvider>,
    );
    return { onChange };
};

describe('GCPEndpointUrlBuilder', () => {
    it('starts on Regional with empty region/project for the seeded placeholder URL', () => {
        renderBuilder();

        expect(screen.getByRole('radio', { name: 'Regional' })).toBeChecked();
        expect(screen.getByRole('radio', { name: 'Global' })).not.toBeChecked();
        // Placeholders are stripped from the structured fields so they read as "not set".
        expect(screen.getByRole('combobox', { name: /Region/i }).value).toBe('');
        expect(screen.getByRole('textbox', { name: /Project ID/i }).value).toBe('');
    });

    it('writes the region into BOTH the host and the locations slots', () => {
        const { onChange } = renderBuilder();

        fireEvent.change(screen.getByRole('combobox', { name: /Region/i }), { target: { value: 'us-central1' } });

        const url = onChange.mock.calls.at(-1)[0];
        expect(url).toBe('https://us-central1-aiplatform.googleapis.com/v1/projects/{project_id}'
            + '/locations/us-central1/publishers/google/models');
    });

    it('fills the project ID into the projects segment, leaving the region placeholder', () => {
        const { onChange } = renderBuilder();

        fireEvent.change(screen.getByRole('textbox', { name: /Project ID/i }), { target: { value: 'my-proj' } });

        const url = onChange.mock.calls.at(-1)[0];
        expect(url).toBe('https://{region}-aiplatform.googleapis.com/v1/projects/my-proj'
            + '/locations/{region}/publishers/google/models');
    });

    it('builds a global URL and disables the region field when Global is selected', () => {
        const { onChange } = renderBuilder();

        fireEvent.click(screen.getByRole('radio', { name: 'Global' }));

        const url = onChange.mock.calls.at(-1)[0];
        expect(url).toBe('https://aiplatform.googleapis.com/v1/projects/{project_id}'
            + '/locations/global/publishers/google/models');
        expect(screen.getByRole('combobox', { name: /Region/i })).toBeDisabled();
    });

    it('populates both fields from a fully resolved regional URL', () => {
        renderBuilder({
            url: 'https://us-east1-aiplatform.googleapis.com/v1/projects/proj-x'
                + '/locations/us-east1/publishers/anthropic/models',
        });

        expect(screen.getByRole('combobox', { name: /Region/i }).value).toBe('us-east1');
        expect(screen.getByRole('textbox', { name: /Project ID/i }).value).toBe('proj-x');
    });

    it('leaves the region empty when the two region slots disagree (hand-edited URL)', () => {
        renderBuilder({
            url: 'https://us-central1-aiplatform.googleapis.com/v1/projects/proj-x'
                + '/locations/europe-west4/publishers/google/models',
        });

        // Mismatched host/locations regions -> unresolved -> field shown empty so it matches the invalid URL.
        expect(screen.getByRole('combobox', { name: /Region/i }).value).toBe('');
        expect(screen.getByRole('textbox', { name: /Project ID/i }).value).toBe('proj-x');
    });

    it('disables the structured fields for a non-Vertex (custom) URL', () => {
        renderBuilder({ url: 'https://my-proxy.internal.example.com/vertex' });

        expect(screen.getByRole('combobox', { name: /Region/i })).toBeDisabled();
        expect(screen.getByRole('textbox', { name: /Project ID/i })).toBeDisabled();
    });
});
