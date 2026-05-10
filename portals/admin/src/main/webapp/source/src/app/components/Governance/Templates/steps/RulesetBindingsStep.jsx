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

import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Collapse,
    Divider,
    Grid,
    IconButton,
    InputAdornment,
    MenuItem,
    OutlinedInput,
    Paper,
    Select,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import PublicIcon from '@mui/icons-material/Public';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import GovernanceAPI from 'AppData/GovernanceAPI';
import API from 'AppData/api';
import Alert from 'AppComponents/Shared/Alert';
import Utils from 'AppData/Utils';

// ─── Sentinel value for "All Key Managers" option in the multi-select ─────────
// An empty keyManagerScopes array on the DTO means global scope.
// Internally we represent that as this sentinel so MUI Select has a value to display.
const ALL_KM_VALUE = '__all_key_managers__';

function cleanYamlScalar(value = '') {
    return String(value)
        .replace(/\s+#.*$/, '')
        .replace(/^['"]|['"]$/g, '')
        .trim();
}

function getIndent(line) {
    const match = String(line).match(/^ */);
    return match ? match[0].length : 0;
}

function normalizeGiven(value) {
    if (Array.isArray(value)) return value.join(', ');
    return String(value ?? '').trim();
}

function buildRulePreview(name, rule = {}) {
    const message = rule.message || rule.description || '';
    const severity = rule.severity || '';
    const given = normalizeGiven(rule.given);
    return {
        name,
        message: String(message),
        severity: String(severity),
        given,
    };
}

function parseJsonRuleset(content) {
    try {
        const parsed = JSON.parse(content);
        if (!parsed?.rules || typeof parsed.rules !== 'object') return [];
        return Object.entries(parsed.rules).map(([name, rule]) => buildRulePreview(name, rule));
    } catch (error) {
        return [];
    }
}

function parseYamlRuleset(content) {
    const lines = String(content ?? '').split(/\r?\n/);
    const rulesLineIndex = lines.findIndex((line) => /^\s*rules\s*:/.test(line));
    if (rulesLineIndex === -1) return [];

    const rulesIndent = getIndent(lines[rulesLineIndex]);
    let ruleIndent = null;
    let currentRule = null;
    let insideRules = true;
    const rules = [];

    lines.slice(rulesLineIndex + 1).forEach((line) => {
        if (!insideRules) return;
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;

        const indent = getIndent(line);
        if (indent <= rulesIndent) {
            insideRules = false;
            return;
        }

        const ruleHeader = line.match(/^\s*(['"]?[^:'"]+['"]?)\s*:\s*(?:#.*)?$/);
        if (ruleHeader && (ruleIndent === null || indent === ruleIndent)) {
            ruleIndent = indent;
            currentRule = {
                name: cleanYamlScalar(ruleHeader[1]),
                message: '',
                severity: '',
                given: '',
            };
            rules.push(currentRule);
            return;
        }

        if (!currentRule || indent <= ruleIndent) return;

        const property = line.match(/^\s*(description|message|severity|given)\s*:\s*(.*)$/);
        if (property) {
            const [, key, value] = property;
            currentRule[key] = cleanYamlScalar(value);
        }
    });

    return rules.map((rule) => buildRulePreview(rule.name, rule));
}

function deriveRulesetRules(content) {
    const jsonRules = parseJsonRuleset(content);
    if (jsonRules.length > 0) return jsonRules;
    return parseYamlRuleset(content);
}

function getGuardSummary(ruleset) {
    if (ruleset?.ruleType === 'APP_OAUTH') {
        return 'Key Manager and OAuth application settings';
    }
    if (ruleset?.ruleType === 'APP_INFO') {
        return 'Application details';
    }
    return Utils.mapRuleTypeToLabel(ruleset?.ruleType);
}

// ─── Available-ruleset row (left pane) ────────────────────────────────────────

/**
 * One row in the "Available Rulesets" left pane.
 * Shows name, ruleType chip, artifactType chip, and an Add button.
 * The Add button is replaced with a "Bound" chip when already added.
 */
function AvailableRulesetRow({
    ruleset, isBound, onAdd, expanded, onToggle, preview, loadingPreview,
}) {
    const intl = useIntl();
    return (
        <Box
            sx={{
                p: 1.5,
                mb: 1,
                borderRadius: 1,
                border: '1px solid',
                borderColor: isBound ? 'primary.light' : 'divider',
                backgroundColor: isBound ? 'action.selected' : 'background.paper',
                transition: 'border-color 0.2s',
            }}
        >
            <Box
                role='button'
                tabIndex={0}
                onClick={onToggle}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') onToggle();
                }}
                sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    outline: 'none',
                }}
            >
                {/* Ruleset info */}
                <Box sx={{ flex: 1, minWidth: 0, mr: 1 }}>
                    <Typography
                        variant='body2'
                        fontWeight={500}
                        sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {ruleset.name}
                    </Typography>
                    <Box
                        sx={{
                            display: 'flex',
                            gap: 0.5,
                            mt: 0.5,
                            flexWrap: 'wrap',
                        }}
                    >
                        <Chip
                            label={Utils.mapRuleTypeToLabel(ruleset.ruleType)}
                            size='small'
                            variant='outlined'
                            sx={{ height: 16, '& .MuiChip-label': { px: '6px', fontSize: '0.6rem' } }}
                        />
                        <Chip
                            label={Utils.mapArtifactTypeToLabel(ruleset.artifactType)}
                            size='small'
                            sx={{ height: 16, '& .MuiChip-label': { px: '6px', fontSize: '0.6rem' } }}
                        />
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {/* Action */}
                    {isBound ? (
                        <Chip
                            label={intl.formatMessage({
                                id: 'Governance.Templates.RulesetBindings.bound.chip',
                                defaultMessage: 'Bound',
                            })}
                            size='small'
                            color='primary'
                            variant='filled'
                        />
                    ) : (
                        <Tooltip
                            title={intl.formatMessage({
                                id: 'Governance.Templates.RulesetBindings.add.tooltip',
                                defaultMessage: 'Add to template',
                            })}
                        >
                            <IconButton
                                size='medium'
                                color='primary'
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onAdd();
                                }}
                                sx={{ '& svg': { fontSize: '1.5rem' } }}
                            >
                                <AddIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                    <ExpandMoreIcon
                        fontSize='small'
                        sx={{
                            color: 'text.secondary',
                            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s',
                        }}
                    />
                </Box>
            </Box>
            <Collapse in={expanded} timeout='auto' unmountOnExit>
                <Box
                    sx={{
                        mt: 1.5,
                        pt: 1.5,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Typography variant='caption' color='text.secondary' display='block'>
                        <FormattedMessage
                            id='Governance.Templates.RulesetBindings.preview.guards'
                            defaultMessage='Guards: {target}'
                            values={{ target: getGuardSummary(ruleset) }}
                        />
                    </Typography>
                    {ruleset.description && (
                        <Typography variant='caption' color='text.secondary' display='block' sx={{ mt: 0.5 }}>
                            {ruleset.description}
                        </Typography>
                    )}
                    {loadingPreview ? (
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                mt: 1,
                            }}
                        >
                            <CircularProgress size={14} />
                            <Typography variant='caption' color='text.secondary'>
                                <FormattedMessage
                                    id='Governance.Templates.RulesetBindings.preview.loading'
                                    defaultMessage='Reading ruleset content…'
                                />
                            </Typography>
                        </Box>
                    ) : (
                        <Box sx={{ mt: 1 }}>
                            <Typography variant='caption' fontWeight={700} color='text.secondary' display='block'>
                                <FormattedMessage
                                    id='Governance.Templates.RulesetBindings.preview.rules'
                                    defaultMessage='Rules enforced'
                                />
                            </Typography>
                            {(preview?.rules ?? []).some((rule) => rule.message) ? (
                                <Box
                                    sx={{
                                        mt: 0.5,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 0.5,
                                    }}
                                >
                                    {preview.rules.filter((rule) => rule.message).map((rule) => (
                                        <Typography
                                            key={rule.name}
                                            variant='caption'
                                            color='text.primary'
                                            display='block'
                                            sx={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
                                        >
                                            {rule.message}
                                        </Typography>
                                    ))}
                                </Box>
                            ) : (
                                <Typography variant='caption' color='text.secondary' display='block' sx={{ mt: 0.5 }}>
                                    <FormattedMessage
                                        id='Governance.Templates.RulesetBindings.preview.noDerivedRules'
                                        defaultMessage='Rule details could not be derived from the ruleset content.'
                                    />
                                </Typography>
                            )}
                            {preview?.content && preview.rules.length === 0 && (
                                <Box
                                    component='pre'
                                    sx={{
                                        mt: 1,
                                        m: 0,
                                        p: 1,
                                        bgcolor: 'grey.50',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 1,
                                        maxHeight: 120,
                                        overflow: 'auto',
                                        whiteSpace: 'pre-wrap',
                                        overflowWrap: 'anywhere',
                                        wordBreak: 'break-all',
                                        fontSize: '0.68rem',
                                    }}
                                >
                                    {preview.content.slice(0, 1500)}
                                </Box>
                            )}
                        </Box>
                    )}
                </Box>
            </Collapse>
        </Box>
    );
}

AvailableRulesetRow.propTypes = {
    ruleset: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        description: PropTypes.string,
        ruleType: PropTypes.string.isRequired,
        artifactType: PropTypes.string.isRequired,
    }).isRequired,
    isBound: PropTypes.bool.isRequired,
    onAdd: PropTypes.func.isRequired,
    expanded: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired,
    loadingPreview: PropTypes.bool.isRequired,
    preview: PropTypes.shape({
        content: PropTypes.string,
        rules: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string.isRequired,
            message: PropTypes.string,
            severity: PropTypes.string,
            given: PropTypes.string,
        })),
    }),
};

