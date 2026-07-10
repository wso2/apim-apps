/*
 * Copyright (c) 2026, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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

import React, { useMemo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
    Box,
    Divider,
    Grid,
    Link,
    Paper,
    TextField,
    Typography,
} from '@mui/material';
import GovernanceAPI from 'AppData/GovernanceAPI';

const GRANT_TYPE_LABELS = {
    authorization_code: 'Authorization Code',
    implicit: 'Implicit',
    password: 'Password',
    client_credentials: 'Client Credentials',
    refresh_token: 'Refresh Token',
    'urn:ietf:params:oauth:grant-type:device_code': 'Device Code',
    'urn:ietf:params:oauth:grant-type:token-exchange': 'Token Exchange',
};
function isHidden(fieldConfig) {
    return fieldConfig?.hidden === true || fieldConfig?.hidden === 'true';
}

function isInactive(fieldConfig) {
    return fieldConfig?.active === false || fieldConfig?.active === 'false';
}

function isRequired(fieldConfig) {
    return fieldConfig?.required === true || fieldConfig?.required === 'true';
}

function hasValue(value) {
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null && value !== '';
}

function formatValue(value, valueMap = {}) {
    if (Array.isArray(value)) {
        return value.map((item) => valueMap[item] ?? item).join(', ');
    }
    if (value === -1) return 'Unlimited';
    if (typeof value === 'boolean') return value ? 'Enabled' : 'Disabled';
    return valueMap[value] ?? String(value);
}

function normalizeLimitations(limitations) {
    const raw = Array.isArray(limitations)
        ? limitations
        : String(limitations || '').split('\n');
    return raw.map((item) => String(item).trim()).filter(Boolean);
}

function addFieldLimit(items, label, fieldConfig, options = {}) {
    const {
        valueMap,
        hiddenOnly = false,
        includeVisibleDefault = true,
    } = options;
    if (isInactive(fieldConfig)) {
        return;
    }
    const hidden = isHidden(fieldConfig);
    const value = fieldConfig?.defaultValue;

    if (hidden && hasValue(value)) {
        items.push(`${label} is fixed to ${formatValue(value, valueMap)}.`);
    } else if (hidden) {
        items.push(`${label} is hidden from developers.`);
    } else if (!hiddenOnly && includeVisibleDefault && hasValue(value)) {
        items.push(`${label} defaults to ${formatValue(value, valueMap)}.`);
    }
}

function addRequiredLimit(items, label, fieldConfig) {
    if (!isInactive(fieldConfig) && !isHidden(fieldConfig) && isRequired(fieldConfig)) {
        items.push(`${label} is required.`);
    }
}

function buildDeveloperLimitations(templateState) {
    const formConfig = templateState.formConfig ?? {};
    const application = formConfig.application ?? {};
    const keyManagers = formConfig.keyManagers ?? {};
    const items = [];

    addFieldLimit(items, 'Application throttling policy', application.throttlingPolicy);
    addFieldLimit(items, 'Application description', application.description);
    addFieldLimit(items, 'Application groups', application.groups);
    addRequiredLimit(items, 'Application description', application.description);
    addRequiredLimit(items, 'Application groups', application.groups);

    Object.entries(application.attributes ?? {}).forEach(([attrName, attrConfig]) => {
        addFieldLimit(items, `Application attribute "${attrName}"`, attrConfig);
        if (!isInactive(attrConfig) && !isHidden(attrConfig) && isRequired(attrConfig)) {
            items.push(`Application attribute "${attrName}" is required.`);
        }
    });

    const enabledKMs = Object.entries(keyManagers).filter(([, kmc]) => kmc?.enabled === true);
    if (enabledKMs.length > 0) {
        items.push(`Key generation is limited to: ${enabledKMs.map(([name]) => name).join(', ')}.`);

        enabledKMs.forEach(([kmName, kmConfig]) => {
            const selectedGrantTypes = Array.isArray(kmConfig.grantTypes?.defaultValue)
                ? kmConfig.grantTypes.defaultValue
                : [];
            const hasGrantType = (...gts) => gts.some((gt) => selectedGrantTypes.includes(gt));
            const prefix = enabledKMs.length > 1 ? `[${kmName}] ` : '';

            addFieldLimit(items, `${prefix}OAuth grant types`, kmConfig.grantTypes, { valueMap: GRANT_TYPE_LABELS });
            if (hasGrantType('authorization_code', 'implicit')) {
                addFieldLimit(items, `${prefix}Callback URL`, kmConfig.callbackUrl);
            }
            if (hasGrantType('client_credentials')) {
                addFieldLimit(items, `${prefix}Application access token expiry`, kmConfig.appAccessTokenExpiry, {
                    hiddenOnly: true,
                });
            }
            if (hasGrantType('password', 'authorization_code', 'implicit')) {
                addFieldLimit(items, `${prefix}User access token expiry`, kmConfig.userAccessTokenExpiry, {
                    hiddenOnly: true,
                });
            }
            if (hasGrantType('refresh_token')) {
                addFieldLimit(items, `${prefix}Refresh token expiry`, kmConfig.refreshTokenExpiry, {
                    hiddenOnly: true,
                });
            }
            if (hasGrantType('authorization_code')) {
                addFieldLimit(items, `${prefix}ID token expiry`, kmConfig.idTokenExpiry, { hiddenOnly: true });
                addFieldLimit(items, `${prefix}PKCE`, kmConfig.enablePKCE, { hiddenOnly: true });
                addFieldLimit(items, `${prefix}PKCE plain text support`, kmConfig.pkceSupportsPlainText, {
                    hiddenOnly: true,
                });
                addFieldLimit(items, `${prefix}Public client mode`, kmConfig.publicClient, { hiddenOnly: true });
            }
        });
    }

    const rulesetCount = templateState.rulesetBindings?.length ?? 0;
    if (rulesetCount > 0) {
        const rulesetLabel = rulesetCount === 1 ? 'ruleset' : 'rulesets';
        items.push(`${rulesetCount} governance ${rulesetLabel} will validate application changes.`);
    }

    return items;
}

/**
 * Step 4 of the TemplateWizard — Developer View.
 *
 * Two-column layout:
 *   Left  — Editable fields: summary text, limitations text area.
 *            Limitations are always pre-populated with generated limitations so
 *            the admin sees exactly what developers will see and can edit inline.
 *   Right — Read-only final developer view: summary, limitations, and descriptions
 *            of all bound rulesets (fetched from the API).
 */
