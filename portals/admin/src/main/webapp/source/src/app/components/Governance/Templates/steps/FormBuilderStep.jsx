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
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import {
    Box,
    Chip,
    CircularProgress,
    FormControlLabel,
    Grid,
    MenuItem,
    OutlinedInput,
    Select,
    Switch,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Alert from 'AppComponents/Shared/Alert';
import API from 'AppData/api';

// ─── Static option lists ──────────────────────────────────────────────────────

const GRANT_TYPES = [
    { value: 'client_credentials', label: 'Client Credentials' },
    { value: 'password', label: 'Resource Owner Password' },
    { value: 'authorization_code', label: 'Authorization Code' },
    { value: 'refresh_token', label: 'Refresh Token' },
    { value: 'implicit', label: 'Implicit' },
    { value: 'urn:ietf:params:oauth:grant-type:token-exchange', label: 'Token Exchange' },
];

const TOKEN_TYPES = [
    { value: 'JWT', label: 'JWT' },
    { value: 'OAUTH', label: 'Opaque (OAuth)' },
];

const KEY_TYPES = [
    { value: 'PRODUCTION', label: 'Production' },
    { value: 'SANDBOX', label: 'Sandbox' },
];

// ─── Reusable field-row component ────────────────────────────────────────────

/**
 * Renders one configurable form field row.
 *
 * Layout: [Label + description | Hide switch | Default value input]
 * When hidden=true the helper text under the default input reminds the admin
 * that this value will be silently applied on the developer's behalf.
 */
function FieldRow({
    label,
    description,
    hidden,
    onToggleHidden,
    defaultInput,    // JSX for the default-value control
    noDefault,       // true = no default editor exists (e.g. additionalProperties)
}) {
    const intl = useIntl();
    return (
        <Grid
            container
            spacing={2}
            alignItems='flex-start'
            sx={{
                py: 1.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-child': { borderBottom: 'none' },
            }}
        >
            {/* Field label */}
            <Grid item xs={12} sm={5}>
                <Typography variant='body2' fontWeight={500}>
                    {label}
                </Typography>
                {description && (
                    <Typography variant='caption' color='text.secondary' display='block'>
                        {description}
                    </Typography>
                )}
            </Grid>

            {/* Hide toggle */}
            <Grid item xs={12} sm={3}>
                <FormControlLabel
                    control={(
                        <Switch
                            checked={hidden}
                            onChange={(e) => onToggleHidden(e.target.checked)}
                            size='small'
                            color='warning'
                        />
                    )}
                    label={(
                        <Typography variant='caption' color={hidden ? 'warning.main' : 'text.secondary'}>
                            <FormattedMessage
                                id='Governance.Templates.FormBuilder.hide.label'
                                defaultMessage='Hide from Developer'
                            />
                        </Typography>
                    )}
                    sx={{ ml: 0 }}
                />
            </Grid>

            {/* Default value */}
            <Grid item xs={12} sm={4}>
                {noDefault ? (
                    <Tooltip
                        title={intl.formatMessage({
                            id: 'Governance.Templates.FormBuilder.noDefault.tooltip',
                            defaultMessage: 'Default value is managed by the Key Manager configuration',
                        })}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                            <InfoOutlinedIcon fontSize='small' color='disabled' />
                            <Typography variant='caption' color='text.disabled'>
                                <FormattedMessage
                                    id='Governance.Templates.FormBuilder.noDefault.text'
                                    defaultMessage='Managed by Key Manager'
                                />
                            </Typography>
                        </Box>
                    </Tooltip>
                ) : (
                    <Box>
                        {defaultInput}
                        {hidden && (
                            <Typography variant='caption' color='warning.main' display='block' sx={{ mt: 0.5 }}>
                                <FormattedMessage
                                    id='Governance.Templates.FormBuilder.hiddenAutoApply'
                                    defaultMessage='Applied automatically — developer will not see this field'
                                />
                            </Typography>
                        )}
                    </Box>
                )}
            </Grid>
        </Grid>
    );
}

FieldRow.propTypes = {
    label: PropTypes.node.isRequired,
    description: PropTypes.node,
    hidden: PropTypes.bool.isRequired,
    onToggleHidden: PropTypes.func.isRequired,
    defaultInput: PropTypes.node,
    noDefault: PropTypes.bool,
};

FieldRow.defaultProps = {
    description: null,
    defaultInput: null,
    noDefault: false,
};

// ─── Section heading inside AccordionDetails ─────────────────────────────────

function SectionHeader() {
    return (
        <Grid
            container
            spacing={2}
            sx={{
                pb: 1,
                mb: 0.5,
                borderBottom: '2px solid',
                borderColor: 'divider',
            }}
        >
            <Grid item xs={12} sm={5}>
                <Typography variant='caption' fontWeight={700} color='text.secondary' textTransform='uppercase'>
                    <FormattedMessage
                        id='Governance.Templates.FormBuilder.header.field'
                        defaultMessage='Field'
                    />
                </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
                <Typography variant='caption' fontWeight={700} color='text.secondary' textTransform='uppercase'>
                    <FormattedMessage
                        id='Governance.Templates.FormBuilder.header.visibility'
                        defaultMessage='Visibility'
                    />
                </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
                <Typography variant='caption' fontWeight={700} color='text.secondary' textTransform='uppercase'>
                    <FormattedMessage
                        id='Governance.Templates.FormBuilder.header.default'
                        defaultMessage='Default Value'
                    />
                </Typography>
            </Grid>
        </Grid>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * Step 2 of the TemplateWizard.
 * Renders three Accordion sections (Application Metadata, Subscriptions, Key Generation).
 * Each field row has a hide-toggle and a default-value input.
 * Dispatches the fully updated formConfig on every change.
 *
 * @param {Object} props
 * @param {Object} props.templateState - wizard state from TemplateWizard reducer
 * @param {Function} props.dispatch    - reducer dispatch
 */
export default function FormBuilderStep({ templateState, dispatch }) {
    const intl = useIntl();
    const [appPolicies, setAppPolicies] = useState([]);
    const [subPolicies, setSubPolicies] = useState([]);
    const [loadingPolicies, setLoadingPolicies] = useState(true);

    // ── Data fetch ──────────────────────────────────────────────────────────
    useEffect(() => {
        const api = new API();
        Promise.all([
            api.applicationThrottlingPoliciesGet(),
            api.getSubscritionPolicyList(), // note: typo is in the source API class
        ])
            .then(([appRes, subRes]) => {
                setAppPolicies(appRes.body.list.map((p) => p.policyName));
                setSubPolicies(subRes.body.list.map((p) => p.policyName));
            })
            .catch(() => {
                Alert.error(intl.formatMessage({
                    id: 'Governance.Templates.FormBuilder.policiesFetch.error',
                    defaultMessage: 'Failed to load throttling policies. Dropdowns may be empty.',
                }));
            })
            .finally(() => setLoadingPolicies(false));
    }, []);

    // ── Helpers ─────────────────────────────────────────────────────────────

    /**
     * Returns the config entry for a single field, falling back gracefully if
     * formConfig came from an older schema that omits this field.
     */
    const getField = (section, fieldKey, emptyDefault = '') => {
        return templateState.formConfig?.[section]?.[fieldKey]
            ?? { hidden: false, defaultValue: emptyDefault };
    };

    /**
     * Immutably updates one config key (hidden | defaultValue) on a single field
     * and dispatches the entire updated formConfig.
     */
    const updateField = (section, fieldKey, configKey, value) => {
        dispatch({
            field: 'formConfig',
            value: {
                ...templateState.formConfig,
                [section]: {
                    ...templateState.formConfig[section],
                    [fieldKey]: {
                        ...(templateState.formConfig[section]?.[fieldKey] ?? {}),
                        [configKey]: value,
                    },
                },
            },
        });
    };

    // ── Shorthand aliases for current config values ──────────────────────────
    const appThrottling = getField('application', 'throttlingPolicy');
    const appTokenType = getField('application', 'tokenType', 'JWT');
    const appCallbackUrl = getField('application', 'callbackUrl');
    const subThrottling = getField('subscription', 'throttlingPolicy');
    const keyGenKeyType = getField('keyGeneration', 'keyType', 'PRODUCTION');
    const keyGenGrantTypes = getField('keyGeneration', 'grantTypes', []);
    const keyGenValidity = getField('keyGeneration', 'validityPeriod', -1);
    const keyGenAdditional = getField('keyGeneration', 'additionalProperties', {});

    // Ensure array type for multi-select value (guard against stale string value)
    const grantTypesValue = Array.isArray(keyGenGrantTypes.defaultValue)
        ? keyGenGrantTypes.defaultValue
        : [];

    if (loadingPolicies) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress size={28} />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant='h6' gutterBottom>
                <FormattedMessage
                    id='Governance.Templates.FormBuilder.heading'
                    defaultMessage='Form Builder'
                />
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                <FormattedMessage
                    id='Governance.Templates.FormBuilder.subheading'
                    defaultMessage='Configure which fields developers see in the application creation wizard
                        and set organization-wide defaults for hidden fields.'
                />
            </Typography>

            {/* ── Section 1: Application Metadata ── */}
            <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box>
                        <Typography variant='subtitle1' fontWeight={600}>
                            <FormattedMessage
                                id='Governance.Templates.FormBuilder.section.application'
                                defaultMessage='Application Metadata'
                            />
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                            <FormattedMessage
                                id='Governance.Templates.FormBuilder.section.application.desc'
                                defaultMessage='Fields shown on the "Create Application" form'
                            />
                        </Typography>
                    </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                    <SectionHeader />

                    {/* Throttling Policy */}
                    <FieldRow
                        label={(
                            <FormattedMessage
                                id='Governance.Templates.FormBuilder.app.throttlingPolicy.label'
                                defaultMessage='Throttling Policy'
                            />
                        )}
                        description={(
                            <FormattedMessage
                                id='Governance.Templates.FormBuilder.app.throttlingPolicy.desc'
                                defaultMessage='Rate limit tier applied to the application'
                            />
                        )}
                        hidden={appThrottling.hidden}
                        onToggleHidden={(v) => updateField('application', 'throttlingPolicy', 'hidden', v)}
                        defaultInput={(
                            <Select
                                fullWidth
                                size='small'
                                displayEmpty
                                value={appThrottling.defaultValue}
                                onChange={(e) => updateField('application', 'throttlingPolicy', 'defaultValue', e.target.value)}
                            >
                                <MenuItem value=''>
                                    <em>
                                        <FormattedMessage
                                            id='Governance.Templates.FormBuilder.select.noDefault'
                                            defaultMessage='— No default —'
                                        />
                                    </em>
                                </MenuItem>
                                {appPolicies.map((p) => (
                                    <MenuItem key={p} value={p}>{p}</MenuItem>
                                ))}
                            </Select>
                        )}
                    />

                    {/* Token Type */}
                    <FieldRow
                        label={(
                            <FormattedMessage
                                id='Governance.Templates.FormBuilder.app.tokenType.label'
                                defaultMessage='Token Type'
                            />
                        )}
                        description={(
                            <FormattedMessage
                                id='Governance.Templates.FormBuilder.app.tokenType.desc'
                                defaultMessage='JWT for self-contained tokens; Opaque for reference tokens'
                            />
                        )}
                        hidden={appTokenType.hidden}
                        onToggleHidden={(v) => updateField('application', 'tokenType', 'hidden', v)}
                        defaultInput={(
                            <Select
                                fullWidth
                                size='small'
                                value={appTokenType.defaultValue}
                                onChange={(e) => updateField('application', 'tokenType', 'defaultValue', e.target.value)}
                            >
                                {TOKEN_TYPES.map((t) => (
                                    <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                                ))}
                            </Select>
                        )}
                    />

                    {/* Callback URL */}
                    <FieldRow
                        label={(
                            <FormattedMessage
                                id='Governance.Templates.FormBuilder.app.callbackUrl.label'
                                defaultMessage='Callback URL'
                            />
                        )}
                        description={(
                            <FormattedMessage
                                id='Governance.Templates.FormBuilder.app.callbackUrl.desc'
                                defaultMessage='OAuth redirect URI; required for Authorization Code / Implicit flows'
                            />
                        )}
                        hidden={appCallbackUrl.hidden}
                        onToggleHidden={(v) => updateField('application', 'callbackUrl', 'hidden', v)}
                        defaultInput={(
                            <TextField
                                fullWidth
                                size='small'
                                placeholder='https://example.com/callback'
                                value={appCallbackUrl.defaultValue}
                                onChange={(e) => updateField('application', 'callbackUrl', 'defaultValue', e.target.value)}
                            />
                        )}
                    />
                </AccordionDetails>
            </Accordion>

            {/* ── Section 2: Subscriptions ── */}
            <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box>
                        <Typography variant='subtitle1' fontWeight={600}>
                            <FormattedMessage
                                id='Governance.Templates.FormBuilder.section.subscription'
                                defaultMessage='Subscriptions'
                            />
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                            <FormattedMessage
                                id='Governance.Templates.FormBuilder.section.subscription.desc'
                                defaultMessage='Fields shown on the "Subscribe to API" dialog'
                            />
                        </Typography>
                    </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                    <SectionHeader />

                    {/* Subscription Throttling Policy */}
                    <FieldRow
                        label={(
                            <FormattedMessage
                                id='Governance.Templates.FormBuilder.sub.throttlingPolicy.label'
                                defaultMessage='Subscription Throttling Policy'
                            />
                        )}
                        description={(
                            <FormattedMessage
                                id='Governance.Templates.FormBuilder.sub.throttlingPolicy.desc'
                                defaultMessage='Rate limit tier applied per API subscription'
                            />
                        )}
                        hidden={subThrottling.hidden}
                        onToggleHidden={(v) => updateField('subscription', 'throttlingPolicy', 'hidden', v)}
                        defaultInput={(
                            <Select
                                fullWidth
                                size='small'
                                displayEmpty
                                value={subThrottling.defaultValue}
                                onChange={(e) => updateField('subscription', 'throttlingPolicy', 'defaultValue', e.target.value)}
                            >
                                <MenuItem value=''>
                                    <em>
                                        <FormattedMessage
                                            id='Governance.Templates.FormBuilder.select.noDefault'
                                            defaultMessage='— No default —'
                                        />
                                    </em>
                                </MenuItem>
                                {subPolicies.map((p) => (
                                    <MenuItem key={p} value={p}>{p}</MenuItem>
                                ))}
                            </Select>
                        )}
                    />
                </AccordionDetails>
            </Accordion>

            {/* ── Section 3: Key Generation ── */}
            <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box>
                        <Typography variant='subtitle1' fontWeight={600}>
                            <FormattedMessage
                                id='Governance.Templates.FormBuilder.section.keyGen'
                                defaultMessage='Key Generation'
                            />
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                            <FormattedMessage
                                id='Governance.Templates.FormBuilder.section.keyGen.desc'
                                defaultMessage='Fields shown on the "Generate Keys" panel'
                            />
                        </Typography>
                    </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                    <SectionHeader />

                    {/* Key Type */}
                    <FieldRow
                        label={(
                            <FormattedMessage
                                id='Governance.Templates.FormBuilder.keyGen.keyType.label'
                                defaultMessage='Key Type'
                            />
                        )}
                        description={(
                            <FormattedMessage
                                id='Governance.Templates.FormBuilder.keyGen.keyType.desc'
                                defaultMessage='Production keys are used for live traffic; Sandbox for testing'
                            />
                        )}
                        hidden={keyGenKeyType.hidden}
                        onToggleHidden={(v) => updateField('keyGeneration', 'keyType', 'hidden', v)}
                        defaultInput={(
                            <Select
                                fullWidth
                                size='small'
                                value={keyGenKeyType.defaultValue}
                                onChange={(e) => updateField('keyGeneration', 'keyType', 'defaultValue', e.target.value)}
                            >
                                {KEY_TYPES.map((k) => (
                                    <MenuItem key={k.value} value={k.value}>{k.label}</MenuItem>
                                ))}
                            </Select>
                        )}
                    />

                    {/* Grant Types */}
                    <FieldRow
                        label={(
                            <FormattedMessage
                                id='Governance.Templates.FormBuilder.keyGen.grantTypes.label'
                                defaultMessage='Grant Types'
                            />
                        )}
                        description={(
                            <FormattedMessage
                                id='Governance.Templates.FormBuilder.keyGen.grantTypes.desc'
                                defaultMessage='Allowed OAuth2 grant flows; hiding locks developers to the defaults selected here'
                            />
                        )}
                        hidden={keyGenGrantTypes.hidden}
                        onToggleHidden={(v) => updateField('keyGeneration', 'grantTypes', 'hidden', v)}
                        defaultInput={(
                            <Select
                                fullWidth
                                multiple
                                size='small'
                                displayEmpty
                                value={grantTypesValue}
                                onChange={(e) => updateField('keyGeneration', 'grantTypes', 'defaultValue', e.target.value)}
                                input={<OutlinedInput size='small' />}
                                renderValue={(selected) => {
                                    if (selected.length === 0) {
                                        return (
                                            <Typography variant='caption' color='text.disabled'>
                                                <FormattedMessage
                                                    id='Governance.Templates.FormBuilder.keyGen.grantTypes.placeholder'
                                                    defaultMessage='Select grant types…'
                                                />
                                            </Typography>
                                        );
                                    }
                                    return (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((val) => {
                                                const gt = GRANT_TYPES.find((g) => g.value === val);
                                                return (
                                                    <Chip
                                                        key={val}
                                                        label={gt ? gt.label : val}
                                                        size='small'
                                                    />
                                                );
                                            })}
                                        </Box>
                                    );
                                }}
                                MenuProps={{ PaperProps: { style: { maxHeight: 280 } } }}
                            >
                                {GRANT_TYPES.map((gt) => (
                                    <MenuItem key={gt.value} value={gt.value}>
                                        {gt.label}
                                        <Typography
                                            component='span'
                                            variant='caption'
                                            color='text.secondary'
                                            sx={{ ml: 1 }}
                                        >
                                            ({gt.value})
                                        </Typography>
                                    </MenuItem>
                                ))}
                            </Select>
                        )}
                    />

                    {/* Validity Period */}
                    <FieldRow
                        label={(
                            <FormattedMessage
                                id='Governance.Templates.FormBuilder.keyGen.validity.label'
                                defaultMessage='Token Validity Period'
                            />
                        )}
                        description={(
                            <FormattedMessage
                                id='Governance.Templates.FormBuilder.keyGen.validity.desc'
                                defaultMessage='Token expiry in seconds; enter -1 for unlimited'
                            />
                        )}
                        hidden={keyGenValidity.hidden}
                        onToggleHidden={(v) => updateField('keyGeneration', 'validityPeriod', 'hidden', v)}
                        defaultInput={(
                            <TextField
                                fullWidth
                                size='small'
                                type='number'
                                value={keyGenValidity.defaultValue}
                                onChange={(e) => updateField(
                                    'keyGeneration',
                                    'validityPeriod',
                                    'defaultValue',
                                    Number(e.target.value),
                                )}
                                inputProps={{ min: -1 }}
                                helperText={keyGenValidity.defaultValue === -1
                                    ? intl.formatMessage({
                                        id: 'Governance.Templates.FormBuilder.keyGen.validity.unlimited',
                                        defaultMessage: 'Token will not expire',
                                    })
                                    : ''}
                            />
                        )}
                    />

                    {/* Additional Properties (PKCE) — hide toggle only */}
                    <FieldRow
                        label={(
                            <FormattedMessage
                                id='Governance.Templates.FormBuilder.keyGen.additionalProps.label'
                                defaultMessage='Additional Properties (PKCE)'
                            />
                        )}
                        description={(
                            <FormattedMessage
                                id='Governance.Templates.FormBuilder.keyGen.additionalProps.desc'
                                defaultMessage='PKCE and other Key Manager-specific settings; defaults are managed by the Key Manager configuration'
                            />
                        )}
                        hidden={keyGenAdditional.hidden}
                        onToggleHidden={(v) => updateField('keyGeneration', 'additionalProperties', 'hidden', v)}
                        noDefault
                    />
                </AccordionDetails>
            </Accordion>
        </Box>
    );
}

FormBuilderStep.propTypes = {
    templateState: PropTypes.shape({
        formConfig: PropTypes.object.isRequired,
    }).isRequired,
    dispatch: PropTypes.func.isRequired,
};
