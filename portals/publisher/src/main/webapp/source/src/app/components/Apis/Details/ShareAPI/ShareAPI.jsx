/*
 * Copyright (c) 2025, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
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

import React, {useEffect, useState} from 'react';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { FormattedMessage, injectIntl, useIntl } from 'react-intl';
import { CircularProgress, Paper, Box, FormLabel, Dialog, 
    DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import Alert from 'AppComponents/Shared/Alert';
import API from 'AppData/api';
import { withAPI, useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import CONSTS from 'AppData/Constants';
import { isRestricted } from 'AppData/AuthManager';
import { getBasePath, getTypeToDisplay } from 'AppComponents/Shared/Utils';
import OrganizationSubscriptionPoliciesManage from './OrganizationSubscriptionPoliciesManage';
import SharedOrganizations from './SharedOrganizations';

const PREFIX = 'ShareAPI';

const classes = {
    FormControl: `${PREFIX}-FormControl`,
    FormControlOdd: `${PREFIX}-FormControlOdd`,
    FormLabel: `${PREFIX}-FormLabel`,
    buttonWrapper: `${PREFIX}-buttonWrapper`,
    root: `${PREFIX}-root`,
    group: `${PREFIX}-group`,
    helpButton: `${PREFIX}-helpButton`,
    helpIcon: `${PREFIX}-helpIcon`,
    htmlTooltip: `${PREFIX}-htmlTooltip`,
    buttonSection: `${PREFIX}-buttonSection`,
    emptyBox: `${PREFIX}-emptyBox`,
    shareAPIPaper: `${PREFIX}-shareAPIPaper`
}

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
    },

    [`& .${classes.shareAPIPaper}`]: {
        padding: theme.spacing(2),
        marginTop: theme.spacing(2),
    }
}));

/**
 * ShareAPI component
 *
 * @class ShareAPI
 * @extends {Component}
 * @param {Object} props - The properties passed to the component.
 * @param {Function} props.updateAPI - Function to update the API.
 */
