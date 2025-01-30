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
import { Box, Chip, Typography, TableRow, TableCell, LinearProgress } from '@mui/material';
import ListBase from 'AppComponents/AdminPages/Addons/ListBase';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Link as RouterLink } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import GovernanceAPI from 'AppData/GovernanceAPI';
import { useIntl } from 'react-intl';

/**
 * API call to get Policies
 * @returns {Promise}.
 */
function apiCall() {
    const restApi = new GovernanceAPI();
    return restApi
        .getPolicyAdherenceForAllPolicies()
        .then((result) => {
            const policies = result.body.list;

            // Fetch policy adherence details for each policy
            // TODO: optimize
            return Promise.all(
                policies.map(async (policy) => {
                    try {
                        const adherenceDetails = await restApi.getPolicyAdherenceByPolicyId(policy.policyId);
                        return {
                            ...policy,
                            evaluatedArtifacts: adherenceDetails.body.evaluatedArtifacts || []
                        };
                    } catch (error) {
                        console.error(`Error fetching adherence for policy ${policy.policyId}:`, error);
                        return {
                            ...policy,
                            evaluatedArtifacts: []
                        };
                    }
                })
            );
        })
        .catch((error) => {
            throw error;
        });
}

export default function PolicyAdherenceTable() {
    const intl = useIntl();

    // TODO: reuse this function in other components
    // TODO: Handle empty data scenario
    const renderProgress = (followed, total) => {
        const percentage = (followed / total) * 100;
        const isComplete = followed === total;

        return (
            <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }} color="textSecondary">
                        {intl.formatMessage({
                            id: 'Governance.Overview.PolicyAdherence.compliant.count',
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
                            backgroundColor: isComplete ? '#00B81D' : '#FF5252',
                            borderRadius: 1,
                        },
                    }}
                />
            </Box>
        );
    };

    const policyColumProps = [
        {
            name: 'policyId',
            options: { display: false }
        },
        {
            name: 'policyName',
            label: intl.formatMessage({
                id: 'Governance.Overview.PolicyAdherence.column.policy',
                defaultMessage: 'Policy',
            }),
            options: {
                customBodyRender: (value, tableMeta) => (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <RouterLink to={
                            `/governance/policies/${tableMeta.rowData[0]}`
                        } style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                            {value}
                            <OpenInNewIcon sx={{ ml: 0.5, fontSize: 16 }} />
                        </RouterLink>
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
                id: 'Governance.Overview.PolicyAdherence.column.status',
                defaultMessage: 'Status',
            }),
            options: {
                customBodyRender: (value) => (
                    <Chip
                        label={value}
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
                id: 'Governance.Overview.PolicyAdherence.column.apis',
                defaultMessage: 'APIs',
            }),
            options: {
                customBodyRender: (value, tableMeta) => {
                    const followed = tableMeta.rowData[3]?.compliantArtifacts || 0;
                    const total = (tableMeta.rowData[3]?.nonCompliantArtifacts + followed) || 0;
                    return renderProgress(followed, total);
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
                                key={artifact.artifactId}
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
                                    to={`/governance/overview/api/${artifact.artifactId}`}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        textDecoration: 'none',
                                        color: 'inherit'
                                    }}
                                >
                                    {artifact.artifactName}
                                    <OpenInNewIcon sx={{ ml: 0.5, fontSize: 16 }} />
                                </RouterLink>
                            </Box>
                        ))}
                    </Stack>
                </TableCell>
            </TableRow>
        );
    };

    return (
        <ListBase
            columProps={policyColumProps}
            apiCall={apiCall}
            searchProps={false}
            emptyBoxProps={{
                title: intl.formatMessage({
                    id: 'Governance.Overview.PolicyAdherence.empty.title',
                    defaultMessage: 'No Policies Found',
                }),
                content: intl.formatMessage({
                    id: 'Governance.Overview.PolicyAdherence.empty.content',
                    defaultMessage: 'There are no policies to display',
                }),
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
