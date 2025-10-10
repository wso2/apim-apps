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

const PREFIX = 'McpServersSection';

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
 * MCP Servers Section Component
 * @param {Object} props - Component props
 * @param {Array} props.data - Array of MCP Servers to display
 * @param {number} props.totalCount - Total number of MCP Servers
 * @param {Function} props.onDelete - Callback for MCP Server deletion
 * @returns {JSX.Element} MCP Servers section component
 */
const McpServersSection = ({ data, totalCount, onDelete }) => {
    const theme = useTheme();
    const { noDataIcon } = theme.custom.landingPage.icons;
    return (
        <Root>
            <div className={classes.root}>
                <div className={classes.header}>
                    <div className={classes.headerContent}>
                        <Typography variant='h4' className={classes.title}>
                            <FormattedMessage
                                id='Publisher.Landing.mcpServers.section.title'
                                defaultMessage='MCP Servers'
                            />
                        </Typography>
                    </div>
                    <Button
                        variant='contained'
                        color='primary'
                        component={Link}
                        disabled={isRestricted(['apim:mcp_server_create', 'apim:mcp_server_manage'])}
                        to='/mcp-servers/create'
                        startIcon={<AddIcon />}
                    >
                        <FormattedMessage id='Publisher.Landing.create.mcp.button' defaultMessage='Create MCP Server' />
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
                        <img src={Configurations.app.context + noDataIcon} alt='No MCP Servers available' />
                        <Typography variant='body1' color='textSecondary' mt={2} textAlign='center'>
                            <FormattedMessage
                                id='Publisher.Landing.no.mcpServers.message.line1'
                                defaultMessage='No MCP Servers found.'
                            />
                        </Typography>
                        <Typography variant='body1' color='textSecondary' textAlign='center'>
                            <FormattedMessage
                                id='Publisher.Landing.no.mcpServers.message.line2'
                                defaultMessage='Create your first MCP Server to get started.'
                            />
                        </Typography>
                    </Box>
                ) : (
                    <DataTable
                        data={data}
                        type={CONSTS.ENTITY_TYPES.MCP_SERVERS}
                        totalCount={totalCount}
                        onDelete={onDelete}
                        isAPIProduct={false}
                        isMCPServer
                    />
                )}
            </div>
        </Root>
    );
};

McpServersSection.propTypes = {
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

McpServersSection.defaultProps = {
    onDelete: null,
};

export default McpServersSection;
