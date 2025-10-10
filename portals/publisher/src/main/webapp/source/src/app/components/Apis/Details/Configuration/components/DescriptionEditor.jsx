/* eslint-disable no-undef */
/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React, { useState, Suspense, lazy } from 'react';
import { styled } from '@mui/material/styles';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import AppBar from '@mui/material/AppBar';
import { Toolbar } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import { isRestricted } from 'AppData/AuthManager';
import { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus , vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Configurations from 'Config';
import * as monaco from 'monaco-editor'
import { Editor as MonacoEditor, loader } from '@monaco-editor/react';

const PREFIX = 'DescriptionEditor';

// load Monaco from node_modules instead of CDN
loader.config({ monaco })

const classes = {
    flex: `${PREFIX}-flex`,
    popupHeader: `${PREFIX}-popupHeader`,
    splitWrapper: `${PREFIX}-splitWrapper`,
    editorHeader: `${PREFIX}-editorHeader`,
    markdownViewWrapper: `${PREFIX}-markdownViewWrapper`,
    appBar: `${PREFIX}-appBar`,
    button: `${PREFIX}-button`
};


const StyledDialog = styled(Dialog)(({ theme }) => ({
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
        paddingTop: 2,
    },

    [`& .${classes.editorHeader}`]: {
        alignItems: 'center',
        display: 'flex',
    },

    [`& .${classes.markdownViewWrapper}`]: {
        height: '100vh',
        overflowY: 'auto',
        padding: theme.spacing(2),
    },

    [`& .${classes.appBar}`]: {
        position: 'relative',
    },

    [`& .${classes.button}`]: {
        height: 30,
        marginLeft: 10,
    }
}));

const ReactMarkdown = lazy(() => import('react-markdown' /* webpackChunkName: "MDReactMarkdown" */));

function Transition(props) {
    return <Slide direction='up' {...props} />;
}

/**
 * DescriptionEditor for API Description / Overview
 * @param {*} props properties
 * @returns {*} DescriptionEditor component
 */
