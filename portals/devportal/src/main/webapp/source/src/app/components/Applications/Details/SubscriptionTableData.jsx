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
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Slide from '@mui/material/Slide';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { FormattedMessage } from 'react-intl';
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
class SubscriptionTableData extends React.Component {
    /**
     *Creates an instance of SubscriptionTableData.
     * @param {*} props properties
     * @memberof SubscriptionTableData
     */
    constructor(props) {
        super(props);
        this.state = {
            openMenu: false,
            openMenuEdit: false,
            isMonetizedAPI: false,
            isDynamicUsagePolicy: false,
            tiers: [],
            selectedTier: '',
        };
        this.handleRequestClose = this.handleRequestClose.bind(this);
        this.handleRequestOpen = this.handleRequestOpen.bind(this);
        this.handleRequestDelete = this.handleRequestDelete.bind(this);
        this.checkIfDynamicUsagePolicy = this.checkIfDynamicUsagePolicy.bind(this);
        this.checkIfMonetizedAPI = this.checkIfMonetizedAPI.bind(this);
        this.populateSubscriptionTiers = this.populateSubscriptionTiers.bind(this);
        this.handleSubscriptionTierUpdate = this.handleSubscriptionTierUpdate.bind(this);
        this.handleRequestCloseEditMenu = this.handleRequestCloseEditMenu.bind(this);
        this.handleRequestOpenEditMenu = this.handleRequestOpenEditMenu.bind(this);
        this.setSelectedTier = this.setSelectedTier.bind(this);
    }

    componentDidMount() {
        this.checkIfMonetizedAPI(this.props.subscription.apiId);
        this.checkIfDynamicUsagePolicy(this.props.subscription.subscriptionId);
        this.populateSubscriptionTiers(this.props.subscription.apiId);
    }

    /**
    *
    *
    * @memberof SubscriptionTableData
    */
    setSelectedTier(e) {
        this.setState({ selectedTier: e });
    }

    /**
     *
     * Handle onclick for subscription delete
     * @param {*} subscriptionId subscription id
     * @memberof SubscriptionTableData
     */
    handleRequestDelete(subscriptionId) {
        const { handleSubscriptionDelete } = this.props;
        this.setState({ openMenu: false });
        if (handleSubscriptionDelete) {
            handleSubscriptionDelete(subscriptionId);
        }
    }

    /**
     *
     *
     * @memberof SubscriptionTableData
     */
    handleRequestCloseEditMenu() {
        this.setState({ openMenuEdit: false });
    }

    /**
    *
    *
    * @memberof SubscriptionTableData
    */
    handleRequestOpenEditMenu() {
        this.setState({ openMenuEdit: true });
    }

    /**
    * @memberof SubscriptionTableData
    */
    handleRequestOpen() {
        this.setState({ openMenu: true });
    }

    /**
     * @memberof SubscriptionTableData
     */
    handleRequestClose() {
        this.setState({ openMenu: false });
    }

