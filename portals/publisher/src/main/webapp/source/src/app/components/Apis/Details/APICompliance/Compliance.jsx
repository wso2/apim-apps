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
import { styled } from '@mui/material/styles';
import { Grid, Card, CardContent, Typography } from '@mui/material';
import DonutChart from 'AppComponents/Shared/DonutChart';
import { FormattedMessage, useIntl } from 'react-intl';
import GovernanceAPI from 'AppData/GovernanceAPI';
import { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PolicyAdherenceSummaryTable from './PolicyAdherenceSummaryTable';
import RulesetAdherenceSummaryTable from './RulesetAdherenceSummaryTable';
import RuleViolationSummary from './RuleViolationSummary';

const PREFIX = 'Compliance';

const classes = {
    root: `${PREFIX}-root`,
};

const Root = styled('div')(({ theme }) => ({
    [`& .${classes.root}`]: {
        ...theme.mixins.gutters(),
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
    },
}));

export default function Compliance() {
    const intl = useIntl();
    const [api] = useAPI();
    const artifactId = api.id;
    const [statusCounts, setStatusCounts] = useState({ passed: 0, failed: 0, unapplied: 0 });
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
        // Skip the API call if this is a revision
        if (api.isRevision) {
            return undefined;
        }

        const abortController = new AbortController();
        const restApi = new GovernanceAPI();

        restApi.getComplianceByAPIId(artifactId, { signal: abortController.signal })
            .then(async (response) => {
                if (response.body.governedPolicies.length === 0) {
                    setComplianceStatus(response.body.status);
                    return;
                }

                // Check if all policies are pending
                const isPending = response.body.governedPolicies.every(
                    policy => policy.status === 'PENDING'
                );
                setAllPoliciesPending(isPending);

                // Calculate policy adherence counts
                const policyCounts = response.body.governedPolicies.reduce((acc, policy) => {
                    if (policy.status === 'FOLLOWED') acc.followedPolicies += 1;
                    if (policy.status === 'VIOLATED') acc.violatedPolicies += 1;
                    if (policy.status === 'PENDING') acc.pendingPolicies += 1;
                    if (policy.status === 'UNAPPLIED') acc.unAppliedPolicies += 1;
                    return acc;
                }, { followedPolicies: 0, violatedPolicies: 0, pendingPolicies: 0, unAppliedPolicies: 0 });
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
                const rulesetPromises = Array.from(rulesetMap.keys()).map(async rulesetId => {
                    const [validationResult, rulesetResult] = await Promise.all([
                        restApi.getRulesetValidationResultsByAPIId(artifactId, rulesetId),
                        restApi.getRulesetById(rulesetId)
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
                    ruleset.violatedRules.forEach(rule => {
                        if (rule.severity === 'ERROR') acc.errors += 1;
                        if (rule.severity === 'WARN') acc.warnings += 1;
                        if (rule.severity === 'INFO') acc.info += 1;
                    });
                    // Count passed rules
                    acc.passed += ruleset.followedRules.length;
                    return acc;
                }, { errors: 0, warnings: 0, info: 0, passed: 0 });

                setRuleAdherence(ruleCounts);
                setStatusCounts(counts);
                setComplianceData({
                    governedPolicies: response.body.governedPolicies,
                    rulesets
                });
            })
            .catch((error) => {
                if (!abortController.signal.aborted) {
                    console.error('Error fetching compliance data:', error);
                    setStatusCounts({ passed: 0, failed: 0, unapplied: 0 });
                    setPolicyAdherence({
                        followedPolicies: 0,
                        violatedPolicies: 0,
                        pendingPolicies: 0,
                        unAppliedPolicies: 0
                    });
                    setRuleAdherence({ errors: 0, warnings: 0, info: 0, passed: 0 });
                    setComplianceData(null);
                }
            });

        return () => {
            abortController.abort();
        };
    }, [artifactId, api.isRevision]);

    if (api.isRevision) {
        return (
            <Root>
                <Typography variant='h4' component='h2' align='left'>
                    <FormattedMessage
                        id='Apis.Details.Compliance.topic.header'
                        defaultMessage='Compliance Summary'
                    />
                </Typography>
                <Grid container spacing={4}>
                    {/* Rule Violation Summary section */}
                    <Grid item xs={12}>
                        <Card elevation={3}
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                minHeight: 200,
                                backgroundColor: 'background.paper',
                                padding: 2,
                                borderRadius: 1,
                            }}
                        >
                            <Typography variant='h5' component='div' color='text.secondary'>
                                <FormattedMessage
                                    id='Apis.Details.Compliance.revision.message'
                                    defaultMessage={'Compliance summary is not available for API revisions.'
                                        + ' Please navigate to the current API version to view the compliance summary.'}
                                />
                            </Typography>
                        </Card>
                    </Grid>
                </Grid>
            </Root>
        );
    }

    if ((complianceStatus === 'NOT_APPLICABLE' && complianceData?.governedPolicies.length === 0)
        || (complianceStatus === 'NOT_APPLICABLE' && !complianceData)) {
        return (
            <Root>
                <Typography variant='h4' component='h2' align='left'>
                    <FormattedMessage
                        id='Apis.Details.Compliance.topic.header'
                        defaultMessage='Compliance Summary'
                    />
                </Typography>
                <Card
                    elevation={3}
                    sx={{
                        mt: 2,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: 200,
                        backgroundColor: 'background.paper',
                        padding: 2,
                        borderRadius: 1,
                    }}
                >
                    <Typography variant='h5' component='div' color='text.secondary'>
                        <FormattedMessage
                            id='Apis.Details.Compliance.not.applicable.message'
                            defaultMessage='No governance policies have been attached to this API.'
                        />
                    </Typography>
                </Card>
            </Root>
        );
    }

    if (complianceStatus === 'PENDING') {
        return (
            <Root>
                <Typography variant='h4' component='h2' align='left'>
                    <FormattedMessage
                        id='Apis.Details.Compliance.topic.header'
                        defaultMessage='Compliance Summary'
                    />
                </Typography>
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
                            id='Apis.Details.Compliance.check.progress'
                            defaultMessage='Compliance Check in Progress'
                        />
                    </Typography>
                    <Typography
                        variant='body1'
                        color='text.secondary'
                        align='center'
                    >
                        <FormattedMessage
                            id='Apis.Details.Compliance.check.progress.message'
                            defaultMessage='The compliance check is currently in progress. This may take a few moments.'
                        />
                    </Typography>
                </Card>
            </Root>
        );
    }

    return (
        <Root>
            <Typography variant='h4' component='h2' align='left'>
                <FormattedMessage
                    id='Apis.Details.Compliance.topic.header'
                    defaultMessage='Compliance Summary'
                />
            </Typography>
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
                                            id='Apis.Details.Compliance.policy.adherence'
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
                                                    id: 'Apis.Details.Compliance.followed',
                                                    defaultMessage: 'Followed ({count})',
                                                }, { count: policyAdherence.followedPolicies })
                                            },
                                            {
                                                id: 1,
                                                value: policyAdherence.violatedPolicies,
                                                label: intl.formatMessage({
                                                    id: 'Apis.Details.Compliance.violated',
                                                    defaultMessage: 'Violated ({count})',
                                                }, { count: policyAdherence.violatedPolicies })
                                            },
                                            {
                                                id: 2,
                                                value: policyAdherence.pendingPolicies,
                                                label: intl.formatMessage({
                                                    id: 'Apis.Details.Compliance.pending',
                                                    defaultMessage: 'Pending ({count})',
                                                }, { count: policyAdherence.pendingPolicies })
                                            },
                                            {
                                                id: 3,
                                                value: policyAdherence.unAppliedPolicies,
                                                label: intl.formatMessage({
                                                    id: 'Apis.Details.Compliance.not.applied',
                                                    defaultMessage: 'Not Applied ({count})',
                                                }, { count: policyAdherence.unAppliedPolicies })
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
                                            id='Apis.Details.Compliance.ruleset.adherence'
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
                                                    id: 'Apis.Details.Compliance.passed',
                                                    defaultMessage: 'Passed'
                                                })} (${statusCounts.passed})`
                                            },
                                            {
                                                id: 1,
                                                value: statusCounts.failed,
                                                label: `${intl.formatMessage({
                                                    id: 'Apis.Details.Compliance.failed',
                                                    defaultMessage: 'Failed'
                                                })} (${statusCounts.failed})`
                                            },
                                            {
                                                id: 2,
                                                value: statusCounts.unapplied,
                                                label: `${intl.formatMessage({
                                                    id: 'Apis.Details.Compliance.unapplied',
                                                    defaultMessage: 'Unapplied'
                                                })} (${statusCounts.unapplied})`
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
                                            id='Apis.Details.Compliance.rule.adherence'
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
                                                    id: 'Apis.Details.Compliance.rules.errors',
                                                    defaultMessage: 'Errors ({count})',
                                                }, { count: ruleAdherence.errors })
                                            },
                                            {
                                                id: 1,
                                                value: ruleAdherence.warnings,
                                                label: intl.formatMessage({
                                                    id: 'Apis.Details.Compliance.rules.warnings',
                                                    defaultMessage: 'Warnings ({count})',
                                                }, { count: ruleAdherence.warnings })
                                            },
                                            {
                                                id: 2,
                                                value: ruleAdherence.info,
                                                label: intl.formatMessage({
                                                    id: 'Apis.Details.Compliance.rules.info',
                                                    defaultMessage: 'Info ({count})',
                                                }, { count: ruleAdherence.info })
                                            },
                                            {
                                                id: 3,
                                                value: ruleAdherence.passed,
                                                label: intl.formatMessage({
                                                    id: 'Apis.Details.Compliance.rules.passed',
                                                    defaultMessage: 'Passed ({count})',
                                                }, { count: ruleAdherence.passed })
                                            },
                                        ]}
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

                        {/* Ruleset Adherence Summary section */}
                        <Grid item xs={12} md={12}>
                            <Card elevation={3} sx={{
                                '& .MuiTableCell-footer': {
                                    border: 0
                                },
                            }}>
                                <CardContent>
                                    <Typography
                                        variant='body1'
                                        sx={{ fontWeight: 'bold', mb: 2 }}
                                    >
                                        <FormattedMessage
                                            id='Apis.Details.Compliance.ruleset.adherence.summary'
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
                    </>
                )}

                {/* Policy Adherence Summary section - always shown */}
                <Grid item xs={12}>
                    <Card elevation={3}
                        sx={{
                            '& .MuiTableCell-footer': {
                                border: 0
                            },
                        }}>
                        <CardContent>
                            <Typography
                                variant='body1'
                                sx={{ fontWeight: 'bold', mb: 2 }}
                            >
                                <FormattedMessage
                                    id='Apis.Details.Compliance.policy.adherence.summary'
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
            </Grid>
        </Root>
    );
}
