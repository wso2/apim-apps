/*
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import WrappedExpansionPanel from 'AppComponents/Shared/WrappedExpansionPanel';
import { AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AuthorizationHeader from 'AppComponents/Apis/Details/Configuration/components/AuthorizationHeader.jsx';
import ApiKeyHeader from "AppComponents/Apis/Details/Configuration/components/ApiKeyHeader";
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import HelpOutline from '@mui/icons-material/HelpOutline';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormHelperText from '@mui/material/FormHelperText';
import { FormattedMessage, useIntl } from 'react-intl';
import { isRestricted } from 'AppData/AuthManager';
import CONSTS from 'AppData/Constants';
import { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import KeyManager from 'AppComponents/Apis/Details/Configuration/components/KeyManager';
import Audience from 'AppComponents/Apis/Details/Configuration/components/Audience';
import API from 'AppData/api';

import {
    DEFAULT_API_SECURITY_OAUTH2,
    API_SECURITY_BASIC_AUTH,
    API_SECURITY_API_KEY,
    API_SECURITY_OAUTH_BASIC_AUTH_API_KEY_MANDATORY,
    API_SECURITY_OAUTH_BASIC_AUTH_API_KEY_OPTIONAL,
    API_SECURITY_MUTUAL_SSL,
} from './apiSecurityConstants';

const PREFIX = 'ApplicationLevel';

const classes = {
    expansionPanel: `${PREFIX}-expansionPanel`,
    expansionPanelDetails: `${PREFIX}-expansionPanelDetails`,
    iconSpace: `${PREFIX}-iconSpace`,
    bottomSpace: `${PREFIX}-bottomSpace`,
    subHeading: `${PREFIX}-subHeading`
};


const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.expansionPanel}`]: {
        marginBottom: theme.spacing(1),
    },

    [`& .${classes.expansionPanelDetails}`]: {
        flexDirection: 'column',
    },

    [`& .${classes.iconSpace}`]: {
        marginLeft: theme.spacing(0.5),
    },

    [`& .${classes.bottomSpace}`]: {
        marginBottom: theme.spacing(4),
    },

    [`& .${classes.subHeading}`]: {
        fontSize: '1rem',
        fontWeight: 400,
        margin: 0,
        display: 'inline-flex',
        lineHeight: 1.5,
    }
}));

/**
 *
 *
 * @export
 * @param {*} props
 * @returns
 */
