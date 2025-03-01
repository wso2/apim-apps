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
import {
    Typography, Chip, Box, Tooltip,
} from '@mui/material';
import ListBase from 'AppComponents/AdminPages/Addons/ListBase';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import { useIntl } from 'react-intl';
import AssignmentIcon from '@mui/icons-material/Assignment';
import Utils from 'AppData/Utils';

export default function RulesetAdherenceSummaryTable({ complianceData }) {
    const intl = useIntl();

    const renderComplianceIcons = (violations) => {
        const { error, warn, info } = violations;
        return (
            <Tooltip title={
                intl.formatMessage(
                    {
                        id: 'Governance.ComplianceDashboard.APICompliance.RulesetAdherence.violations.tooltip',
                        defaultMessage: 'Errors: {error}, Warnings: {warn}, Info: {info}',
                    },
                    { error, warn, info },
                )
            }
            >
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Box key='error' sx={{ display: 'flex', alignItems: 'center' }}>
                        <ErrorIcon color='error' sx={{ fontSize: 16 }} />
                        <Typography variant='caption' sx={{ ml: 0.5 }}>
                            {error}
                        </Typography>
                    </Box>
                    <Box key='warn' sx={{ display: 'flex', alignItems: 'center' }}>
                        <WarningIcon color='warning' sx={{ fontSize: 16 }} />
                        <Typography variant='caption' sx={{ ml: 0.5 }}>
                            {warn}
                        </Typography>
                    </Box>
                    <Box key='info' sx={{ display: 'flex', alignItems: 'center' }}>
                        <InfoIcon color='info' sx={{ fontSize: 16 }} />
                        <Typography variant='caption' sx={{ ml: 0.5 }}>
                            {info}
                        </Typography>
                    </Box>
                </Box>
            </Tooltip>
        );
    };

    const RulesetColumProps = [
        {
            name: 'id',
            options: { display: false },
        },
        {
            name: 'name',
            label: intl.formatMessage({
                id: 'Governance.ComplianceDashboard.APICompliance.RulesetAdherence.column.ruleset',
                defaultMessage: 'Ruleset',
            }),
            options: {
                width: '40%',
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
                            fontSize: 'small',
                        },
                    },
                }),
            },
        },
        {
            name: 'status',
            label: intl.formatMessage({
                id: 'Governance.ComplianceDashboard.APICompliance.RulesetAdherence.column.status',
                defaultMessage: 'Status',
            }),
            options: {
                setCellProps: () => ({
                    style: { width: '30%' },
                }),
                customBodyRender: (value) => {
                    const getChipColor = (status) => {
                        if (status === 'PASSED') return 'success';
                        if (status === 'FAILED') return 'error';
                        return 'default';
                    };

                    return (
                        <Chip
                            label={Utils.mapRulesetValidationStateToLabel(value)}
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
                            fontSize: 'small',
                        },
                    },
                }),
            },
        },
        {
            name: 'violatedRules',
            options: { display: false },
        },
        {
            name: 'followedRules',
            options: { display: false },
        },
        {
            name: 'violationsSummary',
            label: intl.formatMessage({
                id: 'Governance.ComplianceDashboard.APICompliance.RulesetAdherence.column.violations',
                defaultMessage: 'Violations',
            }),
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
                        info: counts.info,
                    });
                },
                setCellHeaderProps: () => ({
                    sx: {
                        paddingTop: 0,
                        paddingBottom: 0,
                        '& .MuiButton-root': {
                            fontWeight: 'bold',
                            fontSize: 'small',
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
                padding: 3,
            }}
        >
            <AssignmentIcon
                sx={{
                    fontSize: 60,
                    color: 'action.disabled',
                    mb: 2,
                }}
            />
            <Typography
                variant='h6'
                color='text.secondary'
                gutterBottom
                sx={{ fontWeight: 'medium' }}
            >
                {intl.formatMessage({
                    id: 'Governance.ComplianceDashboard.APICompliance.RulesetAdherence.empty.title',
                    defaultMessage: 'No Rulesets Found',
                })}
            </Typography>
            <Typography
                variant='body2'
                color='text.secondary'
                align='center'
            >
                {intl.formatMessage({
                    id: 'Governance.ComplianceDashboard.APICompliance.RulesetAdherence.empty.helper',
                    defaultMessage: 'No governance rulesets have been applied for this API.',
                })}
            </Typography>
        </Box>
    );

    return (
        <ListBase
            columProps={RulesetColumProps}
            initialData={complianceData ? complianceData.rulesets : null}
            searchProps={false}
            emptyBoxProps={{
                content: emptyStateContent,
            }}
            addButtonProps={false}
            showActionColumn={false}
            useContentBase={false}
            options={{
                elevation: 0,
                rowsPerPage: 5,
            }}
        />
    );
}
