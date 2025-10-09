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
import React from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import MUIDataTable from 'mui-datatables';
import { injectIntl } from 'react-intl';
import API from 'AppData/api';
import MCPServer from 'AppData/MCPServer';
import CONSTANTS from 'AppData/Constants';
import NoApi from 'AppComponents/Apis/Listing/NoApi';
import Loading from 'AppComponents/Base/Loading/Loading';
import Alert from 'AppComponents/Shared/Alert';
import ResourceNotFound from '../../Base/Errors/ResourceNotFound';
import SubscriptionPolicySelect from './SubscriptionPolicySelect';

const PREFIX = 'APICardView';

const classes = {
    root: `${PREFIX}-root`,
    buttonGap: `${PREFIX}-buttonGap`,
};

const Root = styled('div')(() => ({
    [`& .${classes.root}`]: {
        display: 'flex',
    },

    [`& .${classes.buttonGap}`]: {
        marginRight: 10,
    },
}));

/**
 * @class APICardView
 * @param {number} page page number
 * @extends {React.Component}
 */
class APICardView extends React.Component {
    /**
     * @param {JSON} props properties passed from parent
     */
    constructor(props) {
        super(props);
        this.state = {
            data: null,
            loading: true,
        };
        this.page = 0;
        this.count = 100;
        this.rowsPerPage = 10;
        this.pageType = null;
    }

    /**
     * component mount callback
     */
    componentDidMount() {
        this.getData();
    }

    /**
     * @param {JSON} prevProps props from previous component instance
     */
    componentDidUpdate(prevProps) {
        const { subscriptions, searchText } = this.props;
        if (subscriptions.length !== prevProps.subscriptions.length) {
            this.getData();
        } else if (searchText !== prevProps.searchText) {
            this.page = 0;
            this.getData();
        }
    }

    // get data
    getData = () => {
        const { intl, entityType } = this.props;
        const isMCPServersRoute = entityType === 'MCP';
        this.xhrRequest()
            .then((data) => {
                const { body } = data;
                const { list, pagination } = body;
                const { total } = pagination;
                this.count = total;
                this.setState({ data: this.updateUnsubscribedAPIsList(list) });
            })
            .catch((error) => {
                const { response } = error;
                const { setTenantDomain } = this.props;
                if (response && response.body.code === 901300) {
                    setTenantDomain('INVALID');
                    Alert.error(intl.formatMessage({
                        defaultMessage: 'Invalid tenant domain',
                        id: 'Apis.Listing.ApiTableView.invalid.tenant.domain',
                    }));
                } else {
                    Alert.error(intl.formatMessage({
                        defaultMessage: isMCPServersRoute ? 'Error While Loading MCP Servers' : 'Error While Loading APIs',
                        id: isMCPServersRoute ? 'Apis.Listing.MCPServerCardView.error.loading' : 'Apis.Listing.ApiTableView.error.loading',
                    }));
                }
            })
            .finally(() => {
                this.setState({ loading: false });
            });
    };

    /**
    *
    * Get List of the Ids of all APIs that have been already subscribed
    *
    * @returns {*} Ids of respective APIs
    * @memberof APICardView
    */
    getIdsOfSubscribedEntities() {
        const { subscriptions } = this.props;

        // Get arrays of the API Ids and remove all null/empty references by executing 'fliter(Boolean)'
        const subscribedAPIIds = subscriptions.map((sub) => sub.apiId).filter(Boolean);

        return subscribedAPIIds;
    }

    changePage = (page) => {
        const { intl, entityType } = this.props;
        const isMCPServersRoute = entityType === 'MCP';
        this.page = page;
        this.setState({ loading: true });
        this.xhrRequest()
            .then((data) => {
                const { body } = data;
                const { list } = body;
                this.setState({
                    data: this.updateUnsubscribedAPIsList(list),
                });
            })
            .catch(() => {
                Alert.error(intl.formatMessage({
                    defaultMessage: isMCPServersRoute ? 'Error While Loading MCP Servers' : 'Error While Loading APIs',
                    id: isMCPServersRoute ? 'Apis.Listing.MCPServerCardView.error.loading' : 'Apis.Listing.ApiTableView.error.loading',
                }));
            })
            .finally(() => {
                this.setState({ loading: false });
            });
    };

