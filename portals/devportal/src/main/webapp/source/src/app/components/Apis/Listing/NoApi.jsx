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
import PropTypes from 'prop-types';
import { styled, useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import { app } from 'Settings';

const PREFIX = 'NoApi';

const classes = {
    root: `${PREFIX}-root`,
    messageWrapper: `${PREFIX}-messageWrapper`,
};

const Root = styled('div')((
    {
        theme,
    },
) => ({
    [`&.${classes.root}`]: {
        flexGrow: 1,
    },

    [`& .${classes.messageWrapper}`]: {
        marginTop: theme.spacing(4),
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
}));

/**
 * Render no api/mcp server section
 * @param {Object} props - Component props
 * @param {boolean} props.isMCPServersRoute - Whether this is for MCP servers or APIs
 * @returns {React.ReactElement} No data component
 */
export default function NoApi({ isMCPServersRoute }) {
    const theme = useTheme();

    // Determine content based on entity type
    const titleId = isMCPServersRoute
        ? 'MCPServers.Listing.NoMCPServers.nodata.title'
        : 'Apis.Listing.NoApi.nodata.title';
    const titleDefault = isMCPServersRoute
        ? 'No MCP Servers Available'
        : 'No APIs Available';
    const contentId = isMCPServersRoute
        ? 'MCPServers.Listing.NoMCPServers.nodata.content'
        : 'Apis.Listing.NoApi.nodata.content';
    const contentDefault = isMCPServersRoute
        ? 'There are no MCP servers to display right now.'
        : 'There are no APIs to display right now.';
    const altText = isMCPServersRoute ? 'MCP Server icon' : 'API icon';
    const testId = isMCPServersRoute ? 'itest-no-mcp-servers' : 'itest-no-apis';

    return (
        <Root className={classes.root}>
            <Grid container spacing={3}>
                <Grid item xs={12} className={classes.messageWrapper}>
                    <img alt={altText} src={app.context + theme.custom.noApiImage} className={classes.messageWrapper} />
                    <Typography id={testId} variant='h5' gutterBottom>
                        <FormattedMessage id={titleId} defaultMessage={titleDefault} />
                    </Typography>
                    <Typography variant='subtitle1' gutterBottom>
                        <FormattedMessage
                            id={contentId}
                            defaultMessage={contentDefault}
                        />
                    </Typography>
                </Grid>
            </Grid>
        </Root>
    );
}

NoApi.propTypes = {
    isMCPServersRoute: PropTypes.bool,
};

NoApi.defaultProps = {
    isMCPServersRoute: false,
};
