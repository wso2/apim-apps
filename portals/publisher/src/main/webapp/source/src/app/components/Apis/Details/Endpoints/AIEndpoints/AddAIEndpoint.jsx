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

import React, { useState, useEffect, useReducer } from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    Grid,
    Paper,
    Typography,
    FormControl,
    TextField,
    Button,
    CircularProgress,
    Icon,
    InputAdornment,
    Chip,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
} from '@mui/material';
import CONSTS from 'AppData/Constants';
import { Link } from 'react-router-dom';
import API from 'AppData/api';
import { green } from '@mui/material/colors';
import Alert from 'AppComponents/Shared/Alert';
import { isRestricted } from 'AppData/AuthManager';
import AdvanceEndpointConfig from '../AdvancedConfig/AdvanceEndpointConfig';
import AIEndpointAuth from '../AIEndpointAuth';

const PREFIX = 'AddAIEndpoint';

const classes = {
    root: `${PREFIX}-root`,
    titleWrapper: `${PREFIX}-titleWrapper`,
    titleLink: `${PREFIX}-titleLink`,
    contentWrapper: `${PREFIX}-contentWrapper`,
    mainTitle: `${PREFIX}-mainTitle`,
    FormControl: `${PREFIX}-FormControl`,
    FormControlOdd: `${PREFIX}-FormControlOdd`,
    FormControlLabel: `${PREFIX}-FormControlLabel`,
    buttonSection: `${PREFIX}-buttonSection`,
    saveButton: `${PREFIX}-saveButton`,
    helpText: `${PREFIX}-helpText`,
    extraPadding: `${PREFIX}-extraPadding`,
    actionButtonSection: `${PREFIX}-actionButtonSection`,
    titleGrid: `${PREFIX}-titleGrid`,
    descriptionForm: `${PREFIX}-descriptionForm`,
    progress: `${PREFIX}-progress`,
    endpointCardWrapper: `${PREFIX}-endpointCardWrapper`,
    textField: `${PREFIX}-textField`,
    btn: `${PREFIX}-btn`,
    iconButton: `${PREFIX}-iconButton`,
    iconButtonValid: `${PREFIX}-iconButtonValid`,
    endpointValidChip: `${PREFIX}-endpointValidChip`,
    endpointInvalidChip: `${PREFIX}-endpointInvalidChip`,
    endpointErrorChip: `${PREFIX}-endpointErrorChip`,
}

const StyledGrid = styled(Grid)((
    {
        theme
    }
) => ({
    [`& .${classes.root}`]: {
        flexGrow: 1,
        marginTop: 10,
        display: 'flex',
        flexDirection: 'column',
        padding: 20,
    },

    [`& .${classes.titleWrapper}`]: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing(3),
    },

    [`& .${classes.titleLink}`]: {
        color: theme.palette.primary.main,
        marginRight: theme.spacing(1),
    },

    [`& .${classes.contentWrapper}`]: {
        maxWidth: theme.custom.contentAreaWidth,
    },

    [`& .${classes.mainTitle}`]: {
        paddingLeft: 0,
    },

    [`& .${classes.FormControl}`]: {
        padding: `0 0 0 ${theme.spacing(1)}`,
        width: '100%',
        marginTop: 0,
    },

    [`& .${classes.FormControlOdd}`]: {
        padding: `0 0 0 ${theme.spacing(1)}`,
        backgroundColor: theme.palette.background.paper,
        width: '100%',
        marginTop: 0,
    },

    [`& .${classes.FormControlLabel}`]: {
        marginBottom: theme.spacing(1),
        marginTop: theme.spacing(1),
        fontSize: theme.typography.caption.fontSize,
    },

    [`& .${classes.buttonSection}`]: {
        paddingTop: theme.spacing(3),
    },

    [`& .${classes.saveButton}`]: {
        marginRight: theme.spacing(1),
    },

    [`& .${classes.helpText}`]: {
        color: theme.palette.text.hint,
        marginTop: theme.spacing(1),
    },

    [`& .${classes.extraPadding}`]: {
        paddingLeft: theme.spacing(2),
    },

    [`& .${classes.actionButtonSection}`]: {
        paddingTop: 40,
    },

    [`& .${classes.titleGrid}`]: {
        ' & .MuiGrid-item': {
            padding: 0,
            margin: 0,
        },
    },

    [`& .${classes.descriptionForm}`]: {
        marginTop: theme.spacing(1),
    },

    [`& .${classes.progress}`]: {
        marginLeft: theme.spacing(1),
    },

    [`& .${classes.endpointCardWrapper}`]: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },

    [`& .${classes.textField}`]: {
        width: '100%',
    },

    [`& .${classes.btn}`]: {
        marginRight: theme.spacing(0.5),
    },

    [`& .${classes.iconButton}`]: {
        padding: theme.spacing(1),
    },

    [`& .${classes.iconButtonValid}`]: {
        padding: theme.spacing(1),
        color: green[500],
    },

    [`& .${classes.endpointValidChip}`]: {
        color: 'green',
        border: '1px solid green',
    },

    [`& .${classes.endpointInvalidChip}`]: {
        color: '#ffd53a',
        border: '1px solid #ffd53a',
    },

    [`& .${classes.endpointErrorChip}`]: {
        color: 'red',
        border: '1px solid red',
    },
}));

