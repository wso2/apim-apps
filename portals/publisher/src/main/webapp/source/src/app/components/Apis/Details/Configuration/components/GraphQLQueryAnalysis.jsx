import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { 
    Grid, Typography, Button, Paper, Dialog, DialogActions, DialogContent, 
    DialogContentText, DialogTitle, Container, TextField, FormControlLabel, 
    Tooltip, Divider, Box, Alert as MuiAlert, Radio, RadioGroup, FormControl, 
    FormLabel, Chip, Checkbox, Slider
} from '@mui/material';
import EditRounded from '@mui/icons-material/EditRounded';
import HelpOutline from '@mui/icons-material/HelpOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import ScienceIcon from '@mui/icons-material/Science';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RefreshIcon from '@mui/icons-material/Refresh';
import SecurityIcon from '@mui/icons-material/Security';
import { FormattedMessage } from 'react-intl';
import Alert from 'AppComponents/Shared/Alert';
import API from 'AppData/api';

// Constants and configuration data
const PREFIX = 'GraphQLQueryAnalysis';
const API_ENDPOINT = 'http://127.0.0.1:8000';

const apiClient = new API();

// Define vulnerability types by category
const statisticalVulnerabilities = [
    'Alias overloading', 'Batch overloading', 'Deep circular queries',
    'Directive overloading', 'Introspection queries', 'Excessive complexity',
    'Excessive query depth', 'Query payload inflation'
];

const aiPoweredVulnerabilities = [
    'SQL injections', 'XSS exploits', 'OS command injections', 'SSRF attempts'
];

// Combined vulnerability types (used in existing code)
const vulnerabilityTypes = [...statisticalVulnerabilities, ...aiPoweredVulnerabilities];

const vulnerabilityTooltips = {
    'Alias overloading': 'Detects attacks that use excessive aliases to cause denial of service.',
    'Batch overloading': 'Identifies requests with multiple operations to prevent resource exhaustion.',
    'Deep circular queries': 'Prevents recursive query patterns that could cause infinite loops.',
    'Directive overloading': 'Blocks queries with excessive directives that might overload resolvers.',
    'Introspection queries': 'Identifies and blocks schema introspection attempts that expose API structure.',
    'Excessive complexity': 'Prevents computationally expensive queries that could impact performance.',
    'Excessive query depth': 'Stops deeply nested queries that may cause server resource exhaustion.',
    'Query payload inflation': 'Prevents oversized queries that could consume excessive bandwidth or memory.',
    'SQL injections': 'Uses AI to detect potential SQL injection attempts in query variables or arguments.',
    'XSS exploits': 'Identifies cross-site scripting patterns that could lead to client-side attacks.',
    'OS command injections': 'Detects attempts to execute operating system commands via GraphQL queries.',
    'SSRF attempts': 'Identifies server-side request forgery attempts that could access internal resources.'
};

// Map of vulnerability types to their corresponding threshold keys
const vulnerabilityToThresholdMap = {
    'Alias overloading': ['ALIAS_THRESHOLD'],
    'Batch overloading': ['BATCH_THRESHOLD'],
    'Deep circular queries': ['CIRCULAR_QUERY_THRESHOLD'],
    'Directive overloading': ['DIRECTIVE_THRESHOLD'],
    'Excessive complexity': ['SIMPLE_ESTIMATOR_COMPLEXITY', 'SIMPLE_ESTIMATOR_THRESHOLD'],
    'Excessive query depth': ['QUERY_DEPTH_THRESHOLD'],
    'Query payload inflation': ['TOKEN_LIMIT_THRESHOLD'],
    'Introspection queries': [],
    'SQL injections': [],
    'XSS exploits': [],
    'OS command injections': [],
    'SSRF attempts': []
};

