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
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';

const AdvertiseDetailsPanel = (props) => {
    const {
        classes, advAuthHeader, setAdvAuthHeader, advAuthHeaderValue, setAdvAuthHeaderValue, selectedEndpoint,
        setSelectedEndpoint, advertiseInfo,
    } = props;

    return (
        <>
            <Box display='block' justifyContent='center'>
                <Grid x={12} md={6} className={classes.centerItems}>
                    <Typography
                        variant='h6'
                        component='label'
                        id='key-type'
                        color='textSecondary'
                        className={classes.tryoutHeading}
                    >
                        <FormattedMessage
                            id='Apis.Details.ApiConsole.authentication.heading'
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
                                    id='Apis.Details.ApiConsole.adv.auth.header'
                                    defaultMessage='Authorization Header'
                                />
                            )}
                            name='advAuthHeader'
                            onChange={(event) => { setAdvAuthHeader(event.target.value); }}
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
                                    id='Apis.Details.ApiConsole.adv.auth.header.value'
                                    defaultMessage='Authorization Header Value'
                                />
                            )}
                            name='advAuthHeaderValue'
                            onChange={(event) => { setAdvAuthHeaderValue(event.target.value); }}
                            value={advAuthHeaderValue || ''}
                            fullWidth
                        />
                    </Grid>
                </Grid>
            </Box>
            <Box display='flex' justifyContent='center'>
                <Grid x={12} md={6} className={classes.centerItems}>
                    <Typography
                        variant='h6'
                        component='label'
                        id='key-type'
                        color='textSecondary'
                        className={classes.tryoutHeading}
                    >
                        <FormattedMessage
                            id='Apis.Details.ApiConsole.enpoint.heading'
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
                                id='Apis.Details.ApiConsole.endpoint'
                            />
                        )}
                        value={selectedEndpoint}
                        name='selectedEndpoint'
                        onChange={(event) => { setSelectedEndpoint(event.target.value); }}
                        helperText={(
                            <FormattedMessage
                                defaultMessage='Please select an endpoint type'
                                id='Apis.Details.ApiConsole.endpoint.help'
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
        </>
    );
}

export default AdvertiseDetailsPanel;
