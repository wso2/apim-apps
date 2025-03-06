/* eslint-disable */
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
import { Box, Chip, Typography, Tooltip, LinearProgress } from '@mui/material';
import ListBaseWithPagination from 'AppComponents/AdminPages/Addons/ListBaseWithPagination';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Link as RouterLink } from 'react-router-dom';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import GovernanceAPI from 'AppData/GovernanceAPI';
import { useIntl } from 'react-intl';
import ApiIcon from '@mui/icons-material/Api';
import Utils from 'AppData/Utils';

/**
 * Get the list of APIs with compliance status
 * @param {Object} params API call parameters
 * @returns {Promise} Promise resolving to the list of APIs
 */
function apiCall(params) {
    const restApi = new GovernanceAPI();
    return restApi.getComplianceStatusListOfAPIs(params)
        .then((response) => {
            return {
                list: response.body.list,
                pagination: response.body.pagination,
            };
        })
        .catch((error) => {
            throw error;
        });
}

export default function ApiComplianceTable() {
    const intl = useIntl();

    const renderProgress = (followed, total, status) => {
        if (status === 'PENDING') {
            return (
                <Typography variant="body2" color="textSecondary">
                    {intl.formatMessage({
                        id: 'Governance.ComplianceDashboard.APICompliance.pending',
                        defaultMessage: 'N/A - Waiting for policy evaluation',
                    })}
                </Typography>
            );
        }

        if (status === 'NOT_APPLICABLE') {
            return (
                <Typography variant="body2" color="textSecondary">
                    {intl.formatMessage({
                        id: 'Governance.ComplianceDashboard.APICompliance.no.policies',
                        defaultMessage: 'N/A - No policies to evaluate',
                    })}
                </Typography>
            );
        }

        const percentage = (followed / total) * 100;

        return (
            <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }} color="textSecondary">
                        {intl.formatMessage({
                            id: 'Governance.ComplianceDashboard.APICompliance.followed.count',
                            defaultMessage: '{followed}/{total} Followed',
                        }, { followed, total })}
                    </Typography>
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={percentage}
                    sx={{
                        height: 4,
                        borderRadius: 1,
                        backgroundColor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                            backgroundColor: '#00B81D',
                            borderRadius: 1,
                        },
                    }}
                />
            </Box>
        );
    };

    const renderComplianceIcons = (severityBasedRuleViolationSummary) => {
        // get the error, warn, info counts
        let errorCount = 0;
        let warnCount = 0;
        let infoCount = 0;

        severityBasedRuleViolationSummary.forEach((severity) => {
            if (severity.severity === 'ERROR') {
                errorCount = severity.violatedRulesCount;
            } else if (severity.severity === 'WARN') {
                warnCount = severity.violatedRulesCount;
            } else if (severity.severity === 'INFO') {
                infoCount = severity.violatedRulesCount;
            }
        });

        return (
            <Tooltip title={`Error: ${errorCount || 0}, Warn: ${warnCount || 0}, Info: ${infoCount || 0}`}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ErrorIcon color="error" sx={{ fontSize: 16 }} />
                        <Typography variant="caption" sx={{ ml: 0.5 }}>
                            {errorCount || 0}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <WarningIcon color="warning" sx={{ fontSize: 16 }} />
                        <Typography variant="caption" sx={{ ml: 0.5 }}>
                            {warnCount || 0}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <InfoIcon color="info" sx={{ fontSize: 16 }} />
                        <Typography variant="caption" sx={{ ml: 0.5 }}>
                            {infoCount || 0}
                        </Typography>
                    </Box>
                </Box>
            </Tooltip>
        );
    };

    const columProps = [
        {
            name: 'id',
            options: { display: false }
        },
        {
            name: 'info',
            options: { display: false }
        },
        {
            name: 'name',
            label: intl.formatMessage({
                id: 'Governance.ComplianceDashboard.APICompliance.column.api',
                defaultMessage: 'API',
            }),
            options: {
                customBodyRender: (value, tableMeta) => (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <RouterLink to={`/governance/compliance/api/${tableMeta.rowData[0]}`} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                            {tableMeta.rowData[1].name + ' - ' + tableMeta.rowData[1].version}
                            <OpenInNewIcon sx={{ ml: 0.5, fontSize: 16 }} />
                        </RouterLink>
                    </Box>
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
                id: 'Governance.ComplianceDashboard.APICompliance.column.status',
                defaultMessage: 'Status',
            }),
            options: {
                customBodyRender: (value) => (
                    <Chip
                        label={Utils.mapComplianceStateToLabel(value)}
                        color={value === 'COMPLIANT' ? 'success' :
                            value === 'NON_COMPLIANT' ? 'error' :
                                value === 'PENDING' ? 'warning' : 'default'}
                        size="small"
                        variant="outlined"
                    />
                ),
                setCellProps: () => ({
                    style: { width: '20%' },
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
            name: 'policyAdherenceSummary',
            options: { display: false }
        },
        {
            name: 'severityBasedRuleViolationSummary',
            options: { display: false }
        },
        {
            name: 'policies',
            label: intl.formatMessage({
                id: 'Governance.ComplianceDashboard.APICompliance.column.policies',
                defaultMessage: 'Policies',
            }),
            options: {
                customBodyRender: (value, tableMeta) => {
                    const followed = tableMeta.rowData[4]?.followed || 0;
                    const violated = tableMeta.rowData[4]?.violated || 0;
                    const total = followed + violated;
                    const status = tableMeta.rowData[3];
                    return renderProgress(followed, total, status);
                },
                setCellProps: () => ({
                    style: { width: '40%' },
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
            name: 'compliance',
            label: ' ',
            options: {
                customBodyRender: (value, tableMeta) => {
                    const severityBasedRuleViolationSummary = tableMeta.rowData[5] || [];
                    return renderComplianceIcons(severityBasedRuleViolationSummary);
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
            <ApiIcon
                sx={{
                    fontSize: 60,
                    color: 'action.disabled',
                    mb: 2
                }}
            />
            <Typography
                variant="h6"
                color="text.secondary"
                gutterBottom
                sx={{ fontWeight: 'medium' }}
            >
                {intl.formatMessage({
                    id: 'Governance.ComplianceDashboard.APICompliance.empty.content',
                    defaultMessage: 'No APIs Available',
                })}
            </Typography>
            <Typography
                variant="body2"
                color="text.secondary"
                align="center"
            >
                {intl.formatMessage({
                    id: 'Governance.ComplianceDashboard.APICompliance.empty.helper',
                    defaultMessage: 'Create APIs to start evaluating their compliance.',
                })}
            </Typography>
        </Box>
    );

    return (
        <ListBaseWithPagination
            columProps={columProps}
            apiCall={apiCall}
            searchProps={false}
            emptyBoxProps={{
                content: emptyStateContent
            }}
            addButtonProps={false}
            showActionColumn={false}
            useContentBase={false}
            options={{
                elevation: 0,
                selectableRows: 'none',
                customBodyRender: (value) => value,
                setTableProps: () => ({
                    style: {
                        '& .MuiTableCell-root': {
                            border: 'none'
                        }
                    }
                })
            }}
        />
    );
}