// Map vulnerability types to API parameter keys
const vulnerabilityToApiKeyMap = {
    'Directive overloading': 'detect_directive_overloading',
    'Alias overloading': 'detect_alias_overloading',
    'Batch overloading': 'detect_batch_overloading',
    'Deep circular queries': 'detect_circular_query',
    'Introspection queries': 'check_introspection_query',
    'Excessive query depth': 'detect_query_depth',
    'Query payload inflation': 'detect_token_limit',
    'Excessive complexity': 'detect_complex_query',
    'SQL injections': 'detect_sqli',
    'XSS exploits': 'detect_xss_exploit',
    'OS command injections': 'detect_osi',
    'SSRF attempts': 'check_ssrf'
};

// Configuration and threshold settings
const thresholdLabels = {
    ALIAS_THRESHOLD: 'Maximum Aliases Allowed',
    BATCH_THRESHOLD: 'Maximum Batch Size',
    CIRCULAR_QUERY_THRESHOLD: 'Maximum Circular References',
    DIRECTIVE_THRESHOLD: 'Maximum Directives per Query',
    SIMPLE_ESTIMATOR_COMPLEXITY: 'Complexity Multiplier',
    SIMPLE_ESTIMATOR_THRESHOLD: 'Maximum Query Complexity',
    QUERY_DEPTH_THRESHOLD: 'Maximum Query Depth',
    TOKEN_LIMIT_THRESHOLD: 'Maximum Tokens per Query',
    MODEL_CONFIDENT_THRESHOLD: 'AI Confidence Threshold'
};

const thresholdTooltips = {
    ALIAS_THRESHOLD: 'Limits number of alias fields in a query to prevent alias overloading attacks',
    BATCH_THRESHOLD: 'Controls maximum number of operations per request to prevent batch overloading',
    CIRCULAR_QUERY_THRESHOLD: 'Restricts recursive queries that could cause denial of service',
    DIRECTIVE_THRESHOLD: 'Limits directive usage to prevent directive-based attacks',
    SIMPLE_ESTIMATOR_COMPLEXITY: 'Base multiplier for query complexity calculations',
    SIMPLE_ESTIMATOR_THRESHOLD: 'Maximum allowed query complexity score before rejection',
    QUERY_DEPTH_THRESHOLD: 'Controls maximum nesting depth of queries to prevent deep query attacks',
    TOKEN_LIMIT_THRESHOLD: 'Maximum query size in tokens to prevent oversized payloads',
    MODEL_CONFIDENT_THRESHOLD: 'Minimum confidence level required for AI-powered checks to flag malicious queries'
};

const defaultThresholds = {
    ALIAS_THRESHOLD: 5,
    BATCH_THRESHOLD: 5,
    CIRCULAR_QUERY_THRESHOLD: 3,
    DIRECTIVE_THRESHOLD: 5,
    SIMPLE_ESTIMATOR_COMPLEXITY: 1,
    SIMPLE_ESTIMATOR_THRESHOLD: 40,
    QUERY_DEPTH_THRESHOLD: 8,
    TOKEN_LIMIT_THRESHOLD: 1200,
    MODEL_CONFIDENT_THRESHOLD: 0.5
};

// Styled components
const classes = {
    content: `${PREFIX}-content`,
    itemWrapper: `${PREFIX}-itemWrapper`,
    FormControl: `${PREFIX}-FormControl`,
    subTitle: `${PREFIX}-subTitle`,
    subTitleDescription: `${PREFIX}-subTitleDescription`,
    flowWrapper: `${PREFIX}-flowWrapper`,
    subHeading: `${PREFIX}-subHeading`,
    heading: `${PREFIX}-heading`,
    paper: `${PREFIX}-paper`,
    editIcon: `${PREFIX}-editIcon`,
    thresholdField: `${PREFIX}-thresholdField`,
    thresholdGroup: `${PREFIX}-thresholdGroup`,
    thresholdLabel: `${PREFIX}-thresholdLabel`,
    iconSpace: `${PREFIX}-iconSpace`,
};

