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
import React, { useEffect, useState, useContext, useMemo } from 'react';
import clsx from 'clsx';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Tooltip from '@mui/material/Tooltip';
import { FormattedMessage, useIntl } from 'react-intl';
import LaunchIcon from '@mui/icons-material/Launch';
import Alert from 'AppComponents/Shared/Alert';
import Grid from '@mui/material/Grid';
import StepConnector from '@mui/material/StepConnector';
import ApiContext, { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import { useAppContext, usePublisherSettings } from 'AppComponents/Shared/AppContext';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { Link as RouterLink } from 'react-router-dom';
import Link from '@mui/material/Link';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import AuthManager from 'AppData/AuthManager';
import CONSTS from 'AppData/Constants';
import Typography from '@mui/material/Typography';
import LinkIcon from '@mui/icons-material/Link';
import { grey } from '@mui/material/colors';
import styled from '@emotion/styled';
import IconButton from '@mui/material/IconButton';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MCPServer from 'AppData/MCPServer';

const PREFIX = 'Stepper';

const classes = {
    root: `${PREFIX}-root`,
    button: `${PREFIX}-button`,
    instructions: `${PREFIX}-instructions`,
    iconTrue: `${PREFIX}-iconTrue`,
    iconFalse: `${PREFIX}-iconFalse`,
    pageLinks: `${PREFIX}-pageLinks`,
    disabledLink: `${PREFIX}-disabledLink`,
    textLink: `${PREFIX}-textLink`,
    iconRoot: `${PREFIX}-iconRoot`,
    iconActive: `${PREFIX}-iconActive`,
    iconCompleted: `${PREFIX}-iconCompleted`,
};

const Root = styled('div')(({ theme }) => ({
    [`& .${classes.root}`]: {
        width: '100%',
        [`& .MuiStepConnector-root`]: {
            top: '34px',
            left: 'calc(-50% + 34px)',
            right: 'calc(50% + 34px)',
            [`& .MuiStepConnector-line`]: {
                height: 3,
                border: 0,
                backgroundColor: '#eaeaf0',
                borderRadius: 1,
            },
        },
        [`& .Mui-active .MuiStepConnector-line`]: {
            backgroundImage: `linear-gradient(
                to left, 
                (${theme.custom.apis.overview.stepper.active || theme.palette.info.main}) 50%, 
                (${theme.custom.apis.overview.stepper.completed || theme.palette.success.main}) 50%
            )`,
        },
        [`& .Mui-completed .MuiStepConnector-line`]: {
            backgroundImage: `linear-gradient(
                ${theme.custom.apis.overview.stepper.completed || theme.palette.success.main}, 
                ${theme.custom.apis.overview.stepper.completed || theme.palette.success.main}
            )`,
        },
    },
    [`& .${classes.button}`]: {
        marginRight: theme.spacing(1),
    },
    [`& .${classes.instructions}`]: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },
    [`& .${classes.iconTrue}`]: {
        display: 'block',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: theme.custom.apis.overview.stepper.completed || theme.palette.success.main,
        zIndex: 1,
        color: '#fff',
        width: 15,
        height: 15,
        borderRadius: '50%',
    },
    [`& .${classes.iconFalse}`]: {
        color: '#fff',
        display: 'block',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: grey[500],
        zIndex: 1,
        width: 15,
        height: 15,
        borderRadius: '50%',
    },
    [`& .${classes.pageLinks}`]: {
        display: 'flex',
    },
    [`& .${classes.disabledLink}`]: {
        pointerEvents: 'none',
        color: theme.palette.text.primary,
    },
    [`& .${classes.textLink}`]: {
        color: '#0060B6',
        textDecoration: 'none',
    },
    [`& .${classes.iconRoot}`]: {
        display: 'flex',
        zIndex: 1,
        color: '#fff',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        justifyContent: 'center',
        alignItems: 'center',
        border: '6px solid #E2E2E2',
    },
    [`& .${classes.iconActive}`]: {
        backgroundColor: theme.custom.apis.overview.stepper.active || theme.palette.info.main,
        border: '6px solid #E2E2E2',
    },
    [`& .${classes.iconCompleted}`]: {
        backgroundColor: theme.custom.apis.overview.stepper.completed || theme.palette.success.main,
        border: '6px solid #E2E2E2',
    },
}));

