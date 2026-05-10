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

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl, FormattedMessage } from 'react-intl';
import Typography from '@mui/material/Typography';
import {
    Chip, Switch, Tooltip, Button, List, ListItemButton, ListItemIcon, Link, ListItemText,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Link as RouterLink } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DescriptionIcon from '@mui/icons-material/Description';
import ListBase from 'AppComponents/AdminPages/Addons/ListBase';
import HelpBase from 'AppComponents/AdminPages/Addons/HelpBase';
import GovernanceAPI from 'AppData/GovernanceAPI';
import Configurations from 'Config';
import { useAppContext } from 'AppComponents/Shared/AppContext';
import Alert from 'AppComponents/Shared/Alert';
import DeleteTemplate from './DeleteTemplate';

/**
 * Toggle switch that sets a template as the default by calling the update API.
 * Only one template can be default at a time — the server enforces uniqueness.
 * On success the list needs a manual refresh (navigate away and back, or press
 * the table refresh button) to reflect the previous default being cleared.
 */
function DefaultToggle({
    templateId, isDefault, isReadOnly, onToggled,
}) {
    const intl = useIntl();
    const [checked, setChecked] = useState(isDefault);
    const [updating, setUpdating] = useState(false);

    const handleChange = (event) => {
        const newValue = event.target.checked;
        // Optimistic flip — give the user instant feedback. On failure we revert below.
        setChecked(newValue);
        setUpdating(true);
        new GovernanceAPI()
            .getDevportalGovernanceTemplateById(templateId)
            .then((res) => {
                const template = res.body;
                return new GovernanceAPI().updateDevportalGovernanceTemplateById(templateId, {
                    ...template,
                    isDefault: newValue,
                });
            })
            .then(() => {
                Alert.success(newValue
                    ? intl.formatMessage({
                        id: 'Governance.Templates.List.default.set.success',
                        defaultMessage: 'Template set as default.',
                    })
                    : intl.formatMessage({
                        id: 'Governance.Templates.List.default.unset.success',
                        defaultMessage: 'Default status removed.',
                    }));
                if (onToggled) onToggled(templateId, newValue);
            })
            .catch(() => {
                // Revert the optimistic flip when the server call fails.
                setChecked(!newValue);
                Alert.error(intl.formatMessage({
                    id: 'Governance.Templates.List.default.update.error',
                    defaultMessage: 'Failed to update default status.',
                }));
            })
            .finally(() => setUpdating(false));
    };

    return (
        <Switch
            checked={checked}
            onChange={handleChange}
            disabled={updating || isReadOnly}
            color='primary'
            size='small'
        />
    );
}

DefaultToggle.propTypes = {
    templateId: PropTypes.string.isRequired,
    isDefault: PropTypes.bool.isRequired,
    isReadOnly: PropTypes.bool,
    onToggled: PropTypes.func,
};
DefaultToggle.defaultProps = { isReadOnly: false, onToggled: null };

/**
 * Render a list of Devportal Governance Templates.
 * @returns {JSX} List component
 */
export default function ListTemplates() {
    const intl = useIntl();
    const { isSuperTenant } = useAppContext();
    // refreshKey forces ListBase to re-mount and re-fetch after a default toggle
    const [refreshKey, setRefreshKey] = useState(0);

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

    const handleDefaultToggled = (templateId, newValue) => {
        // When setting a new default, force the list to re-fetch so the previously
        // default template shows its toggle updated.
        if (newValue) {
            setRefreshKey((k) => k + 1);
        }
    };

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
                customHeadLabelRender: () => (
                    <Tooltip
                        title={intl.formatMessage({
                            id: 'Governance.Templates.List.column.default.tooltip',
                            defaultMessage: 'Toggle on to make this the default template shown to developers '
                                + 'when none is pre-selected. Only one template can be the default at a time.',
                        })}
                        arrow
                        placement='top'
                    >
                        <span
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'default',
                            }}
                        >
                            {intl.formatMessage({
                                id: 'Governance.Templates.List.column.default',
                                defaultMessage: 'Default',
                            })}
                            <InfoOutlinedIcon style={{ fontSize: '0.9rem', opacity: 0.6 }} />
                        </span>
                    </Tooltip>
                ),
                customBodyRender: (value, tableMeta) => {
                    // ListBase appends a synthesized "Actions" column to rowData (see
                    // ListBase.jsx — columns.push({ name: '', label: 'Actions', ... }) when
                    // showActionColumn is true), so the user-declared "id" column is at
                    // length-2 and "isReadOnly" is at length-3 inside this customBodyRender.
                    // Reading length-1 here returns the rendered Actions JSX which is truthy
                    // garbage, causing the toggle's GET to 404 silently and never persist.
                    // rowData layout: [name, description(hidden), status, isGlobal, isDefault,
                    //                  isReadOnly(hidden), id(hidden), <ListBase actions>].
                    const rowId = tableMeta.rowData[tableMeta.rowData.length - 2];
                    const isReadOnly = tableMeta.rowData[tableMeta.rowData.length - 3];
                    return (
                        <DefaultToggle
                            templateId={rowId}
                            isDefault={!!value}
                            isReadOnly={!!isReadOnly}
                            onToggled={handleDefaultToggled}
                        />
                    );
                },
                setCellProps: () => ({ style: { width: '10%', textAlign: 'center' } }),
                setCellHeaderProps: () => ({ style: { textAlign: 'center' } }),
            },
        },
        {
            name: 'isReadOnly',
            options: { display: false },
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
            key={refreshKey}
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
