/*
 * Copyright (c) 2025, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
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

import React, { useReducer, useState } from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { FormattedMessage, useIntl } from 'react-intl';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ErrorIcon from '@mui/icons-material/Error';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Tooltip from '@mui/material/Tooltip';
import { Link } from 'react-router-dom';
import Alert from 'AppComponents/Shared/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import DefaultAPIForm from 'AppComponents/Apis/Create/Components/DefaultAPIForm';
import MCPProxyToolSelection from 'AppComponents/MCPServers/Create/Steps/MCPProxyToolSelection';
import APICreateBase from 'AppComponents/Apis/Create/Components/APICreateBase';
import { usePublisherSettings } from 'AppComponents/Shared/AppContext';
import MCPServer from 'AppData/MCPServer';
import Progress from 'AppComponents/Shared/Progress';
import { getDefaultSubscriptionPolicy } from 'AppComponents/Shared/Utils';

const PREFIX = 'MCPServerCreateProxy';

const classes = {
    Paper: `${PREFIX}-Paper`,
    saveButton: `${PREFIX}-saveButton`,
    titleWrapper: `${PREFIX}-titleWrapper`,
    buttonWrapper: `${PREFIX}-buttonWrapper`,
    alternativeLabel: `${PREFIX}-alternativeLabel`,
    mandatoryStar: `${PREFIX}-mandatoryStar`,
};

const Root = styled('div')(({ theme }) => ({
    [`& .${classes.Paper}`]: {
        height: '40px',
    },

    [`& .${classes.saveButton}`]: {
        padding: '0px 0px 0px 10px',
    },

    [`& .${classes.titleWrapper}`]: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: theme.spacing(2),
    },

    [`& .${classes.buttonWrapper}`]: {
        marginTop: theme.spacing(4),
    },

    [`& .${classes.alternativeLabel}`]: {
        marginTop: theme.spacing(1),
    },

    [`& .${classes.mandatoryStar}`]: {
        color: theme.palette.error.main,
        marginLeft: theme.spacing(0.1),
    },
}));

const MCPServerCreateProxy = (props) => {
    const { history } = props;
    const intl = useIntl();
    const [wizardStep, setWizardStep] = useState(0);
    const [isCreating, setCreating] = useState();
    const [isValidating, setValidating] = useState(false);
    const [validationError, setValidationError] = useState('');
    const [toolInfo, setToolInfo] = useState(null);
    const [urlFieldError, setUrlFieldError] = useState('');
    const [showSecurityValue, setShowSecurityValue] = useState(false);
    const { data: settings, isLoading } = usePublisherSettings();

    const pageTitle = (
        <Root>
            <Typography variant='h5'>
                <FormattedMessage
                    id='MCPServers.Create.MCPServerCreateProxy.heading'
                    defaultMessage='Create MCP Server using MCP Server URL'
                />
            </Typography>
            <Typography variant='caption'>
                <FormattedMessage
                    id='MCPServers.Create.MCPServerCreateProxy.sub.heading'
                    defaultMessage='Create an MCP Server by providing MCP Server URL'
                />
            </Typography>
        </Root>
    );

    /**
     * Reduce the events triggered from API input fields to current state
     * @param {Object} currentState - The current state object
     * @param {Object} inputAction - The action object
     * @returns {Object} The new state object
     */
    function mcpServerInputsReducer(currentState, inputAction) {
        const { action, value } = inputAction;
        switch (action) {
            case 'type':
            case 'name':
            case 'displayName':
            case 'context':
            case 'version':
            case 'mcpServerUrl':
            case 'isFormValid':
            case 'operations':
            case 'securityHeader':
            case 'securityValue':
                return { ...currentState, [action]: value };
            default:
                return currentState;
        }
    }

    const [mcpServerInputs, inputsDispatcher] = useReducer(mcpServerInputsReducer, {
        type: 'MCPServerCreateProxy',
        name: '',
        context: '',
        version: '',
        operations: [],
        isFormValid: false,
        mcpServerUrl: '',
        securityHeader: '',
        securityValue: '',
    });

    /**
     * Handle input change events
     * @param {Object} event - The event triggered by the input change
     */
    const handleOnChange = (event) => {
        const { name: action, value } = event.target;
        inputsDispatcher({ action, value });

        // Clear URL field error when user starts typing
        if (action === 'mcpServerUrl' && urlFieldError) {
            setUrlFieldError('');
        }
    }

    /**
     * Handle URL field blur event
     * @param {Object} event - The blur event
     */
    const handleUrlBlur = (event) => {
        const { value } = event.target;
        if (!value || value.trim() === '') {
            setUrlFieldError('MCP Server URL is required');
        } else {
            setUrlFieldError('');
        }
    }

    /**
     * Set the validity of the MCP Server Inputs form
     * @param {boolean} isFormValid - The validity state of the form
     */
    const handleOnValidate = (isFormValid) => {
        inputsDispatcher({
            action: 'isFormValid',
            value: isFormValid,
        });
    }

    /**
     * Validate the MCP Server URL provided
     */
    const validateMCPServer = () => {
        setValidating(true);
        setValidationError('');
        const { mcpServerUrl, securityHeader, securityValue } = mcpServerInputs;

        const securityInfo = {
            isSecure: !!(securityHeader && securityValue),
            header: securityHeader || '',
            value: securityValue || ''
        };

        MCPServer.validateThirdPartyMCPServerUrl(mcpServerUrl, securityInfo)
            .then((response) => {
                const { body } = response;
                if (body.isValid) {
                    setValidationError('');
                    setToolInfo(body.toolInfo || null);
                    setWizardStep((step) => step + 1);
                } else {
                    const errorMsg = body.errorMessage
                        || 'Validation failed. Please check the URL and try again.';
                    setValidationError(errorMsg);
                    setToolInfo(null);
                }
            })
            .catch((error) => {
                if (error.response && error.response.body) {
                    const errorMsg = error.response.body.errorMessage
                        || error.response.body.description
                        || 'Failed to validate MCP Server URL';
                    setValidationError(errorMsg);
                } else {
                    const errorMsg = 'Failed to validate MCP Server URL. '
                        + 'Please check your connection and try again.';
                    setValidationError(errorMsg);
                }
                setToolInfo(null);
            })
            .finally(() => setValidating(false));
    }

    const createMCPServer = async () => {
        setCreating(true);
        const {
            name,
            displayName,
            version,
            context,
            mcpServerUrl,
            securityHeader,
            securityValue,
            gatewayType,
            operations = [],
        } = mcpServerInputs;

        let defaultGatewayType;
        if (settings && settings.gatewayTypes.length === 1 && settings.gatewayTypes.includes('Regular')) {
            defaultGatewayType = 'wso2/synapse';
        } else if (settings && settings.gatewayTypes.length === 1 && settings.gatewayTypes.includes('APK')){
            defaultGatewayType = 'wso2/apk';
        } else {
            defaultGatewayType = 'default';
        }

        // Fetch and select appropriate subscription policy
        const { defaultSubscriptionPolicy } = settings || {};
        const policies = await getDefaultSubscriptionPolicy(
            'subscription',
            false,
            defaultSubscriptionPolicy,
            'Unlimited',
        );

        const additionalProperties = {
            name,
            displayName,
            version,
            context,
            gatewayType: defaultGatewayType === 'default' ? gatewayType : defaultGatewayType,
            policies,
            operations,
        };
        if (mcpServerUrl) {
            additionalProperties.endpointConfig = {
                endpoint_type: 'http',
                sandbox_endpoints: {
                    url: mcpServerUrl,
                },
                production_endpoints: {
                    url: mcpServerUrl,
                },
            };
        }

        const securityInfo = {
            isSecure: !!(securityHeader && securityValue),
            header: securityHeader || '',
            value: securityValue || ''
        };

        const newMCPServer = new MCPServer(additionalProperties);
        const promisedCreatedMCPServer = newMCPServer.createMCPServerUsingMCPServerURL(
            mcpServerUrl,
            securityInfo
        );
        promisedCreatedMCPServer
            .then((mcpServer) => {
                Alert.info(intl.formatMessage({
                    id: 'MCPServers.Create.MCPServerCreateProxy.created.success',
                    defaultMessage: 'MCP Server created successfully',
                }));
                history.push(`/mcp-servers/${mcpServer.id}/overview`);
            })
            .catch((error) => {
                if (error.response) {
                    Alert.error(error.response.body.description);
                } else {
                    Alert.error(intl.formatMessage({
                        id: 'MCPServers.Create.MCPServerCreateProxy.created.error',
                        defaultMessage: 'Something went wrong while creating the MCP Server',
                    }));
                }
            })
            .finally(() => setCreating(false));
    }

    const getSteps = () => {
        return [
            {
                key: 'MCPServers.Create.MCPServerCreateProxy.wizard.one',
                label: <FormattedMessage
                    variant='caption'
                    id='MCPServers.Create.MCPServerCreateProxy.wizard.one'
                    defaultMessage='Provide MCP Server URL'
                />
            },
            {
                key: 'MCPServers.Create.MCPServerCreateProxy.wizard.two',
                label: <FormattedMessage
                    variant='caption'
                    id='MCPServers.Create.MCPServerCreateProxy.wizard.two'
                    defaultMessage='Select Tools'
                />
            },
            {
                key: 'MCPServers.Create.MCPServerCreateProxy.wizard.three',
                label: <FormattedMessage
                    variant='caption'
                    id='MCPServers.Create.MCPServerCreateProxy.wizard.three'
                    defaultMessage='Create MCP Server'
                />
            },
        ];
    }

    if (isLoading) {
        return <Progress />;
    }

    return (
        <APICreateBase
            title={pageTitle}
            isCreating={isCreating}
        >
            <Box sx={{ mb: 2 }}>
                <Stepper alternativeLabel activeStep={wizardStep}>
                    {getSteps().map((step) => (
                        <Step key={step.key}>
                            <StepLabel className={classes.alternativeLabel}>{step.label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Box>
            <Grid container>
                <Grid item md={12}>
                    {wizardStep === 0 && (
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    autoFocus
                                    id='mcp-server-url'
                                    label={(
                                        <>
                                            <FormattedMessage
                                                id='MCPServers.Create.MCPServerCreateProxy.url.label'
                                                defaultMessage='MCP Server URL'
                                            />
                                            <sup className={classes.mandatoryStar}>*</sup>
                                        </>
                                    )}
                                    fullWidth
                                    margin='normal'
                                    variant='outlined'
                                    value={mcpServerInputs.mcpServerUrl || ''}
                                    onChange={handleOnChange}
                                    onBlur={handleUrlBlur}
                                    name='mcpServerUrl'
                                    error={!!urlFieldError}
                                    helperText={urlFieldError || ' '}
                                />
                            </Grid>
                            <Grid item xs={12} sx={{ mt: -1 }}>
                                <Accordion defaultExpanded={false}>
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        aria-controls='advanced-config-content'
                                        id='advanced-config-header'
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Typography>
                                                <FormattedMessage
                                                    id='MCPServers.Create.MCPServerCreateProxy.advancedConfig'
                                                    defaultMessage='Advanced Configurations'
                                                />
                                            </Typography>
                                            <Tooltip
                                                title={(
                                                    <FormattedMessage
                                                        id={'MCPServers.Create.MCPServerCreateProxy.'
                                                            + 'advancedConfig.tooltip'}
                                                        defaultMessage={
                                                            'If the MCP Server is protected, ensure to '
                                                            + 'provide the security credentials (Authentication header '
                                                            + 'and value) to authenticate with the server.'
                                                        }
                                                    />
                                                )}
                                                placement='right'
                                            >
                                                <IconButton
                                                    color='primary'
                                                    size='small'
                                                    aria-label='advanced config help'
                                                    sx={{ p: '3px', ml: 1 }}
                                                >
                                                    <InfoOutlinedIcon fontSize='small' />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <Typography variant='subtitle2'>
                                                    <FormattedMessage
                                                        id='MCPServers.Create.MCPServerCreateProxy.headerAuth.subtitle'
                                                        defaultMessage='Configure Authentication Header'
                                                    />
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    id='security-header'
                                                    label={(
                                                        <FormattedMessage
                                                            id='MCPServers.Create.MCPServerCreateProxy.header.label'
                                                            defaultMessage='Header'
                                                        />
                                                    )}
                                                    fullWidth
                                                    margin='normal'
                                                    variant='outlined'
                                                    value={mcpServerInputs.securityHeader || ''}
                                                    onChange={handleOnChange}
                                                    name='securityHeader'
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    id='security-value'
                                                    label={(
                                                        <FormattedMessage
                                                            id='MCPServers.Create.MCPServerCreateProxy.value.label'
                                                            defaultMessage='Value'
                                                        />
                                                    )}
                                                    fullWidth
                                                    margin='normal'
                                                    variant='outlined'
                                                    type={showSecurityValue ? 'text' : 'password'}
                                                    value={mcpServerInputs.securityValue || ''}
                                                    onChange={handleOnChange}
                                                    name='securityValue'
                                                    InputProps={{
                                                        endAdornment: (
                                                            <InputAdornment position='end'>
                                                                <IconButton
                                                                    aria-label='toggle password visibility'
                                                                    onClick={() => setShowSecurityValue(
                                                                        !showSecurityValue
                                                                    )}
                                                                    edge='end'
                                                                >
                                                                    {showSecurityValue
                                                                        ? <Visibility />
                                                                        : <VisibilityOff />}
                                                                </IconButton>
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                />
                                            </Grid>
                                        </Grid>
                                    </AccordionDetails>
                                </Accordion>
                            </Grid>
                        </Grid>
                    )}
                    {wizardStep === 1 && (
                        <MCPProxyToolSelection
                            onValidate={handleOnValidate}
                            apiInputs={mcpServerInputs}
                            inputsDispatcher={inputsDispatcher}
                            toolInfo={toolInfo}
                        />
                    )}
                    {wizardStep === 2 && (
                        <DefaultAPIForm
                            onValidate={handleOnValidate}
                            onChange={handleOnChange}
                            api={mcpServerInputs}
                            isAPIProduct={false}
                            isMCPServer
                            mcpServerType='SERVER_PROXY'
                            settings={settings}
                            readOnlyAPIEndpoint
                        />
                    )}
                </Grid>
                {validationError && (
                    <Grid item xs={12} sx={{ mt: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ErrorIcon color='error' />
                            <Box>
                                <Typography sx={{ fontWeight: 600 }}>
                                    <FormattedMessage
                                        id='MCPServers.Create.MCPServerCreateProxy.validation.error'
                                        defaultMessage='Error while validating MCP Server'
                                    />
                                </Typography>
                                <Typography variant='body2'>
                                    {validationError}
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                )}
                <Grid item xs={12} sx={{ mt: 3 }}>
                    <Grid container direction='row' justifyContent='flex-start' alignItems='center' spacing={1}>
                        <Grid item>
                            {wizardStep === 0 && (
                                <Link to='/mcp-servers/'>
                                    <Button>
                                        <FormattedMessage
                                            id='MCPServers.Create.MCPServerCreateProxy.cancel'
                                            defaultMessage='Cancel'
                                        />
                                    </Button>
                                </Link>
                            )}
                            {(wizardStep === 1 || wizardStep === 2) && (
                                <Button onClick={() => setWizardStep((step) => step - 1)}>
                                    <FormattedMessage
                                        id='MCPServers.Create.MCPServerCreateProxy.back'
                                        defaultMessage='Back'
                                    />
                                </Button>
                            )}
                        </Grid>
                        <Grid item mt={1}>
                            {(wizardStep === 0) && (
                                <Button
                                    variant='contained'
                                    color='primary'
                                    disabled={!mcpServerInputs.mcpServerUrl || isValidating}
                                    onClick={validateMCPServer}
                                >
                                    {isValidating ? (
                                        <CircularProgress size={24} />
                                    ) : (
                                        <FormattedMessage
                                            id='MCPServers.Create.MCPServerCreateProxy.validate'
                                            defaultMessage='Next'
                                        />
                                    )}
                                </Button>
                            )}
                            {(wizardStep === 1) && (
                                <Button 
                                    variant='contained'
                                    color='primary'
                                    disabled={!mcpServerInputs.isFormValid}
                                    onClick={() => setWizardStep((step) => step + 1)}
                                >
                                    <FormattedMessage
                                        id='MCPServers.Create.MCPServerCreateProxy.next'
                                        defaultMessage='Next'
                                    />
                                </Button>
                            )}
                            {wizardStep === 2 && (
                                <Button
                                    variant='contained'
                                    color='primary'
                                    disabled={!mcpServerInputs.isFormValid || isCreating}
                                    onClick={createMCPServer}
                                >
                                    <FormattedMessage
                                        id='MCPServers.Create.MCPServerCreateProxy.create'
                                        defaultMessage='Create'
                                    />
                                    {' '}
                                    {isCreating && <CircularProgress size={24} />}
                                </Button>
                            )}
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </APICreateBase>
    );
};

MCPServerCreateProxy.propTypes = {
    history: PropTypes.shape({ push: PropTypes.func }).isRequired,
};

export default MCPServerCreateProxy;
