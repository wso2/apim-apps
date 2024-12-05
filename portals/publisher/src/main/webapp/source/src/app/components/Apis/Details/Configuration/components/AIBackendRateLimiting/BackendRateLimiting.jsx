/*
 * Copyright (c) 2024, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
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
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import { Collapse, FormControl, FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material';
import { useIntl } from 'react-intl';

import { isRestricted } from 'AppData/AuthManager';
import BackendRateLimitingForm from './BackendRateLimitingForm';

/**
 * Backend Rate Limiting for AI/LLM APIs
 *
 * @export
 * @param {*} props
 * @returns
 */
export default function BackendRateLimiting(props) {
    const { api, configDispatcher } = props;

    const intl = useIntl();

    const stylesSx = {
        subHeading: {
            fontSize: '1rem',
            fontWeight: 400,
            margin: 0,
            display: 'inline-flex',
            lineHeight: 1.5,
        },
    };

    return (
        <>
            <Typography sx={stylesSx.subHeading} variant='h6' component='h4'>
                Backend Rate Limiting
            </Typography>
            <br />
            <FormControl component='fieldset'>
                <RadioGroup
                    aria-label='change-max-TPS'
                    value={!api.maxTps ? 'unlimited' : 'specify'}
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
                        label={intl.formatMessage({
                            id: 'Apis.Details.Configuration.components.MaxBackendTps.max.'
                                + 'throughput.unlimited',
                            defaultMessage: 'Unlimited',
                        })}
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
                        label={intl.formatMessage({
                            id: 'Apis.Details.Configuration.components.MaxBackendTps.max.'
                                + 'throughput.specify',
                            defaultMessage: 'Specify',
                        })}
                        labelPlacement='end'
                        disabled={isRestricted(['apim:api_create'], api)}
                    />
                </RadioGroup>
            </FormControl>
            <Collapse in={!!api.maxTps}>
                <Grid item xs={12} sx={{ mb: 2 }}>
                    <BackendRateLimitingForm
                        api={api}
                        configDispatcher={configDispatcher}
                        isProduction
                    />
                </Grid>
                <Grid item xs={12} sx={{ mb: 2 }}>
                    <BackendRateLimitingForm
                        api={api}
                        configDispatcher={configDispatcher}
                    />
                </Grid>
            </Collapse>
        </>
    );
}

BackendRateLimiting.propTypes = {
    api: PropTypes.shape({}).isRequired,
    configDispatcher: PropTypes.func.isRequired,
};