/**
 * Custom Step Icon component for the stepper
 * @param {*} props
 * @returns {JSX.Element} - Custom step icon
 */
const ColorlibStepIcon = (props) => {
    const { active, completed, forceComplete, icon: step } = props;
    return (
        <Root>
            <div
                className={clsx(classes.iconRoot, {
                    [classes.iconActive]: active,
                    [classes.iconCompleted]: completed || forceComplete.includes(step),
                })}
            />
        </Root>
    );
}

/**
 * Gets the appropriate base path for API links based on API type
 * @param {Object} api - The API object
 * @returns {string} - The base path for links
 */
const getBasePath = (api) => {
    if (api.isAPIProduct()) {
        return '/api-products/';
    } else if (api.type === MCPServer.CONSTS.MCP) {
        return '/mcp-servers/';
    } else {
        return '/apis/';
    }
}

/**
 * Customized stepper component for MCP Server overview
 * This component displays the steps for managing an MCP Server,
 * including developing, deploying, testing, and publishing.
 * @returns {JSX.Element} - Stepper component
 */
const CustomizedMCPStepper = () => {
    const [api, updateAPI] = useAPI();
    const [isUpdating, setUpdating] = useState(false);
    const [isMandatoryPropertiesAvailable, setIsMandatoryPropertiesAvailable] = useState(false);
    const [deploymentsAvailable, setDeploymentsAvailable] = useState(false);
    const [isEndpointSecurityConfigured, setIsEndpointSecurityConfigured] = useState(false);
    const [isEndpointAvailable, setEndpointAvailable] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isTestLinkDisabled, setIsTestLinkDisabled] = useState(true);
    const [isDeployLinkDisabled, setIsDeployLinkDisabled] = useState(true);
    const isTierAvailable = api.policies.length !== 0;
    const lifecycleState = api.lifeCycleStatus;
    const isPublished = lifecycleState === 'PUBLISHED';
    const { tenantList } = useContext(ApiContext);
    const { user } = useAppContext();
    const { data: settings } = usePublisherSettings();
    const userNameSplit = user.name.split('@');
    const tenantDomain = userNameSplit[userNameSplit.length - 1];
    const securityScheme = [...api.securityScheme];
    const isMutualSslOnly = securityScheme.length === 2 && securityScheme.includes('mutualssl')
        && securityScheme.includes('mutualssl_mandatory');
    const isSubValidationDisabled = api.policies 
        && api.policies.length === 1 && api.policies[0].includes(CONSTS.DEFAULT_SUBSCRIPTIONLESS_PLAN);
    let devportalUrl = settings ? `${settings.devportalUrl}/mcp-servers/${api.id}/overview` : '';
    const intl = useIntl();
    // TODO: tmkasun need to handle is loading
    if (tenantList && tenantList.length > 0) {
        // TODO: tmkasun need to handle is loading
        devportalUrl = settings ? `${settings.devportalUrl}/mcp-servers/${api.id}/overview?tenant=${tenantDomain}` : '';
    }
    const steps = ['Develop', 'Deploy', 'Test', 'Publish'];
    const forceComplete = [];
    if (isPublished) {
        forceComplete.push(steps.indexOf('Publish') + 1);
    }

    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true);
            try {
                // Fetch all data in parallel
                const [endpointsResponse, revisionsResponse, settingsResponse] = await Promise.all([
                    MCPServer.getMCPServerEndpoints(api.id),
                    MCPServer.getRevisionsWithEnv(api.isRevision ? api.revisionedApiId : api.id),
                    api.getSettings()
                ]);

                // Process all responses and calculate derived states
                const fetchedEndpoints = endpointsResponse.body;
                const hasEndpoints = fetchedEndpoints && fetchedEndpoints.length > 0;
                const endpointConfig = hasEndpoints ? JSON.parse(fetchedEndpoints[0].endpointConfig) : null;
                const hasDeployments = revisionsResponse.body.count > 0;
                
                // Calculate endpoint security status
                const isEndpointSecurityConfiguredTemp = !!(
                    endpointConfig?.endpoint_security?.production &&
                    endpointConfig?.endpoint_security?.sandbox
                );

                // Validate mandatory custom properties
                const { customProperties } = settingsResponse;
                let mandatoryPropsAvailable = true;
                if (customProperties && customProperties.length > 0) {
                    const requiredPropertyNames = customProperties
                        .filter(property => property.Required)
                        .map(property => property.Name);
                    if (requiredPropertyNames.length > 0) {
                        mandatoryPropsAvailable = requiredPropertyNames.every(propertyName => {
                            const property = api.additionalProperties.find(prop => prop.name === propertyName);
                            return property && property.value !== '';
                        });
                    }
                }
                
                // Calculate active step
                let newActiveStep = 0;
                if (api && hasEndpoints && !hasDeployments) {
                    newActiveStep = 1;
                } else if ((api && !hasEndpoints) || (api && !isMutualSslOnly && !isTierAvailable)) {
                    newActiveStep = 0;
                } else if (api && (hasEndpoints || api.type === 'WEBSUB') && (isTierAvailable || isMutualSslOnly)
                    && hasDeployments && (!isPublished && lifecycleState !== 'PROTOTYPED')) {
                    newActiveStep = steps.length - 1;
                } else if ((isPublished || lifecycleState === 'PROTOTYPED') && api
                    && (hasEndpoints || api.type === 'WEBSUB')
                    && (isTierAvailable || isMutualSslOnly) && hasDeployments) {
                    newActiveStep = steps.length;
                }

                // Calculate link disabled states
                const testLinkDisabled = lifecycleState === 'RETIRED' || !hasDeployments
                    || (!api.isAPIProduct() && !hasEndpoints)
                    || (!isMutualSslOnly && !isTierAvailable)
                    || (api.type !== 'HTTP' && api.type !== 'SOAP' && api.type !== 'APIPRODUCT' && api.type !== 'MCP');
                    
                const deployLinkDisabled = (api.type !== 'WEBSUB' &&
                    !(hasEndpoints && (api.subtypeConfiguration?.subtype === 'AIAPI' 
                        ? isEndpointSecurityConfigured : true))) ||
                    api.workflowStatus === 'CREATED' ||
                    lifecycleState === 'RETIRED';

                // Update all states at once

                setEndpointAvailable(hasEndpoints);
                setDeploymentsAvailable(hasDeployments);
                setIsMandatoryPropertiesAvailable(mandatoryPropsAvailable);
                setIsEndpointSecurityConfigured(isEndpointSecurityConfiguredTemp);
                setActiveStep(newActiveStep);
                setIsTestLinkDisabled(testLinkDisabled);
                setIsDeployLinkDisabled(deployLinkDisabled);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllData();
    }, [api]);

    /**
     * Update the LifeCycle state of the MCP Server
     * @param {string} apiId - The ID of the MCP Server to update
     * @param {string} state - The new lifecycle state to set for the MCP Server
     */
    function updateLCStateOfAPI(apiId, state) {
        setUpdating(true);
        const promisedUpdate = MCPServer.updateLcState(apiId, state);
        promisedUpdate
            .then(() => {
                updateAPI()
                    .then()
                    .catch((error) => {
                        if (error.response) {
                            Alert.error(error.response.body.description);
                        } else {
                            Alert.error(intl.formatMessage({
                                id: 'MCPServers.Overview.Stepper.LifeCycle.update.error',
                                defaultMessage: 'Something went wrong while updating the MCP Server lifecycle state.',
                            }));
                        }
                        console.error(error);
                    });
                Alert.info(intl.formatMessage({
                    id: 'MCPServers.Overview.Stepper.LifeCycle.update.success',
                    defaultMessage: 'Lifecycle state updated successfully',
                }));
            })
            .finally(() => setUpdating(false))
            .catch((errorResponse) => {
                console.log(errorResponse);
                Alert.error(JSON.stringify(errorResponse.message));
            });
    }

    /**
     * This function renders the final lifecycle state
     * @param {*} state
     */
    function finalLifecycleState(state) {
        switch (state) {
            case 'PUBLISHED':
                return (
                    <Root>
                        <Grid
                            container
                            direction='row'
                            alignItems='center'
                            justifyContent='center'
                        >
                            <Grid item>
                                <CheckIcon className={classes.iconTrue} />
                            </Grid>
                            <Box ml={1}>
                                <Grid item>
                                    <Typography variant='h6' component='div'>
                                        <FormattedMessage
                                            id='MCPServers.Overview.CustomizedMCPStepper.publish'
                                            defaultMessage=' Published'
                                        />
                                        <Box display='inline' pl={0.4} color='text.secondary'>
                                            <FormattedMessage
                                                id='MCPServers.Overview.CustomizedMCPStepper.publish.current.mcp.server'
                                                defaultMessage=' (Current MCP Server)'
                                            />
                                        </Box>
                                    </Typography>
                                </Grid>
                            </Box>
                        </Grid>
                        <Box mt={1} ml={2}>
                            <a
                                target='_blank'
                                className={classes.textLink}
                                rel='noopener noreferrer'
                                href={devportalUrl}
                            >
                                <Grid
                                    container
                                    direction='row'
                                    alignItems='center'
                                    justifyContent='center'
                                >
                                    <Grid item>
                                        <Typography variant='h6' display='inline'>
                                            <FormattedMessage
                                                id='MCPServers.Overview.CustomizedMCPStepper.view.devportal'
                                                defaultMessage='View in devportal'
                                            />
                                        </Typography>
                                    </Grid>
                                    <Grid item>
                                        <Box ml={1}>
                                            <LaunchIcon
                                                color='primary'
                                                fontSize='small'
                                            />
                                        </Box>
                                    </Grid>
                                </Grid>
                            </a>
                        </Box>
                    </Root>
                );
            case 'PROTOTYPED':
                return (
                    <Typography variant='h6' component='div'>
                        <b>
                            <FormattedMessage
                                id='MCPServers.Overview.CustomizedMCPStepper.prototyped'
                                defaultMessage='Pre-Released'
                            />
                        </b>
                    </Typography>
                );
            case 'BLOCKED':
                return (
                    <Typography variant='h6' component='div'>
                        <b>
                            <FormattedMessage
                                id='MCPServers.Overview.CustomizedMCPStepper.blocked'
                                defaultMessage='Blocked'
                            />
                        </b>
                    </Typography>
                );
            case 'DEPRECATED':
                return (
                    <Typography variant='h6' component='div'>
                        <b>
                            <FormattedMessage
                                id='MCPServers.Overview.CustomizedMCPStepper.deprecated'
                                defaultMessage='Deprecated'
                            />
                        </b>
                    </Typography>
                );
            case 'RETIRED':
                return (
                    <Typography variant='h6' component='div'>
                        <b>
                            <FormattedMessage
                                id='MCPServers.Overview.CustomizedMCPStepper.retired'
                                defaultMessage='Retired'
                            />
                        </b>
                    </Typography>
                );
            default:
                return (
                    <>
                        <Button
                            size='small'
                            variant='contained'
                            color='primary'
                            data-testid='publish-state-button'
                            onClick={() => updateLCStateOfAPI(api.id, 'Publish')}
                            disabled={((api.type !== 'WEBSUB' && !isEndpointAvailable)
                                || (!isMutualSslOnly && !isTierAvailable))
                                || !deploymentsAvailable
                                || api.isRevision || AuthManager.isNotPublisher()
                                || api.workflowStatus === 'CREATED'
                                || !isMandatoryPropertiesAvailable}
                        >
                            <FormattedMessage
                                id='MCPServers.Overview.CustomizedMCPStepper.btn.publish'
                                defaultMessage='Publish'
                            />
                            {isUpdating && <CircularProgress size={20} />}
                        </Button>
                        {deploymentsAvailable && !isMandatoryPropertiesAvailable && (
                            <Tooltip
                                title='Mandatory API Properties should be provided to publish an API.'
                                placement='bottom'
                            >
                                <IconButton color='inherit' size='small' aria-label='delete'>
                                    <InfoOutlinedIcon fontSize='small' />
                                </IconButton>
                            </Tooltip>
                        )}
                        {api.workflowStatus === 'CREATED' && (
                            <Typography variant='caption' color='error'>
                                <FormattedMessage
                                    id='MCPServers.Overview.CustomizedMCPStepper.pending'
                                    defaultMessage='The request is pending'
                                />
                            </Typography>
                        )}
                    </>
                );
        }
    }

    const deployLinkToolTipTitle = useMemo(() => {
        if (lifecycleState === 'RETIRED') {
            return intl.formatMessage({
                id: 'MCPServers.Overview.CustomizedMCPStepper.ToolTip.DeploymentAvailable',
                defaultMessage: 'Cannot deploy retired MCP Servers',
            });
        } else if (!deploymentsAvailable) {
            return intl.formatMessage({
                id: 'MCPServers.Overview.CustomizedMCPStepper.ToolTip.DeploymentUnavailable',
                defaultMessage: 'Deploy a revision of this MCP Server to the Gateway',
            });
        }
        return '';
    }, [lifecycleState, deploymentsAvailable, intl]);


    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
            </Box>
        );
    }


    return (
        <Root>
            <div id='itest-overview-api-flow' className={classes.root}>
                <Stepper alternativeLabel activeStep={activeStep} connector={<StepConnector />}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel StepIconComponent={(props) => (
                                <ColorlibStepIcon
                                    {...props}
                                    forceComplete={forceComplete}
                                />
                            )}
                            >
                                {label === 'Develop' && (
                                    <div>
                                        <Grid
                                            container
                                            direction='row'
                                            justifyContent='center'
                                        >
                                            <Grid item>
                                                {api ? (
                                                    <CheckIcon className={classes.iconTrue} />
                                                ) : (
                                                    <CloseIcon className={classes.iconFalse} />
                                                )}
                                            </Grid>
                                            <Box ml={1} mb={1}>
                                                <Grid>
                                                    <Typography variant='h6'>
                                                        <FormattedMessage
                                                            id='MCPServers.Overview.CustomizedMCPStepper.Develop'
                                                            defaultMessage=' Develop'
                                                        />
                                                    </Typography>
                                                </Grid>
                                            </Box>
                                        </Grid>
                                        {api.type !== 'WEBSUB' && api.type !== 'APIPRODUCT' && (
                                            <Box ml={3}>
                                                <Grid
                                                    container
                                                    direction='row'
                                                    justifyContent='center'
                                                    style={{ marginLeft: '2px' }}
                                                >
                                                    <Grid item>
                                                        {isEndpointAvailable && (
                                                            api.subtypeConfiguration?.subtype === 'AIAPI'
                                                                ? isEndpointSecurityConfigured
                                                                : true
                                                        )
                                                            ? (
                                                                <CheckIcon className={classes.iconTrue} />
                                                            ) 
                                                            : (
                                                                <CloseIcon className={classes.iconFalse} />
                                                            )
                                                        }
                                                    </Grid>
                                                    <Box ml={1} mb={1}>
                                                        <Grid item>
                                                            <Link
                                                                underline='none'
                                                                className={classes.pageLinks}
                                                                component={RouterLink}
                                                                to={getBasePath(api) + api.id + '/endpoints'}
                                                            >
                                                                <Typography variant='h6'>
                                                                    <FormattedMessage
                                                                        id={'MCPServers.Overview.'
                                                                            + 'CustomizedMCPStepper.Endpoint'}
                                                                        defaultMessage=' Endpoint'
                                                                    />
                                                                </Typography>
                                                                <Box ml={1}>
                                                                    <LinkIcon
                                                                        color='primary'
                                                                        fontSize='small'
                                                                    />
                                                                </Box>
                                                            </Link>
                                                        </Grid>
                                                    </Box>
                                                </Grid>
                                            </Box>
                                        )}
                                    </div>
                                )}
                                {label === 'Deploy' && (
                                    <Tooltip
                                        title={deployLinkToolTipTitle}
                                        placement='bottom'
                                    >
                                        <Grid
                                            container
                                            direction='row'
                                            alignItems='center'
                                            justifyContent='center'
                                        >
                                            <Box mb={1}>
                                                <Grid item>
                                                    {deploymentsAvailable ? (
                                                        <CheckIcon className={classes.iconTrue} />
                                                    ) : (
                                                        <CloseIcon className={classes.iconFalse} />
                                                    )}
                                                </Grid>
                                            </Box>
                                            <Box ml={1} mb={1}>
                                                <Grid item>
                                                    <Link
                                                        underline='none'
                                                        className={clsx(classes.pageLinks, {
                                                            [classes.disabledLink]: isDeployLinkDisabled,
                                                        })}
                                                        component={RouterLink}
                                                        to={getBasePath(api) + api.id + '/deployments'}
                                                    >
                                                        <Typography variant='h6'>
                                                            <FormattedMessage
                                                                id='MCPServers.Overview.CustomizedMCPStepper.Deploy'
                                                                defaultMessage=' Deploy'
                                                            />
                                                        </Typography>
                                                        <Box ml={1}>
                                                            <LinkIcon
                                                                color='default'
                                                                fontSize='small'
                                                            />
                                                        </Box>
                                                    </Link>
                                                </Grid>
                                            </Box>
                                        </Grid>
                                    </Tooltip>
                                )}
                                {label === 'Test' && (
                                    <Tooltip
                                        title={lifecycleState === 'RETIRED' ? intl.formatMessage({
                                            id: 'MCPServers.Overview.CustomizedMCPStepper.ToolTip.cannot.test',
                                            defaultMessage:
                                                'Cannot use test option while MCP Server is in retired state',
                                        }) : ''}
                                        placement='bottom'
                                    >
                                        <Grid
                                            container
                                            direction='row'
                                            alignItems='center'
                                            justifyContent='center'
                                        >
                                            <Box ml={1} mb={1}>
                                                <Grid item>
                                                    <Link
                                                        className={clsx(classes.pageLinks, {
                                                            [classes.disabledLink]: isTestLinkDisabled,
                                                        })}
                                                        underline='none'
                                                        component={RouterLink}
                                                        to={
                                                            api.isMCPServer()
                                                                ? getBasePath(api) + api.id + '/mcp-inspector'
                                                                : getBasePath(api) + api.id + '/test-console'
                                                        }
                                                    >
                                                        <Typography variant='h6'>
                                                            <FormattedMessage
                                                                id='MCPServers.Overview.CustomizedMCPStepper.Test'
                                                                defaultMessage=' Test'
                                                            />
                                                        </Typography>
                                                        <Box ml={1}>
                                                            <LinkIcon
                                                                color='default'
                                                                fontSize='small'
                                                            />
                                                        </Box>
                                                    </Link>
                                                </Grid>
                                            </Box>
                                        </Grid>
                                    </Tooltip>
                                )}
                                {label === 'Publish' && (
                                    <div>
                                        {(api.gatewayVendor === 'wso2') && !isSubValidationDisabled && (
                                            <Box ml={1} mb={1}>
                                                <Grid
                                                    container
                                                    direction='row'
                                                    justifyContent='center'
                                                    alignItems='center'
                                                    style={{ marginLeft: '2px' }}
                                                >
                                                    <Grid item>
                                                        {isTierAvailable ? (
                                                            <CheckIcon className={classes.iconTrue} />
                                                        ) : (
                                                            <CloseIcon className={classes.iconFalse} />
                                                        )}
                                                    </Grid>
                                                    <Box ml={1}>
                                                        <Grid item>
                                                            <Link
                                                                underline='none'
                                                                component={RouterLink}
                                                                className={classes.pageLinks}
                                                                to={getBasePath(api) + api.id + '/subscriptions'}
                                                            >
                                                                <Typography variant='h6'>
                                                                    <FormattedMessage
                                                                        id={'MCPServers.Overview.CustomizedMCPStepper' +
                                                                            '.Tier'}
                                                                        defaultMessage=' Business Plan'
                                                                    />
                                                                </Typography>
                                                                <Box ml={1}>
                                                                    <LinkIcon
                                                                        color='primary'
                                                                        fontSize='small'
                                                                    />
                                                                </Box>
                                                            </Link>
                                                        </Grid>
                                                    </Box>
                                                </Grid>
                                            </Box>
                                        )}
                                        <>
                                            {finalLifecycleState(lifecycleState)}
                                        </>
                                    </div>
                                )}
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </div>
        </Root>
    );
}

export default CustomizedMCPStepper;
