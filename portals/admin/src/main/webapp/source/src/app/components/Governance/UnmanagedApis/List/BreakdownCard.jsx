/*
 * Copyright (c) 2026, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0.
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
    Card, CardContent, Typography, useTheme,
} from '@mui/material';
import { useIntl, FormattedMessage } from 'react-intl';
import DonutChart from 'AppComponents/Shared/DonutChart';

/**
 * Summary card #2: Unmanaged Breakdown. Always splits the unmanaged
 * total by classification (Shadow vs Drift) — that's the primary axis
 * the user triages on. The reachability split (internal/external) is
 * available as a column filter in the table, so we don't duplicate it
 * here. Mirrors the Compliance Summary "Compliance" donut: Card
 * elevation 3, bold subtitle, counts in legend labels, theme palette.
 *
 * @param {object} props component props
 * @param {object} props.summary the /summary response payload
 * @returns {JSX} card with donut
 */
const BreakdownCard = ({ summary }) => {
    const intl = useIntl();
    const theme = useTheme();
    if (!summary) {
        return null;
    }
    const shadow = (summary.byType && summary.byType.shadow) || 0;
    const drift = (summary.byType && summary.byType.drift) || 0;

    return (
        <Card elevation={3}>
            <CardContent>
                <Typography
                    variant='body1'
                    sx={{ fontWeight: 'bold', mb: 2 }}
                >
                    <FormattedMessage
                        id='Discovery.summary.breakdown.title'
                        defaultMessage='Unmanaged Breakdown'
                    />
                </Typography>
                <DonutChart
                    data={[
                        {
                            id: 0,
                            value: shadow,
                            label: intl.formatMessage({
                                id: 'Discovery.summary.breakdown.shadow',
                                defaultMessage: 'Shadow ({count})',
                            }, { count: shadow }),
                        },
                        {
                            id: 1,
                            value: drift,
                            label: intl.formatMessage({
                                id: 'Discovery.summary.breakdown.drift',
                                defaultMessage: 'Drift ({count})',
                            }, { count: drift }),
                        },
                    ]}
                    colors={[
                        theme.palette.charts.error,
                        theme.palette.charts.warn,
                    ]}
                />
            </CardContent>
        </Card>
    );
};

BreakdownCard.propTypes = {
    summary: PropTypes.shape({
        byType: PropTypes.shape({
            shadow: PropTypes.number,
            drift: PropTypes.number,
        }),
    }),
};

BreakdownCard.defaultProps = {
    summary: null,
};

export default BreakdownCard;
