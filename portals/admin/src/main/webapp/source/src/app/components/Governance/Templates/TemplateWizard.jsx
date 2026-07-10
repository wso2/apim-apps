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

import React, {
    useReducer, useState, useEffect, useRef,
} from 'react';
import PropTypes from 'prop-types';
import { useParams, useHistory, Link as RouterLink } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    Box,
    Button,
    ButtonGroup,
    CircularProgress,
    ClickAwayListener,
    Grow,
    MenuItem,
    MenuList,
    Paper,
    Popper,
    Step,
    StepLabel,
    Stepper,
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ContentBase from 'AppComponents/AdminPages/Addons/ContentBase';
import Alert from 'AppComponents/Shared/Alert';
import GovernanceAPI from 'AppData/GovernanceAPI';
import GeneralDetailsStep from './steps/GeneralDetailsStep';
import FormBuilderStep from './steps/FormBuilderStep';
import RulesetBindingsStep from './steps/RulesetBindingsStep';
import DeveloperViewStep from './steps/DeveloperViewStep';
import ReviewPublishStep from './steps/ReviewPublishStep';

/**
 * Initial form config.
 * Sections: application (metadata), keyManagers (per-KM governance).
 * Subscription throttling policy removed — cannot meaningfully pre-set a
 * per-API policy from a template.
 */
const INITIAL_FORM_CONFIG = {
    application: {
        throttlingPolicy: { hidden: false, defaultValue: '' },
        description: { hidden: false, required: false, defaultValue: '' },
        groups: {
            hidden: false, required: false, active: true, defaultValue: '',
        },
        // Custom attributes are stored under application.attributes.<attrName>
    },
    // keyManagers is a dynamic object keyed by KM name, populated in FormBuilderStep
    keyManagers: {},
    developerExperience: {
        summary: '',
        limitations: '',
    },
};

function mergeFormConfig(formConfig = {}) {
    return {
        ...INITIAL_FORM_CONFIG,
        ...formConfig,
        application: {
            ...INITIAL_FORM_CONFIG.application,
            ...(formConfig.application ?? {}),
        },
        // Subscription section removed from INITIAL_FORM_CONFIG; retain existing data if present
        ...(formConfig.subscription ? { subscription: formConfig.subscription } : {}),
        // keyManagers is dynamic — preserve as-is from stored config
        keyManagers: formConfig.keyManagers ?? {},
        developerExperience: {
            ...INITIAL_FORM_CONFIG.developerExperience,
            ...(formConfig.developerExperience ?? {}),
        },
    };
}

const INITIAL_STATE = {
    name: '',
    description: '',
    tags: [],
    icon: null,
    status: 'DRAFT',
    isDefault: false,
    isGlobal: false,
    formConfig: INITIAL_FORM_CONFIG,
    rulesetBindings: [],
};

function templateReducer(state, { field, value }) {
    return { ...state, [field]: value };
}

const isConfigTrue = (value) => value === true || value === 'true';
const isConfigActive = (config = {}) => config.active !== false && config.active !== 'false';

const getEnabledKeyManagerNames = (formConfig = {}) => Object.entries(formConfig.keyManagers ?? {})
    .filter(([, config]) => config?.enabled === true)
    .map(([name]) => name);

const isDefaultEmpty = (value) => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
};

const toFieldLabel = (path) => {
    if (path === 'application.description') return 'Application description';
    if (path === 'application.groups') return 'Application groups';
    if (path.startsWith('application.attributes.')) {
        return `Application attribute "${path.slice('application.attributes.'.length)}"`;
    }
    return path || 'Field';
};

const collectRequiredHiddenDefaultFields = (config, path = '') => {
    if (!config || typeof config !== 'object' || Array.isArray(config)) return [];

    // Skip per-KM config objects that have governance disabled
    if (config.enabled === false) return [];

    const fields = [];
    if (
        isConfigActive(config)
        && isConfigTrue(config.required)
        && isConfigTrue(config.hidden)
        && isDefaultEmpty(config.defaultValue)
    ) {
        fields.push(toFieldLabel(path));
    }

    Object.entries(config).forEach(([key, value]) => {
        if (key === 'defaultValue') return;
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            const childPath = path ? `${path}.${key}` : key;
            fields.push(...collectRequiredHiddenDefaultFields(value, childPath));
        }
    });
    return fields;
};

