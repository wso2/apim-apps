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
import DeleteRuleset from './DeleteRuleset';

/**
 * API call to get Rulesets
 * @returns {Promise}.
 */
function apiCall() {
    const restApi = new GovernanceAPI();
    return restApi
        .getRulesets()
        .then((result) => {
            return result.body.list;
        })
        .catch((error) => {
            throw error;
        });
}

/**
 * Render a list of rulesets
 * @returns {JSX} List component
 */
export default function ListRulesets() {
    const intl = useIntl();

    const columProps = [
        {
            name: 'name',
            label: intl.formatMessage({
                id: 'Governance.Rulesets.List.column.ruleset',
                defaultMessage: 'Ruleset',
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
                id: 'Governance.Rulesets.List.column.artifactType',
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
                id: 'Governance.Rulesets.List.column.rulesetType',
                defaultMessage: 'Ruleset Type',
            }),
            options: {
                filter: true,
                sort: false,
                customBodyRender: (value) => (
                    <Chip
                        label={Utils.mapRuleTypeToLabel(value)}
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
                id: 'Governance.Rulesets.List.column.provider',
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
            id: 'Governance.Rulesets.List.title',
            defaultMessage: 'Ruleset Catalog',
        }),
        pageDescription: intl.formatMessage({
            id: 'Governance.Rulesets.List.description',
            defaultMessage:
                'Find comprehensive governance rulesets designed to ensure'
                + ' the consistency, security and reliability for your APls',
        }),
    };

    const addButtonProps = {
        triggerButtonText: intl.formatMessage({
            id: 'Governance.Rulesets.List.addRuleset.triggerButtonText',
            defaultMessage: 'Create Ruleset',
        }),
        title: intl.formatMessage({
            id: 'Governance.Rulesets.List.addRuleset.title',
            defaultMessage: 'Create Ruleset',
        }),
    };

    const emptyBoxProps = {
        content: (
            <Typography variant='body2' color='textSecondary' component='p'>
                <FormattedMessage
                    id='Governance.Rulesets.List.empty.content'
                    defaultMessage={'Rulesets are the building blocks for creating'
                        + ' governance policies. They contain predefined rules and'
                        + ' validations that can be used to enforce standards across your APIs.'
                        + ' Click Create Ruleset to get started.'}
                />
            </Typography>
        ),
        title: (
            <Typography gutterBottom variant='h5' component='h2'>
                <FormattedMessage
                    id='Governance.Rulesets.List.empty.title'
                    defaultMessage='Ruleset Catalog'
                />
            </Typography>
        ),
    };

    const addButtonOverride = (
        <RouterLink to='/governance/ruleset-catalog/create'>
            <Button
                variant='contained'
                color='primary'
                size='small'
                role='button'
            >
                <FormattedMessage
                    id='Governance.Rulesets.List.add.new.ruleset'
                    defaultMessage='Create Ruleset'
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
                        id: 'Governance.Rulesets.List.search.placeholder',
                        defaultMessage: 'Search rulesets by name or type',
                    }),
                    active: true,
                }}
                apiCall={apiCall}
                DeleteComponent={DeleteRuleset}
                editComponentProps={{
                    icon: <EditIcon />,
                    title: intl.formatMessage({
                        id: 'Governance.Rulesets.List.edit.title',
                        defaultMessage: 'Edit Ruleset',
                    }),
                    routeTo: '/governance/ruleset-catalog/',
                }}
                addButtonOverride={addButtonOverride}
            />
        </>
    );
}