export default function DeveloperViewStep({ templateState, dispatch }) {
    const developerExperience = templateState.formConfig?.developerExperience ?? {};
    const [rulesets, setRulesets] = useState([]);

    const generatedLimitations = useMemo(
        () => buildDeveloperLimitations(templateState),
        [templateState.formConfig, templateState.rulesetBindings],
    );

    // Pre-populate limitations with generated text on first render when they are empty
    useEffect(() => {
        const currentLimitations = developerExperience.limitations;
        const isEmpty = !currentLimitations
            || (typeof currentLimitations === 'string' && currentLimitations.trim() === '')
            || (Array.isArray(currentLimitations) && currentLimitations.length === 0);

        if (isEmpty && generatedLimitations.length > 0) {
            dispatch({
                field: 'formConfig',
                value: {
                    ...templateState.formConfig,
                    developerExperience: {
                        ...developerExperience,
                        limitations: generatedLimitations.join('\n'),
                    },
                },
            });
        }
    }, []); // Only on mount

    // Fetch ruleset details for descriptions in the developer view panel
    useEffect(() => {
        const boundIds = (templateState.rulesetBindings ?? []).map((b) => b.rulesetId);
        if (boundIds.length === 0) {
            setRulesets([]);
            return;
        }
        new GovernanceAPI()
            .getRulesets({ limit: 200, offset: 0 })
            .then((res) => {
                const all = res.body?.list ?? [];
                setRulesets(all.filter((r) => boundIds.includes(r.id)));
            })
            .catch(() => {}); // Non-critical — descriptions are optional
    }, [templateState.rulesetBindings]);

    const updateDeveloperExperience = (patch) => {
        dispatch({
            field: 'formConfig',
            value: {
                ...templateState.formConfig,
                developerExperience: {
                    ...developerExperience,
                    ...patch,
                },
            },
        });
    };

    const limitationsText = Array.isArray(developerExperience.limitations)
        ? normalizeLimitations(developerExperience.limitations).join('\n')
        : (developerExperience.limitations ?? '');

    const previewLimitations = normalizeLimitations(developerExperience.limitations);

    const hasSummary = !!(developerExperience.summary ?? '').trim();
    const hasLimitations = previewLimitations.length > 0;

    return (
        <Box>
            <Typography variant='h6' gutterBottom>
                <FormattedMessage
                    id='Governance.Templates.DeveloperView.heading'
                    defaultMessage='Developer View'
                />
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                <FormattedMessage
                    id='Governance.Templates.DeveloperView.subheading'
                    defaultMessage={
                        'Craft the explanation developers see before selecting this template. '
                        + 'The right panel shows exactly what they will see.'
                    }
                />
            </Typography>

            <Grid container spacing={3}>
                {/* ── LEFT: Editable fields ── */}
                <Grid item xs={12} md={5}>
                    {/* Summary */}
                    <TextField
                        fullWidth
                        multiline
                        minRows={4}
                        label={(
                            <FormattedMessage
                                id='Governance.Templates.DeveloperView.summary.label'
                                defaultMessage='Developer Summary'
                            />
                        )}
                        value={developerExperience.summary ?? ''}
                        onChange={(e) => updateDeveloperExperience({ summary: e.target.value })}
                        helperText={(
                            <FormattedMessage
                                id='Governance.Templates.DeveloperView.summary.helper'
                                defaultMessage='Shown on the template card and at the top of the developer view.'
                            />
                        )}
                        variant='outlined'
                        sx={{ mb: 3 }}
                    />

                    {/* Limitations — always pre-populated with generated, fully editable */}
                    <TextField
                        fullWidth
                        multiline
                        minRows={8}
                        label={(
                            <FormattedMessage
                                id='Governance.Templates.DeveloperView.limitations.label'
                                defaultMessage='Limitations shown to developers'
                            />
                        )}
                        value={limitationsText}
                        onChange={(e) => updateDeveloperExperience({ limitations: e.target.value })}
                        helperText={(
                            <FormattedMessage
                                id='Governance.Templates.DeveloperView.limitations.helper'
                                defaultMessage='One item per line. Edit or add to the auto-generated limitations above.'
                            />
                        )}
                        variant='outlined'
                    />
                </Grid>

                {/* ── RIGHT: Final developer view ── */}
                <Grid item xs={12} md={7}>
                    <Paper
                        variant='outlined'
                        sx={{
                            p: 3,
                            bgcolor: 'action.hover',
                            minHeight: 400,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                        }}
                    >
                        <Typography variant='subtitle1' fontWeight={600} color='text.secondary' sx={{ mb: 0 }}>
                            <FormattedMessage
                                id='Governance.Templates.DeveloperView.preview.heading'
                                defaultMessage='Developer View Preview'
                            />
                        </Typography>
                        <Divider />

                        {/* Summary section */}
                        {hasSummary ? (
                            <Typography variant='body2'>
                                {developerExperience.summary}
                            </Typography>
                        ) : (
                            <Typography variant='body2' color='text.disabled' fontStyle='italic'>
                                <FormattedMessage
                                    id='Governance.Templates.DeveloperView.preview.noSummary'
                                    defaultMessage='No summary provided.'
                                />
                            </Typography>
                        )}

                        {/* Limitations section */}
                        {hasLimitations && (
                            <>
                                <Divider />
                                <Box>
                                    <Typography
                                        variant='caption'
                                        fontWeight={700}
                                        color='text.secondary'
                                        textTransform='uppercase'
                                        display='block'
                                        sx={{ mb: 1 }}
                                    >
                                        <FormattedMessage
                                            id='Governance.Templates.DeveloperView.preview.limitations'
                                            defaultMessage='Limitations'
                                        />
                                    </Typography>
                                    <Box component='ul' sx={{ pl: 2.5, m: 0 }}>
                                        {previewLimitations.map((item) => (
                                            <Typography component='li' variant='body2' key={item} sx={{ mb: 0.75 }}>
                                                {item}
                                            </Typography>
                                        ))}
                                    </Box>
                                </Box>
                            </>
                        )}

                        {/* Ruleset descriptions */}
                        {rulesets.length > 0 && (
                            <>
                                <Divider />
                                <Box>
                                    <Typography
                                        variant='caption'
                                        fontWeight={700}
                                        color='text.secondary'
                                        textTransform='uppercase'
                                        display='block'
                                        sx={{ mb: 1.5 }}
                                    >
                                        <FormattedMessage
                                            id='Governance.Templates.DeveloperView.preview.rulesets'
                                            defaultMessage='Governance Rulesets'
                                        />
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        {rulesets.map((rs) => (
                                            <Box key={rs.id}>
                                                <Typography variant='body2' fontWeight={600}>
                                                    {rs.name}
                                                </Typography>
                                                {rs.description && (
                                                    <Typography
                                                        variant='body2'
                                                        color='text.secondary'
                                                        sx={{ mt: 0.25 }}
                                                    >
                                                        {rs.description}
                                                    </Typography>
                                                )}
                                                {rs.documentationLink && (
                                                    <Link
                                                        href={rs.documentationLink}
                                                        target='_blank'
                                                        rel='noopener noreferrer'
                                                        variant='caption'
                                                        sx={{ display: 'inline-block', mt: 0.5 }}
                                                    >
                                                        <FormattedMessage
                                                            // eslint-disable-next-line max-len
                                                            id='Governance.Templates.DeveloperView.preview.rulesets.docs'
                                                            defaultMessage='Documentation'
                                                        />
                                                    </Link>
                                                )}
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            </>
                        )}

                        {!hasSummary && !hasLimitations && rulesets.length === 0 && (
                            <Typography variant='body2' color='text.disabled' fontStyle='italic'>
                                <FormattedMessage
                                    id='Governance.Templates.DeveloperView.preview.empty'
                                    defaultMessage='Fill in the summary or limitations on the left to preview.'
                                />
                            </Typography>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}

DeveloperViewStep.propTypes = {
    templateState: PropTypes.shape({
        formConfig: PropTypes.shape({
            developerExperience: PropTypes.shape({
                summary: PropTypes.string,
                limitations: PropTypes.oneOfType([
                    PropTypes.string,
                    PropTypes.arrayOf(PropTypes.string),
                ]),
            }),
        }).isRequired,
        rulesetBindings: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    }).isRequired,
    dispatch: PropTypes.func.isRequired,
};
