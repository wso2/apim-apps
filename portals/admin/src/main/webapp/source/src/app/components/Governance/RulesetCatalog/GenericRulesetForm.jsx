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

import React, {
    useState, useEffect, useCallback, useRef,
} from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    Box,
    Chip,
    Collapse,
    Divider,
    Grid,
    MenuItem,
    Slider,
    Switch,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PropTypes from 'prop-types';

/**
 * Parse YAML that may contain deduplication:, lifecycle_retirement:, and rules: sections.
 * Returns separate configs for each capability.
 */
function parseSimpleYaml(yamlStr) {
    const result = {
        deduplication: {},
        lifecycle: {},
        dedupRules: {},
        lifecycleRules: {},
        hasDedupSection: false,
        hasLifecycleSection: false,
    };
    if (!yamlStr) return result;

    let currentSection = null;
    let currentRule = null;
    let multiLineKey = null;
    let multiLineValue = '';

    const flushMultiLine = () => {
        if (multiLineKey && currentRule) {
            const bucket = result.dedupRules[currentRule]
                ? result.dedupRules : result.lifecycleRules;
            if (bucket[currentRule]) {
                bucket[currentRule][multiLineKey] = multiLineValue;
            }
        }
        multiLineKey = null;
        multiLineValue = '';
    };

    const lines = yamlStr.split('\n');
    for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i];
        const trimmed = line.trim();

        if (trimmed.startsWith('#') || trimmed === '') {
            // skip comments and blank lines
        } else {
            const indent = line.search(/\S/);

            if (indent === 0 && trimmed.endsWith(':')) {
                flushMultiLine();
                currentSection = trimmed.slice(0, -1);
                if (currentSection === 'deduplication') result.hasDedupSection = true;
                if (currentSection === 'lifecycle_retirement') result.hasLifecycleSection = true;
                currentRule = null;
            } else if (currentSection === 'deduplication' && indent >= 2) {
                const match = trimmed.match(/^([\w_]+):\s*(.*)$/);
                if (match) {
                    const key = match[1];
                    let value = match[2].trim();
                    if (value === 'true') value = true;
                    else if (value === 'false') value = false;
                    else if (/^\d+\.\d+$/.test(value)) value = parseFloat(value);
                    else if (/^\d+$/.test(value)) value = parseInt(value, 10);
                    result.deduplication[key] = value;
                }
            } else if (currentSection === 'lifecycle_retirement' && indent >= 2) {
                const match = trimmed.match(/^([\w_]+):\s*(.*)$/);
                if (match) {
                    const key = match[1];
                    let value = match[2].trim();
                    if (value === 'true') value = true;
                    else if (value === 'false') value = false;
                    else if (/^\d+\.\d+$/.test(value)) value = parseFloat(value);
                    else if (/^\d+$/.test(value)) value = parseInt(value, 10);
                    const normalizedKey = key === 'successor_similarity_threshold'
                        ? 'similarity_threshold' : key;
                    result.lifecycle[normalizedKey] = value;
                }
            } else if (currentSection === 'rules') {
                if (multiLineKey && indent <= 4 && trimmed.match(/^[\w_-]+:/)) {
                    flushMultiLine();
                }

                if (indent === 2 && trimmed.endsWith(':')) {
                    currentRule = trimmed.slice(0, -1);
                    if (/lifecycle|retirement|successor|deprecat/i.test(currentRule)) {
                        result.lifecycleRules[currentRule] = {};
                    } else {
                        result.dedupRules[currentRule] = {};
                    }
                } else if (indent >= 4 && currentRule && !multiLineKey) {
                    const match = trimmed.match(/^([\w_-]+):\s*(.*)$/);
                    if (match) {
                        const key = match[1];
                        const rawValue = match[2].trim();
                        if (rawValue === '>-' || rawValue === '>' || rawValue === '|') {
                            multiLineKey = key;
                            multiLineValue = '';
                        } else {
                            const bucket = result.dedupRules[currentRule]
                                ? result.dedupRules : result.lifecycleRules;
                            if (bucket[currentRule]) {
                                bucket[currentRule][key] = rawValue;
                            }
                        }
                    }
                } else if (multiLineKey && indent >= 6) {
                    if (multiLineValue) multiLineValue += ' ';
                    multiLineValue += trimmed;
                }
            }
        }
    }

    flushMultiLine();
    return result;
}

