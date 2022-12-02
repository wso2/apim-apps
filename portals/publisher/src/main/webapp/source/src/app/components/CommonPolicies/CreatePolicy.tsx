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
import { makeStyles } from '@mui/styles';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Icon from '@mui/material/Icon';
import { FormattedMessage } from 'react-intl';
import { Link, useHistory } from 'react-router-dom';
import Alert from 'AppComponents/Shared/Alert';
import API from 'AppData/api.js';
import type { CreatePolicySpec } from 'AppComponents/Apis/Details/Policies/Types';
import PolicyCreateForm from 'AppComponents/Apis/Details/Policies/PolicyForm/PolicyCreateForm';
import { Box } from '@mui/material';
import CONSTS from 'AppData/Constants';

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
 * @returns {TSX} Create common policy UI to render.
 */
const CreatePolicy: React.FC = () => {
    const classes = useStyles();
    const history = useHistory();
    const api = new API();
    const [synapsePolicyDefinitionFile, setSynapsePolicyDefinitionFile] = useState<any[]>([]);
    const [ccPolicyDefinitionFile, setCcPolicyDefinitionFile] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);

    const addCommonPolicy = (
        policySpecContent: CreatePolicySpec,
        synapsePolicyDefinition: any,
        ccPolicyDefinition: any,
    ) => {
        setSaving(true);
        const promisedCommonPolicyAdd = api.addCommonOperationPolicy(
            policySpecContent,
            synapsePolicyDefinition,
            ccPolicyDefinition
        );
        promisedCommonPolicyAdd
            .then(() => {
                Alert.info('Policy created successfully!');
                setSynapsePolicyDefinitionFile([]);
                setCcPolicyDefinitionFile([]);
                history.push(CONSTS.PATH_TEMPLATES.COMMON_POLICIES);
            })
            .catch((error) => {
                console.error(error);
                history.push(CONSTS.PATH_TEMPLATES.COMMON_POLICIES);
                Alert.error('Something went wrong while creating policy');
            })
            .finally(() => {
                setSaving(false);
            });
    };

    const onSave = (policySpecification: CreatePolicySpec) => {
        const synapseFile = synapsePolicyDefinitionFile.length !== 0 ? synapsePolicyDefinitionFile : null;
        const ccFile = ccPolicyDefinitionFile.length !== 0 ? ccPolicyDefinitionFile : null;
        addCommonPolicy(
            policySpecification,
            synapseFile,
            ccFile,
        );
    };

    const onCancel = () => {
        history.push(CONSTS.PATH_TEMPLATES.COMMON_POLICIES);
    };

    return (
        <Grid container spacing={3}>
            <Grid item sm={12} md={12} />
            <Grid item sm={2} md={2} />
            <Grid item sm={12} md={8}>
                <Grid container spacing={5} className={classes.titleGrid}>
                    <Grid item md={12}>
                        <div className={classes.titleWrapper}>
                            <Link
                                to={CONSTS.PATH_TEMPLATES.COMMON_POLICIES}
                                className={classes.titleLink}
                            >
                                <Typography variant='h4' component='h2'>
                                    <FormattedMessage
                                        id='CommonPolicies.CreatePolicy.breadcrumb.policies'
                                        defaultMessage='Policies'
                                    />
                                </Typography>
                            </Link>
                            <Icon>keyboard_arrow_right</Icon>
                            <Typography variant='h4' component='h3'>
                                <FormattedMessage
                                    id='CommonPolicies.CreatePolicy.breadcrumb.create.new.policy'
                                    defaultMessage='Create New Policy'
                                />
                            </Typography>
                        </div>
                    </Grid>
                    <Grid item md={12}>
                        <PolicyCreateForm
                            onSave={onSave}
                            synapsePolicyDefinitionFile={synapsePolicyDefinitionFile}
                            setSynapsePolicyDefinitionFile={setSynapsePolicyDefinitionFile}
                            ccPolicyDefinitionFile={ccPolicyDefinitionFile}
                            setCcPolicyDefinitionFile={setCcPolicyDefinitionFile}
                            onCancel={onCancel}
                            saving={saving}
                        />
                    </Grid>
                </Grid>
            </Grid>
            <Grid item sm={12} md={12}>
                <Box mb={5} />
            </Grid>
        </Grid>
    );
};

export default CreatePolicy;
