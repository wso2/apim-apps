/*
 * Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com) All Rights Reserved.
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
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Autocomplete,
    Box,
    FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    InputBase,
    Radio,
    RadioGroup,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { FormattedMessage, useIntl } from 'react-intl';

// Placeholders the backend seeds into a fresh Vertex endpoint URL. Treated as "empty" in the structured fields.
const PROJECT_PLACEHOLDER = '{project_id}';
const REGION_PLACEHOLDER = '{region}';
const GLOBAL_LOCATION = 'global';
// Suffix used only when a URL cannot be parsed and the user starts structured from scratch.
const DEFAULT_SUFFIX = 'publishers/google/models';

// Common Vertex AI regions - suggestions only; the field is free-text (freeSolo) so new regions still work.
const COMMON_REGIONS = [
    'us-central1', 'us-east1', 'us-east4', 'us-east5', 'us-west1', 'us-west4', 'us-south1',
    'europe-west1', 'europe-west2', 'europe-west3', 'europe-west4', 'europe-west9', 'europe-central2',
    'asia-east1', 'asia-east2', 'asia-northeast1', 'asia-northeast3', 'asia-south1', 'asia-southeast1',
    'australia-southeast1', 'northamerica-northeast1', 'southamerica-east1',
];

const REGIONAL_URL = /^https:\/\/([^.]+)-aiplatform\.googleapis\.com\/v1\/projects\/([^/]+)\/locations\/([^/]+)\/(.+)$/;
const GLOBAL_URL = /^https:\/\/aiplatform\.googleapis\.com\/v1\/projects\/([^/]+)\/locations\/global\/(.+)$/;

const unplaceholder = (value, placeholder) => (value === placeholder ? '' : value);

/**
 * Parses a Vertex endpoint URL into structured parts. Returns null when the URL does not match either the
 * regional or the global Vertex template (a custom URL - the fields are then disabled).
 */
const parseUrl = (url) => {
    if (!url) {
        return null;
    }
    const globalMatch = url.match(GLOBAL_URL);
    if (globalMatch) {
        const [, project, suffix] = globalMatch;
        return { type: 'global', region: '', projectId: unplaceholder(project, PROJECT_PLACEHOLDER), suffix };
    }
    const regionalMatch = url.match(REGIONAL_URL);
    if (regionalMatch) {
        const [, hostRegion, project, locationRegion, suffix] = regionalMatch;
        const cleanedHost = unplaceholder(hostRegion, REGION_PLACEHOLDER);
        const cleanedLocation = unplaceholder(locationRegion, REGION_PLACEHOLDER);
        // The region appears in the host prefix and the locations path; only treat it as resolved when both
        // carry the same real value. If either is still a placeholder, or they disagree (a hand-edit), leave the
        // Region field empty so it honestly reflects that the URL is not yet valid.
        const region = (cleanedHost && cleanedHost === cleanedLocation) ? cleanedHost : '';
        return {
            type: 'regional',
            region,
            projectId: unplaceholder(project, PROJECT_PLACEHOLDER),
            suffix,
        };
    }
    return null;
};

/**
 * Rebuilds the Vertex endpoint URL from the structured parts. Empty fields fall back to their placeholder
 * token so the preview reads naturally and the parent's "unresolved placeholder" save-validation still fires.
 */
const buildUrl = ({ type, region, projectId, suffix }) => {
    const project = projectId || PROJECT_PLACEHOLDER;
    const path = suffix || DEFAULT_SUFFIX;
    if (type === 'global') {
        return `https://aiplatform.googleapis.com/v1/projects/${project}/locations/${GLOBAL_LOCATION}/${path}`;
    }
    const regionValue = region || REGION_PLACEHOLDER;
    return `https://${regionValue}-aiplatform.googleapis.com/v1/projects/${project}`
        + `/locations/${regionValue}/${path}`;
};

const isPlaceholderToken = (text) => text === REGION_PLACEHOLDER || text === PROJECT_PLACEHOLDER;

// A dynamic (field-driven) segment of the read-only URL: bold + highlighted so the user sees which parts map to
// the region / project ID fields. An unresolved placeholder ({region} / {project_id}) is called out in a warning
// colour so it reads as "still needs a value".
const dynamicSegment = (text, key) => (
    <Box
        component='span'
        key={key}
        sx={isPlaceholderToken(text) ? {
            fontWeight: 700, px: 0.25, borderRadius: 0.5, color: 'warning.dark', backgroundColor: 'warning.light',
        } : {
            fontWeight: 700, px: 0.25, borderRadius: 0.5, backgroundColor: 'action.selected',
        }}
    >
        {text}
    </Box>
);

/**
 * Renders the read-only URL with its dynamic parts (region - twice for a regional URL - and project ID)
 * highlighted. A URL that does not match the Vertex template is shown as plain text.
 */
