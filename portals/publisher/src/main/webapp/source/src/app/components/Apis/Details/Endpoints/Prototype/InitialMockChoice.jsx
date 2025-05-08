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
import { FormattedMessage } from 'react-intl';
import {
    Button, Paper, Divider,
    Typography, Stack, Alert as MUIAlert
} from '@mui/material';
import {
    app
} from 'Settings';
import {
    AutoAwesome, Memory,
    SmartToy, Speed, DataObject, SyncAlt, Settings
} from '@mui/icons-material';

const InitialMockChoice = ({hasAuthToken, authTokenNotProvidedWarning, handleGenerateScripts, progress}) => {
    const FeatureItem = ({ icon, text }) => (
        <Stack direction='row' alignItems='center' spacing={1}>
            {icon}
            <Typography variant='body2' color='text.secondary'>{text}</Typography>
        </Stack>
    );

    return (
        <Stack spacing={2} sx={{ maxWidth: 1000, mx: 'auto', px: 3, py: 6 }}>
            <Stack
                direction='row'
                alignItems='center'
                justifyContent='center'
                spacing={4}
                sx={{ textAlign: 'center' }}
            >
                <Typography variant='h4' sx={{ fontWeight: 600 }}>
                    <FormattedMessage
                        id='Apis.Details.Endpoints.Prototype.MockImplEndpoints.mockServerBehavior'
                        defaultMessage='How would you like your mock server to behave?'
                    />
                </Typography>
                <img
                    alt='API Mock Assistant'
                    src={`${app.context}/site/public/images/ai/APIchatassistantImageWithColour.svg`}
                    style={{ width: 50, height: 'auto', borderRadius: '4px' }}
                />
            </Stack>

            {!hasAuthToken &&
                <MUIAlert severity='warning' sx={{ my: 0 }}>
                    <Typography variant='body1'>
                        {authTokenNotProvidedWarning}
                    </Typography>
                </MUIAlert>}

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
                <Paper
                    elevation={6}
                    sx={{
                        flex: 1,
                        p: 3,
                        borderRadius: 4,
                        border: '2px solid',
                        borderColor: 'primary.main',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                    }}
                >
                    <Stack spacing={2}>
                        <Stack direction='row' alignItems='center' spacing={1}>
                            <SmartToy fontSize='large' color='primary' />
                            <Typography variant='h6' sx={{ fontWeight: 600 }}>
                                <FormattedMessage
                                    id='Apis.Details.Endpoints.Prototype.MockImplEndpoints.aiAssistedMockServer'
                                    defaultMessage='AI-assisted mock server'
                                />
                            </Typography>
                        </Stack>

                        <Typography variant='body1'>
                            <FormattedMessage
                                id='Apis.Details.Endpoints.Prototype.MockImplEndpoints.smartRealisticMocks'
                                defaultMessage='Smart, realistic mocks tailored from your API definition using AI.'
                            />
                        </Typography>

                        <Divider />

                        <Stack spacing={1} mt={1}>
                            <FeatureItem icon={<AutoAwesome color='primary' />}
                                text='Realistic responses' />
                            <FeatureItem icon={<DataObject color='primary' />}
                                text='Pre-populated data for testing' />
                            <FeatureItem icon={<SyncAlt color='primary' />}
                                text='Data persistence across endpoints' />
                            <FeatureItem icon={<Settings color='primary' />}
                                text='Latency & error simulation' />
                        </Stack>
                    </Stack>

                    <Button
                        variant='contained'
                        size='large'
                        fullWidth
                        onClick={() => handleGenerateScripts(true)}
                        disabled={!hasAuthToken || progress}
                        sx={{ mt: 3, fontWeight: 600 }}
                    >
                        <FormattedMessage
                            id='Apis.Details.Endpoints.Prototype.MockImplEndpoints.action.useAIMockServerButton'
                            defaultMessage='Use AI Mock Server'
                        />
                    </Button>
                </Paper>

                <Paper
                    elevation={2}
                    sx={{
                        flex: 1,
                        p: 3,
                        borderRadius: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                    }}
                >
                    <Stack spacing={2}>
                        <Stack direction='row' alignItems='center' spacing={1}>
                            <Memory fontSize='large' color='action' />
                            <Typography variant='h6' sx={{ fontWeight: 600 }}>
                                <FormattedMessage
                                    id='Apis.Details.Endpoints.Prototype.MockImplEndpoints.staticMockServer'
                                    defaultMessage='Static mock server'
                                />
                            </Typography>
                        </Stack>

                        <Typography variant='body1'>
                            <FormattedMessage
                                id='Apis.Details.Endpoints.Prototype.MockImplEndpoints.basicQuickMocks'
                                defaultMessage='Basic and quick mocks for rapid setup and initial testing needs.'
                            />
                        </Typography>

                        <Divider />

                        <Stack spacing={1} mt={1}>
                            <FeatureItem icon={<Speed color='disabled' />}
                                text='Instant setup, minimal config' />
                            <FeatureItem icon={<Settings color='disabled' />}
                                text='Latency & error simulation' />
                        </Stack>
                    </Stack>

                    <Button
                        variant='outlined'
                        size='large'
                        fullWidth
                        onClick={() => handleGenerateScripts(false)}
                        sx={{ mt: 3, fontWeight: 600 }}
                    >
                        <FormattedMessage
                            id='Apis.Details.Endpoints.Prototype.MockImplEndpoints.action.useStaticMockServerButton'
                            defaultMessage='Use Static Mock Server'
                        />
                    </Button>
                </Paper>
            </Stack>
        </Stack>
    );
};

export default InitialMockChoice;