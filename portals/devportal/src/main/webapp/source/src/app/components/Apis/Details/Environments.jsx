/* eslint-disable no-unreachable */
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
import React, { useContext, useState } from 'react';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import VerticalDivider from 'AppComponents/Shared/VerticalDivider';
import Avatar from '@mui/material/Avatar';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import Icon from '@mui/material/Icon';
import Divider from '@mui/material/Divider';
import { FormattedMessage, useIntl } from 'react-intl';
import { ApiContext } from './ApiContext';
import GoToTryOut from './GoToTryOut';

const PREFIX = 'Environments';

const classes = {
    root: `${PREFIX}-root`,
    input: `${PREFIX}-input`,
    avatar: `${PREFIX}-avatar`,
    iconStyle: `${PREFIX}-iconStyle`,
    sectionTitle: `${PREFIX}-sectionTitle`,
};

const StyledBox = styled(Box)((
    {
        theme,
    },
) => ({
    [`& .${classes.root}`]: {
        padding: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        border: `solid 1px ${theme.palette.grey[300]}`,
        '& .MuiInputBase-root:before,  .MuiInputBase-root:hover': {
            borderBottom: 'none !important',
            color: theme.palette.primary.main,
        },
        '& .MuiSelect-select': {
            color: theme.palette.primary.main,
            paddingLeft: theme.spacing(),
        },
        '& .MuiInputBase-input': {
            color: theme.palette.primary.main,
        },
        '& .material-icons': {
            fontSize: 16,
            color: `${theme.palette.grey[700]} !important`,
        },
        borderRadius: 10,
        marginRight: theme.spacing(),
    },

    [`& .${classes.input}`]: {
        marginLeft: theme.spacing(1),
        flex: 1,
    },

    [`& .${classes.avatar}`]: {
        width: 30,
        height: 30,
        background: 'transparent',
        border: `solid 1px ${theme.palette.grey[300]}`,
    },

    [`& .${classes.iconStyle}`]: {
        cursor: 'pointer',
        margin: '-10px 0',
        padding: '0 0 0 5px',
        '& .material-icons': {
            fontSize: 18,
            color: '#9c9c9c',
        },
    },

    [`& .${classes.sectionTitle}`]: {
        color: '#424242',
        fontSize: '0.85rem',
        marginRight: 20,
        fontWeight: 400,
    },
}));

/**
 *  @inheritdoc
 */
