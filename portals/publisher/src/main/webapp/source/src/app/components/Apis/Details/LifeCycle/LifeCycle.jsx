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

import React, { Component } from 'react';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import PropTypes from 'prop-types';
import Api from 'AppData/api';
import MCPServer from 'AppData/MCPServer';
import { Progress } from 'AppComponents/Shared';
import { FormattedMessage, injectIntl } from 'react-intl';
import { isRestricted } from 'AppData/AuthManager';
import ApiContext from 'AppComponents/Apis/Details/components/ApiContext';
import Alert from 'AppComponents/Shared/Alert';
import APIProduct from 'AppData/APIProduct';
import { getTypeToDisplay } from 'AppComponents/Shared/Utils';
import LifeCycleUpdate from './LifeCycleUpdate';
import LifeCycleHistory from './LifeCycleHistory';
import { API_SECURITY_KEY_TYPE_PRODUCTION, API_SECURITY_KEY_TYPE_SANDBOX }
    from '../Configuration/components/APISecurity/components/apiSecurityConstants';

const PREFIX = 'LifeCycle';

const classes = {
    root: `${PREFIX}-root`,
    titleWrapper: `${PREFIX}-titleWrapper`,
    historyHead: `${PREFIX}-historyHead`
};


const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.root}`]: {
        flexGrow: 1,
        marginTop: 10,
        maxWidth: theme.custom.contentAreaWidth,
    },

    [`& .${classes.titleWrapper}`]: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },

    [`& .${classes.historyHead}`]: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
    }
}));

/**
 *
 *
 * @class LifeCycle
 * @extends {Component}
 */
class LifeCycle extends Component {
    /**
     * Creates an instance of LifeCycle.
     * @param {Object} props
     * @memberof LifeCycle
     */
    constructor(props) {
        super(props);
        this.api = new Api();
        this.state = {
            lcHistory: null,
            checkList: [],
            certList: [],
        };
        this.updateData = this.updateData.bind(this);
        this.handleChangeCheckList = this.handleChangeCheckList.bind(this);
    }

    /**
     *
     * @inheritdoc
     * @memberof LifeCycle
     */
    componentDidMount() {
        this.loadCertsAndData();
    }

    // Remounting components on the API id changes
    componentDidUpdate(prevProps) {
        if (prevProps.api.id !== this.props.api.id) {
            this.loadCertsAndData();
        }
    }

    // Common function to retrive api components used by both componentDidMount & componentDidUpdate
    loadCertsAndData() {
        const { api: { id, type } } = this.props;

        if (type !== MCPServer.CONSTS.MCP) {
            // certList is only used to check whether there are any certs, at LifeCycleUpdate.jsx.
            // Hence combining both prod and sand lists here.
            const promisedProductionClientCerts =
                Api.getAllClientCertificatesOfGivenKeyType(API_SECURITY_KEY_TYPE_PRODUCTION, id);
            const promisedSandboxClientCerts =
                Api.getAllClientCertificatesOfGivenKeyType(API_SECURITY_KEY_TYPE_SANDBOX, id);
            const { intl } = this.props;

            Promise.all([promisedProductionClientCerts, promisedSandboxClientCerts])
                .then(([resultProduction, resultSandbox]) => {
                    const productionClientCerts = resultProduction.body;
                    const sandboxClientCerts = resultSandbox.body;
                    this.setState({
                        certList: [...productionClientCerts.certificates, ...sandboxClientCerts.certificates],
                    });
                    this.updateData();
                }).catch((error) => {
                    if (process.env.NODE_ENV !== 'production') {
                        Alert.error(intl.formatMessage({
                            id: 'Apis.Details.LifeCycle.LifeCycleUpdate.error.certs',
                            defaultMessage: 'Error while retrieving certificates',
                        }));
                        console.error(error);
                    }
                });
        } else {
            this.updateData();
        }
    }

    handleChangeCheckList = (index) => (event, checked) => {
        const { checkList } = this.state;
        checkList[index].checked = checked;
        this.setState({ checkList });
    };

    /**
     * Get the allowed scopes for publishing
     * @returns {string[]} The allowed scopes
     */
    getPublishScopes() {
        const { api } = this.props;
        if (api.apiType && api.apiType.toUpperCase() === 'MCP') {
            return ['apim:mcp_server_publish', 'apim:mcp_server_manage', 'apim:mcp_server_import_export'];
        } else {
            return ['apim:api_publish'];
        }
    }

    /**
     * Check if the action is restricted
     * @returns {boolean} True if the action is restricted, false otherwise
     */
    isPublishRestricted() {
        const apiFromContext = this.context.api;
        return isRestricted(this.getPublishScopes(), apiFromContext);
    }

    /**
     *
     *
     * @memberof LifeCycle
     */
    updateData() {
        const { api: { id }, isAPIProduct, isMCPServer } = this.props;
        const apiProduct = new APIProduct();
        let promisedAPI;
        let promisedLcState;
        let promisedLcHistory;
        if (isAPIProduct) {
            promisedAPI = apiProduct.getAPIProductByID(id);
            promisedLcState = apiProduct.getLCStateOfAPIProduct(id);
            promisedLcHistory = apiProduct.getLCHistoryOfAPIProduct(id);
        } else if (isMCPServer) {
            promisedAPI = MCPServer.getMCPServerById(id);
            promisedLcState = MCPServer.getMCPServerLcState(id);
            promisedLcHistory = MCPServer.getMCPServerLcHistory(id);
        } else{
            promisedAPI = Api.get(id);
            promisedLcState = this.api.getLcState(id);
            promisedLcHistory = this.api.getLcHistory(id);
        }
        Promise.all([promisedAPI, promisedLcState, promisedLcHistory])
            .then((response) => {
                let api;
                if (isAPIProduct) {
                    api = response[0].body;
                } else {
                    /* eslint prefer-destructuring: ["error", {VariableDeclarator: {object: true}}] */
                    api = response[0];
                }
                const lcState = response[1].body;
                const lcHistory = response[2].body.list;

                // Bug fix for issue #12363
                // Changing internal state PROTOTYPE -> PRE-RELEASED to display in LC History table
                lcHistory.forEach(element => {
                    const temp = element;
                    if (element.previousState === 'PROTOTYPED') {
                        temp.previousState = 'PRE-RELEASED';
                    }
                    if (element.postState === 'PROTOTYPED') {
                        temp.postState = 'PRE-RELEASED';
                    }
                });

                // Creating checklist
                const checkList = [];
                let index = 0;
                for (const item of lcState.checkItems) {
                    checkList.push({
                        index,
                        label: item.name,
                        value: item.name,
                        checked: false,
                    });
                    index++;
                }
                this.setState({
                    api,
                    lcState,
                    lcHistory,
                    checkList,
                });
            })
            .catch((error) => {
                if (process.env.NODE_ENV !== 'production') {
                    console.error(error);
                }
            });
    }

    /**
     * Render the LifeCycle component
     * @returns {JSX.Element} The rendered LifeCycle component.
     * @memberof LifeCycle
     */
    render() {
        const { isAPIProduct, isMCPServer } = this.props;
        const {
            api, lcState, checkList, lcHistory, certList,
        } = this.state;
        const apiFromContext = this.context.api;
        if (apiFromContext && this.isPublishRestricted()) {
            return (
                <Grid container direction='row' alignItems='center' spacing={4} style={{ marginTop: 20 }}>
                    <Grid item>
                        <Typography variant='body2' color='primary'>
                            <FormattedMessage
                                id='Apis.Details.LifeCycle.LifeCycle.change.not.allowed'
                                defaultMessage={
                                    '* You are not authorized to change the life cycle state of the {type}'
                                    + ' due to insufficient permissions'
                                }
                                values={{
                                    type: getTypeToDisplay(api.apiType)
                                }}
                            />
                        </Typography>
                    </Grid>
                </Grid>
            );
        }
        if (!lcState) {
            return <Progress />;
        }
        return (
            (<Root>
                <Typography id='itest-api-details-lifecycle-head' variant='h4' component='h2' gutterBottom>
                    <FormattedMessage
                        id='Apis.Details.LifeCycle.LifeCycle.lifecycle'
                        defaultMessage='Lifecycle'
                    />
                </Typography>
                <div className={classes.contentWrapper}>
                    <Grid container>
                        <Grid item xs={12}>
                            <LifeCycleUpdate
                                handleUpdate={this.updateData}
                                lcState={lcState}
                                checkList={checkList}
                                handleChangeCheckList={this.handleChangeCheckList}
                                api={api}
                                certList={certList}
                                isAPIProduct={isAPIProduct}
                                isMCPServer={isMCPServer}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            {lcHistory.length > 1 && (
                                <div>
                                    <Typography
                                        variant='h6'
                                        component='h3'
                                        gutterBottom
                                        className={classes.historyHead}
                                    >
                                        <FormattedMessage
                                            id='Apis.Details.LifeCycle.LifeCycle.history'
                                            defaultMessage='History'
                                        />
                                    </Typography>
                                    <LifeCycleHistory lcHistory={lcHistory} />
                                </div>
                            )}
                        </Grid>
                    </Grid>
                </div>
            </Root>)
        );
    }
}

LifeCycle.defaultProps = {
    isAPIProduct: false,
    isMCPServer: false,
};

LifeCycle.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    api: PropTypes.shape({}).isRequired,
    isAPIProduct: PropTypes.bool,
    isMCPServer: PropTypes.bool,
};

LifeCycle.contextType = ApiContext;

export default injectIntl(LifeCycle);
