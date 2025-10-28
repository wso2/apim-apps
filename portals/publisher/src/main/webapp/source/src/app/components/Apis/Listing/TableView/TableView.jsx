/*
 * Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { createTheme, ThemeProvider, StyledEngineProvider, adaptV4Theme, styled, useTheme } from '@mui/material/styles';
import MUIDataTable from 'mui-datatables';
import { FormattedMessage, injectIntl } from 'react-intl';
import queryString from 'query-string';
import API from 'AppData/api';
import APIProduct from 'AppData/APIProduct';
import MCPServer from 'AppData/MCPServer';
import CONSTS from 'AppData/Constants';
import ApiThumb from 'AppComponents/Apis/Listing/components/ImageGenerator/ApiThumb';
import DocThumb from 'AppComponents/Apis/Listing/components/ImageGenerator/DocThumb';
import { Progress } from 'AppComponents/Shared';
import ResourceNotFound from 'AppComponents/Base/Errors/ResourceNotFound';
import APILanding from 'AppComponents/Apis/Listing/Landing';
import TopMenu from 'AppComponents/Apis/Listing/components/TopMenu';
import SampleAPIProduct from 'AppComponents/Apis/Listing/SampleAPI/SampleAPIProduct';
import MCPServerLanding from 'AppComponents/MCPServers/Landing';
import Alert from 'AppComponents/Shared/Alert';
import { getBasePath } from 'AppComponents/Shared/Utils';
import DefThumb from '../components/ImageGenerator/DefThumb';

const PREFIX = 'TableView';

const classes = {
    contentInside: `${PREFIX}-contentInside`,
};


const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.contentInside}`]: {
        padding: theme.spacing(3),
        paddingTop: theme.spacing(2),
        '& > .MuiPaper-root': {
            boxShadow: 'none',
            backgroundColor: 'transparent',
        },
    },
}));

/**
 * Table view for api listing
 *
 * @class ApiTableView
 * @extends {React.Component}
 */
class TableView extends React.Component {
    /**
     * @inheritdoc
     * @param {*} props properties
     * @memberof ApiTableView
     */
    constructor(props) {
        super(props);
        let { defaultApiView } = props.theme.custom;
        this.showToggle = true;
        if (typeof defaultApiView === 'object' && defaultApiView.length > 0) {
            if (defaultApiView.length === 1) { // We will disable toggle buttons
                this.showToggle = false;
            }
            defaultApiView = defaultApiView[defaultApiView.length - 1];
        } else {
            defaultApiView = localStorage.getItem('publisher.listType') || defaultApiView;
        }
        const prevRowsPerPage = parseInt(localStorage.getItem('publisher.rowsPerPage'), 10) || 10;
        this.state = {
            apisAndApiProducts: null,
            notFound: true,
            listType: defaultApiView,
            loading: true,
            totalCount: -1,
            rowsPerPage: prevRowsPerPage,
            page: 0,
        };
        this.setListType = this.setListType.bind(this);
        this.updateData = this.updateData.bind(this);
        this.getDisplayStatus = this.getDisplayStatus.bind(this);
    }

    /**
     * Lifecycle method to get the data when the component mounts.
     */
    componentDidMount() {
        const { rowsPerPage, page } = this.state;
        this.getData(rowsPerPage, page);
        const userRowsPerPage = parseInt(localStorage.getItem('publisher.rowsPerPage'), 10);
        if (userRowsPerPage) {
            this.setState({ rowsPerPage: userRowsPerPage });
        }
    }

    /**
     * Update the data when the component updates.
     * @param {*} prevProps previous properties
     */
    componentDidUpdate(prevProps) {
        const { isAPIProduct, isMCPServer, query } = this.props;
        const { rowsPerPage, page } = this.state;
        if (isAPIProduct !== prevProps.isAPIProduct
            || isMCPServer !== prevProps.isMCPServer || query !== prevProps.query) {
            this.getData(rowsPerPage, page);
        }
    }

    componentWillUnmount() {
        // The foollowing is resetting the styles for the mui-datatables
        const { theme } = this.props;
        const themeAdditions = {
            overrides: {
                MUIDataTable: {
                    tableRoot: {
                        display: 'table',
                        '& tbody': {
                            display: 'table-row-group',
                        },
                        '& thead': {
                            display: 'table-header-group',
                        },
                    },
                },
            },
        };
        Object.assign(theme, themeAdditions);
    }

