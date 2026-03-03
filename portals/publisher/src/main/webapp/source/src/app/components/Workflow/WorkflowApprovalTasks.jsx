/* eslint-disable react/jsx-props-no-spreading */
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

import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';

// MUI UI components
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import {
    Alert as MUIAlert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';

// MUI icons
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';

// Third-party libraries
import MUIDataTable from 'mui-datatables';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import startCase from 'lodash/startCase';

// WSO2 publisher portal shared components
import ContentBase from 'AppComponents/Addons/Addons/ContentBase';
import InlineProgress from 'AppComponents/Addons/Addons/InlineProgress';
import Alert from 'AppComponents/Shared/Alert';
import HelpBase from 'AppComponents/Addons/Addons/HelpBase';
import WarningBase from 'AppComponents/Addons/Addons/WarningBase';
import API from 'AppData/api';

// Enable dayjs plugins used in expandable view (relative time + localized date format)
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

// Default maximum number of columns to display in the table, including the Action column
const DEFAULT_MAX_COLUMNS_INCLUDING_ACTION = 5;

/**
 * Converts property keys to readable labels using Lodash.
 * @param {string} key The property key (e.g., 'apiName', 'tenant_domain', or 'api name')
 * @returns {string} The formatted label (e.g., 'Api Name', 'Tenant Domain')
 */
const toTitleCase = (key) => {
    if (!key) return '';
    const trimmed = String(key).trim();

    const needsFormatting = /[_-]/.test(trimmed)
        || /[a-z0-9][A-Z]/.test(trimmed)
        || /^[a-z]+$/.test(trimmed)
        || (/\s+/.test(trimmed) && trimmed === trimmed.toLowerCase());

    return needsFormatting ? startCase(trimmed) : trimmed;
};

/**
 * Convert any value into a UI-safe string.
 * - null/undefined/empty string => "N/A"
 * - everything else => String(value)
 * @param {*} value Input value.
 * @returns {string} UI text.
 */
const toText = (value) => {
    if (value === null || value === undefined || value === '') {
        return 'N/A';
    }
    if (typeof value === 'object') {
        try {
            return JSON.stringify(value);
        } catch (e) {
            return 'N/A';
        }
    }
    return String(value);
};

/**
 * Attempt to parse a string value as JSON.
 * Only tries parsing if the string looks like JSON (starts with { or [).
 * @param {*} value Property value retrieved from backend.
 * @returns {object|array|null} Parsed JSON, or null if not parseable.
 */
const tryParseJson = (value) => {
    if (typeof value !== 'string') {
        return null;
    }
    const trimmed = value.trim();
    if (!(trimmed.startsWith('{') || trimmed.startsWith('['))) {
        return null;
    }
    try {
        return JSON.parse(value);
    } catch (e) {
        return null;
    }
};

/**
 * Split incoming workflow properties map into:
 *  - simpleProperties: primitives / plain strings
 *  - jsonProperties: objects/arrays OR strings that can be parsed as JSON
 * This allows main table to stay simple (flat columns),
 * and expandable section to show nested JSON in tables.
 * @param {object} properties raw obj.properties retrieved from GET workflows API.
 * @returns {{simpleProperties: object, jsonProperties: object}}
 */
const splitProps = (properties) => {
    const simpleProperties = {};
    const jsonProperties = {};

    Object.entries(properties || {}).forEach(([k, v]) => {
        if (v && typeof v === 'object') {
            jsonProperties[k] = v;
            return;
        }
        const parsed = tryParseJson(v);
        if (parsed !== null) {
            jsonProperties[k] = parsed;
            return;
        }
        simpleProperties[k] = v;
    });

    return { simpleProperties, jsonProperties };
};

/**
 * Return the union of keys across an array of objects.
 * Used to build table headers for arrays of JSON objects in the expandable view.
 * Example:
 *  [{a:1,b:2},{b:3,c:4}] -> ["a","b","c"]
 * @param {Array<object>} arr array that contain objects.
 * @returns {Array<string>} unique keys
 */
const getUnionObjectKeys = (arr = []) => {
    const keys = new Set();

    arr.forEach((obj) => {
        if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
            Object.keys(obj).forEach((k) => {
                keys.add(k);
            });
        }
    });

    return Array.from(keys);
};

