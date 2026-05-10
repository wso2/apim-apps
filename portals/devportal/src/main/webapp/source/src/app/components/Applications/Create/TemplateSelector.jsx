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

import React, { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
    Box,
    Checkbox,
    Chip,
    CircularProgress,
    FormControlLabel,
    FormGroup,
    IconButton,
    InputAdornment,
    Pagination,
    Paper,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SearchIcon from '@mui/icons-material/Search';
import API from 'AppData/api';
import TemplatePreviewDialog from './TemplatePreviewDialog';
import {
    getDeveloperExperience,
} from './templateDeveloperViewUtils';

const TEMPLATE_FETCH_TIMEOUT_MS = 8000;

// ─── UnrestrictedCard ─────────────────────────────────────────────────────────

function UnrestrictedCard({ onSkip }) {
    return (
        <Paper
            variant='outlined'
            onClick={onSkip}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                p: 2.5,
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'box-shadow 0.18s, border-color 0.18s',
                '&:hover': { boxShadow: 4, borderColor: 'text.secondary' },
                position: 'relative',
                minHeight: 200,
                borderStyle: 'dashed',
            }}
        >
            <Box
                sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 1,
                    background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1.5,
                    flexShrink: 0,
                }}
            >
                <Typography variant='h6' fontWeight={700} color='text.secondary' sx={{ userSelect: 'none' }}>
                    —
                </Typography>
            </Box>
            <Typography variant='subtitle1' fontWeight={700} sx={{ mb: 0.5, lineHeight: 1.3 }}>
                <FormattedMessage
                    id='Applications.Create.TemplateSelector.unrestricted.name'
                    defaultMessage='No Restrictions'
                />
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ flex: 1, mb: 1.5 }}>
                <FormattedMessage
                    id='Applications.Create.TemplateSelector.unrestricted.desc'
                    defaultMessage={'Create an application without any governance template. '
                        + 'All fields are open and no rulesets are enforced.'}
                />
            </Typography>
        </Paper>
    );
}

UnrestrictedCard.propTypes = { onSkip: PropTypes.func.isRequired };

// ─── TemplateCard ─────────────────────────────────────────────────────────────

