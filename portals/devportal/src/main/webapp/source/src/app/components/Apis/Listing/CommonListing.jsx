/* eslint-disable prefer-destructuring */
/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import IconButton from '@mui/material/IconButton';
import Icon from '@mui/material/Icon';
import classNames from 'classnames';
import CustomIcon from 'AppComponents/Shared/CustomIcon';
import Settings from 'AppComponents/Shared/SettingsContext';
import API from 'AppData/api';
import { useTheme } from '@mui/material';
import ApiBreadcrumbs from './ApiBreadcrumbs';
import ApiTableView from './ApiTableView';
import { ApiContext } from '../Details/ApiContext';
import TagCloudListingTags from './TagCloudListingTags';
import CategoryListingCategories from './CategoryListingCategories';
import ApiTagCloud from './ApiTagCloud';
import Recommendations from './Recommendations';
import AuthManager from '../../../data/AuthManager';

const PREFIX = 'CommonListingLegacy';

const classes = {
    rightIcon: `${PREFIX}-rightIcon`,
    button: `${PREFIX}-button`,
    buttonRight: `${PREFIX}-buttonRight`,
    ListingWrapper: `${PREFIX}-ListingWrapper`,
    appBar: `${PREFIX}-appBar`,
    mainIconWrapper: `${PREFIX}-mainIconWrapper`,
    mainTitle: `${PREFIX}-mainTitle`,
    mainTitleWrapper: `${PREFIX}-mainTitleWrapper`,
    listContentWrapper: `${PREFIX}-listContentWrapper`,
    iconDefault: `${PREFIX}-iconDefault`,
    iconSelected: `${PREFIX}-iconSelected`,
    content: `${PREFIX}-content`,
    contentWithTags: `${PREFIX}-contentWithTags`,
    contentWithoutTags: `${PREFIX}-contentWithoutTags`,
    contentWithTagsHidden: `${PREFIX}-contentWithTagsHidden`,
    LeftMenu: `${PREFIX}-LeftMenu`,
    LeftMenuForSlider: `${PREFIX}-LeftMenuForSlider`,
    sliderButton: `${PREFIX}-sliderButton`,
    rotatedText: `${PREFIX}-rotatedText`,
    recommendationsBar: `${PREFIX}-recommendationsBar`,
    apiListingWrapper: `${PREFIX}-apiListingWrapper`,
};

