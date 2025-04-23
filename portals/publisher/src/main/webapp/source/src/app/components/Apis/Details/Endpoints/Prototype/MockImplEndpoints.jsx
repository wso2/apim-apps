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
    Button, Grid, Paper, Tooltip, Chip, Divider, Box,
    Typography, Stack, TextField, Alert as MUIAlert
} from '@mui/material';
import { APIContext } from 'AppComponents/Apis/Details/components/ApiContext';
import MockScriptOperation from 'AppComponents/Apis/Details/Endpoints/Prototype/MockScriptOperation';
import GenericOperation from 'AppComponents/Apis/Details/Resources/components/GenericOperation';
import GroupOfOperations from 'AppComponents/Apis/Details/Resources/components/GroupOfOperations';
import CONSTS from 'AppData/Constants';
import { Progress, Alert } from 'AppComponents/Shared';
import {
    AutoAwesome, Refresh, Launch, Memory,
    SmartToy, Speed, DataObject, SyncAlt, Settings
} from '@mui/icons-material';
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
function MockImplEndpoints({ paths, swagger, updatePaths, updateMockDB, setIsUpdating }) {
    const { api } = useContext(APIContext);
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState(true);
    const [mockScripts, setMockScripts] = useState(null);
    const [currentConfig, setCurrentConfig] = useState({});
    const [openConfig, setOpenConfig] = useState(false);
    const xMediationScriptProperty = 'x-mediation-script';
    const xWso2MockDBProperty = 'x-wso2-mockdb';
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
    // Change aiLoadingStates to hold either null or the currently modifying path_method string
    const [aiLoadingStates, setAiLoadingStates] = useState(null);
    const [nullScripts, setNullScripts] = useState([]);
    const { data: settings } = usePublisherSettings();
    const hasAuthToken = settings && settings?.aiAuthTokenProvided
    const [isFirstTimeSelection, setIsFirstTimeSelection] = useState(true);

    const splitSimulationPart = (content) => {
        const index = content.indexOf(simulationSplitString);
        if (index === -1) {
            return { content, simulationPart: '' };
        }
        const simulationPart = content.substring(index + simulationSplitString.length).trim() || '';
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
                setIsUpdating(true)
                const response = await api.getGeneratedMockScriptsOfAPI(api.id);
                const tempNullScripts = []
                response.obj.list = response.obj.list.map((methodObj) => {
                    const { content, simulationPart } =
                        splitSimulationPart(methodObj.content, methodObj.path, methodObj.verb);
                    setSimulationConfig(simulationPart, methodObj.path, methodObj.verb);
                    if (content.trim().length === 0) {
                        const newEntry = `${methodObj.verb.toLowerCase()} - ${methodObj.path}`;
                        tempNullScripts.push(newEntry);
                    }
                    return {
                        ...methodObj,
                        content,
                        simulationPart
                    };
                });
                setNullScripts(tempNullScripts);
                setMockScripts(response.obj.list);
                if (tempNullScripts.length !== response.obj.list.length) {
                    setIsFirstTimeSelection(false);
                }
            } catch (e) {
                console.error(e);
                Alert.error('Something went wrong while fetching example mock scripts!');
                setError(e);
                console.log(error)
            } finally {
                setProgress(false);
                setIsUpdating(false);
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
                splitSimulationPart(paths[modify.path][modify.method][xMediationScriptProperty] || '');
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
        const isThisScriptNull = nullScripts.includes(`${method} - ${path}`)
        if (instructions === '' && !isThisScriptNull) {
            Alert.error('No Instructions to modify');
            return;
        }
        setAiLoadingStates(`${path}_${method}`); // Set AI loading state for this endpoint
        setIsUpdating(true);
        const script = paths[path][method][xMediationScriptProperty] || '';
        const { content, simulationPart } = splitSimulationPart(script)
        const payload = {
            instructions: isThisScriptNull ? 'Generate mock scripts for the specified endpoint' : instructions,
            script: content.length === 0 ? 'No Script' : content,
            modify: { path, method, defaultScript: !mockConfig.useAI }
        }
        try {
            await generateMockScripts(true, payload, payload.modify);
            setSimulationConfig(simulationPart, path, method);
            if (nullScripts.includes(`${method} - ${path}`)) {
                setNullScripts(prev => prev.filter(item => item !== `${method} - ${path}`));
            }
            forceUpdate();
            Alert.info('Successfully Modified the mock script!');
        } catch (e) {
            Alert.error('Error generating mock scripts!');
        } finally {
            setAiLoadingStates(null); // Reset AI loading state
            if (aiLoadingStates === null) {
                setIsUpdating(false);
            }
        }

    }

    const handleGenerateScripts = async (useAI) => {
        setProgress(true);
        setIsUpdating(true);
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
            setIsFirstTimeSelection(false)
            setNullScripts([]);
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
            setIsUpdating(false);
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
            defaultMessage={'You must provide a token to start using the AI-Assisted API Mock Server. To obtain one, '
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

    const GenericOperationPerResource = (path, method, operation) => {
        const isThisScriptNull = nullScripts.includes(`${method} - ${path}`)
        const currentKey = `${path}_${method}`;
        return (
            <GenericOperation target={path} verb={method} handleConfigClick={() => handleConfigClick({ path, method })}>
                {hasAuthToken && (
                    <div>
                        <Stack direction='column' maxWidth='calc(100% - 250px)'
                            spacing={2} alignItems='flex-start' sx={{ my: 2 }}>
                            <TextField
                                fullWidth
                                multiline
                                minRows={1}
                                maxRows={4}
                                label={isThisScriptNull ? 'Generate With AI' : 'Modify With AI'}
                                placeholder='e.g. Respond with Capitalized letters'
                                value={mockConfig?.config?.modifyDetails?.[path]?.[method] || ''}
                                disabled={isThisScriptNull ||
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
                            />
                            <Tooltip title={`${isThisScriptNull ? 'Generate' : 'Modify'} with AI`}>
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
                                            isThisScriptNull ||
                                            aiLoadingStates === currentKey ||
                                            progress ||
                                            (aiLoadingStates !== null && aiLoadingStates !== currentKey)
                                        }
                                        endIcon={<AutoAwesome />}
                                        sx={{ whiteSpace: 'nowrap' }}
                                    >
                                        {aiLoadingStates === currentKey ?
                                            'Modifying...' : `${isThisScriptNull ? 'Generate' : 'Modify'}`}
                                    </LoadingButton>
                                </span>
                            </Tooltip>
                        </Stack>
                    </div>
                )}
                {!(aiLoadingStates === currentKey) && (
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

    const InitialMockChoice = () => {
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
                        How Would You Like Your Mock Server to Behave?
                    </Typography>
                    <img
                        alt='API Mock Assistant'
                        src={`${app.context}/site/public/images/ai/APIchatassistantImageWithColour.svg`}
                        style={{ width: 50, height: 'auto', borderRadius: '4px' }}
                    />
                </Stack>

                {!hasAuthToken && 
                <MUIAlert severity='warning' sx={{my:0}}>
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
                            justifyContent: 'space-between',
                            bgcolor: 'background.paper'
                        }}
                    >
                        <Stack spacing={2}>
                            <Stack direction='row' alignItems='center' spacing={1}>
                                <SmartToy fontSize='large' color='primary' />
                                <Typography variant='h6' sx={{ fontWeight: 600 }}>
                                    AI-Assisted Mock Server
                                </Typography>
                            </Stack>

                            <Typography variant='body1'>
                                Smart, realistic mocks tailored from your API —
                                great for demos, testing, and better feedback.
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
                            Use AI Mock Server
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
                            justifyContent: 'space-between',
                            bgcolor: 'background.default'
                        }}
                    >
                        <Stack spacing={2}>
                            <Stack direction='row' alignItems='center' spacing={1}>
                                <Memory fontSize='large' color='action' />
                                <Typography variant='h6' sx={{ fontWeight: 600 }}>
                                    Static Mock Server
                                </Typography>
                            </Stack>

                            <Typography variant='body1'>
                                Basic and quick mocks for rapid setup and initial testing needs.
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
                            Use Static Mock Server
                        </Button>
                    </Paper>
                </Stack>
            </Stack>
        );
    };



    return (
        <>
            <Grid container spacing={2} alignItems='stretch'>
                <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                        <Stack direction='row' spacing={2} alignItems='center' justifyContent='space-between'>
                            <Typography variant='h5' gutterBottom>
                                {isFirstTimeSelection
                                    ? 'Mock Implementation'
                                    : `${mockConfig.useAI ? 'AI Assisted' : 'Default'} Mock Implementation`}

                            </Typography>
                            <Tooltip title='Configure Simulations of Mock Endpoints'>
                                <Button disabled={progress || isFirstTimeSelection} color='inherit'
                                    onClick={() => handleConfigClick()} endIcon={<Settings />}>
                                    Simulations for the API
                                </Button>
                            </Tooltip>
                        </Stack>
                        {progress ? <Progress message='Generating Mocks' /> : (<>
                            {isFirstTimeSelection ? <InitialMockChoice /> : (<>
                                {nullScripts.length > 0 && (
                                    <MUIAlert severity='warning' sx={{ my: 1 }}>
                                        <Stack direction='row' alignItems='center' spacing={1} flexWrap='wrap'>
                                            <Typography variant='body1'>
                                                Mock scripts are missing for:
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
                                                Please Re-generate.
                                            </Typography>
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
                                                        ? 'AI-Assisted Mock Server is Ready!'
                                                        : 'Want a More Realistic Mock Server?'}
                                                </Typography>
                                                <Typography
                                                    variant='body1'
                                                    color='textSecondary'
                                                >
                                                    {mockConfig.useAI
                                                        ? 'Your AI-Assisted Mock Server is ready to generate ' +
                                                        'realistic responses.'
                                                        : 'Try our AI-Assisted Mock Server for ' +
                                                        'realistic responses.'}
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
                                                            <Tooltip title={mockConfig.useAI
                                                                ? 'Re-generate AI-Assisted mock scripts'
                                                                : 'Generate AI-Assisted mock scripts'}>
                                                                <Button
                                                                    variant='contained'
                                                                    onClick={() => {
                                                                        handleGenerateScripts(true)
                                                                    }}
                                                                    disabled={progress ||
                                                                        showInstructions || !hasAuthToken}
                                                                    endIcon={mockConfig.useAI ? <Refresh />
                                                                        : <AutoAwesome />}
                                                                    sx={{ ml: 'auto' }}
                                                                >
                                                                    {mockConfig.useAI ? 'Re-Generate' :
                                                                        'Try It'}
                                                                </Button>
                                                            </Tooltip>
                                                            <Tooltip title='Provide custom instructions 
                                                            when Generating Mock Scripts'>
                                                                <Button
                                                                    variant='text'
                                                                    sx={{ ml: 2 }}
                                                                    disabled={progress || !hasAuthToken}
                                                                    onClick={() =>
                                                                        setShowInstructions(!showInstructions)}
                                                                >
                                                                    {showInstructions ? 'Remove custom Instructions' :
                                                                        'Add custom Instructions'}
                                                                </Button>
                                                            </Tooltip>
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
                                                src={app.context +
                                                    '/site/public/images/ai/APIchatassistantImageWithColour.svg'}
                                                style={{
                                                    width: '80px',
                                                    height: 'auto',
                                                    borderRadius: '4px',
                                                }}
                                            />
                                        </Stack>
                                        {showInstructions && hasAuthToken && (
                                            <div style={{ marginTop: '16px', transition: 'all 0.3s ease-in-out' }}>
                                                <Stack spacing={1} sx={{ position: 'relative' }}>
                                                    <TextField
                                                        fullWidth
                                                        label='Instructions'
                                                        multiline
                                                        minRows={2}
                                                        maxRows={6}
                                                        placeholder='e.g. Pre-populate the mock DB with 4 records'
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
                                                    <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                                                        <Tooltip
                                                            title={`${mockConfig.useAI ? 'Re-generate' : 'Generate'} 
                                                                AI-Assisted mock scripts with Custom Instructions`}
                                                        >
                                                            <Button
                                                                variant='contained'
                                                                onClick={() => handleGenerateScripts(true)}
                                                                disabled={progress}
                                                                endIcon={mockConfig.useAI ? <Refresh />
                                                                    : <AutoAwesome />}
                                                            >
                                                                {mockConfig.useAI ? 'Re-Generate' : 'Generate'}
                                                            </Button>
                                                        </Tooltip>
                                                    </Box>
                                                </Stack>

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
    updateMockDB: PropTypes.func.isRequired,
    setIsUpdating: PropTypes.func.isRequired
};

export default React.memo(MockImplEndpoints);
