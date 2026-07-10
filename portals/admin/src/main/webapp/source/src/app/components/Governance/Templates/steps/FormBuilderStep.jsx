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
    Grid,
    MenuItem,
    OutlinedInput,
    Select,
    Switch,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Alert from 'AppComponents/Shared/Alert';
import API from 'AppData/api';

// ─── Grant type metadata ──────────────────────────────────────────────────────

const GRANT_TYPE_META = {
    authorization_code: {
        label: 'Authorization Code', needsCallback: true, needsUserToken: true, needsIdToken: true, needsPKCE: true,
    },
    client_credentials: { label: 'Client Credentials', needsCallback: false, needsAppToken: true },
    password: {
        label: 'Resource Owner Password', needsCallback: false, needsUserToken: true, needsRefreshToken: true,
    },
    refresh_token: { label: 'Refresh Token', needsRefreshToken: true },
    implicit: { label: 'Implicit', needsCallback: true, needsUserToken: true },
    'urn:ietf:params:oauth:grant-type:jwt-bearer': { label: 'JWT Bearer' },
    'urn:ietf:params:oauth:grant-type:saml2-bearer': { label: 'SAML Extension' },
    kerberos: { label: 'Kerberos' },
    'iwa:ntlm': { label: 'NTLM' },
    'urn:ietf:params:oauth:grant-type:device_code': { label: 'Device Code' },
    'urn:ietf:params:oauth:grant-type:token-exchange': { label: 'Token Exchange' },
};

const RESIDENT_KM_TYPE = 'DEFAULT';

const RESIDENT_FALLBACK_GRANT_TYPES = [
    'authorization_code',
    'client_credentials',
    'password',
    'refresh_token',
    'implicit',
    'urn:ietf:params:oauth:grant-type:jwt-bearer',
    'urn:ietf:params:oauth:grant-type:saml2-bearer',
    'kerberos',
    'iwa:ntlm',
];

const EXTERNAL_FALLBACK_GRANT_TYPES = [
    'authorization_code',
    'client_credentials',
    'password',
    'refresh_token',
    'implicit',
    'urn:ietf:params:oauth:grant-type:jwt-bearer',
];

// ─── Default per-KM governance config ────────────────────────────────────────

function defaultKMConfig() {
    return {
        enabled: false,
        // grantTypes is an ALLOWED LIST, not a hideable scalar — no `hidden` flag.
        grantTypes: { defaultValue: [] },
        callbackUrl: { hidden: false, defaultValue: '' },
        appAccessTokenExpiry: { hidden: false, defaultValue: 3600 },
        userAccessTokenExpiry: { hidden: false, defaultValue: 3600 },
        refreshTokenExpiry: { hidden: false, defaultValue: -1 },
        idTokenExpiry: { hidden: false, defaultValue: 3600 },
        enablePKCE: { hidden: false, defaultValue: false },
        pkceSupportsPlainText: { hidden: false, defaultValue: false },
        publicClient: { hidden: false, defaultValue: false },
    };
}

// ─── FieldRow ─────────────────────────────────────────────────────────────────

