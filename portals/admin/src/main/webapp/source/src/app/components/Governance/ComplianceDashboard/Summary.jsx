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
import { FormattedMessage, useIntl } from 'react-intl';
import ContentBase from 'AppComponents/AdminPages/Addons/ContentBase';
import { Grid, Card, CardContent, Typography, List, ListItemButton, ListItemIcon, Link, ListItemText, useTheme, Box } from '@mui/material';
import DonutChart from 'AppComponents/Shared/DonutChart';
import DescriptionIcon from '@mui/icons-material/Description';
import HelpBase from 'AppComponents/AdminPages/Addons/HelpBase';
import Configurations from 'Config';
import CONSTS from 'AppData/Constants';
import Utils from 'AppData/Utils';
import ApiComplianceTable from './ApiComplianceTable';
import PolicyAdherenceTable from './PolicyAdherenceTable';
import TableFilterBar from './TableFilterBar';
import GovernanceAPI from 'AppData/GovernanceAPI';

export default function Summary() {
    const intl = useIntl();
    const theme = useTheme();
    const [apiComplianceFilters, setApiComplianceFilters] = useState({
        type: [],
        status: []
    });
    const [policyAdherenceFilters, setPolicyAdherenceFilters] = useState({
        status: []
    });
    const [policyAdherence, setPolicyAdherence] = useState({
        followedPolicies: 0,
        violatedPolicies: 0,
        unAppliedPolicies: 0
    });
    const [apiCompliance, setApiCompliance] = useState({
        compliantArtifacts: 0,
        nonCompliantArtifacts: 0,
        notApplicableArtifacts: 0,
        pendingArtifacts: 0
    });

    useEffect(() => {
        const restApi = new GovernanceAPI();

        Promise.all([
            restApi.getPolicyAdherenceSummary(),
            restApi.getComplianceSummaryForAPIs()
        ])
            .then(([policyResponse, artifactResponse]) => {
                // Set Policy Adherence
                setPolicyAdherence({
                    followedPolicies: policyResponse.body.followed || 0,
                    violatedPolicies: policyResponse.body.violated || 0,
                    unAppliedPolicies: policyResponse.body.unApplied || 0
                });

                // Set API compliance
                setApiCompliance({
                    compliantArtifacts: artifactResponse.body.compliant || 0,
                    nonCompliantArtifacts: artifactResponse.body.nonCompliant || 0,
                    notApplicableArtifacts: artifactResponse.body.notApplicable || 0,
                    pendingArtifacts: artifactResponse.body.pending || 0
                });
            })
            .catch((error) => {
                console.error('Error fetching compliance data:', error);
            });
    }, []);

    const complianceFilterConfig = [
        {
            id: 'type',
            label: intl.formatMessage({
                id: 'Governance.ComplianceDashboard.APICompliance.column.type',
                defaultMessage: 'Type',
            }),
            options: CONSTS.ARTIFACT_TYPES.map((artifactType) => ({
                value: artifactType.value,
                label: artifactType.label,
            })),
        },
        {
            id: 'status',
            label: intl.formatMessage({
                id: 'Governance.ComplianceDashboard.APICompliance.column.status',
                defaultMessage: 'Status',
            }),
            options: CONSTS.COMPLIANCE_STATES.map((state) => ({
                value: state.value,
                label: Utils.mapComplianceStateToLabel(state.value),
            })),
        },
    ];

    const policyAdherenceFilterConfig = [
        {
            id: 'status',
            label: intl.formatMessage({
                id: 'Governance.ComplianceDashboard.PolicyAdherence.column.status',
                defaultMessage: 'Status',
            }),
            options: CONSTS.POLICY_ADHERENCE_STATES.map((state) => ({
                value: state.value,
                label: Utils.mapPolicyAdherenceStateToLabel(state.value),
            })),
        },
    ];

    return (
        <ContentBase
            width='full'
            title={intl.formatMessage({
                id: 'Governance.Compliance.title',
                defaultMessage: 'Compliance Dashboard',
            })}
            pageStyle='paperLess'
            help={(
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
                                        id='Governance.ComplianceDashboard.Summary.help.link'
                                        defaultMessage='Compliance Monitoring'
                                    />
                                )}
                                />
                            </Link>
                        </ListItemButton>
                    </List>
                </HelpBase>
            )}
        >
            <Grid container spacing={4} alignItems='left'>
                <Grid item xs={12} md={6} lg={4}>
                    <Card elevation={3}>
                        <CardContent>
                            <Typography
                                variant='body1'
                                sx={{ fontWeight: 'bold', mb: 2 }}
                            >
                                {intl.formatMessage({
                                    id: 'Governance.ComplianceDashboard.Summary.policy.adherence',
                                    defaultMessage: 'Policy Adherence',
                                })}
                            </Typography>
                            <DonutChart
                                data={[
                                    {
                                        id: 0,
                                        value: policyAdherence.followedPolicies,
                                        label: intl.formatMessage({
                                            id: 'Governance.ComplianceDashboard.Summary.policy.followed',
                                            defaultMessage: 'Followed ({count})',
                                        }, { count: policyAdherence.followedPolicies })
                                    },
                                    {
                                        id: 1,
                                        value: policyAdherence.violatedPolicies,
                                        label: intl.formatMessage({
                                            id: 'Governance.ComplianceDashboard.Summary.policy.violated',
                                            defaultMessage: 'Violated ({count})',
                                        }, { count: policyAdherence.violatedPolicies })
                                    },
                                    {
                                        id: 2,
                                        value: policyAdherence.unAppliedPolicies,
                                        label: intl.formatMessage({
                                            id: 'Governance.ComplianceDashboard.Summary.policy.not.applied',
                                            defaultMessage: 'Not Applied ({count})',
                                        }, { count: policyAdherence.unAppliedPolicies })
                                    }
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
                                {intl.formatMessage({
                                    id: 'Governance.ComplianceDashboard.Summary.compliance',
                                    defaultMessage: 'Compliance',
                                })}
                            </Typography>
                            <DonutChart
                                data={[
                                    {
                                        id: 0,
                                        value: apiCompliance.compliantArtifacts,
                                        label: intl.formatMessage({
                                            id: 'Governance.ComplianceDashboard.Summary.api.compliant',
                                            defaultMessage: 'Compliant ({count})',
                                        }, { count: apiCompliance.compliantArtifacts })
                                    },
                                    {
                                        id: 1,
                                        value: apiCompliance.nonCompliantArtifacts,
                                        label: intl.formatMessage({
                                            id: 'Governance.ComplianceDashboard.Summary.api.non.compliant',
                                            defaultMessage: 'Non-Compliant ({count})',
                                        }, { count: apiCompliance.nonCompliantArtifacts })
                                    },
                                    {
                                        id: 2,
                                        value: apiCompliance.pendingArtifacts,
                                        label: intl.formatMessage({
                                            id: 'Governance.ComplianceDashboard.Summary.api.pending',
                                            defaultMessage: 'Pending ({count})',
                                        }, { count: apiCompliance.pendingArtifacts })
                                    },
                                    {
                                        id: 3,
                                        value: apiCompliance.notApplicableArtifacts,
                                        label: intl.formatMessage({
                                            id: 'Governance.ComplianceDashboard.Summary.api.not.applicable',
                                            defaultMessage: 'Not Applicable ({count})',
                                        }, { count: apiCompliance.notApplicableArtifacts })
                                    }
                                ]}
                                colors={[
                                    theme.palette.charts.success,
                                    theme.palette.charts.error,
                                    theme.palette.charts.warn,
                                    'grey'
                                ]}
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
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    gap: 2,
                                    flexWrap: 'wrap',
                                    mb: 2,
                                }}
                            >
                                <Typography
                                    variant='body1'
                                    sx={{ fontWeight: 'bold' }}
                                >
                                    {intl.formatMessage({
                                        id: 'Governance.ComplianceDashboard.Summary.compliance.details',
                                        defaultMessage: 'Compliance Details',
                                    })}
                                </Typography>
                                <Box sx={{ flex: '1 1 360px', maxWidth: 520 }}>
                                    <TableFilterBar
                                        filters={complianceFilterConfig}
                                        selectedFilters={apiComplianceFilters}
                                        onFiltersChange={setApiComplianceFilters}
                                    />
                                </Box>
                            </Box>
                            <ApiComplianceTable filters={apiComplianceFilters} />
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
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    gap: 2,
                                    flexWrap: 'wrap',
                                    mb: 2,
                                }}
                            >
                                <Typography
                                    variant='body1'
                                    sx={{ fontWeight: 'bold' }}
                                >
                                    {intl.formatMessage({
                                        id: 'Governance.ComplianceDashboard.Summary.policy.adherence.details',
                                        defaultMessage: 'Policy Adherence Details',
                                    })}
                                </Typography>
                                <Box sx={{ flex: '1 1 240px', maxWidth: 520 }}>
                                    <TableFilterBar
                                        filters={policyAdherenceFilterConfig}
                                        selectedFilters={policyAdherenceFilters}
                                        onFiltersChange={setPolicyAdherenceFilters}
                                    />
                                </Box>
                            </Box>
                            <PolicyAdherenceTable filters={policyAdherenceFilters} />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </ContentBase >
    );
}
