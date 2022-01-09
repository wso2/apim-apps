/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import {
    Box, Grid, Icon, IconButton,
} from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import { Link, useHistory } from 'react-router-dom';
import List from '@material-ui/core/List';
import green from '@material-ui/core/colors/green';
import red from '@material-ui/core/colors/red';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import InsertDriveFile from '@material-ui/icons/InsertDriveFile';
import DeleteIcon from '@material-ui/icons/Delete';
import PolicyDefinitionEditor from './PolicyDefinitionEditor';


const useStyles = makeStyles((theme: any) => ({
    root: {
        flexGrow: 1,
        marginTop: 10,
        display: 'flex',
        flexDirection: 'column',
        padding: 20,
    },
    titleWrapper: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing(3),
    },
    titleLink: {
        color: theme.palette.primary.dark,
        marginRight: theme.spacing(1),
    },
    titleGrid: {
        ' & .MuiGrid-item': {
            padding: 0,
            margin: 0,
        },
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
        width: '75%',
    },
}));

interface PolicyDefinitionProps {
    policyCategory: string;
    policyName: string;
    policyDisplayName: string;
    policyDescription: string;
    multipleAllowed: boolean;
    applicableFlows: string[];
    supportedGateways: string[];
    supportedApiTypes: string[];
    policyAttributes: any;
}

const DummyDefaultPolicyDefinition = {
    policyCategory: 'Mediation',
    policyName: 'Add Header',
    policyDisplayName: 'Add Header',
    policyDescription: '',
    multipleAllowed: false,
    applicableFlows: ['Request', 'Response', 'Fault'],
    supportedGateways: ['Synapse'],
    supportedApiTypes: ['REST'],
    policyAttributes: [],
};

/**
 * Renders the view policy template UI
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} Policy template view UI.
 */
const ViewPolicyTemplate: React.FC = () => {
    const classes = useStyles();
    const history = useHistory();
    const url = '/policy-templates';
    const [activeStep, setActiveStep] = useState(0);
    const [policyTemplateFile, setPolicyTemplateFile] = useState<any[]>([]);
    const [policyDefinition, setPolicyDefinition] = useState<PolicyDefinitionProps>(DummyDefaultPolicyDefinition);

    const steps = [
        {
            label: 'Policy Template',
            description: `Policy logic inclusive template file of the Global Policy Template.`,
        },
        {
            label: 'Policy Definition',
            // description:
            // 'Policy Definition describes the meta data related to the policy in order to render the UI dynamically.',
        },
    ];

    useEffect(() => {
        setPolicyDefinition(DummyDefaultPolicyDefinition);
        // effect
        // return () => {
        //     cleanup
        // }
    }, [])

    const handleNext = () => {
        if (activeStep === steps.length - 1) {
            history.push('/policy-templates');
        }
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handlePolicyTemplateDownload = () => {

    }

    return (
        <Grid container spacing={3}>
            <Grid item sm={12} md={12} />
            <Grid item sm={2} md={2} />
            <Grid item sm={12} md={8}>
                <Grid container spacing={5} className={classes.titleGrid}>
                    <Grid item md={12}>
                        <div className={classes.titleWrapper}>
                            <Link to={url} className={classes.titleLink}>
                                <Typography variant='h4' component='h2'>
                                    <FormattedMessage
                                        id='PolicyTemplates.CreatePolicyTemplate.listing.heading'
                                        defaultMessage='Policy Templates'
                                    />
                                </Typography>
                            </Link>
                            <Icon>keyboard_arrow_right</Icon>
                            <Typography variant='h4' component='h3'>
                                {`View ${policyDefinition.policyName}`}
                            </Typography>
                        </div>
                    </Grid>
                    <Grid item md={12}>
                        <Paper elevation={0} className={classes.root}>
                            <Stepper activeStep={activeStep} orientation='vertical'>
                                {steps.map((step, index) => (
                                    <Step key={step.label}>
                                        <StepLabel>{step.label}</StepLabel>
                                        <StepContent>
                                            {step.description && (
                                                <Typography variant='overline'>{step.description}</Typography>
                                            )}
                                            {(index === 0) && (
                                                <List className={classes.uploadedFileDetails}>
                                                    <ListItem key='policy-template-file-info'>
                                                        <ListItemAvatar>
                                                            <Avatar>
                                                                <InsertDriveFile />
                                                            </Avatar>
                                                        </ListItemAvatar>
                                                        <ListItemText
                                                            primary='Test.xml'
                                                            // primary={`${policyTemplateFile[0].path}`}
                                                        />
                                                        <ListItemSecondaryAction>
                                                            <IconButton
                                                                edge='end'
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
                                                    isReadOnly
                                                    policyDefinition={policyDefinition}
                                                    setPolicyDefinition={setPolicyDefinition}
                                                />
                                            )}
                                            <Box mt={2}>
                                                <Button
                                                    variant='contained'
                                                    color='primary'
                                                    onClick={handleNext}
                                                >
                                                    {index === steps.length - 1 ? 'Done' : 'Continue'}
                                                </Button>
                                                <Button
                                                    color='primary'
                                                    disabled={index === 0}
                                                    onClick={handleBack}
                                                >
                                                    Back
                                                </Button>
                                            </Box>
                                        </StepContent>
                                    </Step>
                                ))}
                            </Stepper>
                        </Paper>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default ViewPolicyTemplate;
