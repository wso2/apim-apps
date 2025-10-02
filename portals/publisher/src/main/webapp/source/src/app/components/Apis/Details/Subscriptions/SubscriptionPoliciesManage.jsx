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

import React, { Component } from 'react';
import { styled } from '@mui/material/styles';
import { FormattedMessage, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Paper from '@mui/material/Paper';
import API from 'AppData/api';
import MCPServer from 'AppData/MCPServer';
import { isRestricted } from 'AppData/AuthManager';
import Configurations from 'Config';
import CONSTS from 'AppData/Constants';
import Tooltip from '@mui/material/Tooltip';
import InfoIcon from '@mui/icons-material/Info';


const PREFIX = 'SubscriptionPoliciesManage';

const classes = {
    subscriptionPoliciesPaper: `${PREFIX}-subscriptionPoliciesPaper`,
    grid: `${PREFIX}-grid`,
    gridLabel: `${PREFIX}-gridLabel`,
    mainTitle: `${PREFIX}-mainTitle`
};


const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.subscriptionPoliciesPaper}`]: {
        marginTop: theme.spacing(2),
        padding: theme.spacing(2),
    },

    [`& .${classes.grid}`]: {
        margin: theme.spacing(1.25),
    },

    [`& .${classes.gridLabel}`]: {
        marginTop: theme.spacing(1.5),
    },

    [`& .${classes.mainTitle}`]: {
        paddingLeft: 0,
    }
}));

/**
 * Manage subscription policies of the API
 * @param {object} props - Props passed to the component
 * @returns {JSX.Element} The SubscriptionPoliciesManage component
 * */
class SubscriptionPoliciesManage extends Component {

    /**
     * constructor
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.state = {
            subscriptionPolicies: {},
            isMutualSslOnly: false,
            isAsyncAPI: false,
            isApiKeyEnabled: false,
        };
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        const { api } = this.props;
        const isAsyncAPI = (api.type === 'WS' || api.type === 'WEBSUB' || api.type === 'SSE' || api.type === 'ASYNC');
        this.setState( {isAsyncAPI});
        const securityScheme = [...api.securityScheme];
        const isMutualSslOnly = securityScheme.length === 2 && securityScheme.includes('mutualssl')
        && securityScheme.includes('mutualssl_mandatory');
        this.setState({ isMutualSslOnly });
        const isApiKeyEnabled = securityScheme.includes('api_key');
        this.setState({ isApiKeyEnabled });
        const limit = Configurations.app.subscriptionPolicyLimit;
        const isAiApi = api?.subtypeConfiguration?.subtype?.toLowerCase().includes('aiapi') ?? false;
        let policyPromise;
        if (isAsyncAPI) {
            policyPromise = API.asyncAPIPolicies();
        } else {
            policyPromise = API.policies('subscription', limit || undefined, isAiApi);
        }
        policyPromise
            .then((res) => {
                this.setState({ subscriptionPolicies: res.body.list });
            })
            .catch((error) => {
                if (process.env.NODE_ENV !== 'production') {
                    console.error(error);
                }
            });
    }

    /**
     * Handle onChange of selected subsription policies
     *
     * @param event onChange event
     */
    handleChange(event) {
        const { name, checked } = event.target;
        const { setPolices, policies, subValidationDisablingAllowed } = this.props;
        const { isMutualSslOnly, isAsyncAPI, isApiKeyEnabled } = this.state;
        let newSelectedPolicies = [...policies];
        if (checked) {
            newSelectedPolicies.push(name);
            if (newSelectedPolicies.length > 1) {
                newSelectedPolicies = newSelectedPolicies.filter((policy) =>
                    !policy.includes(CONSTS.DEFAULT_SUBSCRIPTIONLESS_PLAN));
            }
        } else {
            newSelectedPolicies = policies.filter((policy) => policy !== name);
            if (subValidationDisablingAllowed
                    && !isMutualSslOnly && !isApiKeyEnabled && newSelectedPolicies.length === 0) {
                if (!isAsyncAPI) {
                    newSelectedPolicies.push(CONSTS.DEFAULT_SUBSCRIPTIONLESS_PLAN);
                } else {
                    newSelectedPolicies.push(CONSTS.DEFAULT_ASYNC_SUBSCRIPTIONLESS_PLAN);
                }
            }
        }
        setPolices(newSelectedPolicies);
    }

    /**
     * Get the allowed scopes
     * @returns {string[]} The allowed scopes
     */
    getCreateOrPublishScopes() {
        const { api } = this.props;
        if (api.apiType && api.apiType.toUpperCase() === 'MCP') {
            return ['apim:mcp_server_create', 'apim:mcp_server_publish'];
        } else {
            return ['apim:api_publish', 'apim:api_create'];
        }
    }

    /**
     * Check if the action is restricted
     * @returns {boolean} True if the action is restricted, false otherwise
     */
    isCreateOrPublishRestricted() {
        const { api } = this.props;
        return isRestricted(this.getCreateOrPublishScopes(), api);
    }

    /**
     * Render the Subscription Policies Manage component
     * @returns {React.Component} React Component
     */
    render() {
        const {  api, policies } = this.props;
        const { subscriptionPolicies } = this.state;

        /*
        Following logic is to identify migrated users policies.
        Before 4.0.0 there were no different policy set for async apis
        So the same policies are attached to the API. ex: api.policies = ["Unlimited"]
        But throttling-policies/streaming/subscription does not have this "Unlimited" policy after 4.0
        So logic in UI shows no policy is attached to the API.
        Following logic identifies that special case.
        */
        let migratedCase = false;
        let preMigrationPolicies;
        if (Object.keys(subscriptionPolicies).length !== 0 && api.policies && api.policies.length > 0) {
            preMigrationPolicies = api.policies.filter((apiPolicy) => {
                const samePolicies = subscriptionPolicies.filter((subPolicy) => apiPolicy === subPolicy.displayName);
                return samePolicies.length === 0;
            });
            migratedCase = preMigrationPolicies.length > 0;
        }

        const getPolicyDetails = (policy) => {
            const details = [];

            if (policy.requestCount && policy.requestCount !== 0) details.push(`Request Count: ${policy.requestCount}`);
            if (policy.dataUnit) details.push(`Data Unit: ${policy.dataUnit}`);
            if (policy.timeUnit && policy.unitTime && policy.unitTime !== 0) {
                details.push(`Unit Time: ${policy.unitTime}  ${policy.timeUnit}`);
            }
            if (policy.rateLimitCount && policy.rateLimitCount !== 0) {
                details.push(`Rate Limit Count: ${policy.rateLimitCount}`);
            }
            if (policy.rateLimitTimeUnit) details.push(`Rate Limit Time Unit: ${policy.rateLimitTimeUnit}`);
            if (policy.totalTokenCount && policy.totalTokenCount !== 0) {
                details.push(`Total Token Count: ${policy.totalTokenCount}`);
            }
            if (policy.promptTokenCount && policy.promptTokenCount !== 0) {
                details.push(`Prompt Token Count: ${policy.promptTokenCount}`);
            }
            if (policy.completionTokenCount && policy.completionTokenCount !== 0) {
                details.push(`Completion Token Count: ${policy.completionTokenCount}`);
            }

            return details.length > 0 ? details.join(', ') : 'No additional details';
        };

        return (
            (<Root>
                <Typography id='itest-api-details-bushiness-plans-head' variant='h4' component='h2'>
                    <FormattedMessage
                        id='Apis.Details.Subscriptions.SubscriptionPoliciesManage.business.plans'
                        defaultMessage='Business Plans'
                    />
                </Typography>
                <Typography variant='caption' gutterBottom>
                    <FormattedMessage
                        id='Apis.Details.Subscriptions.SubscriptionPoliciesManage.sub.heading'
                        defaultMessage='Attach business plans to {type}'
                        values={{
                            type: (() => {
                                if (api.apiType === API.CONSTS.APIProduct) {
                                    return 'API Product';
                                }
                                if (api.apiType === MCPServer.CONSTS.MCP) {
                                    return 'MCP Server';
                                }
                                return 'API';
                            })()
                        }}
                    />
                </Typography>
                <Paper className={classes.subscriptionPoliciesPaper}>
                    <FormControl className={classes.formControl}>
                        <FormGroup>
                            { subscriptionPolicies && Object.entries(subscriptionPolicies).map((value) => {
                                if (value[1].displayName.includes(CONSTS.DEFAULT_SUBSCRIPTIONLESS_PLAN)) {
                                    return null; // Skip rendering for "Default"
                                }
                                return (
                                    <FormControlLabel
                                        data-testid={'policy-checkbox-' + value[1].displayName.toLowerCase()}
                                        key={value[1].displayName}
                                        control={(
                                            <Checkbox
                                                disabled={this.isCreateOrPublishRestricted()}
                                                color='primary'
                                                checked={policies.includes(value[1].displayName)}
                                                onChange={(e) => this.handleChange(e)}
                                                name={value[1].displayName}
                                            />
                                        )}
                                        label={
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                {value[1].displayName + ' : ' + value[1].description}
                                                <Tooltip title={getPolicyDetails(value[1])}>
                                                    <InfoIcon
                                                        color='action'
                                                        style={{ marginLeft: 5, fontSize: 20, cursor: 'default' }}
                                                    />
                                                </Tooltip>
                                            </div>
                                        }
                                    />
                                );
                            })}
                            { migratedCase && (
                                <Box display='flex' flexDirection='column'>
                                    <Box className={classes.migrateMessage}>
                                        <Typography variant='caption' gutterBottom>
                                            <FormattedMessage
                                                id='Apis.Details.Subscriptions.SubscriptionPoliciesManage.sub.migrated'
                                                defaultMessage={`Following policies are migrated from an 
                                            old version of APIM. You can uncheck and select a different policy. 
                                            Note that this is an irreversible operation.`}
                                            />
                                        </Typography>
                                    </Box>
                                    {preMigrationPolicies.map((policy) => (
                                        <FormControlLabel
                                            data-testid={'policy-checkbox-' + policy.toLowerCase()}
                                            key={policy}
                                            control={(
                                                <Checkbox
                                                    disabled={this.isCreateOrPublishRestricted()}
                                                    color='primary'
                                                    checked={policies.includes(policy)}
                                                    onChange={(e) => this.handleChange(e)}
                                                    name={policy}
                                                />
                                            )}
                                            label={policy}
                                        />
                                    ))}
                                </Box>
                            )}
                        </FormGroup>
                    </FormControl>
                </Paper>
            </Root>)
        );
    }
}

SubscriptionPoliciesManage.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    intl: PropTypes.shape({ formatMessage: PropTypes.func }).isRequired,
    api: PropTypes.shape({ policies: PropTypes.arrayOf(PropTypes.shape({})) }).isRequired,
    setPolices: PropTypes.func.isRequired,
    policies: PropTypes.shape({}).isRequired,
};

export default injectIntl((SubscriptionPoliciesManage));
