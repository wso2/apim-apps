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
import React, { PureComponent } from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import Icon from '@mui/material/Icon';
import MaterialIcons from 'MaterialIcons';
import { useTheme } from '@mui/material';
import Background from '../Background';

const PREFIX = 'ImageGeneratorLegacy';

const classes = {
    icon: `${PREFIX}-icon`,
    iconWrapper: `${PREFIX}-iconWrapper`,
};

const Root = styled('div')({
    [`& .${classes.icon}`]: {},
    [`&.${classes.iconWrapper}`]: {
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        '& span': {
            position: 'absolute',
            right: 'auto',
        },
    },
});

/**
 * Generate dynamic API thumbnail image (SVG), Use PureComponent to avoid unnessasary re-rendering when hover ect
 *
 * @class ImageGeneratorLegacy
 * @extends {PureComponent}
 */
class ImageGeneratorLegacy extends PureComponent {
    /**
     *
     * @inheritdoc
     * @returns {React.PureComponent} @inheritdoc
     * @memberof ImageGeneratorLegacy
     */
    render() {
        const {
            api, width, height, theme, fixedIcon,
        } = this.props;

        const {
            category, key, color, backgroundIndex,
        } = fixedIcon;

        let str = api;
        if (typeof api === 'object') str = api.name;
        let count;
        let colorPair;
        let randomBackgroundIndex;
        let IconElement;
        const colorPairs = theme.custom.thumbnail.backgrounds;

        // Creating the icon
        if (key && category) {
            IconElement = key;
        } else if (api.type === 'DOC') {
            IconElement = theme.custom.thumbnail.document.icon;
        } else {
            count = MaterialIcons.categories[10].icons.length;
            const randomIconIndex = (str.charCodeAt(0) + str.charCodeAt(str.length - 1)) % count;
            IconElement = MaterialIcons.categories[10].icons[randomIconIndex].id;
        }

        // Obtain or generate background color pair
        if (api.type === 'DOC') {
            colorPair = theme.custom.thumbnail.document.backgrounds;
        } else if (backgroundIndex && colorPairs.length > backgroundIndex) {
            colorPair = colorPairs[backgroundIndex];
        } else {
            randomBackgroundIndex = (str.charCodeAt(0) + str.charCodeAt(str.length - 1)) % colorPairs.length;
            colorPair = colorPairs[randomBackgroundIndex];
        }
        return (
            <Root className={classes.iconWrapper} style={{ width }}>
                <Icon className={classes.icon} style={{ fontSize: height + 'px', color }}>
                    {IconElement}
                </Icon>
                <Background width={width} height={height} colorPair={colorPair} />
            </Root>
        );
    }
}

ImageGeneratorLegacy.defaultProps = {
    height: 190,
    width: 250,
    fixedIcon: {
        category: null,
        key: null,
        color: '',
        backgroundIndex: null,
    },
};

ImageGeneratorLegacy.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    height: PropTypes.number,
    width: PropTypes.number,
    fixedIcon: PropTypes.shape({}),
    api: PropTypes.shape({}).isRequired,
    theme: PropTypes.shape({}).isRequired,
};

function ImageGenerator(props) {
    const {
        width, height, api, fixedIcon,
    } = props;
    const theme = useTheme();
    return (
        <ImageGeneratorLegacy
            width={width}
            height={height}
            api={api}
            fixedIcon={fixedIcon}
            theme={theme}
        />
    );
}

export default (ImageGenerator);