/**
 * Generate a stable React key for rows inside nested JSON tables.
 * Prefers referenceId/id, otherwise falls back to stringify/index.
 * @param {string} propKey JSON property name.
 * @param {*} item array element.
 * @param {number} idx index fallback.
 * @returns {string} stable key for React rendering.
 */
const stableKey = (propKey, item, idx) => {
    if (item && typeof item === 'object') {
        if (item.referenceId) {
            return `${propKey}:${item.referenceId}`;
        }
        if (item.id) {
            return `${propKey}:${item.id}`;
        }
        try {
            return `${propKey}:${JSON.stringify(item)}`;
        } catch (e) {
            return `${propKey}:obj:${idx}`;
        }
    }
    return `${propKey}:${String(item)}:${idx}`;
};

/**
 * WorkflowApprovalTasks
 * A reusable component to list pending workflow approval tasks for multiple workflow types.
 * - Fetches workflow requests for provided workflow types.
 * - Shows a table with limited dynamic columns (simpleProperties).
 * - Provides search + reload.
 * - Allows approve/reject actions.
 * - Shows expandable row for request details including nested JSON properties.
 */
function WorkflowApprovalTasks({
    workflowTypes,
    title,
    helpLink,
    searchPlaceholder,
    maxColumnsIncludingAction,
    pageStyle,
}) {
    const intl = useIntl();
    const restApi = new API();

    const [data, setData] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [buttonValue, setButtonValue] = useState('');
    const [hasListPermission, setHasListPermission] = useState(true);
    const [errorMessage, setError] = useState(null);
    const [activeReferenceId, setActiveReferenceId] = useState(null);

    /**
     * Fetch workflows for all requested types and normalize into UI-friendly structure.
     * Normalization:
     * - split properties into simpleProperties/jsonProperties
     * - keep referenceId/description/createdTime for table + expandable view
     * @returns {Promise<Array>} list of normalized rows
    */
    function apiCall() {
        const types = Array.isArray(workflowTypes) ? workflowTypes : [];

        // Map each type to a request, then wait for all to resolve
        return Promise.all(types.map((t) => restApi.workflowsGet(t)))
            .then((results) => {
                // Combine multiple workflow lists into a single array for the table
                const combined = results.flatMap((r) => r?.body?.list || []);

                const workflowList = combined.map((obj) => {
                    const { simpleProperties, jsonProperties } = splitProps(obj?.properties || {});

                    return {
                        description: obj.description,
                        referenceId: obj.referenceId,
                        createdTime: obj.createdTime,
                        simpleProperties,
                        jsonProperties,
                        // Keeping original properties if needed for backward compatibility
                        properties: obj.properties,
                    };
                });
                return workflowList;
            })
            .catch((error) => {
                const { status } = error;
                if (status === 401) {
                    setHasListPermission(false);
                } else {
                    Alert.error(intl.formatMessage({
                        id: 'Workflow.Common.apicall.has.errors',
                        defaultMessage: 'Unable to retrieve pending workflow requests',
                    }));
                }
                throw error;
            });
    }

    /**
     * Fetch data and update component state.
     * - Resets existing data and error state
     * - Calls apiCall and stores results in state
    */
    const fetchData = () => {
        setData(null);
        setError(null);

        apiCall()
            .then((localData) => {
                setData(localData);
            })
            .catch((e) => {
                console.error('Unable to fetch data. ', e.message);
                setError(e.message || 'Error occurred');
            });
    };

    /**
     * Initial load + refresh whenever workflowTypes changes.
     */
    useEffect(() => {
        fetchData();
    }, [workflowTypes]);

    /**
     * Approve/reject a workflow request by referenceId.
     * - Disables buttons while in progress
     * - Shows spinner only on clicked button (APPROVED/REJECTED)
     * - Refreshes table after operation
     * @param {string} referenceId Workflow reference ID.
     * @param {'APPROVED'|'REJECTED'} value New status.
     * @returns {Promise<void>}
    */
    const updateStatus = (referenceId, value) => {
        setButtonValue(value);
        setActiveReferenceId(referenceId);

        const body = { status: value, attributes: {}, description: '' };
        setIsUpdating(true);

        if (value === 'APPROVED') {
            body.description = 'Approve workflow request.';
        }
        if (value === 'REJECTED') {
            body.description = 'Reject workflow request.';
        }

        return restApi.updateWorkflow(referenceId, body)
            .then(() => {
                Alert.success(intl.formatMessage({
                    id: 'Workflow.Common.update.success',
                    defaultMessage: 'Workflow status is updated successfully',
                }));
            })
            .catch((error) => {
                const status = error?.status;
                const description = error?.response?.body?.description;

                if (status === 401 && description) {
                    Alert.error(description);
                } else {
                    Alert.error(intl.formatMessage({
                        id: 'Workflow.Common.updateStatus.has.errors',
                        defaultMessage: 'Unable to complete approve/reject process.',
                    }));
                }

                return null;
            })
            .finally(() => {
                setIsUpdating(false);
                setActiveReferenceId(null);
                fetchData();
            });
    };

    /**
     * Client-side filtering based on searchText.
     * If search is empty -> returns original data.
     * If search has text -> matches against description/referenceId/simple/json properties.
     */
    const filteredData = useMemo(() => {
        const query = searchText?.trim().toLowerCase();
        if (!data || !query) return data;

        return data.filter((row) => {
            const searchableString = JSON.stringify([
                row.description,
                row.referenceId,
                row.simpleProperties,
                row.jsonProperties,
            ]).toLowerCase();

            return searchableString.includes(query);
        });
    }, [data, searchText]);

    /**
     * Determine which "simpleProperties" keys should be shown as main table columns.
     * - Uses a Set to keep unique keys (in first-seen order)
     * - Limits number of visible property columns to keep table readable
     */
    const visibleKeys = useMemo(() => {
        const keys = new Set();

        (filteredData ?? []).forEach((row) => {
            Object.keys(row.simpleProperties ?? {}).forEach((k) => {
                keys.add(k);
            });
        });
        const max = Math.max(
            1,
            maxColumnsIncludingAction ?? DEFAULT_MAX_COLUMNS_INCLUDING_ACTION,
        );
        const maxSimple = Math.max(0, max - 1);
        return Array.from(keys).slice(0, maxSimple);
    }, [filteredData, maxColumnsIncludingAction]);

    /**
     * Render inline action buttons (Approve / Reject) for a workflow row.
     * - Uses updateStatus() to call backend
     * - Shows spinner on the clicked action while updating
     */
    const renderInlineActions = (referenceId) => (
        <Box
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                flexWrap: 'nowrap',
            }}
        >
            <Button
                color='success'
                variant='contained'
                size='small'
                onClick={() => updateStatus(referenceId, 'APPROVED')}
                disabled={isUpdating}
            >
                <CheckIcon />
                <FormattedMessage
                    id='Workflow.Common.table.button.approve'
                    defaultMessage='Approve'
                />
                {(isUpdating && activeReferenceId === referenceId && buttonValue === 'APPROVED')
                    && <CircularProgress size={15} />}
            </Button>

            <Button
                color='error'
                variant='contained'
                size='small'
                onClick={() => updateStatus(referenceId, 'REJECTED')}
                disabled={isUpdating}
            >
                <ClearIcon />
                <FormattedMessage
                    id='Workflow.Common.table.button.reject'
                    defaultMessage='Reject'
                />
                {(isUpdating && activeReferenceId === referenceId && buttonValue === 'REJECTED')
                    && <CircularProgress size={15} />}
            </Button>
        </Box>
    );

    /**
     * Render a JSON property value (from jsonProperties).
     * Handles:
     * 1) Array values
     *    - Array of objects -> render as table, columns = union of keys
     *    - Array of primitives -> render as single-column table
     * 2) Object values -> render as 1-row table (keys as headers)
     * 3) Primitive values -> render as plain text
     * @param {string} propKey - The name/label of the property being rendered.
     * @param {any} value - The data value to render (can be a nested object, array, or primitive).
     */
    const renderJsonValue = (propKey, value) => {
        // Case 1: Arrays (either array of objects or primitives)
        if (Array.isArray(value)) {
            let headers = getUnionObjectKeys(value);
            if (propKey === 'updates') {
                headers = ['attributeName', 'current', 'expected'];
            }
            const isArrayOfObjects = headers.length > 0;
            const headerRow = isArrayOfObjects ? headers : [propKey];

            return (
                <Box key={propKey} sx={(theme) => ({ mt: theme.spacing(2) })}>
                    <Typography variant='h6' component='div'>
                        {toTitleCase(propKey)}
                    </Typography>

                    {value.length === 0 ? (
                        <Typography
                            variant='body2'
                            component='div'
                            sx={(theme) => ({ mt: theme.spacing(1) })}
                        >
                            <FormattedMessage
                                id='Workflow.Common.expand.no.data'
                                defaultMessage='No data to display.'
                            />
                        </Typography>
                    ) : (
                        <>
                            {/* If array of objects → show in table */}
                            {isArrayOfObjects ? (
                                <TableContainer sx={(theme) => ({ mt: theme.spacing(1) })}>
                                    <Table size='small' aria-label={propKey}>
                                        <TableHead>
                                            <TableRow>
                                                {headerRow.map((h) => (
                                                    <TableCell key={`${propKey}:hdr:${h}`}>
                                                        <strong>{toTitleCase(h)}</strong>
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {value.map((item, idx) => {
                                                const rowKey = stableKey(propKey, item, idx);
                                                return (
                                                    <TableRow key={rowKey}>
                                                        {headerRow.map((h) => (
                                                            <TableCell
                                                                key={`${rowKey}:${h}`}
                                                                sx={{
                                                                    color: propKey === 'updates' && h === 'current'
                                                                        ? 'text.disabled'
                                                                        : 'inherit',
                                                                }}
                                                            >
                                                                {toText(item ? item[h] : null)}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                /* Primitive array → show as a list */
                                <Box sx={{ mt: 1 }}>
                                    {value.map((item, idx) => (
                                        <Typography
                                            key={stableKey(propKey, item, idx)}
                                            variant='body2'
                                        >
                                            •
                                            {' '}
                                            {toText(item)}
                                        </Typography>
                                    ))}
                                </Box>
                            )}
                        </>
                    )}
                </Box>
            );
        }

        // Case 2: Plain object -> display as a 1-row table (keys are headers)
        if (value && typeof value === 'object') {
            const keys = Object.keys(value);

            return (
                <Box key={propKey} sx={(theme) => ({ mt: theme.spacing(2) })}>
                    <Typography variant='h6' component='div'>
                        {toTitleCase(propKey)}
                    </Typography>
                    <TableContainer sx={(theme) => ({ mt: theme.spacing(1) })}>
                        <Table size='small' aria-label={propKey}>
                            <TableHead>
                                <TableRow>
                                    {keys.map((k) => (
                                        <TableCell key={`${propKey}:hdr:${k}`}>
                                            <strong>{toTitleCase(k)}</strong>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    {keys.map((k) => (
                                        <TableCell key={`${propKey}:cell:${k}`}>
                                            {toText(value[k])}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            );
        }

        // Case 3: Primitive -> display as plain text
        return (
            <Box key={propKey} sx={(theme) => ({ mt: theme.spacing(2) })}>
                <Typography variant='h6' component='div'>
                    {toTitleCase(propKey)}
                </Typography>
                <Typography
                    variant='body2'
                    component='div'
                    sx={(theme) => ({ mt: theme.spacing(1) })}
                >
                    {toText(value)}
                </Typography>
            </Box>
        );
    };

    /**
     * Build MUIDataTable columns dynamically:
     * - "description" (hidden, used mainly for search/metadata)
     * - one column per visible simpleProperties key
     * - "action" column with approve/reject buttons
     */
    const columns = useMemo(() => {
        const cols = [
            {
                name: 'description',
                label: intl.formatMessage({
                    id: 'Workflow.Common.table.header.description',
                    defaultMessage: 'Description',
                }),
                options: { sort: false, display: false },
            },
        ];

        visibleKeys.forEach((key) => {
            cols.push({
                name: key,
                label: toTitleCase(key),
                options: {
                    sort: false,
                    filter: true,
                    customBodyRender: (value, tableMeta) => {
                        const row = filteredData[tableMeta.rowIndex];
                        return toText(row?.simpleProperties?.[key]);
                    },
                },
            });
        });

        cols.push({
            name: 'action',
            label: intl.formatMessage({
                id: 'Workflow.Common.table.header.action',
                defaultMessage: 'Action',
            }),
            options: {
                sort: false,
                filter: false,
                setCellProps: () => ({
                    style: {
                        whiteSpace: 'nowrap',
                        width: '1%',
                    },
                }),
                setCellHeaderProps: () => ({
                    style: {
                        whiteSpace: 'nowrap',
                    },
                }),
                customBodyRender: (value, tableMeta) => {
                    const row = filteredData[tableMeta.rowIndex];
                    return renderInlineActions(row.referenceId);
                },
            },
        });

        return cols;
    }, [filteredData, intl, visibleKeys]);

    /**
     * Page-level props passed to ContentBase/WarningBase.
     * Includes optional help link section.
     */
    const pageProps = {
        help: helpLink ? (
            <HelpBase>
                <List component='nav' aria-label='help'>
                    <ListItem button>
                        <ListItemIcon>
                            <DescriptionIcon />
                        </ListItemIcon>
                        <Link
                            target='_blank'
                            rel='noopener noreferrer'
                            href={helpLink}
                            underline='hover'
                        >
                            <ListItemText
                                primary={(
                                    <FormattedMessage
                                        id='Workflow.Common.help.link.one'
                                        defaultMessage='Learn more about workflows'
                                    />
                                )}
                            />
                        </Link>
                    </ListItem>
                </List>
            </HelpBase>
        ) : null,
        pageStyle: pageStyle || 'half',
        title,
    };

    /**
     * MUIDataTable options:
     * - enables expandable rows to show request details
     */
    const options = {
        filterType: 'checkbox',
        selectableRows: 'none',
        filter: false,
        search: false,
        print: false,
        download: false,
        viewColumns: false,
        customToolbar: null,
        responsive: 'vertical',
        expandableRows: true,
        renderExpandableRow: (rowData, rowMeta) => {
            const row = filteredData[rowMeta.dataIndex];

            const createdFromNow = row?.createdTime ? dayjs(row.createdTime).fromNow() : 'N/A';
            const createdFormat = row?.createdTime ? dayjs(row.createdTime).format('LLL') : '';

            // Show attributes which are not already visible in the main table as columns
            const remainingSimpleEntries = Object.entries(row.simpleProperties || {})
                .filter(([k]) => !visibleKeys.includes(k));

            const jsonEntries = Object.entries(row.jsonProperties || {});

            return (
                <TableRow>
                    <TableCell
                        sx={(theme) => ({
                            p: theme.spacing(2),
                            borderBottom: 'none',
                        })}
                        colSpan={rowData.length + 1}
                    >
                        <Box sx={(theme) => ({ py: theme.spacing(1) })}>
                            <Typography variant='h6'>
                                <FormattedMessage
                                    id='Workflow.Common.expand.title'
                                    defaultMessage='Request Details'
                                />
                            </Typography>

                            <Box sx={(theme) => ({ mt: theme.spacing(1) })}>

                                <Typography variant='body2' sx={{ mt: 1 }}>
                                    <strong>Description: </strong>
                                    {toText(row?.description)}
                                </Typography>

                                <Typography variant='body2' sx={{ mt: 1 }}>
                                    <strong>Created: </strong>
                                    {row?.createdTime ? (
                                        <Tooltip title={createdFormat}>
                                            <span>{createdFromNow}</span>
                                        </Tooltip>
                                    ) : (
                                        'N/A'
                                    )}
                                </Typography>

                                {remainingSimpleEntries.map(([k, v]) => (
                                    <Typography
                                        key={k}
                                        variant='body2'
                                        sx={{ mt: 1 }}
                                    >
                                        <strong>
                                            {toTitleCase(k)}
                                            :
                                        </strong>
                                        {' '}
                                        {toText(v)}
                                    </Typography>
                                ))}
                            </Box>

                            {jsonEntries.map(([k, v]) => renderJsonValue(k, v))}
                        </Box>
                    </TableCell>
                </TableRow>
            );
        },
        textLabels: {
            body: {
                noMatch: intl.formatMessage({
                    id: 'Mui.data.table.search.no.records.found',
                    defaultMessage: 'Sorry, no matching records found',
                }),
            },
            pagination: {
                rowsPerPage: intl.formatMessage({
                    id: 'Mui.data.table.pagination.rows.per.page',
                    defaultMessage: 'Rows per page:',
                }),
                displayRows: intl.formatMessage({
                    id: 'Mui.data.table.pagination.display.rows',
                    defaultMessage: 'of',
                }),
            },
        },
    };

    if (data && data.length === 0) {
        return (
            <ContentBase {...pageProps} pageStyle='small'>
                <Card>
                    <CardContent>
                        <Typography gutterBottom variant='h5' component='h2'>
                            {title}
                        </Typography>
                        <Typography variant='body2' color='textSecondary' component='p'>
                            <FormattedMessage
                                id='Workflow.Common.List.empty.content'
                                defaultMessage='There are no pending workflow requests.'
                            />
                        </Typography>
                    </CardContent>
                    <CardActions>
                        <span />
                    </CardActions>
                </Card>
            </ContentBase>
        );
    }

    if (!hasListPermission) {
        return (
            <WarningBase
                pageProps={pageProps}
                title={(
                    <FormattedMessage
                        id='Workflow.Common.permission.denied.title'
                        defaultMessage='Permission Denied'
                    />
                )}
                content={(
                    <FormattedMessage
                        id='Workflow.Common.permission.denied.content'
                        defaultMessage={`You don't have enough permissions to view Approval Tasks.
                            Please contact the site administrator.`}
                    />
                )}
            />
        );
    }

    if (!errorMessage && !data) {
        return (
            <ContentBase pageStyle='paperLess'>
                <InlineProgress />
            </ContentBase>
        );
    }

    if (errorMessage) {
        return (
            <ContentBase {...pageProps}>
                <MUIAlert severity='error'>{errorMessage}</MUIAlert>
            </ContentBase>
        );
    }

    // Main table
    return (
        <ContentBase {...pageProps}>
            {/* Search / Reload bar */}
            <AppBar position='static' color='default' elevation={0}>
                <Toolbar>
                    <Grid container spacing={2} alignItems='center'>
                        <Grid item>
                            <SearchIcon color='inherit' />
                        </Grid>
                        <Grid item xs>
                            <TextField
                                variant='standard'
                                fullWidth
                                placeholder={searchPlaceholder}
                                sx={(theme) => ({
                                    '& .search-input': {
                                        fontSize: theme.typography.fontSize,
                                    },
                                })}
                                InputProps={{
                                    disableUnderline: true,
                                    className: 'search-input',
                                }}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </Grid>
                        <Grid item>
                            <Tooltip
                                title={(
                                    <FormattedMessage
                                        id='SubscriptionApproval.Addons.ListBase.reload'
                                        defaultMessage='Reload'
                                    />
                                )}
                            >
                                <IconButton onClick={fetchData} size='large'>
                                    <RefreshIcon color='inherit' />
                                </IconButton>
                            </Tooltip>
                        </Grid>
                    </Grid>
                </Toolbar>
            </AppBar>

            {/* Table */}
            {filteredData && filteredData.length > 0 && (
                <MUIDataTable
                    title={null}
                    data={filteredData}
                    columns={columns}
                    options={options}
                />
            )}

            {filteredData && filteredData.length === 0 && (
                <div>
                    <Typography color='textSecondary' align='center'>
                        <FormattedMessage
                            id='Workflow.SubscriptionCreation.ListBase.nodata.message'
                            defaultMessage='No items yet'
                        />
                    </Typography>
                </div>
            )}
        </ContentBase>
    );
}

WorkflowApprovalTasks.defaultProps = {
    helpLink: null,
    searchPlaceholder: 'Search by Description, IDs, Properties etc',
    maxColumnsIncludingAction: DEFAULT_MAX_COLUMNS_INCLUDING_ACTION,
    pageStyle: 'half',
};

WorkflowApprovalTasks.propTypes = {
    workflowTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
    title: PropTypes.node.isRequired,
    helpLink: PropTypes.string,
    searchPlaceholder: PropTypes.string,
    maxColumnsIncludingAction: PropTypes.number,
    pageStyle: PropTypes.string,
};

export default WorkflowApprovalTasks;
