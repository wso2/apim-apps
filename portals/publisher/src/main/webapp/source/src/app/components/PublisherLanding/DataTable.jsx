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
import { Box, Grid, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import ApiThumb from 'AppComponents/Apis/Listing/components/ImageGenerator/ApiThumb';
import CONSTS from 'AppData/Constants';

/**
 * Reusable DataTable Component for APIs, API Products, and MCP Servers
 * @param {Object} props - Component props
 * @param {Array} props.data - Array of items to display in the cards
 * @param {string} props.type - Entity type (apis, api-products, or mcp-servers)
 * @param {number} props.totalCount - Total count of items for "View All" link
 * @param {Function} props.onDelete - Callback for item deletion
 * @returns {JSX.Element} DataTable component
 */
const DataTable = ({ data, type, totalCount, onDelete, isAPIProduct, isMCPServer }) => {
    // Get "View All" path based on entity type
    const getViewAllPath = () => {
        switch (type) {
            case CONSTS.ENTITY_TYPES.APIS:
                return '/apis';
            case CONSTS.ENTITY_TYPES.API_PRODUCTS:
                return '/api-products';
            case CONSTS.ENTITY_TYPES.MCP_SERVERS:
                return '/mcp-servers';
            default:
                return '/apis';
        }
    };

    // Get entity type label for "View All" button
    const getEntityLabel = () => {
        switch (type) {
            case CONSTS.ENTITY_TYPES.APIS:
                return 'APIs';
            case CONSTS.ENTITY_TYPES.API_PRODUCTS:
                return 'API Products';
            case CONSTS.ENTITY_TYPES.MCP_SERVERS:
                return 'MCP Servers';
            default:
                return 'Items';
        }
    };

    return (
        <>
            <Grid container spacing={2}>
                {data.map((artifact) => {
                    return (
                        <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={artifact.id}>
                            <ApiThumb
                                api={artifact}
                                isAPIProduct={isAPIProduct}
                                isMCPServer={isMCPServer}
                                updateData={onDelete}
                                useFlexibleWidth
                            />
                        </Grid>
                    );
                })}
            </Grid>

            {/* View All section - only show if there are more items than displayed */}
            {totalCount > data.length && (
                <Box mt={2}>
                    <Button variant='text' color='primary' component={Link} to={getViewAllPath()}>
                        <FormattedMessage
                            id='Publisher.Landing.view.all.button'
                            defaultMessage='View All {entityType}'
                            values={{
                                entityType: getEntityLabel(),
                            }}
                        />
                    </Button>
                </Box>
            )}
        </>
    );
};

DataTable.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            displayName: PropTypes.string,
            version: PropTypes.string,
            description: PropTypes.string,
            context: PropTypes.string,
            provider: PropTypes.string,
            lifeCycleStatus: PropTypes.string,
            state: PropTypes.string, // For API Products
            type: PropTypes.string,
            updatedTime: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        })
    ).isRequired,
    type: PropTypes.string.isRequired,
    totalCount: PropTypes.number,
    onDelete: PropTypes.func,
};

DataTable.defaultProps = {
    totalCount: 0,
    onDelete: null,
};

export default DataTable;
