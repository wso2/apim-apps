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
import { makeStyles, Theme } from '@material-ui/core';
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
import { FormattedMessage } from 'react-intl';
import Tooltip from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/Delete';
import classNames from 'classnames';
import { PolicyAttribute } from './Types';
import { ACTIONS } from './CreateForm';

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
}));

interface PolicyAttributesProps {
    policyAttributes: PolicyAttribute[];
    dispatch: React.Dispatch<any>
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
    console.log(policyAttributes)

    // const handleAttributeDelete = (event: any) => {
    //     const policyAttributesCopy = [...policyAttributes]; // Local copy of current attribute list
    //     const { id } = event.currentTarget;
    //     policyAttributesCopy.splice(id, 1);
    //     setPolicyAttributes(policyAttributesCopy);
    // };

    return (
        <Box component='div' m={3}>
            <Grid container spacing={2}>
                {policyAttributes.map((attribute: PolicyAttribute) => (
                    <Grid item xs={12} key={attribute.name}>
                        <Box component='div' m={1}>
                            <Box display='flex' flexDirection='row'>
                                <Grid item xs={12} md={12} lg={3} className={classes.attributeProperty}>
                                    <TextField
                                        fullWidth
                                        required
                                        id={attribute.name}
                                        name='name'
                                        label={
                                            <FormattedMessage
                                                id={'Policies.PolicyCreateForm.add.policy.attributes.add.'
                                                + 'property.name'}
                                                defaultMessage= 'Name'
                                            />                                        
                                        }
                                        margin='dense'
                                        variant='outlined'
                                        value={attribute.name}
                                        helperText='Attribute Name'
                                        // onChange={handleAttributeChange}
                                    />
                                </Grid>
                                <Grid item xs={12} md={12} lg={3} className={classes.attributeProperty}>
                                    <TextField
                                        fullWidth
                                        required
                                        id={attribute.name}
                                        name='displayName'
                                        label={
                                            <FormattedMessage
                                                id={'Policies.PolicyCreateForm.add.policy.attributes.add.'
                                                + 'property.displayName'}
                                                defaultMessage= 'Display Name'
                                            />                                        
                                        }
                                        margin='dense'
                                        value={attribute.displayName}
                                        helperText='Attribute Display Name'
                                        // onChange={handleAttributeChange}
                                        variant='outlined'
                                    />
                                </Grid>
                                <Grid item xs={12} md={12} lg={6} className={classes.attributeProperty}>
                                    <TextField
                                        fullWidth
                                        id={attribute.name}
                                        name='description'
                                        label={
                                            <FormattedMessage
                                                id={'Policies.PolicyCreateForm.add.policy.attributes.add.'
                                        + 'property.description'}
                                                defaultMessage= 'Description'
                                            />                                        
                                        }
                                        margin='dense'
                                        value={attribute.description}
                                        helperText='Short description about the policy attribute'
                                        // onChange={handleAttributeChange}
                                        variant='outlined'
                                    />
                                </Grid>
                            </Box>
                            <Box display='flex' flexDirection='row'>
                                <Grid xs={12} md={12} lg={4} className={classes.attributeProperty}>
                                    <TextField
                                        fullWidth
                                        id={attribute.name}
                                        name='validationRegex'
                                        label={
                                            <FormattedMessage
                                                id={'Policies.PolicyCreateForm.add.policy.attributes.add.'
                                                + 'property.validationRegex'}
                                                defaultMessage= 'Validation Regex'
                                            />                                        
                                        }
                                        margin='dense'
                                        value={attribute.validationRegex}
                                        helperText='Regex for attribute validation ( E.g.: ^([a-zA-Z]+)$ )'
                                        // onChange={handleAttributeChange}
                                        variant='outlined'
                                    />
                                </Grid>
                                <Grid xs={12} md={12} lg={4} className={classes.attributeProperty}>
                                    <TextField
                                        fullWidth
                                        id={attribute.name}
                                        name='defaultValue'
                                        label={
                                            <FormattedMessage
                                                id={'Policies.PolicyCreateForm.add.policy.attributes.add.'
                                                + 'property.defaultValue'}
                                                defaultMessage= 'Default Value'
                                            />                                        
                                        }
                                        margin='dense'
                                        value={attribute.defaultValue}
                                        helperText='Default value for the attribute (if any)'
                                        // onChange={handleAttributeChange}
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
                                                    id={'Policies.PolicyCreateForm.add.policy.attributes.add.'
                                                        + 'property.required'}
                                                    defaultMessage='Required'
                                                />
                                            </Typography>
                                        </Box>
                                        <Box flex='1'>
                                            <Switch
                                                checked={attribute.required}
                                                // onChange={onToggle}
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
                                        // error={getError(spec) !== ''}
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
                                                    id={'Policies.PolicyCreateForm.add.policy.attributes.add.'
                                                    + 'property.type'}
                                                    defaultMessage= 'Type'
                                                />
                                            }
                                            // onChange={onChange}
                                            classes={{ root: classes.selectRoot }}
                                        >
                                            <option value='String'>String</option>
                                            <option value='Integer'>Integer</option>
                                            <option value='Boolean'>Boolean</option>
                                            <option value='Enum'>Enum</option>
                                            <option value='Map'>Map</option>
                                        </Select>
                                        <FormHelperText>Attribute Type</FormHelperText>
                                    </FormControl>
                                </Grid>
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
                                                id={'Policies.PolicyCreateForm.add.policy.attributes.add.'
                                                + 'property.allowedValues'}
                                                defaultMessage= 'Allowed Values'
                                            />
                                        }
                                        margin='dense'
                                        variant='outlined'
                                        value={attribute.allowedValues}
                                        helperText='Comma separated list of allowed values for the Enum attribute'
                                        // onChange={handleAttributeChange}
                                    />
                                </Grid>
                            </Box>
                            <Box display='flex' flexDirection='row'>
                                <Grid xs={12} md={12} lg={4}>
                                    <Tooltip
                                        title={(
                                            <FormattedMessage
                                                id='Policies.PolicyCreateForm.attribute.delete.tooltip'
                                                defaultMessage='Delete Attribute'
                                            />
                                        )}
                                        placement='right'
                                        interactive
                                    >
                                        <IconButton
                                            key={'delete' + attribute.name}
                                            onClick={() =>
                                                dispatch({
                                                    type: ACTIONS.DELETE_POLICY_ATTRIBUTE,
                                                    payload: { id: attribute.id },
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
    );
}

export default PolicyAttributes;
