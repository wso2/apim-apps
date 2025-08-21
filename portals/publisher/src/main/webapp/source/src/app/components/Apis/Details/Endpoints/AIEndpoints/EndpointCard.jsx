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

import React from 'react';
import { FormattedMessage } from 'react-intl';
import {
    Typography,
    Button,
    IconButton,
    Chip,
    Card,
    CardContent,
    CardActions,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CodeIcon from '@mui/icons-material/Code';
import Drawer from '@mui/material/Drawer';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import WarningIcon from '@mui/icons-material/Warning';
import PropTypes from 'prop-types';
import * as monaco from 'monaco-editor'
import { Editor as MonacoEditor, loader } from '@monaco-editor/react';
import { styled } from '@mui/material/styles';
import { isRestricted } from 'AppData/AuthManager';
import MCPServer from 'AppData/MCPServer';
import { useHistory } from 'react-router-dom';
import { getBasePath } from 'AppComponents/Shared/Utils';

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
    isPrimary,
    isDeleting,
    onDelete,
    onSetPrimary,
    onRemovePrimary,
    endpointConfiguration,
}) => {
    const history = useHistory();
    const [open, setOpen] = React.useState(false);
    const isMCPServer = apiObject.type === MCPServer.CONSTS.MCP;
    const urlPrefix = getBasePath(apiObject.apiType);

    const toggleDefinitionViewDrawer = (state) => () => {
        setOpen(state);
    }

    const isSolePrimaryEndpoint = !apiObject.primaryProductionEndpointId || !apiObject.primarySandboxEndpointId;

    const getEndpointUrl = () => {
        if (isMCPServer) {
            const endpointConfig = JSON.parse(endpoint.endpointConfig) || {};
            return endpointConfig.production_endpoints?.url ||
                endpointConfig.sandbox_endpoints?.url ||
                'No URL configured';
        } else {
            return endpoint.deploymentStage === 'PRODUCTION'
                ? endpoint.endpointConfig?.production_endpoints?.url
                : endpoint.endpointConfig?.sandbox_endpoints?.url;
        }
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

    const editorOptions = {
        selectOnLineNumbers: true,
        readOnly: true,
        minimap: {
            enabled: false,
        },
    };

    const renderEndpointSecurityWarning = () => {
        if (endpointConfiguration.authenticationConfiguration.enabled) {
            const endpointSecurity =
                endpoint.deploymentStage === 'PRODUCTION'
                    ? endpoint.endpointConfig?.endpoint_security?.production
                    : endpoint.endpointConfig?.endpoint_security?.sandbox;

            // API Key warning
            if (
                !endpointSecurity &&
                endpointConfiguration.authenticationConfiguration.type === "apikey"
            ) {
                return (
                    <Tooltip title='Configure API Key security for this endpoint'>
                        <Chip
                            icon={<WarningIcon />}
                            label='API Key Required'
                            size='small'
                            variant='outlined'
                            className={classes.warningChip}
                            onClick={() => {
                                history.push(
                                    urlPrefix + apiObject.id + '/endpoints/' + endpoint.id,
                                );
                            }}
                            sx={{ my: '4px' }}
                        />
                    </Tooltip>
                );
            }

            // AWS SigV4 warning
            if (
                !endpointSecurity &&
                endpointConfiguration.authenticationConfiguration.type === "aws"
            ) {
                return (
                    <Tooltip title='Configure AWS security for this endpoint'>
                        <Chip
                            icon={<WarningIcon />}
                            label='AWS Credentials Required'
                            size='small'
                            variant='outlined'
                            className={classes.warningChip}
                            onClick={() => {
                                history.push(
                                    urlPrefix + apiObject.id + '/endpoints/' + endpoint.id,
                                );
                            }}
                            sx={{ my: '4px' }}
                        />
                    </Tooltip>
                );
            }
        }
        return null;
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
                        {isPrimary && (
                            <Chip
                                label='Primary'
                                size='small'
                                color='primary'
                                sx={{ ml: 1 }}
                            />
                        )}
                    </Typography>
                    <Typography variant='body2' className={classes.endpointUrl}>
                        {getEndpointUrl()}
                    </Typography>
                </div>
                <CardActions className={classes.cardActions}>
                    {isMCPServer ? (
                        <>
                            <Tooltip title='View Backend Definition'  >
                                <IconButton
                                    size='small'
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
                                    <Typography variant='h6' sx={{ p: 2, flexShrink: 0 }}>
                                        <FormattedMessage
                                            id='Apis.Details.Endpoints.AIEndpoints.EndpointCard.backend.api.definition'
                                            defaultMessage='Backend API Definition'
                                        />
                                    </Typography>
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
                                            value={getApiDefinition()}
                                            options={editorOptions}
                                            theme='vs-dark'
                                        />
                                    </Box>
                                </Box>
                            </Drawer>
                        </>
                    ) : (
                        <div
                            style={{
                                display: 'flex',
                                gap: '8px',
                                marginRight: 'auto',
                            }}
                        >
                            {renderEndpointSecurityWarning()}
                            {isPrimary ? (
                                <Tooltip
                                    title={
                                        isSolePrimaryEndpoint
                                            ? 'At least one primary endpoint is required'
                                            : ''
                                    }
                                >
                                    <span>
                                        <Button
                                            size='small'
                                            className={classes.primaryActionButton}
                                            onClick={() =>
                                                onRemovePrimary(endpoint)
                                            }
                                            disabled={
                                                isRestricted(
                                                    ['apim:api_create'],
                                                    apiObject,
                                                ) || isSolePrimaryEndpoint
                                            }
                                        >
                                            Remove Primary
                                        </Button>
                                    </span>
                                </Tooltip>
                            ) : (
                                <Button
                                    size='small'
                                    className={classes.primaryActionButton}
                                    onClick={() => onSetPrimary(endpoint)}
                                    disabled={isRestricted(
                                        ['apim:api_create'],
                                        apiObject,
                                    )}
                                >
                                    Set as Primary
                                </Button>
                            )}
                        </div>
                    )}
                    <IconButton
                        size='small'
                        onClick={() => {
                            history.push(
                                urlPrefix + apiObject.id + '/endpoints/' + endpoint.id,
                            );
                        }}
                        disabled={isRestricted(['apim:api_create'], apiObject)}
                    >
                        <EditIcon fontSize='small' />
                    </IconButton>
                    <Tooltip
                        title={
                            isPrimary ? 'Primary endpoints cannot be deleted' : ''
                        }
                    >
                        <span>
                            <IconButton
                                size='small'
                                color='error'
                                onClick={() => onDelete(endpoint)}
                                disabled={
                                    isRestricted(
                                        ['apim:api_create'],
                                        apiObject,
                                    ) ||
                                    isDeleting ||
                                    isPrimary
                                }
                            >
                                <DeleteIcon fontSize='small' />
                            </IconButton>
                        </span>
                    </Tooltip>
                </CardActions>
            </CardContent>
        </StyledCard>
    );
};

EndpointCard.propTypes = {
    endpoint: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        deploymentStage: PropTypes.string,
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
    }).isRequired,
    apiObject: PropTypes.shape({
        id: PropTypes.string,
        type: PropTypes.string,
        apiType: PropTypes.string,
        primaryProductionEndpointId: PropTypes.string,
        primarySandboxEndpointId: PropTypes.string,
    }).isRequired,
    isPrimary: PropTypes.bool.isRequired,
    isDeleting: PropTypes.bool.isRequired,
    onDelete: PropTypes.func.isRequired,
    onSetPrimary: PropTypes.func.isRequired,
    onRemovePrimary: PropTypes.func.isRequired,
};

export default EndpointCard;
