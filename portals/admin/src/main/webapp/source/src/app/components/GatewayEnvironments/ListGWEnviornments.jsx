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
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ListBase from 'AppComponents/AdminPages/Addons/ListBase';
import Delete from 'AppComponents/GatewayEnvironments/DeleteGWEnvironment';
import { useAppContext } from 'AppComponents/Shared/AppContext';
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import { styled } from '@mui/material/styles';
import CONSTS from 'AppData/Constants';
import Permission from './Permission';
import ListGatewayInstances from './ListGatewayInstances';
import {
    getAdditionalPropertiesAsMap,
    getGatewayStatusChipProps,
    resolvePlatformGatewayStatus,
    WSO2_SELF_HOSTED_GATEWAY_TYPES,
} from './PlatformGatewayUtils';
import Utils from '../../data/Utils';

const WSO2_LISTING_GATEWAY_TYPES = WSO2_SELF_HOSTED_GATEWAY_TYPES;

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

// Consolidated styles for better readability
const styles = {
    buttonContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        mr: 0.5,
    },
    primaryButton: {
        px: 2,
        py: 0.75,
        borderRadius: '8px',
        textTransform: 'none',
        fontWeight: 500,
        fontSize: '0.75rem',
        backgroundColor: 'rgb(25, 120, 210)',
        '&:hover': {
            backgroundColor: 'rgb(0, 109, 179)',
        },
    },
    emptyStateButton: {
        px: 2,
        py: 0.75,
        borderRadius: '8px',
        textTransform: 'none',
        fontWeight: 500,
        fontSize: '0.75rem',
        backgroundColor: '#0E4A72',
        '&:hover': {
            backgroundColor: '#0A3C5D',
        },
    },
    tabs: {
        pl: 0,
        minHeight: 40,
        borderBottom: '1px solid #D8DDE6',
        '& .MuiTabs-flexContainer': {
            justifyContent: 'flex-start',
        },
        '& .MuiTabs-indicator': {
            height: 2,
            backgroundColor: '#0E4A72',
        },
        '& .MuiTab-root': {
            minHeight: 40,
            textTransform: 'none',
            fontWeight: 500,
            fontFamily: 'inherit',
            fontSize: '0.75rem',
            color: 'text.secondary',
            mr: 1,
            px: 2,
            minWidth: 'auto',
            border: 'none',
        },
        '& .Mui-selected': {
            color: '#0E4A72',
            fontWeight: 700,
        },
    },
    emptyStateContainer: {
        minHeight: '42vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        textAlign: 'center',
        px: 2,
    },
    panel: {
        border: '1px solid #D8DDE6',
        borderRadius: '10px',
        backgroundColor: '#fff',
        overflow: 'hidden',
    },
    toolbar: {
        pl: 0,
        pr: 2,
        py: 1,
        backgroundColor: '#fff',
    },
    table: {
        '& .MuiPaper-root': {
            boxShadow: 'none',
            borderRadius: 0,
        },
        '& .MuiTableCell-head': {
            fontWeight: 500,
            color: '#8A94A6',
            fontSize: '0.8rem',
            borderBottom: '1px solid #EEF1F6',
        },
        '& .MuiTableCell-body': {
            fontSize: '0.75rem',
            borderBottom: '1px solid #EEF1F6',
            color: '#2F3441',
        },
        '& .MuiTableRow-root:last-of-type .MuiTableCell-body': {
            borderBottom: 'none',
        },
    },
    searchTextField: {
        '& .MuiInputBase-root': {
            fontSize: '0.75rem',
        },
        '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            backgroundColor: '#fff',
        },
        '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#D8DDE6',
        },
    },
};

/**
 * Maps a regular environment entry into the table row shape.
 */
