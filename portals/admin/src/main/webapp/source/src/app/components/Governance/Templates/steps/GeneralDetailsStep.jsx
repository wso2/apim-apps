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
import { FormattedMessage, useIntl } from 'react-intl';
import {
    Box,
    FormControlLabel,
    Grid,
    MenuItem,
    Switch,
    TextField,
    Typography,
    Divider,
} from '@mui/material';
import { useAppContext } from 'AppComponents/Shared/AppContext';

/**
 * Step 1 of the TemplateWizard: name, description, status, isDefault, isGlobal (super tenant only).
 * @param {Object} props
 * @param {Object} props.templateState - wizard state slice for this step
 * @param {Function} props.dispatch - reducer dispatch from TemplateWizard
 * @returns {JSX}
 */
export default function GeneralDetailsStep({ templateState, dispatch }) {
    const intl = useIntl();
    const { isSuperTenant } = useAppContext();
    const {
        name, description, status, isDefault, isGlobal,
    } = templateState;

    // Track blur to avoid showing validation errors before the user touches the field
    const [nameTouched, setNameTouched] = useState(false);

    const nameError = nameTouched && !name.trim();

    return (
        <Box>
            <Typography variant='h6' gutterBottom>
                <FormattedMessage
                    id='Governance.Templates.Wizard.GeneralDetails.heading'
                    defaultMessage='General Details'
                />
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                <FormattedMessage
                    id='Governance.Templates.Wizard.GeneralDetails.subheading'
                    defaultMessage='Provide basic information about this template and its lifecycle state.'
                />
            </Typography>

            <Grid container spacing={3}>
                {/* Name */}
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        required
                        label={intl.formatMessage({
                            id: 'Governance.Templates.Wizard.GeneralDetails.name.label',
                            defaultMessage: 'Template Name',
                        })}
                        value={name}
                        onChange={(e) => dispatch({ field: 'name', value: e.target.value })}
                        onBlur={() => setNameTouched(true)}
                        error={nameError}
                        helperText={nameError
                            ? intl.formatMessage({
                                id: 'Governance.Templates.Wizard.GeneralDetails.name.required',
                                defaultMessage: 'Template name is required',
                            })
                            : intl.formatMessage({
                                id: 'Governance.Templates.Wizard.GeneralDetails.name.helper',
                                defaultMessage: 'A unique, human-readable name for this template',
                            })}
                        inputProps={{ maxLength: 256 }}
                        variant='outlined'
                    />
                </Grid>

                {/* Status */}
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        select
                        label={intl.formatMessage({
                            id: 'Governance.Templates.Wizard.GeneralDetails.status.label',
                            defaultMessage: 'Status',
                        })}
                        value={status}
                        onChange={(e) => dispatch({ field: 'status', value: e.target.value })}
                        helperText={intl.formatMessage({
                            id: 'Governance.Templates.Wizard.GeneralDetails.status.helper',
                            defaultMessage: 'Only PUBLISHED templates are visible to Devportal users',
                        })}
                        variant='outlined'
                    >
                        <MenuItem value='DRAFT'>
                            <FormattedMessage
                                id='Governance.Templates.Wizard.GeneralDetails.status.draft'
                                defaultMessage='Draft'
                            />
                        </MenuItem>
                        <MenuItem value='PUBLISHED'>
                            <FormattedMessage
                                id='Governance.Templates.Wizard.GeneralDetails.status.published'
                                defaultMessage='Published'
                            />
                        </MenuItem>
                    </TextField>
                </Grid>

                {/* Description */}
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label={intl.formatMessage({
                            id: 'Governance.Templates.Wizard.GeneralDetails.description.label',
                            defaultMessage: 'Description',
                        })}
                        value={description}
                        onChange={(e) => dispatch({ field: 'description', value: e.target.value })}
                        inputProps={{ maxLength: 1024 }}
                        helperText={intl.formatMessage({
                            id: 'Governance.Templates.Wizard.GeneralDetails.description.helper',
                            defaultMessage: 'Briefly describe the purpose and intended audience of this template',
                        })}
                        variant='outlined'
                    />
                </Grid>

                {/* Toggles section */}
                <Grid item xs={12}>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                        <FormattedMessage
                            id='Governance.Templates.Wizard.GeneralDetails.options.heading'
                            defaultMessage='Template Options'
                        />
                    </Typography>
                </Grid>

                {/* isDefault toggle */}
                <Grid item xs={12} md={6}>
                    <FormControlLabel
                        control={(
                            <Switch
                                checked={isDefault}
                                onChange={(e) => dispatch({ field: 'isDefault', value: e.target.checked })}
                                color='primary'
                            />
                        )}
                        label={(
                            <Box sx={{ ml: 1 }}>
                                <Typography variant='body2' fontWeight={500}>
                                    <FormattedMessage
                                        id='Governance.Templates.Wizard.GeneralDetails.isDefault.label'
                                        defaultMessage='Set as Default Template'
                                    />
                                </Typography>
                                <Typography variant='caption' color='text.secondary'>
                                    <FormattedMessage
                                        id='Governance.Templates.Wizard.GeneralDetails.isDefault.helper'
                                        defaultMessage={
                                            'Applied as the fallback when a developer does not '
                                            + 'explicitly select a template'
                                        }
                                    />
                                </Typography>
                            </Box>
                        )}
                        sx={{ alignItems: 'flex-start', ml: 0 }}
                    />
                </Grid>

                {/* isGlobal toggle — super tenant only */}
                {isSuperTenant && (
                    <Grid item xs={12} md={6}>
                        <FormControlLabel
                            control={(
                                <Switch
                                    checked={isGlobal}
                                    onChange={(e) => dispatch({ field: 'isGlobal', value: e.target.checked })}
                                    color='secondary'
                                />
                            )}
                            label={(
                                <Box sx={{ ml: 1 }}>
                                    <Typography variant='body2' fontWeight={500}>
                                        <FormattedMessage
                                            id='Governance.Templates.Wizard.GeneralDetails.isGlobal.label'
                                            defaultMessage='Set as Global Template'
                                        />
                                    </Typography>
                                    <Typography variant='caption' color='text.secondary'>
                                        <FormattedMessage
                                            id='Governance.Templates.Wizard.GeneralDetails.isGlobal.helper'
                                            defaultMessage={
                                            'Visible to all organizations as a cross-tenant fallback; '
                                            + 'only manageable by Super Tenant admins'
                                        }
                                        />
                                    </Typography>
                                </Box>
                            )}
                            sx={{ alignItems: 'flex-start', ml: 0 }}
                        />
                    </Grid>
                )}
            </Grid>
        </Box>
    );
}

GeneralDetailsStep.propTypes = {
    templateState: PropTypes.shape({
        name: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
        isDefault: PropTypes.bool.isRequired,
        isGlobal: PropTypes.bool.isRequired,
    }).isRequired,
    dispatch: PropTypes.func.isRequired,
};