export default function ApplicationLevel(props) {
    const {
        haveMultiLevelSecurity, securityScheme, configDispatcher, api, componentValidator
    } = props;
    const [apiFromContext] = useAPI();
    const [oauth2Enabled, setOauth2Enabled] = useState(securityScheme.includes(DEFAULT_API_SECURITY_OAUTH2));
    const [apiKeyEnabled, setApiKeyEnabled] = useState(securityScheme.includes(API_SECURITY_API_KEY));
    const intl = useIntl();
    const isSubValidationDisabled = apiFromContext.policies && apiFromContext.policies.length === 1 
        && apiFromContext.policies[0].includes(CONSTS.DEFAULT_SUBSCRIPTIONLESS_PLAN);
    let mandatoryValue = null;
    let hasResourceWithSecurity;
    if (apiFromContext.apiType === API.CONSTS.APIProduct) {
        const apiList = apiFromContext.apis;
        for (const apiInProduct in apiList) {
            if (Object.prototype.hasOwnProperty.call(apiList, apiInProduct)) {
                hasResourceWithSecurity = apiList[apiInProduct].operations.findIndex(
                    (op) => op.authType !== 'None',
                ) > -1;
                if (hasResourceWithSecurity) {
                    break;
                }
            }
        }
    } else {
        hasResourceWithSecurity = apiFromContext.operations.findIndex((op) => op.authType !== 'None') > -1;
    }

    mandatoryValue = API_SECURITY_OAUTH_BASIC_AUTH_API_KEY_OPTIONAL;
    // If not Oauth2, Basic auth or ApiKey security is selected, no mandatory values should be pre-selected
    if (!(securityScheme.includes(DEFAULT_API_SECURITY_OAUTH2) || securityScheme.includes(API_SECURITY_BASIC_AUTH)
        || securityScheme.includes(API_SECURITY_API_KEY))) {
        mandatoryValue = null;
    } else if (!securityScheme.includes(API_SECURITY_MUTUAL_SSL)) {
        mandatoryValue = API_SECURITY_OAUTH_BASIC_AUTH_API_KEY_MANDATORY;
    } else if (securityScheme.includes(API_SECURITY_OAUTH_BASIC_AUTH_API_KEY_MANDATORY)) {
        mandatoryValue = API_SECURITY_OAUTH_BASIC_AUTH_API_KEY_MANDATORY;
    } else {
        mandatoryValue = API_SECURITY_OAUTH_BASIC_AUTH_API_KEY_OPTIONAL;
    }

    useEffect(() => {
        if (mandatoryValue !== null) {
            const name = API_SECURITY_OAUTH_BASIC_AUTH_API_KEY_MANDATORY.slice(0);
            const value = mandatoryValue.slice(0);
            configDispatcher({
                action: 'securityScheme',
                event: { name, value },
            });
        }
    }, []);

    const [mandatoryValueRef, setMandatoryValueRef] = useState(mandatoryValue);

    useEffect(() => {
        setMandatoryValueRef(mandatoryValue);
    });

    return (
        (<Root>
            <Grid item xs={12}>
                <WrappedExpansionPanel className={classes.expansionPanel} id='applicationLevel'>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography className={classes.subHeading} variant='h6' component='h4'>
                            <FormattedMessage
                                id={'Apis.Details.Configuration.Components.APISecurity.Components.'
                                        + 'ApplicationLevel.http'}
                                defaultMessage='Application Level Security'
                            />
                            <Tooltip
                                title={(
                                    <FormattedMessage
                                        id='Apis.Details.Configuration.components.APISecurity.tooltip'
                                        defaultMessage={
                                            'This option determines the type of security'
                                            + ' that will be used to secure this API. An API can be secured '
                                            + 'with either OAuth2/Basic/ApiKey or it can be secured with all of them. '
                                            + 'If OAuth2 option is selected, relevant API will require a valid '
                                            + 'OAuth2 token for successful invocation.'
                                        }
                                    />
                                )}
                                aria-label='API Security helper text'
                                placement='right-end'
                                interactive
                            >
                                <HelpOutline className={classes.iconSpace} />
                            </Tooltip>
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails className={classes.expansionPanelDetails}>
                        <FormGroup style={{ display: 'flow-root' }}>
                            {componentValidator.includes('oauth2') && 
                                <FormControlLabel
                                    control={(
                                        <Checkbox
                                            disabled={isRestricted(['apim:api_create'], apiFromContext)}
                                            checked={securityScheme.includes(DEFAULT_API_SECURITY_OAUTH2)}
                                            onChange={({ target: { checked, value } }) => {
                                                setOauth2Enabled(checked);
                                                configDispatcher({
                                                    action: 'securityScheme',
                                                    event: { checked, value },
                                                });
                                            }}
                                            value={DEFAULT_API_SECURITY_OAUTH2}
                                            color='primary'
                                        />
                                    )}
                                    label={intl.formatMessage({
                                        id: 'Apis.Details.Configuration.Components.APISecurity.Components.'
                                            + 'ApplicationLevel.security.scheme.oauth2',
                                        defaultMessage: 'OAuth2',
                                    })}
                                />
                            }
                            {(componentValidator.includes('basicAuth') ||
                                apiFromContext.apiType === API.CONSTS.APIProduct) && (
                                <FormControlLabel
                                    control={(
                                        <Checkbox
                                            disabled={isRestricted(['apim:api_create'], apiFromContext)}
                                            checked={securityScheme.includes(API_SECURITY_BASIC_AUTH)}
                                            onChange={({ target: { checked, value } }) => configDispatcher({
                                                action: 'securityScheme',
                                                event: { checked, value },
                                            })}
                                            value={API_SECURITY_BASIC_AUTH}
                                            color='primary'
                                            id='api-security-basic-auth-checkbox'
                                        />
                                    )}
                                    label={intl.formatMessage({
                                        id: 'Apis.Details.Configuration.Components.APISecurity.Components.'
                                            + 'ApplicationLevel.security.scheme.basic',
                                        defaultMessage: 'Basic',
                                    })}
                                />
                            )}
                            {componentValidator.includes('apikey') &&
                                <FormControlLabel
                                    control={(
                                        <Checkbox
                                            checked={securityScheme.includes(API_SECURITY_API_KEY)}
                                            disabled={
                                                isRestricted(['apim:api_create'], apiFromContext) 
                                                || isSubValidationDisabled
                                            }
                                            onChange={({ target: { checked, value } }) => {
                                                setApiKeyEnabled(checked);
                                                configDispatcher({
                                                    action: 'securityScheme',
                                                    event: { checked, value },
                                                });
                                            }}
                                            value={API_SECURITY_API_KEY}
                                            color='primary'
                                            id='api-security-api-key-checkbox'
                                        />
                                    )}
                                    label={intl.formatMessage({
                                        id: 'Apis.Details.Configuration.Components.APISecurity.Components.'
                                            + 'ApplicationLevel.security.scheme.api.key',
                                        defaultMessage: 'Api Key',
                                    })}
                                />
                            }
                        </FormGroup>
                        <FormControl className={classes.bottomSpace} component='fieldset'>
                            <RadioGroup
                                aria-label='HTTP security HTTP mandatory selection'
                                name={API_SECURITY_OAUTH_BASIC_AUTH_API_KEY_MANDATORY}
                                value={mandatoryValueRef}
                                onChange={({ target: { name, value } }) => {
                                    setMandatoryValueRef(value);
                                    configDispatcher({
                                        action: 'securityScheme',
                                        event: { name, value },
                                    });
                                }}
                                row
                            >
                                <FormControlLabel
                                    value={API_SECURITY_OAUTH_BASIC_AUTH_API_KEY_MANDATORY}
                                    control={(
                                        <Radio
                                            disabled={!haveMultiLevelSecurity
                                                || isRestricted(['apim:api_create'], apiFromContext)}
                                            color='primary'
                                        />
                                    )}
                                    label={intl.formatMessage({
                                        id: 'Apis.Details.Configuration.Components.APISecurity.Components.'
                                            + 'ApplicationLevel.security.scheme.mandatory',
                                        defaultMessage: 'Mandatory',
                                    })}
                                    labelPlacement='end'
                                />
                                <FormControlLabel
                                    value={API_SECURITY_OAUTH_BASIC_AUTH_API_KEY_OPTIONAL}
                                    control={(
                                        <Radio
                                            disabled={!haveMultiLevelSecurity
                                                || isRestricted(['apim:api_create'], apiFromContext)}
                                            color='primary'
                                        />
                                    )}
                                    label={intl.formatMessage({
                                        id: 'Apis.Details.Configuration.Components.APISecurity.Components.'
                                            + 'ApplicationLevel.security.scheme.optional',
                                        defaultMessage: 'Optional',
                                    })}
                                    labelPlacement='end'
                                />
                            </RadioGroup>
                            <FormHelperText>
                                <FormattedMessage
                                    id='Apis.Details.Configuration.components.APISecurity.application.mandatory'
                                    defaultMessage='Choose whether Application level security is mandatory or optional'
                                />
                            </FormHelperText>
                        </FormControl>
                        {oauth2Enabled && componentValidator.includes("audienceValidation") && (
                            <Audience
                                api={api}
                                configDispatcher={configDispatcher}
                            />
                        )}
                        {(apiFromContext.apiType === API.CONSTS.API) && oauth2Enabled &&
                            componentValidator.includes("keyManagerConfig") && (
                            <KeyManager
                                api={api}
                                configDispatcher={configDispatcher}
                            />
                        )}
                        {componentValidator.includes('oauth2') &&
                            <AuthorizationHeader 
                                api={api} 
                                configDispatcher={configDispatcher} 
                                oauth2Enabled={oauth2Enabled} 
                            />
                        } {componentValidator.includes('apikey') &&
                            <ApiKeyHeader api={api} configDispatcher={configDispatcher} apiKeyEnabled={apiKeyEnabled} />
                        }   
                        <FormControl>
                            {!hasResourceWithSecurity
                            && (
                                <FormHelperText>
                                    <FormattedMessage
                                        id='Apis.Details.Configuration.components.APISecurity.api.unsecured'
                                        defaultMessage='Application level security is not required since API
                                        has no secured resources'
                                    />
                                </FormHelperText>
                            )}
                        </FormControl>
                    </AccordionDetails>
                </WrappedExpansionPanel>
            </Grid>
        </Root>)
    );
}

ApplicationLevel.propTypes = {
    configDispatcher: PropTypes.func.isRequired,
    haveMultiLevelSecurity: PropTypes.bool.isRequired,
    securityScheme: PropTypes.arrayOf(PropTypes.string).isRequired,
    api: PropTypes.shape({}).isRequired,
};
