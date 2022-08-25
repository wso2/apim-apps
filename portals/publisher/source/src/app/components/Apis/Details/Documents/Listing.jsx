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

import React, { useState, Suspense, lazy } from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import VisibilityIcon from '@material-ui/icons/Visibility';
import DescriptionIcon from '@material-ui/icons/Description';
import MUIDataTable from 'mui-datatables';
import API from 'AppData/api.js';
import APIProduct from 'AppData/APIProduct';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import AddCircle from '@material-ui/icons/AddCircle';
import Icon from '@material-ui/core/Icon';
import Alert from 'AppComponents/Shared/Alert';
import Progress from 'AppComponents/Shared/Progress';
import { withAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import InlineMessage from 'AppComponents/Shared/InlineMessage';
import { isRestricted } from 'AppData/AuthManager';
import Create from './Create';
import MarkdownEditor from './MarkdownEditor';
import Edit from './Edit';
import Delete from './Delete';
import DeleteMultiple from './DeleteMultiple';
import Download from './Download';
import ViewDocument from './ViewDocument';

const TextEditor = lazy(() => import('./TextEditor' /* webpackChunkName: "ListingTextEditor" */));

const styles = theme => ({
    root: {
        flexGrow: 1,
        marginTop: 10,
    },
    contentWrapper: {
        maxWidth: theme.custom.contentAreaWidth,
    },
    addNewWrapper: {
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.getContrastText(theme.palette.background.paper),
        border: 'solid 1px ' + theme.palette.grey['300'],
        borderRadius: theme.shape.borderRadius,
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
    addNewHeader: {
        padding: theme.spacing(2),
        backgroundColor: theme.palette.grey['300'],
        fontSize: theme.typography.h6.fontSize,
        color: theme.typography.h6.color,
        fontWeight: theme.typography.h6.fontWeight,
    },
    addNewOther: {
        padding: theme.spacing(2),
    },
    titleWrapper: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing(2),
    },
    mainTitle: {
        paddingRight: 10,
    },
    actionTable: {
        '& td': {
            width: 50,
        },
        '& td:first-child': {
            width: 130,
        },
    },
    messageBox: {
        marginTop: 20,
    },
    actions: {
        padding: '20px 0',
        '& button': {
            marginLeft: 0,
        },
    },
    head: {
        fontWeight: 200,
        marginBottom: 20,
    },
    buttonIcon: {
        marginRight: theme.spacing(1),
    },
});
 

function LinkGenerator(props) {
    return props.apiType === 'APIProduct' ? (
        <Link to={'/api-products/' + props.apiId + '/documents/' + props.docId + '/details'}>{props.docName}</Link>
    ) : (
        <Link to={'/apis/' + props.apiId + '/documents/' + props.docId + '/details'}>{props.docName}</Link>
    );
}
class Listing extends React.Component {
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
        this.navigateToSwaggerDoc = this.navigateToSwaggerDoc.bind(this);
    }

    /**
     * @inheritDoc
     * @memberof Listing
     */
    componentDidMount() {
        this.getDocumentsList();
    }


    navigateToSwaggerDoc() {
        this.props.history.push('/apis/' + this.props.api.id + '/documents/swaggerdoc');
    }

    // navigateToSwaggerDoc = () => {
    //     navigate('/apis/' + props.apiId + '/documents/swaggerdoc');
    // }

    // const [selected, setSelected] = useState(false);

    /*
     Get the document list attached to current API and set it to the state
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
        } else {
            const newApi = new API();
            const docs = newApi.getDocuments(api.id);
            docs.then((response) => {
                const documentList = response.body.list.filter((item) => item.otherTypeName !== '_overview');
                documentList.sort(getSortOrder('name'));
                console.log(documentList);
                console.log(this.props.api);
                if(this.props.api.type=='HTTP' || this.props.api.type=='HTTPS'){
                    let generatedDocument = { 
                        // 'documentId': "17928123-e3ca-4d21-943f-a88cfe1f91ca",
                        'name': this.props.api.name + '_SwaggerDoc',
                        'sourceType': "GENERATED",
                        'type' : "HOWTO",
                        'visibility' : "API_LEVEL",
                    };
                    documentList.unshift(generatedDocument);
                }
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
    toggleAddDocs() {
        this.setState((oldState) => {
            return { showAddDocs: !oldState.showAddDocs };
        });
    }


    render() {
        // const useHistory = useHistory();
        const { classes, api, isAPIProduct } = this.props;
        const { docs, showAddDocs, docsToDelete } = this.state;
        const urlPrefix = isAPIProduct ? 'api-products' : 'apis';
        const url = `/${urlPrefix}/${api.id}/documents/create`;
        const showActionsColumn = isRestricted(['apim:api_publish', 'apim:api_create'], api) ? 'excluded' : true;
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
                            const sourceUrl = tableMeta.rowData[4];
                            if (sourceType === 'MARKDOWN') {
                                return (
                                    <table className={classes.actionTable}>
                                        <tr>
                                            <td>
                                                <MarkdownEditor docName={docName} docId={docId} apiId={this.apiId} />
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
                                                <Download docId={docId} apiId={this.apiId} docName={docName} />
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
                            } else if (sourceType === 'GENERATED') {
                                return (
                                    <table className={classes.actionTable}>
                                        <tr>
                                            <td>
                                                <ViewDocument
                                                    cla
                                                    docName={docName}
                                                    apiType={api.apiType}
                                                    apiId={this.apiId}
                                                    api
                                                />
                                            </td>
                                            {/* <td>
                                                <Button 
                                                    onClick={this.navigateToSwaggerDoc}
                                                    aria-label={'View ' + docName}>
                                                    <DescriptionIcon/>
                                                    <FormattedMessage
                                                        id='Apis.Details.Documents.view.swagger.documentation.btn'
                                                        defaultMessage='View'
                                                    />
                                                </Button>
                                            </td>
                                            <td>
                                                <Button aria-label={'Hide ' + docName}>
                                                    <VisibilityIcon/>
                                                    <FormattedMessage
                                                        id='Apis.Details.Documents.hide.swagger.documentation.btn'
                                                        defaultMessage='Hide'
                                                    />
                                                </Button>
                                            </td> */}
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
            <React.Fragment>

                {docsToDelete && (
                    <DeleteMultiple getDocumentsList={this.getDocumentsList} docsToDelete={docsToDelete} docs={docs} />
                )}
                <div className={classes.titleWrapper}>
                    <Typography id='itest-api-details-documents-head' variant='h4' component='h2' className={classes.mainTitle}>
                        <FormattedMessage
                            id='Apis.Details.Documents.Listing.documents.listing.title'
                            defaultMessage='Documents'
                        />
                    </Typography>
                    {docs && docs.length > 0 && (
                        <Button
                            size='small'
                            data-testid='add-document-btn'
                            className={classes.button}
                            component={Link}
                            to={!isRestricted(['apim:api_create', 'apim:api_publish'], api) && !api.isRevision && url}
                            disabled={isRestricted(['apim:api_create', 'apim:api_publish'], api) || api.isRevision}
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

                    {docs && docs.length > 0 ? (
                        <MUIDataTable title='' data={docs} columns={columns} options={options} />
                    ) : (
                        <InlineMessage type='info' height={140}>
                            <div className={classes.contentWrapper}>
                                <Typography variant='h5' component='h3' className={classes.head}>
                                    <FormattedMessage
                                        id='Apis.Details.Documents.Listing.add.new.msg.title'
                                        defaultMessage='Create Documents'
                                    />
                                </Typography>
                                {api.apiType === API.CONSTS.APIProduct
                                    ? 
                                <Typography component='p' className={classes.content}>
                                    <FormattedMessage
                                        id='Apis.Details.Documents.Listing.APIProduct.add.new.msg.content'
                                        defaultMessage={
                                            'You can add different types of documents to an API.' +
                                            ' Proper documentation helps API publishers to market their ' +
                                            ' APIs better and sustain competition. '
                                        }
                                    />
                                </Typography>
                                    : 
                                <Typography component='p' className={classes.content}>
                                    <FormattedMessage
                                        id='Apis.Details.Documents.Listing.add.new.msg.content'
                                        defaultMessage={
                                            'You can add different types of documents to an API.' +
                                            ' Proper documentation helps API publishers to market their ' +
                                            ' APIs better and sustain competition. '
                                        }
                                    />
                                </Typography>
                                }
                                <div className={classes.actions}>
                                    <Button
                                        id='add-new-document-btn'
                                        data-testid='add-document-btn'
                                        variant='contained'
                                        color='primary'
                                        component={Link}
                                        to={!isRestricted(['apim:api_create', 'apim:api_publish'], api) && !api.isRevision && url}
                                        className={classes.button}
                                        disabled={isRestricted(['apim:api_create', 'apim:api_publish'], api) || api.isRevision}
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
            </React.Fragment>
        );
    }
}

Listing.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    intl: PropTypes.shape({}).isRequired,
    api: PropTypes.shape({
        id: PropTypes.string,
        apiType: PropTypes.oneOf([API.CONSTS.API, API.CONSTS.APIProduct]),
    }).isRequired,
};

export default withRouter(injectIntl(withAPI(withStyles(styles)(Listing))));
