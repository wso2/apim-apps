/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/prop-types */
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
import React, { useState, useEffect, useContext } from 'react';
import { ResourceNotFound } from 'AppComponents/Base/Errors/index';
import { Redirect, Route, Switch } from 'react-router-dom';
import { FormattedMessage, injectIntl } from 'react-intl';
import Typography from '@mui/material/Typography';
import InlineMessage from 'AppComponents/Shared/InlineMessage';
import Alert from 'AppComponents/Shared/Alert';
import API from 'AppData/api';
import Progress from 'AppComponents/Shared/Progress';
import { matchPath } from 'react-router';
import DocList from 'AppComponents/Apis/Details/Documents/DocList';
import { ApiContext } from 'AppComponents/Apis/Details/ApiContext';
import Box from '@mui/material/Box';

/**
 * Switch routes for documents.
 * @param {JSON} props The props passed down from parents.
 * @returns {JSX} Returning JSX to render.
 */
function Documents(props) {
    const { api } = useContext(ApiContext);
    const { intl, setbreadcrumbDocument } = props;
    const { location: { pathname } } = props;
    let match = matchPath(pathname, {
        path: '/apis/:apiUuid/documents/:documentId',
        exact: true,
        strict: false,
    });
    const apiId = props.match.params.apiUuid;
    let documentId = match ? match.params.documentId : null;
    const [documentList, changeDocumentList] = useState(null);
    const [selectedDoc, setSelectedDoc] = useState(null);

    useEffect(() => {
        if (selectedDoc) {
            documentId = selectedDoc.documentId;
        }
    }, [selectedDoc]);
    useEffect(() => {
        const restApi = new API();
        const promisedApi = restApi.getDocumentsByAPIId(apiId);
        promisedApi
            .then((response) => {
                const overviewDoc = response.body.list.filter((item) => item.otherTypeName !== '_overview');
                if (api.type === 'HTTP') {
                    const swaggerDoc = { documentId: 'default', name: 'Default', type: '' };
                    overviewDoc.unshift(swaggerDoc);
                }
                if (!documentId && overviewDoc.length > 0) {
                    setSelectedDoc(overviewDoc[0]);
                } else if (documentId && overviewDoc.length > 0) {
                    for (let i = 0; i < overviewDoc.length; i++) {
                        if (documentId === overviewDoc[i].documentId) {
                            setSelectedDoc(overviewDoc[i]);
                            break;
                        }
                    }
                }
                changeDocumentList(overviewDoc);
            })
            .catch((error) => {
                if (process.env.NODE_ENV !== 'production') {
                    console.log(error);
                }
                const { status } = error;
                if (status === 404) {
                    Alert.error(intl.formatMessage({
                        defaultMessage: 'Error occurred',
                        id: 'Apis.Details.Documents.Documentation.error.occurred',
                    }));
                }
            });
    }, [apiId]);
    useEffect(() => {
        if (documentList) {
            match = matchPath(pathname, {
                path: '/apis/:apiUuid/documents/:documentId',
                exact: true,
                strict: false,
            });
            documentId = match ? match.params.documentId : null;
            for (let i = 0; i < documentList.length; i++) {
                if (documentId === documentList[i].documentId) {
                    setSelectedDoc(documentList[i]);
                    break;
                }
            }
        }
    }, [documentId]);
    if (!documentList) {
        return (
            <>
                <Typography
                    variant='h4'
                    component='h2'
                    sx={(theme) => ({
                        marginLeft: theme.spacing(3),
                        paddingTop: theme.spacing(2),
                        paddingBottom: theme.spacing(2),
                        color: theme.palette.getContrastText(theme.palette.background.default),
                    })}
                >
                    <FormattedMessage
                        id='Apis.Details.Documents.Documentation.title'
                        defaultMessage='API Documentation'
                    />
                </Typography>
                <Progress />
            </>
        );
    }
    if (documentList && documentList.length === 0 && api.type !== 'HTTP') {
        return (
            <>
                <Typography
                    variant='h4'
                    component='h2'
                    sx={(theme) => ({
                        marginLeft: theme.spacing(3),
                        paddingTop: theme.spacing(2),
                        paddingBottom: theme.spacing(2),
                        color: theme.palette.getContrastText(theme.palette.background.default),
                    })}
                >
                    <FormattedMessage
                        id='Apis.Details.Documents.Documentation.title'
                        defaultMessage='API Documentation'
                    />
                </Typography>
                {documentId === null ? (
                    <Box sx={(theme) => ({
                        margin: theme.spacing(2),
                    })}
                    >
                        <InlineMessage type='info'>
                            <Typography variant='h5' component='h3'>
                                <FormattedMessage
                                    id='Apis.Details.Documents.Documentation.no.docs'
                                    defaultMessage='No Documents Available'
                                />
                            </Typography>
                            <Typography component='p'>
                                <FormattedMessage
                                    id='Apis.Details.Documents.Documentation.no.docs.content'
                                    defaultMessage='No documents are available for this API'
                                />
                            </Typography>
                        </InlineMessage>
                    </Box>
                ) : (
                    <ResourceNotFound />
                )}
            </>
        );
    }
    if (!selectedDoc && api.type !== 'HTTP') {
        return (<Progress />);
    }

    return (
        <Switch>
            { selectedDoc && <Redirect exact from={`/apis/${apiId}/documents`} to={`/apis/${apiId}/documents/${selectedDoc.documentId}`} />}
            { selectedDoc && (
                <Route
                    path='/apis/:apiUuid/documents/:documentId'
                    render={() => (
                        <DocList
                            {...props}
                            documentList={documentList}
                            selectedDoc={selectedDoc}
                            apiId={apiId}
                            setbreadcrumbDocument={setbreadcrumbDocument}
                        />
                    )}
                />
            )}
            <Route component={ResourceNotFound} />
        </Switch>
    );
}

export default injectIntl((Documents));
