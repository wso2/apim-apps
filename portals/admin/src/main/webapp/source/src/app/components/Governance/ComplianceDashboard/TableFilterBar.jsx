/* eslint-disable */
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

import React from 'react';
import {
    Box,
    Checkbox,
    Chip,
    Divider,
    IconButton,
    ListItemText,
    ListSubheader,
    MenuItem,
    Popover,
    Typography,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';

export default function TableFilterBar({ filters, selectedFilters, onFiltersChange }) {
    const [anchorEl, setAnchorEl] = React.useState(null);

    const selectedFilterGroups = filters
        .map((filter) => {
            const selectedValues = selectedFilters[filter.id] || [];
            const selectedOptions = filter.options.filter((option) => selectedValues.includes(option.value));

            return {
                filterId: filter.id,
                label: filter.label,
                options: selectedOptions,
            };
        })
        .filter((filter) => filter.options.length > 0);

    const handleOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleToggle = (filterId, value) => {
        const nextFilters = filters.reduce((accumulator, filter) => {
            const existingValues = selectedFilters[filter.id] || [];

            if (filter.id !== filterId) {
                return {
                    ...accumulator,
                    [filter.id]: existingValues,
                };
            }

            const hasValue = existingValues.includes(value);

            return {
                ...accumulator,
                [filter.id]: hasValue
                    ? existingValues.filter((item) => item !== value)
                    : [...existingValues, value],
            };
        }, {});

        onFiltersChange(nextFilters);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'flex-end',
                gap: 1,
                width: '100%',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    flexWrap: 'wrap',
                    gap: 1,
                    flex: 1,
                    minWidth: 0,
                }}
            >
                {selectedFilterGroups.map((filterGroup) => (
                    <Box
                        key={filterGroup.filterId}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            flexWrap: 'wrap',
                        }}
                    >
                        <Typography variant='body2' color='text.secondary'>
                            {`${filterGroup.label}:`}
                        </Typography>
                        {filterGroup.options.map((option) => (
                            <Chip
                                key={`${filterGroup.filterId}-${option.value}`}
                                label={option.label}
                                size='small'
                                onDelete={() => handleToggle(filterGroup.filterId, option.value)}
                            />
                        ))}
                    </Box>
                ))}
            </Box>
            <IconButton onClick={handleOpen} size='large' sx={{ flexShrink: 0 }}>
                <FilterListIcon />
            </IconButton>
            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                PaperProps={{
                    sx: {
                        mt: 1,
                        minWidth: 240,
                        py: 1,
                    },
                }}
            >
                <Box sx={{ maxHeight: 320, overflowY: 'auto' }}>
                    {filters.map((filter, filterIndex) => (
                        <Box key={filter.id}>
                            {filterIndex > 0 && <Divider />}
                            <ListSubheader sx={{ lineHeight: 2.5 }}>
                                {filter.label}
                            </ListSubheader>
                            {filter.options.map((option) => {
                                const checked = (selectedFilters[filter.id] || []).includes(option.value);

                                return (
                                    <MenuItem
                                        key={`${filter.id}-${option.value}`}
                                        onClick={() => handleToggle(filter.id, option.value)}
                                    >
                                        <Checkbox checked={checked} size='small' />
                                        <ListItemText primary={option.label} />
                                    </MenuItem>
                                );
                            })}
                        </Box>
                    ))}
                </Box>
            </Popover>
        </Box>
    );
}
