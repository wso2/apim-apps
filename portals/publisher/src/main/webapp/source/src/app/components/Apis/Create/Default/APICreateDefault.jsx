/*
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import React, { useReducer, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { FormattedMessage, injectIntl } from 'react-intl';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';
import Alert from 'AppComponents/Shared/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import API from 'AppData/api';
import { usePublisherSettings } from 'AppComponents/Shared/AppContext';
import Banner from 'AppComponents/Shared/Banner';
import LinearProgress from '@mui/material/LinearProgress';

import APICreateBase from 'AppComponents/Apis/Create/Components/APICreateBase';
import DefaultAPIForm from 'AppComponents/Apis/Create/Components/DefaultAPIForm';
import APIProduct from 'AppData/APIProduct';
import AuthManager from 'AppData/AuthManager';
import Progress from 'AppComponents/Shared/Progress';
import Utils from 'AppData/Utils';

const gatewayTypeMap = {
    'Regular': 'wso2/synapse',
    'APK': 'wso2/apk',
    'AWS': 'AWS',
    'Azure': 'Azure',
};

const getPolicies = async () => {
    const promisedPolicies = API.policies('subscription');
    const policies = await promisedPolicies;
    return policies.body.list;
};
/**
 *
 * @export
 * @param {*} props
 * @returns
 */
/**
 * Handle API creation.
 * @param {JSON} props properties passed in.
 * @returns {JSX} API creation form.
 */
