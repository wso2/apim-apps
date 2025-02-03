/*eslint-disable*/
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

import { useEffect, useState } from 'react';
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
import { isRestricted } from 'AppData/AuthManager';
import Configurations from 'Config';
import CONSTS from 'AppData/Constants';
import Tooltip from '@mui/material/Tooltip';
import InfoIcon from '@mui/icons-material/Info';
import { Table, TableRow, Chip } from '@mui/material';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableContainer from '@mui/material/TableContainer';
import { Autocomplete, TextField, ListItem } from "@mui/material";
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';


const PREFIX = 'OrganizationSubscriptionPoliciesManage';

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

function OrganizationSubscriptionPoliciesManage(props) {
    const { api, organizations, visibleOrganizations, organizationPolicies, setOrganizationPolicies } = props;
    const [filteredOrganizations, setFilteredOrganizations] = useState([]);
    const [subscriptionPolicies, setSubscriptionPolicies] = useState([]);

    useEffect(() => {
        const limit = Configurations.app.subscriptionPolicyLimit;
        const isAiApi = api?.subtypeConfiguration?.subtype?.toLowerCase().includes('aiapi') ?? false;
        const policyPromise = API.policies('subscription', limit || undefined, isAiApi);

        policyPromise
            .then((res) => {
                setSubscriptionPolicies(res.body.list);
            })
            .catch((error) => {
                console.error(error);
            });

        if (visibleOrganizations.includes('all')) {
            setFilteredOrganizations(organizations);
        } else {
            setFilteredOrganizations(organizations.filter(org => visibleOrganizations.includes(org.organizationId)));
        }
    }, [organizations, visibleOrganizations]);

    const handlePolicyChange = (organizationId, selectedPolicies) => {
        const selectedPolicyNames = selectedPolicies.map(policy => policy.name);
        const existingOrgPolicyIndex = organizationPolicies.findIndex(
            orgPolicy => orgPolicy.organizationID === organizationId
        );
        let updatedOrganizationPolicies;

        if (existingOrgPolicyIndex !== -1) {
            updatedOrganizationPolicies = organizationPolicies.map(orgPolicy =>
                orgPolicy.organizationID === organizationId
                    ? { ...orgPolicy, policies: selectedPolicyNames }
                    : orgPolicy
            );
        } else {
            const organizationName = organizations.find(org => org.organizationId === organizationId).displayName;
            updatedOrganizationPolicies = [
                ...organizationPolicies,
                { 
                    organizationID: organizationId,
                    organizationName,
                    policies: selectedPolicyNames
                }
            ];
        }
        updatedOrganizationPolicies = updatedOrganizationPolicies.filter(orgPolicy => orgPolicy.policies.length > 0);

        setOrganizationPolicies(updatedOrganizationPolicies);
    };

    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;

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
        <>
        <Typography variant='h6' style={{ marginTop: '20px' }}>Organization Specific Business Plans</Typography>
        <Paper>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Organization</TableCell>
                            <TableCell>Policies</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredOrganizations.map(org => (
                            <TableRow key={org.organizationId}>
                                <TableCell>{org.displayName}</TableCell>
                                <TableCell>
                                    <Autocomplete
                                        multiple
                                        disableCloseOnSelect
                                        options={subscriptionPolicies}
                                        getOptionLabel={(option) => 
                                            option?.displayName ? `${option.displayName} - ${option.description}` : String(option)
                                        }
                                        value={subscriptionPolicies.filter(policy => 
                                            organizationPolicies.find(op => op.organizationID === org.organizationId)?.policies.includes(policy.name)
                                        ) || []}
                                        onChange={(event, value) => handlePolicyChange(org.organizationId, value)}
                                        renderOption={(props, option, { selected }) => {
                                            const { key, ...optionProps } = props;
                                            if (option.displayName.includes(CONSTS.DEFAULT_SUBSCRIPTIONLESS_PLAN)) {
                                                return null;
                                            }
                                            return (
                                                <ListItem key={key} {...optionProps}>
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
                                                            style={{ marginLeft: 5, fontSize: 20, cursor: 'default' }}
                                                        />
                                                    </Tooltip>
                                                </ListItem>
                                            );
                                        }}
                                        renderTags={(selected, getTagProps) =>
                                            selected
                                                .filter(option => !option.displayName.includes(CONSTS.DEFAULT_SUBSCRIPTIONLESS_PLAN))
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
        </Paper>
        </>
    );
}

export default OrganizationSubscriptionPoliciesManage;