AvailableRulesetRow.defaultProps = {
    preview: null,
};

// ─── Bound-ruleset card (right pane) ─────────────────────────────────────────

/**
 * Configuration card for a single bound ruleset.
 *
 * Controls:
 *  - Binding order: integer TextField
 *  - Key Manager scope: multi-Select with sentinel ALL_KM_VALUE for global scope
 *    (only shown when ruleType === 'APP_OAUTH')
 *  - Remove button
 *
 * KM scope behaviour:
 *  - Value `[ALL_KM_VALUE]` → payload `keyManagerScopes: []` (all allowed KMs)
 *  - Value `['km-uuid-1', ...]` → payload `keyManagerScopes: [{ keyManagerUuid: ... }]`
 *
 * The sentinel is mapped in/out only at this component boundary; the DTO never
 * sees it.
 */
function BoundRulesetCard({
    binding,
    ruleset,
    keyManagers,
    allowedKeyManagerNames,
    onScopeChange,
    onRemove,
}) {
    const intl = useIntl();

    // Map DTO → Select value: empty scopes array becomes [ALL_KM_VALUE]
    const selectValue = binding.keyManagerScopes.length === 0
        ? [ALL_KM_VALUE]
        : binding.keyManagerScopes.map((s) => s.keyManagerUuid);

    // Filter KM list to those allowed by the template's formConfig.
    // If allowedKeyManagerNames is empty the template permits all KMs.
    const eligibleKeyManagers = allowedKeyManagerNames.length === 0
        ? keyManagers
        : keyManagers.filter((km) => allowedKeyManagerNames.includes(km.name));

    const handleKmChange = (event) => {
        const raw = event.target.value; // string[] from MUI multi-select
        const lastPicked = raw[raw.length - 1];

        if (lastPicked === ALL_KM_VALUE) {
            // User explicitly clicked "All Key Managers" → revert to global scope
            onScopeChange([]);
            return;
        }

        // Remove the sentinel from the selection (handles the case where
        // the user adds a specific KM while the sentinel is still present)
        const specificIds = raw.filter((v) => v !== ALL_KM_VALUE);

        if (specificIds.length === 0) {
            // All specific KMs were deselected → fall back to global
            onScopeChange([]);
        } else {
            onScopeChange(specificIds.map((id) => ({ keyManagerUuid: id })));
        }
    };

    const rulesetName = ruleset?.name || binding.rulesetId;
    const isOAuth = ruleset?.ruleType === 'APP_OAUTH';
    const isGlobalScope = binding.keyManagerScopes.length === 0;

    return (
        <Paper
            variant='outlined'
            sx={{
                p: 2,
                mb: 1.5,
                borderColor: 'primary.light',
                '&:last-child': { mb: 0 },
            }}
        >
            {/* Header row: name + remove */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1.5,
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        minWidth: 0,
                    }}
                >
                    <Typography
                        variant='body2'
                        fontWeight={600}
                        sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                        {rulesetName}
                    </Typography>
                    {ruleset && (
                        <Chip
                            label={Utils.mapRuleTypeToLabel(ruleset.ruleType)}
                            size='small'
                            variant='outlined'
                            sx={{ height: 18, flexShrink: 0 }}
                        />
                    )}
                </Box>
                <Tooltip
                    title={intl.formatMessage({
                        id: 'Governance.Templates.RulesetBindings.remove.tooltip',
                        defaultMessage: 'Remove binding',
                    })}
                >
                    <IconButton size='small' color='error' onClick={onRemove} sx={{ ml: 1 }}>
                        <DeleteOutlineIcon fontSize='small' />
                    </IconButton>
                </Tooltip>
            </Box>

            <Divider sx={{ mb: 1.5 }} />

            {/* Controls */}
            <Grid container spacing={2} alignItems='flex-start'>
                {/* Key Manager scope — only relevant for APP_OAUTH rulesets */}
                {isOAuth && (
                    <Grid item xs={12}>
                        <Typography variant='caption' color='text.secondary' display='block' gutterBottom>
                            <FormattedMessage
                                id='Governance.Templates.RulesetBindings.scope.label'
                                defaultMessage='Key Manager Scope'
                            />
                        </Typography>
                        <Select
                            multiple
                            fullWidth
                            size='small'
                            value={selectValue}
                            onChange={handleKmChange}
                            input={<OutlinedInput size='small' />}
                            renderValue={(selected) => {
                                if (selected.includes(ALL_KM_VALUE) || selected.length === 0) {
                                    return (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <PublicIcon fontSize='small' color='success' />
                                            <Typography variant='body2' color='success.main'>
                                                <FormattedMessage
                                                    id='Governance.Templates.RulesetBindings.scope.allKm'
                                                    defaultMessage='All Allowed Key Managers'
                                                />
                                            </Typography>
                                        </Box>
                                    );
                                }
                                return (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((kmId) => {
                                            const km = keyManagers.find((k) => k.id === kmId);
                                            return (
                                                <Chip
                                                    key={kmId}
                                                    label={km?.name || kmId}
                                                    size='small'
                                                    icon={<VpnKeyIcon />}
                                                />
                                            );
                                        })}
                                    </Box>
                                );
                            }}
                            MenuProps={{ PaperProps: { style: { maxHeight: 260 } } }}
                        >
                            {/* "All Allowed Key Managers" sentinel option */}
                            <MenuItem value={ALL_KM_VALUE}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PublicIcon fontSize='small' color='success' />
                                    <Box>
                                        <Typography variant='body2'>
                                            <FormattedMessage
                                                id='Governance.Templates.RulesetBindings.scope.allKm.option'
                                                defaultMessage='All Allowed Key Managers'
                                            />
                                        </Typography>
                                        <Typography variant='caption' color='text.secondary'>
                                            <FormattedMessage
                                                id='Governance.Templates.RulesetBindings.scope.allKm.desc'
                                                defaultMessage='Applies to every Key Manager permitted by this template'
                                            />
                                        </Typography>
                                    </Box>
                                </Box>
                            </MenuItem>

                            {/* Divider before specific KMs */}
                            {eligibleKeyManagers.length > 0 && <Divider />}

                            {/* Individual Key Manager options */}
                            {eligibleKeyManagers.map((km) => (
                                <MenuItem key={km.id} value={km.id}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            width: '100%',
                                        }}
                                    >
                                        <VpnKeyIcon fontSize='small' color='action' />
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography variant='body2'>{km.name}</Typography>
                                            {km.description && (
                                                <Typography
                                                    variant='caption'
                                                    color='text.secondary'
                                                    sx={{
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        display: 'block',
                                                    }}
                                                >
                                                    {km.description}
                                                </Typography>
                                            )}
                                        </Box>
                                        {km.isGlobal && (
                                            <Chip label='Global' size='small' variant='outlined' />
                                        )}
                                    </Box>
                                </MenuItem>
                            ))}

                            {eligibleKeyManagers.length === 0 && (
                                <MenuItem disabled>
                                    <Typography variant='body2' color='text.secondary'>
                                        <FormattedMessage
                                            id='Governance.Templates.RulesetBindings.scope.noKm'
                                            defaultMessage='No Key Managers configured'
                                        />
                                    </Typography>
                                </MenuItem>
                            )}
                        </Select>

                        {isGlobalScope && (
                            <Typography variant='caption' color='text.secondary' display='block' sx={{ mt: 0.5 }}>
                                <FormattedMessage
                                    id='Governance.Templates.RulesetBindings.scope.global.hint'
                                    defaultMessage={
                                        'Select specific Key Managers to restrict '
                                        + 'when this ruleset is enforced'
                                    }
                                />
                            </Typography>
                        )}
                    </Grid>
                )}
            </Grid>
        </Paper>
    );
}

