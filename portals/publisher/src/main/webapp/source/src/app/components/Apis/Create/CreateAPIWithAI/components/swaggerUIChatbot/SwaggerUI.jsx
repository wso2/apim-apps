/* eslint-disable */
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
import PropTypes from 'prop-types';
import './swagger-ui-overrides.css';
import SwaggerUILib from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';


// Plugins to disable specific features in Swagger UI
const disableAuthorizeAndInfoPlugin = function () {
    return {
        wrapComponents: {
            info: () => () => null,
            authorizeBtn: () => () => null
        },
    };
};

const disableTryItOutPlugin = function () {
    return {
        statePlugins: {
            spec: {
                wrapSelectors: {
                    allowTryItOutFor: () => () => false,
                },
            },
        },
    };
};

/**
 * SwaggerUI component to render the OpenAPI spec.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.spec - The OpenAPI spec in JSON or YAML format
 */
const SwaggerUI = ({ spec }) => {
    const componentProps = {
        spec,
        validatorUrl: null,
        docExpansion: 'list',
        defaultModelsExpandDepth: -1,
        plugins: [disableAuthorizeAndInfoPlugin, disableTryItOutPlugin],
    };

    return (
        <div
            style={{
                height: '100%',
                maxHeight: '70vh',
                overflowY: 'auto',
            }}
        >
            <SwaggerUILib {...componentProps} />
        </div>
    );
};

SwaggerUI.propTypes = {
    spec: PropTypes.object.isRequired,
};

export default SwaggerUI;
