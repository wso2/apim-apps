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
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import {
    Checkbox,
    Chip,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Stack,
    TextField,
    Tooltip
} from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import CircularProgress from '@mui/material/CircularProgress';
import CONSTS from 'AppData/Constants';
import Alert from 'AppComponents/Shared/Alert';
import AddIcon from '@mui/icons-material/Add';

import { APIContext } from 'AppComponents/Apis/Details/components/ApiContext';
import UpdateWithoutDetails from 'AppComponents/Apis/Details/Configuration/components/UpdateWithoutDetails';
import ThumbnailView from 'AppComponents/Apis/Listing/components/ImageGenerator/ThumbnailView';
import { isRestricted } from 'AppData/AuthManager';
import API from 'AppData/api.js';
import MCPServer from 'AppData/MCPServer';
import APIProduct from 'AppData/APIProduct';
import { usePublisherSettings } from 'AppComponents/Shared/AppContext';
import { getBasePath, getTypeToDisplay } from 'AppComponents/Shared/Utils';
import DefaultVersion from './components/DefaultVersion';
import DescriptionEditor from './components/DescriptionEditor';
import AccessControl from './components/AccessControl';
import AdvertiseInfo from './components/AdvertiseInfo';
import DisplayName from './components/DisplayName';
import StoreVisibility from './components/StoreVisibility';
import Tags from './components/Tags';
import Social from './components/Social';
import APICategories from './components/APICategories';
import APIDescription from './components/APIDescription';

const PREFIX = 'DesignConfigurations';

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
    btnSpacing: `${PREFIX}-btnSpacing`,
    tierList: `${PREFIX}-tierList`,
    dialogTitle: `${PREFIX}-dialogTitle`,
    closeButton: `${PREFIX}-closeButton`
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

    [`& .${classes.btnSpacing}`]: {
        marginRight: theme.spacing(1),
    },

    [`& .${classes.tierList}`]: {
        marginLeft: theme.spacing(1),
        fontFamily: theme.typography.fontFamily,
    },

    [`& .${classes.dialogTitle}`]: {
        margin: 0,
        padding: theme.spacing(2),
    },

    [`& .${classes.closeButton}`]: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.grey[500],
    }
}));

/**
 *
 * Deep coping the properties in API object (what ever the object in the state),
 * making sure that no direct mutations happen when updating the state.
 * You should know the shape of the object that you are keeping in the state,
 * @param {Object} api The API object to copy
 * @returns {Object} Deep copy of an object
 */
