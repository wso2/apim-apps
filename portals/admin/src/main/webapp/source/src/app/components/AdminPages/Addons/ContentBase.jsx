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
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

const Root = styled('div')({
    flexGrow: 1,
    minHeight: `calc(100vh - (${43 + 57}px))`,
    backgroundColor: '#eaeff1',
});

/**
 * Render base for content.
 * @param {JSON} props -  Component properties
 * @param {string} props.title -  Page title
 * @param {object} props.children -  Page content
 * @param {object} props.help -  Page help component
 * @param {string} props.backgroundColor -  Page background color in #xxxxxx format
 * @param {object} props.paperProps -  Page background color in #xxxxxx format
 * @param {object} props.pageStyle - Page style one of 'half' 'full' or 'small'
 * @returns {JSX} Header AppBar components.
 */
function ContentBase(props) {
    const {
        title, pageDescription, children, help, width, pageStyle, PaperProps, paperLess,
    } = props;
    let size = 8;// default half/medium
    if ([width, pageStyle].includes('small')) {
        size = 5;
    } else if ([width, pageStyle].includes('full')) {
        size = 11;
    }
    return (
        <Root>
            <Grid
                container
                direction='row'
                justifyContent='center'
                alignItems='flex-start'
            >
                <Grid item xs={12}>
                    <Toolbar sx={{ minHeight: 43, backgroundColor: '#f6f6f6' }}>
                        <Grid container alignItems='center' spacing={1}>
                            <Grid item xs>
                                <Typography color='inherit' variant='h5' component='h1'>
                                    {title}
                                </Typography>
                                <Box pb={1}>
                                    {
                                        pageDescription !== null && (
                                            <Typography variant='body2' color='textSecondary' component='p'>
                                                {pageDescription}
                                            </Typography>
                                        )
                                    }
                                </Box>
                            </Grid>
                            <Grid item>
                                {help}
                            </Grid>
                        </Grid>
                    </Toolbar>
                </Grid>
                <Grid item xs={11} sm={size}>
                    <Box pt={6} position='relative'>
                        {pageStyle === 'paperLess' || paperLess ? children : (
                            <Paper {...PaperProps}>
                                {children}
                            </Paper>
                        )}
                    </Box>
                </Grid>

            </Grid>
        </Root>
    );
}
ContentBase.defaultProps = {
    width: 'medium',
    PaperProps: {},
    pageStyle: 'half',
    paperLess: false,
    pageDescription: null,
};
ContentBase.propTypes = {
    help: PropTypes.element.isRequired,
    title: PropTypes.string.isRequired,
    pageDescription: PropTypes.string,
    children: PropTypes.element.isRequired,
    width: PropTypes.oneOf(['medium', 'full', 'small']),
    pageStyle: PropTypes.oneOf(['half', 'full', 'small']), // @deprecated
    PaperProps: PropTypes.shape({ elevation: PropTypes.number }),
    /**
   * Override or extend the styles applied to the component.
   * See [CSS API](#css) below for more details.
   */
    paperLess: PropTypes.bool,
};

export default ContentBase;
