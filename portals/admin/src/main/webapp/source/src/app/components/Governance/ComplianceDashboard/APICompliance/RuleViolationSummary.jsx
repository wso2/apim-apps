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

import React, { useEffect, useState } from 'react';
import {
    Grid, Card, CardContent, Typography, Box, Tabs, Tab, Collapse, IconButton,
    TablePagination, Chip,
} from '@mui/material';
import ReportIcon from '@mui/icons-material/Report';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import LabelIcon from '@mui/icons-material/Label';
import RuleIcon from '@mui/icons-material/Rule';
import ListBase from 'AppComponents/AdminPages/Addons/ListBase';
import { useIntl } from 'react-intl';
import CircularProgress from '@mui/material/CircularProgress';
import Utils from '../../../../data/Utils';

export default function RuleViolationSummary({ complianceData }) {
    const intl = useIntl();
    const [selectedTab, setSelectedTab] = useState(0);
    const [expandedItems, setExpandedItems] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const [complianceDataState, setComplianceData] = useState({
        errors: [],
        warnings: [],
        info: [],
        passed: [],
    });

    useEffect(() => {
        if (!complianceData) return;

        // Create rulesets array with severities categorized
        const rulesetCategories = complianceData.rulesets.map((ruleset) => ({
            id: ruleset.id,
            rulesetName: ruleset.name,
            ruleType: ruleset.ruleType,
            documentationLink: ruleset.documentationLink,
            error: ruleset.violatedRules.filter((rule) => rule.severity === 'ERROR'),
            warn: ruleset.violatedRules.filter((rule) => rule.severity === 'WARN'),
            info: ruleset.violatedRules.filter((rule) => rule.severity === 'INFO'),
            passed: ruleset.followedRules,
        }));

        // Group by severity level
        const severityGroups = {
            errors: [],
            warnings: [],
            info: [],
            passed: [],
        };

        rulesetCategories.forEach((ruleset) => {
            if (ruleset.error.length > 0) {
                severityGroups.errors.push({
                    id: ruleset.id,
                    rulesetName: ruleset.rulesetName,
                    documentationLink: ruleset.documentationLink,
                    ruleType: ruleset.ruleType,
                    rules: ruleset.error,
                });
            }
            if (ruleset.warn.length > 0) {
                severityGroups.warnings.push({
                    id: ruleset.id,
                    rulesetName: ruleset.rulesetName,
                    documentationLink: ruleset.documentationLink,
                    ruleType: ruleset.ruleType,
                    rules: ruleset.warn,
                });
            }
            if (ruleset.info.length > 0) {
                severityGroups.info.push({
                    id: ruleset.id,
                    rulesetName: ruleset.rulesetName,
                    documentationLink: ruleset.documentationLink,
                    ruleType: ruleset.ruleType,
                    rules: ruleset.info,
                });
            }
            if (ruleset.passed.length > 0) {
                severityGroups.passed.push({
                    id: ruleset.id,
                    rulesetName: ruleset.rulesetName,
                    documentationLink: ruleset.documentationLink,
                    ruleType: ruleset.ruleType,
                    rules: ruleset.passed,
                });
            }
        });

        setComplianceData(severityGroups);
    }, [complianceData]);

    const handleTabChange = (e, newValue) => {
        setSelectedTab(newValue);
        setExpandedItems([]); // Reset expanded items when tab changes
        setPage(0); // Reset to first page when changing tabs
    };

    const handleExpandClick = (id) => {
        setExpandedItems((prev) => {
            const isExpanded = prev.includes(id);
            return isExpanded
                ? prev.filter((i) => i !== id)
                : [...prev, id];
        });
    };

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
        setExpandedItems([]); // Reset expanded items when page changes
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
        setExpandedItems([]);
    };

    const paginateRulesets = (rulesets) => {
        const startIndex = page * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        return rulesets.slice(startIndex, endIndex);
    };

    const getRuleData = (rules) => {
        return Promise.resolve(
            rules.map((rule) => [rule.name, rule.violatedPath, rule.message]),
        );
    };

    // Add new function for passed rules data
    const getPassedRuleData = (rules) => {
        return Promise.resolve(
            rules.map((rule) => [rule.name, rule.description]),
        );
    };

    const ruleColumProps = [
        {
            name: 'name',
            label: intl.formatMessage({
                id: 'Governance.ComplianceDashboard.APICompliance.RuleViolation.column.rule',
                defaultMessage: 'Rule',
            }),
            options: {
                customBodyRender: (value) => (
                    <Typography variant='body2'>{value}</Typography>
                ),
            },
        },
        {
            name: 'violatedPath',
            label: intl.formatMessage({
                id: 'Governance.ComplianceDashboard.APICompliance.RuleViolation.column.path',
                defaultMessage: 'Path',
            }),
            options: {
                sort: false,
                customBodyRender: (value) => (
                    <Typography variant='body2'>{value.path}</Typography>
                ),
            },
        },
        {
            name: 'message',
            label: intl.formatMessage({
                id: 'Governance.ComplianceDashboard.APICompliance.RuleViolation.column.message',
                defaultMessage: 'Message',
            }),
            options: {
                sort: false,
                customBodyRender: (value) => (
                    <Typography variant='body2'>{value}</Typography>
                ),
            },
        },
    ];

    // Add new column props for passed rules
    const passedRuleColumnProps = [
        {
            name: 'name',
            label: intl.formatMessage({
                id: 'Governance.ComplianceDashboard.APICompliance.RuleViolation.column.rule',
                defaultMessage: 'Rule',
            }),
            options: {
                customBodyRender: (value) => (
                    <Typography variant='body2'>{value}</Typography>
                ),
            },
        },
        {
            name: 'description',
            label: intl.formatMessage({
                id: 'Governance.ComplianceDashboard.APICompliance.RuleViolation.column.description',
                defaultMessage: 'Description',
            }),
            options: {
                sort: false,
                customBodyRender: (value) => (
                    <Typography variant='body2'>{value}</Typography>
                ),
            },
        },
    ];

    const renderComplianceCards = (rulesets, isPassed = false) => {
        const paginatedRulesets = paginateRulesets(rulesets);

        return (
            <>
                <Grid container spacing={2}>
                    {paginatedRulesets.map((item) => (
                        <Grid item xs={12} key={item.id}>
                            <Card>
                                <CardContent
                                    onClick={() => handleExpandClick(item.id)}
                                    sx={{
                                        py: 0.5,
                                        '&:last-child': { pb: 0.5 },
                                        cursor: 'pointer',
                                    }}
                                >
                                    <Box sx={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <LabelIcon sx={{ fontSize: 16, mr: 1 }} />
                                            <Typography variant='body1' sx={{ fontWeight: 'bold' }}>
                                                {/* {item.provider} /  */}
                                                {item.rulesetName}
                                                {' '}
                                                (
                                                {item.rules.length}
                                                )
                                            </Typography>
                                            <Chip
                                                label={Utils.mapRuleTypeToLabel(item.ruleType)}
                                                size='small'
                                                color='primary'
                                                variant='outlined'
                                                style={{
                                                    height: '18px',
                                                    '& .MuiChip-label': {
                                                        padding: '0 6px',
                                                        fontSize: '0.625rem',
                                                        lineHeight: 1,
                                                    },
                                                }}
                                            />
                                        </Box>
                                        <IconButton
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent card click event
                                                handleExpandClick(item.id);
                                            }}
                                            aria-expanded={expandedItems.includes(item.id)}
                                            aria-label='show more'
                                        >
                                            {expandedItems.includes(item.id)
                                                ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                        </IconButton>
                                    </Box>
                                </CardContent>
                                <Collapse in={expandedItems.includes(item.id)} timeout='auto' unmountOnExit>
                                    <CardContent sx={{
                                        pt: 0,
                                        '& .MuiTableCell-footer': {
                                            border: 0,
                                        },
                                    }}
                                    >
                                        <ListBase
                                            columProps={isPassed ? passedRuleColumnProps : ruleColumProps}
                                            apiCall={() => (isPassed
                                                ? getPassedRuleData(item.rules) : getRuleData(item.rules))}
                                            searchProps={false}
                                            addButtonProps={false}
                                            showActionColumn={false}
                                            useContentBase={false}
                                            emptyBoxProps={{
                                                content: 'There are no rules to display',
                                            }}
                                            options={{
                                                elevation: 0,
                                                setTableProps: () => ({
                                                    size: 'small',
                                                }),
                                                rowsPerPage: 5,
                                            }}
                                        />
                                    </CardContent>
                                </Collapse>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
                {rulesets.length > 5 && (
                    <TablePagination
                        component='div'
                        count={rulesets.length}
                        page={page}
                        onPageChange={handlePageChange}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10, 25]}
                        sx={{ mt: 2 }}
                    />
                )}
            </>
        );
    };

    // Add this new function to calculate total rules
    const getTotalRuleCount = (rulesets) => {
        return rulesets.reduce((sum, ruleset) => sum + ruleset.rules.length, 0);
    };

    const renderEmptyContent = (message) => (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: 3,
            }}
        >
            <RuleIcon
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
                {message}
            </Typography>
        </Box>
    );

    const getEmptyMessage = (tabIndex) => {
        switch (tabIndex) {
            case 0:
                return intl.formatMessage({
                    id: 'Governance.ComplianceDashboard.APICompliance.RuleViolation.empty.errors',
                    defaultMessage: 'No Error violations found',
                });
            case 1:
                return intl.formatMessage({
                    id: 'Governance.ComplianceDashboard.APICompliance.RuleViolation.empty.warnings',
                    defaultMessage: 'No Warning violations found',
                });
            case 2:
                return intl.formatMessage({
                    id: 'Governance.ComplianceDashboard.APICompliance.RuleViolation.empty.info',
                    defaultMessage: 'No Info violations found',
                });
            case 3:
                return intl.formatMessage({
                    id: 'Governance.ComplianceDashboard.APICompliance.RuleViolation.empty.passed',
                    defaultMessage: 'No Passed rules found',
                });
            default:
                return '';
        }
    };

    const renderTabContent = (data, emptyMessage, isPassed = false) => {
        if (!complianceData) {
            return (
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 200,
                }}
                >
                    <CircularProgress />
                </Box>
            );
        }

        return data.length > 0
            ? renderComplianceCards(data, isPassed)
            : renderEmptyContent(emptyMessage);
    };

    return (
        <>
            <Tabs
                value={selectedTab}
                onChange={handleTabChange}
                sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    mb: 2,
                    minHeight: '40px',
                    '& .MuiTab-root': {
                        color: 'text.secondary',
                        minHeight: '40px',
                        padding: '6px 12px',
                        '&.Mui-selected': {
                            color: (theme) => {
                                switch (selectedTab) {
                                    case 0:
                                        return theme.palette.error.main;
                                    case 1:
                                        return theme.palette.warning.main;
                                    case 2:
                                        return theme.palette.info.main;
                                    case 3:
                                        return theme.palette.success.main;
                                    default:
                                        return theme.palette.primary.main;
                                }
                            },
                        },
                    },
                }}
                TabIndicatorProps={{
                    sx: {
                        backgroundColor: (theme) => {
                            switch (selectedTab) {
                                case 0:
                                    return theme.palette.error.main;
                                case 1:
                                    return theme.palette.warning.main;
                                case 2:
                                    return theme.palette.info.main;
                                case 3:
                                    return theme.palette.success.main;
                                default:
                                    return theme.palette.primary.main;
                            }
                        },
                    },
                }}
            >
                <Tab
                    icon={<ReportIcon color='error' />}
                    iconPosition='start'
                    label={intl.formatMessage({
                        id: 'Governance.ComplianceDashboard.APICompliance.RuleViolation.tab.errors',
                        defaultMessage: 'Errors ({count})',
                    }, { count: getTotalRuleCount(complianceDataState.errors) })}
                />
                <Tab
                    icon={<WarningIcon color='warning' />}
                    iconPosition='start'
                    label={intl.formatMessage({
                        id: 'Governance.ComplianceDashboard.APICompliance.RuleViolation.tab.warnings',
                        defaultMessage: 'Warnings ({count})',
                    }, { count: getTotalRuleCount(complianceDataState.warnings) })}
                />
                <Tab
                    icon={<InfoIcon color='info' />}
                    iconPosition='start'
                    label={intl.formatMessage({
                        id: 'Governance.ComplianceDashboard.APICompliance.RuleViolation.tab.info',
                        defaultMessage: 'Info ({count})',
                    }, { count: getTotalRuleCount(complianceDataState.info) })}
                />
                <Tab
                    icon={<CheckCircleIcon color='success' />}
                    iconPosition='start'
                    label={intl.formatMessage({
                        id: 'Governance.ComplianceDashboard.APICompliance.RuleViolation.tab.passed',
                        defaultMessage: 'Passed ({count})',
                    }, { count: getTotalRuleCount(complianceDataState.passed) })}
                />
            </Tabs>
            {selectedTab === 0 && renderTabContent(complianceDataState.errors, getEmptyMessage(0))}
            {selectedTab === 1 && renderTabContent(complianceDataState.warnings, getEmptyMessage(1))}
            {selectedTab === 2 && renderTabContent(complianceDataState.info, getEmptyMessage(2))}
            {selectedTab === 3 && renderTabContent(complianceDataState.passed, getEmptyMessage(3), true)}
        </>
    );
}
