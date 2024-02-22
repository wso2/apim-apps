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
import HelpOutline from '@mui/icons-material/HelpOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import WrappedExpansionPanel from 'AppComponents/Shared/WrappedExpansionPanel';
import { AccordionSummary, AccordionDetails, Collapse } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import { FormattedMessage } from 'react-intl';
import { isRestricted } from 'AppData/AuthManager';

const PREFIX = 'MaxBackendTps';

const classes = {
    expansionPanel: `${PREFIX}-expansionPanel`,
    expansionPanelDetails: `${PREFIX}-expansionPanelDetails`,
    iconSpace: `${PREFIX}-iconSpace`,
    subHeading: `${PREFIX}-subHeading`
};


const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.expansionPanel}`]: {
        marginBottom: theme.spacing(1), // TODO: replace with <Box /> element `mb`
    },

    [`& .${classes.expansionPanelDetails}`]: {
        flexDirection: 'column',
    },

    [`& .${classes.iconSpace}`]: {
        marginLeft: theme.spacing(0.5),
    },

    [`& .${classes.subHeading}`]: {
        fontSize: '1rem',
        fontWeight: 400,
        margin: 0,
        display: 'inline-flex',
        lineHeight: 1.5,
    }
}));

/**
 *
 *
 * @export
 * @param {*} props
 * @returns
 */
export default function MaxBackendTps(props) {
    const { api, configDispatcher } = props;


    return (
        (<Root>
            <Grid item xs={12}>
                <WrappedExpansionPanel className={classes.expansionPanel} defaultExpanded id='maxBackendTps'>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography className={classes.subHeading} variant='h6' component='h4'>
                            <FormattedMessage
                                id='Apis.Details.Configuration.Components.MaxBackendTps.maximum.backend.throughput'
                                defaultMessage='Backend Throughput'
                            />
                            <Tooltip
                                title={(
                                    <FormattedMessage
                                        id='Apis.Details.Configuration.components.MaxBackendTps.tooltip'
                                        defaultMessage={'Limits the total number of calls the API Manager is allowed'
                                        + ' to make to the backend'}
                                    />
                                )}
                                aria-label='APISecurity'
                                placement='right-end'
                                interactive
                            >
                                <HelpOutline className={classes.iconSpace} />
                            </Tooltip>
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails className={classes.expansionPanelDetails}>
                        <FormControl component='fieldset'>
                            <FormLabel component='legend'>Maximum Throughput</FormLabel>
                            <RadioGroup
                                aria-label='change-max-TPS'
                                value={api.maxTps === null ? 'unlimited' : 'specify'}
                                onChange={(event) => {
                                    configDispatcher({
                                        action: 'maxTps',
                                        value:
                                            event.target.value === 'specify' ? { production: null, sandbox: null }
                                                : null,
                                    });
                                }}
                                row
                            >
                                <FormControlLabel
                                    value='unlimited'
                                    control={(
                                        <Radio
                                            color='primary'
                                            disabled={isRestricted(['apim:api_create'], api)}
                                        />
                                    )}
                                    label='Unlimited'
                                    labelPlacement='end'

                                />
                                <FormControlLabel
                                    value='specify'
                                    control={(
                                        <Radio
                                            color='primary'
                                            disabled={isRestricted(['apim:api_create'], api)}
                                        />
                                    )}
                                    label='Specify'
                                    labelPlacement='end'
                                    disabled={isRestricted(['apim:api_create'], api)}
                                />
                            </RadioGroup>
                        </FormControl>
                        <Collapse in={api.maxTps !== null}>
                            <Grid item xs={12} style={{ marginBottom: 10, position: 'relative' }}>
                                <TextField
                                    label='Max Production TPS'
                                    margin='normal'
                                    variant='outlined'
                                    onChange={(event) => {
                                        configDispatcher({
                                            action: 'maxTps',
                                            value: { ...api.maxTps, production: event.target.value },
                                        });
                                    }}
                                    value={api.maxTps !== null ? api.maxTps.production : ''}
                                    disabled={isRestricted(['apim:api_create'], api)}
                                    InputProps={{
                                        endAdornment: <InputAdornment position='end'>TPS</InputAdornment>,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} style={{ marginBottom: 10, position: 'relative' }}>
                                <TextField
                                    label='Max Sandbox TPS'
                                    margin='normal'
                                    variant='outlined'
                                    onChange={(event) => {
                                        configDispatcher({
                                            action: 'maxTps',
                                            value: { ...api.maxTps, sandbox: event.target.value },
                                        });
                                    }}
                                    value={api.maxTps !== null ? api.maxTps.sandbox : ''}
                                    disabled={isRestricted(['apim:api_create'], api)}
                                    InputProps={{
                                        endAdornment: <InputAdornment position='end'>TPS</InputAdornment>,
                                    }}
                                />
                                <FormHelperText>
                                    <FormattedMessage
                                        id='Apis.Details.Configuration.components.MaxBackendTps.formattedMessage'
                                        defaultMessage='Maximum backend transactions per second in integers'
                                    />
                                </FormHelperText>
                            </Grid>
                        </Collapse>
                    </AccordionDetails>
                </WrappedExpansionPanel>
            </Grid>
        </Root>)
    );
}

MaxBackendTps.propTypes = {
    api: PropTypes.shape({}).isRequired,
    configDispatcher: PropTypes.func.isRequired,
};
