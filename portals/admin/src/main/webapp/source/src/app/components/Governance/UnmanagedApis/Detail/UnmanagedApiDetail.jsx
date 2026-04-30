/*
 * Copyright (c) 2026, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0.
 */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Box, Card, CardContent, Grid, Typography, Breadcrumbs, Link, Alert, Button,
    Skeleton, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, List, ListItemButton, ListItemIcon, ListItemText,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import { Link as RouterLink, withRouter } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import ContentBase from 'AppComponents/AdminPages/Addons/ContentBase';
import HelpBase from 'AppComponents/AdminPages/Addons/HelpBase';
import Configurations from 'Config';
import DiscoveryApi from 'AppData/DiscoveryApi';

function extractErrorMessage(err) {
    if (err && err.response) {
        if (err.response.status === 404) return null;
        if (err.response.body) {
            return err.response.body.description
                || err.response.body.message
                || err.response.statusText
                || 'Discovery service is currently unavailable.';
        }
    }
    if (err && err.message) return err.message;
    return 'Discovery service is currently unavailable.';
}

function formatTimestamp(value) {
    if (!value) return '—';
    try {
        return new Date(value).toLocaleString();
    } catch (e) {
        return String(value);
    }
}

function classificationChip(classification) {
    const c = String(classification || '').toLowerCase();
    if (c === 'shadow') return <Chip label='Shadow' size='small' color='error' variant='outlined' />;
    if (c === 'drift') return <Chip label='Drift' size='small' color='warning' variant='outlined' />;
    return <Chip label={classification} size='small' variant='outlined' />;
}

function reachabilityChip(isInternal) {
    return (
        <Chip
            label={isInternal ? 'Internal' : 'External'}
            size='small'
            color={isInternal ? 'info' : 'default'}
            variant='outlined'
        />
    );
}

function clientLabel(c) {
    if (!c) return '—';
    if (c.kind === 'k8s' && c.workload) {
        return c.namespace
            ? `${c.workload} (${c.namespace})`
            : c.workload;
    }
    return c.identity || c.ip || '—';
}

/**
 * Detail page for a single discovered API. Mirrors the Compliance detail
 * layout: header card with the request signature, then a metadata table
 * card, then a callers table card and a matched-managed-APIs card. All
 * panels live on one ContentBase page with a single back-link breadcrumb.
 */
