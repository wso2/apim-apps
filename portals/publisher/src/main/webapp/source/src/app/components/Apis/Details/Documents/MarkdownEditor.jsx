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

import React, { useState, useEffect, useContext, Suspense, lazy } from 'react';
import { useLocation } from 'react-router-dom';
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
import Grid from '@mui/material/Grid';
import Api from 'AppData/api';
import Alert from 'AppComponents/Shared/Alert';
import APIContext from 'AppComponents/Apis/Details/components/ApiContext';
import CircularProgress from '@mui/material/CircularProgress';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus , vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Configurations from 'Config';

const PREFIX = 'MarkdownEditor';

const classes = {
    appBar: `${PREFIX}-appBar`,
    flex: `${PREFIX}-flex`,
    popupHeader: `${PREFIX}-popupHeader`,
    splitWrapper: `${PREFIX}-splitWrapper`,
    docName: `${PREFIX}-docName`,
    markdownViewWrapper: `${PREFIX}-markdownViewWrapper`,
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
    },
    [`& .${classes.docName}`]: {
        alignItems: 'center',
        display: 'flex',
    },
    [`& .${classes.markdownViewWrapper}`]: {
        height: '100vh',
        overflowY: 'auto',
    },
    [`& .${classes.button}`]: {
        height: 30,
        marginLeft: 30,
    },
});

const MonacoEditor = lazy(() => import('react-monaco-editor' /* webpackChunkName: "MDMonacoEditor" */));
const ReactMarkdown = lazy(() => import('react-markdown' /* webpackChunkName: "MDReactMarkdown" */));

function Transition(props) {
    return <Slide direction="up" {...props} />;
}