    /**
     *
     * Handle onclick for subscription update
     * @param {*} apiId subscription id
     * @param {*} subscriptionId subscription id
     * @param {*} throttlingPolicy throttling tier
     * @param {*} status subscription status
     * @memberof SubscriptionTableData
     */
    handleSubscriptionTierUpdate(apiId, subscriptionId, requestedThrottlingPolicy, status, currentThrottlingPolicy) {
        const { handleSubscriptionUpdate } = this.props;
        this.setState({ openMenuEdit: false });
        if (handleSubscriptionUpdate) {
            handleSubscriptionUpdate(apiId, subscriptionId, currentThrottlingPolicy, status, requestedThrottlingPolicy);
        }
    }

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
                apiInfo, status, throttlingPolicy, subscriptionId, apiId, requestedThrottlingPolicy, applicationId,
            },
        } = this.props;
        const {
            openMenu, isMonetizedAPI, isDynamicUsagePolicy, openMenuEdit, selectedTier, tiers,
        } = this.state;
        let link = (
            <Link
                to={tiers.length === 0 ? '' : '/apis/' + apiId}
                style={{ cursor: tiers.length === 0 ? 'default' : '' }}
                external
            >
                {apiInfo.name + ' - ' + apiInfo.version + ' '}
                <MDIcon path={mdiOpenInNew} size='12px' />
            </Link>
        );
        if (apiInfo.type === 'WEBSUB') {
            link = (
                <Link
                    to={tiers.length === 0 ? '' : '/applications/' + applicationId + '/webhooks/' + apiId}
                    style={{ cursor: tiers.length === 0 ? 'default' : '' }}
                >
                    {apiInfo.name + ' - ' + apiInfo.version}
                </Link>
            );
        }
        return (
            <TableRow hover>
                <TableCell>
                    { link }
                </TableCell>
                <TableCell>{apiInfo.lifeCycleStatus}</TableCell>
                <TableCell>{throttlingPolicy}</TableCell>
                <TableCell>{status}</TableCell>
                <TableCell>
                    <Button
                        id={'edit-api-subscription-' + apiId}
                        color='grey'
                        onClick={this.handleRequestOpenEditMenu}
                        startIcon={<Icon>edit</Icon>}
                        disabled={tiers.length === 0}
                    >
                        <FormattedMessage
                            id='Applications.Details.SubscriptionTableData.edit.text'
                            defaultMessage='Edit'
                        />
                    </Button>
                    <Dialog open={openMenuEdit} transition={Slide}>
                        <DialogTitle>
                            <FormattedMessage
                                id='Applications.Details.SubscriptionTableData.update.subscription'
                                defaultMessage='Update Subscription'
                            />
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                <FormattedMessage
                                    id='Applications.Details.SubscriptionTableData.update.business.plan'
                                    defaultMessage='Current Business Plan : '
                                />
                                {throttlingPolicy}
                                <div>
                                    { (status === 'BLOCKED')
                                        ? (
                                            <FormattedMessage
                                                id={'Applications.Details.SubscriptionTableData.update.'
                                                + 'throttling.policy.blocked'}
                                                defaultMessage={'Subscription is in BLOCKED state. '
                                                + 'You need to unblock the subscription in order to edit the tier'}
                                            />
                                        )
                                        : (status === 'ON_HOLD')
                                            ? (
                                                <FormattedMessage
                                                    id={'Applications.Details.SubscriptionTableData.update.'
                                                    + 'throttling.policy.onHold'}
                                                    defaultMessage={'Subscription is currently ON_HOLD state.'
                                                    + ' You need to get approval to the subscription before editing the tier'}
                                                />
                                            )
                                            : (status === 'REJECTED')
                                                ? (
                                                    <FormattedMessage
                                                        id={'Applications.Details.SubscriptionTableData.update.'
                                                        + 'throttling.policy.rejected'}
                                                        defaultMessage={'Subscription is currently REJECTED state.'
                                                        + ' You need to get approval to the subscription before editing the tier'}
                                                    />
                                                )
                                                : (status === 'TIER_UPDATE_PENDING')
                                                    ? (
                                                        <FormattedMessage
                                                            id={'Applications.Details.SubscriptionTableData.update.'
                                                            + 'throttling.policy.tierUpdatePending'}
                                                            defaultMessage={'Subscription is currently TIER_UPDATE_PENDING state.'
                                                            + ' You need to get approval to the existing subscription edit request'
                                                            + ' before editing the tier'}
                                                        />
                                                    )
                                                    : (
                                                        <div>
                                                            <Autocomplete
                                                                id='application-policy'
                                                                disableClearable
                                                                options={tiers}
                                                                getOptionLabel={(option) => option.label ?? option}
                                                                getOptionSelected={(option, value) => option.value === value}
                                                                value={selectedTier}
                                                                onChange={(e, newValue) => this.setSelectedTier(newValue.value)}
                                                                renderInput={(params) => (
                                                                    <TextField
                                                                        id='outlined-select-currency'
                                                                        name='throttlingPolicy'
                                                                        required
                                                                        {...params}
                                                                        label={(
                                                                            <FormattedMessage
                                                                                defaultMessage='Business Plan'
                                                                                id={'Applications.Details.SubscriptionTableData.'
                                                                                + 'update.business.plan.name'}
                                                                            />
                                                                        )}
                                                                        helperText={(
                                                                            <FormattedMessage
                                                                                defaultMessage={'Assign a new Business plan to the '
                                                                                + 'existing subscription'}
                                                                                id={'Applications.Details.SubscriptionTableData.'
                                                                                + 'update.throttling.policy.helper'}
                                                                            />
                                                                        )}
                                                                        margin='normal'
                                                                        variant='outlined'
                                                                    />
                                                                )}
                                                            />
                                                            { (status === 'TIER_UPDATE_PENDING')
                                                        && (
                                                            <div>
                                                                <FormattedMessage
                                                                    id={'Applications.Details.SubscriptionTableData.update.'
                                                                    + 'throttling.policy.tier.update'}
                                                                    defaultMessage='Pending Tier Update : '
                                                                />
                                                                {requestedThrottlingPolicy}
                                                            </div>
                                                        )}
                                                        </div>
                                                    )}
                                </div>
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button dense color='grey' onClick={this.handleRequestCloseEditMenu}>
                                <FormattedMessage
                                    id='Applications.Details.SubscriptionTableData.cancel'
                                    defaultMessage='Cancel'
                                />
                            </Button>
                            <Button
                                variant='contained'
                                disabled={(status === 'BLOCKED' || status === 'ON_HOLD' || status === 'REJECTED'
                                || status === 'TIER_UPDATE_PENDING')}
                                dense
                                color='primary'
                                onClick={() => this.handleSubscriptionTierUpdate(apiId,
                                    subscriptionId, selectedTier, status, throttlingPolicy)}
                            >
                                <FormattedMessage
                                    id='Applications.Details.SubscriptionTableData.update'
                                    defaultMessage='Update'
                                />
                            </Button>
                        </DialogActions>
                    </Dialog>
                    <ScopeValidation
                        resourcePath={resourcePaths.SINGLE_SUBSCRIPTION}
                        resourceMethod={resourceMethods.DELETE}
                    >
                        <Button
                            id={'delete-api-subscription-' + apiId}
                            color='grey'
                            onClick={this.handleRequestOpen}
                            startIcon={<Icon>delete</Icon>}
                            disabled={tiers.length === 0 || status === 'DELETE_PENDING'}
                        >
                            <FormattedMessage
                                id='Applications.Details.SubscriptionTableData.delete.text'
                                defaultMessage='Delete'
                            />
                        </Button>
                    </ScopeValidation>

                    <Dialog open={openMenu} transition={Slide}>
                        <DialogTitle>
                            <FormattedMessage
                                id='Applications.Details.SubscriptionTableData.delete.subscription.confirmation.dialog.title'
                                defaultMessage='Confirm'
                            />
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                <FormattedMessage
                                    id='Applications.Details.SubscriptionTableData.delete.subscription.confirmation'
                                    defaultMessage='Are you sure you want to delete the Subscription?'
                                />
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button dense color='grey' onClick={this.handleRequestClose}>
                                <FormattedMessage
                                    id='Applications.Details.SubscriptionTableData.cancel'
                                    defaultMessage='Cancel'
                                />
                            </Button>
                            <Button
                                id='delete-api-subscription-confirm-btn'
                                dense
                                variant='contained'
                                color='primary'
                                onClick={() => this.handleRequestDelete(subscriptionId)}
                            >
                                <FormattedMessage
                                    id='Applications.Details.SubscriptionTableData.delete'
                                    defaultMessage='Delete'
                                />
                            </Button>
                        </DialogActions>
                    </Dialog>
                    { isMonetizedAPI && (
                        <Invoice
                            tiers={tiers}
                            subscriptionId={subscriptionId}
                            isDynamicUsagePolicy={isDynamicUsagePolicy}
                        />
                    ) }
                </TableCell>
            </TableRow>
        );
    }
}
SubscriptionTableData.propTypes = {
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
    handleSubscriptionDelete: PropTypes.func.isRequired,
    handleSubscriptionUpdate: PropTypes.func.isRequired,
};
export default SubscriptionTableData;
