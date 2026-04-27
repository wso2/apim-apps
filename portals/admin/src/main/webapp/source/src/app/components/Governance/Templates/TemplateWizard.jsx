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

import React, { useReducer, useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    Box,
    Button,
    CircularProgress,
    Paper,
    Step,
    StepLabel,
    Stepper,
    Typography,
} from '@mui/material';
import ContentBase from 'AppComponents/AdminPages/Addons/ContentBase';
import Alert from 'AppComponents/Shared/Alert';
import GovernanceAPI from 'AppData/GovernanceAPI';
import GeneralDetailsStep from './steps/GeneralDetailsStep';
import FormBuilderStep from './steps/FormBuilderStep';
import RulesetBindingsStep from './steps/RulesetBindingsStep';
import ReviewPublishStep from './steps/ReviewPublishStep';

/**
 * Initial form config structure.
 * Sections map directly to the three phases of the Devportal application wizard.
 * Step 2 (Form Builder) reads and writes this structure.
 */
const INITIAL_FORM_CONFIG = {
    application: {
        throttlingPolicy: { hidden: false, defaultValue: '' },
        tokenType: { hidden: false, defaultValue: 'JWT' },
        callbackUrl: { hidden: false, defaultValue: '' },
    },
    subscription: {
        throttlingPolicy: { hidden: false, defaultValue: '' },
    },
    keyGeneration: {
        keyType: { hidden: false, defaultValue: 'PRODUCTION' },
        grantTypes: { hidden: false, defaultValue: [] },
        validityPeriod: { hidden: false, defaultValue: -1 },
        additionalProperties: { hidden: false, defaultValue: {} },
    },
};

const INITIAL_STATE = {
    name: '',
    description: '',
    status: 'DRAFT',
    isDefault: false,
    isGlobal: false,
    formConfig: INITIAL_FORM_CONFIG,
    rulesetBindings: [],
};

function templateReducer(state, { field, value }) {
    return { ...state, [field]: value };
}

const STEPS = [
    {
        id: 'Governance.Templates.Wizard.step.general',
        defaultMessage: 'General Details',
    },
    {
        id: 'Governance.Templates.Wizard.step.formBuilder',
        defaultMessage: 'Form Builder',
    },
    {
        id: 'Governance.Templates.Wizard.step.rulesets',
        defaultMessage: 'Ruleset Bindings',
    },
    {
        id: 'Governance.Templates.Wizard.step.review',
        defaultMessage: 'Review & Publish',
    },
];

/**
 * Multi-step wizard for creating and editing Devportal Governance Templates.
 * Holds all template state; child step components receive templateState + dispatch.
 * @returns {JSX} TemplateWizard component
 */
