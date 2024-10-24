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
import { useIntl, FormattedMessage } from 'react-intl';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import HelpBase from 'AppComponents/AdminPages/Addons/HelpBase';
import ListBase from 'AppComponents/AdminPages/Addons/ListBase';
import DescriptionIcon from '@mui/icons-material/Description';
import Link from '@mui/material/Link';
import Configurations from 'Config';
import Delete from 'AppComponents/Throttling/Subscription/Delete';
import API from 'AppData/api';
import CONSTS from 'AppData/Constants';
import EditIcon from '@mui/icons-material/Edit';
import { Link as RouterLink } from 'react-router-dom';
import {
    Button, Menu, MenuItem, Table, TableHead, TableBody, TableRow, TableCell,
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

/**
 * Render a list
 * @returns {JSX} Header AppBar components.
 */
export default function ListSubscriptionThrottlingPolicies() {
    const intl = useIntl();
    const restApi = new API();
    const enableCollapsable = true;
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMenuItemClick = () => {
        setAnchorEl(null);
    };

    const searchProps = {
        searchPlaceholder: intl.formatMessage({
            id: 'Throttling.Subscription.Policy..List.search.default',
            defaultMessage: 'Search by Subscription Policy name',
        }),
        active: true,
    };
    const pageProps = {
        help: (
            <HelpBase>
                <List component='nav' aria-label='main mailbox folders'>
                    <ListItem button>
                        <ListItemIcon>
                            <DescriptionIcon />
                        </ListItemIcon>
                        <Link
                            target='_blank'
                            href={Configurations.app.docUrl
                                + 'design/rate-limiting/adding-new-throttling-policies/'
                                + '#adding-a-new-subscription-level-throttling-tier'}
                            underline='hover'
                        >
                            <ListItemText primary={(
                                <FormattedMessage
                                    id='Throttling.Subscription.Policy.List.help.link.one'
                                    defaultMessage='Creating a Subscription Rate Limiting Policy'
                                />
                            )}
                            />

                        </Link>
                    </ListItem>
                    <ListItem button>
                        <ListItemIcon>
                            <DescriptionIcon />
                        </ListItemIcon>
                        <Link
                            target='_blank'
                            href={Configurations.app.docUrl
                                + 'design/rate-limiting/setting-throttling-limits/'
                                + '#subscription-level-throttling-api-publisher'}
                            underline='hover'
                        >
                            <ListItemText primary={(
                                <FormattedMessage
                                    id='Throttling.Subscription.Policy.List.help.link.two'
                                    defaultMessage='Setting a Subscription Rate Limiting Policy as an API Publisher'
                                />
                            )}
                            />

                        </Link>
                    </ListItem>
                    <ListItem button>
                        <ListItemIcon>
                            <DescriptionIcon />
                        </ListItemIcon>
                        <Link
                            target='_blank'
                            href={Configurations.app.docUrl
                                + 'design/rate-limiting/setting-throttling-limits/'
                                + '#subscription-level-throttling-api-subscriber'}
                            underline='hover'
                        >
                            <ListItemText primary={(
                                <FormattedMessage
                                    id='Throttling.Subscription.Policy.List.help.link.three'
                                    defaultMessage='Setting a Subscription Rate Limiting Policy as an API Subscriber'
                                />
                            )}
                            />

                        </Link>
                    </ListItem>
                </List>
            </HelpBase>),
        pageStyle: 'half',
        title: intl.formatMessage({
            id: 'Throttling.Subscription.Policy.search.default',
            defaultMessage: 'Subscription Rate Limiting Policies',
        }),
        EditTitle: intl.formatMessage({
            id: 'Throttling.Subscription.Policy.search.default',
            defaultMessage: 'Subscription Rate Limiting Policies',
        }),
    };

    const columProps = [
        {
            name: 'name',
            label: intl.formatMessage({
                id: 'Admin.Throttling.Subscription.Throttling.policy.table.header.name',
                defaultMessage: 'Name',
            }),
            options: {
                customBodyRender: (value, tableMeta) => {
                    if (typeof tableMeta.rowData === 'object') {
                        const artifactId = tableMeta.rowData[tableMeta.rowData.length - 2];
                        const isAI = tableMeta.rowData[1] === 'AI API Quota';
                        return (
                            <RouterLink
                                to={{
                                    pathname: `/throttling/subscription/${artifactId}`,
                                    state: { isAI },
                                }}
                            >
                                {value}
                            </RouterLink>
                        );
                    } else {
                        return <div />;
                    }
                },
                filter: false,
                sort: true,
            },
        },
        {
            name: 'quotaPolicy',
            label: intl.formatMessage({
                id: 'Admin.Throttling.Subscription.Throttling.policy.table.header.quota.policy',
                defaultMessage: 'Quota Policy',
            }),
            options: {
                filter: true,
                sort: true,
            },
        },
        {
            name: 'quota',
            label: intl.formatMessage({
                id: 'Admin.Throttling.Subscription.Throttling.policy.table.header.quota',
                defaultMessage: 'Quota',
            }),
            options: {
                filter: true,
                sort: false,
                display: false,
            },
        },
        {
            name: 'unitTime',
            label: intl.formatMessage({
                id: 'Admin.Throttling.Subscription.Throttling.policy.table.header.unit.time',
                defaultMessage: 'Unit Time',
            }),
            options: {
                filter: true,
                sort: false,
                display: false,
            },
        },
        {
            name: 'rateLimit',
            label: intl.formatMessage({
                id: 'Admin.Throttling.Subscription.Throttling.policy.table.header.rate.limit',
                defaultMessage: 'Rate Limit',
            }),
            options: {
                filter: true,
                sort: false,
                display: false,
            },
        },
        {
            name: 'timeUnit',
            label: intl.formatMessage({
                id: 'Admin.Throttling.Subscription.Throttling.policy.table.header.time.unit',
                defaultMessage: 'Time Unit',
            }),
            options: {
                filter: true,
                sort: false,
                display: false,
            },
        },
        {
            name: 'totalTokenCount',
            label: intl.formatMessage({
                id: 'Admin.Throttling.Subscription.Throttling.policy.table.header.total.token.count',
                defaultMessage: 'Total Token Count',
            }),
            options: {
                display: false,
            },
        },
        {
            name: 'promptTokenCount',
            label: intl.formatMessage({
                id: 'Admin.Throttling.Subscription.Throttling.policy.table.header.prompt.token.count',
                defaultMessage: 'Prompt Token Count',
            }),
            options: {
                display: false,
            },
        },
        {
            name: 'completionTokenCount',
            label: intl.formatMessage({
                id: 'Admin.Throttling.Subscription.Throttling.policy.table.header.completion.token.count',
                defaultMessage: 'Completion Token Count',
            }),
            options: {
                display: false,
            },
        },
        { // Id column has to be always the last.
            name: 'policyId',
            options: {
                display: false,
            },
        },
    ];

    const emptyBoxProps = {
        content: (
            <Typography variant='body2' color='textSecondary' component='p'>
                <FormattedMessage
                    id='Throttling.Subsription.Policy.List.empty.content.subscription.policies'
                    defaultMessage={'Subscription-level throttling policies are applicable per access '
                    + 'token generated for an application.'}
                />
            </Typography>),
        title: (
            <Typography gutterBottom variant='h5' component='h2'>
                <FormattedMessage
                    id='Throttling.Subscription.Policy.List.empty.title.subscription.policies'
                    defaultMessage='Subscription Policies'
                />

            </Typography>),
    };

    const addButtonOverride = (
        <>
            <Button
                variant='contained'
                color='primary'
                endIcon={<ArrowDropDownIcon />}
                onClick={handleClick}
            >
                <FormattedMessage
                    id='Throttling.Subscription.Policy.List.addButtonProps.title'
                    defaultMessage='Add Policy'
                />
            </Button>
            <Menu
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                <MenuItem
                    onClick={() => handleMenuItemClick(false)}
                    component={RouterLink}
                    to={{ pathname: '/throttling/subscription/add', state: { isAI: false } }}
                >
                    Add Policy
                </MenuItem>
                <MenuItem
                    onClick={() => handleMenuItemClick(true)}
                    component={RouterLink}
                    to={{ pathname: '/throttling/subscription/add', state: { isAI: true } }}
                >
                    Add AI Policy
                </MenuItem>
            </Menu>
        </>
    );

    /**
     * Populate subscription policies
     * @returns {Promise} The list of subscription policies
     */
    function apiCall() {
        let subscriptionThrottlingvalues;
        return restApi.getSubscritionPolicyList().then((result) => {
            const subscriptionPolicies = result.body.list.map((obj) => {
                if (obj.defaultLimit.requestCount !== null) {
                    return {
                        policyName: obj.policyName,
                        quotaPolicy: 'Request Count',
                        quota: obj.defaultLimit.requestCount.requestCount,
                        unitTime: obj.defaultLimit.requestCount.unitTime + ' '
                        + obj.defaultLimit.requestCount.timeUnit,
                        rateLimit: (obj.rateLimitCount === 0) ? 'NA' : obj.rateLimitCount,
                        timeUnit: (obj.rateLimitCount === 0) ? 'NA' : obj.rateLimitTimeUnit,
                        totalTokenCount: 'NA',
                        promptTokenCount: 'NA',
                        completionTokenCount: 'NA',
                        policyId: obj.policyId,
                    };
                } else if (obj.defaultLimit.bandwidth !== null) {
                    return {
                        policyName: obj.policyName,
                        quotaPolicy: 'Bandwidth Volume',
                        quota: obj.defaultLimit.bandwidth.dataAmount + ' '
                        + obj.defaultLimit.bandwidth.dataUnit,
                        unitTime: obj.defaultLimit.bandwidth.unitTime + ' '
                        + obj.defaultLimit.bandwidth.timeUnit,
                        rateLimit: (obj.rateLimitCount === 0) ? 'NA' : obj.rateLimitCount,
                        timeUnit: (obj.rateLimitCount === 0) ? 'NA' : obj.rateLimitTimeUnit,
                        totalTokenCount: 'NA',
                        promptTokenCount: 'NA',
                        completionTokenCount: 'NA',
                        policyId: obj.policyId,
                    };
                } else if (obj.defaultLimit.aiApiQuota !== null) {
                    return {
                        policyName: obj.policyName,
                        quotaPolicy: 'AI API Quota',
                        quota: obj.defaultLimit.aiApiQuota.requestCount,
                        unitTime: obj.defaultLimit.aiApiQuota.unitTime + ' '
                            + obj.defaultLimit.aiApiQuota.timeUnit,
                        rateLimit: (obj.rateLimitCount === 0) ? 'NA' : obj.rateLimitCount,
                        timeUnit: (obj.rateLimitCount === 0) ? 'NA' : obj.rateLimitTimeUnit,
                        totalTokenCount: (obj.defaultLimit.aiApiQuota.totalTokenCount === 0) ? 'NA'
                            : obj.defaultLimit.aiApiQuota.totalTokenCount,
                        promptTokenCount: (obj.defaultLimit.aiApiQuota.promptTokenCount === 0) ? 'NA'
                            : obj.defaultLimit.aiApiQuota.promptTokenCount,
                        completionTokenCount: (obj.defaultLimit.aiApiQuota.completionTokenCount === 0) ? 'NA'
                            : obj.defaultLimit.aiApiQuota.completionTokenCount,
                        policyId: obj.policyId,
                    };
                } else {
                    return {
                        policyName: obj.policyName,
                        quotaPolicy: 'Event Count',
                        quota: obj.defaultLimit.eventCount.eventCount,
                        unitTime: obj.defaultLimit.eventCount.unitTime + ' '
                        + obj.defaultLimit.eventCount.timeUnit,
                        rateLimit: (obj.rateLimitCount === 0) ? 'NA' : obj.rateLimitCount,
                        timeUnit: (obj.rateLimitCount === 0) ? 'NA' : obj.rateLimitTimeUnit,
                        totalTokenCount: 'NA',
                        promptTokenCount: 'NA',
                        completionTokenCount: 'NA',
                        policyId: obj.policyId,
                    };
                }
            });

            subscriptionThrottlingvalues = subscriptionPolicies
                .filter((policy) => !policy.policyName.includes(CONSTS.DEFAULT_SUBSCRIPTIONLESS_PLAN))
                .map(Object.values);
            return (subscriptionThrottlingvalues);
        }).catch((error) => {
            const { response } = error;
            if (response.body) {
                throw (response.body.description);
            }
            return null;
        });
    }

    const renderExpandableRow = (rowData) => {
        const isAIQuota = rowData[1] === 'AI API Quota';
        return (
            <TableRow>
                <TableCell colSpan={1} />
                <TableCell colSpan={rowData.length}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {isAIQuota ? (
                                    <>
                                        <TableCell sx={{ borderBottom: 'none' }}>
                                            <strong>Request Count</strong>
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: 'none' }}>
                                            <strong>Total Token Count</strong>
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: 'none' }}>
                                            <strong>Prompt Token Count</strong>
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: 'none' }}>
                                            <strong>Completion Token Count</strong>
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: 'none' }}>
                                            <strong>Unit Time</strong>
                                        </TableCell>
                                    </>
                                ) : (
                                    <>
                                        <TableCell sx={{ borderBottom: 'none' }}>
                                            <strong>Quota</strong>
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: 'none' }}>
                                            <strong>Unit Time</strong>
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: 'none' }}>
                                            <strong>Rate Limit</strong>
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: 'none' }}>
                                            <strong>Time Unit</strong>
                                        </TableCell>
                                    </>
                                )}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                {isAIQuota ? (
                                    <>
                                        <TableCell sx={{ borderBottom: 'none' }}>{rowData[2]}</TableCell>
                                        <TableCell sx={{ borderBottom: 'none' }}>{rowData[6]}</TableCell>
                                        <TableCell sx={{ borderBottom: 'none' }}>{rowData[7]}</TableCell>
                                        <TableCell sx={{ borderBottom: 'none' }}>{rowData[8]}</TableCell>
                                        <TableCell sx={{ borderBottom: 'none' }}>{rowData[3]}</TableCell>
                                    </>
                                ) : (
                                    <>
                                        <TableCell sx={{ borderBottom: 'none' }}>{rowData[2]}</TableCell>
                                        <TableCell sx={{ borderBottom: 'none' }}>{rowData[3]}</TableCell>
                                        <TableCell sx={{ borderBottom: 'none' }}>{rowData[4]}</TableCell>
                                        <TableCell sx={{ borderBottom: 'none' }}>{rowData[5]}</TableCell>
                                    </>
                                )}
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableCell>
            </TableRow>
        );
    };

    return (
        <ListBase
            columProps={columProps}
            pageProps={pageProps}
            addButtonOverride={addButtonOverride}
            searchProps={searchProps}
            emptyBoxProps={emptyBoxProps}
            apiCall={apiCall}
            editComponentProps={{
                icon: <EditIcon />,
                title: 'Edit Subscription Policy',
                routeTo: '/throttling/subscription/',
            }}
            DeleteComponent={Delete}
            enableCollapsable={enableCollapsable}
            renderExpandableRow={renderExpandableRow}
        />
    );
}
