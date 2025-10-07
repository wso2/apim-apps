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

import React, {useState, useRef, useContext} from 'react';
import { styled } from '@mui/material/styles';
import { FormattedMessage, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Slide from '@mui/material/Slide';
import Icon from '@mui/material/Icon';
import Paper from '@mui/material/Paper';
import Alert from 'AppComponents/Shared/Alert';
import Api from 'AppData/api';
import MCPServer from 'AppData/MCPServer';
import { isRestricted } from 'AppData/AuthManager';
import APIContext from 'AppComponents/Apis/Details/components/ApiContext';
import CreateEditForm from './CreateEditForm';

const PREFIX = 'Edit';

const classes = {
    appBar: `${PREFIX}-appBar`,
    flex: `${PREFIX}-flex`,
    popupHeader: `${PREFIX}-popupHeader`,
    splitWrapper: `${PREFIX}-splitWrapper`,
    docName: `${PREFIX}-docName`,
    button: `${PREFIX}-button`,
    editMetaButton: `${PREFIX}-editMetaButton`
};

const StyledDialog = styled(Dialog)({
    [`& .${classes.appBar}`]: {
        position: 'relative',
    },
    [`& .${classes.flex}`]: {
        flex: 1,
    },
    [`& .${classes.popupHeader}`]: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    [`& .${classes.splitWrapper}`]: {
        padding: 0,
    },
    [`& .${classes.docName}`]: {
        alignItems: 'center',
        display: 'flex',
    },
    [`& .${classes.button}`]: {
        height: 30,
        marginLeft: 30,
    },
});

function Transition(props) {
    return <Slide direction='up' {...props} />;
}

/**
 * Edit document component
 * @param {*} props {intl, apiType, apiId, docId, docName, getDocumentsList}
 * @returns {JSX.Element} The Edit document component
 */
function Edit(props) {
    const { intl, apiType } = props;
    let restAPI;
    if (apiType === Api.CONSTS.APIProduct) {
        restAPI = new Api();
    } else if (apiType === MCPServer.CONSTS.MCP) {
        restAPI = MCPServer;
    } else {
        restAPI = new Api();
    }
    const [open, setOpen] = useState(false);
    const [saveDisabled, setSaveDisabled] = useState(false);
    const createEditForm = useRef(null);
    const { api } = useContext(APIContext);

    const getAllowedScopes = () => {
        if (api.apiType && api.apiType.toUpperCase() === MCPServer.CONSTS.MCP) {
            return ['apim:mcp_server_publish', 'apim:mcp_server_manage'];
        } else {
            return ['apim:api_create', 'apim:api_publish'];
        }
    };
    const isAccessRestricted = () => isRestricted(getAllowedScopes(), api);

    const toggleOpen = () => {
        setOpen(!open);
    };

    const updateDoc = () => {
        const { apiId } = props;
        const promiseWrapper = createEditForm.current.updateDocument(apiId);
        promiseWrapper.docPromise
            .then((doc) => {
                const { documentId, name } = doc.body;
                if (promiseWrapper.file && documentId) {
                    const filePromise = restAPI.addFileToDocument(apiId, documentId, promiseWrapper.file[0]);
                    filePromise
                        .then((doc) => {
                            Alert.info(`${name} ${intl.formatMessage({
                                id: 'Apis.Details.Documents.Edit.markdown.editor.upload.success.message',
                                defaultMessage: 'File uploaded successfully.',
                            })}`);
                            props.getDocumentsList();
                            toggleOpen();
                        })
                        .catch((error) => {
                            Alert.error(intl.formatMessage({
                                id: 'Apis.Details.Documents.Edit.markdown.editor.upload.error.message',
                                defaultMessage: 'Error uploading the file.',
                            }));
                        });
                } else {
                    Alert.info(`${name} ${intl.formatMessage({
                        id: 'Apis.Details.Documents.Edit.markdown.editor.update.success.message',
                        defaultMessage: 'Updated successfully.',
                    })}`);
                    props.getDocumentsList();
                    toggleOpen();
                }
            })
            .catch((error) => {
                Alert.error(intl.formatMessage({
                    id: 'Apis.Details.Documents.Edit.markdown.editor.update.error.message',
                    defaultMessage: 'Error adding the document',
                }));
            });
    };

    const {  docId, apiId, docName } = props;
    return (
        <div>
            <Button
                onClick={toggleOpen}
                disabled={isAccessRestricted() || api.isRevision}
                sx={{ whiteSpace: 'nowrap' }}
                aria-label={'Edit Meta Data of ' + docName}
            >
                <Icon>edit</Icon>
                <FormattedMessage
                    id='Apis.Details.Documents.Edit.documents.text.editor.edit'
                    defaultMessage='Edit Meta Data'
                />
            </Button>
            <StyledDialog open={open} onClose={toggleOpen} TransitionComponent={Transition} fullScreen>
                <Paper square className={classes.popupHeader}>
                    <IconButton color='inherit' onClick={toggleOpen} aria-label='Close' size='large'>
                        <Icon>close</Icon>
                    </IconButton>
                    <Typography variant='h4' className={classes.docName}>
                        <FormattedMessage
                            id='Apis.Details.Documents.Edit.documents.text.editor.edit.content'
                            defaultMessage='Edit '
                        />
                        {` ${props.docName}`}
                    </Typography>
                    <Button
                        className={classes.button}
                        variant='contained'
                        color='primary'
                        onClick={updateDoc}
                        disabled={saveDisabled}
                    >
                        <FormattedMessage
                            id='Apis.Details.Documents.Edit.documents.text.editor.update.content'
                            defaultMessage='Save'
                        />
                    </Button>
                    <Button className={classes.button} onClick={toggleOpen}>
                        <FormattedMessage
                            id='Apis.Details.Documents.Edit.documents.text.editor.cancel'
                            defaultMessage='Cancel'
                        />
                    </Button>
                </Paper>
                <div className={classes.splitWrapper}>
                    <CreateEditForm
                        ref={createEditForm}
                        docId={docId}
                        apiId={apiId}
                        apiType={apiType}
                        saveDisabled={saveDisabled}
                        setSaveDisabled={setSaveDisabled}
                    />
                </div>
            </StyledDialog>
        </div>
    );
}
Edit.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    apiId: PropTypes.shape({}).isRequired,
    docId: PropTypes.shape({}).isRequired,
    getDocumentsList: PropTypes.shape({}).isRequired,
    intl: PropTypes.shape({}).isRequired,
    api: PropTypes.shape({
        id: PropTypes.string,
        apiType: PropTypes.oneOf([Api.CONSTS.API, Api.CONSTS.APIProduct, MCPServer.CONSTS.MCP]),
    }).isRequired,
};

export default injectIntl((Edit));
