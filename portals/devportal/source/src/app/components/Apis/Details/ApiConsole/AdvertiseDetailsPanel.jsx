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

import React from 'react';
import { FormattedMessage } from 'react-intl';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Box from '@material-ui/core/Box';

const AdvertiseDetailsPanel = (props) => {
    const {
        classes, advAuthHeader, advAuthHeaderValue, handleChanges, selectedEndpoint, advertiseInfo,
    } = props;

    return (
        <Box display='block' justifyContent='center' className={classes.authHeader}>
            <Grid x={12} md={6} className={classes.centerItems}>
                <Typography
                    variant='h6'
                    component='label'
                    id='authentication-heading'
                    color='textSecondary'
                    className={classes.tryoutHeading}
                >
                    <FormattedMessage
                        id='Apis.Details.ApiConsole.TryOutController.authentication.heading'
                        defaultMessage='Authentication'
                    />
                </Typography>
            </Grid>
            <Grid container spacing={2} x={8} md={6} direction='row' className={classes.tokenType}>
                <Grid xs={6} md={4} style={{ paddingLeft: 0 }} item>
                    <TextField
                        margin='normal'
                        variant='outlined'
                        id='advAuthHeader'
                        label={(
                            <FormattedMessage
                                id='Apis.Details.ApiConsole.TryOutController.adv.auth.header'
                                defaultMessage='Authorization Header'
                            />
                        )}
                        name='advAuthHeader'
                        onChange={handleChanges}
                        value={advAuthHeader || ''}
                        fullWidth
                    />
                </Grid>
                <Grid xs={6} md={8} style={{ paddingRight: 0 }} item>
                    <TextField
                        margin='normal'
                        variant='outlined'
                        id='advAuthHeaderValue'
                        label={(
                            <FormattedMessage
                                id='Apis.Details.ApiConsole.TryOutController.adv.auth.header.value'
                                defaultMessage='Authorization Header Value'
                            />
                        )}
                        name='advAuthHeaderValue'
                        onChange={handleChanges}
                        value={advAuthHeaderValue || ''}
                        fullWidth
                    />
                </Grid>
            </Grid>
            <Grid x={12} md={6} className={classes.centerItems}>
                <Typography
                    variant='h6'
                    component='label'
                    id='key-type'
                    color='textSecondary'
                    className={classes.tryoutHeading}
                >
                    <FormattedMessage
                        id='Apis.Details.ApiConsole.TryOutController.enpoint.heading'
                        defaultMessage='API Endpoint'
                    />
                </Typography>
                <TextField
                    fullWidth
                    select
                    id='selectedEndpoint'
                    label={(
                        <FormattedMessage
                            defaultMessage='Endpoint type'
                            id='Apis.Details.ApiConsole.TryOutController.endpoint'
                        />
                    )}
                    value={selectedEndpoint}
                    name='selectedEndpoint'
                    onChange={handleChanges}
                    helperText={(
                        <FormattedMessage
                            defaultMessage='Please select an endpoint type'
                            id='Apis.Details.ApiConsole.TryOutController.endpoint.help'
                        />
                    )}
                    margin='normal'
                    variant='outlined'
                >
                    {advertiseInfo.apiExternalProductionEndpoint && (
                        <MenuItem
                            value='PRODUCTION'
                            className={classes.menuItem}
                        >
                            Production
                        </MenuItem>
                    )}
                    {advertiseInfo.apiExternalSandboxEndpoint && (
                        <MenuItem
                            value='SANDBOX'
                            className={classes.menuItem}
                        >
                            Sandbox
                        </MenuItem>
                    )}
                </TextField>
            </Grid>
        </Box>
    );
};

export default AdvertiseDetailsPanel;
