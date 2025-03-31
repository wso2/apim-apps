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
    const [currentPath, setCurrentPath] = useState(null);
    const [currentMethod, setCurrentMethod] = useState(null);

    useEffect(() => {
        if (currentConfig !== 'api') {
            const [path, method] = currentConfig.split(' - ');
            setCurrentPath(path);
            setCurrentMethod(method);
            setMockConfig(
                configuration?.[path]?.[method] || {
                    context: '',
                    latency: 0,
                    errorSimulation: 'none',
                }
            );
        } else {
            setCurrentPath(null);
            setCurrentMethod(null);
            setMockConfig(
                configuration?.api || {
                    context: '',
                    latency: 0,
                    errorSimulation: 'none',
                }
            );
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
        setMockConfig({
            ...mockConfig,
            [name]: value,
        });
    };

    const handleSave = () => {
        setConfiguration((prevConfig) => {
            if (currentPath && currentMethod) {
                return {
                    ...prevConfig,
                    [currentPath]: {
                        ...prevConfig[currentPath],
                        [currentMethod]: {
                            ...prevConfig[currentPath]?.[currentMethod],
                            ...mockConfig,
                        },
                    },
                };
            } else {
                return {
                    ...prevConfig,
                    api: {
                        ...prevConfig.api,
                        ...mockConfig,
                    },
                };
            }
        });
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
                    label='Context'
                    name='context'
                    value={
                        mockConfig?.context || ''
                    }
                    onChange={handleChange}
                    helperText='Enter the mock context'
                />
                <TextField
                    fullWidth
                    margin='normal'
                    label='Latency (ms)'
                    name='latency'
                    type='number'
                    value={
                        mockConfig?.latency || 0
                    }
                    onChange={handleChange}
                    helperText='Enter response delay in milliseconds'
                />
                <FormControl fullWidth margin='normal'>
                    <InputLabel>Error Simulation</InputLabel>
                    <Select
                        name='errorSimulation'
                        value={mockConfig?.errorSimulation || 'none'
                        }
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