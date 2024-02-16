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
import React, { useState, useContext } from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { Typography } from '@mui/material';
import FileCopy from '@mui/icons-material/FileCopy';
import Tooltip from '@mui/material/Tooltip';
import { FormattedMessage, injectIntl } from 'react-intl';
import IconButton from "@mui/material/IconButton";

const PREFIX = 'ViewCurl';

const classes = {
    code: `${PREFIX}-code`,
    command: `${PREFIX}-command`,
    encodeVisible: `${PREFIX}-encodeVisible`,
    contentWrapper: `${PREFIX}-contentWrapper`
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.code}`]: {
        padding: theme.spacing(1),
        marginBottom: theme.spacing(2),
        background: theme.palette.grey[200],
        color: '#da2316',
        flex: 1,
    },

    [`& .${classes.command}`]: {
        color: '#2b62b0',
    },

    [`& .${classes.encodeVisible}`]: {
        cursor: 'pointer',
        textDecoration: 'underline',
    },

    [`& .${classes.contentWrapper}`]: {
        display: 'flex',
    }
}));

/**
 *
 * @param {*} props
 */
function ViewCurl(props) {

    const {
        keys: { consumerKey, consumerSecret },
        intl,
        keyManagerConfig,
        jwtToken,
        defaultTokenEndpoint,
    } = props;
    const bas64Encoded = window.btoa(consumerKey + ':' + consumerSecret);
    const [showReal, setShowReal] = useState(false);
    const [tokenCopied, setTokenCopied] = useState(false);
    const onCopy = () => {
        setTokenCopied(true);
        const caller = function () {
            setTokenCopied(false);
        };
        setTimeout(caller, 4000);
    };

    const applyReal = () => {
        setShowReal(!showReal);
    };
    // Check for additional properties for token endpoint and revoke endpoints.
    let { tokenEndpoint } = keyManagerConfig;
    if (keyManagerConfig.alias === null ) {
        return (
            <Root>
                <Typography>
                    <FormattedMessage
                        id='Shared.AppsAndKeys.ViewCurl.help'
                        defaultMessage='The following cURL command shows how to generate an access token using
                            the Password Grant type.'
                    />
                </Typography>

                <div className={classes.contentWrapper}>
                    <div className={classes.code}>
                        <div>
                            <span className={classes.command}>curl -k -X POST </span> {tokenEndpoint}
                            <span className={classes.command}> -d </span>{' '}
                            {'"grant_type=password&username=Username&password=Password"'}
                        </div>
                        <div>
                            <span className={classes.command}> -H </span>
                            {'"Authorization: Basic'}
                            <a onClick={applyReal} className={classes.encodeVisible}>
                                {showReal ? ' ' + bas64Encoded : ' Base64(consumer-key:consumer-secret)'}
                            </a>
                            {'"'}
                        </div>
                    </div>
                    <div>
                        <Tooltip
                            title={
                                tokenCopied
                                    ? intl.formatMessage({
                                        defaultMessage: 'Copied',
                                        id: 'Shared.AppsAndKeys.ViewCurl.copied',
                                    })
                                    : intl.formatMessage({
                                        defaultMessage: 'Copy to clipboard',
                                        id: 'Shared.AppsAndKeys.ViewCurl.copy.to.clipboard',
                                    })
                            }
                            placement='right'
                        >
                            <IconButton
                                id = 'copy-to-clipbord-icon'
                                aria-label='Copy to clipboard'
                                size="large"
                                onClick={() => {navigator.clipboard.writeText(`curl -k -X POST ${tokenEndpoint} -d ` +
                                    '"grant_type=password&username=Username&password=Password" -H ' +
                                    `"Authorization: Basic ${bas64Encoded}"`).then(onCopy())}}
                            >
                                <FileCopy color='secondary'/>
                            </IconButton>
                        </Tooltip>
                    </div>
                </div>
                <Typography>
                    <FormattedMessage
                        id='Shared.AppsAndKeys.ViewCurl.help.in.a.similar'
                        defaultMessage={`In a similar manner, you can generate an access token using the
                    Client Credentials grant type with the following cURL command.`}
                    />
                </Typography>
                <div className={classes.contentWrapper}>
                    <div className={classes.code}>
                        <div>
                            <span className={classes.command}>curl -k -X POST </span> {tokenEndpoint}
                            <span className={classes.command}> -d </span>{' '}
                            {'"grant_type=client_credentials"'}
                        </div>
                        <div>
                            <span className={classes.command}> -H </span>
                            {'"Authorization: Basic'}
                            <a onClick={applyReal} className={classes.encodeVisible}>
                                {showReal ? ' ' + bas64Encoded : ' Base64(consumer-key:consumer-secret)'}
                            </a>
                            {'"'}
                        </div>
                    </div>
                    <div>
                        <Tooltip
                            title={
                                tokenCopied
                                    ? intl.formatMessage({
                                        defaultMessage: 'Copied',
                                        id: 'Shared.AppsAndKeys.ViewCurl.copied',
                                    })
                                    : intl.formatMessage({
                                        defaultMessage: 'Copy to clipboard',
                                        id: 'Shared.AppsAndKeys.ViewCurl.copy.to.clipboard',
                                    })
                            }
                            placement='right'
                        >
                            <IconButton
                                id = 'copy-to-clipbord-icon'
                                aria-label='Copy to clipboard'
                                size="large"
                                onClick={() => {navigator.clipboard.writeText(`curl -k -X POST ${tokenEndpoint} -d ` +
                                    '"grant_type=client_credentials" -H ' +
                                    `"Authorization: Basic ${bas64Encoded}"`).then(onCopy())}}
                            >
                                <FileCopy color='secondary'/>
                            </IconButton>
                        </Tooltip>
                    </div>
                </div>
            </Root>
        );
    } else {
        if (consumerKey === false) {
            return (
                <Root>
                    <Typography>
                        <FormattedMessage
                            id='Shared.AppsAndKeys.ViewCurl.error'
                            defaultMessage='Please generate the Consumer Key and Secret for Residence Key Manager with selecting the urn:ietf:params:oauth:grant-type:token-exchange grant type in
                                             order to use the token Exchange Approach. '
                        />
                    </Typography>
                </Root>
                )
        } else {
            return (
                <Root>
                    <Typography>
                        <FormattedMessage
                            id='Shared.AppsAndKeys.ViewCurl.TokenExchange.help'
                            defaultMessage='The following cURL command shows how to generate an access token using the
                        token exchange grant type'
                        />
                    </Typography>

                    <div className={classes.contentWrapper}>
                        <div className={classes.code}>
                            <div>
                                <span className={classes.command}>curl -k -X POST </span> {defaultTokenEndpoint}
                                <span className={classes.command}> -d </span>{' '}
                                {'"grant_type=urn:ietf:params:oauth:grant-type:token-exchange"'}
                                <span className={classes.command}> -d </span>{' '}
                                {'"subject_token_type=urn:ietf:params:oauth:token-type:jwt"'}
                                <span className={classes.command}> -d </span>{' '}
                                {'"requested_token_type=urn:ietf:params:oauth:token-type:jwt" '}
                                <span className={classes.command}> -d </span>{' '}
                                {'"subject_token="'}
                                <a onClick={applyReal} className={classes.encodeVisible}>
                                    {showReal ? ' ' + jwtToken : 'jwtToken'}
                                </a>
                            </div>
                            <div>
                                <span className={classes.command}> -H </span>
                                {'"Authorization: Basic'}
                                <a onClick={applyReal} className={classes.encodeVisible}>
                                    {showReal ? ' ' + bas64Encoded : ' Base64(consumer-key:consumer-secret)'}
                                </a>
                                {'"'}
                            </div>
                        </div>
                        <div>
                            <Tooltip
                                title={
                                    tokenCopied
                                        ? intl.formatMessage({
                                            defaultMessage: 'Copied',
                                            id: 'Shared.AppsAndKeys.ViewCurl.copied',
                                        })
                                        : intl.formatMessage({
                                            defaultMessage: 'Copy to clipboard',
                                            id: 'Shared.AppsAndKeys.ViewCurl.copy.to.clipboard',
                                        })
                                }
                                placement='right'
                            >
                                <IconButton
                                    id = 'copy-to-clipbord-icon'
                                    aria-label='Copy to clipboard'
                                    size="large"
                                    onClick={() => {navigator.clipboard.writeText(`curl -k -X POST ${defaultTokenEndpoint} -d ` +
                                        '"grant_type=urn:ietf:params:oauth:grant-type:token-exchange" -d ' +
                                        '"subject_token_type=urn:ietf:params:oauth:token-type:jwt" -d ' +
                                        '"requested_token_type=urn:ietf:params:oauth:token-type:jwt" -d ' +
                                        `"subject_token=${jwtToken}"  -H ` +
                                        `"Authorization: Basic ${bas64Encoded}"`).then(onCopy())}}
                                >
                                    <FileCopy color='secondary'/>
                                </IconButton>
                            </Tooltip>
                        </div>
                    </div>
                </Root>
            );
        }
    }
}

ViewCurl.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    keys: PropTypes.shape({}).isRequired,
    apis: PropTypes.shape({}).isRequired,
    jwtToken: PropTypes.string,
    defaultTokenEndpoint: PropTypes.string,
};

export default injectIntl(ViewCurl);
