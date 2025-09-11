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
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { Chip, Stack } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import SellIcon from '@mui/icons-material/Sell';

const PREFIX = 'ApiTagCloud';

const classes = {
    clickablePointer: `${PREFIX}-clickablePointer`,
    filterTitle: `${PREFIX}-filterTitle`,
    tagsWrapper: `${PREFIX}-tagsWrapper`,
    mainTagSection: `${PREFIX}-mainTagSection`,
    TagsTitleIcon: `${PREFIX}-CategoryTitleIcon`,
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

    [`&.${classes.mainTagSection}`]: {
        paddingTop: 0,
        minHeight: 0,
        display: 'flex',
        flex: '1 1 auto',
        flexDirection: 'column',
        overflow: 'hidden',
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

    '& .tag-cloud-tag': {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: 'inline-block',
        maxWidth: '-webkit-fill-available',
        color: theme.custom.tagCloud.leftMenu.color,
    },

    [`& .${classes.tagsWrapper}`]: {
        overflowY: 'auto',
        minHeight: 0,
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

    [`& .${classes.TagsTitleIcon}`]: {
        marginRight: theme.spacing(1),
        verticalAlign: 'middle',
        fontSize: '1.2rem',
    },

}));

/**
 * Support component used to handle API Tag Cloud
*/
function TagWithTooltip({ tag, onClick, selected }) {
    const textRef = React.useRef(null);
    const [isTruncated, setIsTruncated] = React.useState(false);

    React.useEffect(() => {
        if (textRef.current) {
            setIsTruncated(textRef.current.scrollWidth > textRef.current.clientWidth);
        }
    }, [textRef.current]);

    const chipContent = (
        <Chip
            label={(
                <span ref={textRef} className='tag-cloud-tag'>
                    {tag.value}
                </span>
            )}
            clickable
            size='small'
            variant={selected ? 'filled' : 'outlined'}
            color={selected ? 'primary' : 'default'}
            onClick={onClick}
        />
    );

    return (
        <Tooltip title={tag.value} arrow disableHoverListener={!isTruncated}>
            {chipContent}
        </Tooltip>
    );
}

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
        },
    } = theme;
    const history = useHistory();

    const { allTags, selectedTag, onTagSelect } = props;
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
        onTagSelect(tag.value);
        // Detect if we're on MCP servers route to generate appropriate URL
        const isMCPServersRoute = window.location.pathname.includes('/mcp-servers');
        const baseURL = isMCPServersRoute ? '/mcp-servers?offset=0&query=' : '/apis?offset=0&query=';
        const tagQuery = `tag:${tag.value} `;
        const type = isMCPServersRoute ? 'type:MCP' : 'type:HTTP type:WS type:SOAPTOREST type:GRAPHQL type:SOAP '
            + 'type:SSE type:WEBSUB type:WEBHOOK type:ASYNC type:APIProduct';
        history.push(baseURL + tagQuery + type);
    };

    return (
        apisTagWithoutGroups && (
            <Root className={classNames('api-tag-cloud', classes.mainTagSection)}>
                <Typography variant='h6' gutterBottom className={classNames(classes.filterTitle, 'apis-listing-tags-title')}>
                    <SellIcon className={classes.TagsTitleIcon} />
                    <FormattedMessage defaultMessage='Tags' id='Apis.Listing.ApiTagCloud.title' />
                </Typography>
                <div className={classes.tagsWrapper}>
                    <Stack direction='row' gap={1} flexWrap='wrap' className={classes.clickablePointer}>
                        {apisTagWithoutGroups.map((tag) => (
                            <TagWithTooltip
                                key={tag.value}
                                tag={tag}
                                onClick={() => handleOnClick(tag)}
                                selected={selectedTag === tag.value}
                            />
                        ))}
                    </Stack>
                </div>
            </Root>
        )
    );
}

ApiTagCloud.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    tag: PropTypes.shape({}).isRequired,
    allTags: PropTypes.shape({}).isRequired,
    onTagSelect: PropTypes.func.isRequired,
};

export default ApiTagCloud;
