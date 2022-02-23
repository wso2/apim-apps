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

import React, { FC, useState } from 'react';
import { Box, List, makeStyles, IconButton, Theme, RadioGroup, FormControlLabel, FormGroup, FormLabel, Checkbox } from '@material-ui/core';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage, injectIntl, useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import InsertDriveFile from '@material-ui/icons/InsertDriveFile';
import DeleteIcon from '@material-ui/icons/Delete';
import Dropzone from 'react-dropzone';
import classNames from 'classnames';
import green from '@material-ui/core/colors/green';
import red from '@material-ui/core/colors/red';
import Error from '@material-ui/icons/Error';
import InputAdornment from '@material-ui/core/InputAdornment';
import Chip from '@material-ui/core/Chip';
import Icon from '@material-ui/core/Icon';
import CircularProgress from '@material-ui/core/CircularProgress';
import Alert from 'AppComponents/Shared/Alert';
import Api from 'AppData/api';
import { isRestricted } from 'AppData/AuthManager';
import type { CreatePolicySpec } from '../Types';

const useStyles = makeStyles((theme: Theme) => ({
    // root: {
    //     flexGrow: 1,
    //     marginTop: 10,
    //     display: 'flex',
    //     flexDirection: 'column',
    //     paddingLeft: 20,
    //     paddingRight: 20,
    // },
    root: {
        flexGrow: 1,
        marginTop: 10,
        display: 'flex',
        flexDirection: 'column',
        padding: 20,
    },
    mandatoryStar: {
        color: theme.palette.error.main,
        marginLeft: theme.spacing(0.1),
    },
    dropZoneWrapper: {
        border: '1px dashed ' + theme.palette.primary.main,
        borderRadius: '5px',
        cursor: 'pointer',
        padding: `${theme.spacing(2)}px ${theme.spacing(2)}px`,
        position: 'relative',
        textAlign: 'center',
        width: '75%',
        margin: '10px 0',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        '& span': {
            fontSize: 64,
            color: theme.palette.primary.main,
        },
    },
    acceptDrop: {
        backgroundColor: green[50],
        borderColor: 'green',
    },
    rejectDrop: {
        backgroundColor: red[50],
        borderColor: 'red',
    },
    uploadedFileDetails: {
        marginTop: '2em',
        width: '50%',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'row',
    },
}));

// /**
//  * 
//  * @param state 
//  * @param newValue 
//  */
// const reducer = (state, action) => {
//     const {field, value} = newValue;
//     switch (field) {
//         case 'name':
//         case 'displayName':
//         case 'description':
//         case 'applicableFlows':
//         case 'supportedGateways':
//         case 'policyAttributes':
//         default:
//             return state;
//     }
// }

interface CreateFormProps {
    onSave: () => void;
    policyDefinitionFile: any[];
    setPolicyDefinitionFile: React.Dispatch<React.SetStateAction<any[]>>;
    policySpec: CreatePolicySpec;
    setPolicySpec: React.Dispatch<React.SetStateAction<CreatePolicySpec | null>>;
}

/**
 * Renders the policy configuring drawer.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} Right drawer for policy configuration.
 */
