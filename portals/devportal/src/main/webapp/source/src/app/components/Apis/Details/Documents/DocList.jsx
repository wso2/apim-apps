/* eslint-disable react/no-array-index-key */
/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable no-unused-expressions */
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
import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Details from 'AppComponents/Apis/Details/Documents/Details';
import GenerateDocument from './GenerateDocument';

const PREFIX = 'DocList';

const classes = {
    apiDocTitle: `${PREFIX}-apiDocTitle`,
    autocomplete: `${PREFIX}-autocomplete`,
    autocompleteText: `${PREFIX}-autocompleteText`,
    paper: `${PREFIX}-paper`,
    paperMenu: `${PREFIX}-paperMenu`,
    docContent: `${PREFIX}-docContent`,
    parentListItem: `${PREFIX}-parentListItem`,
    listRoot: `${PREFIX}-listRoot`,
    nested: `${PREFIX}-nested`,
    childList: `${PREFIX}-childList`,
    title: `${PREFIX}-title`,
    titleSub: `${PREFIX}-titleSub`,
    selectDocuments: `${PREFIX}-selectDocuments`,
    generateCredentialWrapper: `${PREFIX}-generateCredentialWrapper`,
    generatedDocument: `${PREFIX}-generatedDocument`,
    genericMessageWrapper: `${PREFIX}-genericMessageWrapper`,
    typeText: `${PREFIX}-typeText`,
    docLinkRoot: `${PREFIX}-docLinkRoot`,
    toggler: `${PREFIX}-toggler`,
    togglerTextParent: `${PREFIX}-togglerTextParent`,
    togglerText: `${PREFIX}-togglerText`,
    toggleWrapper: `${PREFIX}-toggleWrapper`,
    docsWrapper: `${PREFIX}-docsWrapper`,
    docContainer: `${PREFIX}-docContainer`,
    docListWrapper: `${PREFIX}-docListWrapper`,
    docView: `${PREFIX}-docView`,
    listItemRoot: `${PREFIX}-listItemRoot`,
    formcontrol: `${PREFIX}-formcontrol`,
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')((
    {
        theme,
    },
) => ({
    [`& .${classes.apiDocTitle}`]: {
        width: '50%',
        marginTop: theme.spacing(1),
    },

    [`& .${classes.autocomplete}`]: {
        display: 'flex',
        width: 300,
        padding: 0,
    },

    [`& .${classes.autocompleteText}`]: {
        paddingTop: 0,
        paddingBottom: 0,
    },

    [`& .${classes.paper}`]: {
        padding: theme.spacing(2),
        color: theme.palette.text.secondary,
        minHeight: 400,
        position: 'relative',
    },

    [`& .${classes.paperMenu}`]: {
        color: theme.palette.text.secondary,
        minHeight: 400 + theme.spacing(4),
        height: '100%',
        background: theme.custom.apiDetailPages.documentBackground,
    },

    [`& .${classes.docContent}`]: {
        paddingTop: theme.spacing(1),
    },

    [`& .${classes.parentListItem}`]: {
        borderTop: 'solid 1px #ccc',
        borderBottom: 'solid 1px #ccc',
        color: theme.palette.grey[100],
        background: theme.palette.grey[100],
        cursor: 'default',
    },

    [`& .${classes.listRoot}`]: {
        paddingTop: 0,
    },

    [`& .${classes.nested}`]: {
        paddingLeft: theme.spacing(3),
        paddingTop: 3,
        paddingBottom: 3,
    },

    [`& .${classes.childList}`]: {
        paddingTop: 0,
        marginTop: 0,
        paddingBottom: 0,
        '& .material-icons': {
            color: theme.palette.getContrastText(theme.palette.background.paper),
        },
    },

    [`& .${classes.title}`]: {
        display: 'flex',
        alignItems: 'flex-start',
    },

    [`& .${classes.titleSub}`]: {
        marginLeft: theme.spacing(2),
        padding: theme.spacing(2),
        color: theme.palette.getContrastText(theme.palette.background.default),
    },

    [`& .${classes.selectDocuments}`]: {
        marginLeft: theme.spacing(2),
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
        color: theme.palette.getContrastText(theme.palette.background.default),
    },

    [`& .${classes.generateCredentialWrapper}`]: {
        marginLeft: 0,
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
    },

    [`& .${classes.generatedDocument}`]: {
        width: '100%',
    },

    [`& .${classes.genericMessageWrapper}`]: {
        margin: theme.spacing(2),
    },

    [`& .${classes.typeText}`]: {
        color: '#000',
    },

    [`& .${classes.docLinkRoot}`]: {
        paddingLeft: 0,
        color: theme.palette.text.primary,
    },

    [`& .${classes.toggler}`]: {
        height: '100%',
        padding: '20px 0 0 0',
        cursor: 'pointer',
        marginLeft: '-20px',
        display: 'block',
        minWidth: 'inherit',
        flexDirection: 'column',
    },

    [`& .${classes.togglerTextParent}`]: {
        writingMode: 'vertical-rl',
        transform: 'rotate(180deg)',
    },

    [`& .${classes.togglerText}`]: {
        textOrientation: 'sideways',
    },

    [`& .${classes.toggleWrapper}`]: {
        position: 'relative',
        paddingLeft: 20,
        background: theme.custom.apiDetailPages.documentBackground,
    },

    [`& .${classes.docsWrapper}`]: {
        margin: 0,
        background: theme.custom.apiDetailPages.documentBackground,
    },

    [`& .${classes.docContainer}`]: {
        display: 'flex',
        marginLeft: 20,
        marginRight: 20,
        marginTop: 20,
    },

    [`& .${classes.docListWrapper}`]: {
        width: 285,
    },

    [`& .${classes.docView}`]: {
        flex: 1,
    },

    [`& .${classes.listItemRoot}`]: {
        minWidth: 30,
    },

    [`& .${classes.formcontrol}`]: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
}));

