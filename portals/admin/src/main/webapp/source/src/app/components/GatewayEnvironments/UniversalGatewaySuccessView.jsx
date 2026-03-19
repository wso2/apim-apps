/* eslint-disable object-curly-newline, operator-linebreak */
/*
 * Copyright (c) 2026 WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
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
import { Alert as MuiAlert, Box, Button, Divider, Grid, Link, Paper, TextField, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link as RouterLink } from 'react-router-dom';
import { useIntl } from 'react-intl';
import QuickStartGuide from './UniversalGatewayQuickStartGuide';
import { gatewayShape, getPlatformGatewayUrl, PERMISSION_TYPE_OPTIONS } from './UniversalGatewayUtils';

// Consolidated styles for better readability
const styles = {
    backLink: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        mb: 2,
    },
    readOnlyTextField: {
        '& .MuiOutlinedInput-root': {
            backgroundColor: '#f5f5f5',
        },
    },
    divider: {
        width: '95%',
        mx: 'auto',
        my: 3,
        opacity: 0.1,
    },
    actionsContainer: {
        p: 3,
        display: 'flex',
        gap: 2,
        flexWrap: 'wrap',
    },
};

const UniversalGatewaySuccessView = ({
    gateway,
    onAddAnother,
    onReconfigureRequested,
    reconfigureLoading,
    isViewMode = false,
    showTokenCommands = true,
    hideHeader = false,
}) => {
    const intl = useIntl();
    const t = (id, defaultMessage, values) => intl.formatMessage({ id, defaultMessage }, values);
    const gatewayUrl = getPlatformGatewayUrl(gateway);
    const permissionTypeValue = gateway?.permissions?.permissionType || 'PUBLIC';
    const permissionRoles = gateway?.permissions?.roles || [];

    const getVisibilityLabel = () => {
        const option = PERMISSION_TYPE_OPTIONS.find((item) => item.value === permissionTypeValue);
        return option ? t(option.labelKey, option.defaultMessage) : permissionTypeValue;
    };

    return (
        <>
            {!hideHeader && (
                <Box sx={{ mb: 3 }}>
                    <Link
                        component={RouterLink}
                        to='/settings/environments'
                        underline='none'
                        sx={styles.backLink}
                    >
                        <ArrowBackIcon fontSize='small' />
                        {t('Gateways.UniversalGatewayManagement.navigation.back', 'Back to Gateways')}
                    </Link>
                    <Typography variant='h4' sx={{ fontWeight: 700 }}>
                        {gateway.displayName || gateway.name}
                    </Typography>
                    {!isViewMode && (
                        <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
                            {t(
                                'Gateways.UniversalGatewayManagement.create.success.title',
                                'Gateway created successfully',
                            )}
                        </Typography>
                    )}
                </Box>
            )}

            {!isViewMode && (
                <MuiAlert severity='success' sx={{ mb: 3 }}>
                    {t(
                        'Gateways.UniversalGatewayManagement.create.success.banner',
                        'Your gateway has been registered. Follow the quick start guide below.',
                    )}
                </MuiAlert>
            )}

            <Paper elevation={1} sx={{ mb: 2, overflow: 'hidden' }}>
                <Box sx={{ p: 3 }}>
                    <Typography variant='h6' sx={{ mb: 2 }}>
                        {t('Gateways.UniversalGatewayManagement.configuration.title', 'Configuration')}
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label={t('Gateways.UniversalGatewayManagement.configuration.url', 'URL')}
                                value={gatewayUrl}
                                InputProps={{
                                    readOnly: true,
                                }}
                                variant='outlined'
                                size='small'
                                sx={styles.readOnlyTextField}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label={t('Gateways.UniversalGatewayManagement.configuration.visibility', 'Visibility')}
                                value={getVisibilityLabel()}
                                InputProps={{
                                    readOnly: true,
                                }}
                                variant='outlined'
                                size='small'
                                sx={styles.readOnlyTextField}
                            />
                        </Grid>
                        {permissionRoles.length > 0 && (
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label={t('Gateways.UniversalGatewayManagement.configuration.roles', 'Roles')}
                                    value={permissionRoles.join(', ')}
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    variant='outlined'
                                    size='small'
                                    sx={styles.readOnlyTextField}
                                />
                            </Grid>
                        )}
                    </Grid>
                </Box>
                <Divider sx={styles.divider} />
                <Box sx={{ px: 3, pb: 3 }}>
                    <QuickStartGuide
                        key={showTokenCommands ? 'with-token' : 'no-token'}
                        gateway={gateway}
                        showReconfigureAction={isViewMode}
                        onReconfigureRequested={onReconfigureRequested}
                        reconfigureLoading={reconfigureLoading}
                        showTokenCommands={showTokenCommands}
                        embedded
                    />
                </Box>
                {onAddAnother && (
                    <Box sx={styles.actionsContainer}>
                        <Button variant='outlined' color='primary' onClick={onAddAnother}>
                            {t('Gateways.UniversalGatewayManagement.action.add.another', 'Add Another Gateway')}
                        </Button>
                    </Box>
                )}
            </Paper>
        </>
    );
};

UniversalGatewaySuccessView.propTypes = {
    gateway: gatewayShape,
    onAddAnother: PropTypes.func,
    onReconfigureRequested: PropTypes.func,
    reconfigureLoading: PropTypes.bool,
    isViewMode: PropTypes.bool,
    showTokenCommands: PropTypes.bool,
    hideHeader: PropTypes.bool,
};

UniversalGatewaySuccessView.defaultProps = {
    gateway: null,
    onAddAnother: null,
    onReconfigureRequested: null,
    reconfigureLoading: false,
    isViewMode: false,
    showTokenCommands: true,
    hideHeader: false,
};

export default UniversalGatewaySuccessView;
