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
import Settings from 'Settings';

/**
 * Render html content.
 * @param {int} props Props passing down from parent components.
 * @returns {JSX} React render output.
 */
export default function HTMLRender(props) {
    const {html} = props;
    // Extract html parser props from settings.json
    const { tagsNotAllowed } = (Settings.app &&
        Settings.app.reactHTMLParser) ? Settings.app.reactHTMLParser : {
        tagsNotAllowed: [],
    };
    // Define a custom replace function to filter out script tags
    const customReplace = (node) => {
        if (node.type === 'tag' && tagsNotAllowed.find( t => t === node.name)) {
            // You can handle script tags in any way you want here.
            // For example, you can replace them with a harmless element like a <div>.
            return <div>{node.name} tags are not allowed</div>;
        }
        // Return the node as is for other tags
        return node;
    };

    // Use html-react-parser with the custom replace function
    const parsedHtml = parse(html, {
        replace: customReplace,
    });
    // Remove tags from html
    return (
        <>{parsedHtml}</>
    )
}
