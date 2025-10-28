/**
 * Copyright (c)  WSO2 Inc. (http://wso2.com) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, {
    useContext, useEffect, useState, useReducer,
} from 'react';
import { styled } from '@mui/material/styles';
import { Grid } from '@mui/material';
import Typography from '@mui/material/Typography';
import { FormattedMessage, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import { useAppContext, usePublisherSettings } from 'AppComponents/Shared/AppContext';
import { Link, withRouter } from 'react-router-dom';
import CustomSplitButton from 'AppComponents/Shared/CustomSplitButton';
import NewEndpointCreate from 'AppComponents/Apis/Details/Endpoints/NewEndpointCreate';
import { APIContext } from 'AppComponents/Apis/Details/components/ApiContext';
import cloneDeep from 'lodash.clonedeep';
import { isRestricted } from 'AppData/AuthManager';
import { Alert, Progress } from 'AppComponents/Shared';
import AddCircle from '@mui/icons-material/AddCircle';
import { getBasePath } from 'AppComponents/Shared/Utils';
import MCPServerEndpoints from 'AppComponents/MCPServers/Details/Endpoints/Endpoints';
import EndpointOverview from './EndpointOverview';
import AIEndpoints from './AIEndpoints/AIEndpoints';
import { createEndpointConfig, getEndpointTemplateByType } from './endpointUtils';
import { API_SECURITY_KEY_TYPE_PRODUCTION, 
    API_SECURITY_KEY_TYPE_SANDBOX } from '../Configuration/components/APISecurity/components/apiSecurityConstants';

const PREFIX = 'Endpoints';

const classes = {
    endpointTypesWrapper: `${PREFIX}-endpointTypesWrapper`,
    root: `${PREFIX}-root`,
    buttonSection: `${PREFIX}-buttonSection`,
    radioGroup: `${PREFIX}-radioGroup`,
    endpointValidityMessage: `${PREFIX}-endpointValidityMessage`,
    errorMessageContainer: `${PREFIX}-errorMessageContainer`,
    implSelectRadio: `${PREFIX}-implSelectRadio`,
    titleWrapper: `${PREFIX}-titleWrapper`,
    mainTitle: `${PREFIX}-mainTitle`,
    buttonIcon: `${PREFIX}-buttonIcon`,
};


const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.endpointTypesWrapper}`]: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        margin: '2px',
    },

    [`& .${classes.root}`]: {
        flexGrow: 1,
        paddingRight: '10px',
    },

    [`& .${classes.buttonSection}`]: {
        marginTop: theme.spacing(2),
    },

    [`& .${classes.radioGroup}`]: {
        display: 'flex',
        flexDirection: 'row',
        marginLeft: theme.spacing(2),
    },

    [`& .${classes.endpointValidityMessage}`]: {
        color: theme.palette.error.main,
    },

    [`& .${classes.errorMessageContainer}`]: {
        marginTop: theme.spacing(1),
    },

    [`& .${classes.implSelectRadio}`]: {
        padding: theme.spacing(1) / 2,
    },

    [`& .${classes.titleWrapper}`]: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing(2),
    },

    [`& .${classes.mainTitle}`]: {
        paddingLeft: 0,
    },

    [`& .${classes.buttonIcon}`]: {
        marginRight: theme.spacing(1),
    },
}));

const defaultSwagger = { paths: {} };

/**
 * The base component of the endpoints view.
 * @param {any} props The props passed to the layout
 * @returns {any} HTML representation.
 */
