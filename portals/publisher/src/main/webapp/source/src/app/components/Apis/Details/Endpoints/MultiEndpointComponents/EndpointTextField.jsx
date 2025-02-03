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

import React from 'react';
import { styled } from '@mui/material/styles';
import {
    // Grid,
    Tooltip,
    InputAdornment,
    IconButton, Icon,
} from '@mui/material';
// import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import TextField from '@mui/material/TextField';
// import Autocomplete from 'AppComponents/Shared/Autocomplete';
// import { isRestricted } from 'AppData/AuthManager';

const PREFIX = 'EndpointTextField';

const classes = {
    endpointInputWrapper: `${PREFIX}-endpointInputWrapper`,
    textField: `${PREFIX}-textField`,
    input: `${PREFIX}-input`,
    iconButton: `${PREFIX}-iconButton`
};

const Root = styled('div')((
    {
        theme
    }
) => ({
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

const EndpointTextField = () => {
    const intl = useIntl();

    return (
        <Root className={classes.endpointInputWrapper}>
            <TextField
                disabled
                className={classes.textField}
                // value='https://api.ai.com'
                placeholder={intl.formatMessage({
                    id: 'Apis.Details.Endpoints.endpoint.textfield.placeholder',
                    defaultMessage: 'Endpoint',
                })}
                variant='outlined'
                margin='normal'
                InputProps={{
                    endAdornment: (
                        <InputAdornment position='end'>
                            <>
                                <IconButton
                                    className={classes.iconButton}
                                    aria-label='Settings'
                                    // onClick={() => setAdvancedConfigOpen(index, type, category)}
                                    // disabled={(isRestricted(['apim:api_create'], api))}
                                    size='large'>
                                    <Tooltip
                                        placement='top-start'
                                        interactive
                                        title={(
                                            <FormattedMessage
                                                id='Apis.Details.Endpoints.GenericEndpoint.config.endpoint'
                                                defaultMessage='Endpoint configurations'
                                            />
                                        )}
                                    >
                                        <Icon>
                                            settings
                                        </Icon>
                                    </Tooltip>
                                </IconButton>
                                {/* <IconButton
                                    className={classes.iconButton}
                                    aria-label='Security'
                                    // onClick={() => setESConfigOpen(type, esCategory)}
                                    // disabled={(isRestricted(['apim:api_create'], api))}
                                    size='large'>
                                    <Tooltip
                                        placement='top-start'
                                        interactive
                                        title={(
                                            <FormattedMessage
                                                id='Apis.Details.Endpoints.GenericEndpoint.security.endpoint'
                                                defaultMessage='Endpoint security'
                                            />
                                        )}
                                    >
                                        <Icon>
                                            security
                                        </Icon>
                                    </Tooltip>
                                </IconButton> */}
                            </>
                        </InputAdornment>
                    ),
                }}
            />
        </Root>
    );
};

export default EndpointTextField;
