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

import React, { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { PieChart } from '@mui/x-charts/PieChart';
import ContentBase from 'AppComponents/AdminPages/Addons/ContentBase';
import { Grid, Card, CardContent, Typography } from '@mui/material';
import ApiComplianceTable from './ApiComplianceTable';
import PolicyAdherenceTable from './PolicyAdherenceTable';
import GovernanceAPI from 'AppData/GovernanceAPI';

export default function Summary() {
    const intl = useIntl();
    const [policyAdherence, setPolicyAdherence] = useState({
        followedPolicies: 0,
        violatedPolicies: 0,
        unAppliedPolicies: 0
    });
    const [apiCompliance, setApiCompliance] = useState({
        compliantArtifacts: 0,
        nonCompliantArtifacts: 0,
        notApplicableArtifacts: 0
    });

    useEffect(() => {
        const restApi = new GovernanceAPI();

        Promise.all([
            restApi.getPolicyAdherenceSummary(),
            restApi.getArtifactComplianceSummary()
        ])
            .then(([policyResponse, artifactResponse]) => {
                // Set Policy Adherence
                setPolicyAdherence({
                    followedPolicies: policyResponse.body.followedPolicies || 0,
                    violatedPolicies: policyResponse.body.violatedPolicies || 0,
                    unAppliedPolicies: policyResponse.body.unAppliedPolicies || 0
                });

                // Set API compliance
                setApiCompliance({
                    compliantArtifacts: artifactResponse.body.compliantArtifacts || 0,
                    nonCompliantArtifacts: artifactResponse.body.nonCompliantArtifacts || 0,
                    notApplicableArtifacts: artifactResponse.body.notApplicableArtifacts || 0
                });
            })
            .catch((error) => {
                console.error('Error fetching compliance data:', error);
            });
    }, []);

    return (
        <ContentBase
            width='full'
            title={intl.formatMessage({
                id: 'Governance.Overview.title',
                defaultMessage: 'Overview',
            })}
            pageStyle='paperLess'
        >
            <Grid container spacing={4} alignItems='left'>
                <Grid item xs={12} md={4}>
                    <Card elevation={3}>
                        <CardContent>
                            <Typography
                                variant='body1'
                                sx={{ fontWeight: 'bold', mb: 2 }}
                            >
                                {intl.formatMessage({
                                    id: 'Governance.Overview.Summary.policy.adherence',
                                    defaultMessage: 'Policy Adherence',
                                })}
                            </Typography>
                            <PieChart
                                colors={['#2E96FF', '#FF5252', 'grey']}
                                series={[{
                                    data: [
                                        { 
                                            id: 0, 
                                            value: policyAdherence.followedPolicies, 
                                            label: intl.formatMessage({
                                                id: 'Governance.Overview.Summary.policy.followed',
                                                defaultMessage: 'Followed ({count})',
                                            }, { count: policyAdherence.followedPolicies })
                                        },
                                        {
                                            id: 1,
                                            value: policyAdherence.violatedPolicies,
                                            label: intl.formatMessage({
                                                id: 'Governance.Overview.Summary.policy.violated',
                                                defaultMessage: 'Violated ({count})',
                                            }, { count: policyAdherence.violatedPolicies })
                                        },
                                        {
                                            id: 2,
                                            value: policyAdherence.unAppliedPolicies,
                                            label: intl.formatMessage({
                                                id: 'Governance.Overview.Summary.policy.not.applied',
                                                defaultMessage: 'Not Applied ({count})',
                                            }, { count: policyAdherence.unAppliedPolicies })
                                        },
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
                <Grid item xs={12} md={4}>
                    <Card elevation={3}>
                        <CardContent>
                            <Typography
                                variant='body1'
                                sx={{ fontWeight: 'bold', mb: 2 }}
                            >
                                {intl.formatMessage({
                                    id: 'Governance.Overview.Summary.api.compliance',
                                    defaultMessage: 'API Compliance',
                                })}
                            </Typography>
                            <PieChart
                                colors={['#2E96FF', '#FF5252', 'grey']}
                                series={[{
                                    data: [
                                        {
                                            id: 0,
                                            value: apiCompliance.compliantArtifacts,
                                            label: intl.formatMessage({
                                                id: 'Governance.Overview.Summary.api.compliant',
                                                defaultMessage: 'Compliant ({count})',
                                            }, { count: apiCompliance.compliantArtifacts })
                                        },
                                        {
                                            id: 1,
                                            value: apiCompliance.nonCompliantArtifacts,
                                            label: intl.formatMessage({
                                                id: 'Governance.Overview.Summary.api.non.compliant',
                                                defaultMessage: 'Non-Compliant ({count})',
                                            }, { count: apiCompliance.nonCompliantArtifacts })
                                        },
                                        {
                                            id: 2,
                                            value: apiCompliance.notApplicableArtifacts,
                                            label: intl.formatMessage({
                                                id: 'Governance.Overview.Summary.api.not.applicable',
                                                defaultMessage: 'Not Applicable ({count})',
                                            }, { count: apiCompliance.notApplicableArtifacts })
                                        },
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
                                {intl.formatMessage({
                                    id: 'Governance.Overview.Summary.api.compliance.details',
                                    defaultMessage: 'API Compliance Details',
                                })}
                            </Typography>
                            <ApiComplianceTable />
                        </CardContent>
                    </Card>
                </Grid>
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
                                {intl.formatMessage({
                                    id: 'Governance.Overview.Summary.policy.adherence.details',
                                    defaultMessage: 'Policy Adherence Details',
                                })}
                            </Typography>
                            <PolicyAdherenceTable />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </ContentBase >
    );
}