    getMuiTheme = () => {
        const { listType, totalCount } = this.state;
        const { theme } = this.props;
        let themeAdditions = {};
        let muiTheme = {
            overrides: {
                MUIDataTable: {
                    root: {
                        backgroundColor: 'transparent',
                    },
                    paper: {
                        boxShadow: 'none',
                        backgroundColor: 'transparent',
                    },
                    tableRoot: {
                        '& tbody': {
                            backgroundColor: '#fff',
                        },
                    },
                },
                MUIDataTableBodyCell: {
                    root: {
                        backgroundColor: 'transparent',
                    },
                },
            },
        };
        if (listType === 'grid') {
            themeAdditions = {
                overrides: {
                    MUIDataTable: {
                        tableRoot: {
                            display: 'block',
                            '& tbody': {
                                display: 'flex',
                                flexWrap: 'wrap',
                                backgroundColor: 'transparent',
                            },
                            '& thead': {
                                display: 'none',
                            },
                        },
                    },
                    MuiTableBody: {
                        root: {
                            justifyContent: totalCount > 4 ? 'center' : 'flex-start',
                        },
                    },
                },
            };
        }
        muiTheme = Object.assign(theme, muiTheme, themeAdditions);
        return createTheme(adaptV4Theme(muiTheme));
    };

    // get apisAndApiProducts
    getData = (rowsPerPage, page) => {
        const { intl } = this.props;
        this.setState({ loading: true });
        return this.xhrRequest(rowsPerPage, page).then((data) => {
            const { body } = data;
            const { list, pagination } = body;
            const { total } = pagination;
            this.setState({
                totalCount: total,
                apisAndApiProducts: list,
                notFound: false,
                rowsPerPage,
                page,
            });
        }).catch(() => {
            Alert.error(intl.formatMessage({
                defaultMessage: 'Error While Loading APIs',
                id: 'Apis.Listing.TableView.TableView.error.loading',
            }));
        }).finally(() => {
            this.setState({ loading: false });
        });
    };

    /**
     *
     * Switch the view between grid and list view
     * @param {String} value UUID(ID) of the deleted API
     * @memberof Listing
     */
    setListType = (value) => {
        localStorage.setItem('publisher.listType', value);
        this.setState({ listType: value });
    };

    /**
     * Get the display status for the table
     * @returns {string} 'excluded' or 'true'
     */
    getDisplayStatus = () => {
        const { isAPIProduct, isMCPServer } = this.props;
        if (isAPIProduct || isMCPServer) {
            return 'excluded';
        }
        return 'true';
    }

    changePage = (page) => {
        const { intl } = this.props;
        const { rowsPerPage } = this.state;
        this.setState({ loading: true });
        this.xhrRequest(rowsPerPage, page).then((data) => {
            const { body } = data;
            const { list, pagination } = body;
            this.setState({
                apisAndApiProducts: list,
                notFound: false,
                totalCount: pagination.total,
                page,
            });
        }).catch(() => {
            Alert.error(intl.formatMessage({
                defaultMessage: 'Error While Loading APIs',
                id: 'Apis.Listing.TableView.TableView.error.loading',
            }));
        })
            .finally(() => {
                this.setState({ loading: false });
            });
    };

    xhrRequest = (rowsPerPage, page) => {
        const { isAPIProduct, isMCPServer, query } = this.props;
        if (query) {
            const composeQuery = queryString.parse(query);
            composeQuery.limit = rowsPerPage;
            composeQuery.offset = page * rowsPerPage;
            return API.search(composeQuery);
        }
        if (isAPIProduct) {
            return APIProduct.all({ limit: rowsPerPage, offset: page * rowsPerPage });
        } else if (isMCPServer) {
            return MCPServer.all({ limit: rowsPerPage, offset: page * rowsPerPage });
        } else {
            return API.all({ limit: rowsPerPage, offset: page * rowsPerPage });
        }
    };

