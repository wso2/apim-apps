/*
 *  Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *  WSO2 Inc. licenses this file to you under the Apache License,
 *  Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License. You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied. See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 */

import React, { useContext, useEffect, useState, useReducer } from 'react';
import PropTypes from 'prop-types';
import {
    Button, Grid, Paper, Tooltip,
    Typography, Stack, TextField, InputAdornment, Alert as MUIAlert
} from '@mui/material';
import { APIContext } from 'AppComponents/Apis/Details/components/ApiContext';
import MockScriptOperation from 'AppComponents/Apis/Details/Endpoints/Prototype/MockScriptOperation';
import GenericOperation from 'AppComponents/Apis/Details/Resources/components/GenericOperation';
import GroupOfOperations from 'AppComponents/Apis/Details/Resources/components/GroupOfOperations';
import CONSTS from 'AppData/Constants';
import { Progress, Alert } from 'AppComponents/Shared';
import { AutoAwesome, Refresh, Settings, Launch } from '@mui/icons-material';
import MockConfiguration from 'AppComponents/Apis/Details/Endpoints/Prototype/MockConfiguration';
import {
    app
} from 'Settings';
import { LoadingButton } from '@mui/lab';
import { FormattedMessage } from 'react-intl';
import { usePublisherSettings } from 'AppComponents/Shared/AppContext';


/**
 * The mock impl endpoints base component.
 * This component lists the api resources to add custom mediation scripts.
 *
 * @param {any} props The input props.
 * @return {any} The JSX representation of the component.
 * */
