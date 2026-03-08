/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React, { useState } from 'react';
import API from 'AppData/api';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ListBase from 'AppComponents/AdminPages/Addons/ListBase';
import Delete from 'AppComponents/GatewayEnvironments/DeleteGWEnvironment';
import { useAppContext } from 'AppComponents/Shared/AppContext';
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import { styled } from '@mui/material/styles';
import Permission from './Permission';
import ListGatewayInstances from './ListGatewayInstances';
import Utils from '../../data/Utils';

const StyledTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
    '& .MuiTooltip-tooltip': {
        backgroundColor: theme.palette.common.white,
        color: theme.palette.text.primary,
        fontSize: theme.typography.pxToRem(14),
        boxShadow: theme.shadows[4],
        borderRadius: theme.shape.borderRadius,
        border: `1px solid ${theme.palette.divider}`,
    },
}));

const getAdditionalPropertiesAsMap = (additionalProperties = []) => {
    return Object.fromEntries(additionalProperties.map((property) => [property.key, property.value]));
};

/**
 * Custom Edit button for Gateway environments that routes to the correct page
 * based on whether it's a platform gateway or regular environment.
 */
function GatewayEditButton({ dataRow }) {
    const history = useHistory();

    const handleClick = () => {
        if (dataRow.isPlatformGateway && dataRow.platformGatewayId) {
            history.push(`/settings/environments/platform-gateways/${dataRow.platformGatewayId}`);
            return;
        }
        history.push(`/settings/environments/${dataRow.id}`);
    };

    return (
        <IconButton
            color='primary'
            component='span'
            size='large'
            onClick={handleClick}
            disabled={(dataRow.isReadOnly && !dataRow.isPlatformGateway)
                || (dataRow.isPlatformGateway && !dataRow.platformGatewayId)}
        >
            <EditIcon aria-label={`edit-gateway-${dataRow.id}`} />
        </IconButton>
    );
}

/**
 * API call to get Gateway labels
 * @returns {Promise}.
 */
function apiCall() {
    const restApi = new API();
    return restApi.getGatewayEnvironmentList()
        .then((environmentResult) => {
            return environmentResult.body.list.map((item) => {
                const additionalProperties = getAdditionalPropertiesAsMap(item.additionalProperties);
                const platformGatewayId = additionalProperties.platformGatewayId || null;
                const isPlatformGateway = item.gatewayType === 'api-platform'
                    || Boolean(platformGatewayId);

                // Get status from additionalProperties for platform gateways
                const gatewayStatus = isPlatformGateway && additionalProperties.isActive
                    ? (additionalProperties.isActive === 'true' ? 'Active' : 'Inactive')
                    : null;
                return {
                    ...item,
                    id: Utils.encodeEnvironmentId(item.id),
                    platformGatewayId,
                    isPlatformGateway,
                    gatewayTypeDisplay: isPlatformGateway ? 'Platform Gateway' : (item.gatewayType || '-'),
                    gatewayStatus,
                };
            });
        })
        .catch((error) => {
            throw error;
        });
}

/**
 * Render a list
 * @returns {JSX} Header AppBar components.
 */
