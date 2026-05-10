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

import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    Autocomplete,
    Box,
    Button,
    Chip,
    FormControlLabel,
    Grid,
    Switch,
    TextField,
    Typography,
    Divider,
} from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import { useAppContext } from 'AppComponents/Shared/AppContext';

const MAX_ICON_SIZE_BYTES = 200 * 1024; // 200 KB
const ALLOWED_ICON_TYPES = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];

function IconUpload({ iconPreview, onIconChange }) {
    const intl = useIntl();
    const fileInputRef = useRef(null);
    const [iconError, setIconError] = useState('');

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        // Reset input so the same file can be re-selected after removal
        // eslint-disable-next-line no-param-reassign
        event.target.value = '';
        if (!file) return;

        if (!ALLOWED_ICON_TYPES.includes(file.type)) {
            setIconError(intl.formatMessage({
                id: 'Governance.Templates.GeneralDetails.icon.typeError',
                defaultMessage: 'Only JPEG, PNG, SVG, and WebP images are allowed.',
            }));
            return;
        }

        if (file.size > MAX_ICON_SIZE_BYTES) {
            setIconError(intl.formatMessage(
                {
                    id: 'Governance.Templates.GeneralDetails.icon.sizeError',
                    defaultMessage: 'Icon must be smaller than 200 KB (current: {size} KB).',
                },
                { size: Math.ceil(file.size / 1024) },
            ));
            return;
        }

        setIconError('');
        const reader = new FileReader();
        reader.onload = (e) => onIconChange(e.target.result);
        reader.readAsDataURL(file);
    };

    return (
        <Box>
            <Typography variant='body2' fontWeight={500} gutterBottom>
                <FormattedMessage
                    id='Governance.Templates.GeneralDetails.icon.label'
                    defaultMessage='Template Icon'
                />
            </Typography>
            <Box
                sx={{
                    display: 'flex', alignItems: 'center', gap: 2, mb: 1,
                }}
            >
                {iconPreview ? (
                    <Box
                        component='img'
                        src={iconPreview}
                        alt='Template icon preview'
                        sx={{
                            width: 64,
                            height: 64,
                            objectFit: 'contain',
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider',
                            p: 0.5,
                        }}
                    />
                ) : (
                    <Box
                        sx={{
                            width: 64,
                            height: 64,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px dashed',
                            borderColor: 'divider',
                            borderRadius: 1,
                            color: 'text.disabled',
                        }}
                    >
                        <ImageIcon />
                    </Box>
                )}
                <Box>
                    <input
                        ref={fileInputRef}
                        type='file'
                        accept={ALLOWED_ICON_TYPES.join(',')}
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />
                    <Button
                        size='small'
                        variant='outlined'
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <FormattedMessage
                            id='Governance.Templates.GeneralDetails.icon.uploadBtn'
                            defaultMessage={iconPreview ? 'Change Icon' : 'Upload Icon'}
                        />
                    </Button>
                    {iconPreview && (
                        <Button
                            size='small'
                            color='error'
                            sx={{ ml: 1 }}
                            onClick={() => { onIconChange(null); setIconError(''); }}
                        >
                            <FormattedMessage
                                id='Governance.Templates.GeneralDetails.icon.removeBtn'
                                defaultMessage='Remove'
                            />
                        </Button>
                    )}
                </Box>
            </Box>
            {iconError && (
                <Typography variant='caption' color='error' display='block' sx={{ mb: 0.5 }}>
                    {iconError}
                </Typography>
            )}
            <Typography variant='caption' color='text.secondary'>
                <FormattedMessage
                    id='Governance.Templates.GeneralDetails.icon.helper'
                    defaultMessage='Max 200 KB. JPEG, PNG, SVG, or WebP.'
                />
            </Typography>
        </Box>
    );
}

IconUpload.propTypes = {
    iconPreview: PropTypes.string,
    onIconChange: PropTypes.func.isRequired,
};
IconUpload.defaultProps = { iconPreview: null };

/**
 * Step 1 of the TemplateWizard: name, description, tags, icon, isGlobal (super tenant only).
 * isDefault is managed from the template list, not here.
 * Status (Draft / Published) is chosen via the wizard navigation dropdown.
 */
export default function GeneralDetailsStep({ templateState, dispatch }) {
    const intl = useIntl();
    const { isSuperTenant } = useAppContext();
    const {
        name, description, tags, icon, isGlobal,
    } = templateState;

    const [nameTouched, setNameTouched] = useState(false);
    const [nameChanged, setNameChanged] = useState(false);
    // Only show error when the user has both changed the value AND moved focus away
    const nameError = nameTouched && nameChanged && !name.trim();

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
                    defaultMessage='Provide basic information about this template.'
                />
            </Typography>

            <Grid container spacing={3}>
                {/* Name */}
                <Grid item xs={12} md={8}>
                    <TextField
                        fullWidth
                        required
                        label={intl.formatMessage({
                            id: 'Governance.Templates.Wizard.GeneralDetails.name.label',
                            defaultMessage: 'Template Name',
                        })}
                        placeholder={intl.formatMessage({
                            id: 'Governance.Templates.Wizard.GeneralDetails.name.placeholder',
                            defaultMessage: 'My Template',
                        })}
                        value={name}
                        onChange={(e) => {
                            setNameChanged(true);
                            dispatch({ field: 'name', value: e.target.value });
                        }}
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
                        InputLabelProps={{
                            required: true,
                            sx: {
                                '& .MuiFormLabel-asterisk': { color: 'error.main' },
                            },
                        }}
                        variant='outlined'
                    />
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

                {/* Tags */}
                <Grid item xs={12} md={8}>
                    <Autocomplete
                        multiple
                        freeSolo
                        options={[]}
                        value={Array.isArray(tags) ? tags : []}
                        onChange={(e, newValue) => dispatch({ field: 'tags', value: newValue })}
                        renderTags={(value, getTagProps) => value.map((option, index) => (
                            <Chip
                                key={option}
                                variant='outlined'
                                label={option}
                                size='small'
                                {...getTagProps({ index })}
                            />
                        ))}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label={intl.formatMessage({
                                    id: 'Governance.Templates.Wizard.GeneralDetails.tags.label',
                                    defaultMessage: 'Tags',
                                })}
                                helperText={intl.formatMessage({
                                    id: 'Governance.Templates.Wizard.GeneralDetails.tags.helper',
                                    defaultMessage: 'Press Enter to add a tag. '
                                        + 'Tags help filter templates in the gallery.',
                                })}
                                variant='outlined'
                            />
                        )}
                    />
                </Grid>

                {/* Icon Upload */}
                <Grid item xs={12} md={4}>
                    <IconUpload
                        iconPreview={icon || null}
                        onIconChange={(value) => dispatch({ field: 'icon', value })}
                    />
                </Grid>

                {/* isGlobal toggle — super tenant only */}
                {isSuperTenant && (
                    <Grid item xs={12}>
                        <Divider sx={{ mb: 2 }} />
                        <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                            <FormattedMessage
                                id='Governance.Templates.Wizard.GeneralDetails.options.heading'
                                defaultMessage='Template Options'
                            />
                        </Typography>
                        <FormControlLabel
                            control={(
                                <Switch
                                    checked={isGlobal}
                                    onChange={(e) => dispatch({ field: 'isGlobal', value: e.target.checked })}
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
        tags: PropTypes.arrayOf(PropTypes.string),
        icon: PropTypes.string,
        isGlobal: PropTypes.bool.isRequired,
    }).isRequired,
    dispatch: PropTypes.func.isRequired,
};
