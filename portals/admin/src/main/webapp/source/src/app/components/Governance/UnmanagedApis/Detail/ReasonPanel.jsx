/*
 * Copyright (c) 2026, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0.
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
    Card, CardContent, Typography, Box, Stack, Chip, Divider,
} from '@mui/material';
import { FormattedMessage } from 'react-intl';

// MUI Chip color names mapped per tag type. Theme-driven so Compliance,
// Unmanaged APIs, and the rest of the admin portal all share the same
// red/orange/blue palette automatically.
const tagColor = {
    shadow: 'error',
    drift: 'warning',
    internal: 'info',
};

/**
 * Picks one of four spec-defined reason templates based on
 * (classification, isInternal). Per spec phase4_admin_portal.md §6.6
 * the four templates are:
 *   shadow + external  → Discovery.reason.shadow
 *   shadow + internal  → Discovery.reason.shadowInternal
 *   drift + external   → Discovery.reason.drift  (with sister-set count)
 *   drift + internal   → Discovery.reason.driftInternal (with sister-set count)
 *
 * The drift templates use a {n} placeholder for the count of sister
 * managed APIs on the same service — that count comes from
 * detail.serviceManagedAPIs.
 *
 * @param {object} props component props
 * @returns {JSX} reason explanation block
 */
const ReasonText = ({ classification, isInternal, sisterCount }) => {
    // BFF returns classification in uppercase ('SHADOW' / 'DRIFT'); we
    // lowercase here so the reason templates match regardless of casing.
    const c = String(classification || '').toLowerCase();
    if (c === 'shadow' && isInternal) {
        return (
            <FormattedMessage
                id='Discovery.reason.shadowInternal'
                defaultMessage={
                    'This service has no APIs registered in APIM. The traffic '
                    + 'is internal (service-to-service), so it does not transit '
                    + 'the APIM gateway.'
                }
            />
        );
    }
    if (c === 'shadow') {
        return (
            <FormattedMessage
                id='Discovery.reason.shadow'
                defaultMessage={
                    'This service has no APIs registered in APIM. The path is '
                    + 'being served by a backend that APIM has no visibility '
                    + 'into.'
                }
            />
        );
    }
    if (c === 'drift' && isInternal) {
        return (
            <FormattedMessage
                id='Discovery.reason.driftInternal'
                defaultMessage={
                    'The service has {n, plural, one {# governed API} other '
                    + '{# governed APIs}} in APIM. This path is being served '
                    + 'by the same backend but is not declared in any APIM '
                    + 'definition. The traffic is internal '
                    + '(service-to-service).'
                }
                values={{ n: sisterCount }}
            />
        );
    }
    if (c === 'drift') {
        return (
            <FormattedMessage
                id='Discovery.reason.drift'
                defaultMessage={
                    'The service has {n, plural, one {# governed API} other '
                    + '{# governed APIs}} in APIM. This path is being served '
                    + 'by the same backend but is not declared in any APIM '
                    + 'definition.'
                }
                values={{ n: sisterCount }}
            />
        );
    }
    return null;
};

ReasonText.propTypes = {
    classification: PropTypes.string.isRequired,
    isInternal: PropTypes.bool,
    sisterCount: PropTypes.number,
};

ReasonText.defaultProps = {
    isInternal: false,
    sisterCount: 0,
};

/**
 * ReasonPanel renders the "why this is a finding" half of the detail
 * page. Top: chips for the classification + (optionally) internal
 * modifier. Below: the plain-English template.
 *
 * For drift findings, also lists the sister APIs (managed APIs on the
 * same service) so the operator can see what IS governed for context.
 *
 * @param {object} props component props
 * @param {object} props.detail the /apis/{id} response payload
 * @returns {JSX} reason card
 */
const ReasonPanel = ({ detail }) => {
    if (!detail) {
        return null;
    }
    const sister = detail.serviceManagedAPIs || [];
    const classification = String(detail.classification || '').toLowerCase();
    return (
        <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
                <Typography
                    variant='body1'
                    sx={{ fontWeight: 'bold', mb: 2 }}
                >
                    <FormattedMessage
                        id='Discovery.detail.reason.title'
                        defaultMessage='Why this is a finding'
                    />
                </Typography>
                <Stack direction='row' spacing={1} sx={{ mb: 2 }}>
                    {classification === 'shadow' && (
                        <Chip
                            size='small'
                            color={tagColor.shadow}
                            variant='outlined'
                            label={(
                                <FormattedMessage
                                    id='Discovery.tag.shadow'
                                    defaultMessage='Shadow'
                                />
                            )}
                        />
                    )}
                    {classification === 'drift' && (
                        <Chip
                            size='small'
                            color={tagColor.drift}
                            variant='outlined'
                            label={(
                                <FormattedMessage
                                    id='Discovery.tag.drift'
                                    defaultMessage='Drift'
                                />
                            )}
                        />
                    )}
                    {detail.isInternal && (
                        <Chip
                            size='small'
                            color={tagColor.internal}
                            variant='outlined'
                            label={(
                                <FormattedMessage
                                    id='Discovery.tag.internal'
                                    defaultMessage='Internal'
                                />
                            )}
                        />
                    )}
                </Stack>
                <Typography variant='body2' sx={{ mb: 2 }}>
                    <ReasonText
                        classification={classification}
                        isInternal={detail.isInternal}
                        sisterCount={sister.length}
                    />
                </Typography>

                {classification === 'drift' && sister.length > 0 && (
                    <>
                        <Divider sx={{ my: 2 }} />
                        <Typography
                            variant='subtitle2'
                            color='text.secondary'
                            gutterBottom
                        >
                            <FormattedMessage
                                id='Discovery.detail.reason.sister.title'
                                defaultMessage='Other governed APIs on this service'
                            />
                        </Typography>
                        <Box>
                            {sister.map((api) => (
                                <Typography
                                    key={api.apimApiId}
                                    variant='body2'
                                    sx={{ fontFamily: 'monospace' }}
                                >
                                    {`${api.apimApiName} v${api.apimApiVersion}`}
                                </Typography>
                            ))}
                        </Box>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

ReasonPanel.propTypes = {
    detail: PropTypes.shape({
        classification: PropTypes.string,
        isInternal: PropTypes.bool,
        serviceManagedAPIs: PropTypes.arrayOf(PropTypes.shape({
            apimApiId: PropTypes.string,
            apimApiName: PropTypes.string,
            apimApiVersion: PropTypes.string,
        })),
    }),
};

ReasonPanel.defaultProps = { detail: null };

export default ReasonPanel;
