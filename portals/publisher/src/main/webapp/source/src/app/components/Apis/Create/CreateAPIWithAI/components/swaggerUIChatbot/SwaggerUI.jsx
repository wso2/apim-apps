/* eslint-disable */
/*
 *  Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *  WSO2 Inc. licenses this file to you under the Apache License,
 *  Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied. See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 */
import React from 'react';
import PropTypes from 'prop-types';
import SwaggerUILib from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';


// Plugins to disable specific features in Swagger UI
const disableAuthorizeAndInfoPlugin = function () {
    return {
        wrapComponents: {
            info: () => () => null,       // Disable "info" section
            authorizeBtn: () => () => null, // Disable "Authorize" button
        },
    };
};

const disableTryItOutPlugin = function () {
    return {
        statePlugins: {
            spec: {
                wrapSelectors: {
                    allowTryItOutFor: () => () => false, // Disable "Try It Out" button
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
        validatorUrl: null,               // Disable spec validator
        docExpansion: 'list',             // Expand operations in the UI by default
        defaultModelsExpandDepth: -1,     // Don't expand models by default
        plugins: [disableAuthorizeAndInfoPlugin, disableTryItOutPlugin],  // Disable specific plugins
    };

    // return <SwaggerUILib {...componentProps} />;
// };
    return (
        <div
            style={{
                height: '100%',         // Set container height
                maxHeight: '70vh',       // Max height for SwaggerUI (adjust as needed)
                overflowY: 'auto',       // Enable vertical scrolling
            }}
        >
            <SwaggerUILib {...componentProps} />
        </div>
    );
};

// Define PropTypes for the component
SwaggerUI.propTypes = {
    spec: PropTypes.object.isRequired,    // The OpenAPI spec must be provided as an object
};

export default SwaggerUI;
