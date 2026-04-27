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

import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Chip,
    CircularProgress,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GovernanceAPI from 'AppData/GovernanceAPI';

// ── Static label maps (mirrors FormBuilderStep; extracted here to avoid cross-import) ──

const GRANT_TYPE_LABELS = {
    authorization_code: 'Authorization Code',
    implicit: 'Implicit',
    password: 'Password',
    client_credentials: 'Client Credentials',
    refresh_token: 'Refresh Token',
    'urn:ietf:params:oauth:grant-type:device_code': 'Device Code',
};

const TOKEN_TYPE_LABELS = {
    JWT: 'JWT',
    OAUTH: 'OAuth (Opaque)',
};

const KEY_TYPE_LABELS = {
    PRODUCTION: 'Production',
    SANDBOX: 'Sandbox',
};

/**
 * Metadata describing every formConfig field for human-readable rendering.
 * Shape per entry: { label, section, fieldKey, valueMap?, isArray? }
 */
const FORM_CONFIG_META = [
    {
        sectionKey: 'application',
        sectionLabel: 'Application Details',
        fields: [
            { fieldKey: 'throttlingPolicy', label: 'Throttling Policy' },
            { fieldKey: 'tokenType', label: 'Token Type', valueMap: TOKEN_TYPE_LABELS },
            { fieldKey: 'callbackUrl', label: 'Callback URL' },
        ],
    },
    {
        sectionKey: 'subscription',
        sectionLabel: 'Subscription',
        fields: [
            { fieldKey: 'throttlingPolicy', label: 'Throttling Policy' },
        ],
    },
    {
        sectionKey: 'keyGeneration',
        sectionLabel: 'Key Generation',
        fields: [
            { fieldKey: 'keyType', label: 'Key Type', valueMap: KEY_TYPE_LABELS },
            {
                fieldKey: 'grantTypes', label: 'Grant Types', valueMap: GRANT_TYPE_LABELS, isArray: true,
            },
            { fieldKey: 'validityPeriod', label: 'Validity Period (seconds)' },
            { fieldKey: 'additionalProperties', label: 'Additional Properties', noDefault: true },
        ],
    },
];

// ── File-scope sub-components (stable references, no remounting) ──────────────────────

/**
 * Titled section card with a colored left-border accent.
 */
function SummarySection({ title, children, accentColor = 'primary.main' }) {
    return (
        <Paper
            variant='outlined'
            sx={{ mb: 3, overflow: 'hidden' }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    px: 2,
                    py: 1.25,
                    borderLeft: 4,
                    borderColor: accentColor,
                    bgcolor: 'action.hover',
                }}
            >
                <Typography variant='subtitle1' fontWeight={600}>
                    {title}
                </Typography>
            </Box>
            <Box sx={{ px: 2, py: 2 }}>
                {children}
            </Box>
        </Paper>
    );
}

SummarySection.propTypes = {
    title: PropTypes.node.isRequired,
    children: PropTypes.node.isRequired,
    accentColor: PropTypes.string,
};

SummarySection.defaultProps = {
    accentColor: 'primary.main',
};

/**
 * Two-column label / value row.
 */
function SummaryRow({ label, children }) {
    return (
        <Grid container spacing={1} sx={{ mb: 1.5 }}>
            <Grid item xs={4} sm={3}>
                <Typography variant='body2' color='text.secondary' fontWeight={500}>
                    {label}
                </Typography>
            </Grid>
            <Grid item xs={8} sm={9}>
                {children}
            </Grid>
        </Grid>
    );
}

SummaryRow.propTypes = {
    label: PropTypes.node.isRequired,
    children: PropTypes.node.isRequired,
};

// ── Helper to render a field's default value in a human-readable way ──────────────────

