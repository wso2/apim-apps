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

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import { Alert } from 'AppComponents/Shared';
import { FormattedMessage, useIntl } from 'react-intl';

const MockConfiguration = ({ open, onClose, configuration, setConfiguration,
    currentConfig, mockScripts, setMockScripts, paths, updatePaths, simulationSplitString }) => {
    const intl = useIntl();
    const [mockSimulation, setMockSimulation] = useState({});
    const [currentEndpoint, setCurrentEndpoint] = useState(null);
    const xMediationScriptProperty = 'x-mediation-script';

    useEffect(() => {
        if (open) {  // Only update when dialog opens
            if (currentConfig.path) {
                const { path, method } = currentConfig;
                setCurrentEndpoint({ path, method });
                setMockSimulation(
                    configuration?.config?.simulationDetails?.[path]?.[method] || {
                        latency: 0,
                        error: '0',
                    }
                );
            } else {
                setCurrentEndpoint(null);
                setMockSimulation(
                    configuration.config?.simulationDetails?.api || {
                        latency: 0,
                        error: '0',
                    }
                );
            }
        }
    }, [currentConfig, configuration, open]);

    const errorOptions = [
        { value: '0', label: 'No Error' },
        { value: '400', label: '400-Bad Request' },
        { value: '401', label: '401-Unauthorized' },
        { value: '403', label: '403-Forbidden' },
        { value: '404', label: '404-Not Found' },
        { value: '500', label: '500-Internal Server Error' },
        { value: '501', label: '501-Not Implemented' },
    ];

    const handleChange = ({ target: { name, value } }) => {
        if (name === 'latency' && !/^\d*$/.test(value)) return;
        setMockSimulation(prev => ({ ...prev, [name]: value }));
    };



    const handleSave = () => {
        const applySimulationForEndpoint = (path, method, simulation, apiSimulation = false) => {
            // Clone state to avoid direct mutations
            const tempConfig = {
                ...configuration, config: {
                    ...configuration.config,
                    simulationDetails: { ...configuration.config.simulationDetails }
                }
            };
            const tempPaths = { ...paths };
            let tempMockScripts = [...mockScripts];

            // Ensure path and method exist before modifying
            if (!tempPaths[path]) tempPaths[path] = {};
            if (!tempPaths[path][method]) tempPaths[path][method] = {};

            // Get existing script without simulation part
            let finalScript = (tempPaths[path][method][xMediationScriptProperty] || "")
                .split(simulationSplitString)[0].trim();

            // Initialize simulation details if they don't exist
            if (!tempConfig.config.simulationDetails[path]) {
                tempConfig.config.simulationDetails[path] = {};
            }

            // Determine whether to apply the API-wide simulation or the endpoint-specific one
            const useApiSimulation = apiSimulation ||
                (simulation.latency === 0 && simulation.error === '0' &&
                    mockSimulation.latency !== 0 && mockSimulation.error !== '0');

            const appliedSimulation = useApiSimulation ? mockSimulation : simulation;

            if (appliedSimulation.latency !== 0 || appliedSimulation.error !== '0') {
                // Update simulation details
                tempConfig.config.simulationDetails[path][method] = appliedSimulation;
                let latencySimulationScript = '';
                let errorSimulationScript = '';

                if (appliedSimulation.latency !== 0) {
                    latencySimulationScript =
                        `var apiSimulation = ${apiSimulation};\n` +
                        'function sleepFor(ms){\n' +
                        '   var start = new Date().getTime();\n' +
                        '   var end = start;\n' +
                        '   while(end < start + ms) {\n' +
                        '       end = new Date().getTime();\n' +
                        '   }\n' +
                        '}\n' +
                        `sleepFor(${parseInt(appliedSimulation.latency, 10)});\n` +
                        '\n';
                }

                if (appliedSimulation.error !== '0') {
                    errorSimulationScript =
                        `var errorSimulation = '${appliedSimulation.error}';\n` +
                        `var errorPayloadJson = { "error": "${errorOptions.find(
                            option => option.value === appliedSimulation.error).label.split('-')[1]}" };\n` +
                        "mc.setProperty('HTTP_SC', errorSimulation);\n" +
                        "mc.setPayloadJSON(errorPayloadJson);";
                }

                const simulationScript = simulationSplitString +
                    '\n' + latencySimulationScript + '\n' + errorSimulationScript;

                // Update mock scripts
                tempMockScripts = tempMockScripts.map((methodObj) => {
                    if (methodObj.path === path && methodObj.verb.toLowerCase() === method) {
                        return { ...methodObj, simulationScript };
                    }
                    return methodObj;
                });

                // Append the script for simulation
                finalScript += `\n\n${simulationScript}`;
            } else if (tempConfig.config.simulationDetails[path]) { // Remove simulation settings if no latency or error
                delete tempConfig.config.simulationDetails[path][method];
                // Clean up empty path objects
                if (Object.keys(tempConfig.config.simulationDetails[path]).length === 0) {
                    delete tempConfig.config.simulationDetails[path];
                }
            }


            // Update state with new values
            if (finalScript.trim()) {
                tempPaths[path][method][xMediationScriptProperty] = finalScript;
            } else {
                delete tempPaths[path][method][xMediationScriptProperty];
            }
            setConfiguration(tempConfig);
            setMockScripts(tempMockScripts);
            updatePaths(tempPaths);
        };

        if (currentEndpoint) {
            // Apply simulation to current endpoint only
            const { path, method } = currentEndpoint;
            applySimulationForEndpoint(path, method, mockSimulation, false);
        } else {
            // Apply simulation to all endpoints
            const tempConfig = {
                ...configuration, config: {
                    ...configuration.config,
                    simulationDetails: { ...configuration.config.simulationDetails }
                }
            };
            tempConfig.config.simulationDetails.api = mockSimulation;

            mockScripts.forEach((methodObj) => {
                const { verb, path } = methodObj;
                const method = verb.toLowerCase();

                // Check if endpoint has its own simulation settings
                const hasEndpointSimulation = configuration.config.simulationDetails[path]?.[method];

                if (hasEndpointSimulation &&
                    (configuration.config.simulationDetails[path][method].latency !== 0 ||
                        configuration.config.simulationDetails[path][method].error !== '0')) {
                    // Keep endpoint-specific simulation
                    applySimulationForEndpoint(path, method,
                        configuration.config.simulationDetails[path][method], false);
                } else {
                    // Apply API-wide simulation
                    applySimulationForEndpoint(path, method, mockSimulation, true);
                }
            });

            setConfiguration(tempConfig);
        }

        Alert.success(
            intl.formatMessage({
                id: 'Apis.Details.Endpoints.Prototype.MockImplEndpoints.success.simulationsApplied',
                defaultMessage: 'Simulations applied successfully to {target}',
            }, {
                target: currentEndpoint
                    ? `${currentEndpoint.method} - ${currentEndpoint.path}`
                    : intl.formatMessage({
                        id: 'Apis.Details.Endpoints.Prototype.MockImplEndpoints.api',
                        defaultMessage: 'the API',
                    }),
            })
        );

        onClose();
    };


    return (
        <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
            <DialogTitle>
                {currentEndpoint !== null ?
                    <FormattedMessage
                        id='Apis.Details.Endpoints.Prototype.MockImplEndpoints.dialogTitle.endpoint'
                        defaultMessage='Configuration for {method} - {path} simulation'
                        values={{
                            method: currentEndpoint.method,
                            path: currentEndpoint.path,
                        }}
                    /> :
                    <FormattedMessage
                        id='Apis.Details.Endpoints.Prototype.MockImplEndpoints.dialogTitle.api'
                        defaultMessage='Configuration for API simulation'
                    />
                }
            </DialogTitle>
            <DialogContent>
                <TextField
                    fullWidth
                    margin='normal'
                    label={
                        <FormattedMessage
                            id='Apis.Details.Endpoints.Prototype.MockImplEndpoints.latencySimulation'
                            defaultMessage='Latency simulation'
                        />
                    }
                    name='latency'
                    type='number'
                    InputProps={{
                        endAdornment: <span>ms</span>,
                        inputProps: { min: 0 },
                    }}
                    value={mockSimulation?.latency || 0}
                    onChange={handleChange}
                />
                <FormControl fullWidth margin='normal'>
                    <InputLabel>
                        <FormattedMessage
                            id='Apis.Details.Endpoints.Prototype.MockImplEndpoints.errorSimulation'
                            defaultMessage='Error simulation'
                        />
                    </InputLabel>
                    <Select
                        name='error'
                        value={mockSimulation?.error || '0'}
                        onChange={handleChange}
                        label='Error Simulation'
                    >
                        {errorOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>
                    <FormattedMessage
                        id='Apis.Details.Endpoints.Prototype.MockImplEndpoints.cancel'
                        defaultMessage='Cancel'
                    />
                </Button>
                <Button onClick={handleSave} variant='contained' color='primary'>
                    <FormattedMessage
                        id='Apis.Details.Endpoints.Prototype.MockImplEndpoints.save'
                        defaultMessage='Save'
                    />
                </Button>
            </DialogActions>
        </Dialog>
    );
};

MockConfiguration.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    configuration: PropTypes.shape({
        config: PropTypes.shape(
            {
                simulationDetails: PropTypes.shape(
                    { api: PropTypes.shape({}) }).isRequired
            })
    }).isRequired,
    setConfiguration: PropTypes.func.isRequired,
    currentConfig: PropTypes.shape({
        path: PropTypes.string.isRequired,
        method: PropTypes.string.isRequired
    }).isRequired,
    mockScripts: PropTypes.shape([]).isRequired,
    setMockScripts: PropTypes.func.isRequired,
    paths: PropTypes.shape({}).isRequired,
    updatePaths: PropTypes.func.isRequired,
    simulationSplitString: PropTypes.string.isRequired
};

export default MockConfiguration;