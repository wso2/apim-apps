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

import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import { AlertTitle, Box, CircularProgress, Grid, Alert as MUIAlert } from '@mui/material';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import Alert from 'AppComponents/Shared/Alert';
import { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import API from 'AppData/api';
import CONSTS from 'AppData/Constants';
import { FormattedMessage, useIntl } from 'react-intl';
import { useAppContext } from 'AppComponents/Shared/AppContext';
import { isRestricted } from 'AppData/AuthManager';
import SubscriptionsTable from './SubscriptionsTable';
import SubscriptionPoliciesManage from './SubscriptionPoliciesManage';
import SubscriptionAvailability from './SubscriptionAvailability';

const PREFIX = 'Subscriptions';

const classes = {
    buttonSection: `${PREFIX}-buttonSection`,
    emptyBox: `${PREFIX}-emptyBox`
};


const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.buttonSection}`]: {
        marginTop: theme.spacing(2),
    },

    [`& .${classes.emptyBox}`]: {
        marginTop: theme.spacing(2),
    }
}));

/**
 * Subscriptions component
 *
 * @class Subscriptions
 * @extends {Component}
 */
function Subscriptions(props) {

    const [api] = useAPI();
    const intl = useIntl();
    const { updateAPI } = props;
    const restApi = new API();
    const [tenants, setTenants] = useState(null);
    const [policies, setPolices] = useState({});
    const [originalPolicies, setOriginalPolicies] = useState({});
    const [availability, setAvailability] = useState({ subscriptionAvailability: api.subscriptionAvailability });
    const [tenantList, setTenantList] = useState(api.subscriptionAvailableTenants);
    const [subscriptions, setSubscriptions] = useState(null);
    const [updateInProgress, setUpdateInProgress] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { settings } = useAppContext();
    const isSubValidationDisabled = api.policies && api.policies.length === 1 
    && api.policies[0].includes(CONSTS.DEFAULT_SUBSCRIPTIONLESS_PLAN);

    /**
     * Save subscription information (policies, subscriptionAvailability, subscriptionAvailableTenants)
     */
    function saveAPI() {
        setUpdateInProgress(true);
        const { subscriptionAvailability } = availability;
        const newApi = {
            policies,
            subscriptionAvailability,
            subscriptionAvailableTenants: tenantList,
        };
        updateAPI(newApi)
            .then(() => {
                Alert.info(intl.formatMessage({
                    id: 'Apis.Details.Subscriptions.Subscriptions.update.success',
                    defaultMessage: 'Subscription configurations updated successfully',
                }));
            })
            .catch((error) => {
                if (error.response) {
                    Alert.error(error.response.body.description);
                } else {
                    Alert.error(intl.formatMessage({
                        id: 'Apis.Details.Subscriptions.Subscriptions.update.error',
                        defaultMessage: 'Error occurred while updating subscription configurations',
                    }));
                }
            }).finally(() => {
                setUpdateInProgress(false);
            });
    }

    useEffect(() => {
        restApi.getTenantsByState(CONSTS.TENANT_STATE_ACTIVE)
            .then((result) => {
                setTenants(result.body.count);
            });
        restApi.subscriptions(api.id)
            .then((result) => {
                setSubscriptions(result.body.count);
            });
        setPolices([...api.policies]);
        setOriginalPolicies([...api.policies]);
    }, []);

    const handleSubscriptionSave = () => {
        if (!isSubValidationDisabled 
            && policies.length === 1 && policies[0].includes(CONSTS.DEFAULT_SUBSCRIPTIONLESS_PLAN)) {
            setIsOpen(true);
        } else {
            saveAPI();
        }
    };

    const handleDialogYes = () => {
        setIsOpen(false);
        saveAPI();
    };

    const handleDialogNo = () => {
        setIsOpen(false);
        setPolices(originalPolicies);
    };

    if (typeof tenants !== 'number' || typeof subscriptions !== 'number') {
        return (
            <Grid container direction='row' justifyContent='center' alignItems='center'>
                <Grid item>
                    <CircularProgress />
                </Grid>
            </Grid>
        );
    }
    return (
        (<Root>
            {(api.gatewayVendor === 'wso2') &&
            (
                <SubscriptionPoliciesManage
                    api={api}
                    policies={policies}
                    setPolices={setPolices}
                    subValidationDisablingAllowed={settings.allowSubscriptionValidationDisabling}
                />
            )}
            {isSubValidationDisabled && (
                <Box mb={2} mt={2}>
                    <MUIAlert severity='warning'>
                        <AlertTitle>
                            <FormattedMessage
                                id='Apis.Details.Subscriptions.Subscriptions.validation.disabled'
                                defaultMessage='Subscription validation is disabled for this API'
                            />
                        </AlertTitle>
                    </MUIAlert>
                </Box>
            )}
            {tenants !== 0 && settings.crossTenantSubscriptionEnabled && 
            !isSubValidationDisabled && (
                <SubscriptionAvailability
                    api={api}
                    availability={availability}
                    setAvailability={setAvailability}
                    tenantList={tenantList}
                    setTenantList={setTenantList}
                />
            )}
            {(api.gatewayVendor === 'wso2') && (
                <Grid
                    container
                    direction='row'
                    alignItems='flex-start'
                    spacing={1}
                    className={classes.buttonSection}
                >
                    <Grid item>
                        <Button
                            type='submit'
                            variant='contained'
                            color='primary'
                            disabled={updateInProgress || api.isRevision 
                                || isRestricted(['apim:api_create', 'apim:api_publish'], api)}
                            onClick={() => handleSubscriptionSave()}
                            id='subscriptions-save-btn'
                        >
                            {updateInProgress ? (
                                <CircularProgress size={24} />
                            ) : (
                                <FormattedMessage
                                    id='Apis.Details.Subscriptions.Subscriptions.save'
                                    defaultMessage='Save'
                                />
                            )}
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            component={Link}
                            to={'/apis/' + api.id + '/overview'}
                        >
                            <FormattedMessage
                                id='Apis.Details.Subscriptions.Subscriptions.cancel'
                                defaultMessage='Cancel'
                            />
                        </Button>
                    </Grid>
                </Grid>
            )}
            { !isSubValidationDisabled && (<SubscriptionsTable api={api} />) }
            <Dialog
                open={isOpen}
                onClose={() => setIsOpen(false)}
                aria-labelledby='alert-dialog-title'
                aria-describedby='alert-dialog-description'
            >
                <DialogTitle id='alert-dialog-title'>
                    <FormattedMessage
                        id='Apis.Details.Subscriptions.Subscriptions.subValidationDisabled.dialog.title'
                        defaultMessage='Caution!'
                    />
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id='alert-dialog-description'>
                        <Typography variant='subtitle1' display='block' gutterBottom>
                            <FormattedMessage
                                id='Apis.Details.Subscriptions.Subscriptions.subValidationDisabled.dialog.description'
                                defaultMessage={
                                    'Deselcting all the subscription policies will disable subscription validation' 
                                    + ' for this API. This will allow anyone with a valid token to consume the API' 
                                    + ' without a subscription.'
                                }
                            />
                        </Typography>
                        <Typography variant='subtitle2' display='block' gutterBottom>
                            <b>
                                <FormattedMessage
                                    id={'Apis.Details.Subscriptions.Subscriptions.subValidationDisabled.dialog'
                                    + '.description.question'}
                                    defaultMessage='Do you want to disable subscription validation?'
                                />
                            </b>
                        </Typography>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        color='primary'
                        variant='contained'
                        onClick={() => {
                            handleDialogYes();

                        }}
                        id='disable-sub-validation-yes-btn'
                    >
                        Yes
                    </Button>
                    <Button
                        onClick={() => {
                            handleDialogNo();
                        }}
                        color='primary'
                    >
                        No
                    </Button>
                </DialogActions>
            </Dialog>
        </Root>)
    );
}

Subscriptions.propTypes = {
    updateAPI: PropTypes.func.isRequired,
};

export default (Subscriptions);
