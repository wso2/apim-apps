/* eslint-disable */
/*
 * Copyright (c) 2025, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import Typography from '@mui/material/Typography';
import DeletePolicy from './DeletePolicy';
import { Box, Chip, Stack } from '@mui/material';
import { Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import ListBase from 'AppComponents/AdminPages/Addons/ListBase';
import GovernanceAPI from 'AppData/GovernanceAPI';


/**
 * API call to get Policies
 * @returns {Promise}.
 */
function apiCall() {
    const restApi = new GovernanceAPI();
    return restApi
        .getPoliciesList()
        .then((result) => {
            console.log(result);
            return result.body.list;
        })
        .catch((error) => {
            throw error;
        });
}

const TruncatedCell = ({ children }) => {
    return (
        <Box sx={{ maxWidth: '200px' }}>
            <Typography noWrap>
                {children}
            </Typography>
        </Box>
    );
};

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
                        <TruncatedCell>
                            {value}
                            <Typography variant="caption" display="block">
                                {dataRow[1]}
                            </Typography>
                        </TruncatedCell>
                    );
                },
            },
        },
        {
            name: 'description',
            options: { display: false }
        },
        {
            name: 'governableStates',
            label: intl.formatMessage({
                id: 'Governance.Policies.List.column.appliesWhen',
                defaultMessage: 'Applies when',
            }),
            options: {
                filter: true,
                sort: false,
                customBodyRender: (value) => (
                    <Stack direction="row" spacing={0.5}>
                        {value?.map((label) => (
                            <Chip
                                key={label}
                                label={label}
                                size="small"
                                variant="outlined"
                                color="primary"
                            />
                        ))}
                    </Stack>
                ),
                setCellProps: () => ({
                    style: {
                        justifyItems: 'center',
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
            name: 'labels',
            label: intl.formatMessage({
                id: 'Governance.Policies.List.column.appliesTo',
                defaultMessage: 'Applies to',
            }),
            options: {
                filter: true,
                sort: false,
                customBodyRender: (value) => (
                    <Stack direction="row" spacing={0.5}>
                        {value?.map((label) => (
                            <Chip
                                key={label}
                                label={label}
                                size="small"
                                variant="outlined"
                                color="info"
                            />
                        ))}
                    </Stack>
                ),
                setCellProps: () => ({
                    style: {
                        justifyItems: 'center',
                    },
                }),
                setCellHeaderProps: () => ({
                    style: {
                        textAlign: 'center',
                    },
                }),
            },
        },
        { name: 'id', options: { display: false } }, // Id column has to be always the last since it is used in the actions.
    ];

    const pageProps = {
        pageStyle: 'paperLess',
        title: intl.formatMessage({
            id: 'Governance.Policies.List.title',
            defaultMessage: 'Governance Policies',
        }),
    };

    const addButtonProps = {
        triggerButtonText: intl.formatMessage({
            id: 'Governance.Policies.List.addPolicy.triggerButtonText',
            defaultMessage: 'Create Governance Policy',
        }),
        title: intl.formatMessage({
            id: 'Governance.Policies.List.addPolicy.title',
            defaultMessage: 'Create Governance Policy',
        }),
    };

    const searchProps = {
        searchPlaceholder: intl.formatMessage({
            id: 'Governance.Policies.List.search.default',
            defaultMessage: 'Search policies by name or label',
        }),
        active: true,
    };

    const emptyBoxProps = {
        content: (
            <Typography variant="body2" color="textSecondary">
                <FormattedMessage
                    id='Governance.Policies.List.empty.content'
                    defaultMessage='You can create a new policy.'
                />
            </Typography>
        ),
        title: (
            <Typography variant="h5" component="h2">
                <FormattedMessage
                    id='Governance.Policies.List.empty.title'
                    defaultMessage='Governance Policies'
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
        <ListBase
            columProps={columProps}
            pageProps={pageProps}
            addButtonProps={addButtonProps}
            searchProps={searchProps}
            emptyBoxProps={emptyBoxProps}
            apiCall={apiCall}
            DeleteComponent={DeletePolicy}
            editComponentProps={{
                icon: <EditIcon />,
                title: 'Edit Policy',
                routeTo: '/governance/policies/',
            }}
            addButtonOverride={addButtonOverride}
        />
    );
}