const mapEnvironmentItem = (item) => {
    const additionalProperties = getAdditionalPropertiesAsMap(
        item.additionalProperties,
    );
    const platformGatewayId = additionalProperties.platformGatewayId || null;
    const isPlatformGateway = item.gatewayType === CONSTS.GATEWAY_TYPE.apiPlatform
        || Boolean(platformGatewayId);
    const gatewayStatus = resolvePlatformGatewayStatus(
        isPlatformGateway,
        additionalProperties.isActive,
    );
    return {
        ...item,
        id: Utils.encodeEnvironmentId(item.id),
        platformGatewayId,
        isPlatformGateway,
        gatewayTypeDisplay: isPlatformGateway
            ? CONSTS.GATEWAY_TYPE.apiPlatform
            : item.gatewayType || '-',
        gatewayStatus,
    };
};

/**
 * Maps a platform gateway entry into the shared table row shape.
 */
const mapPlatformGatewayItem = (item) => {
    const rawId = item.id || item.name || item.displayName || '';
    const encodedId = rawId ? Utils.encodeEnvironmentId(rawId) : '';
    const vhosts = item.vhost
        ? [{ host: item.vhost, httpsPort: 443, httpContext: '' }]
        : [];
    return {
        id: encodedId,
        name: item.name || item.displayName || rawId,
        displayName: item.displayName || item.name || rawId,
        description: item.description || '',
        gatewayTypeDisplay: CONSTS.GATEWAY_TYPE.apiPlatform,
        gatewayStatus: resolvePlatformGatewayStatus(true, item.isActive),
        vhosts,
        permissions: item.permissions || {
            permissionType: 'PUBLIC',
            roles: [],
        },
        isPlatformGateway: true,
        platformGatewayId: item.id || null,
        isReadOnly: false,
    };
};

/**
 * Custom Edit button for Gateway environments that routes to the correct page
 * based on whether it's a platform gateway or regular environment.
 */