const Root = styled('div')(({ theme }) => ({
    [`& .${classes.content}`]: {
        flexGrow: 1,
    },
    [`& .${classes.itemWrapper}`]: {
        width: 'auto',
        display: 'flex',
    },
    [`& .${classes.FormControl}`]: {
        padding: 10,
        width: '100%',
        marginTop: 0,
        display: 'flex',
        flexDirection: 'row',
    },
    [`& .${classes.subTitle}`]: {
        marginTop: 20,
    },
    [`& .${classes.subTitleDescription}`]: {
        marginBottom: 10,
    },
    [`& .${classes.flowWrapper}`]: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    [`& .${classes.subHeading}`]: {
        fontSize: '1rem',
        fontWeight: 400,
        margin: 0,
        display: 'inline-flex',
        lineHeight: 1.5,
    },
    [`& .${classes.heading}`]: {
        margin: 'auto',
        color: 'rgba(0, 0, 0, 0.40)',
    },
    [`& .${classes.paper}`]: {
        padding: '10px 24px',
        width: 'auto',
    },
    [`& .${classes.editIcon}`]: {
        position: 'absolute',
        top: 8,
        right: 0,
    },
    [`& .${classes.thresholdField}`]: {
        margin: '8px 0',
    },
    [`& .${classes.thresholdGroup}`]: {
        marginBottom: '20px',
    },
    [`& .${classes.thresholdLabel}`]: {
        fontWeight: 500,
        marginBottom: '8px',
    },
    [`& .${classes.iconSpace}`]: {
        marginLeft: theme.spacing(0.5),
    },
}));

const StyledDialog = styled(Dialog)(() => ({
    [`& .${classes.subHeading}`]: {
        fontSize: '1rem',
        fontWeight: 400,
        margin: 0,
        display: 'inline-flex',
        lineHeight: 1.5,
    }
}));

// Reusable Component for Section Header
const SectionHeader = ({ icon, title }) => (
    <Grid container spacing={2} alignItems='center' sx={{ mb: 2 }}>
        <Grid item>{icon}</Grid>
        <Grid item>
            <Typography variant='h6'>{title}</Typography>
        </Grid>
    </Grid>
);

// Updated Vulnerability Selection Component with Categories
const VulnerabilityCheckboxes = ({ selectedChecks, onChange }) => {
    
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
                <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
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
            
            {/* AI-powered vulnerability checks section */}
            <Box sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: 2,
            }}>
                <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
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

