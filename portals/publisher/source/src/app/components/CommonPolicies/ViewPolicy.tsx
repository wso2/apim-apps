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

import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { Grid, Icon } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import { Link, useHistory, useParams } from 'react-router-dom';
import green from '@material-ui/core/colors/green';
import red from '@material-ui/core/colors/red';
import API from 'AppData/api';
import PolicyStepper from 'AppComponents/Apis/Details/Policies/PolicyStepper';
import Alert from 'AppComponents/Shared/Alert';
import { PolicySpec } from 'AppComponents/Apis/Details/Policies/Types';
import { Progress } from 'AppComponents/Shared';

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

/**
 * Renders the view policy UI
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} Policy view UI.
 */
const ViewPolicy: React.FC = () => {
    const classes = useStyles();
    const history = useHistory();
    const api = new API();
    const redirectUrl = '/policies';
    const { policyId } = useParams<{policyId?: string}>();
    const [policyDefinitionFile, setPolicyDefinitionFile] = useState<any[]>([]);
    const [policySpec, setPolicySpec] = useState<PolicySpec|null>(null);

    useEffect(() => {
        if (policyId) {
            const promisedCommonPolicyGet = api.getCommonOperationPolicy(policyId);
            promisedCommonPolicyGet
                .then((response) => {
                    setPolicySpec(response.body);
                })
                .catch((errorMessage) => {
                    Alert.error(JSON.stringify(errorMessage.body));
                });
        }
    }, [policyId])

    const redirectToPolicies = () => {
        history.push(redirectUrl);
    }

    if (!policySpec) {
        return <Progress />
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
                                        id='CommonPolicies.CreatePolicy.listing.heading'
                                        defaultMessage='Policies'
                                    />
                                </Typography>
                            </Link>
                            <Icon>keyboard_arrow_right</Icon>
                            <Typography variant='h4' component='h3'>
                                {`View ${policySpec.displayName}`}
                            </Typography>
                        </div>
                    </Grid>
                    <Grid item md={12}>
                        <PolicyStepper
                            isAPI={false}
                            onSave={redirectToPolicies}
                            isReadOnly
                            policyDefinitionFile={policyDefinitionFile}
                            setPolicyDefinitionFile={setPolicyDefinitionFile}
                            policySpec={policySpec}
                            setPolicySpec={setPolicySpec}
                        />
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default ViewPolicy;
