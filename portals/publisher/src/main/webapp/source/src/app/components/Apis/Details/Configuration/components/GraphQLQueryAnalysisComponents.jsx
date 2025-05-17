import React, { useEffect } from 'react';
import {
    Grid, Typography, Box, TextField, FormControlLabel, Tooltip,
    Checkbox, FormControl, FormLabel, Radio, RadioGroup, Slider,
    Alert as MuiAlert
} from '@mui/material';
import HelpOutline from '@mui/icons-material/HelpOutline';
import Alert from 'AppComponents/Shared/Alert';
import CandlestickChartIcon from '@mui/icons-material/CandlestickChart';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import {
    statisticalVulnerabilities, aiPoweredVulnerabilities,
    vulnerabilityTooltips, thresholdLabels, thresholdTooltips,
    classes, API_ENDPOINT, vulnerabilityToApiKeyMap
} from './GraphQLQueryAnalysisConstants';

// Reusable Component for Section Header
export const SectionHeader = ({ icon, title }) => (
    <Grid container spacing={2} alignItems='center' sx={{ mb: 2 }}>
        <Grid item>{icon}</Grid>
        <Grid item>
            <Typography variant='h6'>{title}</Typography>
        </Grid>
    </Grid>
);

// Vulnerability Selection Component with Categories
export const VulnerabilityCheckboxes = ({ selectedChecks, onChange }) => {
    return (
        <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: 2, 
            mt: 2
        }}>
            {/* Statistical vulnerability checks section */}
            <Box sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: 2
            }}>
                <Typography variant='subtitle1' fontWeight='bold' gutterBottom sx={{ 
                    display: 'flex', 
                    alignItems: 'center' 
                }}>
                    <CandlestickChartIcon fontSize='medium' sx={{ mr: 1 }} />
                    Statistical Security Checks
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                    These checks use threshold values to detect potentially malicious queries 
                    based on their structure and complexity.
                </Typography>
                
                <Grid container spacing={1}>
                    {statisticalVulnerabilities.map((vulnerability) => (
                        <Grid item xs={12} sm={6} md={4} key={vulnerability}>
                            <FormControlLabel
                                control={
                                    <Checkbox 
                                        checked={selectedChecks[vulnerability]} 
                                        onChange={() => onChange(vulnerability)}
                                        color='primary'
                                        size='small'
                                    />
                                }
                                label={vulnerability}
                            />
                            <Tooltip 
                                title={vulnerabilityTooltips[vulnerability] || ''}
                                placement='top'
                                arrow
                            >
                                <HelpOutline fontSize='small'/>
                            </Tooltip>
                        </Grid>
                    ))}
                </Grid>
            </Box>
            <Box sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: 2,
            }}>
                <Typography variant='subtitle1' fontWeight='bold' gutterBottom sx={{ 
                    display: 'flex', 
                    alignItems: 'center' 
                }}>
                    <SettingsSuggestIcon fontSize='medium' sx={{ mr: 1 }} />
                    AI-Powered Security Checks
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                    AI security checks detect advanced attacks but are not perfect. 
                    False positives and false negatives are possible. 
                    Review by security professionals is needed for 
                    critical environments.
                </Typography>
                
                <Grid container spacing={1}>
                    {aiPoweredVulnerabilities.map((vulnerability) => (
                        <Grid item xs={12} sm={6} md={4} key={vulnerability}>
                            <FormControlLabel
                                control={
                                    <Checkbox 
                                        checked={selectedChecks[vulnerability]} 
                                        onChange={() => onChange(vulnerability)}
                                        color='primary'
                                        size='small'
                                    />
                                }
                                label={vulnerability}
                            />
                            <Tooltip 
                                title={vulnerabilityTooltips[vulnerability] || ''}
                                placement='top'
                                arrow
                            >
                                <HelpOutline fontSize='small'/>
                            </Tooltip>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Box>
    );
};

// Threshold Input Field Component
export const ThresholdField = ({ keyName, value, onChange }) => (
    <Grid item xs={12} sm={6} md={4} key={keyName}>
        <Tooltip 
            title={thresholdTooltips[keyName] || ''}
            placement='top'
            arrow
        >
            <TextField
                label={thresholdLabels[keyName] || keyName.replace(/_/g, ' ')}
                type='number'
                value={value}
                onChange={(e) => onChange(keyName, e.target.value)}
                inputProps={{ min: 0 }}
                fullWidth
                className={classes.thresholdField}
                variant='outlined'
                size='small'
            />
        </Tooltip>
    </Grid>
);

// Complexity Estimator Selection Component
export const ComplexityEstimatorSelector = ({ value, onChange, title }) => (
    <FormControl component='fieldset'>
        <FormLabel component='legend' sx={{ mb: 1 }}>
            {title || 'Select Complexity Estimator'}
        </FormLabel>
        <RadioGroup
            row
            name='complexity-estimator'
            value={value}
            onChange={(e) => onChange(e.target.value)}
        >
            <FormControlLabel 
                value='simple' 
                control={<Radio color='primary' />} 
                label='Static' 
            />
            <FormControlLabel 
                value='directive' 
                control={<Radio color='primary' />} 
                label='Dynamic' 
            />
        </RadioGroup>
    </FormControl>
);

// AI Confidence Threshold Slider Component
export const ThresholdSlider = ({ value, onChange }) => {
    // Local state to handle input field value
    const [inputValue, setInputValue] = React.useState(value);
    
    // Update local state when props change
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    // Handle slider change
    const handleSliderChange = (e, newValue) => {
        setInputValue(newValue);
        onChange('MODEL_CONFIDENT_THRESHOLD', newValue);
    };
    
    // Handle direct input change
    const handleInputChange = (e) => {
        const newValue = e.target.value === '' ? 0 : Number(e.target.value);
        setInputValue(newValue);
    };

    // Handle input blur to validate and apply value
    const handleBlur = () => {
        let finalValue = inputValue;
        // Clamp value between 0 and 1
        if (finalValue < 0) finalValue = 0;
        if (finalValue > 1) finalValue = 1;
        setInputValue(finalValue);
        onChange('MODEL_CONFIDENT_THRESHOLD', finalValue);
    };

    // Check if the threshold is below the recommended minimum value
    const isLowThreshold = inputValue < 0.4;

    return (
        <Box sx={{ px: 1, py: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant='subtitle2' sx={{ 
                    fontWeight: 500, 
                    display: 'flex', 
                    alignItems: 'center',
                    fontSize: '0.875rem'
                }}>
                    {thresholdLabels.MODEL_CONFIDENT_THRESHOLD}
                    <Tooltip 
                        title={thresholdTooltips.MODEL_CONFIDENT_THRESHOLD || ''}
                        placement='top'
                        arrow
                    >
                        <HelpOutline fontSize='small' sx={{ ml: 0.5, fontSize: '0.875rem' }} />
                    </Tooltip>
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                    <TextField
                        value={inputValue}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        type='number'
                        inputProps={{
                            min: 0,
                            max: 1,
                            step: 0.01,
                            style: { textAlign: 'center', padding: '4px 8px' }
                        }}
                        sx={{
                            width: '70px',
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: isLowThreshold ?
                                    'warning.main' : 'primary.light' },
                                '&:hover fieldset': { borderColor: isLowThreshold ? 
                                    'warning.dark' : 'primary.main' },
                                '&.Mui-focused fieldset': { borderColor: isLowThreshold ?
                                    'warning.dark' : 'primary.main' },
                            },
                        }}
                        size='small'
                        variant='outlined'
                    />
                </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', px: 1 }}>
                <Typography variant='caption' color='text.secondary' sx={{ mr: 1, width: '30px', textAlign: 'center' }}>
                    0
                </Typography>
                <Slider
                    value={typeof inputValue === 'number' ? inputValue : 0}
                    onChange={handleSliderChange}
                    step={0.01}
                    min={0}
                    max={1}
                    sx={{ 
                        flexGrow: 1,
                        '& .MuiSlider-markActive[data-index="1"]': {
                            backgroundColor: 'warning.main',
                            width: 2,
                            height: 16,
                            marginTop: -7
                        }
                    }}
                    size='small'
                />
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1, mt: 0.5 }}>
                <Typography variant='caption' color='text.secondary'>
                    Higher sensitivity
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                    Higher precision
                </Typography>
            </Box>

            {isLowThreshold && (
                <MuiAlert 
                    severity='warning' 
                    sx={{ mt: 2, py: 0.5 }}
                >
                    <Typography variant='caption'>
                        Lower values will flag more potential threats but may increase false positives.
                        Consider using a higher threshold in production environments.
                    </Typography>
                </MuiAlert>
            )}
        </Box>
    );
};

