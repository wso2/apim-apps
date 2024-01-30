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
import PropTypes from 'prop-types';
import { useTheme, styled } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import { Toaster } from 'react-hot-toast';

const StyledDiv = styled('div')({});

const StyledNav = styled('nav')({});

const StyledFooter = styled('footer')({
    padding: 2,
    background: '#eaeff1',
    position: 'relative',
    bottom: 0,
});

/**
 * Render copyright
 * @returns {JSX}.
 */
function Copyright() {
    return (
        <Typography variant='body2' color='textSecondary' align='center' sx={{ p: '16px' }}>
            <FormattedMessage
                id='Base.Footer.Footer.product_details'
                defaultMessage='WSO2 API-M v4.3.0 | © 2024 WSO2 LLC'
            />
        </Typography>
    );
}

/**
 * Render base page component.
 * @param {JSON} props component props.
 * @returns {JSX} Loading animation.
 */
function Base(props) {
    const {
        children, leftMenu, header,
    } = props;
    const theme = useTheme();
    return (
        <>
            <Toaster
                position='bottom-right'
                gutter={8}
                toastOptions={{
                    style: {
                        background: '#008fcc',
                        color: '#ffffff',
                        fontFamily: theme.typography.fontFamily,
                        fontSize: '13px',
                    },
                    success: {
                        style: {
                            backgroundColor: '#4caf50',
                            color: '#ffffff',
                            fontFamily: theme.typography.fontFamily,
                            fontSize: '13px',
                        },
                        iconTheme: {
                            primary: '#ffffff',
                            secondary: '#4caf50',
                        },
                    },
                    error: {
                        style: {
                            backgroundColor: '#BD0808',
                            color: '#ffffff',
                            fontFamily: theme.typography.fontFamily,
                            fontSize: '13px',
                        },
                        iconTheme: {
                            primary: '#ffffff',
                            secondary: '#BD0808',
                        },
                    },
                    custom: {
                        style: { backgroundColor: '#DDEFFF' },
                    },
                }}
            />
            <StyledDiv sx={{ display: 'flex', minHeight: '100vh' }}>
                <CssBaseline />
                <StyledNav
                    sx={(thm) => ({
                        [thm.breakpoints.up('sm')]: {
                            width: 256,
                            flexShrink: 0,
                        },
                    })}
                    aria-label='admin-portal-navbar'
                >
                    {leftMenu}
                </StyledNav>
                <StyledDiv
                    sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    {header}
                    {children}
                    <StyledFooter>
                        <Copyright />
                    </StyledFooter>
                </StyledDiv>
            </StyledDiv>
        </>
    );
}

Base.propTypes = {
    children: PropTypes.element.isRequired,
    header: PropTypes.element.isRequired,
    leftMenu: PropTypes.element.isRequired,
};

export default (Base);
