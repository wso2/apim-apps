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
import { withRouter } from 'react-router-dom';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import Autosuggest from 'react-autosuggest';
import Paper from '@mui/material/Paper';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import { FormattedMessage, injectIntl } from 'react-intl';
import { usePortalMode, PORTAL_MODES } from 'AppUtils/PortalModeUtils';
import {
    renderInput, renderSuggestion, getSuggestions, getSuggestionValue, buildSearchQuery,
} from './SearchUtils';

const PREFIX = 'HeaderSearch';

const classes = {
    container: `${PREFIX}-container`,
    smContainer: `${PREFIX}-smContainer`,
    suggestionsContainerOpen: `${PREFIX}-suggestionsContainerOpen`,
    suggestion: `${PREFIX}-suggestion`,
    suggestionsList: `${PREFIX}-suggestionsList`,
    infoButton: `${PREFIX}-infoButton`,
    emptyContainer: `${PREFIX}-emptyContainer`,
    InfoToolTip: `${PREFIX}-InfoToolTip`,
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')((
    {
        theme,
    },
) => ({
    display: 'flex',
    alignItems: 'center',
    [`& .${classes.container}`]: {
        flexGrow: 0,
    },

    [`& .${classes.smContainer}`]: {
        position: 'absolute',
    },

    [`& .${classes.suggestionsContainerOpen}`]: {
        display: 'block',
        position: 'absolute',
        width: '517px',
        zIndex: theme.zIndex.modal + 1,
        backgroundColor: theme.custom.appBar.searchInputActiveBackground,
    },

    [`& .${classes.suggestion}`]: {
        display: 'block',
    },

    [`& .${classes.suggestionsList}`]: {
        margin: 0,
        padding: 0,
        listStyleType: 'none',
        '& span, & p, & svg': {
            color: theme.palette.getContrastText(theme.custom.appBar.searchInputBackground),
        },
    },

    [`& .${classes.infoButton}`]: {
        margin: theme.spacing(1),
        color: theme.palette.getContrastText(theme.custom.appBar.background),
    },

    [`& .${classes.emptyContainer}`]: {
        flexGrow: 1,
    },

    [`& .${classes.InfoToolTip}`]: {
        backgroundColor: theme.custom.appBar.searchInputBackground,
        color: theme.palette.getContrastText(theme.custom.appBar.searchInputBackground),
        maxWidth: 500,
        fontSize: theme.typography.pxToRem(14),
        fontWeight: '400',
        border: '1px solid #dadde9',
        borderRadius: '5px',
        padding: '15px 10px 0 18px',
        lineHeight: '22px',
    },
}));

/**
 * Render search bar in top AppBar
 *
 * @class HeaderSearch
 * @extends {React.Component}
 */
class HeaderSearch extends React.Component {
     suggestionSelected = false;

     /**
     * Creates an instance of HeaderSearch.
     * @param {JSON} props props from the parent
     * @returns {void}
     */
     constructor(props) {
         super(props);
         this.state = {
             searchText: '',
             lcstate: '',
             suggestions: [],
             isLoading: false,
         };
         this.handleSuggestionsFetchRequested = this.handleSuggestionsFetchRequested.bind(this);
         this.handleSuggestionsClearRequested = this.handleSuggestionsClearRequested.bind(this);
         this.handleChange = this.handleChange.bind(this);
         this.handleDropDownChange = this.handleDropDownChange.bind(this);
         this.onKeyDown = this.onKeyDown.bind(this);
         this.clearOnBlur = this.clearOnBlur.bind(this);
         this.renderSuggestionsContainer = this.renderSuggestionsContainer.bind(this);
         this.onSuggestionSelected = this.onSuggestionSelected.bind(this);
     }

     /**
     * To provide accessibility for Enter key upon suggestion selection
     * @param {React.SyntheticEvent} event event
     * @param {Object} suggestion This is either API object or document coming from search API call
     */
     onSuggestionSelected(event, { suggestion }) {
         this.suggestionSelected = true;
         const { history } = this.props;
         if (event.key === 'Enter') {
             const path = suggestion.type === 'API' ? `/apis/${suggestion.id}/overview`
                 : `/apis/${suggestion.apiUUID}/documents/${suggestion.id}/details`;
             history.push(path);
         }
     }

     /**
     * On enter pressed after giving a search text
     * @param event
     */
     onKeyDown(event) {
         if (event.key === 'Enter' && !this.suggestionSelected) {
             const { history } = this.props;
             const { lcstate } = this.state;
             history.push('/search?query=' + buildSearchQuery(event.target.value, lcstate));
         }
         this.suggestionSelected = false;
     }

