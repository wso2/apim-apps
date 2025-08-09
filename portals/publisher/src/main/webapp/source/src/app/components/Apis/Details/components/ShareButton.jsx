/*
 * Copyright (c) 2025, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
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

import React from 'react';
import { styled } from '@mui/material/styles';
import IosShareIcon from '@mui/icons-material/IosShare';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';

import { resourceMethod, resourcePath, ScopeValidation } from 'AppData/ScopeValidation';
import VerticalDivider from 'AppComponents/Shared/VerticalDivider';

const PREFIX = 'ShareButton';

const classes = {
    root: `${PREFIX}-root`,
    backLink: `${PREFIX}-backLink`,
    backIcon: `${PREFIX}-backIcon`,
    backText: `${PREFIX}-backText`,
    shareAPIWrapper: `${PREFIX}-shareAPIWrapper`,
    shareAPI: `${PREFIX}-shareAPI`,
    linkText: `${PREFIX}-linkText`,
};

const Root = styled('div')(({ theme }) => ({
    [`& .${classes.root}`]: {
        background: theme.palette.background.paper,
        borderBottom: 'solid 1px ' + theme.palette.grey.A200,
        display: 'flex',
        alignItems: 'center',
    },
    [`& .${classes.backLink}`]: {
        alignItems: 'center',
        textDecoration: 'none',
        display: 'flex',
    },
    [`& .${classes.backIcon}`]: {
        color: theme.palette.primary.main,
        fontSize: 56,
        cursor: 'pointer',
    },
    [`& .${classes.backText}`]: {
        color: theme.palette.primary.main,
        cursor: 'pointer',
        fontFamily: theme.typography.fontFamily,
    },
    [`& .${classes.shareAPIWrapper}`]: {
        display: 'flex',
        justifyContent: 'flex-end',
    },
    [`& .${classes.shareAPI}`]: {
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: theme.custom.shareButtonColor || 'inherit',
    },
    [`& .${classes.linkText}`]: {
        fontSize: theme.typography.fontSize,
    },
}));

/**
 *
 * Function to create a 'shareAPI' button
 *
 * @param {any} props props
 * @returns {*} React ShareAPI function component
 * @constructor
 */
function ShareButton(props) {
    const { api } = props;

    const getBasePath = () => {
        const isMCPServer = api.isMCPServer();
        if (isMCPServer) {
            return '/mcp-servers/';
        }
        return '/apis/';
    };

    return (
        <Root>
            {/* allowing share API based on scopes */}
            <ScopeValidation resourceMethod={resourceMethod.PUT}
                resourcePath={resourcePath.SINGLE_API}>
                <div className={classes.shareAPIWrapper} id='share-btn'>
                    <VerticalDivider height={70} />
                    <Link
                        className={classes.shareAPI}
                        to={getBasePath() + api.id + '/share'}
                        style={{ minWidth: 50 }}
                    >
                        <div>
                            <IosShareIcon />
                        </div>
                        <Typography variant='caption'>
                            <FormattedMessage
                                id='Apis.Details.components.ShareButton.share'
                                defaultMessage='Share'
                            />
                        </Typography>
                    </Link>
                </div>
            </ScopeValidation>
        </Root>
    );
}

ShareButton.propTypes = {
    api: PropTypes.shape({
        id: PropTypes.string,
    }).isRequired,
    history: PropTypes.shape({ push: PropTypes.func }).isRequired,
};

export default withRouter(ShareButton);
