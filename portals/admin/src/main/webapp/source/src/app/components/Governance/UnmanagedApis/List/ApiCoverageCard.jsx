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
 * Summary card #1: API Coverage. Donut splitting all discovered+managed
 * APIs into "managed" (governed) vs "unmanaged" (shadow + drift). Mirrors
 * the Compliance Summary "Policy Adherence" card pattern: Card elevation 3,
 * bold subtitle, donut with counts inline in legend labels.
 *
 * @param {object} props component props
 * @param {object} props.summary the /summary response payload
 * @returns {JSX} card with donut
 */
const ApiCoverageCard = ({ summary }) => {
    const intl = useIntl();
    const theme = useTheme();
    if (!summary) {
        return null;
    }
    const managed = summary.managed || 0;
    const unmanaged = summary.unmanaged || 0;

    return (
        <Card elevation={3}>
            <CardContent>
                <Typography
                    variant='body1'
                    sx={{ fontWeight: 'bold', mb: 2 }}
                >
                    <FormattedMessage
                        id='Discovery.summary.coverage.title'
                        defaultMessage='API Coverage'
                    />
                </Typography>
                <DonutChart
                    data={[
                        {
                            id: 0,
                            value: managed,
                            label: intl.formatMessage({
                                id: 'Discovery.summary.coverage.managed',
                                defaultMessage: 'Managed ({count})',
                            }, { count: managed }),
                        },
                        {
                            id: 1,
                            value: unmanaged,
                            label: intl.formatMessage({
                                id: 'Discovery.summary.coverage.unmanaged',
                                defaultMessage: 'Unmanaged ({count})',
                            }, { count: unmanaged }),
                        },
                    ]}
                    colors={[
                        theme.palette.charts.success,
                        theme.palette.charts.error,
                    ]}
                />
            </CardContent>
        </Card>
    );
};

ApiCoverageCard.propTypes = {
    summary: PropTypes.shape({
        managed: PropTypes.number,
        unmanaged: PropTypes.number,
    }),
};

ApiCoverageCard.defaultProps = {
    summary: null,
};

export default ApiCoverageCard;
