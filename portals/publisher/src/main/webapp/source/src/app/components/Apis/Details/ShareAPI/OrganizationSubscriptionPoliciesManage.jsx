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

import React, { useEffect, useState, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import PropTypes from 'prop-types';
import API from 'AppData/api';
import Configurations from 'Config';
import CONSTS from 'AppData/Constants';
import Tooltip from '@mui/material/Tooltip';
import InfoIcon from '@mui/icons-material/Info';
import { Table, TableRow, Chip, Autocomplete, TextField, ListItem, Box, 
    Alert as MUIAlert, AlertTitle } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableContainer from '@mui/material/TableContainer';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import WarningIcon from '@mui/icons-material/WarningAmber';
import { getTypeToDisplay } from 'AppComponents/Shared/Utils';

const PREFIX = 'OrganizationSubscriptionPoliciesManage';

const classes = {
    heading: `${PREFIX}-heading`,
    grid: `${PREFIX}-grid`,
    gridLabel: `${PREFIX}-gridLabel`,
    mainTitle: `${PREFIX}-mainTitle`
};

const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.heading}`]: {
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(2),
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
 * Manage organization based subscription policies of the API
 * 
 * @param {Object} props - The properties passed to the component
 * @param {Object} props.api - The API object
 * @param {Array} props.organizations - The list of all organizations
 * @param {Array} props.visibleOrganizations - The list of visible organizations
 * @param {Array} props.organizationPolicies - The list of organization policies
 * @param {Function} props.setOrganizationPolicies - The function to set organization policies
 * @returns {JSX.Element} The rendered component
 */
function OrganizationSubscriptionPoliciesManage(props) {
    const { api, organizations, visibleOrganizations, 
        organizationPolicies, setOrganizationPolicies, selectionMode, isSubValidationDisabled } = props;
    const [filteredOrganizations, setFilteredOrganizations] = useState([]);
    const [subscriptionPolicies, setSubscriptionPolicies] = useState([]);
    
    const isAsyncAPI = useMemo(() => 
        ['WS', 'WEBSUB', 'SSE', 'ASYNC'].includes(api.type), [api.type]
    );

    useEffect(() => {
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
                const policies = res.body.list.map(policy => ({
                    ...policy,
                    name: policy.name || policy.policyName,
                }));
                setSubscriptionPolicies(policies);
            })
            .catch((error) => {
                console.error(error);
            });

        let updatedOrganizations = [];
        if (selectionMode === 'all') {
            updatedOrganizations = [
                { organizationId: 'all', displayName: 'All Organizations' },
            ];
        } else {
            updatedOrganizations = organizations.filter(org => visibleOrganizations.includes(org.organizationId));
        }
    
        setFilteredOrganizations(updatedOrganizations);

    }, [organizations, visibleOrganizations, selectionMode]);

    const handlePolicyChange = (organizationId, selectedPolicies) => {

        let selectedPolicyNames = selectedPolicies.map(policy => policy.name || policy.policyName);
        if (selectedPolicyNames.length > 1 ) {
            selectedPolicyNames = selectedPolicyNames.filter((policy) =>
                !policy.includes(CONSTS.DEFAULT_SUBSCRIPTIONLESS_PLAN));
        }
        const existingOrgPolicyIndex = organizationPolicies.findIndex(
            orgPolicy => orgPolicy.organizationID === organizationId
        );
        let updatedOrganizationPolicies;
        if (existingOrgPolicyIndex !== -1) {
            updatedOrganizationPolicies = organizationPolicies.map(
                orgPolicy => orgPolicy.organizationID === organizationId
                    ? { ...orgPolicy, policies: selectedPolicyNames }
                    : orgPolicy
            );
        } else {
            updatedOrganizationPolicies = [
                ...organizationPolicies,
                { 
                    organizationID: organizationId,
                    policies: selectedPolicyNames
                }
            ];
        }
        updatedOrganizationPolicies = updatedOrganizationPolicies.filter(orgPolicy => orgPolicy.policies.length > 0);

        setOrganizationPolicies(updatedOrganizationPolicies);
    };

    const icon = <CheckBoxOutlineBlankIcon fontSize='small' />;
    const checkedIcon = <CheckBoxIcon fontSize='small' />;

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
        <Root>
            <div className={classes.heading}>
                <Typography variant='h6' style={{ marginTop: '20px' }}>
                    Business Plans
                </Typography>
            </div>
            <Paper>
                {!isSubValidationDisabled ? (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Organization</TableCell>
                                    <TableCell style={{ width: '80%' }}>Policies</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {selectionMode === 'select' 
                                    && (visibleOrganizations.length === 0 
                                    || (visibleOrganizations.length === 1 && (visibleOrganizations[0].includes('all') 
                                    || visibleOrganizations[0].includes('none')))) && (
                                    <TableRow>
                                        <TableCell colSpan={2}>
                                            <MUIAlert severity='warning'>
                                                <AlertTitle>
                                                    <FormattedMessage
                                                        id={'Apis.Details.ShareAPI.Organization.' +
                                                        'Subscriptions.no.selected.organizations'}
                                                        defaultMessage='No organizations selected'
                                                    />
                                                </AlertTitle>
                                            </MUIAlert>
                                        </TableCell>
                                    </TableRow>
                                )}
                                {filteredOrganizations.map(org => (
                                    <TableRow key={org.organizationId}>
                                        <TableCell>
                                            <Box style={{ display: 'flex' }}>
                                                {org.displayName}
                                                {(() => {
                                                    const orgPolicy = organizationPolicies.find(
                                                        (op) => op.organizationID === org.organizationId);
                                                    const hasNoPolicies = !orgPolicy || orgPolicy.policies.length === 0;
                                                    const hasSubscriptionlessPlan = 
                                                        orgPolicy?.policies.includes(
                                                            CONSTS.DEFAULT_SUBSCRIPTIONLESS_PLAN)
                                                        || orgPolicy?.policies.includes(
                                                            CONSTS.DEFAULT_ASYNC_SUBSCRIPTIONLESS_PLAN);

                                                    if (hasNoPolicies || hasSubscriptionlessPlan) {
                                                        return (
                                                            <Tooltip title=
                                                                'Subscription policies have not been assigned'>
                                                                <WarningIcon
                                                                    style={{
                                                                        color: 'orange',
                                                                        marginLeft: 10,
                                                                        fontSize: 'medium',
                                                                    }}
                                                                />
                                                            </Tooltip>
                                                        );
                                                    }
                                                    return null;
                                                })()}
                                            </Box>
                                        </TableCell>
                                        <TableCell style={{ width: '80%' }}>
                                            <Autocomplete
                                                multiple
                                                disableCloseOnSelect
                                                limitTags={5}
                                                options={subscriptionPolicies}
                                                getOptionLabel={(option) =>
                                                    option?.displayName ?
                                                        `${option.displayName} - ${option.description}` : String(option)
                                                }
                                                value={subscriptionPolicies.filter(policy => 
                                                    organizationPolicies.find(
                                                        op => op.organizationID === org.organizationId)?.
                                                        policies.includes(policy.name)
                                                ) || []}
                                                onChange={(event, value) => 
                                                    handlePolicyChange(org.organizationId, value)}
                                                renderOption={(optionProps, option, { selected }) => {
                                                    const { key, ...restOptionProps } = optionProps;
                                                    if (option.displayName.includes(
                                                        CONSTS.DEFAULT_SUBSCRIPTIONLESS_PLAN)) {
                                                        return null;
                                                    }
                                                    return (
                                                        <ListItem key={key} {...restOptionProps}>
                                                            <Checkbox
                                                                icon={icon}
                                                                checkedIcon={checkedIcon}
                                                                style={{ marginRight: 8 }}
                                                                checked={selected}
                                                            />
                                                            {option.displayName} - {option.description} 
                                                            <Tooltip title={getPolicyDetails(option)}>
                                                                <InfoIcon
                                                                    color='action'
                                                                    style={{
                                                                        marginLeft: 5, fontSize: 20, cursor: 'default'
                                                                    }}
                                                                />
                                                            </Tooltip>
                                                        </ListItem>
                                                    );
                                                }}
                                                renderTags={(selected, getTagProps) =>
                                                    selected
                                                        .filter(option => !option.displayName
                                                            .includes(CONSTS.DEFAULT_SUBSCRIPTIONLESS_PLAN))
                                                        .map((option, index) => (
                                                            <Chip
                                                                {...getTagProps({ index })}
                                                                key={option.name}
                                                                label={option.displayName}
                                                            />
                                                        ))
                                                }
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        variant='outlined'
                                                        placeholder='Select Policies'
                                                    />
                                                )}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Box mb={2} mt={2}>
                        <MUIAlert severity='warning'>
                            <AlertTitle>
                                <FormattedMessage
                                    id='Apis.Details.Subscriptions.Subscriptions.validation.disabled'
                                    defaultMessage='Subscription validation is disabled for this {type}'
                                    values={{
                                        type: getTypeToDisplay(api.apiType)
                                    }}
                                />
                            </AlertTitle>
                        </MUIAlert>
                    </Box>
                )}
            </Paper>
        </Root>
    );
}

OrganizationSubscriptionPoliciesManage.propTypes = {
    api: PropTypes.shape({ policies: PropTypes.arrayOf(PropTypes.shape({})) }).isRequired,
    organizations: PropTypes.arrayOf(PropTypes.shape({
        organizationId: PropTypes.string.isRequired,
    })).isRequired,
    visibleOrganizations: PropTypes.arrayOf(PropTypes.string).isRequired,
    organizationPolicies: PropTypes.arrayOf(PropTypes.shape({
        organizationID: PropTypes.string.isRequired,
        policies: PropTypes.arrayOf(PropTypes.string).isRequired,
    })).isRequired,
    setOrganizationPolicies: PropTypes.func.isRequired,
};

export default OrganizationSubscriptionPoliciesManage;