export default function ListGWEnviornments() {
    const intl = useIntl();
    const { settings } = useAppContext();
    // Dialog state for Live Gateways
    const [liveGatewaysOpen, setLiveGatewaysOpen] = useState(false);
    const [selectedEnvId, setSelectedEnvId] = useState(null);
    const [selectedEnvName, setSelectedEnvName] = useState('');

    const handleOpenLiveGateways = (envId, envName) => {
        setSelectedEnvId(envId);
        setSelectedEnvName(envName);
        setLiveGatewaysOpen(true);
    };

    const handleCloseLiveGateways = () => {
        setLiveGatewaysOpen(false);
        setSelectedEnvId(null);
        setSelectedEnvName('');
    };

    const isGatewayTypeAvailable = settings.gatewayTypes.length >= 2;

    // Helper function to render virtual hosts
    const renderVhosts = (vhosts) => {
        return (
            vhosts.map((vhost) => (
                <div key={`${vhost.host}:${vhost.httpsPort}`}>
                    {
                        'https://' + vhost.host + (vhost.httpsPort === 443 ? '' : ':' + vhost.httpsPort)
                        + (vhost.httpContext ? '/' + vhost.httpContext.replace(/^\//g, '') : '')
                    }
                </div>
            ))
        );
    };

    // Helper function to render permissions
    const renderPermissions = (permissions) => {
        return (
            <div>
                <Permission
                    type={permissions.permissionType}
                    roles={permissions.roles}
                />
            </div>
        );
    };

    const renderGatewayStatus = (status) => {
        if (!status) {
            return '-';
        }
        const isActive = status === 'Active';
        return (
            <Chip
                size='small'
                label={status}
                color={isActive ? 'success' : 'default'}
                variant={isActive ? 'filled' : 'outlined'}
            />
        );
    };

    // Helper function to render gateway instances
    const renderGatewayInstances = (value, tableMeta) => {
        if (typeof tableMeta.rowData === 'object') {
            const envId = tableMeta.rowData[isGatewayTypeAvailable ? 9 : 8];
            const envName = tableMeta.rowData[1]; // 'displayName'
            // Default to 'Regular' if no gatewayType column
            const gatewayType = isGatewayTypeAvailable ? tableMeta.rowData[2] : 'Regular';
            const isDisabled = gatewayType !== 'Regular';

            const button = (
                <IconButton
                    onClick={() => handleOpenLiveGateways(envId, envName)}
                    disabled={isDisabled}
                >
                    <FormatListBulletedIcon aria-label='gateway-instances-list-icon' />
                </IconButton>
            );

            return isDisabled ? (
                <StyledTooltip
                    title={intl.formatMessage({
                        id: 'AdminPages.Gateways.table.gatewayInstances.tooltip.'
                            + 'notSupported',
                        defaultMessage: 'Not supported for this gateway type',
                    })}
                >
                    <span>{button}</span>
                </StyledTooltip>
            ) : button;
        } else {
            return <div />;
        }
    };

    // Build column configuration
    const columProps = [
        { name: 'name', options: { display: false } },
        {
            name: 'displayName',
            label: intl.formatMessage({
                id: 'AdminPages.Gateways.table.header.displayName',
                defaultMessage: 'Name',
            }),
            options: {
                sort: true,
            },
        },
        // Conditionally include gatewayType column
        ...(isGatewayTypeAvailable ? [
            {
                name: 'gatewayTypeDisplay',
                label: intl.formatMessage({
                    id: 'AdminPages.Gateways.table.header.gatewayType',
                    defaultMessage: 'Gateway Type',
                }),
                options: {
                    sort: false,
                },
            },
        ] : []),
        {
            name: 'type',
            label: intl.formatMessage({
                id: 'AdminPages.Gateways.table.header.type',
                defaultMessage: 'Type',
            }),
            options: {
                sort: false,
            },
        },
        {
            name: 'gatewayStatus',
            label: intl.formatMessage({
                id: 'AdminPages.Gateways.table.header.gatewayStatus',
                defaultMessage: 'Status',
            }),
            options: {
                sort: false,
                customBodyRender: renderGatewayStatus,
            },
        },
        {
            name: 'description',
            label: intl.formatMessage({
                id: 'AdminPages.Gateways.table.header.description',
                defaultMessage: 'Description',
            }),
            options: {
                sort: false,
            },
        },
        {
            name: 'vhosts',
            label: intl.formatMessage({
                id: 'AdminPages.Gateways.table.header.vhosts',
                defaultMessage: 'Virtual Host(s)',
            }),
            options: {
                sort: false,
                customBodyRender: renderVhosts,
            },
        },
        {
            name: 'permissions',
            label: intl.formatMessage({
                id: 'AdminPages.Gateways.table.header.permission',
                defaultMessage: 'Visibility',
            }),
            options: {
                sort: false,
                customBodyRender: renderPermissions,
            },
        },
        // Conditionally include gateway instances column
        ...(settings.isGatewayNotificationEnabled ? [
            {
                name: 'gatewayInstances',
                label: intl.formatMessage({
                    id: 'AdminPages.Gateways.table.header.gatewayInstances',
                    defaultMessage: 'Gateway Instances',
                }),
                options: {
                    sort: false,
                    customBodyRender: renderGatewayInstances,
                },
            },
        ] : []),
        { name: 'id', options: { display: false } },
    ];
    const addButtonProps = {
        triggerButtonText: intl.formatMessage({
            id: 'AdminPages.Gateways.List.addButtonProps.triggerButtonText',
            defaultMessage: 'Add Gateway Environment',
        }),
        /* This title is what as the title of the popup dialog box */
        title: intl.formatMessage({
            id: 'AdminPages.Gateways.List.addButtonProps.title',
            defaultMessage: 'Add Gateway Environment',
        }),
    };
    const searchProps = {
        searchPlaceholder: intl.formatMessage({
            id: 'AdminPages.Gateways.List.search.default',
            defaultMessage: 'Search Gateway by Name, Description or Host',
        }),
        active: true,
    };
    const pageProps = {
        pageStyle: 'half',
        title: intl.formatMessage({
            id: 'AdminPages.Gateways.List.title',
            defaultMessage: 'Gateway Environments',
        }),
    };

    const emptyBoxProps = {
        content: (
            <Typography variant='body2' color='textSecondary' component='p'>
                <FormattedMessage
                    id='AdminPages.Gateways.List.empty.content.Gateways'
                    defaultMessage={'It is possible to create a Gateway environment with virtual hosts to access APIs.'
                    + ' API revisions can be attached with Vhost to access it.'}
                />
            </Typography>
        ),
        title: (
            <Typography gutterBottom variant='h5' component='h2'>
                <FormattedMessage
                    id='AdminPages.Gateways.List.empty.title'
                    defaultMessage='Gateway Environments'
                />
            </Typography>
        ),
    };

    const addCreateButton = () => {
        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mr: 0.5,
                }}
            >
                <Button
                    component={RouterLink}
                    to='/settings/environments/platform-gateways'
                    variant='outlined'
                    color='primary'
                    size='small'
                >
                    {intl.formatMessage({
                        id: 'Gateways.ListGatewayEnvironments.managePlatformGateways',
                        defaultMessage: 'Manage Platform Gateways',
                    })}
                </Button>
                <Button
                    component={RouterLink}
                    to='/settings/environments/create'
                    variant='contained'
                    color='primary'
                    size='small'
                    data-testid='form-dialog-base-trigger-btn'
                >
                    {intl.formatMessage({
                        id: 'Gateways.ListGatewayEnvironments.addNewGatewayEnvironment',
                        defaultMessage: 'Add Gateway Environment',
                    })}
                </Button>
            </Box>
        );
    };

    return (
        <>
            <ListBase
                columProps={columProps}
                pageProps={pageProps}
                addButtonProps={addButtonProps}
                searchProps={searchProps}
                emptyBoxProps={emptyBoxProps}
                apiCall={apiCall}
                EditComponent={GatewayEditButton}
                addButtonOverride={addCreateButton()}
                editComponentProps={{
                    icon: <EditIcon />,
                    title: 'Edit Gateway',
                }}
                DeleteComponent={Delete}
            />
            <ListGatewayInstances
                open={liveGatewaysOpen}
                onClose={handleCloseLiveGateways}
                environmentId={selectedEnvId}
                environmentName={selectedEnvName}
            />
        </>
    );
}