function MarkdownEditor(props) {
    const location = useLocation();
    const { doc } = location.state || {};
    const skipHtml = Configurations.app.markdown ? Configurations.app.markdown.skipHtml : true;
    const markdownSyntaxHighlighterProps = Configurations.app.markdown ?
        Configurations.app.markdown.syntaxHighlighterProps: {};
    const syntaxHighlighterDarkTheme = Configurations.app.markdown ? 
        Configurations.app.markdown.syntaxHighlighterDarkTheme: false;
    const templateAvailble = Configurations.app.markdown && Configurations.app.markdown.template ? true : false
    const howTotemplate = templateAvailble && Configurations.app.markdown.template.howTo ? Configurations.app.markdown.template.howTo : '';
    const sampleTemplate = templateAvailble && Configurations.app.markdown.template.sample ? Configurations.app.markdown.template.sample : '';
    const otherTemplate = templateAvailble && Configurations.app.markdown.template.other ? Configurations.app.markdown.template.other : '';
    const { intl, showAtOnce, history, docType } = props;
    const { api, isAPIProduct } = useContext(APIContext);
    const [isUpdating, setIsUpdating] = useState(false);
    const [open, setOpen] = useState(showAtOnce);
    const [docContent, setDocContent] = useState();
    
    useEffect(() => {
        let templatePath = '';
        if (howTotemplate && howTotemplate !== '' && ((doc && doc.type === 'HOWTO') || docType === 'HOWTO')) {
            templatePath = `${Configurations.app.context}/site/public/templates/${howTotemplate}`;
        } else if (sampleTemplate && sampleTemplate !== '' && ((doc && doc.type === 'SAMPLES') || docType === 'SAMPLES')) {
            templatePath = `${Configurations.app.context}/site/public/templates/${sampleTemplate}`;
        } else if (otherTemplate && otherTemplate !== '' && ((doc && doc.type === 'OTHER') || docType === 'OTHER')) {
            templatePath = `${Configurations.app.context}/site/public/templates/${otherTemplate}`;
        }

        if (templatePath !== '') {
            fetch(templatePath)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch template');
                    }
                    return response.text();
                })
                .then(text => setDocContent(text))
                .catch(error => console.error(error));
        } else {
            setDocContent(
                intl.formatMessage({
                    id: 'documents.markdown.editor.default',
                    defaultMessage: '#Enter your markdown content',
                })
            );
        }
    }, [docType]);

    const toggleOpen = () => {
        if (!open) updateDoc();
        if (open && showAtOnce) {
            const urlPrefix = isAPIProduct ? 'api-products' : 'apis';
            const listingPath = `/${urlPrefix}/${api.id}/documents`;
            history.push(listingPath);
        }
        setOpen(!open);
    };
    const editorDidMount = (editor, monaco) => {
        editor.focus();
    };
    const addContentToDoc = () => {
        const restAPI = new Api();
        setIsUpdating(true);
        const docPromise = restAPI.addInlineContentToDocument(api.id, props.docId, 'MARKDOWN', docContent);
        docPromise
            .then(doc => {
                Alert.info(
                    `${doc.obj.name} ${intl.formatMessage({
                        id: 'Apis.Details.Documents.MarkdownEditor.update.success.message',
                        defaultMessage: 'updated successfully.',
                    })}`,
                );
                toggleOpen();
                setIsUpdating(false);
            })
            .catch(error => {
                if (process.env.NODE_ENV !== 'production') {
                    console.log(error);
                }
                const { status } = error;
                if (status === 404) {
                    this.setState({ apiNotFound: true });
                }
                setIsUpdating(false);
            });
    };
    const updateDoc = () => {
        const restAPI = new Api();

        const docPromise = restAPI.getInlineContentOfDocument(api.id, props.docId);
        docPromise
            .then(doc => {
                setDocContent(doc.text);
            })
            .catch(error => {
                if (process.env.NODE_ENV !== 'production') {
                    console.log(error);
                }
                const { status } = error;
                if (status === 404) {
                    this.setState({ apiNotFound: true });
                }
            });
    };
    const addApiContent = (originalMarkdown) => {
        if(originalMarkdown) {
            let newMarkdown = originalMarkdown;
            Object.keys(api).forEach((fieldName) => {
                const regex = new RegExp('___' + fieldName + '___', 'g');
                newMarkdown = newMarkdown.replace(regex, api[fieldName]);
            });
            return newMarkdown;
        } else {
            return '';
        }
    }

    const markdownWithApiData = addApiContent(docContent);

    const {  docName } = props;
    return (
        <div>
            <Button onClick={toggleOpen} disabled={api.isRevision}  aria-label={'Edit Content of ' + docName}>
                <Icon>code</Icon>
                <FormattedMessage
                    id="Apis.Details.Documents.MarkdownEditor.edit.content"
                    defaultMessage="Edit Content"
                />
            </Button>
            <StyledDialog fullScreen open={open} onClose={toggleOpen} TransitionComponent={Transition}>
                <Paper square className={classes.popupHeader}>
                    <IconButton color="inherit" onClick={toggleOpen} aria-label="Close" size='large'>
                        <Icon>close</Icon>
                    </IconButton>
                    <Typography variant="h4" className={classes.docName}>
                        <FormattedMessage
                            id="Apis.Details.Documents.MarkdownEditor.edit.content.of"
                            defaultMessage="Edit Content of"
                        />{' '}
                        "{docName}"
                    </Typography>
                    <Button className={classes.button} variant="contained" disabled={isUpdating} color="primary" onClick={addContentToDoc}>
                        <FormattedMessage
                            id="Apis.Details.Documents.MarkdownEditor.update.content.button"
                            defaultMessage="Update Content"
                        />
                        {isUpdating && <CircularProgress size={24} />}
                    </Button>
                    <Button className={classes.button} onClick={toggleOpen}>
                        <FormattedMessage
                            id="Apis.Details.Documents.MarkdownEditor.cancel.button"
                            defaultMessage="Cancel"
                        />
                    </Button>
                </Paper>
                <div className={classes.splitWrapper}>
                    <Grid container spacing={7}>
                        <Grid item xs={6} className='markdown-content-wrapper'>
                            <Suspense fallback={<CircularProgress />}>
                                <MonacoEditor
                                    width="100%"
                                    height="100vh"
                                    language="markdown"
                                    theme="vs-dark"
                                    value={docContent}
                                    options={{ selectOnLineNumbers: true }}
                                    onChange={setDocContent}
                                    editorDidMount={editorDidMount}
                                />
                            </Suspense>
                        </Grid>
                        <Grid item xs={6} className='markdown-content-wrapper'>
                            <div className={classes.markdownViewWrapper}>
                                <Suspense fallback={<CircularProgress />}>
                                    <ReactMarkdown
                                        skipHtml={skipHtml}
                                        children={markdownWithApiData}
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            code({ node, inline, className, children, ...props }) {
                                                const match = /language-(\w+)/.exec(className || '')
                                                return !inline && match ? (
                                                    <SyntaxHighlighter
                                                        children={String(children).replace(/\n$/, '')}
                                                        style={syntaxHighlighterDarkTheme ? vscDarkPlus : vs}
                                                        language={match[1]}
                                                        PreTag="div"
                                                        {...props}
                                                        {...markdownSyntaxHighlighterProps}
                                                    />
                                                ) : (
                                                    <code className={className} {...props}>
                                                        {children}
                                                    </code>
                                                );
                                            }
                                        }}
                                    />                                
                                </Suspense>
                            </div>
                        </Grid>
                    </Grid>
                </div>
            </StyledDialog>
        </div>
    );
}

MarkdownEditor.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    intl: PropTypes.shape({}).isRequired,
};

export default injectIntl(withRouter((MarkdownEditor)));
