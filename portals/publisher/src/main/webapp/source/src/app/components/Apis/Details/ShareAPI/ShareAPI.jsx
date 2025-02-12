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
import Button from '@mui/material/Button';
import { FormattedMessage, injectIntl, useIntl } from 'react-intl';
import { CircularProgress } from '@mui/material';
import Alert from 'AppComponents/Shared/Alert';
import API from 'AppData/api';
import { withAPI, useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import CONSTS from 'AppData/Constants';
import { isRestricted } from 'AppData/AuthManager';
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
    emptyBox: `${PREFIX}-emptyBox`
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

    /**
     * Save API sharing information (visible organizations and organization policies)
     */
    function saveAPI() {
        setUpdateInProgress(true);

        let updatedVisibleOrganizations = [];
        let updatedOrganizationPolicies = [...organizationPolicies];
    
        if (selectionMode === "all") {
            updatedVisibleOrganizations = ["all"];
            updatedOrganizationPolicies = updatedOrganizationPolicies.filter(policy => policy.organizationID === "all");
        } else if (selectionMode === "none") {
            updatedVisibleOrganizations = [];
            updatedOrganizationPolicies = [];
        } else if (selectionMode === "select") {
            updatedVisibleOrganizations = visibleOrganizations;
            updatedOrganizationPolicies = updatedOrganizationPolicies.filter(policy =>
                visibleOrganizations.includes(policy.organizationID)
            );
        }

        // Add missing organization policies with empty policies array
        // updatedVisibleOrganizations.forEach(orgID => {
        //     if (!updatedOrganizationPolicies.some(policy => policy.organizationID === orgID)) {
        //         updatedOrganizationPolicies.push({
        //             organizationID: orgID,
        //             policies: []
        //         });
        //     }
        // });
        
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
        
        if (visibleOrganizations.includes("all")) {
            setSelectionMode("all");
        } else if (visibleOrganizations.length === 0) {
            setSelectionMode("none");
        } else {
            setSelectionMode("select");
        }
    }, []);

    const handleShareAPISave = () => {
        saveAPI();
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
                    defaultMessage='Share API'
                />
            </Typography>
            <SharedOrganizations
                api={api}
                organizations={organizations}
                visibleOrganizations={visibleOrganizations}
                setVisibleOrganizations = {setVisibleOrganizations}
                selectionMode = {selectionMode}
                setSelectionMode = {setSelectionMode}
            />
            {(api.gatewayVendor === 'wso2') &&
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
                        />
                    }
                </>
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
                            to={'/apis/' + api.id + '/overview'}
                        >
                            <FormattedMessage
                                id='Apis.Details.ShareAPI.cancel'
                                defaultMessage='Cancel'
                            />
                        </Button>
                    </Grid>
                </Grid>
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
