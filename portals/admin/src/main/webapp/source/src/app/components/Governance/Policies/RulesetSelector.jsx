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

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
    Box,
    TextField,
    Typography,
    Chip,
    Card,
    CardContent,
    Grid,
    Checkbox,
    Link,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import Pagination from '@mui/material/Pagination';
import BusinessIcon from '@mui/icons-material/Business';
import LaunchIcon from '@mui/icons-material/Launch';
import Utils from 'AppData/Utils';
import { styled } from '@mui/material/styles';

// Move getChipStyles from AddEditPolicy
const getChipStyles = (type) => {
    switch (type) {
        case 'API_DEFINITION':
            return {
                color: '#0D47A1',
                borderColor: '#0D47A1',
            };
        case 'API_METADATA':
            return {
                color: '#4A148C',
                borderColor: '#4A148C',
            };
        case 'API_DOCUMENTATION':
            return {
                color: '#1B5E20',
                borderColor: '#1B5E20',
            };
        default:
            return {};
    }
};

const PREFIX = 'RulesetSelector';

const classes = {
    selectedRulesets: `${PREFIX}-selectedRulesets`,
    searchField: `${PREFIX}-searchField`,
    card: `${PREFIX}-card`,
    cardContent: `${PREFIX}-cardContent`,
    checkboxWrapper: `${PREFIX}-checkboxWrapper`,
    chip: `${PREFIX}-chip`,
    description: `${PREFIX}-description`,
    providerWrapper: `${PREFIX}-providerWrapper`,
    documentationDivider: `${PREFIX}-documentationDivider`,
    documentationLink: `${PREFIX}-documentationLink`,
    documentationIcon: `${PREFIX}-documentationIcon`,
    pagination: `${PREFIX}-pagination`,
};

const StyledBox = styled(Box)(({ theme }) => ({
    [`& .${classes.selectedRulesets}`]: {
        marginBottom: theme.spacing(2),
        display: 'flex',
        flexWrap: 'wrap',
        gap: theme.spacing(1),
    },
    [`& .${classes.searchField}`]: {
        marginBottom: theme.spacing(2),
    },
    [`& .${classes.card}`]: {
        position: 'relative',
        cursor: 'pointer',
        transition: 'all 0.3s',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
            boxShadow: theme.shadows[2],
        },
    },
    [`& .${classes.cardContent}`]: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        padding: theme.spacing(2),
    },
    [`& .${classes.checkboxWrapper}`]: {
        position: 'absolute',
        right: 8,
        top: 8,
    },
    [`& .${classes.chip}`]: {
        height: '16px',
        '& .MuiChip-label': {
            padding: '0 6px',
            fontSize: '0.625rem',
            lineHeight: 1,
        },
    },
    [`& .${classes.description}`]: {
        marginBottom: theme.spacing(2),
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: 3,
        overflow: 'hidden',
        minHeight: '4.5em',
    },
    [`& .${classes.providerWrapper}`]: {
        display: 'flex',
        alignItems: 'center',
        color: theme.palette.text.secondary,
    },
    [`& .${classes.documentationDivider}`]: {
        margin: `${theme.spacing(1)} 0`,
        borderTop: `1px solid ${theme.palette.divider}`,
    },
    [`& .${classes.documentationLink}`]: {
        display: 'flex',
        alignItems: 'center',
        fontSize: '0.75rem',
        color: theme.palette.text.secondary,
        textDecoration: 'none',
        '&:hover': {
            color: theme.palette.primary.main,
        },
    },
    [`& .${classes.documentationIcon}`]: {
        marginRight: theme.spacing(0.5),
        fontSize: '0.875rem',
    },
    [`& .${classes.pagination}`]: {
        marginTop: theme.spacing(2),
        display: 'flex',
        justifyContent: 'center',
    },
}));

