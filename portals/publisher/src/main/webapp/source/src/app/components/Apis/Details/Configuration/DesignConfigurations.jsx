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
    useReducer,
    useContext,
    useState,
    useMemo,
    useEffect,
} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import { Link } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import { FormattedMessage } from 'react-intl';
import CircularProgress from '@material-ui/core/CircularProgress';
import CONSTS from 'AppData/Constants';
import Alert from 'AppComponents/Shared/Alert';

import { APIContext } from 'AppComponents/Apis/Details/components/ApiContext';
import UpdateWithoutDetails from 'AppComponents/Apis/Details/Configuration/components/UpdateWithoutDetails';
import ThumbnailView from 'AppComponents/Apis/Listing/components/ImageGenerator/ThumbnailView';
import { isRestricted } from 'AppData/AuthManager';
import API from 'AppData/api.js';
import APIProduct from 'AppData/APIProduct';
import DefaultVersion from './components/DefaultVersion';
import DescriptionEditor from './components/DescriptionEditor';
import AccessControl from './components/AccessControl';
import AdvertiseInfo from './components/AdvertiseInfo';
import StoreVisibility from './components/StoreVisibility';
import Tags from './components/Tags';
import Social from './components/Social';
import APICategories from './components/APICategories';

const useStyles = makeStyles((theme) => ({
    root: {
        padding: theme.spacing(3, 2),
    },
    titleWrapper: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing(3),
    },
    mainTitle: {
        paddingLeft: 0,
    },
    paper: {
        padding: theme.spacing(3),
    },
    paperCenter: {
        padding: theme.spacing(3),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    heading: {
        fontSize: '1.1rem',
        fontWeight: 400,
        marginBottom: theme.spacing(0),
    },
    itemPadding: {
        marginBottom: theme.spacing(3),
    },
    arrowForwardIcon: {
        fontSize: 50,
        color: '#ccc',
        position: 'absolute',
        top: 90,
        right: -43,
    },
    arrowBackIcon: {
        fontSize: 50,
        color: '#ccc',
        position: 'absolute',
        top: 30,
        right: -71,
    },
    expansionPanel: {
        marginBottom: theme.spacing(1),
    },
    expansionPanelDetails: {
        flexDirection: 'column',
    },
    subHeading: {
        fontSize: '1rem',
        fontWeight: 400,
        margin: 0,
        display: 'inline-flex',
        lineHeight: '38px',
    },
    btnSpacing: {
        marginRight: theme.spacing(1),
    },
    tierList: {
        marginLeft: theme.spacing(1),
        fontFamily: theme.typography.fontFamily,
    },
    dialogTitle: {
        margin: 0,
        padding: theme.spacing(2),
    },
    closeButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.grey[500],
    },
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
    const copiedConfig = {
        id: api.id,
        name: api.name,
        description: api.description,
        lifeCycleStatus: api.lifeCycleStatus,
        accessControl: api.accessControl,
        authorizationHeader: api.authorizationHeader,
        responseCachingEnabled: api.responseCachingEnabled,
        cacheTimeout: api.cacheTimeout,
        visibility: api.visibility,
        isDefaultVersion: api.isDefaultVersion,
        enableSchemaValidation: api.enableSchemaValidation,
        accessControlRoles: [...api.accessControlRoles],
        visibleRoles: [...api.visibleRoles],
        tags: [...api.tags],
        maxTps: api.maxTps,
        transport: [...api.transport],
        wsdlUrl: api.wsdlUrl,
        securityScheme: [...api.securityScheme],
        categories: [...api.categories],
        corsConfiguration: {
            corsConfigurationEnabled: api.corsConfiguration.corsConfigurationEnabled,
            accessControlAllowCredentials: api.corsConfiguration.accessControlAllowCredentials,
            accessControlAllowOrigins: [...api.corsConfiguration.accessControlAllowOrigins],
            accessControlAllowHeaders: [...api.corsConfiguration.accessControlAllowHeaders],
            accessControlAllowMethods: [...api.corsConfiguration.accessControlAllowMethods],
        },
        additionalProperties: [...api.additionalProperties],
        type: api.type,
        policies: [...api.policies],
        endpointConfig: api.endpointConfig,
    };
    if (api.advertiseInfo) {
        copiedConfig.advertiseInfo = {
            advertised: api.advertiseInfo.advertised,
            apiExternalProductionEndpoint: api.advertiseInfo.apiExternalProductionEndpoint,
            apiExternalSandboxEndpoint: api.advertiseInfo.apiExternalSandboxEndpoint,
            originalDevPortalUrl: api.advertiseInfo.originalDevPortalUrl,
            apiOwner: api.advertiseInfo.apiOwner,
            vendor: api.advertiseInfo.vendor,
        }
    }
    return copiedConfig;
}

/**
     *
     * Reduce the configuration UI related actions in to updated state
     * @param {*} state current state
     * @param {*} configAction dispatched configuration action
     * @returns {Object} updated state
     */
function configReducer(state, configAction) {
    const { action, value } = configAction;
    const nextState = copyAPIConfig(state);
    switch (action) {
        case 'description':
        case 'isDefaultVersion':
        case 'authorizationHeader':
        case 'responseCachingEnabled':
        case 'cacheTimeout':
        case 'enableSchemaValidation':
        case 'visibility':
        case 'maxTps':
        case 'categories':
        case 'tags':
            nextState[action] = value;
            return nextState;
        case 'accessControl':
            nextState[action] = value;
            if (value === 'NONE') {
                nextState.accessControlRoles = [];
            }
            return nextState;
        case 'accessControlRoles':
            return { ...copyAPIConfig(state), [action]: value };
        case 'visibleRoles':
            return { ...copyAPIConfig(state), [action]: value };
        case 'github_repo':
        case 'slack_url': {
            const targetProperty = nextState.additionalProperties.find((property) => property.name === action);
            const updatedProperty = {
                name: action,
                value,
                display: true,
            };
            if (targetProperty) {
                nextState.additionalProperties = [
                    ...nextState.additionalProperties.filter((property) => property.name !== action), updatedProperty];
            } else {
                nextState.additionalProperties.push(updatedProperty);
            }
            return nextState;
        }
        case 'advertised':
        case 'apiExternalProductionEndpoint':
        case 'apiExternalSandboxEndpoint':
        case 'originalDevPortalUrl':
            if (nextState.advertiseInfo) {
                nextState.advertiseInfo[action] = value;
            }
            return nextState;
        case 'endpointConfig':
            return { ...state, [action]: value };
        case 'policies':
            return { ...state, [action]: value };
        default:
            return state;
    }
}
/**
 * This component handles the basic configurations UI in the API details page
 *
 * @export
 * @param {*} props
 * @returns
 */
export default function DesignConfigurations() {
    const { api, updateAPI } = useContext(APIContext);
    const [isUpdating, setIsUpdating] = useState(false);
    const [errorInAccessRoles, setErrorInAccessRoles] = useState(false);
    const [errorInRoleVisibility, setErrorInRoleVisibility] = useState(false);
    const [errorInTags, setErrorInTags] = useState(false);
    const [errorInExternalEndpoints, setErrorInExternalEndpoints] = useState(false);
    const [apiConfig, configDispatcher] = useReducer(configReducer, copyAPIConfig(api));
    const classes = useStyles();
    const [descriptionType, setDescriptionType] = useState('');
    const [overview, setOverview] = useState('');
    const [overviewDocument, setOverviewDocument] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [slackURLProperty, githubURLProperty] = useMemo(() => [
        apiConfig.additionalProperties.find((prop) => prop.name === 'slack_url'),
        apiConfig.additionalProperties.find((prop) => prop.name === 'github_repo'),
    ],
    [apiConfig.additionalProperties]);
    const invalidTagsExist = apiConfig.tags.find((tag) => {
        return (/([~!@#;%^&*+=|\\<>"'/,])/.test(tag)) || (tag.length > 30);
    });
    const handleChange = (event) => {
        const type = event.target.value;
        if (type === CONSTS.DESCRIPTION_TYPES.DESCRIPTION) {
            if (apiConfig.description === null) {
                configDispatcher({ action: CONSTS.DESCRIPTION_TYPES.DESCRIPTION, value: overview });
            }
        } else if (type === CONSTS.DESCRIPTION_TYPES.OVERVIEW) {
            if (overviewDocument === null) {
                setOverview(apiConfig.description);
            }
        }
        setDescriptionType(type);
    };
    const updateContent = (content) => {
        if (descriptionType === CONSTS.DESCRIPTION_TYPES.DESCRIPTION) {
            configDispatcher({ action: CONSTS.DESCRIPTION_TYPES.DESCRIPTION, value: content });
        } else if (descriptionType === CONSTS.DESCRIPTION_TYPES.OVERVIEW) {
            configDispatcher({ action: CONSTS.DESCRIPTION_TYPES.DESCRIPTION, value: null });
            setOverview(content);
        }
    };
    const loadContentForDoc = (documentId) => {
        const { apiType } = api.apiType;
        const restApi = apiType === API.CONSTS.APIProduct ? new APIProduct() : new API();
        const docPromise = restApi.getInlineContentOfDocument(api.id, documentId);
        docPromise
            .then((doc) => {
                const { text } = doc;
                setOverview(text);
            });
    };
    const addDocument = async () => {
        const { apiType } = api.apiType;
        const restApi = apiType === API.CONSTS.APIProduct ? new APIProduct() : new API();
        const docPromise = await restApi.addDocument(api.id, {
            name: 'overview',
            type: 'OTHER',
            summary: 'overview',
            sourceType: 'MARKDOWN',
            visibility: 'API_LEVEL',
            sourceUrl: '',
            otherTypeName: CONSTS.DESCRIPTION_TYPES.OVERVIEW,
            inlineContent: '',
        }).then((response) => {
            return response.body;
        }).catch((error) => {
            if (process.env.NODE_ENV !== 'production') {
                console.log(error);
            }
        });
        return docPromise;
    };

    const addDocumentContent = (document) => {
        const { apiType } = api.apiType;
        const restApi = apiType === API.CONSTS.APIProduct ? new APIProduct() : new API();
        const docPromise = restApi.addInlineContentToDocument(api.id, document.documentId, 'MARKDOWN', overview);
        docPromise
            .catch((error) => {
                if (process.env.NODE_ENV !== 'production') {
                    console.log(error);
                }
                const { status } = error;
                if (status === 404) {
                    console.log(error);
                }
            });
    };

    const deleteOverviewDocument = () => {
        const { apiType } = api.apiType;
        const restApi = apiType === API.CONSTS.APIProduct ? new APIProduct() : new API();
        const docPromise = restApi.deleteDocument(api.id, overviewDocument.documentId);
        docPromise
            .catch((error) => {
                if (process.env.NODE_ENV !== 'production') {
                    console.log(error);
                }
            });
    };

    useEffect(() => {
        const { apiType } = api.apiType;
        const restApi = apiType === API.CONSTS.APIProduct ? new APIProduct() : new API();
        const promisedApi = restApi.getDocuments(api.id);
        promisedApi
            .then((response) => {
                const overviewDoc = response.body.list.filter((item) => item.otherTypeName === '_overview');
                if (overviewDoc.length > 0) {
                    const doc = overviewDoc[0];
                    setOverviewDocument(doc);
                    loadContentForDoc(doc.documentId);
                    setDescriptionType(CONSTS.DESCRIPTION_TYPES.OVERVIEW); // Only one doc we can render
                } else {
                    setDescriptionType(CONSTS.DESCRIPTION_TYPES.DESCRIPTION);
                }
            })
            .catch((error) => {
                if (process.env.NODE_ENV !== 'production') {
                    console.log(error);
                }
                const { status } = error;
                if (status === 404) {
                    Alert.error('Error occurred');
                }
            });
    }, []);

    /**
     *
     * Handle the configuration view save button action
     */
    async function handleSave() {
        setIsUpdating(true);
        updateAPI(apiConfig)
            .catch((error) => {
                if (error.response) {
                    Alert.error(error.response.body.description);
                }
            });
        if (descriptionType === CONSTS.DESCRIPTION_TYPES.DESCRIPTION) {
            if (overviewDocument) {
                deleteOverviewDocument();
            }
        }

        if (descriptionType === CONSTS.DESCRIPTION_TYPES.OVERVIEW) {
            let document = overviewDocument;
            if (document === null) {
                document = await addDocument();
            }
            addDocumentContent(document);
        }
        setIsUpdating(false);
    }

    const handleClick = (availableTiers, endpointUrl, endpointType) => {
        configDispatcher({ action: 'policies', value: availableTiers });
        // create endpoint config
        let updatedEndpointConfig;
        if (apiConfig.endpointConfig) {
            updatedEndpointConfig = { ...apiConfig.endpointConfig };
            if (endpointType === 'PRODUCTION') {
                updatedEndpointConfig = {
                    ...apiConfig.endpointConfig,
                    production_endpoints: { url: endpointUrl, ...apiConfig.endpointConfig.production_endpoints },
                };
            } else {
                updatedEndpointConfig = {
                    ...apiConfig.endpointConfig,
                    sandbox_endpoints: { url: endpointUrl, ...apiConfig.endpointConfig.sandbox_endpoints },
                };
            }
        } else {
            let endpointTypeForApi = 'http';
            if (apiConfig.type === 'WS') {
                endpointTypeForApi = 'ws';
            }
            updatedEndpointConfig = {
                endpoint_type: endpointTypeForApi,
            };
            if (endpointType === 'PRODUCTION') {
                updatedEndpointConfig.production_endpoints = {
                    url: endpointUrl,
                };
            } else {
                updatedEndpointConfig.sandbox_endpoints = {
                    url: endpointUrl,
                };
            }
        }
        if (api.type !== 'WEBSUB') {
            configDispatcher({ action: 'endpointConfig', value: updatedEndpointConfig });
        }
        setIsOpen(false);
    };

    const handleClose = () => {
        configDispatcher({ action: 'advertised', value: api.advertiseInfo.advertised });
        setIsOpen(false);
    };
    const restricted = isRestricted(['apim:api_publish', 'apim:api_create'], api
    || isUpdating || api.isRevision || invalidTagsExist
    || (apiConfig.visibility === 'RESTRICTED'
    && apiConfig.visibleRoles.length === 0));

    return (
        <>
            <Container maxWidth='md'>
                <Grid container spacing={2}>
                    <Grid item md={12}>
                        <Typography id='itest-api-details-design-config-head' variant='h5' component='h2'>
                            <FormattedMessage
                                id='Apis.Details.Configuration.Configuration.Design.topic.header'
                                defaultMessage='Design Configurations'
                            />
                        </Typography>
                        <Box color='text.secondary'>
                            {api.apiType === API.CONSTS.APIProduct
                                ? (
                                    <Typography variant='caption'>
                                        <FormattedMessage
                                            id='Apis.Details.Configuration.Configuration.Design.APIProduct.sub.heading'
                                            defaultMessage='Configure basic API Product meta information'
                                        />
                                    </Typography>
                                )
                                : (
                                    <Typography variant='caption'>
                                        <FormattedMessage
                                            id='Apis.Details.Configuration.Configuration.Design.sub.heading'
                                            defaultMessage='Configure basic API meta information'
                                        />
                                    </Typography>
                                )}
                        </Box>
                    </Grid>
                    <Grid item md={12}>
                        <Paper elevation={0}>
                            <div>
                                <Box px={8} py={5}>
                                    <Box py={1}>
                                        <Grid container spacing={0}>
                                            <Grid item xs={12} md={2} id='edit-api-thumbnail-btn'>
                                                <ThumbnailView
                                                    api={api}
                                                    width={100}
                                                    height={100}
                                                    updateAPI={updateAPI}
                                                    isEditable={!isRestricted(['apim:api_publish',
                                                        'apim:api_create'], api)}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={10}>
                                                <DescriptionEditor
                                                    api={apiConfig}
                                                    updateContent={updateContent}
                                                    descriptionType={descriptionType}
                                                    handleChange={handleChange}
                                                    overview={overview}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Box>
                                    <Box py={1}>
                                        <AccessControl api={apiConfig} configDispatcher={configDispatcher}  
                                            setIsDisabled={setErrorInAccessRoles} />
                                    </Box>
                                    <Box py={1}>
                                        <StoreVisibility api={apiConfig} configDispatcher={configDispatcher}
                                            setIsDisabled={setErrorInRoleVisibility} />
                                    </Box>
                                    <Box py={1}>
                                        <Tags api={apiConfig} configDispatcher={configDispatcher}
                                            setIsDisabled={setErrorInTags} />
                                    </Box>
                                    <Box py={1}>
                                        <APICategories
                                            api={apiConfig}
                                            configDispatcher={configDispatcher}
                                            categories={api.categories}
                                        />
                                    </Box>
                                    <Box py={1}>
                                        <Social
                                            slackURL={slackURLProperty && slackURLProperty.value}
                                            githubURL={githubURLProperty && githubURLProperty.value}
                                            configDispatcher={configDispatcher}
                                        />
                                    </Box>
                                    <Box py={1}>
                                        {api.apiType !== API.CONSTS.APIProduct && (
                                            <AdvertiseInfo
                                                oldApi={api}
                                                api={apiConfig}
                                                setIsOpen={setIsOpen}
                                                configDispatcher={configDispatcher}
                                                setIsDisabled={setErrorInExternalEndpoints}
                                            />
                                        )}
                                    </Box>
                                    <Box py={1}>
                                        {api.apiType !== API.CONSTS.APIProduct && (
                                            <DefaultVersion api={apiConfig} configDispatcher={configDispatcher} />
                                        )}
                                    </Box>
                                    <Box pt={2}>
                                        <Button
                                            disabled={errorInAccessRoles || 
                                                errorInRoleVisibility || 
                                                restricted || 
                                                errorInTags ||
                                                errorInExternalEndpoints}
                                            type='submit'
                                            variant='contained'
                                            color='primary'
                                            className={classes.btnSpacing}
                                            onClick={handleSave}
                                            id='design-config-save-btn'
                                        >
                                            <FormattedMessage
                                                id='Apis.Details.Configuration.Configuration.save'
                                                defaultMessage='Save'
                                            />
                                            {isUpdating && <CircularProgress size={15} />}
                                        </Button>
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
                                    </Box>
                                </Box>
                            </div>
                        </Paper>
                    </Grid>
                </Grid>
                <UpdateWithoutDetails
                    classes={classes}
                    api={api}
                    apiConfig={apiConfig}
                    handleClick={handleClick}
                    handleClose={handleClose}
                    open={isOpen}
                />
            </Container>
        </>
    );
}
