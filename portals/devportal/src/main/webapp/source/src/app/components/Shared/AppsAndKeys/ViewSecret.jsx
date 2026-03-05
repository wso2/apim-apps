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
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FileCopy from '@mui/icons-material/FileCopy';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import { FormattedMessage, injectIntl } from 'react-intl';
import InlineMessage from '../InlineMessage';
const PREFIX = 'ViewSecret';

const classes = {
    bootstrapRoot: `${PREFIX}-bootstrapRoot`,
    bootstrapInput: `${PREFIX}-bootstrapInput`,
    epWrapper: `${PREFIX}-epWrapper`,
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
    },

    [`& .${classes.bootstrapInput}`]: {
        borderRadius: 4,
        backgroundColor: theme.palette.common.white,
        border: '1px solid #ced4da',
        padding: '5px 12px',
        width: 350,
        height: 100,
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

    [`& .${classes.prodLabel}`]: {
        lineHeight: '30px',
        marginRight: 10,
        width: 100,
        'text-align-last': 'center',
    },

    [`& .${classes.contentWrapper}`]: {
        maxWidth: theme.custom.contentAreaWidth - theme.custom.leftMenu.width,
    },

    [`&.${classes.root}`]: {
        marginBottom: 20,
    }
}));

/**
 *
 *
 * @class ViewSecret
 * @extends {React.Component}
 */
class ViewSecret extends React.Component {
    state = {
        secretCopied: false,
    };

    /**
     *
     *
     * @memberof ViewSecret
     */
    onCopy = name => () => {
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
     *
     * @param {string} tokenScopes token scopes
     * @returns {String} scopeString comma separated string of token scopes
     * @memberof ViewSecret
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
     * @memberof ViewSecret
     */
    render() {
        const {  secret, intl } = this.props;
        const { secretCopied } = this.state;
        return (
            <Root className={classes.root}>
                <InlineMessage type='warning'>
                    <Typography variant='h5' component='h3'>
                        <FormattedMessage
                            id='Shared.AppsAndKeys.ViewSecret.please.copy.secret'
                            defaultMessage='Please Copy the Consumer Secret'
                        />
                    </Typography>
                    <Typography component='p'>
                        <FormattedMessage
                            id='Shared.AppsAndKeys.ViewSecret.please.copy.secret.help'
                            defaultMessage={`Please make a note of the regenerated consumer 
                            secret value as it will be displayed only once.`}
                        />
                    </Typography>
                </InlineMessage>
                <div className={classes.epWrapper}>
                    <Typography className={classes.prodLabel}>
                        <FormattedMessage
                            id='Shared.AppsAndKeys.ViewSecret.consumer.secret'
                            defaultMessage='Consumer Secret'
                        />
                    </Typography>
                    <TextField
                        variant="standard"
                        defaultValue={secret.consumerSecret}
                        id='bootstrap-input'
                        multiline
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
                            secretCopied
                                ? intl.formatMessage({
                                    defaultMessage: 'Copied',
                                    id: 'Shared.AppsAndKeys.ViewSecret.copied',
                                })
                                : intl.formatMessage({
                                    defaultMessage: 'Copy to clipboard',
                                    id: 'Shared.AppsAndKeys.ViewSecret.copy.to.clipboard',
                                })
                        }
                        placement='right'
                    >
                        <IconButton
                            id='copy-to-clipbord-icon'
                            aria-label='Copy to clipboard'
                            size="large"
                            onClick={() => {
                                navigator.clipboard.writeText(secret.consumerSecret).then(this.onCopy('secretCopied'))
                            }}
                        >
                            <FileCopy color='secondary'>file_copy</FileCopy>
                        </IconButton>
                    </Tooltip>
                </div>
            </Root>
        );
    }
}

ViewSecret.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    secret: PropTypes.shape({
        consumerSecret: PropTypes.string.isRequired,
    }).isRequired,
};

export default injectIntl((ViewSecret));
