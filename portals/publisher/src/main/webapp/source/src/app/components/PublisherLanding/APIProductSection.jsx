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
import { styled, useTheme } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Configurations from 'Config';
import { isRestricted } from 'AppData/AuthManager';
import DataTable from './DataTable';
import { ENTITY_TYPES } from './utils';

const PREFIX = 'APIProductSection';

const classes = {
    root: `${PREFIX}-root`,
    section: `${PREFIX}-section`,
    header: `${PREFIX}-header`,
    headerContent: `${PREFIX}-headerContent`,
    title: `${PREFIX}-title`,
    emptyState: `${PREFIX}-emptyState`,
    emptyStateContent: `${PREFIX}-emptyStateContent`,
    emptyStateImage: `${PREFIX}-emptyStateImage`,
    emptyStateText: `${PREFIX}-emptyStateText`,
    emptyStateButton: `${PREFIX}-emptyStateButton`,
};

const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.root}`]: {
        marginBottom: theme.spacing(4),
        marginLeft: theme.spacing(4),
        marginRight: theme.spacing(4),
    },

    [`& .${classes.section}`]: {
        marginBottom: theme.spacing(4),
        marginLeft: theme.spacing(4),
        marginRight: theme.spacing(4),
    },

    [`& .${classes.header}`]: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing(2),
    },

    [`& .${classes.headerContent}`]: {
        display: 'flex',
        alignItems: 'center',
    },

    [`& .${classes.title}`]: {
        fontWeight: 600,
    },

    [`& .${classes.emptyState}`]: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
    },

    [`& .${classes.emptyStateContent}`]: {
        display: 'flex',
        gap: theme.spacing(3),
        minWidth: '600px',
    },

    [`& .${classes.emptyStateImage}`]: {
        height: '100px',
        width: 'auto',
        verticalAlign: 'middle',
    },

    [`& .${classes.emptyStateText}`]: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(0.5),
        alignSelf: 'center',
    },

    [`& .${classes.emptyStateButton}`]: {
        width: 'fit-content',
    },
}));

/**
 * API Products Section Component
 * @param {Object} props - Component props
 * @param {Array} props.data - Array of API Products to display
 * @param {number} props.totalCount - Total number of API Products
 * @param {Function} props.onDelete - Callback for API Product deletion
 * @returns {JSX.Element} API Products section component
 */
const APIProductSection = ({ data, totalCount, onDelete }) => {
    const theme = useTheme();
    const { createFirstApiProductIcon } = theme.custom.landingPage.icons;
    return (
        <Root>
            <div className={classes.root}>
                <div className={classes.header}>
                    <div className={classes.headerContent}>
                        <Typography variant='h4' className={classes.title}>
                            <FormattedMessage
                                id='Publisher.Landing.api.products.section.title'
                                defaultMessage='API Products'
                            />
                        </Typography>
                    </div>
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
                </div>
                {data.length === 0 ? (
                    <div className={classes.emptyState}>
                        <div className={classes.emptyStateContent}>
                            <Box>
                                <img
                                    src={Configurations.app.context + createFirstApiProductIcon}
                                    alt='Create your first API Product'
                                    className={classes.emptyStateImage}
                                />
                            </Box>
                            <div className={classes.emptyStateText}>
                                <Typography variant='h4'>
                                    <FormattedMessage
                                        id='Publisher.Landing.create.first.api.product.title'
                                        defaultMessage='Create your first API Product'
                                    />
                                </Typography>
                                <Typography variant='body1' color='textSecondary' style={{ marginBottom: '4px' }}>
                                    <FormattedMessage
                                        id='Publisher.Landing.api.product.description'
                                        defaultMessage='Combine multiple API resources in to a single API'
                                    />
                                </Typography>
                                <Button
                                    variant='contained'
                                    color='primary'
                                    component={Link}
                                    disabled={isRestricted(['apim:api_publish', 'apim:api_create'])}
                                    to='/api-products/create'
                                    startIcon={<AddIcon />}
                                    className={classes.emptyStateButton}
                                >
                                    <FormattedMessage
                                        id='Publisher.Landing.create.api.product.button'
                                        defaultMessage='Create'
                                    />
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <DataTable 
                        data={data} 
                        type={ENTITY_TYPES.API_PRODUCTS} 
                        totalCount={totalCount}
                        onDelete={onDelete}
                    />
                )}
            </div>
        </Root>
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
    totalCount: PropTypes.number.isRequired,
    onDelete: PropTypes.func,
};

APIProductSection.defaultProps = {
    onDelete: null,
};

export default APIProductSection;
