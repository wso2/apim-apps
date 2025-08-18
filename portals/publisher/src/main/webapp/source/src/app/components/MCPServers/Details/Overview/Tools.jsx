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
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React, { useContext } from 'react';
import { styled } from '@mui/material/styles';
import LaunchIcon from '@mui/icons-material/Launch';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { APIContext } from 'AppComponents/Apis/Details/components/ApiContext';

const PREFIX = 'Tools';

const classes = {
    root: `${PREFIX}-root`,
    heading: `${PREFIX}-heading`,
    contentWrapper: `${PREFIX}-contentWrapper`,
    subHeading: `${PREFIX}-subHeading`,
    toolBox: `${PREFIX}-toolBox`,
}

const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.root}`]: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },

    [`& .${classes.heading}`]: {
        marginRight: 20,
    },

    [`& .${classes.contentWrapper}`]: {
        maxHeight: '200px',
        overflowY: 'auto',
    },

    [`& .${classes.subHeading}`]: {
        color: theme.palette.primary.dark,
    },

    [`& .${classes.toolBox}`]: {
        backgroundColor: theme.custom.mcpToolBar.backgroundColor,
        border: theme.custom.mcpToolBar.border,
    }
}));

const Tools = (props) => {
    const { parentClasses } = props;
    const { api } = useContext(APIContext);

    return (
        <Root>
            <div className={parentClasses.titleWrapper}>
                <Typography variant='h5' component='h3' className={parentClasses.title}>
                    <FormattedMessage
                        id='MCPServers.Overview.Tools.heading'
                        defaultMessage='Tool List'
                    />
                </Typography>
            </div>
            <div>
                {api.operations && api.operations.length > 0 && (
                    <>
                        <div className={classes.contentWrapper}>
                            <Box
                                flex={1}
                                display='flex'
                                flexDirection='column'
                                gridGap={12}
                                mt={1}
                            >
                                {api.operations.map((operation) => (
                                    <Box
                                        key={operation.target}
                                        p={1}
                                        borderRadius={1}
                                        className={classes.toolBox}
                                        mt={1}
                                    >
                                        <Typography variant='body1'>
                                            {operation.target}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </div>
                        <Box py={2}>
                            <Link to={'/mcp-servers/' + api.id + '/tools'} data-testid='show-more-navigate-to-tools'>
                                <Typography
                                    className={classes.subHeading}
                                    color='primary'
                                    display='inline'
                                    variant='caption'
                                >
                                    <FormattedMessage
                                        id='MCPServers.Overview.Tools.showMore'
                                        defaultMessage='Show More'
                                    />
                                    <LaunchIcon style={{ marginLeft: '2px' }} fontSize='small' />
                                </Typography>
                            </Link>
                        </Box>
                    </>
                )}
            </div>
        </Root>
    );
}

Tools.propTypes = {
    parentClasses: PropTypes.shape({}).isRequired,
}

export default Tools;
