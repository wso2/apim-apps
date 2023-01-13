import React, { useEffect, useState, useContext } from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Tooltip from '@material-ui/core/Tooltip';
import { FormattedMessage } from 'react-intl';
import LaunchIcon from '@material-ui/icons/Launch';
import Alert from 'AppComponents/Shared/Alert';
import Grid from '@material-ui/core/Grid';
import StepConnector from '@material-ui/core/StepConnector';
import ApiContext, { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import { useAppContext, usePublisherSettings } from 'AppComponents/Shared/AppContext';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import { Link as RouterLink } from 'react-router-dom';
import Link from '@material-ui/core/Link';
import grey from '@material-ui/core/colors/grey';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import AuthManager from 'AppData/AuthManager';
import Typography from '@material-ui/core/Typography';
import LinkIcon from '@material-ui/icons/Link';
import API from 'AppData/api';

const ColorlibConnector = withStyles((theme) => {
    const completedColor = theme.custom.apis.overview.stepper.completed || theme.palette.success.main;
    const activeColor = theme.custom.apis.overview.stepper.active || theme.palette.info.main;
    return {
        alternativeLabel: {
            top: 22,
        },
        active: {
            '& $line': {
                backgroundImage:
                    `linear-gradient(to left, ${activeColor} 50%, ${completedColor} 50%)`,
            },
        },
        completed: {
            '& $line': {
                backgroundImage:
                    `linear-gradient( ${completedColor}, ${completedColor})`,
            },
        },
        line: {
            height: 3,
            border: 0,
            backgroundColor: '#eaeaf0',
            borderRadius: 1,
        },
        viewInStoreLauncher: {
            color: theme.palette.primary.dark,
        },
    };
})(StepConnector);

const useColorlibStepIconStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: '#ccc',
        zIndex: 1,
        color: '#fff',
        width: 56,
        height: 56,
        display: 'flex',
        borderRadius: '50%',
        justifyContent: 'center',
        alignItems: 'center',
        border: '6px solid #E2E2E2',
    },
    active: {
        backgroundColor: theme.custom.apis.overview.stepper.active || theme.palette.info.main,
        border: '6px solid #E2E2E2',
    },
    completed: {
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
    const classes = useColorlibStepIconStyles();
    const {
        active, completed, forceComplete, icon: step,
    } = props;
    return (
        <div
            className={clsx(classes.root, {
                [classes.active]: active,
                [classes.completed]: completed || forceComplete.includes(step),
            })}
        />
    );
}

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
    button: {
        marginRight: theme.spacing(1),
    },
    instructions: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },
    iconTrue: {
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
    iconFalse: {
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
    pageLinks: {
        display: 'flex',
    },
    disabledLink: {
        pointerEvents: 'none',
        color: theme.palette.text.primary,
    },
    textLink: {
        color: '#0060B6',
        textDecoration: 'none',
    },
}));

/**
 *
 * @returns
 */
