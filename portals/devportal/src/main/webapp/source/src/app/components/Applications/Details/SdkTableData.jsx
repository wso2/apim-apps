/* eslint-disable no-nested-ternary */
/*
 * Copyright (c), WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Icon from '@mui/material/Icon';
import Button from '@mui/material/Button';
import { ScopeValidation, resourceMethods, resourcePaths } from 'AppComponents/Shared/ScopeValidation';
import PropTypes from 'prop-types';
import Api from 'AppData/api';
import Subscription from 'AppData/Subscription';
import { mdiOpenInNew } from '@mdi/js';
import { Icon as MDIcon } from '@mdi/react';
import Invoice from './Invoice';

/**
 *
 *
 * @class SubscriptionTableData
 * @extends {React.Component}
 */
class SdkTableData extends React.Component {
    /**
     *Creates an instance of SubscriptionTableData.
     * @param {*} props properties
     * @memberof SubscriptionTableData
     */
    constructor(props) {
        super(props);
        this.state = {
            isMonetizedAPI: false,
            isDynamicUsagePolicy: false,
            tiers: [],
            isLinkVisible: false,
            isLinkHidden: false,
        };
        this.checkIfDynamicUsagePolicy = this.checkIfDynamicUsagePolicy.bind(this);
        this.checkIfMonetizedAPI = this.checkIfMonetizedAPI.bind(this);
        this.populateSubscriptionTiers = this.populateSubscriptionTiers.bind(this);
        this.toggleLinkVisibility = this.toggleLinkVisibility.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    componentDidMount() {
        this.checkIfMonetizedAPI(this.props.subscription.apiId);
        this.checkIfDynamicUsagePolicy(this.props.subscription.subscriptionId);
        this.populateSubscriptionTiers(this.props.subscription.apiId);
    }

    // toggleLinkVisibility() {
    //     this.setState((prevState) => ({
    //         isLinkVisible: !prevState.isLinkVisible,
    //         isLinkHidden: false,
    //     }));
    // }

    toggleLinkVisibility() {
        this.setState({
            isLinkVisible: true,
            isLinkHidden: false,
        });
    }

    handleDelete() {
        this.setState({
            isLinkHidden: true,
        });
    }

    // handleDelete() {
    //     this.setState((prevState) => ({
    //         isLinkHidden: !prevState.isLinkHidden,
    //     }));
    // }

    /**
     * Getting the policies from api details
     *
     */
    populateSubscriptionTiers(apiUUID) {
        const apiClient = new Api();
        const promisedApi = apiClient.getAPIById(apiUUID);
        promisedApi.then((response) => {
            if (response && response.data) {
                const api = JSON.parse(response.data);
                const apiTiers = api.tiers;
                const tiers = [];
                for (let i = 0; i < apiTiers.length; i++) {
                    const { tierName } = apiTiers[i];
                    tiers.push({ value: tierName, label: tierName });
                }
                this.setState({ tiers });
            }
        });
    }

    /**
     * Check if the API is monetized
     * @param apiUUID API UUID
     */
    checkIfMonetizedAPI(apiUUID) {
        const apiClient = new Api();
        const promisedApi = apiClient.getAPIById(apiUUID);
        promisedApi.then((response) => {
            if (response && response.data) {
                const apiData = JSON.parse(response.data);
                this.setState({ isMonetizedAPI: apiData.monetization.enabled });
            }
        });
    }

    /**
     * Check if the policy is dynamic usage type
     * @param subscriptionUUID subscription UUID
     */
    checkIfDynamicUsagePolicy(subscriptionUUID) {
        const client = new Subscription();
        const promisedSubscription = client.getSubscription(subscriptionUUID);
        promisedSubscription.then((response) => {
            if (response && response.body) {
                const subscriptionData = JSON.parse(response.data);
                if (subscriptionData.throttlingPolicy) {
                    const apiClient = new Api();
                    const promisedPolicy = apiClient.getTierByName(subscriptionData.throttlingPolicy, 'subscription');
                    promisedPolicy.then((policyResponse) => {
                        const policyData = JSON.parse(policyResponse.data);
                        if (policyData.monetizationAttributes.billingType
                            && (policyData.monetizationAttributes.billingType
                                === 'DYNAMICRATE')) {
                            this.setState({ isDynamicUsagePolicy: true });
                        }
                    });
                }
            }
        });
    }

    /**
    * @inheritdoc
    * @memberof SubscriptionTableData
    */
    render() {
        const {
            subscription: {
                apiInfo, status, subscriptionId, apiId,
            },
        } = this.props;
        const {
            isMonetizedAPI, isDynamicUsagePolicy, tiers, isLinkVisible, isLinkHidden,
        } = this.state;
        const link = (
            <Link
                to={tiers.length === 0 ? '' : '/apis/' + apiId}
                style={{ cursor: tiers.length === 0 ? 'default' : '' }}
                external
            >
                {apiInfo.name + ' - ' + apiInfo.version + ' '}
                <MDIcon path={mdiOpenInNew} size='12px' />
            </Link>
        );
        return (
            <TableRow hover>
                <TableCell>
                    {link}
                    <Button
                        id={'delete-api-subscription-' + apiId}
                        color='grey'
                        onClick={this.toggleLinkVisibility}
                        startIcon={<Icon>add</Icon>}
                        disabled={tiers.length === 0}
                    />
                </TableCell>
                <TableCell>
                    {isLinkVisible && !isLinkHidden && (
                        <>
                            {link}
                            <ScopeValidation
                                resourcePath={resourcePaths.SINGLE_SUBSCRIPTION}
                                resourceMethod={resourceMethods.DELETE}
                            >
                                <Button
                                    id={'delete-api-subscription-' + apiId}
                                    color='grey'
                                    onClick={this.handleDelete}
                                    startIcon={<Icon>delete</Icon>}
                                    disabled={tiers.length === 0 || status === 'DELETE_PENDING'}
                                />
                            </ScopeValidation>
                        </>
                    )}

                    {isMonetizedAPI && (
                        <Invoice
                            tiers={tiers}
                            subscriptionId={subscriptionId}
                            isDynamicUsagePolicy={isDynamicUsagePolicy}
                        />
                    )}
                </TableCell>
            </TableRow>
        );
    }
}
SdkTableData.propTypes = {
    subscription: PropTypes.shape({
        apiInfo: PropTypes.shape({
            name: PropTypes.string.isRequired,
            version: PropTypes.string.isRequired,
            lifeCycleStatus: PropTypes.string.isRequired,
        }).isRequired,
        throttlingPolicy: PropTypes.string.isRequired,
        subscriptionId: PropTypes.string.isRequired,
        apiId: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
        requestedThrottlingPolicy: PropTypes.string.isRequired,
    }).isRequired,
};
export default SdkTableData;