const renderHighlightedUrl = (url) => {
    if (!url) {
        return null;
    }
    const globalMatch = url.match(GLOBAL_URL);
    if (globalMatch) {
        const [, project, suffix] = globalMatch;
        return [
            'https://aiplatform.googleapis.com/v1/projects/',
            dynamicSegment(project, 'project'),
            `/locations/global/${suffix}`,
        ];
    }
    const regionalMatch = url.match(REGIONAL_URL);
    if (regionalMatch) {
        const [, hostRegion, project, locationRegion, suffix] = regionalMatch;
        return [
            'https://',
            dynamicSegment(hostRegion, 'host-region'),
            '-aiplatform.googleapis.com/v1/projects/',
            dynamicSegment(project, 'project'),
            '/locations/',
            dynamicSegment(locationRegion, 'location-region'),
            `/${suffix}`,
        ];
    }
    return url;
};

/**
 * Structured builder for a Google Vertex AI endpoint URL. The region and project ID are edited as separate
 * fields (the Vertex URL embeds the region twice - host prefix + locations segment - so it is error-prone to
 * hand-edit), with the endpoint type (regional / global) chosen by radio. A live URL is shown below and can be
 * edited inline via the pencil; editing it keeps the fields in sync (they disable if the URL becomes custom).
 */
