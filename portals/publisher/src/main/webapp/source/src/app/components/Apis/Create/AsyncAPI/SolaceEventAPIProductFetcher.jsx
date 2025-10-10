/*
 * Copyright (c) 2025, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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

import React, { useEffect, useState } from 'react';
import {
    RadioGroup,
    FormControlLabel,
    FormControl,
    Radio,
    FormLabel,
    TableContainer,
    Table,
    Paper,
    TableRow,
    TableCell,
    TableBody,
    Grid,
    CircularProgress,
    TableHead,
    Typography,
    Chip,
} from '@mui/material';
import APIClientFactory from 'AppData/APIClientFactory';
import Utils from 'AppData/Utils';
import Alert from 'AppComponents/Shared/Alert';
import { useIntl, FormattedMessage} from 'react-intl';

/**
 * This component fetches Solace Event API Products containing a single Solace Event API, and allows to choose one.
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
const SolaceEventAPIProductFetcher = (props) => {
    const { apiInputs, inputsDispatcher, onSolaceEventApiSelect } = props;
    const [eventApis, setEventApis] = useState([]);
    const [loading, setLoading] = useState(true);
    const intl = useIntl();

    useEffect(() => {
        setLoading(true);
        const apiClient =
            new APIClientFactory().getAPIClient(Utils.getCurrentEnvironment(), Utils.CONST.API_CLIENT).client;
        apiClient.then((client) => {
            client.apis['Integrated APIs'].getIntegratedAPIs({ vendor: 'solace' })
                .then((response) => {
                    setEventApis(response.body);
                })
                .catch((error) => {
                    Alert.error(intl.formatMessage({
                        id: 'Apis.Create.AsyncAPI.SolaceEventApiProductFetcher.fetchError',
                        defaultMessage: 'Error occurred while fetching Solace Event API Products',
                    }));                    
                    console.error(error);
                })
                .finally(() => {
                    setLoading(false);
                });
        });
    }, []);

    function handleOnBlur(value) {
        const [solaceEventApiProductId, solacePlanId, solaceEventApiId] = value.split('/');
        onSolaceEventApiSelect(solaceEventApiProductId, solacePlanId, solaceEventApiId);
        inputsDispatcher({action: 'isFormValid', value: true});
    }

    function returnEventApis() {
        if (eventApis.length === 0) {
            return (
                <Typography>
                    <FormattedMessage
                        id='Apis.Create.AsyncAPI.SolaceEventApiProductFetcher.noApisAvailable'
                        defaultMessage='No Solace Event API Products containing a single Solace Event API are available'
                    />
                </Typography>
            );
        }
        return (
            <RadioGroup
                value={apiInputs.inputValue}
                onChange={({target: {value}}) =>
                    inputsDispatcher({action: 'inputValue', value})}
                onBlur={({target: {value}}) => handleOnBlur(value)}
            >
                <FormControl>
                    <FormLabel sx={{ mb: 2 }}>Select the Solace Event API</FormLabel>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        {intl.formatMessage({
                                            id: 'Apis.Create.AsyncAPI.SolaceEventApiProductFetcher.eventApi',
                                            defaultMessage: 'Solace Event API',
                                        })}
                                    </TableCell>
                                    <TableCell>
                                        {intl.formatMessage({
                                            id: 'Apis.Create.AsyncAPI.SolaceEventApiProductFetcher.plans',
                                            defaultMessage: 'Solace Plans',
                                        })}
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {eventApis.map((eventApi) => {
                                    return (
                                        <TableRow
                                            key={eventApi.apiId}>
                                            <TableCell>
                                                <FormControlLabel
                                                    control={<Radio/>}
                                                    label={eventApi.apiName}
                                                    value={eventApi.apiId}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {eventApi.plans.map(plan => (
                                                    <Chip key={plan} label={plan} sx={{ mr: 0.5 }} />
                                                ))}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </FormControl>
            </RadioGroup>
        );
    }

    return (
        <Grid container>
            <Grid item xs={12}>
                {loading ? <CircularProgress /> : returnEventApis()}
            </Grid>
        </Grid>
    );
};

export default SolaceEventAPIProductFetcher;
