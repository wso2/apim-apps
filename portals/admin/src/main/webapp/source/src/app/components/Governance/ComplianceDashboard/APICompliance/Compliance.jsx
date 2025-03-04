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
import ContentBase from 'AppComponents/AdminPages/Addons/ContentBase';
import { Link as RouterLink } from 'react-router-dom';
import {
    Grid, Card, CardContent, Typography,
    List,
    ListItemButton,
    ListItemIcon,
    Link,
    ListItemText,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box } from '@mui/system';
import GovernanceAPI from 'AppData/GovernanceAPI';
import { FormattedMessage, useIntl } from 'react-intl';
import DonutChart from 'AppComponents/Shared/DonutChart';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import DescriptionIcon from '@mui/icons-material/Description';
import HelpBase from 'AppComponents/AdminPages/Addons/HelpBase';
import Configurations from 'Config';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import RuleViolationSummary from './RuleViolationSummary';
import RulesetAdherenceSummaryTable from './RulesetAdherenceSummaryTable';
import PolicyAdherenceSummaryTable from './PolicyAdherenceSummaryTable';

function ComplianceHelp() {
    return (
        <HelpBase>
            <List component='nav'>
                <ListItemButton>
                    <ListItemIcon sx={{ minWidth: 'auto', marginRight: 1 }}>
                        <DescriptionIcon />
                    </ListItemIcon>
                    <Link
                        target='_blank'
                        href={Configurations.app.docUrl
                            + 'governance/api-governance-admin-capabilities/#compliance-monitoring'}
                        underline='hover'
                    >
                        <ListItemText primary={(
                            <FormattedMessage
                                id='Governance.ComplianceDashboard.Compliance.help.link'
                                defaultMessage='Compliance Monitoring'
                            />
                        )}
                        />
                    </Link>
                </ListItemButton>
            </List>
        </HelpBase>
    );
}

