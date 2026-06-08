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
    Alert,
    Box,
    Chip,
    CircularProgress,
    Divider,
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

// ── Label maps ────────────────────────────────────────────────────────────────

const GRANT_TYPE_LABELS = {
    authorization_code: 'Authorization Code',
    implicit: 'Implicit',
    password: 'Password',
    client_credentials: 'Client Credentials',
    refresh_token: 'Refresh Token',
    'urn:ietf:params:oauth:grant-type:device_code': 'Device Code',
    'urn:ietf:params:oauth:grant-type:token-exchange': 'Token Exchange',
};

/**
 * Metadata for formConfig fields — application section only.
 * Key Manager governance is rendered dynamically from formConfig.keyManagers.
 */
const FORM_CONFIG_META = [
    {
        sectionKey: 'application',
        sectionLabel: 'Application Details',
        fields: [
            { fieldKey: 'throttlingPolicy', label: 'Throttling Policy' },
            { fieldKey: 'description', label: 'Description' },
            { fieldKey: 'groups', label: 'Application Groups' },
        ],
    },
];

const KM_FIELD_META = [
    {
        fieldKey: 'grantTypes',
        label: 'Grant Types',
        valueMap: GRANT_TYPE_LABELS,
        isArray: true,
    },
    { fieldKey: 'callbackUrl', label: 'Callback URL' },
    { fieldKey: 'appAccessTokenExpiry', label: 'App Access Token Expiry (s)' },
    { fieldKey: 'userAccessTokenExpiry', label: 'User Access Token Expiry (s)' },
    { fieldKey: 'refreshTokenExpiry', label: 'Refresh Token Expiry (s)' },
    { fieldKey: 'idTokenExpiry', label: 'ID Token Expiry (s)' },
    { fieldKey: 'enablePKCE', label: 'Enable PKCE' },
    { fieldKey: 'pkceSupportsPlainText', label: 'Allow PKCE Plain Text' },
    { fieldKey: 'publicClient', label: 'Public Client' },
];

function getRulesetAppliesToLabel(intl, binding, ruleset) {
    const isOAuthRuleset = ruleset?.ruleType === 'APP_OAUTH';
    if (!isOAuthRuleset) {
        return intl.formatMessage({
            id: 'Governance.Templates.ReviewPublish.rulesets.scope.applicationDetails',
            defaultMessage: 'Application Details',
        });
    }

    if (binding.keyManagerScopes.length === 0) {
        return intl.formatMessage({
            id: 'Governance.Templates.ReviewPublish.rulesets.scope.all',
            defaultMessage: 'All Allowed Key Managers',
        });
    }

    return intl.formatMessage(
        {
            id: 'Governance.Templates.ReviewPublish.rulesets.scope.count',
            defaultMessage: '{count} Key Manager(s)',
        },
        { count: binding.keyManagerScopes.length },
    );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SummarySection({ title, children, accentColor = 'primary.main' }) {
    return (
        <Paper
            variant='outlined'
            sx={{
                mb: 3,
                width: '100%',
                boxSizing: 'border-box',
                minWidth: 0,
                maxWidth: '100%',
                overflow: 'hidden',
            }}
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
                <Typography variant='subtitle1' fontWeight={600}>{title}</Typography>
            </Box>
            {/* prose content (developer summary, limitations) wraps; tabular content
                inside its own container can still scroll horizontally with its own sx. */}
            <Box
                sx={{
                    px: 2,
                    py: 2,
                    minWidth: 0,
                    maxWidth: '100%',
                    overflowX: 'hidden',
                    overflowWrap: 'anywhere',
                }}
            >
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
SummarySection.defaultProps = { accentColor: 'primary.main' };

function SummaryRow({ label, children }) {
    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: {
                    xs: '1fr',
                    md: 'minmax(140px, 220px) minmax(0, 1fr)',
                },
                gap: { xs: 0.75, md: 2 },
                alignItems: 'flex-start',
                mb: 1.5,
                minWidth: 0,
                maxWidth: '100%',
                overflowX: 'hidden',
            }}
        >
            <Typography
                variant='body2'
                color='text.secondary'
                fontWeight={500}
                sx={{
                    minWidth: 0,
                    overflowWrap: 'anywhere',
                    wordBreak: 'break-word',
                }}
            >
                {label}
            </Typography>
            <Box
                sx={{
                    minWidth: 0,
                    maxWidth: '100%',
                    overflowX: 'hidden',
                    overflowWrap: 'anywhere',
                    wordBreak: 'break-all',
                }}
            >
                {children}
            </Box>
        </Box>
    );
}
SummaryRow.propTypes = { label: PropTypes.node.isRequired, children: PropTypes.node.isRequired };

