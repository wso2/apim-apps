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

const PREFIX = 'PolicySelector';

const classes = {
    selectedPolicies: `${PREFIX}-selectedPolicies`,
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
    [`& .${classes.selectedPolicies}`]: {
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

function PolicySelector({
    availablePolicies,
    selectedPolicies,
    onPolicySelect,
    onPolicyDeselect,
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const itemsPerPage = 6;

    const filteredPolicies = availablePolicies.filter(
        (policy) => (
            policy.name.toLowerCase().includes(searchQuery.toLowerCase())
            || policy.description.toLowerCase().includes(searchQuery.toLowerCase())
        ),
    );

    const paginatedPolicies = filteredPolicies.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage,
    );

    const handlePolicyToggle = (policy) => {
        const isSelected = selectedPolicies.some((r) => r.id === policy.id);
        if (isSelected) {
            onPolicyDeselect(policy);
        } else {
            onPolicySelect(policy);
        }
    };

    return (
        <StyledBox className={classes.root}>
            {/* Selected Policies */}
            {selectedPolicies.length > 0 && (
                <Box className={classes.selectedPolicies}>
                    {selectedPolicies.map((policy) => (
                        <Chip
                            key={policy.id}
                            label={policy.name}
                            onDelete={() => onPolicyDeselect(policy)}
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
                placeholder='Search policies...'
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

            {/* Policies Grid */}
            <Grid container spacing={2}>
                {paginatedPolicies.map((policy) => (
                    <Grid item xs={12} lg={4} key={policy.id}>
                        <Card
                            variant='outlined'
                            className={classes.card}
                            onClick={() => handlePolicyToggle(policy)}
                            sx={{
                                border: (theme) => (
                                    selectedPolicies.some((r) => r.id === policy.id)
                                        ? `2px solid ${theme.palette.primary.main}`
                                        : '1px solid rgba(0, 0, 0, 0.12)'
                                ),
                            }}
                        >
                            <CardContent className={classes.cardContent}>
                                <Box className={classes.checkboxWrapper}>
                                    <Checkbox
                                        checked={selectedPolicies.some((r) => r.id === policy.id)}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                onPolicySelect(policy);
                                            } else {
                                                onPolicyDeselect(policy);
                                            }
                                        }}
                                    />
                                </Box>
                                <Typography variant='subtitle1' component='div' sx={{ fontWeight: 500, mb: 0.5 }}>
                                    {policy.name}
                                </Typography>
                                <Box sx={{ mb: 1.5, display: 'flex', gap: 1 }}>
                                    <Chip
                                        label={Utils.mapPolicyTypeToLabel(policy.ruleType)}
                                        size='small'
                                        variant='outlined'
                                        className={classes.chip}
                                        sx={{
                                            ...getChipStyles(policy.ruleType),
                                        }}
                                    />
                                    <Chip
                                        label={Utils.mapArtifactTypeToLabel(policy.artifactType)}
                                        size='small'
                                        className={classes.chip}
                                    />
                                </Box>
                                <Typography
                                    variant='body2'
                                    color='text.secondary'
                                    className={classes.description}
                                >
                                    {policy.description}
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
                                            {policy.provider}
                                        </Typography>
                                    </Box>
                                    {policy.documentationLink && (
                                        <>
                                            <Box className={classes.documentationDivider} />
                                            <Link
                                                href={policy.documentationLink}
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
            {filteredPolicies.length > itemsPerPage && (
                <Box className={classes.pagination}>
                    <Pagination
                        count={Math.ceil(filteredPolicies.length / itemsPerPage)}
                        page={page}
                        onChange={(event, value) => setPage(value)}
                        color='primary'
                    />
                </Box>
            )}

            {filteredPolicies.length === 0 && (
                <Typography variant='body1' color='text.secondary' align='center'>
                    {searchQuery ? (
                        <FormattedMessage
                            id='Governance.PolicyAttachments.AddEdit.policies.noSearchResults'
                            defaultMessage='No policies found matching your search'
                        />
                    ) : (
                        <FormattedMessage
                            id='Governance.PolicyAttachments.AddEdit.policies.empty'
                            defaultMessage='No policies available'
                        />
                    )}
                </Typography>
            )}
        </StyledBox>
    );
}

PolicySelector.propTypes = {
    availablePolicies: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        ruleType: PropTypes.string.isRequired,
        artifactType: PropTypes.string.isRequired,
        provider: PropTypes.string.isRequired,
        documentationLink: PropTypes.string,
    })).isRequired,
    selectedPolicies: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
    })).isRequired,
    onPolicySelect: PropTypes.func.isRequired,
    onPolicyDeselect: PropTypes.func.isRequired,
};

export default PolicySelector;
