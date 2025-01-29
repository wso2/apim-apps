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
import ListBase from 'AppComponents/AdminPages/Addons/ListBase';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Link as RouterLink } from 'react-router-dom';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import GovernanceAPI from 'AppData/GovernanceAPI';

/**
 * API call to get Policies
 * @returns {Promise}.
 */
function apiCall() {
    const restApi = new GovernanceAPI();
    return restApi
        .getArtifactComplianceForAllArtifacts()
        .then((result) => {
            return result.body.list;
        })
        .catch((error) => {
            throw error;
        });
}


export default function ApiComplianceTable() {

    const renderProgress = (followed, total) => {
        const percentage = (followed / total) * 100;
        const isComplete = followed === total;

        return (
            <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }} color="textSecondary">
                        {`${followed}/${total} Followed`}
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
            name: 'artifactId',
            options: { display: false }
        },
        {
            name: 'artifactName',
            label: 'API',
            options: {
                customBodyRender: (value, tableMeta) => (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <RouterLink to={`/governance/overview/api/${tableMeta.rowData[0]}`} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                            {value}
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
            label: 'Status',
            options: {
                customBodyRender: (value) => (
                    <Chip
                        label={value}
                        // status can be NOT_APPLICABLE, COMPLIANT, NON_COMPLIANT
                        color={value === 'COMPLIANT' ? 'success' :
                            value === 'NON_COMPLIANT' ? 'error' : 'default'}
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
            label: 'Policies',
            options: {
                customBodyRender: (value, tableMeta) => {
                    const followed = tableMeta.rowData[3]?.followedPolicies || 0;
                    const violated = tableMeta.rowData[3]?.violatedPolicies || 0;
                    const total = followed + violated;
                    return renderProgress(followed, total);
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
                    const severityBasedRuleViolationSummary = tableMeta.rowData[4] || [];
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

    return (
        <ListBase
            columProps={columProps}
            apiCall={apiCall}
            searchProps={false}
            emptyBoxProps={{
                title: 'No APIs Found',
                content: 'There are no APIs to display',
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
