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

import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { 
    Grid, Typography, Button, Paper, Dialog, DialogActions, DialogContent, 
    DialogContentText, DialogTitle, Container, Tooltip, Divider, Box, 
    Alert as MuiAlert, Chip, Card, TextField
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

import {
    vulnerabilityTypes,
    aiPoweredVulnerabilities,
    vulnerabilityToThresholdMap,
    defaultThresholds,
    classes,
} from './GraphQL/Constants';

import {
    SectionHeader,
    VulnerabilityCheckboxes,
    ComplexityEstimatorSelector,
    ThresholdSlider,
    ThresholdField,
    sendSchemaToService,
    saveConfiguration,
    fetchAIRecommendations,
} from './GraphQL/Components';

const apiClient = new API();

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
    const [customPrompt, setCustomPrompt] = useState('');
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
        const success = await saveConfiguration(
            thresholds, 
            selectedVulnerabilities, 
            estimatorType, 
            vulnerabilityToThresholdMap);
        if (success) {
            setOpen(false);
        }
    };

    const handleAIConfiguration = async () => {
        if (aiRecommendationsGenerated) {
            setAiRecommendationsGenerated(false);
        }

        const aiConfig = await fetchAIRecommendations(customPrompt);
        if (aiConfig) {
            setEstimatorType(aiConfig.MODE.COMPLEXITY_ESTIMATOR);
            setThresholds({
                ...defaultThresholds,
                ...aiConfig.THRESHOLDS
            });
            setAiRecommendationsGenerated(true);
        }
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
    const hasVisibleThresholdFields = () => {
        return getRelevantThresholdKeys().length > 0;
    };

    // Custom ThresholdFields implementation - kept in main component as it uses local state/functions
    const ThresholdFieldsGroup = () => {
        const relevantKeys = getRelevantThresholdKeys();
        const showComplexitySettings = selectedVulnerabilities['Excessive complexity'] 
                                            && estimatorType === 'simple';
        
        return (
            <>
                {showComplexitySettings && (
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <ThresholdField 
                            keyName='SIMPLE_ESTIMATOR_COMPLEXITY'
                            value={thresholds.SIMPLE_ESTIMATOR_COMPLEXITY}
                            onChange={handleThresholdChange}
                        />
                        <ThresholdField 
                            keyName='SIMPLE_ESTIMATOR_THRESHOLD'
                            value={thresholds.SIMPLE_ESTIMATOR_THRESHOLD}
                            onChange={handleThresholdChange}
                        />
                    </Grid>
                )}
                
                {estimatorType !== 'simple' && selectedVulnerabilities['Excessive complexity'] && (
                    <MuiAlert severity='info' sx={{ mt: 2 }}>
                        <FormattedMessage
                            id='Apis.Details.Configuration.components.GraphQLQueryAnalysis.complexity.info'
                            defaultMessage='Your schema will be analyzed by AI and complexity 
                            values will be assigned for each field dynamically.'
                        />
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
                                        value={thresholds[key]}
                                        onChange={handleThresholdChange}
                                    />
                                );
                            })}
                        </Grid>
                    </div>
                )}

                {relevantKeys.length === 0 && (
                    <MuiAlert severity='info' sx={{ mt: 2 }}>
                        <FormattedMessage
                            id='Apis.Details.Configuration.components.GraphQLQueryAnalysis.no.thresholds.info'
                            defaultMessage='No threshold settings required for the selected vulnerabilities.'
                        />
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
                title={
                    <FormattedMessage
                        id='Apis.Details.Configuration.components.GraphQLQueryAnalysis.security.protection.title'
                        defaultMessage='GraphQL Security Protection'
                    />
                }
            />
            
            <VulnerabilityCheckboxes
                selectedChecks={selectedVulnerabilities}
                onChange={handleVulnerabilityChange}
            />
        </Box>
    );

    // Combined configuration section
    const renderConfigurationSection = () => (
        <Box sx={{ mb: 4 }}>
            <SectionHeader 
                icon={<SettingsIcon color='primary' />} 
                title={
                    <FormattedMessage
                        id='Apis.Details.Configuration.components.GraphQLQueryAnalysis.security.config.title'
                        defaultMessage='Security Configuration'
                    />
                }
            />

            {hasVisibleThresholdFields() && (
                <Card 
                    sx={{ 
                        mb: 4, 
                        mt: 2, 
                        border: '1px solid',
                        borderColor: 'primary.light',
                        borderRadius: 2,
                        position: 'relative',
                        overflow: 'visible'
                    }}
                >
                    <Box sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            <img
                                alt='API Security Assistant'
                                src='/site/public/images/ai/APIchatassistantImageWithColour.svg'
                                style={{ width: '60px', height: 'auto' }}
                            />
                            
                            <Box>
                                <Typography variant='h6' sx={{ mb: 1, fontWeight: 500 }}>
                                    <FormattedMessage
                                        id='Apis.Details.Configuration.components.GraphQLQueryAnalysis.ai.config.title'
                                        defaultMessage='Let AI Configure Your Security Thresholds'
                                    />
                                </Typography>
                                
                                <Typography variant='body2' sx={{ mb: 2 }}>
                                    <FormattedMessage
                                        id={
                                            'Apis.Details.Configuration.components.GraphQLQueryAnalysis.' +
                                            'ai.config.description'
                                        }
                                        defaultMessage={
                                            'Our AI engine will analyze your GraphQL schema and recommend ' +
                                            'optimal security thresholds based on your API structure and ' +
                                            'common security threats.'
                                        }
                                    />
                                </Typography>
                                
                                <TextField
                                    label={
                                        <FormattedMessage
                                            id={
                                                'Apis.Details.Configuration.components.GraphQLQueryAnalysis.' +
                                                'use.case.label'
                                            }
                                            defaultMessage='Describe your API use case (optional)'
                                        />
                                    }
                                    placeholder={
                                        <FormattedMessage
                                            id={
                                                'Apis.Details.Configuration.components.GraphQLQueryAnalysis.' +
                                                'use.case.placeholder'
                                            }
                                            defaultMessage={
                                                "E.g., 'This API provides product data and allows deep " + 
                                                "access to inventory information'"
                                            }
                                        />
                                    }
                                    variant='outlined'
                                    fullWidth
                                    multiline
                                    rows={3}
                                    value={customPrompt}
                                    onChange={(e) => setCustomPrompt(e.target.value)}
                                    sx={{ mb: 2 }}
                                    helperText={
                                        <FormattedMessage
                                            id={
                                                'Apis.Details.Configuration.components.GraphQLQueryAnalysis.' +
                                                'use.case.helper'
                                            }
                                            defaultMessage={
                                                'Describe how deep data access will be, expected usage patterns, ' +
                                                'and any specific concerns for optimal recommendations.'
                                            }
                                        />
                                    }
                                />
                                
                                <Button
                                    variant='contained'
                                    color='primary'
                                    size='large'
                                    startIcon={aiRecommendationsGenerated ? <RefreshIcon /> : <AutoAwesomeIcon />}
                                    onClick={handleAIConfiguration}
                                    disabled={!hasVisibleThresholdFields()}
                                    sx={{
                                        px: 3,
                                        py: 1,
                                        boxShadow: 3,
                                        background: theme => 
                                            `linear-gradient(90deg, 
                                        ${theme.palette.primary.dark} 0%, 
                                        ${theme.palette.primary.main} 100%)`,
                                        '&:hover': {
                                            background: theme => 
                                                `linear-gradient(90deg, 
                                            ${theme.palette.primary.dark} 0%, 
                                            ${theme.palette.primary.main} 70%)`,
                                        }
                                    }}
                                >
                                    {aiRecommendationsGenerated ?
                                        <FormattedMessage
                                            id={
                                                'Apis.Details.Configuration.components.GraphQLQueryAnalysis.' +
                                                'btn.regenerate'
                                            }
                                            defaultMessage='Regenerate Recommendations'
                                        />
                                        :
                                        <FormattedMessage
                                            id={
                                                'Apis.Details.Configuration.components.GraphQLQueryAnalysis.' +
                                                'btn.ai.recommend'
                                            }
                                            defaultMessage='Get AI Recommendations'
                                        />
                                    }
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Card>
            )}

            {aiRecommendationsGenerated && (
                <MuiAlert severity='success' sx={{ mb: 3 }}>
                    <Typography variant='body2'>
                        <FormattedMessage
                            id={
                                'Apis.Details.Configuration.components.GraphQLQueryAnalysis.' +
                                'ai.success'
                            }
                            defaultMessage={'AI has analyzed your schema and recommended ' +
                            'optimal security settings for your API.'}
                        />
                    </Typography>
                </MuiAlert>
            )}

            <Box sx={{ mb: 4, mt: 2 }}>
                {selectedVulnerabilities['Excessive complexity'] && (
                    <ComplexityEstimatorSelector
                        value={estimatorType}
                        onChange={setEstimatorType}
                        title={aiRecommendationsGenerated ? 
                            <FormattedMessage
                                id={
                                    'Apis.Details.Configuration.components.GraphQLQueryAnalysis.' +
                                    'complexity.selector.title.ai'
                                }
                                defaultMessage='AI-Recommended Complexity Estimator'
                            />
                            : 
                            <FormattedMessage
                                id={
                                    'Apis.Details.Configuration.components.GraphQLQueryAnalysis.' +
                                    'complexity.selector.title'
                                }
                                defaultMessage='Select Complexity Estimator'
                            />
                        }
                    />
                )}
                
                <ThresholdFieldsGroup />
                
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
                            value={thresholds.MODEL_CONFIDENT_THRESHOLD || 0.5}
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
                            <FormattedMessage
                                id='Apis.Details.Configuration.components.GraphQLQueryAnalysis.main.title'
                                defaultMessage='GraphQL Query Configurations'
                            />
                            <Tooltip
                                title={
                                    <FormattedMessage
                                        id='Apis.Details.Configuration.components.GraphQLQueryAnalysis.helper.text'
                                        defaultMessage={
                                            'Enable the query analysis for GraphQL ' +
                                            'APIs using an external service'
                                        }
                                    />
                                }
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
                            label={
                                <FormattedMessage
                                    id='Apis.Details.Configuration.components.GraphQLQueryAnalysis.badge.experimental'
                                    defaultMessage='Experimental'
                                />
                            }
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
                        <FormattedMessage
                            id='Apis.Details.Configuration.components.GraphQLQueryAnalysis.dialog.title'
                            defaultMessage='Enhanced GraphQL Security'
                        />
                    </Typography>
                </Box>
                <DialogContent sx={{ py: 4, px: 3 }}>
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 3 
                    }}>
                        <Typography variant='h6' sx={{ fontWeight: 500 }}>
                            <FormattedMessage
                                id='Apis.Details.Configuration.components.GraphQLQueryAnalysis.dialog.subtitle'
                                defaultMessage='Add an Intelligent Security Layer to Protect Your GraphQL API'
                            />
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
                                <FormattedMessage
                                    id='Apis.Details.Configuration.components.GraphQLQueryAnalysis.dialog.description'
                                    defaultMessage={
                                        'Our AI-powered protection system analyzes query patterns to detect and ' +
                                        'block malicious requests before they reach your backend. To provide optimal ' +
                                        'security settings, your GraphQL schema will be analyzed by our ' +
                                        'threat detection service.'
                                    }
                                />
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
                            <FormattedMessage
                                id='Apis.Details.Configuration.components.GraphQLQueryAnalysis.dialog.warning'
                                defaultMessage={
                                    'This security feature may slightly increase query latency. ' +
                                    'Performance impact varies based on query complexity.'
                                }
                            />
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
                                <FormattedMessage
                                    id={
                                        'Apis.Details.Configuration.components.GraphQLQueryAnalysis.'+
                                        'dialog.protects.title'
                                    }
                                    defaultMessage='Protects Against:'
                                />
                            </Typography>
                            <Grid container spacing={1}>
                                {vulnerabilityTypes.map((threat) => (
                                    <Grid item xs={6} key={threat} sx={
                                        { display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box component='span' sx={{ 
                                            width: 5, 
                                            height: 5, 
                                            borderRadius: '50%', 
                                            bgcolor: 'primary.main', 
                                            display: 'inline-block' 
                                        }} />
                                        <Typography variant='body1'>
                                            {threat}
                                        </Typography>
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
                        <FormattedMessage
                            id='Apis.Details.Configuration.components.GraphQLQueryAnalysis.btn.skip'
                            defaultMessage='Skip for now'
                        />
                    </Button>
                    <Button 
                        onClick={handleConfirmSendSchema} 
                        color='primary' 
                        variant='contained'
                        startIcon={<SecurityIcon />}
                    >
                        <FormattedMessage
                            id='Apis.Details.Configuration.components.GraphQLQueryAnalysis.btn.enable'
                            defaultMessage='Enable Protection'
                        />
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
                        <FormattedMessage
                            id='Apis.Details.Configuration.components.GraphQLQueryAnalysis.config.dialog.title'
                            defaultMessage='Configure GraphQL Query Security'
                        />
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
                        <FormattedMessage
                            id='Apis.Details.Configuration.components.GraphQLQueryAnalysis.btn.save.config'
                            defaultMessage='Save Configuration'
                        />
                    </Button>
                    <Button onClick={handleClose} color='primary'>
                        <FormattedMessage
                            id='Apis.Details.Configuration.components.GraphQLQueryAnalysis.btn.cancel'
                            defaultMessage='Cancel'
                        />
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
                    <Typography variant='h6'>
                        <FormattedMessage
                            id='Apis.Details.Configuration.components.GraphQLQueryAnalysis.save.dialog.title'
                            defaultMessage='Activating Protection'
                        />
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ pt: 3, pb: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 2 }}>
                        <Typography variant='body1'>
                            <FormattedMessage
                                id='Apis.Details.Configuration.components.GraphQLQueryAnalysis.save.dialog.desc'
                                defaultMessage={
                                    'Activating GraphQL protection will apply security rules to your API ' +
                                    'and may take several minutes to complete.'
                                }
                            />
                        </Typography>
                        <MuiAlert severity='warning'>
                            <Typography variant='body2'>
                                <FormattedMessage
                                    id='Apis.Details.Configuration.components.GraphQLQueryAnalysis.save.dialog.warning'
                                    defaultMessage='While the protection is being activated:'
                                />
                            </Typography>
                            <Box component='ul' sx={{ mt: 1, pl: 2 }}>
                                <Box component='li'>
                                    <FormattedMessage
                                        id={
                                            'Apis.Details.Configuration.components.GraphQLQueryAnalysis.' + 
                                            'save.dialog.warning.point1'
                                        }
                                        defaultMessage={
                                            'Your API will continue to function with ' + 
                                            'previous configurations.'
                                        }
                                    />
                                </Box>
                                <Box component='li'>
                                    <FormattedMessage
                                        id={
                                            'Apis.Details.Configuration.components.GraphQLQueryAnalysis.' + 
                                            'save.dialog.warning.point2'
                                        }
                                        defaultMessage={
                                            'You will not be able to modify security settings until the ' +
                                            'process completes'
                                        }
                                    />
                                </Box>
                            </Box>
                        </MuiAlert>
                        <Typography variant='body1'>
                            <FormattedMessage
                                id='Apis.Details.Configuration.components.GraphQLQueryAnalysis.save.dialog.confirm'
                                defaultMessage='Do you want to proceed with activating the protection?'
                            />
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2, bgcolor: 'background.default' }}>
                    <Button 
                        onClick={() => setSaveConfirmDialogOpen(false)}
                        variant='outlined'
                        color='inherit'
                    >
                        <FormattedMessage
                            id='Apis.Details.Configuration.components.GraphQLQueryAnalysis.save.dialog.btn.cancel'
                            defaultMessage='Cancel'
                        />
                    </Button>
                    <Button 
                        onClick={handleConfirmSave}
                        color='primary' 
                        variant='contained'
                        startIcon={<SecurityIcon />}
                    >
                        <FormattedMessage
                            id='Apis.Details.Configuration.components.GraphQLQueryAnalysis.save.dialog.btn.activate'
                            defaultMessage='Activate Protection'
                        />
                    </Button>
                </DialogActions>
            </Dialog>
        </Root>
    );
}