function FieldRow({
    label,
    description,
    hidden,
    onToggleHidden,
    defaultInput,
    defaultEmpty,
    noDefault,
    isRequired,
    required,
    requiredLocked,
    onToggleRequired,
    omitHiddenToggle,
    statusBadge,
}) {
    const effectiveRequired = isRequired || required;
    const showError = !omitHiddenToggle && hidden && !noDefault && defaultEmpty && effectiveRequired;
    const showRequiredControl = !omitHiddenToggle && (requiredLocked || onToggleRequired);

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
            <Grid item xs={12} sm={4}>
                <Typography variant='body2' fontWeight={500}>{label}</Typography>
                {description && (
                    <Typography variant='caption' color='text.secondary' display='block'>
                        {description}
                    </Typography>
                )}
            </Grid>

            <Grid item xs={12} sm={4}>
                {/* For most fields, admin chooses Visible vs Hidden. For "list constraint"
                    fields like grant types, there is no Visible/Hidden — the admin's selection
                    IS the allowed set. omitHiddenToggle suppresses the toggle and shows
                    the supplied statusBadge instead (e.g. "Allowed list"). */}
                {omitHiddenToggle ? (
                    statusBadge ?? null
                ) : (
                    <Box sx={{ mb: showRequiredControl ? 1 : 0 }}>
                        <ToggleButtonGroup
                            exclusive
                            size='small'
                            value={hidden ? 'hidden' : 'visible'}
                            onChange={(e, newValue) => {
                                if (newValue !== null) onToggleHidden(newValue === 'hidden');
                            }}
                        >
                            <ToggleButton
                                value='visible'
                                sx={{
                                    px: 1.5,
                                    fontSize: '0.7rem',
                                    '&.Mui-selected': { color: 'success.main', borderColor: 'success.main' },
                                }}
                            >
                                <FormattedMessage
                                    id='Governance.Templates.FormBuilder.toggle.visible'
                                    defaultMessage='Visible'
                                />
                            </ToggleButton>
                            <ToggleButton
                                value='hidden'
                                sx={{
                                    px: 1.5,
                                    fontSize: '0.7rem',
                                    '&.Mui-selected': { color: 'warning.main', borderColor: 'warning.main' },
                                }}
                            >
                                <FormattedMessage
                                    id='Governance.Templates.FormBuilder.toggle.hidden'
                                    defaultMessage='Hidden'
                                />
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                )}

                {showRequiredControl && (
                    <ToggleButtonGroup
                        exclusive
                        size='small'
                        value={effectiveRequired ? 'required' : 'optional'}
                        onChange={(e, newValue) => {
                            if (newValue !== null && onToggleRequired && !requiredLocked) {
                                onToggleRequired(newValue === 'required');
                            }
                        }}
                        disabled={requiredLocked}
                    >
                        <ToggleButton value='optional' sx={{ px: 1.5, fontSize: '0.7rem' }}>
                            <FormattedMessage
                                id='Governance.Templates.FormBuilder.required.optional'
                                defaultMessage='Optional'
                            />
                        </ToggleButton>
                        <ToggleButton
                            value='required'
                            sx={{
                                px: 1.5,
                                fontSize: '0.7rem',
                                '&.Mui-selected': { color: 'primary.main', borderColor: 'primary.main' },
                            }}
                        >
                            <FormattedMessage
                                id='Governance.Templates.FormBuilder.required.required'
                                defaultMessage='Required'
                            />
                        </ToggleButton>
                    </ToggleButtonGroup>
                )}
            </Grid>

            <Grid item xs={12} sm={4}>
                {noDefault ? (
                    <Typography
                        variant='caption'
                        color='text.disabled'
                        sx={{
                            display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5,
                        }}
                    >
                        <FormattedMessage
                            id='Governance.Templates.FormBuilder.noDefault.text'
                            defaultMessage='Managed by Key Manager'
                        />
                    </Typography>
                ) : (
                    <Box>
                        {React.cloneElement(defaultInput, showError ? { error: true } : {})}
                        {showError && (
                            <Typography variant='caption' color='error' display='block' sx={{ mt: 0.5 }}>
                                <FormattedMessage
                                    id='Governance.Templates.FormBuilder.hidden.noDefault.error'
                                    defaultMessage='Set a default — developers cannot see this field'
                                />
                            </Typography>
                        )}
                        {hidden && !showError && (
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
    hidden: PropTypes.bool,
    onToggleHidden: PropTypes.func,
    defaultInput: PropTypes.element,
    defaultEmpty: PropTypes.bool,
    noDefault: PropTypes.bool,
    isRequired: PropTypes.bool,
    required: PropTypes.bool,
    requiredLocked: PropTypes.bool,
    onToggleRequired: PropTypes.func,
    omitHiddenToggle: PropTypes.bool,
    statusBadge: PropTypes.node,
};
FieldRow.defaultProps = {
    description: null,
    hidden: false,
    onToggleHidden: null,
    defaultInput: null,
    defaultEmpty: false,
    noDefault: false,
    isRequired: false,
    required: false,
    requiredLocked: false,
    onToggleRequired: null,
    omitHiddenToggle: false,
    statusBadge: null,
};

// ─── SectionHeader ────────────────────────────────────────────────────────────

function SectionHeader() {
    return (
        <Grid
            container
            spacing={2}
            sx={{
                pb: 1, mb: 0.5, borderBottom: '2px solid', borderColor: 'divider',
            }}
        >
            <Grid item xs={12} sm={4}>
                <Typography
                    variant='caption'
                    fontWeight={700}
                    color='text.secondary'
                    textTransform='uppercase'
                >
                    <FormattedMessage
                        id='Governance.Templates.FormBuilder.header.field'
                        defaultMessage='Field'
                    />
                </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
                <Typography
                    variant='caption'
                    fontWeight={700}
                    color='text.secondary'
                    textTransform='uppercase'
                >
                    <FormattedMessage
                        id='Governance.Templates.FormBuilder.header.visibility'
                        defaultMessage='Field Settings'
                    />
                </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
                <Typography
                    variant='caption'
                    fontWeight={700}
                    color='text.secondary'
                    textTransform='uppercase'
                >
                    <FormattedMessage
                        id='Governance.Templates.FormBuilder.header.default'
                        defaultMessage='Default Value'
                    />
                </Typography>
            </Grid>
        </Grid>
    );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isEmpty(value) {
    if (value === null || value === undefined || value === '') return true;
    if (Array.isArray(value) && value.length === 0) return true;
    return false;
}

function isTrue(value) {
    return value === true || value === 'true';
}

function normalizeStringList(value) {
    if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
    return String(value ?? '').split(',').map((item) => item.trim()).filter(Boolean);
}

function dedupeStringList(values) {
    return [...new Set(normalizeStringList(values))];
}

function toCommaSeparated(value) {
    return normalizeStringList(value).join(', ');
}

function getTokenExpiryHelperText(fieldConfig, intl) {
    if (fieldConfig.defaultValue !== -1) return '';
    return intl.formatMessage({
        id: 'Governance.Templates.FormBuilder.keyGen.expiry.unlimited',
        defaultMessage: 'Token will not expire',
    });
}

function reconcileServerBackedFields(formConfig, applicationSharingEnabled, applicationAttributes) {
    const currentAttributeNames = new Set(
        (applicationAttributes ?? []).map((attr) => attr.attribute).filter(Boolean),
    );
    const existingAttributes = formConfig?.application?.attributes ?? {};
    const reconciledAttributes = {};
    Object.entries(existingAttributes).forEach(([attrName, attrConfig]) => {
        reconciledAttributes[attrName] = { ...attrConfig, active: currentAttributeNames.has(attrName) };
    });
    currentAttributeNames.forEach((attrName) => {
        reconciledAttributes[attrName] = {
            ...(reconciledAttributes[attrName] ?? { hidden: false, required: false, defaultValue: '' }),
            active: true,
        };
    });
    return {
        ...formConfig,
        application: {
            ...(formConfig?.application ?? {}),
            groups: {
                ...((formConfig?.application ?? {}).groups ?? { hidden: false, required: false, defaultValue: '' }),
                active: applicationSharingEnabled,
            },
            attributes: reconciledAttributes,
        },
    };
}

// ─── KMGovernancePanel — governance fields for one key manager ────────────────

function KMGovernancePanel({
    kmConfig, availableGrantTypes, isResidentKM, onUpdate,
}) {
    const intl = useIntl();

    const getField = (fieldKey, emptyDefault = '') => (
        kmConfig?.[fieldKey] ?? { hidden: false, defaultValue: emptyDefault }
    );

    const updateField = (fieldKey, configKey, value) => {
        onUpdate(fieldKey, configKey, value);
    };

    const grantTypesField = getField('grantTypes', []);
    const grantTypesValue = Array.isArray(grantTypesField.defaultValue) ? grantTypesField.defaultValue : [];

    const hasGrant = (...grants) => grants.some((g) => grantTypesValue.includes(g));
    const needsCallback = hasGrant('authorization_code', 'implicit');
    const needsAppToken = hasGrant('client_credentials');
    const needsUserToken = hasGrant('password', 'authorization_code', 'implicit');
    const needsRefreshToken = hasGrant('refresh_token');
    const needsIdToken = hasGrant('authorization_code');
    const needsPKCE = isResidentKM && hasGrant('authorization_code');

    const callbackUrl = getField('callbackUrl');
    const appTokenExpiry = getField('appAccessTokenExpiry', 3600);
    const userTokenExpiry = getField('userAccessTokenExpiry', 3600);
    const refreshTokenExpiry = getField('refreshTokenExpiry', -1);
    const idTokenExpiry = getField('idTokenExpiry', 3600);
    const enablePKCE = getField('enablePKCE', false);
    const pkceSupportsPlainText = getField('pkceSupportsPlainText', false);
    const publicClient = getField('publicClient', false);

    const grantTypeOptions = availableGrantTypes.map((gt) => ({
        value: gt,
        label: GRANT_TYPE_META[gt]?.label ?? gt,
    }));

    return (
        <Box>
            <SectionHeader />

            {/* Grant Types — admin chooses the ALLOWED SET. Unlike single-value fields,
                grant types do not have a Visible/Hidden toggle: the admin's selection IS
                the constraint, and developers can pick any subset of these at runtime.
                Per-grant configs (callbackUrl, expiry, PKCE) below DO have hidden/visible. */}
            <FieldRow
                label={(
                    <FormattedMessage
                        id='Governance.Templates.FormBuilder.km.grantTypes.label'
                        defaultMessage='Allowed Grant Types'
                    />
                )}
                description={(
                    <FormattedMessage
                        id='Governance.Templates.FormBuilder.km.grantTypes.desc'
                        defaultMessage={'OAuth2 grant flows developers may select for this key manager. '
                            + 'The selected set is the constraint — developers cannot request grants '
                            + 'outside this list. Leave empty to inherit every grant the KM advertises.'}
                    />
                )}
                omitHiddenToggle
                statusBadge={(
                    <Chip
                        size='small'
                        label={(
                            <FormattedMessage
                                id='Governance.Templates.FormBuilder.km.grantTypes.allowedListBadge'
                                defaultMessage='Allowed list'
                            />
                        )}
                        sx={{ height: 22, fontSize: '0.7rem' }}
                    />
                )}
                defaultEmpty={isEmpty(grantTypesValue)}
                isRequired
                defaultInput={(
                    <Select
                        fullWidth
                        multiple
                        size='small'
                        displayEmpty
                        value={grantTypesValue}
                        onChange={(e) => updateField('grantTypes', 'defaultValue', e.target.value)}
                        input={<OutlinedInput size='small' />}
                        renderValue={(selected) => {
                            if (selected.length === 0) {
                                return (
                                    <Typography variant='caption' color='text.disabled'>
                                        <FormattedMessage
                                            id='Governance.Templates.FormBuilder.km.grantTypes.none'
                                            defaultMessage='Select grant types…'
                                        />
                                    </Typography>
                                );
                            }
                            return (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((val) => (
                                        <Chip
                                            key={val}
                                            label={GRANT_TYPE_META[val]?.label ?? val}
                                            size='small'
                                        />
                                    ))}
                                </Box>
                            );
                        }}
                        MenuProps={{ PaperProps: { style: { maxHeight: 280 } } }}
                    >
                        {grantTypeOptions.map((gt) => (
                            <MenuItem key={gt.value} value={gt.value}>
                                {gt.label}
                                <Typography component='span' variant='caption' color='text.secondary' sx={{ ml: 1 }}>
                                    {`(${gt.value})`}
                                </Typography>
                            </MenuItem>
                        ))}
                    </Select>
                )}
            />

            {grantTypesValue.length === 0 && (
                <Box sx={{ py: 1 }}>
                    <Typography variant='caption' color='warning.main'>
                        <FormattedMessage
                            id='Governance.Templates.FormBuilder.km.grantTypes.hint'
                            defaultMessage='Select at least one grant type to unlock related fields.'
                        />
                    </Typography>
                </Box>
            )}

            {/* Callback URL */}
            {needsCallback && (
                <FieldRow
                    label={(
                        <FormattedMessage
                            id='Governance.Templates.FormBuilder.km.callbackUrl.label'
                            defaultMessage='Callback URL'
                        />
                    )}
                    description={(
                        <FormattedMessage
                            id='Governance.Templates.FormBuilder.km.callbackUrl.desc'
                            defaultMessage='OAuth redirect URI for Authorization Code / Implicit flows'
                        />
                    )}
                    hidden={callbackUrl.hidden}
                    onToggleHidden={(v) => updateField('callbackUrl', 'hidden', v)}
                    defaultEmpty={isEmpty(callbackUrl.defaultValue)}
                    defaultInput={(
                        <TextField
                            fullWidth
                            size='small'
                            placeholder='https://example.com/callback'
                            value={callbackUrl.defaultValue}
                            onChange={(e) => updateField('callbackUrl', 'defaultValue', e.target.value)}
                        />
                    )}
                />
            )}

            {/* App Access Token Expiry */}
            {needsAppToken && (
                <FieldRow
                    label={(
                        <FormattedMessage
                            id='Governance.Templates.FormBuilder.km.appTokenExpiry.label'
                            defaultMessage='App Access Token Expiry (s)'
                        />
                    )}
                    description={(
                        <FormattedMessage
                            id='Governance.Templates.FormBuilder.km.appTokenExpiry.desc'
                            defaultMessage='Expiry for client_credentials tokens; -1 for unlimited'
                        />
                    )}
                    hidden={appTokenExpiry.hidden}
                    onToggleHidden={(v) => updateField('appAccessTokenExpiry', 'hidden', v)}
                    defaultEmpty={isEmpty(appTokenExpiry.defaultValue)}
                    defaultInput={(
                        <TextField
                            fullWidth
                            size='small'
                            type='number'
                            value={appTokenExpiry.defaultValue}
                            onChange={(e) => updateField(
                                'appAccessTokenExpiry', 'defaultValue', Number(e.target.value),
                            )}
                            inputProps={{ min: -1 }}
                            helperText={getTokenExpiryHelperText(appTokenExpiry, intl)}
                        />
                    )}
                />
            )}

            {/* User Access Token Expiry */}
            {needsUserToken && (
                <FieldRow
                    label={(
                        <FormattedMessage
                            id='Governance.Templates.FormBuilder.km.userTokenExpiry.label'
                            defaultMessage='User Access Token Expiry (s)'
                        />
                    )}
                    description={(
                        <FormattedMessage
                            id='Governance.Templates.FormBuilder.km.userTokenExpiry.desc'
                            defaultMessage='Expiry for password / authorization_code tokens; -1 for unlimited'
                        />
                    )}
                    hidden={userTokenExpiry.hidden}
                    onToggleHidden={(v) => updateField('userAccessTokenExpiry', 'hidden', v)}
                    defaultEmpty={isEmpty(userTokenExpiry.defaultValue)}
                    defaultInput={(
                        <TextField
                            fullWidth
                            size='small'
                            type='number'
                            value={userTokenExpiry.defaultValue}
                            onChange={(e) => updateField(
                                'userAccessTokenExpiry', 'defaultValue', Number(e.target.value),
                            )}
                            inputProps={{ min: -1 }}
                            helperText={getTokenExpiryHelperText(userTokenExpiry, intl)}
                        />
                    )}
                />
            )}

            {/* Refresh Token Expiry */}
            {needsRefreshToken && (
                <FieldRow
                    label={(
                        <FormattedMessage
                            id='Governance.Templates.FormBuilder.km.refreshTokenExpiry.label'
                            defaultMessage='Refresh Token Expiry (s)'
                        />
                    )}
                    description={(
                        <FormattedMessage
                            id='Governance.Templates.FormBuilder.km.refreshTokenExpiry.desc'
                            defaultMessage='Expiry for refresh tokens; -1 for unlimited'
                        />
                    )}
                    hidden={refreshTokenExpiry.hidden}
                    onToggleHidden={(v) => updateField('refreshTokenExpiry', 'hidden', v)}
                    defaultEmpty={isEmpty(refreshTokenExpiry.defaultValue)}
                    defaultInput={(
                        <TextField
                            fullWidth
                            size='small'
                            type='number'
                            value={refreshTokenExpiry.defaultValue}
                            onChange={(e) => updateField('refreshTokenExpiry', 'defaultValue', Number(e.target.value))}
                            inputProps={{ min: -1 }}
                            helperText={getTokenExpiryHelperText(refreshTokenExpiry, intl)}
                        />
                    )}
                />
            )}

            {/* ID Token Expiry */}
            {needsIdToken && (
                <FieldRow
                    label={(
                        <FormattedMessage
                            id='Governance.Templates.FormBuilder.km.idTokenExpiry.label'
                            defaultMessage='ID Token Expiry (s)'
                        />
                    )}
                    description={(
                        <FormattedMessage
                            id='Governance.Templates.FormBuilder.km.idTokenExpiry.desc'
                            defaultMessage='Expiry for OIDC ID tokens (authorization_code only); -1 for unlimited'
                        />
                    )}
                    hidden={idTokenExpiry.hidden}
                    onToggleHidden={(v) => updateField('idTokenExpiry', 'hidden', v)}
                    defaultEmpty={isEmpty(idTokenExpiry.defaultValue)}
                    defaultInput={(
                        <TextField
                            fullWidth
                            size='small'
                            type='number'
                            value={idTokenExpiry.defaultValue}
                            onChange={(e) => updateField('idTokenExpiry', 'defaultValue', Number(e.target.value))}
                            inputProps={{ min: -1 }}
                            helperText={getTokenExpiryHelperText(idTokenExpiry, intl)}
                        />
                    )}
                />
            )}

            {/* PKCE — Resident KM only, shown when auth_code grant selected */}
            {needsPKCE && (
                <>
                    <FieldRow
                        label={(
                            <FormattedMessage
                                id='Governance.Templates.FormBuilder.km.enablePKCE.label'
                                defaultMessage='Enable PKCE'
                            />
                        )}
                        description={(
                            <FormattedMessage
                                id='Governance.Templates.FormBuilder.km.enablePKCE.desc'
                                defaultMessage={'Require PKCE for authorization_code flows '
                                    + '(recommended for public clients)'}
                            />
                        )}
                        hidden={enablePKCE.hidden}
                        onToggleHidden={(v) => updateField('enablePKCE', 'hidden', v)}
                        defaultEmpty={false}
                        defaultInput={(
                            <Switch
                                checked={enablePKCE.defaultValue === true}
                                onChange={(e) => updateField('enablePKCE', 'defaultValue', e.target.checked)}
                                color='primary'
                            />
                        )}
                    />
                    <FieldRow
                        label={(
                            <FormattedMessage
                                id='Governance.Templates.FormBuilder.km.pkceSupportsPlainText.label'
                                defaultMessage='Allow PKCE Plain Text'
                            />
                        )}
                        description={(
                            <FormattedMessage
                                id='Governance.Templates.FormBuilder.km.pkceSupportsPlainText.desc'
                                defaultMessage='Allow unhashed code verifiers (only when PKCE is enabled)'
                            />
                        )}
                        hidden={pkceSupportsPlainText.hidden}
                        onToggleHidden={(v) => updateField('pkceSupportsPlainText', 'hidden', v)}
                        defaultEmpty={false}
                        defaultInput={(
                            <Switch
                                checked={pkceSupportsPlainText.defaultValue === true}
                                onChange={(e) => updateField('pkceSupportsPlainText', 'defaultValue', e.target.checked)}
                                color='primary'
                            />
                        )}
                    />
                    <FieldRow
                        label={(
                            <FormattedMessage
                                id='Governance.Templates.FormBuilder.km.publicClient.label'
                                defaultMessage='Public Client'
                            />
                        )}
                        description={(
                            <FormattedMessage
                                id='Governance.Templates.FormBuilder.km.publicClient.desc'
                                defaultMessage='Mark as a public client (no client secret required)'
                            />
                        )}
                        hidden={publicClient.hidden}
                        onToggleHidden={(v) => updateField('publicClient', 'hidden', v)}
                        defaultEmpty={false}
                        defaultInput={(
                            <Switch
                                checked={publicClient.defaultValue === true}
                                onChange={(e) => updateField('publicClient', 'defaultValue', e.target.checked)}
                                color='primary'
                            />
                        )}
                    />
                </>
            )}
        </Box>
    );
}

KMGovernancePanel.propTypes = {
    kmConfig: PropTypes.shape({}).isRequired,
    availableGrantTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
    isResidentKM: PropTypes.bool.isRequired,
    onUpdate: PropTypes.func.isRequired,
};

// ─── KMAccordion — one accordion per key manager ──────────────────────────────

function KMAccordion({
    km, kmConfig, onToggleEnabled, onUpdateField,
}) {
    const intl = useIntl();
    const [fullDetails, setFullDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [grantTypesInitialized, setGrantTypesInitialized] = useState(false);

    const isEnabled = !!kmConfig?.enabled;
    const isResidentKM = km.type === RESIDENT_KM_TYPE;
    const [expanded, setExpanded] = useState(false);

    // Open the details as soon as governance is enabled so admins can configure
    // the KM immediately; keep manual collapse/expand working afterwards.
    useEffect(() => {
        setExpanded(isEnabled);
        if (!isEnabled) {
            setGrantTypesInitialized(false);
        }
    }, [isEnabled]);

    // Fetch full KM details (including availableGrantTypes) when first enabled
    useEffect(() => {
        if (!isEnabled || fullDetails !== null || loadingDetails) return;
        setLoadingDetails(true);
        new API()
            .keyManagerGet(km.id)
            .then((res) => {
                setFullDetails(res.body);
            })
            .catch(() => {
                // Fallback to a sensible default grant type list based on KM type
                setFullDetails({
                    availableGrantTypes: isResidentKM
                        ? RESIDENT_FALLBACK_GRANT_TYPES
                        : EXTERNAL_FALLBACK_GRANT_TYPES,
                });
            })
            .finally(() => setLoadingDetails(false));
    }, [isEnabled]);

    const grantTypesFromList = Array.isArray(km.availableGrantTypes) && km.availableGrantTypes.length > 0
        ? km.availableGrantTypes
        : null;
    const hasResolvedGrantTypes = fullDetails !== null || grantTypesFromList !== null;
    const availableGrantTypes = dedupeStringList(
        fullDetails?.availableGrantTypes
            ?? grantTypesFromList
            ?? (isResidentKM ? RESIDENT_FALLBACK_GRANT_TYPES : EXTERNAL_FALLBACK_GRANT_TYPES),
    );

    // A governed KM with an empty grant list is hard to reason about: the
    // developer UI treats it as unconstrained, while the admin cannot see any
    // grant-specific settings. Seed the list from the KM once, then let admins
    // remove grants intentionally.
    useEffect(() => {
        if (!isEnabled || loadingDetails || !hasResolvedGrantTypes
            || grantTypesInitialized || availableGrantTypes.length === 0) return;
        const selectedGrantTypes = Array.isArray(kmConfig?.grantTypes?.defaultValue)
            ? kmConfig.grantTypes.defaultValue
            : [];
        if (selectedGrantTypes.length === 0) {
            onUpdateField(km.name, 'grantTypes', 'defaultValue', availableGrantTypes);
        }
        setGrantTypesInitialized(true);
    }, [
        isEnabled,
        loadingDetails,
        hasResolvedGrantTypes,
        grantTypesInitialized,
        fullDetails,
        availableGrantTypes.join('|'),
    ]);

    const handleToggle = (e) => {
        e.stopPropagation();
        onToggleEnabled(km.name, !isEnabled);
        if (!isEnabled) {
            setExpanded(true);
        }
    };

    return (
        <Accordion
            expanded={isEnabled ? expanded : false}
            onChange={(_, newExpanded) => isEnabled && setExpanded(newExpanded)}
            sx={{
                mb: 0.5,
                opacity: isEnabled ? 1 : 0.7,
            }}
        >
            <AccordionSummary
                expandIcon={isEnabled
                    ? <ExpandMoreIcon />
                    : <LockOutlinedIcon sx={{ fontSize: '1.2rem', opacity: 0.5 }} />}
                sx={{ cursor: isEnabled ? 'pointer' : 'default !important' }}
            >
                <Box
                    sx={{
                        display: 'flex', alignItems: 'center', width: '100%', gap: 1.5,
                    }}
                >
                    {/* Enable/disable toggle — stopPropagation so it doesn't expand/collapse */}
                    <Tooltip
                        title={isEnabled
                            ? intl.formatMessage({
                                id: 'Governance.Templates.FormBuilder.km.toggle.disable',
                                defaultMessage: 'Disable governance for this key manager',
                            })
                            : intl.formatMessage({
                                id: 'Governance.Templates.FormBuilder.km.toggle.enable',
                                defaultMessage: 'Enable governance for this key manager',
                            })}
                        arrow
                    >
                        <Switch
                            checked={isEnabled}
                            onChange={handleToggle}
                            onClick={(e) => e.stopPropagation()}
                            color='primary'
                            size='small'
                        />
                    </Tooltip>

                    <Box>
                        <Typography variant='subtitle2' fontWeight={600}>
                            {km.displayName || km.name}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, mt: 0.25 }}>
                            <Chip
                                label={km.type}
                                size='small'
                                variant='outlined'
                                sx={{ height: 16, fontSize: '0.65rem' }}
                            />
                            {isResidentKM && (
                                <Chip
                                    label='Resident'
                                    size='small'
                                    color='primary'
                                    variant='outlined'
                                    sx={{ height: 16, fontSize: '0.65rem' }}
                                />
                            )}
                            {isEnabled && (
                                <Chip
                                    label={intl.formatMessage({
                                        id: 'Governance.Templates.FormBuilder.km.governed',
                                        defaultMessage: 'Governed',
                                    })}
                                    size='small'
                                    color='success'
                                    sx={{ height: 16, fontSize: '0.65rem' }}
                                />
                            )}
                        </Box>
                    </Box>

                    {!isEnabled && (
                        <Typography variant='caption' color='text.secondary' sx={{ ml: 'auto', mr: 1 }}>
                            <FormattedMessage
                                id='Governance.Templates.FormBuilder.km.disabled.hint'
                                defaultMessage='Toggle on to govern this key manager'
                            />
                        </Typography>
                    )}
                </Box>
            </AccordionSummary>

            {isEnabled && (
                <AccordionDetails sx={{ pt: 0 }}>
                    {loadingDetails ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : (
                        <KMGovernancePanel
                            kmName={km.name}
                            kmConfig={kmConfig}
                            availableGrantTypes={availableGrantTypes}
                            isResidentKM={isResidentKM}
                            onUpdate={(fieldKey, configKey, value) => (
                                onUpdateField(km.name, fieldKey, configKey, value)
                            )}
                        />
                    )}
                </AccordionDetails>
            )}
        </Accordion>
    );
}

KMAccordion.propTypes = {
    km: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        displayName: PropTypes.string,
        type: PropTypes.string,
    }).isRequired,
    kmConfig: PropTypes.shape({}),
    onToggleEnabled: PropTypes.func.isRequired,
    onUpdateField: PropTypes.func.isRequired,
};
KMAccordion.defaultProps = { kmConfig: null };

// ─── Main component ───────────────────────────────────────────────────────────

export default function FormBuilderStep({ templateState, dispatch }) {
    const intl = useIntl();

    const [appPolicies, setAppPolicies] = useState([]);
    const [loadingPolicies, setLoadingPolicies] = useState(true);
    const [customAttributes, setCustomAttributes] = useState([]);
    const [loadingAttributes, setLoadingAttributes] = useState(true);
    const [groupsEnabled, setGroupsEnabled] = useState(false);
    const [availableKMs, setAvailableKMs] = useState([]);

    useEffect(() => {
        const api = new API();
        Promise.all([
            api.applicationThrottlingPoliciesGet(),
            api.getSettings(),
            api.getKeyManagersList().catch(() => ({ body: { list: [] } })),
        ])
            .then(([appRes, settingsRes, kmsRes]) => {
                const applicationSharingEnabled = !!settingsRes.applicationSharingEnabled;
                const applicationAttributes = settingsRes.applicationAttributes ?? [];
                setAppPolicies(appRes.body.list.map((p) => p.policyName));
                setGroupsEnabled(applicationSharingEnabled);
                setCustomAttributes(applicationAttributes);
                dispatch({
                    field: 'formConfig',
                    value: reconcileServerBackedFields(
                        templateState.formConfig,
                        applicationSharingEnabled,
                        applicationAttributes,
                    ),
                });
                setAvailableKMs((kmsRes.body?.list ?? []).filter((km) => km.enabled));
                setLoadingAttributes(false);
            })
            .catch(() => {
                Alert.error(intl.formatMessage({
                    id: 'Governance.Templates.FormBuilder.policiesFetch.error',
                    defaultMessage: 'Failed to load policies. Some dropdowns may be empty.',
                }));
                setLoadingAttributes(false);
            })
            .finally(() => setLoadingPolicies(false));
    }, []);

    // ── Application section helpers ──────────────────────────────────────────

    const getField = (section, fieldKey, emptyDefault = '') => {
        return templateState.formConfig?.[section]?.[fieldKey] ?? { hidden: false, defaultValue: emptyDefault };
    };

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

    const getAttrField = (attrName) => {
        return templateState.formConfig?.application?.attributes?.[attrName]
            ?? { hidden: false, defaultValue: '' };
    };

    const updateAttrField = (attrName, configKey, value) => {
        const currentAttributes = templateState.formConfig?.application?.attributes ?? {};
        dispatch({
            field: 'formConfig',
            value: {
                ...templateState.formConfig,
                application: {
                    ...templateState.formConfig.application,
                    attributes: {
                        ...currentAttributes,
                        [attrName]: { ...(currentAttributes[attrName] ?? {}), [configKey]: value },
                    },
                },
            },
        });
    };

    // ── Key Manager section helpers ──────────────────────────────────────────

    const getKMConfig = (kmName) => {
        return templateState.formConfig?.keyManagers?.[kmName] ?? defaultKMConfig();
    };

    const handleKMToggleEnabled = (kmName, enabled) => {
        const currentKMs = templateState.formConfig?.keyManagers ?? {};
        const existing = currentKMs[kmName] ?? defaultKMConfig();
        dispatch({
            field: 'formConfig',
            value: {
                ...templateState.formConfig,
                keyManagers: {
                    ...currentKMs,
                    [kmName]: { ...existing, enabled },
                },
            },
        });
    };

    const handleKMUpdateField = (kmName, fieldKey, configKey, value) => {
        const currentKMs = templateState.formConfig?.keyManagers ?? {};
        const existing = currentKMs[kmName] ?? defaultKMConfig();
        dispatch({
            field: 'formConfig',
            value: {
                ...templateState.formConfig,
                keyManagers: {
                    ...currentKMs,
                    [kmName]: {
                        ...existing,
                        [fieldKey]: {
                            ...(existing[fieldKey] ?? {}),
                            [configKey]: value,
                        },
                    },
                },
            },
        });
    };

    // ── Derived values ───────────────────────────────────────────────────────

    const appThrottling = getField('application', 'throttlingPolicy');
    const appDescription = getField('application', 'description');
    const appGroups = getField('application', 'groups');

    const inactiveAttributes = Object.entries(templateState.formConfig?.application?.attributes ?? {})
        .filter(([, attrConfig]) => attrConfig?.active === false)
        .map(([attrName]) => attrName);

    const governedKMCount = availableKMs.filter(
        (km) => !!templateState.formConfig?.keyManagers?.[km.name]?.enabled,
    ).length;

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
                    defaultMessage='Field Configuration'
                />
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                <FormattedMessage
                    id='Governance.Templates.FormBuilder.subheading'
                    defaultMessage={'Configure which fields developers see and set '
                        + 'organisation-wide defaults for hidden fields.'}
                />
            </Typography>

            {/* ── Section 1: Application Metadata (expanded by default) ── */}
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
                        defaultEmpty={isEmpty(appThrottling.defaultValue)}
                        isRequired
                        defaultInput={(
                            <Select
                                fullWidth
                                size='small'
                                displayEmpty
                                value={appThrottling.defaultValue}
                                onChange={(e) => updateField(
                                    'application', 'throttlingPolicy', 'defaultValue', e.target.value,
                                )}
                            >
                                <MenuItem value=''>
                                    <em>
                                        <FormattedMessage
                                            id='Governance.Templates.FormBuilder.select.noDefault'
                                            defaultMessage='— No default —'
                                        />
                                    </em>
                                </MenuItem>
                                {appPolicies.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                            </Select>
                        )}
                    />

                    <FieldRow
                        label={(
                            <FormattedMessage
                                id='Governance.Templates.FormBuilder.app.description.label'
                                defaultMessage='Description'
                            />
                        )}
                        description={(
                            <FormattedMessage
                                id='Governance.Templates.FormBuilder.app.description.desc'
                                defaultMessage='Short description of the application purpose'
                            />
                        )}
                        hidden={appDescription.hidden}
                        onToggleHidden={(v) => updateField('application', 'description', 'hidden', v)}
                        defaultEmpty={isEmpty(appDescription.defaultValue)}
                        required={isTrue(appDescription.required)}
                        onToggleRequired={(v) => updateField('application', 'description', 'required', v)}
                        defaultInput={(
                            <TextField
                                fullWidth
                                size='small'
                                multiline
                                rows={2}
                                value={appDescription.defaultValue}
                                onChange={(e) => updateField(
                                    'application', 'description', 'defaultValue', e.target.value,
                                )}
                            />
                        )}
                    />

                    {groupsEnabled && (
                        <FieldRow
                            label={(
                                <FormattedMessage
                                    id='Governance.Templates.FormBuilder.app.groups.label'
                                    defaultMessage='Application Groups'
                                />
                            )}
                            description={(
                                <FormattedMessage
                                    id='Governance.Templates.FormBuilder.app.groups.desc'
                                    defaultMessage='Group(s) the application belongs to for shared access'
                                />
                            )}
                            hidden={appGroups.hidden}
                            onToggleHidden={(v) => updateField('application', 'groups', 'hidden', v)}
                            defaultEmpty={isEmpty(appGroups.defaultValue)}
                            required={isTrue(appGroups.required)}
                            onToggleRequired={(v) => updateField('application', 'groups', 'required', v)}
                            defaultInput={(
                                <TextField
                                    fullWidth
                                    size='small'
                                    placeholder='e.g. internal-team, platform-team'
                                    value={toCommaSeparated(appGroups.defaultValue)}
                                    onChange={(e) => updateField(
                                        'application', 'groups', 'defaultValue', e.target.value,
                                    )}
                                    helperText={intl.formatMessage({
                                        id: 'Governance.Templates.FormBuilder.app.groups.helper',
                                        defaultMessage: 'Comma-separated group names; '
                                            + 'developers can add more if visible',
                                    })}
                                />
                            )}
                        />
                    )}

                    {!loadingAttributes && customAttributes.map((attr) => {
                        const attrField = getAttrField(attr.attribute);
                        const attrRequired = isTrue(attr.required);
                        const templateRequired = isTrue(attrField.required);
                        return (
                            <FieldRow
                                key={attr.attribute}
                                label={attr.attribute}
                                description={attr.description || null}
                                hidden={attrField.hidden}
                                onToggleHidden={(v) => updateAttrField(attr.attribute, 'hidden', v)}
                                defaultEmpty={isEmpty(attrField.defaultValue)}
                                isRequired={attrRequired || templateRequired}
                                required={templateRequired}
                                requiredLocked={attrRequired}
                                onToggleRequired={attrRequired
                                    ? null
                                    : (v) => updateAttrField(attr.attribute, 'required', v)}
                                defaultInput={(
                                    <TextField
                                        fullWidth
                                        size='small'
                                        value={attrField.defaultValue}
                                        onChange={(e) => updateAttrField(
                                            attr.attribute, 'defaultValue', e.target.value,
                                        )}
                                    />
                                )}
                            />
                        );
                    })}

                    {inactiveAttributes.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant='caption' color='text.secondary' display='block' sx={{ mb: 0.75 }}>
                                <FormattedMessage
                                    id='Governance.Templates.FormBuilder.inactiveAttributes'
                                    defaultMessage={'Unavailable server fields are retained and will be restored '
                                        + 'if the server config adds them again.'}
                                />
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                                {inactiveAttributes.map((attrName) => (
                                    <Chip
                                        key={attrName}
                                        label={attrName}
                                        size='small'
                                        variant='outlined'
                                        color='default'
                                    />
                                ))}
                            </Box>
                        </Box>
                    )}
                </AccordionDetails>
            </Accordion>

            {/* ── Section 2: Key Manager Governance ── */}
            <Accordion defaultExpanded={false} sx={{ mt: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box>
                        <Typography variant='subtitle1' fontWeight={600}>
                            <FormattedMessage
                                id='Governance.Templates.FormBuilder.section.keyManagers'
                                defaultMessage='Key Manager Governance'
                            />
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                            {governedKMCount === 0 ? (
                                <FormattedMessage
                                    id='Governance.Templates.FormBuilder.section.keyManagers.desc.none'
                                    defaultMessage='Enable one or more key managers to govern their OAuth settings'
                                />
                            ) : (
                                <FormattedMessage
                                    id='Governance.Templates.FormBuilder.section.keyManagers.desc.count'
                                    defaultMessage='{count} key manager(s) governed'
                                    values={{ count: governedKMCount }}
                                />
                            )}
                        </Typography>
                    </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 1 }}>
                    {availableKMs.length === 0 ? (
                        <Typography variant='body2' color='text.secondary' sx={{ py: 2 }}>
                            <FormattedMessage
                                id='Governance.Templates.FormBuilder.keyManagers.empty'
                                defaultMessage='No key managers are available in this environment.'
                            />
                        </Typography>
                    ) : (
                        <>
                            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                                <FormattedMessage
                                    id='Governance.Templates.FormBuilder.keyManagers.intro'
                                    defaultMessage={'Toggle a key manager on to define default OAuth settings '
                        + 'that developers will see (or have pre-filled) when generating keys using that key manager.'}
                                />
                            </Typography>
                            {availableKMs.map((km) => (
                                <KMAccordion
                                    key={km.name}
                                    km={km}
                                    kmConfig={getKMConfig(km.name)}
                                    onToggleEnabled={handleKMToggleEnabled}
                                    onUpdateField={handleKMUpdateField}
                                />
                            ))}
                        </>
                    )}
                </AccordionDetails>
            </Accordion>
        </Box>
    );
}

FormBuilderStep.propTypes = {
    templateState: PropTypes.shape({
        formConfig: PropTypes.shape({}).isRequired,
    }).isRequired,
    dispatch: PropTypes.func.isRequired,
};
