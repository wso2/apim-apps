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
import PropTypes from 'prop-types';
import { makeStyles } from '@mui/styles';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { FormattedMessage } from 'react-intl';

import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';

const useStyles = makeStyles((theme) => ({
    formControl: {
        minWidth: 120,
    },
    paper: {
        paddingLeft: theme.spacing(4),
        paddingTop: theme.spacing(1.5),
        paddingBottom: theme.spacing(0.5),
        marginTop: '12px',
    },
}));

/**
 * Renders Subscription configurations for WebSub APIs.
 *
 * @export
 * @param {*} props
 * @returns
 */
function SubscriptionConfig(props) {
    const {
        websubSubscriptionConfigDispatcher, websubSubscriptionConfiguration,
    } = props;

    const [isExpanded, setIsExpanded] = useState(false);
    const classes = useStyles();
    const [enabled, setEnabled] = useState(!!websubSubscriptionConfiguration.enable);

    /**
     *
     */
    function generateSecret() {
        return 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'.replace(/[x]/g, (c) => {
            // eslint-disable-next-line no-bitwise
            const r = Math.random() * 16 | 0;
            // eslint-disable-next-line no-bitwise, no-mixed-operators
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     *
     */
    function getAlgorithms() {
        return ['SHA1', 'SHA256', 'SHA384', 'SHA512'];
    }

    return (
        <Accordion
            expanded={isExpanded}
            onChange={(e, expanded) => {
                setIsExpanded(expanded);
            }}
            className={classes.paperStyles}
        >
            <AccordionSummary
                disableRipple
                disableTouchRipple
                expandIcon={<ExpandMoreIcon />}
                aria-controls='panel2a-content'
                id='panel2a-header'
                classes={{ content: classes.contentNoMargin }}
            >
                <Grid item md={12} xs={12}>
                    <Box ml={1}>
                        <Typography variant='subtitle1' gutterBottom>
                            Subscription Configuration
                        </Typography>
                    </Box>
                </Grid>
            </AccordionSummary>
            <AccordionDetails>
                <Grid container direction='row' spacing={0} justifyContent='center' alignItems='center'>
                    <Grid item xs={6}>
                        <FormControl component='fieldset'>
                            <FormControlLabel
                                control={(
                                    <Switch
                                        checked={websubSubscriptionConfiguration.enable}
                                        onChange={({ target: { checked } }) => {
                                            setEnabled(checked);
                                            websubSubscriptionConfigDispatcher({
                                                action: 'enable',
                                                value: checked,
                                            });
                                        }}
                                        size='small'
                                        color='primary'
                                    />
                                )}
                                label='Enable'
                                labelPlacement='start'
                            />
                        </FormControl>
                    </Grid>
                    <Grid item xs={6} />
                    <Grid item xs={6}>
                        <TextField
                            autoFocus
                            fullWidth
                            select
                            disabled={!enabled}
                            label={(
                                <>
                                    <FormattedMessage
                                        id='Apis.Details.Configuration.components.Subscription.signingAlgorithm'
                                        defaultMessage='Signing Algortithm'
                                    />
                                </>
                            )}
                            value={websubSubscriptionConfiguration.signingAlgorithm}
                            helperText='Select an algorithm to sign the message'
                            name='secret'
                            margin='normal'
                            variant='outlined'
                            onChange={({ target: { value } }) => websubSubscriptionConfigDispatcher({
                                action: 'signingAlgorithm',
                                value,
                            })}
                        >
                            {
                                getAlgorithms().map((name) => (
                                    <MenuItem value={name} dense>
                                        {name}
                                    </MenuItem>
                                ))
                            }
                        </TextField>
                    </Grid>
                    <Grid item xs={6} />
                    <Grid item xs={6}>
                        <TextField
                            autoFocus
                            fullWidth
                            disabled={!enabled}
                            label={(
                                <>
                                    <FormattedMessage
                                        id='Apis.Details.Configuration.components.Subscription.signature.header'
                                        defaultMessage='Signature Header'
                                    />
                                </>
                            )}
                            value={websubSubscriptionConfiguration.signatureHeader}
                            helperText='Set the HTTP header use by the provider to send the signature'
                            name='secret'
                            margin='normal'
                            variant='outlined'
                            onChange={({ target: { value } }) => websubSubscriptionConfigDispatcher({
                                action: 'signatureHeader',
                                value,
                            })}
                        />
                    </Grid>
                    <Grid item xs={6} />
                    <Grid item xs={6}>
                        <Grid container direction='row'>
                            <Grid item xs={10}>
                                <TextField
                                    autoFocus
                                    fullWidth
                                    disabled
                                    label={(
                                        <>
                                            <FormattedMessage
                                                id='Apis.Details.Configuration.components.Subscription.secret'
                                                defaultMessage='Secret'
                                            />
                                        </>
                                    )}
                                    value={websubSubscriptionConfiguration.secret}
                                    helperText='Use the above secret key while registering at the provider'
                                    name='secret'
                                    margin='normal'
                                    variant='outlined'
                                />
                            </Grid>
                            <Grid item xs={2}>
                                <Button
                                    variant='contained'
                                    color='primary'
                                    disabled={!enabled}
                                    onClick={() => websubSubscriptionConfigDispatcher({
                                        action: 'secret',
                                        value: generateSecret(),
                                    })}
                                    style={{ marginLeft: 10, marginTop: 25 }}
                                >
                                    Generate
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={6} />
                </Grid>
            </AccordionDetails>
        </Accordion>
    );
}

SubscriptionConfig.propTypes = {
    websubSubscriptionConfigDispatcher: PropTypes.func.isRequired,
    websubSubscriptionConfiguration: PropTypes.shape({
        signingAlgorithm: PropTypes.string.isRequired,
        signatureHeader: PropTypes.string.isRequired,
        secret: PropTypes.string.isRequired,
        enable: PropTypes.bool.isRequired,
    }).isRequired,
};

export default React.memo(SubscriptionConfig);
