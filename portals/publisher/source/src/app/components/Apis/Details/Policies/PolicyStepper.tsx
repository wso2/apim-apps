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
import { Box, List, makeStyles, IconButton, Typography, Icon } from '@material-ui/core';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
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
import { FormattedMessage } from 'react-intl';
import PolicyDefinitionEditor from './PolicySpecificationEditor';
import type { PolicySpec } from './Types';

const useStyles = makeStyles((theme: any) => ({
    root: {
        flexGrow: 1,
        marginTop: 10,
        display: 'flex',
        flexDirection: 'column',
        paddingLeft: 20,
        paddingRight: 20,
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
}));

interface PolicyStepperProps {
    isAPI: boolean;
    onSave: () => void;
    isReadOnly: boolean;
    policyDefinitionFile: any[];
    setPolicyDefinitionFile: React.Dispatch<React.SetStateAction<any[]>>;
    policySpec: PolicySpec;
    setPolicySpec: React.Dispatch<React.SetStateAction<PolicySpec>>;
}

/**
 * Renders the policy configuring drawer.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} Right drawer for policy configuration.
 */
const PolicyStepper: FC<PolicyStepperProps> = ({
    onSave, isReadOnly, policyDefinitionFile, setPolicyDefinitionFile, policySpec, setPolicySpec
}) => {
    const classes = useStyles();
    const [activeStep, setActiveStep] = useState(0);

    const steps = [
        {
            label: isReadOnly ? 'Policy Definition' : 'Upload Policy Definition',
            description: isReadOnly 
                ? (`Policy logic inclusive file`) 
                : (`Upload the policy logic inclusive file`),
        },
        {
            label: isReadOnly ? 'Policy Specification' : 'Add Policy Specification',
        },
    ];

    const handleNext = () => {
        if (activeStep === steps.length - 1) {
            onSave();
        }
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };


    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleDrop = (policyDefinition: any) => {
        setPolicyDefinitionFile(policyDefinition);
    };

    const handlePolicyTemplateDownload = () => {

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
                <Stepper activeStep={activeStep} orientation='vertical'>
                    {steps.map((step, index) => (
                        <Step key={step.label}>
                            <StepLabel>{step.label}</StepLabel>
                            <StepContent>
                                {step.description && (
                                    <Typography variant='overline'>{step.description}</Typography>
                                )}
                                {(index === 0 && !isReadOnly) && (
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
                                {(index === 0 && isReadOnly) && (
                                    <List className={classes.uploadedFileDetails}>
                                        <ListItem key='policy-template-file-info,'>
                                            <ListItemAvatar>
                                                <Avatar>
                                                    <InsertDriveFile />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary='AddHeader.j2'
                                            />
                                            <ListItemSecondaryAction>
                                                <IconButton
                                                    // edge='end'
                                                    aria-label='Download policy template'
                                                    onClick={() => handlePolicyTemplateDownload()}
                                                >
                                                    <Icon>vertical_align_bottom</Icon>
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    </List>
                                )}
                                {(index === 1) && (
                                    <PolicyDefinitionEditor
                                        isReadOnly={isReadOnly}
                                        policySpec={policySpec}
                                        setPolicySpec={setPolicySpec}
                                    />
                                )}
                                <Box mt={2}>
                                    {!isReadOnly ? (
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
                                    ) : (
                                        <Button
                                            variant='contained'
                                            color='primary'
                                            onClick={handleNext}
                                        >
                                            {index === steps.length - 1 ? 'Done' : 'Continue'}
                                        </Button>
                                    )}
                                    {!isReadOnly ? (
                                        <Button
                                            color='primary'
                                            onClick={(index === 0 ? handleNext : handleBack)}
                                        >
                                            {(index === 0 ? 'Skip' : 'Back')}
                                        </Button>
                                    ) : (
                                        <Button
                                            color='primary'
                                            disabled={index === 0}
                                            onClick={handleBack}
                                        >
                                            Back
                                        </Button>
                                    )}
                                </Box>
                            </StepContent>
                        </Step>
                    ))}
                </Stepper>
            </Paper>
        </>
    );
}

export default PolicyStepper;
