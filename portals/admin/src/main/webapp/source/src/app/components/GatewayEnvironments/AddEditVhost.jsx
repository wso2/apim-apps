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

import React, { useEffect, useRef, useState } from 'react';
import { useAppContext } from 'AppComponents/Shared/AppContext';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import FormGroup from '@mui/material/FormGroup';
import Grid from '@mui/material/Grid';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Paper from '@mui/material/Paper';
import { Button } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';
import Divider from '@mui/material/Divider';
import { FormattedMessage, useIntl } from 'react-intl';

const StyledSpan = styled('span')(({ theme }) => ({ color: theme.palette.error.dark }));

function AddEditVhost(props) {
    const intl = useIntl();
    const {
        onVhostChange, initialVhosts, gatewayType, isEditMode, isReadOnly,
    } = props;
    const [userVhosts, setUserVhosts] = useState([]);
    const [id, setId] = useState(0);
    const createDefaultVhost = (currentGatewayType) => {
        const gatewaysProvidedByWSO2 = ['Regular', 'APK'];
        const isExternalGateway = !gatewaysProvidedByWSO2.includes(currentGatewayType);
        return {
            host: '',
            httpContext: '',
            httpsPort: isExternalGateway ? 443 : 8243,
            httpPort: isExternalGateway ? 80 : 8280,
            wssPort: 8099,
            wsPort: 9099,
            isNew: true,
        };
    };

    const prevRef = useRef();
    const { settings } = useAppContext();

    // change handlers
    const updateChanges = (key, field, newValue) => {
        const theVhost = userVhosts.find((vhost) => vhost.key === key);
        theVhost[field] = newValue;
        let tempItems = userVhosts.filter((vhost) => vhost.key !== key);
        tempItems = [...tempItems, theVhost];
        tempItems.sort((a, b) => a.key - b.key);
        setUserVhosts(tempItems);
    };
    const changeHandler = (field) => ({ target: { name, value } }) => {
        let theValue = value;
        if (field === 'httpContext') {
            // remove slashes in start and end of httpContext
            theValue = value.replace(/(^\/|\/$)/g, '');
        }
        // if a port is the field convert it to int
        if (field.includes('Port')) {
            theValue = parseInt(value, 10);
        }
        updateChanges(name, field, theValue);
    };

    const [openRemoveVhost, setOpenRemoveVhost] = useState(false);
    const [selectedKey, setSelectedKey] = useState(0);

    const handleRemoveVhost = (key) => {
        const theKey = key || selectedKey;
        const tempItems = userVhosts.filter((vhost) => vhost.key !== theKey);
        setUserVhosts(tempItems);
        setOpenRemoveVhost(false);
    };

    const handleRemoveVhostConfirm = (key, isNew) => {
        if (isNew) { // not already existing one
            handleRemoveVhost(key);
        } else { // already existing vhost
            setSelectedKey(key);
            setOpenRemoveVhost(true);
        }
    };

    const handleClose = () => {
        setOpenRemoveVhost(false);
    };

    const handleNewVhost = () => {
        const vhost = createDefaultVhost(gatewayType);
        vhost.key = '' + id;
        setId(id + 1);
        const tempItems = [...userVhosts, vhost];
        setUserVhosts(tempItems);
    };

    useEffect(() => {
        const nonEmptyItems = [];
        for (const userVhost of userVhosts) {
            if (userVhost.host && userVhost.host.trim() !== '') {
                nonEmptyItems.push(userVhost);
            }
        }
        onVhostChange({ target: { name: 'vhosts', value: nonEmptyItems } });
    }, [userVhosts]);

    useEffect(() => {
        if (initialVhosts && initialVhosts.length > 0) {
            let i = 0;
            setUserVhosts(initialVhosts.map((vhost) => {
                const keyedVhost = vhost;
                keyedVhost.key = '' + i++;
                return keyedVhost;
            }));
            setId(i);
        } else {
            setId(id + 1);
            const vhost = createDefaultVhost(gatewayType);
            vhost.key = '' + id;
            setUserVhosts([vhost]);
        }
    }, []);

    const isUserVhostsUpdated = (vhosts) => {
        if (vhosts.length > 0) {
            // check whether only the default vhost exists
            if (vhosts.length === 1 && vhosts[0].host === '') {
                return false;
            }
            return true;
        }
        return false;
    };

    useEffect(() => {
        if (prevRef.gatewayType !== gatewayType) {
            const config = settings.gatewayConfiguration.filter((t) => t.type === gatewayType)[0];
            if (initialVhosts && initialVhosts.length > 0) {
                let i = 0;
                if (config && !isEditMode) {
                    const defaultHostnameTemplate = config.defaultHostnameTemplate
                        ? config.defaultHostnameTemplate : '';
                    setUserVhosts(initialVhosts.map((vhost) => {
                        const keyedVhost = {
                            ...vhost,
                            key: '' + i++,
                            host: defaultHostnameTemplate,
                            isNew: defaultHostnameTemplate === '' || !config.defaultHostnameTemplate,
                        };
                        return keyedVhost;
                    }));
                } else {
                    setUserVhosts(initialVhosts.map((vhost) => {
                        const keyedVhost = {
                            ...vhost,
                            key: '' + i++,
                            isNew: isEditMode ? true : vhost.isNew,
                        };
                        return keyedVhost;
                    }));
                }
                setId(i);
            } else {
                setId(id + 1);
                const vhost = createDefaultVhost(gatewayType);
                vhost.key = '' + id;
                if (config && config.defaultHostnameTemplate) {
                    vhost.host = config.defaultHostnameTemplate;
                    if (config.defaultHostnameTemplate !== '') {
                        vhost.isNew = false;
                    }
                }
                setUserVhosts([vhost]);
            }
            prevRef.gatewayType = gatewayType;
        } else if (!isUserVhostsUpdated(userVhosts) && initialVhosts && initialVhosts.length > 0) {
            let i = 0;
            setUserVhosts(initialVhosts.map((vhost) => {
                const keyedVhost = { ...vhost };
                keyedVhost.key = '' + i++;
                return keyedVhost;
            }));
            setId(i);
        }
    }, [initialVhosts, gatewayType]);

    let vhostCounter = 1;
    return (
        <FormGroup>
            <Grid container spacing={0}>
                {userVhosts && userVhosts.map((vhost) => (
                    <Grid item xs={12}>
                        <Paper
                            variant='outlined'
                            sx={(theme) => ({ padding: theme.spacing(1), marginBottom: theme.spacing(1) })}
                        >
                            <Grid container direction='row' spacing={0}>
                                {/* VHost's host name */}
                                <Grid item xs={9}>
                                    <TextField
                                        margin='dense'
                                        name={vhost.key}
                                        disabled={!vhost.isNew || isReadOnly}
                                        onChange={changeHandler('host')}
                                        label={(
                                            <span>
                                                <FormattedMessage
                                                    id='GatewayEnvironments.AddEditVhost.host'
                                                    defaultMessage='Host'
                                                />
                                                -
                                                {vhostCounter++}
                                                <StyledSpan>*</StyledSpan>
                                            </span>
                                        )}
                                        value={vhost.host}
                                        helperText={(
                                            <FormattedMessage
                                                id='GatewayEnvironments.AddEditVhost.host.helper.text'
                                                defaultMessage='ex: mg.wso2.com'
                                            />
                                        )}
                                        variant='outlined'
                                        data-testid='vhost'
                                    />
                                </Grid>
                                {/* Remove VHost Button */}
                                <Grid item xs={3}>
                                    <Grid container justifyContent='flex-end'>
                                        <Button
                                            name={vhost.key}
                                            variant='outlined'
                                            color='primary'
                                            onClick={() => handleRemoveVhostConfirm(vhost.key, vhost.isNew)}
                                            disabled={userVhosts.length === 1 || isReadOnly}
                                        >
                                            <FormattedMessage
                                                id='GatewayEnvironments.AddEditVhost.host.remove.btn'
                                                defaultMessage='Remove'
                                            />
                                        </Button>
                                    </Grid>
                                    <Dialog
                                        open={openRemoveVhost}
                                        onClose={handleClose}
                                        aria-labelledby='alert-dialog-title'
                                        aria-describedby='alert-dialog-description'
                                    >
                                        <DialogTitle id='alert-dialog-title'>
                                            <FormattedMessage
                                                id='GatewayEnvironments.AddEditVhost.host.remove.dialog.title'
                                                defaultMessage='Remove Existing Vhost?'
                                            />
                                        </DialogTitle>
                                        <DialogContent>
                                            <DialogContentText id='alert-dialog-description'>
                                                <FormattedMessage
                                                    id='GatewayEnvironments.AddEditVhost.host.remove.dialog.content'
                                                    defaultMessage={'Removing an existing VHost may result in '
                                                        + 'inconsistent state if APIs are deployed with this VHost. '
                                                        + 'Please make sure there are no APIs deployed with this VHost '
                                                        + 'or redeploy those APIs.'}
                                                />
                                            </DialogContentText>
                                        </DialogContent>
                                        <DialogActions>
                                            <Button onClick={handleClose} color='primary' autoFocus>
                                                <FormattedMessage
                                                    id='GatewayEnvironments.AddEditVhost.host.remove.dialog.no.btn'
                                                    defaultMessage='No, Don&apos;t Remove'
                                                />
                                            </Button>
                                            <Button onClick={() => handleRemoveVhost('')} color='primary'>
                                                <FormattedMessage
                                                    id='GatewayEnvironments.AddEditVhost.host.remove.dialog.yes.btn'
                                                    defaultMessage='Yes'
                                                />
                                            </Button>
                                        </DialogActions>
                                    </Dialog>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant='body1' style={{ marginLeft: '8px' }}>
                                        <FormattedMessage
                                            id='GatewayEnvironments.AddEditVhost.host.gateway.access.url'
                                            defaultMessage='Gateway Access URLs'
                                        />
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography color='textSecondary' variant='body2' style={{ marginLeft: '16px' }}>
                                        {
                                            `http://${vhost.host || '<HOST>'}:${vhost.httpPort}/${vhost.httpContext} |
                                            https://${vhost.host || '<HOST>'}:${vhost.httpsPort}/${vhost.httpContext}`
                                        }
                                        <br />
                                        {gatewayType === 'Regular' && (
                                            `ws://${vhost.host || '<HOST>'}:${vhost.wsPort}/ |
                                            wss://${vhost.host || '<HOST>'}:${vhost.wssPort}/`
                                        )}
                                    </Typography>
                                </Grid>
                                {/* Advanced Settings */}
                                <Grid item xs={12} style={{ marginTop: '16px' }}>
                                    <Accordion>
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            aria-controls='panel1a-content'
                                            id='panel1a-header'
                                        >
                                            <Typography>
                                                <FormattedMessage
                                                    id='GatewayEnvironments.AddEditVhost.host.gateway.advanced.settings'
                                                    defaultMessage='Advanced Settings'
                                                />
                                            </Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Grid container>
                                                {/* HTTP Context and Ports */}
                                                <Grid item xs={12}>
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={6}>
                                                            <TextField
                                                                margin='dense'
                                                                name={vhost.key}
                                                                disabled={!vhost.isNew || isReadOnly}
                                                                onChange={changeHandler('httpContext')}
                                                                label={(
                                                                    <FormattedMessage
                                                                        id={'GatewayEnvironments.AddEditVhost.host.'
                                                                            + 'gateway.http.context'}
                                                                        defaultMessage='HTTP(s) context'
                                                                    />
                                                                )}
                                                                value={vhost.httpContext}
                                                                variant='outlined'
                                                            />
                                                        </Grid>
                                                        {[
                                                            {
                                                                name: 'httpPort',
                                                                caption: intl.formatMessage({
                                                                    defaultMessage: 'HTTP Port',
                                                                    id: 'GatewayEnvironments.AddEditVhost.httpPort',
                                                                }),
                                                            },
                                                            {
                                                                name: 'httpsPort',
                                                                caption: intl.formatMessage({
                                                                    defaultMessage: 'HTTPS Port',
                                                                    id: 'GatewayEnvironments.AddEditVhost.httpsPort',
                                                                }),
                                                            },
                                                        ].map((field) => (
                                                            <Grid item xs={3}>
                                                                <TextField
                                                                    margin='dense'
                                                                    name={vhost.key}
                                                                    disabled={!vhost.isNew || isReadOnly}
                                                                    onChange={changeHandler(field.name)}
                                                                    label={field.caption}
                                                                    value={vhost[field.name]}
                                                                    type='number'
                                                                    variant='outlined'
                                                                />
                                                            </Grid>
                                                        ))}
                                                    </Grid>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Divider
                                                        variant='middle'
                                                        sx={(theme) => ({
                                                            borderColor: 'LightGray',
                                                            margin: theme.spacing(1),
                                                            opacity: 0.2,
                                                        })}
                                                    />
                                                </Grid>
                                                {/* WS Ports */}
                                                {gatewayType === 'Regular' && (
                                                    <Grid item xs={12}>
                                                        <Grid container spacing={2}>
                                                            <Grid item xs={6} />
                                                            {
                                                                [
                                                                    {
                                                                        name: 'wsPort',
                                                                        caption: intl.formatMessage({
                                                                            defaultMessage: 'WS Port',
                                                                            id:
                                                                            'GatewayEnvironments.AddEditVhost.wsPort',
                                                                        }),
                                                                    },
                                                                    {
                                                                        name: 'wssPort',
                                                                        caption: intl.formatMessage({
                                                                            defaultMessage: 'WSS Port',
                                                                            id:
                                                                            'GatewayEnvironments.AddEditVhost.wssPort',
                                                                        }),
                                                                    },
                                                                ].map((field) => (
                                                                    <Grid item xs={3}>
                                                                        <TextField
                                                                            margin='dense'
                                                                            name={vhost.key}
                                                                            disabled={!vhost.isNew || isReadOnly}
                                                                            onChange={changeHandler(field.name)}
                                                                            label={field.caption}
                                                                            value={vhost[field.name]}
                                                                            type='number'
                                                                            variant='outlined'
                                                                        />
                                                                    </Grid>
                                                                ))
                                                            }
                                                        </Grid>
                                                    </Grid>
                                                )}
                                            </Grid>
                                        </AccordionDetails>
                                    </Accordion>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                ))}
                {/* Add new VHost */}
                {(gatewayType === 'Regular' || gatewayType === 'APK' || gatewayType === 'other')
                    && (
                        <Grid item xs={12}>
                            <Button
                                name='newVhost'
                                variant='outlined'
                                color='primary'
                                onClick={handleNewVhost}
                                disabled={isReadOnly}
                            >
                                <FormattedMessage
                                    id='GatewayEnvironments.AddEditVhost.add.vhost.btn'
                                    defaultMessage='New VHost'
                                />
                            </Button>
                        </Grid>
                    )}
            </Grid>
        </FormGroup>
    );
}

AddEditVhost.defaultProps = {
    initialVhosts: [],
    isEditMode: false,
    isReadOnly: false,
};

AddEditVhost.propTypes = {
    onVhostChange: PropTypes.func.isRequired,
    gatewayType: PropTypes.string.isRequired,
    isEditMode: PropTypes.bool,
    isReadOnly: PropTypes.bool,
    initialVhosts: PropTypes.arrayOf(PropTypes.shape({
        host: PropTypes.string.isRequired,
        httpContext: PropTypes.string,
        httpPort: PropTypes.number.isRequired,
        httpsPort: PropTypes.number.isRequired,
        wsPort: PropTypes.number.isRequired,
        wssPort: PropTypes.number.isRequired,
    })),
};

export default AddEditVhost;
