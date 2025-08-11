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
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Configurations from 'Config';
import { isRestricted } from 'AppData/AuthManager';
import DataTable from './DataTable';
import { ENTITY_TYPES } from './utils';

/**
 * APIs Section Component
 * @param {Object} props - Component props
 * @param {Array} props.data - Array of APIs to display
 * @param {string} props.noDataIcon - Path to no data icon
 * @param {number} props.totalCount - Total number of APIs
 * @param {number} props.currentPage - Current page number
 * @param {number} props.pageSize - Number of items per page
 * @param {Function} props.onPageChange - Callback for page changes
 * @param {Function} props.onDelete - Callback for API deletion
 * @returns {JSX.Element} APIs section component
 */
const ApisSection = ({ data, noDataIcon, totalCount, currentPage, pageSize, onPageChange, onDelete }) => {
    return (
        <Box mb={4} mx={4}>
            <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
                <Typography variant='h4'>
                    <FormattedMessage
                        id='Publisher.Landing.apis.section.title'
                        defaultMessage='APIs'
                    />
                </Typography>
                {data.length > 0 && (
                    <Button
                        variant='contained'
                        color='primary'
                        component={Link}
                        disabled={isRestricted(['apim:api_publish', 'apim:api_create'])}
                        to='/apis/create'
                        startIcon={<AddIcon />}
                    >
                        <FormattedMessage
                            id='Publisher.Landing.create.api.button'
                            defaultMessage='Create API'
                        />
                    </Button>
                )}
            </Box>
            {data.length === 0 ? (
                <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center'>
                    <img
                        src={Configurations.app.context + noDataIcon}
                        alt='No APIs available'
                    />
                    <Typography variant='body1' color='textSecondary' mt={2} mb={3}>
                        <FormattedMessage
                            id='Publisher.Landing.no.apis.message'
                            defaultMessage='No APIs found. Create your first API to get started.'
                        />
                    </Typography>
                    <Button
                        variant='outlined'
                        color='primary'
                        component={Link}
                        disabled={isRestricted(['apim:api_publish', 'apim:api_create'])}
                        to='/apis'
                        startIcon={<AddIcon />}
                    >
                        <FormattedMessage
                            id='Publisher.Landing.create.api.button'
                            defaultMessage='Create API'
                        />
                    </Button>
                </Box>
            ) : (
                <DataTable 
                    data={data} 
                    type={ENTITY_TYPES.APIS} 
                    totalCount={totalCount}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    onPageChange={onPageChange}
                    onDelete={onDelete}
                />
            )}
        </Box>
    );
};

ApisSection.propTypes = {
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
    currentPage: PropTypes.number.isRequired,
    pageSize: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    onDelete: PropTypes.func,
};

ApisSection.defaultProps = {
    onDelete: null,
};

export default ApisSection;
