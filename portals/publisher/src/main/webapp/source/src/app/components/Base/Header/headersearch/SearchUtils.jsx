/* eslint-disable react/no-array-index-key */
/*
 * Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React from 'react';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import InputLabel from '@mui/material/InputLabel';
import Divider from '@mui/material/Divider';
import Icon from '@mui/material/Icon';
import InputAdornment from '@mui/material/InputAdornment';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import { Link } from 'react-router-dom';
import CustomIcon from 'AppComponents/Shared/CustomIcon';
import CircularProgress from '@mui/material/CircularProgress';

import API from 'AppData/api';
import SearchParser from './SearchParser';
/* Utility methods defined here are described in
 * react-autosuggest documentation https://github.com/moroshko/react-autosuggest
 */

/**
 *
 * @param {Object} inputProps Props given for the underline input element
 * @returns {React.Component} @inheritdoc
 */
function renderInput(inputProps) {
    const {
        classes, ref, isLoading, onChange, ...other
    } = inputProps; // `isLoading` has destructured here to prevent passing unintended prop to TextField
    let loadingAdorment = null;
    if (isLoading) {
        loadingAdorment = (
            <InputAdornment position='end'>
                <CircularProgress />
            </InputAdornment>
        );
    }
    return (
        <>
            <InputLabel className={classes.ariaLabel} htmlFor='searchQuery'>Search APIs</InputLabel>
            <TextField
                id='searchQuery' // Pay attention to usages when renaming this ID
                InputProps={{
                    inputRef: ref,
                    className: classes.input,
                    classes: { focused: classes.inputFocused },
                    startAdornment: (
                        <InputAdornment position='start'>
                            <SearchOutlined />
                        </InputAdornment>
                    ),
                    endAdornment: loadingAdorment,
                    onChange,
                    ...other,
                }}
            />
        </>
    );
}

/**
 * Get the path for the artifact
 * @param {Object} suggestion - The suggestion object
 * @returns {string} @inheritdoc
 */
function getPath(suggestion) {
    switch (suggestion.type) {
        case 'API':
            return `/apis/${suggestion.id}/overview`;
        case 'APIPRODUCT':
            return `/api-products/${suggestion.id}/overview`;
        case 'MCP':
            return `/mcp-servers/${suggestion.id}/overview`;
        case 'DEFINITION':
            if (suggestion.associatedType === 'API') {
                return `/apis/${suggestion.apiUUID}/api-definition`
            } else if (suggestion.associatedType === 'MCP') {
                return `/mcp-servers/${suggestion.apiUUID}/api-definition`
            } else {
                return `/api-products/${suggestion.apiUUID}/api-definition`
            }
        default:
            if (suggestion.associatedType === 'API') {
                return `/apis/${suggestion.apiUUID}/documents/${suggestion.id}/details`;
            } else if (suggestion.associatedType === 'MCP') {
                return `/mcp-servers/${suggestion.apiUUID}/documents/${suggestion.id}/details`;
            } else {
                return `/api-products/${suggestion.apiUUID}/documents/${suggestion.id}/details`;
            }
    }
}

/**
 * Get the meta information for the artifact
 * @param {Object} suggestion - The suggestion object
 * @returns {string} @inheritdoc
 */
function getArtifactMetaInfo(suggestion) {
    switch (suggestion.type) {
        case 'API':
            return suggestion.version;
        case 'MCP':
            return suggestion.version;
        case 'APIPRODUCT':
            return '';
        default:
            return (suggestion.apiDisplayName || suggestion.apiName) + ' ' + suggestion.apiVersion;
    }
}

/**
 * Get the meta information for the artifact
 * @param {string} type - The type of the artifact
 * @returns {React.Component} @inheritdoc
 */
function getIcon(type) {
    switch (type) {
        case 'API':
            return (
                <CustomIcon
                    width={16}
                    height={16}
                    icon='apis'
                    strokeColor='#000000'
                />
            );
        case 'MCP':
            return (
                <CustomIcon
                    width={16}
                    height={16}
                    icon='mcp-servers'
                    strokeColor='#000000'
                />
            );
        case 'APIPRODUCT':
            return (
                <CustomIcon
                    width={16}
                    height={16}
                    icon='api-product'
                    strokeColor='#000000'
                />
            );
        case 'DEFINITION':
            return <Icon style={{ fontSize: 30 }}>code</Icon>;
        default:
            return <Icon style={{ fontSize: 30 }}>library_books</Icon>;
    }
}
/**
 *
 * Use your imagination to define how suggestions are rendered.
 * @param {Object} suggestion This is either API object or document coming from search API call
 * @param {Object} { query, isHighlighted } query : User entered value
 * @returns {React.Component} @inheritdoc
 */
function renderSuggestion(suggestion, { query, isHighlighted }) {
    const matches = match(suggestion.displayName || suggestion.name, query);
    const parts = parse(suggestion.displayName || suggestion.name, matches);
    const path = getPath(suggestion);
    const artifactMetaInfo = getArtifactMetaInfo(suggestion);
    // TODO: Style the version ( and apiName if docs) apearing in the menu item

    return (
        <>
            <Link to={path} style={{ color: 'black' }}>
                <MenuItem selected={isHighlighted}>
                    <ListItemIcon>
                        {getIcon(suggestion.type)}
                    </ListItemIcon>

                    <ListItemText
                        primary={parts.map((part, index) => {
                            return part.highlight ? (
                                <span key={String(index)} style={{ fontWeight: 500 }}>
                                    {part.text}
                                </span>
                            ) : (
                                <strong key={String(index)} style={{ fontWeight: 300 }}>
                                    {part.text}
                                </strong>
                            );
                        })}
                        secondary={artifactMetaInfo}
                    />
                </MenuItem>
            </Link>
            <Divider />
        </>
    );
}

/**
 * When suggestion is clicked, Autosuggest needs to populate the input
 * based on the clicked suggestion. Teach Autosuggest how to calculate the input value for every given suggestion.
 *
 * @param {Object} suggestion API Object returned from APIS search api.list[]
 * @returns {String} API Name
 */
function getSuggestionValue(suggestion) {
    return suggestion.displayName || suggestion.name;
}

/**
 * Build the search query from the user input
 * @param searchText
 * @returns {string}
 */
function buildSearchQuery(searchText) {
    const inputValue = searchText.trim();
    return SearchParser.parse(inputValue);
}

/**
 * Called for any input change to get the results set
 *
 * @param {String} value current value in input element
 * @returns {Promise} If no input text, return a promise which resolve to empty array, else return the API.all response
 */
function getSuggestions(value) {
    // Skip empty and invalid inputs such as queries ending with a colon
    if (value.trim().length === 0 || /:(\s+|(?![\s\S]))/g.test(value)) {
        return new Promise((resolve) => resolve({ obj: { list: [] } }));
    }
    
    const modifiedSearchQuery = buildSearchQuery(value);

    if (!modifiedSearchQuery) {
        return new Promise((resolve) => resolve({ obj: { list: [] } }));
    } else {
        return API.search({ query: modifiedSearchQuery, limit: 8 });
    }
}

export {
    renderInput, renderSuggestion, getSuggestions, getSuggestionValue, buildSearchQuery,
};
