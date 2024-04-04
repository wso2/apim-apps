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

import React, { useContext } from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import { FormattedMessage } from 'react-intl';
import Typography from '@mui/material/Typography';
import ApiContext, { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import API from 'AppData/api';
import {
    DEFAULT_API_SECURITY_OAUTH2,
    API_SECURITY_BASIC_AUTH,
    API_SECURITY_API_KEY,
    API_SECURITY_MUTUAL_SSL,
} from './components/apiSecurityConstants';
import ApplicationLevel from './components/ApplicationLevel';
import TransportLevel from './components/TransportLevel';

const PREFIX = 'APISecurity';

const classes = {
    error: `${PREFIX}-error`,
    bottomSpace: `${PREFIX}-bottomSpace`
};


const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.error}`]: {
        color: theme.palette.error.main,
    },

    [`& .${classes.bottomSpace}`]: {
        marginBottom: theme.spacing(4),
    }
}));

/**
 *
 *
 * @export
 * @param {*} props
 * @returns
 */
export default function APISecurity(props) {
    const {
        api: { securityScheme, id },
        configDispatcher,
        api,
    } = props;
    const apiContext = useContext(ApiContext);
    const isAPIProduct = apiContext.api.apiType === API.CONSTS.APIProduct;
    let isEndpointAvailable;
    let isPrototyped;
    if (isAPIProduct) {
        isEndpointAvailable = false;
        isPrototyped = false;
    } else {
        isEndpointAvailable = apiContext.api.endpointConfig !== null;
        isPrototyped = apiContext.api.endpointConfig !== null
             && apiContext.api.endpointConfig.implementation_status === 'prototyped'
             && apiContext.api.lifeCycleStatus === 'PROTOTYPED';
    }

    const haveMultiLevelSecurity = securityScheme.includes(API_SECURITY_MUTUAL_SSL)
        && (securityScheme.includes(API_SECURITY_BASIC_AUTH)
        || securityScheme.includes(
            DEFAULT_API_SECURITY_OAUTH2,
        ) || securityScheme.includes(API_SECURITY_API_KEY));

    const [apiFromContext] = useAPI();

    // Check the validation conditions and return an error message
    const Validate = () => {
        let resourcesWithSecurity;
        if (apiFromContext.apiType === API.CONSTS.APIProduct) {
            const apiList = apiFromContext.apis;
            for (const apiInProduct in apiList) {
                if (Object.prototype.hasOwnProperty.call(apiList, apiInProduct)) {
                    resourcesWithSecurity = apiList[apiInProduct].operations.findIndex(
                        (op) => op.authType !== 'None',
                    ) > -1;
                    if (resourcesWithSecurity) {
                        break;
                    }
                }
            }
        } else {
            resourcesWithSecurity = apiFromContext.operations.findIndex((op) => op.authType !== 'None') > -1;
        }

        if (
            !securityScheme.includes(API_SECURITY_MUTUAL_SSL)
            && !securityScheme.includes(API_SECURITY_BASIC_AUTH)
            && !securityScheme.includes(DEFAULT_API_SECURITY_OAUTH2)
            && !securityScheme.includes(API_SECURITY_API_KEY)
            && resourcesWithSecurity
        ) {
            return (
                <Typography className={classes.bottomSpace}>
                    <FormattedMessage
                        id='Apis.Details.Configuration.components.APISecurity.emptySchemas'
                        defaultMessage='Please select at least one API security method!'
                    />
                </Typography>
            );
        }
        return null; // No errors :-)
    };
    return (
        (<Root>
            <Grid container alignItems='flex-start' rowSpacing={1}>
                {(isAPIProduct || (!isEndpointAvailable || (isEndpointAvailable && !isPrototyped)))
                && (
                    <>
                        <Grid item xs={12}>
                            <TransportLevel
                                haveMultiLevelSecurity={haveMultiLevelSecurity}
                                securityScheme={securityScheme}
                                configDispatcher={configDispatcher}
                                api={api}
                                id={id}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <ApplicationLevel
                                haveMultiLevelSecurity={haveMultiLevelSecurity}
                                securityScheme={securityScheme}
                                api={api}
                                configDispatcher={configDispatcher}
                                id={id}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <span className={classes.error}>
                                <Validate />
                            </span>
                        </Grid>
                    </>
                )}
            </Grid>
        </Root>)
    );
}

APISecurity.propTypes = {
    api: PropTypes.shape({}).isRequired,
    configDispatcher: PropTypes.func.isRequired,
};