function ConfigSummaryRow({
    label, visibilityChip, requiredChip, children,
}) {
    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: {
                    xs: '1fr',
                    md: 'minmax(140px, 220px) minmax(0, 1fr)',
                },
                gap: { xs: 0.75, md: 2 },
                alignItems: 'flex-start',
                width: '100%',
                boxSizing: 'border-box',
                minWidth: 0,
                maxWidth: '100%',
                overflowX: 'hidden',
                py: 1,
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-child': { borderBottom: 'none' },
            }}
        >
            <Typography
                variant='body2'
                color='text.secondary'
                sx={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
            >
                {label}
            </Typography>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'auto auto minmax(0, 1fr)',
                    },
                    alignItems: 'flex-start',
                    gap: 1,
                    minWidth: 0,
                    maxWidth: '100%',
                    overflowX: 'hidden',
                }}
            >
                <Box sx={{ minWidth: 0, maxWidth: '100%', justifySelf: 'start' }}>{visibilityChip}</Box>
                <Box sx={{ minWidth: 0, maxWidth: '100%', justifySelf: 'start' }}>{requiredChip}</Box>
                <Box
                    sx={{
                        minWidth: 0,
                        maxWidth: '100%',
                        overflowX: 'hidden',
                        overflowWrap: 'anywhere',
                        wordBreak: 'break-all',
                    }}
                >
                    {children}
                </Box>
            </Box>
        </Box>
    );
}

ConfigSummaryRow.propTypes = {
    label: PropTypes.node.isRequired,
    visibilityChip: PropTypes.node.isRequired,
    requiredChip: PropTypes.node.isRequired,
    children: PropTypes.node.isRequired,
};

function TextSummaryBlock({ label, children }) {
    return (
        <Box
            sx={{
                mb: 2,
                minWidth: 0,
                maxWidth: '100%',
                overflowX: 'hidden',
            }}
        >
            <Typography
                variant='body2'
                color='text.secondary'
                fontWeight={500}
                sx={{
                    mb: 0.75,
                    minWidth: 0,
                    overflowWrap: 'anywhere',
                    wordBreak: 'break-word',
                }}
            >
                {label}
            </Typography>
            <Box
                sx={{
                    minWidth: 0,
                    maxWidth: '100%',
                    overflowX: 'hidden',
                    overflowWrap: 'anywhere',
                    wordBreak: 'break-all',
                }}
            >
                {children}
            </Box>
        </Box>
    );
}

TextSummaryBlock.propTypes = { label: PropTypes.node.isRequired, children: PropTypes.node.isRequired };

function WrappedReviewText({
    children, color, fontStyle, preserveLines,
}) {
    return (
        <Typography
            variant='body2'
            color={color}
            fontStyle={fontStyle}
            sx={{
                minWidth: 0,
                maxWidth: '100%',
                whiteSpace: preserveLines ? 'pre-wrap' : 'normal',
                overflowWrap: 'anywhere',
                wordBreak: 'break-word',
            }}
        >
            {children}
        </Typography>
    );
}

WrappedReviewText.propTypes = {
    children: PropTypes.node.isRequired,
    color: PropTypes.string,
    fontStyle: PropTypes.string,
    preserveLines: PropTypes.bool,
};

WrappedReviewText.defaultProps = {
    color: 'text.primary',
    fontStyle: 'normal',
    preserveLines: false,
};

