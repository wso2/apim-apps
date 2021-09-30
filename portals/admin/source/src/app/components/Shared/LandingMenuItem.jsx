/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import { Link as RouterLink } from 'react-router-dom';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    linkRoot: {
        color: '#34679D',
        '&:hover': {
            backgroundColor: '#0B78F014',
            textDecoration: 'none',
        },
    },
}));

const LandingMenuItem = (props) => {
    const {
        helperText, children, id, linkTo, component = 'Link', onClick,
    } = props;
    const { linkRoot } = useStyles();
    return (
        <Grid
            item
        >
            <Typography
                color='primary'
                variant={'h6'}
            >
                {/* Using React Router Links with Material-UI Links
                Pattern as suggested in https://material-ui.com/guides/composition/#link */}
                {component.toLowerCase() === 'link' && (
                    <Link
                        className={linkRoot}
                        id={id}
                        component={RouterLink}
                        to={linkTo}
                    >
                        {children}
                    </Link>
                )}
                {component.toLowerCase() === 'button' && (
                    <Button
                        id={id}
                        size={'medium'}
                        onClick={onClick}
                        color='primary'
                        variant='outlined'
                    >
                        {children}
                    </Button>
                )}

            </Typography>
            <Box
                color='text.secondary'
                fontFamily='fontFamily'
                fontSize={'body2.fontSize'}
            >
                {helperText}
            </Box>
        </Grid>
    );
};

export default LandingMenuItem;