function ShareAPI(props) {

    const [api] = useAPI();
    const intl = useIntl();
    const { updateAPI } = props;
    const restApi = new API();
    const [tenants, setTenants] = useState(null);
    const [updateInProgress, setUpdateInProgress] = useState(false);
    const [organizationPolicies, setOrganizationPolicies] = useState([]);
    const [organizations, setOrganizations] = useState({});
    const [visibleOrganizations, setVisibleOrganizations] = useState(api.visibleOrganizations);
    const [selectionMode, setSelectionMode] = useState("none");
    const isSubValidationDisabled = api.policies && api.policies.length === 1 
        && api.policies[0].includes(CONSTS.DEFAULT_SUBSCRIPTIONLESS_PLAN);
    const [policies, setPolicies] = useState([]);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [confirmCallback, setConfirmCallback] = useState(null);
    const typeToDisplay = getTypeToDisplay(api.apiType);

    /**
     * Save API sharing information (visible organizations and organization policies)
     * 
     * @param {Array} updatedVisibleOrganizations - The updated list of visible organizations.
     * @param {Array} updatedOrganizationPolicies - The updated list of organization policies.
     */
    function saveAPI(updatedVisibleOrganizations, updatedOrganizationPolicies) {
        setUpdateInProgress(true);
        
        const newApi = {
            visibleOrganizations : updatedVisibleOrganizations,
            ...(api.apiType !== API.CONSTS.APIProduct && { organizationPolicies : updatedOrganizationPolicies }),
        };
        updateAPI(newApi)
            .then(() => {
                Alert.info(intl.formatMessage({
                    id: 'Apis.Details.ShareAPI.update.success',
                    defaultMessage: 'API sharing configurations updated successfully',
                }));
            })
            .catch((error) => {
                if (error.response) {
                    Alert.error(error.response.body.description);
                } else {
                    Alert.error(intl.formatMessage({
                        id: 'Apis.Details.ShareAPI.update.error',
                        defaultMessage: 'Error occurred while updating API sharing configurations',
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
        restApi.organizations()
            .then((result) => {
                setOrganizations(result.body);
            })
        setOrganizationPolicies(api.organizationPolicies ? [...api.organizationPolicies] : []);
        setVisibleOrganizations([...api.visibleOrganizations]);
        setPolicies(api.policies);
        
        if (visibleOrganizations.includes("none") || visibleOrganizations.length === 0) {
            setSelectionMode("none");
        } else if (visibleOrganizations.includes("all")) {
            setSelectionMode("all");
        } else {
            setSelectionMode("select");
        }
    }, []);

    const handleShareAPISave = () => {

        const securityScheme = [...api.securityScheme];
        const isMutualSslOnly = securityScheme.length === 2 && securityScheme.includes('mutualssl') 
            && securityScheme.includes('mutualssl_mandatory');
        const isApiKeyEnabled = securityScheme.includes('api_key');

        let updatedVisibleOrganizations = [];
        let updatedOrganizationPolicies = [...organizationPolicies];
        let defaultSubscriptionPlansAdded = false;
    
        if (selectionMode === "all") {
            updatedVisibleOrganizations = ["all"];
            updatedOrganizationPolicies = updatedOrganizationPolicies.filter(policy => policy.organizationID === "all");
        } else if (selectionMode === "none") {
            updatedVisibleOrganizations = ["none"];
            updatedOrganizationPolicies = [];
        } else if (selectionMode === "select") {
            updatedVisibleOrganizations = visibleOrganizations;
            updatedOrganizationPolicies = updatedOrganizationPolicies.filter(policy =>
                visibleOrganizations.includes(policy.organizationID)
            );
        }

        updatedVisibleOrganizations.forEach(orgID => {
            if (orgID === "none") {
                return;
            }
            if (!updatedOrganizationPolicies.some(policy => policy.organizationID === orgID) 
                && !isMutualSslOnly && !isApiKeyEnabled) {
                updatedOrganizationPolicies.push({
                    organizationID: orgID,
                    policies,
                });
                defaultSubscriptionPlansAdded = true;
            }
        });

        updatedOrganizationPolicies = updatedOrganizationPolicies.map(orgPolicy => {
            if (isSubValidationDisabled && orgPolicy.policies.length > 0) {
                defaultSubscriptionPlansAdded = true;
                return { ...orgPolicy, policies };
            } else if (
                !isSubValidationDisabled &&
                orgPolicy.policies.length === 1 &&
                orgPolicy.policies[0].includes(CONSTS.DEFAULT_SUBSCRIPTIONLESS_PLAN)
            ) {
                defaultSubscriptionPlansAdded = true;
                return { ...orgPolicy, policies };
            }
            return orgPolicy;
        });

        if (defaultSubscriptionPlansAdded && (api.gatewayVendor === 'wso2' || api.gatewayType === 'solace')) {
            setConfirmCallback(() => () => saveAPI(updatedVisibleOrganizations, updatedOrganizationPolicies));
            setOpenConfirmDialog(true);
        } else {
            saveAPI(updatedVisibleOrganizations, updatedOrganizationPolicies);
        }
    };

    if (typeof tenants !== 'number') {
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
            <Typography variant='h4' component='h2' align='left' className={classes.mainTitle}>
                <FormattedMessage
                    id='Apis.Details.ShareAPI.title'
                    defaultMessage='Share {type}'
                    values={{
                        type: typeToDisplay
                    }}
                />
            </Typography>
            {organizations?.list?.length === 0 ? (
                <Paper className={classes.shareAPIPaper}>
                    <Box display='flex' alignItems='center' >
                        <FormLabel component='legend' style={{ marginTop: 8, marginBottom: 8}}>
                            <FormattedMessage
                                id='Apis.Details.Configuration.components.Share.API.no.organizations'
                                defaultMessage='No organizations are currently registered under 
                                your current organization to share the {type}.'
                                values={{
                                    type: typeToDisplay
                                }}
                            />
                        </FormLabel>
                    </Box>
                </Paper>
            ) : (
                <div>
                    <SharedOrganizations
                        api={api}
                        organizations={organizations}
                        visibleOrganizations={visibleOrganizations}
                        setVisibleOrganizations = {setVisibleOrganizations}
                        selectionMode = {selectionMode}
                        setSelectionMode = {setSelectionMode}
                    />
                    {(api.gatewayVendor === 'wso2' || api.gatewayType === 'solace') &&
                    (   
                        <>
                            {organizations?.list?.length > 0 && selectionMode !== "none" &&
                                <OrganizationSubscriptionPoliciesManage
                                    api={api}
                                    organizations={organizations.list}
                                    visibleOrganizations={visibleOrganizations}
                                    organizationPolicies={organizationPolicies}
                                    setOrganizationPolicies={setOrganizationPolicies}
                                    selectionMode = {selectionMode}
                                    isSubValidationDisabled = {isSubValidationDisabled}
                                />
                            }
                        </>
                    )}
                </div>
            )}
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
                        disabled={organizations?.list?.length === 0  || updateInProgress || api.isRevision 
                            || isRestricted(['apim:api_create', 'apim:api_publish'], api)
                            || (selectionMode === 'select' 
                                && (visibleOrganizations.length === 0 
                                || (visibleOrganizations.length === 1 && (visibleOrganizations[0].includes('all') 
                                || visibleOrganizations[0].includes('none')))))
                        }
                        onClick={() => handleShareAPISave()}
                        id='share-api-save-btn'
                    >
                        {updateInProgress ? (
                            <CircularProgress size={24} />
                        ) : (
                            <FormattedMessage
                                id='Apis.Details.ShareAPI.save'
                                defaultMessage='Save'
                            />
                        )}
                    </Button>
                </Grid>
                <Grid item>
                    <Button
                        component={Link}
                        to={getBasePath(api.apiType) + api.id + '/overview'}
                    >
                        <FormattedMessage
                            id='Apis.Details.ShareAPI.cancel'
                            defaultMessage='Cancel'
                        />
                    </Button>
                </Grid>
            </Grid>
            {(api.gatewayVendor === 'wso2' || api.gatewayType === 'solace') && (
                <Dialog
                    open={openConfirmDialog} 
                    onClose={() => setOpenConfirmDialog(false)}
                    aria-labelledby='alert-dialog-title'
                    aria-describedby='alert-dialog-description'
                >
                    <DialogTitle id='alert-dialog-title'>
                        <FormattedMessage
                            id='Apis.Details.ShareAPI.subValidationDisabled.dialog.title'
                            defaultMessage='Caution!'
                        />
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id='alert-dialog-description'>
                            <Typography variant='subtitle1' display='block' gutterBottom>
                                {isSubValidationDisabled ? (
                                    <FormattedMessage
                                        id='Apis.Details.ShareAPI.subValidationDisabled.dialog.description'
                                        defaultMessage={'Subscription validation is disabled for this {type}. '
                                            + 'This will allow anyone with a valid token inside a shared organization ' 
                                            + 'to consume the {type} without a subscription. Do you want to confirm?'}
                                        values={{
                                            type: typeToDisplay
                                        }}
                                    />
                                ) : (
                                    <FormattedMessage
                                        id='Apis.Details.ShareAPI.subValidationEnabled.dialog.description'
                                        defaultMessage={'Subscription policies are not set for some of the '
                                            + 'organizations. Root organization\'s subscription policies '
                                            + 'will be set to them. Do you want to confirm?'}
                                    />
                                )}
                            </Typography>
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            color='primary'
                            variant='contained'
                            onClick={() => {
                                setOpenConfirmDialog(false);
                                confirmCallback();
                            }}
                            id='org-disable-sub-validation-yes-btn'
                        >
                            Yes
                        </Button>
                        <Button
                            onClick={() => setOpenConfirmDialog(false)}
                            color='primary'
                        >
                            No
                        </Button>
                    </DialogActions>
                </Dialog>
            )}  
        </Root>)
    );
}


ShareAPI.propTypes = {
    api: PropTypes.shape({
        id: PropTypes.string,
    }).isRequired,
    intl: PropTypes.shape({
        formatMessage: PropTypes.func,
    }).isRequired,
};

export default injectIntl(withAPI(ShareAPI));
