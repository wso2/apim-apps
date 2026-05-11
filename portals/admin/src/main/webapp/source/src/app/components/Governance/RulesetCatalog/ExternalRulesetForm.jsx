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
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import yaml from 'js-yaml';
import PropTypes from 'prop-types';
import {
    FormattedMessage,
    useIntl,
} from 'react-intl';
import {
    Box,
    Button,
    Grid,
    IconButton,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

function normalizeYamlScalar(value) {
    if (value == null) {
        return '';
    }

    const trimmed = String(value).trim();
    if (!trimmed) {
        return '';
    }

    if ((trimmed.startsWith('"') && trimmed.endsWith('"'))
        || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
        return trimmed.slice(1, -1);
    }

    return trimmed;
}

// Use a YAML parser to robustly find headers nested under rules
function extractHeadersFromYaml(yamlText) {
    try {
        const obj = yaml.load(yamlText) || {};
        const rules = obj.rules || {};
        const rows = [];
        let matchedRuleKey = null;

        Object.keys(rules).some((rk) => {
            const r = rules[rk];
            if (r && Array.isArray(r.headers) && r.headers.length > 0) {
                matchedRuleKey = rk;
                r.headers.forEach((h, idx) => {
                    rows.push({
                        id: `header-${rk}-${idx}`,
                        key: normalizeYamlScalar(h.key),
                        value: normalizeYamlScalar(h.value),
                        category: normalizeYamlScalar(h.category) || 'Standard',
                    });
                });
                return true; // stop after first match
            }
            return false;
        });

        return { rows, ruleKey: matchedRuleKey };
    } catch (e) {
        return { rows: [], ruleKey: null };
    }
}

function updateHeadersInYaml(yamlText, ruleKey, rows) {
    try {
        const obj = yaml.load(yamlText) || {};
        if (!obj.rules) {
            obj.rules = {};
        }

        let targetRuleKey = ruleKey;
        if (!targetRuleKey) {
            // If no specific rule key was detected, attempt to place headers under the
            // first rule or create a default rule.
            const keys = Object.keys(obj.rules);
            if (keys.length === 0) {
                obj.rules.default = { headers: [] };
                targetRuleKey = 'default';
            } else {
                [targetRuleKey] = keys;
            }
        }

        if (!obj.rules[targetRuleKey]) {
            obj.rules[targetRuleKey] = {};
        }

        obj.rules[targetRuleKey].headers = rows.map((r) => ({
            key: r.key,
            value: r.value,
            category: r.category || 'Standard',
        }));

        // Prevent folding long strings by setting a large lineWidth
        return yaml.dump(obj, { noRefs: true, lineWidth: 1200 });
    } catch (e) {
        // On error, return original content unchanged
        return yamlText;
    }
}

function ExternalRulesetForm({ rulesetContent, onContentChange, onChangeDetected }) {
    const intl = useIntl();
    const lastSyncedYaml = useRef('');
    const [headerState, setHeaderState] = useState({
        rows: [],
        ruleKey: null,
    });
    const [originalRows, setOriginalRows] = useState([]);

    // Detect if there are unsaved changes
    useEffect(() => {
        const hasChanges = headerState.rows.some((row, idx) => {
            const original = originalRows[idx];
            return !original || row.key !== original.key || row.value !== original.value;
        }) || headerState.rows.length !== originalRows.length;

        if (onChangeDetected) {
            onChangeDetected(hasChanges);
        }
    }, [headerState.rows, originalRows, onChangeDetected]);

    useEffect(() => {
        if (!rulesetContent || rulesetContent === lastSyncedYaml.current) {
            return;
        }

        const parsed = extractHeadersFromYaml(rulesetContent);
        // Keep only security headers (case-insensitive match)
        const securityRows = (parsed.rows || [])
            .filter((r) => String(r.category || '').toUpperCase() === 'SECURITY')
            .map((r) => ({ ...r, isEdited: false }));
        setHeaderState({ ...parsed, rows: securityRows });
        setOriginalRows(securityRows.map((r) => ({ ...r }))); // Store a copy of original rows
        lastSyncedYaml.current = rulesetContent;
    }, [rulesetContent]);

    const syncHeaders = useCallback((rows, meta = headerState) => {
        const nextYaml = updateHeadersInYaml(rulesetContent, meta.ruleKey, rows);
        lastSyncedYaml.current = nextYaml;
        onContentChange(nextYaml);
    }, [headerState, onContentChange, rulesetContent]);

    const updateHeaderRow = (rowIndex, field, value) => {
        setHeaderState((prev) => {
            const rows = prev.rows.map((row, index) => (
                index === rowIndex
                    ? { ...row, [field]: value, isEdited: field === 'value' ? true : row.isEdited }
                    : row
            ));
            const nextState = { ...prev, rows };
            syncHeaders(rows, nextState);
            return nextState;
        });
    };

    const addSecurityHeader = () => {
        setHeaderState((prev) => {
            const rows = [
                ...prev.rows,
                {
                    id: `header-new-${Date.now()}`,
                    key: '',
                    value: '',
                    category: 'Security',
                    isEdited: false,
                },
            ];
            const nextState = { ...prev, rows };
            syncHeaders(rows, nextState);
            return nextState;
        });
    };

    const removeHeaderRow = (rowIndex) => {
        setHeaderState((prev) => {
            const rows = prev.rows.filter((_, index) => index !== rowIndex);
            const nextState = { ...prev, rows };
            syncHeaders(rows, nextState);
            return nextState;
        });
    };

    return (
        <Stack spacing={2}>
            <Paper variant='outlined' sx={{ p: 2 }}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 2,
                        mb: 2,
                    }}
                >
                    <Box>
                        <Typography color='inherit' variant='subtitle2' component='div'>
                            <FormattedMessage
                                id='Governance.Rulesets.ExternalForm.headers.title'
                                defaultMessage='Security Headers'
                            />
                        </Typography>
                        <Typography color='inherit' variant='caption' component='p'>
                            <FormattedMessage
                                id='Governance.Rulesets.ExternalForm.headers.description'
                                defaultMessage='Security headers can be edited.'
                            />
                        </Typography>
                    </Box>
                    <Button
                        variant='contained'
                        size='small'
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={addSecurityHeader}
                    >
                        <FormattedMessage
                            id='Governance.Rulesets.ExternalForm.headers.add'
                            defaultMessage='Add Security Header'
                        />
                    </Button>
                </Box>

                <Stack spacing={1.5}>
                    {headerState.rows.length === 0 && (
                        <Typography variant='body2' color='textSecondary'>
                            <FormattedMessage
                                id='Governance.Rulesets.ExternalForm.headers.empty'
                                defaultMessage='No security headers were found in this ruleset.'
                            />
                        </Typography>
                    )}

                    {headerState.rows.map((row, index) => {
                        const isEditable = String(row.category || '').toUpperCase() === 'SECURITY';
                        const rowKey = row.id
                            || `${row.category || 'header'}-${row.key || 'key'}-${row.value || 'value'}`;

                        return (
                            <Paper
                                key={rowKey}
                                variant='outlined'
                                sx={{ p: 1.5 }}
                            >
                                <Grid container spacing={1.5} alignItems='center'>
                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            margin='dense'
                                            fullWidth
                                            label={intl.formatMessage({
                                                id: 'Governance.Rulesets.ExternalForm.headers.key',
                                                defaultMessage: 'Header Key',
                                            })}
                                            value={row.key}
                                            onChange={(e) => updateHeaderRow(index, 'key', e.target.value)}
                                            disabled={!isEditable}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={7}>
                                        <TextField
                                            margin='dense'
                                            fullWidth
                                            label={intl.formatMessage({
                                                id: 'Governance.Rulesets.ExternalForm.headers.value',
                                                defaultMessage: 'Header Value',
                                            })}
                                            placeholder={intl.formatMessage({
                                                id: 'Governance.Rulesets.ExternalForm.headers.value.placeholder',
                                                defaultMessage: 'Enter new token',
                                            })}
                                            value={row.isEdited ? row.value : ''}
                                            onChange={(e) => updateHeaderRow(index, 'value', e.target.value)}
                                            disabled={!isEditable}
                                        />
                                    </Grid>
                                    <Grid item xs={2} md={1} sx={{ textAlign: 'right' }}>
                                        {isEditable ? (
                                            <IconButton
                                                aria-label='remove security header'
                                                onClick={() => removeHeaderRow(index)}
                                                color='error'
                                            >
                                                <DeleteOutlineIcon />
                                            </IconButton>
                                        ) : null}
                                    </Grid>
                                </Grid>
                            </Paper>
                        );
                    })}
                </Stack>

            </Paper>

        </Stack>
    );
}

ExternalRulesetForm.propTypes = {
    rulesetContent: PropTypes.string.isRequired,
    onContentChange: PropTypes.func.isRequired,
    onChangeDetected: PropTypes.func,
};

ExternalRulesetForm.defaultProps = {
    onChangeDetected: null,
};

export default ExternalRulesetForm;
