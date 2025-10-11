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
import PropTypes from 'prop-types';
import { Box, Typography, Grid, TextField, Button, CircularProgress, Alert } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import LaunchIcon from '@mui/icons-material/Launch';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { isRestricted } from 'AppData/AuthManager';
import { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import { getBasePath } from 'AppComponents/Shared/Utils';

const SecurityDetailsPanel = ({
    apiKey,
    setAPIKey,
    decodedJWT,
    isAPIRetired,
    generateInternalKey,
    tasksStatus,
    deployments,
    selectedDeployment,
    deploymentSelectionHandler,
    getArtifactType,
    securityPanelWidth,
    isSecurityPanelDrawer,
}) => {
    const [api] = useAPI();

    const getCreateOrPublishScopes = () => {
        if (api.apiType && api.apiType.toUpperCase() === 'MCP') {
            return ['apim:mcp_server_create', 'apim:mcp_server_publish'];
        } else {
            return ['apim:api_create', 'apim:api_publish'];
        }
    };
    const isCreateOrPublishRestricted = () => isRestricted(getCreateOrPublishScopes(), api);

    const renderSecuritySection = () => {
        return (
            <Box display='flex' justifyContent='center' sx={{ mb: 3 }}>
                <Grid container sx={{
                    padding: '0px 40px 0px 40px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignContent: 'center',
                    justifyContent: 'center'
                }}>
                    <Grid
                        xs={12}
                        item
                        sx={{ width: isSecurityPanelDrawer ? securityPanelWidth : '50%' }}
                    >
                        <Typography variant='h5' component='h3' color='textPrimary'>
                            <FormattedMessage
                                id='api.console.security.heading'
                                defaultMessage='Security'
                            />
                        </Typography>
                        <TextField
                            fullWidth
                            label={(
                                <FormattedMessage
                                    id='Apis.Details.TryOutConsole.token.label'
                                    defaultMessage='Internal API Key'
                                />
                            )}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            type='password'
                            value={apiKey}
                            helperText={decodedJWT ? (
                                <Box color='success.main'>
                                    {`Expires ${dayjs.unix(decodedJWT.payload.exp).fromNow()}`}
                                </Box>
                            ) : (
                                <FormattedMessage
                                    id='Apis.Details.TryOutConsole.token.helper'
                                    defaultMessage='Generate or provide an internal API Key'
                                />
                            )}
                            margin='normal'
                            variant='outlined'
                            name='internal'
                            multiline
                            rows={4}
                            onChange={(e) => setAPIKey(e.target.value)}
                            disabled={isAPIRetired}
                        />
                        <Button
                            onClick={generateInternalKey}
                            variant='contained'
                            color='primary'
                            disabled={
                                tasksStatus.generateKey.inProgress || isAPIRetired || isCreateOrPublishRestricted()
                            }
                        >
                            <FormattedMessage
                                id='Apis.Details.ApiConsole.generate.test.key'
                                defaultMessage='Generate Key'
                            />
                        </Button>
                        {tasksStatus.generateKey.inProgress
                            && (
                                <Box
                                    display='inline'
                                    position='absolute'
                                    mt={1}
                                    ml={-8}
                                >
                                    <CircularProgress size={24} />
                                </Box>
                            )}
                    </Grid>
                </Grid>
            </Box>
        );
    };

    const renderAPIGatewaysSection = () => {
        return (
            <Box display='flex' justifyContent='center'>
                <Grid container sx={{
                    padding: '0px 40px 0px 40px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignContent: 'center',
                    justifyContent: 'center'
                }}>
                    <Grid
                        xs={12}
                        item
                        sx={{ width: isSecurityPanelDrawer ? securityPanelWidth : '50%' }}
                    >
                        {(tasksStatus.getDeployments.completed && !deployments.length && !isAPIRetired) && (
                            <Alert variant='outlined' severity='error'>
                                <FormattedMessage
                                    id='Apis.Details.ApiConsole.deployments.no'
                                    defaultMessage={'{artifactType} is not deployed yet! Please deploy '
                                        + 'the {artifactType} before trying out'}
                                    values={{
                                        artifactType: getArtifactType()
                                    }}
                                />
                                <Link to={getBasePath(api.apiType) + api.id + '/deployments'}>
                                    <LaunchIcon
                                        color='primary'
                                        fontSize='small'
                                    />
                                </Link>
                            </Alert>
                        )}
                        {isAPIRetired && (
                            <Alert variant='outlined' severity='error'>
                                <FormattedMessage
                                    id='Apis.Details.ApiConsole.deployments.isAPIRetired'
                                    defaultMessage='Can not Try Out retired APIs!'
                                />
                            </Alert>
                        )}
                        {((deployments && deployments.length > 0))
                            && (
                                <>
                                    <Typography
                                        variant='h5'
                                        component='h3'
                                        color='textPrimary'
                                    >
                                        <FormattedMessage
                                            id='Apis.Details.ApiConsole.deployments.api.gateways'
                                            defaultMessage='Gateways'
                                        />
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        select
                                        label={(
                                            <FormattedMessage
                                                defaultMessage='Environment'
                                                id='Apis.Details.ApiConsole.environment'
                                            />
                                        )}
                                        value={(selectedDeployment && selectedDeployment.name) || ''}
                                        name='selectedEnvironment'
                                        onChange={deploymentSelectionHandler}
                                        margin='normal'
                                        variant='outlined'
                                        SelectProps={{
                                            MenuProps: {
                                                getContentAnchorEl: null,
                                            },
                                        }}
                                    >
                                        {deployments.map((deployment) => (
                                            <MenuItem
                                                value={deployment.name}
                                                key={deployment.name}
                                            >
                                                {deployment.displayName}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </>
                            )}
                    </Grid>
                </Grid>
            </Box>
        );
    };

    return (
        <>
            {isSecurityPanelDrawer ? (
                <>
                    {renderAPIGatewaysSection()}
                    {renderSecuritySection()}
                </>
            ) : (
                <>
                    {renderSecuritySection()}
                    {renderAPIGatewaysSection()}
                </>
            )}
        </>
    )
}

SecurityDetailsPanel.defaultProps = {
    securityPanelWidth: '50%',
    isSecurityPanelDrawer: false,
};

SecurityDetailsPanel.propTypes = {
    apiKey: PropTypes.string.isRequired,
    setAPIKey: PropTypes.func.isRequired,
    decodedJWT: PropTypes.shape({
        payload: PropTypes.shape({
            exp: PropTypes.number,
        }),
    }).isRequired,
    isAPIRetired: PropTypes.bool.isRequired,
    generateInternalKey: PropTypes.func.isRequired,
    tasksStatus: PropTypes.shape({
        generateKey: PropTypes.shape({
            inProgress: PropTypes.bool,
            completed: PropTypes.bool,
            error: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
        }).isRequired,
        getDeployments: PropTypes.shape({
            inProgress: PropTypes.bool,
            completed: PropTypes.bool,
            error: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
        }).isRequired,
    }).isRequired,
    deployments: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        displayName: PropTypes.string,
    })).isRequired,
    selectedDeployment: PropTypes.shape({
        name: PropTypes.string,
    }).isRequired,
    deploymentSelectionHandler: PropTypes.func.isRequired,
    getArtifactType: PropTypes.func.isRequired,
    securityPanelWidth: PropTypes.string, // Optional prop for custom width
    isSecurityPanelDrawer: PropTypes.bool,
};

export default SecurityDetailsPanel;