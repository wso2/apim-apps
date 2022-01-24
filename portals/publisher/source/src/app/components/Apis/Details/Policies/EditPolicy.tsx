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

import React, { useState}  from "react";
import { makeStyles, Theme } from '@material-ui/core/styles';
import { Grid } from "@material-ui/core";
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from 'react-intl';

interface Policy {
  id: number;
  name: string;
  description: string;
  flows: string[];
}

interface props {
  policy: Policy;
  handleEdit: React.Dispatch<React.SetStateAction<string>>;
}

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
    },
    buttonIcon: {
        marginRight: theme.spacing(1),
    },
    addPolicyBtn: {
        marginLeft: theme.spacing(1),
    },
    notConfigured: {
        color: 'rgba(0, 0, 0, 0.54)',
    },
    textTrim: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
}));

const EditPolicy: React.FC<props> = ({ policy, handleEdit }) => {
    const classes = useStyles();
    return (
        <>
            <Grid container direction='row' justify='space-between' alignItems='center' spacing={0}>
                <Grid item md={4} style={{ display: 'flex', alignItems: 'center' }}>
                    <Box pb={2}>
                        <Typography component='p' variant='subtitle2' className={classes.notConfigured}>
                            <FormattedMessage
                                id={'Apis.Details.Policies.'
                + 'EditPolicies'}
                                defaultMessage='Name'
                            />
                        </Typography>
                        <Typography component='p' variant='body1' className={classes.textTrim}>
                            <>
                                {policy.name}
                            </>
                        </Typography>
                    </Box>
                    <Box pb={2}>
                        <Typography component='p' variant='subtitle2' className={classes.notConfigured}>
                            <FormattedMessage
                                id={'Apis.Details.Policies.'
                + 'EditPolicies'}
                                defaultMessage='Description'
                            />
                        </Typography>
                        <Typography component='p' variant='body1' className={classes.textTrim}>
                            <>
                                {policy.description}
                            </>
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
        </>
    );
};

export default EditPolicy;