const Root = styled('div')((
    {
        theme,
    },
) => ({
    [`& .${classes.rightIcon}`]: {
        marginLeft: theme.spacing(1),
    },

    [`& .${classes.button}`]: {
        margin: theme.spacing(1),
        marginBottom: 0,
    },

    [`& .${classes.buttonRight}`]: {
        alignSelf: 'flex-end',
        display: 'flex',
    },

    [`& .${classes.ListingWrapper}`]: {
        paddingTop: 10,
        paddingLeft: 35,
        maxWidth: theme.custom.contentAreaWidth,
    },

    [`& .${classes.appBar}`]: {
        height: 70,
        background: theme.custom.infoBar.background,
        color: theme.palette.getContrastText(theme.custom.infoBar.background),
        borderBottom: 'solid 1px ' + theme.palette.grey.A200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },

    [`& .${classes.mainIconWrapper}`]: {
        paddingTop: 13,
        paddingLeft: 20,
        paddingRight: 20,
    },

    [`& .${classes.mainTitle}`]: {
        paddingTop: 10,
    },

    [`& .${classes.mainTitleWrapper}`]: {
        flexGrow: 1,
    },

    [`& .${classes.listContentWrapper}`]: {
        padding: `0 ${theme.spacing(3)}`,
        display: 'flex',
        marginLeft: -40,
    },

    [`& .${classes.iconDefault}`]: {
        color: theme.palette.getContrastText(theme.custom.infoBar.background),
    },

    [`& .${classes.iconSelected}`]: {
        color: theme.custom.infoBar.listGridSelectedColor,
    },

    [`& .${classes.content}`]: {
        flexGrow: 1,
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        paddingBottom: theme.spacing(3),
    },

    [`& .${classes.contentWithTags}`]: {
        marginLeft: theme.custom.tagCloud.leftMenu.width,
    },

    [`& .${classes.contentWithoutTags}`]: {
        marginLeft: -4,
    },

    [`& .${classes.contentWithTagsHidden}`]: {
        marginLeft: theme.custom.tagCloud.leftMenu.sliderWidth,
    },

    [`& .${classes.LeftMenu}`]: {
        backgroundColor: theme.custom.tagCloud.leftMenu.background,
        color: theme.custom.tagCloud.leftMenu.color,
        textAlign: 'left',
        fontFamily: theme.typography.fontFamily,
        position: 'absolute',
        bottom: 0,
        paddingLeft: 0,
        width: theme.custom.tagCloud.leftMenu.width,
        top: 0,
        left: 0,
        overflowY: 'auto',
    },

    [`& .${classes.LeftMenuForSlider}`]: {
        backgroundColor: theme.custom.tagCloud.leftMenu.background,
        color: theme.custom.tagCloud.leftMenu.color,
        textAlign: 'left',
        fontFamily: theme.typography.fontFamily,
        position: 'absolute',
        bottom: 0,
        paddingLeft: 0,
        width: theme.custom.tagCloud.leftMenu.sliderWidth,
        top: 0,
        left: 0,
        overflowY: 'auto',
        display: 'flex',
    },

    [`& .${classes.sliderButton}`]: {
        fontWeight: 200,
        background: theme.custom.tagCloud.leftMenu.sliderBackground,
        color: theme.palette.getContrastText(theme.custom.tagCloud.leftMenu.sliderBackground),
        height: theme.custom.infoBar.height,
        alignItems: 'center',
        display: 'flex',
        position: 'absolute',
        right: 0,
        cursor: 'pointer',
    },

    [`& .${classes.rotatedText}`]: {
        transform: 'rotate(270deg)',
        transformOrigin: 'left bottom 0',
        position: 'absolute',
        whiteSpace: 'nowrap',
        top: theme.custom.infoBar.height * 4,
        marginLeft: 23,
        cursor: 'pointer',
    },

    [`& .${classes.recommendationsBar}`]: {
        height: 60,
        background: theme.custom.infoBar.background,
        color: theme.palette.getContrastText(theme.custom.infoBar.background),
        borderBottom: 'solid 1px ' + theme.palette.grey.A200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },

    [`&.${classes.apiListingWrapper}`]: {
        width: '100%',
    },
}));

/**
 * Shared listing page
 *
 * @class CommonListingLegacy
 * @extends {Component}
 */
class CommonListingLegacy extends React.Component {
    /**
     * Constructor
     *
     * @param {*} props Properties
     */
    constructor(props) {
        super(props);
        let { defaultApiView } = props.theme.custom;
        this.showToggle = true;
        if (typeof defaultApiView === 'object' && defaultApiView.length > 0) {
            if (defaultApiView.length === 1) { // We will disable the other
                this.showToggle = false;
            }
            defaultApiView = defaultApiView[0];
        } else {
            defaultApiView = localStorage.getItem('portal.listType') || defaultApiView;
        }
        this.state = {
            listType: defaultApiView,
            allTags: null,
            showLeftMenu: false,
            isMonetizationEnabled: false,
            isRecommendationEnabled: false,
        };
    }

    /**
     *
     * Get all tags
     * @memberof CommonListingLegacy
     */
    componentDidMount() {
        const restApiClient = new API();
        const promisedTags = restApiClient.getAllTags();
        promisedTags
            .then((response) => {
                this.setState({ allTags: response.body.list });
            })
            .catch((error) => {
                console.log(error);
            });
        const promisedCategories = restApiClient.apiCategories();
        promisedCategories
            .then((response) => {
                this.setState({ allCategories: response.body.list });
            })
            .catch((error) => {
                console.log(error);
            });
        this.isMonetizationEnabled();
        this.isRecommendationEnabled();
    }

