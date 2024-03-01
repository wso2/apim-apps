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
import { FormattedMessage, injectIntl } from 'react-intl';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import CircularProgress from '@mui/material/CircularProgress';
import TableRow from '@mui/material/TableRow';
import Alert from 'AppComponents/Shared/Alert';
import API from 'AppData/api';
import APIProduct from 'AppData/APIProduct';
import APIContext from 'AppComponents/Apis/Details/components/ApiContext';
import Utils from 'AppData/Utils';
import Configuration from 'Config';
import HTMLRender from 'AppComponents/Shared/HTMLRender';

const PREFIX = 'View';

const classes = {
    root: `${PREFIX}-root`,
    titleWrapper: `${PREFIX}-titleWrapper`,
    titleLink: `${PREFIX}-titleLink`,
    docTitle: `${PREFIX}-docTitle`,
    docBadge: `${PREFIX}-docBadge`,
    button: `${PREFIX}-button`,
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

    [`& .${classes.docTitle}`]: {
        fontWeight: 100,
        fontSize: 50,
        color: theme.palette.grey[500],
    },

    [`& .${classes.docBadge}`]: {
        padding: theme.spacing(1),
        background: theme.palette.primary.main,
        position: 'absolute',
        top: 0,
        marginTop: -22,
        color: theme.palette.getContrastText(theme.palette.primary.main),
    },

    [`& .${classes.button}`]: {
        padding: theme.spacing(2),
        marginTop: theme.spacing(2),
    },

    [`& .${classes.displayURL}`]: {
        padding: theme.spacing(2),
        marginTop: theme.spacing(2),
        background: theme.palette.grey[200],
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
 *
 *
 * @param {*} props
 * @returns
 */
function View(props) {
    const {
        fullScreen,
        intl,
        match: {
            params: { documentId },
        },
    } = props;
    const { api, isAPIProduct } = useContext(APIContext);

    const [code, setCode] = useState('');
    const [doc, setDoc] = useState(null);
    const [isFileAvailable, setIsFileAvailable] = useState(true);
    const restAPI = isAPIProduct ? new APIProduct() : new API();
    
    useEffect(() => {
        const docPromise = restAPI.getDocument(api.id, documentId);
        docPromise
            .then(doc => {
                const { body } = doc;
                setDoc(body);
                if (body.sourceType === 'MARKDOWN' || body.sourceType === 'INLINE') loadContentForDoc();

                if (body.sourceType === 'FILE') {
                    const promised_get_content = restAPI.getFileForDocument(api.id, documentId);
                    promised_get_content
                        .then((done) => {
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

    const loadContentForDoc = () => {
        const docPromise = restAPI.getInlineContentOfDocument(api.id, documentId);
        docPromise
            .then(doc => {
                setCode(doc.text);
            })
            .catch(error => {
                if (process.env.NODE_ENV !== 'production') {
                    console.log(error);
                }
            });
    };

    const handleDownload = () => {
        const promised_get_content = restAPI.getFileForDocument(api.id, documentId);
        promised_get_content
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
    const urlPrefix = isAPIProduct ? 'api-products' : 'apis';
    const listingPath = `/${urlPrefix}/${api.id}/documents`;
    return doc && (
        <Root>
            <div className={classes.root}>
                <div className={classes.titleWrapper}>
                    <Link to={listingPath} className={classes.titleLink}>
                        <Typography variant="h5" component='h2' align="left" className={classes.mainTitle}>
                            <FormattedMessage id="Apis.Details.Documents.View.heading" defaultMessage="Documents" />
                        </Typography>
                    </Link>
                    <Icon>keyboard_arrow_right</Icon>
                    <Typography variant="h5" component='h3'>{doc.name}</Typography>
                </div>
                <Paper className={classes.paper}>
                    <Table className={classes.table}>
                        <TableBody>
                            <TableRow>
                                <TableCell className={classes.leftCell}>
                                    <Typography variant="body1">
                                        <FormattedMessage
                                            id="Apis.Details.Documents.View.meta.name"
                                            defaultMessage="Name"
                                        />
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body1">{doc.name}</Typography>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>
                                    <Typography variant="body1">
                                        <FormattedMessage
                                            id="Apis.Details.Documents.View.meta.summary"
                                            defaultMessage="Summary"
                                        />
                                    </Typography>
                                </TableCell>
                                <TableCell className={classes.summaryView}>
                                    <Typography variant="body1">{doc.summary}</Typography>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>
                                    <Typography variant="body1">
                                        <FormattedMessage
                                            id="Apis.Details.Documents.View.meta.catogery"
                                            defaultMessage="Categorized as"
                                        />
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body1">
                                        {doc.type === 'OTHER' ? doc.otherTypeName : doc.type}
                                    </Typography>{' '}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>
                                    <Typography variant="body1">
                                        <FormattedMessage
                                            id="Apis.Details.Documents.View.meta.source"
                                            defaultMessage="Source Type"
                                        />
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body1">{doc.sourceType}</Typography>{' '}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Paper>

                <Paper className={classes.paper}>
                    {doc.sourceType === 'MARKDOWN' && (
                        <Suspense fallback={<CircularProgress />}>
                            <ReactMarkdown escapeHtml>{code}</ReactMarkdown>
                        </Suspense>
                    )}
                    {doc.sourceType === 'INLINE' && <HTMLRender html={code} />}
                    {doc.sourceType === 'URL' && (
                        <a className={classes.displayURL} href={doc.sourceUrl} target="_blank">
                            {doc.sourceUrl}
                            <Icon className={classes.displayURLLink}>open_in_new</Icon>
                        </a>
                    )}
                    {doc.sourceType === 'FILE' && (
                        <Button
                            variant="contained"
                            className={classes.button}
                            onClick={handleDownload}
                            disabled={!isFileAvailable}>
                            <FormattedMessage
                                id="Apis.Details.Documents.View.btn.download"
                                defaultMessage="Download"
                            />

                            <Icon>arrow_downward</Icon>
                        </Button>
                    )}
                </Paper>
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
