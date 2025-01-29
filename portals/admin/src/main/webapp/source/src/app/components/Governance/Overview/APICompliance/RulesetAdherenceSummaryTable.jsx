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
import { Typography, Chip, Box, Tooltip } from '@mui/material';
import ListBase from 'AppComponents/AdminPages/Addons/ListBase';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import GovernanceAPI from 'AppData/GovernanceAPI';

export default function RulesetAdherenceSummaryTable({ artifactId }) {
    const apiCall = () => {
        const restApi = new GovernanceAPI();
        return restApi.getArtifactComplianceByArtifactId(artifactId)
            .then((response) => {
                // Get unique ruleset IDs from all policies
                const rulesetIds = [...new Set(
                    response.body.governedPolicies.flatMap(policy =>
                        policy.rulesetValidationResults.map(result => result.id)
                    )
                )];

                // Get validation results for each ruleset
                return Promise.all(
                    rulesetIds.map(rulesetId =>
                        restApi.getRulesetValidationResultsByArtifactId(artifactId, rulesetId)
                            .then((result) => result.body)
                    )
                );
            })
            .catch((error) => {
                console.error('Error fetching ruleset adherence data:', error);
                return [];
            });
    };

    const RulesetColumProps = [
        {
            name: 'id',
            options: { display: false }
        },
        {
            name: 'name',
            label: 'Ruleset',
            options: {
                width: '40%',
                customBodyRender: (value) => (
                    <Typography variant="body2">{value}</Typography>
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
                setCellProps: () => ({
                    style: { width: '30%' },
                }),
                customBodyRender: (value) => (
                    <Chip
                        label={value}
                        color={value === 'PASSED' ? 'success' : 'error'}
                        size="small"
                        variant="outlined"
                    />
                ),
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
            name: 'violatedRules',
            options: { display: false }
        },
        {
            name: 'followedRules',
            options: { display: false }
        },
        {
            name: 'violationsSummary',
            label: 'Violations',
            options: {
                customBodyRender: (value, tableMeta) => {
                    // Count the number of errors, warnings, and info messages in the violations
                    const violations = tableMeta.rowData[3];
                    const counts = violations.reduce((acc, { severity }) => {
                        acc[severity.toLowerCase()] += 1;
                        return acc;
                    }, { error: 0, warn: 0, info: 0 });

                    return renderComplianceIcons({
                        error: counts.error,
                        warn: counts.warn,
                        info: counts.info
                    });
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

    const renderComplianceIcons = (violations) => {
        const { error, warn, info } = violations;
        return (
            <Tooltip title={
                "Errors: " + error + ", Warnings: " + warn + ", Info: " + info
            }>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Box key="error" sx={{ display: 'flex', alignItems: 'center' }}>
                        <ErrorIcon color='error' sx={{ fontSize: 16 }} />
                        <Typography variant="caption" sx={{ ml: 0.5 }}>
                            {error}
                        </Typography>
                    </Box>
                    <Box key="warn" sx={{ display: 'flex', alignItems: 'center' }}>
                        <WarningIcon color='warning' sx={{ fontSize: 16 }} />
                        <Typography variant="caption" sx={{ ml: 0.5 }}>
                            {warn}
                        </Typography>
                    </Box>
                    <Box key="info" sx={{ display: 'flex', alignItems: 'center' }}>
                        <InfoIcon color='info' sx={{ fontSize: 16 }} />
                        <Typography variant="caption" sx={{ ml: 0.5 }}>
                            {info}
                        </Typography>
                    </Box>
                </Box>
            </Tooltip>
        );
    };

    return (
        <ListBase
            columProps={RulesetColumProps}
            apiCall={apiCall}
            searchProps={false}
            emptyBoxProps={{
                title: 'No Policies Found',
                content: 'There are no policies to display',
            }}
            addButtonProps={false}
            showActionColumn={false}
            useContentBase={false}
            options={{
                elevation: 0,
            }}
        />
    );
}
