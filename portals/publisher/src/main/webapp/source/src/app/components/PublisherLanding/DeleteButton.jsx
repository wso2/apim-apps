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

import React, { useState } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import API from 'AppData/api';
import MCPServer from 'AppData/MCPServer';
import { isRestricted } from 'AppData/AuthManager';
import Alert from 'AppComponents/Shared/Alert';
import CONSTS from 'AppData/Constants';

/**
 * Delete Button Component for card actions
 * @param {Object} props - Component props
 * @param {Object} props.item - Item to delete (API or MCP Server)
 * @param {string} props.type - Entity type (apis or mcp-servers)
 * @param {Function} props.onDelete - Callback function after successful deletion
 * @returns {JSX.Element} Delete button component
 */
const DeleteButton = ({ item, type, onDelete }) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleClose = (event) => {
        if (event) {
            event.stopPropagation(); // Prevent row click navigation
            event.preventDefault(); // Prevent any default behavior
        }
        setOpen(false);
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            let response;
            const isAPI = type === CONSTS.ENTITY_TYPES.APIS;
            const isAPIProduct = type === CONSTS.ENTITY_TYPES.API_PRODUCTS;
            const isMCPServer = type === CONSTS.ENTITY_TYPES.MCP_SERVERS;

            if (isAPI) {
                if (item.apiType === API.CONSTS.APIProduct) {
                    response = await API.deleteProduct(item.id);
                } else {
                    response = await API.delete(item.id);
                }
            } else if (isAPIProduct) {
                response = await API.deleteProduct(item.id);
            } else if (isMCPServer) {
                response = await MCPServer.deleteMCPServer(item.id);
            }

            if (response && response.status === 200) {
                const entityType = isAPI ? 'API' : 'MCP Server';
                Alert.info(`${entityType} ${item.name} deleted successfully`);
                if (onDelete) {
                    onDelete(item.id);
                }
            } else {
                throw new Error('Deletion failed');
            }
        } catch (error) {
            let entityType;
            if (type === CONSTS.ENTITY_TYPES.APIS) {
                entityType = 'API';
            } else if (type === CONSTS.ENTITY_TYPES.API_PRODUCTS) {
                entityType = 'API Product';
            } else {
                entityType = 'MCP Server';
            }
            if (error.status === 409) {
                Alert.error(`[${item.name}]: ${error.response?.body?.description || 'Conflict occurred'}`);
            } else {
                Alert.error(`Something went wrong while deleting the ${entityType}!`);
            }
        } finally {
            setLoading(false);
            handleClose();
        }
    };

    const handleClick = (event) => {
        event.stopPropagation(); // Prevent row click navigation
        event.preventDefault(); // Prevent any default behavior
        setOpen(true);
    };

    let entityType = 'MCP Server';
    if (type === CONSTS.ENTITY_TYPES.APIS) {
        entityType = 'API';
    } else if (type === CONSTS.ENTITY_TYPES.API_PRODUCTS) {
        entityType = 'API Product';
    }

    return (
        <>
            <IconButton 
                onClick={handleClick}
                disabled={loading || isRestricted(['apim:api_delete'], item)}
                size='small' 
                color='error'
            >
                <DeleteOutlineIcon fontSize='small' />
            </IconButton>
            <Dialog 
                open={open} 
                onClose={handleClose}
                onClick={(event) => event.stopPropagation()}
            >
                <DialogTitle>
                    <FormattedMessage
                        id='Publisher.Landing.delete.dialog.title'
                        defaultMessage='Delete {type}'
                        values={{ type: entityType }}
                    />
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <FormattedMessage
                            id='Publisher.Landing.delete.dialog.content'
                            defaultMessage='{type} {name} will be deleted permanently. This action cannot be undone.'
                            values={{ 
                                type: entityType,
                                name: <strong>{item.name}</strong>
                            }}
                        />
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={(event) => {
                            event.stopPropagation();
                            event.preventDefault();
                            handleClose();
                        }} 
                        disabled={loading}
                    >
                        <FormattedMessage
                            id='Publisher.Landing.delete.dialog.cancel'
                            defaultMessage='Cancel'
                        />
                    </Button>
                    <Button
                        onClick={(event) => {
                            event.stopPropagation();
                            event.preventDefault();
                            handleDelete();
                        }}
                        disabled={loading}
                        color='primary'
                        variant='contained'
                    >
                        <FormattedMessage
                            id='Publisher.Landing.delete.dialog.delete'
                            defaultMessage='Delete'
                        />
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

DeleteButton.propTypes = {
    item: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        apiType: PropTypes.string,
    }).isRequired,
    type: PropTypes.string.isRequired,
    onDelete: PropTypes.func,
};

DeleteButton.defaultProps = {
    onDelete: null,
};

export default DeleteButton;
