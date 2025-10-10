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
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import WrappedExpansionPanel from 'AppComponents/Shared/WrappedExpansionPanel';
import { AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LaunchIcon from '@mui/icons-material/Launch';
import { Link } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import MCPServer from 'AppData/MCPServer';
import { withAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import { getBasePath } from 'AppComponents/Shared/Utils';

const PREFIX = 'Endpoints';

const classes = {
    subtitle: `${PREFIX}-subtitle`,
    expansionPanel: `${PREFIX}-expansionPanel`,
    expansionPanelDetails: `${PREFIX}-expansionPanelDetails`,
    notConfigured: `${PREFIX}-notConfigured`,
    subHeading: `${PREFIX}-subHeading`,
    textTrim: `${PREFIX}-textTrim`,
    externalLink: `${PREFIX}-externalLink`
};


const Root = styled('div')(({ theme }) => ({
    [`& .${classes.subtitle}`]: {
        marginTop: theme.spacing(0),
    },

    [`& .${classes.expansionPanel}`]: {
        marginBottom: theme.spacing(1),
    },

    [`& .${classes.expansionPanelDetails}`]: {
        flexDirection: 'column',
    },

    [`& .${classes.notConfigured}`]: {
        color: 'rgba(0, 0, 0, 0.54)',
    },

    [`& .${classes.subHeading}`]: {
        fontSize: '1rem',
        fontWeight: 400,
        margin: 0,
        display: 'inline-flex',
        lineHeight: 1.5,
    },

    [`& .${classes.textTrim}`]: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },

    [`& .${classes.externalLink}`]: {
        color: theme.palette.primary.dark,
    }
}));

/**
 *
 *X
 * @param {*} props
 * @returns
 */
function Endpoints(props) {
    const { api, endpointSecurity, endpointConfig } = props;

    const showEndpoint = (type) => {
        if (api.apiType === MCPServer.CONSTS.MCP && endpointConfig) {
            if (type === 'prod') {
                return endpointConfig.production_endpoints.url;
            }
            if (type === 'sand') {
                return endpointConfig.sandbox_endpoints.url;
            }
        } else if (api.endpointConfig) {
            if (type === 'prod') {
                return api.getProductionEndpoint();
            }
            if (type === 'sand') {
                return api.getSandboxEndpoint();
            }
        }
        return null;
    };

    const isPrototypedAvailable = !api.isMCPServer() && api.endpointConfig !== null
        && api.endpointConfig.implementation_status === 'prototyped' && api.lifeCycleStatus === 'PROTOTYPED';

    /**
     * Check whether the endpoint configuration is dynamic
     *
     * @param {object} endpointConfiguration The endpoint configuration of the api.
     * @return {boolean} True if the endpoint config is dynamic.
     * */
    const isDynamicEndpoints = (endpointConfiguration) => {
        if (!endpointConfiguration) {
            return false;
        }
        if (endpointConfiguration.production_endpoints && !Array.isArray(endpointConfiguration.production_endpoints)) {
            return endpointConfiguration.production_endpoints.url === 'default';
        }
        return false;
    };

    return (
        (<Root>
            <WrappedExpansionPanel className={classes.expansionPanel} defaultExpanded id='endpoints'>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography className={classes.subHeading} variant='h6' component='h4'>
                        <FormattedMessage
                            id='Apis.Details.Configuration.components.Endpoints.endpoints'
                            defaultMessage='Endpoints'
                        />
                    </Typography>
                </AccordionSummary>
                <AccordionDetails className={classes.expansionPanelDetails}>
                    {isDynamicEndpoints(api.endpointConfig)
                        ? (
                            <Box pb={2}>
                                <Typography component='p' variant='body1' className={classes.subtitle}>
                                    <FormattedMessage
                                        id='Apis.Details.Configuration.components.Endpoints.dynamic'
                                        defaultMessage='Dynamic'
                                    />
                                </Typography>
                            </Box>
                        )
                        : (
                            <>
                                {endpointSecurity.includes('typePRODUCTION') &&
                                    <Box pb={2}>
                                        {/* Production Endpoint (TODO) fix the endpoint
                                                        info when it's available with the api object */}

                                        { !isPrototypedAvailable ? (
                                            <Typography component='p' variant='subtitle2' className={classes.subtitle}>
                                                <FormattedMessage
                                                    id='Apis.Details.Configuration.components.Endpoints.production'
                                                    defaultMessage='Production'
                                                />
                                            </Typography>
                                        ) : (
                                            <Typography component='p' variant='subtitle2' className={classes.subtitle}>
                                                <FormattedMessage
                                                    id='Apis.Details.Configuration.components.Endpoints.prototype'
                                                    defaultMessage='Prototype'
                                                />
                                            </Typography>
                                        )}
                                        {showEndpoint('prod')
                                    && (
                                        <Tooltip
                                            title={showEndpoint('prod')}
                                            interactive
                                        >
                                            <Typography component='p' variant='body1' className={classes.textTrim}>
                                                <>
                                                    {showEndpoint('prod')}
                                                </>
                                            </Typography>
                                        </Tooltip>
                                    )}
                                        <Typography component='p' variant='body1' className={classes.notConfigured}>
                                            {!showEndpoint('prod') && (
                                                <>
                                                    <FormattedMessage
                                                        id={'Apis.Details.Configuration.'
                                                        + 'components.Endpoints.not.set'}
                                                        defaultMessage='-'
                                                    />
                                                </>
                                            )}
                                        </Typography>
                                    </Box>
                                }   
                                {!isPrototypedAvailable && endpointSecurity.includes('typeSANDBOX') && (
                                    <Box pb={2}>
                                        {/* Sandbox Endpoint (TODO) fix the endpoint info when
                                                it's available with the api object */}
                                        <Typography component='p' variant='subtitle2' className={classes.subtitle}>
                                            <FormattedMessage
                                                id='Apis.Details.Configuration.components.Endpoints.sandbox'
                                                defaultMessage='Sandbox'
                                            />
                                        </Typography>
                                        {showEndpoint('sand')
                                    && (
                                        <Tooltip
                                            title={showEndpoint('sand')}
                                            interactive
                                        >
                                            <Typography component='p' variant='body1' className={classes.textTrim}>
                                                <>
                                                    {showEndpoint('sand')}
                                                </>
                                            </Typography>
                                        </Tooltip>
                                    )}
                                        <Typography component='p' variant='body1' className={classes.notConfigured}>
                                            {!showEndpoint('sand') && (
                                                <>
                                                    <FormattedMessage
                                                        id={'Apis.Details.Configuration.components.Endpoints.sandbox.'
                                                        + 'not.set'}
                                                        defaultMessage='-'
                                                    />
                                                </>
                                            )}
                                        </Typography>
                                    </Box>
                                )}
                            </>
                        )}
                    <Box width='100%' textAlign='right' m={1}>
                        <Link to={getBasePath(api.apiType) + api.id + '/endpoints'}>
                            <Typography className={classes.externalLink} variant='caption'>
                                <FormattedMessage
                                    id='Apis.Details.Configuration.Configuration.Endpoints.edit.api.endpoints'
                                    defaultMessage='Edit Endpoints'
                                />
                                <LaunchIcon style={{ marginLeft: '2px' }} fontSize='small' />
                            </Typography>
                        </Link>
                    </Box>
                </AccordionDetails>
            </WrappedExpansionPanel>
        </Root>)
    );
}

Endpoints.propTypes = {
    api: PropTypes.shape({}).isRequired,
};

export default withAPI(Endpoints);
