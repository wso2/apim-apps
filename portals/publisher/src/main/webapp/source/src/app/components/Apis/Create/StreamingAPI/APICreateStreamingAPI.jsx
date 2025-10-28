/**
 * Copyright (c) 2020, WSO2 Inc. (http://wso2.com) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React, { useReducer, useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { FormattedMessage, useIntl } from 'react-intl';
import { withRouter } from 'react-router';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { Link, useParams } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';

import API from 'AppData/api';
import Alert from 'AppComponents/Shared/Alert';
import APICreateBase from 'AppComponents/Apis/Create/Components/APICreateBase';
import Banner from 'AppComponents/Shared/Banner';
import DefaultAPIForm from 'AppComponents/Apis/Create/Components/DefaultAPIForm';
import { usePublisherSettings } from 'AppComponents/Shared/AppContext';
import AuthManager from 'AppData/AuthManager';
import Utils from 'AppData/Utils';

const PREFIX = 'APICreateStreamingAPI';

const classes = {
    mandatoryStar: `${PREFIX}-mandatoryStar`
};

const StyledAPICreateBase = styled(APICreateBase)((
    {
        theme
    }
) => ({
    [`& .${classes.mandatoryStar}`]: {
        color: theme.palette.error.main,
        marginLeft: theme.spacing(0.1),
    }
}));

const APICreateStreamingAPI = (props) => {
    // const theme = useTheme();
    const { history, multiGateway } = props;
    const intl = useIntl();
    const { data: settings, isLoading, error: settingsError } = usePublisherSettings();
    const [pageError, setPageError] = useState(null);
    useEffect(() => {
        if (settingsError) {
            setPageError(settingsError.message);
        }
    }, [settingsError]);
    const [isCreating, setIsCreating] = useState();
    const [isPublishing, setIsPublishing] = useState(false);
    const [isRevisioning, setIsRevisioning] = useState(false);
    const [isDeploying, setIsDeploying] = useState(false);
    const [isPublishButtonClicked, setIsPublishButtonClicked] = useState(false);

    const [policies, setPolicies] = useState([]);
    let { apiType } = useParams();
    if (apiType) {
        apiType = apiType.toUpperCase();
    }
    const isWebSub = (apiType === 'WEBSUB');
    const isWebSocket = (apiType === 'WS');
    const isSSE = (apiType === 'SSE');
    const complianceErrorCode = 903300;

    useEffect(() => {
        API.asyncAPIPolicies().then((response) => {
            const allPolicies = response.body.list;
            if (allPolicies.length === 0) {
                Alert.info(intl.formatMessage({
                    id: 'Apis.Create.Default.APICreateDefault.error.policies.not.available',
                    defaultMessage: 'Throttling policies not available. Contact your administrator',
                }));
            } else if (isWebSub && allPolicies.filter((p) => p.policyName === 'AsyncWHUnlimited').length > 0) {
                setPolicies(['AsyncWHUnlimited']);
            } else if (!isWebSub && allPolicies.filter((p) => p.policyName === 'AsyncUnlimited').length > 0) {
                setPolicies(['AsyncUnlimited']);
            } else {
                setPolicies([allPolicies[0].policyName]);
            }
        });
    }, []);

    const protocols = [
        {
            displayName: 'WebSocket',
            description: 'WebSocket API',
        },
        {
            displayName: 'WebSub',
            description: 'WebHook API based on WebSub specification',
        },
        {
            displayName: 'SSE',
            description: 'Server-Sent Events',
        },
    ];
    const protocolKeys = {
        WebSocket: 'WS',
        SSE: 'SSE',
        WebSub: 'WEBSUB',
    };
    const protocolDisplayNames = {
        WS: 'WebSocket',
        SSE: 'SSE',
        WEBSUB: 'WebSub',
    };
    const [hideEndpoint, setHideEndpoint] = useState(!apiType || apiType === protocolKeys.WebSub);

    /**
     *
     * Reduce the events triggered from API input fields to current state
     */
    function apiInputsReducer(currentState, inputAction) {
        const { action, value } = inputAction;
        switch (action) {
            case 'name':
            case 'displayName':
            case 'version':
            case 'context':
            case 'endpoint':
            case 'policies':
            case 'isFormValid':
                return { ...currentState, [action]: value };
            case 'protocol':
                setHideEndpoint(protocolKeys[value] === protocolKeys.WebSub);
                return { ...currentState, [action]: protocolKeys[value] };
            default:
                return currentState;
        }
    }
    const [apiInputs, inputsDispatcher] = useReducer(apiInputsReducer, {
        formValidity: false,
        gatewayType: multiGateway && (multiGateway.filter((gw) => gw.value === 'wso2/synapse').length > 0 ?
            'wso2/synapse' : multiGateway[0]?.value),
    });

    const isAPICreatable = apiInputs.name && apiInputs.context && apiInputs.version && !isCreating;
    // TODO: If WebSub API no endpoint is required. Or else check apiInputs.endpoint has a value.
    const isPublishable = ((isWebSocket || isSSE) ? apiInputs.endpoint : true);

    /**
     *
     *
     * @param {*} event
     */
    function handleOnChange(event) {
        const { name: action, value } = event.target;
        inputsDispatcher({ action, value });
    }

    /**
     *
     * Set the validity of the API Inputs form
     * @param {*} isValidForm
     * @param {*} validationState
     */
    function handleOnValidate(isFormValid) {
        inputsDispatcher({
            action: 'isFormValid',
            value: isFormValid,
        });
    }

    /**
     *
     */
    function createAPI() {
        setIsCreating(true);
        const {
            name, version, context, endpoint, protocol, displayName,
        } = apiInputs;
        const apiData = {
            name,
            displayName,
            version,
            context,
            endpoint,
            type: apiType || protocol.toUpperCase(),
            policies,
        };

        let endpointType = 'http';
        if ((apiType && apiType.toUpperCase() === 'WS') || (protocol && protocol.toUpperCase() === 'WS')) {
            endpointType = 'ws';
        }
        if (endpoint) {
            apiData.endpointConfig = {
                endpoint_type: endpointType,
                sandbox_endpoints: {
                    url: endpoint,
                },
                production_endpoints: {
                    url: endpoint,
                },
            };
        }


        const newAPI = new API(apiData);
        const promisedCreatedAPI = newAPI
            .saveStreamingAPI()
            .then((api) => {
                Alert.info(intl.formatMessage({
                    id: 'Apis.Create.Default.APICreateDefault.streaming.success',
                    defaultMessage: 'API created successfully',
                }));
                return api;
            })
            .catch((error) => {
                if (error.response) {
                    Alert.error(error.response.body.description);
                } else {
                    Alert.error(intl.formatMessage({
                        id: 'Apis.Create.Default.APICreateDefault.streaming.error',
                        defaultMessage: 'Something went wrong while adding the API',
                    }));
                }
                console.error(error);
                setIsPublishing(false); // We don't publish if something when wrong
            })
            .finally(() => {
                setIsCreating(false);
            });
        return promisedCreatedAPI.finally(() => setIsCreating(false));
    }

    /**
     *
     */
    function createAndPublish() {
        const streamingApi = new API();
        setIsPublishButtonClicked(true);
        createAPI().then((api) => {
            setIsRevisioning(true);
            const body = {
                description: 'Initial Revision',
            };
            streamingApi.createRevision(api.id, body)
                .then((api1) => {
                    const revisionId = api1.body.id;
                    Alert.info(intl.formatMessage({
                        id: 'Apis.Create.Default.APICreateDefault.streaming.revision.success',
                        defaultMessage: 'API Revision created successfully',
                    }));
                    setIsRevisioning(false);
                    const envList = settings.environment.map((env) => env.name);
                    const body1 = [];
                    const getFirstVhost = (envName) => {
                        const env = settings.environment.find(
                            (e) => e.name === envName && e.mode !== 'READ_ONLY' && e.vhosts.length > 0,
                        );
                        return env && env.vhosts[0].host;
                    };
                    if (settings.gatewayTypes && settings.gatewayTypes.length === 1) {
                        if (envList && envList.length > 0) {
                            if (envList.includes('Default') && getFirstVhost('Default')) {
                                body1.push({
                                    name: 'Default',
                                    displayOnDevportal: true,
                                    vhost: getFirstVhost('Default'),
                                });
                            } else if (getFirstVhost(envList[0])) {
                                body1.push({
                                    name: envList[0],
                                    displayOnDevportal: true,
                                    vhost: getFirstVhost(envList[0]),
                                });
                            }
                        }
                    } else {
                        const envList1 = settings.environment;
                        let foundEnv = false;
                        envList1.forEach((env) => {
                            if (!foundEnv && env.gatewayType === 'Regular' && getFirstVhost(env.name)) {
                                body1.push({
                                    name: env.name,
                                    displayOnDevportal: true,
                                    vhost: getFirstVhost(env.name),
                                });
                                foundEnv = true;
                            }
                        });
                    }
                    setIsDeploying(true);
                    streamingApi.deployRevision(api.id, revisionId, body1)
                        .then(() => {
                            Alert.info(
                                intl.formatMessage({
                                    id: 'Apis.Create.Default.APICreateDefault.streaming.revision.deployed.',
                                    defaultMessage: 'API Revision Deployed Successfully',
                                }),
                            );
                            setIsDeploying(false);
                            // Publishing API after deploying
                            setIsPublishing(true);
                            api.publish()
                                .then((response) => {
                                    const { workflowStatus } = response.body;
                                    if (workflowStatus === APICreateStreamingAPI.WORKFLOW_STATUS.CREATED) {
                                        Alert.info(intl.formatMessage({
                                            id: 'Apis.Create.Default.APICreateDefault.success.publishStatus',
                                            defaultMessage: 'Lifecycle state change request has been sent',
                                        }));
                                    } else {
                                        Alert.info(intl.formatMessage({
                                            id: 'Apis.Create.Default.APICreateDefault.success.otherStatus',
                                            defaultMessage: 'API updated successfully',
                                        }));
                                    }
                                    history.push(`/apis/${api.id}/overview`);
                                })
                                .catch((error) => {
                                    if (error.response) {
                                        if (error.response.body.code === complianceErrorCode) {
                                            const violations =
                                                JSON.parse(error.response.body.description).blockingViolations;
                                            Alert.error(
                                                <Box sx={{ width: '100%' }}>
                                                    <Typography>
                                                        <FormattedMessage
                                                            id={'Apis.Create.StreamingAPI.APICreateStreamingAPI.'
                                                                + 'error.governance.violation'}
                                                            defaultMessage={'Failed to publish the API due to '
                                                                + 'governance violations'}
                                                        />
                                                    </Typography>
                                                    <Box sx={{
                                                        display: 'flex',
                                                        justifyContent: 'flex-end',
                                                        mt: 1
                                                    }}>
                                                        <Button
                                                            onClick={() =>
                                                                Utils.downloadAsJSON(
                                                                    violations, 'governance-violations'
                                                                )}
                                                            sx={{
                                                                color: 'inherit',
                                                                fontWeight: 600,
                                                                textDecoration: 'none',
                                                                transition: 'all 0.3s',
                                                                '&:hover': {
                                                                    backgroundColor: 'inherit',
                                                                    transform: 'translateY(-2px)',
                                                                    textShadow: '0px 1px 2px rgba(0,0,0,0.2)',
                                                                },
                                                            }}
                                                        >
                                                            <FormattedMessage
                                                                id={'Apis.Create.StreamingAPI.APICreateStreamingAPI.'
                                                                    + 'error.governance.violation.download'}
                                                                defaultMessage='Download Violations'
                                                            />
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            )
                                        } else {
                                            Alert.error(error.response.body.description);
                                            setPageError(error.response.body);
                                        }
                                    } else {
                                        Alert.error(intl.formatMessage({
                                            id: 'Apis.Create.Default.APICreateDefault.error.errorMessage.publish',
                                            defaultMessage: 'Something went wrong while publishing the API',
                                        }));
                                        setPageError('Something went wrong while publishing the API');
                                    }
                                    console.error(error);
                                })
                                .finally(() => {
                                    setIsPublishing(false);
                                    setIsPublishButtonClicked(false);
                                });
                        })
                        .catch((error) => {
                            if (error.response) {
                                if (error.response.body.code === complianceErrorCode) {
                                    const violations = JSON.parse(error.response.body.description).blockingViolations;
                                    Alert.error(
                                        <Box sx={{ width: '100%' }}>
                                            <Typography>
                                                <FormattedMessage
                                                    id={'Apis.Create.StreamingAPI.APICreateStreamingAPI.error.'
                                                        + 'governance.violation'}
                                                    defaultMessage='Deployment failed due to governance violations'
                                                />
                                            </Typography>
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'flex-end',
                                                mt: 1
                                            }}>
                                                <Button
                                                    onClick={() =>
                                                        Utils.downloadAsJSON(violations, 'governance-violations')}
                                                    sx={{
                                                        color: 'inherit',
                                                        fontWeight: 600,
                                                        textDecoration: 'none',
                                                        transition: 'all 0.3s',
                                                        '&:hover': {
                                                            backgroundColor: 'inherit',
                                                            transform: 'translateY(-2px)',
                                                            textShadow: '0px 1px 2px rgba(0,0,0,0.2)',
                                                        },
                                                    }}
                                                >
                                                    <FormattedMessage
                                                        id={'Apis.Create.StreamingAPI.APICreateStreamingAPI.error.'
                                                            + 'governance.violation.download'}
                                                        defaultMessage='Download Violations'
                                                    />
                                                </Button>
                                            </Box>
                                        </Box>
                                    )
                                } else {
                                    Alert.error(error.response.body.description);
                                    setPageError(error.response.body);
                                }
                            } else {
                                Alert.error(intl.formatMessage({
                                    id: 'Apis.Create.Default.APICreateDefault.error.errorMessage.deploy.revision',
                                    defaultMessage: 'Something went wrong while deploying the API Revision',
                                }));
                                setPageError('Something went wrong while deploying the API Revision');
                            }
                            console.error(error);
                        })
                        .finally(() => {
                            setIsDeploying(false);
                        });
                })
                .catch((error) => {
                    if (error.response) {
                        if (error.response.body.code === complianceErrorCode) {
                            const violations = JSON.parse(error.response.body.description).blockingViolations;
                            Alert.error(
                                <Box sx={{ width: '100%' }}>
                                    <Typography>
                                        <FormattedMessage
                                            id={'Apis.Create.StreamingAPI.APICreateStreamingAPI.error.'
                                                + 'governance.violation'}
                                            defaultMessage={'Failed to create the API Revision due to '
                                                + 'governance violations'}
                                        />
                                    </Typography>
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        mt: 1
                                    }}>
                                        <Button
                                            onClick={() => Utils.downloadAsJSON(violations, 'governance-violations')}
                                            sx={{
                                                color: 'inherit',
                                                fontWeight: 600,
                                                textDecoration: 'none',
                                                transition: 'all 0.3s',
                                                '&:hover': {
                                                    backgroundColor: 'inherit',
                                                    transform: 'translateY(-2px)',
                                                    textShadow: '0px 1px 2px rgba(0,0,0,0.2)',
                                                },
                                            }}
                                        >
                                            <FormattedMessage
                                                id={'Apis.Create.StreamingAPI.APICreateStreamingAPI.error.'
                                                    + 'governance.violation.download'}
                                                defaultMessage='Download Violations'
                                            />
                                        </Button>
                                    </Box>
                                </Box>
                            )
                        } else {
                            Alert.error(error.response.body.description);
                            setPageError(error.response.body);
                        }
                    } else {
                        Alert.error(intl.formatMessage({
                            id: 'Apis.Create.Default.APICreateDefault.error.errorMessage.create.revision',
                            defaultMessage: 'Something went wrong while creating the API Revision',
                        }));
                        setPageError('Something went wrong while creating the API Revision');
                    }
                    console.error(error);
                })
                .finally(() => {
                    setIsRevisioning(false);
                });
        });
    }

    function createAPIOnly() {
        createAPI().then((api) => {
            history.push(`/apis/${api.id}/overview`);
        });
    }

    const pageTitle = (
        <>
            <Typography variant='h5'>
                <FormattedMessage
                    id='Apis.Create.StreamingAPI.APICreateStreamingAPI.api.heading'
                    defaultMessage='Create a Streaming API'
                />
            </Typography>
            <Typography variant='caption'>
                {isWebSub ? (
                    <FormattedMessage
                        id='Apis.Create.StreamingAPI.APICreateStreamingAPI.websub.api.sub.heading'
                        defaultMessage='Create an API by providing a Name, a Version and a Context'
                    />
                ) : (
                    <FormattedMessage
                        id='Apis.Create.StreamingAPI.APICreateStreamingAPI.api.sub.heading'
                        defaultMessage='Create an API by providing a Name, a Version, a Context and the Endpoint'
                    />
                )}

            </Typography>
        </>
    );

    return (
        <StyledAPICreateBase title={pageTitle}>
            <Grid container direction='row' justifyContent='center' alignItems='center'>
                {/* Page error banner */}
                {pageError && (
                    <Grid item xs={11}>
                        <Banner
                            onClose={() => setPageError(null)}
                            disableActions
                            dense
                            paperProps={{ elevation: 1 }}
                            type='error'
                            message={pageError}
                        />
                    </Grid>
                )}
                {/* end of Page error banner */}
                <Grid item xs={12}>
                    {/* This -2 is to counter act with Grid container spacing 3 */}
                    {isLoading && (
                        <Box mt={-2}>
                            <CircularProgress data-testid='loading-publisher-settings' />
                        </Box>
                    )}
                </Grid>
                <Grid item xs={12}>
                    <DefaultAPIForm
                        onValidate={handleOnValidate}
                        onChange={handleOnChange}
                        api={apiInputs}
                        endpointPlaceholderText='Streaming Provider'
                        appendChildrenBeforeEndpoint
                        hideEndpoint={hideEndpoint}
                        multiGateway={multiGateway}
                        isWebSocket={(apiType && apiType === protocolKeys.WebSocket)
                            || apiInputs.protocol === protocolKeys.WebSocket}
                        settings={settings}
                    >
                        <TextField
                            fullWidth
                            select
                            label={(
                                <>
                                    <FormattedMessage
                                        id='Apis.Create.streaming.Components.SelectPolicies.business.plans'
                                        defaultMessage='Protocol'
                                    />
                                    <sup className={classes.mandatoryStar}>*</sup>
                                </>
                            )}
                            value={apiType ? protocolDisplayNames[apiType] : apiInputs.protocol}
                            disabled={apiType}
                            name='protocol'
                            SelectProps={{
                                multiple: false,
                                renderValue: (selected) => (selected),
                            }}
                            margin='normal'
                            variant='outlined'
                            InputProps={{
                                id: 'itest-id-apipolicies-input',
                            }}
                            onChange={handleOnChange}
                        >
                            {protocols.map((protocol) => (
                                <MenuItem
                                    dense
                                    disableGutters={false}
                                    value={protocol.displayName}
                                >
                                    <ListItemText primary={protocol.displayName} secondary={protocol.description} />
                                </MenuItem>
                            ))}
                        </TextField>
                    </DefaultAPIForm>
                </Grid>
                <Grid item xs={12}>
                    <Grid container direction='row' justifyContent='flex-start' alignItems='center' spacing={2}>
                        <Grid item>
                            <Button
                                variant='contained'
                                color='primary'
                                disabled={!(isAPICreatable && apiInputs.isFormValid)}
                                onClick={createAPIOnly}
                                data-testid='itest-create-streaming-api-button'
                            >
                                <FormattedMessage
                                    id='Apis.Create.streaming.Components.create.btn'
                                    defaultMessage='Create'
                                />
                                {' '}
                                {isCreating && !isPublishButtonClicked && <CircularProgress size={24} />}
                            </Button>
                        </Grid>
                        {!AuthManager.isNotPublisher() && (
                            <Grid item>
                                <Button
                                    id='itest-id-apicreatedefault-createnpublish'
                                    variant='contained'
                                    color='primary'
                                    disabled={isDeploying || isRevisioning || !isPublishable
                                        || !isAPICreatable || !apiInputs.isFormValid}
                                    onClick={createAndPublish}
                                >
                                    {(!isPublishing && !isRevisioning && !isDeploying)
                                        && (
                                            <FormattedMessage
                                                id='Apis.Create.streaming.Components.create.and.publish.btn'
                                                defaultMessage='Create & Publish'
                                            />
                                        )}
                                    {(isPublishing || isRevisioning || isDeploying) && <CircularProgress size={24} />}
                                    {isCreating && isPublishing && 'Creating API . . .'}
                                    {!isCreating && isRevisioning && !isDeploying && 'Creating Revision . . .'}
                                    {!isCreating && isPublishing
                                        && !isRevisioning && !isDeploying && 'Publishing API . . .'}
                                    {!isCreating && isPublishing
                                        && !isRevisioning && isDeploying && 'Deploying Revision . . .'}
                                </Button>
                            </Grid>
                        )}
                        <Grid item>
                            <Link to='/apis/'>
                                <Button variant='text'>
                                    <FormattedMessage
                                        id='Apis.Create.Default.APICreateDefault.cancel'
                                        defaultMessage='Cancel'
                                    />
                                </Button>
                            </Link>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </StyledAPICreateBase>
    );
};
APICreateStreamingAPI.WORKFLOW_STATUS = {
    CREATED: 'CREATED',
};

export default withRouter(APICreateStreamingAPI);
