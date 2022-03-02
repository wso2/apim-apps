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
import { makeStyles, Theme } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Icon from '@material-ui/core/Icon';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from 'react-intl';
import { Link, useHistory, useParams } from 'react-router-dom';
import CONST from 'AppData/Constants';
import API from 'AppData/api';
import { PolicySpec } from 'AppComponents/Apis/Details/Policies/Types';
import { Progress } from 'AppComponents/Shared';
import ResourceNotFoundError from 'AppComponents/Base/Errors/ResourceNotFoundError';
import PolicyViewForm from 'AppComponents/Apis/Details/Policies/PolicyForm/PolicyViewForm';

const useStyles = makeStyles((theme: Theme) => ({
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
 * Renders the view policy UI
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} Policy view UI.
 */
const ViewPolicy: React.FC = () => {
    const classes = useStyles();
    const history = useHistory();
    const { policyId } = useParams<{ policyId?: string }>();
    const [policySpec, setPolicySpec] = useState<PolicySpec | null>(null);
    const [notFound, setNotFound] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        if (policyId) {
            const promisedCommonPolicyGet =
                API.getCommonOperationPolicy(policyId);
            promisedCommonPolicyGet
                .then((response) => {
                    setPolicySpec(response.body);
                })
                .catch((error) => {
                    if (process.env.NODE_ENV !== 'production') {
                        console.error(error);
                    }
                    const { status } = error;
                    if (status === 404) {
                        setNotFound(true);
                    } else {
                        setNotFound(false);
                    }
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [policyId]);

    const redirectToPolicies = () => {
        history.push(CONST.PATH_TEMPLATES.COMMON_POLICIES);
    };

    const resourceNotFountMessage = {
        title: 'Policy Not Found',
        body: 'The policy you are looking for is not available',
    };

    if (notFound) {
        return <ResourceNotFoundError message={resourceNotFountMessage} />;
    }

    if (loading || !policySpec) {
        return <Progress per={90} message='Loading Policy ...' />;
    }

    return (
        <Grid container spacing={3}>
            <Grid item sm={12} md={12} />
            <Grid item sm={2} md={2} />
            <Grid item sm={12} md={8}>
                <Grid container spacing={5} className={classes.titleGrid}>
                    <Grid item md={12}>
                        <div className={classes.titleWrapper}>
                            <Link
                                to={CONST.PATH_TEMPLATES.COMMON_POLICIES}
                                className={classes.titleLink}
                            >
                                <Typography variant='h4' component='h2'>
                                    <FormattedMessage
                                        id='CommonPolicies.CreatePolicy.listing.heading'
                                        defaultMessage='Policies'
                                    />
                                </Typography>
                            </Link>
                            <Icon>keyboard_arrow_right</Icon>
                            <Typography variant='h4' component='h3'>
                                {policySpec.displayName}
                            </Typography>
                        </div>
                    </Grid>
                    <Grid item md={12}>
                        <Paper>
                            <PolicyViewForm
                                policySpec={policySpec}
                                onDone={redirectToPolicies}
                            />
                        </Paper>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default ViewPolicy;
