/*
 * Copyright (c) 2025, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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
import API from 'AppData/api';
import { useIntl, FormattedMessage } from 'react-intl';
import Typography from '@mui/material/Typography';
import ListBase from 'AppComponents/AdminPages/Addons/ListBase';
import Delete from 'AppComponents/Organizations/DeleteOrganization';
import AddEditOrganization from 'AppComponents/Organizations/AddEditOrganization';
import EditIcon from '@mui/icons-material/Edit';

/**
 * API call to get Organizations list
 * @returns {Promise}.
 */
function apiCall() {
    return new API()
        .organizationsListGet()
        .then((result) => {
            return result.body.list;
        })
        .catch((error) => {
            throw error;
        });
}
/**
 * Render a list
 * @returns {JSX} Header AppBar components.
 */
export default function ListOrganizations() {
    const intl = useIntl();
    const [userOrg, setUserOrg] = useState(null);

    useEffect(() => {
        new API()
            .getUserOrganizationInfo()
            .then((result) => {
                setUserOrg(result.body.organizationId);
            })
            .catch((error) => {
                throw error;
            });
    }, []);

    const columProps = [
        { name: 'id', options: { display: false } },
        { name: 'referenceId', options: { display: false } },
        {
            name: 'displayName',
            label: intl.formatMessage({
                id: 'AdminPages.Organizations.table.header.organization.name',
                defaultMessage: 'Organization Name',
            }),
            options: {
                filter: true,
                sort: true,
            },
        },
        {
            name: 'description',
            label: intl.formatMessage({
                id: 'AdminPages.Organizations.table.header.organization.description',
                defaultMessage: 'Description',
            }),
            options: {
                filter: true,
                sort: false,
            },
        },
    ];
    const pageProps = {
        pageStyle: 'half',
        title: intl.formatMessage({
            id: 'AdminPages.Organizations.List.title.organizations',
            defaultMessage: 'Organizations',
        }),
    };
    const addButtonProps = {
        triggerButtonText: intl.formatMessage({
            id: 'AdminPages.Organizations.List.addButtonProps.triggerButtonText',
            defaultMessage: 'Register Organization',
        }),
        title: intl.formatMessage({
            id: 'AdminPages.Organizations.List.addButtonProps.title',
            defaultMessage: 'Register Organization',
        }),
    };
    const searchProps = {
        searchPlaceholder: intl.formatMessage({
            id: 'AdminPages.Organizations.List.search.default',
            defaultMessage: 'Search by Organization Name',
        }),
        active: true,
    };
    const emptyBoxProps = {
        content: (
            <Typography variant='body2' color='textSecondary' component='p'>
                <FormattedMessage
                    id='AdminPages.Organizations.List.empty.content.organization'
                    defaultMessage={'Manage your organizations by registering new'
                    + ' organizations or updating existing entries.'}
                />
            </Typography>
        ),
        title: (
            <Typography gutterBottom variant='h5' component='h2'>
                <FormattedMessage
                    id='AdminPages.Organizations.List.empty.title.organization'
                    defaultMessage='Organizations'
                />
            </Typography>
        ),
    };

    const emptyBoxPropsForNoOrgUser = {
        content: (
            <Typography variant='body2' color='textSecondary' component='p'>
                <FormattedMessage
                    id='AdminPages.Organizations.List.empty.content.organization.no.orguser'
                    defaultMessage={'Users who belong to an organization can manage their '
                    + 'organizations by registering new organizations '
                    + 'or updating existing entries.'}
                />
            </Typography>
        ),
        title: (
            <Typography gutterBottom variant='h5' component='h2'>
                <FormattedMessage
                    id='AdminPages.Organizations.List.empty.title.organization'
                    defaultMessage='Organizations'
                />
            </Typography>
        ),
    };

    return (
        <ListBase
            columProps={columProps}
            pageProps={pageProps}
            searchProps={searchProps}
            emptyBoxProps={userOrg ? emptyBoxProps : emptyBoxPropsForNoOrgUser}
            apiCall={apiCall}
            EditComponent={AddEditOrganization}
            editComponentProps={{
                icon: <EditIcon />,
                title: 'Edit Organization',
            }}
            DeleteComponent={Delete}
            addButtonProps={userOrg ? addButtonProps : null}
        />
    );
}
