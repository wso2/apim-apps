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

import React, { useEffect, useState } from 'react';
import ContentBase from 'AppComponents/AdminPages/Addons/ContentBase';
import { Link as RouterLink } from 'react-router-dom';
import { Grid, Card, CardContent, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PolicyAdherenceSummaryTable from './PolicyAdherenceSummaryTable';
import RulesetAdherenceSummaryTable from './RulesetAdherenceSummaryTable';
import RuleViolationSummary from './RuleViolationSummary';
import { PieChart } from '@mui/x-charts';
import { Box } from '@mui/system';
import GovernanceAPI from 'AppData/GovernanceAPI';

export default function Compliance(props) {
    const { match: { params: { id: artifactId } } } = props;
    const [statusCounts, setStatusCounts] = useState({ passed: 0, failed: 0 });

    useEffect(() => {
        const abortController = new AbortController();
        const restApi = new GovernanceAPI();

        restApi.getArtifactComplianceByArtifactId(artifactId, { signal: abortController.signal })
            .then((response) => {
                // Get ruleset statuses and count them
                const rulesetStatuses = response.body.governedPolicies.flatMap(policy =>
                    policy.rulesetValidationResults.map(result => result.status)
                );

                const counts = rulesetStatuses.reduce((acc, status) => {
                    if (status === 'PASSED') acc.passed += 1;
                    if (status === 'FAILED') acc.failed += 1;
                    return acc;
                }, { passed: 0, failed: 0 });

                setStatusCounts(counts);
            })
            .catch((error) => {
                if (!abortController.signal.aborted) {
                    console.error('Error fetching ruleset adherence data:', error);
                    setStatusCounts({ passed: 0, failed: 0 });
                }
            });

        return () => {
            abortController.abort();
        };
    }, [artifactId]);

    return (
        <ContentBase
            width='full'
            title="Compliance Summary - Pizzashack API"
            pageStyle='paperLess'
        >
            <Box sx={{ display: 'flex', alignItems: 'center', paddingBottom: 4 }}>
                <RouterLink to={`/governance/overview`} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                    <ArrowBackIcon /> Back to Overview
                </RouterLink>
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
                                Policy Adherence Summary
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
                                Ruleset Adherence
                            </Typography>
                            <PieChart
                                colors={['#2E96FF', '#FF5252']}
                                series={[{
                                    data: [
                                        { id: 0, value: statusCounts.passed, label: `Passed (${statusCounts.passed})` },
                                        { id: 1, value: statusCounts.failed, label: `Failed (${statusCounts.failed})` },
                                    ],
                                    innerRadius: 50,
                                    outerRadius: 100,
                                    paddingAngle: 5,
                                    cornerRadius: 5,
                                    cx: 100,
                                    startAngle: 90,
                                    endAngle: 470
                                }]}
                                width={400}
                                height={200}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={8}>
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
                                Ruleset Adherence Summary
                            </Typography>
                            <RulesetAdherenceSummaryTable artifactId={artifactId} />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </ContentBase>
    );
}
