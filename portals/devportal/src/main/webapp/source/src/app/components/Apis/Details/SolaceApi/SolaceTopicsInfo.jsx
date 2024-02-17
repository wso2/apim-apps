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
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    Divider, Grid, TextField,
    useTheme,
} from '@mui/material';
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Icon from '@mui/material/Icon';
import Chip from '@mui/material/Chip';
import { upperCaseString } from 'AppData/stringFormatter';
import API from 'AppData/api';
import Loading from 'AppComponents/Base/Loading/Loading';
import Button from '@mui/material/Button';
import SubscriptionNotFound from '../../../Base/Errors/SubscriptionNotFound';
import ResourceNotFound from '../../../Base/Errors/ResourceNotFound';

function VerbElement(props) {
    const {
        verb,
    } = props;
    const theme = useTheme();
    const backgroundColor = theme.custom.resourceChipColors[verb.toLowerCase()];

    return (
        <Button
            disableFocusRipple
            variant='outlined'
            className={{
                backgroundColor: '#ffffff',
                borderColor: backgroundColor,
                color: backgroundColor,
                width: theme.spacing(2),
            }}
            size='small'
        >
            {verb.toUpperCase()}
        </Button>
    );
}

const PREFIX = 'SolaceTopicsInfo';

const classes = {
    root: `${PREFIX}-root`,
    table: `${PREFIX}-table`,
    centerItems: `${PREFIX}-centerItems`,
    leftCol: `${PREFIX}-leftCol`,
    iconAligner: `${PREFIX}-iconAligner`,
    iconTextWrapper: `${PREFIX}-iconTextWrapper`,
    iconEven: `${PREFIX}-iconEven`,
    iconOdd: `${PREFIX}-iconOdd`,
    heading: `${PREFIX}-heading`,
    heading1: `${PREFIX}-heading1`,
    emptyBox: `${PREFIX}-emptyBox`,
    summaryRoot: `${PREFIX}-summaryRoot`,
    actionPanel: `${PREFIX}-actionPanel`,
    Paper: `${PREFIX}-Paper`,
    Box2: `${PREFIX}-Box2`,
    Box3: `${PREFIX}-Box3`,
    list: `${PREFIX}-list`,
    urlPaper: `${PREFIX}-urlPaper`,
    input: `${PREFIX}-input`,
    avatar: `${PREFIX}-avatar`,
    iconStyle: `${PREFIX}-iconStyle`,
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')((
    {
        theme,
    },
) => ({
    [`& .${classes.root}`]: {
        padding: theme.spacing(3, 2),
        '& td, & th': {
            color: theme.palette.getContrastText(theme.custom.infoBar.background),
        },
        '& option': {
            padding: '5px 0px 5px 0px',
        },
        background: theme.custom.infoBar.background,
    },

    [`& .${classes.table}`]: {
        minWidth: '100%',
    },

    [`& .${classes.centerItems}`]: {
        margin: 'auto',
    },

    [`& .${classes.leftCol}`]: {
        width: 200,
    },

    [`& .${classes.iconAligner}`]: {
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },

    [`& .${classes.iconTextWrapper}`]: {
        display: 'inline-block',
        paddingLeft: 20,
    },

    [`& .${classes.iconEven}`]: {
        color: theme.custom.infoBar.iconOddColor,
        width: theme.spacing(3),
    },

    [`& .${classes.iconOdd}`]: {
        color: theme.custom.infoBar.iconOddColor,
        width: theme.spacing(3),
    },

    [`& .${classes.heading}`]: {
        color: theme.palette.getContrastText(theme.palette.background.paper),
        paddingLeft: theme.spacing(1),
    },

    [`& .${classes.heading1}`]: {
        marginRight: 20,
    },

    [`& .${classes.emptyBox}`]: {
        background: '#ffffff55',
        color: theme.palette.getContrastText(theme.palette.background.paper),
        border: 'solid 1px #fff',
        padding: theme.spacing(2),
        width: '100%',
    },

    [`& .${classes.summaryRoot}`]: {
        display: 'flex',
        alignItems: 'center',
    },

    [`& .${classes.actionPanel}`]: {
        justifyContent: 'flex-start',
    },

    [`& .${classes.Paper}`]: {
        marginTop: theme.spacing(2),
        padding: theme.spacing(2),
    },

    [`& .${classes.Box2}`]: {
        marginTop: theme.spacing(2),
        padding: theme.spacing(2),
        height: '100%',
    },

    [`& .${classes.Box3}`]: {
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

    [`& .${classes.list}`]: {
        width: '100%',
        maxWidth: 800,
        backgroundColor: theme.palette.background.paper,
        position: 'relative',
        overflow: 'auto',
        maxHeight: 175,
    },

    [`& .${classes.urlPaper}`]: {
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
}));

function SolaceTopicsInfo() {
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
        <Root>
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
                                            <IconButton
                                                aria-label='Copy the API URL to clipboard'
                                                size='large'
                                                onClick={() => {
                                                    navigator.clipboard
                                                        .writeText(selectedEndpoint).then(onCopy('urlCopied'));
                                                }}
                                            >
                                                <Icon color='secondary'>file_copy</Icon>
                                            </IconButton>
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
                                                            <IconButton
                                                                aria-label='Copy the API URL to clipboard'
                                                                size='large'
                                                                onClick={() => {
                                                                    navigator.clipboard
                                                                        .writeText(t).then(onTopicCopy('topicCopied'));
                                                                }}
                                                            >
                                                                <Icon color='secondary'>file_copy</Icon>
                                                            </IconButton>
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
                                                            <IconButton
                                                                aria-label='Copy the API URL to clipboard'
                                                                size='large'
                                                                onClick={() => {
                                                                    navigator.clipboard
                                                                        .writeText(t).then(onTopicCopy('topicCopied'));
                                                                }}
                                                            >
                                                                <Icon color='secondary'>file_copy</Icon>
                                                            </IconButton>
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
        </Root>
    );
}

SolaceTopicsInfo.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    intl: PropTypes.shape({}).isRequired,
};

export default SolaceTopicsInfo;
