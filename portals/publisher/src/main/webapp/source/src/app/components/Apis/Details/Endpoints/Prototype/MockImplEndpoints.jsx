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
    Button, Grid, Paper, ToggleButton, ToggleButtonGroup,
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
import AIMockConfiguration from './AIMockConfiguration';


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
    const [aiConfig, setAIConfig] = useState({
        useAI: false,
        config: {
            instructions: '',
            simulationDetails: {
                api: {latency: 0, error: 'none'}
            },
            modifyDetails: {
                modifyPath: undefined,
            }
        },
    });
    const [, forceUpdate] = useReducer(x => x + 1, 0)

    useEffect(() => {
        const fetchMockScripts = async () => {
            try {
                const response = await api.getGeneratedMockScriptsOfAPI(api.id);
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
            setAIConfig((prev) => ({ ...prev, useAI: true }));
        }
    }, []);

    const handleGenerateScripts = async () => {
        setProgress(true);
        try {
            const response = await api.generateMockScripts(api.id, aiConfig.useAI, aiConfig.config);
            const tmpScripts = [];
            const tmpPaths = paths;
            Object.entries(response.obj.paths).forEach(([path, methods]) => {
                Object.entries(methods).forEach(([method, data]) => {
                    tmpScripts.push({
                        path,
                        verb: method.toUpperCase(),
                        content: data[xMediationScriptProperty],
                    });
                    tmpPaths[path][method][xMediationScriptProperty] = data[xMediationScriptProperty];
                });
            });
            setMockScripts(tmpScripts);
            updatePaths(paths);
            if (aiConfig.useAI) updateMockDB({ [xWso2MockDBProperty]: response.obj[xWso2MockDBProperty] });
            forceUpdate()
            Alert.info('Successfully generated mock scripts!');
        } catch (e) {
            console.error(e);
            Alert.error('Error generating mock scripts!');
        } finally {
            setProgress(false);
        }
    };

    const handleConfigClick = (endpointConfig = null) => {
        if (endpointConfig?.path && endpointConfig?.method) {
            const {path} = endpointConfig;
            const {method} = endpointConfig;
            setCurrentConfig({path,method})
        } else {
            setCurrentConfig({path:undefined,method:undefined})
        }
        setOpenConfig(true);
    };

    return (
        <>
            <Grid container spacing={2} alignItems='stretch'>
                <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant='h6' gutterBottom>
                            Mock Implementation Endpoints
                        </Typography>
                        <Stack direction='row' spacing={2} alignItems='center'>
                            <ToggleButtonGroup
                                color='primary'
                                value={aiConfig.useAI ? 'ai' : 'static'}
                                exclusive
                                onChange={(e, value) =>
                                    setAIConfig((prev) => ({ ...prev, useAI: value === 'ai' }))
                                }
                                aria-label='Mock type selection'
                            >
                                <ToggleButton value='static'>Static</ToggleButton>
                                <ToggleButton value='ai'>AI</ToggleButton>
                            </ToggleButtonGroup>
                            {aiConfig.useAI ? (
                                <>
                                    <TextField
                                        fullWidth
                                        label='Instructions'
                                        value={aiConfig.config.instructions} 
                                        onChange={(e) =>
                                            setAIConfig((prev) => ({ ...prev, config: 
                                                {...prev.config, instructions: e.target.value }}))
                                        } // Update instructions on change
                                        InputProps={{
                                            endAdornment: ( // Adjusted endAdornment placement
                                                <InputAdornment position='end'
                                                    sx={{ alignItems: 'center', display: 'flex' }}>
                                                    <Button
                                                        variant='contained'
                                                        onClick={handleGenerateScripts}
                                                        disabled={progress}
                                                        endIcon={<AutoAwesome />}
                                                    >
                                                        Generate
                                                    </Button>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <IconButton onClick={() => handleConfigClick()}>
                                        <Settings />
                                    </IconButton>
                                </>
                            ) : (
                                <Button
                                    variant='contained'
                                    onClick={handleGenerateScripts}
                                    disabled={progress}
                                >
                                    Generate
                                </Button>
                            )}
                        </Stack>
                        {progress ? <Progress /> : (
                            <Grid container spacing={2} mt={2}>
                                {Object.entries(paths).map(([path, methods]) => (
                                    <Grid item xs={12} key={path}>
                                        <GroupOfOperations openAPI={swagger} tag={path}>
                                            <Grid container spacing={1} direction='column'>
                                                {Object.entries(methods).map(([method, operation]) => (
                                                    CONSTS.HTTP_METHODS.includes(method) && (
                                                        <Grid item key={`${path}/${method}`}>
                                                            <GenericOperation target={path} verb={method}>
                                                                {aiConfig.useAI && (
                                                                    <>
                                                                        <TextField
                                                                            fullWidth
                                                                            label='Modify With AI'
                                                                            value={aiConfig?.config?.
                                                                                modifyDetails?.
                                                                                    [path]?.[method] || ''} 
                                                                            onChange={(e) =>
                                                                                setAIConfig((prev) => ({ ...prev, 
                                                                                    config: {
                                                                                        ...prev.config,
                                                                                        modifyDetails: {
                                                                                            ...prev.
                                                                                                config.modifyDetails,
                                                                                            [path]: {
                                                                                                ...(prev.
                                                                                                    config.
                                                                                                    modifyDetails[path] 
                                                                                                    || {}),
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
                                                                                            onClick={
                                                                                                handleGenerateScripts}
                                                                                            disabled={progress}
                                                                                            endIcon={<AutoAwesome />}
                                                                                        >
                                                                                            Modify
                                                                                        </Button>
                                                                                    </InputAdornment>
                                                                                ),
                                                                            }}
                                                                        />
                                                                        <IconButton onClick={() => handleConfigClick()}>
                                                                            <Settings />
                                                                        </IconButton>
                                                                    </>
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
                                                                <Button size='small'
                                                                    onClick={() => handleConfigClick({ path, method })}>
                                                                    Configure
                                                                </Button>
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
            <AIMockConfiguration
                open={openConfig}
                onClose={() => setOpenConfig(false)}
                currentConfig={currentConfig}
                configuration={aiConfig}
                setConfiguration={setAIConfig}
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
