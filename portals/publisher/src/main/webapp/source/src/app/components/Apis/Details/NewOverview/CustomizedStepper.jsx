import React, { useEffect, useState, useContext } from 'react';
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
import API from 'AppData/api';
import { grey } from '@mui/material/colors';
import styled from '@emotion/styled';
import IconButton from '@mui/material/IconButton';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MCPServer from 'AppData/MCPServer';
import { getBasePath, checkEndpointStatus } from 'AppComponents/Shared/Utils';

const PREFIX = 'CustomizedStepper';

const classes = {
    root: `${PREFIX}-root`,
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
 *
 * @param {*} props
 * @returns
 */
function ColorlibStepIcon(props) {
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
 *
 * @returns
 */
export default function CustomizedStepper() {
    const [api, updateAPI] = useAPI();
    const [isUpdating, setUpdating] = useState(false);
    const [isMandatoryPropertiesAvailable, setIsMandatoryPropertiesAvailable] = useState(false);
    const [deploymentsAvailable, setDeploymentsAvailable] = useState(false);
    const [endpointStatus, setEndpointStatus] = useState({
        isEndpointReady: false,
        isLoading: true
    });
    const [isMCPEndpointAvailable, setMCPEndpointAvailable] = useState(false);
    const [MCPEndpointLoading, setMCPEndpointLoading] = useState(false);
    const isMCPServer = api.apiType === MCPServer.CONSTS.MCP;
    const isPrototypedAvailable = api.apiType !== API.CONSTS.APIProduct
        && api.endpointConfig !== null
        && api.endpointConfig.implementation_status === 'prototyped';

    const handleEndpointStatusCheck = async () => {
        setEndpointStatus(prev => ({ ...prev, isLoading: true }));
        
        try {
            let isEndpointReady = false;

            if (isMCPServer) {
                // For MCP servers, just check if endpoints are available
                isEndpointReady = isMCPEndpointAvailable;
            } else {
                // Use the shared utility function for all other API types
                isEndpointReady = await checkEndpointStatus(api);
            }

            setEndpointStatus({
                isEndpointReady,
                isLoading: false
            });
        } catch (error) {
            console.error('Error checking endpoint status:', error);
            setEndpointStatus({
                isEndpointReady: false,
                isLoading: false
            });
        }
    };

    useEffect(() => {
        handleEndpointStatusCheck();
    }, [api, isMCPEndpointAvailable]);

    useEffect(() => {
        if (isMCPServer) {
            setMCPEndpointLoading(true);
            if (api.isMCPServerFromExistingAPI()) {
                // EXISTING_API subtype
                const underlyingApiId = api.operations[0]?.apiOperationMapping?.apiId;
                if (underlyingApiId) {
                    const propmisedApi = API.get(underlyingApiId);
                    propmisedApi
                        .then((apiObj) => {
                            if (apiObj.endpointConfig !== null) {
                                setMCPEndpointAvailable(true);
                            } else {
                                setMCPEndpointAvailable(false);
                            }
                        })
                        .catch((error) => {
                            console.error('Error fetching underlying API:', error);
                            setMCPEndpointAvailable(false);
                        })
                        .finally(() => {
                            setMCPEndpointLoading(false);
                        });
                } else {
                    setMCPEndpointLoading(false);
                }
            } else {
                // DIRECT_BACKEND and SERVER_PROXY subtypes
                MCPServer.getMCPServerEndpoints(api.id)
                    .then((response) => {
                        const fetchedEndpoints = response.body;
                        if (fetchedEndpoints && fetchedEndpoints.length > 0) {
                            setMCPEndpointAvailable(true);
                        } else {
                            setMCPEndpointAvailable(false);
                        }
                    })
                    .catch((error) => {
                        console.error('Error fetching MCP server endpoints:', error);
                        setMCPEndpointAvailable(false);
                    })
                    .finally(() => {
                        setMCPEndpointLoading(false);
                    });
            }
        }
    }, [isMCPServer, api.id]);

    const isTierAvailable = api.policies.length !== 0;
    const lifecycleState = api.isAPIProduct() ? api.state : api.lifeCycleStatus;
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
    let devportalUrl = '';
    if (settings) {
        if (isMCPServer) {
            devportalUrl = `${settings.devportalUrl}/mcp-servers/${api.id}/overview`;
            if (tenantList && tenantList.length > 0) {
                devportalUrl += `?tenant=${tenantDomain}`;
            }
        } else {
            devportalUrl = `${settings.devportalUrl}/apis/${api.id}/overview`;
            if (tenantList && tenantList.length > 0) {
                devportalUrl += `?tenant=${tenantDomain}`;
            }
        }
    }
    const intl = useIntl();
    const steps = (api.isWebSocket() || api.isGraphql() || api.isAsyncAPI() || api.gatewayVendor !== 'wso2')
        ? ['Develop', 'Deploy', 'Publish'] : ['Develop', 'Deploy', 'Test', 'Publish'];
    const forceComplete = [];
    if (isPublished) {
        forceComplete.push(steps.indexOf('Publish') + 1);
    }
    let activeStep = 0;
    if (api && (api.type === 'WEBSUB' || endpointStatus.isEndpointReady)
        && !deploymentsAvailable) {
        activeStep = 1;
    } else if ((api && !endpointStatus.isEndpointReady && api.type !== 'WEBSUB')
        || (api && !isMutualSslOnly && !isTierAvailable)) {
        activeStep = 0;
    } else if (api && (endpointStatus.isEndpointReady || api.type === 'WEBSUB') && (isTierAvailable || isMutualSslOnly)
        && deploymentsAvailable && (!isPublished && lifecycleState !== 'PROTOTYPED')) {
        activeStep = steps.length - 1;
    } else if ((isPublished || lifecycleState === 'PROTOTYPED') && api
        && (endpointStatus.isEndpointReady || api.type === 'WEBSUB' || isPrototypedAvailable)
        && (isTierAvailable || isMutualSslOnly) && deploymentsAvailable) {
        activeStep = steps.length;
    }

    function validateMandatoryCustomProperties() {
        api.getSettings()
            .then((response) => {
                const { customProperties } = response;
                if (customProperties && customProperties.length > 0) {
                    const requiredPropertyNames = customProperties
                        .filter(property => property.Required)
                        .map(property => property.Name);
                    if (requiredPropertyNames.length > 0) {
                        setIsMandatoryPropertiesAvailable(requiredPropertyNames.every(propertyName => {
                            const property = api.additionalProperties.find(prop => prop.name === propertyName);
                            return property && property.value !== '';
                        }));
                    } else {
                        setIsMandatoryPropertiesAvailable(true);
                    }
                } else {
                    setIsMandatoryPropertiesAvailable(true);
                }
            })
            .catch((error) => {
                console.error('Error validating mandatory custom properties:', error);
            });
    }

    useEffect(() => {
        const fetchRevisionsAndValidateProperties = async () => {
            try {
                let result;
                if (isMCPServer) {
                    result = await MCPServer.getRevisionsWithEnv(api.isRevision ? api.revisionedApiId : api.id);
                } else {
                    result = await api.getRevisionsWithEnv(api.isRevision ? api.revisionedApiId : api.id);
                }

                if (api.apiType === API.CONSTS.APIProduct) {
                    setDeploymentsAvailable(result.body.count > 0);
                } else {
                    let hasApprovedDeployment = false;
                    result.body.list.forEach((revision) => {
                        if (revision.deploymentInfo) {
                            for (const deployment of revision.deploymentInfo) {
                                if (deployment.status === 'APPROVED') {
                                    hasApprovedDeployment = true;
                                    break;
                                }
                            }
                        }
                    });
                    setDeploymentsAvailable(hasApprovedDeployment);
                }
            } catch (error) {
                console.error('Error fetching revisions:', error);
                setDeploymentsAvailable(false);
            }
        };

        fetchRevisionsAndValidateProperties();
        validateMandatoryCustomProperties();
    }, [isMCPServer, api.id]);


    /**
     * Update the LifeCycle state of the API
     *
     * @param {string} apiId - The ID of the API
     * @param {string} state - The new lifecycle state
     */
    function updateLCStateOfAPI(apiId, state) {
        setUpdating(true);
        const promisedUpdate = isMCPServer ? MCPServer.updateLcState(apiId, state) : api.updateLcState(apiId, state);
        promisedUpdate
            .then(() => {
                updateAPI()
                    .then()
                    .catch((error) => {
                        if (error.response) {
                            Alert.error(error.response.body.description);
                        } else if (isMCPServer) {
                            Alert.error(intl.formatMessage({
                                id: 'MCPServers.Details.LifeCycle.Policies.update.error',
                                defaultMessage: 'Something went wrong while updating the MCP Server',
                            }));
                        } else {
                            Alert.error(intl.formatMessage({
                                id: 'Apis.Details.LifeCycle.Policies.update.error',
                                defaultMessage: 'Something went wrong while updating the API',
                            }));
                        }
                        console.error(error);
                    });
                Alert.info(intl.formatMessage({
                    id: 'Apis.Details.LifeCycle.Policies.update.success',
                    defaultMessage: 'Lifecycle state updated successfully',
                }));
            })
            .finally(() => setUpdating(false))
            .catch((errorResponse) => {
                if (errorResponse.response?.body?.code === 903300 && !isMCPServer) {
                    Alert.error(
                        <Box sx={{ width: '100%' }}>
                            <Typography>
                                <FormattedMessage
                                    id='Apis.Details.LifeCycle.Policies.update.error.governance'
                                    defaultMessage={'One or more governance policies have been violated. '
                                    + 'Please try using the publish option in the Lifecycle page for more details.'}
                                />
                            </Typography>
                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'flex-end',
                                mt: 1
                            }}>
                                <Link
                                    component={RouterLink}
                                    to={`/apis/${api.id}/lifecycle`}
                                    sx={{
                                        color: 'inherit',
                                        fontWeight: 600,
                                        textDecoration: 'none',
                                        transition: 'all 0.3s',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            textShadow: '0px 1px 2px rgba(0,0,0,0.2)',
                                        },
                                    }}
                                >
                                    <FormattedMessage
                                        id='Apis.Details.LifeCycle.Policies.update.error.governance.link'
                                        defaultMessage='Go to Lifecycle page'
                                    />
                                </Link>
                            </Box>
                        </Box>
                    );
                } else {
                    console.log(errorResponse);
                    Alert.error(JSON.stringify(errorResponse.message));
                }
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
                                            id='Apis.Details.Overview.CustomizedStepper.publish'
                                            defaultMessage=' Published'
                                        />
                                        <Box display='inline' pl={0.4} color='text.secondary'>
                                            {isMCPServer ? (
                                                <FormattedMessage
                                                    id={'MCPServers.Details.Overview.CustomizedStepper.'
                                                        + 'publish.current.mcp.server'}
                                                    defaultMessage=' (Current MCP Server)'
                                                />
                                            ) : (
                                                <FormattedMessage
                                                    id='Apis.Details.Overview.CustomizedStepper.publish.current.api'
                                                    defaultMessage=' (Current API)'
                                                />
                                            )}
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
                                                id='Apis.Details.Overview.CustomizedStepper.view.devportal'
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
                                id='Apis.Details.Overview.CustomizedStepper.prototyped'
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
                                id='Apis.Details.Overview.CustomizedStepper.blocked'
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
                                id='Apis.Details.Overview.CustomizedStepper.deprecated'
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
                                id='Apis.Details.Overview.CustomizedStepper.retired'
                                defaultMessage='Retired'
                            />
                        </b>
                    </Typography>
                );
            default:
                return (
                    <>
                        {isPrototypedAvailable ? (
                            <Button
                                size='small'
                                variant='contained'
                                color='primary'
                                onClick={() => updateLCStateOfAPI(api.id, 'Deploy as a Prototype')}
                                disabled={api.workflowStatus === 'CREATED'
                                    || AuthManager.isNotPublisher()
                                    || !deploymentsAvailable}
                            >
                                <FormattedMessage
                                    id='Apis.Details.Overview.CustomizedStepper.btn.prototyped'
                                    defaultMessage='Pre-Released'
                                />
                                {isUpdating && <CircularProgress size={20} />}
                            </Button>
                        ) : (
                            <>
                                <Button
                                    size='small'
                                    variant='contained'
                                    color='primary'
                                    data-testid='publish-state-button'
                                    onClick={() => updateLCStateOfAPI(api.id, 'Publish')}
                                    disabled={((api.type !== 'WEBSUB' && !endpointStatus.isEndpointReady)
                                        || (!isMutualSslOnly && !isTierAvailable))
                                        || !deploymentsAvailable
                                        || api.isRevision || AuthManager.isNotPublisher()
                                        || api.workflowStatus === 'CREATED'
                                        || !isMandatoryPropertiesAvailable}
                                >
                                    <FormattedMessage
                                        id='Apis.Details.Overview.CustomizedStepper.btn.publish'
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
                            </>
                        )}
                        {api.workflowStatus === 'CREATED' && (
                            <Typography variant='caption' color='error'>
                                <FormattedMessage
                                    id='Apis.Details.Overview.CustomizedStepper.pending'
                                    defaultMessage='The request is pending'
                                />
                            </Typography>
                        )}
                    </>
                );
        }
    }
    const isTestLinkDisabled = lifecycleState === 'RETIRED' || !deploymentsAvailable
    || (!api.isAPIProduct() && !endpointStatus.isEndpointReady)
    || (!isMutualSslOnly && !isTierAvailable)
    || (api.type !== 'HTTP' && api.type !== 'SOAP' && api.type !== 'APIPRODUCT' && api.type !== 'MCP');
    const isDeployLinkDisabled =
        (api.type !== 'WEBSUB' && !endpointStatus.isEndpointReady) ||
        api.workflowStatus === 'CREATED' ||
        lifecycleState === 'RETIRED';
    let deployLinkToolTipTitle = '';
    if (lifecycleState === 'RETIRED') {
        deployLinkToolTipTitle = intl.formatMessage({
            id: 'Apis.Details.Overview.CustomizedStepper.ToolTip.DeploymentAvailable',
            defaultMessage: 'Cannot deploy retired APIs',
        });
    } else if (!deploymentsAvailable) { 
        deployLinkToolTipTitle = intl.formatMessage({
            id: 'Apis.Details.Overview.CustomizedStepper.ToolTip.DeploymentUnavailable',
            defaultMessage: 'Deploy a revision of this API to the Gateway',
        });
    }

    if (isMCPServer && MCPEndpointLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (endpointStatus.isLoading) {
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
                                                            id='Apis.Details.Overview.CustomizedStepper.Develop'
                                                            defaultMessage=' Develop'
                                                        />
                                                    </Typography>
                                                </Grid>
                                            </Box>
                                        </Grid>
                                        {!api.initiatedFromGateway && api.type !== 'WEBSUB'
                                        && api.type !== 'APIPRODUCT' && !api.isMCPServerFromExistingAPI()
                                        && (
                                            <Box ml={3}>
                                                <Grid
                                                    container
                                                    direction='row'
                                                    justifyContent='center'
                                                    style={{ marginLeft: '2px' }}
                                                >
                                                    <Grid item>
                                                        {endpointStatus.isEndpointReady
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
                                                                to={getBasePath(api.apiType) + api.id + '/endpoints'}
                                                            >
                                                                <Typography variant='h6'>
                                                                    <FormattedMessage
                                                                        id={'Apis.Details.Overview.'
                                                                            + 'CustomizedStepper.Endpoint'}
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
                                                        to={getBasePath(api.apiType) + api.id + '/deployments'}
                                                    >
                                                        <Typography variant='h6'>
                                                            <FormattedMessage
                                                                id='Apis.Details.Overview.CustomizedStepper.Deploy'
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
                                            id: 'Apis.Details.Overview.CustomizedStepper.ToolTip.cannot.test',
                                            defaultMessage: 'Cannot use test option while API is in retired state',
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
                                                            isMCPServer
                                                                ? getBasePath(api.apiType) + api.id + '/mcp-playground'
                                                                : getBasePath(api.apiType) + api.id + '/test-console'
                                                        }
                                                    >
                                                        <Typography variant='h6'>
                                                            <FormattedMessage
                                                                id='Apis.Details.Overview.CustomizedStepper.Test'
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
                                                                to={
                                                                    getBasePath(api.apiType) + api.id + '/subscriptions'
                                                                }
                                                            >
                                                                <Typography variant='h6'>
                                                                    <FormattedMessage
                                                                        id={'Apis.Details.Overview.CustomizedStepper' +
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