    /**
     * Fetch list data without updating the total count (used after deletion)
     * @param {number} rowsPerPage Number of rows per page
     * @param {number} page Current page number
     * @returns {Promise} Promise that resolves when data is fetched
     * @memberof Listing
     */
    getDataListOnly = (rowsPerPage, page) => {
        const { intl } = this.props;
        this.setState({ loading: true });
        return this.xhrRequest(rowsPerPage, page).then((data) => {
            const { body } = data;
            const { list } = body;
            this.setState({
                apisAndApiProducts: list,
                notFound: false,
                rowsPerPage,
                page,
            });
        }).catch(() => {
            Alert.error(intl.formatMessage({
                defaultMessage: 'Error While Loading APIs',
                id: 'Apis.Listing.TableView.TableView.error.loading',
            }));
        }).finally(() => {
            this.setState({ loading: false });
        });
    };

    /**
     *
     * Update APIs list if an API get deleted in card or table view
     * @param {String} apiUUID UUID(ID) of the deleted API
     * @memberof Listing
     */
    updateData() {
        const { rowsPerPage, page, totalCount } = this.state;
        // Immediately decrement the total count for instant UI feedback
        this.setState({ totalCount: Math.max(0, totalCount - 1) });

        let newPage = page;
        if (totalCount - 1 === rowsPerPage * page && page !== 0) {
            newPage = page - 1;
        }
        // Fetch fresh list data without overwriting the decremented count
        setTimeout(() => {
            this.getDataListOnly(rowsPerPage, newPage);
        }, 1000);
    }

