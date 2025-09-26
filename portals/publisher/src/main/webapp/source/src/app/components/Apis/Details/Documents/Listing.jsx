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

import React, { Suspense, lazy } from 'react';
import { styled } from '@mui/material/styles';
import { FormattedMessage, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import MUIDataTable from 'mui-datatables';
import API from 'AppData/api.js';
import MCPServer from 'AppData/MCPServer';
import APIProduct from 'AppData/APIProduct';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import AddCircle from '@mui/icons-material/AddCircle';
import Icon from '@mui/material/Icon';
import Paper from '@mui/material/Paper';
import Alert from 'AppComponents/Shared/Alert';
import Progress from 'AppComponents/Shared/Progress';
import { withAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import InlineMessage from 'AppComponents/Shared/InlineMessage';
import { isRestricted } from 'AppData/AuthManager';
import { getBasePath } from 'AppComponents/Shared/Utils';
import Create from './Create';
import MarkdownEditor from './MarkdownEditor';
import Edit from './Edit';
import Delete from './Delete';
import DeleteMultiple from './DeleteMultiple';
import Download from './Download';
import ViewDocument from './ViewDocument';

const PREFIX = 'Listing';

const classes = {
    root: `${PREFIX}-root`,
    contentWrapper: `${PREFIX}-contentWrapper`,
    titleWrapper: `${PREFIX}-titleWrapper`,
    mainTitle: `${PREFIX}-mainTitle`,
    actionTable: `${PREFIX}-actionTable`,
    actions: `${PREFIX}-actions`,
    head: `${PREFIX}-head`,
    genDocumentButton: `${PREFIX}-genDocumentButton`,
    buttonIcon: `${PREFIX}-buttonIcon`,
    subHeading: `${PREFIX}-subHeading`,
    documentsPaper: `${PREFIX}-documentsPaper`
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

    [`& .${classes.contentWrapper}`]: {
        maxWidth: theme.custom.contentAreaWidth,
    },

    [`& .${classes.titleWrapper}`]: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing(2),
    },

    [`& .${classes.mainTitle}`]: {
        paddingRight: 10,
    },

    [`& .${classes.actionTable}`]: {
        '& td': {
            width: 50,
        },
        '& td:first-child': {
            width: 130,
        },
    },

    [`& .${classes.actions}`]: {
        padding: '20px 0',
        '& button': {
            marginLeft: 0,
        },
    },

    [`& .${classes.head}`]: {
        fontWeight: 200,
        marginBottom: 20,
    },

    [`& .${classes.genDocumentButton}`]: {
        marginRight:10,
    },

    [`& .${classes.buttonIcon}`]: {
        marginRight: theme.spacing(1),
    },

    [`& .${classes.subHeading}`]: {
        fontSize: '1rem',
        fontWeight: 400,
        marginBottom: 10,
        display: 'inline-flex',
        lineHeight: 1.5,
    },

    [`& .${classes.documentsPaper}`]: {
        marginTop: theme.spacing(2),
        padding: theme.spacing(2),
    }
}));

const TextEditor = lazy(() => import('./TextEditor' /* webpackChunkName: "ListingTextEditor" */));

/**
 * LinkGenerator component for generating document links
 * @param {Object} props - Props passed to the component
 * @param {string} props.docName - The name of the document
 * @param {string} props.docId - The ID of the document
 * @param {string} props.apiId - The ID of the API
 * @param {string} props.apiType - The type of the API
 * @returns {JSX.Element} - Rendered link element
 */
function LinkGenerator(props) {
    const { docName, docId, apiId, apiType } = props;
    return (
        <Link to={getBasePath(apiType) + apiId + '/documents/' + docId + '/details'}>
            {docName}
        </Link>
    );
}

/**
 * Listing component for displaying documents of an API
 * @returns {JSX.Element} - Rendered component
 */
