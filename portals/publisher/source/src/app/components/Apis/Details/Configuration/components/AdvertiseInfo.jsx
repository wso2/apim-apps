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
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import HelpOutline from '@material-ui/icons/HelpOutline';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import { makeStyles } from '@material-ui/core/styles';

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
        <>
            <Typography className={classes.subHeading}>
                <FormattedMessage
                    id='Apis.Details.Configuration.components.AdvertiseInfo.advertised'
                    defaultMessage='Make the API Advertise Only'
                />
                <Tooltip
                    title={(
                        <FormattedMessage
                            id='Apis.Details.Configuration.components.AdvertiseInfo.advertised.tooltip'
                            defaultMessage={'If enabled, API will be served as an advertise only API. API Cannot be'
                            + ' deployed when the API is advertise only.'}
                        />
                    )}
                    aria-label='Advertise Only helper text'
                    placement='right-end'
                    interactive
                >
                    <HelpOutline className={classes.iconSpace} />
                </Tooltip>
            </Typography>
            <FormControlLabel
                className={classes.actionSpace}
                control={(
                    <Switch
                        disabled={isRestricted(['apim:api_create', 'apim:api_publish'], apiFromContext)}
                        checked={advertiseInfo.advertised}
                        onChange={({ target: { checked } }) => configDispatcher({
                            action: 'advertised',
                            value: checked,
                        })}
                        color='primary'
                        inputProps={{
                            'aria-label': 'Advertise Only',
                        }}
                    />
                )}
            />
            {advertiseInfo.advertised && (
                <>
                    <TextField
                        label={(
                            <>
                                <FormattedMessage
                                    id='Apis.Details.Configuration.components.AdvertiseInfo.accessibleEndpointURL'
                                    defaultMessage='Accessible Endpoint URL'
                                />
                                <sup className={classes.mandatoryStar}>*</sup>
                            </>
                        )}
                        variant='outlined'
                        value={advertiseInfo.accessibleEndpointUrl}
                        fullWidth
                        margin='normal'
                        onChange={(e) => configDispatcher({
                            action: 'accessibleEndpointUrl',
                            value: e.target.value,
                        })}
                        disabled={isRestricted(['apim:api_create', 'apim:api_publish'], apiFromContext)}
                        helperText={(
                            <FormattedMessage
                                id='Apis.Details.Configuration.components.AdvertiseInfo.accessibleEndpointURL.help'
                                defaultMessage='This is the accessible endpoint of the advertised API'
                            />
                        )}
                        style={{ marginTop: 0 }}
                    />
                    <TextField
                        label={(
                            <FormattedMessage
                                id='Apis.Details.Configuration.components.AdvertiseInfo.externalStoreURL'
                                defaultMessage='External Store URL'
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
                                id='Apis.Details.Configuration.components.AdvertiseInfo.externalStoreURL.help'
                                defaultMessage='This is the external store of the advertised API'
                            />
                        )}
                        style={{ marginTop: 0 }}
                    />
                </>
            )}
        </>
    );
};

AdvertiseInfo.propTypes = {
    configDispatcher: PropTypes.func.isRequired,
};

export default React.memo(AdvertiseInfo);
