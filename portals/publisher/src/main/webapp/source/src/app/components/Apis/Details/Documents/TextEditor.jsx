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

import React, { useState, useContext } from 'react';
import { styled } from '@mui/material/styles';
import { withRouter } from 'react-router-dom';
import { FormattedMessage, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Slide from '@mui/material/Slide';
import Icon from '@mui/material/Icon';
import Paper from '@mui/material/Paper';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import Api from 'AppData/api';
import APIProduct from 'AppData/APIProduct';
import MCPServer from 'AppData/MCPServer';
import Alert from 'AppComponents/Shared/Alert';
import APIContext from 'AppComponents/Apis/Details/components/ApiContext';
import { isRestricted } from 'AppData/AuthManager';
import CircularProgress from '@mui/material/CircularProgress';
import { getBasePath } from 'AppComponents/Shared/Utils';

const PREFIX = 'TextEditor';

const classes = {
    appBar: `${PREFIX}-appBar`,
    flex: `${PREFIX}-flex`,
    popupHeader: `${PREFIX}-popupHeader`,
    splitWrapper: `${PREFIX}-splitWrapper`,
    docName: `${PREFIX}-docName`,
    button: `${PREFIX}-button`
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
        height: 'calc(100vh - 64px)',
        overflow: 'hidden',
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

/**
 * Transition component
 * @param {Object} props - Props passed to the component
 * @returns {JSX.Element} - The Transition component
 */
function Transition(props) {
    return <Slide direction='up' {...props} />;
}

/**
 * TextEditor component
 * @param {Object} props - Props passed to the component
 * @returns {JSX.Element} - The TextEditor component
 */
function TextEditor(props) {
    const {
        intl, showAtOnce, history, docId, docName,
    } = props;
    const { api, isAPIProduct } = useContext(APIContext);
    const [open, setOpen] = useState(showAtOnce);
    const [editorState, setEditorState] = useState(EditorState.createEmpty());
    const [isUpdating, setIsUpdating] = useState(false);

    const getAllowedScopes = () => {
        if (api.apiType && api.apiType.toUpperCase() === 'MCP') {
            return ['apim:mcp_server_create', 'apim:mcp_server_manage', 'apim:document_manage'];
        } else {
            return ['apim:api_create', 'apim:api_publish'];
        }
    };
    const isAccessRestricted = () => isRestricted(getAllowedScopes(), api);

    const onEditorStateChange = (newEditorState) => {
        setEditorState(newEditorState);
    };

    const updateDoc = () => {
        let restAPI;
        if (isAPIProduct) {
            restAPI = new APIProduct();
        } else if (api.apiType === MCPServer.CONSTS.MCP) {
            restAPI = MCPServer;
        } else {
            restAPI = new Api();
        }

        const docPromise = restAPI.getInlineContentOfDocument(api.id, docId);
        docPromise
            .then((doc) => {
                const contentBlock = htmlToDraft(doc.text);
                if (contentBlock) {
                    const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
                    const tempEditorState = EditorState.createWithContent(contentState);
                    setEditorState(tempEditorState);
                }
            })
            .catch((error) => {
                if (process.env.NODE_ENV !== 'production') {
                    console.log(error);
                }
                const { status } = error;
                if (status === 404) {
                    this.setState({ apiNotFound: true });
                }
            });
    };

    const toggleOpen = () => {
        if (!open) updateDoc();

        if (open && showAtOnce) {
            const listingPath = getBasePath(api.apiType) + api.id + '/documents';
            history.push(listingPath);
        }
        setOpen(!open);
    };

    const addContentToDoc = () => {
        let restAPI;
        if (isAPIProduct) {
            restAPI = new APIProduct();
        } else if (api.apiType === MCPServer.CONSTS.MCP) {
            restAPI = MCPServer;
        } else {
            restAPI = new Api();
        }
        setIsUpdating(true);
        const contentToSave = draftToHtml(convertToRaw(editorState.getCurrentContent()));
        const docPromise = restAPI.addInlineContentToDocument(api.id, docId, 'INLINE', contentToSave);
        docPromise
            .then((response) => {
                Alert.info(`${response.obj.name} ${intl.formatMessage({
                    id: 'Apis.Details.Documents.TextEditor.update.success.message',
                    defaultMessage: 'updated successfully.',
                })}`);
                toggleOpen();
                setIsUpdating(false);
            })
            .catch((error) => {
                if (process.env.NODE_ENV !== 'production') {
                    console.log(error);
                }
                Alert.error(`${error} ${intl.formatMessage({
                    id: 'Apis.Details.Documents.TextEditor.update.error.message',
                    defaultMessage: 'update failed.',
                })}`);
                setIsUpdating(false);
            });
    };

    const embedCallback = (url) => {
        try {
            const parsedUrl = new URL(url);
            if (['http:', 'https:'].includes(parsedUrl.protocol)) {
                return url;
            }
        } catch (_) {
            // ignored, will show the error below
        }

        Alert.error(
            intl.formatMessage({
                id: 'Apis.Details.Documents.TextEditor.edit.content.invalid.url',
                defaultMessage:
                    'Invalid URL. The URL must start with http:// or https://',
            }),
        );
        return null;
    };

    return (
        <div>
            <Button
                onClick={toggleOpen}
                disabled={isAccessRestricted() || api.isRevision}
                aria-label={`Edit Content of ${docName}`}
            >
                <Icon>description</Icon>
                <FormattedMessage id='Apis.Details.Documents.TextEditor.edit.content' defaultMessage='Edit Content' />
            </Button>
            <StyledDialog fullScreen open={open} onClose={toggleOpen} TransitionComponent={Transition}>
                <Paper square className={classes.popupHeader}>
                    <IconButton color='inherit' onClick={toggleOpen} aria-label='Close' size='large'>
                        <Icon>close</Icon>
                    </IconButton>
                    <Typography variant='h4' className={classes.docName}>
                        <FormattedMessage
                            id='Apis.Details.Documents.TextEditor.edit.content.of'
                            defaultMessage='Edit Content of'
                        />{' '}
                        &quot;{docName}&quot;
                    </Typography>
                    <Button
                        className={classes.button}
                        variant='contained'
                        disabled={isUpdating}
                        color='primary'
                        onClick={addContentToDoc}
                    >
                        <FormattedMessage
                            id='Apis.Details.Documents.TextEditor.update.content.button'
                            defaultMessage='Update Content'
                        />
                        {isUpdating && <CircularProgress size={24} />}
                    </Button>
                    <Button className={classes.button} onClick={toggleOpen}>
                        <FormattedMessage
                            id='Apis.Details.Documents.TextEditor.cancel.button'
                            defaultMessage='Cancel'
                        />
                    </Button>
                </Paper>
                <div className={classes.splitWrapper}>
                    <Editor
                        editorState={editorState}
                        wrapperClassName='draftjs-wrapper'
                        editorClassName='draftjs-editor'
                        editorStyle={{ height: 'calc(100vh - 128px)', overflowY: 'auto' }}
                        onEditorStateChange={onEditorStateChange}
                        toolbar={{
                            embedded: {
                                embedCallback: embedCallback,
                            },
                        }}
                    />
                </div>
            </StyledDialog>
        </div>
    );
}

TextEditor.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    docId: PropTypes.string.isRequired,
    intl: PropTypes.shape({}).isRequired,
    showAtOnce: PropTypes.bool.isRequired,
    api: PropTypes.shape({
        id: PropTypes.string,
        apiType: PropTypes.oneOf([Api.CONSTS.API, Api.CONSTS.APIProduct, MCPServer.CONSTS.MCP]),
    }).isRequired,
    docName: PropTypes.string.isRequired,
};

export default injectIntl(withRouter((TextEditor)));