function LimitationList({ items }) {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0.75,
                maxHeight: 220,
                width: '100%',
                minWidth: 0,
                maxWidth: '100%',
                overflowY: 'auto',
                overflowX: 'hidden',
                pr: 1,
            }}
        >
            {items.map((item) => (
                <Box
                    key={item}
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: '14px minmax(0, 1fr)',
                        columnGap: 1,
                        alignItems: 'flex-start',
                        width: '100%',
                        minWidth: 0,
                        maxWidth: '100%',
                        overflowX: 'hidden',
                    }}
                >
                    <Typography
                        component='span'
                        variant='body2'
                        aria-hidden='true'
                        sx={{ lineHeight: 1.6 }}
                    >
                        •
                    </Typography>
                    <Typography
                        component='div'
                        variant='body2'
                        sx={{
                            display: 'block',
                            width: '100%',
                            minWidth: 0,
                            maxWidth: '100%',
                            lineHeight: 1.6,
                            whiteSpace: 'normal',
                            overflowWrap: 'anywhere',
                            wordBreak: 'break-all',
                            hyphens: 'auto',
                        }}
                    >
                        {item}
                    </Typography>
                </Box>
            ))}
        </Box>
    );
}

LimitationList.propTypes = {
    items: PropTypes.arrayOf(PropTypes.string).isRequired,
};

function DefaultValueList({ items }) {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
                width: '100%',
                minWidth: 0,
                maxWidth: '100%',
                overflowX: 'hidden',
            }}
        >
            {items.map((item) => (
                <Box
                    key={item}
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: '12px minmax(0, 1fr)',
                        columnGap: 0.75,
                        alignItems: 'flex-start',
                        width: '100%',
                        minWidth: 0,
                        maxWidth: '100%',
                        overflowX: 'hidden',
                    }}
                >
                    <Typography
                        component='span'
                        variant='body2'
                        aria-hidden='true'
                        sx={{ lineHeight: 1.5 }}
                    >
                        •
                    </Typography>
                    <Typography
                        component='div'
                        variant='body2'
                        sx={{
                            display: 'block',
                            width: '100%',
                            minWidth: 0,
                            maxWidth: '100%',
                            lineHeight: 1.5,
                            whiteSpace: 'normal',
                            overflowWrap: 'anywhere',
                            wordBreak: 'break-all',
                            hyphens: 'auto',
                        }}
                    >
                        {item}
                    </Typography>
                </Box>
            ))}
        </Box>
    );
}

DefaultValueList.propTypes = {
    items: PropTypes.arrayOf(PropTypes.string).isRequired,
};

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
    if (raw === -1) return <Typography variant='body2'>Unlimited</Typography>;

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
        return <DefaultValueList items={raw.map((v) => valueMap?.[v] ?? v)} />;
    }
    return (
        <Typography
            variant='body2'
            sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', wordBreak: 'break-word' }}
        >
            {valueMap?.[raw] ?? String(raw)}
        </Typography>
    );
}

function normalizeLimitations(limitations) {
    const raw = Array.isArray(limitations)
        ? limitations
        : String(limitations || '').split('\n');
    return raw.map((item) => String(item).trim()).filter(Boolean);
}

// ── Main component ────────────────────────────────────────────────────────────

/**
 * Step 4 of the TemplateWizard.
 * Shows a full read-only summary plus a publish/draft toggle.
 * The wizard's Save button label reacts to the status choice made here.
 */
