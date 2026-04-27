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

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Chip,
    CircularProgress,
    Grid,
    Typography,
} from '@mui/material';
import API from 'AppData/api';

/**
 * Intercept the "Add Application" flow and let the developer choose a Governance Template
 * before the create form is shown.
 *
 * Fail-open contract: if no published templates are available (empty list or fetch error),
 * onSkip() is called automatically so the standard un-governed form is presented.
 *
 * @param {Object}   props
 * @param {Function} props.onSelect  - Called with the full template object when the user picks one
 * @param {Function} props.onSkip    - Called when no templates exist or the fetch fails
 */
export default function TemplateSelector({ onSelect, onSkip }) {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        new API()
            .getDevportalGovernanceTemplates({ limit: 100, offset: 0 })
            .then((res) => {
                const list = res.body?.list ?? [];
                if (list.length === 0) {
                    onSkip();
                } else {
                    setTemplates(list);
                }
            })
            .catch(() => {
                // Fail open — governance unavailable should never block app creation
                onSkip();
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    // If templates is empty after load, onSkip was already called — render nothing
    if (templates.length === 0) {
        return null;
    }

    return (
        <Box>
            <Typography variant='h5' component='h1' gutterBottom>
                <FormattedMessage
                    id='Applications.Create.TemplateSelector.heading'
                    defaultMessage='Choose a Template'
                />
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 4 }}>
                <FormattedMessage
                    id='Applications.Create.TemplateSelector.subheading'
                    defaultMessage='Select a governance template to configure your application. The template
                        defines default settings and the policies that will be enforced.'
                />
            </Typography>

            <Grid container spacing={3}>
                {templates.map((template) => (
                    <Grid item key={template.id} xs={12} sm={6} md={4}>
                        <Card
                            variant='outlined'
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'box-shadow 0.2s',
                                '&:hover': { boxShadow: 3 },
                            }}
                        >
                            <CardHeader
                                title={(
                                    <Typography variant='subtitle1' fontWeight={600}>
                                        {template.name}
                                    </Typography>
                                )}
                                action={template.isGlobal ? (
                                    <Chip
                                        label={(
                                            <FormattedMessage
                                                id='Applications.Create.TemplateSelector.chip.global'
                                                defaultMessage='Global Template'
                                            />
                                        )}
                                        size='small'
                                        color='secondary'
                                        variant='outlined'
                                        sx={{ mt: 1, mr: 1 }}
                                    />
                                ) : null}
                                sx={{ pb: 0 }}
                            />
                            <CardContent sx={{ flexGrow: 1, pt: 1 }}>
                                <Typography variant='body2' color='text.secondary'>
                                    {template.description || (
                                        <FormattedMessage
                                            id='Applications.Create.TemplateSelector.card.noDescription'
                                            defaultMessage='No description provided.'
                                        />
                                    )}
                                </Typography>
                            </CardContent>
                            <CardActions sx={{ px: 2, pb: 2 }}>
                                <Button
                                    variant='contained'
                                    color='primary'
                                    size='small'
                                    onClick={() => onSelect(template)}
                                >
                                    <FormattedMessage
                                        id='Applications.Create.TemplateSelector.btn.select'
                                        defaultMessage='Select'
                                    />
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

TemplateSelector.propTypes = {
    onSelect: PropTypes.func.isRequired,
    onSkip: PropTypes.func.isRequired,
};
