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
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied. See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 */

import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, FormControl, FormControlLabel, Grid, Paper, Radio, RadioGroup } from '@mui/material';
import { APIContext } from 'AppComponents/Apis/Details/components/ApiContext';
import MockScriptOperation from 'AppComponents/Apis/Details/Endpoints/Prototype/MockScriptOperation';
import GenericOperation from 'AppComponents/Apis/Details/Resources/components/GenericOperation';
import GroupOfOperations from 'AppComponents/Apis/Details/Resources/components/GroupOfOperations';
import CONSTS from 'AppData/Constants';
import { Progress, Alert } from 'AppComponents/Shared';
import { Settings } from '@mui/icons-material';
import AIMockConfiguration from './AIMockConfiguration';

/**
 * The mock impl endpoints base component.
 * This component lists the api resources to add custom mediation scripts.
 *
 * @param {any} props The input props.
 * @return {any} The JSX representation of the component.
 * */
function MockImplEndpoints(props) {
    const {
        paths, swagger, updatePaths, updateMockDB
    } = props;
    const { api } = useContext(APIContext);
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState(true);
    const [mockScripts, setMockScripts] = useState(null);
    const [useAI, setUseAI] = useState(false);
    const [config, setConfig] = useState({});
    const [currentConfig, setCurrentConfig] = useState('api');
    const [openConfig , setOpenConfig] = useState(false);
    // const [mockDB, setMockDB] = useState(null);
    const xMediationScriptProperty = 'x-mediation-script';
    const xWso2MockDBProperty = 'x-wso2-mockDB';


    const getMockScriptsFromAPI = async () => {
        api.getGeneratedMockScriptsOfAPI(api.id)
            .then((response) => {
                setMockScripts(response.obj.list);
            })
            .catch((e) => {
                console.error(e);
                Alert.error(`Something went wrong while fetching example mock scripts!!`);
                setError(e);
            }).finally(() => {
                setProgress(false);
            });
    };

    useEffect(() => {
        getMockScriptsFromAPI();
        if (swagger[xWso2MockDBProperty]) {
            setUseAI(true);
            // setMockDB(swagger[xWso2MockDBProperty]);
            // console.log(mockDB);
        }
    }, []);

    const handleGenClick = async () => {
        try {
            setProgress(true);
            api.generateMockScripts(api.id, useAI, config).
                then((response) => {
                    const {paths: tmpResponsePaths} = response.obj;
                    const tmpScripts = [];
                    for (const path of Object.keys(tmpResponsePaths)) {
                        for (const method of Object.keys(tmpResponsePaths[path])) {
                            tmpScripts.push({
                                path,
                                verb: method.toUpperCase(),
                                content: tmpResponsePaths[path][method][xMediationScriptProperty],
                            });
                            paths[path][method][xMediationScriptProperty] = 
                                tmpResponsePaths[path][method][xMediationScriptProperty];
                        }
                    }
                    setMockScripts(tmpScripts);
                    updatePaths(paths);
                    if (useAI) {
                        updateMockDB({ [xWso2MockDBProperty]: response.obj[xWso2MockDBProperty] });
                    }
                    Alert.info('Successfully generated mock scripts!!');
                    setProgress(false);
                });
        } catch (e) {
            console.error(e);
            Alert.error(`Something went wrong while fetching example mock scripts!!`);
            setError(e);
            console.error(error);
            setProgress(false);
        }
    }

    const handleConfigClick = (endpointConfig = null) => {
        if (endpointConfig && endpointConfig.path && endpointConfig.method) {
            setCurrentConfig(`${endpointConfig.path} - ${endpointConfig.method}`);
            setConfig((prevConfig) => {
                // Ensure path and method configuration exists
                return {
                    ...prevConfig,
                    [endpointConfig.path]: {
                        ...prevConfig[endpointConfig.path],
                        [endpointConfig.method]: prevConfig[endpointConfig.path]?.[endpointConfig.method] || {
                            context: '',
                            latency: 0,
                            errorSimulation: 'none',
                        },
                    },
                };
            });
        } else {
            setCurrentConfig('api');
            setConfig((prevConfig) => {
                // Ensure api configuration exists
                return {
                    ...prevConfig,
                    api: prevConfig.api || {
                        context: '',
                        latency: 0,
                        errorSimulation: 'none',
                    },
                };
            });
        }
        setOpenConfig(true);
    };

    return <>
        <Grid container direction='row' justifyContent='flex-start' spacing={2} alignItems='stretch'>
            <Grid item md={12}>
                <Paper>        
                    <Grid key='MockSet' item xs={12}>
                        <FormControl fullWidth component='mockset'>
                            <RadioGroup
                                row
                                value={useAI ? 'ai' : 'static'}
                                onChange={(e) => setUseAI(e.target.value === 'ai')}
                            >
                                <FormControlLabel value='static' control={<Radio />} label='Static' />
                                <FormControlLabel value='ai' control={<Radio />} label='AI' />
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                    {progress ? <Progress /> : (<>
                        <Grid container spacing={1} style={{ marginTop: '16px' }}>
                            <Grid item>
                                <Button
                                    variant='contained'
                                    onClick={handleGenClick}
                                >
                                    Generate
                                </Button>
                            </Grid>
                            {useAI && (
                                <Grid item>
                                    <Button
                                        onClick={() => handleConfigClick(null)}
                                        startIcon={<Settings />}
                                    >
                                        Settings
                                    </Button>
                                </Grid>
                            
                            )}
                        </Grid>
                        {Object.keys(paths).map((path) => {
                            return (
                                <Grid key={path} item md={12}>
                                    <GroupOfOperations openAPI={swagger} tag={path}>
                                        <Grid
                                            container
                                            direction='column'
                                            justifyContent='flex-start'
                                            spacing={1}
                                            alignItems='stretch'
                                        >
                                            {Object.keys(paths[path]).map((method) => {
                                                return CONSTS.HTTP_METHODS.includes(method) ? (
                                                    <Grid key={`${path}/${method}`} item>
                                                        <GenericOperation
                                                            target={path}
                                                            verb={method}>
                                                            <MockScriptOperation
                                                                resourcePath={path}
                                                                resourceMethod={method}
                                                                operation={paths[path][method]}
                                                                updatePaths={updatePaths}
                                                                paths={paths}
                                                                mockScripts={mockScripts}
                                                            />
                                                            <Button
                                                                size='small'
                                                                onClick={() => handleConfigClick({ path, method })}
                                                            >
                                                                Configure
                                                            </Button>
                                                        </GenericOperation>
                                                    </Grid>
                                                ) : null;
                                            })}
                                        </Grid>
                                    </GroupOfOperations>
                                </Grid>
                            );
                        })}</>)}
                </Paper>
            </Grid>
        </Grid>
        <AIMockConfiguration
            open={openConfig}
            onClose={() => setOpenConfig(false)}
            currentConfig={currentConfig}
            configuration={config}
            setConfiguration={setConfig}
        />
    </>;
}

MockImplEndpoints.propTypes = {
    paths: PropTypes.shape({}).isRequired,
    updatePaths: PropTypes.func.isRequired,
    endpointConfig: PropTypes.shape({}).isRequired,
    swagger: PropTypes.shape({}).isRequired,
    updateMockDB: PropTypes.func.isRequired
};

export default React.memo(MockImplEndpoints);