     /**
     * Fetch suggestions list for the user entered input value
     *
     * @param {String} { value }
     * @memberof HeaderSearch
     */
     handleSuggestionsFetchRequested({ value }) {
         const { lcstate } = this.state;
         this.setState({ isLoading: true });
         getSuggestions(value, lcstate).then((body) => {
             this.setState({ isLoading: false, suggestions: body.obj.list });
         });
     }

     /**
     * Handle the suggestions clear Synthetic event
     *
     * @memberof HeaderSearch
     */
     handleSuggestionsClearRequested() {
         this.setState({
             suggestions: [],
         });
     }

     /**
     * On change search input element
     *
     * @param {React.SyntheticEvent} event ReactDOM event
     * @param {String} { newValue } Changed value
     * @memberof HeaderSearch
     */
     handleChange(event, { newValue }) {
         this.setState({
             searchText: newValue,
         });
     }

     /**
     * On change of lcstate drop down
     *
     * @param {React.SyntheticEvent} event ReactDOM event
     * @param {String} { newValue } Changed value
     * @memberof HeaderSearch
     */
     handleDropDownChange(event) {
         const { searchText } = this.state;
         this.setState({
             lcstate: event.target.value,
         });
         const { history } = this.props;
         if (event.target.value) {
             history.push('/search?query=' + buildSearchQuery(searchText, event.target.value));
         } else {
             history.push('/apis/');
         }
     }

     /**
     * Get search placeholder text based on portal mode
     * @returns {string} Placeholder text
     */
     getSearchPlaceholder() {
         const { intl, portalMode } = this.props;

         switch (portalMode) {
             case PORTAL_MODES.API_ONLY:
                 return intl.formatMessage({
                     id: 'Base.Header.headersearch.HeaderSearch.search_api.tooltip',
                     defaultMessage: 'Search APIs',
                 });
             case PORTAL_MODES.MCP_ONLY:
                 return intl.formatMessage({
                     id: 'Base.Header.headersearch.HeaderSearch.search_mcp.tooltip',
                     defaultMessage: 'Search MCP Servers',
                 });
             case PORTAL_MODES.HYBRID:
             default:
                 return intl.formatMessage({
                     id: 'Base.Header.headersearch.HeaderSearch.search_hybrid.tooltip',
                     defaultMessage: 'Search APIs & MCP Servers',
                 });
         }
     }

     /**
     *
     * When search input is focus out (Blur), Clear the input text to accept brand new search
     * If Search input is show in responsive mode, On blur search input, hide the input element and show the search icon
     * @memberof HeaderSearch
     */
     clearOnBlur() {
         const { smSearch, toggleSmSearch } = this.props;
         if (smSearch) {
             toggleSmSearch();
         } else {
             this.setState({ lcstate: '', searchText: '' });
         }
     }

     /**
     * Render the suggestions container
     * @param {Object} options Options for the suggestions container
     * @returns {React.Component} The suggestions container
     * @memberof HeaderSearch
     */
     renderSuggestionsContainer(options) {
         const { containerProps, children } = options;
         const { isLoading } = this.state;

         return isLoading ? (
             null
         ) : (
             <Paper {...containerProps} square>
                 {children}
             </Paper>
         );
     }

