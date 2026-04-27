/*
 * Copyright (c) 2026, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0.
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
    Card, CardContent, Typography, Box,
} from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import DonutChart from 'AppComponents/Shared/DonutChart';

/**
 * Summary card #1: API Coverage. Donut splitting all discovered+managed
 * APIs into "managed" (governed) vs "unmanaged" (shadow + drift). Renders
 * the absolute total under the chart for at-a-glance scanning.
 *
 * @param {object} props component props
 * @param {object} props.summary the /summary response payload
 * @returns {JSX} card with donut + total
 */
const ApiCoverageCard = ({ summary }) => {
    const intl = useIntl();
    if (!summary) {
        return null;
    }
    const data = [
        {
            id: 0,
            value: summary.managed || 0,
            label: intl.formatMessage({
                id: 'Discovery.summary.coverage.managed',
                defaultMessage: 'Managed',
            }),
        },
        {
            id: 1,
            value: summary.unmanaged || 0,
            label: intl.formatMessage({
                id: 'Discovery.summary.coverage.unmanaged',
                defaultMessage: 'Unmanaged',
            }),
        },
    ];

    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Typography variant='subtitle1' gutterBottom>
                    <FormattedMessage
                        id='Discovery.summary.coverage.title'
                        defaultMessage='API Coverage'
                    />
                </Typography>
                <Typography variant='body2' color='text.secondary' gutterBottom>
                    <FormattedMessage
                        id='Discovery.summary.coverage.subtitle'
                        defaultMessage='All discovered APIs by governance status'
                    />
                </Typography>
                <DonutChart
                    data={data}
                    height={200}
                    width={400}
                    colors={['#1D9E75', '#D85A30']}
                />
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                    <Typography variant='body2' color='text.secondary'>
                        <FormattedMessage
                            id='Discovery.summary.coverage.total'
                            defaultMessage='Total: {n}'
                            values={{ n: summary.total || 0 }}
                        />
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

ApiCoverageCard.propTypes = {
    summary: PropTypes.shape({
        total: PropTypes.number,
        managed: PropTypes.number,
        unmanaged: PropTypes.number,
    }),
};

ApiCoverageCard.defaultProps = {
    summary: null,
};

export default ApiCoverageCard;
