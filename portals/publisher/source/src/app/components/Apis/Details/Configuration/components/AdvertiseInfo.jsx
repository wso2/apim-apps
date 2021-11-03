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

import React, { useState } from 'react';
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
import MuiAlert from 'AppComponents/Shared/MuiAlert';
import { useRevisionContext } from 'AppComponents/Shared/RevisionContext';

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
    alert: {
        marginTop: theme.spacing(2),
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
        api,
    } = props;
    const { allRevisions } = useRevisionContext();
    const classes = useStyles();
    const [apiFromContext] = useAPI();
    const [isValidAccessibleEndpointUrl, setValidAccessibleEndpointUrl] = useState(true);
    const [isValidOriginalDevPortalUrl, setValidOriginalDevPortalUrl] = useState(true);

    const handleOnChangeAccessibleEndpointUrl = ({ target: { value } }) => {
        if (value && value.length > 0) {
            let url;
            try {
                url = new URL(value);
            } catch (_) {
                setValidAccessibleEndpointUrl(false);
            }
            if (url) {
                setValidAccessibleEndpointUrl(true);
            } else {
                setValidAccessibleEndpointUrl(false);
            }
        } else {
            setValidAccessibleEndpointUrl(false);
        }
        configDispatcher({ action: 'accessibleEndpointUrl', value });
    };

    const handleOnChangeOriginalDevPortalUrl = ({ target: { value } }) => {
        if (value && value.length > 0) {
            let url;
            try {
                url = new URL(value);
            } catch (_) {
                setValidOriginalDevPortalUrl(false);
            }
            if (url.protocol === 'http:' || url.protocol === 'https:') {
                setValidOriginalDevPortalUrl(true);
            } else {
                setValidOriginalDevPortalUrl(false);
            }
        } else {
            setValidOriginalDevPortalUrl(true);
        }
        configDispatcher({ action: 'originalDevPortalUrl', value });
    };

    const isAdvertiseOnlyChangeDisabled = isRestricted(['apim:api_create', 'apim:api_publish'], apiFromContext)
        || api.type === 'ASYNC' || api.hasSubscriptions || api.isProductized
        || (!allRevisions || allRevisions.length !== 0) || (!api.advertiseInfo.advertised
        && api.lifeCycleStatus !== 'CREATED') || (api.advertiseInfo.advertised && api.lifeCycleStatus !== 'CREATED');

    const infoMsg = () => {
        if (api.type === 'ASYNC') {
            return 'This Async API only can be only used as an advertise only API.';
        }
        if (api.type !== 'ASYNC' && api.advertiseInfo.advertised && api.lifeCycleStatus !== 'CREATED') {
            return 'Cannot change to a normal API while being published.';
        }
        if (api.type !== 'ASYNC' && !api.advertiseInfo.advertised && api.lifeCycleStatus !== 'CREATED') {
            return 'Cannot change to an advertise only API while being published.';
        }
        if (api.type !== 'ASYNC' && api.lifeCycleStatus === 'CREATED' && !api.advertiseInfo.advertised
            && (api.hasSubscriptions || (!allRevisions || allRevisions.length !== 0))) {
            return 'Cannot change to an advertise only API when there are active subscriptions or revisions.';
        }
        if ((api.type !== 'ASYNC' && api.lifeCycleStatus === 'CREATED' && !api.advertiseInfo.advertised
            && api.isProductized)) {
            return 'Cannot change to an advertise only API when the API is being used in an API Product.';
        }
        return null;
    };

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
                        disabled={isAdvertiseOnlyChangeDisabled}
                        checked={api.advertiseInfo.advertised}
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
            {api.advertiseInfo.advertised && (
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
                        name='accessibleEndpointUrl'
                        value={api.advertiseInfo.accessibleEndpointUrl}
                        fullWidth
                        margin='normal'
                        onChange={handleOnChangeAccessibleEndpointUrl}
                        disabled={isRestricted(['apim:api_create', 'apim:api_publish'], apiFromContext)}
                        error={!isValidAccessibleEndpointUrl}
                        helperText={isValidAccessibleEndpointUrl ? (
                            <FormattedMessage
                                id='Apis.Details.Configuration.components.AdvertiseInfo.accessibleEndpointURL.help'
                                defaultMessage='This is the accessible endpoint of the advertised API'
                            />
                        ) : (
                            <FormattedMessage
                                id='Apis.Details.Configuration.components.AdvertiseInfo.accessibleEndpointURL.error'
                                defaultMessage='Invalid Accessible Endpoint URL'
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
                        name='originalDevPortalUrl'
                        value={api.advertiseInfo.originalDevPortalUrl}
                        fullWidth
                        margin='normal'
                        onChange={handleOnChangeOriginalDevPortalUrl}
                        disabled={isRestricted(['apim:api_create', 'apim:api_publish'], apiFromContext)}
                        error={!isValidOriginalDevPortalUrl}
                        helperText={isValidOriginalDevPortalUrl ? (
                            <FormattedMessage
                                id='Apis.Details.Configuration.components.AdvertiseInfo.externalStoreURL.help'
                                defaultMessage='This is the external store of the advertised API'
                            />
                        ) : (
                            <FormattedMessage
                                id='Apis.Details.Configuration.components.AdvertiseInfo.externalStoreURL.error'
                                defaultMessage='Invalid External Store URL'
                            />
                        )}
                        style={{ marginTop: 0 }}
                    />
                </>
            )}
            {infoMsg() !== null && (
                <MuiAlert severity='info' className={classes.alert}>{infoMsg()}</MuiAlert>
            )}
        </>
    );
};

AdvertiseInfo.propTypes = {
    configDispatcher: PropTypes.func.isRequired,
};

export default React.memo(AdvertiseInfo);
