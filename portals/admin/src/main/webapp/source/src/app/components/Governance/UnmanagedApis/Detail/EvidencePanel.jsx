/*
 * Copyright (c) 2026, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0.
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
    Card, CardContent, Typography, Box, Grid, Chip, Divider,
} from '@mui/material';
import { FormattedMessage, FormattedNumber } from 'react-intl';

const SAMPLE_LIMIT = 8;

/**
 * One metric tile (label above, big number below). Used in the metric
 * grid at the top of the evidence panel.
 *
 * @param {object} props component props
 * @returns {JSX} metric block
 */
const Metric = ({ label, value }) => (
    <Box>
        <Typography
            variant='caption'
            color='text.secondary'
            sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
        >
            {label}
        </Typography>
        <Typography variant='h6' sx={{ mt: 0.5 }}>
            {value}
        </Typography>
    </Box>
);

Metric.propTypes = {
    label: PropTypes.node.isRequired,
    value: PropTypes.node.isRequired,
};

const formatDate = (iso) => {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleString();
    } catch (e) {
        return iso;
    }
};

/**
 * EvidencePanel renders the "what proves this" half of the detail
 * page: aggregated metrics across the cycle plus capped sample arrays
 * (paths, clients, status codes). Mirrors the daemon's BFFRepo.Detail
 * shape.
 *
 * @param {object} props component props
 * @param {object} props.detail the /apis/{id} response payload
 * @returns {JSX} card with metrics + sample lists
 */
const EvidencePanel = ({ detail }) => {
    if (!detail) {
        return null;
    }
    const rawSamples = (detail.rawPathSamples || []).slice(0, SAMPLE_LIMIT);
    const clientSamples = (detail.distinctClientsSample || []).slice(0, SAMPLE_LIMIT);
    const statusCodes = detail.statusCodes || [];

    return (
        <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
                <Typography
                    variant='body1'
                    sx={{ fontWeight: 'bold', mb: 2 }}
                >
                    <FormattedMessage
                        id='Discovery.detail.evidence.title'
                        defaultMessage='Evidence'
                    />
                </Typography>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6} sm={3}>
                        <Metric
                            label={(
                                <FormattedMessage
                                    id='Discovery.detail.metric.observations'
                                    defaultMessage='Observations'
                                />
                            )}
                            value={(
                                <FormattedNumber
                                    value={detail.observationCount || 0}
                                />
                            )}
                        />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Metric
                            label={(
                                <FormattedMessage
                                    id='Discovery.detail.metric.distinctClients'
                                    defaultMessage='Distinct clients'
                                />
                            )}
                            value={(
                                <FormattedNumber
                                    value={detail.distinctClientCount || 0}
                                />
                            )}
                        />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Metric
                            label={(
                                <FormattedMessage
                                    id='Discovery.detail.metric.firstSeen'
                                    defaultMessage='First seen'
                                />
                            )}
                            value={(
                                <Typography variant='body2'>
                                    {formatDate(detail.firstSeenAt)}
                                </Typography>
                            )}
                        />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Metric
                            label={(
                                <FormattedMessage
                                    id='Discovery.detail.metric.lastSeen'
                                    defaultMessage='Last seen'
                                />
                            )}
                            value={(
                                <Typography variant='body2'>
                                    {formatDate(detail.lastSeenAt)}
                                </Typography>
                            )}
                        />
                    </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Typography
                    variant='subtitle2'
                    color='text.secondary'
                    gutterBottom
                >
                    <FormattedMessage
                        id='Discovery.detail.evidence.statusCodes'
                        defaultMessage='Status codes seen'
                    />
                </Typography>
                <Box sx={{
                    display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2,
                }}
                >
                    {statusCodes.length === 0
                        ? (
                            <Typography variant='body2' color='text.secondary'>
                                —
                            </Typography>
                        )
                        : statusCodes.map((code) => (
                            <Chip
                                key={code}
                                size='small'
                                label={code}
                                variant='outlined'
                            />
                        ))}
                </Box>

                <Typography
                    variant='subtitle2'
                    color='text.secondary'
                    gutterBottom
                >
                    <FormattedMessage
                        id='Discovery.detail.evidence.rawPathSamples'
                        defaultMessage='Raw path samples'
                    />
                </Typography>
                <Box sx={{ mb: 2 }}>
                    {rawSamples.length === 0
                        ? (
                            <Typography variant='body2' color='text.secondary'>
                                —
                            </Typography>
                        )
                        : rawSamples.map((p) => (
                            <Typography
                                key={p}
                                variant='body2'
                                sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}
                            >
                                {p}
                            </Typography>
                        ))}
                </Box>

                <Typography
                    variant='subtitle2'
                    color='text.secondary'
                    gutterBottom
                >
                    <FormattedMessage
                        id='Discovery.detail.evidence.distinctClients'
                        defaultMessage='Distinct client IPs (sample)'
                    />
                </Typography>
                <Box sx={{
                    display: 'flex', gap: 0.5, flexWrap: 'wrap',
                }}
                >
                    {clientSamples.length === 0
                        ? (
                            <Typography variant='body2' color='text.secondary'>
                                —
                            </Typography>
                        )
                        : clientSamples.map((c) => (
                            <Chip
                                key={c}
                                size='small'
                                label={c}
                                variant='outlined'
                                sx={{ fontFamily: 'monospace' }}
                            />
                        ))}
                </Box>
            </CardContent>
        </Card>
    );
};

EvidencePanel.propTypes = {
    detail: PropTypes.shape({
        observationCount: PropTypes.number,
        distinctClientCount: PropTypes.number,
        firstSeenAt: PropTypes.string,
        lastSeenAt: PropTypes.string,
        statusCodes: PropTypes.arrayOf(PropTypes.number),
        rawPathSamples: PropTypes.arrayOf(PropTypes.string),
        distinctClientsSample: PropTypes.arrayOf(PropTypes.string),
    }),
};

EvidencePanel.defaultProps = { detail: null };

export default EvidencePanel;