export default function Compliance(props) {
    const intl = useIntl();
    const { match: { params: { id: artifactId } } } = props;
    const [statusCounts, setStatusCounts] = useState({ passed: 0, failed: 0, unapplied: 0 });
    const [artifactName, setArtifactName] = useState('');
    const [artifactOwner, setArtifactOwner] = useState('');
    const [policyAdherence, setPolicyAdherence] = useState({
        followedPolicies: 0,
        violatedPolicies: 0,
        pendingPolicies: 0,
        unAppliedPolicies: 0,
    });
    const [complianceStatus, setComplianceStatus] = useState('');
    const [allPoliciesPending, setAllPoliciesPending] = useState(true);
    const [complianceData, setComplianceData] = useState(null);
    const [ruleAdherence, setRuleAdherence] = useState({
        errors: 0,
        warnings: 0,
        info: 0,
        passed: 0,
    });

    useEffect(() => {
        const abortController = new AbortController();
        const restApi = new GovernanceAPI();

        restApi.getComplianceByAPIId(artifactId, { signal: abortController.signal })
            .then(async (response) => {
                setArtifactName(
                    response.body.info.name + ' :'
                    + response.body.info.version,
                );
                setArtifactOwner(response.body.info.owner);
                if (response.body.governedPolicies.length === 0) {
                    setComplianceStatus(response.body.status);
                    return;
                }

                // Check if all policies are pending
                const isPending = response.body.governedPolicies.every(
                    (policy) => policy.status === 'PENDING',
                );
                setAllPoliciesPending(isPending);

                // Calculate policy adherence counts
                const policyCounts = response.body.governedPolicies.reduce((acc, policy) => {
                    if (policy.status === 'FOLLOWED') acc.followedPolicies += 1;
                    if (policy.status === 'VIOLATED') acc.violatedPolicies += 1;
                    if (policy.status === 'PENDING') acc.pendingPolicies += 1;
                    if (policy.status === 'UNAPPLIED') acc.unAppliedPolicies += 1;
                    return acc;
                }, {
                    followedPolicies: 0, violatedPolicies: 0, pendingPolicies: 0, unAppliedPolicies: 0,
                });
                setPolicyAdherence(policyCounts);

                const rulesetMap = new Map();

                response.body.governedPolicies.forEach((policy) => {
                    policy.rulesetValidationResults.forEach((result) => {
                        if (!rulesetMap.has(result.id)) {
                            rulesetMap.set(result.id, result);
                        }
                    });
                });

                // Get validation results and ruleset details for each ruleset
                const rulesetPromises = Array.from(rulesetMap.keys()).map(async (rulesetId) => {
                    const [validationResult, rulesetResult] = await Promise.all([
                        restApi.getRulesetValidationResultsByAPIId(artifactId, rulesetId),
                        restApi.getRulesetById(rulesetId),
                    ]);
                    return {
                        ...validationResult.body,
                        ruleType: rulesetMap.get(rulesetId).ruleType,
                        documentationLink: rulesetResult.body.documentationLink,
                    };
                });

                const rulesets = await Promise.all(rulesetPromises);

                // Count statuses from unique rulesets
                const counts = Array.from(rulesetMap.values()).reduce((acc, result) => {
                    if (result.status === 'PASSED') acc.passed += 1;
                    if (result.status === 'FAILED') acc.failed += 1;
                    if (result.status === 'UNAPPLIED') acc.unapplied += 1;
                    return acc;
                }, { passed: 0, failed: 0, unapplied: 0 });

                // Calculate rule adherence counts
                const ruleCounts = rulesets.reduce((acc, ruleset) => {
                    // Count violated rules by severity
                    ruleset.violatedRules.forEach((rule) => {
                        if (rule.severity === 'ERROR') acc.errors += 1;
                        if (rule.severity === 'WARN') acc.warnings += 1;
                        if (rule.severity === 'INFO') acc.info += 1;
                    });
                    // Count passed rules
                    acc.passed += ruleset.followedRules.length;
                    return acc;
                }, {
                    errors: 0, warnings: 0, info: 0, passed: 0,
                });
                setRuleAdherence(ruleCounts);
                setStatusCounts(counts);
                setComplianceData({
                    governedPolicies: response.body.governedPolicies,
                    rulesets,
                });
            })
            .catch((error) => {
                if (!abortController.signal.aborted) {
                    console.error('Error fetching compliance data:', error);
                    setStatusCounts({ passed: 0, failed: 0, unapplied: 0 });
                    setArtifactName('');
                    setPolicyAdherence({
                        followedPolicies: 0,
                        violatedPolicies: 0,
                        pendingPolicies: 0,
                        unAppliedPolicies: 0,
                    });
                    setRuleAdherence({
                        errors: 0, warnings: 0, info: 0, passed: 0,
                    });
                    setComplianceData(null);
                }
            });

        return () => {
            abortController.abort();
        };
    }, [artifactId]);

    if ((complianceStatus === 'NOT_APPLICABLE' && complianceData?.governedPolicies.length === 0)
        || (complianceStatus === 'NOT_APPLICABLE' && !complianceData)) {
        return (
            <ContentBase
                width='full'
                title={(
                    <FormattedMessage
                        id='Governance.ComplianceDashboard.Compliance.title'
                        defaultMessage='Compliance Summary - {artifactName}'
                        values={{ artifactName }}
                    />
                )}
                pageStyle='paperLess'
                help={<ComplianceHelp />}
            >
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    paddingBottom: 4,
                    justifyContent: 'space-between',
                }}
                >
                    <RouterLink
                        to='/governance/compliance'
                        style={{
                            display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit',
                        }}
                    >
                        <ArrowBackIcon />
                        <FormattedMessage
                            id='Governance.ComplianceDashboard.Compliance.back.to.compliance'
                            defaultMessage='Back to Compliance Dashboard'
                        />
                    </RouterLink>
                    <Typography variant='body2'>
                        <FormattedMessage
                            id='Governance.ComplianceDashboard.Compliance.api.owner'
                            defaultMessage='API Owner: {owner}'
                            values={{ owner: artifactOwner }}
                        />
                    </Typography>
                </Box>
                <Card
                    elevation={3}
                    sx={{
                        mt: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: 4,
                    }}
                >
                    <AssignmentLateIcon
                        sx={{
                            fontSize: 60,
                            color: 'action.disabled',
                            mb: 2,
                        }}
                    />
                    <Typography
                        variant='h5'
                        color='text.secondary'
                        gutterBottom
                        sx={{ fontWeight: 'medium' }}
                    >
                        <FormattedMessage
                            id='Apis.Details.Compliance.not.applicable.message'
                            defaultMessage='No governance policies have been attached to this API.'
                        />
                    </Typography>
                    <Typography
                        variant='body1'
                        color='text.secondary'
                        align='center'
                    >
                        <FormattedMessage
                            id='Governance.ComplianceDashboard.Compliance.not.applicable.description'
                            defaultMessage={'Please attach governance policies to the API '
                                + 'to view the compliance status.'}
                        />
                    </Typography>
                </Card>
            </ContentBase>
        );
    }

    if (complianceStatus === 'PENDING') {
        return (
            <ContentBase
                width='full'
                title={(
                    <FormattedMessage
                        id='Governance.ComplianceDashboard.Compliance.title'
                        defaultMessage='Compliance Summary - {artifactName}'
                        values={{ artifactName }}
                    />
                )}
                pageStyle='paperLess'
                help={<ComplianceHelp />}
            >
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    paddingBottom: 4,
                    justifyContent: 'space-between',
                }}
                >
                    <RouterLink
                        to='/governance/compliance'
                        style={{
                            display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit',
                        }}
                    >
                        <ArrowBackIcon />
                        <FormattedMessage
                            id='Governance.ComplianceDashboard.Compliance.back.to.compliance'
                            defaultMessage='Back to Compliance Dashboard'
                        />
                    </RouterLink>
                    <Typography variant='body2'>
                        <FormattedMessage
                            id='Governance.ComplianceDashboard.Compliance.api.owner'
                            defaultMessage='API Owner: {owner}'
                            values={{ owner: artifactOwner }}
                        />
                    </Typography>
                </Box>
                <Card
                    elevation={3}
                    sx={{
                        mt: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: 4,
                    }}
                >
                    <HourglassEmptyIcon
                        sx={{
                            fontSize: 60,
                            color: 'action.disabled',
                            mb: 2,
                        }}
                    />
                    <Typography
                        variant='h5'
                        color='text.secondary'
                        gutterBottom
                        sx={{ fontWeight: 'medium' }}
                    >
                        <FormattedMessage
                            id='Governance.ComplianceDashboard.Compliance.check.progress'
                            defaultMessage='Compliance Check in Progress'
                        />
                    </Typography>
                    <Typography
                        variant='body1'
                        color='text.secondary'
                        align='center'
                    >
                        <FormattedMessage
                            id='Governance.ComplianceDashboard.Compliance.check.progress.message'
                            defaultMessage='The compliance check is currently in progress. This may take a few moments.'
                        />
                    </Typography>
                </Card>
            </ContentBase>
        );
    }

    return (
        <ContentBase
            width='full'
            title={(
                <FormattedMessage
                    id='Governance.ComplianceDashboard.Compliance.title'
                    defaultMessage='Compliance Summary - {artifactName}'
                    values={{ artifactName }}
                />
            )}
            pageStyle='paperLess'
            help={<ComplianceHelp />}
        >
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                paddingBottom: 4,
                justifyContent: 'space-between',
            }}
            >
                <RouterLink
                    to='/governance/compliance'
                    style={{
                        display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit',
                    }}
                >
                    <ArrowBackIcon />
                    <FormattedMessage
                        id='Governance.ComplianceDashboard.Compliance.back.to.compliance'
                        defaultMessage='Back to Compliance Dashboard'
                    />
                </RouterLink>
                <Typography variant='body2'>
                    <FormattedMessage
                        id='Governance.ComplianceDashboard.Compliance.api.owner'
                        defaultMessage='API Owner: {owner}'
                        values={{ owner: artifactOwner }}
                    />
                </Typography>
            </Box>

            <Grid container spacing={4}>
                {!allPoliciesPending && (
                    <>
                        {/* Charts section */}
                        <Grid item xs={12} md={6} lg={4}>
                            <Card elevation={3}>
                                <CardContent>
                                    <Typography
                                        variant='body1'
                                        sx={{ fontWeight: 'bold', mb: 2 }}
                                    >
                                        <FormattedMessage
                                            id='Governance.ComplianceDashboard.Compliance.policy.adherence'
                                            defaultMessage='Policy Adherence'
                                        />
                                    </Typography>
                                    <DonutChart
                                        colors={['#00B81D', '#FF5252', '#FFC107', 'grey']}
                                        data={[
                                            {
                                                id: 0,
                                                value: policyAdherence.followedPolicies,
                                                label: intl.formatMessage({
                                                    id: 'Governance.ComplianceDashboard.Compliance.followed',
                                                    defaultMessage: 'Followed ({count})',
                                                }, { count: policyAdherence.followedPolicies }),
                                            },
                                            {
                                                id: 1,
                                                value: policyAdherence.violatedPolicies,
                                                label: intl.formatMessage({
                                                    id: 'Governance.ComplianceDashboard.Compliance.violated',
                                                    defaultMessage: 'Violated ({count})',
                                                }, { count: policyAdherence.violatedPolicies }),
                                            },
                                            {
                                                id: 2,
                                                value: policyAdherence.pendingPolicies,
                                                label: intl.formatMessage({
                                                    id: 'Governance.ComplianceDashboard.Compliance.pending',
                                                    defaultMessage: 'Pending ({count})',
                                                }, { count: policyAdherence.pendingPolicies }),
                                            },
                                            {
                                                id: 3,
                                                value: policyAdherence.unAppliedPolicies,
                                                label: intl.formatMessage({
                                                    id: 'Governance.ComplianceDashboard.Compliance.not.applied',
                                                    defaultMessage: 'Not Applied ({count})',
                                                }, { count: policyAdherence.unAppliedPolicies }),
                                            },
                                        ]}
                                    />
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6} lg={4}>
                            <Card elevation={3}>
                                <CardContent>
                                    <Typography
                                        variant='body1'
                                        sx={{ fontWeight: 'bold', mb: 2 }}
                                    >
                                        <FormattedMessage
                                            id='Governance.ComplianceDashboard.Compliance.ruleset.adherence'
                                            defaultMessage='Ruleset Adherence'
                                        />
                                    </Typography>
                                    <DonutChart
                                        colors={['#00B81D', '#FF5252', 'grey']}
                                        data={[
                                            {
                                                id: 0,
                                                value: statusCounts.passed,
                                                label: `${intl.formatMessage({
                                                    id: 'Governance.ComplianceDashboard.Compliance.passed',
                                                    defaultMessage: 'Passed',
                                                })} (${statusCounts.passed})`,
                                            },
                                            {
                                                id: 1,
                                                value: statusCounts.failed,
                                                label: `${intl.formatMessage({
                                                    id: 'Governance.ComplianceDashboard.Compliance.failed',
                                                    defaultMessage: 'Failed',
                                                })} (${statusCounts.failed})`,
                                            },
                                            {
                                                id: 2,
                                                value: statusCounts.unapplied,
                                                label: `${intl.formatMessage({
                                                    id: 'Governance.ComplianceDashboard.Compliance.unapplied',
                                                    defaultMessage: 'Unapplied',
                                                })} (${statusCounts.unapplied})`,
                                            },
                                        ]}
                                    />
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6} lg={4}>
                            <Card elevation={3}>
                                <CardContent>
                                    <Typography
                                        variant='body1'
                                        sx={{ fontWeight: 'bold', mb: 2 }}
                                    >
                                        <FormattedMessage
                                            id='Governance.ComplianceDashboard.Compliance.rule.adherence'
                                            defaultMessage='Rule Adherence'
                                        />
                                    </Typography>
                                    <DonutChart
                                        colors={['#FF5252', '#FFC107', '#2E96FF', '#00B81D']}
                                        data={[
                                            {
                                                id: 0,
                                                value: ruleAdherence.errors,
                                                label: intl.formatMessage({
                                                    id: 'Governance.ComplianceDashboard.Compliance.rules.errors',
                                                    defaultMessage: 'Errors ({count})',
                                                }, { count: ruleAdherence.errors }),
                                            },
                                            {
                                                id: 1,
                                                value: ruleAdherence.warnings,
                                                label: intl.formatMessage({
                                                    id: 'Governance.ComplianceDashboard.Compliance.rules.warnings',
                                                    defaultMessage: 'Warnings ({count})',
                                                }, { count: ruleAdherence.warnings }),
                                            },
                                            {
                                                id: 2,
                                                value: ruleAdherence.info,
                                                label: intl.formatMessage({
                                                    id: 'Governance.ComplianceDashboard.Compliance.rules.info',
                                                    defaultMessage: 'Info ({count})',
                                                }, { count: ruleAdherence.info }),
                                            },
                                            {
                                                id: 3,
                                                value: ruleAdherence.passed,
                                                label: intl.formatMessage({
                                                    id: 'Governance.ComplianceDashboard.Compliance.rules.passed',
                                                    defaultMessage: 'Passed ({count})',
                                                }, { count: ruleAdherence.passed }),
                                            },
                                        ]}
                                    />
                                </CardContent>
                            </Card>
                        </Grid>
                    </>
                )}

                {/* Policy Adherence Summary section - always shown */}
                <Grid item xs={12}>
                    <Card
                        elevation={3}
                        sx={{
                            '& .MuiTableCell-footer': {
                                border: 0,
                            },
                        }}
                    >
                        <CardContent>
                            <Typography
                                variant='body1'
                                sx={{ fontWeight: 'bold', mb: 2 }}
                            >
                                <FormattedMessage
                                    id='Governance.ComplianceDashboard.Compliance.policy.adherence.summary'
                                    defaultMessage='Policy Adherence Summary'
                                />
                            </Typography>
                            <PolicyAdherenceSummaryTable
                                artifactId={artifactId}
                                complianceData={complianceData}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                {!allPoliciesPending && (
                    <>
                        {/* Ruleset Adherence Summary section */}
                        <Grid item xs={12} md={12}>
                            <Card
                                elevation={3}
                                sx={{
                                    '& .MuiTableCell-footer': {
                                        border: 0,
                                    },
                                }}
                            >
                                <CardContent>
                                    <Typography
                                        variant='body1'
                                        sx={{ fontWeight: 'bold', mb: 2 }}
                                    >
                                        <FormattedMessage
                                            id='Governance.ComplianceDashboard.Compliance.ruleset.adherence.summary'
                                            defaultMessage='Ruleset Adherence Summary'
                                        />
                                    </Typography>
                                    <RulesetAdherenceSummaryTable
                                        artifactId={artifactId}
                                        complianceData={complianceData}
                                    />
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Rule Violation Summary section */}
                        <Grid item xs={12}>
                            <Card elevation={3}>
                                <CardContent>
                                    <RuleViolationSummary
                                        artifactId={artifactId}
                                        complianceData={complianceData}
                                    />
                                </CardContent>
                            </Card>
                        </Grid>
                    </>
                )}
            </Grid>
        </ContentBase>
    );
}