function RulesetSelector({
    availableRulesets,
    selectedRulesets,
    onRulesetSelect,
    onRulesetDeselect,
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const itemsPerPage = 6;

    const filteredRulesets = availableRulesets.filter(
        (ruleset) => (
            ruleset.name.toLowerCase().includes(searchQuery.toLowerCase())
            || ruleset.description.toLowerCase().includes(searchQuery.toLowerCase())
        ),
    );

    const paginatedRulesets = filteredRulesets.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage,
    );

    const handleRulesetToggle = (ruleset) => {
        const isSelected = selectedRulesets.some((r) => r.id === ruleset.id);
        if (isSelected) {
            onRulesetDeselect(ruleset);
        } else {
            onRulesetSelect(ruleset);
        }
    };

    return (
        <StyledBox className={classes.root}>
            {/* Selected Rulesets */}
            {selectedRulesets.length > 0 && (
                <Box className={classes.selectedRulesets}>
                    {selectedRulesets.map((ruleset) => (
                        <Chip
                            key={ruleset.id}
                            label={ruleset.name}
                            onDelete={() => onRulesetDeselect(ruleset)}
                            color='primary'
                            variant='outlined'
                        />
                    ))}
                </Box>
            )}

            {/* Search Bar */}
            <TextField
                fullWidth
                variant='outlined'
                placeholder='Search rulesets...'
                value={searchQuery}
                onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                }}
                className={classes.searchField}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position='start'>
                            <SearchIcon />
                        </InputAdornment>
                    ),
                }}
            />

            {/* Rulesets Grid */}
            <Grid container spacing={2}>
                {paginatedRulesets.map((ruleset) => (
                    <Grid item xs={12} lg={4} key={ruleset.id}>
                        <Card
                            variant='outlined'
                            className={classes.card}
                            onClick={() => handleRulesetToggle(ruleset)}
                            sx={{
                                border: (theme) => (
                                    selectedRulesets.some((r) => r.id === ruleset.id)
                                        ? `2px solid ${theme.palette.primary.main}`
                                        : '1px solid rgba(0, 0, 0, 0.12)'
                                ),
                            }}
                        >
                            <CardContent className={classes.cardContent}>
                                <Box className={classes.checkboxWrapper}>
                                    <Checkbox
                                        checked={selectedRulesets.some((r) => r.id === ruleset.id)}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                onRulesetSelect(ruleset);
                                            } else {
                                                onRulesetDeselect(ruleset);
                                            }
                                        }}
                                    />
                                </Box>
                                <Typography
                                    variant='subtitle1'
                                    component='div'
                                    sx={{ fontWeight: 500, mb: 0.5, mr: 2.75 }}
                                >
                                    {ruleset.name}
                                </Typography>
                                <Box sx={{ mb: 1.5, display: 'flex', gap: 1 }}>
                                    <Chip
                                        label={Utils.mapRuleTypeToLabel(ruleset.ruleType)}
                                        size='small'
                                        variant='outlined'
                                        className={classes.chip}
                                        sx={{
                                            ...getChipStyles(ruleset.ruleType),
                                        }}
                                    />
                                    <Chip
                                        label={Utils.mapArtifactTypeToLabel(ruleset.artifactType)}
                                        size='small'
                                        className={classes.chip}
                                    />
                                </Box>
                                <Typography
                                    variant='body2'
                                    color='text.secondary'
                                    className={classes.description}
                                >
                                    {ruleset.description}
                                </Typography>
                                <Box sx={{ mt: 'auto' }}>
                                    <Box className={classes.providerWrapper}>
                                        <BusinessIcon
                                            fontSize='small'
                                            sx={{ mr: 0.5 }}
                                        />
                                        <Typography
                                            variant='body2'
                                            component='span'
                                        >
                                            {ruleset.provider}
                                        </Typography>
                                    </Box>
                                    {ruleset.documentationLink && (
                                        <>
                                            <Box className={classes.documentationDivider} />
                                            <Link
                                                href={ruleset.documentationLink}
                                                target='_blank'
                                                rel='noopener'
                                                onClick={(e) => e.stopPropagation()}
                                                className={classes.documentationLink}
                                            >
                                                <LaunchIcon className={classes.documentationIcon} />
                                                Documentation
                                            </Link>
                                        </>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Pagination */}
            {filteredRulesets.length > itemsPerPage && (
                <Box className={classes.pagination}>
                    <Pagination
                        count={Math.ceil(filteredRulesets.length / itemsPerPage)}
                        page={page}
                        onChange={(event, value) => setPage(value)}
                        color='primary'
                    />
                </Box>
            )}

            {filteredRulesets.length === 0 && (
                <Typography variant='body1' color='text.secondary' align='center'>
                    {searchQuery ? (
                        <FormattedMessage
                            id='Governance.Policies.AddEdit.rulesets.noSearchResults'
                            defaultMessage='No rulesets found matching your search'
                        />
                    ) : (
                        <FormattedMessage
                            id='Governance.Policies.AddEdit.rulesets.empty'
                            defaultMessage='No rulesets available'
                        />
                    )}
                </Typography>
            )}
        </StyledBox>
    );
}

RulesetSelector.propTypes = {
    availableRulesets: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        ruleType: PropTypes.string.isRequired,
        artifactType: PropTypes.string.isRequired,
        provider: PropTypes.string.isRequired,
        documentationLink: PropTypes.string,
    })).isRequired,
    selectedRulesets: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
    })).isRequired,
    onRulesetSelect: PropTypes.func.isRequired,
    onRulesetDeselect: PropTypes.func.isRequired,
};

export default RulesetSelector;