function UnmanagedApiDetail({ match }) {
    const intl = useIntl();
    const id = match.params.discoveredApiId;
    const [detail, setDetail] = useState(null);
    const [error, setError] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [loading, setLoading] = useState(true);
    const [reloadToken, setReloadToken] = useState(0);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        setNotFound(false);
        new DiscoveryApi().getDiscoveredApi(id)
            .then((resp) => { if (!cancelled) setDetail(resp.body); })
            .catch((err) => {
                if (cancelled) return;
                if (err && err.response && err.response.status === 404) {
                    setNotFound(true);
                    return;
                }
                setError(extractErrorMessage(err));
            })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [id, reloadToken]);

    const handleRetry = () => setReloadToken((n) => n + 1);

    const help = (
        <HelpBase>
            <List component='nav'>
                <ListItemButton>
                    <ListItemIcon sx={{ minWidth: 'auto', marginRight: 1 }}>
                        <DescriptionIcon />
                    </ListItemIcon>
                    <Link
                        target='_blank'
                        href={Configurations.app.docUrl + 'governance/unmanaged-apis/'}
                        underline='hover'
                    >
                        <ListItemText primary={(
                            <FormattedMessage
                                id='Discovery.detail.help.link'
                                defaultMessage='About finding details'
                            />
                        )}
                        />
                    </Link>
                </ListItemButton>
            </List>
        </HelpBase>
    );

    return (
        <ContentBase
            width='full'
            pageStyle='paperLess'
            title={intl.formatMessage({
                id: 'Discovery.detail.title',
                defaultMessage: 'Finding detail',
            })}
            help={help}
        >
            <Box>
                <Breadcrumbs sx={{ mb: 2 }}>
                    <Link component={RouterLink} to='/governance/unmanaged-apis' underline='hover'>
                        <FormattedMessage
                            id='Discovery.detail.breadcrumb.list'
                            defaultMessage='Unmanaged APIs'
                        />
                    </Link>
                    <Typography color='text.primary'>
                        <FormattedMessage
                            id='Discovery.detail.breadcrumb.detail'
                            defaultMessage='Finding detail'
                        />
                    </Typography>
                </Breadcrumbs>

                {loading && (
                    <Box aria-label='Loading finding details'>
                        <Skeleton variant='text' width='40%' height={48} />
                        <Skeleton variant='text' width='25%' height={20} sx={{ mb: 2 }} />
                        <Skeleton variant='rectangular' height={260} sx={{ borderRadius: 1, mb: 2 }} />
                        <Skeleton variant='rectangular' height={180} sx={{ borderRadius: 1 }} />
                    </Box>
                )}

                {!loading && notFound && (
                    <Alert severity='warning'>
                        <FormattedMessage
                            id='Discovery.detail.notFound'
                            defaultMessage={
                                'This finding no longer exists. It may have been '
                                + 'resolved or its source service was removed.'
                            }
                        />
                    </Alert>
                )}

                {!loading && !notFound && error && (
                    <Alert
                        severity='error'
                        action={(
                            <Button color='inherit' size='small' onClick={handleRetry}>
                                <FormattedMessage
                                    id='Discovery.error.retry'
                                    defaultMessage='Retry'
                                />
                            </Button>
                        )}
                    >
                        {error}
                    </Alert>
                )}

                {!loading && !notFound && !error && detail && (
                    <Grid container spacing={3}>
                        {/* Header card: request signature + classification chip */}
                        <Grid item xs={12}>
                            <Card>
                                <CardContent>
                                    <Typography
                                        variant='h6'
                                        sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}
                                        gutterBottom
                                    >
                                        {`${detail.method || ''} ${detail.normalizedPath || ''}`.trim()}
                                    </Typography>
                                    <Box sx={{
                                        display: 'flex',
                                        gap: 1,
                                        alignItems: 'center',
                                        mt: 1,
                                    }}
                                    >
                                        {classificationChip(detail.classification)}
                                        {reachabilityChip(detail.isInternal)}
                                        <Typography variant='body2' color='text.secondary'>
                                            {detail.serviceIdentity}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Metadata table */}
                        <Grid item xs={12} md={7}>
                            <Card>
                                <CardContent>
                                    <Typography variant='subtitle1' sx={{ mb: 1 }}>
                                        <FormattedMessage
                                            id='Discovery.detail.metadata.title'
                                            defaultMessage='Details'
                                        />
                                    </Typography>
                                    <TableContainer component={Paper} variant='outlined'>
                                        <Table size='small'>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell sx={{ width: '35%', fontWeight: 600 }}>
                                                        Service
                                                    </TableCell>
                                                    <TableCell sx={{ fontFamily: 'monospace' }}>
                                                        {detail.serviceIdentity || '—'}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 600 }}>Method</TableCell>
                                                    <TableCell>{detail.method || '—'}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 600 }}>Path</TableCell>
                                                    <TableCell sx={{ fontFamily: 'monospace' }}>
                                                        {detail.normalizedPath || '—'}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 600 }}>Classification</TableCell>
                                                    <TableCell>{classificationChip(detail.classification)}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 600 }}>Reachability</TableCell>
                                                    <TableCell>{reachabilityChip(detail.isInternal)}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 600 }}>First seen</TableCell>
                                                    <TableCell>{formatTimestamp(detail.firstSeenAt)}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 600 }}>Last seen</TableCell>
                                                    <TableCell>{formatTimestamp(detail.lastSeenAt)}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 600 }}>Observations</TableCell>
                                                    <TableCell>{detail.observationCount || 0}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 600 }}>Distinct clients</TableCell>
                                                    <TableCell>{detail.distinctClientCount || 0}</TableCell>
                                                </TableRow>
                                                {detail.statusCodes && detail.statusCodes.length > 0 && (
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: 600 }}>Status codes</TableCell>
                                                        <TableCell>{detail.statusCodes.join(', ')}</TableCell>
                                                    </TableRow>
                                                )}
                                                {detail.avgDurationUs > 0 && (
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: 600 }}>Avg latency (µs)</TableCell>
                                                        <TableCell>{Math.round(detail.avgDurationUs)}</TableCell>
                                                    </TableRow>
                                                )}
                                                {detail.rawPathSamples && detail.rawPathSamples.length > 0 && (
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: 600, verticalAlign: 'top' }}>
                                                            Sample request
                                                        </TableCell>
                                                        <TableCell sx={{
                                                            fontFamily: 'monospace',
                                                            wordBreak: 'break-all',
                                                            fontSize: '0.85rem',
                                                        }}
                                                        >
                                                            {detail.rawPathSamples[0]}
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Right column: clients + matched managed APIs */}
                        <Grid item xs={12} md={5}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <Card>
                                    <CardContent>
                                        <Typography variant='subtitle1' sx={{ mb: 1 }}>
                                            <FormattedMessage
                                                id='Discovery.detail.clients.title'
                                                defaultMessage='Top callers'
                                            />
                                        </Typography>
                                        {(detail.topClients && detail.topClients.length > 0) ? (
                                            <TableContainer component={Paper} variant='outlined'>
                                                <Table size='small'>
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell sx={{ fontWeight: 600 }}>Caller</TableCell>
                                                            <TableCell sx={{ fontWeight: 600 }}>IP : Port</TableCell>
                                                            <TableCell
                                                                sx={{ fontWeight: 600, textAlign: 'right' }}
                                                            >
                                                                Obs.
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {detail.topClients.map((c) => {
                                                            const isK8s = c.kind === 'k8s';
                                                            return (
                                                                <TableRow key={c.identity}>
                                                                    <TableCell>
                                                                        <Box sx={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: 0.5,
                                                                        }}
                                                                        >
                                                                            <Chip
                                                                                label={isK8s ? 'k8s' : 'host'}
                                                                                size='small'
                                                                                color={isK8s ? 'primary' : 'default'}
                                                                                variant='outlined'
                                                                            />
                                                                            <Typography variant='body2'>
                                                                                {clientLabel(c)}
                                                                            </Typography>
                                                                        </Box>
                                                                    </TableCell>
                                                                    <TableCell sx={{
                                                                        fontFamily: 'monospace',
                                                                        fontSize: '0.85rem',
                                                                    }}
                                                                    >
                                                                        {c.ip}
                                                                        {c.port ? `:${c.port}` : ''}
                                                                    </TableCell>
                                                                    <TableCell sx={{ textAlign: 'right' }}>
                                                                        {c.observations}
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        })}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        ) : (
                                            <Typography variant='body2' color='text.secondary'>
                                                <FormattedMessage
                                                    id='Discovery.detail.clients.empty'
                                                    defaultMessage='No caller information captured for this finding.'
                                                />
                                            </Typography>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Matched managed APIs (sister set) */}
                                {detail.serviceManagedAPIs && detail.serviceManagedAPIs.length > 0 && (
                                    <Card>
                                        <CardContent>
                                            <Typography variant='subtitle1' sx={{ mb: 1 }}>
                                                <FormattedMessage
                                                    id='Discovery.detail.managed.title'
                                                    defaultMessage='Related managed APIs'
                                                />
                                            </Typography>
                                            <TableContainer component={Paper} variant='outlined'>
                                                <Table size='small'>
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                                                            <TableCell sx={{ fontWeight: 600 }}>Version</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {detail.serviceManagedAPIs.map((api) => (
                                                            <TableRow key={api.apimApiId}>
                                                                <TableCell>{api.apimApiName}</TableCell>
                                                                <TableCell>{api.apimApiVersion}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </CardContent>
                                    </Card>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                )}
            </Box>
        </ContentBase>
    );
}

UnmanagedApiDetail.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            discoveredApiId: PropTypes.string.isRequired,
        }).isRequired,
    }).isRequired,
};

export default withRouter(UnmanagedApiDetail);