    /**
     *
     *
     * @returns
     * @memberof TableView
     */
    render() {
        const { intl, isAPIProduct, isMCPServer, query } = this.props;
        const {
            loading, totalCount, rowsPerPage, apisAndApiProducts, notFound, listType, page,
        } = this.state;
        const columns = [
            {
                name: 'id',
                options: {
                    display: 'excluded',
                    filter: false,
                },
            },
            {
                name: 'name',
                label: intl.formatMessage({
                    id: 'Apis.Listing.ApiTableView.name',
                    defaultMessage: 'Display Name',
                }),
                options: {
                    customBodyRender: (value, tableMeta, updateValue, tableViewObj = this) => {
                        if (tableMeta.rowData) {
                            const { isAPIProduct, isMCPServer } = tableViewObj.props; // eslint-disable-line no-shadow
                            const artifact = tableViewObj.state.apisAndApiProducts[tableMeta.rowIndex];
                            const apiName = tableMeta.rowData[1];
                            const displayName = artifact?.displayName;
                            const urlPrefix = getBasePath(artifact.apiType);
                            const apiId = tableMeta.rowData[0];
                            if (isAPIProduct) {
                                return (
                                    <Link to={'/api-products/' + apiId + '/overview'}>
                                        <span>{displayName || apiName}</span>
                                    </Link>
                                );
                            } else if (isMCPServer) {
                                return (
                                    <Link to={'/mcp-servers/' + apiId + '/overview'}>
                                        <span>{displayName || apiName}</span>
                                    </Link>
                                );
                            }
                            if (artifact) {
                                if (artifact.type === 'DOC') {
                                    return (
                                        <Link
                                            to={urlPrefix + artifact.apiUUID + '/documents/' + apiId + '/details'}
                                        >
                                            <FormattedMessage
                                                id='Apis.Listing.TableView.TableView.doc.flag'
                                                defaultMessage=' [Doc]'
                                            />
                                            &nbsp;
                                            <span>{displayName || apiName}</span>
                                        </Link>
                                    );
                                } else if (artifact.type === 'DEFINITION') {
                                    const linkTo = `${urlPrefix}${artifact.apiUUID}/api-definition`;
                                    // const linkTo = artifact.associatedType === 'API'
                                    //     ? `/apis/${artifact.apiUUID}/api-definition`
                                    //     : `/api-products/${artifact.apiUUID}/api-definition`;
                                    return (
                                        <Link
                                            to={linkTo}
                                        >
                                            <FormattedMessage
                                                id='Apis.Listing.TableView.TableView.def.flag'
                                                defaultMessage=' [Def]'
                                            />
                                            &nbsp;
                                            <span>{artifact.name}</span>
                                        </Link>
                                    );
                                }
                                return (
                                    <Link to={urlPrefix + apiId + '/overview'}>
                                        <span>{displayName || apiName}</span>
                                    </Link>
                                );
                            }
                        }
                        return <span />;
                    },
                    sort: false,
                    filter: false,
                },
            },
            {
                name: 'version',
                label: intl.formatMessage({
                    id: 'Apis.Listing.ApiTableView.version',
                    defaultMessage: 'Version',
                }),
                options: {
                    sort: false,
                },
            },
            {
                name: 'type',
                label: intl.formatMessage({
                    id: 'Apis.Listing.ApiTableView.type',
                    defaultMessage: 'Type',
                }),
                options: {
                    customBodyRender: (value, tableMeta, updateValue, tableViewObj = this) => {
                        const apiData = tableViewObj.state.apisAndApiProducts?.[tableMeta.rowIndex];
                        if (apiData) {
                            if (apiData.subtype && apiData.subtype === 'AIAPI') {
                                return intl.formatMessage({
                                    id: 'Apis.Listing.TableView.TableView.ai.api',
                                    defaultMessage: 'AI API',
                                });
                            } else if (apiData.type === CONSTS.ARTIFACT_TYPES.MCP) {
                                return intl.formatMessage({
                                    id: 'Apis.Listing.TableView.TableView.mcp.server',
                                    defaultMessage: 'MCP Server',
                                });
                            } else if (apiData.type === CONSTS.ARTIFACT_TYPES.APIProduct) {
                                return intl.formatMessage({
                                    id: 'Apis.Listing.TableView.TableView.api.product',
                                    defaultMessage: 'API Product',
                                });
                            } else if (apiData.type === CONSTS.ARTIFACT_TYPES.DEFINITION) {
                                return intl.formatMessage({
                                    id: 'Apis.Listing.TableView.TableView.definition',
                                    defaultMessage: 'Definition',
                                });
                            } else if (apiData.type === CONSTS.ARTIFACT_TYPES.DOCUMENT) {
                                return intl.formatMessage({
                                    id: 'Apis.Listing.TableView.TableView.document',
                                    defaultMessage: 'Document',
                                });
                            }

                            // Get the type from transportType (search mode) or type (listing mode)
                            const apiType = apiData.transportType || apiData.type;
                            
                            return CONSTS.API_TYPES[apiType?.toUpperCase()] || apiType || '';
                        }
                        return '';
                    },
                    sort: false,
                    filter: false,
                }
            },
            {
                name: 'gatewayType',
                label: intl.formatMessage({
                    id: 'Apis.Listing.ApiTableView.vendor',
                    defaultMessage: 'Gateway Vendor',
                }),
                options: {
                    customBodyRender: (value, tableMeta, updateValue, tableViewObj = this) => {
                        const apiData = tableViewObj.state.apisAndApiProducts?.[tableMeta.rowIndex];
                        if (apiData) {
                            const { gatewayType, gatewayVendor } = apiData;
                            if (gatewayVendor === 'wso2' || gatewayVendor === 'solace') {
                                return gatewayVendor.toUpperCase();
                            } else {
                                return gatewayType;
                            }
                        }
                        return '-';
                    },
                    sort: false,
                    display: this.getDisplayStatus(),
                    filter: false,
                },
            },
            {
                name: 'context',
                label: intl.formatMessage({
                    id: 'Apis.Listing.ApiTableView.context',
                    defaultMessage: 'Context',
                }),
                options: {
                    sort: false,
                },
            },
            {
                name: 'provider',
                label: intl.formatMessage({
                    id: 'Apis.Listing.ApiTableView.provider',
                    defaultMessage: 'Provider',
                }),
                options: {
                    sort: false,
                },
            },
        ];
        const options = {
            filterType: 'dropdown',
            responsive: 'stacked',
            search: false,
            count: totalCount,
            serverSide: true,
            page,
            onChangePage: this.changePage,
            selectableRows: 'none',
            rowsPerPage,
            onChangeRowsPerPage: (newNumberOfRows) => {
                let newPage;
                if (page * newNumberOfRows > totalCount) {
                    newPage = 0;
                } else if (totalCount - 1 === newNumberOfRows * page && page !== 0) {
                    newPage = page - 1;
                }
                localStorage.setItem('publisher.rowsPerPage', newNumberOfRows);
                this.getData(newNumberOfRows, newPage);
            },
            textLabels: {
                pagination: {
                    rowsPerPage: intl.formatMessage({
                        id: 'Apis.Listing.ApiTableView.items.per.page',
                        defaultMessage: 'Items per page',
                    }),
                    displayRows: intl.formatMessage({
                        id: 'Mui.data.table.pagination.display.rows',
                        defaultMessage: 'of',
                    }),
                },
                toolbar: {
                    downloadCsv: intl.formatMessage({
                        id: 'Mui.data.table.pagination.display.tool.download.csv',
                        defaultMessage: 'Download CSV',
                    }),
                    print: intl.formatMessage({
                        id: 'Mui.data.table.pagination.display.tool.print',
                        defaultMessage: 'Print',
                    }),
                    viewColumns: intl.formatMessage({
                        id: 'Mui.data.table.pagination.display.tool.view.columns',
                        defaultMessage: '"View Columns"',
                    }),
                },
            },
        };
        if (listType === 'grid') {
            options.customRowRender = (data, dataIndex, rowIndex, tableViewObj = this) => {
                const { isAPIProduct, isMCPServer } = tableViewObj.props; // eslint-disable-line no-shadow
                const artifact = tableViewObj.state.apisAndApiProducts[dataIndex];
                if (artifact) {
                    if (artifact.type === 'DOC') {
                        return <DocThumb doc={artifact} />;
                    } else if (artifact.type === 'DEFINITION') {
                        return <DefThumb def={artifact} />;
                    } else if (artifact.type === 'APIPRODUCT') {
                        artifact.state = 'PUBLISHED';
                        return <ApiThumb api={artifact} isAPIProduct updateData={this.updateData} />;
                    // } else if (isMCPServer) {
                    //     return <ApiThumb api={artifact} isMCPServer updateData={this.updateData} />;
                    } else {
                        return (
                            <ApiThumb
                                api={artifact}
                                isAPIProduct={isAPIProduct}
                                isMCPServer={isMCPServer}
                                updateData={this.updateData}
                            />
                        );
                    }
                }
                return <span />;
            };
            options.title = false;
            options.filter = false;
            options.print = false;
            options.download = false;
            options.viewColumns = false;
            options.customToolbar = false;
        } else {
            options.customRowRender = null;
            options.title = true;
            options.filter = false;
            options.print = true;
            options.download = true;
            options.viewColumns = true;
        }
        if (page === 0 && totalCount <= rowsPerPage && rowsPerPage === 10) {
            options.pagination = false;
        } else {
            options.pagination = true;
        }
        if (!apisAndApiProducts) {
            if (isAPIProduct) {
                return <Progress per={90} message='Loading API Products ...' />;
            } else if (isMCPServer) {
                return <Progress per={90} message='Loading MCP Servers ...' />;
            }
            return <Progress per={90} message='Loading APIs ...' />;
        }
        if (notFound) {
            return <ResourceNotFound />;
        }
        if (apisAndApiProducts.length === 0 && !query) {
            return (
                <Root>
                    <TopMenu
                        data={apisAndApiProducts}
                        count={totalCount}
                        setListType={this.setListType}
                        isAPIProduct={isAPIProduct}
                        isMCPServer={isMCPServer}
                        listType={listType}
                        showToggle={this.showToggle}
                    />
                    {isAPIProduct && <SampleAPIProduct />}
                    {isMCPServer && <MCPServerLanding />}
                    {!isAPIProduct && !isMCPServer && <APILanding />}
                </Root>
            );
        }

        return <>
            <Root>
                <TopMenu
                    data={apisAndApiProducts}
                    count={totalCount}
                    setListType={this.setListType}
                    isAPIProduct={isAPIProduct}
                    isMCPServer={isMCPServer}
                    listType={listType}
                    showToggle={this.showToggle}
                    query={query}
                />
                <div className={classes.contentInside}>
                    {loading ? (
                        <Progress
                            per={96}
                            message='Updating page ...'
                        />
                    )
                        : (
                            <StyledEngineProvider injectFirst>
                                <ThemeProvider theme={this.getMuiTheme()}>
                                    <MUIDataTable title='' data={apisAndApiProducts} columns={columns}
                                        options={options} />
                                </ThemeProvider>
                            </StyledEngineProvider>
                        )}
                </div>
            </Root>
        </>;
    }
}

TableView.propTypes = {
    intl: PropTypes.shape({ formatMessage: PropTypes.func.isRequired }).isRequired,
    isAPIProduct: PropTypes.bool.isRequired,
    isMCPServer: PropTypes.bool.isRequired,
    theme: PropTypes.shape({
        custom: PropTypes.shape({}),
    }).isRequired,
    query: PropTypes.string,
};

TableView.defaultProps = {
    query: '',
};

export default injectIntl((props) => {
    const theme = useTheme();
    return <TableView {...props} theme={theme} />;
});
