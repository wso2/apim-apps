/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
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

import React, { FC, useState, } from 'react';
import { Button, makeStyles, Theme } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Popover from '@material-ui/core/Popover';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import PriorityHighOutlined from '@material-ui/icons/PriorityHighOutlined';
import { FormattedMessage, useIntl } from 'react-intl';
import Tooltip from '@material-ui/core/Tooltip';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import SubjectOutlinedIcon from '@material-ui/icons/SubjectOutlined';
import FormatListBulletedOutlinedIcon from '@material-ui/icons/FormatListBulletedOutlined';
import DeleteIcon from '@material-ui/icons/Delete';
import { AddCircle } from '@material-ui/icons';
import { PolicyAttribute } from './Types';
import { ACTIONS } from './PolicyCreateForm';

const useStyles = makeStyles((theme: Theme) => ({
    attributeProperty: {
        marginLeft: theme.spacing(0.5),
        marginRight: theme.spacing(0.5),
    },
    formControlSelect: {
        marginTop: theme.spacing(2),
    },
    selectRoot: {
        padding: '11.5px 14px',
        width: 100,
    },
    buttonIcon: {
        marginRight: theme.spacing(1),
    },
    requiredToggleButton: {
        height: '37.28px',
        width: '37.28px',
        '&.Mui-selected, &.Mui-selected:hover': {
            color: 'white',
            backgroundColor: theme.palette.primary.main,
        }
    },
    toggleButton: {
        height: '37.28px',
        width: '37.28px',
    },
}));

interface PolicyAttributesProps {
    policyAttributes: PolicyAttribute[];
    dispatch?: React.Dispatch<any>;
    isViewMode: boolean;
}

/**
 * Handles the addition of policy attributes for a given policy.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} Policy attributes UI.
 */
