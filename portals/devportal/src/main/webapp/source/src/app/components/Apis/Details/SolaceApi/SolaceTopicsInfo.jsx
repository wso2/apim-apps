/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    Divider, Grid, TextField,
} from '@material-ui/core';
import Box from '@material-ui/core/Box';
import InputBase from '@material-ui/core/InputBase';
import Avatar from '@material-ui/core/Avatar';
import Tooltip from '@material-ui/core/Tooltip';
import CopyToClipboard from 'react-copy-to-clipboard';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import Chip from '@material-ui/core/Chip';
import { upperCaseString } from 'AppData/stringFormatter';
import API from 'AppData/api';
import Loading from 'AppComponents/Base/Loading/Loading';
import SubscriptionNotFound from '../../../Base/Errors/SubscriptionNotFound';
import ResourceNotFound from '../../../Base/Errors/ResourceNotFound';
import solaceTopicStyles from './SolaceTopicStyles';

function VerbElement(props) {
    const {
        verb,
    } = props;

    const useMenuStyles = makeStyles((theme) => {
        const backgroundColor = theme.custom.resourceChipColors[verb.toLowerCase()];
        return {
            customButton: {
                backgroundColor: '#ffffff',
                borderColor: backgroundColor,
                color: backgroundColor,
                width: theme.spacing(2),
            },
        };
    });
    const classes = useMenuStyles();
    return (
        <Button disableFocusRipple variant='outlined' className={classes.customButton} size='small'>
            {verb.toUpperCase()}
        </Button>
    );
}

