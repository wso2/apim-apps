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
import PolicyIcon from '@mui/icons-material/Policy';
import Utils from 'AppData/Utils';

/**
 * API call to get Policy Attachments
 * @returns {Promise}.
 */
function apiCall() {
    const restApi = new GovernanceAPI();
    return restApi
        .getPolicyAttachmentAdherenceForAllPolicyAttachments()
        .then((result) => {
            const policyAttachments = result.body.list;

            // Fetch policy attachment adherence details for each policy attachment
            // TODO: optimize
            return Promise.all(
                policyAttachments.map(async (policyAttachment) => {
                    try {
                        const adherenceDetails = await restApi.getPolicyAttachmentAdherenceByPolicyAttachmentId(policyAttachment.id);
                        return {
                            ...policyAttachment,
                            evaluatedArtifacts: adherenceDetails.body.evaluatedArtifacts || []
                        };
                    } catch (error) {
                        console.error(`Error fetching adherence for policy attachment ${policyAttachment.id}:`, error);
                        return {
                            ...policyAttachment,
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

export default function PolicyAttachmentAdherenceTable() {
    const intl = useIntl();

    // TODO: reuse this function in other components
    const renderProgress = (followed, total) => {
        if (total === 0) {
            return (
                <Typography variant="body2" color="textSecondary">
                    {intl.formatMessage({
                        id: 'Governance.Overview.PolicyAttachmentAdherence.no.apis',
                        defaultMessage: 'N/A - No APIs to evaluate',
                    })}
                </Typography>
            );
        }

        const percentage = (followed / total) * 100;
        const isComplete = followed === total;

        return (
            <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }} color="textSecondary">
                        {intl.formatMessage({
                            id: 'Governance.Overview.PolicyAttachmentAdherence.compliant.count',
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

    const policyAttachmentColumProps = [
        {
            name: 'id',
            options: { display: false }
        },
        {
            name: 'name',
            label: intl.formatMessage({
                id: 'Governance.Overview.PolicyAttachmentAdherence.column.policyAttachment',
                defaultMessage: 'Policy Attachment',
            }),
            options: {
                customBodyRender: (value, tableMeta) => (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <RouterLink
                            to={`/governance/policy-attachments/${tableMeta.rowData[0]}`}
                            style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
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
                id: 'Governance.Overview.PolicyAttachmentAdherence.column.status',
                defaultMessage: 'Status',
            }),
            options: {
                customBodyRender: (value) => (
                    <Chip
                        label={Utils.mapPolicyAttachmentAdherenceStateToLabel(value)}
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
                id: 'Governance.Overview.PolicyAttachmentAdherence.column.apis',
                defaultMessage: 'APIs',
            }),
            options: {
                customBodyRender: (value, tableMeta) => {
                    const followed = tableMeta.rowData[3]?.compliant || 0;
                    const total = (tableMeta.rowData[3]?.nonCompliant + followed) || 0;
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
                                    to={`/governance/overview/api/${artifact.id}`}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        textDecoration: 'none',
                                        color: 'inherit'
                                    }}
                                >
                                    {artifact.info.name}
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
                    id: 'Governance.Overview.PolicyAttachmentAdherence.empty.content',
                    defaultMessage: 'No Governance Policy Attachments Available',
                })}
            </Typography>
            <Typography
                variant="body2"
                color="text.secondary"
                align="center"
            >
                {intl.formatMessage({
                    id: 'Governance.Overview.PolicyAttachmentAdherence.empty.helper',
                    defaultMessage: 'Create a new governance policy attachment to start governing the APIs.',
                })}
            </Typography>
        </Box>
    );

    return (
        <ListBase
            columProps={policyAttachmentColumProps}
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
