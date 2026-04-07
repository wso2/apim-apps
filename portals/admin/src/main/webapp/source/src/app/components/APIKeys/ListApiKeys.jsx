/*
 * Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com/).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { useState, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    Alert as AlertMui,
    AppBar,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    TableCell,
    TextField,
    Tooltip,
    Toolbar,
    Typography,
    styled,
} from '@mui/material';
import Block from '@mui/icons-material/Block';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import MUIDataTable from 'mui-datatables';
import API from 'AppData/api';
import ContentBase from 'AppComponents/AdminPages/Addons/ContentBase';
import InlineProgress from 'AppComponents/AdminPages/Addons/InlineProgress';

const typeChipSx = {
    fontWeight: 600,
    textTransform: 'uppercase',
    fontSize: '0.7rem',
};

const styles = {
    searchBar: {
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
    },
    block: {
        display: 'block',
    },
    contentWrapper: {
        margin: '40px 16px',
    },
    tableCellWrapper: {
        '& td': {
            'word-break': 'break-all',
            'white-space': 'normal',
        },
    },
};

const StyledDiv = styled('div')({});

export default function ApiKeysView() {
    const intl = useIntl();
    const [isRevoking, setIsRevoking] = useState(false);
    const [apiKeys, setApiKeys] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState(null);

    // Revoke dialog state
    const [revokeConfirmOpen, setRevokeConfirmOpen] = useState(false);
    const [revokeSuccessOpen, setRevokeSuccessOpen] = useState(false);
    const [revokeErrorOpen, setRevokeErrorOpen] = useState(false);
    const [revokeErrorMessage, setRevokeErrorMessage] = useState('');
    const [selectedKeyForRevoke, setSelectedKeyForRevoke] = useState(null);

    const fetchData = () => {
        setApiKeys(null);
        setError(null);
        const restApi = new API();
        restApi.getAllAPIKeys()
            .then((result) => {
                setApiKeys(result.body.list || result.body);
            })
            .catch((e) => {
                setError(
                    (e && e.message)
                    || intl.formatMessage({
                        id: 'APIKeys.ListApiKeys.error.retrieving.data',
                        defaultMessage: 'Error while retrieving data.',
                    }),
                );
                setApiKeys([]);
            });
    };

    /**
     * Load all API keys on mount
     */
    useEffect(() => {
        fetchData();
    }, []);

    const refreshApiKeys = () => {
        fetchData();
    };

    const handleRevokeKey = (keyData) => {
        setSelectedKeyForRevoke(keyData);
        setRevokeConfirmOpen(true);
    };

    const handleConfirmRevoke = () => {
        if (!selectedKeyForRevoke?.keyUUID || isRevoking) {
            return;
        }
        if (!selectedKeyForRevoke?.keyUUID) {
            setRevokeErrorMessage(intl.formatMessage({
                id: 'APIKeys.ListApiKeys.error.no.key.selected.for.revoke',
                defaultMessage: 'No API key selected for revoke.',
            }));
            setRevokeErrorOpen(true);
            return;
        }
        setRevokeConfirmOpen(false);
        setIsRevoking(true);
        const restApi = new API();
        restApi.revokeAPIKeyFromAdmin(selectedKeyForRevoke.keyUUID)
            .then(() => {
                setRevokeSuccessOpen(true);
                refreshApiKeys();
            })
            .catch((e) => {
                console.error('Error revoking key:', e);
                setRevokeErrorMessage(
                    (e.response && e.response.body && e.response.body.description)
                        || e.message
                        || intl.formatMessage({
                            id: 'APIKeys.ListApiKeys.error.revoke.failed',
                            defaultMessage: 'Failed to revoke API key. Please try again.',
                        }),
                );
                setRevokeErrorOpen(true);
            })
            .finally(() => {
                setIsRevoking(false);
            });
    };

    const handleCancelRevoke = () => {
        setRevokeConfirmOpen(false);
        setSelectedKeyForRevoke(null);
    };

    const filteredKeys = (apiKeys || []).filter((row) => {
        const q = searchQuery.toLowerCase();
        return (
            (row.keyName || '').toLowerCase().includes(q)
            || (row.applicationName || '').toLowerCase().includes(q)
            || (row.apiName || '').toLowerCase().includes(q)
            || (row.keyType || '').toLowerCase().includes(q)
            || (row.user || '').toLowerCase().includes(q)
        );
    });

    const columns = [
        {
            name: 'keyName',
            label: intl.formatMessage({
                id: 'APIKeys.ListApiKeys.column.api.key',
                defaultMessage: 'API Key',
            }),
        },
        {
            name: 'applicationName',
            label: intl.formatMessage({
                id: 'APIKeys.ListApiKeys.column.application',
                defaultMessage: 'Application',
            }),
            options: {
                customBodyRenderLite: (dataIndex) => {
                    const app = filteredKeys[dataIndex].applicationName;
                    return app
                        ? <Chip label={app} size='small' className='keys-chip' />
                        : <Typography variant='body2' color='text.secondary'>-</Typography>;
                },
            },
        },
        {
            name: 'apiName',
            label: intl.formatMessage({
                id: 'APIKeys.ListApiKeys.column.api',
                defaultMessage: 'API',
            }),
            options: {
                customBodyRenderLite: (dataIndex) => {
                    const api = filteredKeys[dataIndex].apiName;
                    return api
                        ? <Chip label={api} size='small' className='keys-chip' />
                        : <Typography variant='body2' color='text.secondary'>-</Typography>;
                },
            },
        },
        {
            name: 'keyType',
            label: intl.formatMessage({
                id: 'APIKeys.ListApiKeys.column.type',
                defaultMessage: 'Type',
            }),
            options: {
                customBodyRenderLite: (dataIndex) => {
                    const { keyType } = filteredKeys[dataIndex];
                    let keyTypeLabel = keyType;
                    if (keyType === 'PRODUCTION') {
                        keyTypeLabel = intl.formatMessage({
                            id: 'APIKeys.ListApiKeys.key.type.production',
                            defaultMessage: 'Production',
                        });
                    } else if (keyType === 'SANDBOX') {
                        keyTypeLabel = intl.formatMessage({
                            id: 'APIKeys.ListApiKeys.key.type.sandbox',
                            defaultMessage: 'Sandbox',
                        });
                    }
                    return (
                        <Chip
                            label={keyTypeLabel}
                            size='small'
                            sx={{
                                ...typeChipSx,
                                backgroundColor: '#F2F4F7',
                                color: '#475467',
                            }}
                        />
                    );
                },
            },
        },
        {
            name: 'user',
            label: intl.formatMessage({
                id: 'APIKeys.ListApiKeys.column.user',
                defaultMessage: 'User',
            }),
        },
        {
            name: 'issuedOn',
            label: intl.formatMessage({
                id: 'APIKeys.ListApiKeys.column.issued.on',
                defaultMessage: 'Issued On',
            }),
            options: {
                customBodyRenderLite: (dataIndex) => {
                    const { issuedOn } = filteredKeys[dataIndex];
                    if (!issuedOn) return '-';
                    try {
                        const date = new Date(issuedOn);
                        return (
                            <Tooltip title={date.toLocaleString()} placement='top'>
                                <Typography variant='body2'>
                                    {date.toLocaleDateString('en-CA')}
                                </Typography>
                            </Tooltip>
                        );
                    } catch (e) {
                        return issuedOn;
                    }
                },
            },
        },
        {
            name: 'validityPeriod',
            label: intl.formatMessage({
                id: 'APIKeys.ListApiKeys.column.expires.on',
                defaultMessage: 'Expires On',
            }),
            options: {
                customBodyRenderLite: (dataIndex) => {
                    const { issuedOn, validityPeriod } = filteredKeys[dataIndex];
                    if (validityPeriod === -1) {
                        return (
                            <Typography variant='body2' color='text.secondary'>
                                <FormattedMessage
                                    id='APIKeys.ListApiKeys.value.never'
                                    defaultMessage='Never'
                                />
                            </Typography>
                        );
                    }
                    try {
                        const expires = new Date(new Date(issuedOn).getTime() + validityPeriod * 1000);
                        return (
                            <Tooltip title={expires.toLocaleString()} placement='top'>
                                <Typography variant='body2'>
                                    {expires.toLocaleDateString('en-CA')}
                                </Typography>
                            </Tooltip>
                        );
                    } catch (e) {
                        return '-';
                    }
                },
            },
        },
        {
            name: 'lastUsed',
            label: intl.formatMessage({
                id: 'APIKeys.ListApiKeys.column.last.used.on',
                defaultMessage: 'Last Used On',
            }),
            options: {
                customBodyRenderLite: (dataIndex) => {
                    const { lastUsed } = filteredKeys[dataIndex];
                    if (!lastUsed || lastUsed === 'NOT_USED') {
                        return (
                            <Typography variant='body2' color='text.secondary'>
                                <FormattedMessage
                                    id='APIKeys.ListApiKeys.value.never'
                                    defaultMessage='Never'
                                />
                            </Typography>
                        );
                    }
                    try {
                        const date = new Date(lastUsed);
                        return (
                            <Tooltip title={date.toLocaleString()} placement='top'>
                                <Typography variant='body2'>
                                    {date.toLocaleDateString('en-CA')}
                                </Typography>
                            </Tooltip>
                        );
                    } catch (e) {
                        return lastUsed;
                    }
                },
            },
        },
        {
            name: 'actions',
            label: intl.formatMessage({
                id: 'APIKeys.ListApiKeys.column.actions',
                defaultMessage: 'Actions',
            }),
            options: {
                sort: false,
                filter: false,
                setCellHeaderProps: () => ({ align: 'right' }),
                setCellProps: () => ({ align: 'right' }),
                customHeadRender: () => (
                    <TableCell align='right' className='keys-header'>
                        <FormattedMessage
                            id='APIKeys.ListApiKeys.column.actions'
                            defaultMessage='Actions'
                        />
                    </TableCell>
                ),
                customBodyRenderLite: (dataIndex) => {
                    const keyData = filteredKeys[dataIndex];
                    return (
                        <Button
                            variant='outlined'
                            size='small'
                            color='error'
                            startIcon={<Block />}
                            onClick={() => handleRevokeKey(keyData)}
                        >
                            <FormattedMessage
                                id='APIKeys.ListApiKeys.action.revoke'
                                defaultMessage='Revoke'
                            />
                        </Button>
                    );
                },
            },
        },
    ];

    const options = {
        selectableRows: 'none',
        filter: false,
        search: false,
        download: false,
        print: false,
        viewColumns: false,
        pagination: false,
        sort: false,
        responsive: 'standard',
        tableBodyMaxHeight: '520px',
        textLabels: {
            body: {
                noMatch: intl.formatMessage({
                    id: 'Mui.data.table.search.no.records.found',
                    defaultMessage: 'Sorry, no matching records found',
                }),
            },
        },
    };

    const pageProps = {
        pageStyle: 'paperLess',
        title: intl.formatMessage({
            id: 'APIKeys.ListApiKeys.title',
            defaultMessage: 'API Keys',
        }),
    };

    if (!error && apiKeys === null) {
        return (
            <ContentBase pageStyle='paperLess'>
                <InlineProgress />
            </ContentBase>
        );
    }

    if (error) {
        return (
            <ContentBase {...pageProps}>
                <AlertMui severity='error'>{error}</AlertMui>
            </ContentBase>
        );
    }

    return (
        <>
            <ContentBase {...pageProps}>
                <div>
                    <AppBar sx={styles.searchBar} position='static' color='default' elevation={0}>
                        <Toolbar>
                            <Grid container spacing={2} alignItems='center'>
                                <Grid item>
                                    <SearchIcon sx={styles.block} color='inherit' />
                                </Grid>
                                <Grid item xs>
                                    <TextField
                                        fullWidth
                                        variant='standard'
                                        placeholder={intl.formatMessage({
                                            id: 'APIKeys.ListApiKeys.search.placeholder',
                                            defaultMessage: 'Search by key, application, API, type, or user...',
                                        })}
                                        sx={(theme) => ({
                                            '& .search-input': {
                                                fontSize: theme.typography.fontSize,
                                            },
                                        })}
                                        InputProps={{
                                            disableUnderline: true,
                                            className: 'search-input',
                                        }}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        value={searchQuery}
                                    />
                                </Grid>
                                <Grid item>
                                    <Tooltip
                                        title={(
                                            <FormattedMessage
                                                id='AdminPages.Addons.ListBase.reload'
                                                defaultMessage='Reload'
                                            />
                                        )}
                                    >
                                        <IconButton onClick={fetchData}>
                                            <RefreshIcon sx={styles.block} color='inherit' />
                                        </IconButton>
                                    </Tooltip>
                                </Grid>
                            </Grid>
                        </Toolbar>
                    </AppBar>
                    <StyledDiv sx={styles.tableCellWrapper}>
                        <MUIDataTable
                            title={null}
                            data={filteredKeys}
                            columns={columns}
                            options={options}
                        />
                    </StyledDiv>
                    {filteredKeys.length === 0 && (
                        <StyledDiv sx={styles.contentWrapper}>
                            <Typography color='textSecondary' align='center'>
                                <FormattedMessage
                                    id='APIKeys.ListApiKeys.no.matching.items'
                                    defaultMessage='No matching API keys found'
                                />
                            </Typography>
                        </StyledDiv>
                    )}
                </div>
            </ContentBase>

            {/* Revoke Confirmation Dialog */}
            <Dialog open={revokeConfirmOpen} onClose={handleCancelRevoke} maxWidth='xs' fullWidth>
                <DialogTitle>
                    <FormattedMessage
                        id='APIKeys.ListApiKeys.revoke.confirm.title'
                        defaultMessage='Confirm Revoke'
                    />
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        <FormattedMessage
                            id='APIKeys.ListApiKeys.revoke.confirm.message.prefix'
                            defaultMessage='Are you sure you want to revoke the API key'
                        />
                        {' '}
                        <strong>{selectedKeyForRevoke?.keyName}</strong>
                        {' '}
                        <FormattedMessage
                            id='APIKeys.ListApiKeys.revoke.confirm.message.suffix'
                            defaultMessage='? This action cannot be undone.'
                        />
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelRevoke}>
                        <FormattedMessage
                            id='APIKeys.ListApiKeys.revoke.cancel'
                            defaultMessage='Cancel'
                        />
                    </Button>
                    <Button onClick={handleConfirmRevoke} variant='contained' color='error' disabled={isRevoking}>
                        <FormattedMessage
                            id='APIKeys.ListApiKeys.revoke.confirm.button'
                            defaultMessage='Revoke'
                        />
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Revoke Success Dialog */}
            <Dialog
                open={revokeSuccessOpen}
                onClose={() => { setRevokeSuccessOpen(false); setSelectedKeyForRevoke(null); }}
                maxWidth='xs'
                fullWidth
            >
                <DialogTitle>
                    <FormattedMessage
                        id='APIKeys.ListApiKeys.revoke.success.title'
                        defaultMessage='API Key Revoked'
                    />
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        <FormattedMessage
                            id='APIKeys.ListApiKeys.revoke.success.message'
                            defaultMessage='The API key has been successfully revoked.'
                        />
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => { setRevokeSuccessOpen(false); setSelectedKeyForRevoke(null); }}
                        variant='contained'
                    >
                        <FormattedMessage
                            id='APIKeys.ListApiKeys.common.ok'
                            defaultMessage='OK'
                        />
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Revoke Error Dialog */}
            <Dialog
                open={revokeErrorOpen}
                onClose={() => { setRevokeErrorOpen(false); setSelectedKeyForRevoke(null); }}
                maxWidth='xs'
                fullWidth
            >
                <DialogTitle>
                    <FormattedMessage
                        id='APIKeys.ListApiKeys.revoke.error.title'
                        defaultMessage='Revoke Failed'
                    />
                </DialogTitle>
                <DialogContent>
                    <Typography>{revokeErrorMessage}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => { setRevokeErrorOpen(false); setSelectedKeyForRevoke(null); }}
                        variant='contained'
                    >
                        <FormattedMessage
                            id='APIKeys.ListApiKeys.common.ok'
                            defaultMessage='OK'
                        />
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
