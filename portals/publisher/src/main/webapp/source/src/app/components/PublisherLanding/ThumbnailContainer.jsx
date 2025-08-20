/*
 * Copyright (c) 2025, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';
import LetterGenerator from 'AppComponents/Apis/Listing/components/ImageGenerator/LetterGenerator';
import ImageGenerator from 'AppComponents/Apis/Listing/components/ImageGenerator/ImageGenerator';
import Api from 'AppData/api';
import APIProduct from 'AppData/APIProduct';

const windowURL = window.URL || window.webkitURL;

/**
 * Component to handle thumbnail loading logic similar to BaseThumbnail
 */
const ThumbnailContainer = ({ artifact, width, height }) => {
    const [thumbnail, setThumbnail] = useState(null);
    const [iconJson, setIconJson] = useState({});
    const [imageLoaded, setImageLoaded] = useState(false);
    const theme = useTheme();
    const { variant } = theme.custom.thumbnailTemplates;
    const { apiType, id } = artifact;
    const { key, color, backgroundIndex, category } = iconJson;

    useEffect(() => {
        if ((artifact.hasThumbnail !== null && artifact.hasThumbnail)
            || (apiType === Api.CONSTS.APIProduct)) {
            const promisedThumbnail = apiType === Api.CONSTS.APIProduct
                ? new APIProduct().getAPIProductThumbnail(id)
                : new Api().getAPIThumbnail(id);

            promisedThumbnail.then((response) => {
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
            }).finally(() => {
                setImageLoaded(true);
            });
        } else {
            setThumbnail(null);
            setIconJson({ key: null });
            setImageLoaded(true);
        }
    }, [artifact, apiType, id]);

    if (!imageLoaded) {
        return (
            <Box 
                display='flex' 
                alignItems='center' 
                justifyContent='center' 
                width={width} 
                height={height}
            >
                <Box 
                    sx={{ 
                        width: '50%', 
                        height: '50%', 
                        backgroundColor: 'grey.300',
                        borderRadius: 1,
                        animation: 'pulse 1.5s ease-in-out infinite',
                        '@keyframes pulse': {
                            '0%': { opacity: 1 },
                            '50%': { opacity: 0.5 },
                            '100%': { opacity: 1 },
                        },
                    }} 
                />
            </Box>
        );
    }

    // If we have a thumbnail image, display it
    if (thumbnail) {
        return (
            <img
                height={height}
                width={width}
                src={thumbnail}
                alt='API Thumbnail'
                style={{ 
                    objectFit: 'cover',
                    borderRadius: 4,
                }}
            />
        );
    }

    // Generate fallback view
    let view = (
        <LetterGenerator
            width={width}
            height={height}
            avatarVariant='rounded'
            artifact={artifact}
        />
    );

    // If configured the thumbnail variant as `image` or migrated from old thumbnail
    if (variant === 'image' || key) {
        view = (
            <ImageGenerator
                width={width}
                height={height}
                api={artifact}
                fixedIcon={{
                    key,
                    color,
                    backgroundIndex,
                    category,
                    api: artifact,
                }}
                iconSettings={{}}
            />
        );
    }

    return view;
};

ThumbnailContainer.propTypes = {
    artifact: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        apiType: PropTypes.string,
        type: PropTypes.string,
        hasThumbnail: PropTypes.bool,
    }).isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
};

export default ThumbnailContainer;