/**
 * Show document list.
 * @param {JSON} props The second number.
 * @returns {JSX} The sum of the two numbers.
 */
function DocList(props) {
    const {
        documentList, apiId, selectedDoc, setbreadcrumbDocument,
    } = props;
    const [viewDocument, setViewDocument] = useState(selectedDoc);
    useEffect(() => {
        setbreadcrumbDocument(viewDocument.name);
    }, []);
    useEffect(() => {
        setbreadcrumbDocument(selectedDoc.name);
        setViewDocument(selectedDoc);
    }, [selectedDoc]);
    return (
        <Root>
            <div className={classes.title}>
                <Typography variant='h4' className={classes.titleSub}>
                    <FormattedMessage
                        className={classes.apiDocTitle}
                        id='Apis.Details.Documents.Documentation.title'
                        defaultMessage='API Documentation'
                    />
                </Typography>
                <Autocomplete
                    autoComplete
                    autoFocus
                    value={selectedDoc}
                    id='document-autocomplete'
                    className={classes.autocomplete}
                    options={documentList}
                    groupBy={(document) => document.type}
                    getOptionLabel={(document) => document.name}
                    disableClearable
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            className={classes.autocompleteText}
                            label='Select Documents'
                            margin='normal'
                            variant='outlined'
                        />
                    )}
                    onChange={(event, doc) => {
                        props.history.push('/apis/' + apiId + '/documents/' + doc.documentId);
                        setViewDocument(doc);
                        setbreadcrumbDocument(doc.name);
                    }}
                />
            </div>
            <div className={classes.docView}>
                { viewDocument.name === 'Default' && <GenerateDocument /> }
                { viewDocument.name !== 'Default'
                && <Details documentList={documentList} selectedDoc={viewDocument} apiId={apiId} /> }
            </div>
        </Root>
    );
}

DocList.propTypes = {
    classes: PropTypes.shape({}).isRequired,
};

export default injectIntl((DocList));
