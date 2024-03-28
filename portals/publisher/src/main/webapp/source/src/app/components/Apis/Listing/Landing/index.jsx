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

import React, { useState, useEffect } from 'react';
import { usePublisherSettings } from 'AppComponents/Shared/AppContext';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { FormattedMessage } from 'react-intl';
import useMediaQuery from '@mui/material/useMediaQuery';

import RestAPIMenu from 'AppComponents/Apis/Listing/Landing/Menus/RestAPIMenu';
import SoapAPIMenu from 'AppComponents/Apis/Listing/Landing/Menus/SoapAPIMenu';
import GraphqlAPIMenu from 'AppComponents/Apis/Listing/Landing/Menus/GraphqlAPIMenu';
import StreamingAPIMenu from 'AppComponents/Apis/Listing/Landing/Menus/StreamingAPIMenu';

const PREFIX = 'APILanding';

const classes = {
    root: `${PREFIX}-root`
};

const Root = styled('div')({
    [`& .${classes.root}`]: {
        flexGrow: 1,
    },
});

const APILanding = () => {
    const theme = useTheme();
    const isXsOrBelow = useMediaQuery(theme.breakpoints.down('xs'));
    const { data: settings } = usePublisherSettings();
    const [gateway, setGatewayType] = useState(true);
    
    const getGatewayType = () => {
        if (settings != null) {
            if (settings.gatewayTypes && settings.gatewayTypes.includes('Regular')) {
                setGatewayType(true);
            } else {
                setGatewayType(false);
            }
        }
    };

    useEffect(() => {
        getGatewayType();
    }, [settings]);

    const {
        graphqlIcon,
        restApiIcon,
        soapApiIcon,
        streamingApiIcon,
    } = theme.custom.landingPage.icons;

    return (
        <Root className={classes.root}>
            <Grid
                container
                direction='column'
                justifyContent='center'
            >
                <Grid item xs={12}>
                    <Box pt={isXsOrBelow ? 2 : 7} />
                </Grid>
                <Grid item md={12}>
                    <Typography id='itest-apis-welcome-msg' display='block' gutterBottom align='center' variant='h4'>
                        <FormattedMessage
                            id='Apis.Listing.SampleAPI.SampleAPI.create.new'
                            defaultMessage='Let’s get started !'
                        />
                        {settings && settings.portalConfigurationOnlyModeEnabled ? (
                            <Box color='text.secondary' pt={2}>
                                <Typography display='block' gutterBottom align='center' variant='body1'>
                                    <FormattedMessage
                                        id='Apis.Listing.SampleAPI.SampleAPI.no.apis.deployed'
                                        defaultMessage='No APIs have been deployed yet '
                                    />
                                </Typography>
                            </Box>
                        ) : (
                            <Box color='text.secondary' pt={2}>
                                <Typography display='block' gutterBottom align='center' variant='body1'>
                                    <FormattedMessage
                                        id='Apis.Listing.SampleAPI.SampleAPI.create.new.description'
                                        defaultMessage='Choose your option to create an API '
                                    />
                                </Typography>
                            </Box>
                        )}
                    </Typography>
                </Grid>

                {settings && !settings.portalConfigurationOnlyModeEnabled && (
                    <Grid item xs={12} md={2} lg={2} xl={2}>
                        <Box pt={isXsOrBelow ? 2 : 7} pb={5} >
                            <Grid
                                container
                                direction='row'
                                justifyContent='center'
                                alignItems='flex-start'
                                spacing={3}
                            >
                                <RestAPIMenu icon={restApiIcon} />
                                {gateway &&
                                    <SoapAPIMenu icon={soapApiIcon} />
                                }
                                <GraphqlAPIMenu icon={graphqlIcon} />
                                {gateway &&
                                    <StreamingAPIMenu icon={streamingApiIcon} />
                                }
                            </Grid>
                        </Box>
                    </Grid>
                )}
            </Grid>
        </Root>
    );
};

export default APILanding;
