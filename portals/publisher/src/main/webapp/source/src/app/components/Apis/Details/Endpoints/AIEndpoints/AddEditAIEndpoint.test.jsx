/*
 * Copyright (c) 2025, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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
import userEvent from '@testing-library/user-event';
import { render, screen } from 'AppTests/Utils/TestingLibrary';
import { APIContext } from 'AppComponents/Apis/Details/components/ApiContext';
import CONSTS from 'AppData/Constants';
import API from 'AppData/api';
import AddEditAIEndpoint from './AddEditAIEndpoint';

// Not mocking AuthManager here - it would replace the module for the whole test file's
// dependency graph, including inside the shared TestingLibrary harness (which calls the
// real AuthManager.setUser(...) during setup). The harness already logs in as
// MockedUsers.Admin by default, which has every scope isRestricted checks for anyway.
//
// Not using the getMockServer/MSW harness either - it's a known-unreliable pattern in this
// codebase (every existing usage of it is wrapped in describe.skip). Instead, mock the one
// call that actually hits the network directly: AddEditAIEndpoint.jsx's "load all endpoints"
// effect currently fires unconditionally on the very first render (isEditing hasn't flipped
// to true yet at that point), regardless of endpointId, so API.getApiEndpoints must be stubbed
// or every test would attempt a real fetch.
jest.spyOn(API, 'getApiEndpoints').mockResolvedValue({ body: [] });

const AWS_LLM_CONFIG = {
    authenticationConfiguration: {
        enabled: true,
        type: 'aws',
        parameters: { awsServiceName: 'bedrock' },
    },
};

const ROLE_ARN_OLD = 'arn:aws:iam::123456789012:role/OldRole';
const ROLE_ARN_NEW = 'arn:aws:iam::123456789012:role/NewRole';

/**
 * Builds a minimal apiObject with a Bedrock production endpoint already configured, so the
 * component takes the synchronous "default endpoint" hydration path (no API.getApiEndpoint call).
 */
const buildApiObject = (securityOverrides = {}) => ({
    id: 'test-api-id',
    isRevision: false,
    endpointConfig: {
        endpoint_type: 'http',
        production_endpoints: { url: 'https://bedrock-runtime.us-east-1.amazonaws.com' },
        endpoint_security: {
            production: {
                enabled: true,
                type: 'aws',
                accessKey: 'AKIA_TEST_ACCESS_KEY',
                secretKey: '',
                region: 'us-east-1',
                ...securityOverrides,
            },
        },
    },
});

const renderEndpoint = (apiObject, updateAPI = jest.fn(() => Promise.resolve())) => {
    render(
        <APIContext.Provider value={{ api: apiObject, updateAPI }}>
            <AddEditAIEndpoint
                apiObject={apiObject}
                llmProviderEndpointConfiguration={AWS_LLM_CONFIG}
                match={{ params: { id: CONSTS.DEFAULT_ENDPOINT_ID.PRODUCTION } }}
            />
        </APIContext.Provider>,
    );
    return { updateAPI };
};

const clickSave = async (user) => {
    // eslint-disable-next-line testing-library/no-node-access
    const saveButton = document.querySelector('#endpoint-save-btn');
    await user.click(saveButton);
};

