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

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Box,
    Typography,
    RadioGroup,
    FormControlLabel,
    Radio,
    Grid,
    Alert,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { FormattedMessage, useIntl } from 'react-intl';
import CONSTS from 'AppData/Constants';

export default function ActionConfigDialog({
    open, onClose, onSave, editAction, existingStates = [],
}) {
    const intl = useIntl();
    const [formState, setFormState] = useState(editAction || {
        governedState: '',
        actions: {
            error: CONSTS.GOVERNANCE_ACTIONS.NOTIFY,
            warn: CONSTS.GOVERNANCE_ACTIONS.NOTIFY,
            info: CONSTS.GOVERNANCE_ACTIONS.NOTIFY,
        },
    });

    useEffect(() => {
        setFormState(editAction || {
            governedState: '',
            actions: {
                error: CONSTS.GOVERNANCE_ACTIONS.NOTIFY,
                warn: CONSTS.GOVERNANCE_ACTIONS.NOTIFY,
                info: CONSTS.GOVERNANCE_ACTIONS.NOTIFY,
            },
        });
    }, [editAction]);

    const handleClose = () => {
        setFormState({
            governedState: '',
            actions: {
                error: CONSTS.GOVERNANCE_ACTIONS.NOTIFY,
                warn: CONSTS.GOVERNANCE_ACTIONS.NOTIFY,
                info: CONSTS.GOVERNANCE_ACTIONS.NOTIFY,
            },
        });
        onClose();
    };

    const handleSave = () => {
        onSave(formState);
        handleClose(); // Reset the form after saving
    };

    const isValid = () => {
        return formState.governedState && Object.values(formState.actions).every((action) => action !== '');
    };

    const isCreateOrUpdate = formState.governedState === 'API_CREATE' || formState.governedState === 'API_UPDATE';

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth='xs'
            fullWidth
        >
            <DialogTitle>
                <FormattedMessage
                    id='Governance.Policies.AddEdit.enforcement.dialog.title'
                    defaultMessage='Enforcement Criteria'
                />
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
                <Box mb={3} mt={1}>
                    <FormControl fullWidth size='small'>
                        <InputLabel>
                            <FormattedMessage
                                id='Governance.Policies.AddEdit.enforcement.state.label'
                                defaultMessage='Governed State'
                            />
                        </InputLabel>
                        <Select
                            value={formState.governedState}
                            onChange={(e) => setFormState({
                                governedState: e.target.value,
                                actions: {
                                    error: CONSTS.GOVERNANCE_ACTIONS.NOTIFY,
                                    warn: CONSTS.GOVERNANCE_ACTIONS.NOTIFY,
                                    info: CONSTS.GOVERNANCE_ACTIONS.NOTIFY,
                                },
                            })}
                            label={(
                                <FormattedMessage
                                    id='Governance.Policies.AddEdit.enforcement.state.label'
                                    defaultMessage='Governed State'
                                />
                            )}
                            disabled={!!editAction} // Disable in edit mode
                        >
                            {CONSTS.GOVERNABLE_STATES.map((s) => (
                                <MenuItem
                                    key={s.value}
                                    value={s.value}
                                    disabled={existingStates.includes(s.value)}
                                >
                                    {s.label}
                                    {!editAction && existingStates.includes(s.value) && (
                                        <Typography
                                            variant='caption'
                                            color='text.secondary'
                                            sx={{ ml: 1 }}
                                        >
                                            <FormattedMessage
                                                id='Governance.Policies.AddEdit.enforcement.state.configured'
                                                defaultMessage='(Already configured)'
                                            />
                                        </Typography>
                                    )}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                {formState.governedState && (
                    <Box sx={{ mt: 2 }}>
                        {isCreateOrUpdate ? (
                            <Alert
                                icon={<InfoOutlinedIcon fontSize='inherit' />}
                                severity='info'
                                sx={{
                                    mt: 1,
                                    '& .MuiAlert-message': {
                                        width: '100%',
                                    },
                                }}
                            >
                                <Typography variant='body2'>
                                    <FormattedMessage
                                        id='Governance.Policies.AddEdit.action.create.update.info'
                                        defaultMessage={'Governance rule violations in the API Create '
                                            + 'and API Update states use the Notify action by default '
                                            + 'for all severity levels (Error, Warn, Info).'}
                                    />
                                </Typography>
                            </Alert>
                        ) : (
                            <>
                                <Grid container spacing={2}>
                                    <Grid item xs={5}>
                                        <Typography variant='subtitle2' sx={{ mb: 2 }}>
                                            <FormattedMessage
                                                id='Governance.Policies.AddEdit.enforcement.severity.title'
                                                defaultMessage='Severity Levels'
                                            />
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={7}>
                                        <Typography variant='subtitle2' sx={{ mb: 2 }}>
                                            <FormattedMessage
                                                id='Governance.Policies.AddEdit.enforcement.actions.title'
                                                defaultMessage='Actions'
                                            />
                                        </Typography>
                                    </Grid>
                                </Grid>
                                {CONSTS.SEVERITY_LEVELS.map((level) => (
                                    <Box key={level.value} sx={{ mb: 2 }}>
                                        <Grid container spacing={2} alignItems='center'>
                                            <Grid item xs={5}>
                                                <Typography variant='body2'>
                                                    {level.label}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={7}>
                                                <RadioGroup
                                                    row
                                                    value={formState.actions[level.value.toLowerCase()]}
                                                    onChange={(e) => setFormState({
                                                        ...formState,
                                                        actions: {
                                                            ...formState.actions,
                                                            [level.value.toLowerCase()]: e.target.value,
                                                        },
                                                    })}
                                                >
                                                    <FormControlLabel
                                                        value={CONSTS.GOVERNANCE_ACTIONS.NOTIFY}
                                                        control={<Radio size='small' />}
                                                        label={(
                                                            <Typography variant='body2'>
                                                                {intl.formatMessage({
                                                                    id: 'Governance.Policies.AddEdit.enforcement.'
                                                                        + 'action.notify',
                                                                    defaultMessage: 'Notify',
                                                                })}
                                                            </Typography>
                                                        )}
                                                    />
                                                    <FormControlLabel
                                                        value={CONSTS.GOVERNANCE_ACTIONS.BLOCK}
                                                        control={<Radio size='small' />}
                                                        label={(
                                                            <Typography variant='body2'>
                                                                {intl.formatMessage({
                                                                    id: 'Governance.Policies.AddEdit.enforcement.'
                                                                        + 'action.block',
                                                                    defaultMessage: 'Block',
                                                                })}
                                                            </Typography>
                                                        )}
                                                    />
                                                </RadioGroup>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                ))}
                            </>
                        )}
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={handleClose} size='small'>
                    <FormattedMessage
                        id='Governance.Policies.AddEdit.enforcement.dialog.cancel'
                        defaultMessage='Cancel'
                    />
                </Button>
                <Button
                    onClick={handleSave}
                    variant='contained'
                    color='primary'
                    disabled={!isValid()}
                    size='small'
                >
                    <FormattedMessage
                        id='Governance.Policies.AddEdit.enforcement.dialog.save'
                        defaultMessage='Save'
                    />
                </Button>
            </DialogActions>
        </Dialog>
    );
}
