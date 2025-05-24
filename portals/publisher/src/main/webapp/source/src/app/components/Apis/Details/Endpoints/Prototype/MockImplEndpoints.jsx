/*
 *  Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *  WSO2 Inc. licenses this file to you under the Apache License,
 *  Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied. See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 */

import React, { useContext, useEffect, useState, useReducer } from 'react';
import PropTypes from 'prop-types';
import {
    Button, Grid, Paper, Tooltip, Chip, Box, InputAdornment, Typography, Stack, TextField, Alert as MUIAlert
} from '@mui/material';
import { APIContext } from 'AppComponents/Apis/Details/components/ApiContext';
import MockScriptOperation from 'AppComponents/Apis/Details/Endpoints/Prototype/MockScriptOperation';
import GenericOperation from 'AppComponents/Apis/Details/Resources/components/GenericOperation';
import GroupOfOperations from 'AppComponents/Apis/Details/Resources/components/GroupOfOperations';
import CONSTS from 'AppData/Constants';
import { Progress, Alert } from 'AppComponents/Shared';
import { AutoAwesome, Launch, Settings } from '@mui/icons-material';
import MockConfiguration from 'AppComponents/Apis/Details/Endpoints/Prototype/MockConfiguration';
import { app } from 'Settings';
import MockLandingPage from 'AppComponents/Apis/Details/Endpoints/Prototype/MockLandingPage';
import { LoadingButton } from '@mui/lab';
import { FormattedMessage, useIntl } from 'react-intl';
import { usePublisherSettings } from 'AppComponents/Shared/AppContext';
/**
 * The mock impl endpoints base component.
 * This component lists the api resources to add custom mediation scripts.
 *
 * @param {any} props The input props.
 * @return {any} The JSX representation of the component.
 * */
