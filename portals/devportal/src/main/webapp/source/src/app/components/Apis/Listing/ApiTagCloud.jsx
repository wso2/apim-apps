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
import { styled, useTheme } from '@mui/material/styles';
import classNames from 'classnames';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import { TagCloud } from 'react-tagcloud';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';

const PREFIX = 'ApiTagCloud';

const classes = {
    clickablePointer: `${PREFIX}-clickablePointer`,
    filterTitle: `${PREFIX}-filterTitle`,
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')((
    {
        theme,
    },
) => ({
    [`& .${classes.clickablePointer}`]: {
        cursor: 'pointer',
        padding: theme.spacing(1),
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
 * Component used to handle API Tag Cloud
 * @class ApiTagCloud
 * @extends {React.Component}
 * @param {JSON} props @inheritDoc
 */
function ApiTagCloud(props) {
    const theme = useTheme();
    const {
        custom: {
            tagWise: { key, active },
            tagCloud: { colorOptions },
        },
    } = theme;
    const history = useHistory();

    const { allTags } = props;
    let apisTagWithoutGroups = null;
    if (allTags.count !== 0) {
        // Remove the tags with a sufix '-group' to ignore the
        if (active) {
            apisTagWithoutGroups = allTags.filter((item) => item.value.search(key) === -1);
        } else {
            apisTagWithoutGroups = allTags;
        }
    }

    /**
     *
     * @param {String} tag selected tag
     * @memberof ApiTagCloud
     */
    const handleOnClick = (tag) => {
        const tagSearchURL = `/apis?offset=0&query=tag:${tag.value}`;
        history.push(tagSearchURL);
    };

    return (
        apisTagWithoutGroups && (
            <Root>
                <Typography variant='h6' gutterBottom className={classNames(classes.filterTitle, 'apis-listing-tags-title')}>
                    <FormattedMessage defaultMessage='Tags' id='Apis.Listing.ApiTagCloud.title' />
                </Typography>
                <TagCloud
                    minSize={14}
                    maxSize={25}
                    colorOptions={colorOptions}
                    tags={apisTagWithoutGroups}
                    shuffle={false}
                    className={classes.clickablePointer}
                    onClick={(tag) => handleOnClick(tag)}
                />
            </Root>
        )
    );
}

ApiTagCloud.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    tag: PropTypes.shape({}).isRequired,
    allTags: PropTypes.shape({}).isRequired,
};

export default ApiTagCloud;
