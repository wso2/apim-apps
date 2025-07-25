/*
 *  Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *  WSO2 Inc. licenses this file to you under the Apache License,
 *  Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied. See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 */

import React, { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { styled } from '@mui/material/styles';
import {
    Typography,
    Grid,
    RadioGroup,
    FormControlLabel,
    Radio,
    FormControl,
    Divider,
    Button,
    Card,
    CardContent,
    CardActions,
} from '@mui/material';
import PropTypes from 'prop-types';

const PREFIX = 'NewEndpointCreate';

const classes = {
    inlineMessageContainer: `${PREFIX}-inlineMessageContainer`,
    endpointTypeCard: `${PREFIX}-endpointTypeCard`,
    cardContent: `${PREFIX}-cardContent`,
    content: `${PREFIX}-content`,
    cardActions: `${PREFIX}-cardActions`
};


const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.inlineMessageContainer}`]: {
        marginBottom: theme.spacing(1),
    },

    [`& .${classes.endpointTypeCard}`]: {
        margin: theme.spacing(1),
        maxWidth: theme.spacing(30),
        transition: 'box-shadow 0.3s ease-in-out',
        height: theme.spacing(40),
        display: 'flex',
        flexDirection: 'column',
    },

    [`& .${classes.cardContent}`]: {
        height: theme.spacing(40),
    },

    [`& .${classes.content}`]: {
        marginTop: theme.spacing(1),
    },

    [`& .${classes.cardActions}`]: {
        justifyContent: 'flex-end',
        borderTop: 'solid #e0e0e0 thin',
    }
}));

/**
 * Component to create new endpoint.
 * This component will render if the api object does not have an endpoint configuration, letting users to create a
 * new endpoint configuration based on their requirement.
 * Following endpoint types are supported.
 * 1. HTTP/ SOAP endpoints
 * 2. Prototyped/ Mock endpoints
 * 3. AWS Lambda endpoints
 * 4. Dynamic Endpoints
 *
 * @param {any} props The input props.
 * @return {any} The HTML representation of the component.
 * */
function NewEndpointCreate(props) {
    const {
        generateEndpointConfig,
        apiType,
        componentValidator,
    } = props;
    const intl = useIntl();
    const [endpointImplType, setImplType] = useState('mock');
    const endpointTypes = [
        {
            type: 'http',
            name: intl.formatMessage({
                id: 'Apis.Details.Endpoints.NewEndpointCreate.create.http.endpoint',
                defaultMessage: 'HTTP/ REST Endpoint',
            }),
            description: intl.formatMessage({
                id: 'Apis.Details.Endpoints.NewEndpointCreate.create.http.endpoint.description',
                defaultMessage: 'A REST API endpoint based on a URI template.',
            }),
            options: null,
            disabled: ['SOAPTOREST', 'WS'],
        },
        {
            type: 'service',
            name: intl.formatMessage({
                id: 'Apis.Details.Endpoints.NewEndpointCreate.create.service.endpoint',
                defaultMessage: 'Service Endpoint',
            }),
            description: intl.formatMessage({
                id: 'Apis.Details.Endpoints.NewEndpointCreate.create.service.endpoint.description',
                defaultMessage: 'A REST API endpoint based on a Service in the service catalog.',
            }),
            options: null,
            disabled: ['SOAPTOREST', 'WS'],
        },
        {
            type: 'address',
            name: intl.formatMessage({
                id: 'Apis.Details.Endpoints.NewEndpointCreate.create.soap.endpoint',
                defaultMessage: 'HTTP/ SOAP Endpoint',
            }),
            description: intl.formatMessage({
                id: 'Apis.Details.Endpoints.NewEndpointCreate.create.soap.endpoint.description',
                defaultMessage: 'The direct URI of the web service.',
            }),
            options: null,
            disabled: ['GRAPHQL', 'SSE', 'WS'],
        },
        {
            type: 'ws',
            name: intl.formatMessage({
                id: 'Apis.Details.Endpoints.NewEndpointCreate.create.ws.endpoint',
                defaultMessage: 'WS Endpoint',
            }),
            description: intl.formatMessage({
                id: 'Apis.Details.Endpoints.NewEndpointCreate.create.ws.endpoint.description',
                defaultMessage: 'An endpoint for WebSocket APIs.',
            }),
            options: null,
            disabled: ['SOAPTOREST', 'GRAPHQL', 'SSE', 'SOAP', 'HTTP'],
        },
        {
            type: 'INLINE',
            name: intl.formatMessage({
                id: 'Apis.Details.Endpoints.NewEndpointCreate.create.prototype.endpoint',
                defaultMessage: 'Mock Implementation',
            }),
            description: intl.formatMessage({
                id: 'Apis.Details.Endpoints.NewEndpointCreate.create.prototype.endpoint.description',
                defaultMessage: 'Use the inbuilt JavaScript engine to prototype the API '
                + 'The inbuilt JavaScript engine does support prototype SOAP APIs',
            }),
            options: null,
            disabled: ['GRAPHQL', 'SSE', 'WS'],
        },
        {
            type: 'dynamic',
            name: intl.formatMessage({
                id: 'Apis.Details.Endpoints.NewEndpointCreate.create.dynamic.endpoint',
                defaultMessage: 'Dynamic Endpoint',
            }),
            description: intl.formatMessage({
                id: 'Apis.Details.Endpoints.NewEndpointCreate.create.dynamic.endpoint.description',
                defaultMessage: 'If you need to send the request to the URI specified in the TO header.',
            }),
            options: null,
            disabled: ['SSE'],
        },
        {
            type: 'awslambda',
            name: intl.formatMessage({
                id: 'Apis.Details.Endpoints.NewEndpointCreate.create.awslambda.endpoint',
                defaultMessage: 'AWS Lambda Endpoint',
            }),
            description: intl.formatMessage({
                id: 'Apis.Details.Endpoints.NewEndpointCreate.create.awslambda.endpoint.description',
                defaultMessage: 'If you need to invoke AWS Lambda functions through API gateway.',
            }),
            options: null,
            disabled: ['SOAPTOREST', 'GRAPHQL', 'SSE', 'WS'],
        },
        {
            type: 'sequence_backend',
            name: intl.formatMessage({
                id: 'Apis.Details.Endpoints.NewEndpointCreate.create.sequencebackend.endpoint',
                defaultMessage: 'Sequence Backend',
            }),
            description: intl.formatMessage({
                id: 'Apis.Details.Endpoints.NewEndpointCreate.create.sequencebackend.endpoint.description',
                defaultMessage: 'If you need to provde Sequence as a Backend for APIs.',
            }),
            options: null,
            disabled: ['GRAPHQL', 'SSE', 'WS'],
        },
    ];

    const eligibleTypes = endpointTypes.filter((type) => !type.disabled.includes(apiType)).map((type) => {
        return type;
    });

    return (
        <Root>
            <Typography variant='h4' align='left' className={classes.titleWrapper}>
                <FormattedMessage
                    id='Apis.Details.Endpoints.NewEndpointCreate.add.endpoints.header'
                    defaultMessage='Select an Endpoint Type to Add'
                />
            </Typography>
            <Grid container justifyContent='flex-start' spacing={2}>
                {(eligibleTypes.filter(ep => componentValidator.includes(ep.type)).map((type) => {
                    return (
                        <Grid item className={classes.inlineMessageContainer}>
                            <Card className={classes.endpointTypeCard}>
                                <CardContent className={classes.cardContent}>
                                    <Typography variant='h5' component='h3' className={classes.head}>
                                        {type.name}
                                    </Typography>
                                    <Divider />
                                    <Typography component='p' className={classes.content}>
                                        {type.description}
                                    </Typography>
                                    {type.options
                                        ? (
                                            <div>
                                                <FormControl component='fieldset' className={classes.formControl}>
                                                    <RadioGroup
                                                        aria-label='EndpointType'
                                                        name='endpointType'
                                                        className={classes.radioGroup}
                                                        value={endpointImplType}
                                                        onChange={(event) => { setImplType(event.target.value); }}
                                                    >
                                                        {type.options.filter((types) => !types.disabled
                                                            .includes(apiType)).map(((option) => {
                                                            return (
                                                                <FormControlLabel
                                                                    value={option.type}
                                                                    control={<Radio color='primary' />}
                                                                    label={option.name}
                                                                />
                                                            );
                                                        }))}
                                                    </RadioGroup>
                                                </FormControl>
                                            </div>
                                        )
                                        : <div /> }
                                </CardContent>
                                <CardActions className={classes.cardActions}>
                                    <Button
                                        color='primary'
                                        className={classes.button}
                                        onClick={() => generateEndpointConfig(type.type, endpointImplType)}
                                        data-testid={type.name.replace(/\s/g, '').toLowerCase() + '-add-btn'}
                                    >
                                        <FormattedMessage
                                            id='Apis.Details.Endpoints.NewEndpointCreate.create.button'
                                            defaultMessage='Add'
                                        />
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    );
                }))}
            </Grid>
        </Root>
    );
}

NewEndpointCreate.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    generateEndpointConfig: PropTypes.func.isRequired,
    apiType: PropTypes.string.isRequired,
};

export default (NewEndpointCreate);