function copyAPIConfig(api) {
    let isDefaultVersion = false;
    // to set isDefaultVersion of migrated APIProducts as true
    if (api.apiType === API.CONSTS.APIProduct && api.isDefaultVersion == null) {
        isDefaultVersion = true;
    }
    const isMCPServer = api.apiType === MCPServer.CONSTS.MCP;

    const copiedConfig = {
        id: api.id,
        name: api.name,
        displayName: api.displayName,
        description: api.description,
        lifeCycleStatus: api.lifeCycleStatus,
        accessControl: api.accessControl,
        authorizationHeader: api.authorizationHeader,
        visibility: api.visibility,
        isDefaultVersion: api.isDefaultVersion || isDefaultVersion,
        enableSchemaValidation: api.enableSchemaValidation,
        accessControlRoles: [...api.accessControlRoles],
        visibleRoles: [...api.visibleRoles],
        visibleOrganizations: [...(api?.visibleOrganizations || [])],
        tags: [...api.tags],
        maxTps: api.maxTps,
        transport: [...api.transport],
        securityScheme: [...api.securityScheme],
        categories: [...api.categories],
        corsConfiguration: {
            corsConfigurationEnabled: api.corsConfiguration.corsConfigurationEnabled,
            accessControlAllowCredentials: api.corsConfiguration.accessControlAllowCredentials,
            accessControlAllowOrigins: [...api.corsConfiguration.accessControlAllowOrigins],
            accessControlAllowHeaders: [...api.corsConfiguration.accessControlAllowHeaders],
            accessControlAllowMethods: [...api.corsConfiguration.accessControlAllowMethods],
        },
        type: api.type,
        apiType: api.apiType,
        policies: [...api.policies],
        endpointConfig: api.endpointConfig,
    };

    // Add MCP server specific exclusions
    if (!isMCPServer) {
        copiedConfig.responseCachingEnabled = api.responseCachingEnabled;
        copiedConfig.cacheTimeout = api.cacheTimeout;
        copiedConfig.wsdlUrl = api.wsdlUrl;
        // copiedConfig.additionalProperties = [...api.additionalProperties];
    }

    // Handle additionalPropertiesMap for MCP servers
    if (isMCPServer) {
        // For MCP servers, always initialize additionalPropertiesMap
        copiedConfig.additionalPropertiesMap = {};
        
        // Start with existing additionalPropertiesMap if available
        if (api.additionalPropertiesMap) {
            Object.keys(api.additionalPropertiesMap).forEach(key => {
                copiedConfig.additionalPropertiesMap[key] = { ...api.additionalPropertiesMap[key] };
            });
        }
        
        // If we have additionalProperties, merge them (prioritizing the ones with display: true)
        if (api.additionalProperties && api.additionalProperties.length > 0) {
            api.additionalProperties.forEach(property => {
                // Only add if not already in map, or if this one has display: true
                if (!copiedConfig.additionalPropertiesMap[property.name] || property.display === true) {
                    copiedConfig.additionalPropertiesMap[property.name] = { ...property };
                }
            });
        }
        
        // Create a virtual additionalProperties array for backward compatibility in UI
        copiedConfig.additionalProperties = Object.values(copiedConfig.additionalPropertiesMap);
    } else {
        // For regular APIs, maintain both structures
        copiedConfig.additionalProperties = [...api.additionalProperties];
        if (api.additionalPropertiesMap) {
            copiedConfig.additionalPropertiesMap = { ...api.additionalPropertiesMap };
        }
    }
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
 * @param {Object} state current state
 * @param {Object} configAction dispatched configuration action
 * @returns {Object} updated state
 */
function configReducer(state, configAction) {
    const { action, value } = configAction;
    const nextState = copyAPIConfig(state);
    switch (action) {
        case 'displayName': 
        case 'description':
        case 'isDefaultVersion':
        case 'authorizationHeader':
        case 'apiKeyHeader':
        case 'responseCachingEnabled':
        case 'cacheTimeout':
        case 'enableSchemaValidation':
        case 'maxTps':
        case 'categories':
        case 'visibleOrganizations':
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
            const isMCPServer = nextState.type === MCPServer.CONSTS.MCP;
            const updatedProperty = {
                name: action,
                value,
                display: true,
            };
            
            if (isMCPServer) {
                // Handle additionalPropertiesMap for MCP servers
                if (!nextState.additionalPropertiesMap) {
                    nextState.additionalPropertiesMap = {};
                }
                
                // Clean up any existing entries first to avoid duplicates
                delete nextState.additionalPropertiesMap[action];
                
                // Add the new property
                nextState.additionalPropertiesMap[action] = updatedProperty;
                
                // Update the virtual additionalProperties array for UI compatibility (clean rebuild)
                nextState.additionalProperties = Object.values(nextState.additionalPropertiesMap);
            } else {
                // Handle additionalProperties for regular APIs
                const targetProperty = nextState.additionalProperties.find((property) => property.name === action);
                if (targetProperty) {
                    nextState.additionalProperties = [
                        ...nextState.additionalProperties.filter((property) => property.name !== action), 
                        updatedProperty
                    ];
                } else {
                    nextState.additionalProperties.push(updatedProperty);
                }
                // Also update additionalPropertiesMap for regular APIs if it exists
                if (nextState.additionalPropertiesMap) {
                    nextState.additionalPropertiesMap[action] = updatedProperty;
                }
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
        case 'visibility':
            if (nextState[action] !== value && value !== 'RESTRICTED') {
                nextState.visibleRoles = [];
            }
            nextState[action] = value;
            return nextState;
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
    const [anchorEl, setAnchorEl] = useState(null);
    const { api, updateAPI } = useContext(APIContext);
    const { data: settings } = usePublisherSettings();
    const [isUpdating, setIsUpdating] = useState(false);
    const [errorInAccessRoles, setErrorInAccessRoles] = useState(false);
    const [errorInRoleVisibility, setErrorInRoleVisibility] = useState(false);
    const [errorInTags, setErrorInTags] = useState(false);
    const [errorInDisplayName, setErrorInDisplayName] = useState(false);
    const [errorInExternalEndpoints, setErrorInExternalEndpoints] = useState(false);
    const [apiConfig, configDispatcher] = useReducer(configReducer, copyAPIConfig(api));

    const [loading, setLoading] = useState(true);
    const [labels, setLabels] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResult, setSearchResult] = useState({});
    const [updatedLabels, setUpdatedLabels] = useState([]);
    const [unselectedLabels, setUnselectedLabels] = useState([]);
    const [overview, setOverview] = useState('');
    const [overviewDocument, setOverviewDocument] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const isMCPServer = api.apiType === MCPServer.CONSTS.MCP;
    const [slackURLProperty, githubURLProperty] = useMemo(() => {
        let slackProp;
        let githubProp;
        
        if (isMCPServer && apiConfig.additionalPropertiesMap) {
            slackProp = apiConfig.additionalPropertiesMap.slack_url;
            githubProp = apiConfig.additionalPropertiesMap.github_repo;
        }
        
        // Fallback to additionalProperties array (find the last occurrence with display: true)
        if (!slackProp) {
            const slackProps = apiConfig.additionalProperties.filter((prop) => prop.name === 'slack_url');
            slackProp = slackProps.find(prop => prop.display === true) || slackProps[slackProps.length - 1];
        }
        
        if (!githubProp) {
            const githubProps = apiConfig.additionalProperties.filter((prop) => prop.name === 'github_repo');
            githubProp = githubProps.find(prop => prop.display === true) || githubProps[githubProps.length - 1];
        }

        return [slackProp, githubProp];
    }, [apiConfig.additionalProperties, apiConfig.additionalPropertiesMap, api.apiType]);
    const invalidTagsExist = apiConfig.tags.find((tag) => {
        return (/([~!@#;%^&*+=|\\<>"'/,])/.test(tag)) || (tag.length > 30);
    });
    const intl = useIntl();

    const handleOpenList = (event) => setAnchorEl(event.currentTarget);
    const handleCloseList = () => {
        setSearchQuery('');
        setSearchResult({});
        setAnchorEl(null);
    }

    const updateContent = (content) => {
        setOverview(content);
    };
    const loadContentForDoc = (documentId) => {
        const { apiType } = api.apiType;
        let docPromise;
        if (isMCPServer) {
            docPromise = MCPServer.getInlineContentOfDocument(api.id, documentId);
        } else {
            const restApi = apiType === API.CONSTS.APIProduct ? new APIProduct() : new API();
            docPromise = restApi.getInlineContentOfDocument(api.id, documentId);
        }
        docPromise
            .then((doc) => {
                const { text } = doc;
                setOverview(text);
            });
    };
    const addDocument = async () => {
        const { apiType } = api.apiType;
        let docPromise;
        if (isMCPServer) {
            docPromise = MCPServer.addDocument(api.id, {
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
        } else {
            const restApi = apiType === API.CONSTS.APIProduct ? new APIProduct() : new API();
            docPromise = await restApi.addDocument(api.id, {
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
        }
        return docPromise;
    };

    const addDocumentContent = (document) => {
        const { apiType } = api.apiType;
        let docPromise;
        if (isMCPServer) {
            docPromise = MCPServer.addInlineContentToDocument(api.id, document.documentId, 'MARKDOWN', overview);
        } else {
            const restApi = apiType === API.CONSTS.APIProduct ? new APIProduct() : new API();
            docPromise = restApi.addInlineContentToDocument(api.id, document.documentId, 'MARKDOWN', overview);
        }
        return docPromise
            .catch((error) => {
                if (process.env.NODE_ENV !== 'production') {
                    console.log(error);
                }
                const { status } = error;
                if (status === 404) {
                    console.log(error);
                }
                throw error;
            });
    };

    const deleteOverviewDocument = () => {
        const { apiType } = api.apiType;
        let docPromise;
        if (isMCPServer) {
            docPromise = MCPServer.deleteDocument(api.id, overviewDocument.documentId);
        } else {
            const restApi = apiType === API.CONSTS.APIProduct ? new APIProduct() : new API();
            docPromise = restApi.deleteDocument(api.id, overviewDocument.documentId);
        }
        return docPromise
            .catch((error) => {
                if (process.env.NODE_ENV !== 'production') {
                    console.log(error);
                }
                throw error;
            });
    };

    useEffect(() => {
        const { apiType } = api.apiType;
        const restApi = apiType === API.CONSTS.APIProduct ? new APIProduct() : new API();
        let promisedDocs;
        if (isMCPServer) {
            promisedDocs = MCPServer.getDocuments(api.id);
        } else {
            promisedDocs = restApi.getDocuments(api.id);
        }
        promisedDocs
            .then((response) => {
                const overviewDoc = response.body.list.filter((item) => item.otherTypeName === '_overview');
                if (overviewDoc.length > 0) {
                    const doc = overviewDoc[0];
                    setOverviewDocument(doc);
                    loadContentForDoc(doc.documentId);
                }
            })
            .catch((error) => {
                if (process.env.NODE_ENV !== 'production') {
                    console.log(error);
                }
                const { status } = error;
                if (status === 404) {
                    Alert.error(intl.formatMessage({
                        id: 'Apis.Details.Configuration.Design.Configurations.error.occured',
                        defaultMessage: 'Error occurred',
                    }));
                }
            });
        if (!isMCPServer) {
            API.labels().then((response) => setLabels(response.body));
            restApi.getAPILabels(api.id).then((response) => {
                setUpdatedLabels(response.body.list.map((label) => label.name));
            }).finally(() => {
                setLoading(false);
            });
        }
    }, []);

    useEffect(() => {
        setUnselectedLabels(labels?.list?.filter(label => !updatedLabels.includes(label.name))
            .map((label) => label.name).sort());
    }, [labels, updatedLabels]);

    const attachLabel = (name) => {
        const apiClient = new API();
        apiClient.attachLabels(api.id,
            labels.list?.filter(label => [name].includes(label.name)))
            .then((response) => {
                setUpdatedLabels(response.body.list.map((label) => label.name))
            });
    }

    const detachLabel = (name) => {
        const apiClient = new API();
        apiClient.detachLabels(api.id,
            labels.list?.filter(label => [name].includes(label.name)))
            .then((response) => {
                setUpdatedLabels(response.body.list.map((label) => label.name))
            });
    }

    /**
     *
     * Handle the configuration view save button action
     */
    async function handleSave() {
        setIsUpdating(true);
        let updatePayload = { ...apiConfig };
        
        // Exclude apiType field from the payload
        const { apiType, ...payloadWithoutApiType } = updatePayload;
        updatePayload = payloadWithoutApiType;

        if (isMCPServer) {
            // For MCP servers, ensure we're using additionalPropertiesMap and exclude forbidden fields
            const { responseCachingEnabled, cacheTimeout, wsdlUrl, additionalProperties, ...mcpConfig } = updatePayload;
            
            // Ensure additionalPropertiesMap is present and up-to-date
            if (!mcpConfig.additionalPropertiesMap) {
                mcpConfig.additionalPropertiesMap = {};
            }
            
            // Convert additionalProperties array back to additionalPropertiesMap if needed
            if (additionalProperties && additionalProperties.length > 0) {
                additionalProperties.forEach(property => {
                    mcpConfig.additionalPropertiesMap[property.name] = property;
                });
            }
            updatePayload = mcpConfig;
        }
        
        try {
            await updateAPI(updatePayload);
            
            // Handle overview document update
            if (overview.trim() === '') {
                if (overviewDocument) {
                    await deleteOverviewDocument();
                    // Clear the overview state after successful deletion
                    setOverview('');
                    setOverviewDocument(null);
                }
            } else {
                let document = overviewDocument;
                if (document === null) {
                    document = await addDocument();
                    setOverviewDocument(document);
                }
                await addDocumentContent(document);
            }
        } catch (error) {
            if (error.response) {
                Alert.error(error.response.body.description);
            } else {
                Alert.error(intl.formatMessage({
                    id: 'Apis.Details.Configuration.Design.Configurations.error.updating',
                    defaultMessage: 'Error occurred while updating design configurations',
                }));
            }
        } finally {
            setIsUpdating(false);
        }
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

    const isAccessRestricted = () => {
        if (api.apiType.toUpperCase() === MCPServer.CONSTS.MCP) {
            return isRestricted(['apim:mcp_server_publish', 'apim:mcp_server_create', 'apim:mcp_server_manage'], api);
        } else {
            return isRestricted(['apim:api_publish', 'apim:api_create', 'apim:api_manage'], api);
        }
    }

    const restricted = isAccessRestricted() || isUpdating || api.isRevision || invalidTagsExist
        || (apiConfig.visibility === 'RESTRICTED' && apiConfig.visibleRoles.length === 0);

    const LabelMenu = () => {
        if (searchResult && searchResult.list && searchQuery !== '') {
            if (searchResult.list.length !== 0) {
                return (
                    <List sx={{ width: '350px' }} id='label-menu-list-search-result'>
                        {searchResult.list
                            .filter(label => updatedLabels.includes(label.name))
                            .concat(searchResult.list.filter(label => !updatedLabels.includes(label.name)))
                            .map((label) => (
                                <MenuItem
                                    key={label.name}
                                    onClick={() => updatedLabels.includes(label.name)
                                        ? detachLabel(label.name)
                                        : attachLabel(label.name)}
                                >
                                    <ListItemIcon>
                                        <Checkbox checked={updatedLabels.includes(label.name)} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={label.name}
                                        sx={{ whiteSpace: 'normal', wordWrap: 'break-word' }}
                                    />
                                </MenuItem>
                            ))}
                    </List>
                );
            } else {
                return (
                    <ListItem sx={{ width: '350px' }} id='label-menu-search-result-no-labels'>
                        <ListItemIcon />
                        <Typography variant='body1' color='textPrimary'>
                            <FormattedMessage
                                id='Apis.Details.Configuration.Configuration.Design.no.labels.found'
                                defaultMessage='No Labels Found'
                            />
                        </Typography>
                    </ListItem>
                );
            }
        }

        return (
            <span>
                <ListItem >
                    <Typography variant='body1' color='textPrimary' sx={{ fontWeight: 'bold' }}>
                        <FormattedMessage
                            id='Apis.Details.Configuration.Configuration.Design.attached.labels'
                            defaultMessage='Attached Labels'
                        />
                    </Typography>
                </ListItem>
                <List sx={{ width: '350px' }}>
                    {updatedLabels && updatedLabels.length !== 0 ? (
                        updatedLabels.map((label) => (
                            <MenuItem key={label} onClick={() => detachLabel(label)}>
                                <ListItemIcon>
                                    <Checkbox checked />
                                </ListItemIcon>
                                <ListItemText
                                    primary={label}
                                    sx={{ whiteSpace: 'normal', wordWrap: 'break-word' }}
                                />
                            </MenuItem>
                        ))
                    ) : (
                        <ListItem >
                            <ListItemIcon />
                            <Typography variant='body2' color='textPrimary'>
                                <FormattedMessage
                                    id='Apis.Details.Configuration.Configuration.Design.no.labels'
                                    defaultMessage='No Labels Attached'
                                />
                            </Typography>
                        </ListItem>
                    )}
                </List>
                <ListItem >
                    <Typography variant='body1' color='textPrimary' sx={{ fontWeight: 'bold' }}>
                        <FormattedMessage
                            id='Apis.Details.Configuration.Configuration.Design.unattached.labels'
                            defaultMessage='Unattached Labels'
                        />
                    </Typography>
                </ListItem>
                <List sx={{ width: '350px' }}>
                    {unselectedLabels && unselectedLabels.length !== 0 ? (
                        unselectedLabels.map((label) => (
                            <MenuItem key={label} onClick={() => attachLabel(label)}>
                                <ListItemIcon>
                                    <Checkbox />
                                </ListItemIcon>
                                <ListItemText
                                    primary={label}
                                    sx={{ whiteSpace: 'normal', wordWrap: 'break-word' }}
                                />
                            </MenuItem>
                        ))
                    ) : (
                        <ListItem >
                            <ListItemIcon />
                            <Typography variant='body2' color='textPrimary'>
                                <FormattedMessage
                                    id='Apis.Details.Configuration.Configuration.Design.no.more.labels'
                                    defaultMessage='No More Labels Available'
                                />
                            </Typography>
                        </ListItem>
                    )}
                </List>
            </span>
        );
    };

    return (
        (<Root>
            <Menu anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseList}
                onKeyDown={(e) => e.stopPropagation()}
                id='label-menu'
                sx={{
                    maxHeight: '450px',
                    width: '350px',
                    wordWrap: 'break-word'
                }}>
                <ListItem key='label-search' id='label-search'>
                    <Grid container direction='column'>
                        <Grid item>
                            <ListItemText primary='Attach labels to this API' />
                        </Grid>
                        <Grid item>
                            <TextField
                                value={searchQuery}
                                fullWidth
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    if (e.target.value === '') {
                                        setSearchResult({});
                                    } else {
                                        setSearchResult({
                                            list: labels.list.filter(label => label.name.includes(e.target.value))
                                        });
                                    }
                                }}
                                onKeyDown={(e) => e.stopPropagation()}
                                id='label-search-textfield'
                                placeholder='Search...'
                                size='small'
                            />
                        </Grid>
                    </Grid>
                </ListItem>
                {labels.list && labels.list.length !== 0 ? (
                    <LabelMenu />
                ) : (
                    <MenuItem disabled sx={{ width: '350px' }} id='label-menu-no-labels-defined'>
                        <ListItemIcon />
                        <ListItemText primary='No Labels Found' />
                    </MenuItem>
                )}
            </Menu>
            <Grid item md={12}>
                <Typography id='itest-api-details-design-config-head' variant='h5' component='h2'>
                    <FormattedMessage
                        id='Apis.Details.Configuration.Configuration.Design.topic.header'
                        defaultMessage='Design Configurations'
                    />
                </Typography>
                <Box color='text.secondary'>
                    <Typography variant='caption'>
                        <FormattedMessage
                            id='Apis.Details.Configuration.Configuration.Design.sub.heading'
                            defaultMessage='Configure basic {type} meta information'
                            values={{
                                type: getTypeToDisplay(api.apiType)
                            }}
                        />
                    </Typography>
                </Box>
            </Grid>
            <Grid container direction='row' justifyContent='space-around' alignItems='stretch'
                spacing={3}>
                <Grid item xs={12} md={9}>
                    <Grid item md={12}>
                        <Paper elevation={0}>
                            <div>
                                <Box px={8} py={5}>
                                    <Box py={1}>
                                        <Grid container spacing={0}>
                                            <Grid item xs={12} md={2.5} id='edit-api-thumbnail-btn'>
                                                <ThumbnailView
                                                    api={api}
                                                    width={100}
                                                    height={100}
                                                    updateAPI={updateAPI}
                                                    isEditable={!isAccessRestricted()}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={9.5}>
                                                <DescriptionEditor
                                                    api={apiConfig}
                                                    updateContent={updateContent}
                                                    overview={overview}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Box>
                                    <Box py={1}>
                                        <DisplayName api={apiConfig} configDispatcher={configDispatcher}
                                            setIsDisabled={setErrorInDisplayName}/>
                                    </Box>
                                    <Box py={1}>
                                        <APIDescription
                                            api={apiConfig}
                                            configDispatcher={configDispatcher}                                        
                                        />
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
                                        {api.apiType !== API.CONSTS.APIProduct
                                        && api.apiType !== MCPServer.CONSTS.MCP &&
                                            settings && settings.gatewayFeatureCatalog
                                            .gatewayFeatures[api.gatewayType ? api.gatewayType : 'wso2/synapse']
                                            .basic.includes("advertised") && (
                                            <AdvertiseInfo
                                                oldApi={api}
                                                api={apiConfig}
                                                setIsOpen={setIsOpen}
                                                configDispatcher={configDispatcher}
                                                setIsDisabled={setErrorInExternalEndpoints}
                                            />
                                        )}
                                    </Box>
                                    { settings && !settings.portalConfigurationOnlyModeEnabled &&
                                        settings.gatewayFeatureCatalog
                                            .gatewayFeatures[api.gatewayType ? api.gatewayType : 'wso2/synapse']
                                            .basic.includes("defaultVersion") &&
                                            <Box py={1}>
                                                <DefaultVersion api={apiConfig}
                                                    configDispatcher={configDispatcher} />
                                            </Box>
                                    }
                                    <Box pt={2}>
                                        <Button
                                            disabled={
                                                (apiConfig.accessControl
                                                    === 'RESTRICTED' && errorInAccessRoles) ||
                                                (apiConfig.visibility
                                                    === 'RESTRICTED' && errorInRoleVisibility) ||
                                                restricted ||
                                                errorInTags ||
                                                errorInDisplayName ||
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
                                            to={getBasePath(api.apiType) + api.id + '/overview'}
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
                {!isMCPServer && (
                    <Grid item xs={12} md={3}>
                        <Paper elevation={0}>
                            <Box p={2}>
                                <Grid item xs={12} container direction='row'
                                    justifyContent='space-between' >
                                    <Grid item md={6}>
                                        <Typography
                                            id='itest-label-head' variant='h5' component='h5'>
                                            <FormattedMessage
                                                id='Apis.Details.Configuration.Configuration.Design.topic.label'
                                                defaultMessage='Labels'
                                            />
                                        </Typography>
                                    </Grid>
                                    <Grid item md={6} align='right'>
                                        {!api.isRevision && (
                                            <Tooltip title='Attach Labels'>
                                                <IconButton onClick={handleOpenList} disabled={isAccessRestricted()}>
                                                    <AddIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Grid>
                                </Grid>
                                <Box>
                                    {loading ? (
                                        <CircularProgress size='30px'/>
                                    ) : (
                                        <Stack direction='row' spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                                            {updatedLabels.length !== 0 ? (
                                                updatedLabels.map((label) => (
                                                    <Chip key={label} label={label}
                                                        onDelete={!api.isRevision
                                                            ? () => detachLabel(label) : undefined}/>
                                                ))
                                            ) : (
                                                <Typography variant='body2' color='textSecondary'>
                                                    <FormattedMessage
                                                        id='Apis.Details.Configuration.Configuration.Design.no.labels'
                                                        defaultMessage='No Labels Attached'
                                                    />
                                                </Typography>
                                            )}
                                        </Stack>
                                    )}
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                )}
            </Grid>
            <UpdateWithoutDetails
                classes={classes}
                api={api}
                apiConfig={apiConfig}
                handleClick={handleClick}
                handleClose={handleClose}
                open={isOpen}
            />
        </Root>)
    );
}