function MockImplEndpoints({ paths, swagger, updatePaths, updateMockDB }) {
    const { api } = useContext(APIContext);
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState(true);
    const [mockScripts, setMockScripts] = useState(null);
    const [currentConfig, setCurrentConfig] = useState({});
    const [openConfig, setOpenConfig] = useState(false);
    const xMediationScriptProperty = 'x-mediation-script';
    const xWso2MockDBProperty = 'x-wso2-mockDB';
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
    const [showInstructions, setShowInstructions] = useState(false);
    const [aiLoadingStates, setAiLoadingStates] = useState({}); // Track AI loading state for individual endpoints
    const [hasNullInScripts, setHasNullInScripts] = useState(false);
    const { data: settings } = usePublisherSettings();
    const hasAuthToken = settings && settings?.aiAuthTokenProvided

    const splitSimulationPart = (content) => {
        const index = content.indexOf(simulationSplitString);
        if (index === -1) {
            return { content, simulationPart: '' };
        }
        const simulationPart = content.substring(index + simulationSplitString.length).trim() || null;
        return { content: content.substring(0, index).trim(), simulationPart };
    };

    const setSimulationConfig = (simulationPart, path, verb) => {
        const method = verb.toLowerCase();
        if (simulationPart !== null) {
            const apiSimMatch = simulationPart.match(/var apiSim = (true|false)/);
            const latencyMatch = simulationPart.match(/sleepFor\((\d+)\);/);
            const errorMatch = simulationPart.match(/var errSim = '(\d+)';/);
            if (latencyMatch || errorMatch) {
                const latencySim = latencyMatch ? parseInt(latencyMatch[1], 10) : 0;
                const errorSim = errorMatch ? errorMatch[1] : '0';
                if (apiSimMatch && apiSimMatch[1] === 'true') { // API-level config
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
                const response = await api.getGeneratedMockScriptsOfAPI(api.id);
                response.obj.list = response.obj.list.map((methodObj) => {
                    if (methodObj.content === '') {
                        setHasNullInScripts(true);
                    }
                    const { content, simulationPart } =
                        splitSimulationPart(methodObj.content, methodObj.path, methodObj.verb);
                    setSimulationConfig(simulationPart, methodObj.path, methodObj.verb)
                    return {
                        ...methodObj,
                        content,
                        simulationPart
                    };
                });
                setMockScripts(response.obj.list);
            } catch (e) {
                console.error(e);
                Alert.error('Something went wrong while fetching example mock scripts!');
                setError(e);
                console.log(error)
            } finally {
                setProgress(false);
            }
        };
        fetchMockScripts();
        if (swagger[xWso2MockDBProperty]) {
            setMockConfig((prev) => ({ ...prev, useAI: true }));
        }
    }, []);

    const generateMockScripts = async (useAI, payload, modify = undefined) => {
        const response = await api.generateMockScripts(api.id, useAI, payload);
        const tmpScripts = [];
        const tmpPaths = paths;
        if (modify) {
            const { simulationPart } =
                splitSimulationPart(paths[modify.path][modify.method][xMediationScriptProperty]);
            tmpPaths[modify.path][modify.method][xMediationScriptProperty] =
                response.obj.paths[modify.path][modify.method][xMediationScriptProperty] +
                simulationSplitString + simulationPart;
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
                    const { content, simulationPart } =
                        splitSimulationPart(data[xMediationScriptProperty], path, method);
                    setSimulationConfig(simulationPart, path, method)
                    tmpScripts.push({
                        path,
                        verb: method.toUpperCase(),
                        content,
                        simulationPart
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
        if (instructions === '') {
            Alert.error('No Instructions to modify');
            return;
        }
        setAiLoadingStates((prev) => (
            { ...prev, [`${path}_${method}`]: true })); // Set AI loading state for this endpoint
        const script = paths[path][method][xMediationScriptProperty];
        const { content, simulationPart } = splitSimulationPart(script)
        const payload = {
            instructions,
            script: content,
            modify: { path, method, defaultScript: !mockConfig.useAI }
        }
        try {
            await generateMockScripts(true, payload, payload.modify);
            setSimulationConfig(simulationPart, path, method);
            forceUpdate();
            Alert.info('Successfully Modified the mock script!');
        } catch (e) {
            Alert.error('Error generating mock scripts!');
        } finally {
            setAiLoadingStates((prev) => ({ ...prev, [`${path}_${method}`]: false })); // Reset AI loading state
        }

    }

    const handleGenerateScripts = async (useAI) => {
        setProgress(true);
        try {
            const payload = {
                instructions: showInstructions ? mockConfig.config.instructions : undefined
            }
            const response = await generateMockScripts(useAI, payload)
            if (useAI) updateMockDB({ [xWso2MockDBProperty]: response.obj[xWso2MockDBProperty] });
            else updateMockDB({ [xWso2MockDBProperty]: undefined });
            forceUpdate();
            Alert.info('Successfully generated mock scripts!');
            setMockConfig({ ...mockConfig, useAI })
            setShowInstructions(false);
            setHasNullInScripts(false);
        } catch (e) {
            console.error(e);
            if (useAI) {
                Alert.error('Error generating mock scripts with AI!. Please try again.')
                setMockConfig({
                    ...mockConfig, useAI: false
                })
            }
            else {
                Alert.error('Error generating mock scripts!');
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
            id='Apis.Details.Endpoints.Prototype.MockedOAS.warning.authTokenMissing'
            defaultMessage={'You must provide a token to start using the AI Assisted API Mock Server. To obtain one, '
                + 'follow the steps provided under {apiAiChatDocLink} '}
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

    function GenericOperationPerResource(path, method, operation) {
        return <GenericOperation target={path} verb={method}
            handleConfigClick={() => handleConfigClick({ path, method })}>
            {mockConfig.useAI && hasAuthToken && (
                <div>
                    <TextField
                        fullWidth
                        sx={{ maxWidth: 'calc(100% - 250px)', my: 2 }}
                        label='Modify With AI'
                        placeholder='e.g. Respond with Capitalized letters'
                        value={mockConfig?.config?.modifyDetails?.[path]?.[method]}
                        onChange={(e) => setMockConfig((prev) => ({
                            ...prev, config: {
                                ...prev.config, modifyDetails: {
                                    ...prev.config.modifyDetails,
                                    [path]: {
                                        ...prev.config.modifyDetails[path],
                                        [method]: e.target.value,
                                    },
                                },
                            },
                        }))} // Update instructions on change
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position='end' sx={{ alignItems: 'center', display: 'flex' }}>
                                    <LoadingButton
                                        variant='contained'
                                        onClick={() => {
                                            handleModifyMethod(path, method,
                                                mockConfig.config.modifyDetails?.[path]?.[method] || ''
                                            );
                                        }}
                                        loading={aiLoadingStates[`${path}_${method}`]}
                                        loadingPosition='end'
                                        disabled={aiLoadingStates[`${path}_${method}`] || progress}
                                        endIcon={<AutoAwesome />}
                                    >
                                        {aiLoadingStates[`${path}_${method}`] ? 'Modifying...' : 'Modify'}
                                    </LoadingButton>
                                </InputAdornment>
                            ),
                        }} />
                </div>
            )}
            {!aiLoadingStates[`${path}_${method}`] && (
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
        </GenericOperation>;
    }

    return (
        <>
            <Grid container spacing={2} alignItems='stretch'>
                <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                        <Stack direction='row' spacing={2} alignItems='center' justifyContent='space-between'>
                            <Typography variant='h5' gutterBottom>
                                Mock Implementation Endpoints
                            </Typography>
                            <Tooltip title='Configure Simulations of Mock Endpoints'>
                                <Button disabled={progress} color='inherit'
                                    onClick={() => handleConfigClick()} endIcon={<Settings />}>
                                    Simulations for the API
                                </Button>
                            </Tooltip>
                        </Stack>
                        {progress ? <Progress message='Generating Mocks' /> : (<>
                            {hasNullInScripts && (
                                <MUIAlert severity='warning' sx={{ my: 1 }}>
                                    <Stack direction='row' alignItems='center' spacing={2}>
                                        <Typography variant='body1'>
                                            Some mock scripts are missing. Please Re-Generate.
                                        </Typography>
                                        <Button
                                            variant='contained'
                                            onClick={() => handleGenerateScripts(mockConfig.useAI)}
                                            disabled={progress || (mockConfig.useAI && !hasAuthToken)}
                                            endIcon={<Refresh />}
                                        >
                                            Re-Generate
                                        </Button>
                                    </Stack>
                                </MUIAlert>
                            )}
                            <Stack direction='row' mt={2} spacing={2} alignItems='center' justifyContent='center'>
                                <Paper
                                    sx={{
                                        p: 3,
                                        width: '100%',
                                        borderRadius: 2,
                                        boxShadow: 1,
                                    }}
                                >

                                    <Stack direction='row' spacing={2}
                                        alignItems='center' justifyContent='space-between'>
                                        <div style={{ flex: 1 }}>
                                            <Typography
                                                variant='h6'
                                                sx={{
                                                    fontWeight: 500,
                                                    mb: 1,
                                                }}
                                            >
                                                {mockConfig.useAI
                                                    ? 'AI-Powered Mock Server is Ready!'
                                                    : 'Want a More Realistic Mock Server?'}
                                            </Typography>
                                            <Typography
                                                variant='body1'
                                                color='textSecondary'
                                            >
                                                {mockConfig.useAI
                                                    ? 'Your AI-powered Mock Server is ready to generate ' +
                                                    'realistic responses and simulate API behavior.'
                                                    : 'Try our AI-powered Mock Server generation for ' +
                                                    'realistic responses and simulating API behavior effortlessly.'}
                                            </Typography>
                                            {!hasAuthToken && (
                                                <MUIAlert severity='warning' sx={{ my: 1 }}>
                                                    <Typography variant='body1'>
                                                        {authTokenNotProvidedWarning}
                                                    </Typography>
                                                </MUIAlert>
                                            )}
                                            <div style={{ marginTop: '16px' }}>
                                                <div style={{
                                                    display: 'flex', justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}>
                                                    <div>
                                                        <Button
                                                            variant='contained'
                                                            onClick={() => {
                                                                handleGenerateScripts(true)
                                                            }}
                                                            disabled={progress || showInstructions || !hasAuthToken}
                                                            endIcon={mockConfig.useAI ? <Refresh /> : <AutoAwesome />}
                                                            sx={{ ml: 'auto' }}
                                                            title={mockConfig.useAI
                                                                ? 'Re-generate AI-powered mock scripts'
                                                                : 'Generate AI-powered mock scripts'}
                                                        >
                                                            {mockConfig.useAI ? 'Re-Generate' :
                                                                'Try It'}
                                                        </Button>
                                                        <Button
                                                            variant='text'
                                                            sx={{ ml: 2 }}
                                                            disabled={progress || !hasAuthToken}
                                                            onClick={() => setShowInstructions(!showInstructions)}
                                                            title='Provide custom instructions 
                                                            when Generating Mock Scripts'
                                                        >
                                                            {showInstructions ? 'Remove custom Instructions' :
                                                                'Add custom Instructions'}
                                                        </Button>
                                                    </div>
                                                    {mockConfig.useAI &&
                                                        <Tooltip title='Fallback to default mock scripts 
                                                        if AI-generated 
                                                        scripts are not suitable'>
                                                            <Button
                                                                variant='outlined'
                                                                color='inherit'
                                                                onClick={() => {
                                                                    handleGenerateScripts(false);
                                                                }}
                                                                disabled={progress}
                                                            // sx={{ mr: '50px' }}
                                                            >
                                                                Fallback to Default Mock Scripts
                                                            </Button>
                                                        </Tooltip>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        <img
                                            alt='API Mock Assistant'
                                            src={`${app.context
                                            }/site/public/images/ai/APIchatassistantImageWithColour.svg`}
                                            style={{
                                                width: '80px',
                                                height: 'auto',
                                                borderRadius: '4px',
                                            }}
                                        />
                                    </Stack>
                                    {showInstructions && hasAuthToken && (
                                        <div style={{ marginTop: '16px', transition: 'all 0.3s ease-in-out' }}>
                                            <TextField
                                                fullWidth
                                                label='Instructions'
                                                placeholder='e.g. Pre-populate the mock DB with 4 records'
                                                value={mockConfig?.config?.instructions}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position='end'
                                                            sx={{
                                                                alignItems: 'center',
                                                                display: 'flex'
                                                            }}>
                                                            <Button
                                                                variant='contained'
                                                                onClick={() => {
                                                                    handleGenerateScripts(true)
                                                                }}
                                                                disabled={progress}
                                                                endIcon={mockConfig.useAI ? <Refresh />
                                                                    : <AutoAwesome />}
                                                                sx={{ ml: 'auto' }}
                                                                title={`${mockConfig.useAI ? 'Re-generate' : 'Generate'}
                                                                    AI-powered mock scripts With Custom Instructions`}
                                                            >
                                                                {mockConfig.useAI ? 'Re-Generate'
                                                                    : 'Generate'}
                                                            </Button>
                                                        </InputAdornment>
                                                    ),
                                                }}
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
                                        </div>
                                    )}
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
                                                            {GenericOperationPerResource(path, method, operation)}
                                                        </Grid>
                                                    )
                                                ))}
                                            </Grid>
                                        </GroupOfOperations>
                                    </Grid>
                                ))}
                            </Grid>
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
    updateMockDB: PropTypes.func.isRequired
};

export default React.memo(MockImplEndpoints);
