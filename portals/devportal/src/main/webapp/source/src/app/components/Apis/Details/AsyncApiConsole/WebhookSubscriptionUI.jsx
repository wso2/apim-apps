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

import React, { useState, useReducer } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';
import AccordionActions from '@mui/material/AccordionActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Alert from 'AppComponents/Shared/Alert';
import Grid from '@mui/material/Grid';
import Radio from '@mui/material/Radio';
import { RadioGroup, useTheme } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import { FormattedMessage, useIntl } from 'react-intl';
import Utils from 'AppData/Utils';
import Badge from '@mui/material/Badge';

function reducer(state, { field, value }) {
    return { ...state, [field]: value };
}

function WebhookSubscriptionUI(props) {
    const intl = useIntl();
    const verb = props.topic.type.toLowerCase();
    const trimmedVerb = verb === 'publish' || verb === 'subscribe' ? verb.substr(0, 3) : verb;
    const theme = useTheme();
    const backgroundColor = theme.custom.resourceChipColors[trimmedVerb];
    const { generateGenericWHSubscriptionCurl, topic } = props;
    const initialSubscriptionState = {
        topic: topic.name,
        secret: null,
        lease: 50000,
        mode: 'subscribe',
        callback: null,
    };
    const [curl, setCurl] = useState(generateGenericWHSubscriptionCurl(initialSubscriptionState));
    const [formError, setFormError] = useState(false);
    const [state, dispatch] = useReducer(reducer, initialSubscriptionState);

    const handleClick = () => {
        if (!state.callback || state.callback.length < 1) {
            setFormError(true);
        } else {
            setFormError(false);
            setCurl(generateGenericWHSubscriptionCurl(state));
        }
    };

    const handleChange = (e) => {
        dispatch({ field: e.target.name, value: e.target.value });
    };

    return (
        <Accordion sx={{
            marginBottom: '10px',
            border: `1px solid ${backgroundColor}`,
        }}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls='wh-subscription-content'
                id='wh-subscription-header'
                sx={{
                    backgroundColor: Utils.hexToRGBA(backgroundColor, 0.1),
                    maxHeight: '40px',
                    borderColor: '#80bdff',
                    '&$expanded': {
                        maxHeight: '40px',
                    },
                }}
            >
                <Grid container direction='row' justifyContent='space-between' alignItems='center' spacing={0}>
                    <Grid item md={11}>
                        <Badge invisible='false' color='error' variant='dot'>
                            <Button
                                disableFocusRipple
                                variant='outlined'
                                size='small'
                                sx={{
                                    backgroundColor: '#ffffff',
                                    borderColor: backgroundColor,
                                    color: backgroundColor,
                                    width: theme.spacing(2),
                                }}
                            >
                                {trimmedVerb.toUpperCase()}
                            </Button>
                        </Badge>
                        <Typography display='inline' style={{ margin: '0px 30px' }} gutterBottom>
                            {topic.name}
                        </Typography>
                    </Grid>
                </Grid>
            </AccordionSummary>
            <AccordionDetails>
                <Grid container direction='column' wrap='nowrap'>
                    <Grid item xs={6}>
                        <RadioGroup aria-label='mode' name='mode' value={state.mode} row onChange={handleChange}>
                            <FormControlLabel
                                value='subscribe'
                                control={<Radio />}
                                label={intl.formatMessage({
                                    defaultMessage: 'Subscribe',
                                    id: 'Apis.Details.AsyncApiConsole.Webhooks.Subscribe',
                                })}
                            />
                            <FormControlLabel
                                value='unsubscribe'
                                control={<Radio />}
                                label={intl.formatMessage({
                                    defaultMessage: 'Unsubscribe',
                                    id: 'Apis.Details.AsyncApiConsole.Webhooks.Unsubscribe',
                                })}
                            />
                        </RadioGroup>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            variant='outlined'
                            size='small'
                            sx={{ width: '50%' }}
                            name='callback'
                            id='standard-full-width'
                            label={intl.formatMessage({
                                defaultMessage: 'Callback URL',
                                id: 'Apis.Details.AsyncApiConsole.Webhooks.callback',
                            })}
                            error={formError}
                            required
                            placeholder='www.webhook.site'
                            onChange={handleChange}
                            fullWidth
                            InputProps={{
                                disableUnderline: true,
                                classes: {
                                    root: {
                                        padding: 0,
                                        'label + &': {
                                            marginTop: theme.spacing(1),
                                        },
                                    },
                                    input: {
                                        borderRadius: 4,
                                        backgroundColor: theme.palette.common.white,
                                        border: '1px solid #ced4da',
                                        padding: '5px 12px',
                                        marginTop: '11px',
                                        marginBottom: '11px',
                                        width: '100%',
                                        transition: theme.transitions.create(['border-color', 'box-shadow']),
                                        '&:focus': {
                                            borderColor: '#80bdff',
                                            boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
                                        },
                                        fontSize: 12,
                                    },
                                },
                            }}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Grid>
                    {state.mode === 'subscribe' && (
                        <>
                            <Grid item xs={6}>
                                <TextField
                                    variant='outlined'
                                    size='small'
                                    sx={{ width: '50%' }}
                                    name='secret'
                                    id='standard-full-width'
                                    label={intl.formatMessage({
                                        defaultMessage: 'Secret',
                                        id: 'Apis.Details.AsyncApiConsole.Webhooks.secret',
                                    })}
                                    placeholder='secret'
                                    onChange={handleChange}
                                    fullWidth
                                    InputProps={{
                                        disableUnderline: true,
                                        classes: {
                                            root: {
                                                padding: 0,
                                                'label + &': {
                                                    marginTop: theme.spacing(1),
                                                },
                                            },
                                            input: {
                                                borderRadius: 4,
                                                backgroundColor: theme.palette.common.white,
                                                border: '1px solid #ced4da',
                                                padding: '5px 12px',
                                                marginTop: '11px',
                                                marginBottom: '11px',
                                                width: '100%',
                                                transition: theme.transitions.create(['border-color', 'box-shadow']),
                                                '&:focus': {
                                                    borderColor: '#80bdff',
                                                    boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
                                                },
                                                fontSize: 12,
                                            },
                                        },
                                    }}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    variant='outlined'
                                    size='small'
                                    sx={{ width: '50%' }}
                                    name='lease'
                                    id='standard-full-width'
                                    label={intl.formatMessage({
                                        defaultMessage: 'Lease Seconds',
                                        id: 'Apis.Details.AsyncApiConsole.Webhooks.lease',
                                    })}
                                    onChange={handleChange}
                                    defaultValue={50000}
                                    fullWidth
                                    InputProps={{
                                        disableUnderline: true,
                                        classes: {
                                            root: {
                                                padding: 0,
                                                'label + &': {
                                                    marginTop: theme.spacing(1),
                                                },
                                            },
                                            input: {
                                                borderRadius: 4,
                                                backgroundColor: theme.palette.common.white,
                                                border: '1px solid #ced4da',
                                                padding: '5px 12px',
                                                marginTop: '11px',
                                                marginBottom: '11px',
                                                width: '100%',
                                                transition: theme.transitions.create(['border-color', 'box-shadow']),
                                                '&:focus': {
                                                    borderColor: '#80bdff',
                                                    boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
                                                },
                                                fontSize: 12,
                                            },
                                        },
                                    }}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>
                        </>
                    )}
                    <Grid item xs={12}>
                        <TextField
                            variant='filled'
                            label={intl.formatMessage({
                                defaultMessage: 'cURL',
                                id: 'Apis.Details.AsyncApiConsole.Webhooks.curl',
                            })}
                            defaultValue=''
                            value={curl}
                            fullWidth
                            multiline
                            InputProps={{
                                disableUnderline: true,
                                classes: {
                                    root: {
                                        padding: 0,
                                        'label + &': {
                                            marginTop: theme.spacing(1),
                                        },
                                    },
                                    input: {
                                        borderRadius: 4,
                                        backgroundColor: theme.custom.curlGenerator.backgroundColor,
                                        color: theme.custom.curlGenerator.color,
                                        border: '1px solid #ced4da',
                                        padding: '5px 12px',
                                        marginTop: '11px',
                                        marginBottom: '11px',
                                        width: '100%',
                                        transition: theme.transitions.create(['border-color', 'box-shadow']),
                                        '&:focus': {
                                            borderColor: '#80bdff',
                                            boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
                                        },
                                        fontSize: 12,
                                        fontFamily: 'monospace',
                                        fontWeight: 600,
                                    },
                                },
                            }}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Grid>
                </Grid>
            </AccordionDetails>
            <AccordionActions style={{ paddingRight: '18px' }}>
                <Button size='small' onClick={handleClick}>
                    <FormattedMessage id='Apis.Details.AsyncApiConsole.Curl' defaultMessage='Generate Curl' />
                </Button>
                <Button
                    size='small'
                    onClick={() => {
                        navigator.clipboard.writeText(curl)
                            .then(() => Alert.info(intl.formatMessage({
                                defaultMessage: 'cURL copied',
                                id: 'Apis.Details.AsyncApiConsole.Webhooks.curl.copied',
                            })));
                    }}
                >
                    <FormattedMessage id='Apis.Details.AsyncApiConsole.Copy' defaultMessage='Copy Curl' />
                </Button>
            </AccordionActions>
        </Accordion>
    );
}

export default WebhookSubscriptionUI;