const CreateForm: FC<CreateFormProps> = ({
    onSave, policyDefinitionFile, setPolicyDefinitionFile, policySpec, setPolicySpec
}) => {
    const intl = useIntl();
    const classes = useStyles();
    const [saving, setSaving] = useState(false);
    const initState: any = {
        name: null,
        displayName: null,
        description: null,
        applicableFlows: null,
        supportedGateways: null,
        policyAttributes: null,       
    };
    const [state, setState] = useState(initState);

    const handleDrop = (policyDefinition: any) => {
        setPolicyDefinitionFile(policyDefinition);
    };

    const onInputChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        // setPolicySpec({ ...policySpec, [event.target.name]: event.target.value });
    }

    const renderPolicyFileDropzone = () => {
        return (
            <Dropzone
                multiple={false}
                // accept='.j2' 
                onDrop={handleDrop}
            >
                {({
                    getRootProps,
                    getInputProps,
                    isDragAccept,
                    isDragReject,
                }) => {
                    return (
                        <div {...getRootProps({})}>
                            <div className={classNames(
                                classes.dropZoneWrapper,
                                isDragAccept ? classes.acceptDrop : null,
                                isDragReject ? classes.rejectDrop : null,
                            )}
                            >
                                <input {...getInputProps()} />
                                <Icon>cloud_upload</Icon>
                                <Typography>
                                    <FormattedMessage
                                        id='Policies.CreatePolicy.upload.policy.definition'
                                        defaultMessage='Click or drag the policy definition file to upload'
                                    />
                                </Typography>
                            </div>
                        </div>
                    );
                }}
            </Dropzone>
        );
    };

    return (
        <>
            <Paper elevation={0} className={classes.root}>
                <FormControl margin='normal'>
                    <TextField
                        id='name'
                        name='displayName'
                        label={(
                            <>
                                <FormattedMessage
                                    id='Apis.Details.Policies.PolicyCreateForm.field.name'
                                    defaultMessage='Name'
                                />
                                <sup className={classes.mandatoryStar}>*</sup>
                            </>
                        )}
                        placeholder='Policy Name'
                        // error={this.state.valid.name.invalid}
                        helperText={
                            // this.state.valid.name.invalid ? (
                            //     this.state.valid.name.error
                            // ) : (
                            <FormattedMessage
                                id='Apis.Details.Policies.PolicyCreateForm.short.description.name'
                                defaultMessage='Enter Policy Name ( E.g.,: Add Header )'
                            />
                            // )
                        }
                        fullWidth
                        margin='normal'
                        variant='outlined'
                        value={policySpec.displayName || ''}
                        onChange={onInputChange}
                    />
                    <TextField
                        id='name'
                        name='description'
                        label={(
                            <>
                                <FormattedMessage
                                    id='Apis.Details.Policies.PolicyCreateForm.field.description'
                                    defaultMessage='Description'
                                />
                            </>
                        )}
                        placeholder='Description'
                        // error={this.state.valid.name.invalid}
                        helperText={
                            // this.state.valid.name.invalid ? (
                            //     this.state.valid.name.error
                            // ) : (
                            <FormattedMessage
                                id='Apis.Details.Policies.PolicyCreateForm.short.description.description'
                                defaultMessage='Description of the policy'
                            />
                            // )
                        }
                        fullWidth
                        margin='normal'
                        variant='outlined'
                        value={policySpec.displayName || ''}
                        onChange={onInputChange}
                    />
                </FormControl>
                <FormControl required component='fieldset' variant='standard' margin='normal'>
                    <FormLabel component='legend'>Applicable Flows</FormLabel>
                    <FormGroup className={classes.formGroup}>
                        <FormControlLabel
                            control={
                                <Checkbox name='request' />
                            }
                            label='Request'
                        />
                        <FormControlLabel
                            control={
                                <Checkbox name='response' />
                            }
                            label='Response'
                        />
                        <FormControlLabel
                            control={
                                <Checkbox name='fault' />
                            }
                            label='Fault'
                        />
                    </FormGroup>
                </FormControl>
                <FormControl required component='fieldset' variant='standard' margin='normal'>
                    <FormLabel component='legend'>Supported Gateways</FormLabel>
                    <FormGroup className={classes.formGroup}>
                        <FormControlLabel
                            control={
                                <Checkbox name='regularGateway' />
                            }
                            label='Regular Gateway'
                        />
                        <FormControlLabel
                            control={
                                <Checkbox disabled name='choreoConnect' />
                            }
                            label='Choreo Connect'
                        />
                    </FormGroup>
                </FormControl>
            </Paper>
            {/* <Paper elevation={0} className={classes.root}>
                <Stepper activeStep={activeStep} orientation='vertical'>
                    {steps.map((step, index) => (
                        <Step key={step.label}>
                            <StepLabel>{step.label}</StepLabel>
                            <StepContent>
                                {step.description && (
                                    <Typography variant='overline'>{step.description}</Typography>
                                )}
                                {index === 0 && (
                                    (policyDefinitionFile.length === 0) ? (
                                        renderPolicyFileDropzone()
                                    ) : (
                                        <List className={classes.uploadedFileDetails}>
                                            <ListItem key={policyDefinitionFile[0].path}>
                                                <ListItemAvatar>
                                                    <Avatar>
                                                        <InsertDriveFile />
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={`${policyDefinitionFile[0].path}`}
                                                />
                                                <ListItemSecondaryAction>
                                                    <IconButton
                                                        edge='end'
                                                        aria-label='delete'
                                                        onClick={() => setPolicyDefinitionFile([])}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                        </List>
                                    )
                                )}
                                {(index === 1) && (
                                    <PolicySpecificationEditor
                                        isReadOnly={false}
                                        policySpec={policySpec}
                                        setPolicySpec={setPolicySpec}
                                    />
                                )}
                                <Box mt={2}>
                                    <Button
                                        variant='contained'
                                        color='primary'
                                        onClick={handleNext}
                                        disabled={
                                            (index === 0 && policyDefinitionFile.length === 0)
                                        }
                                    >
                                        {index === steps.length - 1 ? 'Save' : 'Continue'}
                                    </Button>
                                    <Button
                                        color='primary'
                                        onClick={(index === 0 ? handleNext : handleBack)}
                                    >
                                        {(index === 0 ? 'Skip' : 'Back')}
                                    </Button>
                                </Box>
                            </StepContent>
                        </Step>
                    ))}
                </Stepper>
            </Paper> */}
        </>
    );
}

export default CreateForm;
