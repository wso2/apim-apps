/*
 * Copyright (c) 2025, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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

import React from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import Typography from '@mui/material/Typography';
import ListBase from 'AppComponents/AdminPages/Addons/ListBase';
import { Chip, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import GovernanceAPI from 'AppData/GovernanceAPI';
import Utils from 'AppData/Utils';
import DeletePolicy from './DeletePolicy';

/**
 * API call to get Policies
 * @returns {Promise}.
 */
function apiCall() {
    const restApi = new GovernanceAPI();
    return restApi
        .getRulesetsList()
        .then((result) => {
            return result.body.list;
        })
        .catch((error) => {
            throw error;
        });
}

/**
 * Render a list of policies
 * @returns {JSX} List component
 */
export default function ListPolicies() {
    const intl = useIntl();

    const columProps = [
        {
            name: 'name',
            label: intl.formatMessage({
                id: 'Governance.Policies.List.column.policy',
                defaultMessage: 'Policy',
            }),
            options: {
                filter: true,
                sort: true,
                customBodyRender: (value, tableMeta) => {
                    const dataRow = tableMeta.rowData;
                    return (
                        // TODO: Add text wrapping + tooltip for long descriptions
                        <>
                            <Typography>{value}</Typography>
                            <Typography
                                variant='caption'
                                display='block'
                                color='textSecondary'
                            >
                                {dataRow[1]}
                            </Typography>
                        </>
                    );
                },
                setCellProps: () => ({
                    style: {
                        width: '40%',
                    },
                }),
            },
        },
        {
            name: 'description',
            options: { display: false },
        },
        {
            name: 'artifactType',
            label: intl.formatMessage({
                id: 'Governance.Policies.List.column.artifactType',
                defaultMessage: 'Artifact Type',
            }),
            options: {
                filter: true,
                sort: false,
                customBodyRender: (value) => (
                    <Chip
                        label={Utils.mapArtifactTypeToLabel(value)}
                        size='small'
                    />
                ),
                setCellProps: () => ({
                    style: {
                        width: '15%',
                        textAlign: 'center',
                    },
                }),
                setCellHeaderProps: () => ({
                    style: {
                        textAlign: 'center',
                    },
                }),
            },
        },
        {
            name: 'ruleType',
            label: intl.formatMessage({
                id: 'Governance.Policies.List.column.policyType',
                defaultMessage: 'Policy Type',
            }),
            options: {
                filter: true,
                sort: false,
                customBodyRender: (value) => (
                    <Chip
                        label={Utils.mapPolicyTypeToLabel(value)}
                        size='small'
                    />
                ),
                setCellProps: () => ({
                    style: {
                        width: '15%',
                        textAlign: 'center',
                    },
                }),
                setCellHeaderProps: () => ({
                    style: {
                        textAlign: 'center',
                    },
                }),
            },
        },
        {
            name: 'provider',
            label: intl.formatMessage({
                id: 'Governance.Policies.List.column.provider',
                defaultMessage: 'Provider',
            }),
            options: {
                filter: true,
                sort: false,
                setCellProps: () => ({
                    style: {
                        width: '15%',
                        textAlign: 'center',
                    },
                }),
                setCellHeaderProps: () => ({
                    style: {
                        textAlign: 'center',
                    },
                }),
            },
        },
        { name: 'id', options: { display: false } },
    ];

    const pageProps = {
        pageStyle: 'paperLess',
        title: intl.formatMessage({
            id: 'Governance.Policies.List.title',
            defaultMessage: 'Policies',
        }),
        pageDescription: intl.formatMessage({
            id: 'Governance.Policies.List.description',
            defaultMessage:
                'Find comprehensive governance policies designed to ensure'
                + ' the consistency, security and reliability for your APls',
        }),
    };

    const addButtonProps = {
        triggerButtonText: intl.formatMessage({
            id: 'Governance.Policies.List.addPolicy.triggerButtonText',
            defaultMessage: 'Create Policy',
        }),
        title: intl.formatMessage({
            id: 'Governance.Policies.List.addPolicy.title',
            defaultMessage: 'Create Policy',
        }),
    };

    const emptyBoxProps = {
        content: (
            <Typography variant='body2' color='textSecondary' component='p'>
                <FormattedMessage
                    id='Governance.Policies.List.empty.content'
                    defaultMessage={'Policies are the building blocks for creating'
                        + ' governance policy attachments. They contain predefined rules and'
                        + ' validations that can be used to enforce standards across your APIs.'
                        + ' Click Create Policy to get started.'}
                />
            </Typography>
        ),
        title: (
            <Typography gutterBottom variant='h5' component='h2'>
                <FormattedMessage
                    id='Governance.Policies.List.empty.title'
                    defaultMessage='Policies'
                />
            </Typography>
        ),
    };

    const addButtonOverride = (
        <RouterLink to='/governance/policies/create'>
            <Button
                variant='contained'
                color='primary'
                size='small'
                role='button'
            >
                <FormattedMessage
                    id='Governance.Policies.List.add.new.policy'
                    defaultMessage='Create Policy'
                />
            </Button>
        </RouterLink>
    );

    return (
        <>
            <ListBase
                columProps={columProps}
                pageProps={pageProps}
                addButtonProps={addButtonProps}
                emptyBoxProps={emptyBoxProps}
                searchProps={{
                    searchPlaceholder: intl.formatMessage({
                        id: 'Governance.Policies.List.search.placeholder',
                        defaultMessage: 'Search policies by name or type',
                    }),
                    active: true,
                }}
                apiCall={apiCall}
                DeleteComponent={DeletePolicy}
                editComponentProps={{
                    icon: <EditIcon />,
                    title: intl.formatMessage({
                        id: 'Governance.Policies.List.edit.title',
                        defaultMessage: 'Edit Policy',
                    }),
                    routeTo: '/governance/policies/',
                }}
                addButtonOverride={addButtonOverride}
            />
        </>
    );
}
