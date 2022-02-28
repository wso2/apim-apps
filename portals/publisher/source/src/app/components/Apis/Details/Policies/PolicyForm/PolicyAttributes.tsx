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

import React, { FC, } from 'react';
import { Button, makeStyles, Theme } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Switch from '@material-ui/core/Switch';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import { FormattedMessage, useIntl } from 'react-intl';
import Tooltip from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/Delete';
import classNames from 'classnames';
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
    allowedValuesPropery: {
        marginTop: theme.spacing(1),
    },
    buttonIcon: {
        marginRight: theme.spacing(1),
    },
}));

interface PolicyAttributesProps {
    policyAttributes: PolicyAttribute[];
    dispatch?: React.Dispatch<any>
}

/**
 * Handles the addition of policy attributes for a given policy.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} Policy attributes UI.
 */
const PolicyAttributes: FC<PolicyAttributesProps> = ({
    policyAttributes, dispatch
}) => {
    const classes = useStyles();
    const intl = useIntl();

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
                            id: 'Apis.Details.Policies.PolicyForm.PolicyAttributes.validationRegex.invalid',
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
     * Function to handle switch toggle
     * @param {React.ChangeEvent<HTMLInputElement>} event Event
     * @param {string} id Policy Attribute ID
     */
    const handleToggle = (event: React.ChangeEvent<HTMLInputElement>, id: string) => {
        if (dispatch) {
            dispatch({
                type: ACTIONS.UPDATE_POLICY_ATTRIBUTE,
                id,
                field: event.target.name,
                value: event.target.checked
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

    return (
        <>
            <Box display='flex' flexDirection='row' mt={1} pt={3}>
                <Box width='40%'>
                    <Typography color='inherit' variant='subtitle2' component='div'>
                        <FormattedMessage
                            id='Policies.PolicyPolicyForm.add.policy.attributes.title'
                            defaultMessage='Policy Attributes'
                        />
                    </Typography>
                    <Typography color='inherit' variant='caption' component='p'>
                        <FormattedMessage
                            id='Policies.PolicyPolicyForm.add.policy.attributes.description'
                            defaultMessage='Define attributes of the policy.'
                        />
                    </Typography>
                </Box>
                <Box width='60%'>
                    <Box component='div'>
                        <Grid item xs={12}>
                            <Box flex='1'>
                                <Button
                                    color='primary'
                                    variant='outlined'
                                    onClick={addNewPolicyAttribute}
                                >
                                    <AddCircle className={classes.buttonIcon} />
                                    <FormattedMessage
                                        id='Policies.PolicyPolicyForm.add.policy.attributes.add'
                                        defaultMessage='Add Policy Attribute'
                                    />
                                </Button>
                            </Box>
                        </Grid>    
                    </Box>                           
                </Box>
            </Box>
            <Box component='div' m={3}>
                <Grid container spacing={2}>
                    {policyAttributes.map((attribute: PolicyAttribute) => (
                        <Grid item xs={12} key={attribute.name}>
                            <Box component='div' m={1}>
                                <Box display='flex' flexDirection='row'>
                                    <Grid item xs={12} md={12} lg={3} className={classes.attributeProperty}>
                                        <TextField
                                            autoFocus
                                            fullWidth
                                            required
                                            id={'name-' + attribute.name}
                                            name='name'
                                            key='name'
                                            label={
                                                <FormattedMessage
                                                    id={'Policies.PolicyForm.add.policy.attributes.add.'
                                                        + 'property.name'}
                                                    defaultMessage='Name'
                                                />                                        
                                            }
                                            error={getAttributeFormError(attribute, 'name') !== ''}
                                            margin='dense'
                                            value={attribute.name}
                                            helperText={
                                                getAttributeFormError(
                                                    attribute,
                                                    'name',
                                                ) || (
                                                    <FormattedMessage
                                                        id={'Apis.Details.Policies.PolicyForm.'
                                                            + 'PolicyAttributes.name'}
                                                        defaultMessage='Attribute Name'
                                                    />
                                                )
                                            }
                                            onChange={(e) => handleAttributeChange(e, attribute.id)}
                                            variant='outlined'
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={12} lg={3} className={classes.attributeProperty}>
                                        <TextField
                                            fullWidth
                                            required
                                            id={'displayName-' + attribute.name}
                                            name='displayName'
                                            key='displayName'
                                            label={
                                                <FormattedMessage
                                                    id={'Policies.PolicyForm.add.policy.attributes.add.'
                                                        + 'property.displayName'}
                                                    defaultMessage='Display Name'
                                                />                                        
                                            }
                                            error={getAttributeFormError(attribute, 'displayName') !== ''}
                                            margin='dense'
                                            value={attribute.displayName}
                                            helperText={
                                                getAttributeFormError(
                                                    attribute,
                                                    'displayName',
                                                ) || (
                                                    <FormattedMessage
                                                        id={'Apis.Details.Policies.PolicyForm.'
                                                            + 'PolicyAttributes.displayName'}
                                                        defaultMessage='Attribute Display Name'
                                                    />
                                                )
                                            }
                                            onChange={(e) => handleAttributeChange(e, attribute.id)}
                                            variant='outlined'
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={12} lg={6} className={classes.attributeProperty}>
                                        <TextField
                                            fullWidth
                                            id={'description-' + attribute.name}
                                            name='description'
                                            key='description'
                                            label={
                                                <FormattedMessage
                                                    id={'Policies.PolicyForm.add.policy.attributes.add.'
                                                        + 'property.description'}
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
                                                        id={'Apis.Details.Policies.PolicyForm.'
                                                            + 'PolicyAttributes.description'}
                                                        defaultMessage='Short description about the policy attribute'
                                                    />
                                                )
                                            }
                                            onChange={(e) => handleAttributeChange(e, attribute.id)}
                                            variant='outlined'
                                        />
                                    </Grid>
                                </Box>
                                <Box display='flex' flexDirection='row'>
                                    <Grid xs={12} md={12} lg={4} className={classes.attributeProperty}>
                                        <TextField
                                            fullWidth
                                            id={'validationRegex-' + attribute.name}
                                            name='validationRegex'
                                            key='validationRegex'
                                            label={
                                                <FormattedMessage
                                                    id={'Policies.PolicyForm.add.policy.attributes.add.'
                                                        + 'property.validationRegex'}
                                                    defaultMessage='Validation Regex'
                                                />                                        
                                            }
                                            error={getAttributeFormError(attribute, 'validationRegex') !== ''}
                                            margin='dense'
                                            value={attribute.validationRegex}
                                            helperText={
                                                getAttributeFormError(
                                                    attribute,
                                                    'validationRegex',
                                                ) || (
                                                    <FormattedMessage
                                                        id={'Apis.Details.Policies.PolicyForm.'
                                                            + 'PolicyAttributes.validationRegex'}
                                                        defaultMessage={'Regex for attribute validation '
                                                            + '( E.g.: ^([a-zA-Z]+)$ )'}
                                                    />
                                                )
                                            }
                                            onChange={(e) => handleAttributeChange(e, attribute.id)}
                                            variant='outlined'
                                        />
                                    </Grid>
                                    <Grid xs={12} md={12} lg={4} className={classes.attributeProperty}>
                                        <TextField
                                            fullWidth
                                            id={'defaultValue-' + attribute.name}
                                            name='defaultValue'
                                            key='defaultValue'
                                            label={
                                                <FormattedMessage
                                                    id={'Policies.PolicyForm.add.policy.attributes.add.'
                                                        + 'property.defaultValue'}
                                                    defaultMessage='Default Value'
                                                />                                        
                                            }
                                            error={getAttributeFormError(attribute, 'defaultValue') !== ''}
                                            margin='dense'
                                            value={attribute.defaultValue}
                                            helperText={
                                                getAttributeFormError(
                                                    attribute,
                                                    'defaultValue',
                                                ) || (
                                                    <FormattedMessage
                                                        id={'Apis.Details.Policies.PolicyForm.'
                                                            + 'PolicyAttributes.defaultValue'}
                                                        defaultMessage='Default value for the attribute (if any)'
                                                    />
                                                )
                                            }
                                            onChange={(e) => handleAttributeChange(e, attribute.id)}
                                            variant='outlined'
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={12} lg={4} className={classes.attributeProperty}>
                                        <Box
                                            display='flex'
                                            flexDirection='row'
                                            alignItems='center'
                                        >
                                            <Box flex='0.65' pl={2} pt={1}>
                                                <Typography color='inherit' variant='body1' component='div'>
                                                    <FormattedMessage
                                                        id={'Policies.PolicyForm.add.policy.attributes.add.'
                                                            + 'property.required'}
                                                        defaultMessage='Required'
                                                    />
                                                </Typography>
                                            </Box>
                                            <Box flex='1'>
                                                <Switch
                                                    checked={attribute.required}
                                                    onChange={(e) => handleToggle(e, attribute.id)}
                                                    size='medium'
                                                    color='primary'
                                                    name='required'
                                                />
                                            </Box>
                                        </Box>
                                    </Grid>
                                </Box>
                                <Box display='flex' flexDirection='row'>
                                    <Grid xs={12} md={12} lg={4} className={classes.attributeProperty}>
                                        <FormControl
                                            variant='outlined'
                                            className={classes.formControlSelect}
                                            fullWidth
                                        >
                                            <InputLabel id='type-dropdown-label'>Type</InputLabel>
                                            <Select
                                                native
                                                name='type'
                                                fullWidth
                                                value={attribute.type}
                                                label={
                                                    <FormattedMessage
                                                        id={'Policies.PolicyForm.add.policy.attributes.add.'
                                                            + 'property.type'}
                                                        defaultMessage='Type'
                                                    />
                                                }
                                                onChange={(e) => handleAttributeChange(e, attribute.id)}
                                                classes={{ root: classes.selectRoot }}
                                            >
                                                <option value='String'>String</option>
                                                <option value='Integer'>Integer</option>
                                                <option value='Boolean'>Boolean</option>
                                                <option value='Enum'>Enum</option>
                                            </Select>
                                            <FormHelperText>Attribute Type</FormHelperText>
                                        </FormControl>
                                    </Grid>
                                    {attribute.type.toLowerCase() === 'enum' && (
                                        <Grid
                                            item xs={12}
                                            md={12}
                                            lg={8}
                                            className={classNames({
                                                [classes.attributeProperty]: true,
                                                [classes.allowedValuesPropery]: true
                                            })}
                                        >
                                            <TextField
                                                fullWidth
                                                required
                                                id={attribute.name}
                                                name='allowedValues'
                                                label={
                                                    <FormattedMessage
                                                        id={'Policies.PolicyForm.PolicyAttributes.property.'
                                                            + 'allowedValues'}
                                                        defaultMessage='Allowed Values'
                                                    />
                                                }
                                                margin='dense'
                                                variant='outlined'
                                                value={attribute.allowedValues}
                                                helperText={
                                                    <FormattedMessage
                                                        id={'Policies.PolicyForm.PolicyAttributes.helperText.'
                                                            + 'allowedValues'}
                                                        defaultMessage={'Comma separated list of allowed '
                                                            + 'values for the Enum attribute'}
                                                    />
                                                }
                                                onChange={(e) => handleAllowedValues(e, attribute.id)}
                                            />
                                        </Grid>
                                    )}
                                </Box>
                                <Box display='flex' flexDirection='row'>
                                    <Grid xs={12} md={12} lg={4}>
                                        <Tooltip
                                            title={(
                                                <FormattedMessage
                                                    id='Policies.PolicyForm.attribute.delete.tooltip'
                                                    defaultMessage='Delete Attribute'
                                                />
                                            )}
                                            placement='right'
                                            interactive
                                        >
                                            <IconButton
                                                key={'delete' + attribute.name}
                                                onClick={() =>
                                                    dispatch && dispatch({
                                                        type: ACTIONS.DELETE_POLICY_ATTRIBUTE,
                                                        id: attribute.id,
                                                    })
                                                }
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Grid>
                                </Box>
                                <Divider light />
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </>
    );
}

export default PolicyAttributes;
