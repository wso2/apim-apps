/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import {
    Grid,
    Tooltip,
    InputAdornment,
    withStyles,
    IconButton, Icon,
} from '@material-ui/core';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import TextField from '@material-ui/core/TextField';
import Autocomplete from 'AppComponents/Shared/Autocomplete';
import { isRestricted } from 'AppData/AuthManager';


const styles = (theme) => ({
    endpointInputWrapper: {
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
    },
    textField: {
        width: '100%',
    },
    input: {
        marginLeft: theme.spacing(1),
        flex: 1,
    },
    iconButton: {
        padding: theme.spacing(1),
    },

});

/**
 * This is Service endpoint component.
 * 
 * @param {any} props The input props
 * @returns {any} The HTML representation of the component.
 */
function ServiceEndpoint(props) {
    const {
        category,
        classes,
        api,
        services,
        type,
        setAdvancedConfigOpen,
        esCategory,
        setESConfigOpen,
        index,
        name,
        editEndpoint,
        endpointURL,
        editService
    } = props;
    
    const [selectedServiceUrl, setSelectedServiceUrl] = useState();
    const defaultService = api.serviceInfo ? {serviceKey: api.serviceInfo.key, serviceUrl: endpointURL}
        : {serviceKey: '',serviceUrl: '' }

    const setEndpointValue = (value) => {
        editEndpoint(index, category, value.serviceUrl);
        setSelectedServiceUrl(value.serviceUrl);
        if (esCategory ==='production') {
            editService(value);
        }
        
    };

    return (
        <>
            <div>
                <Grid container spacing={2}>
                    <Grid item xs={4} className={classes.endpointInputWrapper}>
                        <div className={classes.endpointInputWrapper}>
                            <Autocomplete
                                onChange={(event, value) => setEndpointValue(value)}
                                id='combo-box-demo'
                                defaultValue={category === 'production_endpoints' && defaultService}
                                options={services}
                                getOptionLabel={(option) => option.serviceKey}
                                style={{ width:  '100%' }}
                                renderInput={(params) => <TextField {...params} label={name} variant='outlined'
                                    margin='normal' defaultValue={category === 'production_endpoints' 
                                     && defaultService.serviceUrl} />}
                            />
                        </div>
                    </Grid>
                    <Grid item xs={8}>
                        <div className={classes.endpointInputWrapper}>
                            <TextField
                                disabled
                                className={classes.textField}
                                value={!endpointURL ? selectedServiceUrl: endpointURL}
                                placeholder='Select a service from the service list'
                                variant='outlined'
                                margin='normal'
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position='end'>

                                            <>
                                                <IconButton
                                                    className={classes.iconButton}
                                                    aria-label='Settings'
                                                    onClick={() => setAdvancedConfigOpen(index, type, category)}
                                                    disabled={(isRestricted(['apim:api_create'], api))}
                                                >
                                                    <Tooltip
                                                        placement='top-start'
                                                        interactive
                                                        title={(
                                                            <FormattedMessage
                                                                id='Apis.Details.Endpoints.
                                                                GenericEndpoint.config.endpoint'
                                                                defaultMessage='Endpoint configurations'
                                                            />
                                                        )}
                                                    >
                                                        <Icon>
                                                            settings
                                                        </Icon>
                                                    </Tooltip>
                                                </IconButton>
                                                <IconButton
                                                    className={classes.iconButton}
                                                    aria-label='Security'
                                                    onClick={() => setESConfigOpen(type, esCategory)}
                                                    disabled={(isRestricted(['apim:api_create'], api))}
                                                >
                                                    <Tooltip
                                                        placement='top-start'
                                                        interactive
                                                        title={(
                                                            <FormattedMessage
                                                                id='Apis.Details.Endpoints.
                                                                GenericEndpoint.security.endpoint'
                                                                defaultMessage='Endpoint security'
                                                            />
                                                        )}
                                                    >
                                                        <Icon>
                                                            security
                                                        </Icon>
                                                    </Tooltip>
                                                </IconButton>
                                            </>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </div>
                    </Grid>

                </Grid>
            </div>
        </>
    )
}


ServiceEndpoint.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    api: PropTypes.shape({
        id: PropTypes.string,
    }).isRequired,
    services: PropTypes.shape({
        id: PropTypes.string,
    }).isRequired,
    index: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
    setAdvancedConfigOpen: PropTypes.func.isRequired,
    setESConfigOpen: PropTypes.func.isRequired,
    category: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    editEndpoint: PropTypes.func.isRequired,
    editService: PropTypes.func.isRequired,
    endpointURL: PropTypes.string.isRequired,
    intl: PropTypes.shape({
        formatMessage: PropTypes.func,
    }).isRequired,
};

export default withStyles(styles)(ServiceEndpoint);