export default function CustomizedStepper() {
    const classes = useStyles();
    const [api, updateAPI] = useAPI();
    const [isUpdating, setUpdating] = useState(false);
    const [deploymentsAvailable, setDeploymentsAvailable] = useState(false);
    const isPrototypedAvailable = api.apiType !== API.CONSTS.APIProduct && api.endpointConfig !== null
    && api.endpointConfig.implementation_status === 'prototyped';
    const isEndpointAvailable = api.endpointConfig !== null;
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
    let devportalUrl = settings ? `${settings.devportalUrl}/apis/${api.id}/overview` : '';
    // TODO: tmkasun need to handle is loading
    if (tenantList && tenantList.length > 0) {
        // TODO: tmkasun need to handle is loading
        devportalUrl = settings ? `${settings.devportalUrl}/apis/${api.id}/overview?tenant=${tenantDomain}` : '';
    }
    const steps = (api.isWebSocket() || api.isGraphql() || api.isAsyncAPI())
        ? ['Develop', 'Deploy', 'Publish'] : ['Develop', 'Deploy', 'Test', 'Publish'];
    const forceComplete = [];
    if (isPublished) {
        forceComplete.push(steps.indexOf('Publish') + 1);
    }
    let activeStep = 0;
    if (api && (api.type === 'WEBSUB' || isEndpointAvailable)
        && (isTierAvailable || isMutualSslOnly) && !deploymentsAvailable) {
        activeStep = 1;
    } else if ((api && !isEndpointAvailable && api.type !== 'WEBSUB')
        || (api && !isMutualSslOnly && !isTierAvailable)) {
        activeStep = 0;
    } else if (api && (isEndpointAvailable || api.type === 'WEBSUB') && (isTierAvailable || isMutualSslOnly)
        && deploymentsAvailable && (!isPublished && lifecycleState !== 'PROTOTYPED')) {
        activeStep = steps.length - 1;
    } else if ((isPublished || lifecycleState === 'PROTOTYPED') && api
        && (isEndpointAvailable || api.type === 'WEBSUB' || isPrototypedAvailable)
        && (isTierAvailable || isMutualSslOnly) && deploymentsAvailable) {
        activeStep = steps.length;
    }

    useEffect(() => {
        api.getRevisionsWithEnv(api.isRevision ? api.revisionedApiId : api.id).then((result) => {
            setDeploymentsAvailable(result.body.count > 0);
        });
    }, []);

    /**
 * Update the LifeCycle state of the API
 *
 */
    function updateLCStateOfAPI(apiId, state) {
        setUpdating(true);
        const promisedUpdate = api.updateLcState(apiId, state);
        promisedUpdate
            .then(() => {
                updateAPI()
                    .then()
                    .catch((error) => {
                        if (error.response) {
                            Alert.error(error.response.body.description);
                        } else {
                            Alert.error('Something went wrong while updating the API');
                        }
                        console.error(error);
                    });
                Alert.info('Lifecycle state updated successfully');
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
                    <>
                        <Grid
                            container
                            direction='row'
                            alignItems='center'
                            justify='center'
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
                                            <FormattedMessage
                                                id='Apis.Details.Overview.CustomizedStepper.publish.current.api'
                                                defaultMessage=' (Current API)'
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
                                    justify='center'
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
                    </>
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
                                    || api.workflowStatus === 'CREATED'}
                            >
                                <FormattedMessage
                                    id='Apis.Details.Overview.CustomizedStepper.btn.publish'
                                    defaultMessage='Publish'
                                />
                                {isUpdating && <CircularProgress size={20} />}
                            </Button>
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
    const isTestLinkDisabled = lifecycleState === 'RETIERD' || !deploymentsAvailable
    || (!api.isAPIProduct() && !isEndpointAvailable)
    || (!isMutualSslOnly && !isTierAvailable)
    || (api.type !== 'HTTP' && api.type !== 'SOAP' && api.type !== 'APIPRODUCT');
    const isDeployLinkDisabled = (((api.type !== 'WEBSUB' && !isEndpointAvailable))
    || (!isMutualSslOnly && !isTierAvailable)
    || api.workflowStatus === 'CREATED' || lifecycleState === 'RETIRED');

    let deployLinkToolTipTitle = '';
    if (lifecycleState === 'RETIRED') {
        deployLinkToolTipTitle = 'Cannot deploy retired APIs';
    } else if (!deploymentsAvailable) { 
        deployLinkToolTipTitle = 'Deploy a revision of this API to the Gateway';
    }

    return (
        <div id='itest-overview-api-flow' className={classes.root}>
            <Stepper alternativeLabel activeStep={activeStep} connector={<ColorlibConnector />}>
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
                                        justify='center'
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
                                    {api.type !== 'WEBSUB' && api.type !== 'APIPRODUCT' && (
                                        <Box ml={3}>
                                            <Grid
                                                container
                                                direction='row'
                                                justify='center'
                                                style={{ marginLeft: '2px' }}
                                            >
                                                <Grid item>
                                                    {isEndpointAvailable ? (
                                                        <CheckIcon className={classes.iconTrue} />
                                                    ) : (
                                                        <CloseIcon className={classes.iconFalse} />
                                                    )}
                                                </Grid>
                                                <Box ml={1} mb={1}>
                                                    <Grid item>
                                                        <Link
                                                            underline='none'
                                                            className={classes.pageLinks}
                                                            component={RouterLink}
                                                            to={'/apis/' + api.id + '/endpoints'}
                                                        >
                                                            <Typography variant='h6'>
                                                                <FormattedMessage
                                                                    id='Apis.Details.Overview.
                                                                    CustomizedStepper.Endpoint'
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
                                    {(api.gatewayVendor === 'wso2') && (
                                        <Box ml={6}>
                                            <Grid
                                                container
                                                direction='row'
                                                justify='center'
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
                                                            to={api.isAPIProduct()
                                                                ? '/api-products/' + api.id + '/subscriptions'
                                                                : '/apis/' + api.id + '/subscriptions'}
                                                        >
                                                            <Typography variant='h6'>
                                                                <FormattedMessage
                                                                    id='Apis.Details.Overview.CustomizedStepper.Tier'
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
                                        justify='center'
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
                                                    to={api.isAPIProduct()
                                                        ? '/api-products/' + api.id + '/deployments'
                                                        : '/apis/' + api.id + '/deployments'}
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
                                    title={lifecycleState === 'RETIRED' ? 'Cannot use test option while API'
                                        + ' is in retired state' : ''}
                                    placement='bottom'
                                >
                                    <Grid
                                        container
                                        direction='row'
                                        alignItems='center'
                                        justify='center'
                                    >
                                        <Box ml={1} mb={1}>
                                            <Grid item>
                                                <Link
                                                    className={clsx(classes.pageLinks, {
                                                        [classes.disabledLink]: isTestLinkDisabled,
                                                    })}
                                                    underline='none'
                                                    component={RouterLink}
                                                    to={api.isAPIProduct()
                                                        ? '/api-products/' + api.id + '/test-console'
                                                        : '/apis/' + api.id + '/test-console'}
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
                                <>
                                    {finalLifecycleState(lifecycleState)}
                                </>
                            )}
                        </StepLabel>
                    </Step>
                ))}
            </Stepper>
        </div>
    );
}
