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

import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import {
    Grid,
    Paper,
    Typography,
    // Box,
    Button,
} from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { Progress } from 'AppComponents/Shared';
import API from 'AppData/api';
import { isRestricted } from 'AppData/AuthManager';
import Alert from 'AppComponents/Shared/Alert';
import AddCircle from '@mui/icons-material/AddCircle';
import CONSTS from 'AppData/Constants';
import EndpointCard from './MultiEndpointComponents/EndpointCard';

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
    button: `${PREFIX}-button`
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
    const [showAddEndpoint, setShowAddEndpoint] = useState(false);
    const [loading, setLoading] = useState(true);

    const intl = useIntl();

    const fetchEndpoints = () => {
        setLoading(true);
        const endpointsPromise = API.getApiEndpoints(apiObject.id);
        endpointsPromise
            .then((response) => {
                const endpoints = response.body.list;
                
                // Filter endpoints based on endpoint type
                const prodEndpointList = endpoints.filter((endpoint) => endpoint.environment === 'PRODUCTION');
                const sandEndpointList = endpoints.filter((endpoint) => endpoint.environment === 'SANDBOX');
                setProductionEndpoints(prodEndpointList);
                setSandboxEndpoints(sandEndpointList);

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

    const toggleAddEndpoint = () => {
        setShowAddEndpoint(!showAddEndpoint);
    };

    const getDefaultEndpoint = (environment) => {
        return {
            ...CONSTS.DEFAULT_ENDPOINT,
            environment,
        }
    };

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
                                    id='add-new-endpoint'
                                    variant='outlined'
                                    color='primary'
                                    size='small'
                                    onClick={toggleAddEndpoint}
                                    disabled={isRestricted(['apim:api_create', 'apim:api_publish'], apiObject)}
                                >
                                    <AddCircle className={classes.buttonIcon} />
                                    <FormattedMessage
                                        id='Apis.Details.Endpoints.AIEndpoints.add.new.endpoint'
                                        defaultMessage='Add New Endpoint'
                                    />
                                </Button>
                            </Grid>
                        </Grid>
                        {showAddEndpoint && (
                            <EndpointCard
                                key='add-new-production-endpoint'
                                endpoint={getDefaultEndpoint(CONSTS.ENVIRONMENTS.production)}
                                apiObject={apiObject}
                                apiKeyParamConfig={apiKeyParamConfig}
                                setProductionEndpoints={setProductionEndpoints}
                                showAddEndpoint
                                setShowAddEndpoint={setShowAddEndpoint}
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
                        <Typography id='itest-sandbox-endpoints-heading' variant='h6' component='h6'>
                            <FormattedMessage
                                id='Apis.Details.Endpoints.AIEndpoints.sandbox.endpoints.label'
                                defaultMessage='Sandbox Endpoints'
                            />
                        </Typography>
                        {showAddEndpoint && (
                            <EndpointCard
                                key='add-new-sandbox-endpoint'
                                endpoint={getDefaultEndpoint(CONSTS.ENVIRONMENTS.sandbox)}
                                apiObject={apiObject}
                                apiKeyParamConfig={apiKeyParamConfig}
                                setSandboxEndpoints={setSandboxEndpoints}
                                showAddEndpoint
                                setShowAddEndpoint={setShowAddEndpoint}
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
                    <Typography variant='h4' align='left' className={classes.titleWrapper} gutterBottom>
                        <FormattedMessage
                            id='Apis.Details.Endpoints.AIEndpoints.general.config.header'
                            defaultMessage='General Endpoint Configurations'
                        />
                    </Typography>
                    {/* <GeneralEndpointConfigurations
                        
                    /> */}
                </Grid>
            </Grid>
        </Root>
    );
}

export default AIEndpoints;