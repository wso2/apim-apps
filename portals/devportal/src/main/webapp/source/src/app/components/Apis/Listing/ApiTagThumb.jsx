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
import Typography from '@mui/material/Typography';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Icon from '@mui/material/Icon';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { app } from 'Settings';
import { useTheme } from '@mui/material';

const PREFIX = 'ApiTagThumb';

const classes = {
    thumbContent: `${PREFIX}-thumbContent`,
    thumbLeft: `${PREFIX}-thumbLeft`,
    thumbRight: `${PREFIX}-thumbRight`,
    thumbInfo: `${PREFIX}-thumbInfo`,
    thumbHeader: `${PREFIX}-thumbHeader`,
    contextBox: `${PREFIX}-contextBox`,
    thumbWrapper: `${PREFIX}-thumbWrapper`,
    deleteIcon: `${PREFIX}-deleteIcon`,
    textWrapper: `${PREFIX}-textWrapper`,
    image: `${PREFIX}-image`,
    imageWrapper: `${PREFIX}-imageWrapper`,
    imageOverlap: `${PREFIX}-imageOverlap`,
};

const Root = styled('div')((
    {
        theme,
    },
) => ({
    [`& .${classes.thumbContent}`]: {
        width: theme.custom.tagWise.thumbnail.width - theme.spacing(1),
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(1),
    },

    [`& .${classes.thumbLeft}`]: {
        alignSelf: 'flex-start',
        flex: 1,
    },

    [`& .${classes.thumbRight}`]: {
        alignSelf: 'flex-end',
    },

    [`& .${classes.thumbInfo}`]: {
        display: 'flex',
    },

    [`& .${classes.thumbHeader}`]: {
        width: theme.custom.tagWise.thumbnail.width - theme.spacing(1),
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        cursor: 'pointer',
        justifyContent: 'center',
        margin: 0,
    },

    [`& .${classes.contextBox}`]: {
        // eslint-disable-next-line radix
        width: parseInt(150 - theme.spacing(0.5)),
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        cursor: 'pointer',
        margin: 0,
        display: 'inline-block',
        lineHeight: '1em',
    },

    [`&.${classes.thumbWrapper}`]: {
        position: 'relative',
        paddingTop: 20,
        marginRight: theme.spacing(2),
    },

    [`& .${classes.deleteIcon}`]: {
        fill: 'red',
    },

    [`& .${classes.textWrapper}`]: {
        color: theme.custom.tagCloud.leftMenu.color,
        '& .material-icons': {
            color: theme.custom.tagCloud.leftMenu.color,
        },
    },

    [`& .${classes.image}`]: {
        width: theme.custom.tagWise.thumbnail.width,
    },

    [`& .${classes.imageWrapper}`]: {
        color: theme.palette.text.secondary,
        backgroundColor: theme.palette.background.paper,
        width: theme.custom.tagWise.thumbnail.width + theme.spacing(1),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },

    [`& .${classes.imageOverlap}`]: {
        position: 'absolute',
        bottom: 1,
        backgroundColor: theme.custom.thumbnail.contentBackgroundColor,
    },
}));

/**
 * Get ApiTagThumb
 * @param {*} props properties
 * @returns {*}
 */
function ApiTagThumb(props) {
    const {
        tag, path, style, mainPage,
    } = props;
    const theme = useTheme();
    const tagLink = path + ':' + tag.value;
    const {
        tagWise: {
            thumbnail: { image },
        },
    } = theme.custom;
    const name = tag.value.split(theme.custom.tagWise.key)[0];
    if (style === 'fixed-left' || !mainPage) {
        return (
            <Link to={tagLink} className={classes.textWrapper}>
                <ListItem button>
                    <ListItemIcon>
                        <Icon>label</Icon>
                    </ListItemIcon>
                    <ListItemText primary={name} />
                </ListItem>
            </Link>
        );
    }

    return (
        <Root className={classes.thumbWrapper}>
            <Link to={tagLink} className={classes.imageWrapper}>
                <img src={app.context + image} className={classes.image} alt='' />
            </Link>
            <center>
                <div className={classNames(classes.thumbContent)}>
                    <Link to={tagLink} className={classes.textWrapper}>
                        <Typography className={classes.thumbHeader} variant='h4' gutterBottom title={name}>
                            {name}
                        </Typography>
                    </Link>
                </div>
            </center>
        </Root>
    );
}

ApiTagThumb.propTypes = {
    classes: PropTypes.shape({
        thumbWrapper: PropTypes.shape({}).isRequired,
        imageWrapper: PropTypes.shape({}).isRequired,
        thumbContent: PropTypes.shape({}).isRequired,
        imageOverlap: PropTypes.shape({}).isRequired,
        textWrapper: PropTypes.shape({}).isRequired,
        thumbHeader: PropTypes.shape({}).isRequired,
        image: PropTypes.shape({}).isRequired,
    }).isRequired,
    theme: PropTypes.shape({
        custom: PropTypes.shape({
            tagWise: PropTypes.shape({}).isRequired,
        }).isRequired,
    }).isRequired,
    tag: PropTypes.shape({
        value: PropTypes.shape({
            split: PropTypes.func,
        }).isRequired,
    }).isRequired,
    path: PropTypes.shape({}).isRequired,
    style: PropTypes.string.isRequired,
};

export default (ApiTagThumb);
