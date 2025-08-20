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

import React, { useCallback } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    CardActions,
    Grid,
    Divider,
    Chip,
    Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useHistory, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Configurations from 'Config';
import DeleteButton from './DeleteButton';
import ThumbnailContainer from './ThumbnailContainer';
import { formatUpdatedTime, getDetailPath, ENTITY_TYPES } from './utils';

const StyledCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: theme.spacing(1),
    border: `0.4px solid rgba(141, 145, 163, 1)`,
    transition: 'box-shadow 0.3s ease-in-out, transform 0.2s ease-in-out',
    cursor: 'pointer',
    '&:hover': {
        boxShadow: theme.shadows[4],
        transform: 'translateY(-2px)',
    },
}));

const CardContentStyled = styled(CardContent)(({ theme }) => ({
    flexGrow: 1,
    padding: theme.spacing(1.5),
    paddingBottom: theme.spacing(2),
    display: 'flex',
    gap: theme.spacing(2),
}));

const CardImageContainer = styled(Box)(({ theme }) => ({
    width: 100,
    height: 100,
    borderRadius: theme.spacing(1),
    backgroundColor: theme.palette.grey[100],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
}));

const CardDetails = styled(Box)(() => ({
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0, // Allow flex items to shrink below their content size
    overflow: 'hidden', // Prevent overflow
}));

const CardFooter = styled(CardActions)(({ theme }) => ({
    padding: theme.spacing(1, 1.5, 1, 1.5),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
}));

/**
 * Reusable DataTable Component for APIs, API Products, and MCP Servers
 * @param {Object} props - Component props
 * @param {Array} props.data - Array of items to display in the cards
 * @param {string} props.type - Entity type (apis, api-products, or mcp-servers)
 * @param {number} props.totalCount - Total count of items for "View All" link
 * @param {Function} props.onRowClick - Optional callback for card clicks
 * @param {Function} props.onDelete - Callback for item deletion
 * @returns {JSX.Element} DataTable component
 */