/**
 * Serialize config to combined YAML string.
 * Outputs deduplication: and/or lifecycle_retirement: sections based on toggles.
 */
function toSimpleYaml(cfg) {
    const escapeYaml = (val) => {
        if (!val) return '""';
        const s = String(val);
        if (s.includes(':') || s.includes('#') || s.includes('{') || s.includes('}')
            || s.includes('[') || s.includes(']') || s.includes(',') || s.includes('&')
            || s.includes('*') || s.includes('!') || s.includes('|') || s.includes('>')
            || s.includes("'") || s.includes('"') || s.startsWith(' ') || s.endsWith(' ')) {
            return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
        }
        return s;
    };

    const parts = [];

    if (cfg.dedupEnabled) {
        const d = cfg.dedup;
        parts.push(
            'deduplication:',
            `  enabled: ${d.enabled}`,
            `  similarity_threshold: ${d.similarity_threshold}`,
            `  high_confidence_threshold: ${d.high_confidence_threshold}`,
            `  mode: ${d.mode}`,
        );
    }

    if (cfg.lifecycleEnabled) {
        const l = cfg.lifecycle;
        parts.push(
            'lifecycle_retirement:',
            `  enabled: ${l.enabled}`,
            `  mode: ${l.mode}`,
            `  successor_similarity_threshold: ${l.similarity_threshold}`,
            `  sunset_period_days: ${l.sunset_period_days || 90}`,
            '  required_successor_status: PUBLISHED',
            '  applicable_transitions:',
            '    - DEPRECATED',
            '    - RETIRED',
            '  compliance_exclusion: true',
        );
    }

    parts.push('rules:');

    if (cfg.dedupEnabled) {
        const ruleKey = Object.keys(cfg.dedupRules)[0] || 'api-deduplication-check';
        const rule = cfg.dedupRules[ruleKey] || {};
        parts.push(
            `  ${ruleKey}:`,
            `    description: ${escapeYaml(rule.description)}`,
            `    severity: ${rule.severity || 'error'}`,
            '    message: >-',
            `      ${rule.message || ''}`,
        );
    }

    if (cfg.lifecycleEnabled) {
        const ruleKey = Object.keys(cfg.lifecycleRules)[0] || 'successor-linkage-check';
        const rule = cfg.lifecycleRules[ruleKey] || {};
        parts.push(
            `  ${ruleKey}:`,
            `    description: ${escapeYaml(rule.description)}`,
            `    severity: ${rule.severity || 'error'}`,
            '    message: >-',
            `      ${rule.message || ''}`,
        );
    }

    parts.push('');
    return parts.join('\n');
}

/* Default configs */
const DEFAULT_DEDUP_CONFIG = {
    enabled: true,
    similarity_threshold: 0.50,
    high_confidence_threshold: 0.99,
    mode: 'audit',
};

const DEFAULT_LIFECYCLE_CONFIG = {
    enabled: true,
    similarity_threshold: 0.50,
    sunset_period_days: 90,
    mode: 'audit',
};

const DEFAULT_DEDUP_RULES = {
    'api-deduplication-check': {
        description: 'Detects structurally similar APIs using MinHash/LSH algorithm',
        severity: 'error',
        message: 'This API has high structural similarity with existing APIs in the catalog. '
            + 'Review for potential duplication or consolidation opportunities.',
    },
};

const DEFAULT_LIFECYCLE_RULES = {
    'successor-linkage-check': {
        description: 'Validates successor API linkage during lifecycle transitions',
        severity: 'error',
        message: 'API lifecycle transition requires a valid successor API to be linked.',
    },
};

