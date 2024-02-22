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
import Tooltip from '@mui/material/Tooltip';
import FileCopy from '@mui/icons-material/FileCopy';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import { FormattedMessage, injectIntl } from 'react-intl';
import InlineMessage from '../InlineMessage';
import ViewSecret from './ViewSecret';
const PREFIX = 'ViewToken';

const classes = {
    bootstrapRoot: `${PREFIX}-bootstrapRoot`,
    bootstrapInput: `${PREFIX}-bootstrapInput`,
    epWrapper: `${PREFIX}-epWrapper`,
    secretWrapper: `${PREFIX}-secretWrapper`,
    prodLabel: `${PREFIX}-prodLabel`,
    contentWrapper: `${PREFIX}-contentWrapper`,
    root: `${PREFIX}-root`
};

const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.bootstrapRoot}`]: {
        padding: 0,
        'label + &': {
            marginTop: theme.spacing(3),
        },
        flex: 1,
        marginRight: theme.spacing(1),
    },

    [`& .${classes.bootstrapInput}`]: {
        borderRadius: 4,
        backgroundColor: theme.custom.apiDetailPages.tokenTextBoxBackground,
        color: theme.palette.getContrastText(theme.custom.apiDetailPages.tokenTextBoxBackground),
        border: '1px solid #ced4da',
        padding: '5px 12px',
        height: 100,
        width: '100%',
        transition: theme.transitions.create(['border-color', 'box-shadow']),
        fontFamily: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"',
            'Arial', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"'].join(','),
        '&:focus': {
            borderColor: '#80bdff',
            boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
        },
    },

    [`& .${classes.epWrapper}`]: {
        display: 'flex',
        marginTop: 20,
    },

    [`& .${classes.secretWrapper}`]: {
        display: 'flex',
        marginBottom: 20,
    },

    [`& .${classes.prodLabel}`]: {
        lineHeight: '30px',
        marginRight: 10,
        width: 100,
        'text-align-last': 'center',
        whiteSpace: 'nowrap',
    },

    [`& .${classes.contentWrapper}`]: {
        maxWidth: theme.custom.contentAreaWidth - theme.custom.leftMenu.width,
    },

    [`&.${classes.root}`]: {
        marginTop: 20,
        '& span, & h5, & label, & td, & li, & div, & input': {
            color: theme.palette.getContrastText(theme.palette.background.paper),
        },

    }
}));

/**
 *
 *
 * @class ViewToken
 * @extends {React.Component}
 */
class ViewToken extends React.Component {
    state = {
        tokenCopied: false,
    };

    /**
     *
     *
     * @memberof ViewToken
     */
    onCopy = (name) => () => {
        this.setState({
            [name]: true,
        });
        const that = this;
        const elementName = name;
        const caller = function () {
            that.setState({
                [elementName]: false,
            });
        };
        setTimeout(caller, 4000);
    };

    /**
     * Generate a comma separate string of token scopes
     * @param {string} tokenScopes token scopes
     * @returns {String} scopeString comma separated string of token scopes
     * @memberof ViewToken
     */
    getTokeScopesString(tokenScopes) {
        if (tokenScopes) {
            return tokenScopes.join(', ');
        }
        return '';
    }

    /**
     *
     *
     * @returns
     * @memberof ViewToken
     */
    render() {
        const {
            token, consumerSecret, isTokenExchange, intl, isResidenceTokenAvailable,
        } = this.props;
        const { tokenCopied } = this.state;

        if (isTokenExchange && !isResidenceTokenAvailable) {
            return (
                <Typography>
                    <FormattedMessage
                        id='Shared.AppsAndKeys.ViewCurl.error'
                        defaultMessage='Please generate the Consumer Key and Secret for Residence Key Manager with selecting the urn:ietf:params:oauth:grant-type:token-exchange grant type in
                                             order to use the token Exchange Approach. '
                    />
                </Typography>
            )
        } else {
            return (
            <Root className={classes.root}>
                {consumerSecret && (
                    <div className={classes.secretWrapper}>
                        <ViewSecret secret={{consumerSecret}}/>
                    </div>
                )}
                <InlineMessage type='warning'>
                    <Typography variant='h5' component='h3'>
                        {(token.isOauth) && (
                            <FormattedMessage
                                id='Shared.AppsAndKeys.ViewToken.please.copy'
                                defaultMessage='Please Copy the Access Token'
                            />
                        )}
                        {(!token.isOauth) && (
                            <FormattedMessage
                                id='Shared.AppsAndKeys.ViewToken.please.copy.apikey'
                                defaultMessage='Please Copy the API Key'
                            />
                        )}
                    </Typography>
                    <Typography component='p'>
                        <FormattedMessage
                            id='Shared.AppsAndKeys.ViewToken.please.copy.help'
                            defaultMessage={'If the token type is JWT or API Key, please copy this generated token value as it will be displayed only for'
                            + ' the current browser session. '
                            + '( The token will not be visible in the UI after the page is refreshed. )'}
                        />
                    </Typography>
                </InlineMessage>
                <div className={classes.epWrapper}>
                    <label for='access-token' className={classes.prodLabel}>
                        {(token.isOauth) && (
                            <FormattedMessage
                                id='Shared.AppsAndKeys.ViewToken.access.token'
                                defaultMessage='Access Token'
                            />
                        )}
                        {(!token.isOauth) && (
                            <FormattedMessage
                                id='Shared.AppsAndKeys.ViewToken.apikey'
                                defaultMessage='API Key'
                            />
                        )}
                    </label>
                    <TextField
                        variant="standard"
                        defaultValue={token.accessToken}
                        id='access-token'
                        multiline
                        fullWidth
                        rows={4}
                        InputProps={{
                            disableUnderline: true,
                            classes: {
                                root: classes.bootstrapRoot,
                                input: classes.bootstrapInput,
                            },
                        }}
                        InputLabelProps={{
                            shrink: true,
                            className: classes.bootstrapFormLabel,
                        }}
                    />
                    <Tooltip
                        title={
                            tokenCopied
                                ? intl.formatMessage({
                                    defaultMessage: 'Copied',
                                    id: 'Shared.AppsAndKeys.ViewToken.copied',
                                })
                                : intl.formatMessage({
                                    defaultMessage: 'Copy to clipboard',
                                    id: 'Shared.AppsAndKeys.ViewToken.copy.to.clipboard',
                                })
                        }
                        placement='right'
                    >
                        <IconButton
                            id = 'copy-to-clipbord-icon'
                            aria-label='Copy to clipboard'
                            size="large"
                            onClick={() => {navigator.clipboard.writeText(token.accessToken).then(this.onCopy('tokenCopied'))}}
                        >
                            <FileCopy color='secondary'>file_copy</FileCopy>
                        </IconButton>
                    </Tooltip>
                </div>
                <FormHelperText>
                    <FormattedMessage
                        id='Shared.AppsAndKeys.ViewToken.info.first'
                        defaultMessage='Above token has a validity period of '
                    />
                    {token.validityTime}
                    <FormattedMessage
                        id='Shared.AppsAndKeys.ViewToken.info.second'
                        defaultMessage=' seconds'
                    />
                    {token.isOauth && (
                        <FormattedMessage
                            id='Shared.AppsAndKeys.ViewToken.info.third'
                            defaultMessage=' and the token has ('
                        />
                    )}
                    {this.getTokeScopesString(token.tokenScopes)}
                    {token.isOauth && (
                        <FormattedMessage
                            id='Shared.AppsAndKeys.ViewToken.info.fourth'
                            defaultMessage=') scopes'
                        />
                    )}
                    .
                </FormHelperText>
            </Root>
        )};
    }
}

ViewToken.defaultProps = {
    consumerSecret: null,
};

ViewToken.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    token: PropTypes.shape({
        accessToken: PropTypes.string.isRequired,
        validityTime: PropTypes.number.isRequired,
        tokenScopes: PropTypes.array.isRequired,
    }).isRequired,
    consumerSecret: PropTypes.string,
};

export default injectIntl((ViewToken));