export default function TemplateWizard() {
    const { id: templateId } = useParams();
    const intl = useIntl();
    const isEditMode = !!templateId;

    const [templateState, dispatch] = useReducer(templateReducer, INITIAL_STATE);
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isEditMode) return;
        new GovernanceAPI()
            .getDevportalGovernanceTemplateById(templateId)
            .then((res) => {
                const t = res.body;
                dispatch({ field: 'name', value: t.name || '' });
                dispatch({ field: 'description', value: t.description || '' });
                dispatch({ field: 'status', value: t.status || 'DRAFT' });
                dispatch({ field: 'isDefault', value: !!t.isDefault });
                dispatch({ field: 'isGlobal', value: !!t.isGlobal });
                dispatch({ field: 'formConfig', value: t.formConfig || INITIAL_FORM_CONFIG });
                dispatch({ field: 'rulesetBindings', value: t.rulesetBindings || [] });
            })
            .catch((error) => {
                const msg = error?.response?.body?.message
                    || intl.formatMessage({
                        id: 'Governance.Templates.Wizard.load.error',
                        defaultMessage: 'Failed to load template',
                    });
                Alert.error(msg);
            })
            .finally(() => setLoading(false));
    }, [templateId]);

    const handleSave = () => {
        setSaving(true);
        const payload = {
            name: templateState.name,
            description: templateState.description,
            status: templateState.status,
            isDefault: templateState.isDefault,
            isGlobal: templateState.isGlobal,
            formConfig: templateState.formConfig,
            rulesetBindings: templateState.rulesetBindings,
        };

        const apiCall = isEditMode
            ? new GovernanceAPI().updateDevportalGovernanceTemplateById(templateId, payload)
            : new GovernanceAPI().createDevportalGovernanceTemplate(payload);

        apiCall
            .then(() => {
                Alert.success(intl.formatMessage({
                    id: 'Governance.Templates.Wizard.save.success',
                    defaultMessage: isEditMode
                        ? 'Template updated successfully'
                        : 'Template created successfully',
                }));
            })
            .catch((error) => {
                const msg = error?.response?.body?.message
                    || intl.formatMessage({
                        id: 'Governance.Templates.Wizard.save.error',
                        defaultMessage: 'Failed to save template',
                    });
                Alert.error(msg);
            })
            .finally(() => setSaving(false));
    };

    const pageTitle = isEditMode
        ? intl.formatMessage({
            id: 'Governance.Templates.Wizard.title.edit',
            defaultMessage: 'Edit Template',
        })
        : intl.formatMessage({
            id: 'Governance.Templates.Wizard.title.create',
            defaultMessage: 'Create Template',
        });

    if (loading) {
        return (
            <ContentBase title={pageTitle} pageStyle='paperLess'>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                    <CircularProgress />
                </Box>
            </ContentBase>
        );
    }

    const isNameValid = templateState.name.trim().length > 0;
    const isLastStep = activeStep === STEPS.length - 1;

    // Placeholder content for steps not yet implemented
    const stepContent = [
        <GeneralDetailsStep
            key='general'
            templateState={templateState}
            dispatch={dispatch}
        />,
        <FormBuilderStep
            key='form-builder'
            templateState={templateState}
            dispatch={dispatch}
        />,
        <RulesetBindingsStep
            key='rulesets'
            templateState={templateState}
            dispatch={dispatch}
        />,
        <ReviewPublishStep
            key='review'
            templateState={templateState}
        />,
    ];

    return (
        <ContentBase title={pageTitle} pageStyle='paperLess'>
            {/* Stepper header */}
            <Paper elevation={0} variant='outlined' sx={{ p: 3, mb: 3 }}>
                <Stepper activeStep={activeStep} alternativeLabel>
                    {STEPS.map((step) => (
                        <Step key={step.id}>
                            <StepLabel>
                                <FormattedMessage
                                    id={step.id}
                                    defaultMessage={step.defaultMessage}
                                />
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Paper>

            {/* Active step content */}
            <Paper elevation={0} variant='outlined' sx={{ p: 3, mb: 3 }}>
                {stepContent[activeStep]}
            </Paper>

            {/* Navigation */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <RouterLink to='/governance/templates' style={{ textDecoration: 'none' }}>
                        <Button variant='outlined' color='inherit'>
                            <FormattedMessage
                                id='Governance.Templates.Wizard.btn.cancel'
                                defaultMessage='Cancel'
                            />
                        </Button>
                    </RouterLink>
                    {activeStep > 0 && (
                        <Button
                            variant='outlined'
                            onClick={() => setActiveStep((s) => s - 1)}
                        >
                            <FormattedMessage
                                id='Governance.Templates.Wizard.btn.back'
                                defaultMessage='Back'
                            />
                        </Button>
                    )}
                </Box>
                <Box>
                    {isLastStep ? (
                        <Button
                            variant='contained'
                            color='primary'
                            onClick={handleSave}
                            disabled={saving || !isNameValid}
                            startIcon={saving ? <CircularProgress size={16} color='inherit' /> : null}
                        >
                            <FormattedMessage
                                id='Governance.Templates.Wizard.btn.save'
                                defaultMessage={isEditMode ? 'Save Changes' : 'Create Template'}
                            />
                        </Button>
                    ) : (
                        <Button
                            variant='contained'
                            color='primary'
                            onClick={() => setActiveStep((s) => s + 1)}
                            disabled={!isNameValid}
                        >
                            <FormattedMessage
                                id='Governance.Templates.Wizard.btn.next'
                                defaultMessage='Next'
                            />
                        </Button>
                    )}
                </Box>
            </Box>
        </ContentBase>
    );
}
