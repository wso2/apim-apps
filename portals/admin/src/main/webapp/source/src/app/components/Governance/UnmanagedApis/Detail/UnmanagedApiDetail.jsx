/*
 * Copyright (c) 2026, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0.
 */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Box, Grid, Typography, Breadcrumbs, Link, Alert, Button, Skeleton,
} from '@mui/material';
import { Link as RouterLink, withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import DiscoveryApi from 'AppData/DiscoveryApi';
import IdentityPanel from './IdentityPanel';
import EvidencePanel from './EvidencePanel';
import ReasonPanel from './ReasonPanel';

/**
 * Best-effort error message extraction; mirrors UnmanagedApisList's
 * helper so error messages are consistent across pages.
 */
function extractErrorMessage(err) {
    if (err && err.response) {
        if (err.response.status === 404) {
            return null; // sentinel — handler renders the dedicated 404 view
        }
        if (err.response.body) {
            return err.response.body.description
                || err.response.body.message
                || err.response.statusText
                || 'Discovery service is currently unavailable.';
        }
    }
    if (err && err.message) {
        return err.message;
    }
    return 'Discovery service is currently unavailable.';
}

/**
 * Detail page for a single discovered API. Loads /apis/{id} and renders
 * the three panels in a Grid. Top of page has a breadcrumb back to the
 * list.
 *
 * @param {object} props component props
 * @returns {JSX} detail page
 */
function UnmanagedApiDetail({ match }) {
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
            .then((resp) => {
                if (!cancelled) {
                    setDetail(resp.body);
                }
            })
            .catch((err) => {
                if (cancelled) return;
                if (err && err.response && err.response.status === 404) {
                    setNotFound(true);
                    return;
                }
                setError(extractErrorMessage(err));
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [id, reloadToken]);

    const handleRetry = () => setReloadToken((n) => n + 1);

    return (
        <Box p={3}>
            <Breadcrumbs sx={{ mb: 2 }}>
                <Link component={RouterLink} to='/governance/unmanaged-apis'>
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
                    <Skeleton
                        variant='text'
                        width='25%'
                        height={20}
                        sx={{ mb: 2 }}
                    />
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <Skeleton
                                variant='rectangular'
                                height={320}
                                sx={{ borderRadius: 1 }}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Skeleton
                                variant='rectangular'
                                height={320}
                                sx={{ borderRadius: 1 }}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Skeleton
                                variant='rectangular'
                                height={320}
                                sx={{ borderRadius: 1 }}
                            />
                        </Grid>
                    </Grid>
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
                        <Button
                            color='inherit'
                            size='small'
                            onClick={handleRetry}
                        >
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
                <>
                    <Typography variant='h4' gutterBottom>
                        {`${detail.method || ''} ${detail.normalizedPath || ''}`.trim()}
                    </Typography>
                    <Typography
                        variant='body2'
                        color='text.secondary'
                        gutterBottom
                    >
                        {detail.serviceIdentity}
                    </Typography>
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        <Grid item xs={12} md={4}>
                            <IdentityPanel detail={detail} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <EvidencePanel detail={detail} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <ReasonPanel detail={detail} />
                        </Grid>
                    </Grid>
                </>
            )}
        </Box>
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