BoundRulesetCard.propTypes = {
    binding: PropTypes.shape({
        rulesetId: PropTypes.string.isRequired,
        bindingOrder: PropTypes.number.isRequired,
        keyManagerScopes: PropTypes.arrayOf(PropTypes.shape({
            keyManagerUuid: PropTypes.string.isRequired,
        })).isRequired,
    }).isRequired,
    ruleset: PropTypes.shape({
        name: PropTypes.string.isRequired,
        ruleType: PropTypes.string.isRequired,
    }),
    keyManagers: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        isGlobal: PropTypes.bool,
    })).isRequired,
    allowedKeyManagerNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    onScopeChange: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
};

BoundRulesetCard.defaultProps = {
    ruleset: null,
};

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * Step 3 of the TemplateWizard.
 *
 * Dual-pane layout:
 *   Left  — Searchable list of all available Spectral rulesets. "Add" button
 *            creates a new binding entry (disabled once already bound).
 *   Right — List of current bindings, each configurable with evaluation order
 *            and Key Manager scope.
 *
 * Dispatches to templateState.rulesetBindings on every change.
 *
 * @param {Object} props
 * @param {Object} props.templateState - wizard state slice
 * @param {Function} props.dispatch    - reducer dispatch
 */
export default function RulesetBindingsStep({ templateState, dispatch }) {
    const intl = useIntl();

    const [allRulesets, setAllRulesets] = useState([]);
    const [keyManagers, setKeyManagers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [expandedRulesetId, setExpandedRulesetId] = useState(null);
    const [rulesetPreviews, setRulesetPreviews] = useState({});
    const [loadingPreviewIds, setLoadingPreviewIds] = useState({});

    // Derive the allowed KM name list from enabled KM governance entries.
    // Empty array means "no restriction" (all KMs are eligible).
    const allowedKeyManagerNames = useMemo(() => {
        const kms = templateState.formConfig?.keyManagers ?? {};
        return Object.entries(kms)
            .filter(([, kmc]) => kmc?.enabled === true)
            .map(([name]) => name);
    }, [templateState.formConfig]);

    // ── Data fetch ────────────────────────────────────────────────────────────
    useEffect(() => {
        const govApi = new GovernanceAPI();
        const adminApi = new API();

        const emptyKmRes = { body: { list: [] } };
        Promise.all([
            govApi.getRulesets({ limit: 200, offset: 0 }),
            adminApi.getKeyManagersList().catch(() => emptyKmRes),
            adminApi.getGlobalKeyManagersList().catch(() => emptyKmRes),
        ])
            .then(([rulesetRes, localKmRes, globalKmRes]) => {
                setAllRulesets(rulesetRes.body.list || []);

                const localKms = (localKmRes.body.list || []).map((km) => ({
                    ...km,
                    isGlobal: false,
                }));
                const globalKms = (globalKmRes.body.list || []).map((km) => ({
                    ...km,
                    isGlobal: true,
                }));
                setKeyManagers([...localKms, ...globalKms]);
            })
            .catch(() => {
                Alert.error(intl.formatMessage({
                    id: 'Governance.Templates.RulesetBindings.fetch.error',
                    defaultMessage: 'Failed to load rulesets',
                }));
            })
            .finally(() => setLoading(false));
    }, []);

    // ── Derived data ──────────────────────────────────────────────────────────

    // Fast lookup: rulesetId → RulesetInfo
    const rulesetMap = useMemo(
        () => Object.fromEntries(allRulesets.map((r) => [r.id, r])),
        [allRulesets],
    );

    // Set of already-bound ruleset IDs for O(1) "is this bound?" check
    const boundIds = useMemo(
        () => new Set(templateState.rulesetBindings.map((b) => b.rulesetId)),
        [templateState.rulesetBindings],
    );

    const filteredRulesets = useMemo(
        () => allRulesets.filter(
            (r) => r.artifactType === 'APPLICATION'
                && r.name.toLowerCase().includes(search.toLowerCase()),
        ),
        [allRulesets, search],
    );

    // ── Binding mutations — always return a new array to preserve immutability ─

    const addBinding = (ruleset) => {
        const newBinding = {
            rulesetId: ruleset.id,
            // Auto-assign next order; admin can reorder manually
            bindingOrder: templateState.rulesetBindings.length,
            keyManagerScopes: [],
        };
        dispatch({
            field: 'rulesetBindings',
            value: [...templateState.rulesetBindings, newBinding],
        });
    };

    const removeBinding = (rulesetId) => {
        dispatch({
            field: 'rulesetBindings',
            value: templateState.rulesetBindings
                .filter((b) => b.rulesetId !== rulesetId)
                // Re-compact binding orders after removal so there are no gaps
                .map((b, idx) => ({ ...b, bindingOrder: idx })),
        });
    };

    const updateBinding = (rulesetId, patch) => {
        dispatch({
            field: 'rulesetBindings',
            value: templateState.rulesetBindings.map((b) => (
                b.rulesetId === rulesetId ? { ...b, ...patch } : b
            )),
        });
    };

    const toggleRulesetPreview = (ruleset) => {
        if (expandedRulesetId === ruleset.id) {
            setExpandedRulesetId(null);
            return;
        }
        setExpandedRulesetId(ruleset.id);
        if (rulesetPreviews[ruleset.id] || loadingPreviewIds[ruleset.id]) return;

        setLoadingPreviewIds((prev) => ({ ...prev, [ruleset.id]: true }));
        new GovernanceAPI()
            .getRulesetContent(ruleset.id)
            .then((contentResult) => {
                const content = contentResult.text ?? '';
                setRulesetPreviews((prev) => ({
                    ...prev,
                    [ruleset.id]: {
                        content,
                        rules: deriveRulesetRules(content),
                    },
                }));
            })
            .catch(() => {
                setRulesetPreviews((prev) => ({
                    ...prev,
                    [ruleset.id]: {
                        content: '',
                        rules: [],
                    },
                }));
            })
            .finally(() => {
                setLoadingPreviewIds((prev) => ({ ...prev, [ruleset.id]: false }));
            });
    };

    // ── Render ────────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress size={28} />
            </Box>
        );
    }

    const { rulesetBindings } = templateState;
    const sortedBindings = [...rulesetBindings].sort((a, b) => a.bindingOrder - b.bindingOrder);

    return (
        <Box>
            <Typography variant='h6' gutterBottom>
                <FormattedMessage
                    id='Governance.Templates.RulesetBindings.heading'
                    defaultMessage='Ruleset Bindings'
                />
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                <FormattedMessage
                    id='Governance.Templates.RulesetBindings.subheading'
                    defaultMessage='Bind Spectral rulesets to this template. Bound rulesets are snapshotted
                        at application-creation time and enforced synchronously by the governance interceptor.'
                />
            </Typography>

            <Grid container spacing={2} sx={{ height: 520 }}>

                {/* ── Left pane: Available Rulesets ── */}
                <Grid item xs={12} md={5} sx={{ height: '100%' }}>
                    <Paper
                        variant='outlined'
                        sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                    >
                        {/* Panel header */}
                        <Box
                            sx={{
                                p: 2,
                                pb: 1.5,
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                                flexShrink: 0,
                            }}
                        >
                            <Typography variant='subtitle2' gutterBottom>
                                <FormattedMessage
                                    id='Governance.Templates.RulesetBindings.available.heading'
                                    defaultMessage='Available Rulesets'
                                />
                            </Typography>
                            <TextField
                                fullWidth
                                size='small'
                                placeholder={intl.formatMessage({
                                    id: 'Governance.Templates.RulesetBindings.search.placeholder',
                                    defaultMessage: 'Search rulesets…',
                                })}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position='start'>
                                            <SearchIcon fontSize='small' color='action' />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>

                        {/* Scrollable ruleset list */}
                        <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5 }}>
                            {filteredRulesets.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Typography variant='body2' color='text.secondary'>
                                        {search ? (
                                            <FormattedMessage
                                                id='Governance.Templates.RulesetBindings.search.empty'
                                                defaultMessage='No rulesets match your search'
                                            />
                                        ) : (
                                            <FormattedMessage
                                                id='Governance.Templates.RulesetBindings.available.empty'
                                                defaultMessage={
                                                    'No rulesets found. Create rulesets in '
                                                    + 'the Ruleset Catalog first.'
                                                }
                                            />
                                        )}
                                    </Typography>
                                </Box>
                            ) : (
                                filteredRulesets.map((ruleset) => (
                                    <AvailableRulesetRow
                                        key={ruleset.id}
                                        ruleset={ruleset}
                                        isBound={boundIds.has(ruleset.id)}
                                        onAdd={() => addBinding(ruleset)}
                                        expanded={expandedRulesetId === ruleset.id}
                                        onToggle={() => toggleRulesetPreview(ruleset)}
                                        preview={rulesetPreviews[ruleset.id]}
                                        loadingPreview={!!loadingPreviewIds[ruleset.id]}
                                    />
                                ))
                            )}
                        </Box>
                    </Paper>
                </Grid>

                {/* ── Right pane: Bound Rulesets ── */}
                <Grid item xs={12} md={7} sx={{ height: '100%' }}>
                    <Paper
                        variant='outlined'
                        sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                    >
                        {/* Panel header */}
                        <Box
                            sx={{
                                p: 2,
                                pb: 1.5,
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                                flexShrink: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}
                        >
                            <Typography variant='subtitle2'>
                                <FormattedMessage
                                    id='Governance.Templates.RulesetBindings.bound.heading'
                                    defaultMessage='Bound Rulesets'
                                />
                            </Typography>
                            <Chip
                                label={rulesetBindings.length}
                                size='small'
                                color={rulesetBindings.length > 0 ? 'primary' : 'default'}
                                variant='outlined'
                            />
                        </Box>

                        {/* Scrollable bound list */}
                        <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5 }}>
                            {rulesetBindings.length === 0 ? (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '100%',
                                        textAlign: 'center',
                                        gap: 1,
                                        color: 'text.secondary',
                                    }}
                                >
                                    <AddIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                                    <Typography variant='body2'>
                                        <FormattedMessage
                                            id='Governance.Templates.RulesetBindings.bound.empty.title'
                                            defaultMessage='No rulesets bound yet'
                                        />
                                    </Typography>
                                    <Typography variant='caption'>
                                        <FormattedMessage
                                            id='Governance.Templates.RulesetBindings.bound.empty.hint'
                                            defaultMessage='Click the + icon next to a ruleset on the left to add it'
                                        />
                                    </Typography>
                                </Box>
                            ) : (
                                sortedBindings.map((binding) => (
                                    <BoundRulesetCard
                                        key={binding.rulesetId}
                                        binding={binding}
                                        ruleset={rulesetMap[binding.rulesetId]}
                                        keyManagers={keyManagers}
                                        allowedKeyManagerNames={allowedKeyManagerNames}
                                        onScopeChange={(scopes) => updateBinding(
                                            binding.rulesetId, { keyManagerScopes: scopes },
                                        )}
                                        onRemove={() => removeBinding(binding.rulesetId)}
                                    />
                                ))
                            )}
                        </Box>

                        {/* Bound count summary footer */}
                        {rulesetBindings.length > 0 && (
                            <Box
                                sx={{
                                    px: 2,
                                    py: 1,
                                    borderTop: '1px solid',
                                    borderColor: 'divider',
                                    flexShrink: 0,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <Typography variant='caption' color='text.secondary'>
                                    <FormattedMessage
                                        id='Governance.Templates.RulesetBindings.footer.summary'
                                        defaultMessage='{count} ruleset(s) will be snapshotted at application creation'
                                        values={{ count: rulesetBindings.length }}
                                    />
                                </Typography>
                                <Button
                                    size='small'
                                    color='error'
                                    variant='text'
                                    onClick={() => dispatch({ field: 'rulesetBindings', value: [] })}
                                >
                                    <FormattedMessage
                                        id='Governance.Templates.RulesetBindings.clearAll.btn'
                                        defaultMessage='Clear all'
                                    />
                                </Button>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}

RulesetBindingsStep.propTypes = {
    templateState: PropTypes.shape({
        formConfig: PropTypes.shape({
            keyManagers: PropTypes.objectOf(PropTypes.shape({
                enabled: PropTypes.bool,
            })),
        }),
        rulesetBindings: PropTypes.arrayOf(PropTypes.shape({
            rulesetId: PropTypes.string.isRequired,
            bindingOrder: PropTypes.number.isRequired,
            keyManagerScopes: PropTypes.arrayOf(PropTypes.shape({
                keyManagerUuid: PropTypes.string.isRequired,
            })).isRequired,
        })).isRequired,
    }).isRequired,
    dispatch: PropTypes.func.isRequired,
};