export default function ReviewPublishStep({
    templateState,
}) {
    const intl = useIntl();
    const {
        name, description, isDefault, isGlobal,
        formConfig, rulesetBindings,
    } = templateState;

    const developerExperience = formConfig?.developerExperience ?? {};
    const developerLimitations = normalizeLimitations(developerExperience.limitations);

    const [rulesetMap, setRulesetMap] = useState({});
    const [loadingRulesets, setLoadingRulesets] = useState(false);
    useEffect(() => {
        if (rulesetBindings.length === 0) return;
        setLoadingRulesets(true);
        new GovernanceAPI()
            .getRulesets({ limit: 200, offset: 0 })
            .then((res) => {
                const map = {};
                (res.body?.list ?? []).forEach((r) => { map[r.id] = r; });
                setRulesetMap(map);
            })
            .catch(() => {})
            .finally(() => setLoadingRulesets(false));
    }, [rulesetBindings.length]);

    const dtoPayload = useMemo(() => ({
        name, description, isDefault, isGlobal, formConfig, rulesetBindings,
    }), [name, description, isDefault, isGlobal, formConfig, rulesetBindings]);

    return (
        <Box sx={{
            width: '100%',
            boxSizing: 'border-box',
            minWidth: 0,
            maxWidth: '100%',
            overflowX: 'hidden',
        }}
        >
            <Typography variant='h6' gutterBottom>
                <FormattedMessage
                    id='Governance.Templates.ReviewPublish.heading'
                    defaultMessage='Review &amp; Publish'
                />
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                <FormattedMessage
                    id='Governance.Templates.ReviewPublish.subheading'
                    defaultMessage={
                        'Review the template configuration below, then decide '
                        + 'whether to save as draft or publish.'
                    }
                />
            </Typography>

            {/* Ruleset default validation reminder */}
            {rulesetBindings.length > 0 && (
                <Alert severity='info' sx={{ mb: 3 }}>
                    <FormattedMessage
                        id='Governance.Templates.ReviewPublish.validation.saveTime'
                        defaultMessage={
                            'Hidden field defaults are validated against bound rulesets when you save. '
                            + 'If any default value violates a rule, the save will be rejected with details.'
                        }
                    />
                </Alert>
            )}

            <Divider sx={{ mb: 3 }} />

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
                        sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', wordBreak: 'break-word' }}
                    >
                        {description || intl.formatMessage({
                            id: 'Governance.Templates.ReviewPublish.label.noDescription',
                            defaultMessage: 'No description provided',
                        })}
                    </Typography>
                </SummaryRow>
                <SummaryRow
                    label={intl.formatMessage({
                        id: 'Governance.Templates.ReviewPublish.label.flags',
                        defaultMessage: 'Flags',
                    })}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            gap: 1,
                            flexWrap: 'wrap',
                            minWidth: 0,
                        }}
                    >
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
                {/* Application Details */}
                {FORM_CONFIG_META.map(({ sectionKey, sectionLabel, fields }) => {
                    const extraFields = sectionKey === 'application'
                        ? Object.keys(formConfig?.application?.attributes ?? {}).map((attrKey) => ({
                            fieldKey: `attributes.${attrKey}`,
                            label: attrKey,
                            isCustomAttr: true,
                        }))
                        : [];
                    const allFields = [...fields, ...extraFields];

                    return (
                        <Box key={sectionKey} sx={{ mb: 3 }}>
                            <Typography
                                variant='overline'
                                color='text.secondary'
                                display='block'
                                sx={{ mb: 1 }}
                            >
                                {sectionLabel}
                            </Typography>
                            {allFields.map((fieldMeta) => {
                                const attrName = fieldMeta.fieldKey.split('.')[1];
                                const fieldConfig = fieldMeta.isCustomAttr
                                    ? (formConfig?.application?.attributes?.[attrName]
                                        ?? { hidden: false, defaultValue: '' })
                                    : (formConfig?.[sectionKey]?.[fieldMeta.fieldKey]
                                        ?? { hidden: false, defaultValue: fieldMeta.isArray ? [] : '' });
                                const isHidden = !!fieldConfig.hidden;
                                const isRequired = fieldConfig.required === true || fieldConfig.required === 'true';
                                const isInactive = fieldConfig.active === false || fieldConfig.active === 'false';
                                const hiddenLabel = intl.formatMessage({
                                    id: 'Governance.Templates.ReviewPublish.field.hidden',
                                    defaultMessage: 'Hidden',
                                });
                                const visibleLabel = intl.formatMessage({
                                    id: 'Governance.Templates.ReviewPublish.field.visible',
                                    defaultMessage: 'Visible',
                                });
                                const requiredLabel = intl.formatMessage({
                                    id: 'Governance.Templates.ReviewPublish.field.required',
                                    defaultMessage: 'Required',
                                });
                                const optionalLabel = intl.formatMessage({
                                    id: 'Governance.Templates.ReviewPublish.field.optional',
                                    defaultMessage: 'Optional',
                                });
                                const unavailableLabel = intl.formatMessage({
                                    id: 'Governance.Templates.ReviewPublish.field.unavailable',
                                    defaultMessage: 'Unavailable',
                                });
                                let visibilityLabel = visibleLabel;
                                let visibilityColor = 'default';
                                let visibilityVariant = 'outlined';
                                if (isInactive) {
                                    visibilityLabel = unavailableLabel;
                                } else if (isHidden) {
                                    visibilityLabel = hiddenLabel;
                                    visibilityColor = 'warning';
                                    visibilityVariant = 'filled';
                                }
                                return (
                                    <ConfigSummaryRow
                                        key={fieldMeta.fieldKey}
                                        label={fieldMeta.label}
                                        visibilityChip={(
                                            <Chip
                                                label={visibilityLabel}
                                                size='small'
                                                color={visibilityColor}
                                                variant={visibilityVariant}
                                            />
                                        )}
                                        requiredChip={(
                                            <Chip
                                                label={isRequired ? requiredLabel : optionalLabel}
                                                size='small'
                                                color={isRequired ? 'primary' : 'default'}
                                                variant={isRequired ? 'filled' : 'outlined'}
                                            />
                                        )}
                                    >
                                        {renderDefaultValue(fieldMeta, fieldConfig)}
                                    </ConfigSummaryRow>
                                );
                            })}
                        </Box>
                    );
                })}

                {/* Key Manager Governance */}
                <Box sx={{ mb: 1 }}>
                    <Typography
                        variant='overline'
                        color='text.secondary'
                        display='block'
                        sx={{ mb: 1 }}
                    >
                        <FormattedMessage
                            id='Governance.Templates.ReviewPublish.section.keyManagers'
                            defaultMessage='Key Manager Governance'
                        />
                    </Typography>
                    {(() => {
                        const kmConfigs = formConfig?.keyManagers ?? {};
                        const enabledKMs = Object.entries(kmConfigs)
                            .filter(([, kmc]) => kmc?.enabled === true);

                        if (enabledKMs.length === 0) {
                            return (
                                <Typography variant='body2' color='text.secondary' fontStyle='italic'>
                                    <FormattedMessage
                                        id='Governance.Templates.ReviewPublish.keyManagers.none'
                                        defaultMessage='No key manager governance configured'
                                    />
                                </Typography>
                            );
                        }

                        return enabledKMs.map(([kmName, kmConfig]) => (
                            <Box
                                key={kmName}
                                sx={{
                                    mb: 2,
                                    pl: 2,
                                    borderLeft: 3,
                                    borderColor: 'secondary.light',
                                }}
                            >
                                <Typography
                                    variant='subtitle2'
                                    fontWeight={600}
                                    sx={{ mb: 1 }}
                                >
                                    {kmName}
                                </Typography>
                                {KM_FIELD_META.map((fieldMeta) => {
                                    const fieldConfig = kmConfig[fieldMeta.fieldKey]
                                        ?? { hidden: false, defaultValue: fieldMeta.isArray ? [] : '' };
                                    const isHidden = !!fieldConfig.hidden;
                                    const isRequired = fieldConfig.required === true
                                        || fieldConfig.required === 'true';
                                    return (
                                        <ConfigSummaryRow
                                            key={fieldMeta.fieldKey}
                                            label={fieldMeta.label}
                                            visibilityChip={(
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
                                            )}
                                            requiredChip={(
                                                <Chip
                                                    label={isRequired
                                                        ? intl.formatMessage({
                                                            id: 'Governance.Templates.ReviewPublish.field.required',
                                                            defaultMessage: 'Required',
                                                        })
                                                        : intl.formatMessage({
                                                            id: 'Governance.Templates.ReviewPublish.field.optional',
                                                            defaultMessage: 'Optional',
                                                        })}
                                                    size='small'
                                                    color={isRequired ? 'primary' : 'default'}
                                                    variant={isRequired ? 'filled' : 'outlined'}
                                                />
                                            )}
                                        >
                                            {renderDefaultValue(fieldMeta, fieldConfig)}
                                        </ConfigSummaryRow>
                                    );
                                })}
                            </Box>
                        ));
                    })()}
                </Box>
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
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    mb: 2,
                                }}
                            >
                                <CircularProgress size={14} />
                                <Typography variant='caption' color='text.secondary'>
                                    <FormattedMessage
                                        id='Governance.Templates.ReviewPublish.rulesets.loading'
                                        defaultMessage='Resolving ruleset names…'
                                    />
                                </Typography>
                            </Box>
                        )}
                        <Box sx={{
                            width: '100%',
                            minWidth: 0,
                            maxWidth: '100%',
                            overflowX: 'hidden',
                        }}
                        >
                            <Table size='small' sx={{ width: '100%', tableLayout: 'fixed' }}>
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
                                                defaultMessage='Applies To'
                                            />
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {[...rulesetBindings]
                                        .sort((a, b) => a.bindingOrder - b.bindingOrder)
                                        .map((binding) => {
                                            const ruleset = rulesetMap[binding.rulesetId];
                                            const rulesetName = ruleset?.name ?? binding.rulesetId;
                                            const appliesToLabel = getRulesetAppliesToLabel(intl, binding, ruleset);
                                            return (
                                                <TableRow key={binding.rulesetId}>
                                                    <TableCell>{binding.bindingOrder + 1}</TableCell>
                                                    <TableCell sx={{ minWidth: 0 }}>
                                                        <Typography
                                                            variant='body2'
                                                            sx={{
                                                                overflowWrap: 'anywhere',
                                                                wordBreak: 'break-word',
                                                            }}
                                                        >
                                                            {rulesetName}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography
                                                            variant='body2'
                                                            color='text.secondary'
                                                            sx={{
                                                                overflowWrap: 'anywhere',
                                                                wordBreak: 'break-word',
                                                            }}
                                                        >
                                                            {appliesToLabel}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                </TableBody>
                            </Table>
                        </Box>
                    </>
                )}
            </SummarySection>

            {/* ── Section 4: Developer View ── */}
            <SummarySection
                title={intl.formatMessage({
                    id: 'Governance.Templates.ReviewPublish.section.developerView',
                    defaultMessage: 'Developer View',
                })}
                accentColor='success.main'
            >
                <TextSummaryBlock
                    label={intl.formatMessage({
                        id: 'Governance.Templates.ReviewPublish.developerView.summary',
                        defaultMessage: 'Summary',
                    })}
                >
                    <WrappedReviewText
                        color={developerExperience.summary ? 'text.primary' : 'text.secondary'}
                        fontStyle={developerExperience.summary ? 'normal' : 'italic'}
                        preserveLines
                    >
                        {developerExperience.summary || intl.formatMessage({
                            id: 'Governance.Templates.ReviewPublish.developerView.noSummary',
                            defaultMessage: 'No developer summary configured',
                        })}
                    </WrappedReviewText>
                </TextSummaryBlock>
                <TextSummaryBlock
                    label={intl.formatMessage({
                        id: 'Governance.Templates.ReviewPublish.developerView.limitations',
                        defaultMessage: 'Limitations',
                    })}
                >
                    {developerLimitations.length === 0 ? (
                        <WrappedReviewText color='text.secondary' fontStyle='italic'>
                            <FormattedMessage
                                id='Governance.Templates.ReviewPublish.developerView.noLimitations'
                                defaultMessage='Generated limitations will be shown in the Devportal'
                            />
                        </WrappedReviewText>
                    ) : (
                        <LimitationList items={developerLimitations} />
                    )}
                </TextSummaryBlock>
            </SummarySection>

            {/* ── Section 5: Raw Payload (collapsible) ── */}
            <Accordion
                elevation={0}
                variant='outlined'
                disableGutters
                sx={{
                    width: '100%',
                    boxSizing: 'border-box',
                    minWidth: 0,
                    maxWidth: '100%',
                    overflow: 'hidden',
                }}
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
                            width: '100%',
                            boxSizing: 'border-box',
                            minWidth: 0,
                            maxWidth: '100%',
                            overflowX: 'auto',
                            whiteSpace: 'pre-wrap',
                            overflowWrap: 'anywhere',
                            wordBreak: 'break-all',
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
        isDefault: PropTypes.bool.isRequired,
        isGlobal: PropTypes.bool.isRequired,
        formConfig: PropTypes.shape({}).isRequired,
        rulesetBindings: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    }).isRequired,
};