function Environments(props) {
    const { selectedEndpoint, updateSelectedEndpoint } = props;
    const {
        api,
        api: { advertiseInfo },
    } = useContext(ApiContext);
    const [urlCopied, setUrlCopied] = useState(false);

    const intl = useIntl();

    const onCopy = () => {
        setUrlCopied(true);
        const caller = function () {
            setUrlCopied(false);
        };
        setTimeout(caller, 2000);
    };

    const getDefaultVersionUrl = () => {
        const { defaultVersionURLs } = selectedEndpoint;
        if (defaultVersionURLs
            && (defaultVersionURLs.https
                || defaultVersionURLs.http
                || defaultVersionURLs.ws
                || defaultVersionURLs.wss)) {
            return (
                <>
                    {`
            ${intl.formatMessage({
                    id: 'Apis.Details.Environments.default.url',
                    defaultMessage: '( Default Version ) ',
                })}
            ${(defaultVersionURLs.https || defaultVersionURLs.http || defaultVersionURLs.ws || defaultVersionURLs.wss)}`}
                    <Tooltip
                        title={
                            urlCopied
                                ? intl.formatMessage({
                                    defaultMessage: 'Copied',
                                    id: 'Apis.Details.Environments.copied',
                                })
                                : intl.formatMessage({
                                    defaultMessage: 'Copy to clipboard',
                                    id: 'Apis.Details.Environments.copy.to.clipboard',
                                })
                        }
                        interactive
                        placement='right'
                        className={classes.iconStyle}
                    >
                        <IconButton
                            aria-label='Copy the Default Version URL to clipboard'
                            size='large'
                            onClick={() => {
                                navigator.clipboard.writeText(defaultVersionURLs.https
                                || defaultVersionURLs.http
                                || defaultVersionURLs.ws
                                || defaultVersionURLs.wss).then(onCopy('urlCopied'));
                            }}
                        >
                            <Icon color='secondary'>file_copy</Icon>
                        </IconButton>
                    </Tooltip>
                </>
            );
        } else {
            return null;
        }
    };

    /**
     *  @inheritdoc
     */
    // if (!selectedEndpoint) {
    //     return <Progress />;
    // }
    return (
        <StyledBox display='flex' flexDirection='column' width='100%'>
            <Box mr={5} display='flex' area-label='API URL details' alignItems='center' width='100%' flexDirection='row'>
                {selectedEndpoint && (!advertiseInfo || !advertiseInfo.advertised) && (
                    <>
                        <Typography
                            variant='subtitle2'
                            component='label'
                            for='gateway-envirounment'
                            gutterBottom
                            align='left'
                            className={classes.sectionTitle}
                        >
                            <FormattedMessage
                                id='Apis.Details.Environments.label.url'
                                defaultMessage='URL'
                            />
                        </Typography>
                        <Paper id='gateway-envirounment' component='form' className={classes.root}>
                            {api.endpointURLs.length > 1 && (
                                <>
                                    <Select
                                        variant='standard'
                                        value={selectedEndpoint.environmentName}
                                        onChange={updateSelectedEndpoint}
                                        aria-label='Select the Gateway Environment'
                                    >
                                        {api.endpointURLs.map((endpoint) => (
                                            <MenuItem value={endpoint.environmentName}>
                                                {endpoint.environmentDisplayName || endpoint.environmentName}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <VerticalDivider height={api.type === 'GRAPHQL' && (selectedEndpoint.URLs.ws
                                        || selectedEndpoint.URLs.wss) ? 80 : 30}
                                    />
                                </>
                            )}
                            <Box display='flex' flexDirection='column' width='100%'>
                                <Box py={0.5} display='flex' alignItems='center' width='100%' flexDirection='row'>
                                    <Tooltip
                                        title={(
                                            <Typography color='inherit'>
                                                {(api.type === 'GRAPHQL')
                                                    ? intl.formatMessage({
                                                        defaultMessage: 'Gateway HTTP URL for GraphQL Queries and Mutations',
                                                        id: 'Apis.Details.Environments.GraphQL.HTTP.Gateway.URL',
                                                    })
                                                    : intl.formatMessage({
                                                        defaultMessage: 'Gateway URL',
                                                        id: 'Apis.Details.Environments.Gateway.URL',
                                                    })}
                                            </Typography>
                                        )}
                                        placement='left-start'
                                        arrow
                                    >
                                        <InputBase
                                            className={classes.input}
                                            inputProps={{ 'aria-label': 'api url' }}
                                            value={selectedEndpoint.URLs.https
                                            || selectedEndpoint.URLs.http
                                            || selectedEndpoint.URLs.wss
                                            || selectedEndpoint.URLs.ws}
                                            data-testid='http-url'
                                        />
                                    </Tooltip>
                                    <Avatar className={classes.avatar} sizes={30}>
                                        <Tooltip
                                            title={
                                                urlCopied
                                                    ? intl.formatMessage({
                                                        defaultMessage: 'Copied',
                                                        id: 'Apis.Details.Environments.copied',
                                                    })
                                                    : intl.formatMessage({
                                                        defaultMessage: 'Copy to clipboard',
                                                        id: 'Apis.Details.Environments.copy.to.clipboard',
                                                    })
                                            }
                                            interactive
                                            placement='right'
                                            className={classes.iconStyle}
                                        >
                                            <IconButton
                                                aria-label='Copy the API URL to clipboard'
                                                size='large'
                                                onClick={() => {
                                                    navigator.clipboard.writeText(selectedEndpoint.URLs.https
                                                    || selectedEndpoint.URLs.http
                                                    || selectedEndpoint.URLs.wss
                                                    || selectedEndpoint.URLs.ws).then(onCopy('urlCopied'));
                                                }}
                                            >
                                                <Icon color='secondary'>file_copy</Icon>
                                            </IconButton>
                                        </Tooltip>
                                    </Avatar>
                                </Box>
                                {api.type === 'GRAPHQL' && (selectedEndpoint.URLs.ws || selectedEndpoint.URLs.wss)
                            && (
                                <>
                                    <Divider sx={{ opacity: 0.2 }} />
                                    <Box pt={0.5} display='flex' alignItems='center' width='100%' flexDirection='row'>
                                        <>
                                            <Tooltip
                                                title={(
                                                    <Typography color='inherit'>
                                                        {intl.formatMessage({
                                                            defaultMessage: 'Gateway Websocket URL for GraphQL Subscriptions',
                                                            id: 'Apis.Details.Environments.GraphQL.WS.Gateway.URL',
                                                        })}
                                                    </Typography>
                                                )}
                                                placement='left-start'
                                                arrow
                                            >
                                                <InputBase
                                                    className={classes.input}
                                                    inputProps={{ 'aria-label': 'api url' }}
                                                    value={selectedEndpoint.URLs.wss
                                                    || selectedEndpoint.URLs.ws}
                                                    data-testid='websocket-url'
                                                />
                                            </Tooltip>
                                            <Avatar className={classes.avatar} sizes={30}>
                                                <Tooltip
                                                    title={urlCopied
                                                        ? intl.formatMessage({
                                                            defaultMessage: 'Copied',
                                                            id: 'Apis.Details.Environments.copied',
                                                        })
                                                        : intl.formatMessage({
                                                            defaultMessage: 'Copy to clipboard',
                                                            id: 'Apis.Details.Environments.copy.to.clipboard',
                                                        })}
                                                    interactive
                                                    placement='right'
                                                    className={classes.iconStyle}
                                                >
                                                    <IconButton
                                                        aria-label='Copy the API URL to clipboard'
                                                        size='large'
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(selectedEndpoint.URLs.wss
                                                            || selectedEndpoint.URLs.ws).then(onCopy('urlCopied'));
                                                        }}
                                                    >
                                                        <Icon color='secondary'>file_copy</Icon>
                                                    </IconButton>
                                                </Tooltip>
                                            </Avatar>
                                        </>
                                    </Box>

                                </>
                            )}
                            </Box>
                        </Paper>
                    </>
                )}
                {advertiseInfo && advertiseInfo.advertised && (advertiseInfo.apiExternalProductionEndpoint
                    || advertiseInfo.apiExternalSandboxEndpoint) && (
                    <>
                        <Typography
                            variant='subtitle2'
                            component='label'
                            for='external-endpoint-url'
                            gutterBottom
                            align='left'
                            className={classes.sectionTitle}
                        >
                            <FormattedMessage
                                id='Apis.Details.Environments.externalEndpoint.label.url'
                                defaultMessage='URL'
                            />
                        </Typography>
                        <Paper id='external-endpoint-url' component='form' className={classes.root}>
                            <Box display='flex' flexDirection='column' width='100%'>
                                <Box py={0.5} display='flex' alignItems='center' width='100%' flexDirection='row'>
                                    <Tooltip
                                        title={(
                                            <Typography color='inherit'>
                                                {intl.formatMessage({
                                                    defaultMessage: 'External Production Endpoint',
                                                    id: 'Apis.Details.Environments.apiExternalProductionEndpoint',
                                                })}
                                            </Typography>
                                        )}
                                        placement='left-start'
                                        arrow
                                    >
                                        <InputBase
                                            className={classes.input}
                                            inputProps={{ 'aria-label': 'api url' }}
                                            value={advertiseInfo.apiExternalProductionEndpoint}
                                        />
                                    </Tooltip>
                                    <Avatar className={classes.avatar} sizes={30}>
                                        <Tooltip
                                            title={
                                                urlCopied
                                                    ? intl.formatMessage({
                                                        defaultMessage: 'Copied',
                                                        id: 'Apis.Details.Environments.copied',
                                                    })
                                                    : intl.formatMessage({
                                                        defaultMessage: 'Copy to clipboard',
                                                        id: 'Apis.Details.Environments.copy.to.clipboard',
                                                    })
                                            }
                                            interactive
                                            placement='right'
                                            className={classes.iconStyle}
                                        >
                                            <IconButton
                                                aria-label='Copy the API URL to clipboard'
                                                size='large'
                                                onClick={() => {
                                                    navigator.clipboard.writeText(
                                                        advertiseInfo.apiExternalProductionEndpoint,
                                                    )
                                                        .then(onCopy('urlCopied'));
                                                }}
                                            >
                                                <Icon color='secondary'>file_copy</Icon>
                                            </IconButton>
                                        </Tooltip>
                                    </Avatar>
                                </Box>
                                {advertiseInfo.apiExternalSandboxEndpoint && (
                                    <>
                                        <Divider sx={{ opacity: 0.2 }} />
                                        <Box pt={0.5} display='flex' alignItems='center' width='100%' flexDirection='row'>
                                            <>
                                                <Tooltip
                                                    title={(
                                                        <Typography color='inherit'>
                                                            {intl.formatMessage({
                                                                defaultMessage: 'External Sandbox Endpoint',
                                                                id: 'Apis.Details.Environments.apiExternalSandboxEndpoint',
                                                            })}
                                                        </Typography>
                                                    )}
                                                    placement='left-start'
                                                    arrow
                                                >
                                                    <InputBase
                                                        className={classes.input}
                                                        inputProps={{ 'aria-label': 'api url' }}
                                                        value={advertiseInfo.apiExternalSandboxEndpoint}
                                                    />
                                                </Tooltip>
                                                <Avatar className={classes.avatar} sizes={30}>
                                                    <Tooltip
                                                        title={urlCopied
                                                            ? intl.formatMessage({
                                                                defaultMessage: 'Copied',
                                                                id: 'Apis.Details.Environments.copied',
                                                            })
                                                            : intl.formatMessage({
                                                                defaultMessage: 'Copy to clipboard',
                                                                id: 'Apis.Details.Environments.copy.to.clipboard',
                                                            })}
                                                        interactive
                                                        placement='right'
                                                        className={classes.iconStyle}
                                                    >
                                                        <IconButton
                                                            aria-label='Copy the API URL to clipboard'
                                                            size='large'
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(
                                                                    advertiseInfo.apiExternalSandboxEndpoint,
                                                                )
                                                                    .then(onCopy('urlCopied'));
                                                            }}
                                                        >
                                                            <Icon color='secondary'>file_copy</Icon>
                                                        </IconButton>
                                                    </Tooltip>
                                                </Avatar>
                                            </>
                                        </Box>

                                    </>
                                )}
                            </Box>
                        </Paper>
                    </>
                )}
                {!selectedEndpoint && (advertiseInfo && advertiseInfo.advertised
                    && !(advertiseInfo.apiExternalProductionEndpoint || advertiseInfo.apiExternalSandboxEndpoint)) && (
                    <Typography variant='subtitle2' component='p' gutterBottom align='left' className={classes.sectionTitle}>
                        <FormattedMessage
                            id='Apis.Details.Environments.label.noendpoint'
                            defaultMessage='No endpoints yet.'
                        />
                    </Typography>
                )}
                <GoToTryOut />
            </Box>
            {(!api.advertiseInfo || !api.advertiseInfo.advertised) && (
                <Box ml={8} alignItems='center' mt={1}>
                    {selectedEndpoint && (
                        <Typography variant='caption'>
                            {getDefaultVersionUrl()}
                        </Typography>
                    )}
                </Box>
            )}
        </StyledBox>
    );
}
Environments.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    intl: PropTypes.shape({}).isRequired,
};

export default Environments;
