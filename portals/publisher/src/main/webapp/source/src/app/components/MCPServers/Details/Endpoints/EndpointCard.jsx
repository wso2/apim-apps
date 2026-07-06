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

import React, { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    Typography,
    IconButton,
    Card,
    CardContent,
    CardActions,
    Button,
    CircularProgress,
    Alert as MuiAlert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CodeIcon from '@mui/icons-material/Code';
import SyncIcon from '@mui/icons-material/Sync';
import Drawer from '@mui/material/Drawer';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import * as monaco from 'monaco-editor'
import { Editor as MonacoEditor, loader } from '@monaco-editor/react';
import { styled } from '@mui/material/styles';
import { isRestricted } from 'AppData/AuthManager';
import { useHistory } from 'react-router-dom';
import MCPServer from 'AppData/MCPServer';
import Alert from 'AppComponents/Shared/Alert';

const PREFIX = 'EndpointCard';

// load Monaco from node_modules instead of CDN
loader.config({ monaco });

const classes = {
    cardContent: `${PREFIX}-cardContent`,
    cardActions: `${PREFIX}-cardActions`,
    endpointInfo: `${PREFIX}-endpointInfo`,
    endpointUrl: `${PREFIX}-endpointUrl`,
    warningChip: `${PREFIX}-warningChip`,
    primaryActionButton: `${PREFIX}-primaryActionButton`,
};

const StyledCard = styled(Card)(({ theme }) => ({
    [`& .${classes.cardContent}`]: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing(2),
    },

    [`& .${classes.cardActions}`]: {
        padding: theme.spacing(1),
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
    },

    [`& .${classes.endpointInfo}`]: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(0.5),
    },

    [`& .${classes.endpointUrl}`]: {
        color: theme.palette.text.secondary,
    },

    [`& .${classes.warningChip}`]: {
        borderColor: theme.palette.error.main,
        color: theme.palette.error.main,
        height: '24px',
        '& .MuiChip-icon': {
            color: theme.palette.error.main,
            marginLeft: '8px',
            fontSize: '16px',
        },
        '& .MuiChip-label': {
            padding: '0 8px',
        },
    },

    [`& .${classes.primaryActionButton}`]: {
        width: '120px',
    },
}));

