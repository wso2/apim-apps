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
import APICategoryThumb from './APICategoryThumb';

const PREFIX = 'CategoryListingCategories';

const classes = {
    mainTitle: `${PREFIX}-mainTitle`,
    mainTitleWrapper: `${PREFIX}-mainTitleWrapper`,
    listContentWrapper: `${PREFIX}-listContentWrapper`,
    textWrapper: `${PREFIX}-textWrapper`,
    tagWiseThumbWrapper: `${PREFIX}-tagWiseThumbWrapper`,
    filterTitle: `${PREFIX}-filterTitle`,
};

const Root = styled('div')((
    {
        theme,
    },
) => ({
    [`&.${classes.mainTitle}`]: {
        paddingTop: 0,
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

    const tagWiseURL = '/apis?offset=0&query=api-category';
    const { allCategories } = props;

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
                    <FormattedMessage defaultMessage='API Categories' id='Apis.Listing.CategoryListingCategories.title' />
                </Typography>
                <List component='nav' aria-label='main mailbox folders' className='category-listing-categories'>
                    {Object.keys(allCategories).map((key) => {
                        return <APICategoryThumb key={key} category={allCategories[key]} path={tagWiseURL} style={style} />;
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
};

export default CategoryListingCategories;
