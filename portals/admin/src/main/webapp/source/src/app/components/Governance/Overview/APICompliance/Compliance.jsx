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
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box } from '@mui/system';
import GovernanceAPI from 'AppData/GovernanceAPI';
import { FormattedMessage, useIntl } from 'react-intl';
import DonutChart from 'AppComponents/Shared/DonutChart';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import RuleViolationSummary from './RuleViolationSummary';
import RulesetAdherenceSummaryTable from './RulesetAdherenceSummaryTable';
import PolicyAdherenceSummaryTable from './PolicyAdherenceSummaryTable';

export default function Compliance(props) {
    const intl = useIntl();
    const { match: { params: { id: artifactId } } } = props;
    const [statusCounts, setStatusCounts] = useState({ passed: 0, failed: 0, unapplied: 0 });
    const [artifactName, setArtifactName] = useState('');
    const [artifactOwner, setArtifactOwner] = useState('');
    const [complianceStatus, setComplianceStatus] = useState('');

    useEffect(() => {
        const abortController = new AbortController();
        const restApi = new GovernanceAPI();

        restApi.getComplianceByAPIId(artifactId, { signal: abortController.signal })
            .then((response) => {
                setArtifactName(
                    response.body.info.name + ' :'
                    + response.body.info.version,
                );
                setArtifactOwner(response.body.info.owner);
                setComplianceStatus(response.body.status);
                const rulesetMap = new Map();

                response.body.governedPolicies.forEach((policy) => {
                    policy.rulesetValidationResults.forEach((result) => {
                        if (!rulesetMap.has(result.id)) {
                            rulesetMap.set(result.id, result);
                        }
                    });
                });

                // Count statuses from unique rulesets
                const counts = Array.from(rulesetMap.values()).reduce((acc, result) => {
                    if (result.status === 'PASSED') acc.passed += 1;
                    if (result.status === 'FAILED') acc.failed += 1;
                    if (result.status === 'UNAPPLIED') acc.unapplied += 1;
                    return acc;
                }, { passed: 0, failed: 0, unapplied: 0 });

                setStatusCounts(counts);
            })
            .catch((error) => {
                if (!abortController.signal.aborted) {
                    console.error('Error fetching ruleset adherence data:', error);
                    setStatusCounts({ passed: 0, failed: 0, unapplied: 0 });
                    setArtifactName('');
                }
            });

        return () => {
            abortController.abort();
        };
    }, [artifactId]);

    if (complianceStatus === 'PENDING') {
        return (
            <ContentBase
                width='full'
                title={(
                    <FormattedMessage
                        id='Governance.Overview.Compliance.title'
                        defaultMessage='Compliance Summary - {artifactName}'
                        values={{ artifactName }}
                    />
                )}
                pageStyle='paperLess'
            >
                <Box sx={{ display: 'flex', alignItems: 'center', paddingBottom: 4 }}>
                    <RouterLink
                        to='/governance/overview'
                        style={{
                            display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit',
                        }}
                    >
                        <ArrowBackIcon />
                        <FormattedMessage
                            id='Governance.Overview.Compliance.back.to.overview'
                            defaultMessage='Back to Overview'
                        />
                    </RouterLink>
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
                            id='Governance.Overview.Compliance.check.progress'
                            defaultMessage='Compliance Check in Progress'
                        />
                    </Typography>
                    <Typography
                        variant='body1'
                        color='text.secondary'
                        align='center'
                    >
                        <FormattedMessage
                            id='Governance.Overview.Compliance.check.progress.message'
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
                    id='Governance.Overview.Compliance.title'
                    defaultMessage='Compliance Summary - {artifactName}'
                    values={{ artifactName }}
                />
            )}
            pageStyle='paperLess'
        >
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                paddingBottom: 4,
                justifyContent: 'space-between',
            }}
            >
                <RouterLink
                    to='/governance/overview'
                    style={{
                        display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit',
                    }}
                >
                    <ArrowBackIcon />
                    <FormattedMessage
                        id='Governance.Overview.Compliance.back.to.overview'
                        defaultMessage='Back to Overview'
                    />
                </RouterLink>
                <Typography variant='body2'>
                    <FormattedMessage
                        id='Governance.Overview.Compliance.api.owner'
                        defaultMessage='API Owner: {owner}'
                        values={{ owner: artifactOwner }}
                    />
                </Typography>
            </Box>

            <Grid container spacing={4}>
                {/* Rule Violation Summary section */}
                <Grid item xs={12}>
                    <Card elevation={3}>
                        <CardContent>
                            <RuleViolationSummary artifactId={artifactId} />
                        </CardContent>
                    </Card>
                </Grid>

                {/* Policy Adherence Summary section */}
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
                                    id='Governance.Overview.Compliance.policy.adherence.summary'
                                    defaultMessage='Policy Adherence Summary'
                                />
                            </Typography>
                            <PolicyAdherenceSummaryTable artifactId={artifactId} />
                        </CardContent>
                    </Card>
                </Grid>

                {/* Ruleset Adherence Summary section */}
                <Grid item xs={12} md={4}>
                    <Card elevation={3}>
                        <CardContent>
                            <Typography
                                variant='body1'
                                sx={{ fontWeight: 'bold', mb: 2 }}
                            >
                                <FormattedMessage
                                    id='Governance.Overview.Compliance.ruleset.adherence'
                                    defaultMessage='Ruleset Adherence'
                                />
                            </Typography>
                            <DonutChart
                                colors={['#2E96FF', '#FF5252', 'grey']}
                                data={[
                                    {
                                        id: 0,
                                        value: statusCounts.passed,
                                        label: `${intl.formatMessage({
                                            id: 'Governance.Overview.Compliance.passed',
                                            defaultMessage: 'Passed',
                                        })} (${statusCounts.passed})`,
                                    },
                                    {
                                        id: 1,
                                        value: statusCounts.failed,
                                        label: `${intl.formatMessage({
                                            id: 'Governance.Overview.Compliance.failed',
                                            defaultMessage: 'Failed',
                                        })} (${statusCounts.failed})`,
                                    },
                                    {
                                        id: 2,
                                        value: statusCounts.unapplied,
                                        label: `${intl.formatMessage({
                                            id: 'Apis.Details.Compliance.unapplied',
                                            defaultMessage: 'Unapplied',
                                        })} (${statusCounts.unapplied})`,
                                    },
                                ]}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={8}>
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
                                    id='Governance.Overview.Compliance.ruleset.adherence.summary'
                                    defaultMessage='Ruleset Adherence Summary'
                                />
                            </Typography>
                            <RulesetAdherenceSummaryTable artifactId={artifactId} />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </ContentBase>
    );
}
