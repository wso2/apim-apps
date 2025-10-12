/*
 * Copyright (c), WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import 'swagger-ui-react/swagger-ui.css';

import { styled } from '@mui/material/styles';

import React, {
    Suspense,
    lazy,
    useCallback,
    useEffect,
    useMemo,
    useReducer,
    useState,
} from 'react';

import Api from 'AppData/api';
import MCPServer from 'AppData/MCPServer';
import CONSTS from 'AppData/Constants';
import CircularProgress from '@mui/material/CircularProgress';
import { FormattedMessage, useIntl } from 'react-intl';
import Paper from '@mui/material/Paper';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Utils from 'AppData/Utils';
import cloneDeep from 'lodash.clonedeep';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import { usePublisherSettings } from 'AppComponents/Shared/AppContext';
import AdvertiseDetailsPanel from "AppComponents/Apis/Details/TryOut/AdvertiseDetailsPanel";
import MCPPlayground from '@wso2-org/mcp-playground';
import Alert from 'AppComponents/Shared/Alert';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import SecurityDetailsPanel from './SecurityDetailsPanel';

const PREFIX = 'TryOutConsole';

const classes = {
    centerItems: `${PREFIX}-centerItems`,
    tryoutHeading: `${PREFIX}-tryoutHeading`,
    tokenType: `${PREFIX}-tokenType`,
    mcpPlaygroundWrapper: `${PREFIX}-mcpPlaygroundWrapper`,
    drawerContent: `${PREFIX}-drawerContent`,
    drawerActions: `${PREFIX}-drawerActions`,
};


const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.centerItems}`]: {
        margin: 'auto',
    },

    [`& .${classes.tryoutHeading}`]: {
        paddingTop: '20px',
        fontWeight: 400,
        display: 'block',
    },

    [`& .${classes.tokenType}`]: {
        margin: 'auto',
        display: 'flex',
        '& .MuiButton-contained.Mui-disabled span.MuiButton-label': {
            color: '#6d6d6d',
        },
    },

    [`& .${classes.mcpPlaygroundWrapper}`]: {
        fontFamily: theme.typography.fontFamily,
        '& *': {
            fontFamily: theme.typography.fontFamily,
        },
        // Ensure all text elements within the playground inherit the font family
        '& input, & textarea, & select, & button, & div, & span, & p, & label, & h1, & h2, & h3, & h4, & h5, & h6': {
            fontFamily: theme.typography.fontFamily,
        },
    },

    [`& .${classes.drawerContent}`]: {
        padding: theme.spacing(1),
        marginTop: theme.spacing(3),
        overflowY: 'auto',
        flex: 1,
        position: 'relative',
    },

    [`& .${classes.drawerActions}`]: {
        padding: theme.spacing(2),
        marginTop: 'auto',
    },
}));

// disabled because webpack magic comment for chunk name require to be in the same line
// eslint-disable-next-line max-len
const SwaggerUI = lazy(() => import('AppComponents/Apis/Details/TryOut/SwaggerUI' /* webpackChunkName: "TryoutConsoleSwaggerUI" */));

dayjs.extend(relativeTime);

const tasksReducer = (state, action) => {
    switch (action.type) {
        case 'GENERATE_KEY_START':
            return { ...state, generateKey: { ...state.generateKey, inProgress: true } };
        case 'GENERATE_KEY_SUCCESS':
            return { ...state, generateKey: { ...state.generateKey, inProgress: false, completed: true } };
        case 'GENERATE_KEY_ERROR':
            return { ...state, generateKey: { ...state.generateKey, inProgress: false, error: action.error } };
        case 'GET_DEPLOYMENTS_START':
            return { ...state, getDeployments: { ...state.getDeployments, inProgress: true } };
        case 'GET_DEPLOYMENTS_SUCCESS':
            return { ...state, getDeployments: { ...state.getDeployments, inProgress: false, completed: true } };
        case 'GET_DEPLOYMENTS_ERROR':
            return { ...state, getDeployments: { ...state.getDeployments, inProgress: false, error: action.error } };
        default:
            return state;
    }
};

/**
 * @class TryOutConsole
 * @extends {React.Component}
 */