function TemplateCard({ template, onSelect, onPreview }) {
    const developerExperience = getDeveloperExperience(template);
    const summary = developerExperience.summary || template.description;
    const tags = Array.isArray(template.tags) ? template.tags : [];

    return (
        <Paper
            variant='outlined'
            onClick={() => onSelect(template)}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                p: 2.5,
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'box-shadow 0.18s, border-color 0.18s',
                '&:hover': {
                    boxShadow: 4,
                    borderColor: 'primary.main',
                },
                position: 'relative',
                minHeight: 200,
            }}
        >
            {/* Icon */}
            {template.icon ? (
                <Box
                    component='img'
                    src={template.icon}
                    alt={template.name}
                    sx={{
                        width: 48,
                        height: 48,
                        objectFit: 'contain',
                        mb: 1.5,
                        borderRadius: 1,
                    }}
                />
            ) : (
                <Box
                    sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 1,
                        background: 'linear-gradient(135deg, #e3edf7 0%, #c7d9f0 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 1.5,
                        flexShrink: 0,
                    }}
                >
                    <Typography
                        variant='h6'
                        fontWeight={700}
                        color='primary.main'
                        sx={{ userSelect: 'none' }}
                    >
                        {(template.name || '?').charAt(0).toUpperCase()}
                    </Typography>
                </Box>
            )}

            {/* Name */}
            <Typography variant='subtitle1' fontWeight={700} sx={{ mb: 0.5, lineHeight: 1.3 }}>
                {template.name}
                {template.isDefault && (
                    <Chip
                        label={<FormattedMessage id='Applications.Create.TemplateSelector.chip.default' defaultMessage='Default' />}
                        size='small'
                        color='primary'
                        variant='outlined'
                        sx={{
                            ml: 1, height: 18, fontSize: '0.65rem', verticalAlign: 'middle',
                        }}
                    />
                )}
                {template.isGlobal && (
                    <Chip
                        label={<FormattedMessage id='Applications.Create.TemplateSelector.chip.global' defaultMessage='Global' />}
                        size='small'
                        color='secondary'
                        variant='outlined'
                        sx={{
                            ml: 0.5, height: 18, fontSize: '0.65rem', verticalAlign: 'middle',
                        }}
                    />
                )}
            </Typography>

            {/* Tags */}
            {tags.length > 0 && (
                <Box
                    sx={{
                        display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1,
                    }}
                >
                    {tags.map((tag) => (
                        <Chip
                            key={tag}
                            label={tag}
                            size='small'
                            variant='outlined'
                            sx={{ height: 18, fontSize: '0.65rem' }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    ))}
                </Box>
            )}

            {/* Description */}
            <Typography
                variant='body2'
                color='text.secondary'
                sx={{
                    flex: 1,
                    display: '-webkit-box',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: 3,
                    overflow: 'hidden',
                    mb: 1.5,
                }}
            >
                {summary || (
                    <FormattedMessage
                        id='Applications.Create.TemplateSelector.card.noDescription'
                        defaultMessage='No description provided.'
                    />
                )}
            </Typography>

            {/* Info icon at bottom-right — click to open developer view dialog */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 'auto' }}>
                <Tooltip
                    title={(
                        <FormattedMessage
                            id='Applications.Create.TemplateSelector.info.tooltip'
                            defaultMessage='View governance details'
                        />
                    )}
                    arrow
                >
                    <IconButton
                        size='small'
                        onClick={(e) => {
                            e.stopPropagation();
                            onPreview(template);
                        }}
                        sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                    >
                        <InfoOutlinedIcon fontSize='small' />
                    </IconButton>
                </Tooltip>
            </Box>
        </Paper>
    );
}

TemplateCard.propTypes = {
    template: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        description: PropTypes.string,
        icon: PropTypes.string,
        tags: PropTypes.arrayOf(PropTypes.string),
        isDefault: PropTypes.bool,
        isGlobal: PropTypes.bool,
        formConfig: PropTypes.shape({}),
        rulesetBindings: PropTypes.arrayOf(PropTypes.shape({})),
    }).isRequired,
    onSelect: PropTypes.func.isRequired,
    onPreview: PropTypes.func.isRequired,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isTrue(value) {
    return value === true || value === 'true';
}

