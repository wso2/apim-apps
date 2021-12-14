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
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { isRestricted } from 'AppData/AuthManager';
import { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { makeStyles } from '@material-ui/core/styles';
import FormLabel from '@material-ui/core/FormLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import FormControl from '@material-ui/core/FormControl';
import HelpOutline from '@material-ui/icons/HelpOutline';
import Tooltip from '@material-ui/core/Tooltip';

const useStyles = makeStyles((theme) => ({
    expansionPanel: {
        marginBottom: theme.spacing(3),
    },
    expansionPanelDetails: {
        flexDirection: 'column',
    },
    iconSpace: {
        marginLeft: theme.spacing(0.5),
    },
    actionSpace: {
        margin: '-7px auto',
    },
    subHeading: {
        margin: 0,
        display: 'inline-flex',
        lineHeight: 1.5,
        paddingBottom: '20px',
    },
    mandatoryStar: {
        color: theme.palette.error.main,
        marginLeft: theme.spacing(0.1),
    },
}));

/**
 *
 *
 * @export
 * @param {*} props
 * @returns
 */
const AdvertiseInfo = (props) => {
    const {
        configDispatcher,
        api: { advertiseInfo },
    } = props;
    const classes = useStyles();
    const [apiFromContext] = useAPI();
    // const isAdvertised = advertiseInfo.advertised;
    return (
        <Grid container spacing={1} alignItems='flex-start' xs={11}>
            <Grid item>
                <Box>
                    <FormControl component='fieldset' style={{ display: 'flex' }}>
                        <FormLabel component='legend'>
                            <FormattedMessage
                                id='Apis.Details.Configuration.components.AdvertiseInfo.advertised.label'
                                defaultMessage='Make the API advertised'
                            />
                        </FormLabel>
                        <RadioGroup
                            aria-label='Make the API advertised'
                            name='advertised'
                            value={advertiseInfo.advertised}
                            onChange={({
                                target: { value },
                            }) => configDispatcher({
                                action: 'advertised', value: value === 'true',
                            })}
                            style={{ display: 'flow-root' }}
                        >
                            <FormControlLabel
                                disabled={isRestricted(['apim:api_create'], apiFromContext)}
                                value
                                control={<Radio color='primary' />}
                                label={(
                                    <FormattedMessage
                                        id='Apis.Details.Configuration.components.AdvertiseInfo.advertised.yes'
                                        defaultMessage='Yes'
                                    />
                                )}
                            />
                            <FormControlLabel
                                disabled={isRestricted(['apim:api_create'], apiFromContext)}
                                value={false}
                                control={<Radio color='primary' />}
                                label={(
                                    <FormattedMessage
                                        id='Apis.Details.Configuration.components.AdvertiseInfo.advertised.no'
                                        defaultMessage='No'
                                    />
                                )}
                            />
                        </RadioGroup>
                    </FormControl>
                </Box>
            </Grid>
            <Grid item xs={1}>
                <Box>
                    <Tooltip
                        title={(
                            <FormattedMessage
                                id='Apis.Details.Configuration.components.AdvertiseInfo.tooltip'
                                defaultMessage={
                                    'Indicates if an API is advertise only. You can use advertise only APIs to expose'
                                    + ' an externally published API through API Manager.'
                                }
                            />
                        )}
                        aria-label='add'
                        placement='right-end'
                        interactive
                    >
                        <HelpOutline />
                    </Tooltip>
                </Box>
            </Grid>
            <Grid>
                {advertiseInfo.advertised && (
                    <>
                        <TextField
                            label={(
                                <>
                                    <FormattedMessage
                                        id={'Apis.Details.Configuration.components.AdvertiseInfo'
                                        + '.apiExternalProductionEndpoint'}
                                        defaultMessage='API External Production Endpoint'
                                    />
                                    <sup className={classes.mandatoryStar}>*</sup>
                                </>
                            )}
                            variant='outlined'
                            value={advertiseInfo.apiExternalProductionEndpoint}
                            fullWidth
                            margin='normal'
                            onChange={(e) => configDispatcher({
                                action: 'apiExternalProductionEndpoint',
                                value: e.target.value,
                            })}
                            disabled={isRestricted(['apim:api_create', 'apim:api_publish'], apiFromContext)}
                            helperText={(
                                <FormattedMessage
                                    id={'Apis.Details.Configuration.components.AdvertiseInfo'
                                    + '.apiExternalProductionEndpoint.help'}
                                    defaultMessage='This is the external production endpoint of the advertised API'
                                />
                            )}
                            style={{ marginTop: 0 }}
                        />
                        <TextField
                            label={(
                                <>
                                    <FormattedMessage
                                        id={'Apis.Details.Configuration.components.AdvertiseInfo'
                                        + '.apiExternalSandboxEndpoint'}
                                        defaultMessage='API External Sandbox Endpoint'
                                    />
                                    <sup className={classes.mandatoryStar}>*</sup>
                                </>
                            )}
                            variant='outlined'
                            value={advertiseInfo.apiExternalSandboxEndpoint}
                            fullWidth
                            margin='normal'
                            onChange={(e) => configDispatcher({
                                action: 'apiExternalSandboxEndpoint',
                                value: e.target.value,
                            })}
                            disabled={isRestricted(['apim:api_create', 'apim:api_publish'], apiFromContext)}
                            helperText={(
                                <FormattedMessage
                                    id={'Apis.Details.Configuration.components.AdvertiseInfo.apiExternalSandboxEndpoint'
                                    + '.help'}
                                    defaultMessage='This is the external sandbox endpoint of the advertised API'
                                />
                            )}
                            style={{ marginTop: 0 }}
                        />
                        <TextField
                            label={(
                                <FormattedMessage
                                    id='Apis.Details.Configuration.components.AdvertiseInfo.originalDevPortalUrl'
                                    defaultMessage='Original Developer URL'
                                />
                            )}
                            variant='outlined'
                            value={advertiseInfo.originalDevPortalUrl}
                            fullWidth
                            margin='normal'
                            onChange={(e) => configDispatcher({
                                action: 'originalDevPortalUrl',
                                value: e.target.value,
                            })}
                            disabled={isRestricted(['apim:api_create', 'apim:api_publish'], apiFromContext)}
                            helperText={(
                                <FormattedMessage
                                    id='Apis.Details.Configuration.components.AdvertiseInfo.originalDevPortalUrl.help'
                                    defaultMessage='This is the original developer portal of the advertised API'
                                />
                            )}
                            style={{ marginTop: 0 }}
                        />
                    </>
                )}
            </Grid>
        </Grid>
    );
};

AdvertiseInfo.propTypes = {
    configDispatcher: PropTypes.func.isRequired,
};

export default React.memo(AdvertiseInfo);
