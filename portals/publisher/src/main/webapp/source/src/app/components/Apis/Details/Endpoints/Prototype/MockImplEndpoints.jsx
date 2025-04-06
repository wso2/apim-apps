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
    Typography, Stack, TextField, InputAdornment,
    IconButton
} from '@mui/material';
import { APIContext } from 'AppComponents/Apis/Details/components/ApiContext';
import MockScriptOperation from 'AppComponents/Apis/Details/Endpoints/Prototype/MockScriptOperation';
import GenericOperation from 'AppComponents/Apis/Details/Resources/components/GenericOperation';
import GroupOfOperations from 'AppComponents/Apis/Details/Resources/components/GroupOfOperations';
import CONSTS from 'AppData/Constants';
import { Progress, Alert } from 'AppComponents/Shared';
import { AutoAwesome, Settings } from '@mui/icons-material';
import MockConfiguration from 'AppComponents/Apis/Details/Endpoints/Prototype/MockConfiguration';
import {
    app
} from 'Settings';


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
    const [mockConfig, setMockConfig] = useState({
        useAI: false,
        config: {
            instructions: '',
            simulationDetails: {
                api: {latency: 0, error: 'none'}
            },
            modifyDetails: {}
        },
    });
    const [, forceUpdate] = useReducer(x => x + 1, 0)

    const splitSimulationPart = (content) => {
        const simulationMarker = '// Simulation Of Errors and Latency';
        const index = content.indexOf(simulationMarker);
        if (index === -1) {
            return { content, simulationPart: '' };
        }
        const simulationPart = content.substring(index + simulationMarker.length).trim() || null;
        return { content: content.substring(0, index).trim(), simulationPart };
    };

    const setSimulationConfig = (simulationPart, path, verb) => {
        const method = verb.toLowerCase();
        if (simulationPart !== null) {
            const apiSimMatch = simulationPart.match(/const apiSim = (true|false)/);
            const latencyMatch = simulationPart.match(/sleepFor\((\d+)\);/);
            if (latencyMatch) {
                const latency = parseInt(latencyMatch[1], 10);
                if (apiSimMatch && apiSimMatch[1] === 'true') { // API-level config
                    setMockConfig((prev) => ({
                        ...prev,
                        config: {
                            ...prev.config,
                            simulationDetails: {
                                ...prev.config.simulationDetails,
                                api: {
                                    latency,
                                    error: 'none',
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
                                        latency,
                                        error: 'none',
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
                    const {content, simulationPart} = 
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

    const generateMockScripts = async (useAI, payload) => {
        const response = await api.generateMockScripts(api.id, useAI, payload);
        const tmpScripts = [];
        const tmpPaths = paths;
        Object.entries(response.obj.paths).forEach(([path, methods]) => {
            Object.entries(methods).forEach(([method, data]) => {
                if (method === 'parameters') {
                    return; // Skip this loop iteration
                }
                const {content, simulationPart} = 
                    splitSimulationPart(data[xMediationScriptProperty],path, method);
                setSimulationConfig(simulationPart,path,method)
                tmpScripts.push({
                    path,
                    verb: method.toUpperCase(),
                    content,
                    simulationPart
                });
                tmpPaths[path][method][xMediationScriptProperty] = data[xMediationScriptProperty];
            });
        });
        setMockScripts(tmpScripts);
        updatePaths(tmpPaths);
        return response;
    }

    const handleModifyMethod = async (path,method,instructions) => {
        if (instructions === ''){
            Alert.warning('No Instructions to modify');
            return;
        }
        const script = paths[path][method][xMediationScriptProperty];
        const {content} = splitSimulationPart(script)
        const payload = {
            instructions,
            content,
            modifyPath: {path,method}
        }
        console.log(payload);
        try {
            await generateMockScripts(true, payload)
            // if (useAI) updateMockDB({ [xWso2MockDBProperty]: response.obj[xWso2MockDBProperty] });
            forceUpdate();
            Alert.info('Successfully generated mock scripts!');
        } catch (e) {
            Alert.error('Error generating mock scripts!');
        } finally {
            setProgress(false);
        }

    }

    const handleGenerateScripts = async (useAI) => {
        setProgress(true);
        try {
            const payload = {
                instructions: mockConfig.config.instructions
            }
            const response = await generateMockScripts(useAI, payload)
            if (useAI) updateMockDB({ [xWso2MockDBProperty]: response.obj[xWso2MockDBProperty] });
            forceUpdate();
            Alert.info('Successfully generated mock scripts!');
            setMockConfig({...mockConfig,useAI})
        } catch (e) {
            console.error(e);
            if (useAI){
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
        const {path,method} = endpointConfig;
        setCurrentConfig({path,method})
        setOpenConfig(true);
    };

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
                                <IconButton onClick={() => handleConfigClick()}>
                                    <Settings />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                        {!mockConfig.useAI ? (
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
                                                Want a More Realistic Mock Server?
                                            </Typography>
                                            <Typography
                                                variant='body1'
                                                color='textSecondary'
                                            >
                                                Try our AI-powered Mock Server generation for 
                                                realistic responses and simulating API behavior effortlessly.
                                            </Typography>
                                            <div style={{ marginTop: '16px' }}>
                                                <Button
                                                    variant='contained'
                                                    onClick={()=>{
                                                        handleGenerateScripts(true)}}
                                                    disabled={progress}
                                                    endIcon={<AutoAwesome />}
                                                >
                                                    {!mockConfig.useAI && progress ? 'AI is Thinking...': 'Try It'}
                                                </Button>
                                            </div>
                                        </div>
                                        <img
                                            alt='API Mock Assistant'
                                            src={`${
                                                app.context
                                            }/site/public/images/ai/APIchatassistantImageWithColour.svg`}
                                            style={{
                                                width: '70px',
                                                height: 'auto',
                                                borderRadius: '4px',
                                            }}
                                        />
                                    </Stack>
                                </Paper>
                            </Stack>) : null}
                        {progress ? <Progress /> : (
                            <Grid container spacing={2} mt={2}>
                                {Object.entries(paths).map(([path, methods]) => (
                                    <Grid item xs={12} key={path}>
                                        <GroupOfOperations openAPI={swagger} tag={path}>
                                            <Grid container spacing={1} direction='column'>
                                                {Object.entries(methods).map(([method, operation]) => (
                                                    CONSTS.HTTP_METHODS.includes(method) && (
                                                        <Grid item key={`${path}/${method}`}>
                                                            <GenericOperation target={path} verb={method} 
                                                                handleConfigClick={() => handleConfigClick(
                                                                    {path, method})}>
                                                                {mockConfig.useAI && (
                                                                    <div>
                                                                        <TextField
                                                                            fullWidth
                                                                            label='Modify With AI'
                                                                            value={mockConfig?.config?.
                                                                                modifyDetails?.[path]?.[method]} 
                                                                            onChange={(e) =>
                                                                                setMockConfig((prev) => ({ ...prev, 
                                                                                    config: {
                                                                                        ...prev.config,
                                                                                        modifyDetails: {
                                                                                            ...prev.config.
                                                                                                modifyDetails,
                                                                                            [path]: {
                                                                                                ...prev.config.
                                                                                                    modifyDetails
                                                                                                    [path],
                                                                                                [method]: 
                                                                                                    e.target.value,
                                                                                            },
                                                                                        },
                                                                                    },
                                                                                }))
                                                                            } // Update instructions on change
                                                                            InputProps={{
                                                                                endAdornment: ( 
                                                                                    <InputAdornment position='end'
                                                                                        sx={{ alignItems: 'center',
                                                                                            display: 'flex' }}>
                                                                                        <Button
                                                                                            variant='contained'
                                                                                            onClick={()=>{
                                                                                                handleModifyMethod(
                                                                                                    path,
                                                                                                    method,
                                                                                                    mockConfig.
                                                                                                        config.
                                                                                                        modifyDetails
                                                                                                        ?.[path]
                                                                                                        ?.[method]
                                                                                                        || ''
                                                                                                )}}
                                                                                            disabled={progress}
                                                                                            endIcon={
                                                                                                <AutoAwesome />
                                                                                            }
                                                                                        >
                                                                                            Modify
                                                                                        </Button>
                                                                                    </InputAdornment>
                                                                                ),
                                                                            }}
                                                                        />
                                                                    </div>
                                                                )}
                                                                <MockScriptOperation
                                                                    key={forceUpdate}
                                                                    resourcePath={path}
                                                                    resourceMethod={method}
                                                                    operation={operation}
                                                                    updatePaths={updatePaths}
                                                                    paths={paths}
                                                                    mockScripts={mockScripts}
                                                                />
                                                            </GenericOperation>
                                                        </Grid>
                                                    )
                                                ))}
                                            </Grid>
                                        </GroupOfOperations>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
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
