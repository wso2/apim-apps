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
import {
    Chip, Tooltip, Button, List, ListItemButton, ListItemIcon, Link, ListItemText,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DescriptionIcon from '@mui/icons-material/Description';
import ListBase from 'AppComponents/AdminPages/Addons/ListBase';
import HelpBase from 'AppComponents/AdminPages/Addons/HelpBase';
import GovernanceAPI from 'AppData/GovernanceAPI';
import Configurations from 'Config';
import { useAppContext } from 'AppComponents/Shared/AppContext';
import DeleteTemplate from './DeleteTemplate';

/**
 * Render a list of Devportal Governance Templates.
 * @returns {JSX} List component
 */
export default function ListTemplates() {
    const intl = useIntl();
    const { isSuperTenant } = useAppContext();

    // apiCall defined as closure to capture isSuperTenant for isReadOnly computation
    function apiCall() {
        return new GovernanceAPI()
            .getDevportalGovernanceTemplates({ limit: 100, offset: 0 })
            .then((result) => result.body.list.map((t) => ({
                ...t,
                isReadOnly: !!t.isGlobal && !isSuperTenant,
            })))
            .catch((error) => {
                throw error;
            });
    }

    // IMPORTANT: id must be the LAST column — ListBase reads rowData[rowData.length - 2] for routing
    const columProps = [
        {
            name: 'name',
            label: intl.formatMessage({
                id: 'Governance.Templates.List.column.template',
                defaultMessage: 'Template',
            }),
            options: {
                sort: true,
                customBodyRender: (value, tableMeta) => {
                    const desc = tableMeta.rowData[1];
                    return (
                        <Tooltip title={desc || ''} arrow>
                            <div>
                                <Typography>{value}</Typography>
                                <Typography
                                    variant='caption'
                                    display='block'
                                    color='textSecondary'
                                    sx={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        maxWidth: '280px',
                                    }}
                                >
                                    {desc}
                                </Typography>
                            </div>
                        </Tooltip>
                    );
                },
                setCellProps: () => ({ style: { width: '35%' } }),
            },
        },
        {
            name: 'description',
            options: { display: false },
        },
        {
            name: 'status',
            label: intl.formatMessage({
                id: 'Governance.Templates.List.column.status',
                defaultMessage: 'Status',
            }),
            options: {
                sort: false,
                customBodyRender: (value) => (
                    <Chip
                        label={value}
                        size='small'
                        color={value === 'PUBLISHED' ? 'success' : 'default'}
                        variant={value === 'PUBLISHED' ? 'filled' : 'outlined'}
                    />
                ),
                setCellProps: () => ({ style: { width: '12%', textAlign: 'center' } }),
                setCellHeaderProps: () => ({ style: { textAlign: 'center' } }),
            },
        },
        {
            name: 'isGlobal',
            label: intl.formatMessage({
                id: 'Governance.Templates.List.column.scope',
                defaultMessage: 'Scope',
            }),
            options: {
                sort: false,
                customBodyRender: (value) => (
                    value ? (
                        <Chip label='Global' size='small' color='secondary' variant='outlined' />
                    ) : (
                        <Chip label='Local' size='small' variant='outlined' />
                    )
                ),
                setCellProps: () => ({ style: { width: '12%', textAlign: 'center' } }),
                setCellHeaderProps: () => ({ style: { textAlign: 'center' } }),
            },
        },
        {
            name: 'isDefault',
            label: intl.formatMessage({
                id: 'Governance.Templates.List.column.default',
                defaultMessage: 'Default',
            }),
            options: {
                sort: false,
                customBodyRender: (value) => (
                    value ? <Chip label='Default' size='small' color='primary' /> : null
                ),
                setCellProps: () => ({ style: { width: '12%', textAlign: 'center' } }),
                setCellHeaderProps: () => ({ style: { textAlign: 'center' } }),
            },
        },
        {
            name: 'id',
            options: { display: false }, // Must remain last — used by ListBase for edit routing
        },
    ];

    const pageProps = {
        pageStyle: 'paperLess',
        title: intl.formatMessage({
            id: 'Governance.Templates.List.title',
            defaultMessage: 'Devportal Governance Templates',
        }),
        pageDescription: intl.formatMessage({
            id: 'Governance.Templates.List.description',
            defaultMessage: 'Create and manage templates that configure the Devportal application creation'
                + ' workflow and bind governance rulesets to enforce developer policies.',
        }),
        help: (
            <HelpBase>
                <List component='nav'>
                    <ListItemButton>
                        <ListItemIcon sx={{ minWidth: 'auto', marginRight: 1 }}>
                            <DescriptionIcon />
                        </ListItemIcon>
                        <Link
                            target='_blank'
                            href={`${Configurations.app.docUrl}governance/devportal-governance-templates/`}
                            underline='hover'
                        >
                            <ListItemText primary={(
                                <FormattedMessage
                                    id='Governance.Templates.List.help.link'
                                    defaultMessage='Create and Manage Templates'
                                />
                            )}
                            />
                        </Link>
                    </ListItemButton>
                </List>
            </HelpBase>
        ),
    };

    const emptyBoxProps = {
        content: (
            <Typography variant='body2' color='textSecondary' component='p'>
                <FormattedMessage
                    id='Governance.Templates.List.empty.content'
                    defaultMessage='Templates configure the Devportal application wizard and enforce
                        ruleset bindings on developers. Click Create Template to get started.'
                />
            </Typography>
        ),
        title: (
            <Typography gutterBottom variant='h5' component='h2'>
                <FormattedMessage
                    id='Governance.Templates.List.empty.title'
                    defaultMessage='Devportal Governance Templates'
                />
            </Typography>
        ),
    };

    const addButtonOverride = (
        <RouterLink to='/governance/templates/create'>
            <Button variant='contained' color='primary' size='small' role='button'>
                <FormattedMessage
                    id='Governance.Templates.List.btn.create'
                    defaultMessage='Create Template'
                />
            </Button>
        </RouterLink>
    );

    return (
        <ListBase
            columProps={columProps}
            pageProps={pageProps}
            addButtonProps={{
                triggerButtonText: intl.formatMessage({
                    id: 'Governance.Templates.List.add.triggerButtonText',
                    defaultMessage: 'Create Template',
                }),
                title: intl.formatMessage({
                    id: 'Governance.Templates.List.add.title',
                    defaultMessage: 'Create Template',
                }),
            }}
            searchProps={{
                searchPlaceholder: intl.formatMessage({
                    id: 'Governance.Templates.List.search.placeholder',
                    defaultMessage: 'Search templates by name',
                }),
                active: true,
            }}
            emptyBoxProps={emptyBoxProps}
            apiCall={apiCall}
            DeleteComponent={DeleteTemplate}
            editComponentProps={{
                icon: <EditIcon />,
                title: intl.formatMessage({
                    id: 'Governance.Templates.List.edit.title',
                    defaultMessage: 'Edit Template',
                }),
                routeTo: '/governance/templates/',
            }}
            addButtonOverride={addButtonOverride}
        />
    );
}