/**
 * Reducer to manage endpoint state
 * @param {JSON} state state
 * @param {JSON} param1 field and value
 * @returns {Promise} promised State
 */
function endpointReducer(state, { field, value }) {
    switch (field) {
        case 'name':
            return { ...state, [field]: value };
        case 'updateProductionEndpointUrl':
            return {
                ...state,
                endpointConfig: {
                    ...state.endpointConfig,
                    production_endpoints: { url: value },
                },
            }
        case 'updateSandboxEndpointUrl':
            return {
                ...state,
                endpointConfig: {
                    ...state.endpointConfig,
                    sandbox_endpoints: { url: value },
                },
            }
        case 'updateEndpointSecurity':
            return {
                ...state,
                endpointConfig: {
                    ...state.endpointConfig,
                    endpoint_security: {
                        ...state.endpointConfig.endpoint_security,
                        ...value
                    },
                },
            }
        case 'updateProductionAdvancedConfiguration':
            return {
                ...state,
                endpointConfig: {
                    ...state.endpointConfig,
                    production_endpoints: {
                        ...state.endpointConfig.production_endpoints,
                        ...value
                    },
                },
            }
        case 'updateSandboxAdvancedConfiguration':
            return {
                ...state,
                endpointConfig: {
                    ...state.endpointConfig,
                    sandbox_endpoints: {
                        ...state.endpointConfig.sandbox_endpoints,
                        ...value
                    },
                },
            }
        default:
            return state;
    }
}

