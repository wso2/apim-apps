/*
 * Copyright (c) 2025, WSO2 LLC. (http://www.wso2.com).
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
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import { isRestricted } from 'AppData/AuthManager';
import { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';

/**
 *
 *
 * @export
 * @param {*} props
 * @returns
 */
function APIDescription(props) {
    const { api, configDispatcher } = props;
    const [apiFromContext] = useAPI();

    return (
        <TextField
            label={(
                <FormattedMessage
                    id='Apis.Details.Configuration.components.Description.title'
                    defaultMessage='Description'
                />
            )}
            id='description'
            variant='outlined'
            value={api.description || ''}
            fullWidth
            multiline
            rows={3}
            margin='dense'
            onChange={(e) => configDispatcher(
                { action: 'description', value: e.target.value }
            )}
            disabled={isRestricted(
                ['apim:api_create', 'apim:api_publish'], apiFromContext
            )}
            helperText={(
                <FormattedMessage
                    id='Apis.Details.Configuration.components.Description.help'
                    defaultMessage='This Description will be available in the 
                    API overview page in developer portal'
                />
            )}
            style={{ marginTop: 0, paddingBottom: 0  }}
        />
    );
}

APIDescription.propTypes = {
    api: PropTypes.shape({}).isRequired,
    configDispatcher: PropTypes.func.isRequired,
};

export default APIDescription;