const GatewayEditButton = ({ dataRow }) => {
    const history = useHistory();
    if (!dataRow) {
        return null;
    }

    const handleClick = () => {
        if (dataRow.isPlatformGateway && dataRow.platformGatewayId) {
            history.push(
                `/settings/environments/platform-gateways/${dataRow.platformGatewayId}`,
            );
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
            disabled={
                (dataRow.isReadOnly && !dataRow.isPlatformGateway)
                    || (dataRow.isPlatformGateway && !dataRow.platformGatewayId)
            }
        >
            <EditIcon aria-label={`edit-gateway-${dataRow.id}`} />
        </IconButton>
    );
};

/**
 * API call to get Gateway labels
 * @returns {Promise}.
 */
const apiCall = () => {
    const restApi = new API();
    return Promise.all([
        restApi.getGatewayEnvironmentList().catch((error) => {
            const status = error?.response?.status || error?.status;
            if (status === 404) {
                return { body: { list: [] } };
            }
            throw error;
        }),
        restApi.getPlatformGatewayList().catch((error) => {
            const status = error?.response?.status || error?.status;
            if (status === 404) {
                return { body: { list: [] } };
            }
            throw error;
        }),
    ])
        .then(([environmentResult, platformGatewayResult]) => {
            const environmentList = environmentResult?.body?.list || [];
            const platformGatewayList = platformGatewayResult?.body?.list || [];

            const mappedEnvironments = environmentList.map(mapEnvironmentItem);
            const mappedPlatformGateways = platformGatewayList.map(
                mapPlatformGatewayItem,
            );

            // Avoid duplicate rows when platform gateways are present in both sources.
            const existingPlatformGatewayIds = new Set(
                mappedEnvironments
                    .map((gateway) => gateway.platformGatewayId)
                    .filter(Boolean),
            );
            const existingNames = new Set(
                mappedEnvironments
                    .map((gateway) => (gateway.name || '').toLowerCase())
                    .filter(Boolean),
            );
            const nonDuplicatePlatformGateways = mappedPlatformGateways.filter(
                (gateway) => {
                    if (
                        gateway.platformGatewayId && existingPlatformGatewayIds.has(
                            gateway.platformGatewayId,
                        )
                    ) {
                        return false;
                    }
                    const normalizedName = (gateway.name || '').toLowerCase();
                    if (normalizedName && existingNames.has(normalizedName)) {
                        return false;
                    }
                    return true;
                },
            );

            return [...mappedEnvironments, ...nonDuplicatePlatformGateways];
        })
        .catch((error) => {
            throw error;
        });
};

GatewayEditButton.propTypes = {
    dataRow: PropTypes.shape({
        id: PropTypes.string,
        isReadOnly: PropTypes.bool,
        isPlatformGateway: PropTypes.bool,
        platformGatewayId: PropTypes.string,
    }),
};

GatewayEditButton.defaultProps = {
    dataRow: null,
};

/**
 * Render a list
 * @returns {JSX} Header AppBar components.
 */
export default function ListGWEnviornments() {
    const intl = useIntl();
    const { settings } = useAppContext();
    const history = useHistory();
    const [selectedCategory, setSelectedCategory] = useState('wso2');
    const [visibleGatewayCount, setVisibleGatewayCount] = useState(null);
    // Dialog state for Live Gateways
    const [liveGatewaysOpen, setLiveGatewaysOpen] = useState(false);
    const [selectedEnvId, setSelectedEnvId] = useState(null);
    const [selectedEnvName, setSelectedEnvName] = useState('');
    const [selectedGatewayStatus, setSelectedGatewayStatus] = useState(null);

    const handleOpenLiveGateways = (envId, envName, gatewayStatus) => {
        setSelectedEnvId(envId);
        setSelectedEnvName(envName);
        setSelectedGatewayStatus(gatewayStatus);
        setLiveGatewaysOpen(true);
    };

    const handleCloseLiveGateways = () => {
        setLiveGatewaysOpen(false);
        setSelectedEnvId(null);
        setSelectedEnvName('');
        setSelectedGatewayStatus(null);
    };
    const isWSO2Gateway = (gateway) => {
        return WSO2_LISTING_GATEWAY_TYPES.includes(gateway.gatewayTypeDisplay);
    };

    const filterGatewayList = (gatewayList) => {
        if (selectedCategory === 'wso2') {
            return gatewayList.filter((gateway) => isWSO2Gateway(gateway));
        }
        return gatewayList.filter((gateway) => !isWSO2Gateway(gateway));
    };

    const apiCallForSelectedTab = () => {
        return apiCall().then((gatewayList) => {
            const filteredGateways = filterGatewayList(gatewayList);
            setVisibleGatewayCount(filteredGateways.length);
            return filteredGateways;
        });
    };

    const openSelfHostedGatewayPage = () => {
        history.push('/settings/environments/create?category=wso2');
    };

    const isGatewayTypeAvailable = settings.gatewayTypes.length >= 2;
    let idColumnIndex = 5;
    if (settings.isGatewayNotificationEnabled) {
        idColumnIndex += 1;
    }
    if (isGatewayTypeAvailable) {
        idColumnIndex += 1;
    }
    const rowIndexes = {
        name: 0,
        displayName: 1,
        gatewayTypeDisplay: isGatewayTypeAvailable ? 2 : -1,
        gatewayStatus: isGatewayTypeAvailable ? 3 : 2,
        id: idColumnIndex,
    };

    // Helper: universal gateways store full URL in `host`
    // regular gateways store hostname only — avoid prepending https:// twice.
    const formatVhostDisplayUrl = (vhost) => {
        const host = vhost.host || '';
        const contextPart = vhost.httpContext
            ? `/${String(vhost.httpContext).replace(/^\//g, '')}`
            : '';
        if (/^https?:\/\//i.test(host)) {
            return host + contextPart;
        }
        // API may send httpsPort as string "443"; strict === 443 failed and produced a bogus ":443" suffix.
        const portRaw = vhost.httpsPort;
        const portNum = portRaw === undefined || portRaw === null || portRaw === ''
            ? NaN
            : Number(portRaw);
        const portPart = Number.isFinite(portNum) && portNum !== 443 ? `:${portNum}` : '';
        return `https://${host}${portPart}${contextPart}`;
    };

    // Helper function to render virtual hosts
    const renderVhosts = (vhosts) => {
        return vhosts.map((vhost) => (
            <div key={`${vhost.host}:${vhost.httpsPort}`}>
                {formatVhostDisplayUrl(vhost)}
            </div>
        ));
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

    const renderGatewayType = (gatewayType) => {
        if (gatewayType === 'APIPlatform') {
            return intl.formatMessage({
                id: 'Gateways.AddEditGateway.title.platform',
                defaultMessage: 'API Platform Gateway',
            });
        }
        return gatewayType || '-';
    };

    // Helper function to render gateway instances
    const getRowValue = (tableMeta, columnName) => {
        const columnIndex = rowIndexes[columnName];
        if (columnIndex === -1) {
            return undefined;
        }
        return tableMeta.rowData[columnIndex];
    };

    const renderGatewayInstances = (value, tableMeta) => {
        const gatewayType = getRowValue(tableMeta, 'gatewayTypeDisplay') || 'Regular';
        const normalizedGatewayType = String(gatewayType).toLowerCase();
        const isRegularGateway = normalizedGatewayType === 'regular';
        const isPlatformGateway = normalizedGatewayType === 'apiplatform'
            || normalizedGatewayType.includes('platform gateway');
        const isDisabled = !(isRegularGateway || isPlatformGateway);
        const gatewayStatus = getRowValue(tableMeta, 'gatewayStatus');

        if (isPlatformGateway) {
            if (!gatewayStatus) {
                return '-';
            }
            return (
                <Chip
                    size='small'
                    label={gatewayStatus}
                    {...getGatewayStatusChipProps(gatewayStatus)}
                />
            );
        }

        const gatewayId = getRowValue(tableMeta, 'id');
        const gatewayName = getRowValue(tableMeta, 'displayName')
            || getRowValue(tableMeta, 'name') || '';

        const button = (
            <IconButton
                onClick={() => handleOpenLiveGateways(
                    gatewayId,
                    gatewayName,
                    gatewayStatus,
                )}
                disabled={isDisabled}
            >
                <FormatListBulletedIcon aria-label='gateway-instances-list-icon' />
            </IconButton>
        );

        return isDisabled ? (
            <StyledTooltip
                title={intl.formatMessage({
                    id:
                        'AdminPages.Gateways.table.gatewayInstances.tooltip.'
                            + 'notSupported',
                    defaultMessage: 'Not supported for this gateway type',
                })}
            >
                <span>{button}</span>
            </StyledTooltip>
        ) : (
            button
        );
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
        ...(isGatewayTypeAvailable
            ? [
                {
                    name: 'gatewayTypeDisplay',
                    label: intl.formatMessage({
                        id: 'AdminPages.Gateways.table.header.gatewayType',
                        defaultMessage: 'Gateway Type',
                    }),
                    options: {
                        sort: false,
                        customBodyRender: renderGatewayType,
                    },
                },
            ]
            : []),
        { name: 'gatewayStatus', options: { display: false } },
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
        ...(settings.isGatewayNotificationEnabled
            ? [
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
            ]
            : []),
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
            id: 'AdminPages.Gateways.List.search.compact',
            defaultMessage: 'Search gateways...',
        }),
        active: visibleGatewayCount !== 0,
    };
    const pageProps = {
        pageStyle: 'half',
        title: intl.formatMessage({
            id: 'AdminPages.Gateways.List.title.gateways',
            defaultMessage: 'Gateways',
        }),
    };

    const emptyBoxProps = {
        content: (
            <Typography variant='body2' color='textSecondary' component='p'>
                <FormattedMessage
                    id='AdminPages.Gateways.List.empty.content.Gateways'
                    defaultMessage={
                        'It is possible to create a Gateway environment with virtual hosts to access APIs.'
                        + ' API revisions can be attached with Vhost to access it.'
                    }
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
        if (visibleGatewayCount === 0) {
            return null;
        }
        if (selectedCategory === 'wso2') {
            return (
                <Box sx={styles.buttonContainer}>
                    <Button
                        variant='contained'
                        color='primary'
                        size='small'
                        startIcon={<AddIcon />}
                        onClick={openSelfHostedGatewayPage}
                        data-testid='add-wso2-gateway-btn'
                        sx={styles.primaryButton}
                    >
                        {intl.formatMessage({
                            id: 'Gateways.ListGatewayEnvironments.addSelfHostedGateway',
                            defaultMessage: 'Add WSO2 Gateway',
                        })}
                    </Button>
                </Box>
            );
        }
        return (
            <Box sx={styles.buttonContainer}>
                <Button
                    component={RouterLink}
                    to='/settings/environments/create?category=third-party'
                    variant='contained'
                    color='primary'
                    size='small'
                    startIcon={<AddIcon />}
                    data-testid='form-dialog-base-trigger-btn'
                    sx={styles.primaryButton}
                >
                    {intl.formatMessage({
                        id: 'Gateways.ListGatewayEnvironments.addThirdPartyGateway',
                        defaultMessage: 'Add Gateway',
                    })}
                </Button>
            </Box>
        );
    };

    const tabbedToolbar = (
        <Tabs
            value={selectedCategory}
            onChange={(_, value) => setSelectedCategory(value)}
            aria-label='gateway-category-tabs'
            sx={styles.tabs}
        >
            <Tab
                value='wso2'
                label={intl.formatMessage({
                    id: 'Gateways.ListGatewayEnvironments.tabs.apiPlatform',
                    defaultMessage: 'WSO2 Gateways',
                })}
            />
            <Tab
                value='third-party'
                label={intl.formatMessage({
                    id: 'Gateways.ListGatewayEnvironments.tabs.thirdParty',
                    defaultMessage: 'Third Party Gateways',
                })}
            />
        </Tabs>
    );

    const centeredEmptyState = (
        <Box sx={styles.emptyStateContainer}>
            <Typography variant='body2' color='text.secondary'>
                {intl.formatMessage({
                    id: 'Gateways.ListGatewayEnvironments.empty.description',
                    defaultMessage:
                        'Add third party gateways to discover, manage, and govern APIs'
                            + ' across providers from a single control plane.',
                })}
            </Typography>
            {selectedCategory === 'wso2' ? (
                <Button
                    variant='contained'
                    size='small'
                    startIcon={<AddIcon />}
                    onClick={openSelfHostedGatewayPage}
                    sx={styles.emptyStateButton}
                >
                    {intl.formatMessage({
                        id: 'Gateways.ListGatewayEnvironments.addSelfHostedGateway',
                        defaultMessage: 'Add WSO2 Gateway',
                    })}
                </Button>
            ) : (
                <Button
                    component={RouterLink}
                    to='/settings/environments/create?category=third-party'
                    variant='contained'
                    size='small'
                    startIcon={<AddIcon />}
                    sx={styles.primaryButton}
                >
                    {intl.formatMessage({
                        id: 'Gateways.ListGatewayEnvironments.addThirdPartyGateway',
                        defaultMessage: 'Add Gateway',
                    })}
                </Button>
            )}
        </Box>
    );

    return (
        <>
            <ListBase
                key={selectedCategory}
                columProps={columProps}
                pageProps={pageProps}
                addButtonProps={addButtonProps}
                searchProps={searchProps}
                searchIconInside
                toolbarContent={tabbedToolbar}
                toolbarContentSx={{ pl: 0 }}
                showReload={false}
                panelSx={styles.panel}
                toolbarSx={styles.toolbar}
                tableSx={styles.table}
                searchTextFieldProps={{
                    variant: 'outlined',
                    size: 'small',
                    sx: styles.searchTextField,
                }}
                options={{
                    pagination: false,
                    rowsPerPage: 10,
                    responsive: 'standard',
                }}
                noDataMessage={centeredEmptyState}
                preserveToolbarOnEmpty
                emptyBoxProps={emptyBoxProps}
                apiCall={apiCallForSelectedTab}
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
                gatewayStatus={selectedGatewayStatus}
            />
        </>
    );
}
