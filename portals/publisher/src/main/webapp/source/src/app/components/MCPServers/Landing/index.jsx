/*
* Copyright (c) 2025, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
* 
* WSO2 LLC. licenses this file to you under the Apache License,
* Version 2.0 (the "License"); you may not use this file except
* in compliance with the License.
* You may obtain a copy of the License at
* 
* http://www.apache.org/licenses/LICENSE-2.0
* 
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router';
import { styled } from '@mui/material/styles';
import { useTheme, Box, Button, Grid, Typography } from '@mui/material';
import { PropTypes } from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useLocation } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useBackNavigation } from 'AppComponents/Shared';
import MCPFromOpenAPIDefinition from './MCPFromOpenAPIDefinition';
import MCPFromExistingAPI from './MCPFromExistingAPI';
import MCPFromMCPServerURL from './MCPFromMCPServerURL';

const PREFIX = 'MCPLanding';

const classes = {
    root: `${PREFIX}-root`
};

const Root = styled('div')({
    [`& .${classes.root}`]: {
        flexGrow: 1,
    },
});

/**
 * MCPServerLanding component
 * This component renders the landing page for MCP Servers, providing an onboarding experience
 * @returns {JSX.Element} MCPServerLanding component
 */
const MCPServerLanding = () => {
    const theme = useTheme();
    const isXsOrBelow = useMediaQuery(theme.breakpoints.down('xs'));
    const [pageMode, setPageMode] = useState('default');
    const location = useLocation();
    const handleBackClick = useBackNavigation('/mcp-servers');

    const {
        mcpServerFromScratchIcon,
        mcpServerFromExistingApiIcon,
        mcpServerProxyIcon,
    } = theme.custom.landingPage.icons;

    useEffect(() => {
        const path = location.pathname;
        if (path.includes('/mcp-servers/create')) {
            setPageMode('create');
        } else if (path === '/') {
            setPageMode('landing');
        } else {
            setPageMode('default');
        }
    }, [location.pathname]);

    return (
        <Root className={classes.root}>
            <Grid
                container
                direction='column'
                justifyContent='center'
            >
                {pageMode !== 'landing' && (
                    <>
                        <Grid item xs={12}>
                            {pageMode === 'create' ? (
                                <Box>
                                    <Box pt={isXsOrBelow ? 2 : 4} />
                                    <Button
                                        variant='text'
                                        onClick={handleBackClick}
                                        startIcon={<ArrowBackIcon />}
                                        id='itest-mcp-servers-back-to-listing'
                                        sx={{
                                            ml: 15,
                                        }}
                                    >
                                        <FormattedMessage
                                            id='Apis.Listing.SampleAPI.SampleAPI.back.to.listing'
                                            defaultMessage='Back to MCP Server Listing'
                                        />
                                    </Button>
                                </Box>
                            ) : (
                                <Box pt={isXsOrBelow ? 2 : 7} />
                            )}
                        </Grid>
                        <Grid item md={12}>
                            {pageMode === 'create' ? (
                                <Typography
                                    id='itest-mcp-servers-welcome-msg'
                                    display='block'
                                    gutterBottom
                                    align='center'
                                    variant='h4'
                                >
                                    <FormattedMessage
                                        id='MCPServers.Landing.create.new'
                                        defaultMessage='Create a new MCP Server'
                                    />
                                    <Box color='text.secondary' pt={1}>
                                        <Typography display='block' gutterBottom align='center' variant='body1'>
                                            <FormattedMessage
                                                id='MCPServers.Landing.create.new.description'
                                                defaultMessage='Select how you would like to define your MCP Server'
                                            />
                                        </Typography>
                                    </Box>
                                </Typography>
                            ) : (
                                <Typography
                                    id='itest-mcp-servers-welcome-msg'
                                    display='block'
                                    gutterBottom
                                    align='center'
                                    variant='h4'
                                >
                                    <FormattedMessage
                                        id='MCPServers.Landing.create.new'
                                        defaultMessage='Let’s get started!'
                                    />
                                    <Box color='text.secondary' pt={1}>
                                        <Typography display='block' gutterBottom align='center' variant='body1'>
                                            <FormattedMessage
                                                id='MCPServers.Landing.create.new.description'
                                                defaultMessage='Create and manage your MCP Servers'
                                            />
                                        </Typography>
                                    </Box>
                                </Typography>
                            )}
                        </Grid>  
                    </>
                )}
                <Grid item xs={12} md={2} lg={2} xl={2}>
                    <Box pt={isXsOrBelow ? 1 : 3} pb={4} >
                        <Grid
                            container
                            direction='column'
                            justifyContent='center'
                            alignItems='flex-start'
                        >
                            <Grid
                                container
                                direction='row'
                                justifyContent='center'
                                alignItems='flex-start'
                                spacing={3}
                            >
                                <MCPFromOpenAPIDefinition icon={mcpServerFromScratchIcon} />
                                <MCPFromExistingAPI icon={mcpServerFromExistingApiIcon} />
                                <MCPFromMCPServerURL icon={mcpServerProxyIcon} />
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>
            </Grid>
        </Root>
    );
}

MCPServerLanding.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    intl: PropTypes.shape({ formatMessage: PropTypes.func }).isRequired,
};

export default withRouter(injectIntl(MCPServerLanding));
