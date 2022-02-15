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
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import clsx from 'clsx';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Tooltip from '@material-ui/core/Tooltip';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import AddIcon from '@material-ui/icons/Add';
import CardHeader from '@material-ui/core/CardHeader';
import PropTypes from 'prop-types';
import { useAppContext } from 'AppComponents/Shared/AppContext';
import { useTheme } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { isRestricted } from 'AppData/AuthManager';

const useStyles = makeStyles(() => ({
    root: {
        minHeight: '480px',
    },
    textOptional: {
        fontSize: 'small',
        color: '#707070',
        fontWeight: '100',
    },
    textRevision: {
        fontSize: '16px',
        color: '#707070',
    },
    textDeploy: {
        fontSize: '26px',
        color: '#1B3A57',
    },
    textDescription: {
        fontSize: '16px',
        color: '#707070',
        fontWeight: '400',
    },
    descriptionWidth: {
        minWidth: '550px',
    },
    textAlign: {
        textAlign: 'center',
    },
}));
/**
 * Renders an Deployment Onboarding
 * @class Environments
 * @extends {React.Component}
 */
export default function DeploymentOnboarding(props) {
    const {
        classes,
        getVhostHelperText,
        createDeployRevision,
        description,
        setDescription,
        gatewayVendor,
        advertiseInfo,
    } = props;
    const classes1 = useStyles();
    const theme = useTheme();
    const { maxCommentLength } = theme.custom;
    const { settings: { environment: environments } } = useAppContext();
    const internalGateways = environments.filter((p) => !p.provider.toLowerCase().includes('solace'));
    const externalGateways = environments.filter((p) => p.provider.toLowerCase().includes('solace'));
    const hasOnlyOneEnvironment = internalGateways.length === 1;

    const defaultVhosts = internalGateways.map(
        (e) => (e.vhosts && e.vhosts.length > 0 ? { env: e.name, vhost: e.vhosts[0].host } : undefined),
    );

    const [descriptionOpen, setDescriptionOpen] = useState(false);
    const [selectedEnvironment, setSelectedEnvironment] = useState(hasOnlyOneEnvironment
        ? [internalGateways[0].name] : []);

    /**
     * Get Solace environments from the environments list
     * @return String Solace gateway environment name
     */
    function getSolaceEnvironment(envs) {
        let solaceEnv = '';
        envs.forEach((env) => {
            if (env.provider === 'solace') {
                solaceEnv = env.name;
            }
        });
        return solaceEnv;
    }
    /**
     * Get Organization value of external gateways
     * @param {Object} additionalProperties the additionalProperties list
     * @return String organization name
     */
    function getOrganizationFromAdditionalProperties(additionalProperties) {
        let organization;
        additionalProperties.forEach((property) => {
            if (property.key === 'Organization') {
                organization = property.value;
            }
        });
        return organization;
    }

    const [selectedSolaceEnvironment, setSelectedSolaceEnvironment] = useState(
        getSolaceEnvironment(externalGateways),
    );
    const [selectedVhostDeploy, setVhostsDeploy] = useState(defaultVhosts);

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
        if (gatewayVendor === 'solace') {
            if (event.target.checked) {
                setSelectedSolaceEnvironment([...selectedSolaceEnvironment, event.target.value]);
            } else {
                setSelectedSolaceEnvironment(
                    selectedSolaceEnvironment.filter((env) => env !== event.target.value),
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
        <>
            <Grid container spacing={2}>
                <Grid item xs={2} />
                <Grid item xs={8}>
                    <Grid container spacing={2}>
                        <Grid item xs={2} />
                        <Grid item xs={8} className={classes1.textAlign}>
                            <Typography variant='h6' className={classes1.textDeploy}>
                                Deploy the API
                            </Typography>
                        </Grid>
                        <Grid item xs={2} />
                    </Grid>
                    <Box pb={2}>
                        <Grid container>
                            <Grid item xs={2} />
                            <Grid item xs={8} className={classes1.textAlign}>
                                <Typography variant='h6' className={classes1.textDescription}>
                                    Deploy API to the Gateway Environment
                                </Typography>
                            </Grid>
                            <Grid item xs={2} />
                        </Grid>
                    </Box>
                    {(gatewayVendor === 'wso2') ? (
                        <Paper fullWidth className={classes1.root}>
                            <Box p={5}>
                                <Typography className={classes1.textRevision}>
                                    API Gateways
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
                                                            action={(
                                                                <Checkbox
                                                                    id={row.name.split(' ').join('')}
                                                                    value={row.name}
                                                                    checked={selectedEnvironment.includes(row.name)}
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
                                                                <Grid item xs={12}>
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
                                                                                    id='Apis.Details.Environments
                                                                                    .deploy.vhost'
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
                                                                        >
                                                                            {row.vhosts.map(
                                                                                (vhost) => (
                                                                                    <MenuItem value={vhost.host}>
                                                                                        {vhost.host}
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
                                    >
                                        Add a description
                                    </Button>
                                    <Typography display='inline' className={classes1.textOptional}>
                                        (optional)
                                    </Typography>
                                    <br />
                                    {descriptionOpen && (
                                        <>
                                            <TextField
                                                className={classes1.descriptionWidth}
                                                name='description'
                                                margin='dense'
                                                variant='outlined'
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
                                    )}
                                </Box>
                                <Box mt={3}>
                                    <Button
                                        type='submit'
                                        variant='contained'
                                        onClick={
                                            () => createDeployRevision(selectedEnvironment, selectedVhostDeploy)
                                        }
                                        color='primary'
                                        disabled={selectedEnvironment.length === 0
                                            || (advertiseInfo && advertiseInfo.advertised)}
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
                        <Paper fullWidth className={classes1.root}>
                            <Box p={5}>
                                <Typography className={classes1.textRevision}>
                                    Solace Environments
                                </Typography>
                                <Box mt={4}>
                                    <Grid
                                        container
                                        spacing={3}
                                    >
                                        { externalGateways.map((row) => (
                                            <Grid item xs={3}>
                                                <Card
                                                    className={clsx(selectedSolaceEnvironment
                                                    && selectedSolaceEnvironment.includes(row.name)
                                                        ? (classes.changeCard) : (classes.noChangeCard),
                                                    classes.cardHeight)}
                                                    variant='outlined'
                                                >
                                                    <CardHeader
                                                        action={(
                                                            <Checkbox
                                                                id={row.name.split(' ').join('')}
                                                                value={row.name}
                                                                checked={selectedSolaceEnvironment.includes(row.name)}
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
                                                                variant='body2'
                                                                color='textSecondary'
                                                                gutterBottom
                                                            >
                                                                {row.provider.toString().toUpperCase()}
                                                            </Typography>
                                                        )}
                                                    />
                                                    <CardContent className={classes.cardContentHeight}>
                                                        <Grid
                                                            container
                                                            direction='column'
                                                            spacing={2}
                                                        >
                                                            <Grid item xs={12}>
                                                                <TextField
                                                                    id='Api.Details.Third.party.environment.name'
                                                                    label='Environment'
                                                                    variant='outlined'
                                                                    disabled
                                                                    fullWidth
                                                                    margin='dense'
                                                                    value={row.name}
                                                                />
                                                                <TextField
                                                                    id='Api.Details.
                                                                        Third.party.environment.organization'
                                                                    label='Organization'
                                                                    variant='outlined'
                                                                    disabled
                                                                    fullWidth
                                                                    margin='dense'
                                                                    value={getOrganizationFromAdditionalProperties(
                                                                        row.additionalProperties,
                                                                    )}
                                                                />
                                                            </Grid>
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
                                    <Typography display='inline' className={classes1.textOptional}>
                                        (optional)
                                    </Typography>
                                    <br />
                                    { descriptionOpen && (
                                        <>
                                            <TextField
                                                className={classes1.descriptionWidth}
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
                                        type='submit'
                                        variant='contained'
                                        onClick={
                                            () => createDeployRevision(selectedSolaceEnvironment, selectedVhostDeploy)
                                        }
                                        color='primary'
                                        disabled={selectedSolaceEnvironment.length === 0
                                            || isRestricted(['apim:api_publish', 'apim:api_create'])}
                                    >
                                        <FormattedMessage
                                            id='Apis.Details.Environments.Environments.deploy.deploy'
                                            defaultMessage='Deploy'
                                        />
                                    </Button>
                                </Box>
                            </Box>
                        </Paper>
                    )}
                </Grid>
                <Grid item xs={2} />
            </Grid>
        </>
    );
}
DeploymentOnboarding.propTypes = {
    getVhostHelperText: PropTypes.shape({}).isRequired,
    createDeployRevision: PropTypes.shape({}).isRequired,
    setDescription: PropTypes.shape({}).isRequired,
    description: PropTypes.string.isRequired,
    gatewayVendor: PropTypes.string,
};

DeploymentOnboarding.defaultProps = {
    gatewayVendor: 'wso2',
};