const EndpointCard = ({
    endpoint,
    apiObject,
    isDeleting,
    onDelete,
    endpointType,
    onDefinitionUpdate,
}) => {
    const history = useHistory();
    const intl = useIntl();
    const [open, setOpen] = useState(false);
    const [editedDefinition, setEditedDefinition] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [resyncAlert, setResyncAlert] = useState(false);

    const toggleDefinitionViewDrawer = (state) => () => {
        if (state) {
            setEditedDefinition(null);
            setResyncAlert(false);
        }
        setOpen(state);
    }

    const handleDefinitionSave = () => {
        const trimmed = (editedDefinition ?? '').trim();
        if (!trimmed) {
            Alert.error(intl.formatMessage({
                id: 'MCPServers.Details.Endpoints.EndpointCard.definition.empty',
                defaultMessage: 'API definition cannot be empty',
            }));
            return;
        }
        try {
            JSON.parse(trimmed);
        } catch (e) {
            Alert.error(intl.formatMessage({
                id: 'MCPServers.Details.Endpoints.EndpointCard.definition.invalid.json',
                defaultMessage: 'API definition is not valid JSON',
            }));
            return;
        }
        setIsSaving(true);
        const payload = {
            ...endpoint,
            endpointConfig: typeof endpoint.endpointConfig === 'string'
                ? endpoint.endpointConfig
                : JSON.stringify(endpoint.endpointConfig),
            definition: trimmed,
        };
        MCPServer.updateMCPServerBackend(apiObject.id, endpoint.id, payload)
            .then(() => {
                Alert.success(intl.formatMessage({
                    id: 'MCPServers.Details.Endpoints.EndpointCard.definition.save.success',
                    defaultMessage: 'Backend API definition updated successfully.'
                        + ' Visit the Tools page to review and update the tools accordingly.',
                }));
                setEditedDefinition(null);
                setResyncAlert(false);
                if (onDefinitionUpdate) {
                    onDefinitionUpdate();
                }
            })
            .catch((error) => {
                console.error(error);
                Alert.error(intl.formatMessage({
                    id: 'MCPServers.Details.Endpoints.EndpointCard.definition.save.error',
                    defaultMessage: 'Error updating backend API definition',
                }));
            })
            .finally(() => {
                setIsSaving(false);
            });
    };

    const getEndpointUrl = () => {
        let endpointConfig;
        if (typeof endpoint.endpointConfig === 'string') {
            endpointConfig = JSON.parse(endpoint.endpointConfig);
        } else {
            endpointConfig = endpoint.endpointConfig;
        }

        if (endpointType === 'PRODUCTION') {
            return endpointConfig.production_endpoints?.url || 'No URL configured';
        } else if (endpointType === 'SANDBOX') {
            return endpointConfig.sandbox_endpoints?.url || 'No URL configured';
        }

        return 'No URL configured';
    }

    const getEndpointName = () => {
        return endpoint.name || 'No Name Configured';
    }

    const getApiDefinition = () => {
        const apiDef = endpoint.definition || '{}';
        if (typeof apiDef === 'string') {
            const parsedDef = JSON.parse(apiDef);
            return JSON.stringify(parsedDef, null, 2);
        }
        return JSON.stringify(apiDef, null, 2);
    }

    const handleResync = () => {
        const url = getEndpointUrl();
        if (!url || url === 'No URL configured') {
            Alert.error(intl.formatMessage({
                id: 'MCPServers.Details.Endpoints.EndpointCard.resync.nourl',
                defaultMessage: 'No endpoint URL configured.',
            }));
            return;
        }
        setIsSyncing(true);
        MCPServer.validateThirdPartyMCPServerUrl(url, null, apiObject.id, endpointType)
            .then((response) => {
                const { body } = response;
                const freshContent = body.content;
                if (!freshContent) {
                    throw new Error('Empty response from backend');
                }
                let prettyContent = freshContent;
                try {
                    prettyContent = JSON.stringify(JSON.parse(freshContent), null, 2);
                } catch (_) { /* leave as-is if not valid JSON */ }

                setEditedDefinition(prettyContent);
                setResyncAlert(true);
            })
            .catch((error) => {
                // eslint-disable-next-line no-console
                console.error(error);
                Alert.error(intl.formatMessage({
                    id: 'MCPServers.Details.Endpoints.EndpointCard.resync.error',
                    defaultMessage: 'Could not re-sync backend definition.',
                }));
            })
            .finally(() => setIsSyncing(false));
    };

    /**
     * Check if delete button should be disabled based on endpoint configuration
     * @returns {boolean} True if delete should be disabled (only one endpoint section exists)
     */
    const shouldDisableDelete = () => {
        let endpointConfig;
        if (typeof endpoint.endpointConfig === 'string') {
            endpointConfig = JSON.parse(endpoint.endpointConfig);
        } else {
            endpointConfig = endpoint.endpointConfig;
        }

        // Check if both production and sandbox endpoints exist
        const hasProduction = endpointConfig.production_endpoints && 
            endpointConfig.production_endpoints.url && 
            endpointConfig.production_endpoints.url.trim() !== '';
        const hasSandbox = endpointConfig.sandbox_endpoints && 
            endpointConfig.sandbox_endpoints.url && 
            endpointConfig.sandbox_endpoints.url.trim() !== '';

        // If only one endpoint section exists, disable delete
        return (hasProduction && !hasSandbox) || (!hasProduction && hasSandbox);
    };

    const editorOptions = {
        selectOnLineNumbers: true,
        readOnly: isRestricted([
            'apim:mcp_server_create',
            'apim:mcp_server_manage',
            'apim:mcp_server_publish',
            'apim:mcp_server_import_export',
        ], apiObject) || apiObject.isRevision,
        minimap: {
            enabled: false,
        },
    };

    return (
        <StyledCard
            sx={{ mb: 2, '&:last-child': { mb: 0 } }}
            variant='outlined'
        >
            <CardContent className={classes.cardContent}>
                <div className={classes.endpointInfo}>
                    <Typography variant='subtitle1'>
                        {getEndpointName()}
                    </Typography>
                    <Typography variant='body2' className={classes.endpointUrl}>
                        {getEndpointUrl()}
                    </Typography>
                </div>
                <CardActions className={classes.cardActions}>
                    <>
                        <Tooltip title='View Backend Definition'  >
                            <IconButton
                                size='small'
                                data-testid='endpoint-definition-view-btn'
                                onClick={toggleDefinitionViewDrawer(true)}
                            >
                                <CodeIcon fontSize='small' />
                            </IconButton>
                        </Tooltip>
                        <Drawer
                            anchor='right'
                            open={open}
                            onClose={toggleDefinitionViewDrawer(false)}
                            sx={{
                                zIndex: 1300,
                                '& .MuiDrawer-paper': {
                                    width: '45%',
                                    height: '100vh',
                                    backgroundColor: '#ffffff',
                                    color: '#000000',
                                    zIndex: 1300,
                                },
                            }}
                            ModalProps={{
                                container: document.body,
                                style: { zIndex: 1300 }
                            }}
                        >
                            <Box
                                role='presentation'
                                sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
                                <Box sx={{
                                    p: 2,
                                    flexShrink: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}>
                                    <Typography variant='h6'>
                                        <FormattedMessage
                                            id='Apis.Details.Endpoints.AIEndpoints.EndpointCard.backend.api.definition'
                                            defaultMessage='Backend API Definition'
                                        />
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        {apiObject.subtypeConfiguration?.subtype === 'SERVER_PROXY' && (
                                            <Button
                                                variant='outlined'
                                                size='small'
                                                data-testid='endpoint-definition-resync-btn'
                                                startIcon={isSyncing
                                                    ? <CircularProgress size={16} />
                                                    : <SyncIcon fontSize='small' />}
                                                onClick={handleResync}
                                                disabled={
                                                    isSyncing
                                                    || isRestricted([
                                                        'apim:mcp_server_create',
                                                        'apim:mcp_server_manage',
                                                        'apim:mcp_server_publish',
                                                        'apim:mcp_server_import_export',
                                                    ], apiObject)
                                                    || apiObject.isRevision
                                                }
                                            >
                                                <FormattedMessage
                                                    id='MCPServers.Details.Endpoints.EndpointCard.resync.label'
                                                    defaultMessage='Re-sync'
                                                />
                                            </Button>
                                        )}
                                        <Button
                                            variant='contained'
                                            color='primary'
                                            size='small'
                                            data-testid='endpoint-definition-update-btn'
                                            onClick={handleDefinitionSave}
                                            disabled={
                                                editedDefinition === null
                                                || isSaving
                                                || isRestricted([
                                                    'apim:mcp_server_create',
                                                    'apim:mcp_server_manage',
                                                    'apim:mcp_server_publish',
                                                    'apim:mcp_server_import_export',
                                                ], apiObject)
                                                || apiObject.isRevision
                                            }
                                        >
                                            {isSaving ? (
                                                <CircularProgress size={16} sx={{ mr: 1 }} />
                                            ) : null}
                                            <FormattedMessage
                                                id='MCPServers.Details.Endpoints.EndpointCard.definition.update'
                                                defaultMessage='Update'
                                            />
                                        </Button>
                                    </Box>
                                </Box>
                                {resyncAlert && (
                                    <Box px={2} pb={1} sx={{ flexShrink: 0 }}>
                                        <MuiAlert
                                            severity='info'
                                            variant='outlined'
                                            sx={{ py: 0.5 }}
                                        >
                                            <FormattedMessage
                                                id='MCPServers.Details.Endpoints.EndpointCard.resync.pending'
                                                defaultMessage={'Definition fetched from backend'
                                                    + ' — review the changes and click Update to save.'}
                                            />
                                        </MuiAlert>
                                    </Box>
                                )}
                                <Box
                                    sx={{
                                        flex: 1,
                                        minHeight: 0,
                                        overflowY: 'auto',
                                    }}
                                    px={2}
                                    pb={2}
                                >
                                    <MonacoEditor
                                        language='json'
                                        width='100%'
                                        height='100%'
                                        value={editedDefinition !== null ? editedDefinition : getApiDefinition()}
                                        options={editorOptions}
                                        theme='vs-dark'
                                        onChange={(value) => setEditedDefinition(value)}
                                    />
                                </Box>
                            </Box>
                        </Drawer>
                    </>
                    <IconButton
                        size='small'
                        onClick={() => {
                            history.push(
                                '/mcp-servers/' + apiObject.id + '/endpoints/' + endpoint.id + '/' + endpointType,
                            );
                        }}
                        disabled={
                            isRestricted([
                                'apim:mcp_server_view',
                                'apim:mcp_server_create',
                                'apim:mcp_server_manage',
                                'apim:mcp_server_publish',
                                'apim:mcp_server_import_export',
                            ], apiObject)
                        }
                    >
                        <EditIcon fontSize='small' />
                    </IconButton>
                    <span>
                        <IconButton
                            size='small'
                            color='error'
                            onClick={() => onDelete()}
                            disabled={
                                isRestricted(
                                    [
                                        'apim:mcp_server_view',
                                        'apim:mcp_server_create',
                                        'apim:mcp_server_manage',
                                        'apim:mcp_server_publish',
                                        'apim:mcp_server_import_export',
                                    ],
                                    apiObject,
                                ) ||
                                isDeleting ||
                                shouldDisableDelete()
                            }
                        >
                            <DeleteIcon fontSize='small' />
                        </IconButton>
                    </span>
                </CardActions>
            </CardContent>
        </StyledCard>
    );
};

EndpointCard.propTypes = {
    endpoint: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        endpointConfig: PropTypes.shape({
            production_endpoints: PropTypes.shape({
                url: PropTypes.string,
            }),
            sandbox_endpoints: PropTypes.shape({
                url: PropTypes.string,
            }),
            endpoint_security: PropTypes.shape({
                production: PropTypes.shape({}),
                sandbox: PropTypes.shape({}),
            }),
        }),
        definition: PropTypes.string,
    }).isRequired,
    onDelete: PropTypes.func.isRequired,
    isDeleting: PropTypes.bool.isRequired,
    apiObject: PropTypes.shape({
        id: PropTypes.string,
        isRevision: PropTypes.bool,
    }).isRequired,
    endpointType: PropTypes.oneOf(['PRODUCTION', 'SANDBOX']).isRequired,
    onDefinitionUpdate: PropTypes.func,
};

EndpointCard.defaultProps = {
    onDefinitionUpdate: null,
};

export default EndpointCard;
