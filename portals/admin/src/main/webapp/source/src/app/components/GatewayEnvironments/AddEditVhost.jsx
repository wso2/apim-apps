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
    const { onVhostChange, initialVhosts, gatewayType } = props;

    const [userVhosts, setUserVhosts] = useState(initialVhosts);
    const [id, setId] = useState(0);
    const defaultVhost = {
        host: '', httpContext: '', httpsPort: 8243, httpPort: 8280, wssPort: 8099, wsPort: 9099, isNew: true,
    };

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
        const vhost = defaultVhost;
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
            const vhost = defaultVhost;
            vhost.key = '' + id;
            setUserVhosts([vhost]);
        }
    }, []);

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
                                        disabled={!vhost.isNew}
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
                                        helperText='ex: mg.wso2.com'
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
                                            disabled={userVhosts.length === 1}
                                        >
                                            Remove
                                        </Button>
                                    </Grid>
                                    <Dialog
                                        open={openRemoveVhost}
                                        onClose={handleClose}
                                        aria-labelledby='alert-dialog-title'
                                        aria-describedby='alert-dialog-description'
                                    >
                                        <DialogTitle id='alert-dialog-title'>
                                            Remove Existing Vhost?
                                        </DialogTitle>
                                        <DialogContent>
                                            <DialogContentText id='alert-dialog-description'>
                                                Removing an existing VHost may result in inconsistent state if APIs
                                                are deployed with this VHost. Please make sure there are no APIs
                                                deployed with this VHost or redeploy those APIs.
                                            </DialogContentText>
                                        </DialogContent>
                                        <DialogActions>
                                            <Button onClick={handleClose} color='primary' autoFocus>
                                                No, Don&apos;t Remove
                                            </Button>
                                            <Button onClick={() => handleRemoveVhost('')} color='primary'>
                                                Yes
                                            </Button>
                                        </DialogActions>
                                    </Dialog>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant='body1' style={{ marginLeft: '8px' }}>
                                        Gateway Access URLs
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
                                            <Typography>Advanced Settings</Typography>
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
                                                                disabled={!vhost.isNew}
                                                                onChange={changeHandler('httpContext')}
                                                                label='HTTP(s) context'
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
                                                                    disabled={!vhost.isNew}
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
                                                                            disabled={!vhost.isNew}
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
                <Grid item xs={12}>
                    <Button
                        name='newVhost'
                        variant='outlined'
                        color='primary'
                        onClick={handleNewVhost}
                    >
                        New VHost
                    </Button>
                </Grid>
            </Grid>
        </FormGroup>
    );
}

AddEditVhost.defaultProps = {
    initialVhosts: [],
};

AddEditVhost.propTypes = {
    onVhostChange: PropTypes.func.isRequired,
    gatewayType: PropTypes.string.isRequired,
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
