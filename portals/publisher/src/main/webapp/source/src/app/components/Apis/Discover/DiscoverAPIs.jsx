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
import {
    Box,
    Typography,
    Button,
    Checkbox,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Link as MuiLink,
    Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
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
    const { history, location } = props;
    const { data: settings, isLoading } = usePublisherSettings();
    const handleBackClick = useBackNavigation('/apis');

    // Initialize selectedGateways from history location state if navigating back
    const initialSelected = (location.state && location.state.selectedGateways) || [];
    const [selectedGateways, setSelectedGateways] = useState(initialSelected);

    if (isLoading) {
        return <CircularProgress />;
    }

    const gateways = (settings?.environment || []).filter(
        (env) => !env.provider.toLowerCase().includes('wso2')
    );

    const handleToggleGateway = (gatewayName) => {
        setSelectedGateways((prev) =>
            prev.includes(gatewayName)
                ? prev.filter((g) => g !== gatewayName)
                : [...prev, gatewayName]
        );
    };

    const handleSelectAllGateways = (event) => {
        if (event.target.checked) {
            setSelectedGateways(gateways.map((gw) => gw.name));
        } else {
            setSelectedGateways([]);
        }
    };

    const handleDiscover = () => {
        history.push({
            pathname: '/apis/discover/apis',
            state: { selectedGateways },
        });
    };

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
                <Typography variant='h4'>Discover APIs</Typography>
                <Typography variant='subtitle1' color='textSecondary'>
                    Discover and import APIs from federated gateways into WSO2 API Manager.
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
                            No available gateways
                        </Typography>
                        <Typography variant='body1' color='textSecondary' sx={{ mb: 2, maxWidth: 450 }}>
                            There are no external/federated gateways configured in the system.
                            {' '}
                            You can add them from the Admin portal.
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
                            Learn more
                        </MuiLink>
                    </Box>
                ) : (
                    <>
                        <Typography variant='h6' gutterBottom sx={{ mb: 2 }}>
                            Select Gateways
                        </Typography>
                        <TableContainer component={Paper} variant='outlined' sx={{ borderRadius: 2, mb: 4 }}>
                            <Table aria-label='gateways table'>
                                <TableHead>
                                    <TableRow>
                                        <TableCell padding='checkbox'>
                                            <Checkbox
                                                indeterminate={
                                                    selectedGateways.length > 0
                                                    && selectedGateways.length < gateways.length
                                                }
                                                checked={
                                                    gateways.length > 0
                                                    && selectedGateways.length === gateways.length
                                                }
                                                onChange={handleSelectAllGateways}
                                                color='primary'
                                            />
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Gateway Name</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Gateway Type</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {gateways.map((gw) => {
                                        const isSelected = selectedGateways.includes(gw.name);
                                        return (
                                            <TableRow
                                                key={gw.name}
                                                hover
                                                onClick={() => handleToggleGateway(gw.name)}
                                                role='checkbox'
                                                aria-checked={isSelected}
                                                selected={isSelected}
                                                sx={{ cursor: 'pointer' }}
                                            >
                                                <TableCell padding='checkbox'>
                                                    <Checkbox
                                                        checked={isSelected}
                                                        color='primary'
                                                    />
                                                </TableCell>
                                                <TableCell>{gw.displayName || gw.name}</TableCell>
                                                <TableCell>{gw.gatewayType || 'External'}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <div className='actions'>
                            <Tooltip title='Discover and import APIs from your third party gateways.'>
                                <span>
                                    <Button
                                        variant='contained'
                                        color='primary'
                                        disabled={selectedGateways.length === 0}
                                        onClick={handleDiscover}
                                    >
                                        Discover APIs from {selectedGateways.length} gateway(s)
                                    </Button>
                                </span>
                            </Tooltip>
                            <Button
                                variant='text'
                                component={Link}
                                to='/apis'
                                sx={{ ml: 2, color: '#000000' }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </>
                )}
            </Box>
        </Root>
    );
};

export default DiscoverAPIs;
