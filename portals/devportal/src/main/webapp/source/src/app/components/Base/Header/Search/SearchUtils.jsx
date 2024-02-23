/* eslint-disable react/no-array-index-key */
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

import React from 'react';
import { styled } from '@mui/material/styles';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import InputLabel from '@mui/material/InputLabel';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import { Link } from 'react-router-dom';
import APIsIcon from '@mui/icons-material/SettingsApplicationsOutlined';
import DocumentsIcon from '@mui/icons-material/LibraryBooks';
import NativeSelect from '@mui/material/NativeSelect';
import { FormattedMessage } from 'react-intl';
import CircularProgress from '@mui/material/CircularProgress';
import classNames from 'classnames';

import API from 'AppData/api';

const PREFIX = 'SearchUtils';

const classes = {
    inputRoot: `${PREFIX}-inputRoot`,
    searchBoxWrap: `${PREFIX}-searchBoxWrap`,
    input: `${PREFIX}-input`,
    inputFocused: `${PREFIX}-inputFocused`,
    searchBox: `${PREFIX}-searchBox`,
    selectRoot: `${PREFIX}-selectRoot`,
    ariaLabel: `${PREFIX}-ariaLabel`,
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')((
    {
        theme,
    },
) => ({
    [`& .${classes.inputRoot}`]: {
        flexDirection: 'row',
    },

    [`& .${classes.searchBoxWrap}`]: {
        display: 'flex',
    },

    [`& .${classes.input}`]: {
        width: '280px',
        background: theme.custom.appBar.searchInputBackground,
        color: theme.palette.getContrastText(theme.custom.appBar.searchInputBackground),
        '-webkit-transition': 'all .35s ease-in-out',
        transition: 'all .35s ease-in-out',
        padding: '5px 5px 5px 5px',
        minHeight: '40px',
    },

    [`& .${classes.inputFocused}`]: {
        width: '400px',
        background: theme.custom.appBar.searchInputActiveBackground,
        color: theme.palette.getContrastText(theme.custom.appBar.searchInputActiveBackground),
        padding: '5px 5px 5px 5px',
    },

    [`& .${classes.searchBox}`]: {
        padding: '5px 5px 5px 5px',
    },

    [`& .${classes.selectRoot}`]: {
        borderRight: '1px solid rgba(0, 0, 0, 0.42)',
        minHeight: '40px',
        padding: '5px 5px 5px 15px',
        background: theme.custom.appBar.searchInputBackground,
        color: theme.palette.getContrastText(theme.custom.appBar.searchInputBackground),
    },

    [`& .${classes.ariaLabel}`]: {
        width: 0,
        height: 0,
    },
}));

/**
 *
 * @param {Object} inputProps Props given for the underline input element
 * @returns {React.Component} @inheritdoc
 */
function renderInput(inputProps) {
    const {
        ref, isLoading, onDropDownChange, ...other
    } = inputProps;

    let loadingAdorment = null;
    if (isLoading) {
        loadingAdorment = (
            <InputAdornment position='end'>
                <CircularProgress />
            </InputAdornment>
        );
    }
    return (
        <Root>
            <div className={classes.searchBoxWrap}>
                <InputLabel className={classes.ariaLabel} htmlFor='searchEnvironment'>Environment</InputLabel>
                <NativeSelect
                    id='searchEnvironment'
                    onChange={onDropDownChange}
                    className={classNames(classes.selectRoot, 'api-filter-dropdown')}
                >
                    <FormattedMessage
                        id='Base.Header.headersearch.SearchUtils.lcState.all'
                        defaultMessage='All'
                    >
                        {(placeholder) => <option value=''>{placeholder}</option>}
                    </FormattedMessage>
                    <FormattedMessage
                        id='Base.Header.headersearch.SearchUtils.lcState.published'
                        defaultMessage='Production'
                    >
                        {(placeholder) => <option value='PUBLISHED'>{placeholder}</option>}
                    </FormattedMessage>
                    <FormattedMessage
                        id='Base.Header.headersearch.SearchUtils.lcState.prototyped'
                        defaultMessage='Prototyped'
                    >
                        {(placeholder) => <option value='PROTOTYPED'>{placeholder}</option>}
                    </FormattedMessage>
                </NativeSelect>
                <TextField
                    variant='standard'
                    id='searchQuery'
                    classes={{ root: classNames(classes.inputRoot, 'api-search-textbox') }}
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
                        ...other,
                    }}
                />
            </div>
        </Root>
    );
}

/**
 *
 * Use your imagination to define how suggestions are rendered.
 * @param {Object} suggestion This is either API object or document coming from search API call
 * @param {Object} { query, isHighlighted } query : User entered value
 * @returns {React.Component} @inheritdoc
 */
function renderSuggestion(suggestion, { query, isHighlighted }) {
    const matches = match(suggestion.name, query);
    const parts = parse(suggestion.name, matches);
    const path = suggestion.type === 'API' ? `/apis/${suggestion.id}/overview`
        : `/apis/${suggestion.apiUUID}/documents/${suggestion.id}/details`;
    // TODO: Style the version ( and apiName if docs) apearing in the menu item
    const suffix = suggestion.type === 'API' ? suggestion.version : (suggestion.apiName + ' ' + suggestion.apiVersion);
    return (
        <>
            <Link to={path} style={{ color: 'black' }}>
                <MenuItem selected={isHighlighted}>
                    <ListItemIcon>
                        { suggestion.type === 'API' ? <APIsIcon /> : <DocumentsIcon /> }
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
                        secondary={suffix}
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
    return suggestion.name;
}

/**
 * Compose the query that needs to be send to the backend api
 * @param searchText
 * @param lcstate
 * @returns {string}
 */
function buildSearchQuery(searchText, lcstate) {
    const newSearchText = (searchText && !searchText.includes(':')) ? 'content:' + searchText : searchText;
    return lcstate
        ? (newSearchText + ' status:' + lcstate).trim().toLowerCase() : newSearchText.trim();
}

/**
 * Called for any input change to get the results set
 *
 * @param {String} value current value in input element
 * @returns {Promise} If no input text, return a promise which resolve to empty array, else return the API.all response
 */
function getSuggestions(searchText, lcstate) {
    const searchQuery = buildSearchQuery(searchText, lcstate);
    if (/:(\s+|(?![\s\S]))/g.test(searchText)) {
        return new Promise((resolve) => resolve({ obj: { list: [] } }));
    } else {
        const api = new API();
        return api.search({ query: searchQuery, limit: 8 });
    }
}

export {
    renderInput, renderSuggestion, getSuggestions, getSuggestionValue, buildSearchQuery,
};
