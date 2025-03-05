/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import { FormattedMessage } from 'react-intl';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import clsx from 'clsx';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import AddIcon from '@mui/icons-material/Add';
import CardHeader from '@mui/material/CardHeader';
import PropTypes from 'prop-types';
import { useAppContext } from 'AppComponents/Shared/AppContext';
import { CircularProgress, useTheme } from '@mui/material';
import { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import API from 'AppData/api';
import Checkbox from '@mui/material/Checkbox';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { isRestricted } from 'AppData/AuthManager';
import InlineMessage from 'AppComponents/Shared/InlineMessage';
import CONSTS from 'AppData/Constants';

const PREFIX = 'DeploymentOnbording';

const classes = {
    root: `${PREFIX}-root`,
    textOptional: `${PREFIX}-textOptional`,
    textRevision: `${PREFIX}-textRevision`,
    textDeploy: `${PREFIX}-textDeploy`,
    textDescription: `${PREFIX}-textDescription`,
    descriptionWidth: `${PREFIX}-descriptionWidth`,
    textAlign: `${PREFIX}-textAlign`,
    content: `${PREFIX}-content`,
    head: `${PREFIX}-head`,
    changeCard: `${PREFIX}-changeCard`,
    noChangeCard: `${PREFIX}-noChangeCard`,
    cardHeight: `${PREFIX}-cardHeight`,
    cardContentHeight: `${PREFIX}-cardContentHeight`,
};


const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.root}`]: {
        minHeight: '480px',
    },

    [`& .${classes.textOptional}`]: {
        fontSize: 'small',
        color: '#707070',
        fontWeight: '100',
    },

    [`& .${classes.textRevision}`]: {
        fontSize: '16px',
        color: '#707070',
    },

    [`& .${classes.textDeploy}`]: {
        fontSize: '26px',
        color: '#1B3A57',
    },

    [`& .${classes.textDescription}`]: {
        fontSize: '16px',
        color: '#707070',
        fontWeight: '400',
    },

    [`& .${classes.descriptionWidth}`]: {
        minWidth: '550px',
    },

    [`& .${classes.textAlign}`]: {
        textAlign: 'center',
    },

    [`& .${classes.content}`]: {
        margin: `${theme.spacing(2)} 0 ${theme.spacing(2)} 0`,
    },

    [`& .${classes.head}`]: {
        fontWeight: 200,
    },

    [`& .${classes.changeCard}`]: {
        boxShadow: 15,
        borderRadius: '10px',
        backgroundColor: theme.palette.secondary.highlight,
    },

    [`& .${classes.noChangeCard}`]: {
        boxShadow: 15,
        borderRadius: '10px',
    },

    [`& .${classes.cardHeight}`]: {
        boxShadow: 1,
        height: '100%',
    },

    [`& .${classes.cardContentHeight}`]: {
        boxShadow: 1,
        height: '50%',
    },
}));

/**
 * Renders an Deployment Onboarding
 * @class Environments
 * @extends {React.Component}
 */
export default function DeploymentOnboarding(props) {
    const {
        getVhostHelperText,
        createDeployRevision,
        description,
        setDescription,
        gatewayVendor,
        advertiseInfo,
        isDeploying,
    } = props;

    const [api] = useAPI();
    const theme = useTheme();
    const { maxCommentLength } = theme.custom;
    const { settings: { environment: environments } } = useAppContext();
    const [internalGateways, setInternalGateways] = useState([]);
    const [externalGateways, setExternalGateways] = useState([]);
    const [selectedExternalGateway, setSelectedExternalGateway] = useState([]);
    const isEndpointAvailable = api.subtypeConfiguration?.subtype === 'AIAPI'
        ? (api.primaryProductionEndpointId !== null || api.primarySandboxEndpointId !== null)
        : api.endpointConfig !== null;
    const [isEndpointSecurityConfigured, setIsEndpointSecurityConfigured] = useState(false);
    const [descriptionOpen, setDescriptionOpen] = useState(false);
    const [selectedEnvironment, setSelectedEnvironment] = useState([]);
    const [selectedVhostDeploy, setVhostsDeploy] = useState(null);


    const isDeployButtonDisabled = ((api.type !== 'WEBSUB' && !(
        isEndpointAvailable &&
        (api.subtypeConfiguration?.subtype === 'AIAPI'
            ? isEndpointSecurityConfigured
            : true
        )
    )) || api.workflowStatus === 'CREATED');

    useEffect(() => {
        let gatewayType;
        if (api.apiType === 'APIPRODUCT') {
            gatewayType = 'Regular';
        } else {
            switch (api.gatewayType) {
                case 'wso2/synapse':
                    gatewayType = 'Regular';
                    break;
                case 'wso2/apk':
                    gatewayType = 'APK';
                    break;
                case 'AWS':
                    gatewayType = 'AWS';
                    break;
                default:
                    gatewayType = 'Regular';
            }
        }
        const internalGatewaysFiltered = environments.filter((p) => p.provider.toLowerCase().includes('wso2'));
        const selectedInternalGateways = internalGatewaysFiltered.filter((p) => 
            p.gatewayType.toLowerCase() === gatewayType.toLowerCase())
        if (selectedInternalGateways.length > 0) {
            setInternalGateways(selectedInternalGateways);
            const defaultVhosts = selectedInternalGateways.map((e) => {
                if (e.vhosts && e.vhosts.length > 0) {
                    return {
                        env: e.name,
                        vhost: api.isWebSocket() ? e.vhosts[0].wsHost : e.vhosts[0].host
                    };
                } else {
                    return undefined;
                }
            });
            setVhostsDeploy(defaultVhosts);
            setSelectedEnvironment(selectedInternalGateways.length === 1 ? [selectedInternalGateways[0].name] : []);
        } else {
            const external = environments.filter((p) => !p.provider.toLowerCase().includes('wso2'));
            const selectedExternalGateways = external.filter((p) =>
                p.gatewayType.toLowerCase() === gatewayType.toLowerCase());
            setExternalGateways(selectedExternalGateways);
            setSelectedExternalGateway(selectedExternalGateways.map((env) => env.name));

            if (selectedExternalGateways.length > 0) {
                const defaultVhosts = selectedExternalGateways.map((e) => {
                    if (e.vhosts && e.vhosts.length > 0) {
                        return {
                            env: e.name,
                            vhost: api.isWebSocket() ? e.vhosts[0].wsHost : e.vhosts[0].host
                        };
                    } else {
                        return undefined;
                    }
                });
                setVhostsDeploy(defaultVhosts);
            }
        }
        
    }, []);

    useEffect(() => {
        const checkEndpointSecurity = async () => {
            try {
                const hasProductionEndpoint = !!api.primaryProductionEndpointId;
                const hasSandboxEndpoint = !!api.primarySandboxEndpointId;
                let isProductionSecure = false;
                let isSandboxSecure = false;

                if (hasProductionEndpoint) {
                    if (api.primaryProductionEndpointId === CONSTS.DEFAULT_ENDPOINT_ID.PRODUCTION) {
                        isProductionSecure = !!api.endpointConfig?.endpoint_security?.production;
                    } else {
                        const endpoint = await API.getApiEndpoint(api.id, api.primaryProductionEndpointId);
                        isProductionSecure = !!endpoint?.body?.endpointConfig?.endpoint_security?.production;
                    }
                }

                if (hasSandboxEndpoint) {
                    if (api.primarySandboxEndpointId === CONSTS.DEFAULT_ENDPOINT_ID.SANDBOX) {
                        isSandboxSecure = !!api.endpointConfig?.endpoint_security?.sandbox;
                    } else {
                        const endpoint = await API.getApiEndpoint(api.id, api.primarySandboxEndpointId);
                        isSandboxSecure = !!endpoint?.body?.endpointConfig?.endpoint_security?.sandbox;
                    }
                }

                if (hasProductionEndpoint && hasSandboxEndpoint) {
                    setIsEndpointSecurityConfigured(isProductionSecure && isSandboxSecure);
                } else if (hasProductionEndpoint) {
                    setIsEndpointSecurityConfigured(isProductionSecure);
                } else if (hasSandboxEndpoint) {
                    setIsEndpointSecurityConfigured(isSandboxSecure);
                } else {
                    setIsEndpointSecurityConfigured(false);
                }
            } catch (error) {
                console.error('Error checking endpoint security:', error);
                setIsEndpointSecurityConfigured(false);
            }
        };
        checkEndpointSecurity();
    }, [api]);

    /**
     * Handle Description
     */
    function handleDescriptionOpen() {
        setDescriptionOpen(!descriptionOpen);
    }

    const handleVhostDeploySelect = (event) => {
        const vhosts = selectedVhostDeploy.filter((v) => v.env !== event.target.name);
        vhosts.push({ env: event.target.name, vhost: event.target.value });
        setVhostsDeploy(vhosts);
    };

    const handleChange = (event) => {
        if (gatewayVendor !== 'wso2') {
            if (event.target.checked) {
                setSelectedExternalGateway([...selectedExternalGateway, event.target.value]);
            } else {
                setSelectedExternalGateway(
                    selectedExternalGateway.filter((env) => env !== event.target.value),
                );
            }
        } else {
            // eslint-disable-next-line no-lonely-if
            if (event.target.checked) {
                setSelectedEnvironment([...selectedEnvironment, event.target.value]);
            } else {
                setSelectedEnvironment(
                    selectedEnvironment.filter((env) => env !== event.target.value),
                );
            }
        }
        if (event.target.name === 'description') {
            setDescription(event.target.value);
        }
    };

    return (
        (<Root>
            <div className={classes.titleWrapper}>
                <Typography
                    id='Apis.Details.environments.deploymentOnBoarding.typography.head'
                    variant='h4'
                    component='h2'
                    align='left'
                    className={classes.mainTitle}
                >
                    <FormattedMessage
                        id='Apis.Details.environments.deploymentOnBoarding.formattedMessage.head'
                        defaultMessage='Deployments'
                    />
                </Typography>
                
            </div>
            { api.lifeCycleStatus === 'RETIRED' ? (
                <>
                    <Box mt={2}/>
                    <InlineMessage type='warning' height={140}>
                        <div className={classes.contentWrapper}>
                            <Typography variant='h5' component='h3' className={classes.head}>
                                <FormattedMessage
                                    id='Apis.Details.environments.deploymentOnBoarding.formattedMessage.warningTitle'
                                    defaultMessage='Can not deploy retired APIs'
                                />
                            </Typography>
                            <Box mt={1}/>
                            <Typography component='p' className={classes.content}>
                                <FormattedMessage
                                    id='Apis.Details.environments.deploymentOnBoarding.formattedMessage.description'
                                    defaultMessage='It is not possible to deploy new revisions for retired APIs.'
                                    
                                />
                            </Typography>
                        </div>
                    </InlineMessage>
                </>
            ) : (
                <Grid container spacing={2}>
                    <Grid item xs={2} />
                    <Grid item xs={8}>
                        <Grid container spacing={2}>
                            <Grid item xs={2} />
                            <Grid item xs={8} className={classes.textAlign}>
                                <Typography variant='h6' className={classes.textDeploy}>
                                    <FormattedMessage
                                        id='Apis.Details.Environments.deploy.text'
                                        defaultMessage='Deploy the API'
                                    />
                                </Typography>
                            </Grid>
                            <Grid item xs={2} />
                        </Grid>
                        <Box pb={2}>
                            <Grid container>
                                <Grid item xs={2} />
                                <Grid item xs={8} className={classes.textAlign}>
                                    <Typography variant='h6' className={classes.textDescription}>
                                        <FormattedMessage
                                            id='Apis.Details.Environments.deploy.env.text'
                                            defaultMessage='Deploy API to the Gateway Environment'
                                        />
                                    </Typography>
                                </Grid>
                                <Grid item xs={2} />
                            </Grid>
                        </Box>
                        {(gatewayVendor === 'wso2') ? (
                            <Paper fullWidth className={classes.root}>
                                <Box p={5}>
                                    <Typography className={classes.textRevision}>
                                        <FormattedMessage
                                            id='Apis.Details.Environments.deploy.api.gateways.text'
                                            defaultMessage='API Gateways'
                                        />
                                    </Typography>
                                    <Box mt={4}>
                                        <Grid
                                            container
                                            spacing={3}
                                        >
                                            {internalGateways.map((row) => (
                                                <Grid item xs={3}>
                                                    <Card
                                                        className={clsx(selectedEnvironment
                                                        && selectedEnvironment.includes(row.name)
                                                            ? (classes.changeCard) : (classes.noChangeCard),
                                                        classes.cardHeight)}
                                                        variant='outlined'
                                                    >
                                                        <Box height='100%'>
                                                            <CardHeader
                                                                sx={{
                                                                    width: 'inherit',
                                                                    "& .MuiCardHeader-content": {
                                                                        overflow: "hidden"
                                                                    }
                                                                }}
                                                                action={(
                                                                    <Checkbox
                                                                        id={row.name.split(' ').join('')}
                                                                        value={row.name}
                                                                        checked={selectedEnvironment.includes(row.name)}
                                                                        onChange={handleChange}
                                                                        color='primary'
                                                                        icon={<RadioButtonUncheckedIcon />}
                                                                        checkedIcon=
                                                                            {<CheckCircleIcon color='primary' />}
                                                                        inputProps=
                                                                            {{ 'aria-label': 'secondary checkbox' }}
                                                                    />
                                                                )}
                                                                title={(
                                                                    <Tooltip
                                                                        title={(
                                                                            <>
                                                                                <Typography color='inherit'>
                                                                                    {row.displayName}
                                                                                </Typography>
                                                                            </>
                                                                        )}
                                                                        placement='bottom'
                                                                    >
                                                                        <Typography noWrap variant='subtitle2'>
                                                                            {row.displayName}
                                                                        </Typography>
                                                                    </Tooltip>
                                                                )}
                                                                subheader={(
                                                                    <Typography
                                                                        variant='body2'
                                                                        color='textSecondary'
                                                                        gutterBottom
                                                                    >
                                                                        {row.type}
                                                                    </Typography>
                                                                )}
                                                            />
                                                            <CardContent className={classes.cardContentHeight}>
                                                                <Grid
                                                                    container
                                                                    direction='column'
                                                                    spacing={2}
                                                                >
                                                                    <Grid item xs={12} style={{ maxWidth: '100%' }}>
                                                                        <Tooltip
                                                                            title={(
                                                                                <>
                                                                                    <Typography color='inherit'>
                                                                                        {getVhostHelperText(row.name,
                                                                                            selectedVhostDeploy)}
                                                                                    </Typography>
                                                                                </>
                                                                            )}
                                                                            placement='bottom'
                                                                        >
                                                                            <TextField
                                                                                id='vhost-selector'
                                                                                select={row.vhosts.length > 1}
                                                                                disabled={row.vhosts.length === 1}
                                                                                label={(
                                                                                    <FormattedMessage
                                                                                        id={'Apis.Details.Environments'
                                                                                            + '.deploy.vhost'}
                                                                                        defaultMessage='VHost'
                                                                                    />
                                                                                )}
                                                                                SelectProps={{
                                                                                    MenuProps: {
                                                                                        anchorOrigin: {
                                                                                            vertical: 'bottom',
                                                                                            horizontal: 'left',
                                                                                        },
                                                                                        getContentAnchorEl: null,
                                                                                    },
                                                                                }}
                                                                                name={row.name}
                                                                                value={selectedVhostDeploy.find(
                                                                                    (v) => v.env === row.name,
                                                                                ).vhost}
                                                                                onChange={handleVhostDeploySelect}
                                                                                margin='dense'
                                                                                variant='outlined'
                                                                                fullWidth
                                                                                helperText={getVhostHelperText(row.name,
                                                                                    selectedVhostDeploy, true)}
                                                                                FormHelperTextProps={{
                                                                                    style: {
                                                                                        whiteSpace: 'nowrap',
                                                                                        overflow: 'hidden',
                                                                                        textOverflow: 'ellipsis',
                                                                                    },
                                                                                }}
                                                                            >
                                                                                {row.vhosts.map(
                                                                                    (vhost) => (
                                                                                        <MenuItem value = 
                                                                                            {api.isWebSocket()
                                                                                                ? vhost.wsHost 
                                                                                                : vhost.host}>
                                                                                            {api.isWebSocket() 
                                                                                                ? vhost.wsHost 
                                                                                                : vhost.host}
                                                                                        </MenuItem>
                                                                                    ),
                                                                                )}
                                                                            </TextField>
                                                                        </Tooltip>
                                                                    </Grid>
                                                                </Grid>
                                                            </CardContent>
                                                        </Box>
                                                    </Card>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>
                                    <Box mt={2}>
                                        <Button
                                            color='primary'
                                            className={classes.button}
                                            display='inline'
                                            startIcon={<AddIcon />}
                                            onClick={handleDescriptionOpen}
                                            id='add-description-btn'
                                        >
                                            <FormattedMessage
                                                id='Apis.Details.Environments.Environments.revision.description.add'
                                                defaultMessage='Add a description'
                                            />
                                        </Button>
                                        <Typography display='inline' className={classes.textOptional}>
                                            <FormattedMessage
                                                id={'Apis.Details.Environments.Environments.revision.description.'
                                                    + 'add.optional.text'}
                                                defaultMessage='(optional)'
                                            />
                                        </Typography>
                                        <br />
                                        {descriptionOpen && (
                                            <>
                                                <TextField
                                                    className={classes.descriptionWidth}
                                                    name='description'
                                                    margin='dense'
                                                    variant='outlined'
                                                    label={(
                                                        <FormattedMessage
                                                            id={'Apis.Details.Environments.Environments.revision.'
                                                                + 'description.label'}
                                                            defaultMessage='Description'
                                                        />
                                                    )}
                                                    inputProps={{ maxLength: maxCommentLength }}
                                                    helperText={(
                                                        <FormattedMessage
                                                            id={'Apis.Details.Environments.Environments.revision.'
                                                                + 'description.deploy.helper'}
                                                            defaultMessage='Add a description to the revision'
                                                        />
                                                    )}
                                                    multiline
                                                    rows={3}
                                                    defaultValue={description === true ? '' : description}
                                                    onBlur={handleChange}
                                                    id='add-description'
                                                />
                                            </>
                                        )}
                                    </Box>
                                    <Box mt={3}>
                                        <Button
                                            id='deploy-btn'
                                            type='submit'
                                            variant='contained'
                                            onClick={
                                                () => createDeployRevision(selectedEnvironment, selectedVhostDeploy)
                                            }
                                            color='primary'
                                            disabled={selectedEnvironment.length === 0
                                                || isRestricted(['apim:api_create', 'apim:api_publish'], api)
                                                || (advertiseInfo && advertiseInfo.advertised)
                                                || isDeployButtonDisabled}
                                        >
                                            <FormattedMessage
                                                id='Apis.Details.Environments.Environments.deploy.deploy'
                                                defaultMessage='Deploy'
                                            />
                                        </Button>
                                    </Box>
                                </Box>
                            </Paper>
                        ) : (
                            <Paper fullWidth className={classes.root}>
                                <Box p={5}>
                                    <Typography className={classes.textRevision}>
                                        <FormattedMessage 
                                            id='Apis.Details.Environments.deploy.api.external.gateways.text'
                                            defaultMessage='API Gateways'
                                        />
                                    </Typography>
                                    <Box mt={4}>
                                        <Grid
                                            container
                                            spacing={3}
                                        >
                                            { externalGateways.map((row) => (
                                                <Grid item xs={3}>
                                                    <Card
                                                        className={clsx(selectedExternalGateway
                                                        && selectedExternalGateway.includes(row.name)
                                                            ? (classes.changeCard) : (classes.noChangeCard),
                                                        classes.cardHeight)}
                                                        variant='outlined'
                                                    >
                                                        <CardHeader
                                                            data-testid='external-name'
                                                            action={(
                                                                <Checkbox
                                                                    id={row.name.split(' ').join('')}
                                                                    value={row.name}
                                                                    checked=
                                                                        {selectedExternalGateway.includes(row.name)}
                                                                    disabled={isRestricted(['apim:api_publish',
                                                                        'apim:api_create'])}
                                                                    onChange={handleChange}
                                                                    color='primary'
                                                                    icon={<RadioButtonUncheckedIcon />}
                                                                    checkedIcon={<CheckCircleIcon color='primary' />}
                                                                    inputProps={{ 'aria-label': 'secondary checkbox' }}
                                                                />
                                                            )}
                                                            title={(
                                                                <Typography variant='subtitle2'>
                                                                    {row.displayName}
                                                                </Typography>
                                                            )}
                                                            subheader={(
                                                                <Typography
                                                                    data-testid={row.provider.toString()}
                                                                    variant='body2'
                                                                    color='textSecondary'
                                                                    gutterBottom
                                                                >
                                                                    {row.provider.toString().toUpperCase()}
                                                                </Typography>
                                                            )}
                                                        />
                                                        <CardContent className={classes.cardContentHeight}>
                                                            <Grid item xs={12} sx={{ width: '100%' }}>
                                                                <Tooltip
                                                                    title={(
                                                                        <>
                                                                            <Typography color='inherit'>
                                                                                {getVhostHelperText(row.name,
                                                                                    selectedVhostDeploy)}
                                                                            </Typography>
                                                                        </>
                                                                    )}
                                                                    placement='right'
                                                                >
                                                                    <TextField
                                                                        id='vhost-selector'
                                                                        select
                                                                        label={(
                                                                            <FormattedMessage
                                                                                id='Apis.Details.
                                                                                Environments.deploy.vhost'
                                                                                defaultMessage='VHost'
                                                                            />
                                                                        )}
                                                                        SelectProps={{
                                                                            MenuProps: {
                                                                                getContentAnchorEl: null,
                                                                            },
                                                                        }}
                                                                        name={row.name}
                                                                        value={selectedVhostDeploy.find(
                                                                            (v) => v.env === row.name,
                                                                        ).vhost}
                                                                        onChange={handleVhostDeploySelect}
                                                                        margin='dense'
                                                                        variant='outlined'
                                                                        fullWidth
                                                                        helperText={getVhostHelperText(row.name,
                                                                            selectedVhostDeploy, true)}
                                                                    >
                                                                        {row.vhosts?.map(
                                                                            (vhost) => (
                                                                                <MenuItem value={api.isWebSocket()
                                                                                    ? vhost.wsHost : vhost.host}>
                                                                                    {api.isWebSocket()
                                                                                        ? vhost.wsHost : vhost.host}
                                                                                </MenuItem>
                                                                            ),
                                                                        )}
                                                                    </TextField>
                                                                </Tooltip>
                                                            </Grid>
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>
                                    <Box mt={2}>
                                        <Button
                                            color='primary'
                                            className={classes.button}
                                            display='inline'
                                            startIcon={<AddIcon />}
                                            onClick={handleDescriptionOpen}
                                        >
                                            Add a description
                                        </Button>
                                        <Typography display='inline' className={classes.textOptional}>
                                            (optional)
                                        </Typography>
                                        <br />
                                        { descriptionOpen && (
                                            <>
                                                <TextField
                                                    className={classes.descriptionWidth}
                                                    name='description'
                                                    margin='dense'
                                                    variant='outlined'
                                                    disabled={isRestricted(['apim:api_publish', 'apim:api_create'])}
                                                    label='Description'
                                                    inputProps={{ maxLength: maxCommentLength }}
                                                    helperText={(
                                                        <FormattedMessage
                                                            id='Apis.Details.Environments.Environments.revision
                                                            .description.deploy'
                                                            defaultMessage='Add a description to the revision'
                                                        />
                                                    )}
                                                    multiline
                                                    rows={3}
                                                    defaultValue={description === true ? '' : description}
                                                    onBlur={handleChange}
                                                />
                                            </>
                                        ) }
                                    </Box>
                                    <Box mt={3}>
                                        <Button
                                            id='deploy-btn-external'
                                            type='submit'
                                            variant='contained'
                                            onClick={
                                                () => 
                                                    createDeployRevision(selectedExternalGateway, selectedVhostDeploy)
                                            }
                                            color='primary'
                                            disabled={selectedExternalGateway.length === 0
                                                || isRestricted(['apim:api_publish', 'apim:api_create'])
                                                || isDeployButtonDisabled || isDeploying}
                                        >
                                            <FormattedMessage
                                                id='Apis.Details.Environments.Environments.deploy.deploy'
                                                defaultMessage='Deploy'
                                            />
                                            {' '}
                                            {isDeploying && <CircularProgress size={24} />}
                                        </Button>
                                    </Box>
                                </Box>
                            </Paper>
                        )}
                    </Grid>
                    <Grid item xs={2} />
                </Grid>)}
        </Root>)
    );
}
DeploymentOnboarding.propTypes = {
    getVhostHelperText: PropTypes.shape({}).isRequired,
    createDeployRevision: PropTypes.shape({}).isRequired,
    setDescription: PropTypes.shape({}).isRequired,
    description: PropTypes.string.isRequired,
    gatewayVendor: PropTypes.string,
    classes: PropTypes.shape({}).isRequired
};

DeploymentOnboarding.defaultProps = {
    gatewayVendor: 'wso2',
};
