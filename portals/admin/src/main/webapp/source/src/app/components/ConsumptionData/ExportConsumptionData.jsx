/*
 * Copyright (c) 2026, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React, { useState } from 'react';
import { useIntl } from 'react-intl';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';
import GetAppIcon from '@mui/icons-material/GetApp';
import DescriptionIcon from '@mui/icons-material/Description';
import Alert from 'AppComponents/Shared/Alert';
import ContentBase from 'AppComponents/AdminPages/Addons/ContentBase';
import HelpBase from 'AppComponents/AdminPages/Addons/HelpBase';
import API from 'AppData/api';

/**
 * Format a Date object to a YYYY-MM-DD string for use in date inputs.
 * @param {Date} date - Date to format.
 * @returns {string} Formatted date string.
 */
function toInputDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Generate the "from" date string for a given number of months back from today.
 * @param {number} months - Number of months to go back.
 * @returns {string} Formatted YYYY-MM-DD string.
 */
function monthsAgo(months) {
    const d = new Date();
    d.setMonth(d.getMonth() - months);
    return toInputDateString(d);
}

/**
 * Format a YYYY-MM-DD date string into a human-readable localized date.
 * @param {string} dateStr - ISO date string.
 * @returns {string} Localized date string.
 */
function formatDisplayDate(dateStr) {
    if (!dateStr) return '';
    return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

const QUICK_RANGES = [
    { label: 'Last 3 Months', months: 3 },
    { label: 'Last 6 Months', months: 6 },
    { label: 'Last 12 Months', months: 12 },
];

/**
 * Consumption Data page — lets the admin select a date range and export
 * the consumption report as a zip file.
 *
 * @returns {JSX} Page component.
 */
export default function ExportConsumptionData() {
    const intl = useIntl();

    const today = toInputDateString(new Date());
    const defaultFrom = monthsAgo(3);

    const [fromDate, setFromDate] = useState(defaultFrom);
    const [toDate, setToDate] = useState(today);
    const [activeQuickRange, setActiveQuickRange] = useState(3);
    const [loading, setLoading] = useState(false);

    const handleQuickRange = (months) => {
        const from = monthsAgo(months);
        const to = toInputDateString(new Date());
        setFromDate(from);
        setToDate(to);
        setActiveQuickRange(months);
    };

    const handleCustomRange = () => {
        setActiveQuickRange('custom');
    };

    const handleFromChange = (e) => {
        setFromDate(e.target.value);
    };

    const handleToChange = (e) => {
        setToDate(e.target.value);
    };

    const handleExport = () => {
        setLoading(true);
        const restApi = new API();
        restApi
            .exportConsumptionData(fromDate, toDate)
            .then((response) => {
                const url = URL.createObjectURL(response.data);
                const link = document.createElement('a');
                link.setAttribute('href', url);
                link.setAttribute('download', `consumption-report_${fromDate}_to_${toDate}.zip`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                Alert.success(intl.formatMessage({
                    id: 'ConsumptionTracking.success.export',
                    defaultMessage: 'Export started — your download should begin shortly.',
                }));
            })
            .catch((err) => {
                Alert.error(
                    err.message || intl.formatMessage({
                        id: 'ConsumptionTracking.error.export',
                        defaultMessage: 'Failed to export consumption data.',
                    }),
                );
            })
            .finally(() => setLoading(false));
    };

    const helpContent = (
        <HelpBase>
            <List dense>
                <ListItem>
                    <ListItemIcon>
                        <DescriptionIcon />
                    </ListItemIcon>
                    <ListItemText
                        primary={intl.formatMessage({
                            id: 'ConsumptionTracking.help.line1',
                            defaultMessage: 'Select a date range using the quick options or custom date pickers.',
                        })}
                    />
                </ListItem>
                <ListItem>
                    <ListItemIcon>
                        <DescriptionIcon />
                    </ListItemIcon>
                    <ListItemText
                        primary={intl.formatMessage({
                            id: 'ConsumptionTracking.help.line2',
                            defaultMessage: 'Click Export to download the consumption data as a zip file.',
                        })}
                    />
                </ListItem>
            </List>
        </HelpBase>
    );

    return (
        <ContentBase
            title={intl.formatMessage({
                id: 'ConsumptionTracking.title',
                defaultMessage: 'Consumption Data',
            })}
            pageDescription={intl.formatMessage({
                id: 'ConsumptionTracking.description',
                defaultMessage: 'Download consumption data for a selected date range.'
                    + 'The report is exported as a zip file directly to your device.',
            })}
            pageStyle='small'
            help={helpContent}
        >
            {/* ── Card ──────────────────────────────────────────── */}
            <Card>
                <CardContent>
                    <Typography gutterBottom variant='h5' component='h2'>
                        {intl.formatMessage({
                            id: 'ConsumptionTracking.card.title',
                            defaultMessage: 'Export Consumption Data',
                        })}
                    </Typography>
                    <Typography variant='body2' color='textSecondary' component='p'>
                        {intl.formatMessage({
                            id: 'ConsumptionTracking.card.description',
                            defaultMessage: 'Select a predefined date range or specify a custom range'
                                + 'to export the consumption data as a zip file.',
                        })}
                    </Typography>

                    {/* Range selector row */}
                    <Box mt={3}>
                        <ButtonGroup variant='outlined' color='primary' size='small'>
                            {QUICK_RANGES.map(({ label, months }) => (
                                <Button
                                    key={months}
                                    sx={activeQuickRange === months ? {
                                        backgroundColor: 'primary.main',
                                        color: 'primary.contrastText',
                                        padding: '8.5px 10px',
                                        '&:hover': {
                                            backgroundColor: 'primary.dark',
                                        },
                                    } : {
                                        textTransform: 'none',
                                        padding: '8.5px 10px',
                                    }}
                                    onClick={() => handleQuickRange(months)}
                                >
                                    {label}
                                </Button>
                            ))}
                            <Button
                                sx={activeQuickRange === 'custom' ? {
                                    backgroundColor: 'primary.main',
                                    color: 'primary.contrastText',
                                    padding: '8.5px 10px',
                                    '&:hover': {
                                        backgroundColor: 'primary.dark',
                                    },
                                } : {
                                    textTransform: 'none',
                                    padding: '8.5px 10px',
                                }}
                                onClick={handleCustomRange}
                            >
                                {intl.formatMessage({
                                    id: 'ConsumptionTracking.filter.custom',
                                    defaultMessage: 'Custom',
                                })}
                            </Button>
                        </ButtonGroup>
                    </Box>

                    {activeQuickRange === 'custom' && (
                        <Box mt={2}>
                            <Box display='flex' alignItems='center' style={{ gap: 16 }}>
                                <TextField
                                    id='consumption-from-date'
                                    label={intl.formatMessage({
                                        id: 'ConsumptionTracking.filter.from',
                                        defaultMessage: 'From',
                                    })}
                                    type='date'
                                    value={fromDate}
                                    onChange={handleFromChange}
                                    InputLabelProps={{ shrink: true }}
                                    inputProps={{ max: toDate }}
                                    variant='outlined'
                                    size='small'
                                    sx={{ width: 160 }}
                                />
                                <TextField
                                    id='consumption-to-date'
                                    label={intl.formatMessage({
                                        id: 'ConsumptionTracking.filter.to',
                                        defaultMessage: 'To',
                                    })}
                                    type='date'
                                    value={toDate}
                                    onChange={handleToChange}
                                    InputLabelProps={{ shrink: true }}
                                    inputProps={{ min: fromDate, max: toInputDateString(new Date()) }}
                                    variant='outlined'
                                    size='small'
                                    sx={{ width: 160 }}
                                />
                            </Box>
                            {fromDate && toDate && fromDate > toDate && (
                                <Typography variant='caption' color='error' style={{ display: 'block', marginTop: 4 }}>
                                    {intl.formatMessage({
                                        id: 'ConsumptionTracking.error.dateRange',
                                        defaultMessage: 'From date must be before To date.',
                                    })}
                                </Typography>
                            )}
                        </Box>
                    )}

                </CardContent>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 2,
                    borderTop: '1px solid',
                    borderTopColor: 'divider',
                    backgroundColor: 'action.hover',
                }}
                >
                    <Typography variant='body2' color='textSecondary'>
                        {fromDate && toDate && fromDate <= toDate ? (
                            intl.formatMessage(
                                {
                                    id: 'ConsumptionTracking.range.summary',
                                    defaultMessage: 'Selected range: {from} — {to}',
                                },
                                {
                                    from: <strong>{formatDisplayDate(fromDate)}</strong>,
                                    to: <strong>{formatDisplayDate(toDate)}</strong>,
                                },
                            )
                        ) : '—'}
                    </Typography>
                    <Box display='flex' alignItems='center' style={{ gap: 8 }}>
                        {loading && <CircularProgress size={20} />}
                        <Button
                            variant='contained'
                            color='primary'
                            startIcon={<GetAppIcon />}
                            onClick={handleExport}
                            disabled={loading || !(fromDate && toDate && fromDate <= toDate)}
                        >
                            {intl.formatMessage({
                                id: 'ConsumptionData.export.button',
                                defaultMessage: 'Export',
                            })}
                        </Button>
                    </Box>
                </Box>
            </Card>
        </ContentBase>
    );
}
