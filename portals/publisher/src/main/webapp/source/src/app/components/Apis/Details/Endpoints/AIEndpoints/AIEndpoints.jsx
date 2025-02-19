/*
 * Copyright (c) 2025, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
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

import React, { useState, useEffect, useContext } from 'react';
import { styled } from '@mui/material/styles';
import {
    Grid,
    Paper,
    Typography,
    Button,
} from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { Progress } from 'AppComponents/Shared';
import API from 'AppData/api';
import { isRestricted } from 'AppData/AuthManager';
import { APIContext } from 'AppComponents/Apis/Details/components/ApiContext';
import Alert from 'AppComponents/Shared/Alert';
import AddCircle from '@mui/icons-material/AddCircle';
import CONSTS from 'AppData/Constants';
import EndpointCard from '../MultiEndpointComponents/EndpointCard';
import GeneralEndpointConfigurations from '../MultiEndpointComponents/GeneralEndpointConfigurations';

const PREFIX = 'AIEndpoints';

const classes = {
    listing: `${PREFIX}-listing`,
    endpointContainer: `${PREFIX}-endpointContainer`,
    endpointName: `${PREFIX}-endpointName`,
    endpointTypesWrapper: `${PREFIX}-endpointTypesWrapper`,
    sandboxHeading: `${PREFIX}-sandboxHeading`,
    radioGroup: `${PREFIX}-radioGroup`,
    endpointsWrapperLeft: `${PREFIX}-endpointsWrapperLeft`,
    endpointsWrapperRight: `${PREFIX}-endpointsWrapperRight`,
    endpointsTypeSelectWrapper: `${PREFIX}-endpointsTypeSelectWrapper`,
    endpointTypesSelectWrapper: `${PREFIX}-endpointTypesSelectWrapper`,
    defaultEndpointWrapper: `${PREFIX}-defaultEndpointWrapper`,
    configDialogHeader: `${PREFIX}-configDialogHeader`,
    addLabel: `${PREFIX}-addLabel`,
    buttonIcon: `${PREFIX}-buttonIcon`,
    button: `${PREFIX}-button`,
    btn: `${PREFIX}-btn`,
};

const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.listing}`]: {
        margin: theme.spacing(1),
        padding: theme.spacing(1),
    },

    [`& .${classes.endpointContainer}`]: {
        paddingLeft: theme.spacing(2),
        padding: theme.spacing(1),
    },

    [`& .${classes.endpointName}`]: {
        paddingLeft: theme.spacing(1),
        fontSize: '1rem',
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
    },

    [`& .${classes.endpointTypesWrapper}`]: {
        padding: theme.spacing(3),
        marginTop: theme.spacing(2),
    },

    [`& .${classes.sandboxHeading}`]: {
        display: 'flex',
        alignItems: 'center',
    },

    [`& .${classes.radioGroup}`]: {
        display: 'flex',
        flexDirection: 'row',
    },

    [`& .${classes.endpointsWrapperLeft}`]: {
        padding: theme.spacing(1),
        borderRight: '#c4c4c4',
        borderRightStyle: 'solid',
        borderRightWidth: 'thin',
    },

    [`& .${classes.endpointsWrapperRight}`]: {
        padding: theme.spacing(1),
    },

    [`& .${classes.endpointsTypeSelectWrapper}`]: {
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(2),
        padding: theme.spacing(1),
        display: 'flex',
        justifyContent: 'space-between',
    },

    [`& .${classes.endpointTypesSelectWrapper}`]: {
        display: 'flex',
    },

    [`& .${classes.defaultEndpointWrapper}`]: {
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
        marginRight: theme.spacing(1),
    },

    [`& .${classes.configDialogHeader}`]: {
        fontWeight: '600',
    },

    [`& .${classes.addLabel}`]: {
        padding: theme.spacing(2),
    },

    [`& .${classes.buttonIcon}`]: {
        marginRight: theme.spacing(1),
    },

    [`& .${classes.button}`]: {
        textTransform: 'none',
    },

    [`& .${classes.btn}`]: {
        marginRight: theme.spacing(0.5),
    },

    [`& .${classes.endpointInputWrapper}`]: {
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
    },

    [`& .${classes.textField}`]: {
        width: '100%',
    },

    [`& .${classes.input}`]: {
        marginLeft: theme.spacing(1),
        flex: 1,
    },

    [`& .${classes.iconButton}`]: {
        padding: theme.spacing(1),
    }
}));


const AIEndpoints = ({
    apiObject,
    apiKeyParamConfig,
}) => {
    const [productionEndpoints, setProductionEndpoints] = useState([]);
    const [sandboxEndpoints, setSandboxEndpoints] = useState([]);
    const [showAddProductionEndpoint, setShowAddProductionEndpoint] = useState(false);
    const [showAddSandboxEndpoint, setShowAddSandboxEndpoint] = useState(false);
    const [primaryProductionEndpoint, setPrimaryProductionEndpoint] = useState(null);
    const [primarySandboxEndpoint, setPrimarySandboxEndpoint] = useState(null);
    const [endpointList, setEndpointList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const intl = useIntl();
    const { updateAPI } = useContext(APIContext);

    const fetchEndpoints = () => {
        setLoading(true);
        const endpointsPromise = API.getApiEndpoints(apiObject.id);
        endpointsPromise
            .then((response) => {
                const endpoints = response.body.list;

                // Filter endpoints based on endpoint type
                const prodEndpointList = endpoints.filter((endpoint) => endpoint.deploymentStage === 'PRODUCTION');
                const sandEndpointList = endpoints.filter((endpoint) => endpoint.deploymentStage === 'SANDBOX');
                setProductionEndpoints(prodEndpointList);
                setSandboxEndpoints(sandEndpointList);

                // Loop through endpoints and add endpointList
                const tempEndpointUrlList = [];
                for (const prodEndpoint of prodEndpointList) {
                    tempEndpointUrlList.push(prodEndpoint.endpointConfig?.production_endpoints);
                }
                for (const sandEndpoint of sandEndpointList) {
                    tempEndpointUrlList.push(sandEndpoint.endpointConfig?.sandbox_endpoints);
                }
                setEndpointList(tempEndpointUrlList);

            }).catch((error) => {
                console.error(error);
                Alert.error(intl.formatMessage({
                    id: 'Apis.Details.Endpoints.endpoints.fetch.error',
                    defaultMessage: 'Something went wrong while fetching endpoints',
                }));
            }).finally(() => {
                setLoading(false);
            });
    }

    useEffect(() => {
        fetchEndpoints();
    }, []);

    /**
     * Set primary endpoints
     */
    useEffect(() => {
        const { primaryProductionEndpointId, primarySandboxEndpointId } = apiObject;
        if (primaryProductionEndpointId) {
            setPrimaryProductionEndpoint(
                productionEndpoints.find(
                    (endpoint) => endpoint.id === primaryProductionEndpointId,
                ),
            );
        }
        if (primarySandboxEndpointId) {
            setPrimarySandboxEndpoint(
                sandboxEndpoints.find(
                    (endpoint) => endpoint.id === primarySandboxEndpointId,
                ),
            );
        }
    }, [productionEndpoints, sandboxEndpoints]);

    const toggleAddProductionEndpoint = () => {
        setShowAddProductionEndpoint(!showAddProductionEndpoint);
    };

    const toggleAddSandboxEndpoint = () => {
        setShowAddSandboxEndpoint(!showAddSandboxEndpoint);
    };

    const getDefaultEndpoint = (deploymentStage) => {
        return {
            ...CONSTS.DEFAULT_ENDPOINT,
            deploymentStage,
        }
    };

    const handlePrimaryEndpointChange = (deploymentStage, event) => {
        if (deploymentStage === CONSTS.DEPLOYMENT_STAGE.production) {
            setPrimaryProductionEndpoint(event.target.value);
        } else if (deploymentStage === CONSTS.DEPLOYMENT_STAGE.sandbox) {
            setPrimarySandboxEndpoint(event.target.value);
        }
    };

    const savePrimaryEndpoints = () => {
        setSaving(true);
        // Verify if production and/or sandbox primary endpoints are selected
        if (!primaryProductionEndpoint && !primarySandboxEndpoint) {
            Alert.error(intl.formatMessage({
                id: 'Apis.Details.Endpoints.primary.endpoints.save.error',
                defaultMessage: 'Please select at least one primary endpoint',
            }));
            setSaving(false);
            return;
        }

        const updatePromise = updateAPI({
            primaryProductionEndpointId: primaryProductionEndpoint?.id,
            primarySandboxEndpointId: primarySandboxEndpoint?.id,
        });
        updatePromise
            .catch((error) => {
                console.error(error);
                Alert.error(intl.formatMessage({
                    id: 'Apis.Details.Endpoints.primary.endpoints.save.error',
                    defaultMessage: 'Error occurred while saving primary endpoints',
                }));
            }
            ).finally(() => {
                setSaving(false);
            });
    };

    const resetPrimaryEndpoints = () => {
        const { primaryProductionEndpointId, primarySandboxEndpointId } = apiObject;

        // Reset primary production endpoint
        if (primaryProductionEndpointId) {
            setPrimaryProductionEndpoint(
                productionEndpoints.find(
                    (endpoint) => endpoint.id === primaryProductionEndpointId,
                ),
            );
        } else {
            setPrimaryProductionEndpoint(null);
        }

        // Reset primary sandbox endpoint
        if (primarySandboxEndpointId) {
            setPrimarySandboxEndpoint(
                sandboxEndpoints.find(
                    (endpoint) => endpoint.id === primarySandboxEndpointId,
                ),
            );
        } else {
            setPrimarySandboxEndpoint(null);
        }
    }

    if (loading) {
        return <Progress per={90} message='Loading Endpoints ...' />;
    }

    return (
        <Root className={classes.overviewWrapper}>
            <Grid container rowSpacing={2}>
                <Grid item xs={12}>
                    <Paper className={classes.endpointContainer}>
                        <Typography id='itest-primary-endpoints-heading' variant='h6' component='h6'>
                            <FormattedMessage
                                id='Apis.Details.Endpoints.AIEndpoints.primary.endpoints.label'
                                defaultMessage='Primary Endpoints'
                            />
                        </Typography>
                        <Grid container direction='row' justifyContent='center' display='flex' spacing={2}>
                            <Grid item xs={6} mt={2} mb={2}>
                                <FormControl size='small' sx={{ width: '100%' }}>
                                    <InputLabel id='primary-production-endpoint-label'>
                                        <FormattedMessage
                                            id='Apis.Details.Endpoints.AIEndpoints.primary.production.endpoint.label'
                                            defaultMessage='Primary Production Endpoint'
                                        />
                                    </InputLabel>
                                    <Select
                                        labelId='primary-production-endpoint-label'
                                        id='primary-production-endpoint'
                                        value={primaryProductionEndpoint || ''}
                                        label='Primary Production Endpoint'
                                        onChange={
                                            (e) => handlePrimaryEndpointChange(CONSTS.DEPLOYMENT_STAGE.production, e)
                                        }
                                    >
                                        <MenuItem value=''>
                                            <em>None</em>
                                        </MenuItem>
                                        {productionEndpoints.map((endpoint) => (
                                            <MenuItem key={endpoint.id} value={endpoint}>{endpoint.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6} mt={2} mb={2}>
                                <FormControl size='small' sx={{ width: '100%' }}>
                                    <InputLabel id='primary-sandbox-endpoint-label'>
                                        <FormattedMessage
                                            id='Apis.Details.Endpoints.AIEndpoints.primary.sandbox.endpoint.label'
                                            defaultMessage='Primary Sandbox Endpoint'
                                        />
                                    </InputLabel>
                                    <Select
                                        labelId='primary-sandbox-endpoint-label'
                                        id='primary-sandbox-endpoint'
                                        value={primarySandboxEndpoint || ''}
                                        label='Primary Sandbox Endpoint'
                                        onChange={
                                            (e) => handlePrimaryEndpointChange(CONSTS.DEPLOYMENT_STAGE.sandbox, e)
                                        }
                                    >
                                        <MenuItem value=''>
                                            <em>None</em>
                                        </MenuItem>
                                        {sandboxEndpoints.map((endpoint) => (
                                            <MenuItem key={endpoint.id} value={endpoint}>{endpoint.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                        <Grid container justifyContent='flex-start'>
                            <Button
                                id='save-primary-endpoints'
                                variant='contained'
                                color='primary'
                                size='small'
                                className={classes.btn}
                                disabled={
                                    isRestricted(['apim:api_create', 'apim:api_publish'], apiObject)
                                    || (!primaryProductionEndpoint && !primarySandboxEndpoint)
                                    || saving
                                }
                                onClick={() => savePrimaryEndpoints()}
                            >
                                {saving ?
                                    <FormattedMessage
                                        id='Apis.Details.Endpoints.AIEndpoints.saving.primary.endpoints'
                                        defaultMessage='Saving'
                                    />
                                    :
                                    <FormattedMessage
                                        id='Apis.Details.Endpoints.AIEndpoints.save.primary.endpoints'
                                        defaultMessage='Save'
                                    />
                                }
                            </Button>
                            <Button
                                id='reset-primary-endpoints'
                                variant='outlined'
                                color='primary'
                                size='small'
                                className={classes.btn}
                                disabled={isRestricted(['apim:api_create', 'apim:api_publish'], apiObject)}
                                onClick={() => resetPrimaryEndpoints()}
                            >
                                <FormattedMessage
                                    id='Apis.Details.Endpoints.AIEndpoints.reset.primary.endpoints'
                                    defaultMessage='Reset'
                                />
                            </Button>
                        </Grid>
                    </Paper>
                </Grid>
                <Grid item xs={12}>
                    <Paper className={classes.endpointContainer}>
                        <Grid container justifyContent='flex-start'>
                            <Typography id='itest-production-endpoints-heading' variant='h6' component='h6'>
                                <FormattedMessage
                                    id='Apis.Details.Endpoints.AIEndpoints.production.endpoints.label'
                                    defaultMessage='Production Endpoints'
                                />
                            </Typography>
                            <Grid ml={1}>
                                <Button
                                    id='add-new-production-endpoint'
                                    variant='outlined'
                                    color='primary'
                                    size='small'
                                    onClick={toggleAddProductionEndpoint}
                                    disabled={
                                        isRestricted(['apim:api_create', 'apim:api_publish'], apiObject)
                                        || showAddProductionEndpoint
                                    }
                                >
                                    <AddCircle className={classes.buttonIcon} />
                                    <FormattedMessage
                                        id='Apis.Details.Endpoints.AIEndpoints.add.new.endpoint'
                                        defaultMessage='Add New Endpoint'
                                    />
                                </Button>
                            </Grid>
                        </Grid>
                        {showAddProductionEndpoint && (
                            <EndpointCard
                                key='add-new-production-endpoint'
                                endpoint={getDefaultEndpoint(CONSTS.DEPLOYMENT_STAGE.production)}
                                apiObject={apiObject}
                                apiKeyParamConfig={apiKeyParamConfig}
                                setProductionEndpoints={setProductionEndpoints}
                                showAddEndpoint
                                setShowAddEndpoint={setShowAddProductionEndpoint}
                            />
                        )}
                        {productionEndpoints.map((endpoint) => (
                            <EndpointCard
                                key={endpoint.id}
                                endpoint={endpoint}
                                apiObject={apiObject}
                                apiKeyParamConfig={apiKeyParamConfig}
                                setProductionEndpoints={setProductionEndpoints}
                                showAddEndpoint={false}
                            />
                        ))}
                    </Paper>
                </Grid>
                <Grid item xs={12}>
                    <Paper className={classes.endpointContainer}>
                        <Grid container justifyContent='flex-start'>
                            <Typography id='itest-sandbox-endpoints-heading' variant='h6' component='h6'>
                                <FormattedMessage
                                    id='Apis.Details.Endpoints.AIEndpoints.sandbox.endpoints.label'
                                    defaultMessage='Sandbox Endpoints'
                                />
                            </Typography>
                            <Grid ml={1}>
                                <Button
                                    id='add-new-sandbox-endpoint'
                                    variant='outlined'
                                    color='primary'
                                    size='small'
                                    onClick={toggleAddSandboxEndpoint}
                                    disabled={
                                        isRestricted(['apim:api_create', 'apim:api_publish'], apiObject)
                                        || showAddSandboxEndpoint
                                    }
                                >
                                    <AddCircle className={classes.buttonIcon} />
                                    <FormattedMessage
                                        id='Apis.Details.Endpoints.AIEndpoints.add.new.endpoint'
                                        defaultMessage='Add New Endpoint'
                                    />
                                </Button>
                            </Grid>
                        </Grid>
                        {showAddSandboxEndpoint && (
                            <EndpointCard
                                key='add-new-sandbox-endpoint'
                                endpoint={getDefaultEndpoint(CONSTS.DEPLOYMENT_STAGE.sandbox)}
                                apiObject={apiObject}
                                apiKeyParamConfig={apiKeyParamConfig}
                                setSandboxEndpoints={setSandboxEndpoints}
                                showAddEndpoint
                                setShowAddEndpoint={setShowAddSandboxEndpoint}
                            />
                        )}
                        {sandboxEndpoints.map((endpoint) => (
                            <EndpointCard
                                key={endpoint.id}
                                endpoint={endpoint}
                                apiObject={apiObject}
                                apiKeyParamConfig={apiKeyParamConfig}
                                setSandboxEndpoints={setSandboxEndpoints}
                                showAddEndpoint={false}
                            />
                        ))}
                    </Paper>
                </Grid>
                <Grid item xs={12}>
                    <Paper className={classes.endpointContainer}>
                        <Typography id='itest-sandbox-endpoints-heading' variant='h6' component='h6'>
                            <FormattedMessage
                                id='Apis.Details.Endpoints.AIEndpoints.general.config.header'
                                defaultMessage='General Endpoint Configurations'
                            />
                        </Typography>
                        <GeneralEndpointConfigurations
                            endpointList={endpointList}
                        />
                    </Paper>
                </Grid>
            </Grid>
        </Root>
    );
}

export default AIEndpoints;