// Reusable Component for Threshold Input Fields
const ThresholdField = ({ keyName, value, onChange }) => (
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

// Reusable Component for Complexity Estimator Selection
const ComplexityEstimatorSelector = ({ value, onChange, title }) => (
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

// Reusable Component for AI Confidence Threshold Slider
const ThresholdSlider = ({ value, onChange }) => {
    // Local state to handle input field value
    const [inputValue, setInputValue] = React.useState(value);
    
    // Update local state when props change
    React.useEffect(() => {
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

// Main Component
export default function GraphQLQueryAnalysis(props) {
    const { api } = props;
    
    // State
    const [open, setOpen] = useState(false);
    const [aiRecommendationsGenerated, setAiRecommendationsGenerated] = useState(false);
    const [thresholds, setThresholds] = useState(defaultThresholds);
    const [estimatorType, setEstimatorType] = useState('simple');
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [saveConfirmDialogOpen, setSaveConfirmDialogOpen] = useState(false);
    const [selectedVulnerabilities, setSelectedVulnerabilities] = useState(
        vulnerabilityTypes.reduce((acc, vulnerability) => {
            acc[vulnerability] = false;
            return acc;
        }, {})
    );

    // Helper to check if any AI-powered checks are selected
    const hasAnyAIPoweredCheckSelected = () => {
        return aiPoweredVulnerabilities.some(v => selectedVulnerabilities[v]);
    };
    
    // Handle vulnerability check selection
    const handleVulnerabilityChange = (vulnerability) => {
        setSelectedVulnerabilities({
            ...selectedVulnerabilities,
            [vulnerability]: !selectedVulnerabilities[vulnerability]
        });
    };
    
    // Get security checks payload for API
    const getSecurityCheckPayload = () => {
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

    // API interaction handlers
    const sendSchemaToService = async (schema) => {
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

    const saveConfiguration = async () => {
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
            
            // Add other configuration parameters
            configPayload.detect_per_directive = false;
            configPayload.complexity_estimator = estimatorType;

            console.log('Sending config payload:', configPayload); // Debug log

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
            const securityChecks = getSecurityCheckPayload();
            
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
            
            console.log('Security checks saved successfully');

            // Step 3: Send reload request to apply changes
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

    const fetchAIRecommendations = async () => {
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
            
            // Update thresholds with AI recommendations
            const aiRecommendedValues = {
                ...defaultThresholds,
                ...data.THRESHOLDS
            };
            
            setEstimatorType(data.MODE.COMPLEXITY_ESTIMATOR);
            setThresholds(aiRecommendedValues);
            setAiRecommendationsGenerated(true);
            Alert.success('AI-generated configuration retrieved successfully!');
            return true;
        } catch (error) {
            console.error('Error retrieving AI configuration:', error);
            Alert.error('Error retrieving AI configuration. Using default values.');
            return false;
        }
    };

    // UI Event Handlers
    const handleEditClick = () => {
        setConfirmDialogOpen(true);
    };
    
    const handleConfirmDialogClose = () => {
        setConfirmDialogOpen(false);
    };
    
    const handleConfirmSendSchema = async () => {
        setConfirmDialogOpen(false);
        
        try {
            const schemaResponse = await apiClient.getSchema(api.id);
            const { schemaDefinition } = schemaResponse.obj;
            
            const success = await sendSchemaToService(schemaDefinition);
            if (success) {
                setOpen(true);
            }
        } catch (error) {
            console.error('Error retrieving schema:', error);
            Alert.error('Failed to retrieve schema. Please try again.');
        }
    };
    
    const handleDenyPermission = () => {
        setConfirmDialogOpen(false);
        Alert.info('Configuration requires schema analysis. Operation cancelled.');
    };

    const handleClose = () => {
        setOpen(false);
        setAiRecommendationsGenerated(false);
    };

    const handleThresholdChange = (key, value) => {
        if (key === 'MODEL_CONFIDENT_THRESHOLD') {
            setThresholds({
                ...thresholds,
                [key]: value
            });
        } else {
            const numValue = parseInt(value, 10) || 0;
            const nonNegativeValue = Math.max(0, numValue);
            
            setThresholds({
                ...thresholds,
                [key]: nonNegativeValue
            });
        }
    };

    const handleSave = () => {
        setSaveConfirmDialogOpen(true);
    };

    const handleConfirmSave = async () => {
        setSaveConfirmDialogOpen(false);
        const success = await saveConfiguration();
        if (success) {
            setOpen(false);
        }
    };

    const handleAIConfiguration = async () => {
        if (aiRecommendationsGenerated) {
            setAiRecommendationsGenerated(false);
        }

        await fetchAIRecommendations();
    };

    // Filter threshold fields based on selected vulnerabilities
    const getRelevantThresholdKeys = () => {
        const relevantKeys = new Set();
        
        Object.entries(selectedVulnerabilities).forEach(([vulnerability, isSelected]) => {
            if (isSelected) {
                const thresholdKeys = vulnerabilityToThresholdMap[vulnerability] || [];
                thresholdKeys.forEach(key => relevantKeys.add(key));
            }
        });
        
        return Array.from(relevantKeys);
    };

    // Check if any relevant threshold fields are visible
    const hasVisibleThresholdFields = () =>{
        return getRelevantThresholdKeys().length > 0;
    }

    // Modified ThresholdFields component to show only relevant fields
    const ThresholdFields = ({ thresholdsData, estimatorTypeValue, onThresholdChange }) => {
        const relevantKeys = getRelevantThresholdKeys();
        const showComplexitySettings = selectedVulnerabilities['Excessive complexity'] 
                                            && estimatorTypeValue === 'simple';
        
        return (
            <>
                {showComplexitySettings && (
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <ThresholdField 
                            keyName='SIMPLE_ESTIMATOR_COMPLEXITY'
                            value={thresholdsData.SIMPLE_ESTIMATOR_COMPLEXITY}
                            onChange={onThresholdChange}
                        />
                        <ThresholdField 
                            keyName='SIMPLE_ESTIMATOR_THRESHOLD'
                            value={thresholdsData.SIMPLE_ESTIMATOR_THRESHOLD}
                            onChange={onThresholdChange}
                        />
                    </Grid>
                )}
                
                {estimatorTypeValue !== 'simple' && selectedVulnerabilities['Excessive complexity'] && (
                    <MuiAlert severity='info' sx={{ mt: 2 }}>
                        Your schema will be analyzed by AI and complexity values will be 
                        assigned for each field dynamically.
                    </MuiAlert>
                )}
                
                {relevantKeys.length > 0 && (
                    <div className={classes.thresholdGroup}>
                        <Grid container spacing={2} sx={{ mt: 2 }}>
                            {relevantKeys.map(key => {
                                // Skip complexity settings as they're handled separately
                                if (key === 'SIMPLE_ESTIMATOR_COMPLEXITY' || key === 'SIMPLE_ESTIMATOR_THRESHOLD') {
                                    return null;
                                }
                                
                                return (
                                    <ThresholdField 
                                        key={key}
                                        keyName={key}
                                        value={thresholdsData[key]}
                                        onChange={onThresholdChange}
                                    />
                                );
                            })}
                        </Grid>
                    </div>
                )}

                {relevantKeys.length === 0 && (
                    <MuiAlert severity='info' sx={{ mt: 2 }}>
                        No threshold settings required for the selected vulnerabilities.
                    </MuiAlert>
                )}
            </>
        );
    };

    // Component renders
    const renderSecurityInfoSection = () => (
        <Box sx={{ mb: 4 }}>
            <SectionHeader 
                icon={<SecurityIcon color='primary' />} 
                title='GraphQL Security Protection'
            />
            
            <VulnerabilityCheckboxes
                selectedChecks={selectedVulnerabilities}
                onChange={handleVulnerabilityChange}
            />
        </Box>
    );

    // Combined configuration section instead of separate AI and manual options
    const renderConfigurationSection = () => (
        <Box sx={{ mb: 4 }}>
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item>
                    <SectionHeader 
                        icon={<SettingsIcon color='primary' />} 
                        title='Security Configuration'
                    />
                </Grid>
                <Grid item sx={{ ml: 'auto' }}>
                    <Button
                        variant='outlined'
                        color='primary'
                        startIcon={aiRecommendationsGenerated ? <RefreshIcon /> : <AutoAwesomeIcon />}
                        onClick={handleAIConfiguration}
                        disabled={!hasVisibleThresholdFields()}
                    >
                        {aiRecommendationsGenerated ? 'Regenerate' : 'Get AI Recommendations'}
                    </Button>
                </Grid>
            </Grid>

            {aiRecommendationsGenerated && (
                <MuiAlert severity='success' sx={{ mb: 3 }}>
                    <Typography variant='body2'>
                        AI has analyzed your schema and recommended optimal security settings for your API.
                    </Typography>
                </MuiAlert>
            )}

            <Box sx={{ mb: 4, mt: 2 }}>
                {selectedVulnerabilities['Excessive complexity'] && (
                    <ComplexityEstimatorSelector
                        value={estimatorType}
                        onChange={setEstimatorType}
                        title={aiRecommendationsGenerated ? 
                            'AI-Recommended Complexity Estimator' 
                            : 'Select Complexity Estimator'}
                    />
                )}
                
                <ThresholdFields 
                    thresholdsData={thresholds} 
                    estimatorTypeValue={estimatorType} 
                    onThresholdChange={handleThresholdChange} 
                />
                
                {hasAnyAIPoweredCheckSelected() && (
                    <Box sx={{ 
                        mt: 3, 
                        border: '1px solid', 
                        borderColor: 'divider',
                        borderRadius: 1,
                        py: 1,
                        width: 400
                    }}>
                        <ThresholdSlider
                            value={thresholds.MODEL_CONFIDENT_THRESHOLD}
                            onChange={handleThresholdChange}
                        />
                    </Box>
                )}
            </Box>
        </Box>
    );

    // Main render
    return (
        <Root>
            {/* Main component display */}
            <Paper className={classes.paper} spacing={2}>
                <Grid container spacing={2} alignItems='flex-start'>
                    <Grid item md={12} style={{ position: 'relative', display: 'inline-flex' }}>
                        <Typography className={classes.subHeading} variant='h6'>
                            GraphQL Query Configurations
                            <Tooltip
                                title={(
                                    <FormattedMessage
                                        id='Apis.Details.Configuration.components.graphql.query.analysis.tooltip'
                                        defaultMessage={'Enable the query analysis for '
                                            + 'GraphQL APIs using an external service'}
                                    />
                                )}
                                aria-label='Schema Validation helper text'
                                placement='right-end'
                                interactive
                            >
                                <HelpOutline className={classes.iconSpace} />
                            </Tooltip>
                        
                        </Typography>
                        
                        {/* New feature badge */}
                        <Chip 
                            icon={<ScienceIcon />} 
                            label='Experimental' 
                            size='small' 
                            color='primary'
                            variant='outlined'
                            sx={{ 
                                ml: 1, 
                                height: 20, 
                                '& .MuiChip-label': { 
                                    px: 1,
                                    py: 0.25, 
                                    fontWeight: 'bold',
                                    fontSize: '0.7rem'
                                },
                                '& .MuiChip-icon': {
                                    fontSize: '1rem',
                                    ml: 0.5
                                }
                            }} 
                        />
                        
                        <Button
                            className={classes.editIcon}
                            size='small'
                            onClick={handleEditClick}
                        >
                            <EditRounded />
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Confirmation Dialog */}
            <Dialog
                open={confirmDialogOpen}
                onClose={handleConfirmDialogClose}
                aria-labelledby='confirm-dialog-title'
                aria-describedby='confirm-dialog-description'
                maxWidth='sm'
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                        overflow: 'hidden',
                    }
                }}
            >
                <Box sx={{ 
                    bgcolor: 'primary.dark', 
                    color: 'white', 
                    p: 2, 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                }}>
                    <SecurityIcon fontSize='large' />
                    <Typography variant='h5' sx={{ fontWeight: 500 }}>
                        Enhanced GraphQL Security
                    </Typography>
                </Box>
                <DialogContent sx={{ py: 4, px: 3 }}>
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 3 
                    }}>
                        <Typography variant='h6' sx={{ fontWeight: 500 }}>
                            Add an Intelligent Security Layer to Protect Your GraphQL API
                        </Typography>

                        <Box sx={{ 
                            display: 'flex', 
                            p: 2,
                            color: 'primary.main',
                            alignItems: 'center',
                            gap: '20px',
                            border: '1px solid',
                            borderRadius: 2,

                        }}>
                            <Box>
                                <img
                                    alt='API Design Assistant'
                                    src='/site/public/images/ai/DesignAssistant.svg'
                                    style={{ width: '80px', height: 'auto' }}
                                />
                            </Box>
                            <Typography variant='body2'>
                                Our AI-powered protection system analyzes query patterns to detect and
                                block malicious requests before they reach your backend. To provide optimal 
                                security settings, your GraphQL schema will be analyzed by our
                                threat detection service.
                            </Typography>
                        </Box>

                        <MuiAlert 
                            severity='warning' 
                            sx={{ 
                                '& .MuiAlert-message': {
                                    fontWeight: 500 
                                }
                            }}
                        >
                            This security feature may slightly increase query latency.
                            Performance impact varies based on query complexity.
                        </MuiAlert>

                        <Box sx={{ 
                            mt: 1,
                            p: 2, 
                            border: '1px solid', 
                            borderColor: 'divider',
                            borderRadius: 2,
                            bgcolor: 'background.paper',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1
                        }}>
                            <Typography variant='subtitle2' sx={{ 
                                fontWeight: 700, 
                                marginBottom: '10px'
                            }}>
                                Protects Against:
                            </Typography>
                            <Grid container spacing={1}>
                                {vulnerabilityTypes.slice(0,).map((threat) => (
                                    <Grid item xs={6} key={threat} sx={
                                        { display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box component='span' sx={{ 
                                            width: 5, 
                                            height: 5, 
                                            borderRadius: '50%', 
                                            bgcolor: 'primary.main', 
                                            display: 'inline-block' 
                                        }} />
                                        <Typography variant='body1'>{threat}</Typography>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2, bgcolor: 'background.default' }}>
                    <Button 
                        onClick={handleDenyPermission}
                        variant='outlined'
                        color='inherit'
                        sx={{ px: 3 }}
                    >
                        Skip for now
                    </Button>
                    <Button 
                        onClick={handleConfirmSendSchema} 
                        color='primary' 
                        variant='contained'
                        startIcon={<SecurityIcon />}
                        sx={{ 
                            px: 3,
                            boxShadow: 2,
                        }}
                    >
                        Enable Protection
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Configuration Dialog */}
            <StyledDialog
                open={open}
                onClose={handleClose}
                aria-labelledby='responsive-dialog-title'
                sx={{
                    '& .MuiDialog-container > .MuiPaper-root': {
                        width: '100%',
                        maxWidth: '65vw',
                        maxHeight: '95vh',
                    }
                }}
            >
                <DialogTitle id='responsive-dialog-title'>
                    <Typography className={classes.subHeading} variant='h4'>
                        Configure GraphQL Query Security
                    </Typography>
                </DialogTitle>
                <DialogContent dividers>
                    <DialogContentText>
                        <Container fixed>
                            {renderSecurityInfoSection()}
                            <Divider sx={{ my: 3 }} />
                            {renderConfigurationSection()}
                        </Container>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant='contained'
                        color='primary'
                        onClick={handleSave}
                    >
                        Set
                    </Button>
                    <Button onClick={handleClose} color='primary'>
                        Cancel
                    </Button>
                </DialogActions>
            </StyledDialog>

            {/* Save Confirmation Dialog */}
            <Dialog
                open={saveConfirmDialogOpen}
                onClose={() => setSaveConfirmDialogOpen(false)}
                maxWidth='sm'
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                    }
                }}
            >
                <DialogTitle sx={{ 
                    bgcolor: 'warning.light', 
                    color: 'warning.contrastText',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}>
                    <SecurityIcon />
                    <Typography variant='h6'>Activating Protection</Typography>
                </DialogTitle>
                <DialogContent sx={{ pt: 3, pb: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 2 }}>
                        <Typography variant='body1'>
                            Activating GraphQL protection will apply security rules to your API and 
                            may take several minutes to complete.
                        </Typography>
                        <MuiAlert severity='warning'>
                            <Typography variant='body2'>
                                While the protection is being activated:
                            </Typography>
                            <Box component='ul' sx={{ mt: 1, pl: 2 }}>
                                <Box component='li'>
                                    Your API will continue to function with previous configurations.
                                </Box>
                                <Box component='li'>
                                    You will not be able to modify security settings until the process completes
                                </Box>
                            </Box>
                        </MuiAlert>
                        <Typography variant='body1'>
                            Do you want to proceed with activating the protection?
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2, bgcolor: 'background.default' }}>
                    <Button 
                        onClick={() => setSaveConfirmDialogOpen(false)}
                        variant='outlined'
                        color='inherit'
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleConfirmSave}
                        color='primary' 
                        variant='contained'
                        startIcon={<SecurityIcon />}
                    >
                        Activate Protection
                    </Button>
                </DialogActions>
            </Dialog>
        </Root>
    );
}