const TryOutConsole = () => {

    const [api] = useAPI();
    const [apiKey, setAPIKey] = useState(null);
    const [deployments, setDeployments] = useState([]);
    const [selectedDeployment, setSelectedDeployment] = useState();
    const [oasDefinition, setOasDefinition] = useState();
    const [advAuthHeader, setAdvAuthHeader] = useState('Authorization');
    const [advAuthHeaderValue, setAdvAuthHeaderValue] = useState('');
    const [selectedEndpoint, setSelectedEndpoint] = useState('PRODUCTION');
    const [drawerOpen, setDrawerOpen] = useState(false);
    const { data: publisherSettings } = usePublisherSettings();
    const isMCPServer = api.type === MCPServer.CONSTS.MCP;
    const intl = useIntl();

    const [tasksStatus, tasksStatusDispatcher] = useReducer(tasksReducer, {
        generateKey: { inProgress: false, completed: false, error: false },
        getOAS: { inProgress: false, completed: false, error: false },
        getDeployments: { inProgress: false, completed: false, error: false },
    });

    const generateInternalKey = useCallback(() => {
        tasksStatusDispatcher({ type: 'GENERATE_KEY_START' });
        let generateInternalKeyPromise;
        if (isMCPServer) {
            generateInternalKeyPromise = MCPServer.generateInternalKey(api.id)
        } else {
            generateInternalKeyPromise = Api.generateInternalKey(api.id)
        }
        generateInternalKeyPromise
            .then((keyResponse) => {
                const { apikey } = keyResponse.body;
                setAPIKey(apikey);
                tasksStatusDispatcher({ type: 'GENERATE_KEY_SUCCESS' });
            })
            .catch((error) => tasksStatusDispatcher({ type: 'GENERATE_KEY_ERROR', error }))
    }, [api.id]);

    useEffect(generateInternalKey, []); // Auto generate API Key on page load
    useEffect(() => {
        tasksStatusDispatcher({ type: 'GET_DEPLOYMENTS_START' });
        if (publisherSettings) {
            let getDeploymentsPromise;
            if (isMCPServer) {
                if (api.isRevision) {
                    getDeploymentsPromise = MCPServer.getDeployedRevisions(api.revisionedApiId)
                } else {
                    getDeploymentsPromise = MCPServer.getDeployedRevisions(api.id)
                }
            } else {
                getDeploymentsPromise = api.getDeployedRevisions(api.id)
                api.getSwagger().then((swaggerResponse) => setOasDefinition(swaggerResponse.body));
            }
            getDeploymentsPromise
                .then((deploymentsResponse) => {
                    tasksStatusDispatcher({ type: 'GET_DEPLOYMENTS_SUCCESS' });
                    const currentDeployments = deploymentsResponse.body;
                    const currentDeploymentsWithDisplayName = currentDeployments
                        .filter(deploy => deploy.status !== 'CREATED').map((deploy) => {
                            const gwEnvironment = publisherSettings.environment.find((e) => e.name === deploy.name);
                            const displayName = (gwEnvironment ? gwEnvironment.displayName : deploy.name);
                            return { ...deploy, displayName };
                        });
                    setDeployments(currentDeploymentsWithDisplayName);
                    if (currentDeploymentsWithDisplayName && currentDeploymentsWithDisplayName.length > 0) {
                        const [initialDeploymentSelection] = currentDeploymentsWithDisplayName;
                        setSelectedDeployment(initialDeploymentSelection);
                    }
                }).catch(
                    (error) => tasksStatusDispatcher({ type: 'GET_DEPLOYMENTS_ERROR', error }),
                );
        }
    }, [publisherSettings, api.id]);

    const isAdvertised = api.advertiseInfo && api.advertiseInfo.advertised;
    const setServersSpec = (spec, serverUrl) => {
        let schemes;
        const [protocol, host] = serverUrl.split('://');
        if (protocol === 'http') {
            schemes = ['http'];
        } else if (protocol === 'https') {
            schemes = ['https'];
        }
        return {
            ...spec,
            schemes,
            host,
        };
    };
    const updatedOasDefinition = useMemo(() => {
        let oasCopy;
        if (selectedDeployment && oasDefinition) {
            const selectedGWEnvironment = publisherSettings.environment
                .find((env) => env.name === selectedDeployment.name);
            let selectedDeploymentVhost = selectedGWEnvironment && selectedGWEnvironment.vhosts
                .find((vhost) => vhost.host === selectedDeployment.vhost);
            if (!selectedDeploymentVhost) {
                selectedDeploymentVhost = { ...CONSTS.DEFAULT_VHOST, host: selectedDeployment.vhost };
            }
            let pathSeparator = '';
            if (selectedDeploymentVhost.httpContext && !selectedDeploymentVhost.httpContext.startsWith('/')) {
                pathSeparator = '/';
            }
            oasCopy = cloneDeep(oasDefinition); // If not we are directly mutating the state
            if (oasDefinition.openapi) { // Assumed as OAS 3.x definition
                const unfilteredServers = api.transport.map((transport) => {
                    const transportPort = selectedDeploymentVhost[`${transport}Port`];
                    if (!transportPort) {
                        console.error(`Can't find ${transport}Port `
                            + `in selected deployment ( ${selectedDeploymentVhost.name} )`);
                    }
                    if (transportPort !== -1) {
                        const baseURL = `${transport}://${selectedDeployment.vhost}:${transportPort}`;
                        let url = `${baseURL}${pathSeparator}`
                            + `${selectedDeploymentVhost.httpContext}${api.context}/${api.version}`;
                        if (`${api.context}`.includes('{version}')) {
                            url = `${baseURL}${pathSeparator}`
                                + `${selectedDeploymentVhost.httpContext}${api.context}`
                                    .replaceAll('{version}', `${api.version}`);
                        }
                        return { url };
                    }
                    return null;
                });
                const servers = unfilteredServers.filter(url => url);
                oasCopy.servers = servers.sort((a, b) => ((a.url > b.url) ? -1 : 1));
            } else { // Assume the API definition is Swagger 2
                let transportPort = selectedDeploymentVhost.httpsPort;
                if (api.transport.length === 1 && !api.transport.includes('https')) {
                    transportPort = selectedDeploymentVhost.httpPort;
                } else if (api.transport.length > 1) {
                    // TODO: fix When both HTTP and HTTPs transports are available can't switch the port between them
                    // ~tmkb
                    console.warn('HTTPS transport port will be used for all other transports');
                }
                const host = `${selectedDeploymentVhost.host}:${transportPort}`;
                let basePath;

                basePath = `${pathSeparator}${selectedDeploymentVhost.
                    httpContext}${api.context}/${api.version}`;

                if (`${api.context}`.includes('{version}')) {
                    basePath = `${pathSeparator}${selectedDeploymentVhost
                        .httpContext}${api.context}`.replaceAll('{version}', `${api.version}`);
                }

                let schemes = api.transport.slice().sort((a, b) => ((a > b) ? -1 : 1));
                if (selectedDeploymentVhost.httpPort === -1) {
                    schemes = schemes.filter(item => item !== 'http');
                }
                if (selectedDeploymentVhost.httpsPort === -1) {
                    schemes = schemes.filter(item => item !== 'https');
                }
                oasCopy.schemes = schemes;
                oasCopy.basePath = basePath;
                oasCopy.host = host;
            }
        } else if (oasDefinition) {
            // If no deployment just show the OAS definition
            oasCopy = oasDefinition;
        }
        if (oasCopy && isAdvertised) {
            if (oasCopy.openapi) {
                // Assume the API definition is an OAS 3.x definition
                if (selectedEndpoint === 'PRODUCTION') {
                    oasCopy = {
                        ...oasCopy,
                        servers: [
                            { url: api.advertiseInfo.apiExternalProductionEndpoint },
                        ]
                    };
                } else {
                    oasCopy = {
                        ...oasCopy,
                        servers: [
                            { url: api.advertiseInfo.apiExternalSandboxEndpoint },
                        ]
                    };
                }
            } else if (selectedEndpoint === 'PRODUCTION') {
                // Assume the API definition is Swagger 2
                oasCopy = setServersSpec(oasCopy, api.advertiseInfo.apiExternalProductionEndpoint);
            } else {
                oasCopy = setServersSpec(oasCopy, api.advertiseInfo.apiExternalSandboxEndpoint);
            }
        }
        return oasCopy;
    }, [selectedEndpoint, selectedDeployment, oasDefinition, publisherSettings]);

    /**
     *
     * @param {React.SyntheticEventn} event
     */
    const deploymentSelectionHandler = (event) => {
        const selectedGWEnvironment = event.target.value;
        const currentSelection = deployments.find((deployment) => deployment.name === selectedGWEnvironment);
        setSelectedDeployment(currentSelection);
    };
    const decodedJWT = useMemo(() => Utils.decodeJWT(apiKey || ''), [apiKey]);
    const isAPIRetired = api.lifeCycleStatus === 'RETIRED';

    const getMCPServerUrl = () => {
        if (selectedDeployment && selectedDeployment.vhost) {
            const selectedGWEnvironment = publisherSettings.environment
                .find((env) => env.name === selectedDeployment.name);
            let selectedDeploymentVhost = selectedGWEnvironment && selectedGWEnvironment.vhosts
                .find((vhost) => vhost.host === selectedDeployment.vhost);

            if (!selectedDeploymentVhost) {
                selectedDeploymentVhost = { ...CONSTS.DEFAULT_VHOST, host: selectedDeployment.vhost };
            }

            const protocol = selectedDeploymentVhost.httpsPort !== -1 ? 'https' : 'http';
            const port = protocol === 'https'
                ? selectedDeploymentVhost.httpsPort
                : selectedDeploymentVhost.httpPort;
            let pathSeparator = '';
            if (selectedDeploymentVhost.httpContext
                && !selectedDeploymentVhost.httpContext.startsWith('/')) {
                pathSeparator = '/';
            }

            let url = `${protocol}://${selectedDeployment.vhost}:${port}${pathSeparator}`
                + `${selectedDeploymentVhost.httpContext}${api.context}/${api.version}`;

            if (`${api.context}`.includes('{version}')) {
                url = `${protocol}://${selectedDeployment.vhost}:${port}${pathSeparator}`
                    + `${selectedDeploymentVhost.httpContext}${api.context}`
                        .replaceAll('{version}', `${api.version}`);
            }
            return url + '/mcp';
        }
        // Fallback URL
        return `https://localhost:8243${api.context}/${api.version}/mcp`;
    };

    const accessTokenProvider = () => {
        if (isAdvertised) {
            return advAuthHeaderValue;
        }
        return apiKey;
    };

    const getAuthorizationHeader = () => {
        if (isAdvertised) {
            return advAuthHeader;
        }
        return 'Internal-Key';
    };

    // Determine artifact type for display messages
    const getArtifactType = () => {
        if (isMCPServer) {
            return 'MCP Server';
        }
        return api.isRevision ? 'Revision' : 'API';
    };

    const handleDrawerOpen = () => {
        setDrawerOpen(true);
    };

    const handleDrawerClose = () => {
        setDrawerOpen(false);
    };

    const handleKeyGeneration = () => {
        generateInternalKey();
        setDrawerOpen(false);

        // Show success alert if token was generated
        if (apiKey && apiKey.trim() !== '') {
            Alert.info(intl.formatMessage({
                id: 'Apis.Details.TryOut.key.generation.success',
                defaultMessage: 'Key generated successfully!',
            }));
        }
    };

    return (
        (<Root>
            <Typography id='itest-api-details-try-out-head' variant='h4' component='h2'>
                {isMCPServer ? (
                    <FormattedMessage
                        id='Apis.Details.TryOut.TryOutConsole.mcp.playground.title'
                        defaultMessage='MCP Playground'
                    />
                ) : (
                    <FormattedMessage
                        id='Apis.Details.TryOut.TryOutConsole.title'
                        defaultMessage='Try Out'
                    />
                )}
            </Typography>
            <Paper elevation={0} sx={{ mt: 1, p: 3 }}>
                {/* Security Details Panel for regular APIs that are not advertised */}
                {!isMCPServer && (!api.advertiseInfo || !api.advertiseInfo.advertised) && (
                    <SecurityDetailsPanel
                        apiKey={apiKey}
                        setAPIKey={setAPIKey}
                        decodedJWT={decodedJWT}
                        isAPIRetired={isAPIRetired}
                        generateInternalKey={generateInternalKey}
                        tasksStatus={tasksStatus}
                        deployments={deployments}
                        selectedDeployment={selectedDeployment}
                        deploymentSelectionHandler={deploymentSelectionHandler}
                        getArtifactType={getArtifactType}
                    />
                )}

                {/* Advertise Details Panel for advertised APIs */}
                {!isMCPServer && api.advertiseInfo && api.advertiseInfo.advertised && (
                    <AdvertiseDetailsPanel
                        classes={classes}
                        advAuthHeader={advAuthHeader}
                        setAdvAuthHeader={setAdvAuthHeader}
                        advAuthHeaderValue={advAuthHeaderValue}
                        setAdvAuthHeaderValue={setAdvAuthHeaderValue}
                        selectedEndpoint={selectedEndpoint}
                        setSelectedEndpoint={setSelectedEndpoint}
                        advertiseInfo={api.advertiseInfo}
                    />
                )}
                {isMCPServer && (
                    // Render MCP Playground for MCP servers
                    <>
                        <div className={classes.mcpPlaygroundWrapper}>
                            <MCPPlayground
                                disableTitle
                                enableConfiguration
                                onConfigurationClick={handleDrawerOpen}
                                url={getMCPServerUrl()}
                                token={apiKey}
                                headerName='internal-key'
                                shouldSetHeaderNameExternally
                                disableConnectionButton={
                                    apiKey === null || apiKey === '' ||
                                    (tasksStatus.getDeployments.completed && !deployments.length && !isAPIRetired)
                                }
                            />
                        </div>
                    </>
                )}
                {!isMCPServer && (
                    // Render SwaggerUI for regular APIs
                    <>
                        {updatedOasDefinition && apiKey !== null ? (
                            <Suspense
                                fallback={(
                                    <CircularProgress />
                                )}
                            >
                                <SwaggerUI
                                    api={api}
                                    accessTokenProvider={accessTokenProvider}
                                    spec={updatedOasDefinition}
                                    authorizationHeader={getAuthorizationHeader()}
                                />
                            </Suspense>
                        ) : (
                            <CircularProgress />
                        )}
                    </>
                )}
            </Paper>

            {/* Security Details Drawer for MCP Servers */}
            <Drawer
                anchor='right'
                open={drawerOpen}
                onClose={handleDrawerClose}
                PaperProps={{
                    sx: { 
                        width: 600,
                        zIndex: 1300,
                        position: 'fixed',
                        top: 0,
                        height: '100vh',
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: 'white',
                    }
                }}
                sx={{
                    zIndex: 1300,
                    '& .MuiDrawer-paper': {
                        backgroundColor: 'white',
                        color: 'black'
                    }
                }}
            >
                <Box 
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 2,
                        backgroundColor: 'white',
                        position: 'sticky',
                        top: 0,
                        zIndex: 1,
                        minHeight: '64px',
                        flexWrap: 'nowrap',
                        marginBottom: 2,
                    }}
                >
                    <Typography 
                        variant='h5' 
                        component='h3'
                        sx={{ 
                            flex: 1,
                            margin: 0,
                            padding: 0,
                        }}
                    >
                        <FormattedMessage
                            id='api.console.security.heading'
                            defaultMessage='Security Configuration'
                        />
                    </Typography>
                    <IconButton 
                        onClick={handleDrawerClose}
                        sx={{ 
                            flexShrink: 0,
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
                
                <Box className={classes.drawerContent}>
                    <SecurityDetailsPanel
                        apiKey={apiKey}
                        setAPIKey={setAPIKey}
                        decodedJWT={decodedJWT}
                        isAPIRetired={isAPIRetired}
                        generateInternalKey={handleKeyGeneration}
                        tasksStatus={tasksStatus}
                        deployments={deployments}
                        selectedDeployment={selectedDeployment}
                        deploymentSelectionHandler={deploymentSelectionHandler}
                        getArtifactType={getArtifactType}
                        securityPanelWidth='100%'
                        isSecurityPanelDrawer
                    />
                </Box>
            </Drawer>
        </Root>)
    );
};
TryOutConsole.propTypes = {
    classes: PropTypes.shape({
        paper: PropTypes.string.isRequired,
        titleSub: PropTypes.string.isRequired,
        grid: PropTypes.string.isRequired,
        userNotificationPaper: PropTypes.string.isRequired,
        buttonIcon: PropTypes.string.isRequired,
        lcState: PropTypes.shape({}).isRequired,
        theme: PropTypes.shape({}).isRequired,
        intl: PropTypes.shape({
            formatMessage: PropTypes.func,
        }).isRequired,
    }).isRequired,
};

export default (TryOutConsole);