const GCPEndpointUrlBuilder = ({ url, onChange, onBlur, disabled, error, helperText, rawAdornment }) => {
    const intl = useIntl();
    const parsed = parseUrl(url);
    // A non-empty URL that does not match the Vertex template - the structured fields cannot represent it.
    const isCustom = Boolean(url) && parsed === null;

    const [type, setType] = useState(parsed?.type || 'regional');
    const [region, setRegion] = useState(parsed?.region || '');
    const [projectId, setProjectId] = useState(parsed?.projectId || '');
    const [urlEditable, setUrlEditable] = useState(false);
    // The publishers/<publisher>/models suffix is provider-specific; preserve whatever the seeded URL carried.
    const suffixRef = useRef(parsed?.suffix || DEFAULT_SUFFIX);
    // Guards the effect below from re-parsing the URL we ourselves just emitted from the fields.
    const selfUpdate = useRef(false);
    const urlInputRef = useRef(null);

    // Focus the URL field when the pencil starts editing so the user can type straight away.
    useEffect(() => {
        if (urlEditable && urlInputRef.current) {
            urlInputRef.current.focus();
        }
    }, [urlEditable]);

    // Keep the fields in sync when the URL changes from outside the fields: a different endpoint is loaded, or
    // the user edits the URL inline. A URL that no longer parses leaves the last field values in place.
    useEffect(() => {
        if (selfUpdate.current) {
            selfUpdate.current = false;
            return;
        }
        const next = parseUrl(url);
        if (next) {
            setType(next.type);
            setRegion(next.region);
            setProjectId(next.projectId);
            suffixRef.current = next.suffix;
        }
    }, [url]);

    // Rebuild the URL from the fields (the fields are the source of truth) and push it up.
    const emit = (nextParts) => {
        selfUpdate.current = true;
        onChange(buildUrl({ ...nextParts, suffix: suffixRef.current }));
    };

    const handleType = (_e, value) => {
        setType(value);
        emit({ type: value, region, projectId });
    };

    const handleRegion = (value) => {
        const next = value || '';
        setRegion(next);
        emit({ type, region: next, projectId });
    };

    const handleProject = (value) => {
        setProjectId(value);
        emit({ type, region, projectId: value });
    };

    const isGlobal = type === 'global';
    const fieldsDisabled = disabled || isCustom;

    return (
        <Box>
            <FormControl component='fieldset' sx={{ mb: 1 }}>
                <Typography variant='caption' color='textSecondary' sx={{ mb: 0.5 }}>
                    <FormattedMessage
                        id='Apis.Details.Endpoints.AIEndpoints.GCPEndpointUrlBuilder.type.label'
                        defaultMessage='Endpoint location'
                    />
                </Typography>
                <RadioGroup
                    row
                    aria-label='gcp-endpoint-type'
                    name='gcp-endpoint-type'
                    value={type}
                    onChange={handleType}
                >
                    <FormControlLabel
                        value='regional'
                        control={<Radio disabled={fieldsDisabled} />}
                        label={<FormattedMessage
                            id='Apis.Details.Endpoints.AIEndpoints.GCPEndpointUrlBuilder.type.regional'
                            defaultMessage='Regional'
                        />}
                    />
                    <FormControlLabel
                        value='global'
                        control={<Radio disabled={fieldsDisabled} />}
                        label={<FormattedMessage
                            id='Apis.Details.Endpoints.AIEndpoints.GCPEndpointUrlBuilder.type.global'
                            defaultMessage='Global'
                        />}
                    />
                </RadioGroup>
            </FormControl>

            <Grid container spacing={2}>
                <Grid item xs={6} sx={{ opacity: (isGlobal && !isCustom) ? 0.55 : 1 }}>
                    <Autocomplete
                        freeSolo
                        disabled={fieldsDisabled || isGlobal}
                        options={COMMON_REGIONS}
                        value={isGlobal ? '' : region}
                        onChange={(_e, value) => handleRegion(value)}
                        onInputChange={(_e, value, reason) => {
                            if (reason === 'input') { handleRegion(value); }
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                id='gcp-region-input'
                                label={<FormattedMessage
                                    id='Apis.Details.Endpoints.AIEndpoints.GCPEndpointUrlBuilder.region'
                                    defaultMessage='Region'
                                />}
                                placeholder={isGlobal ? '' : 'us-central1'}
                                required={!isGlobal && !isCustom}
                                helperText={isGlobal ? intl.formatMessage({
                                    id: 'Apis.Details.Endpoints.AIEndpoints.GCPEndpointUrlBuilder.region.global',
                                    defaultMessage: 'Disabled for global endpoints.',
                                }) : ''}
                                sx={{
                                    '& .MuiInputBase-root.Mui-disabled': {
                                        backgroundColor: 'action.disabledBackground',
                                    },
                                }}
                            />
                        )}
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        fullWidth
                        id='gcp-project-input'
                        disabled={fieldsDisabled}
                        label={<FormattedMessage
                            id='Apis.Details.Endpoints.AIEndpoints.GCPEndpointUrlBuilder.project'
                            defaultMessage='Project ID'
                        />}
                        placeholder='my-gcp-project'
                        value={projectId}
                        onChange={(e) => handleProject(e.target.value)}
                        onBlur={onBlur}
                        required={!isCustom}
                    />
                </Grid>
            </Grid>

            {isCustom && (
                <Typography variant='caption' color='textSecondary' sx={{ display: 'block', mt: 1 }}>
                    <FormattedMessage
                        id='Apis.Details.Endpoints.AIEndpoints.GCPEndpointUrlBuilder.custom.hint'
                        defaultMessage={'The endpoint URL does not match the Vertex template, so the fields '
                            + 'above are disabled. Edit the URL directly below.'}
                    />
                </Typography>
            )}

            <Box sx={{ mt: 1.5 }}>
                <Typography variant='caption' color='textSecondary'>
                    <FormattedMessage
                        id='Apis.Details.Endpoints.AIEndpoints.GCPEndpointUrlBuilder.preview.label'
                        defaultMessage='Endpoint URL'
                    />
                </Typography>
                {/* One outlined frame for both states, so the read-only (highlighted) view and the inline edit
                    share the same size and font. Read-only bolds the dynamic parts; the pencil starts editing
                    and the frame returns to read-only on blur. */}
                <Box
                    sx={{
                        display: 'flex', alignItems: 'flex-start', mt: 0.5,
                        border: 1, borderColor: error ? 'error.main' : 'divider', borderRadius: 1,
                        px: 1.5, py: 1, backgroundColor: urlEditable ? 'background.paper' : 'action.hover',
                    }}
                >
                    {urlEditable ? (
                        <InputBase
                            fullWidth
                            multiline
                            maxRows={3}
                            autoFocus
                            inputRef={urlInputRef}
                            inputProps={{ id: 'gcp-url-input' }}
                            disabled={disabled}
                            value={url}
                            onChange={(e) => onChange(e.target.value)}
                            onBlur={() => { setUrlEditable(false); onBlur(); }}
                            sx={{ flex: 1, p: 0, fontSize: '0.875rem', lineHeight: 1.6, wordBreak: 'break-all' }}
                        />
                    ) : (
                        <Box
                            data-testid='gcp-url-preview'
                            sx={{
                                flex: 1, fontSize: '0.875rem', lineHeight: 1.6, wordBreak: 'break-all',
                                minHeight: '1.4em',
                            }}
                        >
                            {renderHighlightedUrl(url)}
                        </Box>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                        {rawAdornment}
                        <Tooltip
                            title={<FormattedMessage
                                id='Apis.Details.Endpoints.AIEndpoints.GCPEndpointUrlBuilder.edit.raw'
                                defaultMessage='Edit the URL directly'
                            />}
                        >
                            <span>
                                <IconButton
                                    size='small'
                                    aria-label='edit-url'
                                    disabled={disabled}
                                    // Keep focus on the field so clicking the pencil never blurs an active edit.
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => setUrlEditable(true)}
                                >
                                    <EditIcon fontSize='small' />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Box>
                </Box>
                {error && helperText && (
                    <Typography variant='caption' color='error' sx={{ display: 'block', mt: 0.5 }}>
                        {helperText}
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

GCPEndpointUrlBuilder.propTypes = {
    url: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func,
    disabled: PropTypes.bool,
    error: PropTypes.bool,
    helperText: PropTypes.node,
    rawAdornment: PropTypes.node,
};

GCPEndpointUrlBuilder.defaultProps = {
    url: '',
    onBlur: () => {},
    disabled: false,
    error: false,
    helperText: '',
    rawAdornment: null,
};

export default GCPEndpointUrlBuilder;