describe('AddEditAIEndpoint - Assume IAM Role', () => {
    it('does not show Role ARN/Region/External ID fields when Assume IAM Role is unchecked', () => {
        renderEndpoint(buildApiObject());
        expect(screen.getByRole('checkbox', { name: /enable sts assumerole/i })).not.toBeChecked();
        expect(screen.queryByRole('textbox', { name: /role arn/i })).not.toBeInTheDocument();
    });

    it('hydrates the checkbox and Role ARN from a previously saved config', () => {
        renderEndpoint(buildApiObject({ roleArn: ROLE_ARN_OLD, roleRegion: 'us-east-1' }));
        expect(screen.getByRole('checkbox', { name: /enable sts assumerole/i })).toBeChecked();
        expect(screen.getByDisplayValue(ROLE_ARN_OLD)).toBeInTheDocument();
    });

    it('reveals the role fields once the checkbox is checked', async () => {
        const user = userEvent.setup();
        renderEndpoint(buildApiObject());
        await user.click(screen.getByRole('checkbox', { name: /enable sts assumerole/i }));
        expect(screen.getByRole('textbox', { name: /role arn/i })).toBeInTheDocument();
    });

    it('regression: unchecking after being enabled clears roleArn from the state that actually gets saved', async () => {
        // Bug this protects against: unchecking used to only update local component state via
        // setRoleArn(null) etc., without ever calling saveEndpointSecurityConfig - so the reducer
        // state (and therefore whatever formSave() submits) still had the old roleArn, and the
        // next hydration from the "saved" config would silently re-check the box.
        const user = userEvent.setup();
        const { updateAPI } = renderEndpoint(buildApiObject({ roleArn: ROLE_ARN_OLD, roleRegion: 'us-east-1' }));

        const checkbox = screen.getByRole('checkbox', { name: /enable sts assumerole/i });
        expect(checkbox).toBeChecked();

        await user.click(checkbox); // uncheck
        expect(checkbox).not.toBeChecked();
        expect(screen.queryByRole('textbox', { name: /role arn/i })).not.toBeInTheDocument();

        await clickSave(user);

        expect(updateAPI).toHaveBeenCalledTimes(1);
        const savedSecurityConfig = updateAPI.mock.calls[0][0].endpointConfig.endpoint_security.production;
        expect(savedSecurityConfig.roleArn).toBeNull();
        expect(savedSecurityConfig.roleRegion).toBeNull();
    });

    it('editing Role ARN persists when a real Secret Key is also provided in the same session', async () => {
        // handleOnBlurOnAWSCredentials intentionally no-ops while secretKey is still the '********'
        // placeholder (see AddEditAIEndpoint.jsx) - so persisting a Role ARN edit requires the user
        // to also (re)provide a real Secret Key in the same session, which is what this test does.
        const user = userEvent.setup();
        const { updateAPI } = renderEndpoint(buildApiObject({ roleArn: ROLE_ARN_OLD, roleRegion: 'us-east-1' }));

        const secretKeyField = screen.getByLabelText(/aws secret key/i);
        await user.clear(secretKeyField);
        await user.type(secretKeyField, 'real-secret-value');

        const roleArnField = screen.getByRole('textbox', { name: /role arn/i });
        await user.clear(roleArnField);
        await user.type(roleArnField, ROLE_ARN_NEW);
        await user.tab(); // triggers onBlur with both fields' new values already in state

        await clickSave(user);

        expect(updateAPI).toHaveBeenCalledTimes(1);
        const savedSecurityConfig = updateAPI.mock.calls[0][0].endpointConfig.endpoint_security.production;
        expect(savedSecurityConfig.roleArn).toBe(ROLE_ARN_NEW);
        // The saved secret must never be the literal placeholder text.
        expect(savedSecurityConfig.secretKey).not.toBe('********');
    });

    it('passes roleExternalId through to the saved config when a real Secret Key is also provided', async () => {
        // Same precondition as above: the shared blur handler no-ops while secretKey is still
        // the placeholder, so a real Secret Key must be provided for any field in this group to save.
        const user = userEvent.setup();
        const { updateAPI } = renderEndpoint(buildApiObject({ roleArn: ROLE_ARN_OLD, roleRegion: 'us-east-1' }));

        const secretKeyField = screen.getByLabelText(/aws secret key/i);
        await user.clear(secretKeyField);
        await user.type(secretKeyField, 'real-secret-value');

        const externalIdField = screen.getByRole('textbox', { name: /external id/i });
        await user.type(externalIdField, 'external-id-123');
        await user.tab();

        await clickSave(user);

        const savedSecurityConfig = updateAPI.mock.calls[0][0].endpointConfig.endpoint_security.production;
        expect(savedSecurityConfig.roleExternalId).toBe('external-id-123');
    });
});
