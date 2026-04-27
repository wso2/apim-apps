/*
 * Copyright (c) 2026, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0.
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
    Box, FormControl, InputLabel, Select, MenuItem, Button,
} from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';

const ALL_VALUE = '__all__';

/**
 * FindingsFilters renders three Select dropdowns (classification, service,
 * internal) plus a Clear button. Filter state is owned by the parent
 * (UnmanagedApisList) so refetch logic is centralized; this component
 * just emits onChange.
 *
 * Service options are derived from the summary's by_service breakdown
 * — guaranteed to be the same identities the discovered_apis list
 * contains, so no separate /services endpoint is needed.
 *
 * @param {object} props component props
 * @param {object} props.filters current filter state
 * @param {string[]} props.serviceOptions service identities to show in dropdown
 * @param {boolean} props.hideInternalFilter true when skip_internal=true
 *        (the internal filter would always be empty, so hide it)
 * @param {(next: object) => void} props.onChange filter setter
 * @param {() => void} props.onClear reset to defaults
 * @returns {JSX} filter row
 */
const FindingsFilters = ({
    filters, serviceOptions, hideInternalFilter, onChange, onClear,
}) => {
    const intl = useIntl();

    const update = (field, value) => {
        const next = {
            ...filters,
        };
        if (value === ALL_VALUE) {
            next[field] = '';
        } else {
            next[field] = value;
        }
        onChange(next);
    };

    return (
        <Box sx={{
            display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2,
        }}
        >
            <FormControl size='small' sx={{ minWidth: 160 }}>
                <InputLabel id='classification-label'>
                    <FormattedMessage
                        id='Discovery.filter.classification.label'
                        defaultMessage='Classification'
                    />
                </InputLabel>
                <Select
                    labelId='classification-label'
                    value={filters.classification || ALL_VALUE}
                    label={intl.formatMessage({
                        id: 'Discovery.filter.classification.label',
                        defaultMessage: 'Classification',
                    })}
                    onChange={(e) => update('classification', e.target.value)}
                >
                    <MenuItem value={ALL_VALUE}>
                        <FormattedMessage
                            id='Discovery.filter.allTypes'
                            defaultMessage='All types'
                        />
                    </MenuItem>
                    <MenuItem value='shadow'>
                        <FormattedMessage
                            id='Discovery.filter.shadow'
                            defaultMessage='Shadow'
                        />
                    </MenuItem>
                    <MenuItem value='drift'>
                        <FormattedMessage
                            id='Discovery.filter.drift'
                            defaultMessage='Drift'
                        />
                    </MenuItem>
                </Select>
            </FormControl>

            <FormControl size='small' sx={{ minWidth: 220 }}>
                <InputLabel id='service-label'>
                    <FormattedMessage
                        id='Discovery.filter.service.label'
                        defaultMessage='Service'
                    />
                </InputLabel>
                <Select
                    labelId='service-label'
                    value={filters.service || ALL_VALUE}
                    label={intl.formatMessage({
                        id: 'Discovery.filter.service.label',
                        defaultMessage: 'Service',
                    })}
                    onChange={(e) => update('service', e.target.value)}
                >
                    <MenuItem value={ALL_VALUE}>
                        <FormattedMessage
                            id='Discovery.filter.allServices'
                            defaultMessage='All services'
                        />
                    </MenuItem>
                    {serviceOptions.map((s) => (
                        <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            {!hideInternalFilter && (
                <FormControl size='small' sx={{ minWidth: 160 }}>
                    <InputLabel id='internal-label'>
                        <FormattedMessage
                            id='Discovery.filter.internal.label'
                            defaultMessage='Reachability'
                        />
                    </InputLabel>
                    <Select
                        labelId='internal-label'
                        value={filters.internal || ALL_VALUE}
                        label={intl.formatMessage({
                            id: 'Discovery.filter.internal.label',
                            defaultMessage: 'Reachability',
                        })}
                        onChange={(e) => update('internal', e.target.value)}
                    >
                        <MenuItem value={ALL_VALUE}>
                            <FormattedMessage
                                id='Discovery.filter.allReachability'
                                defaultMessage='All'
                            />
                        </MenuItem>
                        <MenuItem value='false'>
                            <FormattedMessage
                                id='Discovery.tag.external'
                                defaultMessage='External'
                            />
                        </MenuItem>
                        <MenuItem value='only'>
                            <FormattedMessage
                                id='Discovery.filter.internalOnly'
                                defaultMessage='Internal only'
                            />
                        </MenuItem>
                    </Select>
                </FormControl>
            )}

            <Button onClick={onClear} variant='text' size='small'>
                <FormattedMessage
                    id='Discovery.filter.clear'
                    defaultMessage='Clear filters'
                />
            </Button>
        </Box>
    );
};

FindingsFilters.propTypes = {
    filters: PropTypes.shape({
        classification: PropTypes.string,
        service: PropTypes.string,
        internal: PropTypes.string,
    }).isRequired,
    serviceOptions: PropTypes.arrayOf(PropTypes.string),
    hideInternalFilter: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    onClear: PropTypes.func.isRequired,
};

FindingsFilters.defaultProps = {
    serviceOptions: [],
    hideInternalFilter: false,
};

export default FindingsFilters;
