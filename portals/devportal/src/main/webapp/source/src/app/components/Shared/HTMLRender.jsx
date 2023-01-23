/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
/* eslint-disable consistent-return */
/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import ReactHtmlParser from 'react-html-parser';
import Settings from 'Settings';

/**
 * Render html content.
 * @param {int} props Props passing down from parent components.
 * @returns {JSX} React render output.
 */
export default function HTMLRender(props) {
    const {html} = props;
    // Extract html parser props from settings.json
    const { decodeEntities, tagsNotAllowed } = (Settings.app && 
        Settings.app.reactHTMLParser) ? Settings.app.reactHTMLParser : {
            decodeEntities: true,
            tagsNotAllowed: [],
        };
    /**
     * Adds two numbers together.
     * https://www.npmjs.com/package/react-html-parser
     * @param {node} node node passed from react-html-parser
     * @param {int} index node index.
     * @returns {HTMLElement} HTML element to render.
     */
    function transform(node, index) {
        if (node.type === 'tag' && tagsNotAllowed.includes(node.name)) {
            return null;
        }
    }
    return (
        <>{ReactHtmlParser(html, { transform, decodeEntities })}</>
    )
}