const PolicyAttributes: FC<PolicyAttributesProps> = ({
    policyAttributes, dispatch, isViewMode
}) => {
    const classes = useStyles();
    const intl = useIntl();
    const [descriptionAnchorEl, setDescriptionAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [valuePropertiesAnchorEl, setValuePropertiesAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [openedDescriptionPopoverId, setOpenedDescriptionPopoverId] = useState<string | null>(null);
    const [openedValuesPopoverId, setOpenedValuesPopoverId] = useState<string | null>(null);

    const addNewPolicyAttribute = () => {
        if (dispatch) {
            dispatch({ type: ACTIONS.ADD_POLICY_ATTRIBUTE });
        }
    }

    const getAttributeFormError = (attribute: PolicyAttribute, fieldName: string) => {
        let error = '';
        switch(fieldName) {
            case 'name': {
                if (attribute.name === '') {
                    error = intl.formatMessage({
                        id: 'Apis.Details.Policies.PolicyForm.PolicyAttributes.name.required.error',
                        defaultMessage: 'Name is Empty',
                    });
                }
                return error;
            }
            case 'displayName': {
                if (attribute.displayName === '') {
                    error = intl.formatMessage({
                        id: 'Apis.Details.Policies.PolicyForm.PolicyAttributes.displayName.required.error',
                        defaultMessage: 'Display Name is Empty',
                    });
                }
                return error;
            }
            case 'validationRegex': {
                const regex = attribute.validationRegex;
                if (regex && regex !== '') {
                    try {
                        // eslint-disable-next-line no-new
                        new RegExp(regex);
                    } catch(e) {
                        error = intl.formatMessage({
                            id: 'AApis.Details.Policies.PolicyForm.PolicyAttributes.validationRegex.invalid',
                            defaultMessage: 'Provided regular expression is invalid',
                        })
                    }
                }
                return error;
            }
            case 'defaultValue': {
                const defaultVal = attribute.defaultValue;
                const regex = attribute.validationRegex;
                if (defaultVal && defaultVal !== '' && regex && regex !== '') {
                    try {
                        if (!new RegExp(regex).test(defaultVal)) {
                            error = intl.formatMessage({
                                id: 'Apis.Details.Policies.PolicyForm.PolicyAttributes.defaultValue.validation.error',
                                defaultMessage: 'Please enter a valid input',
                            });
                        }
                    } catch(e) {
                        console.error(e);
                    }
                }
                return error;
            }
            default:
                return error;
        }
    }

    /**
     * Function to handle form inputs
     * @param {any} event Event
     * @param {string} id Policy Attribute ID
     */
    const handleAttributeChange = (event: any, id: string) => {
        if (dispatch) {
            dispatch({
                type: ACTIONS.UPDATE_POLICY_ATTRIBUTE,
                id,
                field: event.target.name,
                value: event.target.value
            });
        }
    }

    /**
     * Function to handle toggle of required attribute
     * @param {boolean} currentState Current state of the required attrbute before toggle
     * @param {string} id Policy Attribute ID
     */
    const handleToggle = (currentState: boolean, id: string) => {
        if (dispatch) {
            dispatch({
                type: ACTIONS.UPDATE_POLICY_ATTRIBUTE,
                id,
                field: 'required',
                value: !currentState,
            });
        }
    }

    /**
     * Function to handle allowed values attribute
     * @param {React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>} event Event
     * @param {string} id Policy Attribute ID
     */
    const handleAllowedValues = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, id: string) => {
        if (dispatch) {
            dispatch({
                type: ACTIONS.UPDATE_POLICY_ATTRIBUTE,
                id,
                field: event.target.name,
                value: event.target.value.split(/[,][\s]*/)
            });
        }
    }

    // Description toggle button related actions
    const handleDescriptionToggle = (event: React.FormEvent<HTMLButtonElement>, id: string) => {
        setOpenedDescriptionPopoverId(id);
        setDescriptionAnchorEl(event.currentTarget);
    }
    const handleDescriptionClose = () => {
        setOpenedDescriptionPopoverId(null);
        setDescriptionAnchorEl(null);
    };

    // Value properties toggle button related actions
    const handleValuePropertiesToggle = (event: React.FormEvent<HTMLButtonElement>, id: string) => {
        setOpenedValuesPopoverId(id);
        setValuePropertiesAnchorEl(event.currentTarget);
    }
    const handleValuePropertiesClose = () => {
        setOpenedValuesPopoverId(null);
        setValuePropertiesAnchorEl(null);
    };

    return (
        <>
            <Box display='flex' flexDirection='row' mt={1} pt={3}>
                <Box width='40%'>
                    <Typography color='inherit' variant='subtitle2' component='div'>
                        <FormattedMessage
                            id='Apis.Details.Policies.PolicyForm.PolicyAttributes.title'
                            defaultMessage='Policy Attributes'
                        />
                    </Typography>
                    <Typography color='inherit' variant='caption' component='p'>
                        <FormattedMessage
                            id='Apis.Details.Policies.PolicyForm.PolicyAttributes.description'
                            defaultMessage='Define attributes of the policy.'
                        />
                    </Typography>
                </Box>
                <Box width='60%'>
                    {!isViewMode && (
                        <Box component='div'>
                            <Grid item xs={12}>
                                <Box flex='1'>
                                    <Button
                                        color='primary'
                                        variant='outlined'
                                        id='add-policy-attributes-btn'
                                        onClick={addNewPolicyAttribute}
                                    >
                                        <AddCircle className={classes.buttonIcon} />
                                        <FormattedMessage
                                            id='Apis.Details.Policies.PolicyForm.PolicyAttributes.add.policy.attribute'
                                            defaultMessage='Add Policy Attribute'
                                        />
                                    </Button>
                                </Box>
                            </Grid>    
                        </Box>
                    )}
                    {isViewMode && policyAttributes.length === 0 && (
                        <Box component='div'>
                            <Grid item xs={12}>
                                <Box flex='1'>
                                    <Typography color='inherit' variant='body1' component='div'>
                                        <FormattedMessage
                                            id='Apis.Details.Policies.PolicyForm.PolicyAttributes.no.attributes.found'
                                            defaultMessage='Looks like this policy does not have any attributes'
                                        />
                                    </Typography>
                                </Box>
                            </Grid>    
                        </Box>
                    )}
                </Box>
            </Box>
            <Box component='div' m={3}>
                <Grid container spacing={2}>
                    {policyAttributes.map((attribute: PolicyAttribute) => (
                        <Grid item xs={12} key={attribute.name}>
                            <Box component='div' mt={1} mb={1}>
                                <Box display='flex' flexDirection='row' justifyContent='center' mb={1}>
                                    <Grid item xs={12} md={12} lg={3} className={classes.attributeProperty}>
                                        <TextField
                                            autoFocus
                                            fullWidth
                                            required
                                            name='name'
                                            label={
                                                <FormattedMessage
                                                    id={
                                                        'Apis.Details.Policies.PolicyForm.PolicyAttributes.' +
                                                        'form.name.label'
                                                    }
                                                    defaultMessage='Name'
                                                />                                     
                                            }
                                            error={getAttributeFormError(attribute, 'name') !== ''}
                                            margin='dense'
                                            value={attribute.name}
                                            data-testid='add-policy-attribute-name-btn'
                                            helperText={
                                                getAttributeFormError(
                                                    attribute,
                                                    'name',
                                                ) || (
                                                    <FormattedMessage
                                                        id={
                                                            'Apis.Details.Policies.PolicyForm.PolicyAttributes.' +
                                                            'form.name.helperText'
                                                        }
                                                        defaultMessage='Attribute Name'
                                                    />
                                                )
                                            }
                                            onChange={(e) => handleAttributeChange(e, attribute.id)}
                                            variant='outlined'
                                            inputProps={{
                                                readOnly: isViewMode,
                                                style: isViewMode ? {cursor: 'auto'} : {},
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={12} lg={3} className={classes.attributeProperty}>
                                        <TextField
                                            fullWidth
                                            required
                                            name='displayName'
                                            label={
                                                <FormattedMessage
                                                    id={
                                                        'Apis.Details.Policies.PolicyForm.PolicyAttributes.' +
                                                        'form.displayName.label'
                                                    }
                                                    defaultMessage='Display Name'
                                                />                                        
                                            }
                                            error={getAttributeFormError(attribute, 'displayName') !== ''}
                                            margin='dense'
                                            value={attribute.displayName}
                                            data-testid='add-policy-attribute-display-name-btn'
                                            helperText={
                                                getAttributeFormError(
                                                    attribute,
                                                    'displayName',
                                                ) || (
                                                    <FormattedMessage
                                                        id={
                                                            'Apis.Details.Policies.PolicyForm.PolicyAttributes.' +
                                                            'form.displayName.helperText'
                                                        }
                                                        defaultMessage='Attribute Display Name'
                                                    />
                                                )
                                            }
                                            onChange={(e) => handleAttributeChange(e, attribute.id)}
                                            variant='outlined'
                                            inputProps={{
                                                readOnly: isViewMode,
                                                style: isViewMode ? {cursor: 'auto'} : {},
                                            }}
                                        />
                                    </Grid>
                                    <Box m={1}>
                                        <ToggleButtonGroup>
                                            {/* Attribute required or not */}
                                            <Tooltip
                                                placement='top'
                                                title={
                                                    <FormattedMessage
                                                        id={
                                                            'Apis.Details.Policies.PolicyForm.PolicyAttributes.' +
                                                            'form.required.tooltip'
                                                        }
                                                        defaultMessage='Required'
                                                    />
                                                }
                                                arrow
                                            >
                                                <ToggleButton
                                                    name='required'
                                                    value='required'
                                                    id='attribute-require-btn'
                                                    selected={attribute.required}
                                                    className={classes.requiredToggleButton}
                                                    onChange={() => handleToggle(attribute.required, attribute.id)}
                                                    style={ isViewMode ? {cursor: 'auto'} : {}}
                                                >
                                                    <PriorityHighOutlined />
                                                </ToggleButton>
                                            </Tooltip>

                                            {/* Attribute description */}
                                            <Tooltip
                                                placement='top'
                                                title={
                                                    <FormattedMessage
                                                        id={
                                                            'Apis.Details.Policies.PolicyForm.PolicyAttributes.' +
                                                            'form.description.tooltip'
                                                        }
                                                        defaultMessage='Description'
                                                    />
                                                }
                                                arrow
                                            >
                                                <ToggleButton
                                                    value='description'
                                                    className={classes.toggleButton}
                                                    onChange={(e) => handleDescriptionToggle(e, attribute.id)}
                                                >
                                                    <SubjectOutlinedIcon />
                                                </ToggleButton>
                                            </Tooltip>
                                            <Popover
                                                id={attribute.id}
                                                open={openedDescriptionPopoverId === attribute.id}
                                                anchorEl={descriptionAnchorEl}
                                                onClose={handleDescriptionClose}
                                                anchorOrigin={{
                                                    vertical: 'bottom',
                                                    horizontal: 'left',
                                                }}
                                            >
                                                <Box m={2}>
                                                    <TextField
                                                        fullWidth
                                                        name='description'
                                                        multiline
                                                        maxRows={4}
                                                        rows={4}
                                                        label={
                                                            <FormattedMessage
                                                                id={
                                                                    'Apis.Details.Policies.PolicyForm.' +
                                                                    'PolicyAttributes.form.description.label'
                                                                }
                                                                defaultMessage='Description'
                                                            />                                        
                                                        }
                                                        error={getAttributeFormError(attribute, 'description') !== ''}
                                                        margin='dense'
                                                        value={attribute.description}
                                                        helperText={
                                                            getAttributeFormError(
                                                                attribute,
                                                                'description',
                                                            ) || (
                                                                <FormattedMessage
                                                                    id={
                                                                        'Apis.Details.Policies.PolicyForm.' +
                                                                        'PolicyAttributes.form.description.helperText'
                                                                    }
                                                                    defaultMessage={
                                                                        'Short description about ' +
                                                                        'the policy attribute'
                                                                    }
                                                                />
                                                            )
                                                        }
                                                        onChange={(e) => handleAttributeChange(e, attribute.id)}
                                                        variant='outlined'
                                                        inputProps={{
                                                            readOnly: isViewMode,
                                                            style: isViewMode ? {cursor: 'auto'} : {},
                                                        }}
                                                    />
                                                </Box>
                                            </Popover>

                                            {/* Attribute values */}
                                            <Tooltip
                                                placement='top'
                                                title={
                                                    <FormattedMessage
                                                        id={
                                                            'Apis.Details.Policies.PolicyForm.PolicyAttributes.' +
                                                            'form.value.properties.tooltip'
                                                        }
                                                        defaultMessage='Value Properties'
                                                    />
                                                }
                                                arrow
                                            >
                                                <ToggleButton
                                                    value='attribute-values'
                                                    className={classes.toggleButton}
                                                    onChange={(e) => handleValuePropertiesToggle(e, attribute.id)}
                                                >
                                                    <FormatListBulletedOutlinedIcon />
                                                </ToggleButton>
                                            </Tooltip>
                                            <Popover
                                                id={attribute.id}
                                                open={openedValuesPopoverId === attribute.id}
                                                anchorEl={valuePropertiesAnchorEl}
                                                onClose={handleValuePropertiesClose}
                                                anchorOrigin={{
                                                    vertical: 'bottom',
                                                    horizontal: 'left',
                                                }}
                                            >
                                                <Box m={2}>
                                                    <Box m={2}>
                                                        <Typography color='inherit' variant='subtitle2' component='div'>
                                                            <FormattedMessage
                                                                id={
                                                                    'Apis.Details.Policies.PolicyForm.' +
                                                                    'PolicyAttributes.form.value.properties.' +
                                                                    'popover.title'
                                                                }
                                                                defaultMessage='Value Properties'
                                                            />
                                                        </Typography>
                                                    </Box>
                                                    <Box width={280} m={2}>

                                                        {/* Type */}
                                                        <FormControl
                                                            variant='outlined'
                                                            className={classes.formControlSelect}
                                                        >
                                                            <InputLabel id='type-dropdown-label'>Type</InputLabel>
                                                            <Select
                                                                native
                                                                name='type'
                                                                value={attribute.type}
                                                                label={
                                                                    <FormattedMessage
                                                                        id={
                                                                            'Apis.Details.Policies.PolicyForm.' +
                                                                            'PolicyAttributes.form.type.label'
                                                                        }
                                                                        defaultMessage='Type'
                                                                    />
                                                                }
                                                                onChange={(e) => handleAttributeChange(e, attribute.id)}
                                                                classes={{ root: classes.selectRoot }}
                                                                inputProps={{
                                                                    readOnly: isViewMode,
                                                                    style: isViewMode ? {cursor: 'auto'} : {},
                                                                }}
                                                            >
                                                                <option value='String'>String</option>
                                                                <option value='Integer'>Integer</option>
                                                                <option value='Boolean'>Boolean</option>
                                                                <option value='Enum'>Enum</option>
                                                            </Select>
                                                            <FormHelperText>Attribute Type</FormHelperText>
                                                        </FormControl>

                                                        {/* Allowed Values */}
                                                        {attribute.type.toLowerCase() === 'enum' && (
                                                            <Box mt={1}>
                                                                <TextField
                                                                    fullWidth
                                                                    required
                                                                    name='allowedValues'
                                                                    label={
                                                                        <FormattedMessage
                                                                            id={
                                                                                'Apis.Details.Policies.PolicyForm.' +
                                                                                'PolicyAttributes.form.allowed.values' +
                                                                                '.label'
                                                                            }
                                                                            defaultMessage='Allowed Values'
                                                                        />
                                                                    }
                                                                    margin='dense'
                                                                    variant='outlined'
                                                                    value={attribute.allowedValues}
                                                                    helperText={
                                                                        <FormattedMessage
                                                                            id={
                                                                                'Apis.Details.Policies.PolicyForm.' +
                                                                                'PolicyAttributes.form.allowed.values' +
                                                                                '.helperText'
                                                                            }
                                                                            defaultMessage={
                                                                                'Comma separated list of ' +
                                                                                'allowed values for Enum attribute'
                                                                            }
                                                                        />
                                                                    }
                                                                    onChange={
                                                                        (e) => handleAllowedValues(e, attribute.id)
                                                                    }
                                                                    inputProps={{
                                                                        readOnly: isViewMode,
                                                                        style: isViewMode ? {cursor: 'auto'} : {},
                                                                    }}
                                                                />
                                                            </Box>
                                                        )}

                                                        {/* Validation Regex */}
                                                        <Box mt={1}>
                                                            <TextField
                                                                fullWidth
                                                                name='validationRegex'
                                                                label={
                                                                    <FormattedMessage
                                                                        id={
                                                                            'Apis.Details.Policies.PolicyForm.' +
                                                                            'PolicyAttributes.form.validation.regex.' +
                                                                            'label'
                                                                        }
                                                                        defaultMessage='Validation Regex'
                                                                    />                                        
                                                                }
                                                                error={
                                                                    getAttributeFormError(
                                                                        attribute,
                                                                        'validationRegex',
                                                                    ) !== ''
                                                                }
                                                                margin='dense'
                                                                value={attribute.validationRegex}
                                                                helperText={
                                                                    getAttributeFormError(
                                                                        attribute,
                                                                        'validationRegex',
                                                                    ) || (
                                                                        <FormattedMessage
                                                                            id={
                                                                                'Apis.Details.Policies.PolicyForm.' +
                                                                                'PolicyAttributes.form.validation.' +
                                                                                'regex.helperText'
                                                                            }
                                                                            defaultMessage={
                                                                                'Regex for attribute ' +
                                                                                'validation ( E.g.: ^([a-zA-Z]+)$ )'
                                                                            }
                                                                        />
                                                                    )
                                                                }
                                                                onChange={(e) => handleAttributeChange(e, attribute.id)}
                                                                variant='outlined'
                                                                inputProps={{
                                                                    readOnly: isViewMode,
                                                                    style: isViewMode ? {cursor: 'auto'} : {},
                                                                }}
                                                            />
                                                        </Box>

                                                        {/* Default Value */}
                                                        <Box mt={1}>
                                                            <TextField
                                                                fullWidth
                                                                name='defaultValue'
                                                                label={
                                                                    <FormattedMessage
                                                                        id={
                                                                            'Apis.Details.Policies.PolicyForm.' +
                                                                            'PolicyAttributes.form.default.value.' +
                                                                            'label'
                                                                        }
                                                                        defaultMessage='Default Value'
                                                                    />                                        
                                                                }
                                                                error={
                                                                    getAttributeFormError(
                                                                        attribute,
                                                                        'defaultValue'
                                                                    ) !== ''
                                                                }
                                                                margin='dense'
                                                                value={attribute.defaultValue}
                                                                helperText={
                                                                    getAttributeFormError(
                                                                        attribute,
                                                                        'defaultValue',
                                                                    ) || (
                                                                        <FormattedMessage
                                                                            id={
                                                                                'Apis.Details.Policies.PolicyForm.' +
                                                                                'PolicyAttributes.form.default.value.' +
                                                                                'helperText'
                                                                            }
                                                                            defaultMessage={
                                                                                'Default value for ' +
                                                                                'the attribute (if any)'
                                                                            }
                                                                        />
                                                                    )
                                                                }
                                                                onChange={(e) => handleAttributeChange(e, attribute.id)}
                                                                variant='outlined'
                                                                inputProps={{
                                                                    readOnly: isViewMode,
                                                                    style: isViewMode ? {cursor: 'auto'} : {},
                                                                }}
                                                            />
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </Popover>

                                            {/* Attribute delete */}
                                            <Tooltip
                                                placement='top'
                                                title={
                                                    <FormattedMessage
                                                        id={
                                                            'Apis.Details.Policies.PolicyForm.PolicyAttributes.' +
                                                            'form.delete.tooltip'
                                                        }
                                                        defaultMessage='Delete'
                                                    />
                                                }
                                                arrow
                                            >
                                                <ToggleButton
                                                    value='delete'
                                                    className={classes.toggleButton}
                                                    onClick={() =>
                                                        dispatch && dispatch({
                                                            type: ACTIONS.DELETE_POLICY_ATTRIBUTE,
                                                            id: attribute.id,
                                                        })
                                                    }
                                                    style={ isViewMode ? {cursor: 'auto'} : {}}
                                                >
                                                    <DeleteIcon />
                                                </ToggleButton>
                                            </Tooltip>
                                        </ToggleButtonGroup>
                                    </Box>
                                </Box>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </>
    );
}

export default React.memo(PolicyAttributes);