const AddAIEndpoint = ({
    apiObject,
    history
}) => {
    const [category, setCategory] = useState('');
    const [isProduction, setProduction] = useState(false);
    const [isEndpointValid, setIsEndpointValid] = useState();
    const [statusCode, setStatusCode] = useState('');
    const [isUpdating, setUpdating] = useState(false);
    const [isErrorCode, setIsErrorCode] = useState(false);
    const [endpointUrl, setEndpointUrl] = useState('');
    const [advanceConfig, setAdvancedConfig] = useState({});
    const [advancedConfigOpen, setAdvancedConfigOpen] = useState(false);
    const [state, dispatch] = useReducer(endpointReducer, CONSTS.DEFAULT_ENDPOINT);
    const [apiKeyParamConfig, setApiKeyParamConfig] = useState({
        authHeader: null,
        authQueryParameter: null
    });
    const [isEndpointSaving, setEndpointSaving] = useState(false);
    const iff = (condition, then, otherwise) => (condition ? then : otherwise);
    const intl = useIntl();

    const urlPrefix = apiObject.apiType === API.CONSTS.APIProduct ? 'api-products' : 'apis';
    const url = `/${urlPrefix}/${apiObject.id}/endpoints`;

    useEffect(() => {
        if (API.subtypeConfiguration?.subtype === 'AIAPI') {
            API.getLLMProviderEndpointConfiguration(
                JSON.parse(apiObject.subtypeConfiguration.configuration).llmProviderId)
                .then((response) => {
                    if (response.body) {
                        const config = response.body;
                        setApiKeyParamConfig(config);
                    }
                });
        }
    }, []);
    
    useEffect(() => {
        setProduction(state.deploymentStage === CONSTS.DEPLOYMENT_STAGE.production);
        try {
            if (state.deploymentStage === CONSTS.DEPLOYMENT_STAGE.production) {
                setCategory('production_endpoints');
                setEndpointUrl(state.endpointConfig.production_endpoints?.url);
                setAdvancedConfig(state.endpointConfig.production_endpoints?.config ?
                    state.endpointConfig.production_endpoints.config : {}
                );
            } else if (state.deploymentStage === CONSTS.DEPLOYMENT_STAGE.sandbox) {
                setCategory('sandbox_endpoints');
                setEndpointUrl(state.endpointConfig.sandbox_endpoints?.url);
                setAdvancedConfig(state.endpointConfig.sandbox_endpoints?.config ?
                    state.endpointConfig.sandbox_endpoints.config : {}
                );
            }
        } catch (error) {
            console.error('Failed to extract endpoint URL from the endpoint object', error);
        }
    }, [state]);

    const addEndpoint = (endpointBody) => {
        setEndpointSaving(true);
        const addEndpointPromise = API.addApiEndpoint(apiObject.id, endpointBody);
        addEndpointPromise
            .then(() => {
                Alert.success(intl.formatMessage({
                    id: 'Apis.Details.Endpoints.endpoints.add.success',
                    defaultMessage: 'Endpoint added successfully!',
                }));
                const redirectURL = `/${urlPrefix}/${apiObject.id}/endpoints`;
                history.pushState(redirectURL);
                
            }).catch((error) => {
                console.error(error);
                Alert.error(intl.formatMessage({
                    id: 'Apis.Details.Endpoints.endpoints.add.error',
                    defaultMessage: 'Something went wrong while adding the endpoint',
                }));
            }).finally(() => {
                setEndpointSaving(false);
            });
    };

    const saveEndpointSecurityConfig = (endpointSecurityObj, enType) => {
        const newEndpointSecurityObj = endpointSecurityObj;
        const secretPlaceholder = '******';
        newEndpointSecurityObj.clientSecret = newEndpointSecurityObj.clientSecret
            === secretPlaceholder ? '' : newEndpointSecurityObj.clientSecret;
        newEndpointSecurityObj.password = newEndpointSecurityObj.password
            === secretPlaceholder ? '' : newEndpointSecurityObj.password;
        newEndpointSecurityObj.enabled = true;

        dispatch({
            field: 'updateEndpointSecurity',
            value: {
                [enType]: newEndpointSecurityObj,
            },
        });
    };

    /**
     * Method to test the endpoint.
     * @param {String} endpointURL Endpoint URL 
     * @param {String} apiID API ID 
     */
    function testEndpoint(endpointURL, apiID) {
        setUpdating(true);
        const restApi = new API();
        restApi.testEndpoint(endpointURL, apiID)
            .then((result) => {
                if (result.body.error !== null) {
                    setStatusCode(result.body.error);
                    setIsErrorCode(true);
                } else {
                    setStatusCode(result.body.statusCode + ' ' + result.body.statusMessage);
                    setIsErrorCode(false);
                }
                if (result.body.statusCode >= 200 && result.body.statusCode < 300) {
                    setIsEndpointValid(true);
                    setIsErrorCode(false);
                } else {
                    setIsEndpointValid(false);
                }
            }).finally(() => {
                setUpdating(false);
            });
    }

    const handleEndpointBlur = () => {
        if (category === 'production_endpoints') {
            dispatch({ field: 'updateProductionEndpointUrl', value: endpointUrl.trim() });
        } else if (category === 'sandbox_endpoints') {
            dispatch({ field: 'updateSandboxEndpointUrl', value: endpointUrl.trim() });
        }
    };

    /**
     * Method to check whether the endpoint has errors.
     * @returns {boolean} Whether the endpoint has errors
     */
    const endpointHasErrors = () => {
        if (!state.name || !endpointUrl) {
            // TODO: check apikey textfield error
            return true;
        } else {
            return false;
        }
    };
    
    /**
     * Method to open the advanced configuration dialog box.
     */
    const handleAdvancedConfigOpen = () => {
        setAdvancedConfigOpen(true);
    };

    /**
     * Method to close the advanced configurations dialog box.
     */
    const handleAdvancedConfigClose = () => {
        setAdvancedConfigOpen(false);
    };

    /**
     * Method to save the advance configurations.
     *
     * @param {object} advanceConfigObj The advance configuration object
     * */
    const saveAdvanceConfig = (advanceConfigObj) => {
        setAdvancedConfig(advanceConfigObj);
        if (category === 'production_endpoints') {
            dispatch({
                field: 'updateProductionAdvancedConfiguration',
                value: {
                    config: advanceConfigObj,
                },
            });
        } else if (category === 'sandbox_endpoints') {
            dispatch({
                field: 'updateSandboxAdvancedConfiguration',
                value: {
                    config: advanceConfigObj,
                },
            });
        }
        handleAdvancedConfigClose();
    };
    
        
    return (
        <StyledGrid container spacing={3}>
            <Grid item sm={12} md={12} />
            {/*
            Following two grids control the placement of whole create page
            For centering the content better use `container` props, but instead used an empty grid item for flexibility
             */}
            <Grid item sm={0} md={0} lg={2} />
            <Grid item sm={12} md={12} lg={8}>
                <Grid container spacing={5} className={classes.titleGrid}>
                    <Grid item md={12}>
                        <div className={classes.titleWrapper}>
                            <Link to={url} className={classes.titleLink}>
                                <Typography variant='h4' component='h2'>
                                    <FormattedMessage
                                        id='Apis.Details.Endpoints.AIEndpoints.AddAIEndpoint.heading'
                                        defaultMessage='Endpoints'
                                    />
                                </Typography>
                            </Link>
                            <Icon>keyboard_arrow_right</Icon>
                            <Typography variant='h4' component='h3'>
                                <FormattedMessage
                                    id='Apis.Details.Endpoints.AIEndpoints.AddAIEndpoint.create.new.endpoint'
                                    defaultMessage='Add New Endpoint'
                                />
                            </Typography>
                        </div>
                    </Grid>
                    <Grid item md={12}>
                        <Paper elevation={0} className={classes.root}>
                            <FormControl margin='normal'>
                                <TextField
                                    disabled={isRestricted(['apim:api_manage'], apiObject)}
                                    label='Endpoint Name'
                                    id='name'
                                    value={state.name}
                                    onChange={(e) => dispatch({ field: 'name', value: e.target.value })}
                                    variant='outlined'
                                    margin='normal'
                                    error={!state.name}
                                    helperText={!state.name
                                        ? (
                                            <FormattedMessage
                                                id='Apis.Details.Endpoints.AIEndpoints.AddAIEndpoint.name.helper.text'
                                                defaultMessage='Endpoint name should not be empty'
                                            />
                                        ) : ' '
                                    }
                                    required
                                />
                                <TextField
                                    disabled={isRestricted(['apim:api_create'], apiObject)}
                                    label='Endpoint URL'
                                    id='url'
                                    className={classes.textField}
                                    value={endpointUrl}
                                    onChange={(e) => setEndpointUrl(e.target.value)}
                                    onBlur={handleEndpointBlur}
                                    variant='outlined'
                                    margin='normal'
                                    error={!endpointUrl}
                                    helperText={!endpointUrl
                                        ? (
                                            <FormattedMessage
                                                id='Apis.Details.Endpoints.endpoint.url.helper.text'
                                                defaultMessage='Endpoint URL should not be empty'
                                            />
                                        ) : ' '
                                    }
                                    required
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position='end'>
                                                {statusCode && (
                                                    <Chip
                                                        id={state.id + '-endpoint-test-status'}
                                                        label={statusCode}
                                                        className={isEndpointValid ? classes.endpointValidChip : iff(
                                                            isErrorCode,
                                                            classes.endpointErrorChip, classes.endpointInvalidChip,
                                                        )}
                                                        variant='outlined'
                                                    />
                                                )}
                                                <IconButton
                                                    className={
                                                        isEndpointValid ? classes.iconButtonValid : classes.iconButton
                                                    }
                                                    aria-label='TestEndpoint'
                                                    onClick={() => testEndpoint(endpointUrl, apiObject.id)}
                                                    disabled={
                                                        (isRestricted(['apim:api_manage'], apiObject)) || isUpdating
                                                    }
                                                    id='endpoint-test-icon-btn'
                                                    size='large'>
                                                    {isUpdating
                                                        ? <CircularProgress size={20} />
                                                        : (
                                                            <Tooltip
                                                                placement='top-start'
                                                                interactive
                                                                title={(
                                                                    <FormattedMessage
                                                                        id='Apis.Details.Endpoints.endpoint.check'
                                                                        defaultMessage='Check endpoint status'
                                                                    />
                                                                )}
                                                            >
                                                                <Icon>
                                                                    check_circle
                                                                </Icon>
                                                            </Tooltip>

                                                        )}
                                                </IconButton>
                                                <IconButton
                                                    className={classes.iconButton}
                                                    aria-label='Settings'
                                                    onClick={handleAdvancedConfigOpen}
                                                    disabled={(isRestricted(['apim:api_create'], apiObject))}
                                                    id='endpoint-configuration-icon-btn'
                                                    size='large'>
                                                    <Tooltip
                                                        placement='top-start'
                                                        interactive
                                                        title={(
                                                            <FormattedMessage
                                                                id='Apis.Details.Endpoints.endpoint.configuration'
                                                                defaultMessage='Endpoint configurations'
                                                            />
                                                        )}
                                                    >
                                                        <Icon>
                                                            settings
                                                        </Icon>
                                                    </Tooltip>
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <AIEndpointAuth
                                    api={apiObject}
                                    endpoint={state}
                                    apiKeyParamConfig={apiKeyParamConfig}
                                    isProduction={isProduction}
                                    saveEndpointSecurityConfig={saveEndpointSecurityConfig}
                                />
                            </FormControl>
                            <div className={classes.actionButtonSection}>
                                <Button
                                    id='endpoint-save-btn'
                                    variant='contained'
                                    color='primary'
                                    type='submit'
                                    onClick={() => addEndpoint(state)}
                                    disabled={
                                        isRestricted(['apim:api_manage'], apiObject)
                                            || endpointHasErrors()
                                            || apiObject.isRevision
                                    }
                                    className={classes.saveButton}
                                >
                                    {isEndpointSaving ? (
                                        <>
                                            <FormattedMessage
                                                id='Apis.Details.Endpoints.AIEndpoints.AddAIEndpoint.saving'
                                                defaultMessage='Saving'
                                            />
                                            <CircularProgress size={16} classes={{ root: classes.progress }} />
                                        </>
                                    ) : (
                                        <FormattedMessage
                                            id='Apis.Details.Endpoints.AIEndpoints.AddAIEndpoint.save'
                                            defaultMessage='Save'
                                        />
                                    )}
                                </Button>
                                <Button
                                    component={Link}
                                    to={url}
                                >
                                    <FormattedMessage
                                        id='Apis.Details.Endpoints.AIEndpoints.AddAIEndpoint.cancel'
                                        defaultMessage='Cancel'
                                    />
                                </Button>
                            </div>
                        </Paper>
                    </Grid>
                </Grid>
            </Grid>
            {apiObject.gatewayType !== 'wso2/apk' && (
                <Dialog
                    open={advancedConfigOpen}
                    aria-labelledby='advanced-configurations-dialog-title'
                    onClose={handleAdvancedConfigClose}
                >
                    <DialogTitle>
                        <Typography className={classes.configDialogHeader}>
                            <FormattedMessage
                                id='Apis.Details.Endpoints.endpoint.advanced.configuration'
                                defaultMessage='Advanced Configurations'
                            />
                        </Typography>
                    </DialogTitle>
                    <DialogContent>
                        <AdvanceEndpointConfig
                            isSOAPEndpoint={false}
                            advanceConfig={advanceConfig}
                            onSaveAdvanceConfig={saveAdvanceConfig}
                            onCancel={handleAdvancedConfigClose}
                        />
                    </DialogContent>
                </Dialog>
            )}
        </StyledGrid>
    );
}

AddAIEndpoint.propTypes = {
    apiObject: PropTypes.shape({
        id: PropTypes.string,
        additionalProperties: PropTypes.shape({
            key: PropTypes.string,
            value: PropTypes.string,
        }).isRequired,
    }).isRequired,
    history: PropTypes.shape({ push: PropTypes.func }).isRequired,
};

export default AddAIEndpoint;
