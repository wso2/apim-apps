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

import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { isRestricted } from 'AppData/AuthManager';
import { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import MuiAlert from 'AppComponents/Shared/MuiAlert';
import { useRevisionContext } from 'AppComponents/Shared/RevisionContext';
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
import { AlertTitle } from '@material-ui/lab';

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
    alertGrid: {
        width: '100%',
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
        oldApi: { policies: oldPolicies, endpointConfig: oldEndpointConfig },
        api: {
            advertiseInfo,
            type,
            policies,
            lifeCycleStatus,
            endpointConfig,
        },
        setIsOpen,
    } = props;
    const {
        allRevisions,
    } = useRevisionContext();
    const classes = useStyles();
    const [apiFromContext] = useAPI();
    const isDeployed = useMemo(() => {
        if (allRevisions) {
            for (let i = 0; i < allRevisions.length; i++) {
                if (allRevisions[i].deploymentInfo.length > 0) {
                    return true;
                }
            }
        }
        return false;
    }, [allRevisions]);

    const checkApiExternalEndpointValidity = (endpointType, value) => {
        if (value && value.length > 0) {
            let url;
            try {
                url = new URL(value);
            } catch (_) {
                return false;
            }
            return !!url;
        } else return endpointType !== 'PRODUCTION';
    };

    const [isValidApiExternalProductionEndpoint, setValidApiExternalProductionEndpoint] = useState(
        checkApiExternalEndpointValidity('PRODUCTION', advertiseInfo.apiExternalProductionEndpoint),
    );
    const [isValidApiExternalSandboxEndpoint, setValidApiExternalSandboxEndpoint] = useState(
        checkApiExternalEndpointValidity('SANDBOX', advertiseInfo.apiExternalSandboxEndpoint),
    );
    const [isValidOriginalDevPortalUrl, setValidOriginalDevPortalUrl] = useState(true);

    const handleOnChangeApiExternalEndpointUrl = (endpointType, event) => {
        const { value } = event.target;
        if (endpointType === 'PRODUCTION') {
            setValidApiExternalProductionEndpoint(checkApiExternalEndpointValidity(endpointType, value));
            configDispatcher({ action: 'apiExternalProductionEndpoint', value });
        } else {
            setValidApiExternalSandboxEndpoint(checkApiExternalEndpointValidity(endpointType, value));
            configDispatcher({ action: 'apiExternalSandboxEndpoint', value });
        }
    };

    const handleOnChangeOriginalDevPortalUrl = ({ target: { value } }) => {
        if (value && value.length > 0) {
            let url;
            try {
                url = new URL(value);
            } catch (_) {
                setValidOriginalDevPortalUrl(false);
            }
            if (url && (url.protocol === 'http:' || url.protocol === 'https:')) {
                setValidOriginalDevPortalUrl(true);
            } else {
                setValidOriginalDevPortalUrl(false);
            }
        } else {
            setValidOriginalDevPortalUrl(true);
        }
        configDispatcher({ action: 'originalDevPortalUrl', value });
    };

    const handleOnChangeAdvertised = ({ target: { value } }) => {
        configDispatcher({ action: 'advertised', value: value === 'true' });
        if (value === 'false' && lifeCycleStatus === 'PUBLISHED' && (policies.length === 0 || !endpointConfig)) {
            setIsOpen(true);
        } else if (value === 'true' && lifeCycleStatus === 'PUBLISHED') {
            configDispatcher({ action: 'policies', value: oldPolicies });
            configDispatcher({ action: 'endpointConfig', value: oldEndpointConfig });
        }
    };

    return (
        <Grid container spacing={1} alignItems='flex-start'>
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
                            onChange={handleOnChangeAdvertised}
                            style={{ display: 'flow-root' }}
                        >
                            <FormControlLabel
                                disabled={isRestricted(['apim:api_create'], apiFromContext)
                                    || type === 'ASYNC' || isDeployed}
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
                                disabled={isRestricted(['apim:api_create'], apiFromContext)
                                    || type === 'ASYNC' || isDeployed}
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
            <Grid className={classes.alertGrid}>
                {type === 'ASYNC' && (
                    <MuiAlert severity='info'>
                        <AlertTitle>
                            <FormattedMessage
                                id='Apis.Details.Configuration.components.AdvertiseInfo.async.api.warning.title'
                                defaultMessage='The "Other" type streaming APIs will serve as advertise only APIs.'
                            />
                        </AlertTitle>
                        <FormattedMessage
                            id='Apis.Details.Configuration.components.AdvertiseInfo.async.api.warning'
                            defaultMessage={'If you want to deploy and API in the gateway, please create a WebSocket,'
                            + ' SSE or WebSub type of a streaming API.'}
                        />
                    </MuiAlert>
                )}
                {isDeployed && (
                    <MuiAlert severity='info' className={classes.alert}>
                        <AlertTitle>
                            <FormattedMessage
                                id='Apis.Details.Configuration.components.AdvertiseInfo.deployed.api.warning.title'
                                defaultMessage='There are active deployments in the API.'
                            />
                        </AlertTitle>
                        <FormattedMessage
                            id='Apis.Details.Configuration.components.AdvertiseInfo.deployed.api.warning'
                            defaultMessage={'Please undeploy the revision before changing the API to an advertise only'
                            + ' API.'}
                        />
                    </MuiAlert>
                )}
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
                            name='apiExternalProductionEndpoint'
                            value={advertiseInfo.apiExternalProductionEndpoint}
                            fullWidth
                            margin='normal'
                            onChange={(e) => { handleOnChangeApiExternalEndpointUrl('PRODUCTION', e); }}
                            disabled={isRestricted(['apim:api_create', 'apim:api_publish'], apiFromContext)}
                            error={!isValidApiExternalProductionEndpoint}
                            helperText={isValidApiExternalProductionEndpoint ? (
                                <FormattedMessage
                                    id={'Apis.Details.Configuration.components.AdvertiseInfo'
                                    + '.apiExternalProductionEndpoint.help'}
                                    defaultMessage='This is the external production endpoint of the advertised API'
                                />
                            ) : (
                                <FormattedMessage
                                    id={'Apis.Details.Configuration.components.AdvertiseInfo'
                                    + '.apiExternalEndpoint.error'}
                                    defaultMessage='Invalid Endpoint URL'
                                />
                            )}
                        />
                        <TextField
                            label={(
                                <>
                                    <FormattedMessage
                                        id={'Apis.Details.Configuration.components.AdvertiseInfo'
                                        + '.apiExternalSandboxEndpoint'}
                                        defaultMessage='API External Sandbox Endpoint'
                                    />
                                </>
                            )}
                            variant='outlined'
                            name='apiExternalSandboxEndpoint'
                            value={advertiseInfo.apiExternalSandboxEndpoint}
                            fullWidth
                            margin='normal'
                            onChange={(e) => { handleOnChangeApiExternalEndpointUrl('SANDBOX', e); }}
                            disabled={isRestricted(['apim:api_create', 'apim:api_publish'], apiFromContext)}
                            error={!isValidApiExternalSandboxEndpoint}
                            helperText={isValidApiExternalSandboxEndpoint ? (
                                <FormattedMessage
                                    id={'Apis.Details.Configuration.components.AdvertiseInfo.apiExternalSandboxEndpoint'
                                    + '.help'}
                                    defaultMessage='This is the external sandbox endpoint of the advertised API'
                                />
                            ) : (
                                <FormattedMessage
                                    id={'Apis.Details.Configuration.components.AdvertiseInfo'
                                    + '.apiExternalEndpoint.error'}
                                    defaultMessage='Invalid Endpoint URL'
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
                            name='originalDevPortalUrl'
                            value={advertiseInfo.originalDevPortalUrl}
                            fullWidth
                            margin='normal'
                            onChange={handleOnChangeOriginalDevPortalUrl}
                            disabled={isRestricted(['apim:api_create', 'apim:api_publish'], apiFromContext)}
                            error={!isValidOriginalDevPortalUrl}
                            helperText={isValidOriginalDevPortalUrl ? (
                                <FormattedMessage
                                    id='Apis.Details.Configuration.components.AdvertiseInfo.originalDevPortalUrl.help'
                                    defaultMessage='This is the original developer portal of the advertised API'
                                />
                            ) : (
                                <FormattedMessage
                                    id={'Apis.Details.Configuration.components.AdvertiseInfo'
                                    + '.originalDevPortalUrl.error'}
                                    defaultMessage='Invalid Original Developer Portal URL'
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
