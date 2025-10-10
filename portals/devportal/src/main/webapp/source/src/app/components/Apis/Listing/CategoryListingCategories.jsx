/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import { styled, useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import { FormattedMessage } from 'react-intl';
import CategoryIcon from '@mui/icons-material/Category';
import APICategoryThumb from './APICategoryThumb';

const PREFIX = 'CategoryListingCategories';

const classes = {
    mainTitle: `${PREFIX}-mainTitle`,
    mainTitleWrapper: `${PREFIX}-mainTitleWrapper`,
    listContentWrapper: `${PREFIX}-listContentWrapper`,
    textWrapper: `${PREFIX}-textWrapper`,
    tagWiseThumbWrapper: `${PREFIX}-tagWiseThumbWrapper`,
    filterTitle: `${PREFIX}-filterTitle`,
    scrollableList: `${PREFIX}-scrollableList`,
    CategoryTitleIcon: `${PREFIX}-CategoryTitleIcon`,
};

const Root = styled('div')((
    {
        theme,
    },
) => ({
    [`&.${classes.mainTitle}`]: {
        paddingTop: 0,
        flex: '0 1 auto',
        maxHeight: '50%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },

    [`& .${classes.mainTitleWrapper}`]: {
        flexGrow: 1,
    },

    [`& .${classes.listContentWrapper}`]: {
        padding: `0 ${theme.spacing(3)}`,
    },

    [`& .${classes.textWrapper}`]: {
        color: theme.custom.tagCloud.leftMenu.color,
        '& .material-icons': {
            color: theme.custom.tagCloud.leftMenu.color,
        },
    },

    [`& .${classes.tagWiseThumbWrapper}`]: {
        display: 'flex',
    },

    [`& .${classes.filterTitle}`]: {
        fontWeight: 200,
        paddingLeft: theme.spacing(2),
        background: theme.custom.tagCloud.leftMenu.titleBackground,
        color: theme.palette.getContrastText(theme.custom.tagCloud.leftMenu.titleBackground),
        height: theme.custom.infoBar.height,
        alignItems: 'center',
        display: 'flex',
        flex: '0 0 auto',
    },

    [`& .${classes.scrollableList}`]: {
        minHeight: 0,
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
            background: 'transparent',
            width: '6px',
        },
        '&::-webkit-scrollbar-track': {
            background: 'transparent',
            borderRadius: theme.custom.tagCloud.scrollBar.thumbBorderRadius,
        },
        '&::-webkit-scrollbar-thumb': {
            background: theme.custom.tagCloud.scrollBar.thumbBackground,
            borderRadius: theme.custom.tagCloud.scrollBar.thumbBorderRadius,
        },
        '&::-webkit-scrollbar-thumb:hover': {
            background: theme.custom.tagCloud.scrollBar.thumbBackgroundHover,
        },
    },

    [`& .${classes.CategoryTitleIcon}`]: {
        marginRight: theme.spacing(1),
        verticalAlign: 'middle',
        fontSize: '1.2rem',
    },
}));

/**
 * Shared listing page
 *
 * @class CategoryListingCategories
 * @extends {Component}
 */
function CategoryListingCategories(props) {
    const theme = useTheme();
    const {
        custom: {
            tagWise: {
                style,
            },
        },
    } = theme;

    /**
     * Get the tag wise URL based on the route
     * @returns {string} The tag wise URL
     */
    const tagWiseURL = () => {
        const isMCPServersRoute = window.location.pathname.includes('/mcp-servers');
        const basePath = isMCPServersRoute ? '/mcp-servers?offset=0&query=' : '/apis?offset=0&query=';
        const type = isMCPServersRoute ? 'type:MCP' : 'type:HTTP type:WS type:SOAPTOREST type:GRAPHQL type:SOAP '
            + 'type:SSE type:WEBSUB type:WEBHOOK type:ASYNC type:APIProduct';
        const apiCategory = ' api-category';
        return basePath + type + apiCategory;
    };

    const { allCategories, selectedCategory, onCategorySelect } = props;

    /**
     *
     * @inheritdoctheme
     * @returns {React.Component} @inheritdoc
     * @memberof TagCloudListing
     */

    return allCategories && allCategories.length > 0 ? (
        (
            <Root className={classNames(classes.mainTitle, 'category-listing-categories-empty')}>
                <Typography variant='h6' gutterBottom className={classNames(classes.filterTitle, 'api-cat-title')}>
                    <CategoryIcon className={classes.CategoryTitleIcon} />
                    <FormattedMessage defaultMessage='API Categories' id='Apis.Listing.CategoryListingCategories.title' />
                </Typography>
                <List
                    component='nav'
                    aria-label='API categories'
                    className={classNames('category-listing-categories', classes.scrollableList)}
                >
                    {Object.keys(allCategories).map((key) => {
                        const category = allCategories[key];
                        return (
                            <APICategoryThumb
                                key={key}
                                category={category}
                                path={tagWiseURL()}
                                style={style}
                                onClick={() => onCategorySelect(category.id)}
                                selected={selectedCategory === category.id}
                            />
                        );
                    })}
                </List>
            </Root>
        )
    ) : (
        <Root className={classNames(classes.mainTitle, 'category-listing-categories-empty')}>
            <Typography variant='subtitle1' gutterBottom align='center'>
                <FormattedMessage
                    defaultMessage='Categories cannot be found'
                    id='Apis.Listing.CategoryListingCategories.categoriesNotFound'
                />
            </Typography>
        </Root>
    );
}

CategoryListingCategories.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    theme: PropTypes.shape({}).isRequired,
    allTags: PropTypes.shape({}).isRequired,
    allCategories: PropTypes.shape({}).isRequired,
    onCategorySelect: PropTypes.func.isRequired,
};

export default CategoryListingCategories;
