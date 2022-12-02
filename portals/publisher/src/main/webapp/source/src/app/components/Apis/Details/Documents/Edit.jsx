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
import { FormattedMessage, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Slide from '@mui/material/Slide';
import Icon from '@mui/material/Icon';
import Paper from '@mui/material/Paper';
import Alert from 'AppComponents/Shared/Alert';
import CreateEditForm from './CreateEditForm';
import Api from 'AppData/api';
import { isRestricted } from 'AppData/AuthManager';
import APIContext from 'AppComponents/Apis/Details/components/ApiContext';

const styles = {
    appBar: {
        position: 'relative',
    },
    flex: {
        flex: 1,
    },
    popupHeader: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    splitWrapper: {
        padding: 0,
    },
    docName: {
        alignItems: 'center',
        display: 'flex',
    },
    button: {
        height: 30,
        marginLeft: 30,
    },
    editMetaButton: {
        whiteSpace: 'nowrap',
    },
};

function Transition(props) {
    return <Slide direction='up' {...props} />;
}

function Edit(props) {
    const restAPI = new Api();

    const { intl, apiType } = props;
    const [open, setOpen] = useState(false);
    const [saveDisabled, setSaveDisabled] = useState(false);
    let createEditForm = useRef(null);
    const { api } = useContext(APIContext);

    const toggleOpen = () => {
        setOpen(!open);
    };

    const updateDoc = () => {
        const { apiId } = props;
        const promiseWrapper = createEditForm.updateDocument(apiId);
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
                            if (process.env.NODE_ENV !== 'production') {
                                console.log(error);
                                Alert.error(intl.formatMessage({
                                    id: 'Apis.Details.Documents.Edit.markdown.editor.upload.error.message',
                                    defaultMessage: 'Error uploading the file.',
                                }));
                            }
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
                if (process.env.NODE_ENV !== 'production') {
                    console.log(error);
                    Alert.error(intl.formatMessage({
                        id: 'Apis.Details.Documents.Edit.markdown.editor.update.error.message',
                        defaultMessage: 'Error adding the document',
                    }));
                }
            });
    };

    const { classes, docId, apiId, docName } = props;
    return (
        <div>
            <Button
                onClick={toggleOpen}
                disabled={isRestricted(['apim:api_create', 'apim:api_publish'], api) || api.isRevision}
                className={classes.editMetaButton}
                aria-label={'Edit Meta Data of ' + docName}
            >
                <Icon>edit</Icon>
                <FormattedMessage
                    id='Apis.Details.Documents.Edit.documents.text.editor.edit'
                    defaultMessage='Edit Meta Data'
                />
            </Button>
            <Dialog open={open} onClose={toggleOpen} TransitionComponent={Transition} fullScreen>
                <Paper square className={classes.popupHeader}>
                    <IconButton color='inherit' onClick={toggleOpen} aria-label='Close'>
                        <Icon>close</Icon>
                    </IconButton>
                    <Typography variant='h4' className={classes.docName}>
                        <FormattedMessage
                            id='Apis.Details.Documents.Edit.documents.text.editor.edit.content'
                            defaultMessage='Edit '
                        />
                        {` ${props.docName}`}
                    </Typography>
                    <Button className={classes.button} variant='contained' color='primary' onClick={updateDoc} disabled={saveDisabled}>
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
                        innerRef={(node) => {
                            createEditForm = node;
                        }}
                        docId={docId}
                        apiId={apiId}
                        apiType={apiType}
                        saveDisabled={saveDisabled}
                        setSaveDisabled={setSaveDisabled}
                    />
                </div>
            </Dialog>
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
        apiType: PropTypes.oneOf([Api.CONSTS.API, Api.CONSTS.APIProduct]),
    }).isRequired,
};

export default injectIntl(withStyles(styles)(Edit));
