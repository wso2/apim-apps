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
import { Typography, Chip, Box, LinearProgress, TableRow, TableCell, useTheme } from '@mui/material';
import ListBase from 'AppComponents/Addons/Addons/ListBase';
import Stack from '@mui/material/Stack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { useIntl } from 'react-intl';
import PolicyIcon from '@mui/icons-material/Policy';

import Utils from 'AppData/Utils';

export default function PolicyAdherenceSummaryTable({ complianceData }) {
    const intl = useIntl();
    const theme = useTheme();

    const renderProgress = (followed, total, status) => {
        if (status === 'PENDING') {
            return (
                <Typography variant='body2' color='textSecondary'>
                    {intl.formatMessage({
                        id: 'Apis.Details.Compliance.PolicyAdherence.pending',
                        defaultMessage: 'N/A - Waiting for policy evaluation',
                    })}
                </Typography>
            );
        }

        if (status === 'UNAPPLIED') {
            return (
                <Typography variant='body2' color='textSecondary'>
                    {intl.formatMessage({
                        id: 'Apis.Details.Compliance.PolicyAdherence.not.applied',
                        defaultMessage: 'N/A - Policy not applied',
                    })}
                </Typography>
            );
        }

        const percentage = (followed / total) * 100;

        return (
            <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', mb: 0.5 }}>
                    <Typography variant='body2' sx={{ fontWeight: 'bold' }} color='textSecondary'>
                        {intl.formatMessage({
                            id: 'Apis.Details.Compliance.PolicyAdherence.followed.count',
                            defaultMessage: '{followed}/{total} Followed',
                        }, { followed, total })}
                    </Typography>
                </Box>
                <LinearProgress
                    variant='determinate'
                    value={percentage}
                    sx={{
                        height: 4,
                        borderRadius: 1,
                        backgroundColor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                            backgroundColor: theme.palette.charts.success,
                            borderRadius: 1,
                        },
                    }}
                />
            </Box>
        );
    };

    const renderExpandableRow = (rowData) => {
        const rulesets = rowData[3];

        const getStatusIcon = (status) => {
            if (status === 'PASSED') {
                return <CheckCircleIcon color='success' sx={{ fontSize: 16 }} />;
            } else if (status === 'FAILED') {
                return <CancelIcon color='error' sx={{ fontSize: 16 }} />;
            } else {
                return <RemoveCircleIcon color='disabled' sx={{ fontSize: 16 }} />;
            }
        };

        return (
            <TableRow>
                <TableCell colSpan={3} />
                <TableCell>
                    <Stack direction='column' spacing={2} sx={{ flexWrap: 'wrap' }}>
                        {rulesets.map((ruleset) => (
                            <Box
                                key={ruleset.id}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}
                            >
                                {getStatusIcon(ruleset.status)}
                                <Typography variant='body2'>
                                    {ruleset.name}
                                </Typography>
                            </Box>
                        ))}
                    </Stack>
                </TableCell>
            </TableRow>
        );
    };

    const policyColumnProps = [
        {
            name: 'id',
            options: { display: false }
        },
        {
            name: 'name',
            label: intl.formatMessage({
                id: 'Apis.Details.Compliance.PolicyAdherence.column.policy',
                defaultMessage: 'Policy',
            }),
            options: {
                width: '30%',
                customBodyRender: (value) => (
                    <Typography variant='body2'>{value}</Typography>
                ),
                setCellProps: () => ({
                    style: { width: '30%' },
                }),
                setCellHeaderProps: () => ({
                    sx: {
                        paddingTop: 0,
                        paddingBottom: 0,
                        '& .MuiButton-root': {
                            fontWeight: 'bold',
                            fontSize: 'small'
                        },
                    },
                }),
            },
        },
        {
            name: 'status',
            label: intl.formatMessage({
                id: 'Apis.Details.Compliance.PolicyAdherence.column.status',
                defaultMessage: 'Status',
            }),
            options: {
                setCellProps: () => ({
                    style: { width: '20%' },
                }),
                customBodyRender: (value) => {
                    const getChipColor = (status) => {
                        if (status === 'FOLLOWED') return 'success';
                        if (status === 'VIOLATED') return 'error';
                        if (status === 'PENDING') return 'warning';
                        return 'default';
                    };
                    return (
                        <Chip
                            label={Utils.mapPolicyAdherenceStateToLabel(value)}
                            color={getChipColor(value)}
                            size='small'
                            variant='outlined'
                        />
                    );
                },
                setCellHeaderProps: () => ({
                    sx: {
                        paddingTop: 0,
                        paddingBottom: 0,
                        '& .MuiButton-root': {
                            fontWeight: 'bold',
                            fontSize: 'small'
                        },
                    },
                }),
            },
        },
        {
            name: 'rulesetValidationResults',
            options: { display: false }
        },
        {
            name: 'rulesetsList',
            label: intl.formatMessage({
                id: 'Apis.Details.Compliance.PolicyAdherence.column.rulesets',
                defaultMessage: 'Rulesets',
            }),
            options: {
                customBodyRender: (value, tableMeta) => {
                    const rulesets = tableMeta.rowData[3];
                    const total = rulesets.length;
                    const followed = rulesets.filter((ruleset) => ruleset.status === 'PASSED').length;
                    const status = tableMeta.rowData[2];
                    return renderProgress(followed, total, status);
                },
                setCellHeaderProps: () => ({
                    sx: {
                        paddingTop: 0,
                        paddingBottom: 0,
                        '& .MuiButton-root': {
                            fontWeight: 'bold',
                            fontSize: 'small'
                        },
                    }
                }),
            }
        },
    ];

    const emptyStateContent = (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: 3
            }}
        >
            <PolicyIcon
                sx={{
                    fontSize: 60,
                    color: 'action.disabled',
                    mb: 2
                }}
            />
            <Typography
                variant='h6'
                color='text.secondary'
                gutterBottom
                sx={{ fontWeight: 'medium' }}
            >
                {intl.formatMessage({
                    id: 'Apis.Details.Compliance.PolicyAdherence.empty.title',
                    defaultMessage: 'No Policies Applied',
                })}
            </Typography>
            <Typography
                variant='body2'
                color='text.secondary'
                align='center'
            >
                {intl.formatMessage({
                    id: 'Apis.Details.Compliance.PolicyAdherence.empty.helper',
                    defaultMessage: 'No governance policies have been applied to this API.',
                })}
            </Typography>
        </Box>
    );

    return (
        <ListBase
            columnProps={policyColumnProps}
            initialData={complianceData ? complianceData.governedPolicies : null}
            searchProps={false}
            emptyBoxProps={{
                content: emptyStateContent
            }}
            addButtonProps={false}
            showActionColumn={false}
            useContentBase={false}
            options={{
                elevation: 0,
                rowsPerPage: 5,
            }}
            enableCollapsable
            renderExpandableRow={renderExpandableRow}
        />
    );
}
