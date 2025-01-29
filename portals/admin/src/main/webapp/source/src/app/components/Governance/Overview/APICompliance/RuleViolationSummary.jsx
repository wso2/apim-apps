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
import { Grid, Card, CardContent, Typography, Chip, Box, Tabs, Tab, Collapse, IconButton } from '@mui/material';
import ReportIcon from '@mui/icons-material/Report';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import LabelIcon from '@mui/icons-material/Label';
import ListBase from 'AppComponents/AdminPages/Addons/ListBase';
import GovernanceAPI from 'AppData/GovernanceAPI';

// TODO: Improve the component
export default function RuleViolationSummary({ artifactId }) {
    const [selectedTab, setSelectedTab] = React.useState(0);
    // To store expanded state per tab (TODO: Remove this and simplify the component)
    const [expandedCards, setExpandedCards] = React.useState({
        errors: {},
        warnings: {},
        info: {},
        passed: {}
    });

    // TODO: Optimize + simplify
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
                ).then((rulesets) => {
                    // Create rulesets array with severities catagorized
                    const rulesetCategories = rulesets.map(ruleset => ({
                        rulesetName: ruleset.name,
                        error: ruleset.violatedRules.filter(rule => rule.severity === 'ERROR'),
                        warn: ruleset.violatedRules.filter(rule => rule.severity === 'WARN'),
                        info: ruleset.violatedRules.filter(rule => rule.severity === 'INFO'),
                        passed: ruleset.followedRules
                    }));

                    // Group by severity level
                    const severityGroups = {
                        errors: [],
                        warnings: [],
                        info: [],
                        passed: []
                    };

                    rulesetCategories.forEach(ruleset => {
                        if (ruleset.error.length > 0) {
                            severityGroups.errors.push({
                                rulesetName: ruleset.rulesetName,
                                // tag: ruleset.tag,
                                rules: ruleset.error
                            });
                        }
                        if (ruleset.warn.length > 0) {
                            severityGroups.warnings.push({
                                rulesetName: ruleset.rulesetName,
                                // tag: ruleset.tag,
                                rules: ruleset.warn
                            });
                        }
                        if (ruleset.info.length > 0) {
                            severityGroups.info.push({
                                rulesetName: ruleset.rulesetName,
                                // tag: ruleset.tag,
                                rules: ruleset.info
                            });
                        }
                        if (ruleset.passed.length > 0) {
                            severityGroups.passed.push({
                                rulesetName: ruleset.rulesetName,
                                // tag: ruleset.tag,
                                rules: ruleset.passed
                            });
                        }
                    });

                    return severityGroups;
                });
            })
            .catch((error) => {
                console.error('Error fetching ruleset adherence data:', error);
                return {
                    errors: [],
                    warnings: [],
                    info: [],
                    passed: []
                };
            });
    };

    // Remove the mock complianceData and use state instead
    const [complianceData, setComplianceData] = React.useState({
        errors: [],
        warnings: [],
        info: [],
        passed: []
    });

    React.useEffect(() => {
        apiCall().then(setComplianceData);
    }, [artifactId]);

    const handleExpandClick = (index, tabType) => {
        setExpandedCards(prev => ({
            ...prev,
            [tabType]: {
                ...prev[tabType],
                [index]: !prev[tabType][index]
            }
        }));
    };

    const getRuleData = (rules) => {
        return Promise.resolve(
            rules.map(rule => [rule.name, rule.violatedPath, rule.message])
        );
    };

    const ruleColumProps = [
        {
            name: 'name',
            label: 'Rule',
            options: {
                customBodyRender: (value) => (
                    <Typography variant="body2">{value}</Typography>
                ),
            },
        },
        {
            name: 'violatedPath',
            label: 'Path',
            options: {
                customBodyRender: (value) => (
                    <Typography variant="body2">{value}</Typography>
                ),
            },
        },
        {
            name: 'message',
            label: 'Message',
            options: {
                customBodyRender: (value) => (
                    <Typography variant="body2">{value}</Typography>
                ),
            },
        },
    ];

    const renderComplianceCards = (rulesets, tabType) => {
        return (
            <>
                <Grid container spacing={2}>
                    {rulesets.map((item, index) => (
                        <Grid item xs={12} key={index}>
                            <Card>
                                <CardContent sx={{
                                    py: 0.5,
                                    '&:last-child': { pb: 0.5 },
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <LabelIcon sx={{ fontSize: 16, mr: 1 }} />
                                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                                {/* {item.provider} /  */}
                                                {item.rulesetName} ({item.rules.length})
                                            </Typography>
                                            {/* <Chip
                                                label={item.tag}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            /> */}
                                        </Box>
                                        <IconButton
                                            onClick={() => handleExpandClick(index, tabType)}
                                            aria-expanded={expandedCards[tabType][index]}
                                            aria-label="show more"
                                        >
                                            {expandedCards[tabType][index] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                        </IconButton>
                                    </Box>
                                </CardContent>
                                <Collapse in={expandedCards[tabType][index]} timeout="auto" unmountOnExit>
                                    <CardContent sx={{
                                        pt: 0,
                                        '& .MuiTableCell-footer': {
                                            border: 0
                                        },
                                    }}>
                                        <ListBase
                                            columProps={ruleColumProps}
                                            apiCall={() => getRuleData(item.rules)}
                                            searchProps={false}
                                            addButtonProps={false}
                                            showActionColumn={false}
                                            useContentBase={false}
                                            emptyBoxProps={{
                                                title: 'No Rules Found',
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
            </>
        );
    };

    // Add this new function to calculate total rules
    const getTotalRuleCount = (rulesets) => {
        return rulesets.reduce((sum, ruleset) => sum + ruleset.rules.length, 0);
    };

    return (
        <>
            <Tabs
                value={selectedTab}
                onChange={(e, newValue) => setSelectedTab(newValue)}
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
                            }
                        }
                    }
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
                        }
                    }
                }}
            >
                <Tab
                    icon={<ReportIcon color="error" />}
                    iconPosition="start"
                    label={`Errors (${getTotalRuleCount(complianceData.errors)})`}
                />
                <Tab
                    icon={<WarningIcon color="warning" />}
                    iconPosition="start"
                    label={`Warnings (${getTotalRuleCount(complianceData.warnings)})`}
                />
                <Tab
                    icon={<InfoIcon color="info" />}
                    iconPosition="start"
                    label={`Info (${getTotalRuleCount(complianceData.info)})`}
                />
                <Tab
                    icon={<CheckCircleIcon color="success" />}
                    iconPosition="start"
                    label={`Passed (${getTotalRuleCount(complianceData.passed)})`}
                />
            </Tabs>
            {selectedTab === 0 && renderComplianceCards(complianceData.errors, 'errors')}
            {selectedTab === 1 && renderComplianceCards(complianceData.warnings, 'warnings')}
            {selectedTab === 2 && renderComplianceCards(complianceData.info, 'info')}
            {selectedTab === 3 && renderComplianceCards(complianceData.passed, 'passed')}
        </>
    );
}