function SolaceTopicsInfo() {
    const classes = solaceTopicStyles();
    const { apiUuid } = useParams();
    const [application, setApplication] = useState(null);
    const [environment, setEnvironment] = useState(null);
    const [selectedProtocol, setSelectedProtocol] = useState(null);
    const [envsListOfApplication, setEnvsListOfApplication] = useState(null);
    const [selectedEndpoint, setSelectedEndpoint] = useState(null);
    const [protocolsListOfEnvironments, setProtocolsListOfEnvironments] = useState(null);
    const [topics, setTopics] = useState(null);
    const [applicationList, setApplicationList] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [urlCopied, setUrlCopied] = useState(false);
    const [topicCopied, setTopicCopied] = useState(false);
    const [apiTopics, setApiTopics] = useState(null);
    const [apiPubTopics, setApiPubTopics] = useState(null);
    const [apiSubTopics, setApiSubTopics] = useState(null);

    const intl = useIntl();

    const onCopy = () => {
        setUrlCopied(true);
        const caller = function () {
            setUrlCopied(false);
        };
        setTimeout(caller, 2000);
    };

    const onTopicCopy = () => {
        setTopicCopied(true);
        const caller = function () {
            setTopicCopied(false);
        };
        setTimeout(caller, 2000);
    };

    function setPubAndSubTopics(allTopics, allApiTopics) {
        const apiPubTopicList = [];
        allTopics.publishTopics.map((t) => {
            allApiTopics.map((e) => {
                if (t.toString().includes(e)) {
                    apiPubTopicList.push(t);
                }
                return null;
            });
            return null;
        });
        setApiPubTopics(apiPubTopicList);

        const apiSubTopicList = [];
        allTopics.subscribeTopics.map((t) => {
            allApiTopics.map((e) => {
                if (t.toString().includes(e)) {
                    apiSubTopicList.push(t);
                }
                return null;
            });
            return null;
        });
        setApiSubTopics(apiSubTopicList);
    }

    useEffect(() => {
        const client = new API();

        const promisedApi = client.getAllTopics(apiUuid);
        const apiTopicList = [];
        promisedApi
            .then((response) => {
                response.obj.list.map((entry) => {
                    const parts = entry.name.split('{')[0];
                    apiTopicList.push(parts);
                    return null;
                });
                setApiTopics(apiTopicList);
                return null;
            });

        const infoPromise = client.getSubscriptionAdditionalInfo(apiUuid);
        infoPromise
            .then((response) => {
                setApplicationList(response.body.list);
                // Get application
                const appInner = response.body.list[0];
                if (appInner != null) {
                    setApplication(appInner.applicationName);
                    if (appInner.solaceDeployedEnvironments !== null) {
                        // Set default deployed environments of application
                        setEnvsListOfApplication(appInner.solaceDeployedEnvironments);
                        setEnvironment(appInner.solaceDeployedEnvironments[0]);
                        // Set default protocols of deployed environment
                        setProtocolsListOfEnvironments(appInner.solaceDeployedEnvironments[0].solaceURLs);
                        setSelectedProtocol(appInner.solaceDeployedEnvironments[0].solaceURLs[0].protocol);
                        setSelectedEndpoint(appInner.solaceDeployedEnvironments[0].solaceURLs[0].endpointURL);
                        // Set default topics of deployed solace environment
                        if (appInner.solaceDeployedEnvironments[0].solaceURLs[0].protocol === 'mqtt') {
                            setTopics(appInner.solaceDeployedEnvironments[0].SolaceTopicsObject.mqttSyntax);
                            setPubAndSubTopics(appInner.solaceDeployedEnvironments[0].SolaceTopicsObject.mqttSyntax, apiTopicList);
                        } else {
                            setTopics(appInner.solaceDeployedEnvironments[0].SolaceTopicsObject.defaultSyntax);
                            setPubAndSubTopics(appInner.solaceDeployedEnvironments[0].SolaceTopicsObject.defaultSyntax, apiTopicList);
                        }
                    }
                }
            }).catch((error) => {
                console.log(error);
                const { status } = error;
                if (status === 404) {
                    setNotFound(true);
                } else {
                    setNotFound(false);
                }
            });
    }, [apiUuid]);

    // Handle resource not found error
    if (notFound) {
        return <ResourceNotFound />;
    }
    // Handle topic changes with protocol change
    function setProtocolTopics(protocol, selectedEnv) {
        if (protocol === 'mqtt') {
            setTopics(selectedEnv.SolaceTopicsObject.mqttSyntax);
            setPubAndSubTopics(selectedEnv.SolaceTopicsObject.mqttSyntax, apiTopics);
        } else {
            setTopics(selectedEnv.SolaceTopicsObject.defaultSyntax);
            setPubAndSubTopics(selectedEnv.SolaceTopicsObject.defaultSyntax, apiTopics);
        }
    }
    // Handle application selection change
    const handleChangeApplication = (event) => {
        setApplication(event.target.value);
        let selectedApp;
        applicationList.map((app) => {
            if (app.applicationName === event.target.value) {
                selectedApp = app;
            }
            return null;
        });
        const selectedEnv = selectedApp.solaceDeployedEnvironments[0];
        setEnvsListOfApplication(selectedApp.solaceDeployedEnvironments);
        setSelectedProtocol(selectedEnv.solaceURLs[0].protocol);
        let protocol;
        selectedEnv.solaceURLs.map((e) => {
            if (e.protocol === selectedEnv.solaceURLs[0].protocol) {
                setSelectedEndpoint(e.endpointURL);
                protocol = e.protocol;
            }
            return null;
        });
        setProtocolTopics(protocol, selectedEnv);
    };
    // Handle environment selection change
    const handleChangeEnvironment = (event) => {
        setEnvironment(event.target.value);
        let selectedEnv;
        envsListOfApplication.map((e) => {
            if (e.environmentDisplayName === event.target.value) {
                selectedEnv = e;
            }
            return null;
        });
        setSelectedProtocol(selectedEnv.solaceURLs[0].protocol);
        setProtocolsListOfEnvironments(selectedEnv.solaceURLs);
        let protocol;
        selectedEnv.solaceURLs.map((e) => {
            if (e.protocol === selectedEnv.solaceURLs[0].protocol) {
                setSelectedEndpoint(e.endpointURL);
                protocol = e.protocol;
            }
            return null;
        });
        setProtocolTopics(protocol, selectedEnv);
    };
    // Handle protocol selection change
    const handleChangeProtocol = (event) => {
        setSelectedProtocol(event.target.value);
        let selectedEnv;
        envsListOfApplication.map((e) => {
            if (e.environmentDisplayName === environment.environmentDisplayName) {
                selectedEnv = e;
            }
            return null;
        });
        let protocol;
        protocolsListOfEnvironments.map((e) => {
            if (e.protocol === event.target.value) {
                setSelectedEndpoint(e.endpointURL);
                protocol = e.protocol;
            }
            return null;
        });
        setProtocolTopics(protocol, selectedEnv);
    };

    if (!applicationList) {
        return <Loading />;
    }

    return (
        <>
            { !application && <SubscriptionNotFound /> }
            { environment && topics && apiTopics && applicationList && (
                <div className={classes.root}>
                    <Typography id='itest-api-details-bushiness-plans-head' variant='h5'>
                        <FormattedMessage
                            id='solace.application.available.topics.heading'
                            defaultMessage='Available Topics'
                        />
                    </Typography>
                    <Typography variant='caption' gutterBottom>
                        <FormattedMessage
                            id='solace.application.available.topics.subheading'
                            defaultMessage='Topics permitted to access from solace applications'
                        />
                    </Typography>
                    <Box mt={2} />
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <TextField
                                select
                                fullWidth
                                onChange={handleChangeApplication}
                                value={application}
                                variant='outlined'
                                label='Application'
                                helperText={(
                                    <FormattedMessage
                                        defaultMessage='Subscribed applications'
                                        id='Apis.Details.SolaceTopicsInfo.SelectAppPanel.select.subscribed.
                                                    application'
                                    />
                                )}
                                SelectProps={{
                                    native: true,
                                }}
                            >
                                {applicationList.map((e) => (
                                    <option key={e} value={e.applicationName}>
                                        {e.applicationName}
                                    </option>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                select
                                fullWidth
                                onChange={handleChangeEnvironment}
                                value={environment.environmentDisplayName}
                                variant='outlined'
                                label='Environment Name'
                                helperText={(
                                    <FormattedMessage
                                        defaultMessage='Deployed Environments'
                                        id='Apis.Details.SolaceTopicsInfo.SelectAppPanel.select.
                                                        deployed.environment'
                                    />
                                )}
                                SelectProps={{
                                    native: true,
                                }}
                            >
                                {envsListOfApplication.map((e) => (
                                    <option key={e} value={e.environmentDisplayName}>
                                        {e.environmentDisplayName}
                                    </option>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                select
                                fullWidth
                                onChange={handleChangeProtocol}
                                value={selectedProtocol}
                                variant='outlined'
                                label='Protocol'
                                helperText={(
                                    <FormattedMessage
                                        defaultMessage='Available Protocols'
                                        id='Apis.Details.SolaceTopicsInfo.SelectAppPanel.select.
                                                        environment.protocol'
                                    />
                                )}
                                SelectProps={{
                                    native: true,
                                }}
                            >
                                {protocolsListOfEnvironments.map((e) => (
                                    <option key={e.protocol} value={e.protocol}>
                                        {upperCaseString(e.protocol)}
                                    </option>
                                ))}
                            </TextField>
                        </Grid>
                    </Grid>
                    <Box pt={2}>
                        <Divider />
                    </Box>
                    <Box pt={5} pb={5}>
                        <Grid container>
                            <Grid
                                xs={12}
                                md={7}
                                item
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >

                                <Box
                                    id='gateway-envirounment'
                                    component='form'
                                    className={classes.Box3}
                                >
                                    <Box mr={3}>
                                        <Chip
                                            label={upperCaseString(selectedProtocol)}
                                            color='primary'
                                            style={{
                                                width: '70px',
                                            }}
                                        />
                                    </Box>
                                    <InputBase
                                        className={classes.input}
                                        inputProps={{ 'aria-label': 'api url' }}
                                        value={selectedEndpoint}
                                    />
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
                                            <CopyToClipboard
                                                text={selectedEndpoint}
                                                onCopy={() => onCopy('urlCopied')}
                                            >
                                                <IconButton
                                                    aria-label='Copy the API URL to clipboard'
                                                >
                                                    <Icon color='secondary'>file_copy</Icon>
                                                </IconButton>
                                            </CopyToClipboard>
                                        </Tooltip>
                                    </Avatar>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                    <Grid container>
                        <Grid item xs={6}>
                            <Box className={classes.Box2}>
                                <Typography id='itest-api-details-bushiness-plans-head' variant='h6'>
                                    <FormattedMessage
                                        id='solace.application.topics.publish'
                                        defaultMessage='Publish Topics'
                                    />
                                </Typography>
                                <Box p={1}>
                                    {
                                        (apiPubTopics && apiPubTopics.length > 0) ? apiPubTopics.map((t) => (
                                            <Box pt={2}>
                                                <Box
                                                    id='gateway-envirounment'
                                                    component='form'
                                                    className={classes.Box3}
                                                >
                                                    <Grid item>
                                                        <VerbElement verb='PUB' />
                                                    </Grid>
                                                    <InputBase
                                                        className={classes.input}
                                                        inputProps={{ 'aria-label': 'api url' }}
                                                        value={t}
                                                    />
                                                    <Avatar className={classes.avatar} sizes={30}>
                                                        <Tooltip
                                                            title={
                                                                topicCopied
                                                                    ? intl.formatMessage({
                                                                        defaultMessage: 'Copied',
                                                                        id: 'Apis.Details.PubTopic.copied',
                                                                    })
                                                                    : intl.formatMessage({
                                                                        defaultMessage: 'Copy to clipboard',
                                                                        id: 'Apis.Details.PubTopic.copy.to.clipboard',
                                                                    })
                                                            }
                                                            interactive
                                                            placement='right'
                                                            className={classes.iconStyle}
                                                        >
                                                            <CopyToClipboard
                                                                text={t}
                                                                onCopy={() => onTopicCopy('topicCopied')}
                                                            >
                                                                <IconButton
                                                                    aria-label='Copy the API URL to clipboard'
                                                                >
                                                                    <Icon color='secondary'>file_copy</Icon>
                                                                </IconButton>
                                                            </CopyToClipboard>
                                                        </Tooltip>
                                                    </Avatar>
                                                </Box>

                                            </Box>
                                        )) : (
                                            <Box pt={2}>
                                                <Typography id='itest-api-details-bushiness-plans-head' variant='h7'>
                                                    <FormattedMessage
                                                        id='solace.application.topics.publish.empty'
                                                        defaultMessage='No Publish Topics to Display.'
                                                    />
                                                </Typography>
                                            </Box>
                                        )
                                    }
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Box className={classes.Box2}>
                                <Typography id='itest-api-details-bushiness-plans-head' variant='h6'>
                                    <FormattedMessage
                                        id='solace.application.topics.subscribe'
                                        defaultMessage='Subscribe Topics'
                                    />
                                </Typography>
                                <Box p={1}>
                                    {
                                        (apiSubTopics && apiSubTopics.length > 0) ? apiSubTopics.map((t) => (
                                            <Box pt={2}>
                                                <Box
                                                    id='gateway-envirounment'
                                                    component='form'
                                                    className={classes.Box3}
                                                >
                                                    <Grid item>
                                                        <VerbElement verb='SUB' />
                                                    </Grid>
                                                    <InputBase
                                                        className={classes.input}
                                                        inputProps={{ 'aria-label': 'api url' }}
                                                        value={t}
                                                    />
                                                    <Avatar className={classes.avatar} sizes={30}>
                                                        <Tooltip
                                                            title={
                                                                topicCopied
                                                                    ? intl.formatMessage({
                                                                        defaultMessage: 'Copied',
                                                                        id: 'Apis.Details.SubTopic.copied',
                                                                    })
                                                                    : intl.formatMessage({
                                                                        defaultMessage: 'Copy to clipboard',
                                                                        id: 'Apis.Details.SubTopic.copy.to.clipboard',
                                                                    })
                                                            }
                                                            interactive
                                                            placement='right'
                                                            className={classes.iconStyle}
                                                        >
                                                            <CopyToClipboard
                                                                text={t}
                                                                onCopy={() => onTopicCopy('topicCopied')}
                                                            >
                                                                <IconButton
                                                                    aria-label='Copy the API URL to clipboard'
                                                                >
                                                                    <Icon color='secondary'>file_copy</Icon>
                                                                </IconButton>
                                                            </CopyToClipboard>
                                                        </Tooltip>
                                                    </Avatar>
                                                </Box>

                                            </Box>
                                        )) : (
                                            <Box pt={2}>
                                                <Typography id='itest-api-details-bushiness-plans-head' variant='h7'>
                                                    <FormattedMessage
                                                        id='solace.application.topics.subscribe.empty'
                                                        defaultMessage='No Subscribe Topics to Display.'
                                                    />
                                                </Typography>
                                            </Box>
                                        )
                                    }
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </div>
            )}
        </>
    );
}

SolaceTopicsInfo.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    intl: PropTypes.shape({}).isRequired,
};

export default SolaceTopicsInfo;