// API Service Functions
export const sendSchemaToService = async (schema) => {
    try {
        const response = await fetch(`${API_ENDPOINT}/set_schema`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                graphql_schema: schema,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to send schema');
        }
        return true;
    } catch (error) {
        console.error('Error sending schema:', error);
        Alert.error('Error occurred while sending schema');
        return false;
    }
};

export const getSecurityCheckPayload = (selectedVulnerabilities) => {
    const checks = {};
    
    // Explicitly set all options to 'disable' first
    Object.values(vulnerabilityToApiKeyMap).forEach(apiKey => {
        checks[apiKey] = 'disable';
    });
    
    // Then set selected ones to 'enable'
    Object.entries(selectedVulnerabilities).forEach(([vulnerability, isSelected]) => {
        const apiKey = vulnerabilityToApiKeyMap[vulnerability];
        if (apiKey && isSelected) {
            checks[apiKey] = 'enable';
        }
    });
    
    return checks;
};

export const saveConfiguration = async (
    thresholds, 
    selectedVulnerabilities, 
    estimatorType, 
    vulnerabilityToThresholdMap) => {
    try {
        Alert.info('Saving configuration...');
        
        // Create configuration payload with thresholds
        const configPayload = {};
        
        // Set thresholds based on selected vulnerabilities
        Object.entries(thresholds).forEach(([key, value]) => {
            // Special handling for MODEL_CONFIDENT_THRESHOLD - always include it with its current value
            if (key === 'MODEL_CONFIDENT_THRESHOLD') {
                configPayload[key.toLowerCase()] = value;
                return;
            }
            
            // For other thresholds, use the regular logic
            const relatedVulnerability = Object.entries(vulnerabilityToThresholdMap)
                .find(([, thresholdList]) => thresholdList.includes(key));
            
            // If threshold has a related vulnerability and it's selected, use defined value
            if (relatedVulnerability && selectedVulnerabilities[relatedVulnerability[0]]) {
                configPayload[key.toLowerCase()] = value;
            } else {
                configPayload[key.toLowerCase()] = 10000;
            }
        });
        
        configPayload.detect_per_directive = false;
        configPayload.complexity_estimator = estimatorType;

        // Step 1: Send configuration settings
        const configResponse = await fetch(`${API_ENDPOINT}/set_config`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(configPayload),
        });

        if (!configResponse.ok) {
            const errorText = await configResponse.text();
            console.error('Config API Error:', errorText);
            Alert.error('Failed to save configuration. Please try again.');
            return false;
        }
        
        // Step 2: Get security checks payload and send it
        const securityChecks = getSecurityCheckPayload(selectedVulnerabilities);
        
        const checksResponse = await fetch(`${API_ENDPOINT}/set_checks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(securityChecks),
        });

        if (!checksResponse.ok) {
            const errorText = await checksResponse.text();
            console.error('Security Checks API Error:', errorText);
            Alert.error('Failed to save security checks. Please try again.');
            return false;
        }

        // Step 3: Generate dynamic schema for complexity estimator only if estimator is 'directive'
        if (estimatorType === 'directive') {
            const schemaResponse = await fetch(`${API_ENDPOINT}/generate_dynamic_schema`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!schemaResponse.ok) {
                const errorText = await schemaResponse.text();
                console.error('Dynamic Schema API Error:', errorText);
                Alert.error('Failed to generate dynamic schema. Please try again.');
                return false;
            }
        }

        // Step 4: Send reload request to apply changes
        const reloadResponse = await fetch(`${API_ENDPOINT}/reload-config`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!reloadResponse.ok) {
            const errorText = await reloadResponse.text();
            console.error('Reload API Error:', errorText);
            Alert.error('Failed to reload configuration. Please try again.');
            return false;
        }

        // Get the reload response data to confirm settings were applied
        const reloadData = await reloadResponse.json();
        console.log('Configuration reloaded successfully:', reloadData);
        
        // Add a small delay to ensure settings are fully applied
        await new Promise(resolve => setTimeout(resolve, 500));
        
        Alert.success('Security configuration saved and applied successfully!');
        return true;

    } catch (error) {
        console.error('Error saving configuration:', error);
        Alert.error(`Error occurred: ${error.message || 'Unknown error'}`);
        return false;
    }
};

export const fetchAIRecommendations = async () => {
    try {
        Alert.info('Generating AI recommendations...');
        const response = await fetch(`${API_ENDPOINT}/generate_config`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Failed to retrieve AI-generated configuration');
        }

        const data = await response.json();
        Alert.success('AI-generated configuration retrieved successfully!');
        return data;
    } catch (error) {
        console.error('Error retrieving AI configuration:', error);
        Alert.error('Error retrieving AI configuration. Using default values.');
        return null;
    }
};
