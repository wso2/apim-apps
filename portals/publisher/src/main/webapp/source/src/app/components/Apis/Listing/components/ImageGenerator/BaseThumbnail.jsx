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

import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import IconButton from '@mui/material/IconButton';
import Icon from '@mui/material/Icon';

import Api from 'AppData/api';
import MCPServer from 'AppData/MCPServer';
import APIProduct from 'AppData/APIProduct';
import ImageGenerator from './ImageGenerator';
import LetterGenerator from './LetterGenerator';

const PREFIX = 'BaseThumbnail';

const classes = {
    thumbButton: `${PREFIX}-thumbButton`,
    thumbBackdrop: `${PREFIX}-thumbBackdrop`,
    thumb: `${PREFIX}-thumb`,
    media: `${PREFIX}-media`,
};

const Root = styled('div')(({ theme }) => ({
    [`& .${classes.thumbButton}`]: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0002',
        color: '#000',
        padding: 50,
        borderRadius: 5,
    },

    [`& .${classes.thumbBackdrop}`]: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: theme.palette.common.black,
        opacity: 0.4,
    },

    [`& .${classes.thumbWrapper}`]: {
        position: 'relative',
        display: 'inline-block',
    },

    [`& .${classes.thumb}`]: {
        '&:hover': {
            zIndex: 1,
            '& $thumbBackdrop': {
                opacity: 0.2,
            },
        },
    },

    [`& .${classes.media}`]: {
        borderRadius: 5,
        // ⚠️ object-fit is not supported by IE11.
        objectFit: 'cover',
    },
}));

const windowURL = window.URL || window.webkitURL;

const BaseThumbnail = (props) => {
    const {
        api,
        width,
        height,
        thumbnail: thumbnailPop,
        selectedIcon: selectedIconProp,
        color: colorProp,
        backgroundIndex: backgroundIndexProp,
        category: categoryProp,
        isEditable,
        onClick,
        imageUpdate,
        onDelete,
    } = props;
    const { apiType, id, type } = api;

    const [iconJson, setIconJson] = useState({});
    const { key, color, backgroundIndex, category } = iconJson;
    const [thumbnail, setThumbnail] = useState(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const theme = useTheme();
    const { variant } = theme.custom.thumbnailTemplates;
    useEffect(() => {
        setIconJson({
            selectedIcon: selectedIconProp,
            color: colorProp,
            backgroundIndex: backgroundIndexProp,
            category: categoryProp,
        });
    }, [selectedIconProp, colorProp, backgroundIndexProp, categoryProp]);

    /**
     * Load the image from the backend and keeps in the component state
     */
    useEffect(() => {
        if (type !== 'DOC') {
            if ((api.hasThumbnail !== null && api.hasThumbnail) || apiType === Api.CONSTS.APIProduct) {
                let promisedThumbnail;
                if (apiType === Api.CONSTS.APIProduct) {
                    promisedThumbnail = new APIProduct().getAPIProductThumbnail(id);
                } else if (apiType === MCPServer.CONSTS.MCP) {
                    promisedThumbnail = MCPServer.getThumbnail(id);
                } else {
                    promisedThumbnail = new Api().getAPIThumbnail(id);
                }

                promisedThumbnail
                    .then((response) => {
                        if (response && response.data) {
                            if (response.headers['content-type'] === 'application/json') {
                                setThumbnail(null);
                                setIconJson(response.body);
                            } else if (response.headers['content-type'] === 'image/svg+xml') {
                                const blob = new Blob([response.data], { type: 'image/svg+xml' });
                                const url = windowURL.createObjectURL(blob);
                                setThumbnail(url);
                            } else if (response && response.data.size > 0) {
                                const url = windowURL.createObjectURL(response.data);
                                setThumbnail(url);
                            }
                        } else if (response && response.data === '') {
                            setThumbnail(null);
                            setIconJson({ key: null });
                        }
                    })
                    .finally(() => {
                        setImageLoaded(true);
                    });
            } else {
                setThumbnail(null);
                setIconJson({ key: null });
                setImageLoaded(true);
            }
        } else {
            setImageLoaded(true);
        }
    }, [imageUpdate]);

    useEffect(() => {
        setThumbnail(thumbnailPop);
    }, [thumbnailPop]);

    if (!imageLoaded) {
        return (
            <Root className='image-load-frame'>
                <div className='image-load-animation1' />
                <div className='image-load-animation2' />
            </Root>
        );
    }
    let view = <LetterGenerator width={width} height={height} artifact={api} />;
    // If configured the thumbnail variant as `image` or migrated from old thumbnail
    if (variant === 'image' || key) {
        view = (
            <ImageGenerator
                width={width}
                height={height}
                api={api}
                fixedIcon={{
                    key: key || selectedIconProp,
                    color,
                    backgroundIndex,
                    category,
                    api,
                }}
            />
        );
    }

    return (
        <Root>
            {isEditable ? (
                <div className={classes.thumbWrapper}>
                    <ButtonBase
                        focusRipple
                        className={classes.thumb}
                        onClick={onClick}
                        aria-label='edit api thumbnail'
                        data-testid='edit-api-thumbnail-button'
                    >
                        {thumbnail ? (
                            <img
                                height={height}
                                width={width}
                                src={thumbnail}
                                alt='API Thumbnail'
                                className={classes.media}
                            />
                        ) : (
                            view
                        )}
                        <span className={classes.thumbBackdrop} />
                        <span className={classes.thumbButton}>
                            <Typography component='span' variant='subtitle1' color='inherit'>
                                <EditIcon />
                            </Typography>
                        </span>
                    </ButtonBase>
                    {thumbnail && (
                        <IconButton
                            fontSize='small'
                            onClick={onDelete} 
                            aria-label='delete thumbnail'
                            sx={{ mt: 9, p:0.5, position:'absolute'}}
                        >
                            <Icon color='primary'>delete_forever</Icon>
                        </IconButton>
                    )}
                </div>
            ) : (
                <>
                    {thumbnail ? (
                        <img
                            height={height}
                            width={width}
                            src={thumbnail}
                            alt='API Thumbnail'
                            className={classes.media}
                        />
                    ) : (
                        view
                    )}
                </>
            )}
        </Root>
    );
};
BaseThumbnail.defaultProps = {
    height: 100,
    width: 100,
    imageUpdate: 0,
    isEditable: false,
    onDelete: () => {},
};
BaseThumbnail.propTypes = {
    api: PropTypes.shape({}).isRequired,
    height: PropTypes.number,
    width: PropTypes.number,
    isEditable: PropTypes.bool,
    imageUpdate: PropTypes.number,
    onDelete: PropTypes.func,
};
export default BaseThumbnail;
