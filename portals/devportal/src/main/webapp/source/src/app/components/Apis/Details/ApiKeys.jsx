/*
 * Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com/).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
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
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { Typography, Box } from '@mui/material';
import { ApiContext } from './ApiContext';
import ApiKeyListing from './APIKeys/ApiKeyListing';

const PREFIX = 'ApiKeys';

const classes = {
    root: `${PREFIX}-root`,
    paper: `${PREFIX}-paper`,
};

const Root = styled('div')((
    {
        theme,
    },
) => ({
    [`& .${classes.root}`]: {
        padding: theme.spacing(3),
        color: theme.palette.getContrastText(theme.palette.background.paper),
    },

    [`& .${classes.paper}`]: {
        margin: theme.spacing(1),
        padding: theme.spacing(1),
    },
}));

/**
 * API Keys component for API Details page
 * @param {Object} props The props object
 * @returns {JSX} API Keys component
 */
function ApiKeys() {
    const { api } = useContext(ApiContext);

    // Check if API key authentication is enabled
    const isApiKeyEnabled = api && api.securityScheme && api.securityScheme.includes('api_key');

    // If API key authentication is not enabled, show a message
    if (!isApiKeyEnabled) {
        return (
            <Root>
                <div className={classes.root}>
                    <Box
                        sx={{
                            textAlign: 'center',
                            p: 4,
                            background: '#f5f5f5',
                            borderRadius: 2,
                            border: '1px solid #e0e0e0',
                        }}
                    >
                        <Typography variant='h6' sx={{ mb: 2, color: '#666' }}>
                            API Key Authentication Not Enabled
                        </Typography>
                        <Typography variant='body1' color='text.secondary'>
                            This API does not have API key authentication enabled.
                            API keys are not available for this API.
                        </Typography>
                    </Box>
                </div>
            </Root>
        );
    }

    return (
        <Root>
            <div className={classes.root}>
                <ApiKeyListing />
            </div>
        </Root>
    );
}

ApiKeys.propTypes = {
    intl: PropTypes.shape({
        formatMessage: PropTypes.func,
    }).isRequired,
};

export default injectIntl(ApiKeys);
