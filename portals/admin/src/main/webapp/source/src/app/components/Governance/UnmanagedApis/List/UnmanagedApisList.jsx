/*
 * Copyright (c) 2026, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
    Grid, Box, Typography, Alert, CircularProgress,
} from '@mui/material';
import { FormattedMessage } from 'react-intl';
import DiscoveryApi from 'AppData/DiscoveryApi';
import ApiCoverageCard from './ApiCoverageCard';
import BreakdownCard from './BreakdownCard';
import FindingsFilters from './FindingsFilters';
import FindingsTable from './FindingsTable';
import useStoredPreferences from '../hooks/useStoredPreferences';

const DEFAULT_PREFS = {
    classification: '',
    service: '',
    internal: '',
    pageSize: 25,
};

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
 * Tiny placeholder shown in either summary card while loading.
 */
function LoadingCard() {
    return (
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 280,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
        }}
        >
            <CircularProgress />
        </Box>
    );
}

/**
 * Top-level container for the Unmanaged APIs tab. Owns:
 *   - the summary fetch (one call on mount + on filter clear)
 *   - the list fetch (refetches on every filter / page change)
 *   - filter state, persisted to localStorage via useStoredPreferences
 *   - pagination state (page index in component state, page size in prefs)
 *
 * Both fetches are independent — a slow list won't block the summary
 * cards rendering, and a failed summary won't block the table.
 *
 * @returns {JSX} list page
 */
function UnmanagedApisList() {
    const [prefs, setPrefs] = useStoredPreferences(DEFAULT_PREFS);

    const [summary, setSummary] = useState(null);
    const [summaryError, setSummaryError] = useState(null);
    const [summaryLoading, setSummaryLoading] = useState(true);

    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [listError, setListError] = useState(null);
    const [listLoading, setListLoading] = useState(true);

    // Summary fetch — fires on mount only; refresh after Clear via prefs reset
    // implicitly re-triggers because the filter row state shifts.
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

    // List fetch — fires on mount, on filter change, on page change, on
    // pageSize change.
    const fetchList = useCallback(() => {
        setListLoading(true);
        setListError(null);
        new DiscoveryApi().listDiscoveredApis({
            classification: prefs.classification || undefined,
            service: prefs.service || undefined,
            internal: prefs.internal || undefined,
            limit: prefs.pageSize,
            offset: page * prefs.pageSize,
        })
            .then((resp) => {
                const body = resp.body || {};
                setItems(body.list || []);
                setTotal((body.pagination && body.pagination.total)
                    || body.count || 0);
            })
            .catch((err) => {
                setListError(extractErrorMessage(err));
                setItems([]);
                setTotal(0);
            })
            .finally(() => {
                setListLoading(false);
            });
    }, [prefs.classification, prefs.service, prefs.internal, prefs.pageSize, page]);

    useEffect(() => { fetchSummary(); }, [fetchSummary]);
    useEffect(() => { fetchList(); }, [fetchList]);

    const handleFilterChange = (next) => {
        setPrefs({ ...prefs, ...next });
        setPage(0); // any filter change resets to first page
    };

    const handleClear = () => {
        setPrefs(DEFAULT_PREFS);
        setPage(0);
    };

    const serviceOptions = (summary && summary.byService)
        ? summary.byService.map((s) => s.serviceIdentity)
        : [];

    const subtitleId = (summary && summary.skipInternal === false)
        ? 'Discovery.subtitle.includeInternal'
        : 'Discovery.subtitle.default';
    const subtitleDefault = (summary && summary.skipInternal === false)
        ? 'APIs detected in runtime traffic (including internal calls), classified by their governance status.'
        : 'APIs detected in external runtime traffic, classified by their governance status.';

    return (
        <Box p={3}>
            <Typography variant='h4' gutterBottom>
                <FormattedMessage
                    id='Discovery.title'
                    defaultMessage='Unmanaged APIs'
                />
            </Typography>
            <Typography variant='body1' color='text.secondary' gutterBottom>
                <FormattedMessage
                    id={subtitleId}
                    defaultMessage={subtitleDefault}
                />
            </Typography>

            {summaryError && (
                <Alert severity='error' sx={{ mb: 2 }}>
                    {summaryError}
                </Alert>
            )}

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                    {summaryLoading
                        ? <LoadingCard />
                        : <ApiCoverageCard summary={summary} />}
                </Grid>
                <Grid item xs={12} md={6}>
                    {summaryLoading
                        ? <LoadingCard />
                        : <BreakdownCard summary={summary} />}
                </Grid>
            </Grid>

            <Typography variant='h6' gutterBottom>
                <FormattedMessage
                    id='Discovery.findings.title'
                    defaultMessage='Findings'
                />
            </Typography>

            <FindingsFilters
                filters={prefs}
                serviceOptions={serviceOptions}
                hideInternalFilter={summary && summary.skipInternal === true}
                onChange={handleFilterChange}
                onClear={handleClear}
            />

            {listError && (
                <Alert severity='error' sx={{ mb: 2 }}>
                    {listError}
                </Alert>
            )}

            {listLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <FindingsTable
                    items={items}
                    total={total}
                    page={page}
                    rowsPerPage={prefs.pageSize}
                    onPageChange={setPage}
                    onRowsPerPageChange={(n) => {
                        setPrefs({ ...prefs, pageSize: n });
                        setPage(0);
                    }}
                />
            )}
        </Box>
    );
}

export default UnmanagedApisList;
