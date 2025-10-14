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
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Icon from '@mui/material/Icon';
import Button from '@mui/material/Button';
import CloudDownloadRounded from '@mui/icons-material/CloudDownloadRounded';
import { FormattedMessage, injectIntl } from 'react-intl';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import CircularProgress from '@mui/material/CircularProgress';
import TableRow from '@mui/material/TableRow';
import Alert from 'AppComponents/Shared/Alert';
import API from 'AppData/api';
import MCPServer from 'AppData/MCPServer';
import APIProduct from 'AppData/APIProduct';
import APIContext from 'AppComponents/Apis/Details/components/ApiContext';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import remarkGfm from 'remark-gfm';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Utils from 'AppData/Utils';
import HTMLRender from 'AppComponents/Shared/HTMLRender';
import { getBasePath } from 'AppComponents/Shared/Utils';

const PREFIX = 'View';

const classes = {
    root: `${PREFIX}-root`,
    titleWrapper: `${PREFIX}-titleWrapper`,
    titleLink: `${PREFIX}-titleLink`,
    buttonIcon: `${PREFIX}-buttonIcon`,
    displayURL: `${PREFIX}-displayURL`,
    displayURLLink: `${PREFIX}-displayURLLink`,
    paper: `${PREFIX}-paper`,
    leftCell: `${PREFIX}-leftCell`,
    summaryView: `${PREFIX}-summaryView`
};


