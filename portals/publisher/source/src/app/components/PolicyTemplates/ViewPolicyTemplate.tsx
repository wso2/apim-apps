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
import Typography from '@material-ui/core/Typography';
import { Grid, Icon } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import { Link, useHistory } from 'react-router-dom';
import green from '@material-ui/core/colors/green';
import red from '@material-ui/core/colors/red';
import PolicyStepper from 'AppComponents/Apis/Details/Policies/PolicyStepper';
import type { PolicyDefinition } from 'AppComponents/Apis/Details/Policies/Types';

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
    const redirectUrl = '/policy-templates';
    const [policyDefinition, setPolicyDefinition] = useState<PolicyDefinition>(DummyDefaultPolicyDefinition);

    useEffect(() => {
        setPolicyDefinition(DummyDefaultPolicyDefinition);
    }, [])

    const redirectToPolicyTemplates = () => {
        history.push(redirectUrl);
    }

    return (
        <Grid container spacing={3}>
            <Grid item sm={12} md={12} />
            <Grid item sm={2} md={2} />
            <Grid item sm={12} md={8}>
                <Grid container spacing={5} className={classes.titleGrid}>
                    <Grid item md={12}>
                        <div className={classes.titleWrapper}>
                            <Link to={redirectUrl} className={classes.titleLink}>
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
                        <PolicyStepper
                            isAPI={false}
                            onSave={redirectToPolicyTemplates}
                            isReadOnly
                            policyDefinition={policyDefinition}
                            setPolicyDefinition={setPolicyDefinition}
                        />
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default ViewPolicyTemplate;