    /**
     *
     * Switch the view between grid and list view
     * @param {String} value view type
     * @memberof CommonListingLegacy
     */
     setListType = (value) => {
         localStorage.setItem('portal.listType', value);
         this.setState({ listType: value });
     };

    toggleLeftMenu = () => {
        this.setState((prevState) => ({ showLeftMenu: !prevState.showLeftMenu }));
    };

    /**
     * retrieve Settings from the context and check the monetization enabled
     */
    isMonetizationEnabled = () => {
        const settingsContext = this.context;
        const enabled = settingsContext.settings.monetizationEnabled;
        this.setState({ isMonetizationEnabled: enabled });
    }

    /**
     * retrieve Settings from the context and check whether recommendation is enabled
     */
    isRecommendationEnabled = () => {
        const settingsContext = this.context;
        const enabled = settingsContext.settings.recommendationEnabled;
        this.setState({ isRecommendationEnabled: enabled });
    }

    /**
     *
     * @inheritdoctheme
     * @returns {React.Component} @inheritdoc
     * @memberof CommonListingLegacy
     */
    render() {
        const {
            theme,
            location: { search },
        } = this.props;
        const user = AuthManager.getUser();
        const {
            custom: {
                tagWise: { key, active },
                tagCloud: { active: tagCloudActive },
            },
        } = theme;
        const {
            listType, allTags, showLeftMenu, isMonetizationEnabled, allCategories, isRecommendationEnabled,
        } = this.state;
        const strokeColorMain = theme.palette.getContrastText(theme.custom.infoBar.background);
        const searchParam = new URLSearchParams(search);
        const searchQuery = searchParam.get('query');
        let selectedTag = null;
        if (search && searchQuery !== null) {
            // For the tagWise search
            if (active && key) {
                const splits = searchQuery.split(':');
                if (splits.length > 1 && splits[1].search(key) !== -1) {
                    const splitTagArray = splits[1].split(key);
                    if (splitTagArray.length > 0) {
                        selectedTag = splitTagArray[0];
                    }
                } else if (splits.length > 1 && splits[0] === 'tag') {
                    selectedTag = splits[1];
                }
            }
        }
        const tagPaneVisible = allTags && allTags.length > 0 && (tagCloudActive || active);
        const categoryPaneVisible = allCategories && allCategories.length > 0;
        return (
            <Root className={classNames(classes.apiListingWrapper, 'api-listing-wrapper')}>
                {(categoryPaneVisible || tagPaneVisible) && showLeftMenu && (
                    <div className={classNames(classes.LeftMenu, 'api-listing-left-menu')}>
                        <div
                            className={classNames(classes.sliderButton, 'api-listing-slider-btn')}
                            onClick={this.toggleLeftMenu}
                            onKeyDown={this.toggleLeftMenu}
                        >
                            <Icon>keyboard_arrow_left</Icon>
                        </div>
                        {categoryPaneVisible && <CategoryListingCategories allCategories={allCategories} />}
                        {tagPaneVisible && active && <TagCloudListingTags allTags={allTags} />}
                        {tagPaneVisible && tagCloudActive && <ApiTagCloud allTags={allTags} />}
                    </div>
                )}
                {(categoryPaneVisible || tagPaneVisible) && !showLeftMenu && (
                    <div className={classNames(classes.LeftMenuForSlider, 'api-listing-left-menu-hidden')}>
                        <div
                            className={classNames(classes.sliderButton, 'api-listing-slider-btn')}
                            onClick={this.toggleLeftMenu}
                            onKeyDown={this.toggleLeftMenu}
                        >
                            <Icon>keyboard_arrow_right</Icon>
                        </div>
                        <div
                            className={classNames(classes.rotatedText, 'api-listing-title-section-hidden')}
                            onClick={this.toggleLeftMenu}
                            onKeyDown={this.toggleLeftMenu}
                        >
                            <FormattedMessage
                                defaultMessage='Tags / API Categories'
                                id='Apis.Listing.Listing.ApiTagCloud.title'
                            />
                        </div>
                    </div>
                )}

                <div
                    className={classNames(
                        classes.content,
                        { [classes.contentWithoutTags]: !(tagPaneVisible || categoryPaneVisible) || !showLeftMenu },
                        { [classes.contentWithTagsHidden]: (tagPaneVisible || categoryPaneVisible) && !showLeftMenu },
                        { [classes.contentWithTags]: (tagPaneVisible || categoryPaneVisible) && showLeftMenu },
                        'content-section',
                    )}
                    id='commonListing'
                >
                    <div className={classes.appBar} id='commonListingAppBar'>
                        <div className={classNames(classes.mainIconWrapper, 'main-icon-wrapper')}>
                            <CustomIcon strokeColor={strokeColorMain} width={42} height={42} icon='api' />
                        </div>
                        <div className={classes.mainTitleWrapper} id='mainTitleWrapper'>
                            <Typography variant='h4' component='h1' className={classes.mainTitle}>
                                <FormattedMessage defaultMessage='APIs' id='Apis.Listing.Listing.apis.main' />
                            </Typography>
                        </div>
                        {this.showToggle && (
                            <div className={classes.buttonRight} id='listGridWrapper'>
                                <IconButton
                                    aria-label='Change to list view'
                                    className={classes.button}
                                    onClick={() => this.setListType('list')}
                                    disabled={listType === 'list'}
                                    size='large'
                                >
                                    <Icon
                                        className={classNames(
                                            { [classes.iconSelected]: listType === 'list' },
                                            { [classes.iconDefault]: listType === 'grid' },
                                        )}
                                    >
                                        list
                                    </Icon>
                                </IconButton>
                                <IconButton
                                    aria-label='Change to grid view'
                                    className={classes.button}
                                    onClick={() => this.setListType('grid')}
                                    disabled={listType === 'grid'}
                                    size='large'
                                >
                                    <Icon
                                        className={classNames(
                                            { [classes.iconSelected]: listType === 'grid' },
                                            { [classes.iconDefault]: listType === 'list' },
                                        )}
                                    >
                                        grid_on
                                    </Icon>
                                </IconButton>
                            </div>
                        )}
                    </div>
                    {active && allTags && allTags.length > 0 && <ApiBreadcrumbs selectedTag={selectedTag} />}
                    <div className={classes.listContentWrapper}>
                        {listType === 'grid' && (
                            <ApiContext.Provider value={{ isMonetizationEnabled }}>
                                <ApiTableView gridView query={search} />
                            </ApiContext.Provider>
                        )}
                        {listType === 'list' && (
                            <ApiContext.Provider value={{ isMonetizationEnabled }}>
                                <ApiTableView gridView={false} query={search} />
                            </ApiContext.Provider>
                        )}
                    </div>
                    {isRecommendationEnabled && user
                        && (
                            <div>
                                {active && allTags && allTags.length > 0 && <ApiBreadcrumbs selectedTag={selectedTag} />}
                                <div className={classes.listContentWrapper}>
                                    {listType === 'grid' && (
                                        <ApiContext.Provider value={{ isRecommendationEnabled }}>
                                            <Recommendations gridView query={search} />
                                        </ApiContext.Provider>
                                    )}
                                    {listType === 'list' && (
                                        <ApiContext.Provider value={{ isRecommendationEnabled }}>
                                            <Recommendations gridView query={search} />
                                        </ApiContext.Provider>
                                    )}
                                </div>
                            </div>
                        )}
                </div>
            </Root>
        );
    }
}
CommonListingLegacy.contextType = Settings;

CommonListingLegacy.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    theme: PropTypes.shape({}).isRequired,
    location: PropTypes.shape({
        search: PropTypes.string,
    }),
};

CommonListingLegacy.defaultProps = {
    location: PropTypes.shape({
        search: '',
    }),
};

function CommonListing(props) {
    const theme = useTheme();
    return (
        <CommonListingLegacy
            {...props}
            theme={theme}
        />
    );
}

export default (CommonListing);