const STEPS = [
    {
        id: 'Governance.Templates.Wizard.step.general',
        defaultMessage: 'General Details',
    },
    {
        id: 'Governance.Templates.Wizard.step.formBuilder',
        defaultMessage: 'Field Configuration',
    },
    {
        id: 'Governance.Templates.Wizard.step.rulesets',
        defaultMessage: 'Ruleset Bindings',
    },
    {
        id: 'Governance.Templates.Wizard.step.developerView',
        defaultMessage: 'Developer View',
    },
    {
        id: 'Governance.Templates.Wizard.step.review',
        defaultMessage: 'Review & Publish',
    },
];

/**
 * Split button for the final wizard step.
 * Default action = Publish; dropdown reveals Save as Draft.
 */
function PublishSplitButton({
    isEditMode, saving, disabled, onPublish, onDraft,
}) {
    const intl = useIntl();
    const [open, setOpen] = useState(false);
    const anchorRef = useRef(null);

    const publishLabel = isEditMode
        ? intl.formatMessage({ id: 'Governance.Templates.Wizard.btn.savePublish', defaultMessage: 'Save & Publish' })
        : intl.formatMessage({ id: 'Governance.Templates.Wizard.btn.publish', defaultMessage: 'Publish' });

    const draftLabel = intl.formatMessage({
        id: 'Governance.Templates.Wizard.btn.saveDraft',
        defaultMessage: 'Save as Draft',
    });

    return (
        <>
            <ButtonGroup
                variant='contained'
                color='success'
                ref={anchorRef}
                disabled={disabled}
            >
                <Button
                    onClick={onPublish}
                    startIcon={saving ? <CircularProgress size={16} color='inherit' /> : null}
                >
                    {publishLabel}
                </Button>
                <Button size='small' onClick={() => setOpen((prev) => !prev)}>
                    <ArrowDropDownIcon />
                </Button>
            </ButtonGroup>
            <Popper
                sx={{ zIndex: 1 }}
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                disablePortal
            >
                {({ TransitionProps, placement }) => (
                    <Grow
                        {...TransitionProps}
                        style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
                    >
                        <Paper elevation={4}>
                            <ClickAwayListener onClickAway={() => setOpen(false)}>
                                <MenuList autoFocusItem>
                                    <MenuItem
                                        onClick={() => {
                                            setOpen(false);
                                            onDraft();
                                        }}
                                    >
                                        {draftLabel}
                                    </MenuItem>
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </>
    );
}

PublishSplitButton.propTypes = {
    isEditMode: PropTypes.bool.isRequired,
    saving: PropTypes.bool.isRequired,
    disabled: PropTypes.bool.isRequired,
    onPublish: PropTypes.func.isRequired,
    onDraft: PropTypes.func.isRequired,
};

/**
 * Multi-step wizard for creating and editing Devportal Governance Templates.
 */
export default function TemplateWizard() {
    const { id: templateId } = useParams();
    const history = useHistory();
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
                dispatch({ field: 'tags', value: Array.isArray(t.tags) ? t.tags : [] });
                dispatch({ field: 'icon', value: t.icon || null });
                dispatch({ field: 'status', value: t.status || 'DRAFT' });
                dispatch({ field: 'isDefault', value: !!t.isDefault });
                dispatch({ field: 'isGlobal', value: !!t.isGlobal });
                dispatch({ field: 'formConfig', value: mergeFormConfig(t.formConfig) });
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

    const requiredHiddenDefaultFields = collectRequiredHiddenDefaultFields(templateState.formConfig);

    const showRequiredHiddenDefaultError = () => {
        Alert.error(intl.formatMessage(
            {
                id: 'Governance.Templates.Wizard.requiredHiddenDefault.error',
                defaultMessage: '{field} is required and hidden, so set a default value before continuing.',
            },
            { field: requiredHiddenDefaultFields[0] },
        ));
    };

    const handleNext = () => setActiveStep((s) => s + 1);

    const handleSaveAs = (statusOverride) => {
        if (!templateState.name.trim()) {
            Alert.error(intl.formatMessage({
                id: 'Governance.Templates.Wizard.name.required.error',
                defaultMessage: 'Template name is required before saving.',
            }));
            setActiveStep(0);
            return;
        }
        if (statusOverride === 'PUBLISHED' && getEnabledKeyManagerNames(templateState.formConfig).length === 0) {
            Alert.error(intl.formatMessage({
                id: 'Governance.Templates.Wizard.keyManager.required.error',
                defaultMessage: 'Select at least one Key Manager before publishing.',
            }));
            setActiveStep(1);
            return;
        }
        if (requiredHiddenDefaultFields.length > 0) {
            showRequiredHiddenDefaultError();
            return;
        }
        setSaving(true);
        const payload = {
            name: templateState.name,
            description: templateState.description,
            tags: templateState.tags,
            icon: templateState.icon,
            status: statusOverride,
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
                history.push('/governance/templates');
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

    const isLastStep = activeStep === STEPS.length - 1;

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
        <DeveloperViewStep
            key='developer-view'
            templateState={templateState}
            dispatch={dispatch}
        />,
        <ReviewPublishStep
            key='review'
            templateState={templateState}
            dispatch={dispatch}
        />,
    ];

    return (
        <ContentBase title={pageTitle} paperLess width='full'>
            <Box sx={{
                width: '100%',
                boxSizing: 'border-box',
                minWidth: 0,
                maxWidth: '100%',
                overflowX: 'hidden',
                pb: isLastStep ? 3 : 10,
            }}
            >
                {/* Stepper header */}
                <Paper
                    elevation={0}
                    variant='outlined'
                    sx={{
                        p: 3,
                        mb: 3,
                        width: '100%',
                        boxSizing: 'border-box',
                        minWidth: 0,
                        maxWidth: '100%',
                        overflowX: 'hidden',
                    }}
                >
                    <Stepper
                        activeStep={activeStep}
                        alternativeLabel
                        nonLinear
                        sx={{
                            width: '100%',
                            minWidth: 0,
                            maxWidth: '100%',
                            overflowX: 'hidden',
                            '& .MuiStep-root': {
                                minWidth: 0,
                            },
                            '& .MuiStepLabel-label': {
                                whiteSpace: 'normal',
                                overflowWrap: 'anywhere',
                                wordBreak: 'break-word',
                            },
                        }}
                    >
                        {STEPS.map((step, index) => (
                            <Step key={step.id} onClick={() => setActiveStep(index)} sx={{ cursor: 'pointer' }}>
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
                <Paper
                    elevation={0}
                    variant='outlined'
                    sx={{
                        p: 3,
                        mb: 4,
                        width: '100%',
                        boxSizing: 'border-box',
                        minWidth: 0,
                        maxWidth: '100%',
                        overflowX: 'hidden',
                        overflowY: 'visible',
                    }}
                >
                    {stepContent[activeStep]}
                </Paper>

                {/* Navigation — all buttons on the left, sticky at bottom */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        gap: 1,
                        flexWrap: 'wrap',
                        position: isLastStep ? 'static' : 'sticky',
                        bottom: 0,
                        zIndex: 10,
                        py: 2,
                        px: 1,
                        bgcolor: 'background.default',
                        borderTop: 1,
                        borderColor: 'divider',
                    }}
                >
                    {/* Step 0: Cancel + Next. Steps 1+: Back + Next (no Cancel). */}
                    {activeStep === 0 ? (
                        <RouterLink to='/governance/templates' style={{ textDecoration: 'none' }}>
                            <Button variant='outlined' color='inherit'>
                                <FormattedMessage
                                    id='Governance.Templates.Wizard.btn.cancel'
                                    defaultMessage='Cancel'
                                />
                            </Button>
                        </RouterLink>
                    ) : (
                        <Button
                            variant='outlined'
                            color='inherit'
                            onClick={() => setActiveStep((s) => s - 1)}
                        >
                            <FormattedMessage
                                id='Governance.Templates.Wizard.btn.back'
                                defaultMessage='Back'
                            />
                        </Button>
                    )}

                    {isLastStep ? (
                        <PublishSplitButton
                            isEditMode={isEditMode}
                            saving={saving}
                            disabled={saving}
                            onPublish={() => handleSaveAs('PUBLISHED')}
                            onDraft={() => handleSaveAs('DRAFT')}
                        />
                    ) : (
                        <Button
                            variant='contained'
                            color='primary'
                            onClick={handleNext}
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
