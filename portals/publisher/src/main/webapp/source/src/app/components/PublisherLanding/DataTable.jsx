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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Utils from 'AppData/Utils';
import DeleteButton from './DeleteButton';
import { formatUpdatedTime, getDetailPath } from './utils';

const PREFIX = 'DataTable';

const classes = {
    tableContainer: `${PREFIX}-tableContainer`,
};

/**
 * Reusable DataTable Component for APIs and MCP Servers
 * @param {Object} props - Component props
 * @param {Array} props.data - Array of items to display in the table
 * @param {string} props.type - Entity type (apis, api-products, or mcp-servers)
 * @param {Function} props.onRowClick - Optional callback for row clicks
 * @param {Function} props.onDelete - Callback for item deletion
 * @returns {JSX.Element} DataTable component
 */
const DataTable = ({ data, type, onRowClick, onDelete }) => {
    const history = useHistory();

    const handleRowClick = useCallback((item) => {
        const path = getDetailPath(type, item.id);
        history.push(path);
        if (onRowClick) onRowClick(item);
    }, [type, history, onRowClick]);



    return (
        <Box>
            <TableContainer component={Paper} className={classes.TableContainer}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell width='16%'>
                                <FormattedMessage
                                    id='Publisher.Landing.table.name'
                                    defaultMessage='Name'
                                />
                            </TableCell>
                            <TableCell width='12%'>
                                <FormattedMessage
                                    id='Publisher.Landing.table.context'
                                    defaultMessage='Context'
                                />
                            </TableCell>
                            <TableCell width='9%'>
                                <FormattedMessage
                                    id='Publisher.Landing.table.version'
                                    defaultMessage='Version'
                                />
                            </TableCell>
                            <TableCell width='31%'>
                                <FormattedMessage
                                    id='Publisher.Landing.table.description'
                                    defaultMessage='Description'
                                />
                            </TableCell>
                            <TableCell width='15%'>
                                <FormattedMessage
                                    id='Publisher.Landing.table.lastUpdated'
                                    defaultMessage='Last Updated'
                                />
                            </TableCell>
                            <TableCell width='12%' align='center'>
                                <FormattedMessage
                                    id='Publisher.Landing.table.actions'
                                    defaultMessage='Actions'
                                />
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((item) => (
                            <TableRow
                                key={item.id}
                                onClick={() => handleRowClick(item)}
                                style={{ cursor: 'pointer' }}
                                hover
                            >
                                <TableCell>
                                    <Box display='flex' alignItems='center'>
                                        <Avatar
                                            style={{
                                                backgroundColor: Utils.stringToColor(item.name),
                                            }}
                                        >
                                            {Utils.stringAvatar(item.name.toUpperCase())}
                                        </Avatar>
                                        <Typography variant='body2' fontWeight='medium' ml={1}>
                                            {item.name}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Typography 
                                        variant='body2'
                                        sx={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}
                                        title={item.context || '/'}
                                    >
                                        {item.context || '/'}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant='body2'>
                                        {item.version}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography 
                                        variant='body2'
                                        sx={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            maxWidth: '300px'
                                        }}
                                        title={item.description || 'No description available'}
                                    >
                                        {item.description || 'No description available'}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant='body2' color='textSecondary'>
                                        {formatUpdatedTime(item.updatedTime)}
                                    </Typography>
                                </TableCell>
                                <TableCell align='center'>
                                    <DeleteButton
                                        item={item}
                                        type={type}
                                        onDelete={onDelete}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

        </Box>
    );
};

DataTable.propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        version: PropTypes.string,
        description: PropTypes.string,
        context: PropTypes.string,
        updatedTime: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })).isRequired,
    type: PropTypes.string.isRequired,
    onRowClick: PropTypes.func,
    onDelete: PropTypes.func,
};

DataTable.defaultProps = {
    onRowClick: null,
    onDelete: null,
};

export default DataTable;
