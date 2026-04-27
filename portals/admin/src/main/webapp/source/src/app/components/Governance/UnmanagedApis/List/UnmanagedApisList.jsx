/*
 * Copyright (c) 2026, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0.
 */

import React, {
    useEffect, useState, useCallback,
} from 'react';
import PropTypes from 'prop-types';
import {
    Grid, Card, CardContent, Typography, Alert, Button, Skeleton, Chip,
    List, ListItemButton, ListItemIcon, ListItemText, Link,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import { withRouter } from 'react-router-dom';
import { useIntl, FormattedMessage } from 'react-intl';
import ContentBase from 'AppComponents/AdminPages/Addons/ContentBase';
import HelpBase from 'AppComponents/AdminPages/Addons/HelpBase';
import ListBase from 'AppComponents/AdminPages/Addons/ListBase';
import Configurations from 'Config';
import DiscoveryApi from 'AppData/DiscoveryApi';
import ApiCoverageCard from './ApiCoverageCard';
import BreakdownCard from './BreakdownCard';

/**
 * Best-effort error message extraction. Swagger client surfaces the
 * server's JSON error body in err.response.body; HTTP-level errors land
 * in err.message. Falls back to a generic message so the UI never says
 * "[object Object]".
 */
function extractErrorMessage(err) {
    if (err && err.response && err.response.body) {
        return err.response.body.description
            || err.response.body.message
            || err.response.statusText
            || 'Discovery service is currently unavailable.';
    }
    if (err && err.message) {
        return err.message;
    }
    return 'Discovery service is currently unavailable.';
}

/**
 * Top-level container for the Unmanaged APIs tab. Wraps everything in the
 * standard admin-portal ContentBase (provides the page toolbar, the grey
 * page background, the help icon slot, and the footer at the bottom of
 * the viewport).
 *
 * Layout follows the Compliance Summary pattern exactly:
 *   row 1: two donut summary cards (md=6 each)
 *   row 2: full-width Findings card containing a ListBase table with
 *          built-in search and per-column filter chips
 *
 * @returns {JSX} list page
 */
function UnmanagedApisList({ history }) {
    const intl = useIntl();

    const [summary, setSummary] = useState(null);
    const [summaryLoading, setSummaryLoading] = useState(true);
    const [summaryError, setSummaryError] = useState(null);

    const fetchSummary = useCallback(() => {
        setSummaryLoading(true);
        setSummaryError(null);
        new DiscoveryApi().getSummary()
            .then((resp) => {
                setSummary(resp.body);
            })
            .catch((err) => {
                setSummaryError(extractErrorMessage(err));
            })
            .finally(() => {
                setSummaryLoading(false);
            });
    }, []);

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    // ListBase apiCall: returns a flat array. We pull a generous limit
    // (the BFF caps at the server-defined max) and let mui-datatables
    // paginate + filter client-side. That matches the RulesetCatalog /
    // Policies pattern in this same Governance section.
    const apiCall = () => new DiscoveryApi()
        .listDiscoveredApis({ limit: 500, offset: 0 })
        .then((resp) => (resp.body && resp.body.list) || []);

    // Column config — visible order matches columProps order.
    // Hidden 'id' is index 0 so onRowClick can read it from rowData[0].
    const columProps = [
        {
            name: 'id',
            options: { display: false, filter: false },
        },
        {
            name: 'method',
            label: intl.formatMessage({
                id: 'Discovery.column.method',
                defaultMessage: 'Method',
            }),
            options: {
                filter: false,
                sort: true,
                customBodyRender: (value) => (
                    <Typography variant='body2' sx={{ fontWeight: 'bold' }}>
                        {value || ''}
                    </Typography>
                ),
                setCellProps: () => ({ style: { width: '8%' } }),
            },
        },
        {
            name: 'normalizedPath',
            label: intl.formatMessage({
                id: 'Discovery.column.path',
                defaultMessage: 'Path',
            }),
            options: {
                filter: false,
                sort: true,
                customBodyRender: (value) => (
                    <Typography
                        variant='body2'
                        sx={{ fontFamily: 'monospace' }}
                    >
                        {value || ''}
                    </Typography>
                ),
                setCellProps: () => ({ style: { width: '28%' } }),
            },
        },
        {
            name: 'serviceIdentity',
            label: intl.formatMessage({
                id: 'Discovery.column.service',
                defaultMessage: 'Service',
            }),
            options: {
                filter: false,
                sort: true,
                setCellProps: () => ({ style: { width: '24%' } }),
            },
        },
        {
            name: 'classification',
            label: intl.formatMessage({
                id: 'Discovery.column.classification',
                defaultMessage: 'Classification',
            }),
            options: {
                filter: true,
                sort: true,
                customBodyRender: (value) => {
                    const c = String(value || '').toLowerCase();
                    if (c === 'shadow') {
                        return (
                            <Chip
                                label={intl.formatMessage({
                                    id: 'Discovery.tag.shadow',
                                    defaultMessage: 'Shadow',
                                })}
                                size='small'
                                color='error'
                                variant='outlined'
                            />
                        );
                    }
                    if (c === 'drift') {
                        return (
                            <Chip
                                label={intl.formatMessage({
                                    id: 'Discovery.tag.drift',
                                    defaultMessage: 'Drift',
                                })}
                                size='small'
                                color='warning'
                                variant='outlined'
                            />
                        );
                    }
                    return null;
                },
                customFilterListOptions: {
                    render: (v) => `Classification: ${String(v).charAt(0)
                        + String(v).slice(1).toLowerCase()}`,
                },
                setCellProps: () => ({ style: { width: '12%' } }),
            },
        },
        {
            name: 'isInternal',
            label: intl.formatMessage({
                id: 'Discovery.column.reachability',
                defaultMessage: 'Reachability',
            }),
            options: {
                filter: true,
                sort: true,
                customBodyRender: (value) => (
                    <Chip
                        label={value
                            ? intl.formatMessage({
                                id: 'Discovery.tag.internal',
                                defaultMessage: 'Internal',
                            })
                            : intl.formatMessage({
                                id: 'Discovery.tag.external',
                                defaultMessage: 'External',
                            })}
                        size='small'
                        color={value ? 'info' : 'default'}
                        variant='outlined'
                    />
                ),
                customFilterListOptions: {
                    render: (v) => `Reachability: ${v ? 'Internal' : 'External'}`,
                },
                filterOptions: {
                    renderValue: (v) => (v ? 'Internal' : 'External'),
                },
                setCellProps: () => ({ style: { width: '12%' } }),
            },
        },
        {
            name: 'observationCount',
            label: intl.formatMessage({
                id: 'Discovery.column.observations',
                defaultMessage: 'Obs.',
            }),
            options: {
                filter: false,
                sort: true,
                customBodyRender: (value) => (
                    <Typography variant='body2'>{value || 0}</Typography>
                ),
                setCellProps: () => ({ style: { width: '6%', textAlign: 'right' } }),
                setCellHeaderProps: () => ({ style: { textAlign: 'right' } }),
            },
        },
        {
            name: 'lastSeenAt',
            label: intl.formatMessage({
                id: 'Discovery.column.lastSeen',
                defaultMessage: 'Last seen',
            }),
            options: {
                filter: false,
                sort: true,
                customBodyRender: (value) => {
                    if (!value) return '—';
                    try {
                        return new Date(value).toLocaleString();
                    } catch (e) {
                        return value;
                    }
                },
                setCellProps: () => ({ style: { width: '10%' } }),
            },
        },
    ];

    // mui-datatables options: row click navigates to detail, hover hint
    // via cursor:pointer.
    const tableOptions = {
        onRowClick: (rowData) => {
            const id = rowData[0];
            if (id) {
                history.push(`/governance/unmanaged-apis/${id}`);
            }
        },
        setRowProps: () => ({ style: { cursor: 'pointer' } }),
    };

    const emptyBoxProps = {
        title: (
            <Typography gutterBottom variant='h5' component='h2'>
                <FormattedMessage
                    id='Discovery.findings.empty.title'
                    defaultMessage='No unmanaged APIs found'
                />
            </Typography>
        ),
        content: (
            <Typography variant='body2' color='textSecondary' component='p'>
                <FormattedMessage
                    id='Discovery.findings.empty.content'
                    defaultMessage={
                        'No discovered traffic has been classified as unmanaged yet. '
                        + 'The discovery server pulls a new cycle every few minutes; '
                        + 'come back after some traffic has flowed through your services.'
                    }
                />
            </Typography>
        ),
    };

    const subtitleId = (summary && summary.skipInternal === false)
        ? 'Discovery.subtitle.includeInternal'
        : 'Discovery.subtitle.default';
    const subtitleDefault = (summary && summary.skipInternal === false)
        ? 'APIs detected in runtime traffic (including internal calls), '
            + 'classified by their governance status.'
        : 'APIs detected in external runtime traffic, classified by '
            + 'their governance status.';

    return (
        <ContentBase
            width='full'
            pageStyle='paperLess'
            title={intl.formatMessage({
                id: 'Discovery.title',
                defaultMessage: 'Unmanaged APIs',
            })}
            pageDescription={intl.formatMessage(
                {
                    id: subtitleId,
                    defaultMessage: subtitleDefault,
                },
            )}
            help={(
                <HelpBase>
                    <List component='nav'>
                        <ListItemButton>
                            <ListItemIcon sx={{ minWidth: 'auto', marginRight: 1 }}>
                                <DescriptionIcon />
                            </ListItemIcon>
                            <Link
                                target='_blank'
                                href={Configurations.app.docUrl
                                    + 'governance/unmanaged-apis/'}
                                underline='hover'
                            >
                                <ListItemText primary={(
                                    <FormattedMessage
                                        id='Discovery.help.link'
                                        defaultMessage='About Unmanaged API discovery'
                                    />
                                )}
                                />
                            </Link>
                        </ListItemButton>
                    </List>
                </HelpBase>
            )}
        >
            <Grid container spacing={4} alignItems='left'>
                {summaryError && (
                    <Grid item xs={12}>
                        <Alert
                            severity='error'
                            action={(
                                <Button
                                    color='inherit'
                                    size='small'
                                    onClick={fetchSummary}
                                >
                                    <FormattedMessage
                                        id='Discovery.error.retry'
                                        defaultMessage='Retry'
                                    />
                                </Button>
                            )}
                        >
                            {summaryError}
                        </Alert>
                    </Grid>
                )}
                <Grid item xs={12} md={6}>
                    {summaryLoading ? (
                        <Skeleton
                            variant='rectangular'
                            height={280}
                            sx={{ borderRadius: 1 }}
                        />
                    ) : (
                        <ApiCoverageCard summary={summary} />
                    )}
                </Grid>
                <Grid item xs={12} md={6}>
                    {summaryLoading ? (
                        <Skeleton
                            variant='rectangular'
                            height={280}
                            sx={{ borderRadius: 1 }}
                        />
                    ) : (
                        <BreakdownCard summary={summary} />
                    )}
                </Grid>
                <Grid item xs={12}>
                    <Card
                        elevation={3}
                        sx={{
                            '& .MuiTableCell-footer': { border: 0 },
                        }}
                    >
                        <CardContent>
                            <Typography
                                variant='body1'
                                sx={{ fontWeight: 'bold', mb: 2 }}
                            >
                                <FormattedMessage
                                    id='Discovery.findings.title'
                                    defaultMessage='Findings'
                                />
                            </Typography>
                            <ListBase
                                columProps={columProps}
                                apiCall={apiCall}
                                searchProps={{
                                    active: true,
                                    searchPlaceholder: intl.formatMessage({
                                        id: 'Discovery.search.placeholder',
                                        defaultMessage: 'Search findings by service or path',
                                    }),
                                }}
                                emptyBoxProps={emptyBoxProps}
                                options={tableOptions}
                                useContentBase={false}
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </ContentBase>
    );
}

UnmanagedApisList.propTypes = {
    history: PropTypes.shape({
        push: PropTypes.func.isRequired,
    }).isRequired,
};

export default withRouter(UnmanagedApisList);