function Endpoints(props) {
    const {  intl, history, llmProviderEndpointConfiguration } = props;
    const { data: publisherSettings, isLoading } = usePublisherSettings();
    const { api, updateAPI } = useContext(APIContext);
    const { settings } = useAppContext();
    const [swagger, setSwagger] = useState(defaultSwagger);
    const [endpointValidity, setAPIEndpointsValid] = useState({ isValid: true, message: '' });
    const [isUpdating, setUpdating] = useState(false);
    const [sandBoxBackendList, setSandBoxBackendList] = useState([]);
    const [productionBackendList, setProductionBackendList] = useState([]);
    const [isValidSequenceBackend, setIsValidSequenceBackend] = useState(false);
    const [isCustomBackendSelected, setIsCustomBackendSelected] = useState(false);
    const [componentValidator, setComponentValidator] = useState([]);
    const [endpointSecurityTypes, setEndpointSecurityTypes] = useState([]);
    const isMCPServer = api.isMCPServer();

    useEffect(() => {
        if (!isLoading) {
            setComponentValidator(publisherSettings.gatewayFeatureCatalog
                .gatewayFeatures[api.gatewayType ? api.gatewayType : 'wso2/synapse'].endpoints);
            setEndpointSecurityTypes(publisherSettings.gatewayFeatureCatalog
                .gatewayFeatures[api.gatewayType ? api.gatewayType : 'wso2/synapse'].endpointSecurity);
        }
    }, [isLoading]);

    const apiReducer = (initState, configAction) => {
        const tmpEndpointConfig = cloneDeep(initState.endpointConfig);
        const { action, value } = configAction;
        switch (action) {
            case 'production_endpoints':
            case 'sandbox_endpoints': {
                if (value) {
                    return { ...initState, endpointConfig: { ...tmpEndpointConfig, [action]: value } };
                }
                delete tmpEndpointConfig[action];
                return { ...initState, endpointConfig: { ...tmpEndpointConfig } };
            }
            case 'select_endpoint_category': {
                return { ...initState, endpointConfig: { ...value } };
            }
            case 'set_lb_config': {
                return { ...initState, endpointConfig: { ...value } };
            }
            case 'add_endpoint': {
                return { ...initState, endpointConfig: { ...value } };
            }
            case 'set_advance_config': {
                return { ...initState, endpointConfig: { ...value } };
            }
            case 'remove_endpoint': {
                return { ...initState, endpointConfig: { ...value } };
            }
            case 'endpointImplementationType': { // set implementation status
                const { endpointType, implementationType } = value;
                const config = createEndpointConfig(endpointType);
                if (endpointType === 'prototyped') {
                    if (implementationType === 'mock') {
                        api.generateMockScripts(api.id).then((res) => { // generates mock/sample payloads
                            setSwagger(res.obj);
                        });
                        return { ...initState, endpointConfig: config, endpointImplementationType: 'INLINE' };
                    }
                    return { ...initState, endpointConfig: config, endpointImplementationType: 'ENDPOINT' };
                }
                return { ...initState, endpointConfig: config };
            }
            case 'endpointSecurity': { // set endpoint security
                const config = cloneDeep(initState.endpointConfig);
                const tmpSecurityInfo = cloneDeep(value);
                return { ...initState, endpointConfig:
                     { ...config, endpoint_security: { ...(config.endpoint_security || {}), ...tmpSecurityInfo } } };
            }
            case 'endpoint_type': { // set endpoint type
                const config = getEndpointTemplateByType(
                    value.category,
                    value.endpointType === 'address',
                    tmpEndpointConfig,
                );
                const endpointSecurity = cloneDeep(initState.endpointConfig.endpoint_security);
                return { ...initState, endpointConfig: { ...config, endpoint_security: endpointSecurity } };
            }
            case 'set_inline_or_mocked_oas': {
                const { endpointImplementationType, endpointConfig } = value;
                if (endpointImplementationType === 'INLINE') {
                    api.generateMockScripts(api.id).then((res) => { // generates mock/sample payloads
                        setSwagger(res.obj);
                    });
                }
                return { ...initState, endpointConfig, endpointImplementationType };
            }
            case 'set_prototyped': {
                const { endpointImplementationType, endpointConfig } = value;
                return {
                    ...initState,
                    endpointImplementationType,
                    endpointConfig,
                };
            }
            case 'set_awsCredentials': {
                return { ...initState, endpointConfig: { ...value } };
            }
            case 'select_endpoint_type': {
                const { endpointImplementationType, endpointConfig } = value;
                return {
                    ...initState,
                    endpointConfig,
                    endpointImplementationType,
                };
            }
            case 'set_service': {
                return {
                    ...initState,
                    serviceInfo: value
                };
            }
            case 'set_primary_production_endpoint': {
                return {
                    ...initState,
                    primaryProductionEndpointId: value
                };
            }
            case 'set_primary_sandbox_endpoint': {
                return {
                    ...initState,
                    primarySandboxEndpointId: value
                };
            }
            case 'reset':
                return value;
            default: {
                return initState;
            }
        }
    };
    const [apiObject, apiDispatcher] = useReducer(apiReducer, api.toJSON());

    useEffect(() => {
        apiDispatcher({ action: 'reset', value: api.toJSON() });
    }, [api.id]);

    /**
     * Method to update the api.
     *
     * @param {boolean} isRedirect Used for dynamic endpoints to redirect to the runtime config page.
     */
    const handleSave = (isRedirect) => {

        const { endpointConfig, endpointImplementationType, serviceInfo } = apiObject;
        if (endpointConfig.endpoint_type === 'service') {
            endpointConfig.endpoint_type = 'http';
        }
        setUpdating(true);
        if (endpointConfig.endpoint_type === 'sequence_backend') {
            if (productionBackendList?.length === 0 || (productionBackendList?.length > 0
                && productionBackendList[0].content)) {
                api.deleteSequenceBackend(API_SECURITY_KEY_TYPE_PRODUCTION, api.id).then(() => {
                    Alert.success('Production Sequence backend deleted successfully');
                })
                    .catch(() => {
                        Alert.error(intl.formatMessage({
                            id: 'Apis.Details.Endpoints.Endpoints.delete.sequence.backend.error',
                            defaultMessage: 'Error Deleting Production Sequence Backend',
                        }));
                    });
            }

            if (sandBoxBackendList?.length === 0 || (sandBoxBackendList?.length > 0 && sandBoxBackendList[0].content)) {
                api.deleteSequenceBackend(API_SECURITY_KEY_TYPE_SANDBOX, api.id).then(() => {
                    Alert.success('Sandbox Sequence backend deleted successfully');
                })
                    .catch(() => {
                        Alert.error(intl.formatMessage({
                            id: 'Apis.Details.Endpoints.Endpoints.delete.sequence.backend.error',
                            defaultMessage: 'Error Deleting Sandbox Sequence Backend',
                        }));
                    });
            }
            if (productionBackendList?.length > 0 && productionBackendList[0].content) {
                const productionBackend = productionBackendList[0];
                api.uploadCustomBackend(productionBackend.content, API_SECURITY_KEY_TYPE_PRODUCTION, api.id)
                    .then(() => {
                        Alert.success('Custom backend uploaded successfully');
                    })
                    .catch(() => {
                        Alert.error(intl.formatMessage({
                            id: 'Apis.Details.Endpoints.Endpoints.upload.sequence.backend.error',
                            defaultMessage: 'Error Uploading Production Sequence Backend',
                        }));
                    });
            }
            if (sandBoxBackendList?.length > 0 && sandBoxBackendList[0].content) {
                const sandBackend = sandBoxBackendList[0];
                api.uploadCustomBackend(sandBackend.content, API_SECURITY_KEY_TYPE_SANDBOX, api.id).then(() => {
                    Alert.success('Custom backend uploaded successfully');
                })
                    .catch(() => {
                        Alert.error(intl.formatMessage({
                            id: 'Apis.Details.Endpoints.Endpoints.upload.sequence.backend.error',
                            defaultMessage: 'Error Uploading Sandbox Sequence Backend',
                        }));
                    });
            }
        }
        if (endpointImplementationType === 'INLINE' || endpointImplementationType === 'MOCKED_OAS') {
            api.updateSwagger(swagger).then((resp) => {
                setSwagger(resp.obj);
            }).then(() => {
                updateAPI({ endpointConfig, endpointImplementationType, serviceInfo })
                    .catch((error) => {
                        if (error.response) {
                            Alert.error(error.response.body.description);
                        } else {
                            Alert.error('Error occurred while updating endpoint configurations');
                        }
                    });
            }).finally(() => {
                setUpdating(false);
                if (isRedirect) {
                    history.push('/apis/' + api.id + '/policies');
                }
            });
        } else {
            const apiObjectCopy = cloneDeep(apiObject);
            if (apiObjectCopy.endpointConfig.endpoint_type === 'service') {
                apiObjectCopy.endpointConfig.endpoint_type = 'http';
            }
            updateAPI(apiObjectCopy)
                .catch((error) => {
                    if (error.response) {
                        Alert.error(error.response.body.description);
                    } else {
                        Alert.error('Error occurred while updating endpoint configurations');
                    }
                })
                .finally(() => {
                    setUpdating(false);
                    if (isRedirect) {
                        history.push('/apis/' + api.id + '/policies');
                    }
                });
        }
    };

    const handleSaveAndDeploy = () => {
        const { endpointConfig, endpointImplementationType, endpointSecurity, serviceInfo } = apiObject;
        if (endpointConfig.endpoint_type === 'service') {
            endpointConfig.endpoint_type = 'http';
        }
        setUpdating(true);
        if (endpointConfig.endpoint_type === 'sequence_backend') {
            if (productionBackendList?.length === 0
                || (productionBackendList?.length > 0 && productionBackendList[0].content)) {
                api.deleteSequenceBackend(API_SECURITY_KEY_TYPE_PRODUCTION, api.id)
                    .then(() => {
                        Alert.success('Production Sequence backend deleted successfully');
                    })
                    .catch(() => {
                        Alert.error(intl.formatMessage({
                            id: 'Apis.Details.Endpoints.Endpoints.delete.sequence.backend.error',
                            defaultMessage: 'Error Deleting Production Sequence Backend',
                        }));
                    });
            }

            if (sandBoxBackendList?.length === 0
                || (sandBoxBackendList?.length > 0 && sandBoxBackendList[0].content)) {
                api.deleteSequenceBackend(API_SECURITY_KEY_TYPE_SANDBOX, api.id)
                    .then(() => {
                        Alert.success('Sandbox Sequence backend deleted successfully');
                    })
                    .catch(() => {
                        Alert.error(intl.formatMessage({
                            id: 'Apis.Details.Endpoints.Endpoints.delete.sequence.backend.error',
                            defaultMessage: 'Error Deleting Sandbox Sequence Backend',
                        }));
                    });
            }
            if (productionBackendList?.length > 0 && productionBackendList[0].content) {
                const productionBackend = productionBackendList[0];
                api.uploadCustomBackend(productionBackend.content, API_SECURITY_KEY_TYPE_PRODUCTION, api.id)
                    .then(() => {
                        Alert.success('Custom backend uploaded successfully');
                    })
                    .catch(() => {
                        Alert.error(intl.formatMessage({
                            id: 'Apis.Details.Endpoints.Endpoints.upload.sequence.backend.error',
                            defaultMessage: 'Error Uploading Production Sequence Backend',
                        }));
                    });
            }
            if (sandBoxBackendList?.length > 0 && sandBoxBackendList[0].content) {
                const sandBackend = sandBoxBackendList[0];
                api.uploadCustomBackend(sandBackend.content, API_SECURITY_KEY_TYPE_SANDBOX, api.id)
                    .then(() => {
                        Alert.success('Custom backend uploaded successfully');
                    })
                    .catch(() => {
                        Alert.error(intl.formatMessage({
                            id: 'Apis.Details.Endpoints.Endpoints.upload.sequence.backend.error',
                            defaultMessage: 'Error Uploading Sandbox Sequence Backend',
                        }));
                    });
            }
        }
        if (endpointImplementationType === 'INLINE' || endpointImplementationType === 'MOCKED_OAS') {
            api.updateSwagger(swagger).then((resp) => {
                setSwagger(resp.obj);
            }).then(() => {
                updateAPI({ endpointConfig, endpointImplementationType, endpointSecurity, serviceInfo })
                    .catch((error) => {
                        if (error.response) {
                            Alert.error(error.response.body.description);
                        } else {
                            Alert.error('Error occurred while updating endpoint configurations');
                        }
                    }); 
            }).finally(() => history.push({
                pathname: api.isAPIProduct() ? `/api-products/${api.id}/deployments`
                    : `/apis/${api.id}/deployments`,
                state: 'deploy',
            }));
        } else {
            const apiObjectCopy = cloneDeep(apiObject);
            if (apiObjectCopy.endpointConfig.endpoint_type === 'service') {
                apiObjectCopy.endpointConfig.endpoint_type = 'http';
            }
            updateAPI(apiObjectCopy)
                .catch((error) => {
                    if (error.response) {
                        Alert.error(error.response.body.description);
                    } else {
                        Alert.error('Error occurred while updating endpoint configurations');
                    }
                })
                .finally(() => history.push({
                    pathname: api.isAPIProduct() ? `/api-products/${api.id}/deployments`
                        : `/apis/${api.id}/deployments`,
                    state: 'deploy',
                }));
        }
    };

    /**
     * Validate the provided endpoint config object.
     *
     * @param {any} endpointConfig The provided endpoint config for validation.
     * @param {string} implementationType The api implementation type (INLINE/ENDPOINT/MOCKED_OAS)
     * @return {{isValid: boolean, message: string}} The endpoint validity information.
     * */
    const validate = (implementationType) => {
        const { endpointConfig } = apiObject;
        if (endpointConfig && endpointConfig.endpoint_security) {
            const { production, sandbox } = endpointConfig.endpoint_security;
            if (production && production.enabled) {
                if (production.type === 'OAUTH') {
                    if (production.grantType === 'PASSWORD') {
                        if (production.tokenUrl === null
                            || production.tokenUrl === ''
                            || production.clientId === null
                            || production.clientSecret === null
                            || production.username === null
                            || production.username === ''
                            || production.password === null) {
                            return {
                                isValid: false,
                                message: intl.formatMessage({
                                    id: 'Apis.Details.Endpoints.Endpoints.missing.security.oauth.password.error',
                                    defaultMessage: 'Endpoint Security Token URL'
                                            + '/API Key/API Secret/Username/Password should not be empty',
                                }),
                            };
                        }
                    } else if (production.grantType === 'CLIENT_CREDENTIALS') {
                        if (production.tokenUrl === null
                            || production.tokenUrl === ''
                            || production.clientId === null
                            || production.clientSecret === null) {
                            return {
                                isValid: false,
                                message: intl.formatMessage({
                                    id: 'Apis.Details.Endpoints.Endpoints.missing.security.oauth.client.error',
                                    defaultMessage: 'Endpoint Security Token URL'
                                        + '/API Key/API Secret should not be empty',
                                }),
                            };
                        }
                    }
                } else if (production.type === 'apikey') {
                    if (production.apiKeyValue === null && endpointConfig.production_endpoints) {
                        return {
                            isValid: false,
                            message: intl.formatMessage({
                                id: 'Apis.Details.Endpoints.Endpoints.missing.security.apikey.error',
                                defaultMessage: 'Endpoint Security API Key should not be empty',
                            }),
                        };
                    }
                } else if (production.username === '' || production.password === null) {
                    return {
                        isValid: false,
                        message: intl.formatMessage({
                            id: 'Apis.Details.Endpoints.Endpoints.missing.security.username.error',
                            defaultMessage: 'Endpoint Security User Name/ Password should not be empty',
                        }),
                    };
                }
            }
            if (sandbox && sandbox.enabled) {
                if (sandbox.type === 'OAUTH') {
                    if (sandbox.grantType === 'PASSWORD') {
                        if (sandbox.tokenUrl === null
                            || sandbox.tokenUrl === ''
                            || sandbox.clientId === null
                            || sandbox.clientSecret === null
                            || sandbox.username === null
                            || sandbox.username === ''
                            || sandbox.password === null) {
                            return {
                                isValid: false,
                                message: intl.formatMessage({
                                    id: 'Apis.Details.Endpoints.Endpoints.missing.security.oauth.password.error',
                                    defaultMessage: 'Endpoint Security Token URL'
                                            + '/API Key/API Secret/Username/Password should not be empty',
                                }),
                            };
                        }
                    } else if (sandbox.grantType === 'CLIENT_CREDENTIALS') {
                        if (sandbox.tokenUrl === null
                            || sandbox.tokenUrl === ''
                            || sandbox.clientId === null
                            || sandbox.clientSecret === null) {
                            return {
                                isValid: false,
                                message: intl.formatMessage({
                                    id: 'Apis.Details.Endpoints.Endpoints.missing.security.oauth.client.error',
                                    defaultMessage: 'Endpoint Security Token URL'
                                            + '/API Key/API Secret should not be empty',
                                }),
                            };
                        }
                    }
                } else if (sandbox.type === 'apikey') {
                    if (sandbox.apiKeyValue === null && endpointConfig.sandbox_endpoints) {
                        return {
                            isValid: false,
                            message: intl.formatMessage({
                                id: 'Apis.Details.Endpoints.Endpoints.missing.security.apikey.error',
                                defaultMessage: 'Endpoint Security API Key should not be empty',
                            }),
                        };
                    }
                } else if (sandbox.username === '' || sandbox.password === null) {
                    return {
                        isValid: false,
                        message: intl.formatMessage({
                            id: 'Apis.Details.Endpoints.Endpoints.missing.security.username.error',
                            defaultMessage: 'Endpoint Security User Name/ Password should not be empty',
                        }),
                    };
                }
            }
        } else if ((!endpointConfig || !endpointConfig.endpoint_security)
            && apiObject.subtypeConfiguration?.subtype === 'AIAPI'
            && (llmProviderEndpointConfiguration?.authenticationConfiguration)
            && (llmProviderEndpointConfiguration?.authenticationConfiguration?.enabled)) {
            return {
                isValid: false,
                message: intl.formatMessage({
                    id: 'Apis.Details.Endpoints.Endpoints.missing.endpoint.ai.error',
                    defaultMessage: 'Production & Sandbox Endpoint Security should be added',
                }),
            };
        }
        if (endpointConfig === undefined || endpointConfig === null) {
            return { isValid: true, message: '' };
        }
        const endpointType = endpointConfig.endpoint_type;
        if (endpointType === 'awslambda') {
            if (endpointConfig.access_method === 'stored') {
                if (endpointConfig.amznAccessKey === '' || endpointConfig.amznSecretKey === ''
                || endpointConfig.amznRegion === '') {
                    return {
                        isValid: false,
                        message: intl.formatMessage({
                            id: 'Apis.Details.Endpoints.Endpoints.missing.accessKey.secretKey.error',
                            defaultMessage: 'Access Key, Secret Key and Region should not be empty',
                        }),
                    };
                } else if (endpointConfig.amznAccessKey !== '' && endpointConfig.amznSecretKey === 'AWS_SECRET_KEY') {
                    return {
                        isValid: false,
                        message: '',
                    };
                }
            }
            if (endpointConfig.assume_role && !(endpointConfig.amznRoleArn !== '' 
            && endpointConfig.amznRoleSessionName !== '' && endpointConfig.amznRoleRegion !== '')) {
                return {
                    isValid: false,
                    message: intl.formatMessage({
                        id: 'Apis.Details.Endpoints.Endpoints.missing.stsAssumeRole.config',
                        defaultMessage: 'Role ARN, Role Session Name and Region should not be empty',
                    }),
                }
            }
        } else if (endpointType === 'sequence_backend') {
            return  {
                isValid: true,
                message: intl.formatMessage({
                    id: 'Apis.Details.Endpoints.Endpoints.missing.endpoint.error',
                    defaultMessage: 'Either one of Production or Sandbox Endpoints should be added.',
                }),
            };
        } else if (endpointType === 'load_balance') {
            /**
             * Checklist:
             *  production/ sandbox endpoints should be an array.
             *  production/ sandbox endpoint [0] must be present.
             * */
            if (endpointConfig.production_endpoints && endpointConfig.production_endpoints.length > 0) {
                if (!endpointConfig.production_endpoints[0].url
                    || (endpointConfig.production_endpoints[0].url
                        && endpointConfig.production_endpoints[0].url === '')) {
                    return {
                        isValid: false,
                        message: intl.formatMessage({
                            id: 'Apis.Details.Endpoints.Endpoints.missing.prod.endpoint.loadbalance',
                            defaultMessage: 'Default Production Endpoint should not be empty',
                        }),
                    };
                }
            }
            if (endpointConfig.sandbox_endpoints && endpointConfig.sandbox_endpoints.length > 0) {
                if (!endpointConfig.sandbox_endpoints[0].url
                    || (endpointConfig.sandbox_endpoints[0].url && endpointConfig.sandbox_endpoints[0].url === '')) {
                    return {
                        isValid: false,
                        message: intl.formatMessage({
                            id: 'Apis.Details.Endpoints.Endpoints.missing.sandbox.endpoint.loadbalance',
                            defaultMessage: 'Default Sandbox Endpoint should not be empty',
                        }),
                    };
                }
            }
        } else {
            let isValidEndpoint = false;
            if (endpointConfig.implementation_status === 'prototyped' && api.lifeCycleStatus === 'PROTOTYPED') {
                if (implementationType === 'ENDPOINT') {
                    if (endpointConfig.production_endpoints && endpointConfig.production_endpoints.url === '') {
                        return {
                            isValid: false,
                            message: intl.formatMessage({
                                id: 'Apis.Details.Endpoints.Endpoints.missing.prototype.url',
                                defaultMessage: 'Prototype Endpoint URL should not be empty',
                            }),
                        };
                    }
                }
                isValidEndpoint = true;
            } else if (endpointConfig.production_endpoints && !endpointConfig.sandbox_endpoints) {
                isValidEndpoint = endpointConfig.production_endpoints.url !== '';
            } else if (endpointConfig.sandbox_endpoints && !endpointConfig.production_endpoints) {
                isValidEndpoint = endpointConfig.sandbox_endpoints.url !== '';
            } else if (!endpointConfig.sandbox_endpoints && !endpointConfig.production_endpoints) {
                isValidEndpoint = false;
            } else {
                isValidEndpoint = endpointConfig.sandbox_endpoints.url !== ''
                        || endpointConfig.production_endpoints.url !== '';
            }
            if (endpointConfig.sandbox_endpoints) {
                isValidEndpoint &&= endpointConfig.sandbox_endpoints.url !== '';
            }
            if (endpointConfig.production_endpoints) {
                isValidEndpoint &&= endpointConfig.production_endpoints.url !== '';
            }
            return !isValidEndpoint ? {
                isValid: false,
                message: intl.formatMessage({
                    id: 'Apis.Details.Endpoints.Endpoints.missing.endpoint.error',
                    defaultMessage: 'Either one of Production or Sandbox Endpoints should be added.',
                }),
            } : { isValid: true, message: '' };
        }
        return {
            isValid: true,
            message: '',
        };
    };

    useEffect(() => {
        if (!['WS', 'SSE'].includes(api.type) && !api.isMCPServer()) {
            api.getSwagger(apiObject.id).then((resp) => {
                setSwagger(resp.obj);
            }).catch((err) => {
                if (err.response) {
                    Alert.error(err.response.body.description);
                } else {
                    Alert.error(intl.formatMessage({
                        id: 'Apis.Details.Endpoints.API.Definition.fetch.error',
                        defaultMessage: 'Error occurred while fetching API definition',
                    }));
                }
            });
        }
    }, []);

    useEffect(() => {
        setIsCustomBackendSelected(false);
        setIsValidSequenceBackend(true);
        setAPIEndpointsValid(validate(apiObject.endpointImplementationType));
    }, [apiObject]);

    const saveAndRedirect = () => {
        handleSave(true);
    };
    /**
     * Method to update the swagger object.
     *
     * @param {any} swaggerObj The updated swagger object.
     * */
    const changeSwagger = (swaggerObj) => {
        setSwagger(swaggerObj);
    };

    /**
     * Generate endpoint configuration based on the selected endpoint type and set to the api object.
     *
     * @param {string} endpointType The endpoint type.
     * @param {string} implementationType The endpoint implementationType. (Required only for prototype endpoints)
     * */
    const generateEndpointConfig = (endpointType, implementationType) => {
        apiDispatcher({ action: 'endpointImplementationType', value: { endpointType, implementationType } });
    };

    if (isLoading) {
        return <Progress per={80} message='Loading app settings ...' />;
    }

    return (
        (<Root>
            {/* Since the api is set to the state in component did mount, check both the api and the apiObject. */}
            {(api.endpointConfig === null && apiObject.endpointConfig === null && !isMCPServer) ?
                <NewEndpointCreate generateEndpointConfig={generateEndpointConfig} apiType={apiObject.type}
                    componentValidator={componentValidator}
                />
                : (
                    <div className={classes.root}>
                        <div className={classes.titleWrapper}>
                            <Typography
                                id='itest-api-details-endpoints-head'
                                variant='h4'
                                component='h2'
                                align='left'
                                className={classes.mainTitle}
                            >
                                <FormattedMessage
                                    id='Apis.Details.Endpoints.Endpoints.endpoints.header'
                                    defaultMessage='Endpoints'
                                />
                            </Typography>
                            {api.subtypeConfiguration?.subtype === 'AIAPI' && (
                                <Button
                                    variant='outlined'
                                    color='primary'
                                    size='small'
                                    disabled={isRestricted(['apim:api_create'], api)}
                                    onClick={() => {
                                        history.push(`${getBasePath(api.apiType)}${api.id}/endpoints/create`);
                                    }}
                                    style={{ marginLeft: '1em' }}
                                >
                                    <AddCircle className={classes.buttonIcon} />
                                    <FormattedMessage
                                        id='Apis.Details.Endpoints.add.new.endpoint'
                                        defaultMessage='Add New Endpoint'
                                    />
                                </Button>
                            )}
                        </div>
                        {((api.subtypeConfiguration?.subtype === 'AIAPI') && (
                            <AIEndpoints
                                swaggerDef={swagger}
                                updateSwagger={changeSwagger}
                                apiObject={apiObject}
                                onChangeAPI={apiDispatcher}
                                endpointsDispatcher={apiDispatcher}
                                saveAndRedirect={saveAndRedirect}
                                llmProviderEndpointConfiguration={llmProviderEndpointConfiguration}
                            />
                        ))}
                        {isMCPServer && (
                            <MCPServerEndpoints
                                apiObject={apiObject}
                                history={history}
                            />
                        )}
                        {(api.subtypeConfiguration?.subtype !== 'AIAPI' && !isMCPServer) && (
                            <div>
                                <Grid container>
                                    <Grid item xs={12} className={classes.endpointsContainer}>
                                        <EndpointOverview
                                            swaggerDef={swagger}
                                            updateSwagger={changeSwagger}
                                            api={apiObject}
                                            onChangeAPI={apiDispatcher}
                                            endpointsDispatcher={apiDispatcher}
                                            saveAndRedirect={saveAndRedirect}
                                            sandBoxBackendList={sandBoxBackendList}
                                            setSandBoxBackendList={setSandBoxBackendList}
                                            productionBackendList={productionBackendList}
                                            setProductionBackendList={setProductionBackendList}
                                            isValidSequenceBackend={isValidSequenceBackend}
                                            setIsValidSequenceBackend={setIsValidSequenceBackend}
                                            isCustomBackendSelected={isCustomBackendSelected}
                                            setIsCustomBackendSelected={setIsCustomBackendSelected}
                                            componentValidator={componentValidator}
                                            endpointSecurityTypes={endpointSecurityTypes}
                                        />
                                    </Grid>
                                </Grid>
                                {
                                    endpointValidity.isValid
                                        ? <div />
                                        : (
                                            <Grid item className={classes.errorMessageContainer}>
                                                <Typography className={classes.endpointValidityMessage}>
                                                    {endpointValidity.message}
                                                </Typography>
                                            </Grid>
                                        )
                                }
                                <Grid
                                    container
                                    direction='row'
                                    alignItems='flex-start'
                                    spacing={1}
                                    className={classes.buttonSection}
                                >
                                    <Grid item>
                                        {api.isRevision || !endpointValidity.isValid
                                            || (settings && settings.portalConfigurationOnlyModeEnabled)
                                            || isRestricted(['apim:api_create'], api) ? (
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
                                                    id='endpoint-save-btn'
                                                    isValidSequenceBackend={isValidSequenceBackend}
                                                    isCustomBackendSelected
                                                />
                                            )}
                                    </Grid>
                                    <Grid item>
                                        <Button
                                            component={Link}
                                            to={getBasePath(api.apiType) + api.id + '/overview'}
                                        >
                                            <FormattedMessage
                                                id='Apis.Details.Endpoints.Endpoints.cancel'
                                                defaultMessage='Cancel'
                                            />
                                        </Button>
                                    </Grid>
                                </Grid>
                            </div>
                        )}
                    </div>
                )}
        </Root>)
    );
}

Endpoints.propTypes = {
    classes: PropTypes.shape({
        root: PropTypes.shape({}),
        buttonSection: PropTypes.shape({}),
        endpointTypesWrapper: PropTypes.shape({}),
        mainTitle: PropTypes.shape({}),
    }).isRequired,
    api: PropTypes.shape({}).isRequired,
    intl: PropTypes.shape({}).isRequired,
    history: PropTypes.shape({}).isRequired,
    llmProviderEndpointConfiguration: PropTypes.shape({
        authenticationConfiguration: PropTypes.shape({
            enabled: PropTypes.bool,
            type: PropTypes.string,
            parameters: PropTypes.shape({}),
        }),
    }).isRequired,
};

export default withRouter(injectIntl((Endpoints)));
