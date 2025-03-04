/*
 * Copyright (c) 2025, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { PieChart } from '@mui/x-charts/PieChart';
import { Box, Typography } from '@mui/material';

const DonutChart = ({
    data, height, width, colors,
}) => {
    const hasData = data.some((item) => item.value > 0);

    const renderEmptyChart = (message) => (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height,
                width: '100%',
            }}
        >
            <Typography color='text.secondary'>
                {message}
            </Typography>
        </Box>
    );

    if (!hasData) {
        return renderEmptyChart('No data available');
    }

    return (
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <PieChart
                colors={colors}
                series={[{
                    data,
                    valueFormatter: () => '',
                    innerRadius: 50,
                    outerRadius: 100,
                    paddingAngle: 5,
                    cornerRadius: 5,
                    cx: 100,
                    startAngle: 90,
                    endAngle: -270,
                }]}
                width={width}
                height={height}
            />
        </Box>
    );
};

DonutChart.propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        value: PropTypes.number.isRequired,
        label: PropTypes.string.isRequired,
    })).isRequired,
    height: PropTypes.number,
    width: PropTypes.number,
    colors: PropTypes.arrayOf(PropTypes.string),
};

DonutChart.defaultProps = {
    height: 200,
    width: 400,
    colors: ['#00B81D', '#FF5252', 'grey'],
};

export default DonutChart;