function MockImplEndpoints({ paths, swagger, updatePaths, updateMockDataset, setSaveDisable }) {
    const { api } = useContext(APIContext);
    const intl = useIntl();
    const [progress, setProgress] = useState(true);
    const [mockScripts, setMockScripts] = useState(null);
    const [currentConfig, setCurrentConfig] = useState({});
    const [openConfig, setOpenConfig] = useState(false);
    const xMediationScriptProperty = 'x-mediation-script';
    const xWso2MockDatasetProperty = 'x-wso2-mock-dataset';
    const simulationSplitString = '// Simulation Of Errors and Latency'
    const [mockConfig, setMockConfig] = useState({
        useAI: false,
        config: {
            instructions: '',
            simulationDetails: {
                api: { latency: 0, error: '0' }
            },
            modifyDetails: {}
        },
    });
    const [, forceUpdate] = useReducer(x => x + 1, 0)
    // Change aiLoadingStates to hold either null or the currently modifying path_method string
    const [aiLoadingStates, setAiLoadingStates] = useState(null);
    const [nullScripts, setNullScripts] = useState([]);
    const { data: settings } = usePublisherSettings();
    const hasAuthToken = settings?.aiAuthTokenProvided
    const [isAllScriptsNull, setIsAllScriptsNull] = useState(true);

    const splitContentAndSimulation = (content) => {
        const index = content.indexOf(simulationSplitString);
        if (index === -1) {
            return { content, simulationScript: '' };
        }
        const simulationScript = content.substring(index + simulationSplitString.length).trim() || '';
        return { content: content.substring(0, index).trim(), simulationScript };
    };

    const setSimulationConfig = (simulationScript, path, verb) => {
        const method = verb.toLowerCase();
        if (simulationScript !== null) {
            const apiSimulationMatch = simulationScript.match(/var apiSimulation = (true|false)/);
            const latencyMatch = simulationScript.match(/sleepFor\((\d+)\);/);
            const errorMatch = simulationScript.match(/var errorSimulation = '(\d+)';/);
            if (latencyMatch || errorMatch) {
                const latencySim = latencyMatch ? parseInt(latencyMatch[1], 10) : 0;
                const errorSim = errorMatch ? errorMatch[1] : '0';
                if (apiSimulationMatch && apiSimulationMatch[1] === 'true') { // API-level config
                    setMockConfig((prev) => ({
                        ...prev, config: {
                            ...prev.config,
                            simulationDetails: {
                                ...prev.config.simulationDetails,
                                api: {
                                    latency: latencySim,
                                    error: errorSim,
                                },
                            },
                        },
                    }));
                } else { // Method-level config
                    setMockConfig((prev) => ({
                        ...prev,
                        config: {
                            ...prev.config,
                            simulationDetails: {
                                ...prev.config.simulationDetails,
                                [path]: {
                                    ...(prev.config.simulationDetails?.[path] || {}),
                                    [method]: {
                                        latency: latencySim,
                                        error: errorSim,
                                    },
                                },
                            },
                        },
                    }));
                }
            }
        }
    };

    useEffect(() => {
        const fetchMockScripts = async () => {
            try {
                setSaveDisable(true)
                const response = await api.getGeneratedMockScriptsOfAPI(api.id);
                const tempNullScripts = []
                response.obj.list = response.obj.list.map((methodObj) => {
                    const { content, simulationScript } =
                        splitContentAndSimulation(methodObj.content);
                    setSimulationConfig(simulationScript, methodObj.path, methodObj.verb);
                    if (content.trim().length === 0) {
                        const newEntry = `${methodObj.verb.toLowerCase()} - ${methodObj.path}`;
                        tempNullScripts.push(newEntry);
                    }
                    return {
                        ...methodObj,
                        content,
                        simulationScript
                    };
                });
                setNullScripts(tempNullScripts);
                setMockScripts(response.obj.list);
                if (tempNullScripts.length !== response.obj.list.length) {
                    setIsAllScriptsNull(false);
                    setSaveDisable(false);
                }
            } catch (e) {
                Alert.error(
                    intl.formatMessage({
                        id: 'Apis.Details.Endpoints.Prototype.MockImplEndpoints.error.fetch',
                        defaultMessage: 'Something went wrong while fetching example mock scripts!',
                    }));
            } finally {
                setProgress(false);
            }
        };
        fetchMockScripts();
        if (swagger[xWso2MockDatasetProperty]) {
            setMockConfig((prev) => ({ ...prev, useAI: true }));
        }
    }, []);

    const generateMockScripts = async (useAI, payload) => {
        let response;
        if (useAI) {
            response = await api.generateAIMockScripts(api.id, false, payload);
        }else{
            response = await api.generateMockScripts(api.id, false); // false to not update the swagger
        }
        const tmpScripts = [];
        const tmpPaths = paths;
        const modify = payload?.modify;
        if (modify) {
            const { simulationScript } =
                splitContentAndSimulation(paths[modify.path][modify.method][xMediationScriptProperty] || '');
            tmpPaths[modify.path][modify.method][xMediationScriptProperty] =
                response.obj.paths[modify.path][modify.method][xMediationScriptProperty] +
                simulationSplitString + simulationScript;
            mockScripts.forEach((methodObj) => {
                if (methodObj.path === modify.path && methodObj.verb.toLowerCase() === modify.method) {
                    tmpScripts.push({
                        ...methodObj,
                        content: response.obj.paths[modify.path][modify.method][xMediationScriptProperty],
                    });
                } else {
                    tmpScripts.push(methodObj);
                }
            });

        } else {
            Object.entries(response.obj.paths).forEach(([path, methods]) => {
                Object.entries(methods).forEach(([method, data]) => {
                    if (method === 'parameters') {
                        return; // Skip this loop iteration
                    }
                    const { content, simulationScript } =
                        splitContentAndSimulation(data[xMediationScriptProperty]);
                    setSimulationConfig(simulationScript, path, method)
                    tmpScripts.push({
                        path,
                        verb: method.toUpperCase(),
                        content,
                        simulationScript
                    });
                    tmpPaths[path][method][xMediationScriptProperty] = data[xMediationScriptProperty];
                });
            });
        }
        setMockScripts(tmpScripts);
        updatePaths(tmpPaths);
        return response;
    }

    const handleModifyMethod = async (path, method, instructions) => {
        const isThisScriptNull = nullScripts.includes(`${method} - ${path}`)
        if (instructions === '' && !isThisScriptNull) {
            Alert.error(
                intl.formatMessage({
                    id: 'Apis.Details.Endpoints.Prototype.MockImplEndpoints.error.noInstructions',
                    defaultMessage: 'No instructions to modify',
                })
            );
            return;
        }
        setAiLoadingStates(`${path}_${method}`); // Set AI loading state for this endpoint
        setSaveDisable(true);
        const script = paths[path][method][xMediationScriptProperty] || '';
        const { content, simulationScript } = splitContentAndSimulation(script)
        const payload = {
            instructions: isThisScriptNull ? 'Generate mock scripts for the specified endpoint' : instructions,
            script: content.length === 0 ? 'No Script' : content,
            modify: { path, method, isDefaultScript: !mockConfig.useAI }
        }
        try {
            await generateMockScripts(true, payload);
            setSimulationConfig(simulationScript, path, method);
            if (nullScripts.includes(`${method} - ${path}`)) {
                setNullScripts(prev => prev.filter(item => item !== `${method} - ${path}`));
            }
            forceUpdate();
            Alert.info(
                intl.formatMessage({
                    id: 'Apis.Details.Endpoints.Prototype.MockImplEndpoints.success.modify',
                    defaultMessage: 'Successfully modified the mock script!',
                })
            );
        } catch (e) {
            Alert.error(
                intl.formatMessage({
                    id: 'Apis.Details.Endpoints.Prototype.MockImplEndpoints.error.generate',
                    defaultMessage: 'Error generating mock scripts!',
                })
            );
        } finally {
            setAiLoadingStates(null); // Reset AI loading state
            if (aiLoadingStates === null) {
                setSaveDisable(false);
            }
        }
    }

    const handleGenerateScripts = async (useAI, usePreviousScripts = false) => {
        setProgress(true);
        setSaveDisable(true);
        try {
            const payload = {
                instructions: mockConfig.config.instructions.length > 0 ? mockConfig.config.instructions : undefined,
                usePreviousScripts
            }
            const response = await generateMockScripts(useAI, payload)
            if (useAI) updateMockDataset({ [xWso2MockDatasetProperty]: response.obj[xWso2MockDatasetProperty] });
            else updateMockDataset({ [xWso2MockDatasetProperty]: undefined });
            forceUpdate();
            Alert.info(
                intl.formatMessage({
                    id: 'Apis.Details.Endpoints.Prototype.MockImplEndpoints.success.generate',
                    defaultMessage: 'Successfully generated mock scripts!',
                })
            );
            setMockConfig({ ...mockConfig, useAI })
            setIsAllScriptsNull(false);
            setSaveDisable(false);
            setNullScripts([]);
        } catch (e) {
            if (useAI) {
                Alert.error(
                    intl.formatMessage({
                        id: 'Apis.Details.Endpoints.Prototype.MockImplEndpoints.error.aiGenerate',
                        defaultMessage: 'Error generating mock scripts with AI! Please try again.',
                    })
                );
                setMockConfig({
                    ...mockConfig, useAI: false
                })
            }
            else {
                Alert.error(
                    intl.formatMessage({
                        id: 'Apis.Details.Endpoints.Prototype.MockImplEndpoints.error.staticGenerate',
                        defaultMessage: 'Error generating mock scripts!',
                    })
                );
            }
        } finally {
            setProgress(false);
        }
    };

    const handleConfigClick = (endpointConfig = {}) => {
        const { path, method } = endpointConfig;
        setCurrentConfig({ path, method })
        setOpenConfig(true);
    };

    const authTokenNotProvidedWarning = (
        <FormattedMessage
            id='Apis.Details.Endpoints.Prototype.MockImplEndpoints.warning.authTokenMissing'
            defaultMessage={'You must provide a token to start using the AI-Assisted API mock server. To obtain one, '
                + 'follow the steps 1 to 3 provided under {apiAiChatDocLink} '}
            values={{
                apiAiChatDocLink: (
                    <a
                        id='api-chat-doc-link'
                        href='https://apim.docs.wso2.com/en/4.5.0/design/create-api/create-api-with-ai/'
                        target='_blank'
                        rel='noopener noreferrer'
                    >
                        Create APIs with AI
                        <Launch
                            style={{ marginLeft: '2px' }}
                            fontSize='small'
                        />
                    </a>
                ),
            }}
        />
    );

    const GenericOperationPerResource = (path, method, operation) => {
        const isScriptNull = nullScripts.includes(`${method} - ${path}`)
        const currentKey = `${path}_${method}`;
        return (
            <GenericOperation target={path} verb={method} handleConfigClick={() => handleConfigClick({ path, method })}>
                {hasAuthToken && (
                    <div>
                        <Stack direction='column' maxWidth='calc(100% - 9px)'
                            spacing={2} alignItems='flex-start' sx={{ my: 2 }}>
                            <TextField
                                fullWidth
                                multiline
                                minRows={1}
                                maxRows={4}
                                label={isScriptNull ? 'Generate With AI' : 'Modify With AI'}
                                placeholder='e.g. Respond with Capitalized letters'
                                value={mockConfig?.config?.modifyDetails?.[path]?.[method] || ''}
                                disabled={isScriptNull ||
                                    (aiLoadingStates !== null && aiLoadingStates !== currentKey)}
                                onChange={(e) =>
                                    setMockConfig((prev) => ({
                                        ...prev,
                                        config: {
                                            ...prev.config,
                                            modifyDetails: {
                                                ...prev.config.modifyDetails,
                                                [path]: {
                                                    ...prev.config.modifyDetails[path],
                                                    [method]: e.target.value,
                                                },
                                            },
                                        },
                                    }))
                                }
                                sx={{ flex: 1 }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position='end'>
                                            <Tooltip title={`${isScriptNull ? 'Generate' : 'Modify'} with AI`}>
                                                <span>
                                                    <LoadingButton
                                                        variant='contained'
                                                        onClick={() =>
                                                            handleModifyMethod(
                                                                path,
                                                                method,
                                                                mockConfig.config.modifyDetails?.[path]?.[method] || ''
                                                            )
                                                        }
                                                        loading={aiLoadingStates === currentKey}
                                                        loadingPosition='end'
                                                        disabled={
                                                            isScriptNull ||
                                                            aiLoadingStates === currentKey ||
                                                            progress ||
                                                            (aiLoadingStates !== null && aiLoadingStates !== currentKey)
                                                        }
                                                        endIcon={<AutoAwesome />}
                                                        sx={{ whiteSpace: 'nowrap' }}
                                                    >
                                                        {aiLoadingStates === currentKey ?
                                                            'Modifying...' : `${isScriptNull
                                                                ? 'Generate' : 'Modify'}`}
                                                    </LoadingButton>
                                                </span>
                                            </Tooltip>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Stack>
                    </div>
                )}
                {(aiLoadingStates !== currentKey) && (
                    <MockScriptOperation
                        key={forceUpdate}
                        resourcePath={path}
                        resourceMethod={method}
                        operation={operation}
                        updatePaths={updatePaths}
                        paths={paths}
                        mockScripts={mockScripts}
                        simulationSplitString={simulationSplitString}
                    />
                )}
            </GenericOperation>
        );
    }

    return (
        <>
            <Grid container spacing={2} alignItems='stretch'>
                <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                        <Stack direction='row' spacing={2} alignItems='center' justifyContent='space-between'>
                            <Typography variant='h5' gutterBottom>
                                {isAllScriptsNull ?
                                    <FormattedMessage
                                        id='Apis.Details.Endpoints.Prototype.MockImplEndpoints.mockImplementation'
                                        defaultMessage='Mock implementation'
                                    /> :
                                    <FormattedMessage
                                        id='Apis.Details.Endpoints.Prototype.MockImplEndpoints.mockImplementationType'
                                        defaultMessage='{type} mock implementation'
                                        values={{ type: mockConfig.useAI ? 'AI-assisted' : 'Static' }}
                                    />
                                }
                            </Typography>
                            <Tooltip title='Configure simulations of mock endpoints'>
                                <Button disabled={progress || isAllScriptsNull} color='inherit'
                                    onClick={handleConfigClick} endIcon={<Settings />}>
                                    <FormattedMessage
                                        id={'Apis.Details.Endpoints.Prototype.' +
                                            'MockImplEndpoints.action.simulationsForAPIButton'}
                                        defaultMessage='Configure Simulations for the API'
                                    />
                                </Button>
                            </Tooltip>
                        </Stack>
                        {progress ? <Progress message='Generating Mocks' /> : (
                            <>
                                {isAllScriptsNull ? <MockLandingPage
                                    hasAuthToken={hasAuthToken}
                                    authTokenNotProvidedWarning={authTokenNotProvidedWarning}
                                    handleGenerateScripts={handleGenerateScripts}
                                    progress={progress}
                                /> : (
                                    <>
                                        {nullScripts.length > 0 && (
                                            <MUIAlert severity='warning' sx={{ my: 1 }}>
                                                <Stack direction='row' alignItems='center' spacing={1} flexWrap='wrap'>
                                                    <Typography variant='body1'>
                                                        <FormattedMessage
                                                            id={'Apis.Details.Endpoints.Prototype.' +
                                                                'MockImplEndpoints.missingScripts'}
                                                            defaultMessage='Mock scripts are missing for:'
                                                        />
                                                    </Typography>
                                                    {nullScripts.map((entry) => (
                                                        <Chip
                                                            key={entry}
                                                            label={entry}
                                                            size='small'
                                                            variant='outlined'
                                                        />
                                                    ))}
                                                    <Typography variant='body1'>
                                                        <FormattedMessage
                                                            id={'Apis.Details.Endpoints.Prototype.' +
                                                                'MockImplEndpoints.reGeneratePrompt'}
                                                            defaultMessage='Please re-generate.'
                                                        />
                                                    </Typography>
                                                </Stack>
                                            </MUIAlert>

                                        )}
                                        <Stack 
                                            direction='row' 
                                            mt={2} spacing={2} 
                                            alignItems='center' 
                                            justifyContent='center'>
                                            <Paper
                                                sx={{
                                                    p: 3,
                                                    width: '100%',
                                                    borderRadius: 2,
                                                    boxShadow: 1,
                                                }}
                                            >

                                                <Stack direction='row' spacing={2} alignItems='flex-start'>
                                                    {/* Left section */}
                                                    <Box 
                                                        flex={1} 
                                                        display='flex' 
                                                        flexDirection='column' 
                                                        justifyContent='space-between'>
                                                        <Box mb={2}>
                                                            <Typography variant='h6' sx={{ fontWeight: 500, mb: 1 }}>
                                                                {mockConfig.useAI ? (
                                                                    <FormattedMessage
                                                                        id={'Apis.Details.Endpoints.' +
                                                                            'Prototype.MockImplEndpoints.aiReady'}
                                                                        defaultMessage={'AI-assisted mock '+ 
                                                                            'server is ready!'}
                                                                    />
                                                                ) : (
                                                                    <FormattedMessage
                                                                        id={'Apis.Details.Endpoints.Prototype.' +
                                                                            'MockImplEndpoints.moreRealisticMockServer'}
                                                                        defaultMessage={'Want a more realistic mock ' +
                                                                        'server?'}
                                                                    />
                                                                )}
                                                            </Typography>

                                                            <Typography variant='body1' color='textSecondary'>
                                                                {mockConfig.useAI ? (
                                                                    <FormattedMessage
                                                                        id={'Apis.Details.Endpoints.Prototype.' +
                                                                            'MockImplEndpoints.aiReadyDescription'}
                                                                        defaultMessage={'Your AI-assisted mock ' +
                                                                            'server is ready to generate realistic ' +
                                                                            'responses.'}
                                                                    />
                                                                ) : (
                                                                    <FormattedMessage
                                                                        id={'Apis.Details.Endpoints.Prototype.' +
                                                                        'MockImplEndpoints.tryAIDescription'}
                                                                        defaultMessage={'Try our AI-assisted mock ' +
                                                                            'server for realistic responses.'}
                                                                    />
                                                                )}
                                                            </Typography>

                                                            {!hasAuthToken && (
                                                                <MUIAlert severity='warning' sx={{ my: 1 }}>
                                                                    <Typography variant='body1'>
                                                                        {authTokenNotProvidedWarning}
                                                                    </Typography>
                                                                </MUIAlert>
                                                            )}
                                                        </Box>

                                                        {/* Instructions */}
                                                        {hasAuthToken && (
                                                            <TextField
                                                                fullWidth
                                                                label='Instructions'
                                                                multiline
                                                                minRows={1}
                                                                maxRows={6}
                                                                placeholder='e.g. Make all responses in uppercase'
                                                                value={mockConfig?.config?.instructions}
                                                                onChange={(e) =>
                                                                    setMockConfig((prev) => ({
                                                                        ...prev,
                                                                        config: {
                                                                            ...prev.config,
                                                                            instructions: e.target.value,
                                                                        },
                                                                    }))
                                                                }
                                                            />
                                                        )}

                                                        {/* Buttons aligned left and right at bottom */}
                                                        <Box display='flex' justifyContent='space-between' mt={2}>
                                                            <Tooltip
                                                                title={
                                                                    <FormattedMessage
                                                                        id={'Apis.Details.Endpoints.Prototype.' +
                                                                        'MockImplEndpoints.action.' +
                                                                        'generateWithInstructions'}
                                                                        defaultMessage={'Generate AI-assisted mock '
                                                                            + 'scripts with custom instructions'}
                                                                    />
                                                                }
                                                            >
                                                                <Button
                                                                    variant='contained'
                                                                    onClick={() => 
                                                                        handleGenerateScripts(true, mockConfig.useAI)
                                                                    }
                                                                    disabled={(mockConfig.useAI && 
                                                                        mockConfig.config.instructions.length === 0)
                                                                        || progress}
                                                                    endIcon={ <AutoAwesome />}
                                                                >
                                                                    {mockConfig.useAI ? (
                                                                        <FormattedMessage
                                                                            id={'Apis.Details.Endpoints.Prototype.' +
                                                                                'MockImplEndpoints.action.' +
                                                                                'generateWithAI'}
                                                                            defaultMessage='Modify'
                                                                        />
                                                                    ) : (
                                                                        <FormattedMessage
                                                                            id={'Apis.Details.Endpoints.Prototype.' +
                                                                                'MockImplEndpoints.action.' +
                                                                                'generateButton'}
                                                                            defaultMessage='Generate'
                                                                        />
                                                                    )}
                                                                </Button>
                                                            </Tooltip>

                                                            {mockConfig.useAI && (
                                                                <Tooltip
                                                                    title={
                                                                        <FormattedMessage
                                                                            id={'Apis.Details.Endpoints.Prototype.' +
                                                                                'MockImplEndpoints.action.fallback'}
                                                                            defaultMessage={'Switch back to static '+
                                                                                'mock scripts generated by examples'}
                                                                        />
                                                                    }
                                                                >
                                                                    <Button
                                                                        variant='outlined'
                                                                        color='inherit'
                                                                        onClick={() => handleGenerateScripts(false)}
                                                                        disabled={progress}
                                                                    >
                                                                        <FormattedMessage
                                                                            id={'Apis.Details.Endpoints.Prototype.' +
                                                                                'MockImplEndpoints.action.' +
                                                                                'fallbackButton'}
                                                                            defaultMessage={'Switch to ' +
                                                                            'static mock scripts'}
                                                                        />
                                                                    </Button>
                                                                </Tooltip>
                                                            )}
                                                        </Box>
                                                    </Box>

                                                    {/* Fixed Image on Right */}
                                                    <Box>
                                                        <img
                                                            alt='API Mock Assistant'
                                                            src={`${app.context}` +
                                                                '/site/public/images/ai/' +
                                                                'APIchatassistantImageWithColour.svg'}
                                                            style={{
                                                                width: '80px',
                                                                height: 'auto',
                                                                borderRadius: '4px',
                                                                position: 'sticky',
                                                                top: '30px'
                                                            }}
                                                        />
                                                    </Box>
                                                </Stack>

                                            </Paper>
                                        </Stack>

                                        <Grid container spacing={2} mt={2}>
                                            {Object.entries(paths).map(([path, methods]) => (
                                                <Grid item xs={12} key={path}>
                                                    <GroupOfOperations openAPI={swagger} tag={path}>
                                                        <Grid container spacing={1} direction='column'>
                                                            {Object.entries(methods).map(([method, operation]) => (
                                                                CONSTS.HTTP_METHODS.includes(method) && (
                                                                    <Grid item key={`${path}/${method}`}>
                                                                        {GenericOperationPerResource(path, 
                                                                            method, operation)}
                                                                    </Grid>
                                                                )
                                                            ))}
                                                        </Grid>
                                                    </GroupOfOperations>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </>)
                                }
                            </>)}
                    </Paper>
                </Grid>
            </Grid>
            <MockConfiguration
                open={openConfig}
                onClose={() => setOpenConfig(false)}
                currentConfig={currentConfig}
                configuration={mockConfig}
                setConfiguration={setMockConfig}
                mockScripts={mockScripts}
                setMockScripts={setMockScripts}
                paths={paths}
                updatePaths={updatePaths}
                simulationSplitString={simulationSplitString}
            />
        </>
    );
}

MockImplEndpoints.propTypes = {
    paths: PropTypes.shape({}).isRequired,
    updatePaths: PropTypes.func.isRequired,
    endpointConfig: PropTypes.shape({}).isRequired,
    swagger: PropTypes.shape({}).isRequired,
    updateMockDataset: PropTypes.func.isRequired,
    setSaveDisable: PropTypes.func.isRequired
};

export default React.memo(MockImplEndpoints);