function renderDefaultValue(fieldMeta, fieldConfig) {
    const { valueMap, isArray, noDefault } = fieldMeta;
    const raw = fieldConfig?.defaultValue;

    if (noDefault) {
        return (
            <Typography variant='body2' color='text.secondary' fontStyle='italic'>
                <FormattedMessage
                    id='Governance.Templates.ReviewPublish.field.managedByKM'
                    defaultMessage='Managed by Key Manager'
                />
            </Typography>
        );
    }

    if (raw === undefined || raw === null || raw === '') {
        return (
            <Typography variant='body2' color='text.secondary' fontStyle='italic'>
                <FormattedMessage
                    id='Governance.Templates.ReviewPublish.field.noDefault'
                    defaultMessage='No default'
                />
            </Typography>
        );
    }

    if (raw === -1) {
        return <Typography variant='body2'>Unlimited</Typography>;
    }

    if (isArray && Array.isArray(raw)) {
        if (raw.length === 0) {
            return (
                <Typography variant='body2' color='text.secondary' fontStyle='italic'>
                    <FormattedMessage
                        id='Governance.Templates.ReviewPublish.field.noDefault'
                        defaultMessage='No default'
                    />
                </Typography>
            );
        }
        return (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {raw.map((v) => (
                    <Chip
                        key={v}
                        label={valueMap?.[v] ?? v}
                        size='small'
                        variant='outlined'
                    />
                ))}
            </Box>
        );
    }

    const displayValue = valueMap?.[raw] ?? String(raw);
    return <Typography variant='body2'>{displayValue}</Typography>;
}

// ── Main component ─────────────────────────────────────────────────────────────────────

/**
 * Step 4 of the TemplateWizard: read-only summary of all configured values before save.
 * @param {Object} props
 * @param {Object} props.templateState - full wizard state
 * @returns {JSX}
 */