function APICreateDefault(props) {
    // const theme = useTheme();
    const {
        isWebSocket, isAPIProduct, history, intl, multiGateway
    } = props;
    const { data: settings, isLoading, error: settingsError } = usePublisherSettings();
    const [isAvailbaleGateway, setIsAvailableGateway] = useState(false);
    const [pageError, setPageError] = useState(null);

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
            case 'endpoint':
            case 'context':
            case 'gatewayType':
            case 'isFormValid':
                return { ...currentState, [action]: value };
            default:
                return currentState;
        }
    }
    const [apiInputs, inputsDispatcher] = useReducer(apiInputsReducer, {
        formValidity: false,
        gatewayType: multiGateway && (multiGateway.filter((gw) => gw.value === 'wso2/synapse').length > 0 ?
            'wso2/synapse' : multiGateway[0]?.value),
    });

    useEffect(() => {
        if (settingsError) {
            setPageError(settingsError.message);
        }
    }, [settingsError]);

    useEffect(() => {
        if (settings != null) {
            // If the gateway type is not in the gatewayTypeMap, add it with both key and value equal to the type
            if (settings.gatewayTypes) {
                settings.gatewayTypes.forEach(type => {
                    if (!(type in gatewayTypeMap)) {
                        gatewayTypeMap[type] = type;
                    }
                });
            }

            if (settings.gatewayTypes && settings.gatewayTypes.includes('Regular')) {
                for (const env of settings.environment) {
                    if (env.gatewayType === 'Regular') {
                        setIsAvailableGateway(true);
                        break;
                    }
                }
            }
        }
    }, [isLoading]);
    const [isCreating, setIsCreating] = useState();
    const [isPublishing, setIsPublishing] = useState(false);

    const [isRevisioning, setIsRevisioning] = useState(false);
    const [isDeploying, setIsDeploying] = useState(false);
    const [isMandatoryPropsConfigured, setIsMandatoryPropsConfigured] = useState(false);
    const [isPublishButtonClicked, setIsPublishButtonClicked] = useState(false);

    const isPublishable = apiInputs.endpoint;
    const isAPICreateDisabled = !(apiInputs.name && apiInputs.version && apiInputs.context) || isCreating
                                 || isPublishing;

    /**
     *
     *
     * @param {*} event
     */
    function handleOnChange(event) {
        const { name: action, value } = event.target;
        inputsDispatcher({ action, value });
        if (action === 'gatewayType') {
            const settingsEnvList = settings && settings.environment;
            if (settings && settings.gatewayTypes.length >= 2 && Object.values(gatewayTypeMap).includes(value)) {
                for (const env of settingsEnvList) {
                    const tmpEnv = gatewayTypeMap[env.gatewayType];
                    if (tmpEnv === value) {
                        setIsAvailableGateway(true);
                        break;
                    }
                    setIsAvailableGateway(false);
                }
            }
        }
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

    const getDefaultCustomProperties = () => {
        if (settings != null) {
            if (settings.customProperties && settings.customProperties.length > 0 ) {
                setIsMandatoryPropsConfigured(true);
            }
        }
    };

    useEffect(() => {
        getDefaultCustomProperties();
    }, [settings]);  

    /**
     *
     *
     * @param {*} params
     */
    async function createAPI() {
        setIsCreating(true);
        const {
            name, version, context, endpoint, gatewayType, displayName,
        } = apiInputs;
        let promisedCreatedAPI;
        let policies;
        const allPolicies = await getPolicies();
        if (allPolicies.length === 0) {
            Alert.info(intl.formatMessage({
                id: 'Apis.Create.Default.APICreateDefault.error.policies.not.available',
                defaultMessage: 'Throttling policies not available. Contact your administrator',
            }));
        } else if (allPolicies.filter((p) => p.name === 'Unlimited').length > 0) {
            policies = ['Unlimited'];
        } else {
            policies = [allPolicies[0].name];
        }

        const apiData = {
            name,
            displayName,
            version,
            context,
            gatewayType,
            policies,
        };
        if (endpoint) {
            apiData.endpointConfig = {
                endpoint_type: 'http',
                sandbox_endpoints: {
                    url: endpoint,
                },
                production_endpoints: {
                    url: endpoint,
                },
            };
        }
        if (isWebSocket) {
            apiData.type = 'WS';
        }
        if (isAPIProduct) {
            const newAPIProduct = new APIProduct(apiData);
            promisedCreatedAPI = newAPIProduct
                .saveProduct(apiData)
                .then((apiProduct) => {
                    Alert.info(intl.formatMessage({
                        id: 'Apis.Create.Default.APICreateDefault.api.product.created.success',
                        defaultMessage: 'API Product created successfully',
                    }));
                    history.push(`/api-products/${apiProduct.id}/overview`);
                    return apiProduct;
                })
                .catch((error) => {
                    console.error(error);
                    if (error.response) {
                        setPageError(error.response.body);
                        return error.response.body.description;
                    } else {
                        const message = intl.formatMessage({
                            id: 'Apis.Create.Default.APICreateDefault.api.product.created.error',
                            defaultMessage: 'Something went wrong while adding the API Product',
                        });
                        setPageError(message);
                        // TODO add i18n ~tmkb
                        return message;
                    }
                });
        } else {
            const newAPI = new API(apiData);
            promisedCreatedAPI = newAPI
                .save();
            Alert.loading(promisedCreatedAPI, {
                loading: 'Creating API...',
                success: intl.formatMessage({
                    id: 'Apis.Create.Default.APICreateDefault.api.created.success',
                    defaultMessage: 'API created successfully',
                }),
                error: (error) => {
                    console.error(error);
                    setIsPublishing(false); // We don't publish if something when wrong
                    if (error.response) {
                        setPageError(error.response.body);
                        return error.response.body.description;
                    } else {
                        const message = intl.formatMessage({
                            id: 'Apis.Create.Default.APICreateDefault.api.created.error',
                            defaultMessage: 'Something went wrong while adding the API',
                        });
                        setPageError(message);
                        return message;
                    }
                },
            });
        }
        return promisedCreatedAPI.finally(() => setIsCreating(false));
    }

    /**
     *
     */
    function createAndPublish() {
        const complianceErrorCode = 903300;
        const restApi = new API();
        setIsPublishButtonClicked(true);
        createAPI().then((api) => {
            setIsRevisioning(true);
            const body = {
                description: 'Initial Revision',
            };
            const promisedAPIRevision = restApi.createRevision(api.id, body);
            Alert.loading(promisedAPIRevision, {
                success: intl.formatMessage({
                    id: 'Apis.Create.Default.APICreateDefault.api.revision.created.success',
                    defaultMessage: 'API Revision created successfully',
                }),
                error: (error) => {
                    console.error(error);
                    if (error.response) {
                        if (error.response.body.code === complianceErrorCode) {
                            const violations = JSON.parse(error.response.body.description).blockingViolations;
                            return (
                                <Box sx={{ width: '100%' }}>
                                    <Typography>
                                        <FormattedMessage
                                            id='Apis.Create.Default.APICreateDefault.error.governance.violation'
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
                                                id={'Apis.Create.Default.APICreateDefault.error.'
                                                    + 'governance.violation.download'}
                                                defaultMessage='Download Violations'
                                            />
                                        </Button>
                                    </Box>
                                </Box>
                            )
                        } else {
                            setPageError(error.response.body);
                            return error.response.body.description;
                        }
                    } else {
                        setPageError('Something went wrong while creating the API Revision');
                        return intl.formatMessage({
                            id: 'Apis.Create.Default.APICreateDefault.error.errorMessage.create.revision',
                            defaultMessage: 'Something went wrong while creating the API Revision',
                        });
                    }
                },
                loading: 'Creating API revision...',
            });
            promisedAPIRevision.then((api1) => {
                const revisionId = api1.body.id;
                setIsRevisioning(false);
                const envList = settings.environment.map((env) => env.name);
                const body1 = [];
                const internalGateways = settings.environment;
                const getFirstVhost = (envName) => {
                    const env = internalGateways.find(
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
                        const tmpEnv = gatewayTypeMap[env.gatewayType];
                        if (!foundEnv && tmpEnv === apiInputs.gatewayType && getFirstVhost(env.name)) {
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
                const promisedDeployment = restApi.deployRevision(api.id, revisionId, body1);
                Alert.loading(promisedDeployment, {
                    loading: 'Deploying API...',
                    success: intl.formatMessage({
                        id: 'Apis.Create.Default.APICreateDefault.api.revision.deployed.success',
                        defaultMessage: 'API Revision Deployed Successfully',
                    }),
                    error: (error) => {
                        console.error(error);
                        if (error.response) {
                            if (error.response.body.code === complianceErrorCode) {
                                const violations = JSON.parse(error.response.body.description).blockingViolations;
                                return (
                                    <Box sx={{ width: '100%' }}>
                                        <Typography>
                                            <FormattedMessage
                                                id='Apis.Create.Default.APICreateDefault.error.governance.violation'
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
                                                    id={'Apis.Create.Default.APICreateDefault.error.'
                                                        + 'governance.violation.download'}
                                                    defaultMessage='Download Violations'
                                                />
                                            </Button>
                                        </Box>
                                    </Box>
                                )
                            } else {
                                setPageError(error.response.body);
                                return error.response.body.description;
                            }
                        } else {
                            setPageError('Something went wrong while publishing the API');

                            return intl.formatMessage({
                                id: 'Apis.Create.Default.APICreateDefault.error.errorMessage.publish',
                                defaultMessage: 'Something went wrong while publishing the API',
                            });
                        }
                    },
                });
                promisedDeployment.then((res) => {
                    setIsDeploying(false);

                    const deploymentStatus = res.body[0].status;
                    if (deploymentStatus === 'CREATED') {
                        setIsPublishing(false);
                        setIsPublishButtonClicked(false);
                        history.push(`/apis/${api.id}/overview`)

                    } else {
                        setIsPublishing(true);
                        const promisedPublish = api.publish();
                        Alert.loading(promisedPublish, {
                            loading: 'Publishing API...',
                            success: (response) => {
                                const { workflowStatus } = response.body;
                                if (workflowStatus === APICreateDefault.WORKFLOW_STATUS.CREATED) {
                                    return intl.formatMessage({
                                        id: 'Apis.Create.Default.APICreateDefault.success.publishStatus',
                                        defaultMessage: 'Lifecycle state change request has been sent',
                                    });
                                } else {
                                    return intl.formatMessage({
                                        id: 'Apis.Create.Default.APICreateDefault.success.otherStatus',
                                        defaultMessage: 'API updated successfully',
                                    });
                                }
                            },
                            error: (error) => {
                                if (error.response.body.code === complianceErrorCode) {
                                    const violations = JSON.parse(error.response.body.description).blockingViolations;
                                    return (
                                        <Box sx={{ width: '100%' }}>
                                            <Typography>
                                                <FormattedMessage
                                                    id={'Apis.Create.Default.APICreateDefault.error.'
                                                        + 'governance.violation'}
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
                                                        id={'Apis.Create.Default.APICreateDefault.error.'
                                                            + 'governance.violation.download'}
                                                        defaultMessage='Download Violations'
                                                    />
                                                </Button>
                                            </Box>
                                        </Box>
                                    )
                                } else {
                                    return intl.formatMessage({
                                        id: 'Apis.Create.Default.APICreateDefault.error.otherStatus',
                                        defaultMessage: 'Error while publishing the API',
                                    })
                                }
                            },
                        });
                        promisedPublish.then(() => history.push(`/apis/${api.id}/overview`))
                            .finally(() => {
                                setIsPublishing(false);
                                setIsPublishButtonClicked(false);
                            });
                    }

                })
                    .finally(() => {
                        setIsDeploying(false);
                    });
            })
                .finally(() => {
                    setIsRevisioning(false);
                });
        });
    }

    /**
     *
     *
     */
    function createAPIOnly() {
        createAPI().then((api) => {
            history.push(`/apis/${api.id}/overview`);
        });
    }
    let pageTitle = (
        <>
            <Typography variant='h5' component='h1'>
                <FormattedMessage
                    id='Apis.Create.Default.APICreateDefault.api.heading'
                    defaultMessage='Create an API'
                />
            </Typography>
            <Typography variant='caption'>
                <FormattedMessage
                    id='Apis.Create.Default.APICreateDefault.api.sub.heading'
                    defaultMessage={
                        'Create an API by providing a Name, a Display Name (optional), a Version,'
                        + ' a Context and Backend Endpoint (optional)'
                    }
                />
            </Typography>
        </>
    );
    if (isAPIProduct) {
        pageTitle = (
            <>
                <Typography variant='h5' component='h1'>
                    <FormattedMessage
                        id='Apis.Create.Default.APICreateDefault.apiProduct.heading'
                        defaultMessage='Create an API Product'
                    />
                </Typography>
                <Typography variant='caption'>
                    <FormattedMessage
                        id='Apis.Create.Default.APICreateDefault.apiProduct.sub.heading'
                        defaultMessage={
                            'Create an API Product by providing a Name, a Display Name (optional), a Context,'
                            + ' and Business Plans (optional).'
                        }
                    />
                </Typography>
            </>
        );
    } else if (isWebSocket) {
        pageTitle = (
            <>
                <Typography variant='h5' component='h1'>
                    <FormattedMessage
                        id='Apis.Create.Default.APICreateDefault.webSocket.heading'
                        defaultMessage='Create a WebSocket API'
                    />
                </Typography>
                <Typography variant='caption'>
                    <FormattedMessage
                        id='Apis.Create.Default.APICreateDefault.webSocket.sub.heading'
                        defaultMessage='Create a WebSocket API by providing a Name, and a Context.'
                    />
                </Typography>
            </>
        );
    }

    if (isLoading) {
        return (
            <Progress />
        )
    }

    return (
        <APICreateBase title={pageTitle}>
            <Grid container direction='row' justifyContent='center' alignItems='center'>
                {/* Page error banner */}
                {(pageError) && (
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
                            <LinearProgress data-testid='loading-publisher-settings' />
                        </Box>
                    )}
                </Grid>
                <Grid item xs={12} data-testid='default-api-form'>
                    <DefaultAPIForm
                        onValidate={handleOnValidate}
                        onChange={handleOnChange}
                        api={apiInputs}
                        multiGateway={multiGateway}
                        isAPIProduct={isAPIProduct}
                        isWebSocket={isWebSocket}
                        settings={settings}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Grid container direction='row' justifyContent='flex-start' alignItems='center' spacing={2}>
                        <Grid item>
                            <Button
                                id='itest-create-default-api-button'
                                variant='contained'
                                color='primary'
                                disabled={isAPICreateDisabled || !apiInputs.isFormValid}
                                onClick={createAPIOnly}
                            >
                                <FormattedMessage
                                    id='Apis.Create.Default.APICreateDefault.create.btn'
                                    defaultMessage='Create'
                                />
                                {' '}
                                {isCreating && !isPublishButtonClicked && <CircularProgress size={24} />}
                            </Button>
                        </Grid>
                        {!isMandatoryPropsConfigured && !AuthManager.isNotPublisher() && (
                            <Grid item>
                                <Button
                                    id='itest-id-apicreatedefault-createnpublish'
                                    variant='contained'
                                    color='primary'
                                    disabled={!isAvailbaleGateway || isDeploying || isRevisioning || !isPublishable
                                        || isAPICreateDisabled || !apiInputs.isFormValid}
                                    onClick={createAndPublish}
                                >
                                    {(!isPublishing && !isRevisioning && !isDeploying)
                                        && (
                                            <FormattedMessage
                                                id='Apis.Create.Default.APICreateDefault.create.publish.btn'
                                                defaultMessage='Create & Publish'
                                            />
                                        )}
                                    {(isPublishing || isRevisioning || isDeploying) && <CircularProgress size={24} />}
                                    {isCreating && isPublishing &&
                                        <FormattedMessage
                                            id='Apis.Create.Default.APICreateDefault.create.publish.btn.creating.status'
                                            defaultMessage='Creating API . . .'
                                        />
                                    }
                                    {!isCreating && isRevisioning && !isDeploying &&
                                        <FormattedMessage
                                            id={'Apis.Create.Default.APICreateDefault.create.publish.btn.creating.'
                                                + 'revision.status'}
                                            defaultMessage='Creating Revision . . .'
                                        />
                                    }
                                    {!isCreating && isPublishing
                                        && !isRevisioning && !isDeploying &&
                                        <FormattedMessage
                                            id={'Apis.Create.Default.APICreateDefault.create.publish.btn.creating.'
                                                + 'publishing.status'}
                                            defaultMessage='Publishing API . . .'
                                        />
                                    }
                                    {!isCreating && isPublishing
                                        && !isRevisioning && isDeploying &&
                                        <FormattedMessage
                                            id={'Apis.Create.Default.APICreateDefault.create.publish.btn.creating.'
                                                + 'deploying.revision.status'}
                                            defaultMessage='Deploying Revision . . .'
                                        />
                                    }
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
            <Grid item xs={12}>
                <Box mt={4} />
            </Grid>
        </APICreateBase>
    );
}
APICreateDefault.defaultProps = {
    isWebSocket: false,
    isAPIProduct: false,
};
APICreateDefault.WORKFLOW_STATUS = {
    CREATED: 'CREATED',
};
APICreateDefault.propTypes = {
    history: PropTypes.shape({ push: PropTypes.func }).isRequired,
    multiGateway: PropTypes.isRequired,
    isAPIProduct: PropTypes.shape({}),
    isWebSocket: PropTypes.shape({}),
    intl: PropTypes.shape({
        formatMessage: PropTypes.func,
    }).isRequired,
};
export default withRouter(injectIntl(APICreateDefault));