    xhrRequest = () => {
        const { searchText, entityType } = this.props;
        const { page, rowsPerPage } = this;
        // Determine entity type from props, fallback to route-based detection
        const isMCPServersRoute = entityType === 'MCP';
        const api = isMCPServersRoute ? new MCPServer() : new API();

        if (searchText && searchText !== '') {
            if (isMCPServersRoute) {
                return api.getAllMCPServers(
                    { query: `${searchText} status:published`, limit: this.rowsPerPage, offset: page * rowsPerPage },
                );
            }
            // Default case for APIs
            return api.getAllAPIs({ query: `${searchText} status:published`, limit: this.rowsPerPage, offset: page * rowsPerPage });
        } else {
            if (isMCPServersRoute) {
                return api.getAllMCPServers({ query: 'status:published', limit: this.rowsPerPage, offset: page * rowsPerPage });
            }
            // Default case for APIs
            return api.getAllAPIs({ query: 'status:published', limit: this.rowsPerPage, offset: page * rowsPerPage });
        }
    };

    /**
    * Update list of unsubscribed APIs
    * @param {Array} list array of apis
    * @returns {Array} filtered list of apis
    * @memberof APICardView
    */
    updateUnsubscribedAPIsList(list) {
        const subscribedIds = this.getIdsOfSubscribedEntities();
        const listLocal = list.filter((api) => !(api.throttlingPolicies.length === 1
             && api.throttlingPolicies[0].includes(CONSTANTS.DEFAULT_SUBSCRIPTIONLESS_PLAN)));
        for (let i = 0; i < listLocal.length; i++) {
            const policyList = listLocal[i].throttlingPolicies
                .filter((policy) => !policy.includes(CONSTANTS.DEFAULT_SUBSCRIPTIONLESS_PLAN));
            listLocal[i].throttlingPolicies = policyList;
            if (!((!subscribedIds.includes(listLocal[i].id) && !listLocal[i].advertiseInfo.advertised)
                && listLocal[i].isSubscriptionAvailable)) {
                listLocal[i].throttlingPolicies = null;
            }
        }
        return listLocal;
        // return unsubscribedAPIList;
    }

