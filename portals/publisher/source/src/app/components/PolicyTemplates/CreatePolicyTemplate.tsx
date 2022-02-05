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

import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';
import {
    Grid, Icon,
} from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import { Link, useHistory } from 'react-router-dom';
import PolicyStepper from 'AppComponents/Apis/Details/Policies/PolicyStepper';
import type { PolicyDefinition } from 'AppComponents/Apis/Details/Policies/Types';

const useStyles = makeStyles((theme: any) => ({
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
}));

const DefaultPolicyDefinition = {
    policyCategory: 'Mediation',
    policyName: '',
    policyDisplayName: '',
    policyDescription: '',
    multipleAllowed: false,
    applicableFlows: ['Request', 'Response', 'Fault'],
    supportedGateways: ['Synapse'],
    supportedApiTypes: ['REST'],
    policyAttributes: [],
};

/**
 * Create a new global policy template
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} Create policy template UI to render.
 */
const CreatePolicyTemplate: React.FC = () => {
    const classes = useStyles();
    const history = useHistory();
    const redirectUrl = '/policy-templates';
    const [policyDefinition, setPolicyDefinition] = useState<PolicyDefinition>(DefaultPolicyDefinition);

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
                                        id='PolicyTemplates.CreatePolicyTemplate.SharedPolicy.listing.heading'
                                        defaultMessage='Policy Templates'
                                    />
                                </Typography>
                            </Link>
                            <Icon>keyboard_arrow_right</Icon>
                            <Typography variant='h4' component='h3'>
                                <FormattedMessage
                                    id='PolicyTemplates.CreatePolicyTemplate.SharedPolicy.main.heading'
                                    defaultMessage='Create New Policy Template'
                                />
                            </Typography>
                        </div>
                    </Grid>
                    <Grid item md={12}>
                        <PolicyStepper 
                            isAPI={false}
                            onSave={redirectToPolicyTemplates}
                            isReadOnly={false}
                            policyDefinition={policyDefinition}
                            setPolicyDefinition={setPolicyDefinition}
                        />
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default CreatePolicyTemplate;
