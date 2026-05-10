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
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import {
    Box,
    Divider,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Link,
    Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {
    getDeveloperExperience,
    getDeveloperLimitations,
} from './templateDeveloperViewUtils';

/**
 * Shows only the developer-facing explanation of a governance template before selection.
 */
export default function TemplatePreviewDialog({ template, onClose }) {
    if (!template) return null;

    const developerExperience = getDeveloperExperience(template);
    const developerLimitations = getDeveloperLimitations(template);
    const summary = developerExperience.summary || template.description;
    const rulesetBindings = template.rulesetBindings ?? [];

    return (
        <Dialog open onClose={onClose} maxWidth='md' fullWidth scroll='paper'>
            <DialogTitle
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    pb: 1,
                }}
            >
                <Box>
                    <Typography variant='h6'>{template.name}</Typography>
                </Box>
                <IconButton onClick={onClose} size='small' sx={{ ml: 2 }}>
                    <CloseIcon fontSize='small' />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                {summary ? (
                    <Typography variant='body2' color='text.secondary' sx={{ mb: 1.5 }}>
                        {summary}
                    </Typography>
                ) : (
                    <Typography variant='body2' color='text.secondary' fontStyle='italic' sx={{ mb: 1.5 }}>
                        <FormattedMessage
                            id='Applications.Create.TemplatePreview.noSummary'
                            defaultMessage='No developer summary is documented for this template.'
                        />
                    </Typography>
                )}
                {developerLimitations.length > 0 ? (
                    <Box component='ul' sx={{ pl: 2.5, mt: 0, mb: rulesetBindings.length > 0 ? 3 : 0 }}>
                        {developerLimitations.map((item) => (
                            <Typography component='li' variant='body2' key={item} sx={{ mb: 0.75 }}>
                                {item}
                            </Typography>
                        ))}
                    </Box>
                ) : (
                    <Typography
                        variant='body2'
                        color='text.secondary'
                        fontStyle='italic'
                        sx={{ mb: rulesetBindings.length > 0 ? 3 : 0 }}
                    >
                        <FormattedMessage
                            id='Applications.Create.TemplatePreview.noLimitations'
                            defaultMessage='No developer limitations are documented for this template.'
                        />
                    </Typography>
                )}
                {rulesetBindings.length > 0 && (
                    <>
                        <Divider sx={{ mb: 2 }} />
                        <Typography variant='subtitle2' sx={{ mb: 1 }}>
                            <FormattedMessage
                                id='Applications.Create.TemplatePreview.rulesets.heading'
                                defaultMessage='Governance rulesets'
                            />
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            {rulesetBindings.map((binding, index) => {
                                const rulesetDescription = binding.rulesetDescription || binding.description;
                                const documentationLink = binding.documentationLink || binding.rulesetDocumentationLink;
                                return (
                                    <Box key={binding.bindingId || binding.rulesetId || index}>
                                        <Typography variant='body2' fontWeight={600}>
                                            {binding.rulesetName || binding.rulesetId}
                                        </Typography>
                                        {rulesetDescription && (
                                            <Typography variant='body2' color='text.secondary' sx={{ mt: 0.25 }}>
                                                {rulesetDescription}
                                            </Typography>
                                        )}
                                        {documentationLink && (
                                            <Link
                                                href={documentationLink}
                                                target='_blank'
                                                rel='noopener noreferrer'
                                                variant='body2'
                                                sx={{ display: 'inline-block', mt: 0.5 }}
                                            >
                                                <FormattedMessage
                                                    id='Applications.Create.TemplatePreview.rulesets.documentation'
                                                    defaultMessage='Documentation'
                                                />
                                            </Link>
                                        )}
                                    </Box>
                                );
                            })}
                        </Box>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

TemplatePreviewDialog.propTypes = {
    template: PropTypes.shape({
        name: PropTypes.string,
        description: PropTypes.string,
        formConfig: PropTypes.shape({}),
        rulesetBindings: PropTypes.arrayOf(PropTypes.shape({
            bindingId: PropTypes.string,
            rulesetId: PropTypes.string,
            rulesetName: PropTypes.string,
            description: PropTypes.string,
            rulesetDescription: PropTypes.string,
            documentationLink: PropTypes.string,
            rulesetDocumentationLink: PropTypes.string,
        })),
    }),
    onClose: PropTypes.func.isRequired,
};

TemplatePreviewDialog.defaultProps = { template: null };
