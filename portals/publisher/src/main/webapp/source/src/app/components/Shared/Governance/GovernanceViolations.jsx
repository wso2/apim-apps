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
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { useState, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Grid,
    Typography,
    Box,
    Tooltip,
    Button,
    Link,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import RuleIcon from '@mui/icons-material/Rule';
import DownloadIcon from '@mui/icons-material/Download';
import LaunchIcon from '@mui/icons-material/Launch';
import ListBase from 'AppComponents/Addons/Addons/ListBase';
import Utils from 'AppData/Utils';
import AuthManager from 'AppData/AuthManager';
import GovernanceViolationsSummary, { violationSeverityMap } from './GovernanceViolationsSummary';

const renderEmptyContent = (message) => (
    <Box
        sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 3
        }}
    >
        <RuleIcon
            sx={{
                fontSize: 60,
                color: 'action.disabled',
                mb: 2
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

/**
 * Parse a GENERIC ruleset's violatedPath to extract API UUID, name, similarity, and creator info.
 * Expected format: "Similarity: 85.5% | Matched API: PetStore v1.0 | API_UUID:xxx-yyy-zzz | API_CREATOR:admin"
 */
const parseApiLinkFromViolatedPath = (text) => {
    if (!text || typeof text !== 'string') return null;
    const newFormatMatch = text.match(
        /API_UUID:([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i,
    );
    const legacyFormatMatch = text.match(
        /UUID:\s*([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i,
    );
    const uuidMatch = newFormatMatch || legacyFormatMatch;
    if (!uuidMatch) return null;
    const uuid = uuidMatch[1];
    const nameMatch = text.match(/Matched API:\s*([^|]+?)(?:\s*\||\s*$)/);
    const apiName = nameMatch ? nameMatch[1].trim() : uuid;
    const simMatch = text.match(/Similarity:\s*([\d.]+%)/);
    const similarity = simMatch ? simMatch[1] : null;
    const creatorMatch = text.match(/API_CREATOR:([^|]+?)(?:\s*\||\s*$)/);
    const creator = creatorMatch ? creatorMatch[1].trim() : null;
    return { uuid, apiName, similarity, creator };
};

/**
 * Render violatedPath with clickable API link for GENERIC dedup rulesets.
 * Links are only clickable if the matched API was created by the current user (cross-user privacy).
 */
const renderViolatedPath = (value) => {
    const text = typeof value === 'object' && value !== null
        ? (value.path || String(value))
        : String(value || '');
    const parsed = parseApiLinkFromViolatedPath(text);
    if (parsed) {
        // Check if the matched API belongs to the current user
        let isOwnApi = false;
        try {
            const user = AuthManager.getUser();
            if (user && user.name && parsed.creator) {
                const currentUsername = user.name.includes('@')
                    ? user.name.split('@')[0]
                    : user.name;
                isOwnApi = currentUsername === parsed.creator;
            }
        } catch (e) {
            // If user info unavailable, default to non-clickable for safety
            isOwnApi = false;
        }

        return (
            <Box>
                {parsed.similarity && (
                    <Typography variant='body2' component='span'>
                        {`Similarity: ${parsed.similarity} \u2014 Matched: `}
                    </Typography>
                )}
                {isOwnApi ? (
                    <Link
                        href={`/publisher/apis/${parsed.uuid}/overview`}
                        underline='hover'
                        color='primary'
                        sx={{
                            fontWeight: 500,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5,
                        }}
                    >
                        {parsed.apiName}
                        <LaunchIcon sx={{ fontSize: 14 }} />
                    </Link>
                ) : (
                    <Typography
                        variant='body2'
                        component='span'
                        sx={{ fontWeight: 500 }}
                    >
                        {parsed.apiName}
                    </Typography>
                )}
            </Box>
        );
    }
    return <Typography variant='body2'>{text}</Typography>;
};

export default function GovernanceViolations({ violations }) {
    const intl = useIntl();
    const [expandViolations, setExpandViolations] = useState(true);
    const [selectedSeverity, setSelectedSeverity] = useState(null);

    const EMPTY_MESSAGES = {
        ERROR: intl.formatMessage({
            id: 'Apis.Details.Environments.GovernanceViolations.empty.error',
            defaultMessage: 'No error level governance rule violations found.'
        }),
        WARN: intl.formatMessage({
            id: 'Apis.Details.Environments.GovernanceViolations.empty.warn',
            defaultMessage: 'No warning level governance rule violations found.'
        }),
        INFO: intl.formatMessage({
            id: 'Apis.Details.Environments.GovernanceViolations.empty.info',
            defaultMessage: 'No info level governance rule violations found.'
        }),
        DEFAULT: intl.formatMessage({
            id: 'Apis.Details.Environments.GovernanceViolations.empty.default',
            defaultMessage: 'No governance rule violations found for the selected API.'
        }),
    };

    const getEmptyMessage = (severity) => EMPTY_MESSAGES[severity] || EMPTY_MESSAGES.DEFAULT;

    const columns = useMemo(() => [
        {
            name: 'severity',
            label: intl.formatMessage({
                id: 'Apis.Details.Environments.GovernanceViolations.column.severity',
                defaultMessage: 'Severity'
            }),
            options: {
                sort: false,
                customBodyRender: (value) => violationSeverityMap[value],
                setCellProps: () => ({
                    style: {
                        width: '5%',
                    },
                }),
            },
        },
        {
            name: 'ruleName',
            label: intl.formatMessage({
                id: 'Apis.Details.Environments.GovernanceViolations.column.rule',
                defaultMessage: 'Rule'
            }),
            options: {
                setCellProps: () => ({
                    style: {
                        width: '20%',
                    },
                }),
            }
        },
        {
            name: 'ruleType',
            label: intl.formatMessage({
                id: 'Apis.Details.Environments.GovernanceViolations.column.type',
                defaultMessage: 'Type'
            }),
            options: {
                customBodyRender: (value) => (
                    <Typography
                        variant='body2'
                        component='span'
                        sx={{
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {Utils.mapRuleTypeToLabel(value)}
                    </Typography>
                ),
                setCellProps: () => ({
                    style: {
                        width: '10%',
                    },
                }),
            },
        },
        {
            name: 'violatedPath',
            label: intl.formatMessage({
                id: 'Apis.Details.Environments.GovernanceViolations.column.path',
                defaultMessage: 'Path'
            }),
            options: {
                sort: false,
                customBodyRender: (value) => renderViolatedPath(value),
                setCellProps: () => ({
                    style: {
                        width: '30%',
                    },
                }),
            }
        },
        {
            name: 'message',
            label: intl.formatMessage({
                id: 'Apis.Details.Environments.GovernanceViolations.column.message',
                defaultMessage: 'Message'
            }),
            options: {
                sort: false,
                setCellProps: () => ({
                    style: {
                        width: '35%',
                    },
                }),
            }
        },
    ], []);

    const filteredViolations = useMemo(() => {
        const severityOrder = {
            'ERROR': 0,
            'WARN': 1,
            'INFO': 2
        };

        return (selectedSeverity
            ? violations.filter(v => v.severity === selectedSeverity)
            : violations)
            .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
    }, [violations, selectedSeverity]);

    const handleSeverityChange = (event, value) => {
        event.stopPropagation();
        setSelectedSeverity(value);
        setExpandViolations(true);
    };

    const handleDownload = (event) => {
        event.stopPropagation();
        Utils.downloadAsJSON(violations, 'governance-violations');
    };

    return (
        <Grid item xs={10} md={12} paddingTop={6}>
            <Accordion
                expanded={expandViolations}
                onChange={() => setExpandViolations(!expandViolations)}
            >
                <AccordionSummary
                    expandIcon={<ExpandMore />}
                    aria-controls='governance-violations-content'
                    id='governance-violations-header'
                >
                    <Grid container direction='row' justifyContent='space-between' alignItems='center'>
                        <Grid item>
                            <Typography sx={{ fontWeight: 600 }}>
                                <FormattedMessage
                                    id='Apis.Details.Environments.GovernanceViolations.title'
                                    defaultMessage='Governance Rule Violations'
                                />
                            </Typography>
                        </Grid>
                        <Grid item sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Tooltip
                                title={intl.formatMessage({
                                    id: 'Apis.Details.Environments.GovernanceViolations.download.tooltip',
                                    defaultMessage: 'Download the violations as JSON'
                                })}
                            >
                                <Button
                                    size='small'
                                    onClick={handleDownload}
                                    startIcon={<DownloadIcon />}
                                    sx={{ textTransform: 'none' }}
                                >
                                    <FormattedMessage
                                        id='Apis.Details.Environments.GovernanceViolations.download.button'
                                        defaultMessage='Download as JSON'
                                    />
                                </Button>
                            </Tooltip>
                            <GovernanceViolationsSummary
                                violations={violations}
                                handleChange={handleSeverityChange}
                            />
                        </Grid>
                    </Grid>
                </AccordionSummary>
                <AccordionDetails style={{ padding: 0 }}>
                    <ListBase
                        initialData={filteredViolations}
                        columnProps={columns}
                        searchProps={false}
                        addButtonProps={false}
                        showActionColumn={false}
                        useContentBase={false}
                        options={{
                            elevation: 0,
                            rowsPerPage: 5,
                            setTableProps: () => ({ size: 'small' }),
                        }}
                        emptyBoxProps={{
                            content: renderEmptyContent(getEmptyMessage(selectedSeverity))
                        }}
                    />
                </AccordionDetails>
            </Accordion>
        </Grid>
    );
}