     /**
     *
     * @inheritdoc
     * @returns {React.Component} @inheritdoc
     * @memberof HeaderSearch
     */
     render() {
         const { smSearch } = this.props;
         const {
             searchText, lcstate, isLoading, suggestions,
         } = this.state;
         let autoFocus = false;
         let responsiveContainer = classes.container;
         if (smSearch) {
             autoFocus = true;
             responsiveContainer = classes.smContainer;
         }
         return (
             <Root>
                 <Autosuggest
                     theme={{
                         container: responsiveContainer,
                         suggestionsContainerOpen: classes.suggestionsContainerOpen,
                         suggestionsList: classes.suggestionsList,
                         suggestion: classes.suggestion,
                     }}
                     suggestions={suggestions}
                     renderInputComponent={renderInput}
                     onSuggestionsFetchRequested={this.handleSuggestionsFetchRequested}
                     onSuggestionsClearRequested={this.handleSuggestionsClearRequested}
                     getSuggestionValue={getSuggestionValue}
                     renderSuggestion={renderSuggestion}
                     renderSuggestionsContainer={this.renderSuggestionsContainer}
                     onSuggestionSelected={this.onSuggestionSelected}
                     inputProps={{
                         autoFocus,
                         classes,
                         placeholder: this.getSearchPlaceholder(),
                         value: searchText,
                         lcstate,
                         onChange: this.handleChange,
                         onDropDownChange: this.handleDropDownChange,
                         onKeyDown: this.onKeyDown,
                         onBlur: this.clearOnBlur,
                         isLoading,
                     }}
                 />
                 <Tooltip
                     interactive
                     id='searchTooltip'
                     placement='top'
                     classes={{
                         tooltip: classes.InfoToolTip,
                     }}
                     title={(
                         <>
                             <FormattedMessage
                                 id='Base.Header.headersearch.HeaderSearch.tooltip.title'
                                 defaultMessage='Search Options'
                             />
                             <ol style={{ marginLeft: '-20px', marginTop: '5px' }}>
                                 <li>
                                     <FormattedMessage
                                         id='Base.Header.headersearch.HeaderSearch.tooltip.option0'
                                         defaultMessage='Content [ Default ]'
                                     />
                                 </li>
                                 <li>
                                     <FormattedMessage
                                         id='Base.Header.headersearch.HeaderSearch.tooltip.option1'
                                         defaultMessage='Name [ Syntax - name:xxxx ]'
                                     />
                                 </li>
                                 <li>
                                     <FormattedMessage
                                         id='Base.Header.headersearch.HeaderSearch.tooltip.option7'
                                         defaultMessage='Display Name [ Syntax - display-name:xxxx ]'
                                     />
                                 </li>
                                 <li>
                                     <FormattedMessage
                                         id='Base.Header.headersearch.HeaderSearch.tooltip.option2'
                                         defaultMessage='By API Provider [ Syntax - provider:xxxx ]'
                                     />
                                 </li>
                                 <li>
                                     <FormattedMessage
                                         id='Base.Header.headersearch.HeaderSearch.tooltip.option3'
                                         defaultMessage='By API Version [ Syntax - version:xxxx ]'
                                     />
                                 </li>
                                 <li>
                                     <FormattedMessage
                                         id='Base.Header.headersearch.HeaderSearch.tooltip.option4'
                                         defaultMessage='By Context [ Syntax - context:xxxx ]'
                                     />
                                 </li>
                                 <li>
                                     <FormattedMessage
                                         id='Base.Header.headersearch.HeaderSearch.tooltip.option5'
                                         defaultMessage='By Description [ Syntax - description:xxxx ]'
                                     />
                                 </li>
                                 <li>
                                     <FormattedMessage
                                         id='Base.Header.headersearch.HeaderSearch.tooltip.option6'
                                         defaultMessage='By Tags [ Syntax - tags:xxxx ]'
                                     />
                                 </li>
                                 <li>
                                     <FormattedMessage
                                         id='Base.Header.headersearch.HeaderSearch.tooltip.option13'
                                         defaultMessage='Gateway Vendor [ Syntax - vendor:xxxx ]'
                                     />
                                 </li>
                                 <li>
                                     <FormattedMessage
                                         id='Base.Header.headersearch.HeaderSearch.tooltip.option12'
                                         defaultMessage='By Api Category [ Syntax - api-category:xxxx ]'
                                     />
                                 </li>
                                 <li>
                                     <FormattedMessage
                                         id='Base.Header.headersearch.HeaderSearch.tooltip.option10'
                                         defaultMessage='By API Properties [Syntax - property_name:property_value]'
                                     />
                                 </li>
                             </ol>
                         </>
                     )}
                 >
                     <IconButton className={classNames(classes.infoButton, 'search-tips-icon')} aria-label='Search Options'>
                         <InfoIcon />
                     </IconButton>
                 </Tooltip>
                 <Box sx={{ flexGrow: 1 }} />
             </Root>
         );
     }
}

HeaderSearch.defaultProps = {
    smSearch: false,
    toggleSmSearch: undefined,
    portalMode: PORTAL_MODES.HYBRID,
};
HeaderSearch.propTypes = {
    classes: PropTypes.instanceOf(Object).isRequired,
    smSearch: PropTypes.bool,
    toggleSmSearch: PropTypes.func,
    history: PropTypes.shape({
        push: PropTypes.func,
    }).isRequired,
    intl: PropTypes.shape({
        formatMessage: PropTypes.func,
    }).isRequired,
    portalMode: PropTypes.string,
};

// Create a functional wrapper to use the portal mode hook
const HeaderSearchWithPortalMode = (props) => {
    const portalMode = usePortalMode();
    const {
        smSearch, toggleSmSearch, history, intl, classes: propClasses,
    } = props;
    return (
        <HeaderSearch
            smSearch={smSearch}
            toggleSmSearch={toggleSmSearch}
            history={history}
            intl={intl}
            classes={propClasses}
            portalMode={portalMode}
        />
    );
};

HeaderSearchWithPortalMode.propTypes = {
    smSearch: PropTypes.bool,
    toggleSmSearch: PropTypes.func,
    history: PropTypes.shape({
        push: PropTypes.func,
    }).isRequired,
    intl: PropTypes.shape({
        formatMessage: PropTypes.func,
    }).isRequired,
    classes: PropTypes.instanceOf(Object).isRequired,
};

HeaderSearchWithPortalMode.defaultProps = {
    smSearch: false,
    toggleSmSearch: undefined,
};

export default injectIntl(withRouter(HeaderSearchWithPortalMode));
