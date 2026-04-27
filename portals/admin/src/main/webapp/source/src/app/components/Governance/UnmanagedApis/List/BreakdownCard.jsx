/*
 * Copyright (c) 2026, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, Typography } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import DonutChart from 'AppComponents/Shared/DonutChart';

/**
 * Summary card #2: Unmanaged Breakdown. Splits the unmanaged total into
 * its sub-buckets. Variant flips on summary.skipInternal:
 *
 *   skip_internal=true  → by_type (shadow vs drift), since internal
 *                         flows are filtered upstream and the
 *                         reachability split is meaningless
 *   skip_internal=false → by_reachability (external vs internal),
 *                         which is the more interesting axis when
 *                         internal traffic is included
 *
 * @param {object} props component props
 * @param {object} props.summary the /summary response payload
 * @returns {JSX} card with donut + subtitle
 */
const BreakdownCard = ({ summary }) => {
    const intl = useIntl();
    if (!summary) {
        return null;
    }

    const skipInternal = summary.skipInternal !== false;
    const unmanaged = summary.unmanaged || 0;

    let data;
    let subtitle;
    let colors;
    if (skipInternal) {
        const shadow = (summary.byType && summary.byType.shadow) || 0;
        const drift = (summary.byType && summary.byType.drift) || 0;
        data = [
            {
                id: 0,
                value: shadow,
                label: intl.formatMessage({
                    id: 'Discovery.tag.shadow',
                    defaultMessage: 'Shadow',
                }),
            },
            {
                id: 1,
                value: drift,
                label: intl.formatMessage({
                    id: 'Discovery.tag.drift',
                    defaultMessage: 'Drift',
                }),
            },
        ];
        subtitle = intl.formatMessage(
            {
                id: 'Discovery.summary.breakdown.subtitle.byType',
                defaultMessage: 'Of {n} unmanaged APIs, by finding type',
            },
            { n: unmanaged },
        );
        colors = ['#D85A30', '#D4537E'];
    } else {
        const external = (summary.byReachability
            && summary.byReachability.external) || 0;
        const internal = (summary.byReachability
            && summary.byReachability.internal) || 0;
        data = [
            {
                id: 0,
                value: external,
                label: intl.formatMessage({
                    id: 'Discovery.tag.external',
                    defaultMessage: 'External',
                }),
            },
            {
                id: 1,
                value: internal,
                label: intl.formatMessage({
                    id: 'Discovery.tag.internal',
                    defaultMessage: 'Internal',
                }),
            },
        ];
        subtitle = intl.formatMessage(
            {
                id: 'Discovery.summary.breakdown.subtitle.byReachability',
                defaultMessage: 'Of {n} unmanaged APIs, by traffic direction',
            },
            { n: unmanaged },
        );
        colors = ['#D85A30', '#378ADD'];
    }

    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Typography variant='subtitle1' gutterBottom>
                    <FormattedMessage
                        id='Discovery.summary.breakdown.title'
                        defaultMessage='Unmanaged Breakdown'
                    />
                </Typography>
                <Typography variant='body2' color='text.secondary' gutterBottom>
                    {subtitle}
                </Typography>
                <DonutChart data={data} height={200} width={400} colors={colors} />
            </CardContent>
        </Card>
    );
};

BreakdownCard.propTypes = {
    summary: PropTypes.shape({
        unmanaged: PropTypes.number,
        skipInternal: PropTypes.bool,
        byType: PropTypes.shape({
            shadow: PropTypes.number,
            drift: PropTypes.number,
        }),
        byReachability: PropTypes.shape({
            external: PropTypes.number,
            internal: PropTypes.number,
        }),
    }),
};

BreakdownCard.defaultProps = {
    summary: null,
};

export default BreakdownCard;