const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.root}`]: {
        flexGrow: 1,
        marginTop: 10,
    },

    [`& .${classes.titleWrapper}`]: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },

    [`& .${classes.titleLink}`]: {
        color: theme.palette.primary.main,
    },

    [`& .${classes.buttonIcon}`]: {
        marginRight: 10,
    },

    [`& .${classes.displayURL}`]: {
        color: theme.palette.getContrastText(theme.palette.grey[200]),
        display: 'flex',
    },

    [`& .${classes.displayURLLink}`]: {
        paddingLeft: theme.spacing(2),
    },

    [`& .${classes.paper}`]: {
        marginTop: 20,
        padding: theme.spacing(2),
        height: '100%',
    },

    [`& .${classes.leftCell}`]: {
        width: 150,
    },

    [`& .${classes.summaryView}`]: {
        'wordBreak': 'break-word',
    }
}));

const ReactMarkdown = lazy(() => import('react-markdown' /* webpackChunkName: "ViewReactMD" */));

/**
 * View component to view the details of a document
 * @param {object} props - Props passed to the component
 * @returns {JSX.Element} Rendered component
 */
function View(props) {
    const {
        intl,
        match: {
            params: { documentId },
        },
    } = props;
    const { api, isAPIProduct } = useContext(APIContext);
    const isMCPServer = api.apiType === MCPServer.CONSTS.MCP;

    const [code, setCode] = useState('');
    const [doc, setDoc] = useState(null);
    const [isFileAvailable, setIsFileAvailable] = useState(true);
    let restAPI;
    if (isAPIProduct) {
        restAPI = new APIProduct();
    } else if (isMCPServer) {
        restAPI = MCPServer;
    } else {
        restAPI = new API();
    }
    
    const syntaxHighlighterDarkTheme = false;

    const loadContentForDoc = () => {
        let docPromise;
        if (isMCPServer) {
            docPromise = MCPServer.getInlineContentOfDocument(api.id, documentId);
        } else {
            docPromise = restAPI.getInlineContentOfDocument(api.id, documentId);
        }
        docPromise
            .then(contentDoc => {
                setCode(contentDoc.text);
            })
            .catch(error => {
                if (process.env.NODE_ENV !== 'production') {
                    console.log(error);
                }
            });
    };

    useEffect(() => {
        let docPromise;
        if (isMCPServer) {
            docPromise = MCPServer.getDocument(api.id, documentId);
        } else {
            docPromise = restAPI.getDocument(api.id, documentId);
        }
        docPromise
            .then(docResponse => {
                const { body } = docResponse;
                setDoc(body);
                if (body.sourceType === 'MARKDOWN' || body.sourceType === 'INLINE') {
                    loadContentForDoc();
                }

                if (body.sourceType === 'FILE') {
                    let promisedGetContent;
                    if (isMCPServer) {
                        promisedGetContent = MCPServer.getFileForDocument(api.id, documentId);
                    } else {
                        promisedGetContent = restAPI.getFileForDocument(api.id, documentId);
                    }
                    promisedGetContent
                        .then((fileResponse) => {
                            setIsFileAvailable(true);
                        })
                        .catch((error) => {
                            console.error(error);
                            setIsFileAvailable(false);
                        });
                }
            })
            .catch(error => {
                if (process.env.NODE_ENV !== 'production') {
                    console.log(error);
                }
            });
    }, [documentId]);

    const handleDownload = () => {
        let promisedGetContent;
        if (isMCPServer) {
            promisedGetContent = MCPServer.getFileForDocument(api.id, documentId);
        } else {
            promisedGetContent = restAPI.getFileForDocument(api.id, documentId);
        }
        promisedGetContent
            .then(response => {
                Utils.forceDownload(response);
            })
            .catch(error => {
                if (process.env.NODE_ENV !== 'production') {
                    console.log(error);
                    Alert.error(
                        intl.formatMessage({
                            id: 'Apis.Details.Documents.View.error.downloading',
                            defaultMessage: 'Error downloading the file',
                        }),
                    );
                }
            });
    };
    const listingPath = getBasePath(api.apiType) + api.id + '/documents';
    return doc && (
        <Root>
            <div className={classes.root}>
                <div className={classes.titleWrapper}>
                    <Link to={listingPath} className={classes.titleLink}>
                        <Typography variant='h5' component='h2' align='left' className={classes.mainTitle}>
                            <FormattedMessage id='Apis.Details.Documents.View.heading' defaultMessage='Documents' />
                        </Typography>
                    </Link>
                    <Icon>keyboard_arrow_right</Icon>
                    <Typography variant='h5' component='h3'>{doc.name}</Typography>
                </div>
                <Paper className={classes.paper}>
                    <Table className={classes.table}>
                        <TableBody>
                            <TableRow>
                                <TableCell className={classes.leftCell}>
                                    <Typography variant='body1'>
                                        <FormattedMessage
                                            id='Apis.Details.Documents.View.meta.name'
                                            defaultMessage='Name'
                                        />
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant='body1'>{doc.name}</Typography>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>
                                    <Typography variant='body1'>
                                        <FormattedMessage
                                            id='Apis.Details.Documents.View.meta.summary'
                                            defaultMessage='Summary'
                                        />
                                    </Typography>
                                </TableCell>
                                <TableCell className={classes.summaryView}>
                                    <Typography variant='body1'>{doc.summary}</Typography>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>
                                    <Typography variant='body1'>
                                        <FormattedMessage
                                            id='Apis.Details.Documents.View.meta.catogery'
                                            defaultMessage='Categorized as'
                                        />
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant='body1'>
                                        {doc.type === 'OTHER' ? doc.otherTypeName : doc.type}
                                    </Typography>{' '}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>
                                    <Typography variant='body1'>
                                        <FormattedMessage
                                            id='Apis.Details.Documents.View.meta.source'
                                            defaultMessage='Source Type'
                                        />
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant='body1'>{doc.sourceType}</Typography>{' '}
                                </TableCell>
                            </TableRow>
                            {doc.sourceType === 'FILE' && (
                                <TableRow>
                                    <TableCell>
                                        <Typography variant='body1'>
                                            <FormattedMessage
                                                id='Apis.Details.Documents.View.meta.download'
                                                defaultMessage='Download'
                                            />
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            size='small'
                                            onClick={handleDownload}
                                            disabled={!isFileAvailable}
                                            id='download-definition-btn'
                                        >
                                            <CloudDownloadRounded className={classes.buttonIcon} />
                                            <FormattedMessage
                                                id='Apis.Details.Documents.View.meta.download.file'
                                                defaultMessage='Download File'
                                            />
                                        </Button>

                                    </TableCell>
                                </TableRow>)}
                            {doc.sourceType === 'URL' && (
                                <TableRow>
                                    <TableCell>
                                        <Typography variant='body1'>
                                            <FormattedMessage
                                                id='Apis.Details.Documents.View.meta.link'
                                                defaultMessage='Link'
                                            />
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <a className={classes.displayURL} href={doc.sourceUrl} target='_blank' 
                                            rel='noreferrer'>
                                            {doc.sourceUrl}
                                            <Icon className={classes.displayURLLink}>open_in_new</Icon>
                                        </a>
                                    </TableCell>
                                </TableRow>)}
                        </TableBody>
                    </Table>
                </Paper>

                {doc.sourceType !== 'FILE' && doc.sourceType !== 'URL'&& (
                    <Paper className={classes.paper}>
                        {doc.sourceType === 'MARKDOWN' && (
                            <div className='markdown-content-wrapper'>
                                <Suspense fallback={<CircularProgress />}>
                                    <ReactMarkdown
                                        skipHtml
                                        children={code}
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            code({
                                                node, inline, className, children, ...propsInner
                                            }) {
                                                const match = /language-(\w+)/.exec(className || '');
                                                return !inline && match ? (
                                                    <SyntaxHighlighter
                                                        children={String(children).replace(/\n$/, '')}
                                                        style={syntaxHighlighterDarkTheme ? vscDarkPlus : vs}
                                                        language={match[1]}
                                                        PreTag='div'
                                                        {...propsInner}
                                                    />
                                                ) : (
                                                    <code className={className} {...propsInner}>
                                                        {children}
                                                    </code>
                                                );
                                            },
                                        }}
                                    />
                                </Suspense>
                            </div>
                        )}
                        {doc.sourceType === 'INLINE' && <HTMLRender html={code} />}
                    </Paper>
                )}
            </div>
        </Root>
    );
}

View.propTypes = {
    doc: PropTypes.shape({}).isRequired,
    apiId: PropTypes.shape({}).isRequired,
    intl: PropTypes.shape({
        formatMessage: PropTypes.func,
    }).isRequired,
    fullScreen: PropTypes.shape({}).isRequired,
};

export default injectIntl((View));
