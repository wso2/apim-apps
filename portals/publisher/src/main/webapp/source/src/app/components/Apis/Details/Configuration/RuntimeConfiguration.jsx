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

import React, {
    useReducer, useContext, useState, useEffect,
} from 'react';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { Link, useHistory } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { FormattedMessage, useIntl } from 'react-intl';
import Alert from 'AppComponents/Shared/Alert';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Api from 'AppData/api';
import { APIContext } from 'AppComponents/Apis/Details/components/ApiContext';
import { useAppContext, usePublisherSettings } from 'AppComponents/Shared/AppContext';
import { isRestricted } from 'AppData/AuthManager';
import { Progress } from 'AppComponents/Shared';
import CustomSplitButton from 'AppComponents/Shared/CustomSplitButton';
import ResponseCaching from './components/ResponseCaching';
import CORSConfiguration from './components/CORSConfiguration';
import SchemaValidation from './components/SchemaValidation';
import MaxBackendTps from './components/MaxBackendTps';
import Endpoints from './components/Endpoints';
import APISecurity from './components/APISecurity/APISecurity';
import QueryAnalysis from './components/QueryAnalysis';
import {
    DEFAULT_API_SECURITY_OAUTH2,
    API_SECURITY_BASIC_AUTH,
    API_SECURITY_API_KEY,
    API_SECURITY_OAUTH_BASIC_AUTH_API_KEY_MANDATORY,
    API_SECURITY_OAUTH_BASIC_AUTH_API_KEY_OPTIONAL,
    API_SECURITY_MUTUAL_SSL_MANDATORY,
    API_SECURITY_MUTUAL_SSL_OPTIONAL,
    API_SECURITY_MUTUAL_SSL,
    ALL_AUDIENCES_ALLOWED,
} from './components/APISecurity/components/apiSecurityConstants';
import WebSubConfiguration from './components/WebSubConfiguration';
import BackendRateLimiting from './components/AIBackendRateLimiting/BackendRateLimiting';

const PREFIX = 'RuntimeConfiguration';

const classes = {
    root: `${PREFIX}-root`,
    titleWrapper: `${PREFIX}-titleWrapper`,
    mainTitle: `${PREFIX}-mainTitle`,
    paper: `${PREFIX}-paper`,
    paperCenter: `${PREFIX}-paperCenter`,
    heading: `${PREFIX}-heading`,
    itemPadding: `${PREFIX}-itemPadding`,
    arrowForwardIcon: `${PREFIX}-arrowForwardIcon`,
    arrowBackIcon: `${PREFIX}-arrowBackIcon`,
    expansionPanel: `${PREFIX}-expansionPanel`,
    expansionPanelDetails: `${PREFIX}-expansionPanelDetails`,
    subHeading: `${PREFIX}-subHeading`,
    info: `${PREFIX}-info`
};


