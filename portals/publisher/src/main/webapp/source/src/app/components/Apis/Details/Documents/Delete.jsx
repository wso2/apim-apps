/*
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React, { useContext, useState } from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import API from 'AppData/api.js';
import APIProduct from 'AppData/APIProduct';
import MCPServer from 'AppData/MCPServer';
import { getTypeToDisplay } from 'AppComponents/Shared/Utils';
import Icon from '@mui/material/Icon';
import Alert from 'AppComponents/Shared/Alert';
import { isRestricted } from 'AppData/AuthManager';
import APIContext from 'AppComponents/Apis/Details/components/ApiContext';

/**
 * Delete document component
 * @param {*} props {intl, apiId, docId, getDocumentsList, apiType}
 * @returns {JSX.Element} - The Delete document component
 */
function Delete(props) {
    const { intl, apiType } = props;
    const [open, setOpen] = useState(false);
    const { api } = useContext(APIContext);

    const getDeleteScopes = () => {
        if (api.apiType && api.apiType.toUpperCase() === 'MCP') {
            return ['apim:mcp_server_publish', 'apim:mcp_server_manage'];
        } else {
            return ['apim:api_create', 'apim:api_publish'];
        }
    };
    const isDeleteRestricted = () => isRestricted(getDeleteScopes(), api);

    const deleteDoc = () => {
        const {
            apiId, docId, getDocumentsList,
        } = props;
        let restApi;
        if (apiType === API.CONSTS.APIProduct) {
            restApi = new APIProduct();
        } else if (apiType === MCPServer.CONSTS.MCP) {
            restApi = MCPServer;
        } else {
            restApi = new API();
        }
        const docPromise = restApi.deleteDocument(apiId, docId);
        docPromise
            .then(() => {
                Alert.info(`${intl.formatMessage({
                    id: 'Apis.Details.Documents.Delete.document.delete.successfully',
                    defaultMessage: 'Deleted successfully.',
                })}`);
                setOpen(!open);
                getDocumentsList();
            })
            .catch((error) => {
                if (process.env.NODE_ENV !== 'production') {
                    console.log(error);
                }
                const { status } = error;
                if (status === 404) {
                    Alert.error(intl.formatMessage({
                        id: 'Apis.Details.Documents.Delete.document.delete.error',
                        defaultMessage: 'Error while deleting the document.',
                    }));
                }
            });
    };

    const runAction = (action) => {
        if (action === 'yes') {
            deleteDoc();
        } else {
            setOpen(!open);
        }
    };

    const toggleOpen = () => {
        setOpen(!open);
    };

    return (
        <div>
            <Button
                onClick={toggleOpen}
                disabled={isDeleteRestricted() || api.isRevision}
            >
                <Icon>delete_forever</Icon>
                <FormattedMessage id='Apis.Details.Documents.Delete.document.delete' defaultMessage='Delete' />
            </Button>
            <Dialog
                open={open}
                onClose={toggleOpen}
                aria-labelledby='alert-dialog-title'
                aria-describedby='alert-dialog-description'
            >
                <DialogTitle id='alert-dialog-title'>
                    <FormattedMessage
                        id='Apis.Details.Documents.Delete.document.listing.delete.confirm.title'
                        defaultMessage='Delete Document'
                    />
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id='alert-dialog-description'>
                        <FormattedMessage
                            id='Apis.Details.Documents.Delete.document.listing.delete.confirm.body'
                            defaultMessage={
                                'Selected document will be deleted from the {type}. ' +
                                'You will not be able to undo this action.'
                            }
                            values={{
                                type: getTypeToDisplay(apiType),
                            }}
                        />
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => runAction('no')}>
                        <FormattedMessage
                            id='Apis.Details.Documents.Delete.document.listing.delete.cancel'
                            defaultMessage='Cancel'
                        />
                    </Button>
                    <Button onClick={() => runAction('yes')} color='primary' autoFocus>
                        <FormattedMessage
                            id='Apis.Details.Documents.Delete.document.listing.delete'
                            defaultMessage='Delete'
                        />
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

Delete.propTypes = {
    apiId: PropTypes.shape({}).isRequired,
    apiType: PropTypes.string.isRequired,
    docId: PropTypes.shape({}).isRequired,
    getDocumentsList: PropTypes.shape({}).isRequired,
    intl: PropTypes.shape({}).isRequired,
    api: PropTypes.shape({
        id: PropTypes.string,
        apiType: PropTypes.oneOf([API.CONSTS.API, API.CONSTS.APIProduct, MCPServer.CONSTS.MCP]),
    }).isRequired,
};

export default injectIntl(Delete);
