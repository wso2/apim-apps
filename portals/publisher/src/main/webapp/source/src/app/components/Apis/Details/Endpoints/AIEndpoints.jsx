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
} from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { Progress } from 'AppComponents/Shared';
import API from 'AppData/api';
import Alert from 'AppComponents/Shared/Alert';
import EndpointSection from './MultiEndpointComponents/EndpointSection';

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
    api
}) => {
    const [productionEndpoints, setProductionEndpoints] = useState([]);
    const [sandboxEndpoints, setSandboxEndpoints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const intl = useIntl();

    const fetchEndpoints = () => {
        setLoading(true);
        const endpointsPromise = API.getApiEndpoints(api.id);
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

    const addEndpoint = (endpointBody) => {
        setSaving(true);
        const addEndpointPromise = API.addEndpoint(api.id, endpointBody);
        addEndpointPromise
            .then((response) => {
                const newEndpoint = response.body;

                if (newEndpoint.environment === 'PRODUCTION') {
                    setProductionEndpoints(prev => [...prev, newEndpoint]);
                } else if (newEndpoint.environment === 'SANDBOX') {
                    setSandboxEndpoints(prev => [...prev, newEndpoint]);
                }

                Alert.success(intl.formatMessage({
                    id: 'Apis.Details.Endpoints.endpoints.add.success',
                    defaultMessage: 'Endpoint added successfully!',
                }));
            }).catch((error) => {
                console.error(error);
                Alert.error(intl.formatMessage({
                    id: 'Apis.Details.Endpoints.endpoints.add.error',
                    defaultMessage: 'Something went wrong while adding the endpoint',
                }));
            }).finally(() => {
                setSaving(false);
            });
    };

    const updateEndpoint = (endpointId, endpointBody) => {
        setSaving(true);
        const updateEndpointPromise = API.updateEndpoint(api.id, endpointId, endpointBody);
        updateEndpointPromise
            .then((response) => {
                const updatedEndpoint = response.body;
                
                if (updatedEndpoint.environment === 'PRODUCTION') {
                    setProductionEndpoints(prev =>
                        prev.map(endpoint => (
                            endpoint.id === endpointId 
                                ? { ...endpoint, ...updatedEndpoint } 
                                : endpoint
                        ))
                    );
                } else if (updatedEndpoint.environment === 'SANDBOX') {
                    setSandboxEndpoints(prev =>
                        prev.map(endpoint => (
                            endpoint.id === endpointId 
                                ? { ...endpoint, ...updatedEndpoint } 
                                : endpoint
                        ))
                    );
                }
                
                Alert.success(intl.formatMessage({
                    id: 'Apis.Details.Endpoints.endpoints.update.success',
                    defaultMessage: 'Endpoint updated successfully!',
                }));
            }).catch((error) => {
                console.error(error);
                Alert.error(intl.formatMessage({
                    id: 'Apis.Details.Endpoints.endpoints.update.error',
                    defaultMessage: 'Something went wrong while updating the endpoint',
                }));
            }).finally(() => {
                setSaving(false);
            });
    };

    const deleteEndpoint = (endpointId, environment) => {
        setSaving(true);
        const deleteEndpointPromise = API.deleteEndpoint(api.id, endpointId);
        deleteEndpointPromise
            .then(() => {
                if (environment === 'PRODUCTION') {
                    setProductionEndpoints(prev => prev.filter(endpoint => endpoint.id !== endpointId));
                } else if (environment === 'SANDBOX') {
                    setSandboxEndpoints(prev => prev.filter(endpoint => endpoint.id !== endpointId));
                }

                Alert.success(intl.formatMessage({
                    id: 'Apis.Details.Endpoints.endpoints.delete.success',
                    defaultMessage: 'Endpoint deleted successfully!',
                }));
            }).catch((error) => {
                console.error(error);
                Alert.error(intl.formatMessage({
                    id: 'Apis.Details.Endpoints.endpoints.delete.error',
                    defaultMessage: 'Something went wrong while deleting the endpoint',
                }));
            }).finally(() => {
                setSaving(false);
            });
    };

    if (loading) {
        return <Progress per={90} message='Loading Endpoints ...' />;
    }

    return (
        <Root className={classes.overviewWrapper}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Paper className={classes.endpointContainer}>
                        <Typography id='itest-primary-endpoints-heading' variant='h6' component='h6'>
                            <FormattedMessage
                                id='Apis.Details.Endpoints.AIEndpoints.primary.endpoints.label'
                                defaultMessage='Primary Endpoints'
                            />
                        </Typography>
                        <EndpointSection />
                    </Paper>
                </Grid>
                <Grid item xs={12}>
                    <Paper className={classes.endpointContainer}>
                        <Typography id='itest-production-endpoints-heading' variant='h6' component='h6'>
                            <FormattedMessage
                                id='Apis.Details.Endpoints.AIEndpoints.production.endpoints.label'
                                defaultMessage='Production Endpoints'
                            />
                        </Typography>

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
                    </Paper>
                </Grid>
            </Grid>
        </Root>
    );

    // const { endpointConfig } = api;
    // const [endpointSecurityInfo, setEndpointSecurityInfo] = useState(null);
    // const [advanceConfigOptions, setAdvancedConfigOptions] = useState({
    //     open: false,
    //     index: 0,
    //     type: '',
    //     category: '',
    //     config: undefined,
    // });
    // const [endpointSecurityConfig, setEndpointSecurityConfig] = useState({
    //     open: false,
    //     type: '',
    //     category: '',
    //     config: undefined,
    // });

    // /**
    //  * Method to modify the endpoint represented by the given parameters.
    //  *
    //  * If url is null, remove the endpoint from the endpoint config.
    //  *
    //  * @param {number} index The index of the endpoint in the listing.
    //  * @param {string} category The endpoint category. (production/ sand box)
    //  * @param {string} url The new endpoint url.
    //  * */
    // const editEndpoint = (index, category, url) => {
    //     let modifiedEndpoint = null;
    //     // Make a copy of the endpoint config.
    //     const endpointConfigCopy = cloneDeep(epConfig);
    //     /*
    //     * If the index > 0, it means that the endpoint is load balance or fail over.
    //     * Otherwise it is the default endpoint. (index = 0)
    //     * */
    //     if (index > 0) {
    //         const endpointTypeProperty = getEndpointTypeProperty(endpointConfigCopy.endpoint_type, category);
    //         modifiedEndpoint = endpointConfigCopy[endpointTypeProperty];
    //         /*
    //         * In failover case, the failover endpoints are a separate object. But in endpoint listing, since we
    //         *  consider all the endpoints as a single list, to get the real index of the failover endpoint we use
    //         *  index - 1.
    //         * */
    //         if (endpointConfigCopy.endpoint_type === 'failover') {
    //             modifiedEndpoint[index - 1].url = url.trim();
    //         } else {
    //             modifiedEndpoint[index].url = url.trim();
    //         }
    //         endpointConfigCopy[endpointTypeProperty] = modifiedEndpoint;
    //     } else if (url !== '') {
    //         modifiedEndpoint = endpointConfigCopy[category];

    //         /*
    //         * In this case, we are editing the default endpoint.
    //         * If the endpoint type is load balance, the production_endpoints or the sandbox_endpoint object is an
    //         *  array. Otherwise, in failover mode, the default endpoint is an object.
    //         *
    //         * So, we check whether the endpoints is an array or an object.
    //         *
    //         * If This is the first time a user creating an endpoint endpoint config object does not have
    //         *  production_endpoints or sandbox_endpoints object.
    //         * Therefore create new object and add to the endpoint config.
    //         * */
    //         if (!modifiedEndpoint) {
    //             modifiedEndpoint = getEndpointTemplate(endpointConfigCopy.endpoint_type);
    //             modifiedEndpoint.url = url.trim();
    //         } else if (Array.isArray(modifiedEndpoint)) {
    //             if (url === '') {
    //                 modifiedEndpoint.splice(0, 1);
    //             } else {
    //                 modifiedEndpoint[0].url = url.trim();
    //             }
    //         } else {
    //             modifiedEndpoint.url = url.trim();
    //         }
    //         endpointConfigCopy[category] = modifiedEndpoint;
    //     } else {
    //         /*
    //         * If the url is empty, delete the respective endpoint object.
    //         * */
    //         delete endpointConfigCopy[category];
    //     }
    //     endpointsDispatcher({ action: category, value: modifiedEndpoint });

    // };

    // /**
    //  * Method to get the advance configuration from the selected endpoint.
    //  *
    //  * @param {number} index The selected endpoint index
    //  * @param {string} epType The type of the endpoint. (loadbalance/ failover)
    //  * @param {string} category The endpoint category (Production/ sandbox)
    //  * @return {object} The advance config object of the endpoint.
    //  * */
    // const getAdvanceConfig = (index, epType, category) => {
    //     const endpointTypeProperty = getEndpointTypeProperty(epType, category);
    //     let advanceConfig = {};
    //     if (index > 0) {
    //         if (epConfig.endpoint_type === 'failover') {
    //             advanceConfig = epConfig[endpointTypeProperty][index - 1].config;
    //         } else {
    //             advanceConfig = epConfig[endpointTypeProperty][index].config;
    //         }
    //     } else {
    //         const endpointInfo = epConfig[endpointTypeProperty];
    //         if (Array.isArray(endpointInfo)) {
    //             advanceConfig = endpointInfo[0].config;
    //         } else {
    //             advanceConfig = endpointInfo.config;
    //         }
    //     }
    //     return advanceConfig;
    // };

    // /**
    //  * Method to open/ close the advance configuration dialog. This method also sets some information about the
    //  * seleted endpoint type/ category and index.
    //  *
    //  * @param {number} index The index of the selected endpoint.
    //  * @param {string} type The endpoint type
    //  * @param {string} category The endpoint category.
    //  * */
    // const toggleAdvanceConfig = (index, type, category) => {
    //     const advanceEPConfig = getAdvanceConfig(index, type, category);
    //     setAdvancedConfigOptions(() => {
    //         return ({
    //             open: !advanceConfigOptions.open,
    //             index,
    //             type,
    //             category,
    //             config: advanceEPConfig === undefined ? {} : advanceEPConfig,
    //         });
    //     });
    // };

    // const saveEndpointSecurityConfig = (endpointSecurityObj, enType) => {
    //     const { type } = endpointSecurityObj;
    //     let newEndpointSecurityObj = endpointSecurityObj;
    //     const secretPlaceholder = '******';
    //     newEndpointSecurityObj.clientSecret = newEndpointSecurityObj.clientSecret
    //         === secretPlaceholder ? '' : newEndpointSecurityObj.clientSecret;
    //     newEndpointSecurityObj.password = newEndpointSecurityObj.password
    //         === secretPlaceholder ? '' : newEndpointSecurityObj.password;
    //     if (type === 'NONE') {
    //         newEndpointSecurityObj = { ...CONSTS.DEFAULT_ENDPOINT_SECURITY, type };
    //     } else {
    //         newEndpointSecurityObj.enabled = true;
    //     }
    //     endpointsDispatcher({
    //         action: 'endpointSecurity',
    //         value: {
    //             ...endpointSecurityInfo,
    //             [enType]: newEndpointSecurityObj,
    //         },
    //     });
    //     setEndpointSecurityConfig({ open: false });
    // };

    // /**
    //  * Method to save the advance configurations.
    //  *
    //  * @param {object} advanceConfig The advance configuration object.
    //  * */
    // const saveAdvanceConfig = (advanceConfig) => {
    //     const config = cloneDeep(epConfig);
    //     const endpointConfigProperty = getEndpointTypeProperty(
    //         advanceConfigOptions.type, advanceConfigOptions.category,
    //     );
    //     const selectedEndpoints = config[endpointConfigProperty];
    //     if (Array.isArray(selectedEndpoints)) {
    //         if (advanceConfigOptions.type === 'failover') {
    //             selectedEndpoints[advanceConfigOptions.index - 1].config = advanceConfig;
    //         } else {
    //             selectedEndpoints[advanceConfigOptions.index].config = advanceConfig;
    //         }
    //     } else {
    //         selectedEndpoints.config = advanceConfig;
    //     }
    //     setAdvancedConfigOptions({ open: false });
    //     endpointsDispatcher({
    //         action: 'set_advance_config',
    //         value: { ...config, [endpointConfigProperty]: selectedEndpoints },
    //     });
    // };

    // /**
    //  * Method to close the advance configuration dialog box.
    //  * */
    // const closeAdvanceConfig = () => {
    //     setAdvancedConfigOptions({ open: false });
    // };

    // return (
    //     <Root className={classes.overviewWrapper}>
    //         <Grid container spacing={2}>
    //             <h2>Hello</h2>
    //             <Grid item xs={12}>
    //                 <Paper className={classes.endpointContainer}>
    //                     <>
    //                         <Typography>
    //                             <FormattedMessage
    //                                 id={'Apis.Details.'
    //                                     + 'Endpoints.EndpointOverview'
    //                                     + '.production.endpoint'
    //                                     + '.production.label'}
    //                                 defaultMessage='Production Endpoint'
    //                             />
    //                         </Typography>
    //                         <GenericEndpoint
    //                             autoFocus
    //                             name={endpointType.key === 'prototyped'
    //                                 ? (
    //                                     <FormattedMessage
    //                                         id={'Apis.Details.Endpoints.'
    //                                             + 'EndpointOverview.prototype'
    //                                             + '.endpoint.prototype.header'}
    //                                         defaultMessage='Prototype Endpoint'
    //                                     />
    //                                 ) : (
    //                                     <FormattedMessage
    //                                         id={'Apis.Details.Endpoints.'
    //                                             + 'EndpointOverview.production'
    //                                             + '.endpoint.production.header'}
    //                                         defaultMessage='Production Endpoint'
    //                                     />
    //                                 )}
    //                             className={classes.defaultEndpointWrapper}
    //                             endpointURL={getEndpoints
    //                                 (
    //                                     'production_endpoints'
    //                                 )}
    //                             type=''
    //                             index={0}
    //                             category='production_endpoints'
    //                             editEndpoint={editEndpoint}
    //                             setAdvancedConfigOpen={toggleAdvanceConfig}
    //                             esCategory='production'
    //                             setESConfigOpen={toggleEndpointSecurityConfig}
    //                             ap
    //                             iId={api.id}
    //                         />
    //                         {api.subtypeConfiguration?.subtype === 'AIAPI' && // eslint-disable-line
    //                             (apiKeyParamConfig.authHeader || apiKeyParamConfig.authQueryParameter) &&
    //                             (<AIEndpointAuth
    //                                 api={api}
    //                                 saveEndpointSecurityConfig={savfeEndpointSecurityConfig}
    //                                 apiKeyParamConfig={apiKeyParamConfig}
    //                                 isProduction
    //                             />)}
    //                         {/* <div>
    //                             <FormattedMessage
    //                                 id={'Apis.Details.Endpoints.'
    //                                     + 'EndpointOverview.sandbox'
    //                                     + '.endpoint'}
    //                                 defaultMessage='Sandbox Endpoint'
    //                             />
    //                             <GenericEndpoint
    //                                 autoFocus
    //                                 name={(
    //                                     <FormattedMessage
    //                                         id={'Apis.Details.'
    //                                             + 'Endpoints.'
    //                                             + 'EndpointOverview.'
    //                                             + 'sandbox.'
    //                                             + 'endpoint.sandbox.'
    //                                             + 'header'}
    //                                         defaultMessage={
    //                                             'Sandbox '
    //                                             + 'Endpoint'}
    //                                     />
    //                                 )}
    //                                 className={classes.
    //                                     defaultEndpointWrapper}
    //                                 endpointURL={getEndpoints
    //                                     (
    //                                         'sandbox_endpoints'
    //                                     )}
    //                                 type=''
    //                                 index={0}
    //                                 category='sandbox_endpoints'
    //                                 editEndpoint={editEndpoint}
    //                                 esCategory='sandbox'
    //                                 setAdvancedConfigOpen=
    //                                 {toggleAdvanceConfig}
    //                                 setESConfigOpen=
    //                                 {toggleEndpointSecurityConfig}
    //                                 apiId={api.id}
    //                             />
    //                             {endpointCategory.sandbox && // eslint-disable-line
    //   (apiKeyParamConfig.authHeader || apiKeyParamConfig.authQueryParameter) && // eslint-disable-line
    //                                 (<AIEndpointAuth
    //                                     api={api}
    //    saveEndpointSecurityConfig={saveEndpointSecurityConfig} // eslint-disable-line
    //                                     apiKeyParamConfig={apiKeyParamConfig} // eslint-disable-line
    //                                 />)}
    //                         </div> */}
    //                     </>
    //                 </Paper>
    //             </Grid>
    //             <Grid item xs={12}>
    //                 <Typography variant='h4' align='left' className={classes.titleWrapper} gutterBottom>
    //                     <FormattedMessage
    //                         id='Apis.Details.Endpoints.EndpointOverview.general.config.header'
    //                         defaultMessage='General Endpoint Configurations'
    //                     />
    //                 </Typography>
    //                 <GeneralConfiguration
    //                     epConfig={(cloneDeep(epConfig))}
    //                     endpointType={endpointType}
    //                     endpointsDispatcher={endpointsDispatcher}
    //                 />
    //             </Grid>
    //         </Grid>
    //         {api.gatewayType !== 'wso2/apk' && (
    //             <Dialog open={advanceConfigOptions.open}>
    //                 <DialogTitle>
    //                     <Typography className={classes.configDialogHeader}>
    //                         <FormattedMessage
    //                             id='Apis.Details.Endpoints.EndpointOverview.advance.endpoint.configuration'
    //                             defaultMessage='Advanced Configurations'
    //                         />
    //                     </Typography>
    //                 </DialogTitle>
    //                 <DialogContent>
    //                     <AdvanceEndpointConfig
    //                         isSOAPEndpoint={endpointType.key === 'address'}
    //                         advanceConfig={advanceConfigOptions.config}
    //                         onSaveAdvanceConfig={saveAdvanceConfig}
    //                         onCancel={closeAdvanceConfig}
    //                     />
    //                 </DialogContent>
    //             </Dialog>
    //         )}
    //     </Root>
    // );
}

export default AIEndpoints;