const DataTable = ({ data, type, totalCount, onRowClick, onDelete }) => {
    const history = useHistory();

    const handleCardClick = useCallback((item) => {
        const path = getDetailPath(type, item.id);
        history.push(path);
        if (onRowClick) onRowClick(item);
    }, [type, history, onRowClick]);

    // Get entity-specific display values
    const getDisplayValues = (item) => {
        return {
            name: item.displayName || item.name,
            provider: item.provider || 'admin',
            version: item.version || '1.0.0',
            context: item.context || '/',
            // For API Products, use state if lifeCycleStatus is not available
            lifeCycleStatus: item.lifeCycleStatus || item.state,
            type: item.type,
        };
    };

    // Get type chip label for APIs
    const getTypeChipLabel = (apiType) => {
        const typeMapping = {
            'HTTP': 'REST',
            'WS': 'WebSocket',
            'SOAPTOREST': 'SOAPTOREST',
            'SOAP': 'SOAP',
            'GRAPHQL': 'GraphQL',
            'WEBSUB': 'WebSub',
            'SSE': 'SSE',
            'WEBHOOK': 'Webhook',
            'ASYNC': 'ASYNC'
        };
        return typeMapping[apiType?.toUpperCase()] || apiType;
    };

    // Get icon component for API type
    const getTypeIcon = (apiType) => {
        const iconProps = {
            style: { 
                width: '12px', 
                height: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }
        };
        
        switch (apiType?.toUpperCase()) {
            case 'HTTP':
                return (
                    <img
                        src={Configurations.app.context + '/site/public/images/custom-icons/rest.svg'}
                        alt='REST' {...iconProps} />
                );
            case 'SOAP':
                return (
                    <img
                        src={Configurations.app.context + '/site/public/images/custom-icons/soap.svg'}
                        alt='SOAP' {...iconProps} />
                );
            case 'WS':
                return (
                    <img
                        src={Configurations.app.context + '/site/public/images/custom-icons/websocket.svg'}
                        alt='WebSocket' {...iconProps} />
                );
            case 'SSE':
                return (
                    <img
                        src={Configurations.app.context + '/site/public/images/custom-icons/sse.svg'}
                        alt='SSE' {...iconProps} />
                );
            case 'WEBHOOK':
                return (
                    <img
                        src={Configurations.app.context + '/site/public/images/custom-icons/webhook.svg'}
                        alt='Webhook' {...iconProps} />
                );
            case 'WEBSUB':
                return (
                    <img
                        src={Configurations.app.context + '/site/public/images/custom-icons/websub.svg'}
                        alt='WebSub' {...iconProps} />
                );
            case 'GRAPHQL':
                return (
                    <img
                        src={Configurations.app.context + '/site/public/images/custom-icons/graphql.svg'}
                        alt='GraphQL' {...iconProps} />
                );
            case 'ASYNC':
                return (
                    <img
                        src={Configurations.app.context + '/site/public/images/custom-icons/async.svg'}
                        alt='Async' {...iconProps} />
                );
            default:
                return null; // No icon for unknown types
        }
    };

    // Get "View All" path based on entity type
    const getViewAllPath = () => {
        switch (type) {
            case ENTITY_TYPES.APIS:
                return '/apis';
            case ENTITY_TYPES.API_PRODUCTS:
                return '/api-products';
            case ENTITY_TYPES.MCP_SERVERS:
                return '/mcp-servers';
            default:
                return '/apis';
        }
    };

    // Get entity type label for "View All" button
    const getEntityLabel = () => {
        switch (type) {
            case ENTITY_TYPES.APIS:
                return 'APIs';
            case ENTITY_TYPES.API_PRODUCTS:
                return 'API Products';
            case ENTITY_TYPES.MCP_SERVERS:
                return 'MCP Servers';
            default:
                return 'Items';
        }
    };

    return (
        <Box>
            <Grid container spacing={2}>
                {data.map((item) => {
                    const displayValues = getDisplayValues(item);
                    return (
                        <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={item.id}>
                            <StyledCard onClick={() => handleCardClick(item)}>
                                <CardContentStyled>
                                    <CardImageContainer>
                                        <ThumbnailContainer
                                            artifact={item}
                                            width={100}
                                            height={100}
                                        />
                                    </CardImageContainer>
                                    <CardDetails>
                                        <Typography 
                                            variant='h6' 
                                            fontWeight='600' 
                                            noWrap
                                            lineHeight={1.3}
                                        >
                                            {displayValues.name}
                                        </Typography>
                                        <Typography 
                                            variant='body2' 
                                            color='textSecondary' 
                                            lineHeight={1.3} 
                                            marginBottom='4px' 
                                            noWrap 
                                            fontWeight={300}
                                        >
                                            <FormattedMessage id='by' defaultMessage='By' />
                                            &nbsp;{displayValues.provider}
                                            {type === ENTITY_TYPES.APIS && (
                                                <>
                                                    &nbsp;
                                                    <FormattedMessage id='on' defaultMessage='on' />
                                                    &nbsp;
                                                    {item.gatewayVendor === 'wso2' || item.gatewayVendor === 'solace'
                                                        ? item.gatewayVendor.toUpperCase()
                                                        : item.gatewayType}
                                                </>
                                            )}
                                        </Typography>
                                        <Box display='flex' gap={2} sx={{ overflow: 'hidden'}}>
                                            <Box sx={{ overflow: 'hidden', minWidth: '48px' }}>
                                                <Typography variant='body1' lineHeight={1.3} noWrap fontWeight={300}>
                                                    {displayValues.version}
                                                </Typography>
                                                <Typography
                                                    variant='caption' component='p' color='text.disabled'
                                                    lineHeight={1} fontWeight={300}>
                                                    Version
                                                </Typography>
                                            </Box>
                                            <Box sx={{ overflow: 'hidden' }}>
                                                <Typography variant='body1' lineHeight={1.3} noWrap fontWeight={300}>
                                                    {displayValues.context}
                                                </Typography>
                                                <Typography
                                                    variant='caption' component='p' color='text.disabled'
                                                    lineHeight={1} fontWeight={300}>
                                                    Context
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box mt={1} display='flex' gap={0.5}>
                                            {displayValues.lifeCycleStatus && (
                                                <Chip
                                                    label={
                                                        displayValues.lifeCycleStatus.charAt(0).toUpperCase()
                                                        + displayValues.lifeCycleStatus.slice(1).toLowerCase()
                                                    }
                                                    size='small'
                                                    sx={{
                                                        fontSize: '0.75rem',
                                                        height: '20px',
                                                        borderRadius: '4px',
                                                        fontWeight: 300,
                                                    }}
                                                />
                                            )}
                                            {displayValues.type && type === ENTITY_TYPES.APIS && (
                                                <Chip
                                                    icon={getTypeIcon(displayValues.type)}
                                                    label={getTypeChipLabel(displayValues.type)}
                                                    size='small'
                                                    variant='outlined'
                                                    color='primary'
                                                    sx={{
                                                        fontSize: '0.75rem',
                                                        height: '20px',
                                                        borderRadius: '4px',
                                                        fontWeight: 300,
                                                        backgroundColor: '#eef3f9ff',
                                                        '& .MuiChip-icon': {
                                                            fontSize: '12px',
                                                            width: '12px',
                                                            height: '12px',
                                                            marginLeft: '4px',
                                                        },
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    </CardDetails>
                                </CardContentStyled>
                                <Divider sx={{ marginLeft: 1.5, marginRight: 1.5 }} />
                                <CardFooter>
                                    <Box display='flex' alignItems='center' gap={0.5}>
                                        <AccessTimeIcon fontSize='small' sx={{ color: 'text.disabled' }} />
                                        <Typography variant='caption' color='textSecondary'>
                                            {formatUpdatedTime(item.updatedTime)}
                                        </Typography>
                                    </Box>
                                    <Box onClick={(e) => e.stopPropagation()}>
                                        <DeleteButton
                                            item={item}
                                            type={type}
                                            onDelete={onDelete}
                                            useIconButton
                                        />
                                    </Box>
                                </CardFooter>
                            </StyledCard>
                        </Grid>
                    );
                })}
            </Grid>
            
            {/* View All section - only show if there are more items than displayed */}
            {totalCount > data.length && (
                <Box mt={2}>
                    <Button
                        variant='text'
                        color='primary'
                        component={Link}
                        to={getViewAllPath()}
                    >
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
        </Box>
    );
};

DataTable.propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({
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
    })).isRequired,
    type: PropTypes.string.isRequired,
    totalCount: PropTypes.number,
    onRowClick: PropTypes.func,
    onDelete: PropTypes.func,
};

DataTable.defaultProps = {
    totalCount: 0,
    onRowClick: null,
    onDelete: null,
};

export default DataTable;