class Listing extends React.Component {
    /**
     * Constructor for Listing component
     * @param {Object} props - Props passed to the component
     * @returns {void}
     */
    constructor(props) {
        super(props);
        this.state = {
            docs: null,
            showAddDocs: false,
            docsToDelete: null,
        };
        this.apiId = props.api.id;
        this.toggleAddDocs = this.toggleAddDocs.bind(this);
        this.getDocumentsList = this.getDocumentsList.bind(this);
    }

    /**
     * @inheritDoc
     * @memberof Listing
     */
    componentDidMount() {
        this.getDocumentsList();
    }

    /**
     * Fetches the list of documents associated with the API
     * and updates the component state with the document list.
     * @returns {void}
     */
    getDocumentsList() {
        const { api, intl } = this.props;
        const  getSortOrder = (prop) => {    
            return function(a, b) {    
                if (a[prop] > b[prop]) {    
                    return 1;    
                } else if (a[prop] < b[prop]) {    
                    return -1;    
                }    
                return 0;    
            }
        }
        if (api.apiType === API.CONSTS.APIProduct) {
            const apiProduct = new APIProduct();
            const docs = apiProduct.getDocuments(api.id);
            docs.then((response) => {
                const documentList = response.body.list.filter((item) => item.otherTypeName !== '_overview');
                documentList.sort(getSortOrder('name'));
                this.setState({ docs: documentList });
            }).catch((errorResponse) => {
                const errorData = JSON.parse(errorResponse.message);
                const messageTxt =
                    'Error[' + errorData.code + ']: ' + errorData.description + ' | ' + errorData.message + '.';
                console.error(messageTxt);
                Alert.error(intl.formatMessage({
                    id: 'Apis.Details.Documents.Listing.documents.listing.fetching.error.message.api.product',
                    defaultMessage: 'Error in fetching documents list of the API Product',
                }));
            });
        } else if (api.apiType === MCPServer.CONSTS.MCP) {
            const docs = MCPServer.getDocuments(api.id);
            docs.then((response) => {
                const documentList = response.body.list.filter((item) => item.otherTypeName !== '_overview');
                documentList.sort(getSortOrder('name'));
                this.setState({ docs: documentList });
            }).catch((errorResponse) => {
                const errorData = JSON.parse(errorResponse.message);
                const messageTxt =
                    'Error[' + errorData.code + ']: ' + errorData.description + ' | ' + errorData.message + '.';
                console.error(messageTxt);
                Alert.error(intl.formatMessage({
                    id: 'Apis.Details.Documents.Listing.documents.listing.fetching.error.message.mcp',
                    defaultMessage: 'Error in fetching documents list of the MCP Server',
                }));
            });
        } else {
            const newApi = new API();
            const docs = newApi.getDocuments(api.id);
            docs.then((response) => {
                const documentList = response.body.list.filter((item) => item.otherTypeName !== '_overview');
                documentList.sort(getSortOrder('name'));
                this.setState({ docs: documentList });
            }).catch((errorResponse) => {
                const errorData = JSON.parse(errorResponse.message);
                const messageTxt =
                    'Error[' + errorData.code + ']: ' + errorData.description + ' | ' + errorData.message + '.';
                console.error(messageTxt);
                Alert.error(intl.formatMessage({
                    id: 'Apis.Details.Documents.Listing.documents.listing.fetching.error.message',
                    defaultMessage: 'Error in fetching documents list of the API',
                }));
            });
        }
    }

    /**
     * Get the allowed scopes list
     * @returns {string[]} The allowed scopes
     */
    getAllowedScopes() {
        const { api } = this.props;
        if (api.apiType && api.apiType.toUpperCase() === MCPServer.CONSTS.MCP) {
            return ['apim:mcp_server_create', 'apim:mcp_server_manage', 'apim:document_manage'];
        } else {
            return ['apim:api_create', 'apim:api_publish'];
        }
    }

    /**
     * Check if the action is restricted
     * @returns {boolean} True if the action is restricted, false otherwise
     */
    isAccessRestricted() {
        const { api } = this.props;
        return isRestricted(this.getAllowedScopes(), api);
    }

