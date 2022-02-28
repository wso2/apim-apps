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
import Grid from '@material-ui/core/Grid';
import Icon from '@material-ui/core/Icon';
import { FormattedMessage } from 'react-intl';
import { Link, useHistory } from 'react-router-dom';
import Alert from 'AppComponents/Shared/Alert';
import API from 'AppData/api.js';
import type { CreatePolicySpec } from 'AppComponents/Apis/Details/Policies/Types';
import PolicyCreateForm from 'AppComponents/Apis/Details/Policies/PolicyForm/PolicyCreateForm';
import { Box } from '@material-ui/core';

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

/**
 * Create a new common policy
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} Create common policy UI to render.
 */
const CreatePolicy: React.FC = () => {
    const classes = useStyles();
    const history = useHistory();
    const redirectUrl = '/policies';
    const api = new API();
    const [policyDefinitionFile, setPolicyDefinitionFile] = useState<any[]>([]);

    const addCommonPolicy = (policySpecContent: CreatePolicySpec, policyDefinition: any) => {
        const promisedCommonPolicyAdd = api.addCommonOperationPolicy(policySpecContent, policyDefinition);
        promisedCommonPolicyAdd
            .then(() => {
                Alert.info('Policy created successfully!');
                setPolicyDefinitionFile([]);
                history.push(redirectUrl);
            })
            .catch((error) => {
                history.push(redirectUrl);
                const { response } = error;
                if (response.body) {
                    const { description } = response.body;
                    console.log(description);
                    Alert.error('Something went wrong while creating policy');
                }
            });
    }

    const onSave = (policySpecification: CreatePolicySpec) => {
        addCommonPolicy(policySpecification, policyDefinitionFile);
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
                                        id='CommonPolicies.CreatePolicy.CommonPolicy.listing.heading'
                                        defaultMessage='Policies'
                                    />
                                </Typography>
                            </Link>
                            <Icon>keyboard_arrow_right</Icon>
                            <Typography variant='h4' component='h3'>
                                <FormattedMessage
                                    id='CommonPolicies.CreatePolicy.CommonPolicy.main.heading'
                                    defaultMessage='Create New Policy'
                                />
                            </Typography>
                        </div>
                    </Grid>
                    <Grid item md={12}>
                        <PolicyCreateForm
                            onSave={onSave}
                            policyDefinitionFile={policyDefinitionFile}
                            setPolicyDefinitionFile={setPolicyDefinitionFile}
                        />
                    </Grid>
                </Grid>
            </Grid>
            <Grid item sm={12} md={12}>
                <Box mb={5}/>
            </Grid>
        </Grid>
    );
};

export default CreatePolicy;
