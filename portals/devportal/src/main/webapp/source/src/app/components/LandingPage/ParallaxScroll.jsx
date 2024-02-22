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
import PropTypes from 'prop-types';
import HTMLRender from 'AppComponents/Shared/HTMLRender';
import classNames from 'classnames';
import { app } from 'Settings';
import { useTheme } from '@mui/material';

const PREFIX = 'ParallaxScroll';

const classes = {
    parallax: `${PREFIX}-parallax`,
    slideContentWrapper: `${PREFIX}-slideContentWrapper`,
    slideContentTitle: `${PREFIX}-slideContentTitle`,
    slideContentContent: `${PREFIX}-slideContentContent`,
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')((
    {
        theme,
    },
) => ({
    [`& .${classes.parallax}`]: {
        /* Set a specific height */
        minHeight: 200,

        /* Create the parallax scrolling effect */
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        position: 'relative',
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(3),
    },

    [`& .${classes.slideContentWrapper}`]: {
        position: 'absolute',
        background: '#00000044',
        color: theme.palette.getContrastText('#000000'),
        top: theme.spacing(3),
        padding: theme.spacing(2),
        margin: '0 100px',
        alignItem: 'center',
    },

    [`& .${classes.slideContentTitle}`]: {
        fontWeight: theme.typography.fontWeightLight,
        fontSize: theme.typography.h3.fontSize,
    },

    [`& .${classes.slideContentContent}`]: {
        fontWeight: theme.typography.fontWeightLight,
        fontSize: theme.typography.body1.fontSize,
    },
}));

/**
 * Renders parallax scroll section.
 * @param {JSON} props Parent pros.
 * @returns {JSX} rendered parallax scroll view.
 */
function ParallaxScroll(props) {
    const { index } = props;
    const theme = useTheme();
    const slide = theme.custom.landingPage.parallax.content[index];

    return (
        <Root>
            <div
                className={classes.parallax}
                style={{ backgroundImage: 'url("' + app.context + slide.src + '")' }}
            >
                <div className={classNames(classes.slideContentWrapper, 'slideContentWrapper')}>
                    <div className={classNames(classes.slideContentTitle, 'slideContentTitle')}>
                        <HTMLRender html={slide.title} />
                    </div>

                    <div className={classes.slideContentContent}>
                        <HTMLRender html={slide.content} />
                    </div>
                </div>
            </div>
        </Root>
    );
}

ParallaxScroll.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    index: PropTypes.shape({}).isRequired,
    theme: PropTypes.shape({}).isRequired,
};
export default (ParallaxScroll);
