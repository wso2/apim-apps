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
import CONSTS from 'AppData/Constants';
import DataTable from './DataTable';

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

const Root = styled('div')(({ theme }) => ({
    [`& .${classes.root}`]: {
        marginBottom: theme.spacing(4),
    },

    [`& .${classes.header}`]: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing(2.5),
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
        minWidth: '550px',
        marginTop: theme.spacing(3),
    },

    [`& .${classes.emptyStateImage}`]: {
        height: '80px',
        width: 'auto',
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
    const { noDataIcon } = theme.custom.landingPage.icons;
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
                    <Button
                        variant='contained'
                        color='primary'
                        component={Link}
                        disabled={isRestricted(['apim:api_publish', 'apim:api_manage'])}
                        to='/api-products'
                        startIcon={<AddIcon />}
                    >
                        <FormattedMessage
                            id='Publisher.Landing.create.api.product.button'
                            defaultMessage='Create API Product'
                        />
                    </Button>
                </div>
                {data.length === 0 ? (
                    <Box
                        display='flex'
                        flexDirection='column'
                        alignItems='center'
                        justifyContent='center'
                        marginTop={4}
                        marginBottom={4}
                    >
                        <img src={Configurations.app.context + noDataIcon} alt='No API Products available' />
                        <Typography variant='body1' color='textSecondary' mt={2} textAlign='center'>
                            <FormattedMessage
                                id='Publisher.Landing.no.api.products.message.line1'
                                defaultMessage='No API Products found.'
                            />
                        </Typography>
                        <Typography variant='body1' color='textSecondary' textAlign='center'>
                            <FormattedMessage
                                id='Publisher.Landing.no.api.products.message.line2'
                                defaultMessage='Create your first API Product to get started.'
                            />
                        </Typography>
                    </Box>
                ) : (
                    <DataTable
                        data={data}
                        type={CONSTS.ENTITY_TYPES.API_PRODUCTS}
                        totalCount={totalCount}
                        onDelete={onDelete}
                        isAPIProduct
                        isMCPServer={false}
                    />
                )}
            </div>
        </Root>
    );
};

APIProductSection.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            version: PropTypes.string,
            description: PropTypes.string,
            context: PropTypes.string,
            updatedTime: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        })
    ).isRequired,
    totalCount: PropTypes.number.isRequired,
    onDelete: PropTypes.func,
};

APIProductSection.defaultProps = {
    onDelete: null,
};

export default APIProductSection;
