/**
 * Copyright (c)  WSO2 Inc. (http://wso2.com) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useEffect, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import {
    Divider,
    Icon,
    IconButton,
    InputAdornment,
    TextField,
} from '@mui/material';
import { FormattedMessage } from 'react-intl';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import { isRestricted } from 'AppData/AuthManager';
import APIContext from 'AppComponents/Apis/Details/components/ApiContext';
import API from 'AppData/api';
import { green } from '@mui/material/colors';

const PREFIX = 'GenericEndpoint';

const classes = {
    endpointInputWrapper: `${PREFIX}-endpointInputWrapper`,
    textField: `${PREFIX}-textField`,
    input: `${PREFIX}-input`,
    iconButton: `${PREFIX}-iconButton`,
    iconButtonValid: `${PREFIX}-iconButtonValid`,
    divider: `${PREFIX}-divider`,
    endpointValidChip: `${PREFIX}-endpointValidChip`,
    endpointInvalidChip: `${PREFIX}-endpointInvalidChip`,
    endpointErrorChip: `${PREFIX}-endpointErrorChip`
};

const Root = styled('div')(({ theme }) => ({
    [`&.${classes.endpointInputWrapper}`]: {
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
    },

    [`& .${classes.iconButtonValid}`]: {
        padding: theme.spacing(1),
        color: green[500],
    },

    [`& .${classes.divider}`]: {
        width: 1,
        height: 28,
        margin: 4,
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
    }
}));

/**
 * This component represents a single endpoint view of the endpoints listing. This component holds the actions that
 * affect the endpont. Eg: Delete, advance configuration.
 *
 * @param {any} props The input props
 * @returns {any} The HTML representation of the component.
 * */
function GenericEndpoint(props) {
    const {
        category,
        endpointURL,
        editEndpoint,
        type,
        setAdvancedConfigOpen,
        esCategory,
        setESConfigOpen,
        deleteEndpoint,
        index,
        readOnly,
        autoFocus,
        name,
        id,
        apiId,
        componentValidator,
    } = props;
    const [serviceUrl, setServiceUrl] = useState(endpointURL);
    const { api } = useContext(APIContext);
    const [isEndpointValid, setIsEndpointValid] = useState();
    const [statusCode, setStatusCode] = useState('');
    const [isUpdating, setUpdating] = useState(false);
    const [isErrorCode, setIsErrorCode] = useState(false);
    const iff = (condition, then, otherwise) => (condition ? then : otherwise);

    useEffect(() => {
        setServiceUrl(endpointURL);
    }, [endpointURL]);

    function testEndpoint(endpoint, apiID) {
        setUpdating(true);
        const restApi = new API();
        restApi.testEndpoint(endpoint, apiID)
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

    return (
        <Root className={classes.endpointInputWrapper}>
            <TextField
                disabled={isRestricted(['apim:api_create'], api)}
                label={name}
                id={id}
                className={classes.textField}
                value={serviceUrl}
                placeholder={!serviceUrl ? 'http://appserver/resource' : ''}
                onChange={(event) => setServiceUrl(event.target.value)}
                onBlur={() => {
                    editEndpoint(index, category, serviceUrl);
                }}
                error={!serviceUrl}
                helperText={!serviceUrl
                    ? (
                        <FormattedMessage
                            id='Apis.Details.Endpoints.GenericEndpoint.no.ep.error'
                            defaultMessage='Endpoint URL should not be empty'
                        />
                    ) : ''}
                variant='outlined'
                margin='normal'
                required
                InputProps={{
                    readOnly,
                    autoFocus,
                    id: category,
                    endAdornment: (
                        <InputAdornment position='end'>
                            {statusCode && (
                                <Chip
                                    id={category + '-endpoint-test-status'}
                                    label={statusCode}
                                    className={isEndpointValid ? classes.endpointValidChip : iff(
                                        isErrorCode,
                                        classes.endpointErrorChip, classes.endpointInvalidChip,
                                    )}
                                    variant='outlined'
                                />
                            )}
                            {!api.isWebSocket() && (
                                <IconButton
                                    className={isEndpointValid ? classes.iconButtonValid : classes.iconButton}
                                    aria-label='TestEndpoint'
                                    onClick={() => testEndpoint(serviceUrl, apiId)}
                                    disabled={(isRestricted(['apim:api_create'], api)) || isUpdating}
                                    id={category + '-endpoint-test-icon-btn'}
                                    size='large'>
                                    {isUpdating
                                        ? <CircularProgress size={20} />
                                        : (
                                            <Tooltip
                                                placement='top-start'
                                                interactive
                                                title={(
                                                    <FormattedMessage
                                                        id='Apis.Details.Endpoints.GenericEndpoint.check.endpoint'
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
                            )}
                            {type === 'prototyped'
                                ? <div />
                                : (
                                    <>
                                        {componentValidator.includes('advancedConfigurations') &&
                                            <IconButton
                                                className={classes.iconButton}
                                                aria-label='Settings'
                                                onClick={() => setAdvancedConfigOpen(index, type, category)}
                                                disabled={(isRestricted(['apim:api_create'], api))}
                                                id={category + '-endpoint-configuration-icon-btn'}
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
                                        }
                                        {api.subtypeConfiguration?.subtype !== 'AIAPI' && 
                                         type !== 'awslambda' && (<IconButton
                                            className={classes.iconButton}
                                            aria-label='Security'
                                            onClick={() => setESConfigOpen(type, esCategory)}
                                            disabled={(isRestricted(['apim:api_create'], api))}
                                            id={category + '-endpoint-security-icon-btn'}
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
                                        </IconButton>)}
                                    </>
                                )}
                            {(index > 0) ? <Divider className={classes.divider} /> : <div />}
                            {(type === 'load_balance' || type === 'failover') ? (
                                <IconButton
                                    className={classes.iconButton}
                                    aria-label='Delete'
                                    color='secondary'
                                    onClick={() => deleteEndpoint(index, type, category)}
                                    disabled={(isRestricted(['apim:api_create'], api))}
                                    size='large'>
                                    <Icon>
                                        delete
                                    </Icon>
                                </IconButton>
                            ) : (<div />)}
                        </InputAdornment>
                    ),
                }}
            />
        </Root>
    );
}

GenericEndpoint.defaultProps = {
    readOnly: false,
    autoFocus: false,
    name: 'Service URL',
    id: '',
};

GenericEndpoint.propTypes = {
    endpointURL: PropTypes.string.isRequired,
    deleteEndpoint: PropTypes.func.isRequired,
    classes: PropTypes.shape({}).isRequired,
    type: PropTypes.string.isRequired,
    setAdvancedConfigOpen: PropTypes.func.isRequired,
    setESConfigOpen: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
    editEndpoint: PropTypes.func.isRequired,
    category: PropTypes.string.isRequired,
    readOnly: PropTypes.bool,
    autoFocus: PropTypes.bool,
    name: PropTypes.string,
    apiId: PropTypes.string.isRequired,
    id: PropTypes.string,
};

export default (GenericEndpoint);