const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.root}`]: {
        padding: theme.spacing(3, 2),
    },

    [`& .${classes.titleWrapper}`]: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing(3),
    },

    [`& .${classes.mainTitle}`]: {
        paddingLeft: 0,
    },

    [`& .${classes.paper}`]: {
        padding: theme.spacing(3),
    },

    [`& .${classes.paperCenter}`]: {
        padding: theme.spacing(3),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },

    [`& .${classes.heading}`]: {
        fontSize: '1.1rem',
        fontWeight: 400,
        marginBottom: theme.spacing(0),
    },

    [`& .${classes.itemPadding}`]: {
        marginBottom: theme.spacing(3),
    },

    [`& .${classes.arrowForwardIcon}`]: {
        fontSize: 50,
        color: '#ccc',
        position: 'absolute',
        top: 90,
        right: -43,
    },

    [`& .${classes.arrowBackIcon}`]: {
        fontSize: 50,
        color: '#ccc',
        position: 'absolute',
        top: 30,
        right: -71,
    },

    [`& .${classes.expansionPanel}`]: {
        marginBottom: theme.spacing(1),
    },

    [`& .${classes.expansionPanelDetails}`]: {
        flexDirection: 'column',
    },

    [`& .${classes.subHeading}`]: {
        fontSize: '1rem',
        fontWeight: 400,
        margin: 0,
        display: 'inline-flex',
        lineHeight: '38px',
    },

    [`& .${classes.info}`]: {
        display: 'flex',
        height: '100%',
    }
}));

/**
 *
 * Deep coping the properties in API object (what ever the object in the state),
 * making sure that no direct mutations happen when updating the state.
 * You should know the shape of the object that you are keeping in the state,
 * @param {Object} api
 * @returns {Object} Deep copy of an object
 */
function copyAPIConfig(api) {
    const apiConfigJson = {
        id: api.id,
        name: api.name,
        description: api.description,
        lifeCycleStatus: api.lifeCycleStatus,
        accessControl: api.accessControl,
        authorizationHeader: api.authorizationHeader,
        apiKeyHeader: api.apiKeyHeader,
        responseCachingEnabled: api.responseCachingEnabled,
        cacheTimeout: api.cacheTimeout,
        visibility: api.visibility,
        isDefaultVersion: api.isDefaultVersion,
        enableSchemaValidation: api.enableSchemaValidation,
        enableSubscriberVerification: api.enableSubscriberVerification,
        accessControlRoles: [...api.accessControlRoles],
        visibleRoles: [...api.visibleRoles],
        tags: [...api.tags],
        wsdlUrl: api.wsdlUrl,
        transport: [...api.transport],
        securityScheme: [...api.securityScheme],
        keyManagers: [...(api.keyManagers || [])],
        corsConfiguration: {
            corsConfigurationEnabled: api.corsConfiguration.corsConfigurationEnabled,
            accessControlAllowCredentials: api.corsConfiguration.accessControlAllowCredentials,
            accessControlAllowOrigins: [...api.corsConfiguration.accessControlAllowOrigins],
            accessControlAllowHeaders: [...api.corsConfiguration.accessControlAllowHeaders],
            accessControlAllowMethods: [...api.corsConfiguration.accessControlAllowMethods],
        },
        audiences: [...(api.audiences || [ALL_AUDIENCES_ALLOWED])],
    };
    if (api.advertiseInfo) {
        apiConfigJson.advertiseInfo = {
            advertised: api.advertiseInfo.advertised,
            apiExternalProductionEndpoint: api.advertiseInfo.apiExternalProductionEndpoint,
            apiExternalSandboxEndpoint: api.advertiseInfo.apiExternalSandboxEndpoint,
            originalDevPortalUrl: api.advertiseInfo.originalDevPortalUrl,
            apiOwner: api.advertiseInfo.apiOwner,
            vendor: api.advertiseInfo.vendor,
        }
    }
    if (api.subtypeConfiguration) {
        apiConfigJson.subtypeConfiguration = {
            ...api.subtypeConfiguration,
        };
    }
    if (api.maxTps) {
        apiConfigJson.maxTps = {
            ...api.maxTps,
            tokenBasedThrottlingConfiguration: api.maxTps.tokenBasedThrottlingConfiguration ?
                { ...api.maxTps.tokenBasedThrottlingConfiguration } : null,
        };
    }
    return apiConfigJson;
}


/**
 * This component handles the basic configurations UI in the API details page
 *
 * @export
 * @param {*} props
 * @returns
 */
export default function RuntimeConfiguration() {
    const [keyManagersConfigured, setKeyManagersConfigured] = useState([]);
    const [saveButtonDisabled, setSaveButtonDisabled] = useState(false);
    const { settings } = useAppContext();
    /**
     *
     * Reduce the configuration UI related actions in to updated state
     * @param {*} state current state
     * @param {*} configAction dispatched configuration action
     * @returns {Object} updated state
     */
    function configReducer(state, configAction) {
        const { action, value, event } = configAction;
        const nextState = { ...copyAPIConfig(state) };
        switch (action) {
            case 'description':
            case 'isDefaultVersion':
            case 'authorizationHeader':
            case 'apiKeyHeader':
            case 'responseCachingEnabled':
            case 'cacheTimeout':
            case 'enableSchemaValidation':
            case 'accessControl':
            case 'visibility':
            case 'enableSubscriberVerification':
            case 'tags':
                nextState[action] = value;
                return nextState;
            case 'accessControlRoles':
                return { ...copyAPIConfig(state), [action]: value };
            case 'visibleRoles':
                return { ...copyAPIConfig(state), [action]: value };
            case 'securityScheme':
                // If event came from mandatory selector of either Application level or Transport level
                if (API_SECURITY_MUTUAL_SSL_MANDATORY === event.name) {
                    const filteredArray = state[action]
                        .filter((schema) => (schema !== API_SECURITY_MUTUAL_SSL_MANDATORY
                            && schema !== API_SECURITY_MUTUAL_SSL_OPTIONAL))
                        .concat(event.value);
                    const newState = {
                        ...copyAPIConfig(state),
                        [action]: filteredArray,
                    };
                    return newState;
                } else if (API_SECURITY_OAUTH_BASIC_AUTH_API_KEY_MANDATORY === event.name) {
                    const filteredArray = state[action]
                        .filter((schema) => (schema !== API_SECURITY_OAUTH_BASIC_AUTH_API_KEY_MANDATORY
                            && schema !== API_SECURITY_OAUTH_BASIC_AUTH_API_KEY_OPTIONAL))
                        .concat(event.value);
                    const newState = {
                        ...copyAPIConfig(state),
                        [action]: filteredArray,
                    };
                    return newState;
                }
                // User checked on one of api security schemas (either OAuth, Basic, ApiKey or Mutual SSL)
                if (event.checked) {
                    if (state[action].includes(event.value)) {
                        return state; // Add for completeness, Ideally there couldn't exist this state
                    } else if (event.value === API_SECURITY_MUTUAL_SSL 
                        && event.value !== DEFAULT_API_SECURITY_OAUTH2
                        && event.value !== API_SECURITY_BASIC_AUTH
                        && event.value !== API_SECURITY_API_KEY) {
                        return { ...copyAPIConfig(state), 
                            [action]: [...state[action], event.value, API_SECURITY_MUTUAL_SSL_MANDATORY] };
                    } else if (event.value !== API_SECURITY_MUTUAL_SSL 
                        && (event.value === DEFAULT_API_SECURITY_OAUTH2
                        || event.value === API_SECURITY_BASIC_AUTH
                        || event.value === API_SECURITY_API_KEY)) {
                        return { ...copyAPIConfig(state), 
                            [action]: [...state[action], event.value,
                                API_SECURITY_OAUTH_BASIC_AUTH_API_KEY_MANDATORY] };
                    }
                    return { ...copyAPIConfig(state), [action]: [...state[action], event.value] };
                } else if (state[action].includes(event.value)) {
                    // User has unchecked a security schema type
                    const newState = {
                        ...copyAPIConfig(state),
                        [action]: state[action].filter((schema) => schema !== event.value),
                    };
                    if (
                        !(
                            newState[action].includes(DEFAULT_API_SECURITY_OAUTH2)
                            || newState[action].includes(API_SECURITY_BASIC_AUTH)
                            || newState[action].includes(API_SECURITY_API_KEY)
                        )
                    ) {
                        const noMandatoryOAuthBasicAuth = newState[action]
                            .filter((schema) => (schema !== API_SECURITY_OAUTH_BASIC_AUTH_API_KEY_MANDATORY 
                                && schema !== API_SECURITY_OAUTH_BASIC_AUTH_API_KEY_OPTIONAL
                                && schema !== API_SECURITY_MUTUAL_SSL_MANDATORY
                                && schema !== API_SECURITY_MUTUAL_SSL_OPTIONAL));
                        const newSecurityScheme = newState[action].includes(API_SECURITY_MUTUAL_SSL) ?
                            [...noMandatoryOAuthBasicAuth, API_SECURITY_MUTUAL_SSL_MANDATORY]
                            : noMandatoryOAuthBasicAuth;
                        return {
                            ...newState,
                            [action]: newSecurityScheme,
                        };
                    } else if (!newState[action].includes(API_SECURITY_MUTUAL_SSL)) {
                        const noMandatoryMutualSSL = newState[action]
                            .filter((schema) => (schema !== API_SECURITY_MUTUAL_SSL_MANDATORY
                                && schema !== API_SECURITY_MUTUAL_SSL_OPTIONAL
                                && schema !== API_SECURITY_OAUTH_BASIC_AUTH_API_KEY_MANDATORY 
                                && schema !== API_SECURITY_OAUTH_BASIC_AUTH_API_KEY_OPTIONAL));
                        const newSecurityScheme = (newState[action].includes(DEFAULT_API_SECURITY_OAUTH2)
                            || newState[action].includes(API_SECURITY_BASIC_AUTH)
                            || newState[action].includes(API_SECURITY_API_KEY)) ?
                            [...noMandatoryMutualSSL, API_SECURITY_OAUTH_BASIC_AUTH_API_KEY_MANDATORY]
                            : noMandatoryMutualSSL;
                        return {
                            ...newState,
                            [action]: newSecurityScheme,
                        };
                    }

                    return newState;
                } else {
                    return state; // Add for completeness, Ideally there couldn't exist this state
                }
            case 'transport':
                if (event.checked) {
                    return { ...copyAPIConfig(state), transport: [...state.transport, event.value] };
                } else {
                    return {
                        ...copyAPIConfig(state),
                        transport: state.transport.filter((transport) => transport !== event.value),
                    };
                }
            case 'accessControlAllowHeaders':
            case 'accessControlAllowMethods':
            case 'accessControlAllowCredentials':
            case 'corsConfigurationEnabled':
                nextState.corsConfiguration[action] = value;
                return nextState;
            case 'accessControlAllowOrigins':
                if (event.checked) {
                    nextState.corsConfiguration[action] = [event.value];
                } else {
                    nextState.corsConfiguration[action] = event.checked === false ? [] : event.value;
                }
                return nextState;
            case 'audienceValidationEnabled':
                if (value === false) {
                    nextState.audiences = [ALL_AUDIENCES_ALLOWED];
                } 
                return nextState;
            case 'audienceAllowed':
                nextState.audiences = value;
                return nextState;
            case 'keymanagers':
                nextState.keyManagers = value;
                return nextState;
            case 'allKeyManagersEnabled':
                if (value) {
                    nextState.keyManagers = ['all'];
                } else {
                    nextState.keyManagers = keyManagersConfigured;
                }
                return nextState;
            case 'saveButtonDisabled':
                setSaveButtonDisabled(value);
                return state;
            case 'maxTps': {
                nextState.maxTps = value;
                if (nextState.maxTps){
                    if (!nextState.maxTps.productionTimeUnit) {
                        nextState.maxTps.productionTimeUnit = 'SECOND';
                    }
                    if (!nextState.maxTps.sandboxTimeUnit) {
                        nextState.maxTps.sandboxTimeUnit = 'SECOND';
                    }
                    if (!nextState.maxTps.production) {
                        nextState.maxTps.production = '';
                    }
                    if (!nextState.maxTps.sandbox) {
                        nextState.maxTps.sandbox = '';
                    }
                    const { tokenBasedThrottlingConfiguration } = nextState.maxTps;
                    if (tokenBasedThrottlingConfiguration) {
                        tokenBasedThrottlingConfiguration.isTokenBasedThrottlingEnabled = !!(
                            tokenBasedThrottlingConfiguration.productionMaxPromptTokenCount ||
                            tokenBasedThrottlingConfiguration.productionMaxCompletionTokenCount ||
                            tokenBasedThrottlingConfiguration.productionMaxTotalTokenCount ||
                            tokenBasedThrottlingConfiguration.sandboxMaxPromptTokenCount ||
                            tokenBasedThrottlingConfiguration.sandboxMaxCompletionTokenCount ||
                            tokenBasedThrottlingConfiguration.sandboxMaxTotalTokenCount
                        );
                    }
                }
                return nextState;
            }
            default:
                return state;
        }
    }
    const { api, updateAPI } = useContext(APIContext);
    const { data: publisherSettings, isLoading } = usePublisherSettings();
    const history = useHistory();
    const isAsyncAPI = api.type === 'WS' || api.type === 'WEBSUB' || api.type === 'SSE' || api.type === 'ASYNC';
    const isNonWebSubAsyncAPI = api.type === 'WS' || api.type === 'SSE' || api.type === 'ASYNC';
    const isWebSub = api.type === 'WEBSUB';
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateComplexityList, setUpdateComplexityList] = useState(null);
    const [apiConfig, configDispatcher] = useReducer(configReducer, copyAPIConfig(api));
    const [componentValidator, setComponentValidator] = useState([]);
    const [endpointSecurity, setEndpointSecurity] = useState([]);

    const intl = useIntl();
    useEffect(() => {
        if (!isRestricted(['apim:api_create'], api)) {
            Api.keyManagers().then((response) => {
                const kmNameList = [];
                if (response.body.list) {
                    response.body.list.forEach((km) => kmNameList.push(km.name));
                }
                setKeyManagersConfigured(kmNameList);
            })
                .catch((error) => {
                    const { response } = error;
                    if (response.body) {
                        const { description } = response.body;
                        Alert.error(description);
                    }
                });
        }
    }, []);

    useEffect(() => {
        if (!isLoading) {
            setComponentValidator(publisherSettings.gatewayFeatureCatalog
                .gatewayFeatures[api.gatewayType ? api.gatewayType : 'wso2/synapse'].runtime);
            setEndpointSecurity(publisherSettings.gatewayFeatureCatalog
                .gatewayFeatures[api.gatewayType ? api.gatewayType : 'wso2/synapse'].endpoints);
        }
    }, [isLoading]);

    /**
     * Update the GraphQL Query Complexity Values
     */
    function updateComplexity() {
        const apiId = apiConfig.id;
        const apiClient = new Api();
        const promisedComplexity = apiClient.updateGraphqlPoliciesComplexity(
            apiId, {
                list: updateComplexityList,
            },
        );
        promisedComplexity
            .catch((error) => {
                const { response } = error;
                if (response.body) {
                    const { description } = response.body;
                    Alert.error(description);
                }
            });
    }

    /**
     *
     * Handle the configuration view save button action
     */
    function handleSave() {
        if (api.isAPIProduct()) {
            delete apiConfig.keyManagers; // remove keyManagers property if API type is API Product
        }
        if (updateComplexityList !== null) {
            updateComplexity();
        }
        // Validate the key managers
        if (
            !api.isAPIProduct()
            && apiConfig.securityScheme.includes('oauth2')
            && !apiConfig.keyManagers.includes('all')
            && (apiConfig.keyManagers && apiConfig.keyManagers.length === 0)
        ) {
            Alert.error(
                intl.formatMessage(
                    {
                        id: 'Apis.Details.Configuration.RuntimeConfiguration.no.km.error',
                        defaultMessage: 'Select one or more Key Managers',
                    },
                ),
            );
            return;
        }
        setIsUpdating(true);
        updateAPI(apiConfig)
            .catch((error) => {
                if (error.response) {
                    Alert.error(error.response.body.description);
                }
            })
            .finally(() => setIsUpdating(false));
    }

    /**
     *
     * Handle the configuration view save button action
     */
    function handleSaveAndDeploy() {
        if (api.isAPIProduct()) {
            delete apiConfig.keyManagers; // remove keyManagers property if API type is API Product
        }
        if (updateComplexityList !== null) {
            updateComplexity();
        }
        // Validate the key managers
        if (
            !api.isAPIProduct()
            && apiConfig.securityScheme.includes('oauth2')
            && !apiConfig.keyManagers.includes('all')
            && (apiConfig.keyManagers && apiConfig.keyManagers.length === 0)
        ) {
            Alert.error(
                intl.formatMessage(
                    {
                        id: 'Apis.Details.Configuration.RuntimeConfiguration.no.km.error',
                        defaultMessage: 'Select one or more Key Managers',
                    },
                ),
            );
            return;
        }
        setIsUpdating(true);
        updateAPI(apiConfig)
            .catch((error) => {
                if (error.response) {
                    Alert.error(error.response.body.description);
                }
            })
            .finally(() => history.push({
                pathname: api.isAPIProduct() ? `/api-products/${api.id}/deployments`
                    : `/apis/${api.id}/deployments`,
                state: 'deploy',
            }));
    }

    if (isLoading) {
        return <Progress per={80} message='Loading app settings ...' />;
    }

    return (
        <Root>
            <Box pb={3}>
                <Typography id='itest-api-details-runtime-config-head' variant='h5' component='h2'>
                    <FormattedMessage
                        id='Apis.Details.Configuration.RuntimeConfiguration.topic.header'
                        defaultMessage='Runtime Configurations'
                    />
                </Typography>
            </Box>
            <div className={classes.contentWrapper}>
                {(apiConfig.advertiseInfo && apiConfig.advertiseInfo.advertised) ? (
                    <Paper className={classes.paper} elevation={0}>
                        <APISecurity api={apiConfig} configDispatcher={configDispatcher} 
                            componentValidator={componentValidator} />
                    </Paper>
                ) : (
                    <Grid container direction='row' justifyContent='space-around' alignItems='stretch' 
                        columnSpacing={8}>
                        <Grid item xs={12} md={7}>
                            <Typography className={classes.heading} variant='h6' component='h3'>
                                { isAsyncAPI
                                    ? (
                                        <FormattedMessage
                                            id='Apis.Details.Configuration.Configuration.section.initial.request'
                                            defaultMessage='Initial Request'
                                        />
                                    ) : (
                                        <FormattedMessage
                                            id='Apis.Details.Configuration.Configuration.section.request'
                                            defaultMessage='Request'
                                        />
                                    )}
                            </Typography>
                            <Grid direction='column' justifyContent='space-between' alignItems='stretch' spacing={6}>
                                <Grid item xs={12} sx={{ mb: 3, position: 'relative' }}>
                                    <Paper elevation={0} 
                                        sx={{ p: 3, boxSizing: 'border-box' }}>
                                        <APISecurity api={apiConfig} configDispatcher={configDispatcher} 
                                            componentValidator={componentValidator} />
                                        { api.type !== 'WS' && componentValidator.includes("cors") && (
                                            <CORSConfiguration api={apiConfig} 
                                                configDispatcher={configDispatcher} />
                                        )}

                                        {((api.type !== 'GRAPHQL' || !isAsyncAPI) && 
                                            componentValidator.includes("schemaValidation"))
                                            && <SchemaValidation api={apiConfig} 
                                                configDispatcher={configDispatcher} />}
                                        {api.type === 'GRAPHQL' && componentValidator.includes("queryAnalysis") && (
                                            <Box mt={3}>
                                                <QueryAnalysis
                                                    api={apiConfig}
                                                    setUpdateComplexityList={setUpdateComplexityList}
                                                    isRestricted={isRestricted(['apim:api_create'], api)}
                                                />
                                            </Box>
                                        )}
                                    </Paper>
                                    {!isWebSub && (
                                        <ArrowForwardIcon className={classes.arrowForwardIcon} />
                                    )}
                                </Grid>
                                { componentValidator.includes("responseCaching") && !isNonWebSubAsyncAPI && (
                                    <>
                                        <Typography className={classes.heading} variant='h6' component='h3'>
                                            {!isWebSub ? (
                                                <FormattedMessage
                                                    id='Apis.Details.Configuration.Configuration.section.response'
                                                    defaultMessage='Response'
                                                />
                                            ) : (
                                                <FormattedMessage
                                                    id='Apis.Details.Configuration.Configuration.section.events'
                                                    defaultMessage='Events'
                                                />
                                            )}

                                        </Typography>
                                        <Grid item xs={12} sx={{ mb: 3, position: 'relative' }}>
                                            <Paper elevation={0}>
                                                {!isWebSub ? (
                                                    <Grid item xs={12} style={{ position: 'relative' }}>
                                                        <Box mb={3}>
                                                            <Paper className={classes.paper} elevation={0}>
                                                                {!isAsyncAPI && (
                                                                    <ResponseCaching
                                                                        api={apiConfig}
                                                                        configDispatcher={configDispatcher}
                                                                    />
                                                                )}
                                                            </Paper>
                                                        </Box>
                                                    </Grid>
                                                ) : (
                                                    <WebSubConfiguration
                                                        api={apiConfig}
                                                        configDispatcher={configDispatcher}
                                                    />
                                                )}
                                            </Paper>
                                            {!isWebSub && (
                                                <ArrowBackIcon className={classes.arrowBackIcon} />
                                            )}
                                        </Grid>
                                    </>
                                )}
                            </Grid>
                        </Grid>
                        <Grid item xs={12} md={5}>
                            {!isWebSub && (
                                <>
                                    <Typography className={classes.heading} variant='h6' component='h3'>
                                        <FormattedMessage
                                            id='Apis.Details.Configuration.Configuration.section.backend'
                                            defaultMessage='Backend'
                                        />
                                    </Typography>
                                    <Paper
                                        className={classes.paper}
                                        style={{ height: 'calc(100% - 75px)' }}
                                        elevation={0}
                                    >
                                        {api.subtypeConfiguration?.subtype === 'AIAPI' && (
                                            <BackendRateLimiting
                                                api={apiConfig}
                                                configDispatcher={configDispatcher}
                                            />
                                        )}
                                        {api.subtypeConfiguration?.subtype !== 'AIAPI' && !api.isAPIProduct() && (
                                            <>
                                                {(!isAsyncAPI && componentValidator.includes("backendThroughput")) && (
                                                    <MaxBackendTps
                                                        api={apiConfig}
                                                        configDispatcher={configDispatcher}
                                                    />
                                                )}
                                            </>
                                        )}
                                        {!(api.isAPIProduct() || api.subtypeConfiguration?.subtype === 'AIAPI') && (
                                            <>
                                                { !isWebSub && (
                                                    <Endpoints api={api} endpointSecurity={endpointSecurity} />
                                                )}
                                            </>
                                        )}
                                        {api.subtypeConfiguration?.subtype !== 'AIAPI' && api.isAPIProduct() && (
                                            <Box alignItems='center' justifyContent='center' className={classes.info}>
                                                <Typography variant='body1'>
                                                    <FormattedMessage
                                                        id={'Apis.Details.Configuration.RuntimeConfiguration.backend'
                                                            + '.api.product.endpoint'}
                                                        defaultMessage={'Please refer respective APIs for endpoint '
                                                            + 'information'}
                                                    />
                                                </Typography>
                                            </Box>
                                        )}
                                    </Paper>
                                </>
                            )}
                        </Grid>
                    </Grid>
                )}
                <Grid container>
                    <Grid container direction='row' alignItems='center' spacing={1} style={{ marginTop: 20 }}>
                        <Grid item id='save-runtime-configurations'>
                            {api.isRevision || (settings && settings.portalConfigurationOnlyModeEnabled)
                                || ((apiConfig.visibility === 'RESTRICTED' && apiConfig.visibleRoles.length === 0)
                                || isRestricted(['apim:api_create'], api)) || saveButtonDisabled ? (
                                    <Button
                                        disabled
                                        type='submit'
                                        variant='contained'
                                        color='primary'
                                    >
                                        <FormattedMessage
                                            id='Apis.Details.Configuration.Configuration.save'
                                            defaultMessage='Save'
                                        />
                                    </Button>
                                ) : (
                                    <CustomSplitButton
                                        advertiseInfo={api.advertiseInfo}
                                        api={api}
                                        handleSave={handleSave}
                                        handleSaveAndDeploy={handleSaveAndDeploy}
                                        isUpdating={isUpdating}
                                        id = 'runtime-config-save-button'
                                    />
                                )}
                        </Grid>
                        <Grid item>
                            <Button
                                component={Link}
                                to={'/apis/' + api.id + '/overview'}
                                aria-label='Cancel'
                            >
                                <FormattedMessage
                                    id='Apis.Details.Configuration.Configuration.cancel'
                                    defaultMessage='Cancel'
                                />
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
            </div>
        </Root>
    );
}
