/*
 * Copyright (c) 2026, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import {
    Box,
    Typography,
    Button,
    Radio,
    Paper,
    CircularProgress,
    Link as MuiLink,
    Tooltip,
    Grid,
    useTheme,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { usePublisherSettings } from 'AppComponents/Shared/AppContext';
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useBackNavigation } from 'AppComponents/Shared';
import { FormattedMessage } from 'react-intl';

const Root = styled('div')(({ theme }) => ({
    padding: theme.spacing(4),
    '& .header': {
        marginBottom: theme.spacing(4),
    },
    '& .actions': {
        marginTop: theme.spacing(2),
    },
}));

const DiscoverAPIs = (props) => {
    const theme = useTheme();
    const { history, location } = props;
    const { data: settings, isLoading } = usePublisherSettings();
    const handleBackClick = useBackNavigation('/apis');

    let initialSelected = null;
    if (location.state?.selectedGateways) {
        if (Array.isArray(location.state.selectedGateways)) {
            const [firstGateway] = location.state.selectedGateways;
            initialSelected = firstGateway;
        } else {
            initialSelected = location.state.selectedGateways;
        }
    }
    const [selectedGateway, setSelectedGateway] = useState(initialSelected);

    if (isLoading) {
        return <CircularProgress />;
    }

    const gateways = (settings?.environment || []).filter(
        (env) => !env.provider.toLowerCase().includes('wso2')
    );

    const handleSelectGateway = (gatewayName) => {
        setSelectedGateway(gatewayName);
    };

    const getGatewayChipColor = (gwType) => {
        const type = (gwType || '').toUpperCase();
        if (type.includes('AWS')) {
            return '#FF9900';
        }
        if (type.includes('KONG')) {
            return '#1A5C96';
        }
        if (type.includes('APIGEE')) {
            return '#F27318';
        }
        if (type.includes('AZURE')) {
            return '#0078D4';
        }
        return theme.palette.text.secondary;
    };

    const getGatewayDescription = (gw) => {
        if (gw.description) {
            return gw.description;
        }
        const type = (gw.gatewayType || '').toUpperCase();
        if (type.includes('AWS')) {
            return 'Discover and import REST, HTTP & WebSocket APIs from AWS API Gateway.';
        }
        if (type.includes('KONG')) {
            return 'Sync API services and routes managed in Kong Enterprise Gateway.';
        }
        if (type.includes('APIGEE')) {
            return 'Discover and import API proxies from Google Cloud Apigee.';
        }
        if (type.includes('AZURE')) {
            return 'Discover API endpoints and specs managed in Azure API Management.';
        }
        return 'Discover and import APIs configured on this external gateway.';
    };

    const handleDiscover = () => {
        history.push({
            pathname: '/apis/discover/apis',
            state: { selectedGateways: [selectedGateway] },
        });
    };

    const selectedGatewayObj = gateways.find((gw) => gw.name === selectedGateway);

    return (
        <Root>
            <Box mb={2}>
                <Button
                    variant='text'
                    onClick={handleBackClick}
                    startIcon={<ArrowBackIcon />}
                    id='itest-apis-back-to-listing'
                >
                    <FormattedMessage
                        id='Apis.Listing.SampleAPI.SampleAPI.back.to.listing'
                        defaultMessage='Back to API Listing'
                    />
                </Button>
            </Box>
            <div className='header'>
                <Typography variant='h4'>
                    <FormattedMessage
                        id='Apis.Discover.DiscoverAPIs.title'
                        defaultMessage='Discover APIs'
                    />
                </Typography>
                <Typography variant='subtitle1' color='textSecondary'>
                    <FormattedMessage
                        id='Apis.Discover.DiscoverAPIs.subtitle'
                        defaultMessage='Discover and import APIs from federated gateways into WSO2 API Manager.'
                    />
                </Typography>
            </div>

            <Box>
                {gateways.length === 0 ? (
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        py: 8,
                        textAlign: 'center',
                    }}>
                        <Typography variant='h5' gutterBottom sx={{ fontWeight: 'bold' }}>
                            <FormattedMessage
                                id='Apis.Discover.DiscoverAPIs.no.gateways.title'
                                defaultMessage='No available gateways'
                            />
                        </Typography>
                        <Typography variant='body1' color='textSecondary' sx={{ mb: 2, maxWidth: 450 }}>
                            <FormattedMessage
                                id='Apis.Discover.DiscoverAPIs.no.gateways.description'
                                defaultMessage={
                                    'There are no external/federated gateways configured in the system. '
                                    + 'You can add them from the Admin portal.'
                                }
                            />
                        </Typography>
                        <MuiLink
                            href={
                                'https://apim.docs.wso2.com/en/latest/tutorials/'
                                + 'deploying-apis-to-federated-gateways-with-wso2/'
                            }
                            target='_blank'
                            rel='noopener noreferrer'
                            sx={{ textDecoration: 'underline', fontWeight: 'bold' }}
                        >
                            <FormattedMessage
                                id='Apis.Discover.DiscoverAPIs.learn.more'
                                defaultMessage='Learn more'
                            />
                        </MuiLink>
                    </Box>
                ) : (
                    <>
                        <Typography variant='h6' gutterBottom sx={{ mb: 2 }}>
                            <FormattedMessage
                                id='Apis.Discover.DiscoverAPIs.select.gateway'
                                defaultMessage='Select a Gateway'
                            />
                        </Typography>
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            {gateways.map((gw) => {
                                const isSelected = selectedGateway === gw.name;
                                return (
                                    <Grid item xs={12} sm={6} md={4} key={gw.name}>
                                        <Paper
                                            onClick={() => handleSelectGateway(gw.name)}
                                            variant='outlined'
                                            sx={{
                                                p: 2.5,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'space-between',
                                                position: 'relative',
                                                cursor: 'pointer',
                                                borderRadius: 3,
                                                minHeight: 135,
                                                border: isSelected
                                                    ? `2px solid ${theme.palette.primary.main}`
                                                    : `1px solid ${theme.palette.divider}`,
                                                backgroundColor: isSelected
                                                    ? alpha(theme.palette.primary.main, 0.04)
                                                    : theme.palette.background.paper,
                                                transition: 'all 0.2s ease-in-out',
                                                boxShadow: isSelected ? 2 : 0,
                                                '&:hover': {
                                                    boxShadow: 3,
                                                    borderColor: isSelected
                                                        ? theme.palette.primary.main
                                                        : theme.palette.action.disabledBackground,
                                                    transform: 'translateY(-2px)',
                                                },
                                            }}
                                        >
                                            <Box>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'flex-start',
                                                        mb: 1,
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                                        <Typography
                                                            variant='h6'
                                                            sx={{
                                                                fontWeight: 'bold',
                                                                color: theme.palette.text.primary,
                                                                fontSize: '1.05rem',
                                                                fontFamily: theme.typography.fontFamily,
                                                            }}
                                                        >
                                                            {gw.displayName || gw.name}
                                                        </Typography>
                                                        <Box
                                                            sx={{
                                                                display: 'inline-flex',
                                                                alignSelf: 'flex-start',
                                                                alignItems: 'center',
                                                                px: 1.2,
                                                                py: 0.3,
                                                                mt: 0.8,
                                                                borderRadius: '4px',
                                                                fontSize: '0.7rem',
                                                                fontWeight: 'bold',
                                                                textTransform: 'uppercase',
                                                                fontFamily: theme.typography.fontFamily,
                                                                border: `1px solid ${getGatewayChipColor(
                                                                    gw.gatewayType
                                                                )}`,
                                                                color: getGatewayChipColor(gw.gatewayType),
                                                                backgroundColor: theme.palette.background.paper,
                                                            }}
                                                        >
                                                            {gw.gatewayType || 'External'}
                                                        </Box>
                                                    </Box>
                                                    <Radio
                                                        checked={isSelected}
                                                        onChange={() => handleSelectGateway(gw.name)}
                                                        value={gw.name}
                                                        name='gateway-selection'
                                                        color='primary'
                                                        sx={{ p: 0 }}
                                                    />
                                                </Box>
                                                <Typography
                                                    variant='body2'
                                                    color='textSecondary'
                                                    sx={{
                                                        mt: 1.2,
                                                        fontSize: '0.85rem',
                                                        lineHeight: 1.4,
                                                    }}
                                                >
                                                    {getGatewayDescription(gw)}
                                                </Typography>
                                            </Box>
                                            {gw.vhosts && gw.vhosts.length > 0 && (
                                                <Box
                                                    sx={{
                                                        mt: 1.5,
                                                        pt: 1,
                                                        borderTop: `1px dashed ${theme.palette.divider}`,
                                                    }}
                                                >
                                                    <Typography
                                                        variant='caption'
                                                        color='textSecondary'
                                                        sx={{ fontSize: '0.75rem' }}
                                                    >
                                                        <FormattedMessage
                                                            id='Apis.Discover.DiscoverAPIs.host'
                                                            defaultMessage='Host: {host}'
                                                            values={{ host: gw.vhosts[0].host }}
                                                        />
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Paper>
                                    </Grid>
                                );
                            })}
                        </Grid>

                        <div className='actions'>
                            <Tooltip title={
                                <FormattedMessage
                                    id='Apis.Discover.DiscoverAPIs.tooltip'
                                    defaultMessage='Discover and import APIs from your third party gateway.'
                                />
                            }>
                                <span>
                                    <Button
                                        variant='contained'
                                        color='primary'
                                        disabled={!selectedGateway}
                                        onClick={handleDiscover}
                                    >
                                        {selectedGateway ? (
                                            <FormattedMessage
                                                id='Apis.Discover.DiscoverAPIs.button.discover.from'
                                                defaultMessage='Discover APIs from {gateway}'
                                                values={{ gateway: selectedGatewayObj?.displayName || selectedGateway }}
                                            />
                                        ) : (
                                            <FormattedMessage
                                                id='Apis.Discover.DiscoverAPIs.button.select.gateway'
                                                defaultMessage='Select a gateway to discover APIs'
                                            />
                                        )}
                                    </Button>
                                </span>
                            </Tooltip>
                            <Button
                                variant='text'
                                component={Link}
                                to='/apis'
                                sx={{ ml: 2 }}
                            >
                                <FormattedMessage
                                    id='Apis.Discover.DiscoverAPIs.cancel'
                                    defaultMessage='Cancel'
                                />
                            </Button>
                        </div>
                    </>
                )}
            </Box>
        </Root>
    );
};

DiscoverAPIs.propTypes = {
    history: PropTypes.shape({
        push: PropTypes.func,
    }).isRequired,
    location: PropTypes.shape({
        state: PropTypes.shape({
            selectedGateways: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.arrayOf(PropTypes.string),
            ]),
        }),
    }).isRequired,
};

export default DiscoverAPIs;
