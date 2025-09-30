/*
 *  Copyright (c) 2025, WSO2 LLC. (https://www.wso2.org) All Rights Reserved.
 *
 *  WSO2 LLC. licenses this file to you under the Apache License,
 *  Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from 'AppComponents/Shared/Alert';
import API from 'AppData/api';
import { FormattedMessage, useIntl } from 'react-intl';
import MUIDataTable from 'mui-datatables';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Box from '@mui/material/Box';
import { Chip } from '@mui/material';

dayjs.extend(relativeTime);

/**
 * ListGatewayInstances component displays a dialog with a table of live gateway instances
 * for a given environment. It fetches gateway data from the API when opened and shows
 * loading, error, or the list of gateways with their status and last active time.
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {function} props.onClose - Callback to close the dialog
 * @param {string} props.environmentId - The ID of the environment to fetch gateways for
 * @param {string} props.environmentName - The name of the environment (for display in the dialog title)
 *
 * @returns {JSX.Element} Dialog containing a table of gateway instances
 */

export default function ListGatewayInstances({
    open,
    onClose,
    environmentId,
    environmentName,
}) {
    const intl = useIntl();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [gateways, setGateways] = useState([]);

    const statusColors = {
        ACTIVE: 'success',
        EXPIRED: 'error',
    };

    const needsEncoding = (str) => /[^A-Za-z0-9]/.test(str);

    const fetchData = () => {
        setLoading(true);
        setError(null);
        setGateways([]);
        const restApi = new API();
        // Encode the environment ID if it contains special characters
        let encodedEnvId = environmentId;
        if (needsEncoding(environmentId)) {
            encodedEnvId = btoa(environmentId);
        }
        restApi.getEnvironmentGateways(encodedEnvId)
            .then((result) => {
                if (result.body && Array.isArray(result.body.list)) {
                    setGateways(result.body.list);
                } else {
                    setGateways([]);
                }
            })
            .catch((err) => {
                setError(err?.message || 'Failed to fetch gateway instances');
                Alert.error(err?.message || 'Failed to fetch gateway instances');
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (open && environmentId) {
            fetchData();
        }
    }, [open, environmentId]);

    const columns = [
        {
            name: 'gatewayId',
            label: intl.formatMessage({
                id: 'AdminPages.Gateways.GatewayInstances.table.header.gatewayID',
                defaultMessage: 'Gateway ID',
            }),
            options: { filter: false, sort: true },
        },
        {
            name: 'lastActive',
            label: intl.formatMessage({
                id: 'AdminPages.Gateways.GatewayInstances.table.header.lastActive',
                defaultMessage: 'Last Active',
            }),
            options: {
                filter: false,
                sort: true,
                customBodyRender: (value) => (value ? dayjs(value).fromNow() : '-'),
            },
        },
        {
            name: 'status',
            label: intl.formatMessage({
                id: 'AdminPages.Gateways.GatewayInstances.table.header.status',
                defaultMessage: 'Status',
            }),
            options: {
                filter: true,
                sort: true,
                customBodyRender: (value) => (
                    <Chip label={value} color={statusColors[value] || 'default'} variant='outlined' size='small' />
                ),
            },
        },
    ];

    const options = {
        filterType: 'checkbox',
        selectableRows: 'none',
        filter: true,
        search: true,
        print: false,
        download: false,
        viewColumns: false,
        customToolbar: false,
        responsive: 'stacked',
        sortOrder: {
            name: 'lastActive',
            direction: 'desc',
        },
        textLabels: {
            body: {
                noMatch: intl.formatMessage({
                    id: 'AdminPages.Gateways.GatewayInstances.table.no.records.found',
                    defaultMessage: 'No live gateway instances found for this environment.',
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

    return (
        <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
            <DialogTitle>
                <FormattedMessage
                    id='AdminPages.Gateways.GatewayInstances.dialog.title'
                    defaultMessage='Gateways in {env} Environment'
                    values={{ env: environmentName }}
                />
            </DialogTitle>
            <DialogContent>
                {loading && <CircularProgress />}
                {error && (
                    <Typography color='error' variant='body2'>
                        {error}
                    </Typography>
                )}
                {!loading && !error && (
                    <Box px={3}>
                        <MUIDataTable
                            title={null}
                            data={gateways}
                            columns={columns}
                            options={options}
                        />
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>
                    <FormattedMessage
                        id='AdminPages.Gateways.GatewayInstances.dialog.close'
                        defaultMessage='Close'
                    />
                </Button>
            </DialogActions>
        </Dialog>
    );
}

ListGatewayInstances.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    environmentId: PropTypes.string,
    environmentName: PropTypes.string,
};
ListGatewayInstances.defaultProps = {
    environmentId: '',
    environmentName: '',
};
