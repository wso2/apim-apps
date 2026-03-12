/*
 * Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com/).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
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
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import { isRestricted } from 'AppData/AuthManager';
import { FormattedMessage } from 'react-intl';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';

function Asyncv3OperationsList({ operations, onDeleteOperation, disableDelete }) {
    function handleDeleteClick(event, opName) {
        event.stopPropagation();
        if (onDeleteOperation) {
            onDeleteOperation(opName);
        }
    }

    return (
        <>
            <Grid item xs={12} md={12}>
                <Typography variant='subtitle1'>
                    <FormattedMessage
                        id='Apis.Details.Resources.Components.async.api.operations.title'
                        defaultMessage='Operations'
                    />
                    <Divider variant='middle' />
                </Typography>
            </Grid>
            <Grid item md={1} />
            <Grid item md={5}>
                <Box
                    onClick={(e) => e.stopPropagation()}
                    sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        maxHeight: '150px',
                        overflowY: 'auto',
                        minWidth: '220px',
                        backgroundColor: 'background.paper',
                        // force scroll containment
                        display: 'block',
                    }}
                >
                    <List dense disablePadding>
                        {operations && operations.length > 0 ? (
                            operations.map((opName) => (
                                <ListItem
                                    key={opName}
                                    divider
                                    secondaryAction={
                                        !disableDelete && (
                                            <Tooltip
                                                title={
                                                    <FormattedMessage
                                                        id='Apis.Details.Resources.components.Operation.Delete'
                                                        defaultMessage='Delete'
                                                    /> 
                                                }
                                                aria-label={(
                                                    <FormattedMessage
                                                        id={'Apis.Details.Resources.components.Operation.delete.'
                                                            + 'operation'}
                                                        defaultMessage='Delete operation'
                                                    />
                                                )}
                                            >
                                                <div>
                                                    <IconButton
                                                        disabled={isRestricted(['apim:api_publish', 'apim:api_create'])}
                                                        onClick={(e) => handleDeleteClick(e, opName)}
                                                        aria-label='delete'
                                                        size='small'>
                                                        <DeleteIcon sx={{ fontSize: 14 }} />
                                                    </IconButton>
                                                </div>
                                            </Tooltip>
                                        )
                                    }
                                >
                                    <ListItemText primary={opName} />
                                </ListItem>
                            ))
                        ) : (
                            <ListItem>
                                <ListItemText
                                    primary={(
                                        <FormattedMessage
                                            id='Apis.Details.Resources.components.AsyncOperation.no.operations'
                                            defaultMessage='No operations'
                                        />
                                    )}
                                    primaryTypographyProps={{ color: 'text.secondary', variant: 'body2' }}
                                />
                            </ListItem>
                        )}
                    </List>
                </Box>
            </Grid>
            <Grid item md={6} />
        </>
        
    );
}

Asyncv3OperationsList.propTypes = {
    operations: PropTypes.arrayOf(PropTypes.string),
    onDeleteOperation: PropTypes.func,
    disableDelete: PropTypes.bool,
};
Asyncv3OperationsList.defaultProps = {
    operations: [],
    onDeleteOperation: null,
    disableDelete: false,
};

export default Asyncv3OperationsList;
