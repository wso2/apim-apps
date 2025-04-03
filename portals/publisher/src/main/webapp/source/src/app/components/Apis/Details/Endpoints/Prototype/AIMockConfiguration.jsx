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

const AIMockConfiguration = ({ open, onClose, configuration, setConfiguration, currentConfig }) => {
    const [mockConfig, setMockConfig] = useState({});
    const [currentEndpoint, setCurrentEndpoint] = useState(null);

    useEffect(() => {
        if (open) {  // Only update when dialog opens
            if (currentConfig.path) {
                const {path, method} = currentConfig
                setCurrentEndpoint({ path, method });
                setMockConfig(
                    configuration?.config?.simulationDetails?.[path]?.[method] || {
                        latency: 0,
                        error: 'none',
                    }
                );
            } else {
                setCurrentEndpoint(null);
                setMockConfig(
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
        console.log(event.target)
        const { name, value } = event.target;
        setMockConfig((prev) => {
            return {
                ...prev,
                [name]: value
            }
        }
        )
    };

    const handleSave = () => {
        const tempConfig = configuration
        if (currentEndpoint){
            const {path, method} = currentEndpoint
            if (!tempConfig?.config?.simulationDetails[path]){
                tempConfig.config.simulationDetails[path] = {}
            }
            tempConfig.config.simulationDetails[path][method] = mockConfig;
        }else{
            tempConfig.config.simulationDetails.api = mockConfig;
        }
        setConfiguration(tempConfig);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
            <DialogTitle>
                {currentConfig !== 'api'
                    ? `Configuration for ${currentConfig}`
                    : 'API Mock Configuration'}
            </DialogTitle>
            <DialogContent>
                <TextField
                    fullWidth
                    margin='normal'
                    label='Latency (ms)'
                    name='latency'
                    type='number'
                    value={mockConfig?.latency || 0}
                    onChange={handleChange}
                    helperText='Enter response delay in milliseconds'
                />
                <FormControl fullWidth margin='normal'>
                    <InputLabel>Error Simulation</InputLabel>
                    <Select
                        name='error'
                        value={mockConfig?.error || 'none'}
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

export default AIMockConfiguration;