    /**
     * @returns {JSX} render api card view
     * @memberof APICardView
     */
    render() {
        const { apisNotFound } = this.props;
        const { loading, data } = this.state;
        const { page, count, rowsPerPage } = this;

        if (apisNotFound) {
            return <ResourceNotFound />;
        }

        const {
            handleSubscribe, applicationId, intl, entityType,
        } = this.props;
        const isMCPServersRoute = entityType === 'MCP';
        const columns = [
            {
                name: 'id',
                label: intl.formatMessage({
                    id: isMCPServersRoute ? 'Apis.Listing.MCPServerList.id' : 'Apis.Listing.APIList.id',
                    defaultMessage: 'Id',
                }),
                options: {
                    display: 'excluded',
                },
            },
            {
                name: 'isSubscriptionAvailable',
                label: intl.formatMessage({
                    id: isMCPServersRoute
                        ? 'Apis.Listing.MCPServerList.isSubscriptionAvailable'
                        : 'Apis.Listing.APIList.isSubscriptionAvailable',
                    defaultMessage: 'Is Subscription Available',
                }),
                options: {
                    display: 'excluded',
                },
            },
            {
                name: 'name',
                label: intl.formatMessage({
                    id: isMCPServersRoute ? 'Apis.Listing.MCPServerList.name' : 'Apis.Listing.APIList.name',
                    defaultMessage: 'Name',
                }),
            },
            {
                name: 'displayName',
                label: intl.formatMessage({
                    id: isMCPServersRoute ? 'Apis.Listing.MCPServerList.display.name' : 'Apis.Listing.APIList.display.name',
                    defaultMessage: 'Display Name',
                }),
                options: {
                    customBodyRender: (value, tableMeta) => {
                        // Find the index of 'name' column from the table data
                        const fallbackName = tableMeta.rowData?.[2]; // index of 'name' column in rowData
                        return value || fallbackName;
                    },
                },
            },
            {
                name: 'version',
                label: intl.formatMessage({
                    id: isMCPServersRoute ? 'Apis.Listing.MCPServerList.version' : 'Apis.Listing.APIList.version',
                    defaultMessage: 'Version',
                }),
            },
            {
                name: 'throttlingPolicies',
                label: intl.formatMessage({
                    id: isMCPServersRoute
                        ? 'Apis.Listing.MCPServerList.subscription.status'
                        : 'Apis.Listing.APIList.subscription.status',
                    defaultMessage: 'Subscription Status',
                }),
                options: {
                    customBodyRender: (value, tableMeta) => {
                        if (tableMeta.rowData) {
                            const apiId = tableMeta.rowData[0];
                            const isSubscriptionAvailable = tableMeta.rowData[1];
                            const policies = value;
                            if (!isSubscriptionAvailable) {
                                return (intl.formatMessage({
                                    id: isMCPServersRoute
                                        ? 'Apis.Listing.MCPServerCardView.not.allowed'
                                        : 'Apis.Listing.APICardView.not.allowed',
                                    defaultMessage: 'Not Allowed',
                                }));
                            }
                            if (!policies) {
                                return (intl.formatMessage({
                                    id: isMCPServersRoute
                                        ? 'Apis.Listing.MCPServerCardView.already.subscribed'
                                        : 'Apis.Listing.APICardView.already.subscribed',
                                    defaultMessage: 'Subscribed',
                                }));
                            }
                            return (
                                <SubscriptionPolicySelect
                                    key={apiId}
                                    policies={policies}
                                    apiId={apiId}
                                    handleSubscribe={(app, api, policy) => handleSubscribe(app, api, policy)}
                                    applicationId={applicationId}
                                />
                            );
                        }
                        return <span />;
                    },
                },
            },
        ];
        const options = {
            search: false,
            title: false,
            filter: false,
            print: false,
            download: false,
            viewColumns: false,
            customToolbar: false,
            responsive: 'stacked',
            serverSide: true,
            count,
            page,
            onTableChange: (action, tableState) => {
                switch (action) {
                    case 'changePage':
                        this.changePage(tableState.page);
                        break;
                    default:
                        break;
                }
            },
            selectableRows: 'none',
            rowsPerPage,
            onChangeRowsPerPage: (numberOfRows) => {
                const { page: pageInner, count: countInner } = this;
                if (pageInner * numberOfRows > countInner) {
                    this.page = 0;
                }
                this.rowsPerPage = numberOfRows;
                this.getData();
            },
            textLabels: {
                pagination: {
                    rowsPerPage: intl.formatMessage({
                        id: isMCPServersRoute
                            ? 'Apis.Listing.MCPServerCardView.rows.per.page'
                            : 'Apis.Listing.APICardView.rows.per.page',
                        defaultMessage: 'Rows per page',
                    }),
                },
            },
        };
        if (loading) {
            return <Loading />;
        }
        if ((data && data.length === 0) || !data) {
            return <NoApi isMCPServersRoute={isMCPServersRoute} />;
        }
        return (
            <Root id={isMCPServersRoute ? 'subscribe-to-mcp-server-table' : 'subscribe-to-api-table'}>
                <MUIDataTable
                    title=''
                    data={data}
                    columns={columns}
                    options={options}
                />
            </Root>
        );
    }
}

APICardView.propTypes = {
    intl: PropTypes.shape({
        formatMessage: PropTypes.func,
    }).isRequired,
    subscriptions: PropTypes.arrayOf(PropTypes.shape({})),
    searchText: PropTypes.string,
    handleSubscribe: PropTypes.func.isRequired,
    applicationId: PropTypes.string.isRequired,
    apisNotFound: PropTypes.bool,
    setTenantDomain: PropTypes.func,
    entityType: PropTypes.oneOf(['API', 'MCP']),
};

APICardView.defaultProps = {
    subscriptions: [],
    searchText: '',
    apisNotFound: false,
    setTenantDomain: () => {},
    entityType: 'API',
};
export default injectIntl((APICardView));
