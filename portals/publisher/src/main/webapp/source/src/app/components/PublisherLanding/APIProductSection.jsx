/*
 * Copyright (c) 2025, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
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
import { Box, Typography, Button, Tooltip } from '@mui/material';
import { Link } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import LaunchIcon from '@mui/icons-material/Launch';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Configurations from 'Config';
import { isRestricted } from 'AppData/AuthManager';
import DataTable from './DataTable';
import { ENTITY_TYPES } from './utils';

/**
 * API Products Section Component
 * @param {Object} props - Component props
 * @param {Array} props.data - Array of API Products to display
 * @param {string} props.noDataIcon - Path to no data icon
 * @param {number} props.totalCount - Total number of API Products
 * @param {Function} props.onDelete - Callback for API Product deletion
 * @returns {JSX.Element} API Products section component
 */
const APIProductSection = ({ data, noDataIcon, totalCount, onDelete }) => {
    return (
        <Box mb={4} mx={4}>
            <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
                <Box display='flex' alignItems='center'>
                    <Typography variant='h4'>
                        <FormattedMessage
                            id='Publisher.Landing.api.products.section.title'
                            defaultMessage='API Products'
                        />
                    </Typography>
                    <Typography 
                        variant='body2' 
                        color='textSecondary' 
                        sx={{ 
                            ml: 1, 
                            alignSelf: 'flex-end',
                            mb: 0.5,
                        }}
                    >
                        Total: <strong>{totalCount}</strong> {totalCount === 1 ? 'API Product' : 'API Products'}
                    </Typography>
                    <Tooltip title='Go to API Products'>
                        <Link to='/api-products' style={{ textDecoration: 'none' }}>
                            <LaunchIcon 
                                style={{ marginLeft: '2px' }} 
                                fontSize='small' 
                                sx={{ color: 'text.secondary' }}
                            />
                        </Link>
                    </Tooltip>
                </Box>
                {data.length > 0 && (
                    <Button
                        variant='contained'
                        color='primary'
                        component={Link}
                        disabled={isRestricted(['apim:api_publish', 'apim:api_create'])}
                        to='/api-products/create'
                        startIcon={<AddIcon />}
                    >
                        <FormattedMessage
                            id='Publisher.Landing.create.api.product.button'
                            defaultMessage='Create API Product'
                        />
                    </Button>
                )}
            </Box>
            {data.length === 0 ? (
                <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center'>
                    <img
                        src={Configurations.app.context + noDataIcon}
                        alt='No API Products available'
                    />
                    <Typography variant='body1' color='textSecondary' mt={2} mb={3}>
                        <FormattedMessage
                            id='Publisher.Landing.no.api.products.message'
                            defaultMessage='No API Products found. Create your first API Product to get started.'
                        />
                    </Typography>
                    <Button
                        variant='outlined'
                        color='primary'
                        component={Link}
                        disabled={isRestricted(['apim:api_publish', 'apim:api_create'])}
                        to='/api-products'
                        startIcon={<AddIcon />}
                    >
                        <FormattedMessage
                            id='Publisher.Landing.create.api.product.button'
                            defaultMessage='Create API Product'
                        />
                    </Button>
                </Box>
            ) : (
                <DataTable 
                    data={data} 
                    type={ENTITY_TYPES.API_PRODUCTS} 
                    onDelete={onDelete}
                />
            )}
        </Box>
    );
};

APIProductSection.propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        version: PropTypes.string,
        description: PropTypes.string,
        context: PropTypes.string,
        updatedTime: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })).isRequired,
    noDataIcon: PropTypes.string.isRequired,
    totalCount: PropTypes.number.isRequired,
    onDelete: PropTypes.func,
};

APIProductSection.defaultProps = {
    onDelete: null,
};

export default APIProductSection;
