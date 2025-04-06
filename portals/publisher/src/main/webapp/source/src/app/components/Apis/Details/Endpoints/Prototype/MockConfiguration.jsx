import React, { useEffect, useState } from 'react';
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

const MockConfiguration = ({ open, onClose, configuration, setConfiguration, 
    currentConfig, mockScripts, setMockScripts, paths, updatePaths }) => {
    const [mockSimulation, setMockSimulation] = useState({});
    const [currentEndpoint, setCurrentEndpoint] = useState(null);
    const xMediationScriptProperty = 'x-mediation-script';

    useEffect(() => {
        if (open) {  // Only update when dialog opens
            if (currentConfig.path) {
                const {path, method} = currentConfig
                setCurrentEndpoint({ path, method });
                console.log(configuration?.config)
                setMockSimulation(
                    configuration?.config?.simulationDetails?.[path]?.[method] || {
                        latency: 0,
                        error: 'none',
                    }
                );
            } else {
                setCurrentEndpoint(null);
                setMockSimulation(
                    configuration.config?.simulationDetails?.api || {
                        latency: 0,
                        error: 'none',
                    }
                );
            }
        }
    }, [currentConfig, configuration, open]);

    const errorOptions = [
        { value: 'none', label: 'No Error' },
        { value: '404', label: '404 Not Found' },
        { value: '500', label: '500 Internal Server Error' },
        { value: '400', label: '400 Bad Request' },
        { value: '403', label: '403 Forbidden' }
    ];

    const handleChange = (event) => {
        const { name, value } = event.target;
        setMockSimulation((prev) => {
            return {
                ...prev,
                [name]: value
            }
        }
        )
    };

    const handleSave = () => {
        const applySimForEndpoint = (path, method, simulation, apiSim = false) => {
            // Clone state to avoid direct mutations
            const tempConfig = { ...configuration, config: { ...configuration.config, 
                simulationDetails: { ...configuration.config.simulationDetails } } };
            const tempPaths = { ...paths };
            let tempMockScripts = [...mockScripts];
    
            // Ensure path and method exist before modifying
            if (!tempPaths[path]) tempPaths[path] = {};
            if (!tempPaths[path][method]) tempPaths[path][method] = {};
    
            // Get existing script without simulation part
            let finalScript = (tempPaths[path][method][xMediationScriptProperty] || "")
                .split('// Simulation Of Errors and Latency')[0].trim();
    
            // Initialize simulation details if they don't exist
            if (!tempConfig.config.simulationDetails[path]) {
                tempConfig.config.simulationDetails[path] = {};
            }
    
            // Determine whether to apply the API-wide simulation or the endpoint-specific one
            const useApiSimulation = apiSim || 
                (simulation.latency === 0 && simulation.error === 'none' &&
                 mockSimulation.latency !== 0 && mockSimulation.error !== 'none');
    
            const appliedSimulation = useApiSimulation ? mockSimulation : simulation;
    
            if (appliedSimulation.latency !== 0 || appliedSimulation.error !== 'none') {
                // Update simulation details
                tempConfig.config.simulationDetails[path][method] = appliedSimulation;
    
                const latencySimulationPart = '// Simulation Of Errors and Latency\n'+
                `const apiSim = ${apiSim};\n` +
                'function sleepFor(ms){\n' +
                '   var start = new Date().getTime();\n' +
                '   var end = start;\n' +
                '   while(end < start + ms) {\n' +
                '       end = new Date().getTime();\n' +
                '   }\n'+
                '}\n' +
                `sleepFor(${parseInt(appliedSimulation.latency, 10) || 0});`;
    
                // Update mock scripts
                tempMockScripts = tempMockScripts.map((methodObj) => {
                    if (methodObj.path === path && methodObj.verb.toLowerCase() === method) {
                        return { ...methodObj, simulationPart: latencySimulationPart };
                    }
                    return methodObj;
                });
    
                // Append the script for simulation
                finalScript += `\n\n${latencySimulationPart}`;
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
            applySimForEndpoint(path, method, mockSimulation, false);
        } else {
            // Apply simulation to all endpoints
            const tempConfig = { ...configuration, config: { ...configuration.config, 
                simulationDetails: { ...configuration.config.simulationDetails } } };
            tempConfig.config.simulationDetails.api = mockSimulation;
            
            mockScripts.forEach((methodObj) => {
                const { verb, path } = methodObj;
                const method = verb.toLowerCase();
                
                // Check if endpoint has its own simulation settings
                const hasEndpointSimulation = configuration.config.simulationDetails[path]?.[method];
                
                if (hasEndpointSimulation && 
                    (configuration.config.simulationDetails[path][method].latency !== 0 || 
                     configuration.config.simulationDetails[path][method].error !== 'none')) {
                    // Keep endpoint-specific simulation
                    applySimForEndpoint(path, method, configuration.config.simulationDetails[path][method], false);
                } else {
                    // Apply API-wide simulation
                    applySimForEndpoint(path, method, mockSimulation, true);
                }
            });
            
            setConfiguration(tempConfig);
        }
    
        onClose();
    };
    

    return (
        <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
            <DialogTitle>
                {currentEndpoint !== null
                    ? `Simulation Configuration for ${currentEndpoint.path} - ${currentEndpoint.method}`
                    : 'API Simulation Configuration'}
            </DialogTitle>
            <DialogContent>
                <TextField
                    fullWidth
                    margin='normal'
                    label='Latency Simulation (ms)'
                    name='latency'
                    type='number'
                    value={mockSimulation?.latency || 0}
                    onChange={handleChange}
                    helperText='Enter response delay in milliseconds'
                />
                <FormControl fullWidth margin='normal'>
                    <InputLabel>Error Simulation</InputLabel>
                    <Select
                        name='error'
                        value={mockSimulation?.error || 'none'}
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
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} variant='contained' color='primary'>
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default MockConfiguration;