    /**
     * Toggles the visibility of the add document section
     */
    toggleAddDocs() {
        this.setState((oldState) => {
            return { showAddDocs: !oldState.showAddDocs };
        });
    }

    /**
     * Renders the component
     * @returns {JSX.Element} - Rendered component
     */
    render() {
        const {  api, intl } = this.props;
        const { docs, showAddDocs, docsToDelete } = this.state;
        const url = getBasePath(api.apiType) + api.id + '/documents/create';
        const showActionsColumn = this.isAccessRestricted() ? 'excluded' : true;
        const options = {
            title: false,
            filter: false,
            print: false,
            download: false,
            viewColumns: false,
            customToolbar: false,
            search: false,
            onRowsDelete: (rowData, rowMeta, that = this) => {
                that.setState({ docsToDelete: rowData });
                return false;
            },
            textLabels: {
                pagination: {
                    rowsPerPage: intl.formatMessage({
                        id: 'Mui.data.table.pagination.rows.per.page',
                        defaultMessage: 'Rows per page:',
                    }),
                    displayRows: intl.formatMessage({
                        id: 'Mui.data.table.pagination.display.rows',
                        defaultMessage: 'of',
                    }),
                },
            },
        };
        const columns = [
            {
                name: 'documentId',
                options: {
                    display: 'excluded',
                    filter: false,
                },
            },
            {
                name: 'name',
                options: {
                    customBodyRender: (value, tableMeta) => {
                        if (tableMeta.rowData) {
                            const docName = tableMeta.rowData[1];
                            const docId = tableMeta.rowData[0];
                            return (
                                <LinkGenerator
                                    docName={docName}
                                    docId={docId}
                                    apiId={this.apiId}
                                    apiType={api.apiType}
                                />
                            );
                        }
                        return null;
                    },
                    filter: false,
                    sort: false,
                    label: (
                        <FormattedMessage
                            id='Apis.Details.Documents.Listing.column.header.name'
                            defaultMessage='Name'
                        />
                    ),
                },
            },
            {
                name: 'sourceType',
                label: (
                    <FormattedMessage
                        id='Apis.Details.Documents.Listing.column.header.source.type'
                        defaultMessage='Source Type'
                    />
                ),
                options: {
                    sort: false,
                },
            },
            {
                name: 'type',
                label: (
                    <FormattedMessage id='Apis.Details.Documents.Listing.column.header.type' defaultMessage='Type' />
                ),
                options: {
                    sort: false,
                },
            },
            {
                name: 'sourceUrl',
                options: {
                    display: 'excluded',
                    filter: false,
                    sort: false,
                },
            },
            {
                name: 'action',
                label: (
                    <FormattedMessage
                        id='Apis.Details.Documents.Listing.column.header.action'
                        defaultMessage='Action'
                    />
                ),
                options: {
                    display: showActionsColumn,
                    customBodyRender: (value, tableMeta) => {
                        if (tableMeta.rowData) {
                            const docName = tableMeta.rowData[1];
                            const docId = tableMeta.rowData[0];
                            const sourceType = tableMeta.rowData[2];
                            const docType = tableMeta.rowData[3];
                            const sourceUrl = tableMeta.rowData[4];
                            if (sourceType === 'MARKDOWN') {
                                return (
                                    <table className={classes.actionTable}>
                                        <tr>
                                            <td>
                                                <MarkdownEditor
                                                    docName={docName}
                                                    docId={docId}
                                                    apiId={this.apiId}
                                                    docType={docType}
                                                />
                                            </td>
                                            <td>
                                                <Edit
                                                    apiType={api.apiType}
                                                    docName={docName}
                                                    docId={docId}
                                                    apiId={this.apiId}
                                                    getDocumentsList={this.getDocumentsList}
                                                    api
                                                />
                                            </td>
                                            <td>
                                                <Delete
                                                    docName={docName}
                                                    docId={docId}
                                                    apiId={this.apiId}
                                                    getDocumentsList={this.getDocumentsList}
                                                    apiType={api.apiType}
                                                    api
                                                />
                                            </td>
                                        </tr>
                                    </table>
                                );
                            } else if (sourceType === 'INLINE') {
                                return (
                                    <table className={classes.actionTable}>
                                        <tr>
                                            <td>
                                                <Suspense
                                                    fallback={
                                                        <FormattedMessage
                                                            id='Apis.Details.Documents.Listing.loading'
                                                            defaultMessage='Loading...'
                                                        />
                                                    }
                                                >
                                                    <TextEditor
                                                        docName={docName}
                                                        docId={docId}
                                                        apiId={this.apiId}
                                                        apiType={api.apiType}
                                                    />
                                                </Suspense>
                                            </td>
                                            <td>
                                                <Edit
                                                    apiType={api.apiType}
                                                    docName={docName}
                                                    docId={docId}
                                                    apiId={this.apiId}
                                                    getDocumentsList={this.getDocumentsList}
                                                    api
                                                />
                                            </td>
                                            <td>
                                                <Delete
                                                    docName={docName}
                                                    docId={docId}
                                                    apiId={this.apiId}
                                                    getDocumentsList={this.getDocumentsList}
                                                    apiType={api.apiType}
                                                    api
                                                />
                                            </td>
                                        </tr>
                                    </table>
                                );
                            } else if (sourceType === 'URL') {
                                return (
                                    <table className={classes.actionTable}>
                                        <tr>
                                            <td>
                                                <a href={sourceUrl}>
                                                    <Button>
                                                        <Icon>open_in_new</Icon>
                                                        <FormattedMessage
                                                            id='Apis.Details.Documents.Listing.documents.open'
                                                            defaultMessage='Open'
                                                        />
                                                    </Button>
                                                </a>  
                                            </td>
                                            <td>
                                                <Edit
                                                    apiType={api.apiType}
                                                    docName={docName}
                                                    docId={docId}
                                                    apiId={this.apiId}
                                                    getDocumentsList={this.getDocumentsList}
                                                    api
                                                />
                                            </td>
                                            <td>
                                                <Delete
                                                    docName={docName}
                                                    docId={docId}
                                                    apiId={this.apiId}
                                                    getDocumentsList={this.getDocumentsList}
                                                    apiType={api.apiType}
                                                    api
                                                />
                                            </td>
                                        </tr>
                                    </table>
                                );
                            } else if (sourceType === 'FILE') {
                                return (
                                    <table className={classes.actionTable}>
                                        <tr>
                                            <td>
                                                <Download 
                                                    docId={docId} 
                                                    apiId={this.apiId} 
                                                    docName={docName} 
                                                    apiType={api.apiType} 
                                                />
                                            </td>
                                            <td>
                                                <Edit
                                                    apiType={api.apiType}
                                                    docName={docName}
                                                    docId={docId}
                                                    apiId={this.apiId}
                                                    getDocumentsList={this.getDocumentsList}
                                                    api
                                                />
                                            </td>
                                            <td>
                                                <Delete
                                                    docName={docName}
                                                    docId={docId}
                                                    apiId={this.apiId}
                                                    getDocumentsList={this.getDocumentsList}
                                                    apiType={api.apiType}
                                                    api
                                                />
                                            </td>
                                        </tr>
                                    </table>
                                );
                            } else {
                                return <span />;
                            }
                        }
                        return null;
                    },
                    filter: false,
                    sort: false,
                },
            },
        ];
        if(!docs){
            return (<Progress />);
        }
        return (
            (<Root>
                {docsToDelete && (
                    <DeleteMultiple getDocumentsList={this.getDocumentsList} docsToDelete={docsToDelete} docs={docs} />
                )}
                <div className={classes.titleWrapper}>
                    <Typography
                        id='itest-api-details-documents-head'
                        variant='h4'
                        component='h2'
                        className={classes.mainTitle}
                    >
                        <FormattedMessage
                            id='Apis.Details.Documents.Listing.documents.listing.title'
                            defaultMessage='Documents'
                        />
                    </Typography>
                    {((docs && docs.length > 0) || (api.type === 'HTTP')) && (
                        <Button
                            size='small'
                            data-testid='add-document-btn'
                            className={classes.button}
                            component={Link}
                            to={!this.isAccessRestricted() && !api.isRevision && url}
                            disabled={this.isAccessRestricted() || api.isRevision}
                        >
                            <AddCircle className={classes.buttonIcon} />
                            <FormattedMessage
                                id='Apis.Details.Documents.Listing.add.new.document.button'
                                defaultMessage='Add New Document'
                            />
                        </Button>
                    )}
                </div>
                <div>
                    {showAddDocs && (
                        <Create
                            toggleAddDocs={this.toggleAddDocs}
                            getDocumentsList={this.getDocumentsList}
                            apiType={api.apiType}
                        />
                    )}

                    {api.type === 'HTTP' && (
                        <>
                            <Paper className={classes.documentsPaper}>
                                <Typography className={classes.subHeading} variant='h6' component='h4'>
                                    <FormattedMessage
                                        id='Apis.Details.Documents.Listing.documents.generated.title'
                                        defaultMessage='Generated Document'
                                    />
                                </Typography>
                                <div>
                                    <ViewDocument
                                        cla
                                        docName={api.name+'_doc'}
                                        apiType={api.apiType}
                                        apiId={this.apiId}
                                        api
                                        className={classes.genDocumentButton}
                                    />
                                </div>
                            </Paper>
                        </>
                    )}

                    {api.type === 'HTTP' && docs && docs.length > 0 && (
                        <>
                            <Paper className={classes.documentsPaper}>
                                <Typography className={classes.subHeading} variant='h6' component='h4'>
                                    <FormattedMessage
                                        id='Apis.Details.Documents.Listing.documents.uploaded.title'
                                        defaultMessage='Uploaded Documents'
                                    />
                                </Typography>
                                <MUIDataTable title='' data={docs} columns={columns} options={options} />
                            </Paper>
                        </>
                    )}
                    
                    {docs && docs.length > 0 && api.type !== 'HTTP' && (
                        <MUIDataTable title='' data={docs} columns={columns} options={options} />
                    )}
                    
                    {docs && docs.length < 1 && api.type !== 'HTTP' && (
                        <InlineMessage type='info' height={140}>
                            <div className={classes.contentWrapper}>
                                <Typography variant='h5' component='h3' className={classes.head}>
                                    <FormattedMessage
                                        id='Apis.Details.Documents.Listing.add.new.msg.title'
                                        defaultMessage='Create Documents'
                                    />
                                </Typography>
                                {(() => {
                                    return (
                                        <Typography component='p' className={classes.content}>
                                            <FormattedMessage
                                                id='Apis.Details.Documents.Listing.APIProduct.add.new.msg.content'
                                                defaultMessage={
                                                    'You can add various types of documents to provide clarity, ' +
                                                    'improve discoverability, and enhance the overall developer ' +
                                                    'experience.'
                                                }
                                            />
                                        </Typography>
                                    );
                                })()}

                                <div className={classes.actions}>
                                    <Button
                                        id='add-new-document-btn'
                                        data-testid='add-document-btn'
                                        variant='contained'
                                        color='primary'
                                        component={Link}
                                        to={!this.isAccessRestricted() && !api.isRevision && url}
                                        className={classes.button}
                                        disabled={this.isAccessRestricted() || api.isRevision}
                                    >
                                        <FormattedMessage
                                            id='Apis.Details.Documents.Listing.add.new.msg.button'
                                            defaultMessage='Add New Document'
                                        />
                                    </Button>
                                </div>
                            </div>
                        </InlineMessage>
                    )}
                    
                </div>
            </Root>)
        );
    }
}

Listing.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    intl: PropTypes.shape({}).isRequired,
    api: PropTypes.shape({
        id: PropTypes.string,
        apiType: PropTypes.oneOf([API.CONSTS.API, API.CONSTS.APIProduct, MCPServer.CONSTS.MCP]),
    }).isRequired,
};

export default injectIntl(withAPI((Listing)));