export default function DescriptionEditor(props) {
    const skipHtml = Configurations.app.markdown ? Configurations.app.markdown.skipHtml : true;
    const markdownSyntaxHighlighterProps = Configurations.app.markdown ?
        Configurations.app.markdown.syntaxHighlighterProps: {};
    const syntaxHighlighterDarkTheme = Configurations.app.markdown ? 
        Configurations.app.markdown.syntaxHighlighterDarkTheme: false;

    const {
        api,
        updateContent,
        overview,
    } = props;
    const [open, setOpen] = useState(false);
    const [content, setContent] = useState(null);
    const [apiFromContext] = useAPI();
    const [isUpdating, setIsUpdating] = useState(false);

    const getCreateScopes = () => {
        if (apiFromContext.apiType && apiFromContext.apiType.toUpperCase() === 'MCP') {
            return ['apim:mcp_server_create'];
        } else {
            return ['apim:api_create'];
        }
    };
    const isCreateRestricted = () => isRestricted(getCreateScopes(), apiFromContext);

    const toggleOpen = () => {
        if (!open) {
            setContent(overview);
        }
        setOpen(!open);
    };
    const setNewContent = (newContent) => {
        setContent(newContent);
    };
    const modifyContent = () => {
        setIsUpdating(true);
        updateContent(content);
        toggleOpen();
        setIsUpdating(false);
    };
    const editorDidMount = (editor) => {
        editor.focus();
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

    const markdownWithApiData = addApiContent(content);

    return (
        <div>
            <Button
                variant='outlined'
                color='primary'
                disabled={api.isRevision || isCreateRestricted()}
                onClick={toggleOpen}
            >
                <FormattedMessage
                    id='Apis.Details.Configuration.components.DescriptionEditor.edit.content.button'
                    defaultMessage='Edit overview markdown'
                />
            </Button>
            <StyledDialog fullScreen open={open} onClose={toggleOpen} TransitionComponent={Transition}>
                <AppBar color='inherit' className={classes.appBar}>
                    <Toolbar variant='dense'>
                        <Grid
                            container
                            direction='row'
                            justifyContent='space-between'
                            alignItems='center'
                        >
                            <Grid item xs={10}>
                                <Box display='flex' alignItems='center'>
                                    <IconButton
                                        edge='start'
                                        color='inherit'
                                        onClick={toggleOpen}
                                        aria-label='close'
                                        size='large'>
                                        <CloseIcon />
                                    </IconButton>
                                    <Box
                                        display='flex'
                                        alignItems='center'
                                        mx={1}
                                        fontFamily='fontFamily'
                                        fontSize='h4.fontSize'
                                        color='primary.main'
                                    >
                                        {api.name}
                                    </Box>
                                    <Box
                                        display='flex'
                                        alignItems='center'
                                        mx={1}
                                        fontFamily='fontFamily'
                                        fontSize='h4.fontSize'
                                        color='primary.main'
                                    >
                                        <Typography
                                            variant='h5'
                                            className={classes.editorHeader}
                                            style={{ flexShrink: 0 }}
                                        >
                                            <FormattedMessage
                                                id={'Apis.Details.Configuration.components.DescriptionEditor'
                                                    + '.edit.description.of'}
                                                defaultMessage='Overview :'
                                            />
                                        </Typography>
                                    </Box>
                                    <Box display='flex' alignItems='center' flexGrow={1} ml={1}>
                                        <Typography variant='body2' style={{ wordBreak: 'break-word' }}>
                                            <FormattedMessage
                                                id={'Apis.Details.Configuration.components.DescriptionEditor.markdown.'
                                                    + 'help'}
                                                defaultMessage='The option allows you to replace the content of the 
                                                Overview page in devportal with the content given below. 
                                                To reset to the default overview content, clear all the text below, 
                                                click `Update Content,` and save your changes.'
                                            />
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item>
                                <Button
                                    className={classes.button}
                                    variant='contained'
                                    disabled={isUpdating}
                                    color='primary'
                                    onClick={modifyContent}
                                >
                                    <FormattedMessage
                                        id='Apis.Details.Configuration.components.DescriptionEditor.update.cont.button'
                                        defaultMessage='Update Content'
                                    />
                                    {isUpdating && <CircularProgress size={24} />}
                                </Button>
                            </Grid>
                        </Grid>
                    </Toolbar>
                </AppBar>
                <div className={classes.splitWrapper}>
                    <Grid container>
                        <>
                            <Grid item xs={6}>
                                <Suspense fallback={<CircularProgress />}>
                                    <MonacoEditor
                                        width='100%'
                                        language='markdown'
                                        theme='vs-dark'
                                        value={content}
                                        options={{ selectOnLineNumbers: true }}
                                        onChange={setNewContent}
                                        onMount={editorDidMount}
                                    />
                                </Suspense>
                            </Grid>
                            <Grid item xs={6} className='markdown-content-wrapper'>
                                <div className={classes.markdownViewWrapper}>
                                    <Suspense fallback={<CircularProgress />}>
                                        <ReactMarkdown
                                            skipHtml={skipHtml}
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                code({ node, inline, className, children, ...propsInner }) {
                                                    const match = /language-(\w+)/.exec(className || '')
                                                    return !inline && match ? (
                                                        <SyntaxHighlighter
                                                            style={syntaxHighlighterDarkTheme ? 
                                                                vscDarkPlus : vs}
                                                            language={match[1]}
                                                            PreTag='div'
                                                            {...propsInner}
                                                            {...markdownSyntaxHighlighterProps}
                                                        >
                                                            {String(children).replace(/\n$/, '')}
                                                        </SyntaxHighlighter>
                                                    ) : (
                                                        <code className={className} {...propsInner}>
                                                            {children}
                                                        </code>
                                                    );
                                                }
                                            }}
                                        >
                                            {markdownWithApiData}
                                        </ReactMarkdown>                                                  
                                    </Suspense>
                                </div>
                            </Grid>
                        </>
                    </Grid>
                </div>
            </StyledDialog>
        </div>
    );
}

DescriptionEditor.propTypes = {
    api: PropTypes.shape({}).isRequired,
    updateContent: PropTypes.func.isRequired,
    overview: PropTypes.string.isRequired,
};