/**
 * GenericRulesetForm - Structured form for GENERIC rulesets.
 * Supports dual-capability with independent toggles for API Deduplication
 * Detection and API Retirement / Lifecycle Management.
 */
function GenericRulesetForm({ rulesetContent, onContentChange, rulesetName }) {
    const intl = useIntl();

    // Detect which capabilities are present in existing content
    const detectCapabilities = () => {
        let dedup = false;
        let lifecycle = false;
        if (rulesetContent) {
            if (/deduplication:/i.test(rulesetContent)) dedup = true;
            if (/lifecycle_retirement:/i.test(rulesetContent)) lifecycle = true;
        }
        if (rulesetName && /lifecycle|retirement/i.test(rulesetName)) lifecycle = true;
        if (!dedup && !lifecycle) dedup = true;
        return { dedup, lifecycle };
    };

    const initial = detectCapabilities();

    // Single config object to avoid stale closures
    const [config, setConfig] = useState({
        dedupEnabled: initial.dedup,
        lifecycleEnabled: initial.lifecycle,
        dedup: { ...DEFAULT_DEDUP_CONFIG },
        lifecycle: { ...DEFAULT_LIFECYCLE_CONFIG },
        dedupRules: JSON.parse(JSON.stringify(DEFAULT_DEDUP_RULES)),
        lifecycleRules: JSON.parse(JSON.stringify(DEFAULT_LIFECYCLE_RULES)),
    });
    const lastSyncedYaml = useRef('');

    // Parse incoming YAML whenever rulesetContent changes from external source
    useEffect(() => {
        if (rulesetContent && rulesetContent !== lastSyncedYaml.current) {
            try {
                const parsed = parseSimpleYaml(rulesetContent);
                setConfig((prev) => {
                    const updated = { ...prev };
                    if (parsed.hasDedupSection) {
                        updated.dedupEnabled = true;
                        if (Object.keys(parsed.deduplication).length > 0) {
                            updated.dedup = { ...prev.dedup, ...parsed.deduplication };
                        }
                        if (Object.keys(parsed.dedupRules).length > 0) {
                            updated.dedupRules = parsed.dedupRules;
                        }
                    }
                    if (parsed.hasLifecycleSection) {
                        updated.lifecycleEnabled = true;
                        if (Object.keys(parsed.lifecycle).length > 0) {
                            updated.lifecycle = { ...prev.lifecycle, ...parsed.lifecycle };
                        }
                        if (Object.keys(parsed.lifecycleRules).length > 0) {
                            updated.lifecycleRules = parsed.lifecycleRules;
                        }
                    }
                    return updated;
                });
                lastSyncedYaml.current = rulesetContent;
            } catch (e) {
                console.warn('Failed to parse ruleset YAML:', e.message);
            }
        }
    }, [rulesetContent]);

    // Serialize config to YAML and notify parent
    const syncToYaml = useCallback((cfg) => {
        try {
            const yaml = toSimpleYaml(cfg);
            lastSyncedYaml.current = yaml;
            onContentChange(yaml);
        } catch (e) {
            console.error('Error serializing config to YAML:', e);
        }
    }, [onContentChange]);

    const updateConfig = useCallback((updater) => {
        setConfig((prev) => {
            const updated = updater(prev);
            syncToYaml(updated);
            return updated;
        });
    }, [syncToYaml]);

    const handleDedupToggle = useCallback((checked) => {
        updateConfig((prev) => ({ ...prev, dedupEnabled: checked }));
    }, [updateConfig]);

    const handleLifecycleToggle = useCallback((checked) => {
        updateConfig((prev) => ({ ...prev, lifecycleEnabled: checked }));
    }, [updateConfig]);

    const updateDedupCfg = useCallback((field, value) => {
        updateConfig((prev) => ({
            ...prev,
            dedup: { ...prev.dedup, [field]: value },
        }));
    }, [updateConfig]);

    const updateLifecycleCfg = useCallback((field, value) => {
        updateConfig((prev) => ({
            ...prev,
            lifecycle: { ...prev.lifecycle, [field]: value },
        }));
    }, [updateConfig]);

    const updateDedupRule = useCallback((field, value) => {
        updateConfig((prev) => {
            const ruleKey = Object.keys(prev.dedupRules)[0] || 'api-deduplication-check';
            return {
                ...prev,
                dedupRules: {
                    ...prev.dedupRules,
                    [ruleKey]: { ...prev.dedupRules[ruleKey], [field]: value },
                },
            };
        });
    }, [updateConfig]);

    const updateLifecycleRule = useCallback((field, value) => {
        updateConfig((prev) => {
            const ruleKey = Object.keys(prev.lifecycleRules)[0] || 'successor-linkage-check';
            return {
                ...prev,
                lifecycleRules: {
                    ...prev.lifecycleRules,
                    [ruleKey]: { ...prev.lifecycleRules[ruleKey], [field]: value },
                },
            };
        });
    }, [updateConfig]);

    const { dedup, lifecycle } = config;
    const dedupRuleKey = Object.keys(config.dedupRules)[0] || 'api-deduplication-check';
    const dedupRule = config.dedupRules[dedupRuleKey] || {};
    const lifecycleRuleKey = Object.keys(config.lifecycleRules)[0] || 'successor-linkage-check';
    const lifecycleRule = config.lifecycleRules[lifecycleRuleKey] || {};

    return (
        <Box sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
        }}
        >
            {/* API Deduplication Detection */}
            <Box sx={{
                border: '1px solid',
                borderColor: config.dedupEnabled
                    ? 'primary.light' : 'divider',
                borderRadius: 1,
                overflow: 'hidden',
                transition: 'border-color 0.3s ease',
            }}
            >
                <Box sx={{ p: 2 }}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                    >
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                        }}
                        >
                            <Typography
                                variant='body2'
                                fontWeight='bold'
                            >
                                <FormattedMessage
                                    id='Governance.Rulesets.GenericForm.toggle.dedup'
                                    defaultMessage='API Deduplication Detection'
                                />
                            </Typography>
                            {config.dedupEnabled && (
                                <Chip
                                    label='On'
                                    color='success'
                                    size='small'
                                />
                            )}
                        </Box>
                        <Switch
                            checked={config.dedupEnabled}
                            onChange={(e) => handleDedupToggle(
                                e.target.checked,
                            )}
                            color='primary'
                        />
                    </Box>
                    <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{ display: 'block' }}
                    >
                        <FormattedMessage
                            id='Governance.Rulesets.GenericForm.toggle.dedup.desc'
                            defaultMessage={
                                'Detects structurally similar APIs'
                                + ' using MinHash/LSH fingerprinting'
                                + ' to prevent catalog bloat.'
                            }
                        />
                    </Typography>
                </Box>
                <Collapse
                    in={config.dedupEnabled}
                    timeout={300}
                >
                    <Divider />
                    <Box sx={{ px: 3, pb: 3, pt: 2 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    mb: 1,
                                }}
                                >
                                    <Typography
                                        variant='body2'
                                        fontWeight='medium'
                                    >
                                        <FormattedMessage
                                            id='Governance.Rulesets.GenericForm.similarity.label'
                                            defaultMessage='Similarity Threshold'
                                        />
                                    </Typography>
                                    <Tooltip title={intl.formatMessage({
                                        id: 'Governance.Rulesets.GenericForm.similarity.tooltip',
                                        defaultMessage: 'APIs with Jaccard'
                                            + ' similarity above this'
                                            + ' value are flagged as'
                                            + ' potential duplicates.',
                                    })}
                                    >
                                        <InfoOutlinedIcon
                                            fontSize='small'
                                            color='action'
                                        />
                                    </Tooltip>
                                    <Chip
                                        label={`${(dedup.similarity_threshold * 100).toFixed(0)}%`}
                                        size='small'
                                        color='primary'
                                        sx={{ ml: 'auto' }}
                                    />
                                </Box>
                                <Slider
                                    value={
                                        dedup.similarity_threshold
                                    }
                                    onChange={(e, val) => updateDedupCfg(
                                        'similarity_threshold',
                                        val,
                                    )}
                                    min={0.50}
                                    max={1.00}
                                    step={0.01}
                                    marks={[
                                        { value: 0.50, label: '50%' },
                                        { value: 0.70, label: '70%' },
                                        { value: 0.80, label: '80%' },
                                        { value: 1.00, label: '100%' },
                                    ]}
                                    valueLabelDisplay='auto'
                                    valueLabelFormat={(v) => `${(v * 100).toFixed(0)}%`}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    mb: 1,
                                }}
                                >
                                    <Typography
                                        variant='body2'
                                        fontWeight='medium'
                                    >
                                        <FormattedMessage
                                            id='Governance.Rulesets.GenericForm.highconf.label'
                                            defaultMessage='High Confidence Threshold'
                                        />
                                    </Typography>
                                    <Tooltip title={intl.formatMessage({
                                        id: 'Governance.Rulesets.GenericForm.highconf.tooltip',
                                        defaultMessage: 'APIs exceeding this'
                                            + ' higher threshold are'
                                            + ' flagged as near-certain'
                                            + ' duplicates.',
                                    })}
                                    >
                                        <InfoOutlinedIcon
                                            fontSize='small'
                                            color='action'
                                        />
                                    </Tooltip>
                                    <Chip
                                        label={`${(dedup.high_confidence_threshold * 100).toFixed(0)}%`}
                                        size='small'
                                        color='error'
                                        sx={{ ml: 'auto' }}
                                    />
                                </Box>
                                <Slider
                                    value={
                                        dedup.high_confidence_threshold
                                    }
                                    onChange={(e, val) => updateDedupCfg(
                                        'high_confidence_threshold',
                                        val,
                                    )}
                                    min={0.80}
                                    max={1.00}
                                    step={0.01}
                                    marks={[
                                        { value: 0.80, label: '80%' },
                                        { value: 0.90, label: '90%' },
                                        { value: 0.95, label: '95%' },
                                        { value: 1.00, label: '100%' },
                                    ]}
                                    valueLabelDisplay='auto'
                                    valueLabelFormat={(v) => `${(v * 100).toFixed(0)}%`}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select
                                    fullWidth
                                    label={intl.formatMessage({
                                        id: 'Governance.Rulesets.GenericForm.mode.label',
                                        defaultMessage: 'Detection Mode',
                                    })}
                                    value={dedup.mode}
                                    onChange={(e) => updateDedupCfg(
                                        'mode',
                                        e.target.value,
                                    )}
                                    variant='outlined'
                                    size='small'
                                    helperText={intl.formatMessage({
                                        id: 'Governance.Rulesets.GenericForm.mode.helper',
                                        defaultMessage: 'How the system responds'
                                            + ' when duplicates are found',
                                    })}
                                >
                                    <MenuItem value='audit'>
                                        Audit - Log &amp; alert only
                                    </MenuItem>
                                    <MenuItem value='warn'>
                                        Warn - Log &amp; add warning
                                    </MenuItem>
                                    <MenuItem value='block'>
                                        Block - Reject API Deploying
                                    </MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select
                                    fullWidth
                                    label={intl.formatMessage({
                                        id: 'Governance.Rulesets.GenericForm.severity.label',
                                        defaultMessage: 'Violation Severity',
                                    })}
                                    value={
                                        dedupRule.severity || 'error'
                                    }
                                    onChange={(e) => updateDedupRule(
                                        'severity',
                                        e.target.value,
                                    )}
                                    variant='outlined'
                                    size='small'
                                    helperText={intl.formatMessage({
                                        id: 'Governance.Rulesets.GenericForm.severity.helper',
                                        defaultMessage: 'Severity level reported'
                                            + ' for detected duplicates',
                                    })}
                                >
                                    <MenuItem value='error'>
                                        Error
                                    </MenuItem>
                                    <MenuItem value='warn'>
                                        Warning
                                    </MenuItem>
                                    <MenuItem value='info'>
                                        Info
                                    </MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12}>
                                <Divider sx={{ mb: 1 }} />
                                <Typography
                                    variant='body2'
                                    fontWeight='medium'
                                    sx={{ mb: 1 }}
                                >
                                    <FormattedMessage
                                        id='Governance.Rulesets.GenericForm.message.title'
                                        defaultMessage='Violation Message'
                                    />
                                </Typography>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    value={
                                        dedupRule.message || ''
                                    }
                                    onChange={(e) => updateDedupRule(
                                        'message',
                                        e.target.value,
                                    )}
                                    label={intl.formatMessage({
                                        id: 'Governance.Rulesets.GenericForm.message.label',
                                        defaultMessage: 'Message shown when'
                                            + ' a duplicate is detected',
                                    })}
                                    variant='outlined'
                                    size='small'
                                />
                                <TextField
                                    fullWidth
                                    value={
                                        dedupRule.description || ''
                                    }
                                    onChange={(e) => updateDedupRule(
                                        'description',
                                        e.target.value,
                                    )}
                                    label={intl.formatMessage({
                                        id: 'Governance.Rulesets.GenericForm.ruledesc.label',
                                        defaultMessage: 'Rule Description',
                                    })}
                                    variant='outlined'
                                    size='small'
                                    sx={{ mt: 2 }}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </Collapse>
            </Box>

            {/* API Retirement / Lifecycle Management */}
            <Box sx={{
                border: '1px solid',
                borderColor: config.lifecycleEnabled
                    ? 'primary.light' : 'divider',
                borderRadius: 1,
                overflow: 'hidden',
                transition: 'border-color 0.3s ease',
            }}
            >
                <Box sx={{ p: 2 }}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                    >
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                        }}
                        >
                            <Typography
                                variant='body2'
                                fontWeight='bold'
                            >
                                <FormattedMessage
                                    id='Governance.Rulesets.GenericForm.toggle.lifecycle'
                                    defaultMessage='API Retirement / Lifecycle Management'
                                />
                            </Typography>
                            {config.lifecycleEnabled && (
                                <Chip
                                    label='On'
                                    color='success'
                                    size='small'
                                />
                            )}
                        </Box>
                        <Switch
                            checked={config.lifecycleEnabled}
                            onChange={(e) => handleLifecycleToggle(
                                e.target.checked,
                            )}
                            color='primary'
                        />
                    </Box>
                    <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{ display: 'block' }}
                    >
                        <FormattedMessage
                            id='Governance.Rulesets.GenericForm.toggle.lifecycle.desc'
                            defaultMessage={
                                'Validates that APIs being deprecated'
                                + ' or retired have a linked'
                                + ' successor API.'
                            }
                        />
                    </Typography>
                </Box>
                <Collapse
                    in={config.lifecycleEnabled}
                    timeout={300}
                >
                    <Divider />
                    <Box sx={{ px: 3, pb: 3, pt: 2 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    mb: 1,
                                }}
                                >
                                    <Typography
                                        variant='body2'
                                        fontWeight='medium'
                                    >
                                        <FormattedMessage
                                            id='Governance.Rulesets.GenericForm.lifecycle.threshold.label'
                                            defaultMessage='Successor Similarity Threshold'
                                        />
                                    </Typography>
                                    <Tooltip title={intl.formatMessage({
                                        id: 'Governance.Rulesets.GenericForm.lifecycle.threshold.tooltip',
                                        defaultMessage: 'Minimum similarity'
                                            + ' between deprecated API'
                                            + ' and its successor.',
                                    })}
                                    >
                                        <InfoOutlinedIcon
                                            fontSize='small'
                                            color='action'
                                        />
                                    </Tooltip>
                                    <Chip
                                        label={`${(lifecycle.similarity_threshold * 100).toFixed(0)}%`}
                                        size='small'
                                        color='primary'
                                        sx={{ ml: 'auto' }}
                                    />
                                </Box>
                                <Slider
                                    value={
                                        lifecycle.similarity_threshold
                                    }
                                    onChange={(e, val) => updateLifecycleCfg(
                                        'similarity_threshold',
                                        val,
                                    )}
                                    min={0.50}
                                    max={1.00}
                                    step={0.01}
                                    marks={[
                                        { value: 0.50, label: '50%' },
                                        { value: 0.70, label: '70%' },
                                        { value: 0.80, label: '80%' },
                                        { value: 1.00, label: '100%' },
                                    ]}
                                    valueLabelDisplay='auto'
                                    valueLabelFormat={(v) => `${(v * 100).toFixed(0)}%`}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    type='number'
                                    label={intl.formatMessage({
                                        id: 'Governance.Rulesets.GenericForm.lifecycle.sunset.label',
                                        defaultMessage: 'Sunset Period (days)',
                                    })}
                                    value={
                                        lifecycle.sunset_period_days
                                        || 90
                                    }
                                    onChange={(e) => updateLifecycleCfg(
                                        'sunset_period_days',
                                        parseInt(
                                            e.target.value,
                                            10,
                                        ) || 90,
                                    )}
                                    variant='outlined'
                                    size='small'
                                    helperText={intl.formatMessage({
                                        id: 'Governance.Rulesets.GenericForm.lifecycle.sunset.helper',
                                        defaultMessage: 'Grace period before'
                                            + ' deprecated API is retired',
                                    })}
                                    inputProps={{ min: 1, max: 365 }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select
                                    fullWidth
                                    label={intl.formatMessage({
                                        id: 'Governance.Rulesets.GenericForm.lifecycle.mode.label',
                                        defaultMessage: 'Enforcement Mode',
                                    })}
                                    value={lifecycle.mode}
                                    onChange={(e) => updateLifecycleCfg(
                                        'mode',
                                        e.target.value,
                                    )}
                                    variant='outlined'
                                    size='small'
                                    helperText={intl.formatMessage({
                                        id: 'Governance.Rulesets.GenericForm.lifecycle.mode.helper',
                                        defaultMessage: 'How the system responds'
                                            + ' to lifecycle violations',
                                    })}
                                >
                                    <MenuItem value='audit'>
                                        Audit - Log &amp; alert only
                                    </MenuItem>
                                    <MenuItem value='warn'>
                                        Warn - Log &amp; add warning
                                    </MenuItem>
                                    <MenuItem value='block'>
                                        Block - Reject transition
                                    </MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select
                                    fullWidth
                                    label={intl.formatMessage({
                                        id: 'Governance.Rulesets.GenericForm.lifecycle.severity.label',
                                        defaultMessage: 'Violation Severity',
                                    })}
                                    value={
                                        lifecycleRule.severity
                                        || 'error'
                                    }
                                    onChange={(e) => updateLifecycleRule(
                                        'severity',
                                        e.target.value,
                                    )}
                                    variant='outlined'
                                    size='small'
                                    helperText={intl.formatMessage({
                                        id: 'Governance.Rulesets.GenericForm.lifecycle.severity.helper',
                                        defaultMessage: 'Severity level for'
                                            + ' lifecycle violations',
                                    })}
                                >
                                    <MenuItem value='error'>
                                        Error
                                    </MenuItem>
                                    <MenuItem value='warn'>
                                        Warning
                                    </MenuItem>
                                    <MenuItem value='info'>
                                        Info
                                    </MenuItem>
                                </TextField>
                            </Grid>
                        </Grid>
                    </Box>
                </Collapse>
            </Box>
        </Box>
    );
}

GenericRulesetForm.propTypes = {
    rulesetContent: PropTypes.string.isRequired,
    onContentChange: PropTypes.func.isRequired,
    rulesetName: PropTypes.string,
};

GenericRulesetForm.defaultProps = {
    rulesetName: '',
};

export default GenericRulesetForm;
