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
import { Box, Chip, Typography, TableRow, TableCell, LinearProgress, useTheme } from '@mui/material';
import ListBaseWithPagination from 'AppComponents/AdminPages/Addons/ListBaseWithPagination';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Link as RouterLink } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import GovernanceAPI from 'AppData/GovernanceAPI';
import { useIntl } from 'react-intl';
import PolicyIcon from '@mui/icons-material/Policy';
import Utils from 'AppData/Utils';

/**
 * API call to get Policies with pagination
 * @param {Object} params Query parameters for pagination
 * @returns {Promise} Promise resolving to paginated policies.
 */
function apiCall(params) {
    const restApi = new GovernanceAPI();
    return restApi
        .getPolicyAdherenceForAllPolicies(params)
        .then((result) => {
            const policies = result.body.list;
            const pagination = result.body.pagination;

            // Fetch policy adherence details for each policy in the current page
            return Promise.all(
                policies.map(async (policy) => {
                    try {
                        const adherenceDetails = await restApi.getPolicyAdherenceByPolicyId(policy.id);
                        return {
                            ...policy,
                            evaluatedArtifacts: adherenceDetails.body.evaluatedArtifacts || []
                        };
                    } catch (error) {
                        console.error(`Error fetching adherence for policy ${policy.id}:`, error);
                        return {
                            ...policy,
                            evaluatedArtifacts: []
                        };
                    }
                })
            ).then(policiesWithAdherence => {
                return {
                    list: policiesWithAdherence,
                    pagination: pagination
                };
            });
        })
        .catch((error) => {
            throw error;
        });
}

export default function PolicyAdherenceTable() {
    const intl = useIntl();
    const theme = useTheme();

    // TODO: reuse this function in other components
    const renderProgress = (followed, total, status) => {
        if (status === 'UNAPPLIED') {
            return (
                <Typography variant="body2" color="textSecondary">
                    {intl.formatMessage({
                        id: 'Governance.ComplianceDashboard.PolicyAdherence.no.apis',
                        defaultMessage: 'N/A - No APIs to evaluate',
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
                            id: 'Governance.ComplianceDashboard.PolicyAdherence.compliant.count',
                            defaultMessage: '{followed}/{total} Compliant',
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
                            backgroundColor: theme.palette.charts.success,
                            borderRadius: 1,
                        },
                    }}
                />
            </Box>
        );
    };

    const policyColumProps = [
        {
            name: 'id',
            options: { display: false }
        },
        {
            name: 'name',
            label: intl.formatMessage({
                id: 'Governance.ComplianceDashboard.PolicyAdherence.column.policy',
                defaultMessage: 'Policy',
            }),
            options: {
                customBodyRender: (value, tableMeta) => (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {value}
                    </Box>
                ),
                setCellProps: () => ({
                    style: {
                        width: '30%'
                    },
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
                id: 'Governance.ComplianceDashboard.PolicyAdherence.column.status',
                defaultMessage: 'Status',
            }),
            options: {
                customBodyRender: (value) => (
                    <Chip
                        label={Utils.mapPolicyAdherenceStateToLabel(value)}
                        color={value === 'FOLLOWED' ? 'success' : value === 'VIOLATED' ? 'error' : 'default'}
                        size="small"
                        variant="outlined"
                    />
                ),
                setCellProps: () => ({
                    sx: { width: '20%' },
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
            name: 'artifactComplianceSummary',
            options: { display: false }
        },
        {
            name: 'evaluatedArtifacts',
            options: { display: false }
        },
        {
            name: 'progress',
            label: intl.formatMessage({
                id: 'Governance.ComplianceDashboard.PolicyAdherence.column.apis',
                defaultMessage: 'APIs',
            }),
            options: {
                customBodyRender: (value, tableMeta) => {
                    const followed = tableMeta.rowData[3]?.compliant || 0;
                    const total = (tableMeta.rowData[3]?.nonCompliant + followed) || 0;
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
                    },
                }),
            },
        },
    ];

    const renderExpandableRow = (rowData) => {
        return (
            <TableRow>
                <TableCell colSpan={3} />
                <TableCell>
                    <Stack direction="column" spacing={2} sx={{ flexWrap: 'wrap' }}>
                        {/* TODO: Find a better way to display all those */}
                        {rowData[4].map((artifact) => (
                            <Box
                                key={artifact.id}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}
                            >
                                {artifact.status === 'COMPLIANT' ?
                                    <CheckCircleIcon color="success" sx={{ fontSize: 16 }} /> :
                                    <CancelIcon color="error" sx={{ fontSize: 16 }} />
                                }
                                <RouterLink
                                    to={`/governance/compliance/api/${artifact.id}`}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        textDecoration: 'none',
                                        color: 'inherit'
                                    }}
                                >
                                    {artifact.info.name} {artifact.info.version}
                                    <OpenInNewIcon sx={{ ml: 0.5, fontSize: 16 }} />
                                </RouterLink>
                            </Box>
                        ))}
                    </Stack>
                </TableCell>
            </TableRow>
        );
    };

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
                variant="h6"
                color="text.secondary"
                gutterBottom
                sx={{ fontWeight: 'medium' }}
            >
                {intl.formatMessage({
                    id: 'Governance.ComplianceDashboard.PolicyAdherence.empty.content',
                    defaultMessage: 'No Governance Policies Available',
                })}
            </Typography>
            <Typography
                variant="body2"
                color="text.secondary"
                align="center"
            >
                {intl.formatMessage({
                    id: 'Governance.ComplianceDashboard.PolicyAdherence.empty.helper',
                    defaultMessage: 'Create a new governance policy to start governing the APIs.',
                })}
            </Typography>
        </Box>
    );

    return (
        <ListBaseWithPagination
            columProps={policyColumProps}
            apiCall={apiCall}
            searchProps={false}
            emptyBoxProps={{
                content: emptyStateContent
            }}
            addButtonProps={false}
            showActionColumn={false}
            useContentBase={false}
            enableCollapsable={true}
            renderExpandableRow={renderExpandableRow}
            options={{
                elevation: 0,
            }}
        />
    );
}