function getEffectiveTemplate(template, allAppAttributes, isApplicationSharingEnabled) {
    if (!template?.formConfig) {
        return template;
    }
    const currentAttributes = allAppAttributes
        ? new Map(
            allAppAttributes
                .filter((attr) => attr.hidden !== 'true' && attr.attribute)
                .map((attr) => [attr.attribute, attr]),
        )
        : null;
    const existingAttributes = template.formConfig?.application?.attributes ?? {};
    const effectiveAttributes = {};
    Object.entries(existingAttributes).forEach(([attrName, attrConfig]) => {
        const serverAttribute = currentAttributes?.get(attrName);
        effectiveAttributes[attrName] = {
            ...attrConfig,
            required: isTrue(attrConfig?.required) || serverAttribute?.required === 'true',
            active: currentAttributes ? !!serverAttribute : attrConfig?.active,
        };
    });
    if (currentAttributes) {
        currentAttributes.forEach((serverAttribute, attrName) => {
            effectiveAttributes[attrName] = {
                ...(effectiveAttributes[attrName] ?? { hidden: false, required: false, defaultValue: '' }),
                required: isTrue(effectiveAttributes[attrName]?.required) || serverAttribute.required === 'true',
                active: true,
            };
        });
    }
    return {
        ...template,
        formConfig: {
            ...template.formConfig,
            application: {
                ...(template.formConfig.application ?? {}),
                groups: {
                    ...((template.formConfig.application ?? {}).groups ?? {}),
                    active: isApplicationSharingEnabled,
                },
                attributes: effectiveAttributes,
            },
        },
    };
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * Intercept the application creation flow and let the developer choose a Governance Template.
 *
 * Features:
 *  - Search bar to filter by name or description
 *  - Tag filter (radio buttons: All + each unique tag)
 *  - Modern card grid — click a card to select, info icon opens developer view
 *  - Full-width layout (no maxWidth constraint)
 *
 * Fail-open contract: if no published templates exist or the fetch fails,
 * onSkip() is called automatically.
 */
export default function TemplateSelector({
    onSelect,
    onSkip,
    allAppAttributes,
    isApplicationSharingEnabled,
}) {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [previewTemplate, setPreviewTemplate] = useState(null);
    const [search, setSearch] = useState('');
    const [selectedTags, setSelectedTags] = useState(new Set());
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 12;

    useEffect(() => {
        let active = true;
        const failOpenTimer = setTimeout(() => {
            if (active) {
                setLoading(false);
                onSkip();
            }
        }, TEMPLATE_FETCH_TIMEOUT_MS);

        new API()
            .getDevportalGovernanceTemplates({ limit: 100, offset: 0 })
            .then((res) => {
                if (!active) {
                    return;
                }
                clearTimeout(failOpenTimer);
                const list = res.body?.list ?? [];
                if (list.length === 0) {
                    onSkip();
                } else {
                    setTemplates(list);
                }
            })
            .catch(() => {
                if (active) {
                    clearTimeout(failOpenTimer);
                    onSkip();
                }
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });
        return () => {
            active = false;
            clearTimeout(failOpenTimer);
        };
    }, []);

    // Collect all unique tags across all templates
    const allTags = useMemo(() => {
        const tagSet = new Set();
        templates.forEach((t) => {
            (Array.isArray(t.tags) ? t.tags : []).forEach((tag) => tagSet.add(tag));
        });
        return Array.from(tagSet).sort();
    }, [templates]);

    const toggleTag = (tag) => {
        setSelectedTags((prev) => {
            const next = new Set(prev);
            if (next.has(tag)) {
                next.delete(tag);
            } else {
                next.add(tag);
            }
            return next;
        });
    };

    // Filtered template list based on search text and active tag filter
    const filteredTemplates = useMemo(() => {
        const q = search.toLowerCase();
        return templates.filter((t) => {
            const developerExperience = getDeveloperExperience(t);
            const summary = developerExperience.summary || t.description || '';
            const matchesSearch = !q
                || t.name.toLowerCase().includes(q)
                || summary.toLowerCase().includes(q);
            const matchesTag = selectedTags.size === 0
                || (Array.isArray(t.tags) && t.tags.some((tag) => selectedTags.has(tag)));
            return matchesSearch && matchesTag;
        });
    }, [templates, search, selectedTags]);

    // Whether any of the loaded templates is marked default. The "No Restrictions"
    // fallback card is only shown when there is NO default — otherwise the admin's
    // default IS the fallback, and an extra "no rules" card would just confuse devs.
    const hasDefaultTemplate = useMemo(
        () => templates.some((t) => !!t.isDefault),
        [templates],
    );

    // Pagination derived from filteredTemplates. Reset to page 1 whenever the filter set
    // changes so the user doesn't end up on a now-empty page.
    const pageCount = Math.max(1, Math.ceil(filteredTemplates.length / PAGE_SIZE));
    useEffect(() => { setPage(1); }, [search, selectedTags]);
    const paginatedTemplates = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filteredTemplates.slice(start, start + PAGE_SIZE);
    }, [filteredTemplates, page]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (templates.length === 0) {
        return null;
    }

    return (
        <Box sx={{ width: '100%' }}>
            {/* Subheading */}
            <Typography variant='body2' color='text.secondary' sx={{ mb: 3, maxWidth: 700 }}>
                <FormattedMessage
                    id='Applications.Create.TemplateSelector.subheading'
                    defaultMessage={
                        'Select a governance template to configure your application. '
                        + 'The template defines default settings and the policies that will be enforced. '
                        + 'Click a card to continue.'
                    }
                />
            </Typography>

            {/* Search bar */}
            <TextField
                fullWidth
                size='small'
                placeholder='Search templates...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position='start'>
                            <SearchIcon fontSize='small' color='action' />
                        </InputAdornment>
                    ),
                }}
                sx={{ mb: 3, maxWidth: 480 }}
            />

            <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
                {/* Tag filter sidebar — only shown when there are tags */}
                {allTags.length > 0 && (
                    <Box sx={{ minWidth: 160, flexShrink: 0 }}>
                        <Typography
                            variant='caption'
                            fontWeight={700}
                            color='text.secondary'
                            textTransform='uppercase'
                            display='block'
                            sx={{ mb: 1 }}
                        >
                            <FormattedMessage
                                id='Applications.Create.TemplateSelector.filter.label'
                                defaultMessage='Filter by tag'
                            />
                        </Typography>
                        <FormGroup>
                            {allTags.map((tag) => (
                                <FormControlLabel
                                    key={tag}
                                    control={(
                                        <Checkbox
                                            size='small'
                                            checked={selectedTags.has(tag)}
                                            onChange={() => toggleTag(tag)}
                                        />
                                    )}
                                    label={<Typography variant='body2'>{tag}</Typography>}
                                />
                            ))}
                        </FormGroup>
                    </Box>
                )}

                {/* Template grid.
                    The "No Restrictions" fallback card only appears when there is NO default
                    template configured. If an admin has marked a template as default, that
                    one is the implicit fallback — showing both would compete for the
                    "do-nothing path" slot and confuse developers. */}
                <Box sx={{ flex: 1 }}>
                    {filteredTemplates.length === 0 ? (
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 2.5 }}>
                            {!hasDefaultTemplate && <UnrestrictedCard onSkip={onSkip} />}
                            {hasDefaultTemplate && (
                                <Box sx={{ gridColumn: '1 / -1' }}>
                                    <Typography variant='body2' color='text.secondary'>
                                        <FormattedMessage
                                            id='Applications.Create.TemplateSelector.empty.withDefault'
                                            defaultMessage={'No templates match your filters. Clear the filters '
                                                + 'to see the available governance templates.'}
                                        />
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    ) : (
                        <Box
                            sx={{
                                display: 'grid',
                                // 260px floor lets ~4 cards fit on a 1280-wide page after the
                                // tag-filter sidebar; auto-fill keeps the gallery responsive.
                                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                                gap: 2.5,
                                alignItems: 'stretch',
                            }}
                        >
                            {paginatedTemplates.map((template) => {
                                const effectiveTemplate = getEffectiveTemplate(
                                    template,
                                    allAppAttributes,
                                    isApplicationSharingEnabled,
                                );
                                return (
                                    <TemplateCard
                                        key={template.id}
                                        template={effectiveTemplate}
                                        onSelect={(t) => onSelect(t)}
                                        onPreview={setPreviewTemplate}
                                    />
                                );
                            })}
                            {!hasDefaultTemplate && <UnrestrictedCard onSkip={onSkip} />}
                        </Box>
                    )}
                    {pageCount > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                            <Pagination
                                count={pageCount}
                                page={page}
                                onChange={(_, p) => setPage(p)}
                                size='small'
                                color='primary'
                            />
                        </Box>
                    )}
                </Box>
            </Box>

            {previewTemplate && (
                <TemplatePreviewDialog
                    template={previewTemplate}
                    onClose={() => setPreviewTemplate(null)}
                />
            )}
        </Box>
    );
}

TemplateSelector.propTypes = {
    onSelect: PropTypes.func.isRequired,
    onSkip: PropTypes.func.isRequired,
    allAppAttributes: PropTypes.arrayOf(PropTypes.shape({
        attribute: PropTypes.string,
    })),
    isApplicationSharingEnabled: PropTypes.bool,
};

TemplateSelector.defaultProps = {
    allAppAttributes: null,
    isApplicationSharingEnabled: true,
};