export default function ReviewPublishStep({ templateState }) {
    const intl = useIntl();
    const {
        name, description, status, isDefault, isGlobal,
        formConfig, rulesetBindings,
    } = templateState;

    const [rulesetMap, setRulesetMap] = useState({});
    const [loadingRulesets, setLoadingRulesets] = useState(false);

    useEffect(() => {
        if (rulesetBindings.length === 0) return;
        setLoadingRulesets(true);
        new GovernanceAPI()
            .getRulesets({ limit: 200, offset: 0 })
            .then((res) => {
                const map = {};
                (res.body?.list ?? []).forEach((r) => { map[r.id] = r.name; });
                setRulesetMap(map);
            })
            .catch(() => {})
            .finally(() => setLoadingRulesets(false));
    }, []);

    // DTO payload for the raw JSON accordion
    const dtoPayload = useMemo(() => ({
        name,
        description,
        status,
        isDefault,
        isGlobal,
        formConfig,
        rulesetBindings,
    }), [name, description, status, isDefault, isGlobal, formConfig, rulesetBindings]);

    return (
        <Box>
            <Typography variant='h6' gutterBottom>
                <FormattedMessage
                    id='Governance.Templates.ReviewPublish.heading'
                    defaultMessage='Review &amp; Publish'
                />
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                <FormattedMessage
                    id='Governance.Templates.ReviewPublish.subheading'
                    defaultMessage='Review the template configuration below. Use the Back button to make changes.'
                />
            </Typography>

            {/* ── Section 1: General Details ── */}
            <SummarySection
                title={intl.formatMessage({
                    id: 'Governance.Templates.ReviewPublish.section.general',
                    defaultMessage: 'General Details',
                })}
                accentColor='primary.main'
            >
                <SummaryRow
                    label={intl.formatMessage({
                        id: 'Governance.Templates.ReviewPublish.label.name',
                        defaultMessage: 'Template Name',
                    })}
                >
                    <Typography variant='body2' fontWeight={500}>{name || '—'}</Typography>
                </SummaryRow>

                <SummaryRow
                    label={intl.formatMessage({
                        id: 'Governance.Templates.ReviewPublish.label.description',
                        defaultMessage: 'Description',
                    })}
                >
                    <Typography
                        variant='body2'
                        color={description ? 'text.primary' : 'text.secondary'}
                        fontStyle={description ? 'normal' : 'italic'}
                    >
                        {description || intl.formatMessage({
                            id: 'Governance.Templates.ReviewPublish.label.noDescription',
                            defaultMessage: 'No description provided',
                        })}
                    </Typography>
                </SummaryRow>

                <SummaryRow
                    label={intl.formatMessage({
                        id: 'Governance.Templates.ReviewPublish.label.status',
                        defaultMessage: 'Status',
                    })}
                >
                    <Chip
                        label={status}
                        size='small'
                        color={status === 'PUBLISHED' ? 'success' : 'default'}
                        variant={status === 'PUBLISHED' ? 'filled' : 'outlined'}
                    />
                </SummaryRow>

                <SummaryRow
                    label={intl.formatMessage({
                        id: 'Governance.Templates.ReviewPublish.label.flags',
                        defaultMessage: 'Flags',
                    })}
                >
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {isDefault && (
                            <Chip
                                label={intl.formatMessage({
                                    id: 'Governance.Templates.ReviewPublish.chip.default',
                                    defaultMessage: 'Default',
                                })}
                                size='small'
                                color='primary'
                            />
                        )}
                        {isGlobal && (
                            <Chip
                                label={intl.formatMessage({
                                    id: 'Governance.Templates.ReviewPublish.chip.global',
                                    defaultMessage: 'Global',
                                })}
                                size='small'
                                color='secondary'
                                variant='outlined'
                            />
                        )}
                        {!isDefault && !isGlobal && (
                            <Typography variant='body2' color='text.secondary' fontStyle='italic'>
                                <FormattedMessage
                                    id='Governance.Templates.ReviewPublish.flags.none'
                                    defaultMessage='None'
                                />
                            </Typography>
                        )}
                    </Box>
                </SummaryRow>
            </SummarySection>

            {/* ── Section 2: Form Configuration ── */}
            <SummarySection
                title={intl.formatMessage({
                    id: 'Governance.Templates.ReviewPublish.section.formConfig',
                    defaultMessage: 'Form Configuration',
                })}
                accentColor='secondary.main'
            >
                {FORM_CONFIG_META.map(({ sectionKey, sectionLabel, fields }) => (
                    <Box key={sectionKey} sx={{ mb: 3 }}>
                        <Typography
                            variant='overline'
                            color='text.secondary'
                            display='block'
                            sx={{ mb: 1 }}
                        >
                            {sectionLabel}
                        </Typography>
                        {fields.map((fieldMeta) => {
                            const fieldConfig = formConfig?.[sectionKey]?.[fieldMeta.fieldKey]
                                ?? { hidden: false, defaultValue: fieldMeta.isArray ? [] : '' };
                            const isHidden = !!fieldConfig.hidden;
                            return (
                                <Grid
                                    key={fieldMeta.fieldKey}
                                    container
                                    spacing={1}
                                    alignItems='flex-start'
                                    sx={{ mb: 1 }}
                                >
                                    <Grid item xs={3}>
                                        <Typography variant='body2' color='text.secondary'>
                                            {fieldMeta.label}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={2}>
                                        <Chip
                                            label={isHidden
                                                ? intl.formatMessage({
                                                    id: 'Governance.Templates.ReviewPublish.field.hidden',
                                                    defaultMessage: 'Hidden',
                                                })
                                                : intl.formatMessage({
                                                    id: 'Governance.Templates.ReviewPublish.field.visible',
                                                    defaultMessage: 'Visible',
                                                })}
                                            size='small'
                                            color={isHidden ? 'warning' : 'default'}
                                            variant={isHidden ? 'filled' : 'outlined'}
                                        />
                                    </Grid>
                                    <Grid item xs={7}>
                                        {isHidden ? (
                                            <Typography variant='body2' color='text.secondary' fontStyle='italic'>
                                                <FormattedMessage
                                                    id='Governance.Templates.ReviewPublish.field.hiddenFromUser'
                                                    defaultMessage='Field hidden from user'
                                                />
                                            </Typography>
                                        ) : (
                                            renderDefaultValue(fieldMeta, fieldConfig)
                                        )}
                                    </Grid>
                                </Grid>
                            );
                        })}
                    </Box>
                ))}
            </SummarySection>

            {/* ── Section 3: Ruleset Bindings ── */}
            <SummarySection
                title={intl.formatMessage({
                    id: 'Governance.Templates.ReviewPublish.section.rulesets',
                    defaultMessage: 'Ruleset Bindings',
                })}
                accentColor='info.main'
            >
                {rulesetBindings.length === 0 ? (
                    <Typography variant='body2' color='text.secondary' fontStyle='italic'>
                        <FormattedMessage
                            id='Governance.Templates.ReviewPublish.rulesets.none'
                            defaultMessage='No rulesets bound to this template'
                        />
                    </Typography>
                ) : (
                    <>
                        {loadingRulesets && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <CircularProgress size={14} />
                                <Typography variant='caption' color='text.secondary'>
                                    <FormattedMessage
                                        id='Governance.Templates.ReviewPublish.rulesets.loading'
                                        defaultMessage='Resolving ruleset names…'
                                    />
                                </Typography>
                            </Box>
                        )}
                        <Table size='small'>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600, width: '10%' }}>
                                        <FormattedMessage
                                            id='Governance.Templates.ReviewPublish.rulesets.col.order'
                                            defaultMessage='Order'
                                        />
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, width: '50%' }}>
                                        <FormattedMessage
                                            id='Governance.Templates.ReviewPublish.rulesets.col.name'
                                            defaultMessage='Ruleset'
                                        />
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>
                                        <FormattedMessage
                                            id='Governance.Templates.ReviewPublish.rulesets.col.scope'
                                            defaultMessage='Key Manager Scope'
                                        />
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {[...rulesetBindings]
                                    .sort((a, b) => a.bindingOrder - b.bindingOrder)
                                    .map((binding) => {
                                        const rulesetName = rulesetMap[binding.rulesetId]
                                            ?? binding.rulesetId;
                                        const scopeLabel = binding.keyManagerScopes.length === 0
                                            ? intl.formatMessage({
                                                id: 'Governance.Templates.ReviewPublish.rulesets.scope.all',
                                                defaultMessage: 'All Key Managers',
                                            })
                                            : intl.formatMessage(
                                                {
                                                    id: 'Governance.Templates.ReviewPublish.rulesets.scope.count',
                                                    defaultMessage: '{count} Key Manager(s)',
                                                },
                                                { count: binding.keyManagerScopes.length },
                                            );
                                        return (
                                            <TableRow key={binding.rulesetId}>
                                                <TableCell>{binding.bindingOrder + 1}</TableCell>
                                                <TableCell>
                                                    <Typography variant='body2'>{rulesetName}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant='body2' color='text.secondary'>
                                                        {scopeLabel}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                            </TableBody>
                        </Table>
                    </>
                )}
            </SummarySection>

            {/* ── Section 4: Raw Payload (collapsible) ── */}
            <Accordion
                elevation={0}
                variant='outlined'
                disableGutters
            >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant='subtitle2' color='text.secondary'>
                        <FormattedMessage
                            id='Governance.Templates.ReviewPublish.section.payload'
                            defaultMessage='Raw JSON Payload'
                        />
                    </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                    <Box
                        component='pre'
                        sx={{
                            m: 0,
                            p: 2,
                            bgcolor: 'grey.50',
                            borderTop: 1,
                            borderColor: 'divider',
                            overflowX: 'auto',
                            fontSize: '0.75rem',
                            fontFamily: 'monospace',
                            lineHeight: 1.6,
                        }}
                    >
                        {JSON.stringify(dtoPayload, null, 2)}
                    </Box>
                </AccordionDetails>
            </Accordion>
        </Box>
    );
}

ReviewPublishStep.propTypes = {
    templateState: PropTypes.shape({
        name: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
        isDefault: PropTypes.bool.isRequired,
        isGlobal: PropTypes.bool.isRequired,
        formConfig: PropTypes.shape({}).isRequired,
        rulesetBindings: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    }).isRequired,
};
