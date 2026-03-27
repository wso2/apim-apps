/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
/* eslint-disable consistent-return */
/*
 * Copyright (c) 2022, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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
import React from 'react'
import parse from 'html-react-parser';
import DOMPurify from 'dompurify';
import Configuration from 'Config';

/**
 * Render html content with optional sanitization.
 * @param {object} props Props passing down from parent components.
 * @param {string} props.html The HTML content to render.
 * @param {boolean} [props.sanitize=true] Whether to sanitize the HTML content.
 * @returns {JSX} React render output.
 */
export default function HTMLRender(props) {
    const { html, sanitize = true } = props;
    
    // Extract sanitization config from Configuration
    const sanitizeConfig = Configuration.app?.sanitizeHtmlDocs || {};
    const isSanitizationEnabled = sanitize === true && sanitizeConfig.enabled !== false;
    
    let parsedHtml;
    
    if (isSanitizationEnabled) {
        // Use DOMPurify for sanitization when enabled
        const sanitizationOptions = {
            ADD_TAGS: sanitizeConfig.additionalAllowedTags || [],
            ADD_ATTR: sanitizeConfig.additionalAllowedAttributes || [],
        };
        const sanitizedHtml = DOMPurify.sanitize(html, sanitizationOptions);
        parsedHtml = parse(sanitizedHtml);
    } else {
        // Render without sanitization
        parsedHtml = html ? parse(html) : null;
    }
    
    return (
        <>{parsedHtml}</>
    )
}
